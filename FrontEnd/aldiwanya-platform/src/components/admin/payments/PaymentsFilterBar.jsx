import { Search, Calendar, Filter } from 'lucide-react';

export const PaymentsFilterBar = ({ filters, setFilters, onSearch }) => {
  return (
    <div className="bg-white border border-border rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      
      {/* حقل البحث */}
      <div className="relative flex-1 min-w-[240px]">
        <input
          type="text"
          placeholder="إبحث عن طالب، رقم عملية، أو كورس ..."
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
        {/* حالة الدفع */}
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
        >
          <option value="">كل حالات الدفع</option>
          <option value="success">ناجحة</option>
          <option value="pending">قيد المراجعة</option>
          <option value="failed">مرفوضة</option>
        </select>

        {/* طريقة الدفع */}
        <select
          value={filters.method}
          onChange={(e) => setFilters({ ...filters, method: e.target.value })}
          className="bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
        >
          <option value="">كل طرق الدفع</option>
          <option value="visa">فيزا / ماستر كارد</option>
          <option value="vodafone">فودافون كاش</option>
          <option value="instapay">إنستا باي</option>
          <option value="mada">مدى</option>
          <option value="apple">أبل باي</option>
        </select>

        {/* الكورسات */}
        <select
          value={filters.course}
          onChange={(e) => setFilters({ ...filters, course: e.target.value })}
          className="bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
        >
          <option value="">كل الكورسات</option>
          <option value="algebra">مقدمة في الجبر</option>
          <option value="equations">المعادلات البسيطة</option>
        </select>

        {/* التوقيت */}
        <button className="flex items-center gap-2 bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 hover:bg-slate-100 transition-colors">
          <Calendar className="w-4 h-4 text-text-muted" />
          <span>كل الوقت</span>
        </button>

        {/* زر التصفية الجانبي */}
        <button className="p-2.5 bg-surface border border-border text-text-muted hover:text-text-primary rounded-xl transition-colors">
          <Filter className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};