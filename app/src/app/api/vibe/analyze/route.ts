/**
 * ZZIK MAP - Vibe Analysis API (Gemini Vision)
 * V3: Real Gemini Vision integration with demo fallback
 */

import { NextRequest } from 'next/server';
import { success, badRequest, externalApiError, rateLimited } from '@/lib/api/response';
import { logger } from '@/lib/logger';

const ROUTE = '/api/vibe/analyze';

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 1000;
const MAX_MAP_SIZE = 1000;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();

  if (rateLimitMap.size > MAX_MAP_SIZE) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetAt) rateLimitMap.delete(key);
    }
  }

  const record = rateLimitMap.get(identifier);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (record.count >= RATE_LIMIT) return false;
  record.count++;
  return true;
}

// Vibe categories for analysis
const VIBE_CATEGORIES = [
  'cozy', 'modern', 'traditional', 'peaceful', 'artistic',
  'vintage', 'minimal', 'vibrant', 'romantic', 'adventurous',
  'industrial', 'luxury', 'nature', 'urban', 'hipster'
] as const;

interface VibeAnalysis {
  primaryVibe: string;
  secondaryVibes: string[];
  vibeScores: Record<string, number>;
  description: string;
  tags: string[];
  confidence: number;
  embedding?: number[];
}

// Gemini prompt for vibe analysis
const VIBE_ANALYSIS_PROMPT = `Analyze this image and determine its atmosphere/vibe for a travel recommendation app.

Return a JSON object with this exact structure:
{
  "primaryVibe": "one of: cozy, modern, traditional, peaceful, artistic, vintage, minimal, vibrant, romantic, adventurous, industrial, luxury, nature, urban, hipster",
  "secondaryVibes": ["array of 2-3 secondary vibes from the same list"],
  "vibeScores": {
    "cozy": 0-100,
    "modern": 0-100,
    "traditional": 0-100,
    "peaceful": 0-100,
    "artistic": 0-100,
    "vintage": 0-100,
    "minimal": 0-100,
    "vibrant": 0-100,
    "romantic": 0-100,
    "adventurous": 0-100,
    "industrial": 0-100,
    "luxury": 0-100,
    "nature": 0-100,
    "urban": 0-100,
    "hipster": 0-100
  },
  "description": "A brief 1-2 sentence description of the atmosphere",
  "tags": ["array of 3-5 relevant tags like 'cafe', 'outdoor', 'night', etc."],
  "confidence": 0-100
}

Respond ONLY with valid JSON, no markdown or explanation.`;

export async function POST(request: NextRequest) {
  const log = logger.api(ROUTE, 'POST');
  const timer = logger.time('POST /api/vibe/analyze');

  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'anonymous';
    if (!checkRateLimit(clientIp)) {
      log.warn('Rate limit exceeded', { clientIp });
      return rateLimited(ROUTE);
    }

    // Parse form data
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return badRequest('Image file is required', ROUTE);
    }

    // Validate file size
    if (imageFile.size > MAX_FILE_SIZE) {
      return badRequest('Image file too large (max 10MB)', ROUTE);
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!validTypes.includes(imageFile.type)) {
      return badRequest('Invalid image type. Supported: JPEG, PNG, WebP, HEIC', ROUTE);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let analysis: VibeAnalysis;
    let isDemo = false;

    if (!apiKey) {
      // Demo mode
      log.info('Using demo mode (no GEMINI_API_KEY)');
      isDemo = true;
      analysis = getDemoAnalysis();
    } else {
      try {
        // Real Gemini Vision analysis
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        // Convert file to base64
        const arrayBuffer = await imageFile.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        const result = await model.generateContent([
          VIBE_ANALYSIS_PROMPT,
          {
            inlineData: {
              mimeType: imageFile.type,
              data: base64,
            },
          },
        ]);

        const responseText = result.response.text();

        // Parse JSON response (handle potential markdown wrapping)
        let jsonStr = responseText;
        if (responseText.includes('```json')) {
          jsonStr = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (responseText.includes('```')) {
          jsonStr = responseText.replace(/```\n?/g, '');
        }

        try {
          analysis = JSON.parse(jsonStr.trim());

          // Validate required fields
          if (!analysis.primaryVibe || !analysis.vibeScores) {
            throw new Error('Invalid response structure');
          }

          // Generate embedding from vibe scores (128-dim)
          analysis.embedding = generateEmbedding(analysis.vibeScores);

        } catch {
          log.warn('Failed to parse Gemini response, using demo', { responseText });
          isDemo = true;
          analysis = getDemoAnalysis();
        }

      } catch (geminiError) {
        log.error('Gemini API failed', {}, geminiError instanceof Error ? geminiError : undefined);

        // Fallback to demo on API error
        isDemo = true;
        analysis = getDemoAnalysis();
      }
    }

    timer.end({ demo: isDemo });

    return success({
      ...analysis,
    }, { demo: isDemo });

  } catch (err) {
    log.error('Unexpected error', {}, err instanceof Error ? err : undefined);
    return externalApiError('Vibe Analysis', err instanceof Error ? err : undefined, ROUTE);
  }
}

/**
 * Generate 128-dimensional embedding from vibe scores
 */
function generateEmbedding(vibeScores: Record<string, number>): number[] {
  const embedding: number[] = [];

  // Normalize scores to 0-1
  const normalizedScores = Object.entries(vibeScores).map(([vibe, score]) => ({
    vibe,
    score: (score || 0) / 100,
  }));

  // Create base embedding from scores (15 vibes * 8 = 120 dims)
  for (const { score } of normalizedScores) {
    // Expand each score into 8 dimensions with variations
    embedding.push(score);
    embedding.push(score * 0.9);
    embedding.push(score * 0.8);
    embedding.push(Math.sqrt(score));
    embedding.push(score * score);
    embedding.push(Math.sin(score * Math.PI));
    embedding.push(Math.cos(score * Math.PI));
    embedding.push((score + Math.random() * 0.1) % 1);
  }

  // Pad to 128 dimensions
  while (embedding.length < 128) {
    embedding.push(Math.random() * 0.1);
  }

  // Normalize the embedding (L2 norm)
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.slice(0, 128).map(val => val / (norm || 1));
}

/**
 * Demo analysis for when API is unavailable
 */
function getDemoAnalysis(): VibeAnalysis {
  const vibeScores: Record<string, number> = {};

  for (const vibe of VIBE_CATEGORIES) {
    vibeScores[vibe] = Math.floor(Math.random() * 60) + 20;
  }

  // Set a clear primary vibe
  const primaryVibe = VIBE_CATEGORIES[Math.floor(Math.random() * VIBE_CATEGORIES.length)];
  vibeScores[primaryVibe] = Math.floor(Math.random() * 20) + 80;

  const secondaryVibes = VIBE_CATEGORIES
    .filter(v => v !== primaryVibe)
    .sort((a, b) => vibeScores[b] - vibeScores[a])
    .slice(0, 2);

  return {
    primaryVibe,
    secondaryVibes,
    vibeScores,
    description: `A ${primaryVibe} space with ${secondaryVibes[0]} touches`,
    tags: [primaryVibe, ...secondaryVibes, 'korea', 'travel'],
    confidence: Math.floor(Math.random() * 15) + 75,
    embedding: generateEmbedding(vibeScores),
  };
}
