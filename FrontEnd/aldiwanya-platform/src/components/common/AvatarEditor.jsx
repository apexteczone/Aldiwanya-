import { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import usePlatform from "../../hooks/usePlatform";
import api from "../../services/api";
import { errorMessage } from "../../utils/platform";
import AccountAvatar from "./AccountAvatar";
export default function AvatarEditor() {
  const { profile, refresh } = usePlatform(),
    input = useRef(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  async function upload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setNotice("");
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("اختر صورة JPG أو PNG أو WebP حتى 5 ميجابايت.");
      return;
    }
    setBusy(true);
    const body = new FormData();
    body.append("avatar", file);
    try {
      const r = await api.post("/user/me/avatar", body, { quiet: true });
      await refresh();
      setNotice(
        r.data.data.warning || "تم تحديث صورة حسابك وحذف الصورة السابقة.",
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api.delete("/user/me/avatar", { quiet: true });
      await refresh();
      setNotice("تم حذف صورة الحساب.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="avatar-editor" aria-label="صورة الحساب">
      <div className="avatar-editor-body">
        <AccountAvatar user={profile?.user} size={82} />
        <div>
          <h2>صورة الحساب</h2>
          <p>صورة JPG أو PNG أو WebP، حتى 5 ميجابايت.</p>
          <div className="avatar-editor-actions">
            <button
              disabled={busy}
              type="button"
              onClick={() => input.current?.click()}
            >
              <Camera size={17} />
              {busy
                ? "جاري الحفظ…"
                : profile?.user.avatarUrl
                  ? "تغيير الصورة"
                  : "رفع صورة"}
            </button>
            {profile?.user.avatarUrl && (
              <button
                type="button"
                className="avatar-remove"
                disabled={busy}
                onClick={remove}
              >
                <Trash2 size={16} />
                حذف الصورة
              </button>
            )}
          </div>
          <input
            ref={input}
            type="file"
            aria-label="رفع صورة الحساب"
            accept="image/jpeg,image/png,image/webp"
            onChange={upload}
            hidden
            disabled={busy}
          />
        </div>
      </div>
      {notice && (
        <p className="avatar-feedback" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="avatar-feedback error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
