// ZZIK LIVE v4 - Reels Types

export type ReelsPlatform = "instagram" | "tiktok" | "zzik";

export type ReelsMetadata = {
  platform: ReelsPlatform;
  url: string;
  caption?: string;
  hashtags?: string[];
};
