// src/components/admin/courses/CoursePreviewBanner.jsx
import React from 'react';
import {  ArrowRight } from 'lucide-react';

export function CoursePreviewBanner({ onSubmit, isSubmitting }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-xs space-y-4">
      

      {/* أزرار الحفظ والنشر المباشرة */}
      <div className="flex items-center gap-2 ">
        <button
          type="button"
          onClick={() => onSubmit(false)}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-2.5 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer text-xs"
        >
          <span>نشر الكورس الآن</span>
          <ArrowRight className="w-4 h-4 rotate-180" />
        </button>
      </div>

    </div>
  );
}