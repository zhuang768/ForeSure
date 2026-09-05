"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { translate, useLang, useT, type DictKey, type Lang } from "@/lib/i18n";
import { usePrefs } from "@/lib/prefs";
import type { ChainStatus } from "@/lib/types";

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
  const onOverview = pathname?.startsWith("/overview");
  const onHistory = pathname?.startsWith("/history");

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
      <div className="mx-auto flex h-14 max-w-[1800px] items-center justify-between gap-4 px-5">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="text-base font-bold tracking-tight">{t("app.title")}</span>
          <span className="hidden text-xs text-muted md:inline">{t("app.subtitle")}</span>
        </Link>
        <div className="flex items-center gap-2">
          {chainPill}
          {/* The label never changes; the active side is highlighted instead, so the button keeps its width. */}
          <button
            type="button"
            className="btn btn-secondary px-2 py-1 text-xs"
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            aria-label="language"
          >
            <span className={lang === "zh" ? "font-bold" : "text-muted"}>中</span>
            <span className="text-muted">/</span>
            <span className={lang === "en" ? "font-bold" : "text-muted"}>EN</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary px-2 py-1 text-xs"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="theme"
          >
            {theme === "dark" ? (
              <StableLabel k="header.theme.dark" lang={lang} prefix="☾ " />
            ) : (
              <StableLabel k="header.theme.light" lang={lang} prefix="☀ " />
            )}
          </button>
          <Link
            href="/history"
            className={`btn px-2.5 py-1 text-xs ${onHistory ? "btn-primary" : "btn-secondary"}`}
          >
            <StableLabel k="header.history" lang={lang} />
          </Link>
          {onOverview ? (
            <Link href="/" className="btn btn-primary">
              <StableLabel k="header.run" lang={lang} prefix="▶ " />
            </Link>
          ) : (
            <Link href="/overview" className="btn btn-secondary">
              <StableLabel k="header.home" lang={lang} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
