/**
 * ZZIK MAP - API Validation Schemas (Zod)
 * V2: Self-healing type safety layer
 */

import { z } from 'zod';

// ============================================
// Common Validators
// ============================================

// Custom UUID schema that accepts both strict RFC 4122 UUIDs and test UUIDs
export const uuidSchema = z.string().regex(
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
  'Invalid UUID format'
);

export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export const coordinatesSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

// ============================================
// Location Schemas
// ============================================

export const locationCategorySchema = z.enum([
  'landmark',
  'cafe',
  'shopping',
  'entertainment',
  'nature',
  'other'
]);

export const getLocationsSchema = paginationSchema.extend({
  category: locationCategorySchema.optional(),
});

export const getLocationByIdSchema = z.object({
  id: uuidSchema,
});

// ============================================
// Journey Schemas
// ============================================

export const getJourneysSchema = z.object({
  from: uuidSchema.describe('Source location ID'),
  limit: z.coerce.number().min(1).max(20).default(5),
});

export const postJourneySchema = z.object({
  fromLocationId: uuidSchema.describe('Origin location ID'),
  toLocationId: uuidSchema.describe('Destination location ID'),
}).refine(
  (data) => data.fromLocationId !== data.toLocationId,
  { message: 'Origin and destination must be different locations' }
);

// ============================================
// Photo Schemas
// ============================================

export const photoStatusSchema = z.enum([
  'pending',
  'processing',
  'analyzed',
  'failed'
]);

export const gpsSourceSchema = z.enum([
  'exif',
  'manual',
  'ai',
  'none'
]);

export const getPhotosSchema = paginationSchema.extend({
  location: uuidSchema.optional(),
  status: photoStatusSchema.optional(),
});

export const postPhotoSchema = z.object({
  storagePath: z.string().min(1, 'Storage path is required'),
  thumbnailPath: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  gpsSource: gpsSourceSchema.optional(),
  gpsConfidence: z.coerce.number().min(0).max(1).optional(),
  cameraMake: z.string().max(100).optional(),
  cameraModel: z.string().max(100).optional(),
  takenAt: z.string().datetime().optional(),
  locationId: uuidSchema.optional(),
});

export const analyzePhotoSchema = z.object({
  id: uuidSchema,
});

// ============================================
// Vibe Analysis Schemas
// ============================================

export const vibeTypeSchema = z.enum([
  'cozy',
  'modern',
  'traditional',
  'peaceful',
  'artistic',
  'vintage',
  'minimalist',
  'vibrant',
  'romantic',
  'adventurous'
]);

export const vibeAnalysisSchema = z.object({
  primaryVibe: vibeTypeSchema,
  secondaryVibes: z.array(vibeTypeSchema).max(5),
  vibeScores: z.record(vibeTypeSchema, z.number().min(0).max(1)),
  description: z.string().max(500),
  tags: z.array(z.string().max(50)).max(20),
  placeType: z.string().max(50),
  confidence: z.number().min(0).max(1),
});

// ============================================
// Type Exports
// ============================================

export type LocationCategory = z.infer<typeof locationCategorySchema>;
export type PhotoStatus = z.infer<typeof photoStatusSchema>;
export type GpsSource = z.infer<typeof gpsSourceSchema>;
export type VibeType = z.infer<typeof vibeTypeSchema>;
export type VibeAnalysis = z.infer<typeof vibeAnalysisSchema>;

export type GetLocationsInput = z.infer<typeof getLocationsSchema>;
export type GetJourneysInput = z.infer<typeof getJourneysSchema>;
export type PostJourneyInput = z.infer<typeof postJourneySchema>;
export type GetPhotosInput = z.infer<typeof getPhotosSchema>;
export type PostPhotoInput = z.infer<typeof postPhotoSchema>;
