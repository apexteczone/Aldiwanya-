import { EventEmitter } from "node:events";
import { Server } from "socket.io";
import { verifyToken } from "../../utils/token/token.js";
import User from "../../DB/models/User.js";
import { validateConfig } from "../../config.js";

const events = new EventEmitter();
export const hasRealtimeServer=()=>events.listenerCount('notifications')>0;
export const accountChanged = (id) => events.emit("account", String(id));
export const notificationsChanged = (id) =>
  events.emit("notifications", String(id));
export const revokeRealtime = (id) => events.emit("revoke", String(id));

export function attachRealtime(server) {
  const { origins } = validateConfig();
  const io = new Server(server, {
    serveClient: false,
    maxHttpBufferSize: 16384,
    cors: { origin: origins, methods: ["GET", "POST"] },
    allowRequest: (req, done) =>
      done(null, !req.headers.origin || origins.includes(req.headers.origin)),
  });
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (typeof token !== "string" || token.length > 4096) throw new Error();
      const decoded = verifyToken({ token });
      const user = await User.findById(decoded.id).select("tokenVersion role");
      if (
        !user ||
        user.tokenVersion !== decoded.tokenVersion ||
        !Number.isFinite(decoded.exp)
      )
        throw new Error();
      socket.data = {
        userId: String(user._id),
        expiresAt: decoded.exp * 1000,
        tokenVersion: user.tokenVersion,
      };
      next();
    } catch {
      next(new Error("UNAUTHORIZED"));
    }
  });
  io.on("connection", (socket) => {
    socket.join("user:" + socket.data.userId);
    // Never accept client-controlled room names or notification content.
    const verify = async () => {
      try {
        const user = await User.findById(socket.data.userId).select(
          "tokenVersion",
        );
        if (
          !user ||
          user.tokenVersion !== socket.data.tokenVersion ||
          Date.now() >= socket.data.expiresAt
        ) {
          socket.emit("session:expired");
          socket.disconnect(true);
        }
      } catch {
        socket.disconnect(true);
      }
    };
    const timer = setInterval(verify, 30000);
    timer.unref();
    const expiration = setTimeout(
      verify,
      Math.min(Math.max(0, socket.data.expiresAt - Date.now()), 2147483647),
    );
    expiration.unref();
    socket.on("disconnect", () => {
      clearInterval(timer);
      clearTimeout(expiration);
    });
  });
  const notify = (id) => io.to("user:" + id).emit("notifications:changed");
  const account = (id) => io.to("user:" + id).emit("account:changed");
  const revoke = (id) => {
    io.to("user:" + id).emit("session:expired");
    io.in("user:" + id).disconnectSockets(true);
  };
  events.on("notifications", notify);
  events.on("account", account);
  events.on("revoke", revoke);
  server.once("close", () => {
    events.off("notifications", notify);
    events.off("account", account);
    events.off("revoke", revoke);
  });
  return io;
}
