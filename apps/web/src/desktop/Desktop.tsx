import { APPS } from "@portfolio/shared";
import type { InitialWindow } from "@/stores/windows";
import { WindowsProvider } from "@/stores/WindowsProvider";
import { UrlSync } from "@/windows/UrlSync";
import { type AppContents, WindowLayer } from "@/windows/WindowLayer";
import { DesktopIcons } from "./DesktopIcons";
import { SystemBar } from "./SystemBar";

type Props = {
  /** Server-rendered content for each app window, keyed by app id. */
  apps?: AppContents;
  /** Window open on first render (deep links), so its content is in the server HTML. */
  initial?: InitialWindow;
};

export function Desktop({ apps = {}, initial }: Props) {
  return (
    <WindowsProvider initial={initial}>
      <UrlSync />
      <div className="flex h-dvh flex-col">
        <SystemBar />
        <main className="bg-blueprint relative flex flex-1 flex-col overflow-hidden">
          <h1 className="sr-only">ThạchOS – portfolio của Bùi Công Thạch</h1>
          <NoScriptNav />
          <DesktopIcons />
          <TitleBlock />
          <WindowLayer apps={apps} />
        </main>
      </div>
    </WindowsProvider>
  );
}

/** Without JavaScript the desktop can't open windows; plain links to each page still work. */
function NoScriptNav() {
  return (
    <noscript>
      <nav aria-label="Mục" className="relative z-10 m-4 border border-ink bg-surface p-4">
        <p className="mb-2">Trang này cần JavaScript để chạy như một desktop. Bạn vẫn đọc được:</p>
        <ul className="list-[square] pl-5">
          {APPS.map((app) => (
            <li key={app.id}>
              <a href={`/${app.id}`} className="text-accent underline">
                {app.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </noscript>
  );
}

/** Drawing title block in the corner, like an engineering sheet. Decorative. */
function TitleBlock() {
  const rows = [
    ["PROJECT", "ThạchOS"],
    ["DRAWN BY", "Bùi Công Thạch"],
    ["REV", "0.1 · week 1"],
  ];
  return (
    <dl
      aria-hidden="true"
      className="pointer-events-none absolute right-4 bottom-4 hidden grid-cols-[auto_auto] border border-ink bg-surface font-mono text-[11px] leading-tight shadow-os md:grid"
    >
      {rows.map(([label, value], i) => {
        const border = i < rows.length - 1 ? "border-b border-ink" : "";
        return (
          <div key={label} className="contents">
            <dt className={`border-r border-ink px-2 py-1 text-ink-muted ${border}`}>{label}</dt>
            <dd className={`px-2 py-1 ${border}`}>{value}</dd>
          </div>
        );
      })}
    </dl>
  );
}
