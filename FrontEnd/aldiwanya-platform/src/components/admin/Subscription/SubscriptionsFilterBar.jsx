import React from 'react';
import { Search, Calendar, Filter, ChevronDown } from 'lucide-react';

export const SubscriptionsFilterBar = ({ filters, setFilters, onSearch }) => {
  return (
    <div className="bg-white border border-border rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      
      {/* حقل البحث */}
      <div className="relative flex-1 min-w-[220px]">
        <input
          type="text"
          placeholder="إبحث عن طالب أو كورس ..."
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
        {/* كل الحالات */}
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
        >
          <option value="">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="expiring">قيد الانتهاء</option>
          <option value="expired">منتهي</option>
        </select>

        {/* أنواع الاشتراك */}
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
        >
          <option value="">كل أنواع الاشتراك</option>
          <option value="monthly">شهري</option>
          <option value="full_term">ترم كامل</option>
          <option value="yearly">سنوي</option>
        </select>

        {/* كل الكورسات */}
        <select
          value={filters.course}
          onChange={(e) => setFilters({ ...filters, course: e.target.value })}
          className="bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
        >
          <option value="">كل الكورسات</option>
          <option value="algebra">مقدمة في الجبر</option>
          <option value="equations">المعادلات البسيطة</option>
          <option value="roots">قوانين الأسس والجذور</option>
        </select>

        {/* الوقت */}
        <button className="flex items-center gap-2 bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 hover:bg-slate-100 transition-colors">
          <Calendar className="w-4 h-4 text-text-muted" />
          <span>كل الوقت</span>
          <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
        </button>

        {/* زر التصفية */}
        <button className="p-2.5 bg-surface border border-border text-text-muted hover:text-text-primary rounded-xl transition-colors">
          <Filter className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};