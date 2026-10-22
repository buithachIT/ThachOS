import { DesktopIcons } from "./DesktopIcons";
import { type AppContents, WindowLayer } from "@/windows/WindowLayer";
import { SystemBar } from "./SystemBar";

/** `apps`: server-rendered content for each app window, keyed by app id. */
export function Desktop({ apps = {} }: { apps?: AppContents }) {
  return (
    <div className="flex h-dvh flex-col">
      <SystemBar />
      <main className="bg-blueprint relative flex flex-1 flex-col overflow-hidden">
        <h1 className="sr-only">ThạchOS – portfolio của Bùi Công Thạch</h1>
        <DesktopIcons />
        <TitleBlock />
        <WindowLayer apps={apps} />
      </main>
    </div>
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
