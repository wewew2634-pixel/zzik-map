// ZZIK LIVE v4 - JWT Authentication

import jwt from "jsonwebtoken";
import { AppError } from "@/core/errors/app-error";

export type AuthTokenPayload = {
  sub: string; // userId
  email?: string;
  // role, scopes 등 추가 가능
};

export function verifyAuthToken(token: string): AuthTokenPayload {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) {
    throw new Error("AUTH_JWT_SECRET is not set");
  }

  const decoded = jwt.verify(token, secret);
  return decoded as AuthTokenPayload;
}

export function getUserIdFromRequest(req: Request): string {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    throw new AppError("AUTH_REQUIRED", "Authentication required", 401);
  }

  const token = auth.slice("Bearer ".length).trim();
  let payload: AuthTokenPayload;
  try {
    payload = verifyAuthToken(token);
  } catch (e) {
    throw new AppError("AUTH_REQUIRED", "Invalid or expired token", 401, e);
  }

  if (!payload.sub) {
    throw new AppError("AUTH_REQUIRED", "Token has no subject", 401);
  }

  return payload.sub;
}

// 개발/테스트용: x-zzik-user-id 헤더도 허용 (프로덕션에서는 비활성화)
export function getUserIdFromRequestLoose(req: Request): string {
  // Only allow x-zzik-user-id header in non-production environments
  const isDevelopment = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

  if (isDevelopment) {
    const headerUserId = req.headers.get("x-zzik-user-id");
    if (headerUserId) return headerUserId;
  }

  return getUserIdFromRequest(req);
}
