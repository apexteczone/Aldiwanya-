import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CreditCard,
  FileText,
  Globe,
  GraduationCap,
  PlayCircle,
  Users,
} from "lucide-react";
import useResource from "../../hooks/useResource";
import {
  Benefits,
  CourseCard,
  Empty,
  Hero,
  PdfCard,
  PlanCard,
  ResourceState,
  SectionTitle,
  VideoCard,
} from "../../components/common/PlatformUI";
export default function HomePage() {
  const grades = useResource("/grades"),
    courses = useResource("/courses"),
    pdfs = useResource("/library/pdfs"),
    plans = useResource("/plan/getActivePlans"),
    videos = useResource("/previews");
  return (
    <>
      <Hero
        title={
          <>
            الديوانية<span>منصة تعليمية عربية</span>
          </>
        }
        subtitle="تعلم بمرونة .. من أي مكان .. في أي وقت"
      >
        <p className="hero-detail">
          محتوى تعليمي مسجل، مع الوصول المجاني إلى المكتبة والمذكرات التعليمية.
        </p>
        <div className="hero-actions">
          <a className="site-button" href="#grades">
            استعرض الصفوف
            <ArrowLeft size={18} />
          </a>
          <Link className="site-button outline" to="/previews">
            <PlayCircle size={18} />
            جرّب المحتوى المجاني
          </Link>
        </div>
      </Hero>
      <div className="feature-strip site-container">
        {[
          [BookOpen, "محتوى مسجل", "دروس وشرح مبسط"],
          [Globe, "دعم اللغة العربية", "تجربة عربية متكاملة"],
          [CreditCard, "خطط الاشتراك", "اختر ما يناسبك"],
          [FileText, "مكتبة PDF مجانية", "لجميع الزوار والطلاب"],
          [Users, "حسابك التعليمي", "تابع رحلتك من مكان واحد"],
        ].map(([Icon, title, text]) => (
          <div key={title}>
            <Icon />
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
      <section id="grades" aria-labelledby="grades-title" className="site-container section grades-section">
        <h2 id="grades-title">الصفوف الدراسية</h2>
        <p className="grades-intro">اختر صفك الدراسي، ثم استكشف الكورسات والدروس المتاحة قبل تسجيل الدخول.</p>
        <ResourceState resource={grades}>
          {grades.data?.length ? (
            <div className="card-grid four">
              {grades.data.map((grade) => (
                <Link key={grade._id} className="site-panel grade-card" to={`/courses?grade=${grade._id}`}>
                  <span className="grade-icon"><GraduationCap size={32} /></span>
                  <h3>{grade.name}</h3>
                  {grade.description && <p>{grade.description}</p>}
                  <span className="grade-action">عرض الكورسات <ArrowLeft size={18} /></span>
                </Link>
              ))}
            </div>
          ) : <Empty icon={GraduationCap}>لا توجد صفوف متاحة حاليًا.</Empty>}
        </ResourceState>
      </section>
      <section className="site-container section">
        <SectionTitle
          title="أحدث الدورات"
          to="/courses"
          label="تصفح جميع الدورات"
        />
        <ResourceState resource={courses}>
          {courses.data?.length ? (
            <div className="card-grid four">
              {[...courses.data]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 4)
                .map((c) => (
                  <CourseCard key={c._id} course={c} />
                ))}
            </div>
          ) : (
            <Empty>لا توجد دورات منشورة بعد.</Empty>
          )}
        </ResourceState>
      </section>
      <section className="navy-section section">
        <div className="site-container">
          <SectionTitle
            title="فيديوهات مختارة"
            to="/previews"
            label="مشاهدة المزيد"
          />
          <ResourceState resource={videos}>
            {videos.data?.length ? (
              <div className="card-grid four">
                {videos.data.slice(0, 4).map((v) => (
                  <VideoCard key={v._id} video={v} />
                ))}
              </div>
            ) : (
              <Empty icon={PlayCircle}>
                ستظهر المعاينات المجانية هنا عند نشرها.
              </Empty>
            )}
          </ResourceState>
        </div>
      </section>
      <section className="site-container section">
        <SectionTitle
          title="المكتبة المجانية"
          to="/library"
          label="تصفح المكتبة الكاملة"
        />
        <div className="home-library">
          <ResourceState resource={pdfs}>
            {pdfs.data?.length ? (
              <div className="card-grid four">
                {pdfs.data.slice(0, 4).map((p) => (
                  <PdfCard compact key={p._id} pdf={p} />
                ))}
              </div>
            ) : (
              <Empty icon={FileText}>لا توجد مذكرات منشورة بعد.</Empty>
            )}
          </ResourceState>
          <div className="soft-panel">
            <img className="library-books" src="/learning-books.png" alt="" loading="lazy" />
            <h3>ملفات PDF تعليمية مجانية</h3>
            <p>لجميع الزوار والطلاب</p>
            <Link to="/library" className="site-button">
              استعرض الملفات
            </Link>
          </div>
        </div>
      </section>
      <section className="home-plans navy-section section">
        <div className="site-container">
          <div>
            <h2>اختر خطتك المناسبة</h2>
            <p>تابع رحلتك التعليمية مع الديوانية</p>
          </div>
          <ResourceState resource={plans}>
            {plans.data?.length ? (
              <div className="card-grid">
                {plans.data.map((p) => (
                  <PlanCard key={p._id} plan={p} />
                ))}
              </div>
            ) : (
              <Empty>لا توجد خطط اشتراك متاحة حاليًا.</Empty>
            )}
          </ResourceState>
        </div>
      </section>
      <section className="section">
        <div className="site-container">
          <SectionTitle title="لماذا الديوانية؟" />
        </div>
        <Benefits />
      </section>
      <section className="site-container section">
        <SectionTitle title="آراء طلابنا" />
        <Empty icon={Users}>لم تُنشر آراء بعد.</Empty>
      </section>
      <section className="join-banner">
        <h2>ابدأ رحلتك التعليمية الآن</h2>
        <p>انضم إلى الديوانية واستكشف المحتوى المتاح</p>
        <Link className="site-button" to="/register">
          إنشاء حساب مجاني
          <ArrowLeft size={16} />
        </Link>
      </section>
    </>
  );
}
