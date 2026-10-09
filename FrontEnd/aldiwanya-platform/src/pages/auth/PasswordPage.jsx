import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Headphones,
  Info,
  LockKeyhole,
  Mail,
  Send,
  ShieldCheck,
} from "lucide-react";
import api from "../../services/api";
import { errorMessage } from "../../utils/platform";
import { Hero } from "../../components/common/PlatformUI";
export default function PasswordPage({ reset = false }) {
  const [params] = useSearchParams(),
    [values, setValues] = useState({
      email: "",
      newPassword: "",
      confirmPassword: "",
    }),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [done, setDone] = useState(false);
  const title = reset ? "تعيين كلمة مرور جديدة" : "استعادة كلمة المرور";
  async function submit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (reset && values.newPassword !== values.confirmPassword) {
      setError("تأكيد كلمة المرور غير مطابق");
      return;
    }
    setBusy(true);
    try {
      const r = await api.post(
        reset ? "/auth/reset-password" : "/auth/forgot-password",
        reset
          ? {
              token: params.get("token"),
              newPassword: values.newPassword,
              confirmPassword: values.confirmPassword,
            }
          : { email: values.email },
      );
      setMessage(
        r.data.message || "إذا كان البريد مسجلًا فستصلك رسالة الاستعادة.",
      );
      setDone(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Hero
        title={title}
        subtitle="لا تقلق .. نساعدك في استعادة وصولك إلى حسابك"
        compact
      >
        <p className="hero-detail">
          <ShieldCheck size={21} />
          أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور
        </p>
      </Hero>
      <section className="site-container password-grid section">
        <div className="site-panel password-form">
          <LockKeyhole className="large-icon" />
          <h2>{title}</h2>
          <p>حافظ على أمان حسابك باستخدام كلمة مرور خاصة بك.</p>
          {!done && (
            <form onSubmit={submit}>
              {(reset
                ? [
                    ["newPassword", "كلمة المرور الجديدة"],
                    ["confirmPassword", "تأكيد كلمة المرور"],
                  ]
                : [["email", "البريد الإلكتروني"]]
              ).map(([name, label]) => (
                <label className="form-field" key={name}>
                  <span>{label}</span>
                  <div className="input-wrap">
                    {reset ? <LockKeyhole size={18} /> : <Mail size={18} />}
                    <input
                      type={reset ? "password" : "email"}
                      value={values[name]}
                      onChange={(e) =>
                        setValues({ ...values, [name]: e.target.value })
                      }
                      placeholder={label}
                      required
                      minLength={reset ? 12 : undefined}
                      maxLength={reset ? 72 : undefined}
                      autoComplete={reset ? "new-password" : "email"}
                    />
                  </div>
                </label>
              ))}
              {reset && !params.get("token") && (
                <p role="alert">
                  رابط الاستعادة غير مكتمل. اطلب رابطًا جديدًا.
                </p>
              )}
              <button
                className="site-button full"
                disabled={busy || (reset && !params.get("token"))}
              >
                {busy
                  ? "جاري الإرسال…"
                  : reset
                    ? "حفظ كلمة المرور"
                    : "إرسال رابط الاستعادة"}
                <Send size={18} />
              </button>
            </form>
          )}
          {message && (
            <p className="form-success" role="status">
              {message}
            </p>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="divider">أو</div>
          <Link className="site-button light full" to="/login">
            العودة إلى تسجيل الدخول
            <ArrowRight size={18} />
          </Link>
          <div className="soft-panel">
            <h3>
              <Info size={18} />
              ماذا تفعل إذا لم تصلك الرسالة؟
            </h3>
            <p>تأكد من صحة البريد الإلكتروني.</p>
            <p>تحقق من مجلد الرسائل غير المرغوب فيها (Spam).</p>
            <p>قد يستغرق وصول الرسالة بضع دقائق.</p>
          </div>
        </div>
        <aside className="password-aside">
          <div className="mail-illustration">
            <img src="/account-recovery.png" alt="" />
          </div>
          <h2>استعد حسابك بسهولة</h2>
          <p>
            أدخل بريدك الإلكتروني المرتبط بحسابك، وسنرسل لك رابطًا آمنًا لإعادة
            تعيين كلمة المرور.
          </p>
          <div>
            <ShieldCheck />
            <h3>رابط آمن ومؤقت</h3>
            <p>لحماية حسابك</p>
          </div>
          <div>
            <Headphones />
            <h3>تحتاج إلى مساعدة؟</h3>
            <Link to="/contact">مركز المساعدة</Link>
          </div>
        </aside>
      </section>
    </>
  );
}
