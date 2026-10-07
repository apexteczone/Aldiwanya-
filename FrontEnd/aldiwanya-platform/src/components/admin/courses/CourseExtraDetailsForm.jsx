// src/components/admin/courses/CourseExtraDetailsForm.jsx
// import React from 'react';
import { Layers } from 'lucide-react';

export function CourseExtraDetailsForm({ formData, handleChange }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Layers className="w-5 h-5 text-blue-600" />
        <div>
          <h3 className="font-extrabold text-navy-950 text-sm">تفاصيل إضافية</h3>
          <p className="text-[10px] text-text-muted">إعدادات إضافية للكورس</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* السعر */}
        <div className="space-y-1">
          <label className="font-bold text-text-secondary block">السعر</label>
          <div className="relative">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full bg-surface text-text-primary rounded-xl pr-3 pl-12 py-2.5 border border-border focus:outline-none font-bold"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-text-muted text-[11px]">KWD</span>
          </div>
        </div>

        {/* عدد الدروس */}
        <div className="space-y-1">
          <label className="font-bold text-text-secondary block">عدد الدروس التقريبي</label>
          <div className="relative">
            <input
              type="number"
              name="lessonsCount"
              value={formData.lessonsCount}
              onChange={handleChange}
              className="w-full bg-surface text-text-primary rounded-xl pr-3 pl-12 py-2.5 border border-border focus:outline-none font-bold"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-text-muted text-[11px]">درس</span>
          </div>
        </div>

        {/* مدة الكورس التقريبية */}
        <div className="space-y-1">
          <label className="font-bold text-text-secondary block">مدة الكورس التقريبية</label>
          <div className="relative">
            <input
              type="number"
              name="durationHours"
              value={formData.durationHours}
              onChange={handleChange}
              className="w-full bg-surface text-text-primary rounded-xl pr-3 pl-12 py-2.5 border border-border focus:outline-none font-bold"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-text-muted text-[11px]">ساعة</span>
          </div>
        </div>

      </div>


    </div>
  );
}