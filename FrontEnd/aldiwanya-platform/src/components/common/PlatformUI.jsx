import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Crown,
  Download,
  FileText,
  Globe,
  GraduationCap,
  Headphones,
  LockKeyhole,
  Menu,
  Play,
  Search,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import usePlatform from "../../hooks/usePlatform";
import { assetUrl, price } from "../../utils/platform";
import { API_BASE_URL } from "../../services/api";
import "../../styles-platform.css";

export function Hero({ title, subtitle, children, compact = false }) {
  return (
    <section className={`site-hero ${compact ? "compact" : ""}`}>
      <div className="site-container">
        <div className="hero-copy">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}
export function Empty({
  children = "لا يوجد محتوى متاح حاليًا.",
  icon: Icon = BookOpen,
}) {
  return (
    <div className="site-empty">
      <Icon size={34} />
      <p>{children}</p>
    </div>
  );
}
export function ResourceState({ resource, children }) {
  if (resource.loading)
    return (
      <div className="site-empty" role="status">
        <span className="site-spinner" />
        جاري تحميل المحتوى…
      </div>
    );
  if (resource.error)
    return (
      <div className="site-empty" role="alert">
        <p>{resource.error}</p>
        <button className="site-button outline" onClick={resource.retry}>
          إعادة المحاولة
        </button>
      </div>
    );
  return children;
}
export function SectionTitle({ title, to, label = "عرض الكل" }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {to && (
        <Link to={to}>
          {label}
          <ArrowLeft size={16} />
        </Link>
      )}
    </div>
  );
}
export function CourseCard({ course, progress }) {
  const image = assetUrl(course.coverImage || course.thumbnail);
  return (
    <article className="course-card">
      <Link to={"/courses/" + course._id} className="course-cover">
        {image ? (
          <img src={image} alt={course.title} loading="lazy" />
        ) : (
          <div className="cover-placeholder">
            <BookOpen size={46} />
          </div>
        )}
        {course.subject && <span className="cover-tag">{course.subject}</span>}
      </Link>
      <div className="card-body">
        <small>{course.grade?.name}</small>
        <Link to={"/courses/" + course._id}>
          <h3>{course.title}</h3>
        </Link>
        <p className="line-clamp">{course.description}</p>
        <div className="card-meta">
          <span>
            <BookOpen size={14} />
            {course.lessonsCount || 0} درس
          </span>
          {course.durationHours > 0 && <span>{course.durationHours} ساعة</span>}
        </div>
        {progress && (
          <>
            <div className="progress-label">
              <span>
                {progress.completed} من {course.lessonsCount || 0} درس
              </span>
              <span>{progress.percent}%</span>
            </div>
            <progress max="100" value={progress.percent} />
          </>
        )}
        <Link className="site-button light full" to={"/courses/" + course._id}>
          {progress ? "متابعة التعلم" : "عرض الكورس"}
          <ArrowLeft size={15} />
        </Link>
      </div>
    </article>
  );
}
export function PdfCard({ pdf, compact = false }) {
  return (
    <article className={`pdf-card ${compact ? "small" : ""}`}>
      {!compact && (
        <div className="pdf-cover">
          <FileText size={56} />
          <span className="cover-tag green">مجاني</span>
          <span>PDF</span>
        </div>
      )}
      <div className="card-body">
        {compact && <FileText size={32} />}
        <h3>{pdf.title}</h3>
        {!compact && <p className="line-clamp">{pdf.description}</p>}
        <small>{pdf.course?.title}</small>
        <a
          className="site-button full"
          href={`${API_BASE_URL}/library/pdfs/${pdf._id}/download`}
          download
        >
          {compact ? "تحميل" : "تحميل الملف"}
          <Download size={15} />
        </a>
      </div>
    </article>
  );
}
export function VideoCard({ video, preview = true }) {
  return (
    <Link
      className="video-card"
      to={`/courses/${video.courseId}${preview ? "/preview" : ""}?lesson=${video.lessonId}&video=${video._id}`}
    >
      <div className="video-cover">
        {assetUrl(video.thumbnailUrl) ? (
          <img src={assetUrl(video.thumbnailUrl)} alt="" loading="lazy" />
        ) : (
          <div className="cover-placeholder" />
        )}
        <span className="play-circle">
          <Play fill="currentColor" size={23} />
        </span>
        {video.durationSeconds > 0 && (
          <small>
            {Math.floor(video.durationSeconds / 60)}:
            {String(Math.floor(video.durationSeconds % 60)).padStart(2, "0")}
          </small>
        )}
      </div>
      <h3>{video.title}</h3>
    </Link>
  );
}
export function PlanCard({ plan, selected, onSelect }) {
  return (
    <article className={`plan-card ${selected ? "selected" : ""}`}>
      <Crown size={30} />
      <h3>{plan.title}</h3>
      <p>{plan.durationMonths} شهر</p>
      <strong className="plan-price">{price(plan)}</strong>
      <ul>
        <li>
          <Check />
          الوصول إلى المحتوى المشمول بالاشتراك
        </li>
        <li>
          <Check />
          دروس مسجلة
        </li>
        <li>
          <Check />
          المكتبة مجانية للجميع
        </li>
      </ul>
      {onSelect ? (
        <button className="site-button full" onClick={() => onSelect(plan._id)}>
          {selected ? "الخطة المختارة" : "اختر الخطة"}
        </button>
      ) : (
        <Link className="site-button full" to={"/plans?plan=" + plan._id}>
          اختر الخطة
        </Link>
      )}
    </article>
  );
}
export function Benefits() {
  return (
    <div className="benefits site-container">
      {[
        [BookOpen, "تعلم بمرونة", "في أي وقت ومن أي مكان"],
        [Globe, "من أي جهاز", "تجربة سلسة على جميع الأجهزة"],
        [Headphones, "الدعم والمساعدة", "كل ما تحتاجه لمتابعة التعلم"],
        [ShieldCheck, "بياناتك آمنة", "حماية حسابك وخصوصيتك"],
      ].map(([Icon, title, text]) => (
        <div key={title}>
          <Icon />
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
      ))}
    </div>
  );
}
export function SupportBanner() {
  return (
    <section className="support-banner">
      <div className="site-container">
        <img className="support-books" src="/learning-books.png" alt="" loading="lazy" />
        <div>
          <h2>هل تحتاج إلى مساعدة؟</h2>
          <p>تعرّف على طريقة استخدام المنصة والوصول إلى محتواك</p>
          <Link className="site-button outline" to="/contact">
            <Headphones size={17} />
            تواصل معنا
          </Link>
        </div>
      </div>
    </section>
  );
}
export function Pagination({ page, total, onChange }) {
  return (
    total > 1 && (
      <nav className="pagination" aria-label="صفحات النتائج">
        <button
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          aria-label="الصفحة السابقة"
        >
          <ChevronRight size={18} />
        </button>
        {Array.from({ length: total }, (_, i) => i + 1)
          .filter((n) => n === 1 || n === total || Math.abs(n - page) < 2)
          .map((n) => (
            <button
              key={n}
              className={page === n ? "active" : ""}
              aria-current={page === n ? "page" : undefined}
              onClick={() => onChange(n)}
            >
              {n}
            </button>
          ))}
        <button
          disabled={page === total}
          onClick={() => onChange(page + 1)}
          aria-label="الصفحة التالية"
        >
          <ChevronLeft size={18} />
        </button>
      </nav>
    )
  );
}
export function SocialButtons() {
  return (
    <div className="social-options">
      <div className="divider">أو التسجيل باستخدام</div>
      <div>
        {["Google", "Facebook", "Apple"].map((name, i) => (
          <button type="button" disabled title="غير متاح حاليًا" key={name}>
            <b>{["G", "f", "●"][i]}</b>
            {name}
          </button>
        ))}
      </div>
      <small>التسجيل عبر هذه الخدمات غير متاح حاليًا</small>
    </div>
  );
}
export function PlatformLayout() {
  const { profile, logout } = usePlatform();
  const navigate = useNavigate();
  const location = useLocation();
  const [menu, setMenu] = useState(false),
    [search, setSearch] = useState("");
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  async function signout() {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  }
  return (
    <div className="platform" dir="rtl">
      <header className="site-header">
        <div className="site-container header-inner">
          <Link to="/" className="brand">
            <img
              src="/diwaniya-logo-white.png"
              alt="الديوانية — منصة تعليمية"
            />
          </Link>
          <button
            className="mobile-menu"
            aria-label="فتح القائمة"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
          <nav className={menu ? "open" : ""} aria-label="التنقل الرئيسي">
            {[
              ["/", "الرئيسية"],
              ["/courses", "المحتوى التعليمي"],
              ["/plans", "الاشتراكات"],
              ["/library", "المكتبة المجانية"],
              ["/about", "عن المنصة"],
              ["/contact", "تواصل معنا"],
            ].map(([to, label]) => (
              <NavLink key={to} to={to} end onClick={() => setMenu(false)}>
                {label}
              </NavLink>
            ))}
          </nav>
          <form
            className="header-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/courses?q=" + encodeURIComponent(search));
            }}
          >
            <input
              aria-label="بحث في الكورسات"
              placeholder="ابحث عن كورس أو موضوع..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button aria-label="بحث">
              <Search size={17} />
            </button>
          </form>
          <div className="header-account">
            {profile ? (
              <details>
                <summary>
                  <span className="avatar small">
                    <User size={17} />
                  </span>
                  <span>{profile.user.fullName}</span>
                </summary>
                <div className="account-menu">
                  <Link
                    to={
                      profile.user.role === "Admin"
                        ? "/admin/dashboard"
                        : "/dashboard"
                    }
                  >
                    لوحة التحكم
                  </Link>
                  <Link to="/account">حسابي</Link>
                  <button onClick={signout}>تسجيل الخروج</button>
                </div>
              </details>
            ) : (
              <>
                <Link to="/login">
                  <User size={16} />
                  تسجيل الدخول
                </Link>
                <Link to="/register" className="site-button">
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="site-container footer-grid">
          <div>
            <h3>تابع رحلتك التعليمية</h3>
            <p>اكتشف الدروس والمذكرات المتاحة على الديوانية</p>
            <Link className="site-button outline" to="/library">
              <FileText size={18} />
              استكشف المكتبة
            </Link>
          </div>
          <div>
            <h3>الدعم</h3>
            <Link to="/contact">الأسئلة الشائعة</Link>
            <Link to="/privacy">سياسة الخصوصية</Link>
            <Link to="/terms">شروط الاستخدام</Link>
          </div>
          <div>
            <h3>روابط سريعة</h3>
            <Link to="/">الرئيسية</Link>
            <Link to="/courses">المحتوى التعليمي</Link>
            <Link to="/plans">الاشتراكات</Link>
            <Link to="/library">المكتبة المجانية</Link>
          </div>
          <div className="footer-brand">
            <Link to="/">
              <img src="/diwaniya-logo-white.png" alt="الديوانية" />
            </Link>
            <p>جميع الحقوق محفوظة © {new Date().getFullYear()} الديوانية</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
export function AuthNotice() {
  return (
    <div className="soft-panel inline">
      <GraduationCap size={30} />
      <div>
        <h3>بعد التسجيل يمكنك الوصول إلى</h3>
        <p>المحتوى التعليمي · المكتبة المجانية · حسابك الشخصي</p>
      </div>
    </div>
  );
}
export function LockedContent() {
  return (
    <div className="site-empty">
      <LockKeyhole size={42} />
      <h3>هذا المحتوى يتطلب اشتراكًا</h3>
      <Link to="/plans" className="site-button">
        عرض خطط الاشتراك
      </Link>
    </div>
  );
}
