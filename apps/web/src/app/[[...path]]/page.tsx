import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildAppContents } from "@/apps/build-apps";
import { Desktop } from "@/desktop/Desktop";
import { getProjects } from "@/lib/content";
import { pageInfo } from "@/lib/page-info";
import { allPaths, parsePath } from "@/lib/routes";

export async function generateStaticParams() {
  const projects = await getProjects();
  return allPaths(projects.map((p) => p.slug)).map((path) => ({ path }));
}

async function resolve(params: PageProps<"/[[...path]]">["params"]) {
  const { path = [] } = await params;
  const win = parsePath(`/${path.join("/")}`);
  if (win === undefined) notFound();
  const info = await pageInfo(win);
  if (!info) notFound();
  return { win, info };
}

export async function generateMetadata({ params }: PageProps<"/[[...path]]">): Promise<Metadata> {
  const { info } = await resolve(params);
  const image = `/og${info.path === "/" ? "" : info.path}`;
  return {
    // Home already carries the site name; other pages get "<title> · ThạchOS" from the layout.
    title: info.path === "/" ? { absolute: info.title } : info.title,
    description: info.description,
    alternates: { canonical: info.path },
    openGraph: {
      title: info.title,
      description: info.description,
      url: info.path,
      type: "website",
      locale: "vi_VN",
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: info.title,
      description: info.description,
      images: [image],
    },
  };
}

export default async function Page({ params }: PageProps<"/[[...path]]">) {
  const { win } = await resolve(params);
  return <Desktop apps={await buildAppContents()} initial={win ?? undefined} />;
}
