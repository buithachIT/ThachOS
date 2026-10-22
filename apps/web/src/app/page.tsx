import { buildAppContents } from "@/apps/build-apps";
import { Desktop } from "@/desktop/Desktop";

export default async function Home() {
  return <Desktop apps={await buildAppContents()} />;
}
