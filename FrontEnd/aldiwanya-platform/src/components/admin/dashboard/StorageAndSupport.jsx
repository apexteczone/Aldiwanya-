import React from 'react';
import { Headphones } from 'lucide-react';

export const StorageAndSupport = ({ usedStorageGB = 28.5, totalStorageGB = 100 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* مساحة التخزين */}
      <div className="bg-white border border-border rounded-2xl p-4 space-y-2.5 shadow-xs">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-text-primary">مساحة التخزين المستخدمة</span>
          <span className="text-text-muted font-bold">28%</span>
        </div>
        <p className="text-xs text-text-muted font-bold">{usedStorageGB} GB / {totalStorageGB} GB</p>
        
        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
          <div className="bg-blue-500 h-full w-[28%]" />
          <div className="bg-sky-400 h-full w-[12%]" />
          <div className="bg-slate-300 h-full w-[15%]" />
        </div>

        <div className="flex items-center gap-3 text-[10px] text-text-muted pt-1 flex-wrap">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> (7.2 GB) (PDF GB)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400" /> (7.1 GB) (3.2 GB)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300" /> (3.2 GB) محتوى آخر</span>
        </div>
      </div>

      {/* الدعم الفني */}
      <div className="bg-white border border-border rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-text-primary">هل تحتاج إلى مساعدة؟</h4>
          <p className="text-[11px] text-text-muted">يمكنك التواصل مع فريق الدعم في أي وقت</p>
          <button className="mt-2 px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors">
            تواصل معنا
          </button>
        </div>
        <div className="p-3 bg-surface-blue text-blue-500 rounded-2xl">
          <Headphones className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
};