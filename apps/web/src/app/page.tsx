import { APPS } from "@portfolio/shared";
import { Desktop } from "@/desktop/Desktop";

// Placeholder content until the real apps land (task 4).
const apps = Object.fromEntries(
  APPS.map((app) => [
    app.id,
    <p key={app.id} className="p-6 font-mono text-sm text-ink-muted">
      {app.title}: nội dung sẽ có ở task 4.
    </p>,
  ]),
);

export default function Home() {
  return <Desktop apps={apps} />;
}
