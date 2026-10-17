"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "./icons";
import { applyTheme, resolveTheme, storeTheme, type Theme } from "./theme";

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => {
    listeners.delete(onChange);
    media.removeEventListener("change", onChange);
  };
}

function setTheme(theme: Theme) {
  storeTheme(theme);
  applyTheme(theme);
  listeners.forEach((l) => l());
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, resolveTheme, () => null);
  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = theme
    ? `Chuyển sang giao diện ${next === "dark" ? "tối" : "sáng"}`
    : "Đổi giao diện sáng tối";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      className="grid size-8 place-items-center rounded-os text-ink hover:bg-ink/10 focus-visible:outline-2 focus-visible:outline-accent"
    >
      {theme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
    </button>
  );
}
