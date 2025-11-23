import { describe, it } from "node:test";
import assert from "node:assert";
import { createToken, verifyToken, getUserIdFromToken } from "@/core/auth/jwt";

describe("JWT - JSON Web Token", () => {
  describe("createToken", () => {
    it("should create a valid JWT token", () => {
      const token = createToken("user-123");
      assert.ok(token);
      assert.strictEqual(typeof token, "string");
    });
  });

  describe("verifyToken", () => {
    it("should verify a valid token", () => {
      const token = createToken("user-123");
      const payload = verifyToken(token);
      assert.ok(payload);
      assert.strictEqual(payload.userId, "user-123");
    });

    it("should reject invalid token", () => {
      assert.throws(() => {
        verifyToken("invalid-token");
      });
    });
  });

  describe("getUserIdFromToken", () => {
    it("should extract userId from valid token", () => {
      const token = createToken("user-456");
      const userId = getUserIdFromToken(token);
      assert.strictEqual(userId, "user-456");
    });
  });
});
