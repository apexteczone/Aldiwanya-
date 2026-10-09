import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  LockKeyhole,
  LogIn,
  Mail,
  Phone,
  User,
  UserPlus,
} from "lucide-react";
import api from "../../services/api";
import usePlatform from "../../hooks/usePlatform";
import { errorMessage } from "../../utils/platform";
import {
  AuthNotice,
  Benefits,
  Hero,
  SocialButtons,
} from "../../components/common/PlatformUI";
export default function AccessPage({ register = false }) {
  const { login, profile, loading } = usePlatform(),
    navigate = useNavigate();
  const [params] = useSearchParams();
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    phone: "",
    identifier: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
    rememberMe: true,
  });
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const change = (e) =>
    setValues({
      ...values,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  const next = params.get("next");
  const destination =
    next?.startsWith("/") &&
    !next.startsWith("//") &&
    !/^\/(login|register|auth)(\/|\?|$)/.test(next)
      ? next
      : "/dashboard";
  if (!loading && profile)
    return (
      <Navigate
        to={profile.user.role === "Admin" ? "/admin/dashboard" : destination}
        replace
      />
    );
  async function submit(e) {
    e.preventDefault();
    setError("");
    if (register && values.password !== values.confirmPassword) {
      setError("تأكيد كلمة المرور غير مطابق");
      return;
    }
    setBusy(true);
    try {
      if (register)
        await api.post("/auth/register", {
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          phoneNumber: "+965" + values.phone,
          password: values.password,
          confirmPassword: values.confirmPassword,
          termsAccepted: values.termsAccepted,
        });
      const result = await login({
        identifier: register ? values.email.trim() : values.identifier.trim(),
        password: values.password,
        rememberMe: values.rememberMe,
      });
      navigate(
        result.user.role === "Admin" ? "/admin/dashboard" : destination,
        { replace: true },
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const field = (name, label, placeholder, Icon, type = "text", extra = {}) => (
    <label className="form-field">
      <span>{label}</span>
      <div className="input-wrap">
        <Icon size={18} />
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={values[name]}
          onChange={change}
          required
          {...extra}
        />
      </div>
    </label>
  );
  return (
    <>
      <Hero
        title="مرحبًا بك في الديوانية"
        subtitle="رحلتك نحو التعلم تبدأ من هنا"
        compact
      />
      <section className="auth-section site-container">
        <div
          className={`auth-card ${register ? "register-card" : "login-card"}`}
        >
          <div className="auth-heading">
            {register ? <UserPlus size={42} /> : <LogIn size={46} />}
            <h2>{register ? "إنشاء حساب جديد" : "تسجيل الدخول"}</h2>
            <p>
              {register
                ? "انضم إلى الديوانية واستمتع بتجربة تعليمية مميزة"
                : "مرحبًا بعودتك مجددًا في الديوانية"}
            </p>
          </div>
          <form onSubmit={submit}>
            {register ? (
              <>
                {field(
                  "fullName",
                  "الاسم الكامل",
                  "أدخل اسمك الكامل",
                  User,
                  "text",
                  { minLength: 3, maxLength: 100, autoComplete: "name" },
                )}
                {field(
                  "email",
                  "البريد الإلكتروني",
                  "أدخل بريدك الإلكتروني",
                  Mail,
                  "email",
                  { autoComplete: "email" },
                )}
                <label className="form-field">
                  <span>رقم الجوال</span>
                  <div className="input-wrap phone-input">
                    <Phone size={18} />
                    <input
                      name="phone"
                      aria-label="رقم الجوال"
                      type="tel"
                      inputMode="numeric"
                      placeholder="أدخل رقم الجوال"
                      value={values.phone}
                      onChange={change}
                      required
                      pattern="[569][0-9]{7}"
                      maxLength={8}
                      autoComplete="tel-national"
                    />
                    <span dir="ltr">🇰🇼 +965</span>
                  </div>
                </label>
              </>
            ) : (
              field(
                "identifier",
                "البريد الإلكتروني أو رقم الجوال",
                "أدخل بريدك الإلكتروني أو رقم الجوال",
                Mail,
                "text",
                { autoComplete: "username" },
              )
            )}
            {field(
              "password",
              "كلمة المرور",
              "أدخل كلمة المرور",
              LockKeyhole,
              "password",
              {
                minLength: register ? 12 : 1,
                maxLength: 72,
                autoComplete: register ? "new-password" : "current-password",
              },
            )}
            {register &&
              field(
                "confirmPassword",
                "تأكيد كلمة المرور",
                "أعد إدخال كلمة المرور",
                LockKeyhole,
                "password",
                { minLength: 12, maxLength: 72, autoComplete: "new-password" },
              )}
            {register ? (
              <>
                <small>كلمة المرور لا تقل عن 12 حرفًا.</small>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={values.termsAccepted}
                    onChange={change}
                    required
                  />
                  <span>
                    أوافق على <Link to="/terms">الشروط والأحكام</Link> و
                    <Link to="/privacy">سياسة الخصوصية</Link>
                  </span>
                </label>
              </>
            ) : (
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={values.rememberMe}
                    onChange={change}
                  />
                  تذكرني
                </label>
                <Link to="/forgot-password">نسيت كلمة المرور؟</Link>
              </div>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="site-button full" disabled={busy}>
              {busy
                ? "جاري الإرسال…"
                : register
                  ? "إنشاء حساب"
                  : "تسجيل الدخول"}
              <ArrowLeft size={18} />
            </button>
          </form>
          <SocialButtons />
          {register ? (
            <>
              <AuthNotice />
              <p className="auth-switch">
                عندك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
              </p>
            </>
          ) : (
            <div className="login-bottom">
              <Link className="site-button outline" to="/register">
                <UserPlus size={17} />
                إنشاء حساب جديد
              </Link>
            </div>
          )}
        </div>
      </section>
      <Benefits />
    </>
  );
}
