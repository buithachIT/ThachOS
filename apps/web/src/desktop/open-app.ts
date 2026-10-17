import type { AppId } from "@portfolio/shared";
import { windowsStore } from "@/stores/windows";
import { focusWindowElement } from "@/windows/focus";

/** Open (or bring back) an app's window and move keyboard focus into it. */
export function openApp(appId: AppId): void {
  const id = windowsStore.getState().open(appId);
  requestAnimationFrame(() => focusWindowElement(id));
}
