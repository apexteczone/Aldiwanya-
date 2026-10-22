import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ClipboardList,
  CreditCard,
  FileText,
  Globe,
  GraduationCap,
  Headphones,
  MonitorPlay,
  PlayCircle,
  Star,
  UserRoundPlus,
  Users,
} from "lucide-react";
import useResource from "../../hooks/useResource";
import usePlatform from "../../hooks/usePlatform";
import {
  Empty,
  ResourceState,
  VideoCard,
} from "../../components/common/PlatformUI";
import "./HomePage.css";

const features = [
  [BriefcaseBusiness, "محتوى مسجل", "فيديوهات وشرح مبسط"],
  [Globe, "دعم اللغة العربية", "تجربة عربية متكاملة"],
  [CreditCard, "نظام اشتراكات مرن", "اختر الخطة المناسبة لك"],
  [FileText, "مكتبة PDF مجانية", "لجميع الزوار والطلاب"],
  [Users, "لوحات تحكم متكاملة", "للطلاب والمدرسين والإدارة"],
];
const trials = [
  {
    icon: ClipboardList,
    title: "اختبارات تجريبية",
    text: "نماذج PDF لمراجعة مستواك",
    to: "/library?category=امتحانات",
    action: "استعرض الاختبارات",
  },
  {
    icon: FileText,
    title: "ملفات وملخصات",
    text: "لدعم المذاكرة وفهم الموضوعات",
    to: "/library",
    action: "استعرض الملفات",
  },
  {
    icon: MonitorPlay,
    title: "دروس تفاعلية",
    text: "شاهد الشرح المسجل وجرّب بنفسك",
    to: "/previews",
    action: "ابدأ التجربة",
  },
];
const benefits = [
  [BookOpen, "المحتوى الدراسي", "كل موادك في مكان واحد"],
  [Star, "محتوى تعليمي", "دروس ومذكرات للمراجعة"],
  [ChartNoAxesCombined, "متابعة مستمرة", "تابع تقدمك في الدروس"],
  [Headphones, "تواصل مع المنصة", "نساعدك في رحلتك التعليمية"],
];
export default function HomePage() {
  const grades = useResource("/grades");
  const videos = useResource("/previews");
  const { profile } = usePlatform();
  return (
    <div className="reference-home">
      <section className="home-math-hero" aria-labelledby="home-title">
        <img
          className="home-hero-image"
          src="/home-math-hero.webp"
          alt=""
          fetchPriority="high"
          width="1536"
          height="1024"
        />
        <div className="site-container home-hero-inner">
          <div className="home-hero-copy hero-copy">
            <h1 id="home-title">
              الديوانية <span>منصة تعليمية عربية</span>
            </h1>
            <p className="home-hero-tagline">
              تعلم بمرونة .. من أي مكان .. في أي وقت
            </p>
            <p className="home-hero-detail">
              افهم، تدرّب، وتقدّم في دراستك مع دروس مسجلة ومذكرات تعليمية تساعدك
              في كل خطوة.
            </p>
            <div className="hero-actions">
              <a className="site-button" href="#grades">
                ابدأ الآن <ArrowLeft size={19} />
              </a>
              <Link className="site-button outline" to="/previews">
                <PlayCircle size={20} /> جرّب المحتوى المجاني
              </Link>
            </div>
          </div>
          <div className="home-math-caption" aria-hidden="true">
            <span lang="en">Mathematics</span>
            <strong>
              الرياضيات
              <br />
              مفتاح مستقبلك
            </strong>
          </div>
        </div>
      </section>
      <section className="home-feature-section" aria-label="مميزات المنصة">
        <div className="feature-strip site-container">
          {features.map(([Icon, title, text]) => (
            <div key={title}>
              <span className="feature-icon">
                <Icon />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="home-trial home-dark" aria-labelledby="trial-title">
        <div className="site-container home-trial-layout">
          <div className="home-trial-cards">
            {trials.map(({ icon: Icon, title, text, to, action }) => (
              <Link className="home-trial-card" key={title} to={to}>
                <span className="home-trial-icon">
                  <Icon strokeWidth={1.5} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
                <span className="home-card-action">
                  {action}
                  <ArrowLeft size={17} />
                </span>
              </Link>
            ))}
          </div>
          <div className="home-trial-intro">
            <div>
              <h2 id="trial-title">التجربة المجانية</h2>
              <p>
                ابدأ رحلتك معنا الآن واكتشف
                <br />
                المحتوى المجاني على الديوانية
              </p>
              <Link className="site-button" to="/previews">
                جرّب الآن <ArrowLeft size={17} />
              </Link>
            </div>
            <img
              className="home-trial-art"
              src="/home-free-trial.webp"
              alt=""
              width="1310"
              height="1200"
              loading="lazy"
            />
          </div>
        </div>
      </section>
      <section
        id="grades"
        className="home-grades home-dark"
        aria-labelledby="grades-title"
      >
        <div className="site-container">
          <div className="section-title home-section-title">
            <h2 id="grades-title">
              <GraduationCap />
              المواد الدراسية
            </h2>
          </div>
          <div className="home-grades-layout">
            <div className="home-grade-list">
              <ResourceState resource={grades}>
                {grades.data?.length ? (
                  grades.data.map((grade, index) => (
                    <Link
                      key={grade._id}
                      className={`grade-card home-grade-row grade-tone-${index % 3}`}
                      to={`/courses?grade=${grade._id}`}
                    >
                      <span className="home-grade-icon">
                        <GraduationCap size={25} />
                      </span>
                      <div>
                        <h3>{grade.name}</h3>
                        {grade.description && <p>{grade.description}</p>}
                      </div>
                      <ArrowLeft size={19} className="home-grade-arrow" />
                    </Link>
                  ))
                ) : (
                  <Empty icon={GraduationCap}>لا توجد صفوف متاحة حاليًا.</Empty>
                )}
              </ResourceState>
            </div>
            <div className="home-grades-intro">
              <h3>المواد الدراسية</h3>
              <p>
                اختر صفك واستكشف
                <br />
                المواد والدروس المتاحة
              </p>
              <Link className="site-button home-purple-button" to="/courses">
                تصفح المراحل <ArrowLeft size={20} />
              </Link>
            </div>
            <div className="home-math-art">
              <img
                src="/home-math-books.webp"
                alt=""
                width="1536"
                height="1024"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
      <section
        className="home-videos home-dark"
        aria-labelledby="free-videos-title"
      >
        <div className="site-container">
          <div className="section-title home-section-title">
            <h2 id="free-videos-title">
              <PlayCircle />
              فيديوهات مجانية
            </h2>
            <Link to="/previews">
              عرض الكل <ArrowLeft size={16} />
            </Link>
          </div>
          <ResourceState resource={videos}>
            {videos.data?.length ? (
              <div className="card-grid four">
                {videos.data.slice(0, 4).map((video) => (
                  <VideoCard key={video._id} video={video} />
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
      <section className="home-benefits" aria-label="رحلتك مع الديوانية">
        <div className="site-container home-benefits-grid">
          {benefits.map(([Icon, title, text]) => (
            <div className="home-benefit" key={title}>
              <span>
                <Icon size={27} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="join-banner home-join">
        <h2>ابدأ رحلتك التعليمية الآن</h2>
        <p>
          انضم إلى الديوانية واستكشف الدروس والمذكرات التي تساعدك على التقدم
        </p>
        <Link className="site-button" to={profile ? "/courses" : "/register"}>
          <UserRoundPlus size={18} />
          {profile ? "استكشف المحتوى التعليمي" : "إنشاء حساب مجاني"}
        </Link>
      </section>
    </div>
  );
}
