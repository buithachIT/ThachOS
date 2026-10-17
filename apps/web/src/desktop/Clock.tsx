"use client";

import { useSyncExternalStore } from "react";

const formatter = new Intl.DateTimeFormat("vi-VN", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/** Re-render once per minute, on the minute. */
function subscribe(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  const schedule = () => {
    timer = setTimeout(
      () => {
        onChange();
        schedule();
      },
      60_000 - (Date.now() % 60_000),
    );
  };
  schedule();
  return () => clearTimeout(timer);
}

const getSnapshot = () => formatter.format(new Date());

/** Viewer's local time. Rendered only on the client so server HTML never disagrees with it. */
export function Clock() {
  const now = useSyncExternalStore(subscribe, getSnapshot, () => null);
  return <time className="font-mono text-xs tabular-nums text-ink">{now ?? " "}</time>;
}
