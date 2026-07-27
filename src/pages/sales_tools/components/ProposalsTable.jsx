import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Filter, FileText, Eye, Download, MoreVertical, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import axios from 'axios';

export default function ProposalsTable({ data = [], parentLoading = false }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateSort, setDateSort] = useState('Newest');
  const [salesExecutiveFilter, setSalesExecutiveFilter] = useState('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setProposals(data);
    setLoading(parentLoading);
  }, [data, parentLoading]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Accepted':
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[11px] font-bold rounded-md">Accepted</span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[11px] font-bold rounded-md">Rejected</span>;
      case 'Sent':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[11px] font-bold rounded-md">Sent</span>;
      default:
        return <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-[11px] font-bold rounded-md">{status || 'Pending'}</span>;
    }
  };

  // Filtering & Sorting Logic
  const filteredProposals = proposals.filter(item => {
    // Search
    const searchLower = searchQuery.toLowerCase();
    const companyMatch = (item.companyName || item.company_name || item.consignee_name)?.toLowerCase().includes(searchLower) || false;
    const estNoMatch = item.est_no?.toLowerCase().includes(searchLower) || false;
    if (searchQuery && !companyMatch && !estNoMatch) return false;

    // Status Computed Logic
    let computedStatus = 'Pending';
    if (item.invoice && item.invoice.length > 0) {
      computedStatus = 'Accepted';
    } else if (item.performaInvoice && item.performaInvoice.length > 0) {
      computedStatus = 'Sent';
    }
    if (statusFilter !== 'All' && computedStatus !== statusFilter) return false;

    // Sales Executive
    const exec = item.added_by || 'Unassigned';
    if (salesExecutiveFilter !== 'All' && exec !== salesExecutiveFilter) return false;

    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.added || 0).getTime();
    const dateB = new Date(b.added || 0).getTime();
    return dateSort === 'Newest' ? dateB - dateA : dateA - dateB;
  });

  // Unique Sales Executives for dropdown
  const uniqueExecutives = [...new Set(proposals.map(item => item.added_by || 'Unassigned'))];

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProposals.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateSort, salesExecutiveFilter, itemsPerPage]);

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
            placeholder="Search proposals by client or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none flex items-center gap-2 pl-4 pr-8 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="All">All Statuses</option>
              <option value="Accepted">Accepted</option>
              <option value="Sent">Sent</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value)}
              className="appearance-none flex items-center gap-2 pl-4 pr-8 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Newest">Newest First</option>
              <option value="Oldest">Oldest First</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={salesExecutiveFilter}
              onChange={(e) => setSalesExecutiveFilter(e.target.value)}
              className="appearance-none flex items-center gap-2 pl-4 pr-8 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 max-w-[150px]"
            >
              <option value="All">All Executives</option>
              {uniqueExecutives.map((exec, idx) => (
                <option key={idx} value={exec}>{exec}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse whitespace-nowrap text-[10px]" style={{ fontFamily: 'Inter, sans-serif', color: '#15173D' }}>
          <thead>
            <tr className="text-white tracking-wider" style={{ backgroundColor: '#0A2947' }}>
              <th className="px-2 py-2 font-medium text-center">Proposal No.</th>
              <th className="px-2 py-2 font-medium">Client / Company</th>
              <th className="px-2 py-2 font-medium">Sales Executive</th>
              <th className="px-2 py-2 font-medium text-center">Proposal Date</th>
              <th className="px-2 py-2 font-medium text-right">Amount</th>
              <th className="px-2 py-2 font-medium text-center">Status</th>
              <th className="px-2 py-2 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(10)].map((_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse border-b border-slate-100 bg-white">
                  <td className="px-2 py-3 text-center"><div className="w-16 h-3 bg-slate-200 rounded-sm mx-auto"></div></td>
                  <td className="px-2 py-3"><div className="h-3 w-32 bg-slate-200 rounded mb-1.5"></div><div className="h-2 w-24 bg-slate-100 rounded"></div></td>
                  <td className="px-2 py-3"><div className="h-3 w-24 bg-slate-200 rounded mb-1.5"></div><div className="h-2 w-20 bg-slate-100 rounded"></div></td>
                  <td className="px-2 py-3 text-center"><div className="h-4 w-20 bg-slate-200 rounded mx-auto"></div></td>
                  <td className="px-2 py-3 text-right"><div className="h-3 w-16 bg-slate-200 rounded ml-auto"></div></td>
                  <td className="px-2 py-3 text-center"><div className="h-4 w-16 bg-slate-200 rounded-full mx-auto"></div></td>
                  <td className="px-2 py-3 text-center"><div className="h-3 w-16 bg-slate-200 rounded mx-auto"></div></td>
                </tr>
              ))
            ) : currentItems.length === 0 ? (
              <tr><td colSpan="7" className="px-2 py-4 text-center text-slate-500 font-medium text-[11px]">No proposals found</td></tr>
            ) : (
              currentItems.map((item, index) => {
                let computedStatus = 'Pending';
                if (item.invoice && item.invoice.length > 0) {
                  computedStatus = 'Accepted';
                } else if (item.performaInvoice && item.performaInvoice.length > 0) {
                  computedStatus = 'Sent';
                }
                
                return (
                  <tr key={item._id || index} className="border-b border-slate-100 bg-white hover:bg-slate-50/50 transition-colors group">
                    <td className="px-2 py-2 text-center font-bold" style={{ color: '#5E0006' }}>{item.est_no}</td>
                    <td className="px-2 py-2">
                      <div className="font-bold text-[11px]" style={{ color: '#093C5D' }}>
                        {item.companyName || item.company_name || item.consignee_name}
                      </div>
                    </td>
                    <td className="px-2 py-2 font-bold text-blue-600">{item.added_by || 'Unassigned'}</td>
                    <td className="px-2 py-2 text-center font-medium">{new Date(item.added).toLocaleDateString('en-GB')}</td>
                    <td className="px-2 py-2 text-right font-bold text-emerald-700">₹ {item.finalAmount || 0}</td>
                    <td className="px-2 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        computedStatus === 'Accepted' ? 'bg-emerald-100 text-emerald-700' :
                        computedStatus === 'Sent' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {computedStatus}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-1.5 transition-opacity">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"><Eye size={13} /></button>
                        <button className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"><Download size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-2 border-t border-slate-100 bg-white flex flex-wrap items-center justify-between text-[10px] font-medium text-slate-600 gap-4">
        {/* Showing info */}
        <div className="flex items-center gap-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
          <span className="text-[11px] font-bold" style={{ color: '#334155' }}>Showing</span>
          <span className="text-[11px] font-black px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-100" style={{ color: '#016B61' }}>
            {filteredProposals.length === 0 ? 0 : indexOfFirstItem + 1}–{Math.min(indexOfLastItem, filteredProposals.length)}
          </span>
          <span className="text-[11px] font-bold" style={{ color: '#334155' }}>of</span>
          <span className="text-[11px] font-black" style={{ color: '#15173D' }}>{filteredProposals.length}</span>
          <span className="text-[11px] font-bold" style={{ color: '#334155' }}>proposals</span>
        </div>

        {/* Page buttons */}
        <div className="flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
            style={{ borderColor: '#e2e8f0', color: '#334155' }}
          >«</button>
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
            style={{ borderColor: '#e2e8f0', color: '#334155' }}
          >‹</button>
          
          {(() => {
            const pages = [];
            const paginationTotalPages = totalPages === 0 ? 1 : totalPages;
            if (paginationTotalPages <= 7) {
              for (let i = 1; i <= paginationTotalPages; i++) pages.push(i);
            } else {
              pages.push(1);
              if (currentPage > 3) pages.push('...');
              for (let i = Math.max(2, currentPage - 1); i <= Math.min(paginationTotalPages - 1, currentPage + 1); i++) pages.push(i);
              if (currentPage < paginationTotalPages - 2) pages.push('...');
              pages.push(paginationTotalPages);
            }
            return pages.map((p, i) =>
              p === '...' ? (
                <span key={`dot-${i}`} className="w-7 h-7 flex items-center justify-center text-[11px] text-slate-400 font-bold">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black border transition-all duration-200"
                  style={
                    p === currentPage
                      ? { backgroundColor: '#016B61', color: '#fff', borderColor: '#016B61', boxShadow: '0 2px 8px rgba(1,107,97,0.3)' }
                      : { backgroundColor: '#fff', color: '#15173D', borderColor: '#e2e8f0' }
                  }
                >{p}</button>
              )
            );
          })()}
          
          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages || totalPages === 0}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
            style={{ borderColor: '#e2e8f0', color: '#334155' }}
          >›</button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage >= totalPages || totalPages === 0}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
            style={{ borderColor: '#e2e8f0', color: '#334155' }}
          >»</button>
        </div>

        {/* Rows per page */}
        <div className="flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          <span className="text-[11px] font-bold" style={{ color: '#334155' }}>Rows:</span>
          <select 
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border rounded-lg py-1 px-2 bg-white outline-none cursor-pointer text-[11px] font-bold"
            style={{ borderColor: '#e2e8f0', color: '#15173D', fontFamily: 'Inter, sans-serif' }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  );
}
