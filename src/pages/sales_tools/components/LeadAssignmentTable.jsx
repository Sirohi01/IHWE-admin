import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Filter, FileText, Eye, Download, MoreVertical, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Users, UserPlus } from 'lucide-react';

export default function LeadAssignmentTable({ data = [], parentLoading = false }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setLeads(data);
    setLoading(parentLoading);
  }, [data, parentLoading]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Assigned':
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[11px] font-bold rounded-md">Assigned</span>;
      case 'Unassigned':
        return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[11px] font-bold rounded-md">Unassigned</span>;
      case 'In Progress':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[11px] font-bold rounded-md">In Progress</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[11px] font-bold rounded-md">{status || 'Unassigned'}</span>;
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = leads.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(leads.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`w-8 h-8 flex items-center justify-center rounded font-semibold text-sm transition-colors ${
              currentPage === i
                ? 'bg-green-600 text-white'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {i}
          </button>
        );
      } else if (
        i === currentPage - 2 ||
        i === currentPage + 2
      ) {
        pageNumbers.push(<span key={i} className="px-1 text-slate-400">...</span>);
      }
    }
    return pageNumbers;
  };

  return (
    <div className="bg-white rounded-xl border border-[#EDF0F7] overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#EDF0F7]">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search leads by company or contact..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Assignment Status <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Added Date <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter size={14} /> Filters
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-[#EDF0F7]">
              <th className="px-4 py-2 text-[12px] font-semibold text-slate-500 whitespace-nowrap">Company Name</th>
              <th className="px-4 py-2 text-[12px] font-semibold text-slate-500 whitespace-nowrap">Contact Person</th>
              <th className="px-4 py-2 text-[12px] font-semibold text-slate-500 whitespace-nowrap">Added Date</th>
              <th className="px-4 py-2 text-[12px] font-semibold text-slate-500 whitespace-nowrap">Assigned To</th>
              <th className="px-4 py-2 text-[12px] font-semibold text-slate-500 whitespace-nowrap">Status</th>
              <th className="px-4 py-2 text-[12px] font-semibold text-slate-500 whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-4 text-sm text-slate-500">Loading leads...</td></tr>
            ) : currentItems.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-4 text-sm text-slate-500">No leads found</td></tr>
            ) : (
              currentItems.map((item, index) => (
                <tr key={item._id || index} className="border-b border-[#EDF0F7] last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2 text-sm font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-slate-400" />
                      {item.companyName}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-600">
                    {item.contacts && item.contacts.length > 0 
                      ? `${item.contacts[0].firstName || ''} ${item.contacts[0].surname || ''}`.trim() || 'N/A'
                      : 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-600">{new Date(item.added || item.createdAt).toLocaleDateString('en-GB')}</td>
                  <td className="px-4 py-2 text-sm text-slate-600">{item.forwardTo || 'Unassigned'}</td>
                  <td className="px-4 py-2">{getStatusBadge(item.forwardTo ? 'Assigned' : 'Unassigned')}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <button disabled className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-gray-50 text-gray-400 border border-gray-200 rounded opacity-50 cursor-not-allowed">
                        <UserPlus size={14} /> Assign
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-[#EDF0F7] flex flex-wrap items-center justify-between gap-4">
        <span className="text-sm text-slate-500 font-medium">
          Showing {leads.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, leads.length)} of {leads.length} leads
        </span>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          ><ChevronsLeft size={14} /></button>
          
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          ><ChevronLeft size={14} /></button>
          
          {renderPageNumbers()}
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          ><ChevronRight size={14} /></button>
          
          <button 
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          ><ChevronsRight size={14} /></button>
        </div>

        <div className="flex items-center gap-2 relative group">
          <span className="text-sm text-slate-500 font-medium">Rows per page:</span>
          <select 
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="appearance-none outline-none flex items-center gap-2 px-3 py-1.5 pr-8 border border-slate-200 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
        </div>
      </div>
    </div>
  );
}
