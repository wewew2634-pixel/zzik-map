// ZZIK LIVE - RBAC (Role-Based Access Control) Tests
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { testPrisma } from "./setup";
import {
  getUserRole,
  hasPermission,
  requirePermission,
  requireAdmin,
  isAdmin,
  getUserPermissions,
  checkPermissions,
  type Role,
  type Permission,
} from "../../apps/web/src/core/auth/rbac";
import { AppError } from "../../apps/web/src/core/errors/app-error";

describe("RBAC - Role-Based Access Control", () => {
  let regularUser: { id: string };
  let adminUser: { id: string };
  let superAdminUser: { id: string };

  before(async () => {
    // Create test users with different roles
    regularUser = await testPrisma.user.create({
      data: {
        email: `rbac-user-${Date.now()}@test.com`,
        role: "USER",
      },
    });

    adminUser = await testPrisma.user.create({
      data: {
        email: `rbac-admin-${Date.now()}@test.com`,
        role: "ADMIN",
      },
    });

    superAdminUser = await testPrisma.user.create({
      data: {
        email: `rbac-superadmin-${Date.now()}@test.com`,
        role: "SUPER_ADMIN",
      },
    });
  });

  after(async () => {
    // Cleanup
    await testPrisma.user.deleteMany({
      where: {
        id: {
          in: [regularUser.id, adminUser.id, superAdminUser.id],
        },
      },
    });
  });

  describe("getUserRole", () => {
    it("일반 유저의 역할을 정확히 반환한다", async () => {
      const role = await getUserRole(regularUser.id);
      assert.strictEqual(role, "USER");
    });

    it("관리자의 역할을 정확히 반환한다", async () => {
      const role = await getUserRole(adminUser.id);
      assert.strictEqual(role, "ADMIN");
    });

    it("슈퍼관리자의 역할을 정확히 반환한다", async () => {
      const role = await getUserRole(superAdminUser.id);
      assert.strictEqual(role, "SUPER_ADMIN");
    });

    it("존재하지 않는 유저에 대해 에러를 발생시킨다", async () => {
      await assert.rejects(
        async () => getUserRole("nonexistent-user-id"),
        (err: Error) => {
          assert.ok(err instanceof AppError);
          assert.strictEqual(err.message, "User not found");
          return true;
        }
      );
    });
  });

  describe("hasPermission", () => {
    it("일반 유저는 권한이 없다", async () => {
      const hasPerm = await hasPermission(regularUser.id, "mission:create");
      assert.strictEqual(hasPerm, false);
    });

    it("관리자는 mission:create 권한이 있다", async () => {
      const hasPerm = await hasPermission(adminUser.id, "mission:create");
      assert.strictEqual(hasPerm, true);
    });

    it("관리자는 mission:delete 권한이 없다", async () => {
      const hasPerm = await hasPermission(adminUser.id, "mission:delete");
      assert.strictEqual(hasPerm, false);
    });

    it("슈퍼관리자는 모든 권한이 있다", async () => {
      const hasMissionDelete = await hasPermission(superAdminUser.id, "mission:delete");
      const hasUserDelete = await hasPermission(superAdminUser.id, "user:delete");
      const hasAdminAccess = await hasPermission(superAdminUser.id, "admin:access");

      assert.strictEqual(hasMissionDelete, true);
      assert.strictEqual(hasUserDelete, true);
      assert.strictEqual(hasAdminAccess, true);
    });
  });

  describe("requirePermission", () => {
    it("권한이 있으면 에러를 발생시키지 않는다", async () => {
      await assert.doesNotReject(async () => {
        await requirePermission(adminUser.id, "mission:create");
      });
    });

    it("권한이 없으면 403 에러를 발생시킨다", async () => {
      await assert.rejects(
        async () => requirePermission(regularUser.id, "mission:create"),
        (err: Error) => {
          assert.ok(err instanceof AppError);
          assert.ok(err.message.includes("Permission required: mission:create"));
          return true;
        }
      );
    });
  });

  describe("isAdmin", () => {
    it("일반 유저는 관리자가 아니다", async () => {
      const admin = await isAdmin(regularUser.id);
      assert.strictEqual(admin, false);
    });

    it("ADMIN 역할은 관리자다", async () => {
      const admin = await isAdmin(adminUser.id);
      assert.strictEqual(admin, true);
    });

    it("SUPER_ADMIN 역할은 관리자다", async () => {
      const admin = await isAdmin(superAdminUser.id);
      assert.strictEqual(admin, true);
    });
  });

  describe("requireAdmin", () => {
    it("관리자는 접근 가능하다", async () => {
      await assert.doesNotReject(async () => {
        await requireAdmin(adminUser.id);
      });
    });

    it("슈퍼관리자는 접근 가능하다", async () => {
      await assert.doesNotReject(async () => {
        await requireAdmin(superAdminUser.id);
      });
    });

    it("일반 유저는 403 에러를 받는다", async () => {
      await assert.rejects(
        async () => requireAdmin(regularUser.id),
        (err: Error) => {
          assert.ok(err instanceof AppError);
          assert.ok(err.message.includes("Admin access required"));
          return true;
        }
      );
    });
  });

  describe("getUserPermissions", () => {
    it("일반 유저의 권한 목록은 비어있다", async () => {
      const perms = await getUserPermissions(regularUser.id);
      assert.strictEqual(perms.length, 0);
    });

    it("관리자의 권한 목록을 반환한다", async () => {
      const perms = await getUserPermissions(adminUser.id);
      assert.ok(perms.length > 0);
      assert.ok(perms.includes("mission:create"));
      assert.ok(perms.includes("mission:update"));
      assert.ok(perms.includes("mission:approve"));
    });

    it("슈퍼관리자의 권한 목록을 반환한다", async () => {
      const perms = await getUserPermissions(superAdminUser.id);
      assert.ok(perms.length > 0);
      assert.ok(perms.includes("mission:delete"));
      assert.ok(perms.includes("user:delete"));
      assert.ok(perms.includes("admin:access"));
    });
  });

  describe("checkPermissions (batch check)", () => {
    it("여러 권한을 한 번에 체크한다", async () => {
      const result = await checkPermissions(adminUser.id, [
        "mission:create",
        "mission:delete",
        "place:create",
      ]);

      assert.strictEqual(result["mission:create"], true);
      assert.strictEqual(result["mission:delete"], false);
      assert.strictEqual(result["place:create"], true);
    });

    it("일반 유저는 모든 권한이 false다", async () => {
      const result = await checkPermissions(regularUser.id, [
        "mission:create",
        "place:create",
        "user:delete",
      ]);

      assert.strictEqual(result["mission:create"], false);
      assert.strictEqual(result["place:create"], false);
      assert.strictEqual(result["user:delete"], false);
    });
  });
});
