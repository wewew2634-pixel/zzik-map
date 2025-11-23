// ZZIK LIVE v4 - GET /api/loyalty/wallet
// User's loyalty wallet (points balance and history)

import { handleApi } from "../../_utils/handleApi";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequestLoose } from "@/core/auth/jwt";

/**
 * GET /api/loyalty/wallet
 * Get current user's loyalty wallet information
 */
export async function GET(req: Request) {
  return handleApi(async () => {
    // Authenticate user
    const userId = getUserIdFromRequestLoose(req);

    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        balance: true,
        lockedBalance: true,
        transactions: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            status: true,
            amount: true,
            balanceBefore: true,
            balanceAfter: true,
            createdAt: true,
          },
        },
      },
    });

    if (!wallet) {
      const { AppError } = await import("@/core/errors/app-error");
      throw new AppError("WALLET_NOT_FOUND", "Wallet not found", 404);
    }

    return {
      wallet: {
        userId: wallet.userId,
        balance: wallet.balance,
        lockedBalance: wallet.lockedBalance,
        transactions: wallet.transactions,
      },
    };
  });
}
