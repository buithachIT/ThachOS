import { Clock } from "./Clock";
import { LogoMark } from "./icons";
import { Taskbar } from "@/windows/Taskbar";
import { ThemeToggle } from "./ThemeToggle";

export function SystemBar() {
  return (
    <header className="relative z-10 flex h-10 max-md:h-12 shrink-0 items-center gap-4 border-b border-ink bg-surface px-3">
      <div className="flex items-center gap-2 font-mono text-sm font-medium tracking-tight">
        <LogoMark className="size-5 text-accent" />
        <span>ThạchOS</span>
      </div>
      <div className="flex min-w-0 flex-1 justify-center max-md:invisible">
        <Taskbar />
      </div>
      <div className="flex items-center gap-2">
        <Clock />
        <ThemeToggle />
      </div>
    </header>
  );
}
