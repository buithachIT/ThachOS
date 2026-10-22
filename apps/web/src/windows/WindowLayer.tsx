"use client";

import type { AppId } from "@portfolio/shared";
import { type ReactNode, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { isPhone } from "@/lib/viewport";
import { useWindows, useWindowsApi } from "@/stores/WindowsProvider";
import { Window } from "./Window";

export type AppContents = Partial<Record<AppId, ReactNode>>;

/** Renders open windows over the desktop and keeps the store's viewport in sync with it. */
export function WindowLayer({ apps }: { apps: AppContents }) {
  const ref = useRef<HTMLDivElement>(null);
  const store = useWindowsApi();
  // Strings only: useShallow compares items by identity, so tuples here would loop forever.
  const ids = useWindows(useShallow((s) => s.windows.map((w) => w.id)));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => {
      // Phones show windows full screen and ignore their geometry; clamping to a 390px
      // viewport would shrink every window for when the screen gets wide again.
      if (isPhone()) return;
      store.getState().setViewport({ w: el.clientWidth, h: el.clientHeight });
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, [store]);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 isolate max-md:z-20">
      {ids.map((id) => (
        <Window key={id} id={id} apps={apps} />
      ))}
    </div>
  );
}
