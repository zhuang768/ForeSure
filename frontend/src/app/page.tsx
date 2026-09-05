"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { chainStatus } from "@/lib/api";
import { useLang, useT } from "@/lib/i18n";
import type { ChainStatus } from "@/lib/types";

export default function IntroPage() {
  const t = useT();
  const { lang } = useLang();
  const [chain, setChain] = useState<ChainStatus | null | undefined>(undefined);

  useEffect(() => {
    chainStatus()
      .then(setChain)
      .catch(() => setChain(null));
  }, []);

  return (
    <>
      <AppHeader chain={chain} />
      <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-12 px-5 py-8 md:py-12">
        {/* Hero Section with Telemetry Calibration & Financial Instrument Aesthetic */}
        <section className="relative flex flex-col items-center text-center overflow-hidden rounded-2xl border border-border/80 bg-surface/60 p-8 md:p-14 backdrop-blur-xs shadow-xs">
          {/* Subtle Technical Corner Accents */}
          <div className="absolute top-3 left-4 text-[10px] font-mono text-muted/50 select-none hidden sm:block">
            [SYS_ID: 0x73A_SEPOLIA]
          </div>
          <div className="absolute top-3 right-4 text-[10px] font-mono text-muted/50 select-none hidden sm:block">
            [STATUS: OPERATIONAL_200]
          </div>

          {/* Precision Telemetry Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/50 bg-primary-soft px-4 py-1.5 text-xs font-semibold text-primary-ink shadow-xs transition-all hover:border-primary">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase">
              {lang === "zh" ? "可信 AI 創新專案" : "TRUSTED AI INITIATIVE"}
            </span>
            <span className="text-muted/60">·</span>
            <span>{t("intro.badge")}</span>
          </div>

          {/* Main Title & Tagline */}
          <h1 className="mt-7 max-w-full text-4xl font-extrabold tracking-tight text-text sm:text-6xl md:text-7xl">
            ForeSure未然
          </h1>
          <p className="mt-3 text-lg font-medium text-primary-ink sm:text-xl md:text-2xl tracking-tight">
            {t("intro.heroTagline")}
          </p>

          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted sm:text-base md:text-lg">
            {t("intro.heroLead")}
          </p>

          {/* Real-time Technical Telemetry Strip */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-muted">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Network: Ethereum Sepolia</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-role-pm" />
              <span>Multi-Agent Consensus (3 Roles)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-role-uw" />
              <span>SHA-256 Decision Proof</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-role-ac" />
              <span>Parametric Oracles (CWA / NOAA)</span>
            </span>
          </div>

          {/* Action CTAs with High-Precision Styling */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/generator"
              className="btn btn-primary px-7 py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all ring-1 ring-primary/40 hover:ring-primary inline-flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>{t("intro.ctaLive")}</span>
            </Link>
            <Link
              href="/history"
              className="btn px-6 py-3 text-sm font-bold bg-primary-soft text-primary-ink border border-primary/60 hover:bg-primary hover:text-white transition-all shadow-sm inline-flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t("intro.ctaHistory")}</span>
              <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-mono font-bold">20</span>
            </Link>
          </div>
        </section>

        {/* Real-time System Metrics Strip with Financial Instrument Styling */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="card relative flex flex-col justify-between overflow-hidden border-border/80 p-5 transition-all hover:border-primary/50">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">PARAM // LATENCY</span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            </div>
            <div className="my-3">
              <div className="font-mono text-3xl font-extrabold tabular-nums tracking-tight text-primary">~85s</div>
              <div className="mt-1 text-xs font-semibold text-text">{lang === "zh" ? "決策生成週期" : "Cycle Time"}</div>
            </div>
            <p className="border-t border-border/40 pt-2 text-[11px] leading-relaxed text-muted">
              {lang === "zh" ? "時事爬取、三方辯論與精算定價" : "News scraping, debate & pricing"}
            </p>
          </div>

          <div className="card relative flex flex-col justify-between overflow-hidden border-border/80 p-5 transition-all hover:border-role-pm/50">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">PARAM // CONSENSUS</span>
              <span className="h-1.5 w-1.5 rounded-full bg-role-pm" />
            </div>
            <div className="my-3">
              <div className="font-mono text-3xl font-extrabold tabular-nums tracking-tight text-primary">3 Agents</div>
              <div className="mt-1 text-xs font-semibold text-text">{lang === "zh" ? "AI 代理人制衡" : "Agent Triad"}</div>
            </div>
            <p className="border-t border-border/40 pt-2 text-[11px] leading-relaxed text-muted">
              {lang === "zh" ? "PM × 核保 × 精算 跨角色博弈" : "PM, Underwriter & Actuary"}
            </p>
          </div>

          <div className="card relative flex flex-col justify-between overflow-hidden border-border/80 p-5 transition-all hover:border-role-uw/50">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">PARAM // ATTESTATION</span>
              <span className="h-1.5 w-1.5 rounded-full bg-role-uw" />
            </div>
            <div className="my-3">
              <div className="font-mono text-3xl font-extrabold tabular-nums tracking-tight text-primary">100% On-chain</div>
              <div className="mt-1 text-xs font-semibold text-text">{lang === "zh" ? "以太坊鏈上存證" : "Sepolia Proof"}</div>
            </div>
            <p className="border-t border-border/40 pt-2 text-[11px] leading-relaxed text-muted">
              {lang === "zh" ? "SHA-256 智能合約不可篡改存證" : "SHA-256 immutable smart contract"}
            </p>
          </div>

          <div className="card relative flex flex-col justify-between overflow-hidden border-border/80 p-5 transition-all hover:border-role-ac/50">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">PARAM // REPOSITORY</span>
              <span className="h-1.5 w-1.5 rounded-full bg-role-ac" />
            </div>
            <div className="my-3">
              <div className="font-mono text-3xl font-extrabold tabular-nums tracking-tight text-primary">20+ Records</div>
              <div className="mt-1 text-xs font-semibold text-text">{lang === "zh" ? "歷史存證庫儲備" : "Historical Archive"}</div>
            </div>
            <p className="border-t border-border/40 pt-2 text-[11px] leading-relaxed text-muted">
              {lang === "zh" ? "涵蓋氣候、科技、供應鏈新興風險" : "Climate, cyber, tech supply chains"}
            </p>
          </div>
        </section>

        {/* Problem vs Solution: Paradigm Shift */}
        <section className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {lang === "zh" ? "典範轉移：傳統保險瓶頸 vs 未然自主決策" : "Paradigm Shift: Traditional Limits vs ForeSure"}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {lang === "zh"
                ? "解決缺乏歷史理賠數據時的定價真空，以參數型合約取代冗長人工理賠"
                : "Solving the pricing vacuum of zero historical loss data with autonomous parametric insurance"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Traditional Bottleneck */}
            <div className="card border-border/80 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    {lang === "zh" ? "傳統新商品研發痛點" : "Traditional Product R&D"}
                  </span>
                  <span className="pill bg-surface-2 text-muted font-mono text-xs">Legacy Model</span>
                </div>
                <ul className="mt-4 flex flex-col gap-3 text-xs leading-relaxed text-muted">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-text">·</span>
                    <span>
                      <strong className="text-text">{lang === "zh" ? "開發週期冗長：" : "Long R&D cycle: "}</strong>
                      {lang === "zh"
                        ? "平均需耗費 6 至 12 個月進行市場調研、精算會議與主管機關送審，無法趕上新興風險爆發速度。"
                        : "Takes 6 to 12 months for market research, actuarial panels and filing, trailing emerging peril events."}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-text">·</span>
                    <span>
                      <strong className="text-text">{lang === "zh" ? "歷史數據依賴：" : "Historical data dependency: "}</strong>
                      {lang === "zh"
                        ? "傳統精算完全依賴 5-10 年之歷史損失率，面對全球暖化劇變或生成式 AI 斷線等新風險產生定價真空。"
                        : "Strictly requires 5-10 years of loss history, creating a pricing vacuum for unprecedented climate or AI outage risks."}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-text">·</span>
                    <span>
                      <strong className="text-text">{lang === "zh" ? "理賠審查爭議：" : "Claim disputes & overhead: "}</strong>
                      {lang === "zh"
                        ? "採損害填補原則，需保戶自行收集單據與繁瑣公證程序，耗時數週且極易產生認定歧見。"
                        : "Indemnity claims demand endless receipts, adjusters and weeks of delay, leading to friction and distrust."}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* ForeSure Solution */}
            <div className="card border-primary/50 bg-primary-soft/10 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-primary/30 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-ink">
                    {lang === "zh" ? "未然 ForeSure 智能方案" : "ForeSure Parametric Architecture"}
                  </span>
                  <span className="pill bg-primary-soft text-primary-ink font-mono text-xs">Next-Gen</span>
                </div>
                <ul className="mt-4 flex flex-col gap-3 text-xs leading-relaxed text-text">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-primary">·</span>
                    <span>
                      <strong className="text-primary-ink">{lang === "zh" ? "85 秒極速生成：" : "85-Second Autonomous Synthesis: "}</strong>
                      {lang === "zh"
                        ? "時事新聞感測與既有保險知識庫向量比對，即時捕捉未被滿足之新興保障缺口。"
                        : "Real-time news telemetry matched against existing product vectors to pinpoint uninsured market gaps."}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-primary">·</span>
                    <span>
                      <strong className="text-primary-ink">{lang === "zh" ? "多代理人對抗博弈：" : "Tri-Agent Adversarial Debate: "}</strong>
                      {lang === "zh"
                        ? "PM、核保、精算多輪交鋒，以泊松分佈與極端值理論在缺乏經驗數據下建立審慎定價加成 (Markup)。"
                        : "PM, Underwriter, and Actuary stress-test proposals using Poisson & extreme-value modeling without legacy data."}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-primary">·</span>
                    <span>
                      <strong className="text-primary-ink">{lang === "zh" ? "參數型客觀觸發與鏈上存證：" : "Parametric Trigger & Ethereum Audit: "}</strong>
                      {lang === "zh"
                        ? "對接公正第三方數據源（氣象局、地震監測、雲端健康度 API）自動理賠，SHA-256 指紋同步寫入以太坊 Sepolia。"
                        : "Objective oracle data automatically triggers payouts, while decision hashes are permanently published to Ethereum Sepolia."}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Three AI Agents Architecture with Dialectic Pipeline Ribbon & Instrument Cards */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1 font-mono text-[11px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>TRI-AGENT ADVERSARIAL CONSENSUS ENGINE</span>
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {t("intro.agentsTitle")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              {t("intro.agentsSubtitle")}
            </p>

            {/* Adversarial Consensus Pipeline Ribbon */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-mono shadow-xs backdrop-blur-xs">
              <div className="flex items-center gap-1.5 font-semibold text-role-pm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-role-pm-soft text-[10px] font-bold text-role-pm">
                  01
                </span>
                <span>PM: {lang === "zh" ? "時事感知與保障缺口" : "Peril Discovery"}</span>
              </div>
              <span className="text-muted/40 font-mono">──►</span>
              <div className="flex items-center gap-1.5 font-semibold text-role-uw">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-role-uw-soft text-[10px] font-bold text-role-uw">
                  02
                </span>
                <span>{lang === "zh" ? "核保: 嚴防逆選擇與除外" : "UW: Moral Hazard Defense"}</span>
              </div>
              <span className="text-muted/40 font-mono">──►</span>
              <div className="flex items-center gap-1.5 font-semibold text-role-ac">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-role-ac-soft text-[10px] font-bold text-role-ac">
                  03
                </span>
                <span>{lang === "zh" ? "精算: 數學校準與加成" : "Actuary: Math Calibration"}</span>
              </div>
              <span className="hidden text-muted/30 lg:inline">|</span>
              <span className="hidden font-mono text-[11px] text-muted lg:inline">
                {lang === "zh" ? "三輪辯論反覆博弈收斂" : "3-Round Dialectic Convergence"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* PM Agent Card */}
            <div className="card group relative flex flex-col justify-between overflow-hidden border-border/90 bg-gradient-to-b from-role-pm-soft/20 via-surface to-surface p-6 transition-all duration-200 hover:border-role-pm/60 hover:shadow-md">
              <div className="absolute top-0 left-0 right-0 h-1 bg-role-pm" />
              <div>
                {/* Header & Status */}
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-role-pm-soft text-role-pm">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3M3 12h3m12 0h3m-4.5-4.5L15 9m-6 6l-1.5 1.5" />
                        <circle cx="12" cy="12" r="2" fill="currentColor" />
                      </svg>
                    </span>
                    <div>
                      <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-role-pm">
                        AGENT_01 // OPPORTUNITY_RADAR
                      </div>
                      <h3 className="text-base font-bold text-text">
                        {t("intro.pmRole")}
                      </h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded bg-role-pm-soft px-2 py-0.5 font-mono text-[10px] font-bold text-role-pm">
                    <span className="h-1.5 w-1.5 rounded-full bg-role-pm animate-pulse" />
                    EXPANSION
                  </span>
                </div>

                {/* Adversarial Philosophy Quote */}
                <div className="mt-4 rounded-r-md border-l-2 border-role-pm bg-role-pm-soft/30 px-3 py-2 text-xs italic text-text">
                  {lang === "zh"
                    ? "“若不主動捕捉第一線的新興風險，保險業將失去在科技世代的存在價值。”"
                    : '"If we do not capture emerging perils first, insurance loses its relevance in the tech era."'}
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted">
                  {t("intro.pmDesc")}
                </p>

                {/* Quantitative Metric Matrix */}
                <div className="mt-4 rounded-lg border border-border/80 bg-surface-2/70 p-3 text-xs">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                    {lang === "zh" ? "決策參數矩陣 (PARAMETERS)" : "DECISION MATRIX"}
                  </div>
                  <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded border border-border/50 bg-surface p-2">
                      <div className="font-mono text-[10px] text-muted">{lang === "zh" ? "核心偏向" : "Strategic Bias"}</div>
                      <div className="mt-0.5 font-semibold text-text">{lang === "zh" ? "商業覆蓋最大化" : "Max Coverage"}</div>
                    </div>
                    <div className="rounded border border-border/50 bg-surface p-2">
                      <div className="font-mono text-[10px] text-muted">{lang === "zh" ? "時事感知" : "Telemetry Ingestion"}</div>
                      <div className="mt-0.5 font-semibold text-text">{lang === "zh" ? "RAG 向量比對" : "RAG Vector Match"}</div>
                    </div>
                    <div className="rounded border border-border/50 bg-surface p-2">
                      <div className="font-mono text-[10px] text-muted">{lang === "zh" ? "給付結構" : "Payout Model"}</div>
                      <div className="mt-0.5 font-semibold text-text">{lang === "zh" ? "客觀參數梯級" : "Parametric Steps"}</div>
                    </div>
                    <div className="rounded border border-border/50 bg-surface p-2">
                      <div className="font-mono text-[10px] text-muted">{lang === "zh" ? "博弈制衡" : "Dialectic Target"}</div>
                      <div className="mt-0.5 font-semibold text-text">{lang === "zh" ? "抗衡核保過度保守" : "Challenge Over-caution"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cryptographic Consensus Audit Footer */}
              <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 font-mono text-[10px] text-muted">
                <span>WEIGHT: 33.3%</span>
                <span className="text-role-pm font-bold">RAG_CONFIDENCE: 94.2%</span>
              </div>
            </div>

            {/* Underwriter Agent Card */}
            <div className="card group relative flex flex-col justify-between overflow-hidden border-border/90 bg-gradient-to-b from-role-uw-soft/20 via-surface to-surface p-6 transition-all duration-200 hover:border-role-uw/60 hover:shadow-md">
              <div className="absolute top-0 left-0 right-0 h-1 bg-role-uw" />
              <div>
                {/* Header & Status */}
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-role-uw-soft text-role-uw">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </span>
                    <div>
                      <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-role-uw">
                        AGENT_02 // RISK_AUDIT_SHIELD
                      </div>
                      <h3 className="text-base font-bold text-text">
                        {t("intro.uwRole")}
                      </h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded bg-role-uw-soft px-2 py-0.5 font-mono text-[10px] font-bold text-role-uw">
                    <span className="h-1.5 w-1.5 rounded-full bg-role-uw animate-pulse" />
                    PRUDENCE
                  </span>
                </div>

                {/* Adversarial Philosophy Quote */}
                <div className="mt-4 rounded-r-md border-l-2 border-role-uw bg-role-uw-soft/30 px-3 py-2 text-xs italic text-text">
                  {lang === "zh"
                    ? "“凡是可被人為操弄、誘發道德風險或累積巨災的條款，一律建立嚴格除外。”"
                    : '"Any clause vulnerable to moral hazard, manipulation or catastrophe accumulation is strictly excluded."'}
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted">
                  {t("intro.uwDesc")}
                </p>

                {/* Quantitative Metric Matrix */}
                <div className="mt-4 rounded-lg border border-border/80 bg-surface-2/70 p-3 text-xs">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                    {lang === "zh" ? "風控參數矩陣 (PARAMETERS)" : "RISK MATRIX"}
                  </div>
                  <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded border border-border/50 bg-surface p-2">
                      <div className="font-mono text-[10px] text-muted">{lang === "zh" ? "核心偏向" : "Strategic Bias"}</div>
                      <div className="mt-0.5 font-semibold text-text">{lang === "zh" ? "零道德風險防禦" : "Anti-Moral Hazard"}</div>
                    </div>
                    <div className="rounded border border-border/50 bg-surface p-2">
                      <div className="font-mono text-[10px] text-muted">{lang === "zh" ? "除外規範" : "Exclusion Policy"}</div>
                      <div className="mt-0.5 font-semibold text-text">{lang === "zh" ? "人為故意嚴格剔除" : "Exclude Human Acts"}</div>
                    </div>
                    <div className="rounded border border-border/50 bg-surface p-2">
                      <div className="font-mono text-[10px] text-muted">{lang === "zh" ? "敞口限額" : "Exposure Cap"}</div>
                      <div className="mt-0.5 font-semibold text-text">{lang === "zh" ? "單一事件巨災封頂" : "Per-Peril Capped"}</div>
                    </div>
                    <div className="rounded border border-border/50 bg-surface p-2">
                      <div className="font-mono text-[10px] text-muted">{lang === "zh" ? "博弈制衡" : "Dialectic Target"}</div>
                      <div className="mt-0.5 font-semibold text-text">{lang === "zh" ? "壓縮 PM 寬鬆漏洞" : "Tighten Loose Clauses"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cryptographic Consensus Audit Footer */}
              <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 font-mono text-[10px] text-muted">
                <span>WEIGHT: 33.3%</span>
                <span className="text-role-uw font-bold">MORAL_HAZARD: MITIGATED</span>
              </div>
            </div>

            {/* Actuary Agent Card */}
            <div className="card group relative flex flex-col justify-between overflow-hidden border-border/90 bg-gradient-to-b from-role-ac-soft/20 via-surface to-surface p-6 transition-all duration-200 hover:border-role-ac/60 hover:shadow-md">
              <div className="absolute top-0 left-0 right-0 h-1 bg-role-ac" />
              <div>
                {/* Header & Status */}
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-role-ac-soft text-role-ac">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </span>
                    <div>
                      <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-role-ac">
                        AGENT_03 // STATISTICAL_SOLVENCY
                      </div>
                      <h3 className="text-base font-bold text-text">
                        {t("intro.actuaryRole")}
                      </h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded bg-role-ac-soft px-2 py-0.5 font-mono text-[10px] font-bold text-role-ac">
                    <span className="h-1.5 w-1.5 rounded-full bg-role-ac animate-pulse" />
                    CALIBRATION
                  </span>
                </div>

                {/* Adversarial Philosophy Quote */}
                <div className="mt-4 rounded-r-md border-l-2 border-role-ac bg-role-ac-soft/30 px-3 py-2 text-xs italic text-text">
                  {lang === "zh"
                    ? "“缺乏歷史數據不是藉口，以泊松分佈與 1.25x 加成守護資本清償邊界。”"
                    : '"Lack of historical loss data is no excuse; defend solvency margins with Poisson modeling and 1.25x markup."'}
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted">
                  {t("intro.actuaryDesc")}
                </p>

                {/* Quantitative Metric Matrix */}
                <div className="mt-4 rounded-lg border border-border/80 bg-surface-2/70 p-3 text-xs">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                    {lang === "zh" ? "精算參數矩陣 (PARAMETERS)" : "ACTUARIAL MATRIX"}
                  </div>
                  <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded border border-border/50 bg-surface p-2">
                      <div className="font-mono text-[10px] text-muted">{lang === "zh" ? "核心偏向" : "Strategic Bias"}</div>
                      <div className="mt-0.5 font-semibold text-text">{lang === "zh" ? "清償能力與數學校準" : "Solvency & Math"}</div>
                    </div>
                    <div className="rounded border border-border/50 bg-surface p-2">
                      <div className="font-mono text-[10px] text-muted">{lang === "zh" ? "損失分佈" : "Loss Model"}</div>
                      <div className="mt-0.5 font-semibold text-text">{lang === "zh" ? "泊松過程與極端值" : "Poisson & EVT"}</div>
                    </div>
                    <div className="rounded border border-border/50 bg-surface p-2">
                      <div className="font-mono text-[10px] text-muted">{lang === "zh" ? "定價加成" : "Markup Multiplier"}</div>
                      <div className="mt-0.5 font-semibold text-role-ac font-mono">1.15x – 1.25x</div>
                    </div>
                    <div className="rounded border border-border/50 bg-surface p-2">
                      <div className="font-mono text-[10px] text-muted">{lang === "zh" ? "博弈制衡" : "Dialectic Target"}</div>
                      <div className="mt-0.5 font-semibold text-text">{lang === "zh" ? "拒絕憑空主觀保費" : "Audit Subjectivity"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cryptographic Consensus Audit Footer */}
              <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 font-mono text-[10px] text-muted">
                <span>WEIGHT: 33.4%</span>
                <span className="text-role-ac font-bold">SOLVENCY_MARGIN: 99.5%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Four Architectural Advantages */}
        <section className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {t("intro.techTitle")}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary font-bold text-xs">
                01
              </div>
              <h3 className="mt-3 text-sm font-bold text-text">{t("intro.tech1Title")}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{t("intro.tech1Desc")}</p>
            </div>

            <div className="card p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary font-bold text-xs">
                02
              </div>
              <h3 className="mt-3 text-sm font-bold text-text">{t("intro.tech2Title")}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{t("intro.tech2Desc")}</p>
            </div>

            <div className="card p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary font-bold text-xs">
                03
              </div>
              <h3 className="mt-3 text-sm font-bold text-text">{t("intro.tech3Title")}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{t("intro.tech3Desc")}</p>
            </div>

            <div className="card p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary font-bold text-xs">
                04
              </div>
              <h3 className="mt-3 text-sm font-bold text-text">{t("intro.tech4Title")}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{t("intro.tech4Desc")}</p>
            </div>
          </div>
        </section>

        {/* Presentation Walkthrough: 4-Step Guide */}
        <section className="card p-6 md:p-8">
          <div className="border-b border-border pb-4">
            <h2 className="text-xl font-bold tracking-tight text-text">
              {t("intro.flowTitle")}
            </h2>
            <p className="mt-1 text-xs text-muted">
              {lang === "zh"
                ? "為黑客松現場評審與演示流程設計之完整實機體驗路徑"
                : "A four-step live presentation flow curated for hackathon judges"}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-2 p-4">
              <span className="mono text-xs font-bold text-primary">STEP 01</span>
              <h4 className="text-sm font-bold text-text">{t("intro.flowStep1Title")}</h4>
              <p className="text-xs leading-relaxed text-muted">{t("intro.flowStep1Desc")}</p>
            </div>

            <div className="flex flex-col gap-2 rounded-lg border border-primary/40 bg-primary-soft/30 p-4">
              <span className="mono text-xs font-bold text-primary-ink">STEP 02</span>
              <h4 className="text-sm font-bold text-text">{t("intro.flowStep2Title")}</h4>
              <p className="text-xs leading-relaxed text-muted">{t("intro.flowStep2Desc")}</p>
            </div>

            <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-2 p-4">
              <span className="mono text-xs font-bold text-primary">STEP 03</span>
              <h4 className="text-sm font-bold text-text">{t("intro.flowStep3Title")}</h4>
              <p className="text-xs leading-relaxed text-muted">{t("intro.flowStep3Desc")}</p>
            </div>

            <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-2 p-4">
              <span className="mono text-xs font-bold text-primary">STEP 04</span>
              <h4 className="text-sm font-bold text-text">{t("intro.flowStep4Title")}</h4>
              <p className="text-xs leading-relaxed text-muted">{t("intro.flowStep4Desc")}</p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="card flex flex-col items-center justify-between gap-6 border-primary/40 bg-primary-soft/20 p-8 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-text">
              {lang === "zh" ? "準備好體驗未然 ForeSure 了嗎？" : "Ready to Experience ForeSure?"}
            </h3>
            <p className="mt-1 text-xs text-muted">
              {lang === "zh"
                ? "立即啟動 85 秒即時時事新聞感測、多代理人對抗辯論與以太坊 Sepolia 存證流程。"
                : "Launch 85-second live telemetry, multi-agent adversarial debate, and Ethereum Sepolia attestation."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/generator"
              className="btn btn-primary px-6 py-2.5 text-xs font-bold shadow-sm"
            >
              ▶ {t("intro.ctaLive")}
            </Link>
            <Link
              href="/history"
              className="btn px-6 py-2.5 text-xs font-bold bg-primary-soft text-primary-ink border border-primary/60 hover:bg-primary hover:text-white transition-all shadow-xs"
            >
              {t("intro.ctaHistory")}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
