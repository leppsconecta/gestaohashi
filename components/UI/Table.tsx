
import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T, index: number) => React.ReactNode);
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  itemsPerPage?: number;
  onRowClick?: (item: T) => void;
  searchPlaceholder?: string;
}

const Table = <T,>({
  columns,
  data,
  itemsPerPage = 20,
  onRowClick,
  searchPlaceholder = "Buscar..."
}: TableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchStr = searchTerm.toLowerCase();
      return Object.values(item as any).some(val =>
        String(val).toLowerCase().includes(searchStr)
      );
    });
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-slate-800 dark:text-slate-200"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Total: <span className="text-slate-800 dark:text-slate-200">{filteredData.length} registros</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <table className="w-full text-left border-collapse min-w-[800px] table-fixed">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 ${col.className || ''} ${col.headerClassName || ''}`}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {currentItems.length > 0 ? (
              currentItems.map((item, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={`transition-colors group ${onRowClick ? 'hover:bg-slate-50/50 dark:hover:bg-slate-700/30 cursor-pointer' : 'hover:bg-slate-50/20 dark:hover:bg-slate-800/20 cursor-default'}`}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((col, colIdx) => {
                    const content = typeof col.accessor === 'function'
                      ? col.accessor(item, (currentPage - 1) * itemsPerPage + rowIdx + 1)
                      : (item as any)[col.accessor];

                    return (
                      <td
                        key={colIdx}
                        className={`px-6 py-4 text-sm text-slate-600 dark:text-slate-300 ${col.className || ''}`}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-20 text-center text-slate-500 dark:text-slate-400">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-slate-500 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum = currentPage;
                if (currentPage < 3) pageNum = i + 1;
                else if (currentPage > totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                if (pageNum <= 0 || pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${currentPage === pageNum
                        ? 'bg-red-600 text-white shadow-md shadow-red-200 dark:shadow-none'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-slate-500 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
