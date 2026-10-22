import type { ReactNode } from "react";

/** A content entry whose MDX body was already rendered on the server. */
export type Rendered<T> = { slug: string; data: T; body: ReactNode };
