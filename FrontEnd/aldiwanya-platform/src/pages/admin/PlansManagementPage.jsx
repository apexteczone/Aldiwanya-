import { useEffect, useState } from "react";
import {
  CalendarDays,
  GraduationCap,
  Crown,
  Plus,
  Eye,
  Pencil,
  Power,
  PowerOff,
} from "lucide-react";
import api from "../../services/api";
import {
  ReferenceTable,
  ReferenceMessage,
  ReferenceStatus,
} from "../../components/admin/common/ReferenceUI";
import { date, errorMessage, price as planPrice } from "../../utils/platform";
const empty = {
  title: "",
  amount: "",
  currency: "KWD",
  durationMonths: 1,
  description: "",
  active: true,
};
export default function PlansManagementPage() {
  const [plans, setPlans] = useState([]),
    [form, setForm] = useState(empty),
    [editing, setEditing] = useState(""),
    [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [detail, setDetail] = useState(null);
  async function load() {
    setLoading(true);
    try {
      setPlans((await api.get("/plan/getAllPlans")).data.data);
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    let live = true;
    api
      .get("/plan/getAllPlans")
      .then((r) => {
        if (live) setPlans(r.data.data);
      })
      .catch((e) => {
        if (live) setError(errorMessage(e));
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, []);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  function reset() {
    setForm(empty);
    setEditing("");
  }
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const digits = new Intl.NumberFormat("en", {
        style: "currency",
        currency: form.currency,
      }).resolvedOptions().maximumFractionDigits;
      const data = {
        title: form.title,
        amountMinor: Math.round(Number(form.amount) * 10 ** digits),
        currency: form.currency,
        description: form.description,
        active: form.active,
      };
      if (editing) await api.patch("/plan/" + editing + "/update", data);
      else
        await api.post("/plan/CreatePlan", {
          ...data,
          durationMonths: Number(form.durationMonths),
        });
      reset();
      await load();
      setMessage("تم حفظ خطة الاشتراك.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  function edit(p) {
    const digits = new Intl.NumberFormat("en", {
      style: "currency",
      currency: p.currency,
    }).resolvedOptions().maximumFractionDigits;
    setEditing(p._id);
    setForm({
      title: p.title,
      amount: p.amountMinor / 10 ** digits,
      currency: p.currency,
      durationMonths: p.durationMonths,
      description: p.description || "",
      active: p.active,
    });
    document
      .getElementById("plan-form")
      ?.scrollIntoView({ block: "start", behavior: "smooth" });
  }
  async function toggle(p) {
    if (
      p.active &&
      !window.confirm(
        "إيقاف عرض هذه الخطة للاشتراكات الجديدة؟ ستظل سجلات الاشتراكات السابقة محفوظة.",
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      await api.patch("/plan/" + p._id + (p.active ? "/disable" : "/enable"));
      await load();
      setMessage("تم تحديث حالة الخطة.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <ReferenceMessage
        loading={loading}
        error={error}
        message={message}
        retry={error ? load : undefined}
      />
      <section className="ref-plan-intro">
        <article>
          <div>
            <h2>الاشتراك الترم</h2>
            <p>يتيح للطالب الوصول إلى الكورسات لمدة الترم المحددة في الخطة.</p>
          </div>
          <div className="ref-plan-illustration">
            <GraduationCap />
            <span className="ref-badge purple">ترم</span>
          </div>
        </article>
        <article className="monthly">
          <div>
            <h2>الاشتراك الشهري</h2>
            <p>
              يتيح للطالب الوصول إلى الكورسات لمدة شهر واحد من تاريخ الاشتراك.
            </p>
          </div>
          <div className="ref-plan-illustration">
            <CalendarDays />
            <span className="ref-badge blue">شهري</span>
          </div>
        </article>
      </section>
      <section className="ref-panel" id="plan-form">
        <h2 className="ref-form-heading">
          <span className="ref-square small">
            <Plus />
          </span>
          {editing ? "تعديل خطة الاشتراك" : "إضافة خطة اشتراك جديدة"}
        </h2>
        <form onSubmit={save}>
          <fieldset disabled={loading || busy}>
            <div className="ref-plan-grid">
              <div className="ref-field">
                <span>
                  نوع الاشتراك <em>*</em>
                </span>
                <div className="ref-type">
                  <button
                    type="button"
                    disabled={!!editing}
                    aria-pressed={Number(form.durationMonths) === 1}
                    onClick={() => setForm({ ...form, durationMonths: 1 })}
                  >
                    <CalendarDays size={20} />
                    شهري
                  </button>
                  <button
                    type="button"
                    disabled={!!editing}
                    aria-pressed={Number(form.durationMonths) !== 1}
                    onClick={() => setForm({ ...form, durationMonths: 3 })}
                  >
                    <GraduationCap size={20} />
                    ترم
                  </button>
                </div>
              </div>
              <label className="ref-field">
                <span>
                  اسم الخطة <em>*</em>
                </span>
                <input
                  aria-label="اسم الخطة"
                  name="title"
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.title}
                  onChange={change}
                  placeholder="مثال: الاشتراك الشهري"
                />
              </label>
              <label className="ref-field">
                <span>
                  السعر <em>*</em>
                </span>
                <span className="ref-money">
                  <input
                    aria-label="سعر الخطة"
                    type="number"
                    name="amount"
                    min={form.currency === "KWD" ? 0.001 : 0.01}
                    step={form.currency === "KWD" ? 0.001 : 0.01}
                    required
                    placeholder="أدخل السعر"
                    value={form.amount}
                    onChange={change}
                  />
                  <select
                    aria-label="عملة الخطة"
                    name="currency"
                    value={form.currency}
                    onChange={change}
                  >
                    {[
                      ...new Set(["KWD", "EGP", "SAR", "USD", form.currency]),
                    ].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </span>
              </label>
              <label className="ref-field">
                المدة
                <select
                  aria-label="مدة الخطة"
                  name="durationMonths"
                  disabled={!!editing || Number(form.durationMonths) === 1}
                  value={form.durationMonths}
                  onChange={change}
                >
                  {[1, 3, 6, 12].map((m) => (
                    <option value={m} key={m}>
                      {m === 1
                        ? "شهر واحد"
                        : m === 12
                          ? "12 شهرًا"
                          : `${m} أشهر`}
                    </option>
                  ))}
                </select>
              </label>
              <label className="ref-field wide">
                وصف الخطة
                <textarea
                  name="description"
                  aria-label="وصف الخطة"
                  maxLength={1000}
                  placeholder="اكتب وصف مختصر للخطة..."
                  value={form.description}
                  onChange={change}
                />
              </label>
              <div className="ref-field">
                <span>دعم المشاهدة بدون إنترنت</span>
                <div className="ref-switch-line">
                  <button
                    type="button"
                    role="switch"
                    aria-label="دعم المشاهدة بدون إنترنت"
                    aria-checked={false}
                    disabled
                    className="ref-switch"
                  />
                  <span>غير متاح</span>
                </div>
              </div>
              <label className="ref-field">
                عدد الأجهزة المسموح بها
                <input
                  aria-label="عدد الأجهزة المسموح بها"
                  disabled
                  placeholder="غير مفعّل حاليًا"
                />
              </label>
            </div>
            <div className="ref-actions">
              <button className="ref-button">
                <Crown size={18} />
                {busy
                  ? "جاري الحفظ…"
                  : editing
                    ? "حفظ التعديلات"
                    : "إضافة الخطة"}
              </button>
              <button
                type="button"
                className="ref-button secondary"
                onClick={reset}
              >
                إلغاء
              </button>
            </div>
            <p className="ref-small-note">
              الدفع الإلكتروني غير مفعّل حاليًا. المشاهدة بدون إنترنت وحدّ
              الأجهزة لم يُفعّلا بعد. مدة الخطة الموجودة ثابتة حفاظًا على
              الاشتراكات المرتبطة بها.
            </p>
          </fieldset>
        </form>
      </section>
      <ReferenceTable
        title="قائمة خطط الاشتراكات"
        label="البحث في خطط الاشتراكات..."
        search={search}
        onSearch={setSearch}
      >
        <table>
          <thead>
            <tr>
              {[
                "#",
                "اسم الخطة",
                "النوع",
                "المدة",
                "السعر",
                "عدد الأجهزة",
                "دعم أوفلاين",
                "الحالة",
                "تاريخ الإضافة",
                "العمليات",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plans
              .filter((p) =>
                p.title.toLowerCase().includes(search.toLowerCase()),
              )
              .map((p, i) => (
                <tr key={p._id}>
                  <td>{i + 1}</td>
                  <td>{p.title}</td>
                  <td>
                    <span
                      className={`ref-badge ${p.durationMonths === 1 ? "blue" : "purple"}`}
                    >
                      {p.durationMonths === 1
                        ? "شهري"
                        : p.durationMonths === 12
                          ? "سنوي"
                          : "ترم"}
                    </span>
                  </td>
                  <td>
                    {p.durationMonths === 1
                      ? "شهر واحد"
                      : p.durationMonths + " أشهر"}
                  </td>
                  <td>{planPrice(p)}</td>
                  <td>غير مفعّل</td>
                  <td>
                    <span className="ref-badge gray">غير متاح</span>
                  </td>
                  <td>
                    <ReferenceStatus active={p.active} />
                  </td>
                  <td>{date(p.createdAt)}</td>
                  <td>
                    <div className="ref-row-actions">
                      <button
                        className="ref-icon-button"
                        aria-label={`عرض ${p.title}`}
                        onClick={() => setDetail(p)}
                      >
                        <Eye size={17} />
                      </button>
                      <button
                        disabled={busy}
                        className="ref-icon-button edit"
                        aria-label={`تعديل ${p.title}`}
                        onClick={() => edit(p)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        disabled={busy}
                        className="ref-icon-button danger"
                        aria-label={`${p.active ? "إيقاف" : "تفعيل"} ${p.title}`}
                        onClick={() => toggle(p)}
                      >
                        {p.active ? (
                          <PowerOff size={16} />
                        ) : (
                          <Power size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {!loading &&
              !plans.filter((p) =>
                p.title.toLowerCase().includes(search.toLowerCase()),
              ).length && (
                <tr>
                  <td colSpan={10} className="ref-empty">
                    لا توجد خطط اشتراك لعرضها.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </ReferenceTable>
      {detail && (
        <div className="ref-modal-backdrop">
          <section
            className="ref-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-detail"
          >
            <h2 id="plan-detail">{detail.title}</h2>
            <p>{detail.description || "لا يوجد وصف للخطة."}</p>
            <p>
              {planPrice(detail)} — {detail.durationMonths} شهر
            </p>
            <button
              autoFocus
              className="ref-button"
              onClick={() => setDetail(null)}
            >
              إغلاق
            </button>
          </section>
        </div>
      )}
    </>
  );
}
