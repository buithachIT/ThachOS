import type { ReactNode } from "react";

/**
 * Named boundary around each app's content. X-ray mode (week 7) will turn this into
 * <XrayBoundary> to outline and label the component; for now it only tags the DOM.
 */
export function AppBoundary({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div data-app-boundary={name} className="contents">
      {children}
    </div>
  );
}
