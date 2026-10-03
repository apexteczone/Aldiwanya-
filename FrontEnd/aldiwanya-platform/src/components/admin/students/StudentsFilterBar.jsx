// import React from 'react';
import { Search, Calendar, ChevronDown } from 'lucide-react';

export const StudentsFilterBar = ({ filters, setFilters, onSearch }) => {
  return (
    <div className="bg-white border border-border rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      
      {/* حقل البحث */}
      <div className="relative flex-1 min-w-[240px]">
        <input
          type="text"
          placeholder="ابحث عن طالب ..."
          value={filters.search}
          onChange={(e) => {
            setFilters({ ...filters, search: e.target.value });
            onSearch?.(e.target.value);
          }}
          className="w-full bg-surface text-text-primary text-xs rounded-xl pr-9 pl-3 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-text-muted"
        />
        <Search className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2" />
      </div>

      {/* الفلاتر المنسدلة */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* الحالة */}
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
        >
          <option value="">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
          <option value="pending">معلق</option>
        </select>

        {/* المرحلة الدراسية */}
        <select
          value={filters.grade}
          onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
          className="bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
        >
          <option value="">كل المراحل</option>
          <option value="10">الصف العاشر</option>
          <option value="11">الصف الحادي عشر</option>
          <option value="12">الصف الثاني عشر</option>
        </select>

        {/* فلتر الوقت */}
        <button className="flex items-center gap-2 bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 hover:bg-slate-100 transition-colors">
          <Calendar className="w-4 h-4 text-text-muted" />
          <span>الوقت</span>
          <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
        </button>

        {/* فلتر كل الوقت */}
        <button className="flex items-center gap-2 bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 hover:bg-slate-100 transition-colors">
          <Calendar className="w-4 h-4 text-text-muted" />
          <span>كل الوقت</span>
          <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
        </button>
      </div>

    </div>
  );
};