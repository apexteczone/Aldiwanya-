import { useEffect, useState } from "react";
import { FileText, Share2, Save, LockKeyhole, ChevronDown } from "lucide-react";
import api from "../../services/api";
import { errorMessage } from "../../utils/platform";
import "./platform-settings.css";

function AdminPasswordSettings() {
  const [values, setValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setMessage("");
    if (values.newPassword !== values.confirmPassword) {
      setMessage("تأكيد كلمة المرور غير مطابق");
      return;
    }
    setBusy(true);
    try {
      await api.patch("/admin/password", values);
      sessionStorage.removeItem("token");
      localStorage.removeItem("token");
      setValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSaved(true);
    } catch (error) {
      setMessage(
        error.response?.data?.error?.message || "تعذر تغيير كلمة المرور",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div dir="rtl" className="space-y-5">
      <h2 className="text-xl font-bold">إعدادات حساب الأدمن</h2>
      {saved ? (
        <div className="space-y-4">
          <p role="status">تم تغيير كلمة المرور وإنهاء الجلسات السابقة.</p>
          <a className="text-blue-600" href="/login">
            تسجيل الدخول بكلمة المرور الجديدة
          </a>
        </div>
      ) : (
        <>
          <p>
            غيّر كلمة مرور حسابك. سيتم تسجيل الخروج من كل الجلسات بعد الحفظ.
          </p>
          <form onSubmit={submit} className="max-w-md space-y-4">
            {[
              ["currentPassword", "كلمة المرور الحالية"],
              ["newPassword", "كلمة المرور الجديدة"],
              ["confirmPassword", "تأكيد كلمة المرور الجديدة"],
            ].map(([name, label]) => (
              <label key={name} className="block space-y-2">
                <span>{label}</span>
                <input
                  type="password"
                  name={name}
                  required
                  minLength={name === "currentPassword" ? 1 : 12}
                  maxLength={name === "currentPassword" ? 256 : 72}
                  autoComplete={
                    name === "currentPassword"
                      ? "current-password"
                      : "new-password"
                  }
                  value={values[name]}
                  onChange={(e) =>
                    setValues({ ...values, [name]: e.target.value })
                  }
                  className="block border rounded-lg p-3 w-full"
                />
              </label>
            ))}
            <p className="text-sm">كلمة المرور الجديدة لا تقل عن 12 حرفًا.</p>
            {message && <p role="alert">{message}</p>}
            <button
              disabled={busy}
              className="bg-blue-600 text-white rounded-lg px-5 py-2"
            >
              {busy ? "جاري الحفظ…" : "تغيير كلمة المرور"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

const initialGeneral = {
  platformName: "",
  shortDescription: "",
  description: "",
  websiteUrl: "",
  contactEmail: "",
  phoneCountryCode: "+20",
  phoneNumber: "",
  address: "",
};
const initialSocial = {
  facebook: "",
  instagram: "",
  youtube: "",
  x: "",
  linkedin: "",
};
const networks = [
  {
    key: "facebook",
    label: "رابط فيسبوك",
    placeholder: "https://facebook.com/yourpage",
  },
  {
    key: "instagram",
    label: "رابط إنستجرام",
    placeholder: "https://instagram.com/yourpage",
  },
  {
    key: "youtube",
    label: "رابط يوتيوب",
    placeholder: "https://youtube.com/@yourchannel",
  },
  { key: "x", label: "رابط إكس", placeholder: "https://x.com/yourpage" },
  {
    key: "linkedin",
    label: "رابط لينكد إن",
    placeholder: "https://linkedin.com/company/yourpage",
  },
];
function SocialIcon({ name }) {
  if (name === "instagram")
    return (
      <svg
        width="25"
        height="25"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  if (name === "youtube")
    return (
      <svg width="25" height="25" viewBox="0 0 24 24">
        <rect x="2" y="5" width="20" height="14" rx="4" fill="white" />
        <path d="M10 9l6 3-6 3z" fill="#f00008" />
      </svg>
    );
  return (
    <span
      style={{
        fontFamily: "Arial, sans-serif",
        fontWeight: 700,
        fontSize: name === "linkedin" ? 22 : name === "facebook" ? 34 : 25,
        lineHeight: 1,
      }}
    >
      {name === "facebook" ? "f" : name === "linkedin" ? "in" : "𝕏"}
    </span>
  );
}
const countries = [
  ["+20", "🇪🇬 مصر"],
  ["+965", "🇰🇼 الكويت"],
  ["+966", "🇸🇦 السعودية"],
  ["+971", "🇦🇪 الإمارات"],
  ["+974", "🇶🇦 قطر"],
  ["+973", "🇧🇭 البحرين"],
  ["+968", "🇴🇲 عمان"],
  ["+962", "🇯🇴 الأردن"],
];

export default function SettingsPage() {
  const [general, setGeneral] = useState(initialGeneral),
    [socialLinks, setSocialLinks] = useState(initialSocial);
  const [revision, setRevision] = useState(0),
    [loading, setLoading] = useState(true),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState("");
  const [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    api
      .get("/admin/settings", { quiet: true })
      .then(({ data }) => {
        if (!active) return;
        setGeneral({
          ...initialGeneral,
          ...data.data.general,
          websiteUrl: (data.data.general.websiteUrl || "").replace(
            /^https:\/\//,
            "",
          ),
        });
        setSocialLinks({ ...initialSocial, ...data.data.socialLinks });
        setRevision(data.data.revision);
        setReady(true);
        setError("");
      })
      .catch((e) => {
        if (active) {
          setError(errorMessage(e));
          setReady(false);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reload]);
  const change = (e) =>
    setGeneral((current) => ({ ...current, [e.target.name]: e.target.value }));
  async function save(event, section) {
    event.preventDefault();
    setBusy(section);
    setError("");
    setNotice("");
    const payload =
      section === "general"
        ? {
            ...general,
            websiteUrl: general.websiteUrl.trim()
              ? "https://" +
                general.websiteUrl.trim().replace(/^https:\/\//i, "")
              : "",
          }
        : socialLinks;
    try {
      const { data } = await api.patch(
        "/admin/settings",
        { revision, [section]: payload },
        { quiet: true },
      );
      setRevision(data.data.revision);
      if (section === "general")
        setGeneral({
          ...data.data.general,
          websiteUrl: data.data.general.websiteUrl.replace(/^https:\/\//, ""),
        });
      else setSocialLinks(data.data.socialLinks);
      setNotice(
        section === "general"
          ? "تم حفظ المعلومات الأساسية."
          : "تم حفظ روابط التواصل الاجتماعي.",
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy("");
    }
  }
  const disabled = loading || !ready || !!busy;
  return (
    <div className="platform-settings" dir="rtl">
      <header className="platform-settings-heading">
        <h1>إعدادات المنصة</h1>
        <p>إدارة الإعدادات العامة للمنصة وتخصيص المحتوى</p>
      </header>
      {loading && (
        <p className="platform-settings-notice" role="status">
          جاري تحميل الإعدادات…
        </p>
      )}
      {error && (
        <div className="platform-settings-notice error" role="alert">
          {error}
          <button
            type="button"
            onClick={() => {
              if (
                !ready ||
                window.confirm(
                  "إعادة التحميل ستستبدل التعديلات غير المحفوظة. هل تريد المتابعة؟",
                )
              ) {
                setLoading(true);
                setNotice("");
                setReload((v) => v + 1);
              }
            }}
          >
            إعادة تحميل البيانات
          </button>
        </div>
      )}
      {notice && (
        <p className="platform-settings-notice success" role="status">
          {notice}
        </p>
      )}
      <section
        className="platform-settings-panel"
        aria-labelledby="general-settings-title"
      >
        <div className="platform-settings-section-heading">
          <FileText aria-hidden="true" />
          <div>
            <h2 id="general-settings-title">المعلومات الأساسية</h2>
            <p>تعديل المعلومات العامة الخاصة بالمنصة</p>
          </div>
        </div>
        <form
          onSubmit={(e) => save(e, "general")}
          aria-label="المعلومات الأساسية"
        >
          <fieldset disabled={disabled}>
            <label className="platform-settings-row">
              <span>اسم المنصة</span>
              <input
                name="platformName"
                value={general.platformName}
                onChange={change}
                required
                minLength={2}
                maxLength={100}
              />
            </label>
            <label className="platform-settings-row">
              <span>الوصف المختصر</span>
              <input
                name="shortDescription"
                value={general.shortDescription}
                onChange={change}
                maxLength={300}
                placeholder="أدخل وصفًا مختصرًا للمنصة"
              />
            </label>
            <label className="platform-settings-row">
              <span>الوصف الكامل</span>
              <textarea
                name="description"
                rows={4}
                value={general.description}
                onChange={change}
                maxLength={3000}
                placeholder="اكتب نبذة عن المنصة"
              />
            </label>
            <label className="platform-settings-row">
              <span>رابط الموقع</span>
              <span className="platform-settings-url" dir="ltr">
                <span aria-hidden="true">https://</span>
                <input
                  name="websiteUrl"
                  aria-label="رابط الموقع"
                  value={general.websiteUrl}
                  onChange={change}
                  maxLength={2040}
                  placeholder="example.com"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </span>
            </label>
            <label className="platform-settings-row">
              <span>البريد الإلكتروني</span>
              <input
                name="contactEmail"
                type="email"
                dir="ltr"
                value={general.contactEmail}
                onChange={change}
                maxLength={254}
                placeholder="أدخل بريد التواصل"
                autoComplete="email"
              />
            </label>
            <div className="platform-settings-row">
              <label htmlFor="settings-phone">رقم الهاتف</label>
              <div className="platform-settings-phone" dir="ltr">
                <select
                  aria-label="رمز الدولة"
                  name="phoneCountryCode"
                  value={general.phoneCountryCode}
                  onChange={change}
                >
                  {countries.map(([code, label]) => (
                    <option key={code} value={code}>
                      {label} {code}
                    </option>
                  ))}
                </select>
                <span aria-hidden="true">{general.phoneCountryCode}</span>
                <input
                  id="settings-phone"
                  name="phoneNumber"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{5,12}"
                  maxLength={12}
                  value={general.phoneNumber}
                  onChange={change}
                  placeholder="رقم الهاتف"
                  autoComplete="tel-national"
                />
              </div>
            </div>
            <label className="platform-settings-row">
              <span>العنوان</span>
              <input
                name="address"
                value={general.address}
                onChange={change}
                maxLength={300}
                placeholder="أدخل عنوان التواصل"
                autoComplete="street-address"
              />
            </label>
            <div className="platform-settings-actions">
              <button type="submit" className="platform-settings-save">
                <Save size={21} />
                {busy === "general" ? "جاري الحفظ…" : "حفظ التغييرات"}
              </button>
            </div>
          </fieldset>
        </form>
      </section>
      <section
        className="platform-settings-panel"
        aria-labelledby="social-settings-title"
      >
        <div className="platform-settings-section-heading">
          <Share2 aria-hidden="true" />
          <div>
            <h2 id="social-settings-title">إعدادات التواصل الاجتماعي</h2>
            <p>روابط حسابات التواصل الاجتماعي الخاصة بالمنصة</p>
          </div>
        </div>
        <form
          onSubmit={(e) => save(e, "socialLinks")}
          aria-label="إعدادات التواصل الاجتماعي"
        >
          <fieldset disabled={disabled}>
            {networks.map(({ key, label, placeholder }) => (
              <label className="platform-settings-row social-row" key={key}>
                <span>{label}</span>
                <span className="platform-settings-social-input" dir="ltr">
                  <span
                    className={"platform-settings-social-icon " + key}
                    aria-hidden="true"
                  >
                    <SocialIcon name={key} />
                  </span>
                  <input
                    type="url"
                    aria-label={label}
                    value={socialLinks[key]}
                    onChange={(e) =>
                      setSocialLinks((current) => ({
                        ...current,
                        [key]: e.target.value,
                      }))
                    }
                    placeholder={placeholder}
                    maxLength={2048}
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                </span>
              </label>
            ))}
            <div className="platform-settings-actions">
              <button type="submit" className="platform-settings-save">
                <Save size={21} />
                {busy === "socialLinks" ? "جاري الحفظ…" : "حفظ روابط التواصل"}
              </button>
            </div>
          </fieldset>
        </form>
      </section>
      <details className="platform-settings-panel platform-account">
        <summary>
          <span>
            <LockKeyhole size={21} />
            أمان حساب الأدمن
          </span>
          <ChevronDown size={18} />
        </summary>
        <AdminPasswordSettings />
      </details>
    </div>
  );
}
