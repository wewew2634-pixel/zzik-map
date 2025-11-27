# Photo Processing Skill

## When to Use
Invoke this skill when working on:
- Photo upload functionality
- EXIF data extraction
- Image compression/optimization
- GPS coordinate parsing
- Image format validation

---

## EXIF Extraction

### Install Dependencies
```bash
pnpm add exifreader
```

### Extract GPS from EXIF
```typescript
import ExifReader from 'exifreader';

interface GPSData {
  latitude: number;
  longitude: number;
  altitude?: number;
  timestamp?: Date;
}

async function extractGPSFromFile(file: File): Promise<GPSData | null> {
  try {
    const tags = await ExifReader.load(file);

    // Check for GPS data
    if (!tags.GPSLatitude || !tags.GPSLongitude) {
      return null;
    }

    // Parse latitude
    const lat = parseFloat(tags.GPSLatitude.description);
    const latRef = tags.GPSLatitudeRef?.value?.[0];
    const latitude = latRef === 'S' ? -lat : lat;

    // Parse longitude
    const lng = parseFloat(tags.GPSLongitude.description);
    const lngRef = tags.GPSLongitudeRef?.value?.[0];
    const longitude = lngRef === 'W' ? -lng : lng;

    // Optional: altitude
    let altitude: number | undefined;
    if (tags.GPSAltitude) {
      altitude = parseFloat(tags.GPSAltitude.description);
      if (tags.GPSAltitudeRef?.value?.[0] === 1) {
        altitude = -altitude; // Below sea level
      }
    }

    // Optional: timestamp
    let timestamp: Date | undefined;
    if (tags.DateTimeOriginal) {
      timestamp = new Date(tags.DateTimeOriginal.description);
    }

    return { latitude, longitude, altitude, timestamp };
  } catch (error) {
    console.error('EXIF extraction failed:', error);
    return null;
  }
}
```

### Validate Korean Coordinates
```typescript
function isInKorea(lat: number, lng: number): boolean {
  // Rough bounds for South Korea
  return lat >= 33 && lat <= 43 && lng >= 124 && lng <= 132;
}
```

---

## Image Validation

### Supported Formats
```typescript
const SUPPORTED_FORMATS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported format: ${file.type}. Use JPEG, PNG, or WebP.`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max 10MB.`,
    };
  }

  return { valid: true };
}
```

---

## Image Compression

### Compress for Upload
```typescript
async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maxSize?: number;
  } = {}
): Promise<Blob> {
  const {
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 0.85,
    maxSize = 2 * 1024 * 1024, // 2MB target
  } = options;

  // Create canvas
  const img = await createImageBitmap(file);
  let { width, height } = img;

  // Calculate new dimensions
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);

  // Compress with quality adjustment
  let currentQuality = quality;
  let result: Blob;

  do {
    result = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: currentQuality,
    });
    currentQuality -= 0.1;
  } while (result.size > maxSize && currentQuality > 0.1);

  return result;
}
```

---

## Preview Generation

### Create Thumbnail
```typescript
async function createThumbnail(
  file: File,
  size: number = 200
): Promise<string> {
  const img = await createImageBitmap(file);

  const ratio = Math.min(size / img.width, size / img.height);
  const width = Math.round(img.width * ratio);
  const height = Math.round(img.height * ratio);

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.7 });
  return URL.createObjectURL(blob);
}
```

---

## Base64 Conversion

### For API Calls
```typescript
async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// For data URLs
async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

---

## Privacy: Strip EXIF

### Remove Metadata Before Storage
```typescript
async function stripExif(file: File): Promise<Blob> {
  // Draw to canvas (strips EXIF) and export
  const img = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  return canvas.convertToBlob({
    type: 'image/jpeg',
    quality: 0.95,
  });
}
```

---

## Complete Upload Pipeline

```typescript
async function processPhotoForUpload(file: File): Promise<{
  preview: string;
  compressed: Blob;
  gps: GPSData | null;
  strippedBlob: Blob;
}> {
  // 1. Validate
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // 2. Extract GPS before any processing
  const gps = await extractGPSFromFile(file);

  // 3. Generate preview
  const preview = await createThumbnail(file, 400);

  // 4. Compress for API/storage
  const compressed = await compressImage(file, {
    maxWidth: 2048,
    maxHeight: 2048,
    maxSize: 2 * 1024 * 1024,
  });

  // 5. Strip EXIF for public storage
  const strippedBlob = await stripExif(file);

  return { preview, compressed, gps, strippedBlob };
}
```
