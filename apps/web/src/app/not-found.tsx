import Link from "next/link";

export const metadata = { title: "Không tìm thấy" };

/** ThạchOS-style 404: an error window on the desktop. */
export default function NotFound() {
  return (
    <main className="bg-blueprint grid h-dvh place-items-center p-4">
      <section
        aria-labelledby="nf-title"
        aria-describedby="nf-desc"
        className="w-full max-w-md overflow-hidden rounded-os border border-ink bg-surface shadow-[5px_5px_0_var(--ink)]"
      >
        <header className="flex h-9 items-center border-b border-ink bg-paper px-3">
          <h1 id="nf-title" className="font-mono text-xs font-medium">
            Lỗi · app not found
          </h1>
        </header>
        <div className="space-y-4 p-6">
          <p id="nf-desc" className="font-mono text-sm">
            <span className="text-accent">ERR 404</span> Không có app hay project nào ở địa chỉ này.
          </p>
          <Link
            href="/"
            className="inline-block rounded-os border border-ink px-3 py-1.5 font-mono text-xs shadow-os hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-accent"
          >
            ← Về desktop
          </Link>
        </div>
      </section>
    </main>
  );
}
