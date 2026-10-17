"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { useStore } from "zustand";
import {
  browserLayoutStorage,
  createWindowsStore,
  DEFAULT_VIEWPORT,
  type InitialWindow,
  type WindowsState,
  type WindowsStore,
} from "./windows";

const WindowsContext = createContext<WindowsStore | null>(null);
/** Id of the window a component renders in (set by <Window>). */
export const WindowIdContext = createContext<string | null>(null);

/**
 * One store per page render, so the server can render the window a deep link asks for
 * (`/about`) without sharing state between requests.
 */
export function WindowsProvider({
  initial,
  children,
}: {
  initial?: InitialWindow;
  children: ReactNode;
}) {
  const [store] = useState(() =>
    createWindowsStore(browserLayoutStorage, DEFAULT_VIEWPORT, initial),
  );

  // The first render used default geometry so it matches the server HTML; now apply the
  // layout this viewer saved for the initial window.
  useEffect(() => {
    const first = store.getState().windows[0];
    const saved = first && browserLayoutStorage.load()[first.appId];
    if (first && saved) store.getState().setRect(first.id, saved);
  }, [store]);

  return <WindowsContext.Provider value={store}>{children}</WindowsContext.Provider>;
}

export function useWindowsApi(): WindowsStore {
  const store = useContext(WindowsContext);
  if (!store) throw new Error("useWindowsApi must be used inside <WindowsProvider>");
  return store;
}

export function useWindows<T>(selector: (state: WindowsState) => T): T {
  return useStore(useWindowsApi(), selector);
}

const noopSubscribe = () => () => {};

/**
 * Sub-route of the current app window (e.g. the open project), stored in the window so the
 * URL can follow it. Outside a window (unit tests) it falls back to local state.
 */
export function useWindowSubpath(
  initial?: string,
): [string | undefined, (next: string | undefined) => void] {
  const store = useContext(WindowsContext);
  const id = useContext(WindowIdContext);
  const [local, setLocal] = useState(initial);
  const bound = store && id ? { store, id } : null;

  const read = () => bound?.store.getState().windows.find((w) => w.id === bound.id)?.subpath;
  const external = useSyncExternalStore(bound ? bound.store.subscribe : noopSubscribe, read, read);

  if (!bound) return [local, setLocal];
  return [external, (next) => bound.store.getState().setSubpath(bound.id, next)];
}
