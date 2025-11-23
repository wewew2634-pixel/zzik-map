import { z } from "zod";

export const StartMissionRunParamsSchema = z.object({
  missionId: z.string().min(1, "missionId is required"),
});

export const StartMissionRunBodySchema = z.object({
  activeLockKey: z.string().min(1).optional(),
});

export const MissionRunIdSchema = z.object({
  missionRunId: z.string().min(1, "missionRunId is required"),
});

export const GpsVerifyBodySchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().positive().max(1000),
  provider: z.enum(["gps", "network", "fused", "mock"]).optional(),
  mocked: z.boolean().optional(),
  deviceId: z.string().uuid().optional(),
  timestamp: z.string().datetime().optional(),
});

export const QrVerifyBodySchema = z.object({
  rawPayload: z.string().min(1, "QR payload is required"),
});

export const ReelsVerifyBodySchema = z.object({
  metadata: z.object({
    platform: z.enum(["instagram", "tiktok", "zzik"]),
    url: z.string().url(),
    caption: z.string().optional(),
    hashtags: z.array(z.string()).optional(),
  }),
});
