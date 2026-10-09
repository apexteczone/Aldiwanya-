import { Link } from "react-router-dom";
import { Hero } from "../../components/common/PlatformUI";
const titles = {
  about: "عن الديوانية",
  contact: "الدعم والمساعدة",
  terms: "شروط الاستخدام",
  privacy: "سياسة الخصوصية",
};
export default function InfoPage({ type }) {
  return (
    <>
      <Hero title={titles[type]} compact />
      <section className="site-container section">
        <div className="site-panel info-content">
          {type === "about" ? (
            <>
              <h2>رحلتك نحو التعلم</h2>
              <p>
                الديوانية منصة تعليمية عربية تجمع الكورسات والدروس المسجلة
                والمذكرات المجانية. استكشف المحتوى حسب الصف والمادة وتابع تقدمك
                من حسابك الشخصي.
              </p>
              <Link className="site-button" to="/courses">
                استكشف المحتوى
              </Link>
            </>
          ) : type === "contact" ? (
            <>
              <h2>كيف يمكننا مساعدتك؟</h2>
              {[
                [
                  "كيف أصل إلى المذكرات؟",
                  "افتح المكتبة المجانية واختر الملف واضغط تحميل. لا تحتاج إلى تسجيل الدخول.",
                ],
                [
                  "كيف أتابع دروسي؟",
                  "افتح المحتوى التعليمي ثم الكورس واختر الدرس. يمكنك حفظ الفيديوهات في المفضلة وتحديد الدروس المكتملة بعد تسجيل الدخول.",
                ],
                [
                  "نسيت كلمة المرور",
                  "استخدم صفحة استعادة كلمة المرور لطلب رابط عبر بريدك الإلكتروني.",
                ],
                [
                  "هل يمكنني الدفع الآن؟",
                  "خدمة الدفع غير متاحة حتى اكتمال الربط مع ماي فاتورة.",
                ],
              ].map(([q, a]) => (
                <details key={q} className="faq">
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
              <Link to="/forgot-password" className="site-button">
                استعادة كلمة المرور
              </Link>
              <p>لم تُنشر بيانات التواصل المباشر بعد.</p>
            </>
          ) : (
            <>
              <h2>{titles[type]}</h2>
              <p>لم تنشر إدارة المنصة نص {titles[type]} بعد.</p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
