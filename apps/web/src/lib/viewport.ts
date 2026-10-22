/** Matches Tailwind's `max-md` (below 768px): the phone layout. */
export const PHONE_QUERY = "(width < 48rem)";

export const isPhone = () =>
  typeof window !== "undefined" && window.matchMedia?.(PHONE_QUERY).matches === true;
