/**
 * ZZIK MAP - Gemini Vision POC
 *
 * AI-powered image analysis for:
 * 1. Vibe extraction (cafe, restaurant, landmark atmosphere)
 * 2. Visual embedding generation for similarity search
 * 3. Location/landmark identification
 *
 * Usage: pnpm tsx scripts/poc/gemini-vision.ts [image_path]
 */

import * as fs from 'fs';
import * as path from 'path';

// Vibe categories for ZZIK MAP
const VIBE_CATEGORIES = [
  'cozy', 'modern', 'traditional', 'luxury', 'casual',
  'romantic', 'energetic', 'peaceful', 'artistic', 'natural',
  'industrial', 'vintage', 'minimalist', 'colorful', 'dark'
] as const;

type VibeCategory = typeof VIBE_CATEGORIES[number];

interface VibeAnalysis {
  primaryVibe: VibeCategory;
  secondaryVibes: VibeCategory[];
  vibeScores: Record<VibeCategory, number>;
  description: string;
  tags: string[];
  placeType: 'cafe' | 'restaurant' | 'landmark' | 'nature' | 'shop' | 'other';
  confidence: number;
}

interface VisualEmbedding {
  dimensions: number;
  vector: number[];
  normalized: boolean;
}

interface GeminiAnalysisResult {
  success: boolean;
  vibeAnalysis?: VibeAnalysis;
  embedding?: VisualEmbedding;
  rawResponse?: string;
  error?: string;
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
 * Analyze image vibe using Gemini Vision
 */
async function analyzeVibe(imagePath: string): Promise<GeminiAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'GEMINI_API_KEY not set. Add it to .env.local'
    };
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Read image as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = getMimeType(imagePath);

    const vibeList = VIBE_CATEGORIES.join(', ');

    const prompt = `You are a vibe analyzer for a K-travel app. Analyze this image and extract its atmosphere/vibe.

Available vibe categories: ${vibeList}

Analyze the image and respond with ONLY a JSON object (no markdown, no explanation):
{
  "primaryVibe": "one of the vibe categories",
  "secondaryVibes": ["up to 3 secondary vibes"],
  "vibeScores": {
    "cozy": 0.0-1.0,
    "modern": 0.0-1.0,
    "traditional": 0.0-1.0,
    "luxury": 0.0-1.0,
    "casual": 0.0-1.0,
    "romantic": 0.0-1.0,
    "energetic": 0.0-1.0,
    "peaceful": 0.0-1.0,
    "artistic": 0.0-1.0,
    "natural": 0.0-1.0,
    "industrial": 0.0-1.0,
    "vintage": 0.0-1.0,
    "minimalist": 0.0-1.0,
    "colorful": 0.0-1.0,
    "dark": 0.0-1.0
  },
  "description": "2-3 sentence vibe description",
  "tags": ["relevant", "atmosphere", "tags"],
  "placeType": "cafe|restaurant|landmark|nature|shop|other",
  "confidence": 0.0-1.0
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

    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        success: false,
        error: 'Could not parse JSON from response',
        rawResponse: response
      };
    }

    const vibeAnalysis = JSON.parse(jsonMatch[0]) as VibeAnalysis;

    return {
      success: true,
      vibeAnalysis
    };

  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

/**
 * Generate visual embedding for similarity search
 * Note: This creates a simplified embedding from vibe scores
 * In production, use a proper embedding model
 */
function generateEmbedding(vibeAnalysis: VibeAnalysis): VisualEmbedding {
  // Create 128-dimensional vector from vibe scores + padding
  const vector: number[] = [];

  // Add vibe scores (15 dimensions)
  for (const vibe of VIBE_CATEGORIES) {
    vector.push(vibeAnalysis.vibeScores[vibe] || 0);
  }

  // Pad to 128 dimensions with derived features
  while (vector.length < 128) {
    // Create pseudo-random but deterministic padding based on existing values
    const idx = vector.length % 15;
    const noise = Math.sin(vector.length * 0.1) * 0.1;
    vector.push(Math.max(0, Math.min(1, vector[idx] + noise)));
  }

  // Normalize the vector
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  const normalizedVector = magnitude > 0
    ? vector.map(v => v / magnitude)
    : vector;

  return {
    dimensions: 128,
    vector: normalizedVector,
    normalized: true
  };
}

/**
 * Calculate cosine similarity between two embeddings
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude > 0 ? dotProduct / magnitude : 0;
}

/**
 * Display analysis results
 */
function displayResults(result: GeminiAnalysisResult) {
  console.log('\n📊 Analysis Results');
  console.log('═'.repeat(50));

  if (!result.success || !result.vibeAnalysis) {
    console.log('❌ Analysis failed:', result.error);
    return;
  }

  const vibe = result.vibeAnalysis;

  console.log(`\n🎭 Primary Vibe: ${vibe.primaryVibe.toUpperCase()}`);
  console.log(`📍 Place Type: ${vibe.placeType}`);
  console.log(`🎯 Confidence: ${(vibe.confidence * 100).toFixed(1)}%`);

  console.log('\n📝 Description:');
  console.log(`   ${vibe.description}`);

  console.log('\n🏷️ Tags:');
  console.log(`   ${vibe.tags.join(', ')}`);

  console.log('\n📈 Vibe Scores:');
  const sortedVibes = Object.entries(vibe.vibeScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  for (const [vibeName, score] of sortedVibes) {
    const bar = '█'.repeat(Math.round(score * 20));
    const empty = '░'.repeat(20 - Math.round(score * 20));
    console.log(`   ${vibeName.padEnd(12)} ${bar}${empty} ${(score * 100).toFixed(0)}%`);
  }

  if (result.embedding) {
    console.log('\n🔢 Embedding Generated:');
    console.log(`   Dimensions: ${result.embedding.dimensions}`);
    console.log(`   Normalized: ${result.embedding.normalized}`);
    console.log(`   Sample: [${result.embedding.vector.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
  }
}

/**
 * Demo mode without actual image
 */
async function runDemo() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║     ZZIK MAP - Gemini Vision POC Demo             ║');
  console.log('║     AI Vibe Analysis & Embedding Generation       ║');
  console.log('╚═══════════════════════════════════════════════════╝');

  const imagePath = process.argv[2];

  if (imagePath) {
    // Actual analysis
    if (!fs.existsSync(imagePath)) {
      console.error('\n❌ File not found:', imagePath);
      process.exit(1);
    }

    const stats = fs.statSync(imagePath);
    console.log(`\n📁 Image: ${imagePath}`);
    console.log(`📊 Size: ${(stats.size / 1024).toFixed(2)} KB`);

    console.log('\n🔄 Analyzing with Gemini Vision...');

    const result = await analyzeVibe(imagePath);

    if (result.success && result.vibeAnalysis) {
      result.embedding = generateEmbedding(result.vibeAnalysis);
    }

    displayResults(result);

    // Show JSON output
    console.log('\n📄 Raw JSON Output:');
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Demo mode
  console.log('\n📌 Demo Mode (no image provided)');
  console.log('━'.repeat(50));

  console.log('\n✅ Gemini Vision System Ready!');

  console.log('\n📋 Capabilities:');
  console.log('   1. Vibe Analysis - Extract atmosphere from images');
  console.log('   2. Visual Embedding - 128-dim vector for similarity search');
  console.log('   3. Place Type Detection - cafe/restaurant/landmark/etc');
  console.log('   4. Tag Generation - Relevant atmosphere keywords');

  console.log('\n🎭 Vibe Categories:');
  const vibeRows = [];
  for (let i = 0; i < VIBE_CATEGORIES.length; i += 5) {
    vibeRows.push(VIBE_CATEGORIES.slice(i, i + 5).join(', '));
  }
  vibeRows.forEach(row => console.log(`   ${row}`));

  console.log('\n🚀 Usage:');
  console.log('   pnpm tsx scripts/poc/gemini-vision.ts <image_path>');

  console.log('\n⚙️ Configuration:');
  console.log(`   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✓ Set' : '✗ Not set'}`);

  if (!process.env.GEMINI_API_KEY) {
    console.log('\n💡 To enable Gemini Vision:');
    console.log('   1. Get API key from https://makersuite.google.com/app/apikey');
    console.log('   2. Add to .env.local: GEMINI_API_KEY=your_key_here');
  }

  // Demo similarity calculation
  console.log('\n🧪 Demo: Similarity Calculation');
  console.log('━'.repeat(50));

  const demoVibe1: VibeAnalysis = {
    primaryVibe: 'cozy',
    secondaryVibes: ['vintage', 'peaceful'],
    vibeScores: {
      cozy: 0.9, modern: 0.2, traditional: 0.3, luxury: 0.1, casual: 0.7,
      romantic: 0.5, energetic: 0.1, peaceful: 0.8, artistic: 0.4, natural: 0.3,
      industrial: 0.1, vintage: 0.7, minimalist: 0.2, colorful: 0.3, dark: 0.2
    },
    description: 'A cozy vintage cafe with warm lighting',
    tags: ['cafe', 'cozy', 'vintage'],
    placeType: 'cafe',
    confidence: 0.85
  };

  const demoVibe2: VibeAnalysis = {
    primaryVibe: 'modern',
    secondaryVibes: ['minimalist', 'industrial'],
    vibeScores: {
      cozy: 0.3, modern: 0.9, traditional: 0.1, luxury: 0.4, casual: 0.5,
      romantic: 0.2, energetic: 0.4, peaceful: 0.3, artistic: 0.6, natural: 0.1,
      industrial: 0.7, vintage: 0.1, minimalist: 0.8, colorful: 0.2, dark: 0.3
    },
    description: 'A modern minimalist cafe with industrial design',
    tags: ['cafe', 'modern', 'minimalist'],
    placeType: 'cafe',
    confidence: 0.88
  };

  const embedding1 = generateEmbedding(demoVibe1);
  const embedding2 = generateEmbedding(demoVibe2);

  const similarity = cosineSimilarity(embedding1.vector, embedding2.vector);

  console.log('\n   Cafe A: Cozy Vintage (warm, peaceful)');
  console.log('   Cafe B: Modern Minimalist (industrial)');
  console.log(`\n   Cosine Similarity: ${(similarity * 100).toFixed(1)}%`);
  console.log(`   Interpretation: ${similarity > 0.7 ? 'Similar vibes' : similarity > 0.4 ? 'Somewhat different' : 'Very different vibes'}`);

  console.log('\n✅ POC Ready! Provide an image to test vibe analysis.');
}

// Run
runDemo().catch(console.error);
