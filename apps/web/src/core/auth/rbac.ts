// ZZIK LIVE v4 - Role-Based Access Control (RBAC)
// 역할 기반 접근 제어 시스템

import { prisma } from "@/lib/prisma";
import { AppError } from "@/core/errors/app-error";

export type Role = "USER" | "ADMIN" | "SUPER_ADMIN";

export type Permission =
  | "mission:create"
  | "mission:update"
  | "mission:delete"
  | "mission:approve"
  | "place:create"
  | "place:update"
  | "place:delete"
  | "qr:generate"
  | "user:view"
  | "user:delete"
  | "admin:access";

// Role-Permission 매핑
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  USER: [],
  ADMIN: [
    "mission:create",
    "mission:update",
    "mission:approve",
    "place:create",
    "place:update",
    "qr:generate",
    "user:view",
  ],
  SUPER_ADMIN: [
    "mission:create",
    "mission:update",
    "mission:delete",
    "mission:approve",
    "place:create",
    "place:update",
    "place:delete",
    "qr:generate",
    "user:view",
    "user:delete",
    "admin:access",
  ],
};

/**
 * Get user's role from database
 */
export async function getUserRole(userId: string): Promise<Role> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    throw new AppError("USER_NOT_FOUND", "User not found", 404);
  }

  return (user.role as Role) || "USER";
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
  userId: string,
  permission: Permission
): Promise<boolean> {
  const role = await getUserRole(userId);
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Require specific permission (throws if not authorized)
 */
export async function requirePermission(
  userId: string,
  permission: Permission
): Promise<void> {
  const allowed = await hasPermission(userId, permission);

  if (!allowed) {
    throw new AppError(
      "PERMISSION_DENIED",
      `Permission required: ${permission}`,
      403
    );
  }
}

/**
 * Require specific role (throws if not authorized)
 */
export async function requireRole(userId: string, role: Role): Promise<void> {
  const userRole = await getUserRole(userId);

  // Role hierarchy: SUPER_ADMIN > ADMIN > USER
  const roleLevel: Record<Role, number> = {
    USER: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3,
  };

  if (roleLevel[userRole] < roleLevel[role]) {
    throw new AppError(
      "PERMISSION_DENIED",
      `Role required: ${role} (current: ${userRole})`,
      403
    );
  }
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

/**
 * Require admin role (convenience function)
 */
export async function requireAdmin(userId: string): Promise<void> {
  const admin = await isAdmin(userId);

  if (!admin) {
    throw new AppError(
      "PERMISSION_DENIED",
      "Admin access required",
      403
    );
  }
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  const role = await getUserRole(userId);
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Middleware helper for API routes
 *
 * Usage:
 * ```ts
 * export async function POST(req: Request) {
 *   const userId = getUserIdFromRequestLoose(req);
 *   await withPermission(userId, 'mission:create');
 *
 *   return handleApi(async () => {
 *     // Your logic here
 *   });
 * }
 * ```
 */
export async function withPermission(
  userId: string,
  permission: Permission
): Promise<void> {
  await requirePermission(userId, permission);
}

/**
 * Batch permission check (returns which permissions user has)
 */
export async function checkPermissions(
  userId: string,
  permissions: Permission[]
): Promise<Record<Permission, boolean>> {
  const role = await getUserRole(userId);
  const userPermissions = ROLE_PERMISSIONS[role] || [];

  const result: Record<string, boolean> = {};
  for (const permission of permissions) {
    result[permission] = userPermissions.includes(permission);
  }

  return result as Record<Permission, boolean>;
}
