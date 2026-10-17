"use client";

import { type AppId, APPS } from "@portfolio/shared";
import { type KeyboardEvent, useState } from "react";
import { APP_ICONS } from "./icons";
import { useOpenApp } from "./open-app";

type Props = { onOpen?: (appId: AppId) => void };

/** Desktop icons from the app registry. Click selects; double-click or Enter opens. */
export function DesktopIcons({ onOpen: onOpenProp }: Props) {
  const openApp = useOpenApp();
  const onOpen = onOpenProp ?? openApp;
  const [selected, setSelected] = useState<AppId | null>(null);

  const onKeyDown = (event: KeyboardEvent, appId: AppId) => {
    if (event.key !== "Enter") return;
    event.preventDefault(); // keep Enter from also firing a click
    setSelected(appId);
    onOpen(appId);
  };

  return (
    <div
      className="flex-1 p-4"
      onClick={(event) => {
        if (!(event.target as Element).closest("button")) setSelected(null);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setSelected(null);
      }}
    >
      <ul
        aria-label="Ứng dụng"
        className="grid h-full w-fit auto-cols-max grid-flow-col grid-rows-[repeat(auto-fill,6.5rem)] gap-2"
      >
        {APPS.map((app) => {
          const Icon = APP_ICONS[app.icon];
          const isSelected = selected === app.id;
          return (
            <li key={app.id}>
              <button
                type="button"
                data-app-id={app.id}
                onClick={() => setSelected(app.id)}
                onDoubleClick={() => onOpen(app.id)}
                onKeyDown={(event) => onKeyDown(event, app.id)}
                className="group flex w-24 flex-col items-center gap-1.5 rounded-os p-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span
                  className={`grid size-14 place-items-center rounded-os border bg-surface transition-[box-shadow,translate] duration-100 ${
                    isSelected
                      ? "border-accent text-accent shadow-[3px_3px_0_var(--accent)]"
                      : "border-ink text-ink shadow-os group-hover:-translate-y-px"
                  }`}
                >
                  <Icon className="size-8" />
                </span>
                <span
                  className={`rounded-sm px-1.5 py-0.5 font-mono text-xs ${
                    isSelected ? "bg-accent text-accent-ink" : "bg-paper/80 text-ink"
                  }`}
                >
                  {app.title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
