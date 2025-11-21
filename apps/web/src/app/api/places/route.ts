// ZZIK LIVE v4 - GET /api/places

import { handleApi } from "../_utils/handleApi";
import { prisma } from "@/lib/prisma";

export async function GET() {
  return handleApi(async () => {
    const places = await prisma.place.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        missions: {
          where: { status: "ACTIVE" },
          select: { id: true, title: true, rewardAmount: true },
        },
      },
    });

    return { places };
  });
}
