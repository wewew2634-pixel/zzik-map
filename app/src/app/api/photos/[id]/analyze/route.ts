/**
 * ZZIK MAP - Photo Analysis API (Gemini Vision)
 * V3: Real Gemini Vision integration with storage fetch
 */

import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { analyzePhotoSchema, type VibeAnalysis } from '@/lib/validations/api';
import { success, validationError, notFound, databaseError, externalApiError, rateLimited } from '@/lib/api/response';
import { logger } from '@/lib/logger';

const ROUTE = '/api/photos/[id]/analyze';

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 1000;
const MAX_MAP_SIZE = 1000;

function cleanupExpiredEntries(): void {
  if (rateLimitMap.size <= MAX_MAP_SIZE) return;
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  cleanupExpiredEntries();

  const record = rateLimitMap.get(identifier);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (record.count >= RATE_LIMIT) return false;
  record.count++;
  return true;
}

// Gemini prompt for photo vibe analysis
const PHOTO_ANALYSIS_PROMPT = `Analyze this travel/place photo and determine its atmosphere for a travel recommendation app.

Return a JSON object with this exact structure:
{
  "primaryVibe": "one of: cozy, modern, traditional, peaceful, artistic, vintage, minimalist, vibrant, romantic, adventurous",
  "secondaryVibes": ["array of 2-3 secondary vibes from the same list"],
  "vibeScores": {
    "cozy": 0.0-1.0,
    "modern": 0.0-1.0,
    "traditional": 0.0-1.0,
    "peaceful": 0.0-1.0,
    "artistic": 0.0-1.0,
    "vintage": 0.0-1.0,
    "minimalist": 0.0-1.0,
    "vibrant": 0.0-1.0,
    "romantic": 0.0-1.0,
    "adventurous": 0.0-1.0
  },
  "description": "A brief 1-2 sentence description of the atmosphere",
  "tags": ["array of 3-5 relevant tags like 'cafe', 'outdoor', 'night', etc."],
  "placeType": "one of: cafe, restaurant, landmark, nature, shopping, nightlife, museum, temple, street, park, other",
  "confidence": 0.0-1.0
}

Respond ONLY with valid JSON, no markdown or explanation.`;

// POST /api/photos/[id]/analyze - Analyze photo with Gemini Vision
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const log = logger.api(ROUTE, 'POST');
  const timer = logger.time('POST /api/photos/[id]/analyze');

  try {
    const { id } = await params;

    // Validate UUID
    const parseResult = analyzePhotoSchema.safeParse({ id });
    if (!parseResult.success) {
      return validationError(parseResult.error, ROUTE);
    }

    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'anonymous';
    if (!checkRateLimit(clientIp)) {
      log.warn('Rate limit exceeded', { clientIp, photoId: id });
      return rateLimited(ROUTE);
    }

    const supabase = createServiceClient();

    // Get photo record
    const { data: photo, error: photoError } = await supabase
      .from('photos')
      .select('*')
      .eq('id', id)
      .single();

    if (photoError) {
      if (photoError.code === 'PGRST116') {
        return notFound('Photo', ROUTE);
      }
      log.error('Photo lookup failed', { photoId: id }, photoError);
      return databaseError(photoError, ROUTE);
    }

    // Check if already analyzed
    if (photo.status === 'analyzed') {
      log.info('Photo already analyzed', { photoId: id });
      return success({
        photo,
        analysis: photo.vibe_analysis,
        cached: true
      });
    }

    // Update status to processing
    await supabase
      .from('photos')
      .update({ status: 'processing' })
      .eq('id', id);

    const apiKey = process.env.GEMINI_API_KEY;
    let vibeAnalysis: VibeAnalysis;
    let isDemo = false;

    if (!apiKey) {
      // Demo mode
      log.info('Using demo mode (no GEMINI_API_KEY)', { photoId: id });
      isDemo = true;
      vibeAnalysis = getDemoAnalysis();
    } else {
      try {
        // Fetch image from Supabase storage
        let imageBase64: string | null = null;
        let imageMimeType = 'image/jpeg';

        if (photo.storage_path) {
          const { data: imageData, error: downloadError } = await supabase.storage
            .from('photos')
            .download(photo.storage_path);

          if (!downloadError && imageData) {
            const arrayBuffer = await imageData.arrayBuffer();
            imageBase64 = Buffer.from(arrayBuffer).toString('base64');
            imageMimeType = imageData.type || 'image/jpeg';
          } else {
            log.warn('Failed to download photo from storage', { photoId: id, error: downloadError });
          }
        }

        if (!imageBase64) {
          // No image available, use demo
          log.info('No image data available, using demo', { photoId: id });
          isDemo = true;
          vibeAnalysis = getDemoAnalysis();
        } else {
          // Real Gemini Vision analysis
          const { GoogleGenerativeAI } = await import('@google/generative-ai');
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

          log.info('Gemini analysis started', { photoId: id });

          const result = await model.generateContent([
            PHOTO_ANALYSIS_PROMPT,
            {
              inlineData: {
                mimeType: imageMimeType,
                data: imageBase64,
              },
            },
          ]);

          const responseText = result.response.text();

          // Parse JSON response
          let jsonStr = responseText;
          if (responseText.includes('```json')) {
            jsonStr = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          } else if (responseText.includes('```')) {
            jsonStr = responseText.replace(/```\n?/g, '');
          }

          try {
            const parsed = JSON.parse(jsonStr.trim());

            vibeAnalysis = {
              primaryVibe: parsed.primaryVibe || 'modern',
              secondaryVibes: parsed.secondaryVibes || [],
              vibeScores: parsed.vibeScores || {},
              description: parsed.description || '',
              tags: parsed.tags || [],
              placeType: parsed.placeType || 'other',
              confidence: parsed.confidence || 0.7,
            };

            log.info('Gemini analysis complete', { photoId: id, primaryVibe: vibeAnalysis.primaryVibe });

          } catch (parseError) {
            log.warn('Failed to parse Gemini response', { photoId: id, responseText });
            isDemo = true;
            vibeAnalysis = getDemoAnalysis();
          }
        }

      } catch (geminiError) {
        log.error('Gemini API failed', { photoId: id }, geminiError instanceof Error ? geminiError : undefined);

        // Mark as failed but return demo response
        await supabase
          .from('photos')
          .update({ status: 'failed' })
          .eq('id', id);

        return externalApiError('Gemini Vision', geminiError instanceof Error ? geminiError : undefined, ROUTE);
      }
    }

    // Update photo with analysis
    const { data: updated, error: updateError } = await supabase
      .from('photos')
      .update({
        status: 'analyzed',
        vibe_analysis: vibeAnalysis,
        gemini_response: isDemo ? { demo: true, ...vibeAnalysis } : vibeAnalysis
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      log.error('Photo update failed', { photoId: id }, updateError);
      return databaseError(updateError, ROUTE);
    }

    timer.end({ photoId: id, demo: isDemo });

    return success({
      photo: updated,
      analysis: vibeAnalysis,
      demo: isDemo
    });

  } catch (err) {
    log.error('Unexpected error', {}, err instanceof Error ? err : undefined);
    return databaseError(err instanceof Error ? err : undefined, ROUTE);
  }
}

/**
 * Generate demo analysis for when API/image is unavailable
 */
function getDemoAnalysis(): VibeAnalysis {
  const vibes = ['cozy', 'modern', 'traditional', 'peaceful', 'artistic', 'vintage', 'minimalist', 'vibrant', 'romantic', 'adventurous'] as const;
  const primaryVibe = vibes[Math.floor(Math.random() * vibes.length)];

  const vibeScores: Record<string, number> = {};
  for (const vibe of vibes) {
    vibeScores[vibe] = Math.random() * 0.6 + 0.2;
  }
  vibeScores[primaryVibe] = Math.random() * 0.2 + 0.8;

  const secondaryVibes = vibes
    .filter(v => v !== primaryVibe)
    .sort((a, b) => vibeScores[b] - vibeScores[a])
    .slice(0, 2);

  return {
    primaryVibe,
    secondaryVibes: [...secondaryVibes],
    vibeScores,
    description: `A ${primaryVibe} atmosphere with ${secondaryVibes[0]} elements`,
    tags: [primaryVibe, secondaryVibes[0], 'korea', 'travel'],
    placeType: 'cafe',
    confidence: 0.75 + Math.random() * 0.15,
  };
}
