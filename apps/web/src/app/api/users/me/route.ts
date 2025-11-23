// ZZIK LIVE v4 - Right to Delete API (GDPR Compliance)
// DELETE /api/users/me - Schedule user account deletion

import { NextResponse } from "next/server";
import { getUserIdFromRequestLoose } from "@/core/auth/jwt";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/core/errors/app-error";
import { logger } from "@/core/observability/logger";

const DELETION_GRACE_PERIOD_DAYS = 30;

export async function DELETE(req: Request) {
  try {
    // Authenticate user
    const userId = getUserIdFromRequestLoose(req);

    // Calculate deletion date (30 days from now)
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + DELETION_GRACE_PERIOD_DAYS);

    // Soft delete: set email/phone to null, add deletedAt + deletionScheduled
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email: null,
        phone: null,
        deletedAt: new Date(),
        deletionScheduled: deletionDate,
      },
      select: {
        id: true,
        deletedAt: true,
        deletionScheduled: true,
      },
    });

    return NextResponse.json(
      {
        status: "scheduled_for_deletion",
        deletionDate: updatedUser.deletionScheduled,
        message: `Your account has been scheduled for deletion. All personal data will be permanently removed on ${updatedUser.deletionScheduled?.toISOString()}.`,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.httpStatus });
    }

    const userId = getUserIdFromRequestLoose(req);
    logger.error({ userId }, "Error deleting user", { error });
    return NextResponse.json(
      { error: "Failed to schedule account deletion" },
      { status: 500 }
    );
  }
}
