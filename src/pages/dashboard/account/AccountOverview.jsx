import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../lib/api";
import CompanyAccountSummary, { formatCurrency } from "./CompanyAccountSummary";
import {
  MapPin, Mail, Phone,
  Download, Eye,
  RefreshCw, ChevronRight,
  User, ArrowRight, FilePlus, CreditCard, Activity,
  FileMinus,
} from "lucide-react";

const AccountOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    companyInfo: null,
    financials: { totalDue: 0, paidAmount: 0, remainingBalance: 0 },
    recentDocuments: [],
    paymentSchedule: [],
    lastPayment: null,
    activityLogs: [],
  });

  useEffect(() => {
    fetchAccountData();
  }, [id]);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/account-overview/${id}`);
      if (res.data.success) {
        setData(res.data.data);
      } else {
        toast.error("Failed to load account overview");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading account data");
    } finally {
      setLoading(false);
    }
  };

  // Eye icon in Recent Documents opens the real detail page for that doc type.
  // Credit/Debit Notes have no standalone detail viewer yet, so their action is disabled.
  const getDocViewPath = (doc) => {
    if (doc.documentType === "Invoice") return `/payments/invoiceDetails/${doc.id}`;
    if (doc.documentType === "Proforma Invoice") return `/payments/estimateDetails/${doc.id}`;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <RefreshCw className="animate-spin text-[#194090] mb-1" size={32} />
        <p className="ml-2 text-slate-600">Loading Account Overview...</p>
      </div>
    );
  }

  const { companyInfo, financials, recentDocuments, paymentSchedule, activityLogs } = data;

  const getActionBadgeClass = (action = "") => {
    const normalized = String(action).toLowerCase();
    if (normalized.includes("create")) return "bg-[#e6f7ec] text-[#00a86b]";
    if (normalized.includes("update")) return "bg-[#e6f0fa] text-[#194090]";
    if (normalized.includes("delete")) return "bg-[#ffebee] text-[#ea580c]";
    if (normalized.includes("login")) return "bg-[#f3e8ff] text-[#7e22ce]";
    return "bg-gray-100 text-gray-600";
  };

  const formatActivityTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-[#f8f9fc] p-4">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#194090] font-semibold mb-1">
        <span>Exhibitors</span>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-slate-800">{companyInfo?.name}</span>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-slate-500 font-normal">Accounts</span>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-slate-500 font-normal">Overview</span>
      </div>

      <CompanyAccountSummary companyInfo={companyInfo} financials={financials} />

      {/* Action Buttons Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-1">
        <button onClick={() => navigate(`/performa-invoice/${id}`)} className="flex items-center gap-2 p-2 bg-[#f0f5ff] hover:bg-[#e6edfa] border border-[#dbe6fa] rounded-lg transition-colors text-left group">
          <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
            <FilePlus size={16} className="text-[#2563eb]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-bold text-[#1a2b4b] leading-tight truncate">Create Proforma Invoice</h4>
            <p className="text-[10.5px] text-slate-500 leading-tight truncate">Create a proforma invoice</p>
          </div>
          <ArrowRight size={14} className="text-[#1a2b4b] opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>

        <button onClick={() => navigate(`/page-create-invoice/${id}`)} className="flex items-center gap-2 p-2 bg-[#f0fdf4] hover:bg-[#e6f7ec] border border-[#d6f0df] rounded-lg transition-colors text-left group">
          <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
            <FilePlus size={16} className="text-[#16a34a]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-bold text-[#1a2b4b] leading-tight truncate">Create Invoice</h4>
            <p className="text-[10.5px] text-slate-500 leading-tight truncate">Create a new invoice</p>
          </div>
          <ArrowRight size={14} className="text-[#1a2b4b] opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>

        <button onClick={() => navigate(`/dashboard/account/AddPayment/${id}`)} className="flex items-center gap-2 p-2 bg-[#fff7ed] hover:bg-[#ffedd5] border border-[#fbe3c4] rounded-lg transition-colors text-left group">
          <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
            <CreditCard size={16} className="text-[#ea580c]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-bold text-[#1a2b4b] leading-tight truncate">Add Payment</h4>
            <p className="text-[10.5px] text-slate-500 leading-tight truncate">Record a payment</p>
          </div>
          <ArrowRight size={14} className="text-[#1a2b4b] opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>

        <button onClick={() => navigate(`/create-debit-note/${id}`)} className="flex items-center gap-2 p-2 bg-[#faf5ff] hover:bg-[#f3e8ff] border border-[#ecd9fb] rounded-lg transition-colors text-left group">
          <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
            <FileMinus size={16} className="text-[#7e22ce]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-bold text-[#1a2b4b] leading-tight truncate">Create Debit Note</h4>
            <p className="text-[10.5px] text-slate-500 leading-tight truncate">Raise additional charges</p>
          </div>
          <ArrowRight size={14} className="text-[#1a2b4b] opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>
      </div>

      {/* 3 Column Grid (Recent Docs, Payment Schedule, Last Payment) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 mb-2 items-start">

        {/* Recent Documents */}
        <div className="bg-white rounded-lg shadow-[rgba(67,71,85,0.18)_0px_0px_0.25em,rgba(90,125,188,0.05)_0px_0.25em_1em] border border-gray-100 p-3 flex flex-col h-[380px] overflow-hidden self-start">
          <div className="flex justify-between items-center mb-1.5">
            <h2 className="text-[13px] font-medium text-[#1a2b4b] tracking-tight">Recent Documents</h2>
          </div>
          <div className="overflow-x-auto flex-1 table-scroll-wrapper">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[9px] font-medium text-slate-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="pb-2 pr-2">Document Type</th>
                  <th className="pb-2 pr-2">Document No.</th>
                  <th className="pb-2 pr-2">Date</th>
                  <th className="pb-2 pr-2">Amount</th>
                  <th className="pb-2 pr-2">Status</th>
                  <th className="pb-2">Action</th>
                </tr>
              </thead>
              <tbody className="text-[11px] text-slate-700">
                {recentDocuments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">No documents yet.</td>
                  </tr>
                )}
                {recentDocuments.map((doc, idx) => {
                  let docTypeBg = 'bg-gray-100 text-gray-600';
                  if (doc.documentType === 'Invoice') docTypeBg = 'bg-[#e6f7ec] text-[#00a86b]';
                  else if (doc.documentType === 'Proforma Invoice') docTypeBg = 'bg-[#e6f0fa] text-[#194090]';
                  else if (doc.documentType === 'Debit Note') docTypeBg = 'bg-[#faf5ff] text-[#7e22ce]';
                  else if (doc.documentType === 'Credit Note') docTypeBg = 'bg-[#fff1f2] text-[#e11d48]';

                  let statusBg = 'bg-gray-100 text-gray-600';
                  if (doc.status === 'Paid' || doc.status === 'Accepted') statusBg = 'bg-[#e6f7ec] text-[#00a86b]';
                  else if (doc.status === 'Unpaid' || doc.status === 'Pending') statusBg = 'bg-[#ffebee] text-[#ff4d4f]';
                  else if (doc.status === 'Sent' || doc.status === 'Converted') statusBg = 'bg-[#e6f0fa] text-[#194090]';

                  const viewPath = getDocViewPath(doc);

                  return (
                    <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-slate-50/50">
                      <td className="py-1 pr-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${docTypeBg}`}>
                          {doc.documentType}
                        </span>
                      </td>
                      <td className="py-1 pr-2 font-medium text-[#1a2b4b]">{doc.documentNo}</td>
                      <td className="py-1 pr-2">{doc.date ? new Date(doc.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                      <td className="py-1 pr-2 font-medium text-[12px] text-[#1a2b4b]">{formatCurrency(doc.amount)}</td>
                      <td className="py-1 pr-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${statusBg}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-1">
                        <div className="flex items-center gap-2 text-[#194090]">
                          <button
                            disabled={!viewPath}
                            onClick={() => viewPath && navigate(viewPath)}
                            className={viewPath ? "hover:text-blue-800" : "text-gray-300 cursor-not-allowed"}
                            title={viewPath ? "View" : "No detail view available"}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            disabled={!viewPath}
                            onClick={() => viewPath && navigate(viewPath)}
                            className={viewPath ? "hover:text-blue-800" : "text-gray-300 cursor-not-allowed"}
                            title={viewPath ? "Open document" : "No detail view available"}
                          >
                            <Download size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Schedule */}
        <div className="bg-white rounded-lg shadow-[rgba(67,71,85,0.18)_0px_0px_0.25em,rgba(90,125,188,0.05)_0px_0.25em_1em] border border-gray-100 p-3 flex flex-col h-[380px] overflow-hidden self-start">
          <div className="flex justify-between items-center mb-1.5">
            <h2 className="text-[13px] font-medium text-[#1a2b4b] tracking-tight">Payment Schedule</h2>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse mb-1">
              <thead>
                <tr className="text-[9px] font-medium text-slate-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="pb-1 pr-1">#</th>
                  <th className="pb-1 pr-2">Schedule Type</th>
                  <th className="pb-1 pr-2">Due Date</th>
                  <th className="pb-1 pr-2">Due Amount</th>
                  <th className="pb-1">Status</th>
                </tr>
              </thead>
              <tbody className="text-[11px] text-slate-700">
                {paymentSchedule.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">No payment schedule yet.</td>
                  </tr>
                )}
                {paymentSchedule.map((schedule, idx) => (
                  <tr key={schedule.id} className="border-b border-gray-50 hover:bg-slate-50/50">
                    <td className="py-1 pr-1 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-1 pr-2 font-medium text-[#1a2b4b]">{schedule.scheduleType}</td>
                    <td className="py-1 pr-2">{schedule.dueDate}</td>
                    <td className="py-1 pr-2">{formatCurrency(schedule.dueAmount)}</td>
                    <td className="py-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${schedule.status === 'Paid' ? 'bg-[#e6f7ec] text-[#00a86b]' : 'bg-[#fff1f2] text-[#ea580c]'}`}>
                        {schedule.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Row */}
            <div className="mt-1 p-2 bg-[#f8f9fc] rounded-lg flex justify-between items-center">
              <span className="font-medium text-[#1a2b4b]">Total</span>
              <span className="text-[15px] font-medium text-[#194090]">{formatCurrency(financials.totalDue)}</span>
            </div>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white rounded-lg shadow-[rgba(67,71,85,0.18)_0px_0px_0.25em,rgba(90,125,188,0.05)_0px_0.25em_1em] border border-gray-100 p-3 flex flex-col h-[380px] overflow-hidden self-start">
          <div className="flex items-center justify-between mb-1.5">
            <h2 className="text-[13px] font-medium text-[#1a2b4b] tracking-tight">Activity Logs</h2>
            <div className="flex items-center gap-1 text-[9px] font-semibold text-[#194090] bg-[#e6f0fa] px-1.5 py-0.5 rounded-full">
              <Activity size={11} />
              <span>{activityLogs.length} Recent</span>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            {activityLogs.length > 0 ? (
              <div className="space-y-1.5">
                {activityLogs.map((log) => (
                  <div key={log.id} className="rounded-lg border border-gray-100 bg-[#fafbff] px-2 py-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${getActionBadgeClass(log.action)}`}>
                            {log.action || "Activity"}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
                            {log.module || "System"}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-[#1a2b4b] leading-snug">
                          {log.details || "-"}
                        </p>
                        <p className="text-[9px] text-slate-500 mt-0.5">
                          {log.user || "System"}{log.ip_address ? ` • ${log.ip_address}` : ""}
                        </p>
                      </div>
                      <span className="text-[9px] text-slate-400 whitespace-nowrap shrink-0">
                        {formatActivityTime(log.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 text-sm">
                <p>No activity recorded yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Footer / Exhibitor Contact */}
      <div className="bg-white rounded-lg shadow-[rgba(67,71,85,0.18)_0px_0px_0.25em,rgba(90,125,188,0.05)_0px_0.25em_1em] border border-gray-100 p-4 flex flex-col md:flex-row items-center gap-1 justify-between">
        <h2 className="text-[12px] font-medium text-[#1a2b4b] tracking-tight shrink-0">Exhibitor Contact</h2>

        <div className="flex-1 flex flex-wrap justify-between items-center gap-1 w-full text-[10px] text-slate-700">
          <div className="flex items-center gap-1">
            <User size={15} className="text-[#194090] shrink-0" />
            <span className="font-medium whitespace-nowrap">{companyInfo?.contactPerson}</span>
          </div>
          <div className="flex items-center gap-1">
            <Mail size={15} className="text-[#194090] shrink-0" />
            <a href={`mailto:${companyInfo?.email}`} className="whitespace-nowrap hover:text-[#194090] hover:underline">{companyInfo?.email}</a>
          </div>
          <div className="flex items-center gap-1">
            <Phone size={15} className="text-[#194090] shrink-0" />
            <span className="whitespace-nowrap">{companyInfo?.mobile}</span>
          </div>
          <div className="flex items-center gap-1 max-w-[280px] sm:max-w-sm">
            <MapPin size={15} className="text-[#194090] shrink-0" />
            <span className="truncate" title={companyInfo?.address}>{companyInfo?.address}</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AccountOverview;
