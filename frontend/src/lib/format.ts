export function fmtUsd(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return "USD " + Math.round(n).toLocaleString("en-US");
}

export function fmtPct(pct: number | null | undefined): string {
  if (pct === null || pct === undefined || Number.isNaN(pct)) return "—";
  return pct.toFixed(2) + "%";
}

export function shortHash(h: string | null | undefined): string {
  if (!h) return "—";
  if (h.length <= 14) return h;
  return `${h.slice(0, 8)}…${h.slice(-4)}`;
}

/** "20260905_021824" -> "2026-09-05 02:18" */
export function fmtStamp(s: string | null | undefined): string {
  if (!s) return "—";
  const m = /^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})/.exec(s);
  if (!m) return s;
  return `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}`;
}

export function fmtSeconds(sec: number): string {
  return `${sec.toFixed(1)}s`;
}

/** Unix seconds -> local "YYYY-MM-DD HH:mm:ss" */
export function fmtUnix(ts: number | null | undefined): string {
  if (!ts) return "—";
  const d = new Date(ts * 1000);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
