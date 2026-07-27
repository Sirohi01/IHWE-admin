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
  cardsInRow = 6,
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
    <div className="w-full bg-[#f8fafc] min-h-[calc(100vh-110px)] xl:min-h-[calc(100vh-110px)] flex flex-col text-slate-800 p-4 md:px-6 lg:px-8" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>

      {/* TOP HEADER */}
      {/* <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-4">
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
      </div> */}

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col xl:flex-row gap-4 flex-grow items-stretch xl:min-h-0">

        {/* LEFT COLUMN: STATS & TABLE */}
        <div className={`flex-grow flex flex-col gap-4 w-full ${rightSidebar ? 'xl:w-[78%]' : 'xl:w-full'} xl:min-h-0`}>
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-1">
            <div>
              <h1 className="text-[16px] font-bold text-slate-800 flex items-center gap-3">
                {title}
                {badgeCount !== undefined && (
                  <span className="bg-emerald-100 text-emerald-700 text-sm py-1 px-3 rounded-full font-semibold">
                    {badgeCount}
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
            </div>
            {headerActions && (
              <div className="flex flex-wrap items-center w-full xl:w-auto">
                {headerActions}
              </div>
            )}
          </div>
          {/* STATS CARDS */}
          {statCards && (
            <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 ${
              cardsInRow === 5 ? 'xl:grid-cols-5' :
              cardsInRow === 4 ? 'xl:grid-cols-4' :
              cardsInRow === 3 ? 'xl:grid-cols-3' :
              'xl:grid-cols-6'
            }`}>
              {statCards}
            </div>
          )}

          {/* TABLE SECTION */}
          <div className="flex-grow flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden min-h-[400px] xl:min-h-0">

            {/* Filter Bar */}
            {filterBar && (
              <div className="px-3 pt-4 pb-3 border-b border-slate-100 flex items-center gap-2 bg-white overflow-x-auto">
                <div className="flex items-center gap-2 flex-nowrap min-w-0">
                  {filterBar}
                </div>
                <div className="flex items-center gap-2 ml-auto shrink-0">
                  {onReset && (
                    <button onClick={onReset} className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] font-bold text-white transition-all duration-200 hover:opacity-90 shadow-sm whitespace-nowrap" style={{ backgroundColor: '#EF4444', fontFamily: 'Inter, sans-serif' }}>
                      <RefreshCw size={11} /> Reset
                    </button>
                  )}
                  <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] font-bold text-white transition-all duration-200 hover:opacity-90 shadow-sm whitespace-nowrap" style={{ backgroundColor: '#10B981', fontFamily: 'Inter, sans-serif' }}>
                    <Download size={11} /> Export
                  </button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="overflow-auto flex-grow relative custom-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap text-[10px]">
                <thead className="sticky top-0 z-10">
                  <tr className="text-white tracking-wider" style={{ backgroundColor: '#0A2947' }}>
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
        {rightSidebar && (
          <div className="w-full xl:w-[20%] flex flex-col justify-between shrink-0 xl:h-full">
            {rightSidebar}
          </div>
        )}

      </div>
    </div>
  );
};

export default BaseLeadPage;
