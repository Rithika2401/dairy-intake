import React from 'react';

export const DataTable = ({ columns, data, onRowClick, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full space-y-3 p-4 animate-pulse">
        <div className="h-10 bg-slate-800/60 rounded-lg"></div>
        <div className="h-12 bg-slate-800/40 rounded-lg"></div>
        <div className="h-12 bg-slate-800/40 rounded-lg"></div>
        <div className="h-12 bg-slate-800/40 rounded-lg"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800">
        <p className="text-slate-400 text-sm">No records match the selected query criteria.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-4 py-3.5 font-semibold">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {data.map((row, rIdx) => (
            <tr
              key={row.id || rIdx}
              onClick={() => onRowClick && onRowClick(row)}
              className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-800/50' : 'hover:bg-slate-800/20'}`}
            >
              {columns.map((col, cIdx) => (
                <td key={cIdx} className="px-4 py-3.5 whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
