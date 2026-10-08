import { useState } from 'react';
import { useStudent } from '@/hooks/useStudent';

import { 
  X, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Zap,
  ArrowLeft
} from 'lucide-react';

export const RenewModal: React.FC = () => {
  const { isRenewModalOpen, setIsRenewModalOpen, renewSubscription, subscription, plans: AVAILABLE_PLANS } = useStudent();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan_semester');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isRenewModalOpen) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {await renewSubscription(selectedPlanId);} finally {setIsProcessing(false);}
  };

  const selectedPlan = AVAILABLE_PLANS.find(p => p.id === selectedPlanId) || AVAILABLE_PLANS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1b3459] bg-[#071324]/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-sky-400">
                <Sparkles className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-bold text-white font-['Cairo']">
                {subscription.status === 'active' ? 'تمديد باقة الاشتراك الحالية' : 'اختيار باقة الاشتراك في منصة الديوانية'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-['Cairo']">
              اختر الفترة المناسبة لك لفتح شروحات كافة صفوف المرحلة الثانوية (10، 11، 12) لدولة الكويت
            </p>
          </div>

          <button
            onClick={() => setIsRenewModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p role="status" className="p-4 text-amber-200">الدفع الإلكتروني غير مفعّل حاليًا. جارٍ استكمال الربط مع ماي فاتورة.</p>
        {/* Plans Selection */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`relative flex flex-col justify-between p-5 rounded-2xl cursor-pointer transition-all duration-200 border text-right ${
                    isSelected
                      ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/15 scale-[1.02]'
                      : 'bg-[#08172c] border-[#1d3a66] hover:border-slate-700'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold text-[10px] px-3 py-0.5 rounded-full shadow">
                      الباقة الأكثر طلباً
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-300">
                        {plan.periodLabel}
                      </span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-sky-400 bg-sky-400 text-slate-950' : 'border-slate-600'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <h4 className="text-lg font-bold text-white mb-2 font-['Cairo']">
                      {plan.name}
                    </h4>

                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-extrabold text-sky-400">
                        {plan.price}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {plan.currency}
                      </span>
                    </div>

                    {plan.savingsNote && (
                      <div className="mb-4 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        {plan.savingsNote}
                      </div>
                    )}

                    <ul className="space-y-2 text-xs text-slate-300 font-['Cairo']">
                      {plan.features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment summary & Simulation CTA */}
          <div className="bg-[#08172c] p-5 rounded-2xl border border-[#1b3459] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-['Cairo']">
                <span>الباقة المختارة:</span>
                <span className="font-bold text-white">{selectedPlan ? `${selectedPlan.name} (${selectedPlan.periodLabel})` : 'لا توجد خطط متاحة حاليًا'}</span>
              </div>
              <div className="text-lg font-black text-sky-400 mt-1 font-['Cairo']">
                الإجمالي للدفع: {selectedPlan?.price ?? 0} {selectedPlan?.currency ?? 'KWD'}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1 font-['Cairo']">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>الدفع غير مفعّل حتى اكتمال الربط مع ماي فاتورة</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsRenewModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="button"
                disabled
                onClick={handleConfirm}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 active:scale-[0.98] cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>{isProcessing ? 'جاري التحقق…' : 'الدفع غير متاح حاليًا'}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
