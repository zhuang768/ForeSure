import { STAGES } from "@/lib/stages";
import type { ActiveRun, ChainStatus, Health, RunEvent, RunRecord, RunSummary, Stage, VerifyResult } from "@/lib/types";

export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
// Demo token; intentionally public and accepted by the backend for the hackathon only.
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN ?? "MOCK_APIGEE_TOKEN";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = (await res.json()) as { detail?: unknown };
      if (body?.detail) detail = String(body.detail);
    } catch {
      /* not json */
    }
    throw new Error(detail);
  }
  return (await res.json()) as T;
}

const auth = { Authorization: `Bearer ${TOKEN}` };

export const health = () => request<Health>("/api/v1/health");
export const chainStatus = () => request<ChainStatus>("/api/v1/chain/status");
export const listRuns = (limit = 50) => request<RunSummary[]>(`/api/v1/runs?limit=${limit}`);
export const getRun = (id: string) => request<RunRecord>(`/api/v1/runs/${encodeURIComponent(id)}`);
export const getActiveRun = (runId: string) => request<ActiveRun>(`/api/v1/runs/${encodeURIComponent(runId)}`);
export const startRun = () =>
  request<{ run_id: string; status: string }>("/api/v1/runs", { method: "POST", headers: auth });
export const verifyRun = (id: string, tampered?: Record<string, unknown>) =>
  request<VerifyResult>(`/api/v1/runs/${encodeURIComponent(id)}/verify`, {
    method: "POST",
    headers: auth,
    body: JSON.stringify(tampered ? { tampered } : {}),
  });

const ALL_STAGES: readonly string[] = [...STAGES, "error"];

/**
 * Subscribe to the SSE stream. Returns a cleanup function.
 * onError fires once if the browser reports a connection error before done/error arrived;
 * the caller decides whether to fall back to polling.
 */
export function openRunStream(runId: string, onEvent: (event: RunEvent) => void, onError: () => void): () => void {
  const es = new EventSource(`${API_BASE}/api/v1/runs/${encodeURIComponent(runId)}/events`);
  let finished = false;
  for (const stage of ALL_STAGES) {
    es.addEventListener(stage, (e) => {
      const raw = (e as MessageEvent).data as string;
      let data: unknown = raw;
      try {
        data = JSON.parse(raw);
      } catch {
        /* keep raw string */
      }
      if (stage === "done" || stage === "error") finished = true;
      onEvent({ stage: stage as Stage, data });
      if (finished) es.close();
    });
  }
  es.onerror = () => {
    if (!finished) {
      es.close();
      onError();
    }
  };
  return () => es.close();
}
