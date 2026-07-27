import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, MoreVertical, MessageCircle, Calendar, CalendarCheck, CalendarX, Mail, Send, Clock, CheckCircle2, XCircle } from 'lucide-react';
import SearchableDropdown from '../../../components/SearchableDropdown';
import api from '../../../../src/lib/api';
import { useEventContext } from '../../../context/EventContext';

export default function EmailsTable() {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { currentEventId } = useEventContext();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let user = {};
      try {
        const info = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
        if (info) user = JSON.parse(info);
      } catch (e) {
        console.error("Error parsing adminInfo:", e);
      }

      const userId = user._id || user.id;

      if (userId) {
        const res = await api.get(`/api/user-targets/logs/table?userId=${userId}&type=emails&page=${page}&limit=${limit}${currentEventId ? `&eventId=${currentEventId}` : ''}`);
        if (res.data.success) {
          if (res.data.pagination) {
            setTotalPages(res.data.pagination.pages);
            setTotalCount(res.data.pagination.total);
          }
          setTableData(res.data.data.map((log, index) => ({
            id: log._id || index,
            clientInitials: log.companyName ? log.companyName.substring(0, 2).toUpperCase() : (log.name ? log.name.substring(0, 2).toUpperCase() : (log.recipient ? log.recipient.substring(0, 2).toUpperCase() : 'NA')),
            clientName: log.companyName || log.name || log.recipient || 'Unknown',
            clientColor: 'bg-blue-100 text-blue-700',
            purpose: 'General',
            callStatus: log.status === 'success' ? 'Connected' : 'Failed',
            statusColor: log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
            statusIcon: log.status === 'success' ? CheckCircle2 : XCircle,
            lastRemark: log.subject || 'Email sent',
            nextActionText: '--',
            nextActionDate: new Date(log.sentAt || log.createdAt).toLocaleDateString()
          })));
        }
      }
    } catch (error) {
      console.error("Error fetching email logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, limit, currentEventId]);


  return (
    <div className="bg-white rounded-xl border border-[#EDF0F7] shadow-sm flex flex-col flex-1 min-h-0">
      {/* Table Controls */}
      <div className="p-3 border-b border-[#EDF0F7] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by client or company..."
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-[240px] focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-slate-50"
            />
          </div>
          <div className="w-[140px]">
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-green-500">
              <option>Email Status</option>
            </select>
          </div>
          <div className="w-[140px]">
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-green-500">
              <option>Call Purpose</option>
            </select>
          </div>
          <div className="w-[120px]">
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-green-500">
              <option>Date</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter size={16} /> Filters
          </button>
          <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
            <tr className="border-b border-[#EDF0F7]">
              <th className="py-1 px-3 text-[13px] font-medium text-slate-700">Client / Company</th>
              <th className="py-1 px-3 text-[13px] font-medium text-slate-700">Purpose</th>
              <th className="py-3 px-4 font-semibold text-[#64748B] w-24">Status</th>
              <th className="py-3 px-4 font-semibold text-[#64748B] w-64">Subject / Remark</th>
              <th className="py-1 px-3 text-[13px] font-medium text-slate-700 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => {
              const StatusIcon = row.statusIcon;
              return (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-1 px-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] font-medium text-slate-900">{row.clientName}</span>
                    </div>
                  </td>
                  <td className="py-1 px-3">
                    <span className="text-[13px] font-medium text-slate-600">{row.purpose}</span>
                  </td>
                  <td className="py-1 px-3">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${row.statusColor}`}>
                      <StatusIcon size={14} />
                      {row.callStatus}
                    </div>
                  </td>
                  <td className="py-1 px-3 max-w-[200px]">
                    <p className="text-[12px] text-slate-600 font-medium leading-tight">
                      {row.lastRemark}
                    </p>
                  </td>
                  <td className="py-1 px-3">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1 text-green-600 hover:bg-green-50 rounded-md">
                        <Mail size={16} />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md">
                        <Calendar size={16} />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-3 border-t border-[#EDF0F7] flex items-center justify-between">
        <span className="text-[13px] font-medium text-slate-600">
          Showing {totalCount === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} emails
        </span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 text-xs font-medium"
            >
              Prev
            </button>
            <span className="px-3 text-sm font-medium text-slate-600">
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="px-2 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 text-xs font-medium"
            >
              Next
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages || totalPages === 0}
              className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-slate-600">Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="border border-slate-200 rounded px-2 py-1 text-sm text-slate-700 bg-white focus:outline-none focus:border-green-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
