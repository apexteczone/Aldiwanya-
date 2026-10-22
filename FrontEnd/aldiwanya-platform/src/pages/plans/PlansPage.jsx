import usePlatform from "../../hooks/usePlatform";
import { paymentMethods, checkout } from "../../services/paymentService";
import { safeNext } from "../../utils/returnTo";
import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Check,
  Crown,
  FileText,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
  ShoppingCart,
  User,
} from "lucide-react";
import useResource from "../../hooks/useResource";
import { price, errorMessage } from "../../utils/platform";
import {
  Empty,
  Hero,
  PlanCard,
  ResourceState,
} from "../../components/common/PlatformUI";
export default function PlansPage() {
  const resource = useResource("/plan/getActivePlans"),
    [params] = useSearchParams(),
    [selected, setSelected] = useState(params.get("plan") || "");
  const plan = resource.data?.find((p) => p._id === selected);
  const capability = useResource("/payments/capabilities");
  const { profile } = usePlatform(),
    navigate = useNavigate();
  const [methods, setMethods] = useState([]),
    [method, setMethod] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [methodsLoading, setMethodsLoading] = useState(false);
  const next = safeNext(params.get("next"));
  useEffect(() => {
    if (!selected || !profile || !capability.data?.checkoutEnabled) return;
    let live = true;
    Promise.resolve().then(() => {
      if (live) {
        setMethodsLoading(true);
        setMethods([]);
        setMethod("");
        setError("");
      }
    });
    paymentMethods(selected)
      .then((r) => {
        if (live) {
          setMethods(r.data.data);
          setMethod(String(r.data.data[0]?.id || ""));
        }
      })
      .catch((e) => {
        if (live) setError(errorMessage(e));
      })
      .finally(() => {
        if (live) setMethodsLoading(false);
      });
    return () => {
      live = false;
    };
  }, [selected, profile, capability.data?.checkoutEnabled]);
  async function pay() {
    if (!profile) {
      navigate(
        "/login?next=" +
          encodeURIComponent(
            "/plans?plan=" + selected + "&next=" + encodeURIComponent(next),
          ),
      );
      return;
    }
    if (!plan || !method) return;
    setBusy(true);
    setError("");
    try {
      let attempt;
      try {
        attempt = JSON.parse(sessionStorage.getItem("payment-attempt"));
      } catch {
        attempt = null;
      }
      if (
        attempt?.planId !== plan._id ||
        attempt?.paymentMethodId !== Number(method)
      )
        attempt = {
          planId: plan._id,
          paymentMethodId: Number(method),
          idempotencyKey: crypto.randomUUID(),
        };
      sessionStorage.setItem("payment-attempt", JSON.stringify(attempt));
      const result = await checkout({ ...attempt, returnTo: next }),
        order = result.data.data;
      sessionStorage.setItem("payment-order", order.id);
      if (order.checkoutUrl) window.location.assign(order.checkoutUrl);
      else navigate("/payment/return?orderId=" + order.id);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Hero
        title="اختر خطتك المناسبة"
        subtitle="ابدأ رحلتك التعليمية وكن جزءًا من مجتمع الديوانية"
        compact
      />
      <section className="site-container plans-layout section">
        <aside>
          <div className="site-panel order-summary">
            <h2>
              <ShoppingCart />
              ملخص الطلب
            </h2>
            {plan ? (
              <>
                <div className="summary-row">
                  <Crown />
                  <span>{plan.title}</span>
                  <b>{price(plan)}</b>
                </div>
                <div className="soft-panel summary-row">
                  <strong>الإجمالي</strong>
                  <strong>{price(plan)}</strong>
                </div>
              </>
            ) : (
              <p>اختر خطة لعرض تفاصيلها.</p>
            )}
            {capability.data?.checkoutEnabled && profile && selected && (
              <label className="form-field">
                <span>وسيلة الدفع</span>
                <select
                  aria-label="وسيلة الدفع"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  disabled={busy || methodsLoading}
                >
                  <option value="">
                    {methodsLoading
                      ? "جاري تحميل وسائل الدفع…"
                      : "اختر وسيلة الدفع"}
                  </option>
                  {methods.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button
              className="site-button full"
              onClick={pay}
              disabled={
                !plan ||
                busy ||
                !capability.data?.checkoutEnabled ||
                (!!profile && (!method || methodsLoading))
              }
            >
              <LockKeyhole size={17} />
              {busy
                ? "جاري تجهيز الطلب…"
                : profile
                  ? "متابعة الدفع"
                  : "سجّل الدخول للمتابعة"}
            </button>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <p role="status">
              {capability.loading
                ? "جاري التحقق من إتاحة الدفع…"
                : capability.data?.checkoutEnabled
                  ? capability.data.sandbox
                    ? "الدفع في الوضع التجريبي. لا تستخدم بيانات بطاقة حقيقية."
                    : "سيتم تحويلك إلى صفحة الدفع الآمنة في ماي فاتورة."
                  : "الدفع غير متاح حاليًا. المعاينات والمكتبة المجانية متاحة للجميع."}
            </p>
          </div>
          <div className="site-panel">
            <h3>مميزات الاشتراك</h3>
            <ul className="feature-list">
              <li>
                <BookOpen />
                الوصول إلى المحتوى المشمول بالخطة
              </li>
              <li>
                <PlayCircle />
                مشاهدة الدروس المسجلة
              </li>
              <li>
                <FileText />
                المكتبة المجانية متاحة للجميع
              </li>
            </ul>
          </div>
          <div className="soft-panel">
            <h3>تجربة مجانية قبل الاشتراك</h3>
            <p>شاهد المعاينات المجانية المنشورة.</p>
            <Link className="site-button full" to="/previews">
              جرّب الآن
              <PlayCircle size={18} />
            </Link>
          </div>
          <div className="site-panel">
            <h3>المواد التعليمية المجانية</h3>
            <Link to="/library" className="site-button light full">
              استكشف المكتبة
              <FileText size={18} />
            </Link>
          </div>
        </aside>
        <div className="site-panel plans-main">
          <h2>خطط الاشتراك</h2>
          <p>اختر الخطة الأنسب لرحلتك التعليمية</p>
          <ResourceState resource={resource}>
            {resource.data?.length ? (
              <div className="card-grid plan-grid">
                {resource.data.map((p) => (
                  <PlanCard
                    key={p._id}
                    plan={p}
                    selected={selected === p._id}
                    onSelect={setSelected}
                  />
                ))}
              </div>
            ) : (
              <Empty>لا توجد خطط اشتراك متاحة حاليًا.</Empty>
            )}
          </ResourceState>
          <section className="subscription-steps">
            <h2>خطوات الاشتراك</h2>
            <div>
              {[
                [Crown, "اختر الخطة المناسبة"],
                [User, "سجّل الدخول"],
                [LockKeyhole, "الدفع الإلكتروني"],
                [Check, "تفعيل الاشتراك بعد التحقق"],
              ].map(([Icon, title], i) => (
                <div key={title}>
                  <Icon />
                  <b>{i + 1}</b>
                  <p>{title}</p>
                </div>
              ))}
            </div>
          </section>
          <div className="payment-notice">
            <ShieldCheck size={55} />
            <div>
              <h2>ماي فاتورة</h2>
              <p>
                يتم تأكيد الدفع من الخادم قبل تفعيل الاشتراك والعودة إلى الدرس.
              </p>
            </div>
          </div>
          <h2>أسئلة شائعة</h2>
          {[
            [
              "هل يمكنني تحميل المذكرات بدون اشتراك؟",
              "نعم، المكتبة المجانية متاحة للجميع بدون تسجيل دخول.",
            ],
            [
              "كيف أجرّب المحتوى قبل الاشتراك؟",
              "يمكنك مشاهدة الفيديوهات المنشورة كمعاينات مجانية من صفحة جرّب قبل أن تشترك.",
            ],
            [
              "هل الدفع متاح الآن؟",
              capability.data?.checkoutEnabled
                ? "يمكنك اختيار الخطة ووسيلة الدفع من ملخص الطلب."
                : "الدفع غير متاح حاليًا، وستظهر وسائل الدفع هنا عند إتاحته.",
            ],
          ].map(([q, a]) => (
            <details className="faq" key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
