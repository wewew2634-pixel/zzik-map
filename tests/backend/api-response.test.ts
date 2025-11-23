import { describe, it } from "node:test";
import assert from "node:assert";
import { successResponse, errorResponse } from "@/core/errors/api-response";

describe("API Response Helpers", () => {
  describe("successResponse", () => {
    it("should create successful response with data", () => {
      const res = successResponse({ user: "test" });
      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(JSON.parse(res.body), { user: "test" });
    });
  });

  describe("errorResponse", () => {
    it("should create error response with message", () => {
      const res = errorResponse("Test error", 400);
      assert.strictEqual(res.status, 400);
      const body = JSON.parse(res.body);
      assert.strictEqual(body.error, "Test error");
    });
  });
});
