import React, { useState } from 'react';
import { DiwaniyaLogo } from '@/components/common/DiwaniyaLogo';
import { Send, CheckCircle2 } from 'lucide-react';

export const AuthFooter: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      setSubscribed(true);
      setTimeout(() => {
        setNewsletterEmail('');
        setSubscribed(false);
      }, 4000);
    }
  };

  return (
    <footer className="relative w-full bg-[#061224] border-t border-[#132845] text-slate-300 overflow-hidden pt-12 pb-24 md:pb-28">
      {/* Background Kuwait Skyline Transparent Cutout at Bottom */}
      <div className="absolute inset-x-0 bottom-0 h-36 sm:h-44 pointer-events-none opacity-30 overflow-hidden z-0">
        <img
          src="/kuwait-skyline-cutout.png"
          alt="أفق مدينة الكويت ليلاً"
          className="w-full h-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061224] via-transparent to-[#061224]" />
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10">
          
          {/* Right Column: Logo, Socials, Copyright (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-start text-right">
            <DiwaniyaLogo size="md" variant="white" />

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-6">
              {/* YouTube */}
              <a
                href="#youtube"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-[#0c2242] border border-[#1d3b66] hover:border-sky-400 flex items-center justify-center text-slate-300 hover:text-white transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="#instagram"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-[#0c2242] border border-[#1d3b66] hover:border-sky-400 flex items-center justify-center text-slate-300 hover:text-white transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href="#twitter"
                aria-label="X (Twitter)"
                className="w-8 h-8 rounded-full bg-[#0c2242] border border-[#1d3b66] hover:border-sky-400 flex items-center justify-center text-slate-300 hover:text-white transition-all"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="#facebook"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-[#0c2242] border border-[#1d3b66] hover:border-sky-400 flex items-center justify-center text-slate-300 hover:text-white transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>

            <p className="mt-4 text-xs text-slate-400 font-['Cairo']">
              جميع الحقوق محفوظة © 2025 الديوانية
            </p>
          </div>

          {/* Quick Links Column (2.5 cols) */}
          <div className="lg:col-span-2 text-right">
            <h4 className="text-sm font-bold text-white mb-3 font-['Cairo']">
              روابط سريعة
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-['Cairo']">
              <li>
                <a href="#home" className="hover:text-sky-300 transition-colors">
                  الرئيسية
                </a>
              </li>
              <li>
                <a href="#courses" className="hover:text-sky-300 transition-colors">
                  المحتوى التعليمي
                </a>
              </li>
              <li>
                <a href="#subscriptions" className="hover:text-sky-300 transition-colors">
                  الاشتراكات
                </a>
              </li>
              <li>
                <a href="#library" className="hover:text-sky-300 transition-colors">
                  المكتبة المجانية
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-sky-300 transition-colors">
                  تواصل معنا
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column (2.5 cols) */}
          <div className="lg:col-span-2 text-right">
            <h4 className="text-sm font-bold text-white mb-3 font-['Cairo']">
              الدعم
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-['Cairo']">
              <li>
                <a href="#faq" className="hover:text-sky-300 transition-colors">
                  الأسئلة الشائعة
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-sky-300 transition-colors">
                  سياسة الخصوصية
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-sky-300 transition-colors">
                  شروط الاستخدام
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Column (3.5 cols) */}
          <div className="lg:col-span-4 text-right">
            <h4 className="text-sm font-bold text-white mb-1.5 font-['Cairo']">
              اشترك في نشرتنا البريدية
            </h4>
            <p className="text-xs text-slate-400 mb-4 font-['Cairo']">
              احصل على أحدث الدورات والعروض الخاصة
            </p>

            <form onSubmit={handleNewsletter} className="relative flex items-center">
              <input
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-[#0c2242] border border-[#1d3b66] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all text-right"
              />
              <button
                type="submit"
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all shadow-sm cursor-pointer"
                title="إرسال"
              >
                <Send className="w-3.5 h-3.5 -scale-x-100" />
              </button>
            </form>

            {subscribed && (
              <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>شكراً لاشتراكك في نشرتنا البريدية!</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </footer>
  );
};
