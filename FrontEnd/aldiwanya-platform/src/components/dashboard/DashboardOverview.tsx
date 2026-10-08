import { useStudent } from '@/hooks/useStudent';
import { SubscriptionBanner } from './SubscriptionBanner';
import { GRADE_LABELS } from '@/data/mockStudentData';
import { 
  PlayCircle, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  ChevronLeft,
  Award
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { student, subscription, courses, pdfs, setActiveTab, setIsRenewModalOpen, showToast, downloadPdf } = useStudent();

  const totalLessons = courses.reduce((acc, c) => acc + c.totalLessons, 0);
  const completedLessons = courses.reduce((acc, c) => acc + c.completedLessons, 0);
  const overallPercentage = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const primaryCourse = courses[0];

  return (
    <div className="space-y-8">
      {/* Student Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              مرحباً بك، {student.fullName} 👋
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
            <span>لوحة تحكم ومتابعة دروس الرياضيات</span>
            <span>•</span>
            <span className="text-sky-400 font-semibold">{GRADE_LABELS[student.grade]}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('courses')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0a1c36] border border-[#1b3459] hover:border-sky-500/40 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>تصفح المناهج</span>
          </button>
          
          <button
            onClick={() => setActiveTab('pdfs')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-white text-xs font-semibold transition-all"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>مكتبة المذكرات المجانية</span>
          </button>
        </div>
      </div>

      {/* Subscription Status Card (FE10 confirmed states) */}
      <SubscriptionBanner />

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">حالة الاشتراك</span>
            <span className={`w-2.5 h-2.5 rounded-full ${
              subscription.status === 'active' ? 'bg-emerald-400 animate-pulse' :
              subscription.status === 'expired' ? 'bg-amber-400' : 'bg-rose-400'
            }`} />
          </div>
          <div className="text-lg font-bold text-white">
            {subscription.status === 'active' ? 'نشط ومستمر' :
             subscription.status === 'expired' ? 'منتهي الصلاحية' : 'غير مشترك'}
          </div>
          <div className="text-[11px] text-slate-500">
            {subscription.status === 'active' ? `${subscription.currentPlan?.daysRemaining} يوم متبقي` : 'باقات الفصل متوفرة'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">الدروس المنجزة</span>
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-white">
            {completedLessons} درس
          </div>
          <div className="text-[11px] text-slate-500">
            من أصل {totalLessons} درس في المقررات
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">نسبة التقدم الإجمالية</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400">
            %{overallPercentage}
          </div>
          <div className="text-[11px] text-slate-500">
            مستوى متقدم في المقرر
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">المذكرات المتاحة</span>
            <FileText className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-white">
            {pdfs.length} ملفات PDF
          </div>
          <div className="text-[11px] text-cyan-400">
            تحميل مجاني دائم
          </div>
        </div>
      </div>

      {/* Quick Resume Watching Section */}
      {primaryCourse && (
        <div className="p-6 rounded-3xl bg-[#0a1c36] border border-[#1b3459] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <PlayCircle className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  متابعة الشرح من حيث توقفت
                </span>
                <span className="text-[10px] text-sky-400 font-semibold">{primaryCourse.gradeName}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1 font-['Cairo']">
                {primaryCourse.lastLessonTitle}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-['Cairo']">
                مقرر: {primaryCourse.title}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (subscription.status === 'active') {
                location.assign(`/courses/${primaryCourse.id}`);
              } else {
                showToast('هذا الدرس يتطلب اشتراكاً نشطاً. يرجى تجديد أو تفعيل باقتك للمشاهدة.');
                setIsRenewModalOpen(true);
              }
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all shrink-0 active:scale-[0.98] cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            <span>متابعة المشاهدة الآن</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Two Columns: Recent Courses Preview & Recommended PDFs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Enrolled Courses Preview */}
        <div className="p-6 rounded-3xl bg-[#0a1c36] border border-[#1b3459] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b3459]">
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-['Cairo']">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>مقررات الرياضيات للمرحلة الثانوية</span>
            </h3>
            <button
              onClick={() => setActiveTab('courses')}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>عرض الكل</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {courses.slice(0, 3).map((course) => {
              const pct = Math.round((course.completedLessons / course.totalLessons) * 100);
              return (
                <div
                  key={course.id}
                  onClick={() => setActiveTab('courses')}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer flex items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">
                        {course.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {course.completedLessons} من {course.totalLessons} درس مكتمل
                      </p>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="text-xs font-bold text-sky-400">%{pct}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Free PDFs Preview */}
        <div className="p-6 rounded-3xl bg-[#0a1c36] border border-[#1b3459] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b3459]">
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-['Cairo']">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>أحدث مذكرات ونماذج الامتحانات المجانية</span>
            </h3>
            <button
              onClick={() => setActiveTab('pdfs')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>المكتبة كاملة</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pdfs.slice(0, 3).map((pdf) => (
              <div
                key={pdf.id}
                onClick={() => {
                  void downloadPdf(pdf.id);
                }}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer flex items-center justify-between gap-4 transition-all"
              >
                <div>
                  <div className="text-[10px] text-sky-400 font-bold mb-0.5">
                    {pdf.category}
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">
                    {pdf.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {pdf.gradeName} • الحجم: {pdf.size}
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-slate-800 text-cyan-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};


