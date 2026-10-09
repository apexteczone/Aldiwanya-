import { Link } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Crown,
  FileText,
  Home,
  Mail,
  Phone,
  PlayCircle,
  Settings,
  User,
} from "lucide-react";
import usePlatform from "../../hooks/usePlatform";
import useResource from "../../hooks/useResource";
import { activeSubscription, date, price } from "../../utils/platform";
import {
  CourseCard,
  Empty,
  Hero,
  PdfCard,
  PlanCard,
  ResourceState,
  SectionTitle,
  SupportBanner,
  VideoCard,
} from "../../components/common/PlatformUI";
export default function DashboardPage() {
  const { profile } = usePlatform(),
    user = profile.user,
    current = activeSubscription(profile.subscriptions);
  const courses = useResource("/courses"),
    activity = useResource("/student/activity"),
    pdfs = useResource("/library/pdfs"),
    plans = useResource("/plan/getActivePlans");
  const started = (courses.data || []).filter((c) =>
    activity.data?.startedCourses.includes(c._id),
  );
  const progress = (c) => {
    const completed =
      activity.data?.completedLessons.filter((l) => l.courseId === c._id)
        .length || 0;
    return {
      completed,
      percent: c.lessonsCount
        ? Math.min(100, Math.round((completed / c.lessonsCount) * 100))
        : 0,
    };
  };
  return (
    <>
      <Hero
        title={"مرحبًا، " + user.fullName + " 👋"}
        subtitle="يسعدنا أن نراك مجددًا في منصتك التعليمية"
        compact
      >
        <p className="hero-detail">استمر في رحلتك التعليمية وحقق أهدافك</p>
      </Hero>
      <section className="site-container dashboard-layout section">
        <aside className="student-sidebar">
          <div className="profile-card">
            <div className="avatar">
              <User size={43} />
            </div>
            <h2>{user.fullName}</h2>
            <p>{user.role === "Admin" ? "مدير المنصة" : "طالب"}</p>
            <Link to="/account">
              تعديل البيانات
              <Settings size={15} />
            </Link>
          </div>
          <div className="site-panel">
            <h3>بيانات الحساب</h3>
            {[
              [Mail, "البريد الإلكتروني", user.email],
              [Phone, "رقم الهاتف", user.phoneNumber],
              [Calendar, "تاريخ الانضمام", date(user.createdAt)],
            ].map(([Icon, label, value]) => (
              <div className="profile-detail" key={label}>
                <Icon />
                <div>
                  <small>{label}</small>
                  <p dir="auto">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="site-panel">
            <h3>حالة الاشتراك</h3>
            <div className="soft-panel">
              <strong>{current?.planId?.title || "لا يوجد اشتراك نشط"}</strong>
              {current && (
                <>
                  <span className="status-badge">نشط</span>
                  <p>
                    {date(current.startsAt)} — {date(current.endsAt)}
                  </p>
                </>
              )}
              <Link to="/subscriptions" className="site-button light full">
                إدارة الاشتراك
              </Link>
            </div>
          </div>
          <div className="site-panel">
            <h3>الإحصائيات السريعة</h3>
            <ResourceState resource={activity}>
              <div className="profile-detail">
                <BookOpen />
                <span>دورات بدأت تعلمها</span>
                <b>{started.length}</b>
              </div>
              <div className="profile-detail">
                <CheckCircle />
                <span>دروس مكتملة</span>
                <b>{activity.data?.completedLessons.length || 0}</b>
              </div>
              <div className="profile-detail">
                <PlayCircle />
                <span>فيديوهات مفضلة</span>
                <b>{activity.data?.favoriteVideos.length || 0}</b>
              </div>
            </ResourceState>
          </div>
          <div className="site-panel">
            <h3>روابط سريعة</h3>
            <Link className="quick-link" to="/account">
              <User />
              إعدادات الحساب
            </Link>
            <Link className="quick-link" to="/library">
              <FileText />
              المكتبة المجانية
            </Link>
            <Link className="quick-link" to="/previews">
              <PlayCircle />
              المعاينات المجانية
            </Link>
            {user.role === "Admin" && (
              <Link className="quick-link" to="/admin/dashboard">
                لوحة الإدارة
              </Link>
            )}
          </div>
        </aside>
        <div className="dashboard-main">
          <nav className="dashboard-tabs">
            {[
              ["/dashboard", "الرئيسية", Home],
              ["/courses", "المحتوى التعليمي", BookOpen],
              ["/previews", "فيديوهات", PlayCircle],
              ["/library", "المكتبة المجانية", FileText],
              ["/subscriptions", "الاشتراكات", Crown],
              ["/account", "حسابي", User],
            ].map(([to, label, Icon]) => (
              <Link key={to} to={to}>
                <Icon />
                {label}
              </Link>
            ))}
          </nav>
          <div className="dashboard-plans">
            <div className="site-panel">
              <h2>خطط الاشتراك المتاحة</h2>
              <ResourceState resource={plans}>
                {plans.data?.length ? (
                  <div className="card-grid">
                    {plans.data.map((p) => (
                      <PlanCard key={p._id} plan={p} />
                    ))}
                  </div>
                ) : (
                  <Empty>لا توجد خطط متاحة حاليًا.</Empty>
                )}
              </ResourceState>
            </div>
            <div className="current-plan">
              <Crown size={35} />
              <h3>اشتراكك الحالي</h3>
              <strong>{current?.planId?.title || "لا يوجد اشتراك نشط"}</strong>
              {current && <p>تاريخ الانتهاء: {date(current.endsAt)}</p>}
              <Link to="/subscriptions" className="site-button outline">
                إدارة الاشتراك
              </Link>
            </div>
          </div>
          <section className="section">
            <SectionTitle title="المحتوى التعليمي الخاص بك" to="/courses" />
            <ResourceState resource={courses}>
              <ResourceState resource={activity}>
                {started.length ? (
                  <div className="card-grid">
                    {started.map((c) => (
                      <CourseCard
                        key={c._id}
                        course={c}
                        progress={progress(c)}
                      />
                    ))}
                  </div>
                ) : (
                  <Empty>
                    لم تبدأ أي دورة بعد. استكشف المحتوى وابدأ التعلم.
                  </Empty>
                )}
              </ResourceState>
            </ResourceState>
          </section>
          <section className="section">
            <SectionTitle title="فيديوهاتك المفضلة" />
            <ResourceState resource={activity}>
              {activity.data?.favoriteVideos.length ? (
                <div className="card-grid">
                  {activity.data.favoriteVideos.map((v) => (
                    <VideoCard key={v._id} video={v} preview={false} />
                  ))}
                </div>
              ) : (
                <Empty icon={PlayCircle}>
                  لم تضف فيديوهات إلى المفضلة بعد.
                </Empty>
              )}
            </ResourceState>
          </section>
          <section className="section">
            <SectionTitle title="المكتبة المجانية" to="/library" />
            <ResourceState resource={pdfs}>
              {pdfs.data?.length ? (
                <div className="card-grid">
                  {pdfs.data.slice(0, 3).map((p) => (
                    <PdfCard compact key={p._id} pdf={p} />
                  ))}
                </div>
              ) : (
                <Empty icon={FileText}>لا توجد مذكرات منشورة بعد.</Empty>
              )}
            </ResourceState>
          </section>
          <SupportBanner />
        </div>
      </section>
    </>
  );
}
export function SubscriptionHistory() {
  const { profile } = usePlatform();
  return (
    <>
      <Hero
        title="اشتراكاتي"
        subtitle="تفاصيل اشتراكاتك على الديوانية"
        compact
      />
      <section className="site-container section">
        <div className="site-panel">
          <SectionTitle title="سجل الاشتراكات" to="/plans" label="عرض الخطط" />
          {profile.subscriptions?.length ? (
            <div className="table-scroll">
              <table className="site-table">
                <thead>
                  <tr>
                    <th>الخطة</th>
                    <th>البداية</th>
                    <th>النهاية</th>
                    <th>قيمة الخطة الحالية</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.subscriptions.map((s) => (
                    <tr key={s._id}>
                      <td>{s.planId?.title || "—"}</td>
                      <td>{date(s.startsAt)}</td>
                      <td>{date(s.endsAt)}</td>
                      <td>{s.planId ? price(s.planId) : "—"}</td>
                      <td>
                        {new Date(s.startsAt) > new Date()
                          ? "مجدول"
                          : new Date(s.endsAt) > new Date()
                            ? "نشط"
                            : "منتهٍ"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty icon={Crown}>لا توجد اشتراكات مسجلة لحسابك.</Empty>
          )}
        </div>
      </section>
    </>
  );
}
