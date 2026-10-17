import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { NotificationsContext } from "./notifications-context";
import usePlatform from "../hooks/usePlatform";
import api, { ASSET_BASE_URL } from "../services/api";
import { errorMessage } from "../utils/platform";

export function NotificationsProvider({ children }) {
  const { profile, refresh } = usePlatform(),
    userId = profile?.user?._id;
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");
  const [feed, setFeed] = useState({
      items: [],
      unreadCount: 0,
      nextCursor: null,
    }),
    [connected, setConnected] = useState(false),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  const generation = useRef(0),
    requestNumber = useRef(0);
  const reload = useCallback(async () => {
    if (!userId) return;
    const current = generation.current,
      number = ++requestNumber.current;
    setLoading(true);
    try {
      const r = await api.get("/notifications", { quiet: true });
      if (current === generation.current && number === requestNumber.current) {
        setFeed({ ...r.data.data, owner: userId });
        setError("");
      }
    } catch (e) {
      if (current === generation.current) setError(errorMessage(e));
    } finally {
      if (current === generation.current && number === requestNumber.current)
        setLoading(false);
    }
  }, [userId]);
  useEffect(() => {
    const epoch = ++generation.current;
    if (!userId || !token) return;
    let active = true;
    Promise.resolve().then(() => {
      if (active) void reload();
    });
    const socket = io(ASSET_BASE_URL || window.location.origin, {
      auth: { token },
      transports: ["polling", "websocket"],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });
    socket.on("connect", () => {
      setConnected(true);
      void reload();
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("notifications:changed", () => void reload());
    socket.on("account:changed", () => void refresh().catch(() => {}));
    const expire = () => {
      const currentToken =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      if (currentToken !== token) return;
      sessionStorage.removeItem("token");
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("session-expired"));
    };
    socket.on("session:expired", expire);
    socket.on("connect_error", (e) => {
      setConnected(false);
      if (e.message === "UNAUTHORIZED") expire();
    });
    return () => {
      active = false;
      generation.current = epoch + 1;
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [userId, token, reload, refresh]);
  async function markRead(id) {
    await api.patch("/notifications/" + id + "/read", {}, { quiet: true });
    await reload();
  }
  async function markAllRead() {
    await api.patch("/notifications/read-all", {}, { quiet: true });
    await reload();
  }
  async function loadMore() {
    if (!feed.nextCursor || loading) return;
    const current = generation.current;
    setLoading(true);
    try {
      const r = await api.get("/notifications", {
        params: { before: feed.nextCursor },
        quiet: true,
      });
      if (current === generation.current)
        setFeed((previous) => ({
          ...r.data.data,
          owner: userId,
          items: [
            ...previous.items,
            ...r.data.data.items.filter(
              (item) => !previous.items.some((p) => p._id === item._id),
            ),
          ],
        }));
    } catch (e) {
      if (current === generation.current) setError(errorMessage(e));
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }
  return (
    <NotificationsContext.Provider
      value={{
        ...(userId && feed.owner === userId
          ? feed
          : { items: [], unreadCount: 0, nextCursor: null }),
        connected: !!userId && connected,
        loading,
        error,
        reload,
        markRead,
        markAllRead,
        loadMore,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
