import { afterEach, describe, expect, it, vi } from "vitest";

type FetchImpl = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 500,
    statusText: ok ? "OK" : "Internal Server Error",
    json: async () => body,
  } as unknown as Response;
}

/** Fresh module per test: api.ts caches the online/offline probe in module state. */
async function loadApi(fetchImpl: FetchImpl) {
  vi.resetModules();
  vi.stubGlobal("fetch", fetchImpl);
  return await import("@/lib/api");
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("verifyRun", () => {
  it("rejects when the backend is reachable but the verify request fails, instead of fabricating a match", async () => {
    const api = await loadApi(async (input) => {
      if (String(input).endsWith("/api/v1/health")) return jsonResponse({ status: "ok" });
      throw new TypeError("network error");
    });

    await expect(api.verifyRun("foresure-1", { probability_pct: 9.99 })).rejects.toThrow();
  });

  it("rejects on a non-2xx verify response with the backend detail", async () => {
    const api = await loadApi(async (input) => {
      if (String(input).endsWith("/api/v1/health")) return jsonResponse({ status: "ok" });
      return jsonResponse({ detail: "Too Many Requests" }, false);
    });

    await expect(api.verifyRun("foresure-1")).rejects.toThrow("Too Many Requests");
  });

  it("offline: a tampered payload is never reported as matched and the result is labelled simulated", async () => {
    const api = await loadApi(async () => {
      throw new TypeError("connection refused");
    });

    const result = await api.verifyRun("foresure-1", { probability_pct: 9.99 });

    expect(result.matched).toBe(false);
    expect(result.tampered_fields).toEqual(["probability_pct"]);
    expect(result.is_mock).toBe(true);
    expect(result.reason).toBeTruthy();
  });

  it("offline: an untampered payload is a simulated match, labelled as such", async () => {
    const api = await loadApi(async () => {
      throw new TypeError("connection refused");
    });

    const result = await api.verifyRun("foresure-1");

    expect(result.matched).toBe(true);
    expect(result.tampered_fields).toEqual([]);
    expect(result.is_mock).toBe(true);
    expect(result.reason).toBeTruthy();
  });
});
