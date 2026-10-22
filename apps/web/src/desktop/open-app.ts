import type { AppId } from "@portfolio/shared";
import { useWindowsApi } from "@/stores/WindowsProvider";
import { focusWindowElement } from "@/windows/focus";

/** Returns a function that opens (or brings back) an app's window and focuses it. */
export function useOpenApp() {
  const store = useWindowsApi();
  return (appId: AppId) => {
    const id = store.getState().open(appId);
    requestAnimationFrame(() => focusWindowElement(id));
  };
}
