import { z } from "zod";

export const APP_IDS = ["about", "projects", "experience", "contact"] as const;

export const appIdSchema = z.enum(APP_IDS);

export type AppId = z.infer<typeof appIdSchema>;

/** Icon keys; the web app maps each key to an SVG component. */
export type AppIcon = "user" | "folder" | "briefcase" | "mail";

export type AppMeta = {
  id: AppId;
  title: string;
  icon: AppIcon;
  defaultSize: { w: number; h: number };
};

/** Every app on the desktop, in display order. Add new apps (ai-clone, guestbook, ...) here. */
export const APPS: readonly AppMeta[] = [
  { id: "about", title: "About", icon: "user", defaultSize: { w: 640, h: 520 } },
  { id: "projects", title: "Projects", icon: "folder", defaultSize: { w: 840, h: 600 } },
  { id: "experience", title: "Experience", icon: "briefcase", defaultSize: { w: 720, h: 560 } },
  { id: "contact", title: "Contact", icon: "mail", defaultSize: { w: 480, h: 400 } },
];

export function getApp(id: AppId): AppMeta {
  const app = APPS.find((a) => a.id === id);
  if (!app) throw new Error(`Unknown app: ${id}`);
  return app;
}
