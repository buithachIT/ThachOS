import { nodeEnvSchema, parseEnv } from "@portfolio/shared";
import { z } from "zod";

export const env = parseEnv(
  z.object({
    NODE_ENV: nodeEnvSchema,
    PORT: z.coerce.number().int().default(4001),
    REDIS_URL: z.url(),
    WEB_ORIGIN: z.url().default("http://localhost:3000"),
  }),
  process.env,
);
