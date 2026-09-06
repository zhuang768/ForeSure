import { describe, expect, it, vi } from "vitest";
import { deriveBadgeState } from "@/lib/badge";
import { MOCK_RUN_RECORDS, MOCK_RUN_SUMMARIES } from "@/lib/mockData";

/** The offline demo data is shown when no backend is reachable, so nothing in it may pose as a real chain record. */
describe("offline demo data", () => {
  it("never presents a demo summary as anchored on chain", () => {
    for (const s of MOCK_RUN_SUMMARIES) {
      expect(s.chain_is_mock, s.decision_id).toBe(true);
      expect(s.tx_hash, s.decision_id).toBeNull();
      expect(s.verification_url, s.decision_id).toBeNull();
    }
  });
  it("gives every demo record a receipt that the badge logic reads as mock", () => {
    for (const r of MOCK_RUN_RECORDS) {
      expect(r.blockchain_receipt.is_mock, r.decision_id).toBe(true);
      expect(r.blockchain_receipt.blockchain_tx_hash, r.decision_id).toBeNull();
      expect(deriveBadgeState({ receipt: r.blockchain_receipt }), r.decision_id).toBe("mock");
    }
  });
});

describe("offline generator simulation", () => {
  it("ends with a receipt that is labelled mock and carries no explorer link", async () => {
    const { MOCK_EVENTS } = await import("@/lib/mockEvents");
    const done = MOCK_EVENTS.find((e) => e.stage === "chain_done");
    expect(done).toBeDefined();
    const receipt = done!.data as { is_mock: boolean; blockchain_tx_hash: string | null; verification_url: string | null };
    expect(receipt.is_mock).toBe(true);
    expect(receipt.blockchain_tx_hash).toBeNull();
    expect(receipt.verification_url).toBeNull();
  });
});

/**
 * The history page renders these constants during SSR and again on the client. If the module's
 * output depends on the wall clock or on randomness, the two renders disagree and React reports a
 * hydration mismatch, so the demo data must be identical no matter when the module is evaluated.
 */
describe("offline demo data is stable across module evaluations", () => {
  it("does not depend on the wall clock or on randomness", async () => {
    vi.useFakeTimers();
    try {
      vi.resetModules();
      vi.setSystemTime(new Date("2026-09-06T01:30:00Z"));
      const a = await import("@/lib/mockData");
      vi.resetModules();
      vi.setSystemTime(new Date("2026-09-07T13:45:00Z"));
      const b = await import("@/lib/mockData");

      const shape = (m: typeof a) => ({
        summaries: m.MOCK_RUN_SUMMARIES.map((s) => [s.decision_id, s.run_id, s.timestamp]),
        published: m.MOCK_RUN_RECORDS.map((r) => r.news.published),
      });
      expect(shape(b)).toEqual(shape(a));
    } finally {
      vi.useRealTimers();
    }
  });
});
