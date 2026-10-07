import React from 'react';
import { DiwaniyaLogo } from '@/components/common/DiwaniyaLogo';

export const StudentFooter: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-[#132845] bg-[#061224] py-10 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
        <div className="space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <DiwaniyaLogo size="sm" variant="white" />
          </div>
          <p className="text-slate-500 text-[11px] mt-1 font-['Cairo']">
            منصة تعليمية عربية رائدة لتدريس مناهج دولة الكويت (المرحلة الثانوية).
          </p>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-400 font-['Cairo']">
          <span className="text-sky-400">بوابة الطالب الآمنة</span>
          <span>•</span>
          <span>الدينار الكويتي (KWD)</span>
          <span>•</span>
          <span>جميع الحقوق محفوظة © 2025</span>
        </div>
      </div>
    </footer>
  );
};
