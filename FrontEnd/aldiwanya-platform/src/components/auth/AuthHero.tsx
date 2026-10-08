import React from 'react';

export const AuthHero: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden bg-[#071324] py-14 md:py-20">
      {/* High-Resolution Kuwait Skyline Wide Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/kuwait-skyline-wide.jpg"
          alt="أفق وأبراج دولة الكويت"
          className="w-full h-full object-cover object-center opacity-35 filter brightness-90 contrast-110"
        />
        {/* Deep Navy Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#071324]/85 via-[#08172c]/75 to-[#071324]" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#071324]/50 to-[#071324]" />

        {/* Subtle Islamic Geometric Lattice Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(56, 189, 248, 0.35) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(56, 189, 248, 0.35) 2%, transparent 0%)`,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-sky-300 text-xs font-semibold mb-3 backdrop-blur-md">
          <span>🇰🇼</span>
          <span>منصة تعليمية كويتية رائدة للمرحلة الثانوية</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-lg font-['Cairo']">
          مرحباً بك في الديوانية
        </h1>
        <p className="mt-3.5 text-base sm:text-lg md:text-xl text-slate-200 font-medium tracking-wide font-['Cairo'] max-w-2xl">
          رحلتك نحو التعلم تبدأ من هنا
        </p>

        {/* Decorative subtle accent line */}
        <div className="mt-5 flex items-center justify-center gap-2">
          <span className="w-16 h-[1.5px] bg-gradient-to-r from-transparent via-sky-400/70 to-transparent" />
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
          <span className="w-16 h-[1.5px] bg-gradient-to-r from-transparent via-sky-400/70 to-transparent" />
        </div>
      </div>
    </section>
  );
};
