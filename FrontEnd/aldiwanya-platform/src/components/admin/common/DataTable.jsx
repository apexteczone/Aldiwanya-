
export const DataTable = ({ columns, data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-text-muted bg-white border border-border rounded-2xl">
        جاري تحميل البيانات...
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="bg-surface/60 border-b border-border text-text-muted font-bold">
              {columns.map((col, idx) => (
                <th key={idx} className={`p-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-surface/50 transition-colors">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={`p-3.5 align-middle ${col.cellClassName || ''}`}>
                    {col.cell ? col.cell(row, rowIndex) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};