// ZZIK LIVE v4 - GET /api/loyalty/user/[userId]/place/[placeId]
// Get loyalty score for a user at a specific place

import { handleApi } from "@/app/api/_utils/handleApi";
import { calculateUserLoyaltyScore } from "@/core/loyalty/calculator";
import { getUserIdFromRequestLoose } from "@/core/auth/jwt";
import { AppError } from "@/core/errors/app-error";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string; placeId: string }> }
) {
  return handleApi(async () => {
    const { userId, placeId } = await params;

    // Authenticate user
    const requestingUserId = getUserIdFromRequestLoose(req);

    // Users can only view their own loyalty scores
    // Admins can view any user's scores (TODO: implement role check)
    if (requestingUserId !== userId) {
      throw new AppError(
        "PERMISSION_DENIED",
        "You can only view your own loyalty scores",
        403
      );
    }

    const loyaltyData = await calculateUserLoyaltyScore(userId, placeId);

    return {
      userId,
      placeId,
      loyaltyData,
    };
  });
}
