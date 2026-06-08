import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Filter, FileText, Eye, Download, MoreVertical, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ClipboardList } from 'lucide-react';
import axios from 'axios';

export default function QuotationsTable() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        // For now, fetching all estimates so data shows up until type logic is confirmed
        const res = await axios.get(`${BASE_URL}/api/estimates`);
        if (res.data.success) {
          // Filtering logic can be uncommented once est_type is confirmed
          // const filtered = res.data.data.filter(item => item.est_type === 'Quotation');
          // setQuotations(filtered);
          setQuotations(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching quotations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotations();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Accepted':
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[11px] font-bold rounded-md">Accepted</span>;
      case 'Sent':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[11px] font-bold rounded-md">Sent</span>;
      case 'Pending':
        return <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-[11px] font-bold rounded-md">Pending</span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[11px] font-bold rounded-md">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[11px] font-bold rounded-md">{status || 'Draft'}</span>;
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = quotations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(quotations.length / itemsPerPage);

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
            placeholder="Search quotations by client or company..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Status <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Quotation Date <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Sales Executive <ChevronDown size={14} />
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
              <th className="px-4 py-2 text-[12px] font-semibold text-slate-500 whitespace-nowrap">Quotation No.</th>
              <th className="px-4 py-2 text-[12px] font-semibold text-slate-500 whitespace-nowrap">Client / Company</th>
              <th className="px-4 py-2 text-[12px] font-semibold text-slate-500 whitespace-nowrap">Sales Executive</th>
              <th className="px-4 py-2 text-[12px] font-semibold text-slate-500 whitespace-nowrap">Quotation Date</th>
              <th className="px-4 py-2 text-[12px] font-semibold text-slate-500 whitespace-nowrap">Amount</th>
              <th className="px-4 py-2 text-[12px] font-semibold text-slate-500 whitespace-nowrap">Status</th>
              <th className="px-4 py-2 text-[12px] font-semibold text-slate-500 whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-4 text-sm text-slate-500">Loading quotations...</td></tr>
            ) : currentItems.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-4 text-sm text-slate-500">No quotations found</td></tr>
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
                        <ClipboardList size={16} className="text-slate-400" />
                        <span className="text-sm font-semibold text-slate-900">{item.est_no}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm font-semibold text-slate-900">{item.companyName || item.company_name || item.consignee_name}</td>
                    <td className="px-4 py-2 text-sm text-slate-600">{item.added_by || 'Unassigned'}</td>
                    <td className="px-4 py-2 text-sm text-slate-600">{new Date(item.added).toLocaleDateString('en-GB')}</td>
                    <td className="px-4 py-2 text-sm font-semibold text-slate-900">₹ {item.finalAmount || 0}</td>
                    <td className="px-4 py-2">{getStatusBadge(computedStatus)}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <button disabled className="p-1.5 text-slate-400 hover:bg-slate-100 rounded transition-colors opacity-50 cursor-not-allowed"><Eye size={16} /></button>
                        <button disabled className="p-1.5 text-slate-400 hover:bg-slate-100 rounded transition-colors opacity-50 cursor-not-allowed"><Download size={16} /></button>
                        <button disabled className="p-1.5 text-slate-400 hover:bg-slate-100 rounded transition-colors opacity-50 cursor-not-allowed"><MoreVertical size={16} /></button>
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
          Showing {quotations.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, quotations.length)} of {quotations.length} quotations
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
