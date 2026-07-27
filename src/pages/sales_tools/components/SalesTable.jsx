import React from 'react';
import { Search, ChevronDown, Filter, FileText, Eye, Download, MoreVertical, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const proposals = [
  { id: 'PROP-2026-036', client: 'GreenLife Ayurveda', exec: 'Vijay Sharma', date: '28 May 2026', valid: '27 Jun 2026', amount: '₹ 3,50,000', status: 'Accepted' },
  { id: 'PROP-2026-035', client: "Nature's Harmony Pvt. Ltd.", exec: 'Vijay Sharma', date: '27 May 2026', valid: '26 Jun 2026', amount: '₹ 4,20,000', status: 'Sent' },
  { id: 'PROP-2026-034', client: 'Wellness World', exec: 'Amit Verma', date: '26 May 2026', valid: '25 Jun 2026', amount: '₹ 2,75,000', status: 'Pending' },
  { id: 'PROP-2026-033', client: 'Herbal King Exports', exec: 'Vijay Sharma', date: '24 May 2026', valid: '23 Jun 2026', amount: '₹ 5,80,000', status: 'Sent' },
  { id: 'PROP-2026-032', client: 'Arogya Organics', exec: 'Neha Tiwari', date: '23 May 2026', valid: '22 Jun 2026', amount: '₹ 3,10,000', status: 'Pending' },
  { id: 'PROP-2026-031', client: 'Pureveda Solutions', exec: 'Amit Verma', date: '22 May 2026', valid: '21 Jun 2026', amount: '₹ 2,45,000', status: 'Rejected' },
  { id: 'PROP-2026-030', client: 'Shakti Bio Products', exec: 'Vijay Sharma', date: '21 May 2026', valid: '20 Jun 2026', amount: '₹ 1,95,000', status: 'Sent' },
  { id: 'PROP-2026-029', client: 'Holistic Nutrition Co.', exec: 'Neha Tiwari', date: '20 May 2026', valid: '19 Jun 2026', amount: '₹ 2,55,000', status: 'Accepted' },
  { id: 'PROP-2026-028', client: 'Fitwell Solutions', exec: 'Amit Verma', date: '19 May 2026', valid: '18 Jun 2026', amount: '₹ 1,75,000', status: 'Pending' },
  { id: 'PROP-2026-027', client: 'Global Herbs Pvt. Ltd.', exec: 'Vijay Sharma', date: '18 May 2026', valid: '17 Jun 2026', amount: '₹ 2,10,000', status: 'Sent' },
];

export default function SalesTable() {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Accepted':
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[11px] font-bold rounded-md">Accepted</span>;
      case 'Sent':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[11px] font-bold rounded-md">Sent</span>;
      case 'Pending':
        return <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-[11px] font-bold rounded-md">Pending</span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[11px] font-bold rounded-md">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[11px] font-bold rounded-md">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#EDF0F7] overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#EDF0F7]">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search proposals by client or company..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Status <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Proposal Date <ChevronDown size={14} />
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
              <th className="px-4 py-2 text-[12px] font-semibold text-slate-500 whitespace-nowrap">Proposal No.</th>
              <th className="px-4 py-2 text-[12px] font-semibold text-slate-500 whitespace-nowrap">Client / Company</th>
              <th className="px-4 py-2 text-[12px] font-semibold text-slate-500 whitespace-nowrap">Sales Executive</th>
              <th className="px-4 py-2 text-[12px] font-semibold text-slate-500 whitespace-nowrap">Proposal Date</th>
              <th className="px-4 py-2 text-[12px] font-semibold text-slate-500 whitespace-nowrap">Valid Till</th>
              <th className="px-4 py-2 text-[12px] font-semibold text-slate-500 whitespace-nowrap">Amount</th>
              <th className="px-4 py-2 text-[12px] font-semibold text-slate-500 whitespace-nowrap">Status</th>
              <th className="px-4 py-2 text-[12px] font-semibold text-slate-500 whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((item, index) => (
              <tr key={index} className="border-b border-[#EDF0F7] last:border-0 hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-slate-400" />
                    <span className="text-sm font-semibold text-slate-900">{item.id}</span>
                  </div>
                </td>
                <td className="px-4 py-2 text-sm font-semibold text-slate-900">{item.client}</td>
                <td className="px-4 py-2 text-sm text-slate-600 capitalize">{item.exec}</td>
                <td className="px-4 py-2 text-sm text-slate-600">{item.date}</td>
                <td className="px-4 py-2 text-sm text-slate-600">{item.valid}</td>
                <td className="px-4 py-2 text-sm font-semibold text-slate-900">{item.amount}</td>
                <td className="px-4 py-2">{getStatusBadge(item.status)}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"><Eye size={16} /></button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"><Download size={16} /></button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"><MoreVertical size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-[#EDF0F7] flex flex-wrap items-center justify-between gap-4">
        <span className="text-sm text-slate-500 font-medium">
          Showing 1 to 10 of 36 proposals
        </span>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors"><ChevronsLeft size={14} /></button>
          <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors"><ChevronLeft size={14} /></button>

          <button className="w-8 h-8 flex items-center justify-center rounded bg-green-600 text-white font-semibold text-sm">1</button>
          <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-colors">2</button>
          <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-colors">3</button>
          <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-colors">4</button>

          <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors"><ChevronRight size={14} /></button>
          <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors"><ChevronsRight size={14} /></button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 font-medium">Rows per page:</span>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            10 <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
