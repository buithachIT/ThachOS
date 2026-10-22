import { afterEach, describe, expect, it, vi } from "vitest";

async function siteUrl(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v as string);
  return (await import("./site")).SITE_URL;
}

afterEach(() => vi.unstubAllEnvs());

describe("SITE_URL", () => {
  it("uses NEXT_PUBLIC_SITE_URL without a trailing slash", async () => {
    expect(await siteUrl({ NEXT_PUBLIC_SITE_URL: "https://example.com/" })).toBe(
      "https://example.com",
    );
  });

  it("falls back to the Vercel production domain, then localhost", async () => {
    expect(
      await siteUrl({
        NEXT_PUBLIC_SITE_URL: "",
        VERCEL_PROJECT_PRODUCTION_URL: "thachos.vercel.app",
      }),
    ).toBe("https://thachos.vercel.app");
    expect(await siteUrl({ NEXT_PUBLIC_SITE_URL: "", VERCEL_PROJECT_PRODUCTION_URL: "" })).toBe(
      "http://localhost:3000",
    );
  });

  it("fails fast on an invalid URL", async () => {
    await expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "not a url" })).rejects.toThrow(
      /NEXT_PUBLIC_SITE_URL/,
    );
  });
});
