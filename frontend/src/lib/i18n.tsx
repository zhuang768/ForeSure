"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Lang = "zh" | "en";

export const DICT = {
  zh: {
    "app.title": "Atlas 保險決策桌",
    "app.subtitle": "多代理人保險商品提案與鏈上存證",
    "header.run": "執行新一輪分析",
    "header.chain.sepolia": "Sepolia 已連線",
    "header.chain.mock": "模擬模式",
    "header.chain.unknown": "後端未連線",
    "header.theme.light": "淺色",
    "header.theme.dark": "深色",
    "header.present": "簡報模式",
    "header.home": "回到總覽",
    "banner.offline": "無法連線後端，請確認已啟動於",
    "banner.retry": "重試",
    "kpi.total": "累計提案",
    "kpi.onchain": "已上鏈",
    "kpi.news": "最近一次抓到新聞",
    "kpi.last": "最近一次執行",
    "queue.title": "提案佇列",
    "queue.empty": "還沒有任何提案，先執行一輪分析。",
    "queue.mock": "模擬",
    "queue.onchain": "已上鏈",
    "tab.summary": "決策摘要",
    "tab.debate": "Agent 辯論",
    "tab.pricing": "定價依據",
    "tab.audit": "證據與稽核",
    "field.product": "商品名稱",
    "field.audience": "目標客群",
    "field.gap": "市場缺口",
    "field.coverage": "保障範圍",
    "field.exclusions": "除外事項",
    "field.matched": "比對到的既有商品",
    "field.news": "觸發新聞",
    "field.model": "模型",
    "field.mockProposal": "此提案由備援規則產生，非 LLM 輸出",
    "field.businessLogic": "商業邏輯",
    "num.probability": "發生機率",
    "num.loss": "單次預期損失",
    "num.premium": "建議保費區間",
    "num.markup": "加成係數",
    "basis.stat": "真實統計",
    "basis.assumption": "假設值",
    "basis.lowSample": "樣本少，僅供參考",
    "basis.probability": "機率依據",
    "basis.method": "計算方式",
    "basis.observed": "觀察區間",
    "basis.loss": "損失假設",
    "basis.premium": "保費計算",
    "num.source": "來源：精算引擎規則（關鍵字分級）",
    "debate.pm": "產品經理",
    "debate.underwriter": "核保人員",
    "debate.actuary": "精算師",
    "debate.waiting": "等待中",
    "debate.working": "審查中…",
    "debate.replay": "重播",
    "debate.stop": "停止",
    "audit.decision": "決策編號",
    "audit.hash": "決策雜湊",
    "audit.tx": "交易",
    "audit.block": "區塊",
    "audit.network": "網路",
    "audit.report": "報告檔案",
    "badge.mock": "模擬模式",
    "badge.pending": "上鏈中…",
    "badge.onchain": "已上鏈 Sepolia",
    "badge.mismatch": "驗證不符",
    "verify.title": "鏈上驗證",
    "verify.run": "驗證",
    "verify.tamper": "竄改測試",
    "verify.tamperHint": "改掉機率再驗證，鏈上雜湊應該不再相符",
    "verify.matched": "與鏈上紀錄相符",
    "verify.notMatched": "與鏈上紀錄不符",
    "verify.local": "本地重算雜湊",
    "verify.stored": "當時存證雜湊",
    "verify.onchainTime": "鏈上時間",
    "verify.submitter": "寫入者",
    "verify.tampered": "被竄改欄位",
    "verify.mockReason": "模擬模式沒有鏈上紀錄可比對",
    "verify.rpc": "前端直查合約",
    "verify.rpcFound": "合約有此紀錄",
    "verify.rpcMissing": "合約查無此紀錄",
    "verify.rpcError": "無法連線 RPC",
    "gen.title": "執行新一輪分析",
    "gen.intro": "抓取即時新聞、比對既有商品、三位代理人辯論、產出提案並上鏈存證。約需 60 到 100 秒。",
    "gen.start": "開始執行",
    "gen.running": "執行中",
    "gen.elapsed": "已耗時",
    "gen.viewFull": "查看完整提案",
    "gen.retry": "重新執行",
    "gen.error": "執行失敗",
    "col.news": "市場觀測",
    "col.debate": "代理人辯論",
    "col.proposal": "提案與存證",
    "news.selected": "已選中",
    "news.count": "則",
    "stage.news_fetched": "抓新聞",
    "stage.news_selected": "選主題",
    "stage.kb_matched": "比對商品",
    "stage.actuarial": "精算初估",
    "stage.pm": "PM 提案",
    "stage.underwriter": "核保審查",
    "stage.actuary": "精算定案",
    "stage.report": "產出報告",
    "stage.chain_pending": "上鏈中",
    "stage.chain_done": "已存證",
    "stage.done": "完成",
  },
  en: {
    "app.title": "Atlas Insurance Decision Desk",
    "app.subtitle": "Multi-agent product proposals with on-chain audit",
    "header.run": "Run new analysis",
    "header.chain.sepolia": "Sepolia connected",
    "header.chain.mock": "Mock mode",
    "header.chain.unknown": "Backend offline",
    "header.theme.light": "Light",
    "header.theme.dark": "Dark",
    "header.present": "Presentation",
    "header.home": "Back to overview",
    "banner.offline": "Cannot reach the backend. Make sure it is running at",
    "banner.retry": "Retry",
    "kpi.total": "Proposals",
    "kpi.onchain": "On-chain",
    "kpi.news": "News in last run",
    "kpi.last": "Last run",
    "queue.title": "Proposal queue",
    "queue.empty": "No proposals yet. Run an analysis first.",
    "queue.mock": "Mock",
    "queue.onchain": "On-chain",
    "tab.summary": "Summary",
    "tab.debate": "Agent debate",
    "tab.pricing": "Pricing basis",
    "tab.audit": "Evidence & audit",
    "field.product": "Product",
    "field.audience": "Target audience",
    "field.gap": "Market gap",
    "field.coverage": "Coverage",
    "field.exclusions": "Exclusions",
    "field.matched": "Matched existing products",
    "field.news": "Triggering news",
    "field.model": "Model",
    "field.mockProposal": "Fallback rule-based proposal, not an LLM output",
    "field.businessLogic": "Business logic",
    "num.probability": "Probability",
    "num.loss": "Expected loss per event",
    "num.premium": "Suggested premium range",
    "num.markup": "Markup multiplier",
    "basis.stat": "Official statistics",
    "basis.assumption": "Assumption",
    "basis.lowSample": "Small sample, indicative only",
    "basis.probability": "Probability basis",
    "basis.method": "Method",
    "basis.observed": "Observation window",
    "basis.loss": "Loss assumption",
    "basis.premium": "Premium method",
    "num.source": "Source: actuarial rule engine (keyword tiers)",
    "debate.pm": "Product manager",
    "debate.underwriter": "Underwriter",
    "debate.actuary": "Actuary",
    "debate.waiting": "Waiting",
    "debate.working": "Reviewing…",
    "debate.replay": "Replay",
    "debate.stop": "Stop",
    "audit.decision": "Decision ID",
    "audit.hash": "Decision hash",
    "audit.tx": "Transaction",
    "audit.block": "Block",
    "audit.network": "Network",
    "audit.report": "Report file",
    "badge.mock": "Mock mode",
    "badge.pending": "Anchoring…",
    "badge.onchain": "On-chain · Sepolia",
    "badge.mismatch": "Verification failed",
    "verify.title": "On-chain verification",
    "verify.run": "Verify",
    "verify.tamper": "Tamper test",
    "verify.tamperHint": "Change the probability and verify again; the on-chain hash should no longer match",
    "verify.matched": "Matches the on-chain record",
    "verify.notMatched": "Does not match the on-chain record",
    "verify.local": "Recomputed hash",
    "verify.stored": "Hash at anchoring time",
    "verify.onchainTime": "On-chain time",
    "verify.submitter": "Submitter",
    "verify.tampered": "Tampered fields",
    "verify.mockReason": "Mock mode has no on-chain record to compare",
    "verify.rpc": "Direct contract read",
    "verify.rpcFound": "Record found in contract",
    "verify.rpcMissing": "No record in contract",
    "verify.rpcError": "RPC unreachable",
    "gen.title": "Run new analysis",
    "gen.intro": "Fetch live news, match existing products, let three agents debate, produce the proposal and anchor it on-chain. About 60 to 100 seconds.",
    "gen.start": "Start",
    "gen.running": "Running",
    "gen.elapsed": "Elapsed",
    "gen.viewFull": "View full proposal",
    "gen.retry": "Run again",
    "gen.error": "Run failed",
    "col.news": "Market watch",
    "col.debate": "Agent debate",
    "col.proposal": "Proposal & audit",
    "news.selected": "Selected",
    "news.count": "items",
    "stage.news_fetched": "Fetch news",
    "stage.news_selected": "Pick topic",
    "stage.kb_matched": "Match products",
    "stage.actuarial": "Actuarial",
    "stage.pm": "PM pitch",
    "stage.underwriter": "Underwriting",
    "stage.actuary": "Actuary",
    "stage.report": "Report",
    "stage.chain_pending": "Anchoring",
    "stage.chain_done": "Anchored",
    "stage.done": "Done",
  },
} as const;

export type DictKey = keyof typeof DICT.zh;

export function translate(lang: Lang, key: DictKey): string {
  const value: string = DICT[lang][key];
  return value && value.length > 0 ? value : DICT.zh[key];
}

const STORAGE_KEY = "atlas.lang";

// External store over localStorage so components never call setState inside an effect and
// server/client snapshots stay consistent during hydration (server always renders zh).
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function readLang(): Lang {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "zh";
  } catch {
    return "zh";
  }
}

export function useLang() {
  const lang = useSyncExternalStore(subscribe, readLang, () => "zh" as Lang);
  const setLang = useCallback((l: Lang) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* storage unavailable */
    }
    document.documentElement.lang = l === "zh" ? "zh-Hant" : "en";
    listeners.forEach((fn) => fn());
  }, []);
  return { lang, setLang };
}

export function useT() {
  const { lang } = useLang();
  return useCallback((key: DictKey) => translate(lang, key), [lang]);
}
