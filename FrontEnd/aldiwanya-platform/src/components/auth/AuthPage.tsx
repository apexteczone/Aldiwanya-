import React, { useState } from 'react';
import { AuthNavbar } from './AuthNavbar';
import { AuthHero } from './AuthHero';
import { RegisterCard } from './RegisterCard';
import { LoginCard } from './LoginCard';
import { FeatureHighlights } from './FeatureHighlights';
import { AuthFooter } from './AuthFooter';
import { CheckCircle2, UserPlus, LogIn, Sparkles, LayoutDashboard } from 'lucide-react';
import { useStudent } from '@/hooks/useStudent';

export const AuthPage: React.FC = () => {
  const { toastMessage, setPageView } = useStudent();
  const [activeMobileTab, setActiveMobileTab] = useState<'register' | 'login'>('register');

  return (
    <div className="min-h-screen flex flex-col bg-[#071324] text-slate-100 font-sans selection:bg-blue-600/30 selection:text-blue-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 animate-bounce duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0a1c36] border border-sky-500/40 text-white shadow-2xl text-xs font-semibold backdrop-blur-lg">
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <AuthNavbar />

      {/* Top Banner / Reviewer Quick Navigator */}
      <div className="bg-[#091a32] border-b border-[#1b3459] px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-300">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-sky-300 font-['Cairo']">صفحة التسجيل والدخول لمنصة الديوانية</span>
            <span className="text-slate-400 hidden sm:inline">— مصممة وفق أحدث هوية بصرية وثيم كويتي عصري</span>
          </div>

          <button
            onClick={() => setPageView('dashboard')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-sky-300 border border-blue-500/30 transition-all font-medium"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>الانتقال المباشر للوحة تحكم الطالب (Dashboard)</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <AuthHero />

      {/* Main Content Area: The Dual Registration & Login Cards */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 z-20 pb-8">
        {/* Mobile Tab Switcher (Visible on small screens) */}
        <div className="lg:hidden flex items-center justify-center mb-6">
          <div className="inline-flex p-1.5 rounded-2xl bg-[#0c2242] border border-[#1e3e6b] shadow-lg">
            <button
              onClick={() => setActiveMobileTab('register')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMobileTab === 'register'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>إنشاء حساب جديد</span>
            </button>
            <button
              onClick={() => setActiveMobileTab('login')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMobileTab === 'login'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول</span>
            </button>
          </div>
        </div>

        {/* Desktop Side-by-Side Dual Cards / Mobile Tab View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch justify-items-center">
          {/* Registration Card (Always shown on desktop; conditioned on mobile) */}
          <div className={`w-full flex justify-center ${activeMobileTab === 'register' ? 'block' : 'hidden lg:flex'}`}>
            <RegisterCard />
          </div>

          {/* Login Card (Always shown on desktop; conditioned on mobile) */}
          <div className={`w-full flex justify-center ${activeMobileTab === 'login' ? 'block' : 'hidden lg:flex'}`}>
            <LoginCard onSwitchToRegister={() => setActiveMobileTab('register')} />
          </div>
        </div>

        {/* 4 Feature Highlights Ribbon */}
        <FeatureHighlights />
      </main>

      {/* Footer */}
      <AuthFooter />
    </div>
  );
};
