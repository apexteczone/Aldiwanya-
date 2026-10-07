import { useStudent } from '@/hooks/useStudent';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Sparkles, 
  PlayCircle,
  CreditCard,
  Lock,
  Unlock
} from 'lucide-react';

export const SubscriptionBanner: React.FC = () => {
  const { subscription, setIsRenewModalOpen, setActiveTab } = useStudent();

  const formatDateKuwait = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('ar-KW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Kuwait'
      });
    } catch {
      return isoString;
    }
  };

  // State: ACTIVE
  if (subscription.status === 'active' && subscription.currentPlan) {
    const { currentPlan } = subscription;
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/30 p-6 md:p-8 shadow-xl shadow-emerald-950/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                اشتراك نشط — مفعل
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                جميع الدروس والفيديوهات مفتوحة
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {currentPlan.name}
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                وصول غير محدود لجميع دروس وشروحات الرياضيات للمرحلة الثانوية بالكويت.
              </p>
            </div>

            {/* Dates & Expiry Info in Kuwait Time */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
              <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>تاريخ التفعيل: </span>
                <span className="font-semibold text-white">{formatDateKuwait(currentPlan.startsAt)}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>ينتهي في: </span>
                <span className="font-semibold text-white">{formatDateKuwait(currentPlan.endsAt)}</span>
                <span className="text-[10px] text-slate-400">(بتوقيت الكويت)</span>
              </div>

              <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-emerald-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-bold">{currentPlan.daysRemaining} يوم</span>
                <span>متبقي في اشتراكك</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('courses')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
            >
              <PlayCircle className="w-4 h-4" />
              <span>متابعة الدروس الآن</span>
            </button>

            <button
              onClick={() => setIsRenewModalOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 font-semibold text-sm transition-all"
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>تمديد الاشتراك مسبقاً</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State: EXPIRED
  if (subscription.status === 'expired') {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c2242] via-[#091a32] to-[#071324] border border-[#1e3e6b] p-6 md:p-8 shadow-xl shadow-blue-950/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <AlertTriangle className="w-3.5 h-3.5" />
                انتهى الاشتراك
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/30">
                <Lock className="w-3.5 h-3.5" />
                المحتوى المدفوع مغلق حالياً
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Cairo']">
                انتهت صلاحية اشتراكك الدراسي
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed font-['Cairo']">
                وفقاً لسياسة المنصة، يتم حجب الفيديوهات والدروس المدفوعة بعد انتهاء الاشتراك. يمكنك تصفح مكتبة المذكرات مجاناً، أو تجديد اشتراكك فوراً لمتابعة الدروس دون انقطاع.
              </p>
            </div>

            {subscription.currentPlan?.endsAt && (
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>تاريخ انتهاء آخر اشتراك:</span>
                <span className="font-semibold text-slate-300">
                  {formatDateKuwait(subscription.currentPlan.endsAt)} (بتوقيت الكويت)
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsRenewModalOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>تجديد الاشتراك الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('pdfs')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-semibold transition-all"
            >
              <span>المذكرات المجانية</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State: NONE (No subscription)
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 md:p-8 shadow-xl shadow-indigo-950/20">
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              <ShieldAlert className="w-3.5 h-3.5" />
              حساب جديد — بدون اشتراك حالياً
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              عروض الفصل الدراسي متوفرة
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              اشترك الآن وافتح منهج الرياضيات كاملاً
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              احصل على شروحات فيديو تفصيلية لمنهج الكويت (الصف 10، 11، 12)، حلول نماذج اختبارات الوزارة السابقة، ومذكرات تلخيص القوانين مع إمكانية تجربة الفيديوهات المجانية فوراً.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              شرح مبسط لكافة الوحدات
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              مذكرات PDF مجانية متاحة دائماً
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              دعم فني واستفسارات دراسية
            </span>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
          <button
            onClick={() => setIsRenewModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>اختيار باقة والاشتراك الآن</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-semibold transition-all"
          >
            <span>مشاهدة الدروس المجانية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
