import { ImageResponse } from "next/og";
import { getAllContent, getProjects } from "@/lib/content";
import { pageInfo } from "@/lib/page-info";
import { allPaths, parsePath } from "@/lib/routes";

export async function generateStaticParams() {
  const projects = await getProjects();
  return allPaths(projects.map((p) => p.slug)).map((path) => ({ path }));
}

const C = {
  paper: "#f3efe6",
  grid: "#d9d2c3",
  ink: "#1b1a17",
  muted: "#6b665c",
  accent: "#c2410c",
};

/** 1200×630 share image in the drafting-paper style: page title + description. */
export async function GET(_req: Request, { params }: RouteContext<"/og/[[...path]]">) {
  const { path = [] } = await params;
  const win = parsePath(`/${path.join("/")}`);
  const info = win === undefined ? null : await pageInfo(win);
  if (!info) return new Response("Not found", { status: 404 });
  const { profile } = await getAllContent();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background: C.paper,
        backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
        color: C.ink,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32 }}>
        <div style={{ width: 36, height: 36, border: `3px solid ${C.accent}`, display: "flex" }} />
        ThạchOS
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          padding: 40,
          background: "#fbf9f4",
          border: `2px solid ${C.ink}`,
          boxShadow: `10px 10px 0 ${C.ink}`,
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>{info.title}</div>
        <div style={{ fontSize: 30, color: C.muted, lineHeight: 1.35 }}>{info.description}</div>
      </div>
      <div style={{ display: "flex", fontSize: 26, color: C.accent }}>
        {profile.data.name} · {profile.data.title}
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
