"use client";

import { getApp } from "@portfolio/shared";
import {
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import { APP_ICONS } from "@/desktop/icons";
import { isPhone } from "@/lib/viewport";
import { clampPosition, MIN_SIZE, type Rect } from "@/stores/window-geometry";
import { useWindows, useWindowsApi, WindowIdContext } from "@/stores/WindowsProvider";
import type { WindowsStore } from "@/stores/windows";
import { AppBoundary } from "./AppBoundary";
import { focusAppIcon, focusWindowElement, windowDomId } from "./focus";
import { historyDepth } from "./UrlSync";
import type { AppContents } from "./WindowLayer";
import { WindowErrorBoundary } from "./WindowErrorBoundary";

type Edge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
const EDGES: { edge: Edge; className: string }[] = [
  { edge: "n", className: "top-0 left-2 right-2 h-1.5 cursor-ns-resize" },
  { edge: "s", className: "bottom-0 left-2 right-2 h-1.5 cursor-ns-resize" },
  { edge: "e", className: "right-0 top-2 bottom-2 w-1.5 cursor-ew-resize" },
  { edge: "w", className: "left-0 top-2 bottom-2 w-1.5 cursor-ew-resize" },
  { edge: "ne", className: "top-0 right-0 size-3 cursor-nesw-resize" },
  { edge: "sw", className: "bottom-0 left-0 size-3 cursor-nesw-resize" },
  { edge: "nw", className: "top-0 left-0 size-3 cursor-nwse-resize" },
  { edge: "se", className: "bottom-0 right-0 size-3 cursor-nwse-resize" },
];

/** Below md the window ignores its geometry and fills the screen, above the system bar. */
const PHONE_WINDOW =
  "max-md:fixed max-md:inset-0 max-md:h-auto! max-md:w-auto! max-md:transform-none! max-md:rounded-none max-md:border-0 max-md:shadow-none";

/** New rect while dragging edge `edge` by (dx, dy); the opposite edge stays put. */
function resizeRect(start: Rect, edge: Edge, dx: number, dy: number): Rect {
  let { x, y, w, h } = start;
  if (edge.includes("e")) w = Math.max(MIN_SIZE.w, start.w + dx);
  if (edge.includes("s")) h = Math.max(MIN_SIZE.h, start.h + dy);
  if (edge.includes("w")) {
    w = Math.max(MIN_SIZE.w, start.w - dx);
    x = start.x + start.w - w;
  }
  if (edge.includes("n")) {
    h = Math.max(MIN_SIZE.h, start.h - dy);
    y = Math.max(0, start.y + start.h - h);
    h = start.y + start.h - y;
  }
  return { x, y, w, h };
}

function applyRect(el: HTMLElement, r: Rect) {
  el.style.transform = `translate(${r.x}px, ${r.y}px)`;
  el.style.width = `${r.w}px`;
  el.style.height = `${r.h}px`;
}

/**
 * Drag and resize write straight to this element's style and only commit to the store on
 * pointerup, so nothing else on the desktop re-renders while a window moves.
 */
function useGesture(store: WindowsStore, id: string, ref: React.RefObject<HTMLElement | null>) {
  return (event: ReactPointerEvent, mode: "move" | Edge) => {
    const el = ref.current;
    const win = store.getState().windows.find((w) => w.id === id);
    // Phones show one full-screen app: nothing to drag or resize.
    if (!el || !win || win.maximized || event.button !== 0 || isPhone()) return;
    event.preventDefault();

    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    const start: Rect = { x: win.x, y: win.y, w: win.w, h: win.h };
    const origin = { x: event.clientX, y: event.clientY };
    let current = start;
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - origin.x;
      const dy = e.clientY - origin.y;
      const { viewport } = store.getState();
      current =
        mode === "move"
          ? { ...start, ...clampPosition({ ...start, x: start.x + dx, y: start.y + dy }, viewport) }
          : resizeRect(start, mode, dx, dy);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => applyRect(el, current));
    };

    const onUp = () => {
      cancelAnimationFrame(frame);
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onUp);
      target.removeEventListener("pointercancel", onUp);
      target.removeEventListener("lostpointercapture", onUp);
      // A click on the title bar without moving changes nothing; don't write.
      if (current !== start) store.getState().setRect(id, current);
    };

    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", onUp);
    target.addEventListener("pointercancel", onUp);
    target.addEventListener("lostpointercapture", onUp);
  };
}

export function Window({ id, apps }: { id: string; apps: AppContents }) {
  const store = useWindowsApi();
  const win = useWindows((s) => s.windows.find((w) => w.id === id));
  const viewport = useWindows((s) => s.viewport);
  // Minimized windows don't count: on phones only the top visible window is shown.
  const isTop = useWindows((s) =>
    s.windows.every((w) => w.id === id || w.minimized || w.z < (win?.z ?? 0)),
  );
  const ref = useRef<HTMLElement>(null);
  const startGesture = useGesture(store, id, ref);

  // Opening a window moves keyboard focus into it.
  useEffect(() => {
    ref.current?.focus();
  }, []);

  if (!win) return null;
  const app = getApp(win.appId);
  const Icon = APP_ICONS[app.icon];
  const titleId = `${windowDomId(id)}-title`;
  const rect = win.maximized ? { x: 0, y: 0, w: viewport.w, h: viewport.h } : win;
  const { close, focus, minimize, toggleMaximize } = store.getState();

  const closeWindow = () => {
    close(id);
    focusAppIcon(win.appId);
  };

  // Phone back button: step back through ThạchOS's own history (so the browser Back button
  // and this one agree); with nothing of ours behind, just close.
  const goBack = () => {
    if (historyDepth() > 0) window.history.back();
    else closeWindow();
  };

  // The minimize button disappears with the window; hand focus to the next window or the icon.
  const minimizeWindow = () => {
    minimize(id);
    const next = store
      .getState()
      .windows.filter((w) => !w.minimized)
      .sort((a, b) => b.z - a.z)[0];
    if (next) focusWindowElement(next.id);
    else focusAppIcon(win.appId);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      closeWindow();
    }
  };

  return (
    <section
      ref={ref}
      id={windowDomId(id)}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      hidden={win.minimized}
      onKeyDown={onKeyDown}
      onPointerDownCapture={() => {
        if (!isTop) focus(id);
      }}
      onFocus={() => {
        if (!isTop) focus(id);
      }}
      style={{
        transform: `translate(${rect.x}px, ${rect.y}px)`,
        width: rect.w,
        height: rect.h,
        zIndex: win.z,
      }}
      className={`pointer-events-auto absolute top-0 left-0 flex-col overflow-hidden ${win.minimized ? "hidden" : "flex"} border border-ink bg-surface outline-none ${
        win.maximized ? "" : "rounded-os"
      } ${isTop ? "shadow-[5px_5px_0_var(--ink)]" : "shadow-os max-md:hidden"} ${PHONE_WINDOW}`}
    >
      <header
        data-window-titlebar
        onPointerDown={(e) => startGesture(e, "move")}
        onDoubleClick={() => toggleMaximize(id)}
        className={`flex h-9 shrink-0 touch-none items-center gap-2 border-b border-ink px-2 select-none max-md:h-12 max-md:touch-auto ${
          isTop ? "bg-paper" : "bg-surface text-ink-muted"
        }`}
      >
        <button
          type="button"
          aria-label="Quay lại"
          onClick={goBack}
          className="-ml-1 grid size-11 shrink-0 place-items-center rounded-os focus-visible:outline-2 focus-visible:outline-accent md:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            aria-hidden="true"
          >
            <path d="m14 6-6 6 6 6" />
          </svg>
        </button>
        <Icon className="size-4 shrink-0" />
        <h2
          id={titleId}
          className="min-w-0 flex-1 truncate font-mono text-xs font-medium max-md:text-sm"
        >
          {app.title}
        </h2>
        <div className="flex items-center gap-2 max-md:hidden">
          <TitleButton label="Thu nhỏ" onClick={minimizeWindow}>
            <path d="M6 12h12" />
          </TitleButton>
          <TitleButton
            label={win.maximized ? "Thu về" : "Phóng to"}
            onClick={() => toggleMaximize(id)}
          >
            {win.maximized ? (
              <path d="M8 8h10v10H8zM6 6v10M6 6h10" />
            ) : (
              <rect x="6" y="6" width="12" height="12" />
            )}
          </TitleButton>
          <TitleButton label="Đóng" onClick={closeWindow}>
            <path d="m7 7 10 10M17 7 7 17" />
          </TitleButton>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">
        <WindowErrorBoundary appTitle={app.title}>
          <WindowIdContext.Provider value={id}>
            <AppBoundary name={win.appId}>{apps[win.appId] ?? null}</AppBoundary>
          </WindowIdContext.Provider>
        </WindowErrorBoundary>
      </div>

      {!win.maximized &&
        EDGES.map(({ edge, className }) => (
          <div
            key={edge}
            aria-hidden="true"
            onPointerDown={(e) => startGesture(e, edge)}
            className={`absolute touch-none max-md:hidden ${className}`}
          />
        ))}
    </section>
  );
}

function TitleButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      className="grid size-6 place-items-center rounded-os hover:bg-ink/10 focus-visible:outline-2 focus-visible:outline-accent"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden="true"
      >
        {children}
      </svg>
    </button>
  );
}
