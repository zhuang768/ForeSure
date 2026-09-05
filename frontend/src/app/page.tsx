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
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary-soft px-4 py-1.5 text-xs font-semibold text-primary-ink shadow-xs">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            {t("intro.badge")}
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-text sm:text-5xl md:text-6xl">
            {t("intro.heroTitle")}
          </h1>
          <p className="mt-3 text-lg font-medium text-primary-ink sm:text-xl md:text-2xl">
            {t("intro.heroTagline")}
          </p>

          <p className="mt-6 max-w-4xl text-sm leading-relaxed text-muted sm:text-base md:text-lg">
            {t("intro.heroLead")}
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/generator"
              className="btn btn-primary px-6 py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              ▶ {t("intro.ctaLive")}
            </Link>
            <Link
              href="/history"
              className="btn px-6 py-3 text-sm font-bold bg-primary-soft text-primary-ink border border-primary/60 hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              {t("intro.ctaHistory")}
            </Link>
            <Link
              href="/overview"
              className="btn btn-secondary px-5 py-3 text-sm font-semibold hover:border-primary/50 transition-all"
            >
              {t("intro.ctaOverview")}
            </Link>
          </div>
        </section>

        {/* Real-time System Metrics Strip */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="card flex flex-col items-center justify-center p-5 text-center">
            <span className="label">{lang === "zh" ? "決策生成週期" : "Cycle Time"}</span>
            <div className="mt-2 text-3xl font-extrabold tracking-tight text-primary">~85s</div>
            <p className="mt-1 text-xs text-muted">
              {lang === "zh" ? "時事爬取、三方辯論與精算定價" : "News scraping, debate & pricing"}
            </p>
          </div>

          <div className="card flex flex-col items-center justify-center p-5 text-center">
            <span className="label">{lang === "zh" ? "AI 代理人制衡" : "Agent Triad"}</span>
            <div className="mt-2 text-3xl font-extrabold tracking-tight text-primary">3 Agents</div>
            <p className="mt-1 text-xs text-muted">
              {lang === "zh" ? "PM × 核保 × 精算 跨角色博弈" : "PM, Underwriter & Actuary"}
            </p>
          </div>

          <div className="card flex flex-col items-center justify-center p-5 text-center">
            <span className="label">{lang === "zh" ? "以太坊鏈上存證" : "Sepolia Proof"}</span>
            <div className="mt-2 text-3xl font-extrabold tracking-tight text-primary">100% On-chain</div>
            <p className="mt-1 text-xs text-muted">
              {lang === "zh" ? "SHA-256 智能合約不可篡改存證" : "SHA-256 immutable smart contract"}
            </p>
          </div>

          <div className="card flex flex-col items-center justify-center p-5 text-center">
            <span className="label">{lang === "zh" ? "歷史存證庫儲備" : "Historical Archive"}</span>
            <div className="mt-2 text-3xl font-extrabold tracking-tight text-primary">20+ Records</div>
            <p className="mt-1 text-xs text-muted">
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

        {/* Three AI Agents Architecture */}
        <section className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {t("intro.agentsTitle")}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {t("intro.agentsSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* PM Agent */}
            <div className="card border-t-4 border-t-role-pm p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="pill bg-role-pm-soft text-role-pm font-bold">PM AGENT</span>
                  <span className="text-xs text-muted">Role 01</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-text">{t("intro.pmRole")}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">{t("intro.pmDesc")}</p>
                <div className="mt-4 rounded-md border border-border bg-surface-2 p-3 text-xs">
                  <span className="label block text-[10px] text-muted">
                    {lang === "zh" ? "核心職責" : "Core Deliverables"}
                  </span>
                  <p className="mt-1 text-text">
                    {lang === "zh"
                      ? "敏捷洞察時事、挖掘保障缺口、設計參數型給付結構、界定目標客群"
                      : "Market gap discovery, parametric structure, customer profile, news synthesis"}
                  </p>
                </div>
              </div>
              <div className="mt-4 border-t border-border pt-3 text-[11px] text-muted">
                {lang === "zh" ? "平衡訴求：最大化商業覆蓋度與市場敏銳度" : "Objective: Maximize commercial viability & coverage agility"}
              </div>
            </div>

            {/* Underwriter Agent */}
            <div className="card border-t-4 border-t-role-uw p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="pill bg-role-uw-soft text-role-uw font-bold">UNDERWRITER AGENT</span>
                  <span className="text-xs text-muted">Role 02</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-text">{t("intro.uwRole")}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">{t("intro.uwDesc")}</p>
                <div className="mt-4 rounded-md border border-border bg-surface-2 p-3 text-xs">
                  <span className="label block text-[10px] text-muted">
                    {lang === "zh" ? "核心職責" : "Core Deliverables"}
                  </span>
                  <p className="mt-1 text-text">
                    {lang === "zh"
                      ? "排查逆選擇與道德風險、訂定除外責任清單、限縮單一事件累積巨災敞口"
                      : "Adverse selection audit, moral hazard defense, strict exclusion clauses"}
                  </p>
                </div>
              </div>
              <div className="mt-4 border-t border-border pt-3 text-[11px] text-muted">
                {lang === "zh" ? "平衡訴求：嚴密防範核保風險與系統性損失集中" : "Objective: Eliminate moral hazard & catastrophic exposure"}
              </div>
            </div>

            {/* Actuary Agent */}
            <div className="card border-t-4 border-t-role-ac p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="pill bg-role-ac-soft text-role-ac font-bold">ACTUARY AGENT</span>
                  <span className="text-xs text-muted">Role 03</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-text">{t("intro.actuaryRole")}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">{t("intro.actuaryDesc")}</p>
                <div className="mt-4 rounded-md border border-border bg-surface-2 p-3 text-xs">
                  <span className="label block text-[10px] text-muted">
                    {lang === "zh" ? "核心職責" : "Core Deliverables"}
                  </span>
                  <p className="mt-1 text-text">
                    {lang === "zh"
                      ? "泊松分佈損失率建模、預期損失估算、1.15x-1.25x 加成定價、清償能力邊界校準"
                      : "Poisson frequency modeling, expected loss estimation, 1.15x-1.25x markup calculation"}
                  </p>
                </div>
              </div>
              <div className="mt-4 border-t border-border pt-3 text-[11px] text-muted">
                {lang === "zh" ? "平衡訴求：恪守數學精算審慎性與清償資本充足" : "Objective: Mathematical prudence & regulatory solvency margins"}
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
