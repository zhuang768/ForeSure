"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const THEME_KEY = "atlas.theme";
const PRESENT_KEY = "atlas.present";

/** Inline script run before first paint — always forces light theme regardless of localStorage or OS setting. */
export const NO_FLASH_SCRIPT = `(function(){try{document.documentElement.setAttribute("data-theme","light");if(localStorage.getItem("${PRESENT_KEY}")==="1"){document.documentElement.setAttribute("data-present","1")}}catch(e){}})();`;

// Tiny external store: the source of truth is the <html> attribute (set by the inline script
// before hydration), mirrored to localStorage. useSyncExternalStore keeps server and client in sync
// without setState-in-effect.
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readTheme(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "dark" ? "dark" : "light";
}
function readPresent(): boolean {
  return document.documentElement.getAttribute("data-present") === "1";
}

function save(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
}

export function usePrefs() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "light" as Theme);
  const present = useSyncExternalStore(subscribe, readPresent, () => false);

  const setTheme = useCallback((t: Theme) => {
    document.documentElement.setAttribute("data-theme", t);
    save(THEME_KEY, t);
    emit();
  }, []);

  const setPresent = useCallback((p: boolean) => {
    if (p) document.documentElement.setAttribute("data-present", "1");
    else document.documentElement.removeAttribute("data-present");
    save(PRESENT_KEY, p ? "1" : "0");
    emit();
  }, []);

  return { theme, setTheme, present, setPresent };
}
