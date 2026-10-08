import React, { useState } from 'react';
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Check, 
  UserPlus 
} from 'lucide-react';
import { GoogleIcon, FacebookIcon, AppleIcon } from '@/components/common/SocialIcons';
import { useStudent } from '@/hooks/useStudent';

interface LoginCardProps {
  onSwitchToRegister?: () => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({ onSwitchToRegister }) => {
  const { login, showToast } = useStudent();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('يرجى إدخال البريد الإلكتروني أو رقم الجوال');
      return;
    }
    if (!password) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }

    setIsSubmitting(true);
    try { await login({ identifier, password, rememberMe }); }
    catch (e) {setError(e instanceof Error ? e.message : 'تعذر تسجيل الدخول');}
    finally {setIsSubmitting(false);}
  };

  return (
    <div className="w-full max-w-xl bg-gradient-to-b from-[#0a1c36] via-[#09182f] to-[#071325] text-white rounded-3xl shadow-2xl border border-[#1d3a66] p-6 sm:p-8 md:p-9 relative overflow-hidden flex flex-col justify-between">
      {/* Background Kuwait Skyline Transparent Cutout Illustration at Bottom */}
      <div className="absolute inset-x-0 bottom-0 h-48 z-0 pointer-events-none overflow-hidden opacity-35">
        <img
          src="/kuwait-skyline-cutout.png"
          alt="أبراج مدينة الكويت"
          className="w-full h-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071325]/90 via-[#071325]/50 to-transparent" />
      </div>

      {/* Decorative Top Glow */}
      <div className="absolute top-0 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-sky-400">
            <LogIn className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight font-['Cairo']">
            تسجيل الدخول
          </h2>
        </div>
        <p className="mt-1 text-xs sm:text-sm text-slate-300 font-medium font-['Cairo']">
          مرحباً بعودتك مجدداً في الديوانية
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Email or Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5 text-right font-['Cairo']">
              البريد الإلكتروني أو رقم الجوال
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="أدخل بريدك الإلكتروني أو رقم الجوال"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[#224777] bg-[#0e274b]/80 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all text-right"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5 text-right font-['Cairo']">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-10 py-2.5 rounded-xl border border-[#224777] bg-[#0e274b]/80 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all text-right"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                  rememberMe ? 'bg-blue-600 text-white' : 'border border-[#2a4d7d] bg-[#0d2342]'
                }`}
              >
                {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
              <span
                onClick={() => setRememberMe(!rememberMe)}
                className="text-slate-300 font-medium cursor-pointer select-none"
              >
                تذكرني
              </span>
            </div>

            <a
              href="#forgot-password"
              onClick={(e) => {
                e.preventDefault();
                location.assign('/forgot-password');
              }}
              className="text-sky-400 hover:text-sky-300 hover:underline font-semibold"
            >
              نسيت كلمة المرور؟
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            <span>{isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>

        {/* Social Login Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#1d3a66]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#091931] px-3 text-slate-400 font-medium">
              أو تسجيل الدخول باستخدام
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
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[#1e3e6b] bg-[#0c2242]/80 hover:bg-[#112d54] text-slate-200 text-xs font-semibold transition-all shadow-xs"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => {
              showToast('تسجيل الدخول الاجتماعي غير متاح حاليًا. استخدم البريد وكلمة المرور.');
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[#1e3e6b] bg-[#0c2242]/80 hover:bg-[#112d54] text-slate-200 text-xs font-semibold transition-all shadow-xs"
          >
            <FacebookIcon className="w-4 h-4" />
            <span>Facebook</span>
          </button>

          <button
            type="button"
            onClick={() => {
              showToast('تسجيل الدخول الاجتماعي غير متاح حاليًا. استخدم البريد وكلمة المرور.');
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[#1e3e6b] bg-[#0c2242]/80 hover:bg-[#112d54] text-slate-200 text-xs font-semibold transition-all shadow-xs"
          >
            <AppleIcon className="w-4 h-4" fill="#ffffff" />
            <span>Apple</span>
          </button>
        </div>
      </div>

      {/* Switch to Register Button at bottom of card */}
      <div className="relative z-10 mt-8 pt-4">
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="w-full py-2.5 px-4 rounded-xl border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>إنشاء حساب جديد</span>
        </button>
      </div>
    </div>
  );
};

