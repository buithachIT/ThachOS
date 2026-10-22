/** Small shared pieces for app windows. */

const chip = "rounded-sm border border-ink/30 px-1.5 py-0.5 font-mono text-[11px]";

/** Tech chips as a list. Inside a button use `StackChips` instead (no lists allowed there). */
export function StackList({ stack, label = "Công nghệ" }: { stack: string[]; label?: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-1">
      {stack.map((s) => (
        <li key={s} className={chip}>
          {s}
        </li>
      ))}
    </ul>
  );
}

/**
 * Phrasing-only chips for use inside a <button>. Extra items collapse into "+N"; the full list
 * is in a visually hidden span with `id`, so the button can point `aria-describedby` at it.
 */
export function StackChips({ stack, max, id }: { stack: string[]; max: number; id: string }) {
  const shown = stack.slice(0, max);
  const hidden = stack.length - shown.length;
  return (
    <span className="flex flex-wrap gap-1">
      <span id={id} className="sr-only">
        Công nghệ: {stack.join(", ")}
      </span>
      {shown.map((s) => (
        <span key={s} aria-hidden="true" className={chip}>
          {s}
        </span>
      ))}
      {hidden > 0 && (
        <span aria-hidden="true" className={`${chip} text-ink-muted`}>
          +{hidden}
        </span>
      )}
    </span>
  );
}

/** Drawing-style placeholder where an image will go: same box, no layout shift. A span so it can sit in a button. */
export function DrawingPlaceholder({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`relative grid place-items-center overflow-hidden border border-dashed border-ink/40 bg-paper ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(to top right, transparent calc(50% - 0.5px), color-mix(in srgb, var(--ink) 18%, transparent) 50%, transparent calc(50% + 0.5px)), linear-gradient(to top left, transparent calc(50% - 0.5px), color-mix(in srgb, var(--ink) 18%, transparent) 50%, transparent calc(50% + 0.5px))",
      }}
    >
      <span className="bg-paper px-1.5 font-mono text-[11px] text-ink-muted">{label}</span>
    </span>
  );
}

export const linkClass =
  "text-accent underline decoration-1 underline-offset-2 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-accent";
