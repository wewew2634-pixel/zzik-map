// ZZIK LIVE v4 - Mission Query Services

import { prisma } from "@/lib/prisma";
import { getMissionRunWithGraph } from "./repository";
import { AppError } from "@/core/errors/app-error";
import { MissionRunStatusDto } from "./dto";

export async function getMissionRunStatus(
  id: string,
  userId?: string,
): Promise<MissionRunStatusDto> {
  const run = await getMissionRunWithGraph(prisma, id);

  if (!run) {
    throw new AppError(
      "MISSION_RUN_NOT_FOUND",
      "Mission run not found",
      404,
    );
  }

  if (userId && run.userId !== userId) {
    throw new AppError(
      "MISSION_RUN_NOT_FOUND",
      "Mission run not found",
      404,
    );
  }

  return {
    id: run.id,
    status: run.status,
    expiresAt: run.expiresAt?.toISOString() ?? null,
    steps: {
      gps: {
        done: !!run.gpsVerifiedAt,
        at: run.gpsVerifiedAt?.toISOString() ?? null,
      },
      qr: {
        done: !!run.qrVerifiedAt,
        at: run.qrVerifiedAt?.toISOString() ?? null,
      },
      reels: {
        done: !!run.reelsUploadedAt,
        at: run.reelsUploadedAt?.toISOString() ?? null,
      },
      review: {
        done: !!run.reviewedAt,
        at: run.reviewedAt?.toISOString() ?? null,
      },
    },
    reward: {
      amount: run.rewardAmount,
      rewardedAt: run.rewardedAt?.toISOString() ?? null,
    },
    mission: {
      id: run.mission.id,
      title: run.mission.title,
      rewardAmount: run.mission.rewardAmount,
    },
    place: {
      id: run.mission.place.id,
      name: run.mission.place.name,
      trafficSignal: run.mission.place.trafficSignal,
    },
  };
}

