import { useState } from "react";
import { Link } from "react-router-dom";
import usePlatform from "../../hooks/usePlatform";
import api from "../../services/api";
import { errorMessage } from "../../utils/platform";
import { Hero } from "../../components/common/PlatformUI";
export default function AccountPage() {
  const { profile, refresh } = usePlatform(),
    [values, setValues] = useState({
      fullName: profile.user.fullName,
      email: profile.user.email,
      phoneNumber: profile.user.phoneNumber,
    }),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await api.patch("/user/me", values);
      await refresh();
      setMessage("تم حفظ بيانات حسابك.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Hero title="إعدادات حسابك" subtitle="حدّث بياناتك الشخصية" compact />
      <section className="site-container section">
        <form className="site-panel account-form" onSubmit={submit}>
          <h2>بيانات الحساب</h2>
          {[
            ["fullName", "الاسم الكامل", "text"],
            ["email", "البريد الإلكتروني", "email"],
            ["phoneNumber", "رقم الجوال", "tel"],
          ].map(([name, label, type]) => (
            <label className="form-field" key={name}>
              <span>{label}</span>
              <input
                type={type}
                value={values[name]}
                onChange={(e) =>
                  setValues({ ...values, [name]: e.target.value })
                }
                required
                minLength={name === "fullName" ? 3 : undefined}
                pattern={
                  name === "phoneNumber" ? "\\+965[569][0-9]{7}" : undefined
                }
              />
            </label>
          ))}
          <small>رقم الجوال الكويتي يبدأ بـ +965.</small>
          {message && (
            <p role="status" className="form-success">
              {message}
            </p>
          )}
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <button disabled={busy} className="site-button">
            {busy ? "جاري الحفظ…" : "حفظ التغييرات"}
          </button>
          <Link to="/forgot-password" className="quick-link">
            استعادة كلمة المرور عبر البريد الإلكتروني
          </Link>
        </form>
      </section>
    </>
  );
}
