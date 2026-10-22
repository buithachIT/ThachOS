/** DOM id of a window, so the taskbar and keyboard handlers can move focus to it. */
export const windowDomId = (id: string) => `window-${id}`;

export function focusWindowElement(id: string) {
  document.getElementById(windowDomId(id))?.focus();
}

/** After closing, give focus back to the desktop icon that opened the app. */
export function focusAppIcon(appId: string) {
  document.querySelector<HTMLElement>(`[data-app-id="${appId}"]`)?.focus();
}
