import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../lib/api";
import CompanyAccountSummary, { formatCurrency } from "./CompanyAccountSummary";
import { getCurrentUserName, getCurrentUsername } from "../../../utils/currentUser";
import {
  MapPin, Mail, Phone,
  Eye,
  RefreshCw, ChevronRight,
  User, ArrowRight, FilePlus, CreditCard, Activity,
  FileMinus, FileWarning,
  Truck,
  ArrowLeft,
} from "lucide-react";

const AccountOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId") || "";
  const crmEventId = searchParams.get("crmEventId") || "";
  const eventQueryParams = new URLSearchParams();
  if (eventId) eventQueryParams.set("eventId", eventId);
  if (crmEventId) eventQueryParams.set("crmEventId", crmEventId);
  const eventQuery = eventQueryParams.toString() ? `?${eventQueryParams.toString()}` : "";
  const scopedPath = (path) => `${path}${eventQuery}`;

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
  }, [id, eventId, crmEventId]);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      const res = await api.get(scopedPath(`/api/account-overview/${id}`));
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


  const getDocumentLink = (doc) => {
    if (doc.documentType === "Invoice") return `/payments/invoiceDetails/${doc.id}`;
    if (doc.documentType === "Proforma Invoice") return `/payments/estimateDetails/${doc.id}`;
    if (doc.documentType === "Delivery Challan") return scopedPath(`/dashboard/account/${id}/delivery-challans`);
    if (doc.documentType === "Payment") return scopedPath(`/payment-list/${id}`);
    if (doc.documentType === "Credit Note") return `/credit-note-view/${doc.id}`;
    if (doc.documentType === "Credit Note (Legacy)") return `/debit-note-view/${doc.id}`;
    if (doc.documentType === "Debit Note") return `/debit-note-view-account/${doc.id}`;
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
  const currentUserName = getCurrentUserName("Admin");
  const currentUsername = getCurrentUsername();
  const getActivityUserName = (user) => {
    const normalized = String(user || "").trim().toLowerCase();
    if (!normalized || ["admin", "system", "unknown_user", "unknown", "n/a"].includes(normalized) || normalized === currentUsername.toLowerCase()) {
      return currentUserName;
    }
    return user;
  };

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
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 text-sm text-[#194090] font-normal min-w-0">
          <span>Exhibitors</span>
          <ChevronRight size={14} className="text-gray-400 shrink-0" />
          <span className="text-slate-800 truncate">{companyInfo?.name}</span>
          <ChevronRight size={14} className="text-gray-400 shrink-0" />
          <span className="text-slate-500 font-normal">Accounts</span>
          <ChevronRight size={14} className="text-gray-400 shrink-0" />
          <span className="text-slate-500 font-normal">Overview</span>
        </div>
        <button onClick={() => navigate(scopedPath(`/client-overview/${id}`))} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-[#f8f9fc] border border-gray-200 rounded-md transition-colors text-[#1a2b4b] text-[11px] font-normal shadow-sm shrink-0">
          <ArrowLeft size={13} className="text-[#194090]" />
          <span>Client Overview</span>
        </button>
      </div>

      <CompanyAccountSummary companyInfo={companyInfo} financials={financials} />

      {/* Action Buttons Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-1">
        <button onClick={() => navigate(scopedPath(`/performa-invoice-list/${id}`))} className="flex items-center gap-2 p-2 bg-[#f0f5ff] hover:bg-[#e6edfa] border border-[#dbe6fa] rounded-lg transition-colors text-left group">
          <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
            <FilePlus size={16} className="text-[#2563eb]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-normal text-[#1a2b4b] leading-tight truncate">Proforma Invoice</h4>
            <p className="text-[10.5px] text-slate-500 leading-tight truncate">Create a proforma invoice</p>
          </div>
          <ArrowRight size={14} className="text-[#1a2b4b] opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>

        <button onClick={() => navigate(scopedPath(`/dashboard/account/${id}/delivery-challans`))} className="flex items-center gap-2 p-2 bg-[#f0fdfa] hover:bg-[#ccfbf1] border border-[#ccfbf1] rounded-lg transition-colors text-left group">
          <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
            <Truck size={16} className="text-[#0f766e]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-normal text-[#1a2b4b] leading-tight truncate">Delivery Challan</h4>
            <p className="text-[10.5px] text-slate-500 leading-tight truncate">Create and track challans</p>
          </div>
          <ArrowRight size={14} className="text-[#1a2b4b] opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>

        <button onClick={() => navigate(scopedPath(`/invoice-list/${id}`))} className="flex items-center gap-2 p-2 bg-[#f0fdf4] hover:bg-[#e6f7ec] border border-[#d6f0df] rounded-lg transition-colors text-left group">
          <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
            <FilePlus size={16} className="text-[#16a34a]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-normal text-[#1a2b4b] leading-tight truncate">Invoice</h4>
            <p className="text-[10.5px] text-slate-500 leading-tight truncate">Create a new invoice</p>
          </div>
          <ArrowRight size={14} className="text-[#1a2b4b] opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>

        <button onClick={() => navigate(scopedPath(`/payment-list/${id}`))} className="flex items-center gap-2 p-2 bg-[#fff7ed] hover:bg-[#ffedd5] border border-[#fbe3c4] rounded-lg transition-colors text-left group">
          <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
            <CreditCard size={16} className="text-[#ea580c]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-normal text-[#1a2b4b] leading-tight truncate">Payments</h4>
            <p className="text-[10.5px] text-slate-500 leading-tight truncate">Record a payments</p>
          </div>
          <ArrowRight size={14} className="text-[#1a2b4b] opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>

        <button onClick={() => navigate(scopedPath(`/dashboard/account/credit-notes/${id}`))} className="flex items-center gap-2 p-2 bg-[#faf5ff] hover:bg-[#f3e8ff] border border-[#ecd9fb] rounded-lg transition-colors text-left group">
          <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
            <FileMinus size={16} className="text-[#7e22ce]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-normal text-[#1a2b4b] leading-tight truncate">Credit Note</h4>
            <p className="text-[10.5px] text-slate-500 leading-tight truncate">View and create credit notes</p>
          </div>
          <ArrowRight size={14} className="text-[#1a2b4b] opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>

        <button onClick={() => navigate(scopedPath(`/account-debit-notes/${id}`))} className="flex items-center gap-2 p-2 bg-[#fff7ed] hover:bg-[#ffedd5] border border-[#fbe3c4] rounded-lg transition-colors text-left group">
          <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
            <FileWarning size={16} className="text-[#c2410c]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-normal text-[#1a2b4b] leading-tight truncate">Debit Note</h4>
            <p className="text-[10.5px] text-slate-500 leading-tight truncate">View and create debit notes</p>
          </div>
          <ArrowRight size={14} className="text-[#1a2b4b] opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>

      </div>

      {/* 3 Column Grid (Recent Docs, Payment Schedule, Activity Logs) */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_280px] gap-2 mb-2 items-start">

        {/* Recent Documents */}
        <div className="bg-white rounded-lg shadow-[rgba(67,71,85,0.18)_0px_0px_0.25em,rgba(90,125,188,0.05)_0px_0.25em_1em] border border-gray-100 p-3 flex flex-col h-[380px] overflow-hidden self-start w-full max-w-full">
          <div className="flex justify-between items-center mb-1.5">
            <h2 className="text-[13px] font-normal text-[#1a2b4b] tracking-tight">Recent Documents</h2>
          </div>
          <div className="overflow-auto flex-1 table-scroll-wrapper thin-scrollbar">
            <table className="w-max text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-normal text-slate-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="pb-2 pr-3 text-left whitespace-nowrap">Document</th>
                  <th className="pb-2 pr-3 text-left whitespace-nowrap">Document No.</th>
                  <th className="pb-2 pr-3 text-left whitespace-nowrap">Date</th>
                  <th className="pb-2 pr-3 text-left whitespace-nowrap">Amount</th>
                  <th className="pb-2 pr-3 text-left whitespace-nowrap">Status</th>
                  <th className="pb-2 text-center whitespace-nowrap">Action</th>
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
                  else if (doc.documentType === 'Delivery Challan') docTypeBg = 'bg-teal-50 text-teal-700';
                  else if (doc.documentType === 'Payment') docTypeBg = 'bg-amber-50 text-amber-600';

                  let statusBg = 'bg-gray-100 text-gray-600';
                  if (doc.status === 'Paid' || doc.status === 'Accepted' || doc.status === 'Received') statusBg = 'bg-[#e6f7ec] text-[#00a86b]';
                  else if (doc.status === 'Unpaid' || doc.status === 'Pending') statusBg = 'bg-[#ffebee] text-[#ff4d4f]';
                  else if (doc.status === 'Cancelled') statusBg = 'bg-red-50 text-red-600';
                  else if (doc.status === 'E-Sent') statusBg = 'bg-blue-50 text-blue-600';
                  else if (doc.status === 'W-Sent') statusBg = 'bg-emerald-50 text-emerald-600';
                  else if (doc.status === 'E/W-Sent') statusBg = 'bg-teal-50 text-teal-700';
                  else if (doc.status === 'Sent' || doc.status === 'Converted') statusBg = 'bg-[#e6f0fa] text-[#194090]';
                  else if (['Issued', 'Delivered', 'Acknowledged', 'Draft'].includes(doc.status)) statusBg = 'bg-teal-50 text-teal-700';

                  const viewPath = getDocumentLink(doc);

                  return (
                    <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-slate-50/50 leading-tight">
                      <td className="py-0.5 pr-3 text-left whitespace-nowrap">
                        <span className={`px-1.5 py-[1px] rounded text-[11px] font-normal whitespace-nowrap ${docTypeBg}`}>
                          {doc.documentType}
                        </span>
                      </td>
                      <td className="py-0.5 pr-3 text-left font-normal text-[#1a2b4b] whitespace-nowrap">{doc.documentNo}</td>
                      <td className="py-0.5 pr-3 text-left font-normal text-[#1a2b4b] whitespace-nowrap">{doc.date ? new Date(doc.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '-'}</td>
                      <td className="py-0.5 pr-3 text-left font-normal text-[#1a2b4b] whitespace-nowrap">{formatCurrency(doc.amount)}</td>
                      <td className="py-0.5 pr-3 text-left whitespace-nowrap">
                        <span className={`px-1.5 py-[1px] rounded text-[11px] font-normal whitespace-nowrap ${statusBg}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-0.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2 text-[#194090]">
                          <button
                            disabled={!viewPath}
                            onClick={() => viewPath && navigate(viewPath)}
                            className={viewPath ? "hover:text-blue-800" : "text-gray-300 cursor-not-allowed"}
                            title={viewPath ? "View" : "No detail view available"}
                          >
                            <Eye size={13} />
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
            <h2 className="text-[13px] font-normal text-[#1a2b4b] tracking-tight">Payment Schedule</h2>
          </div>
          <div className="overflow-auto flex-1 thin-scrollbar">
            <table className="w-full text-left border-collapse mb-1">
              <thead>
                <tr className="text-[11px] font-normal text-slate-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="pb-2 pr-3 text-left whitespace-nowrap">#</th>
                  <th className="pb-2 pr-3 text-left whitespace-nowrap">Schedule Type</th>
                  <th className="pb-2 pr-3 text-left whitespace-nowrap">Due Date</th>
                  <th className="pb-2 pr-3 text-left whitespace-nowrap">Due Amount</th>
                  <th className="pb-2 text-left whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="text-[11px] text-slate-700">
                {paymentSchedule.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">No payment schedule yet.</td>
                  </tr>
                )}
                {paymentSchedule.map((schedule, idx) => (
                  <tr key={schedule.id} className="border-b border-gray-50 last:border-0 hover:bg-slate-50/50 leading-tight">
                    <td className="py-0.5 pr-3 text-left text-slate-400 font-normal whitespace-nowrap">{idx + 1}</td>
                    <td className="py-0.5 pr-3 text-left font-normal text-[#1a2b4b] whitespace-nowrap">{schedule.scheduleType}</td>
                    <td className="py-0.5 pr-3 text-left font-normal text-[#1a2b4b] whitespace-nowrap">{schedule.dueDate ? new Date(schedule.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '-'}</td>
                    <td className="py-0.5 pr-3 text-left font-normal text-[#1a2b4b] whitespace-nowrap">{formatCurrency(schedule.dueAmount)}</td>
                    <td className="py-0.5 text-left whitespace-nowrap">
                      <span className={`px-1.5 py-[1px] rounded text-[11px] font-normal whitespace-nowrap ${schedule.status === 'Paid' ? 'bg-[#e6f7ec] text-[#00a86b]' : 'bg-[#fff1f2] text-[#ea580c]'}`}>
                        {schedule.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Row */}
            <div className="mt-1 p-2 bg-[#f8f9fc] rounded-lg flex justify-between items-center">
              <span className="font-normal text-[#1a2b4b]">Total</span>
              <span className="text-[15px] font-normal text-[#194090]">{formatCurrency(financials.totalDue)}</span>
            </div>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white rounded-lg shadow-[rgba(67,71,85,0.18)_0px_0px_0.25em,rgba(90,125,188,0.05)_0px_0.25em_1em] border border-gray-100 p-3 flex flex-col h-[380px] overflow-hidden self-start xl:w-[280px] xl:justify-self-end">
          <div className="flex items-center justify-between mb-1.5">
            <h2 className="text-[13px] font-normal text-[#1a2b4b] tracking-tight">Activity Logs</h2>
            <div className="flex items-center gap-1 text-[9px] font-normal text-[#194090] bg-[#e6f0fa] px-1.5 py-0.5 rounded-full">
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
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-normal ${getActionBadgeClass(log.action)}`}>
                            {log.action || "Activity"}
                          </span>
                          <span className="text-[9px] font-normal text-slate-400 uppercase tracking-wide">
                            {log.module || "System"}
                          </span>
                        </div>
                        <p className="text-[11px] font-normal text-[#1a2b4b] leading-snug">
                          {log.details || "-"}
                        </p>
                        <p className="text-[9px] text-slate-500 mt-0.5">
                          {getActivityUserName(log.user)}{log.ip_address ? ` • ${log.ip_address}` : ""}
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
        <h2 className="text-[12px] font-normal text-[#1a2b4b] tracking-tight shrink-0">Exhibitor Contact</h2>

        <div className="flex-1 flex flex-wrap justify-between items-center gap-1 w-full text-[10px] text-slate-700">
          <div className="flex items-center gap-1">
            <User size={15} className="text-[#194090] shrink-0" />
            <span className="font-normal whitespace-nowrap">{companyInfo?.contactPerson}</span>
          </div>
          <div className="flex items-center gap-1">
            <Mail size={15} className="text-[#194090] shrink-0" />
            <a href={`mailto:${companyInfo?.email}`} className="whitespace-nowrap hover:text-[#194090] hover:underline">{companyInfo?.email}</a>
          </div>
          <div className="flex items-center gap-1">
            <Phone size={15} className="text-[#194090] shrink-0" />
            <span className="whitespace-nowrap">{companyInfo?.mobile}</span>
          </div>
          {/* <div className="flex items-center gap-1 max-w-[280px] sm:max-w-sm">
            <MapPin size={15} className="text-[#194090] shrink-0" />
            <span className="truncate" title={companyInfo?.address}>{companyInfo?.address}</span>
          </div> */}
        </div>
      </div>

    </div>
  );
};

export default AccountOverview;
