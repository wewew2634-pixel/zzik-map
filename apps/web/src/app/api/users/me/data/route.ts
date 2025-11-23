// ZZIK LIVE v4 - Right to Access API (GDPR Compliance)
// GET /api/users/me/data - Export all user data

import { NextResponse } from "next/server";
import { getUserIdFromRequestLoose } from "@/core/auth/jwt";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/core/errors/app-error";
import { logger } from "@/core/observability/logger";

export async function GET(req: Request) {
  try {
    // Authenticate user
    const userId = getUserIdFromRequestLoose(req);

    // Fetch all user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        missionRuns: {
          include: {
            mission: {
              include: {
                place: true,
              },
            },
            walletTransactions: true,
          },
        },
        wallet: {
          include: {
            transactions: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError("USER_NOT_FOUND", "User not found", 404);
    }

    // Prepare complete data export
    const dataExport = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        authProvider: user.authProvider,
        providerUserId: user.providerUserId,
        deletedAt: user.deletedAt,
        deletionScheduled: user.deletionScheduled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      missionRuns: user.missionRuns.map((run) => ({
        id: run.id,
        missionId: run.missionId,
        status: run.status,
        gpsVerifiedAt: run.gpsVerifiedAt,
        qrVerifiedAt: run.qrVerifiedAt,
        reelsUploadedAt: run.reelsUploadedAt,
        reviewedAt: run.reviewedAt,
        rejectedAt: run.rejectedAt,
        rejectReason: run.rejectReason,
        expiresAt: run.expiresAt,
        rewardAmount: run.rewardAmount,
        rewardedAt: run.rewardedAt,
        createdAt: run.createdAt,
        updatedAt: run.updatedAt,
        mission: {
          id: run.mission.id,
          title: run.mission.title,
          description: run.mission.description,
          status: run.mission.status,
          rewardAmount: run.mission.rewardAmount,
          place: {
            name: run.mission.place.name,
            category: run.mission.place.category,
            address: run.mission.place.address,
          },
        },
        transactions: run.walletTransactions,
      })),
      wallet: user.wallet
        ? {
            id: user.wallet.id,
            balance: user.wallet.balance,
            lockedBalance: user.wallet.lockedBalance,
            version: user.wallet.version,
            createdAt: user.wallet.createdAt,
            updatedAt: user.wallet.updatedAt,
            transactions: user.wallet.transactions.map((tx) => ({
              id: tx.id,
              type: tx.type,
              status: tx.status,
              amount: tx.amount,
              balanceBefore: tx.balanceBefore,
              balanceAfter: tx.balanceAfter,
              refType: tx.refType,
              refId: tx.refId,
              missionRunId: tx.missionRunId,
              createdAt: tx.createdAt,
            })),
          }
        : null,
    };

    return NextResponse.json(dataExport, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.httpStatus });
    }

    const userId = getUserIdFromRequestLoose(req);
    logger.error({ userId }, "Error exporting user data", { error });
    return NextResponse.json(
      { error: "Failed to export user data" },
      { status: 500 }
    );
  }
}
