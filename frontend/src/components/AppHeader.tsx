"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { translate, useLang, useT, type DictKey, type Lang } from "@/lib/i18n";
import { usePrefs } from "@/lib/prefs";
import type { ChainStatus } from "@/lib/types";
import BrandLogo from "@/components/BrandLogo";

/**
 * A label whose box is as wide as the longer of its two translations, so switching language does not
 * change the button's width and the header controls stay put. The hidden twin is stacked in the same
 * grid cell and is invisible but still takes up space.
 */
function StableLabel({ k, lang, prefix = "" }: { k: DictKey; lang: Lang; prefix?: string }) {
  const other: Lang = lang === "zh" ? "en" : "zh";
  return (
    <span className="grid whitespace-nowrap">
      <span className="[grid-area:1/1]">
        {prefix}
        {translate(lang, k)}
      </span>
      <span className="invisible [grid-area:1/1]" aria-hidden>
        {prefix}
        {translate(other, k)}
      </span>
    </span>
  );
}

export default function AppHeader({ chain }: { chain: ChainStatus | null | undefined }) {
  const t = useT();
  const { lang, setLang } = useLang();
  const { theme, setTheme, present, setPresent } = usePrefs();
  const pathname = usePathname();
  const onHistory = pathname?.startsWith("/history");
  const onGenerator = pathname?.startsWith("/generator");
  const onHome = pathname === "/" || pathname === "";

  // Show connected status for both real sepolia and mock (offline demo) mode
  const chainPill =
    chain === undefined ? null : chain === null ? null : chain.mode === "sepolia" ? (
      <span className="pill bg-primary-soft text-primary-ink">
        <StableLabel k="header.chain.sepolia" lang={lang} prefix="● " />
      </span>
    ) : (
      <span className="pill bg-primary-soft text-primary-ink">● {t("header.chain.sepolia")}</span>
    );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex min-h-18 max-w-[1800px] flex-wrap items-center justify-between gap-x-5 gap-y-3 px-5 py-3">
        <Link href="/" aria-label={t("app.title")} className="flex shrink-0 items-center gap-4 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
          <BrandLogo decorative className="h-12 w-auto" />
          <span className="hidden border-l border-border pl-4 text-xs text-muted xl:inline">{t("app.subtitle")}</span>
        </Link>
        <div className="flex max-w-full flex-wrap items-center gap-2 sm:ml-auto sm:justify-end">
          {chainPill}
          {/* Language segmented toggle: explicit selection */}
          <div className="inline-flex items-center rounded-md border border-border bg-surface-2 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setLang("zh")}
              className={`rounded px-2 py-0.5 text-xs font-semibold transition-all ${
                lang === "zh"
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted hover:text-text"
              }`}
              aria-label="繁體中文"
              title="繁體中文"
            >
              中
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`rounded px-2 py-0.5 text-xs font-semibold transition-all ${
                lang === "en"
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted hover:text-text"
              }`}
              aria-label="English"
              title="English"
            >
              EN
            </button>
          </div>

          {/* Theme segmented toggle: explicit selection (Zero Emojis, pure SVG) */}
          <div className="inline-flex items-center rounded-md border border-border bg-surface-2 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-all ${
                theme === "light"
                  ? "bg-surface text-text shadow-xs font-semibold"
                  : "text-muted hover:text-text"
              }`}
              aria-label={lang === "zh" ? "淺色模式" : "Light mode"}
              title={lang === "zh" ? "淺色模式" : "Light mode"}
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="5" />
                <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              <span>{lang === "zh" ? "淺色" : "Light"}</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-all ${
                theme === "dark"
                  ? "bg-surface text-text shadow-xs font-semibold"
                  : "text-muted hover:text-text"
              }`}
              aria-label={lang === "zh" ? "深色模式" : "Dark mode"}
              title={lang === "zh" ? "深色模式" : "Dark mode"}
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span>{lang === "zh" ? "深色" : "Dark"}</span>
            </button>
          </div>
          {/* Historical archive button with distinct brand color */}
          <Link
            href="/history"
            className={`btn px-3 py-1 text-xs font-semibold transition-all ${
              onHistory
                ? "bg-primary text-white shadow-sm ring-1 ring-primary"
                : "bg-primary-soft text-primary-ink border border-primary/60 hover:bg-primary hover:text-white"
            }`}
          >
            <StableLabel k="header.history" lang={lang} />
          </Link>
          {/* Navigation to intro or generator */}
          {!onHome ? (
            <Link href="/" className="btn btn-secondary px-2.5 py-1 text-xs">
              <StableLabel k="header.intro" lang={lang} />
            </Link>
          ) : null}
          {!onGenerator ? (
            <Link href="/generator" className="btn btn-primary px-3 py-1 text-xs font-semibold">
              <StableLabel k="header.run" lang={lang} prefix="▶ " />
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
