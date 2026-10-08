import React, { useState } from 'react';
import { DiwaniyaLogo } from '@/components/common/DiwaniyaLogo';
import { KuwaitFlag } from '@/components/common/KuwaitFlag';
import { Search, ChevronDown, Menu, X, UserPlus, LogIn } from 'lucide-react';
import { useStudent } from '@/hooks/useStudent';

export const AuthNavbar: React.FC = () => {
  const { pageView, setPageView } = useStudent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 w-full bg-[#08172c]/95 border-b border-[#1b3459]/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3 md:gap-6">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <DiwaniyaLogo size="md" variant="white" />
          </div>

          {/* Center Navigation Links - Desktop */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-200">
            <a href="#home" className="text-white hover:text-sky-400 transition-colors">
              الرئيسية
            </a>
            <a href="#content" className="text-slate-300 hover:text-sky-400 transition-colors">
              المحتوى التعليمي
            </a>
            <a href="#subscriptions" className="text-slate-300 hover:text-sky-400 transition-colors">
              الاشتراكات
            </a>
            <a href="#library" className="text-slate-300 hover:text-sky-400 transition-colors">
              المكتبة والمذكرات
            </a>
            <a href="#contact" className="text-slate-300 hover:text-sky-400 transition-colors">
              تواصل معنا
            </a>
          </nav>

          {/* Left Actions: Search + Language Selector + Page Switch Button */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative hidden lg:block w-60 xl:w-64">
              <input
                type="text"
                placeholder="ابحث عن كورس أو موضوع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-full bg-[#0c2240]/80 border border-[#1e3e6b] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all text-right"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0c2240]/80 border border-[#1e3e6b] text-slate-200 text-xs font-semibold hover:border-sky-500/50 cursor-pointer transition-all select-none">
              <KuwaitFlag width={20} height={13} />
              <span>عربي</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Switch between Login and Register */}
            {pageView === 'login' ? (
              <button
                onClick={() => setPageView('register')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-sky-600 text-white hover:from-blue-500 hover:to-sky-500 text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>إنشاء حساب</span>
              </button>
            ) : (
              <button
                onClick={() => setPageView('login')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-sky-300 hover:text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#0c2240] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0a1c36] border-b border-[#1b3459] px-4 pt-2 pb-4 space-y-2 text-sm text-slate-200">
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="ابحث عن كورس أو موضوع..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-[#0e274a] border border-[#234575] text-xs text-white placeholder-slate-400 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <a href="#home" className="block py-2 px-3 rounded-lg hover:bg-blue-900/30">
            الرئيسية
          </a>
          <a href="#content" className="block py-2 px-3 rounded-lg hover:bg-blue-900/30">
            المحتوى التعليمي
          </a>
          <a href="#subscriptions" className="block py-2 px-3 rounded-lg hover:bg-blue-900/30">
            الاشتراكات
          </a>
          <a href="#library" className="block py-2 px-3 rounded-lg hover:bg-blue-900/30">
            المكتبة والمذكرات
          </a>
          <a href="#contact" className="block py-2 px-3 rounded-lg hover:bg-blue-900/30">
            تواصل معنا
          </a>
        </div>
      )}
    </header>
  );
};
