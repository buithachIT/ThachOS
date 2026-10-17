import { z } from "zod";

/** Parse env vars with a Zod schema; throws at startup instead of failing silently later. */
export function parseEnv<T extends z.ZodType>(
  schema: T,
  source: Record<string, string | undefined>,
): z.infer<T> {
  const result = schema.safeParse(source);
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const nodeEnvSchema = z.enum(["development", "test", "production"]).default("development");
