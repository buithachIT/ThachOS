import { createServer } from "node:http";
import { createAdapter } from "@socket.io/redis-adapter";
import {
  type ClientToServerEvents,
  type ServerToClientEvents,
  SocketEvents,
} from "@portfolio/shared";
import { createClient } from "redis";
import { Server } from "socket.io";
import { env } from "./env.js";

const pubClient = createClient({ url: env.REDIS_URL });
const subClient = pubClient.duplicate();
await Promise.all([pubClient.connect(), subClient.connect()]);

const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: env.WEB_ORIGIN },
  adapter: createAdapter(pubClient, subClient),
});

io.on("connection", (socket) => {
  console.log("connected", socket.id);
  socket.on(SocketEvents.Ping, () => socket.emit(SocketEvents.Pong, { at: Date.now() }));
  socket.on("disconnect", () => console.log("disconnected", socket.id));
});

httpServer.listen(env.PORT, () => console.log(`realtime listening on :${env.PORT}`));
