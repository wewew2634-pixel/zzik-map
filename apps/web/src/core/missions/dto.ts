// ZZIK LIVE v4 - Mission DTOs

import { MissionRunStatus, TrafficSignal } from "@prisma/client";

export type MissionRunStatusDto = {
  id: string;
  status: MissionRunStatus;
  expiresAt: string | null;

  steps: {
    gps: { done: boolean; at: string | null };
    qr: { done: boolean; at: string | null };
    reels: { done: boolean; at: string | null };
    review: { done: boolean; at: string | null };
  };

  reward: {
    amount: number | null;
    rewardedAt: string | null;
  };

  mission: {
    id: string;
    title: string;
    rewardAmount: number;
  };

  place: {
    id: string;
    name: string;
    trafficSignal: TrafficSignal;
  };
};
