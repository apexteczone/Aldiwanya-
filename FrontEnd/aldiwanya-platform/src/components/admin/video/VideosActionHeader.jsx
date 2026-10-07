// import React from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, Settings2, ArrowUpDown } from 'lucide-react';

export const VideosActionHeader = ({ onBulkActionChange, onSortChange }) => {
  return (
    <div className="bg-white border border-border rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      
      {/* التوجيه الصحيح إلى /admin/upload */}
      <Link
        to="/admin/upload"
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer select-none"
      >
        <UploadCloud className="w-4 h-4" />
        <span>رفع فيديو جديد</span>
      </Link>

      <div className="flex items-center gap-2 text-xs">
        <div className="relative">
          <select
            onChange={(e) => onBulkActionChange?.(e.target.value)}
            className="bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 pr-8 focus:outline-none cursor-pointer appearance-none font-medium"
          >
            <option value="">إجراءات جماعية</option>
            <option value="activate">تفعيل المحدد</option>
            <option value="deactivate">إلغاء تفعيل المحدد</option>
            <option value="delete">حذف المحدد</option>
          </select>
          <Settings2 className="w-3.5 h-3.5 text-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            onChange={(e) => onSortChange?.(e.target.value)}
            className="bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 pr-8 focus:outline-none cursor-pointer appearance-none font-medium"
          >
            <option value="newest">الأحدث أولاً</option>
            <option value="oldest">الأقدم أولاً</option>
            <option value="duration">حسب المدة</option>
          </select>
          <ArrowUpDown className="w-3.5 h-3.5 text-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

    </div>
  );
};