"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang, useT } from "@/lib/i18n";
import { usePrefs } from "@/lib/prefs";
import type { ChainStatus } from "@/lib/types";

export default function AppHeader({ chain }: { chain: ChainStatus | null | undefined }) {
  const t = useT();
  const { lang, setLang } = useLang();
  const { theme, setTheme, present, setPresent } = usePrefs();
  const pathname = usePathname();
  const onGenerator = pathname?.startsWith("/generator");

  // Show connected status for both real sepolia and mock (offline demo) mode
  const chainPill =
    chain === undefined ? null : chain === null ? null : chain.mode === "sepolia" ? (
      <span className="pill bg-primary-soft text-primary-ink">● {t("header.chain.sepolia")}</span>
    ) : (
      <span className="pill bg-primary-soft text-primary-ink">● Sepolia Demo</span>
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
          <button
            type="button"
            className="btn btn-secondary px-2 py-1 text-xs"
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            aria-label="language"
          >
            {lang === "zh" ? "中 / EN" : "EN / 中"}
          </button>
          <button
            type="button"
            className="btn btn-secondary px-2 py-1 text-xs"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="theme"
          >
            {theme === "dark" ? "淺色" : "淺色"}
          </button>
          <button
            type="button"
            className={`btn px-2 py-1 text-xs ${present ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setPresent(!present)}
            aria-pressed={present}
          >
            {t("header.present")}
          </button>
          {onGenerator ? (
            <Link href="/" className="btn btn-secondary">
              {t("header.home")}
            </Link>
          ) : (
            <Link href="/generator" className="btn btn-primary">
              {t("header.run")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
