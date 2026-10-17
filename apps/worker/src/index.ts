import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";
import { env } from "./env.js";

// BullMQ workers need maxRetriesPerRequest: null for blocking commands.
const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

const queue = new Queue("health", { connection });

new Worker("health", async (job) => console.log("job done:", job.name, job.data), { connection });

await queue.add("ping", { at: Date.now() });
console.log("worker ready");
