"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import BrandLogo from "@/components/BrandLogo";
import Reveal from "@/components/Reveal";
import SiteFooter from "@/components/SiteFooter";
import { chainStatus, listRuns } from "@/lib/api";
import { fmtStamp, shortHash } from "@/lib/format";
import { useLang, useT, type DictKey } from "@/lib/i18n";
import { pickShowcaseRuns, wrapIndex } from "@/lib/showcase";
import type { ChainStatus, RunSummary } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* static content                                                      */
/* ------------------------------------------------------------------ */

const HERO_LINES = ["FORESURE", "未然", "AI."];

type RoleKey = "pm" | "uw" | "ac";
const ROLE_TEXT: Record<RoleKey, string> = { pm: "text-role-pm", uw: "text-role-uw", ac: "text-role-ac" };

type Agent = {
  key: RoleKey;
  role: DictKey;
  desc: DictKey;
  /** Two facts per role: [zh label, zh value, en label, en value]. */
  params: [string, string, string, string][];
};

const AGENTS: Agent[] = [
  {
    key: "pm",
    role: "intro.pmRole",
    desc: "intro.pmDesc",
    params: [
      ["核心偏向", "商業覆蓋最大化", "Strategic bias", "Max coverage"],
      ["博弈制衡", "抗衡核保過度保守", "Dialectic target", "Challenge over-caution"],
    ],
  },
  {
    key: "uw",
    role: "intro.uwRole",
    desc: "intro.uwDesc",
    params: [
      ["核心偏向", "零道德風險防禦", "Strategic bias", "Anti-moral hazard"],
      ["敞口限額", "單一事件巨災封頂", "Exposure cap", "Per-peril capped"],
    ],
  },
  {
    key: "ac",
    role: "intro.actuaryRole",
    desc: "intro.actuaryDesc",
    params: [
      ["損失分佈", "泊松過程與極端值", "Loss model", "Poisson & EVT"],
      ["定價加成", "1.15x – 1.25x", "Markup", "1.15x – 1.25x"],
    ],
  },
];

type Advantage = { code: [string, string]; title: DictKey; desc: DictKey; icon: ReactNode };
const ADVANTAGES: Advantage[] = [
  {
    code: ["LIVE MARKET", "SENSING"],
    title: "intro.tech1Title",
    desc: "intro.tech1Desc",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l3-8 4 16 3-8h4" />
      </svg>
    ),
  },
  {
    code: ["ANTI-HALLUCINATION", "DEBATE"],
    title: "intro.tech2Title",
    desc: "intro.tech2Desc",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5M21 12a8 8 0 01-11.6 7.1L4 20l1.1-4.2A8 8 0 1121 12z" />
      </svg>
    ),
  },
  {
    code: ["PARAMETRIC", "SMART TRIGGER"],
    title: "intro.tech3Title",
    desc: "intro.tech3Desc",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
      </svg>
    ),
  },
  {
    code: ["ETHEREUM", "IMMUTABLE AUDIT"],
    title: "intro.tech4Title",
    desc: "intro.tech4Desc",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 11-7 4-7-4 7-11zm0 15l7-4-7 9-7-9 7 4z" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/* small building blocks                                               */
/* ------------------------------------------------------------------ */

function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1400px] px-5 ${className}`}>{children}</div>;
}

/** Ghost English label behind a centered section title, like an editorial magazine spread. */
function SectionHead({ ghost, title, lead }: { ghost: string; title: string; lead?: string }) {
  return (
    <Reveal className="relative flex flex-col items-center text-center">
      <div className="ghost" aria-hidden>
        {ghost}
      </div>
      <h2 className="-mt-9 text-3xl font-semibold tracking-tight text-text sm:-mt-12 sm:text-4xl md:text-[40px] md:leading-tight">
        {title}
      </h2>
      {lead ? <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted md:text-base">{lead}</p> : null}
    </Reveal>
  );
}

function HeroType() {
  let offset = 0;
  return (
    <h1 className="hero-type relative z-10 text-text" aria-label="ForeSure 未然 AI">
      {HERO_LINES.map((line, li) => (
        <span key={li} className={`block ${li === 1 ? "text-primary" : ""}`} aria-hidden>
          {[...line].map((ch, ci) => {
            const style = { ["--i" as string]: offset++ } as CSSProperties;
            return (
              <span key={ci} className="hero-letter" style={style}>
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

/** One agent: big role-coloured number, role name, one line, two facts as plain text rows. */
function AgentCard({ agent, index, lang, t, delay }: { agent: Agent; index: number; lang: "zh" | "en"; t: (k: DictKey) => string; delay: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <article className="glass flex h-full flex-col p-8 md:p-10">
        <div className={`font-mono text-5xl font-bold tracking-tight md:text-6xl ${ROLE_TEXT[agent.key]}`}>{String(index + 1).padStart(2, "0")}</div>
        <h3 className="mt-12 text-2xl font-semibold leading-snug text-text md:mt-16">{t(agent.role)}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t(agent.desc)}</p>
        <dl className="mt-10 border-t border-border">
          {agent.params.map(([zl, zv, el, ev]) => (
            <div key={el} className="flex items-baseline justify-between gap-4 border-b border-border py-3 text-sm">
              <dt className="shrink-0 text-muted">{lang === "zh" ? zl : el}</dt>
              <dd className="text-right font-medium text-text">{lang === "zh" ? zv : ev}</dd>
            </div>
          ))}
        </dl>
      </article>
    </Reveal>
  );
}

/** 01 / 04 carousel of the four architectural advantages: big English code left-aligned, local title, description. */
function AdvantageSlider({ lang, t }: { lang: "zh" | "en"; t: (k: DictKey) => string }) {
  const [i, setI] = useState(0);
  const n = ADVANTAGES.length;
  const adv = ADVANTAGES[i];
  const go = (d: number) => setI((cur) => wrapIndex(cur + d, n));
  const pad = (v: number) => String(v).padStart(2, "0");
  return (
    <div className="mt-14 grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
      <div key={`v${i}`} className="slide-in glass relative flex aspect-[5/4] items-center justify-center overflow-hidden lg:aspect-[4/5]">
        <div className="blob left-[-20%] top-[-20%] h-[70%] w-[70%] bg-primary/30" aria-hidden />
        <div className="blob bottom-[-25%] right-[-20%] h-[70%] w-[70%] bg-role-pm/15" aria-hidden />
        <span className="absolute left-6 top-5 font-mono text-sm text-muted">{pad(i + 1)}</span>
        <div className="relative h-32 w-32 text-primary md:h-44 md:w-44">{adv.icon}</div>
      </div>
      <div key={`t${i}`} className="slide-in">
        <div className="text-[clamp(2.25rem,5vw,4.5rem)] font-bold uppercase leading-[0.95] tracking-tight text-primary">
          {adv.code[0]}
          <br />
          {adv.code[1]}
        </div>
        <h3 className="mt-6 text-2xl font-semibold text-text md:text-3xl">{t(adv.title)}</h3>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">{t(adv.desc)}</p>
        <div className="mt-10 flex items-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text transition-colors hover:border-primary hover:text-primary"
            aria-label={lang === "zh" ? "上一項" : "Previous"}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-mono text-sm text-muted">
            <span className="text-text">{pad(i + 1)}</span> / {pad(n)}
          </span>
          <button
            type="button"
            onClick={() => go(1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text transition-colors hover:border-primary hover:text-primary"
            aria-label={lang === "zh" ? "下一項" : "Next"}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function DecisionRow({ run, lang, delay }: { run: RunSummary; lang: "zh" | "en"; delay: number }) {
  const anchored = !!run.tx_hash && !run.chain_is_mock;
  return (
    <Reveal delay={delay}>
      <article className="grid gap-5 border-b border-border py-8 md:grid-cols-[minmax(200px,300px)_1fr] md:gap-10">
        <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary-soft via-surface to-surface-2">
          <BrandLogo variant="mark" decorative className="h-16 w-auto opacity-80" />
          <span className={`absolute left-3 top-3 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${anchored ? "bg-primary text-white" : "bg-surface-2 text-muted"}`}>
            {anchored ? "ON-CHAIN" : "PENDING"}
          </span>
        </div>
        <div className="min-w-0">
          <div className="mono text-sm text-primary-ink md:text-right">{fmtStamp(run.timestamp)}</div>
          <h3 className="mt-2 text-xl font-semibold leading-snug text-text md:text-2xl">{run.product_name}</h3>
          {run.news_title ? (
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {lang === "zh" ? "觸發新聞：" : "Triggering news: "}
              {run.news_title}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            {anchored ? (
              <span className="pill bg-primary-soft text-primary-ink">
                ✓ Sepolia <span className="mono">{shortHash(run.tx_hash)}</span>
              </span>
            ) : null}
            {run.grounding_status === "pass" ? (
              <span className="pill bg-surface-2 text-muted">{lang === "zh" ? "幻覺檢測通過" : "Grounding passed"}</span>
            ) : null}
            <Link href={`/overview?id=${encodeURIComponent(run.decision_id)}`} className="ml-auto font-semibold text-text underline-offset-4 hover:underline">
              {lang === "zh" ? "查看決策 →" : "View decision →"}
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

export default function IntroPage() {
  const t = useT();
  const { lang } = useLang();
  const [chain, setChain] = useState<ChainStatus | null | undefined>(undefined);
  const [runs, setRuns] = useState<RunSummary[] | undefined>(undefined);

  useEffect(() => {
    chainStatus()
      .then(setChain)
      .catch(() => setChain(null));
    listRuns(20)
      .then(setRuns)
      .catch(() => setRuns([]));
  }, []);

  const zh = lang === "zh";
  const showcase = runs ? pickShowcaseRuns(runs, 3) : undefined;
  const contract = chain?.contract_address ?? null;

  const metrics: [string, string, string][] = [
    ["PARAM // LATENCY", "~85s", zh ? "時事爬取、三方辯論與精算定價" : "News, debate & pricing"],
    ["PARAM // CONSENSUS", "3 Agents", zh ? "PM × 核保 × 精算 跨角色博弈" : "PM, Underwriter & Actuary"],
    ["PARAM // ATTESTATION", "100%", zh ? "SHA-256 決策指紋寫入 Sepolia" : "SHA-256 proof on Sepolia"],
    ["PARAM // REPOSITORY", "20+", zh ? "涵蓋氣候、科技、供應鏈新興風險" : "Climate, cyber & supply chains"],
  ];

  return (
    <>
      <AppHeader chain={chain} />
      <main className="relative flex-1 overflow-hidden">
        {/* soft brand-coloured glows the glass cards can blur */}
        <div className="blob -left-40 top-[-10rem] h-[36rem] w-[36rem] bg-primary/25" aria-hidden />
        <div className="blob -right-48 top-[38%] h-[32rem] w-[32rem] bg-role-pm/10" aria-hidden />
        <div className="blob bottom-[8%] left-[30%] h-[30rem] w-[30rem] bg-primary/15" aria-hidden />

        {/* ---------------- hero ---------------- */}
        <section className="relative">
          <Container className="relative flex min-h-[calc(100vh-66px)] flex-col pb-14 pt-10 md:pt-14">
            <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 md:left-[66%] md:top-[-1rem] lg:left-[64%]" aria-hidden>
              <div className="relative">
                <div className="absolute inset-[-20%] rounded-full bg-primary/25 blur-3xl" />
                <BrandLogo
                  variant="mark"
                  decorative
                  className="float-slow relative h-[24vh] w-auto max-h-[420px] opacity-95 drop-shadow-[0_30px_60px_rgba(38,168,98,0.35)] md:h-[38vh]"
                />
              </div>
            </div>

            <div className="relative z-10 mt-[22vh] md:mt-0">
              <HeroType />
            </div>

            <div className="relative z-10 mt-10 flex flex-col gap-10 md:mt-auto md:flex-row md:items-end md:justify-between">
              <div className="flex max-w-xl flex-col gap-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/generator" className="btn btn-primary px-6 py-3 text-sm font-bold shadow-md">
                    ▶ {t("intro.ctaLive")}
                  </Link>
                  <Link href="/history" className="btn btn-secondary px-5 py-3 text-sm font-bold">
                    {t("intro.ctaHistory")}
                  </Link>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-muted">
                  <span>Network: Ethereum Sepolia</span>
                  <span>Multi-Agent Consensus (3 Roles)</span>
                  <span>SHA-256 Decision Proof</span>
                  <span>Parametric Oracles (CWA / NOAA)</span>
                </div>
              </div>
              <Reveal delay={200} className="flex flex-col gap-1 text-left text-lg font-medium leading-snug text-text md:items-end md:pr-20 md:text-right md:text-2xl">
                <span>{zh ? "新興風險參數型定價" : "Parametric pricing for emerging risks"}</span>
                <span>{zh ? "三方 AI 代理人對抗辯論" : "Tri-agent adversarial debate"}</span>
                <span>{zh ? "以太坊 Sepolia 鏈上存證" : "Ethereum Sepolia attestation"}</span>
              </Reveal>
            </div>

            <div className="pointer-events-none absolute bottom-3 left-1/2 hidden -translate-x-1/2 animate-bounce font-mono text-[10px] tracking-widest text-muted md:block" aria-hidden>
              SCROLL ↓
            </div>
          </Container>
        </section>

        {/* ---------------- agents (bento) ---------------- */}
        <section className="py-20 md:py-28">
          <Container>
            <SectionHead ghost="AGENTS" title={t("intro.agentsTitle")} lead={t("intro.agentsSubtitle")} />
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {AGENTS.map((agent, i) => (
                <AgentCard key={agent.key} agent={agent} index={i} lang={lang} t={t} delay={i * 100} />
              ))}
            </div>
          </Container>
        </section>

        {/* ---------------- advantages (carousel) ---------------- */}
        <section className="py-20 md:py-28">
          <Container>
            <SectionHead
              ghost="ADVANTAGES"
              title={t("intro.techTitle")}
              lead={zh ? "從時事感測到鏈上存證，四個環節各自解決一個傳統流程做不到的事。" : "Four stages, each removing one thing the traditional workflow cannot do."}
            />
            <Reveal delay={100}>
              <AdvantageSlider lang={lang} t={t} />
            </Reveal>
          </Container>
        </section>

        {/* ---------------- paradigm shift (wide image-style cards) ---------------- */}
        <section className="py-20 md:py-28">
          <Container>
            <SectionHead
              ghost="SHIFT"
              title={zh ? "典範轉移：傳統保險瓶頸 vs 未然自主決策" : "Paradigm Shift: Traditional Limits vs ForeSure"}
              lead={zh ? "解決缺乏歷史理賠數據時的定價真空，以參數型合約取代冗長人工理賠" : "Solving the pricing vacuum of zero historical loss data with autonomous parametric insurance"}
            />
            <div className="mt-14 flex flex-col gap-5">
              <Reveal>
                <article className="glass relative overflow-hidden p-8 md:p-10">
                  <div className="blob right-[-10%] top-[-40%] h-[80%] w-[40%] bg-muted/15" aria-hidden />
                  <div className="relative flex items-center gap-3">
                    <span className="pill bg-surface-2 font-mono text-muted">Legacy Model</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">{zh ? "傳統新商品研發痛點" : "Traditional product R&D"}</span>
                  </div>
                  <div className="relative mt-6 grid gap-6 md:grid-cols-3">
                    {[
                      [zh ? "開發週期冗長" : "Long R&D cycle", zh ? "平均需耗費 6 至 12 個月進行市場調研、精算會議與主管機關送審，無法趕上新興風險爆發速度。" : "6 to 12 months of research, actuarial panels and filing, trailing emerging peril events."],
                      [zh ? "歷史數據依賴" : "Historical data dependency", zh ? "傳統精算完全依賴 5-10 年之歷史損失率，面對全球暖化劇變或生成式 AI 斷線等新風險產生定價真空。" : "Requires 5-10 years of loss history, creating a pricing vacuum for unprecedented climate or AI outage risks."],
                      [zh ? "理賠審查爭議" : "Claim disputes & overhead", zh ? "採損害填補原則，需保戶自行收集單據與繁瑣公證程序，耗時數週且極易產生認定歧見。" : "Indemnity claims demand receipts, adjusters and weeks of delay, leading to friction and distrust."],
                    ].map(([h, p]) => (
                      <div key={h}>
                        <h3 className="text-lg font-semibold text-text">{h}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted">{p}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </Reveal>
              <Reveal delay={100}>
                <article className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-primary via-primary to-primary-ink p-8 text-white shadow-lg md:p-10">
                  <div className="blob right-[-10%] top-[-40%] h-[90%] w-[45%] bg-white/25" aria-hidden />
                  <div className="relative flex items-center gap-3">
                    <span className="pill bg-white/20 font-mono text-white">Next-Gen</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-white/85">{zh ? "未然 ForeSure 智能方案" : "ForeSure parametric architecture"}</span>
                  </div>
                  <div className="relative mt-6 grid gap-6 md:grid-cols-3">
                    {[
                      [zh ? "85 秒極速生成" : "85-second synthesis", zh ? "時事新聞感測與既有保險知識庫向量比對，即時捕捉未被滿足之新興保障缺口。" : "Live news telemetry matched against existing product vectors to pinpoint uninsured gaps."],
                      [zh ? "多代理人對抗博弈" : "Tri-agent adversarial debate", zh ? "PM、核保、精算多輪交鋒，以泊松分佈與極端值理論在缺乏經驗數據下建立審慎定價加成。" : "PM, Underwriter and Actuary stress-test proposals with Poisson and extreme-value modeling."],
                      [zh ? "參數型觸發與鏈上存證" : "Parametric trigger & on-chain audit", zh ? "對接公正第三方數據源自動理賠，SHA-256 指紋同步寫入以太坊 Sepolia。" : "Objective oracle data triggers payouts while decision hashes are published to Ethereum Sepolia."],
                    ].map(([h, p]) => (
                      <div key={h}>
                        <h3 className="text-lg font-semibold">{h}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-white/85">{p}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </Reveal>
              <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
                {metrics.map(([label, value, desc], i) => (
                  <Reveal key={label} delay={i * 80}>
                    <div className="glass h-full p-6">
                      <div className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</div>
                      <div className="mt-3 font-mono text-3xl font-bold tabular-nums tracking-tight text-primary md:text-4xl">{value}</div>
                      <p className="mt-2 text-xs leading-relaxed text-muted">{desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* ---------------- latest decisions (news list) ---------------- */}
        <section className="py-20 md:py-28">
          <Container>
            <SectionHead
              ghost="DECISIONS"
              title={zh ? "最新決策與鏈上存證" : "Latest decisions & on-chain audit"}
              lead={zh ? "每一筆提案都附上觸發新聞、三方辯論紀錄與以太坊 Sepolia 交易雜湊。" : "Every proposal ships with its triggering news, the debate transcript and an Ethereum Sepolia transaction hash."}
            />
            <div className="mx-auto mt-10 max-w-5xl border-t border-border">
              {showcase === undefined ? (
                [0, 1, 2].map((k) => (
                  <div key={k} className="grid gap-5 border-b border-border py-8 md:grid-cols-[minmax(200px,300px)_1fr] md:gap-10" aria-hidden>
                    <div className="aspect-[16/10] rounded-2xl bg-surface-2 pulse" />
                    <div className="flex flex-col gap-3">
                      <div className="h-4 w-32 rounded bg-surface-2 pulse" />
                      <div className="h-7 w-3/4 rounded bg-surface-2 pulse" />
                      <div className="h-4 w-full rounded bg-surface-2 pulse" />
                    </div>
                  </div>
                ))
              ) : showcase.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted">{t("queue.empty")}</p>
              ) : (
                showcase.map((r, i) => <DecisionRow key={r.decision_id} run={r} lang={lang} delay={i * 100} />)
              )}
              <div className="flex justify-end py-6">
                <Link href="/history" className="btn btn-secondary text-sm font-semibold">
                  {t("intro.ctaHistory")} →
                </Link>
              </div>
            </div>
          </Container>
        </section>

        {/* ---------------- start (contact-style panel) ---------------- */}
        <section className="py-20 md:py-28">
          <Container>
            <SectionHead
              ghost="START"
              title={zh ? "準備好體驗未然 ForeSure 了嗎？" : "Ready to experience ForeSure?"}
              lead={zh ? "立即啟動 85 秒即時時事新聞感測、多代理人對抗辯論與以太坊 Sepolia 存證流程。" : "Launch 85-second live telemetry, multi-agent adversarial debate, and Ethereum Sepolia attestation."}
            />
            <div className="mt-14 grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
              <Reveal>
                <BrandLogo decorative className="h-14 w-auto" />
                <h3 className="mt-6 text-xl font-semibold text-text">{zh ? "未然 ForeSure · 多代理人保險決策桌" : "ForeSure · multi-agent insurance decision desk"}</h3>
                <ul className="mt-6 flex flex-col gap-4 text-sm">
                  {[
                    [zh ? "網路" : "Network", "Ethereum Sepolia", null],
                    [zh ? "合約" : "Contract", contract ? shortHash(contract) : "—", contract ? `https://sepolia.etherscan.io/address/${contract}` : null],
                    [zh ? "原始碼" : "Source", "github.com/zhuang768/ForeSure", "https://github.com/zhuang768/ForeSure"],
                    [zh ? "賽事" : "Event", t("footer.event"), null],
                  ].map(([k, v, href]) => (
                    <li key={k as string} className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                      <span className="w-16 shrink-0 text-muted">{k}</span>
                      {href ? (
                        <a href={href as string} target="_blank" rel="noreferrer" className="mono font-medium text-primary-ink underline-offset-4 hover:underline">
                          {v}
                        </a>
                      ) : (
                        <span className="font-medium text-text">{v}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={120}>
                <div className="glass p-7 md:p-9">
                  <div className="label">{zh ? "Demo 流程" : "Demo flow"}</div>
                  <ol className="mt-4 flex flex-col gap-3">
                    {[
                      [zh ? "抓取即時新聞並比對既有商品" : "Fetch live news, match existing products", "~10s"],
                      [zh ? "PM、核保、精算三方辯論並定價" : "PM, Underwriter and Actuary debate & price", "~60s"],
                      [zh ? "SHA-256 指紋寫入 Sepolia 並可公開查驗" : "Anchor the SHA-256 fingerprint on Sepolia", "~15s"],
                    ].map(([s, d], i) => (
                      <li key={s} className="flex items-center gap-4 rounded-2xl border border-border bg-surface/70 px-4 py-3.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft font-mono text-xs font-bold text-primary-ink">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 text-sm text-text">{s}</span>
                        <span className="font-mono text-xs text-muted">{d}</span>
                      </li>
                    ))}
                  </ol>
                  <Link
                    href="/generator"
                    className="mt-6 flex w-full items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary-ink py-4 text-base font-bold text-white shadow-md transition-transform hover:scale-[1.01]"
                  >
                    ▶ {t("intro.ctaLive")}
                  </Link>
                  <Link href="/history" className="mt-3 flex w-full items-center justify-center rounded-full border border-border bg-surface py-3.5 text-sm font-semibold text-text transition-colors hover:border-primary">
                    {t("intro.ctaHistory")}
                  </Link>
                </div>
              </Reveal>
            </div>
          </Container>
        </section>
      </main>

      {/* floating actions, like the reference's LINE / phone buttons */}
      <div className="fixed bottom-6 right-5 z-30 flex flex-col gap-3">
        <Link
          href="/generator"
          className="flex h-13 w-13 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105"
          aria-label={t("intro.ctaLive")}
          title={t("intro.ctaLive")}
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </Link>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="glass flex h-13 w-13 items-center justify-center text-text shadow-md transition-transform hover:scale-105"
          aria-label={t("footer.top")}
          title={t("footer.top")}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      <SiteFooter chain={chain} />
    </>
  );
}
