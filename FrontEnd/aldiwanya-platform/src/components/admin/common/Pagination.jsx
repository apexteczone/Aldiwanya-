import { ChevronRight, ChevronLeft } from 'lucide-react';

export const Pagination = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-border rounded-2xl p-3 text-xs text-text-muted shadow-xs">
      
      {/* تحديد عدد العناصر */}
      <div className="flex items-center gap-2">
        <span>عرض</span>
        <select value={itemsPerPage || 10} disabled className="bg-surface border border-border text-text-primary rounded-lg px-2 py-1 focus:outline-none">
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
        <span>من {totalItems} عنصر</span>
      </div>

      {/* أزرار التنقل */}
      <div className="flex items-center gap-1 dir-ltr">
        <button 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-surface transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({length:Math.max(1,totalPages)},(_,i)=>i+1).map((page, i) => (
          <button
            key={i}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
              page === currentPage
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'border-border text-text-primary hover:bg-surface'
            }`}
          >
            {page}
          </button>
        ))}

        <button 
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-surface transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};