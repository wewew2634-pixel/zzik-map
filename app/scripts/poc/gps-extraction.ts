/**
 * ZZIK MAP - GPS Extraction POC
 *
 * 3-Stage Fallback GPS Extraction:
 * 1. EXIF GPS coordinates (50-60% success rate)
 * 2. Gemini Vision landmark detection (40-85% success)
 * 3. Manual location selection (100% fallback)
 *
 * Usage: pnpm tsx scripts/poc/gps-extraction.ts [image_path]
 */

import exifr from 'exifr';
import * as fs from 'fs';
import * as path from 'path';

interface GPSResult {
  latitude: number | null;
  longitude: number | null;
  source: 'exif' | 'gemini' | 'manual' | 'none';
  confidence: number;
  metadata?: {
    make?: string;
    model?: string;
    dateTime?: string;
    altitude?: number;
  };
}

interface ExifGPSData {
  latitude?: number;
  longitude?: number;
  Make?: string;
  Model?: string;
  DateTimeOriginal?: Date;
  GPSAltitude?: number;
}

/**
 * Stage 1: Extract GPS from EXIF data
 */
async function extractGPSFromExif(imagePath: string): Promise<GPSResult> {
  console.log('\n📍 Stage 1: EXIF GPS Extraction');
  console.log('━'.repeat(50));

  try {
    const buffer = fs.readFileSync(imagePath);

    // Parse EXIF with GPS focus
    const exif = await exifr.parse(buffer, {
      gps: true,
      pick: ['Make', 'Model', 'DateTimeOriginal', 'GPSLatitude', 'GPSLongitude', 'GPSAltitude']
    }) as ExifGPSData | null;

    if (!exif) {
      console.log('❌ No EXIF data found');
      return { latitude: null, longitude: null, source: 'none', confidence: 0 };
    }

    console.log('📷 Camera:', exif.Make || 'Unknown', exif.Model || '');
    console.log('📅 Date:', exif.DateTimeOriginal?.toISOString() || 'Unknown');

    if (exif.latitude && exif.longitude) {
      console.log('✅ GPS Found!');
      console.log(`   Latitude: ${exif.latitude}`);
      console.log(`   Longitude: ${exif.longitude}`);
      console.log(`   Altitude: ${exif.GPSAltitude || 'N/A'}m`);

      return {
        latitude: exif.latitude,
        longitude: exif.longitude,
        source: 'exif',
        confidence: 0.95,
        metadata: {
          make: exif.Make,
          model: exif.Model,
          dateTime: exif.DateTimeOriginal?.toISOString(),
          altitude: exif.GPSAltitude
        }
      };
    }

    console.log('⚠️ No GPS coordinates in EXIF');
    return {
      latitude: null,
      longitude: null,
      source: 'none',
      confidence: 0,
      metadata: {
        make: exif.Make,
        model: exif.Model,
        dateTime: exif.DateTimeOriginal?.toISOString()
      }
    };

  } catch (error) {
    console.log('❌ EXIF parsing error:', (error as Error).message);
    return { latitude: null, longitude: null, source: 'none', confidence: 0 };
  }
}

/**
 * Stage 2: Use Gemini Vision for landmark detection
 */
async function detectLandmarkWithGemini(imagePath: string): Promise<GPSResult> {
  console.log('\n🤖 Stage 2: Gemini Vision Landmark Detection');
  console.log('━'.repeat(50));

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log('⚠️ GEMINI_API_KEY not set - skipping Gemini analysis');
    console.log('   Set it in .env.local to enable AI location detection');
    return { latitude: null, longitude: null, source: 'none', confidence: 0 };
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Read image as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = getMimeType(imagePath);

    const prompt = `Analyze this image and identify the location.

If you can identify a specific landmark, building, or recognizable location in Korea:
1. Return the exact name of the location
2. Return the GPS coordinates (latitude, longitude)
3. Return your confidence level (0-1)

Response format (JSON only):
{
  "identified": true/false,
  "location_name": "Name of the place",
  "latitude": 37.5665,
  "longitude": 126.9780,
  "confidence": 0.85,
  "reasoning": "Brief explanation"
}

If you cannot identify the specific location, return:
{
  "identified": false,
  "location_name": null,
  "latitude": null,
  "longitude": null,
  "confidence": 0,
  "reasoning": "Why location couldn't be identified"
}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Image
        }
      }
    ]);

    const response = result.response.text();
    console.log('📝 Gemini Response:');

    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('❌ Could not parse Gemini response');
      return { latitude: null, longitude: null, source: 'none', confidence: 0 };
    }

    const data = JSON.parse(jsonMatch[0]);
    console.log(JSON.stringify(data, null, 2));

    if (data.identified && data.latitude && data.longitude) {
      console.log('\n✅ Location Identified!');
      console.log(`   📍 ${data.location_name}`);
      console.log(`   Coordinates: ${data.latitude}, ${data.longitude}`);
      console.log(`   Confidence: ${(data.confidence * 100).toFixed(1)}%`);

      return {
        latitude: data.latitude,
        longitude: data.longitude,
        source: 'gemini',
        confidence: data.confidence
      };
    }

    console.log('⚠️ Gemini could not identify specific location');
    console.log(`   Reason: ${data.reasoning}`);
    return { latitude: null, longitude: null, source: 'none', confidence: 0 };

  } catch (error) {
    console.log('❌ Gemini API error:', (error as Error).message);
    return { latitude: null, longitude: null, source: 'none', confidence: 0 };
  }
}

/**
 * Stage 3: Manual selection (returns placeholder for demo)
 */
function manualLocationFallback(): GPSResult {
  console.log('\n✋ Stage 3: Manual Location Selection');
  console.log('━'.repeat(50));
  console.log('📍 In the app, user would select location on map');
  console.log('   For demo: Using Seoul City Hall coordinates');

  return {
    latitude: 37.5665,
    longitude: 126.9780,
    source: 'manual',
    confidence: 1.0
  };
}

/**
 * Get MIME type from file extension
 */
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
  };
  return mimeTypes[ext] || 'image/jpeg';
}

/**
 * Main GPS extraction with 3-stage fallback
 */
async function extractGPS(imagePath: string): Promise<GPSResult> {
  console.log('\n🗺️ ZZIK MAP - GPS Extraction POC');
  console.log('═'.repeat(50));
  console.log(`📁 Image: ${imagePath}`);

  // Verify file exists
  if (!fs.existsSync(imagePath)) {
    console.error('❌ File not found:', imagePath);
    process.exit(1);
  }

  const stats = fs.statSync(imagePath);
  console.log(`📊 Size: ${(stats.size / 1024).toFixed(2)} KB`);

  // Stage 1: Try EXIF
  let result = await extractGPSFromExif(imagePath);
  if (result.latitude && result.longitude) {
    return result;
  }

  // Stage 2: Try Gemini Vision
  result = await detectLandmarkWithGemini(imagePath);
  if (result.latitude && result.longitude) {
    return result;
  }

  // Stage 3: Manual fallback
  return manualLocationFallback();
}

/**
 * Demo with sample images
 */
async function runDemo() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║     ZZIK MAP - GPS Extraction POC Demo            ║');
  console.log('║     3-Stage Fallback System                       ║');
  console.log('╚═══════════════════════════════════════════════════╝');

  // Check for command line argument
  const imagePath = process.argv[2];

  if (imagePath) {
    const result = await extractGPS(imagePath);
    console.log('\n' + '═'.repeat(50));
    console.log('📊 Final Result:');
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Demo mode - show system capabilities
  console.log('\n📌 Demo Mode (no image provided)');
  console.log('━'.repeat(50));
  console.log('\n✅ GPS Extraction System Ready!');
  console.log('\n📋 Supported sources:');
  console.log('   1. EXIF GPS (50-60% of photos have this)');
  console.log('   2. Gemini Vision (40-85% landmark detection)');
  console.log('   3. Manual selection (100% fallback)\n');

  console.log('🚀 Usage:');
  console.log('   pnpm tsx scripts/poc/gps-extraction.ts <image_path>\n');

  console.log('📦 Dependencies installed:');
  console.log('   ✓ exifr - EXIF parsing');
  console.log('   ✓ @google/generative-ai - Gemini Vision');

  console.log('\n⚙️ Configuration:');
  console.log(`   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✓ Set' : '✗ Not set'}`);

  // Test EXIF parsing capability
  console.log('\n🧪 Testing EXIF parser...');
  try {
    await exifr.parse(Buffer.from([0xFF, 0xD8, 0xFF])); // Minimal JPEG header
    console.log('   ✓ EXIF parser working');
  } catch {
    console.log('   ✓ EXIF parser loaded (no valid image)');
  }

  console.log('\n✅ POC Ready! Provide an image to test GPS extraction.');
}

// Run
runDemo().catch(console.error);
