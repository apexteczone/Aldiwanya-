import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { CheckCircle, Clock, ShieldCheck, XCircle } from "lucide-react";
import usePlatform from "../../hooks/usePlatform";
import { Hero } from "../../components/common/PlatformUI";
import { verifyPayment } from "../../services/paymentService";
import { safeNext } from "../../utils/returnTo";
import { errorMessage } from "../../utils/platform";
export default function PaymentReturnPage() {
  const [params] = useSearchParams(),
    navigate = useNavigate(),
    location = useLocation();
  const { profile, loading, refresh } = usePlatform();
  const [state, setState] = useState({ busy: true, order: null, error: "" }),
    [revision, setRevision] = useState(0);
  const id = params.get("orderId"),
    paymentId = params.get("paymentId") || undefined;
  useEffect(() => {
    if (loading) return;
    if (!profile) {
      navigate(
        "/login?next=" +
          encodeURIComponent(location.pathname + location.search),
        { replace: true },
      );
      return;
    }
    if (!/^[a-f\d]{24}$/i.test(id || "")) return;
    let live = true,
      timer,
      attempts = 0;
    async function check() {
      try {
        const r = await verifyPayment(id, paymentId),
          order = r.data.data;
        if (!live) return;
        setState({ busy: false, order, error: "" });
        if (order.status === "succeeded") {
          await refresh();
          sessionStorage.removeItem("payment-order");
          sessionStorage.removeItem("payment-attempt");
          navigate(safeNext(order.returnTo), { replace: true });
        } else if (["canceled", "failed"].includes(order.status)) {
          sessionStorage.removeItem("payment-attempt");
        } else if (++attempts < 4) timer = setTimeout(check, 10000);
      } catch (e) {
        if (live)
          setState((s) => ({ ...s, busy: false, error: errorMessage(e) }));
      }
    }
    check();
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [
    id,
    paymentId,
    profile,
    loading,
    navigate,
    location.pathname,
    location.search,
    revision,
    refresh,
  ]);
  const invalid = !/^[a-f\d]{24}$/i.test(id || "");
  const canceled = ["canceled", "failed"].includes(state.order?.status);
  return (
    <>
      <Hero
        compact
        title="متابعة الاشتراك"
        subtitle="نتحقق من نتيجة الدفع بأمان قبل تفعيل اشتراكك."
      />
      <section className="site-container section">
        <div className="site-panel payment-result">
          {canceled ? (
            <XCircle size={54} />
          ) : state.order?.status === "succeeded" ? (
            <CheckCircle size={54} />
          ) : state.busy ? (
            <ShieldCheck size={54} />
          ) : (
            <Clock size={54} />
          )}
          <h2>
            {invalid
              ? "رابط الطلب غير صحيح"
              : state.busy
                ? "جاري التحقق من الدفع…"
                : canceled
                  ? "لم تكتمل عملية الدفع"
                  : state.error
                    ? "تعذر التحقق الآن"
                    : "الدفع قيد المراجعة"}
          </h2>
          <p role={state.error ? "alert" : "status"}>
            {state.error ||
              (!invalid && !canceled
                ? "يتم تفعيل الاشتراك بعد تأكيد بوابة الدفع فقط. يمكنك إعادة التحقق من نفس الطلب."
                : "يمكنك اختيار خطة والمحاولة مجددًا.")}
          </p>
          {!invalid && !state.busy && !canceled && (
            <button
              className="site-button"
              onClick={() => {
                setState((s) => ({ ...s, busy: true, error: "" }));
                setRevision((v) => v + 1);
              }}
            >
              إعادة التحقق
            </button>
          )}
          {state.order?.checkoutUrl && (
            <a className="site-button outline" href={state.order.checkoutUrl}>
              استكمال الدفع لنفس الطلب
            </a>
          )}
          <Link
            className="site-button light"
            to={
              "/plans?next=" +
              encodeURIComponent(safeNext(state.order?.returnTo))
            }
          >
            العودة للاشتراكات
          </Link>
        </div>
      </section>
    </>
  );
}
