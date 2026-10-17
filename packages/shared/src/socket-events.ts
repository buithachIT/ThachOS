import { z } from "zod";

export const SocketEvents = {
  Ping: "ping",
  Pong: "pong",
} as const;

export const pongPayloadSchema = z.object({ at: z.number() });
export type PongPayload = z.infer<typeof pongPayloadSchema>;

export interface ServerToClientEvents {
  [SocketEvents.Pong]: (payload: PongPayload) => void;
}

export interface ClientToServerEvents {
  [SocketEvents.Ping]: () => void;
}
