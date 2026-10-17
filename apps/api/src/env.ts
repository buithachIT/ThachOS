import { nodeEnvSchema, parseEnv } from '@portfolio/shared';
import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: nodeEnvSchema,
  PORT: z.coerce.number().int().default(4000),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
});

export type Env = z.infer<typeof envSchema>;

export const validateEnv = (config: Record<string, unknown>): Env =>
  parseEnv(envSchema, config as Record<string, string | undefined>);
