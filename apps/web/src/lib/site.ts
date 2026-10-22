import { parseEnv } from "@portfolio/shared";
import { z } from "zod";

const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema.optional());

// Read each variable by its full name so Next can inline NEXT_PUBLIC_* at build time.
const env = parseEnv(
  z.object({
    /** Public URL of the site, e.g. https://thachos.dev. Wins over the Vercel fallback. */
    NEXT_PUBLIC_SITE_URL: optional(z.url()),
    /** Set by Vercel (host only, no scheme). */
    VERCEL_PROJECT_PRODUCTION_URL: optional(z.string().regex(/^[^/:]+(:\d+)?$/)),
  }),
  {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  },
);

/** Absolute site URL (no trailing slash) for canonical links, sitemap and OG images. */
export const SITE_URL = (
  env.NEXT_PUBLIC_SITE_URL ??
  (env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/+$/, "");

export const SITE_NAME = "ThạchOS";
