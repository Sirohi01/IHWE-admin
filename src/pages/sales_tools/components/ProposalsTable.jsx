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
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-[#EDF0F7]">
              <th className="px-4 py-2 text-[11px] font-semibold text-black whitespace-nowrap">Proposal No.</th>
              <th className="px-4 py-2 text-[11px] font-semibold text-black whitespace-nowrap">Client / Company</th>
              <th className="px-4 py-2 text-[11px] font-semibold text-black whitespace-nowrap">Sales Executive</th>
              <th className="px-4 py-2 text-[11px] font-semibold text-black whitespace-nowrap">Proposal Date</th>
              <th className="px-4 py-2 text-[11px] font-semibold text-black whitespace-nowrap">Amount</th>
              <th className="px-4 py-2 text-[11px] font-semibold text-black whitespace-nowrap">Status</th>
                <th className="px-4 py-2 text-[12px] font-bold text-black whitespace-nowrap">Action</th>
              </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-4 text-sm text-slate-500">Loading proposals...</td></tr>
            ) : currentItems.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-4 text-sm text-slate-500">No proposals found</td></tr>
            ) : (
              currentItems.map((item, index) => {
                let computedStatus = 'Pending';
                if (item.invoice && item.invoice.length > 0) {
                  computedStatus = 'Accepted';
                } else if (item.performaInvoice && item.performaInvoice.length > 0) {
                  computedStatus = 'Sent';
                }
                
                return (
                  <tr key={item._id || index} className="border-b border-[#EDF0F7] last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-slate-400" />
                        <span className="text-sm font-semibold text-slate-900">{item.est_no}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm font-semibold text-slate-900">{item.companyName || item.company_name || item.consignee_name}</td>
                    <td className="px-4 py-2 text-sm text-slate-600">{item.added_by || 'Unassigned'}</td>
                    <td className="px-4 py-2 text-sm text-slate-600">{new Date(item.added).toLocaleDateString('en-GB')}</td>
                    <td className="px-4 py-2 text-sm font-semibold text-slate-900 whitespace-nowrap">₹ {item.finalAmount || 0}</td>
                    <td className="px-4 py-2">{getStatusBadge(computedStatus)}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"><Eye size={16} /></button>
                        <button className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"><Download size={16} /></button>
                        <button className="p-1.5 text-slate-700 hover:bg-slate-100 rounded transition-colors"><MoreVertical size={16} /></button>
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
      <div className="p-4 border-t border-[#EDF0F7] flex flex-wrap items-center justify-between gap-4">
        <span className="text-sm text-slate-500 font-medium">
          Showing {filteredProposals.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProposals.length)} of {filteredProposals.length} proposals
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
