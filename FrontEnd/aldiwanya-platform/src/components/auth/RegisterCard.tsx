import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  ArrowLeft, 
  GraduationCap, 
  ChevronDown,
  Check
} from 'lucide-react';
import { KuwaitFlag } from '@/components/common/KuwaitFlag';
import { GoogleIcon, FacebookIcon, AppleIcon } from '@/components/common/SocialIcons';
import { DiwaniyaLogo } from '@/components/common/DiwaniyaLogo';
import { useStudent } from '@/hooks/useStudent';

export const RegisterCard: React.FC = () => {
  const { register, setPageView, showToast } = useStudent();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countryCode, setCountryCode] = useState('+965');
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const countries = [
    { name: 'الكويت', code: '+965', flag: <KuwaitFlag width={18} height={12} /> },
    { name: 'السعودية', code: '+966', flag: <span className="text-xs">🇸🇦</span> },
    { name: 'الإمارات', code: '+971', flag: <span className="text-xs">🇦🇪</span> },
    { name: 'قطر', code: '+974', flag: <span className="text-xs">🇶🇦</span> },
    { name: 'البحرين', code: '+973', flag: <span className="text-xs">🇧🇭</span> },
    { name: 'عمان', code: '+968', flag: <span className="text-xs">🇴🇲</span> },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('يرجى إدخال الاسم الكامل');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    if (!phone.trim()) {
      setError('يرجى إدخال رقم الجوال');
      return;
    }
    if (password.length < 12) {
      setError('كلمة المرور يجب أن لا تقل عن 12 خانات');
      return;
    }
    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }
    if (!agreeTerms) {
      setError('يجب الموافقة على الشروط والأحكام للمتابعة');
      return;
    }

    setIsSubmitting(true);
    try {await register({fullName,email,phone:countryCode+phone,password});}
    catch(e){setError(e instanceof Error?e.message:'تعذر إنشاء الحساب');}
    finally{setIsSubmitting(false);}
  };

  return (
    <div className="w-full max-w-xl bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-100/90 p-6 sm:p-8 md:p-9 relative flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <UserPlus className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight font-['Cairo']">
                إنشاء حساب جديد
              </h2>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium font-['Cairo']">
                انضم إلى الديوانية واستمتع بتجربة تعليمية مميزة
              </p>
            </div>
          </div>
          <div className="hidden sm:block">
            <DiwaniyaLogo size="sm" variant="colored" />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 text-right font-['Cairo']">
              الاسم الكامل
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="أدخل اسمك الكامل"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-right"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 text-right font-['Cairo']">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-right"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Mobile Phone with Country Code */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 text-right font-['Cairo']">
              رقم الجوال
            </label>
            <div className="relative flex items-center">
              {/* Phone Icon on Right */}
              <div className="relative w-full">
                <input
                  type="tel"
                  placeholder="أدخل رقم الجوال"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pr-10 pl-28 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-right"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Country Code Pill on Left */}
              <div className="absolute left-1.5 top-1/2 -translate-y-1/2">
                <button
                  type="button"
                  onClick={() => setShowCountryMenu(!showCountryMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200/80 transition-all"
                >
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                  <span dir="ltr">{countryCode}</span>
                  <KuwaitFlag width={18} height={12} />
                </button>

                {showCountryMenu && (
                  <div className="absolute left-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 text-xs">
                    {countries.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setCountryCode(c.code);
                          setShowCountryMenu(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 text-slate-700"
                      >
                        <span className="font-semibold" dir="ltr">{c.code}</span>
                        <div className="flex items-center gap-1.5">
                          <span>{c.name}</span>
                          {c.flag}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 text-right font-['Cairo']">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-right"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 text-right font-['Cairo']">
              تأكيد كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="أعد إدخال كلمة المرور"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pr-10 pl-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-right"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Agree Terms Checkbox */}
          <div className="flex items-center gap-2 pt-1 text-right">
            <button
              type="button"
              onClick={() => setAgreeTerms(!agreeTerms)}
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                agreeTerms ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white'
              }`}
            >
              {agreeTerms && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
            <span
              onClick={() => setAgreeTerms(!agreeTerms)}
              className="text-xs text-slate-600 font-medium cursor-pointer select-none"
            >
              أوافق على{' '}
              <a href="#terms" className="text-blue-600 hover:underline font-semibold">
                الشروط والأحكام
              </a>{' '}
              و
              <a href="#privacy" className="text-blue-600 hover:underline font-semibold">
                سياسة الخصوصية
              </a>
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            <span>{isSubmitting ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>

        {/* Social Register Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400 font-medium">
              أو التسجيل باستخدام
            </span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => {
              showToast('تسجيل الدخول الاجتماعي غير متاح حاليًا. استخدم البريد وكلمة المرور.');
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => {
              showToast('تسجيل الدخول الاجتماعي غير متاح حاليًا. استخدم البريد وكلمة المرور.');
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs"
          >
            <FacebookIcon className="w-4 h-4" />
            <span>Facebook</span>
          </button>

          <button
            type="button"
            onClick={() => {
              showToast('تسجيل الدخول الاجتماعي غير متاح حاليًا. استخدم البريد وكلمة المرور.');
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs"
          >
            <AppleIcon className="w-4 h-4" fill="#000000" />
            <span>Apple</span>
          </button>
        </div>
      </div>

      {/* Bottom Perk Banner */}
      <div className="mt-6 p-3.5 rounded-2xl bg-[#f0f6ff] border border-blue-100 flex items-center justify-between text-right">
        <div>
          <div className="text-xs font-extrabold text-blue-950 font-['Cairo']">
            بعد التسجيل يمكنك الوصول إلى
          </div>
          <div className="mt-1 text-[11px] text-blue-800/90 font-medium flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1">• المذكرات الشاملة</span>
            <span className="flex items-center gap-1">• بنوك الأسئلة المحلولة</span>
            <span className="flex items-center gap-1">• باقات الاشتراك الدراسية</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 shrink-0">
          <GraduationCap className="w-5 h-5 stroke-[2.2]" />
        </div>
      </div>

      {/* Switch to Login Link */}
      <div className="mt-5 pt-3 border-t border-slate-100 text-center">
        <button
          type="button"
          onClick={() => setPageView('login')}
          className="text-xs text-slate-600 hover:text-blue-600 font-medium transition-colors inline-flex items-center gap-1"
        >
          <span>لديك حساب بالفعل في المنصة؟</span>
          <span className="text-blue-600 font-bold hover:underline">تسجيل الدخول هنا</span>
        </button>
      </div>
    </div>
  );
};

