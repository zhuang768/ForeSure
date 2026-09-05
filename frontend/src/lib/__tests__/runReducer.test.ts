import { describe, expect, it } from "vitest";
import { applyEvent, initialRunState, startRunState } from "@/lib/runReducer";
import type { Receipt, RunRecord } from "@/lib/types";

const news = [{ title: "n1", link: "", published: "", summary: "s", is_mock: false }];
const receipt: Receipt = {
  decision_id: "atlas-1",
  payload: {},
  data_hash: "ab",
  blockchain_tx_hash: "0xabc",
  block_number: 1,
  verification_url: "https://sepolia.etherscan.io/tx/0xabc",
  network: "Ethereum Sepolia Testnet",
  is_mock: false,
  timestamp: "t",
};

describe("run reducer", () => {
  it("starts idle and becomes running with a run id", () => {
    expect(initialRunState().status).toBe("idle");
    const s = startRunState("r1", 1000);
    expect(s).toMatchObject({ runId: "r1", status: "running", startedAt: 1000, stageIndex: -1 });
  });

  it("advances stage index and records elapsed seconds per stage", () => {
    let s = startRunState("r1", 1000);
    s = applyEvent(s, { stage: "news_fetched", data: news }, 3200);
    expect(s.stageIndex).toBe(0);
    expect(s.news).toEqual(news);
    expect(s.timings.news_fetched).toBe(2.2);
    s = applyEvent(s, { stage: "news_selected", data: news[0] }, 4000);
    expect(s.selected?.title).toBe("n1");
    expect(s.stageIndex).toBe(1);
  });

  it("is idempotent when the same event is applied twice (polling fallback)", () => {
    let s = startRunState("r1", 1000);
    s = applyEvent(s, { stage: "pm", data: "PM 說" }, 5000);
    const again = applyEvent(s, { stage: "pm", data: "PM 說" }, 9000);
    expect(again.debate.pm).toBe("PM 說");
    expect(again.timings.pm).toBe(4); // first arrival wins
    expect(again.stageIndex).toBe(s.stageIndex);
  });

  it("marks chain pending, then stores the receipt and record on done", () => {
    let s = startRunState("r1", 0);
    s = applyEvent(s, { stage: "chain_pending", data: { network: "x" } }, 1000);
    expect(s.chainPending).toBe(true);
    s = applyEvent(s, { stage: "chain_done", data: receipt }, 2000);
    expect(s.chainPending).toBe(false);
    expect(s.receipt?.blockchain_tx_hash).toBe("0xabc");
    const record = { decision_id: "atlas-1" } as RunRecord;
    s = applyEvent(s, { stage: "done", data: record }, 3000);
    expect(s.status).toBe("done");
    expect(s.record?.decision_id).toBe("atlas-1");
  });

  it("stores error text and stops on error", () => {
    const s = applyEvent(startRunState("r1", 0), { stage: "error", data: "boom" }, 10);
    expect(s.status).toBe("error");
    expect(s.error).toBe("boom");
  });
});
