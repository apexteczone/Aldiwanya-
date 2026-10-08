import { useStudent } from '@/hooks/useStudent';
import { 
  BookOpen, 
  PlayCircle, 
  Lock, 
  Unlock, 
  Clock, 
  Sparkles,
  Video
} from 'lucide-react';

export const EnrolledCoursesSection: React.FC = () => {
  const { courses, subscription, setIsRenewModalOpen } = useStudent();
  const isSubscribed = subscription.status === 'active';

  const handleOpenLesson = (id: string) => {location.assign('/courses/'+id);};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2 font-['Cairo']">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <span>مناهج الرياضيات المقررة وشروحات الدروس</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-['Cairo']">
            منهج وزارة التربية بدولة الكويت — شروحات تفصيلية، تمارين كراسة التمارين، وتطبيقات عملية.
          </p>
        </div>

        {!isSubscribed && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-sky-300 text-xs">
            <Lock className="w-3.5 h-3.5" />
            <span>الدروس المدفوعة مقفلة (تتوفر فيديوهات مجانية للمعاينة)</span>
          </div>
        )}
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const progressPercent = Math.round((course.completedLessons / course.totalLessons) * 100);
          return (
            <div
              key={course.id}
              className="group relative flex flex-col bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Thumbnail Header */}
              <div className="relative h-44 overflow-hidden bg-slate-950">
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Grade Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900/90 text-white backdrop-blur border border-slate-700/80">
                    {course.gradeName}
                  </span>
                </div>

                {/* Lock Status */}
                <div className="absolute top-3 left-3">
                  {isSubscribed ? (
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/90 text-slate-950 flex items-center gap-1 shadow">
                      <Unlock className="w-3 h-3" />
                      مفتوح بالكامل
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-500/90 text-slate-950 flex items-center gap-1 shadow">
                      <Lock className="w-3 h-3" />
                      {course.freeVideosCount} دروس مجانية
                    </span>
                  )}
                </div>

                {/* Bottom title on thumbnail */}
                <div className="absolute bottom-3 right-3 left-3">
                  <h4 className="text-base font-bold text-white leading-snug drop-shadow-md font-['Cairo']">
                    {course.title}
                  </h4>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                
                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">إنجاز المقرر:</span>
                    <span className="font-semibold text-sky-400">
                      {course.completedLessons} من أصل {course.totalLessons} درس ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-sky-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Last watched / Recommended lesson */}
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>آخر درس تمت مشاهدته:</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 truncate font-['Cairo']">
                    {course.lastLessonTitle}
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-2">
                  {isSubscribed ? (
                    <button
                      onClick={() => handleOpenLesson(course.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>متابعة الشرح والدروس</span>
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenLesson(course.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5 text-cyan-400" />
                        <span>معاينة مجانية</span>
                      </button>

                      <button
                        onClick={() => setIsRenewModalOpen(true)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-sky-300 border border-blue-500/30 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>فتح الكل</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

