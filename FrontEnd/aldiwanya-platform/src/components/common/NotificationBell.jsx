import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useNotifications from "../../hooks/useNotifications";
import { errorMessage } from "../../utils/platform";
import "./account-tools.css";
export default function NotificationBell() {
  const feed = useNotifications(),
    navigate = useNavigate(),
    root = useRef(null),
    trigger = useRef(null);
  const [open, setOpen] = useState(false),
    [actionError, setActionError] = useState("");
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false);
    };
    const escape = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  async function visit(item) {
    try {
      await feed.markRead(item._id);
      setOpen(false);
      setActionError("");
      navigate(item.href);
    } catch (e) {
      setActionError(errorMessage(e));
    }
  }
  return (
    <div className="notification-bell" ref={root} dir="rtl">
      <button
        ref={trigger}
        type="button"
        className="notification-trigger"
        aria-label="الإشعارات"
        aria-expanded={open}
        aria-controls="account-notifications"
        onClick={() => {
          setOpen(!open);
          setActionError("");
          if (!open) void feed.reload();
        }}
      >
        <Bell size={21} />
        {feed.unreadCount > 0 && (
          <span
            className="notification-count"
            aria-label={feed.unreadCount + " إشعارات غير مقروءة"}
          >
            {feed.unreadCount > 99 ? "99+" : feed.unreadCount}
          </span>
        )}
      </button>
      {open && (
        <section
          id="account-notifications"
          className="notification-panel"
          aria-label="قائمة الإشعارات"
        >
          <header>
            <div>
              <h2>الإشعارات</h2>
              <small>
                {feed.connected
                  ? "متصل بالتحديثات المباشرة"
                  : "جاري إعادة الاتصال بالتحديثات"}
              </small>
            </div>
            <button aria-label="إغلاق الإشعارات" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </header>
          {feed.unreadCount > 0 && (
            <button
              className="notification-read-all"
              onClick={async () => {
                try {
                  await feed.markAllRead();
                  setActionError("");
                } catch (e) {
                  setActionError(errorMessage(e));
                }
              }}
            >
              <CheckCheck size={16} />
              تحديد الكل كمقروء
            </button>
          )}
          {(feed.error || actionError) && (
            <p className="notification-error" role="alert">
              {actionError || feed.error}
              <button onClick={() => void feed.reload()}>إعادة المحاولة</button>
            </p>
          )}
          {!feed.items.length && !feed.loading && !feed.error && (
            <p className="notification-empty">لا توجد إشعارات حتى الآن.</p>
          )}
          <ul>
            {feed.items.map((item) => (
              <li key={item._id}>
                <button
                  className={
                    "notification-item " + (!item.readAt ? "unread" : "")
                  }
                  onClick={() => visit(item)}
                >
                  <strong>
                    {item.type === "course_published" ? "مادة جديدة" : item.title}
                    {!item.readAt && <i aria-label="غير مقروء" />}
                  </strong>
                  <span>{item.message}</span>
                  <time dateTime={item.createdAt}>
                    {new Date(item.createdAt).toLocaleString("ar-EG", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                </button>
              </li>
            ))}
          </ul>
          {feed.loading && (
            <p className="notification-empty" role="status">
              جاري تحميل الإشعارات…
            </p>
          )}
          {feed.nextCursor && (
            <button
              className="notification-more"
              disabled={feed.loading}
              onClick={feed.loadMore}
            >
              عرض المزيد
            </button>
          )}
        </section>
      )}
    </div>
  );
}
