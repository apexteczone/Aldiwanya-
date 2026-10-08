import { useStudent } from '@/hooks/useStudent';
import { 
  Receipt, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ShieldCheck
} from 'lucide-react';

export const SubscriptionHistorySection: React.FC = () => {
  const { subscription, setIsRenewModalOpen } = useStudent();

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a1c36] p-6 rounded-3xl border border-[#1b3459]">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2 font-['Cairo']">
            <Receipt className="w-5 h-5 text-sky-400" />
            <span>سجل الاشتراكات وعمليات الدفع (KWD)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-['Cairo']">
            سجل موثق لجميع فترات الاشتراك السابقة والحالية، مع الاحتفاظ بلقطات الأسعار والتواريخ.
          </p>
        </div>

        <button
          onClick={() => setIsRenewModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>تجديد / تمديد الاشتراك</span>
        </button>
      </div>

      {/* Current Active Plan Snapshot */}
      {subscription.status === 'active' && subscription.currentPlan && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              فترة الاشتراك الحالية الفعالة
            </span>
            <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              مرجع الطلب: {subscription.currentPlan.orderReference}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">اسم الباقة:</span>
              <span className="text-white font-bold text-sm">{subscription.currentPlan.name}</span>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">المبلغ المدفوع:</span>
              <span className="text-sky-400 font-extrabold text-sm">{subscription.currentPlan.price} {subscription.currentPlan.currency}</span>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">تاريخ البدء:</span>
              <span className="text-slate-200 font-medium">{formatDateKuwait(subscription.currentPlan.startsAt)}</span>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">تاريخ الانتهاء:</span>
              <span className="text-emerald-400 font-bold">{formatDateKuwait(subscription.currentPlan.endsAt)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Periods Table / Cards */}
      <div className="bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>الفترات السابقة وسجل الفواتير</span>
          </h4>
          <span className="text-xs text-slate-400">
            {subscription.previousPeriods.length} عملية مسجلة
          </span>
        </div>

        {subscription.previousPeriods.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Receipt className="w-10 h-10 mx-auto mb-3 text-slate-600 opacity-60" />
            <p>لا توجد فواتير أو اشتراكات مسجلة بعد في هذا الحساب.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {subscription.previousPeriods.map((period) => (
              <div
                key={period.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/80 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{period.planName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      period.status === 'succeeded' 
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {period.status === 'succeeded' ? 'ناجح ومسجل' : 'منتهي الصلاحية'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                    <span className="font-mono text-slate-500">{period.orderId}</span>
                    <span>•</span>
                    <span>تاريخ العملية: {period.date}</span>
                    <span>•</span>
                    <span>الفترة: من {period.startsAt} إلى {period.endsAt}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <span className="text-base font-extrabold text-sky-400">
                    {period.amount} {period.currency}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>إيصال إلكتروني</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
