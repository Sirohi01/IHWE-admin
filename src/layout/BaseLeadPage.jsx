import React from "react";
import { Download, RefreshCw } from "lucide-react";

/**
 * BaseLeadPage - A reusable layout component for Lead list pages
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle
 * @param {string|number} props.badgeCount - Count badge next to title
 * @param {React.ReactNode} props.headerActions - Buttons on the top right
 * @param {React.ReactNode} props.statCards - Statistics cards (grid)
 * @param {React.ReactNode} props.filterBar - Filter bar content
 * @param {React.ReactNode} props.tableHeaders - Table header TR component
 * @param {React.ReactNode} props.tableBody - Table body content
 * @param {React.ReactNode} props.rightSidebar - Right sidebar widgets
 * @param {Function} props.onReset - Reset filter callback
 * @param {React.ReactNode} props.pagination - Pagination controls (bottom)
 */
const BaseLeadPage = ({
  title,
  subtitle,
  badgeCount,
  headerActions,
  statCards,
  filterBar,
  tableHeaders,
  tableBody,
  rightSidebar,
  onReset,
  pagination,
  isAllSelected,
  onSelectAll
}) => {
  return (
    <div className="w-full bg-[#f8fafc] min-h-[calc(100vh-110px)] xl:h-[calc(100vh-110px)] flex flex-col font-sans text-slate-800 p-4 md:px-6 lg:px-8 xl:overflow-hidden">

      {/* TOP HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            {title}
            {badgeCount !== undefined && (
              <span className="bg-emerald-100 text-emerald-700 text-sm py-1 px-3 rounded-full font-semibold">
                {badgeCount}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:gap-3 w-full xl:w-auto">
          {headerActions}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col xl:flex-row gap-4 flex-grow items-stretch xl:min-h-0">

        {/* LEFT COLUMN: STATS & TABLE */}
        <div className="flex-grow flex flex-col gap-4 w-full xl:w-[78%] xl:min-h-0">

          {/* STATS CARDS */}
          {statCards && (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {statCards}
            </div>
          )}

          {/* TABLE SECTION */}
          <div className="flex-grow flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] xl:min-h-0">

            {/* Filter Bar */}
            {filterBar && (
              <div className="p-2 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-white">
                <div className="flex flex-wrap items-center gap-2">
                  {filterBar}
                </div>
                <div className="flex items-center gap-2">
                  {onReset && (
                    <button onClick={onReset} className="flex items-center gap-1 py-1.5 px-2 text-slate-500 hover:text-slate-700 transition-colors text-[10px] font-medium">
                      <RefreshCw size={12} /> Reset
                    </button>
                  )}
                  <button className="flex items-center gap-1.5 py-1.5 px-3 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    <Download size={12} /> Export
                  </button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="overflow-auto flex-grow relative custom-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap text-[10px]">
                <thead>
                  <tr className="bg-[#334155] text-white uppercase tracking-wider">
                    <th className="px-2 py-2 w-8 text-center">
                      <input
                        type="checkbox"
                        className="w-3 h-3 accent-blue-500 cursor-pointer rounded-sm"
                        checked={isAllSelected || false}
                        onChange={onSelectAll}
                      />
                    </th>
                    {tableHeaders}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tableBody}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && (
              <div className="p-2 border-t border-slate-100 bg-white flex items-center justify-between text-[10px] font-medium text-slate-600">
                {pagination}
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="w-full xl:w-[20%] flex flex-col gap-4 shrink-0 xl:h-full">
          {rightSidebar}
        </div>

      </div>
    </div>
  );
};

export default BaseLeadPage;
