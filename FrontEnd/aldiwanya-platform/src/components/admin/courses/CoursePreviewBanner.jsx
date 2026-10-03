// src/components/admin/courses/CoursePreviewBanner.jsx
import React from 'react';
import { Eye, ArrowRight, Save } from 'lucide-react';

export function CoursePreviewBanner({ onSubmit, isSubmitting }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-xs space-y-4">
      
      {/* شريط المعاينة التوضيحي */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-navy-950 text-xs">معاينة ظهور الكورس</h4>
            <p className="text-[10px] text-text-muted mt-0.5">يمكنك معاينة كيفية ظهور الكورس في صفحة الكورسات للطلاب</p>
          </div>
        </div>

        <button
          type="button"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
        >
          معاينة الكورس
        </button>
      </div>

      {/* أزرار الحفظ والنشر المباشرة */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <button
          type="button"
          onClick={() => onSubmit(false)}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-2.5 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer text-xs"
        >
          <span>نشر الكورس الآن</span>
          <ArrowRight className="w-4 h-4 rotate-180" />
        </button>

        <button
          type="button"
          onClick={() => onSubmit(true)}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-surface border border-border hover:bg-slate-100 text-text-secondary font-bold rounded-xl transition-colors cursor-pointer shrink-0 text-xs"
        >
          <Save className="w-4 h-4 text-text-muted" />
          <span>حفظ كمسودة</span>
        </button>
      </div>

    </div>
  );
}