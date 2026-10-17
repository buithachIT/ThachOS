import { nodeEnvSchema, parseEnv } from "@portfolio/shared";
import { z } from "zod";

export const env = parseEnv(
  z.object({
    NODE_ENV: nodeEnvSchema,
    REDIS_URL: z.url(),
  }),
  process.env,
);
