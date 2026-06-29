import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../lib/api";
import CompanyAccountSummary, { formatCurrency } from "./CompanyAccountSummary";
import {
  MapPin, Mail, Phone,
  Download, Eye,
  RefreshCw, ChevronRight,
  User, ArrowRight, FilePlus, CreditCard,
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
    lastPayment: null
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

  const { companyInfo, financials, recentDocuments, paymentSchedule, lastPayment } = data;

  return (
    <div className="bg-[#f8f9fc] p-6">

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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 mb-2">

        {/* Recent Documents */}
        <div className="bg-white rounded-lg shadow-[rgba(67,71,85,0.18)_0px_0px_0.25em,rgba(90,125,188,0.05)_0px_0.25em_1em] border border-gray-100 p-3 flex flex-col min-h-[320px]">
          <div className="flex justify-between items-center mb-1.5">
            <h2 className="text-[14px] font-medium text-[#1a2b4b] tracking-tight">Recent Documents</h2>
          </div>
          <div className="overflow-x-auto flex-1 table-scroll-wrapper">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-medium text-slate-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="pb-2 pr-3">Document Type</th>
                  <th className="pb-2 pr-3">Document No.</th>
                  <th className="pb-2 pr-3">Date</th>
                  <th className="pb-2 pr-3">Amount</th>
                  <th className="pb-2 pr-3">Status</th>
                  <th className="pb-2">Action</th>
                </tr>
              </thead>
              <tbody className="text-[12px] text-slate-700">
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
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${docTypeBg}`}>
                          {doc.documentType}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 font-medium text-[#1a2b4b] whitespace-nowrap">{doc.documentNo}</td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">{doc.date ? new Date(doc.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                      <td className="py-2.5 pr-3 font-medium text-[13px] text-[#1a2b4b] whitespace-nowrap">{formatCurrency(doc.amount)}</td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${statusBg}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-3 text-[#194090]">
                          <button
                            disabled={!viewPath}
                            onClick={() => viewPath && navigate(viewPath)}
                            className={viewPath ? "hover:text-blue-800" : "text-gray-300 cursor-not-allowed"}
                            title={viewPath ? "View" : "No detail view available"}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            disabled={!viewPath}
                            onClick={() => viewPath && navigate(viewPath)}
                            className={viewPath ? "hover:text-blue-800" : "text-gray-300 cursor-not-allowed"}
                            title={viewPath ? "Open document" : "No detail view available"}
                          >
                            <Download size={16} />
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
        <div className="bg-white rounded-lg shadow-[rgba(67,71,85,0.18)_0px_0px_0.25em,rgba(90,125,188,0.05)_0px_0.25em_1em] border border-gray-100 p-3 flex flex-col min-h-[320px]">
          <div className="flex justify-between items-center mb-1.5">
            <h2 className="text-[14px] font-medium text-[#1a2b4b] tracking-tight">Payment Schedule</h2>
          </div>
          <div className="overflow-x-auto flex-1 flex flex-col justify-between table-scroll-wrapper">
            <table className="w-full text-left border-collapse mb-1">
              <thead>
                <tr className="text-[10px] font-medium text-slate-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="pb-2 pr-2">#</th>
                  <th className="pb-2 pr-3">Schedule Type</th>
                  <th className="pb-2 pr-3">Due Date</th>
                  <th className="pb-2 pr-3">Due Amount</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="text-[12px] text-slate-700">
                {paymentSchedule.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">No payment schedule yet.</td>
                  </tr>
                )}
                {paymentSchedule.map((schedule, idx) => (
                  <tr key={schedule.id} className="border-b border-gray-50 hover:bg-slate-50/50">
                    <td className="py-2.5 pr-2 text-slate-400 font-medium whitespace-nowrap">{idx + 1}</td>
                    <td className="py-2.5 pr-3 font-medium text-[#1a2b4b] whitespace-nowrap">{schedule.scheduleType}</td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">{schedule.dueDate}</td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">{formatCurrency(schedule.dueAmount)}</td>
                    <td className="py-2.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${schedule.status === 'Paid' ? 'bg-[#e6f7ec] text-[#00a86b]' : 'bg-[#fff1f2] text-[#ea580c]'}`}>
                        {schedule.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Row */}
            <div className="mt-1 p-3 bg-[#f8f9fc] rounded-lg flex justify-between items-center">
              <span className="font-medium text-[#1a2b4b]">Total</span>
              <span className="text-[17px] font-medium text-[#194090]">{formatCurrency(financials.totalDue)}</span>
            </div>
          </div>
        </div>

        {/* Last Payment Received */}
        <div className="bg-white rounded-lg shadow-[rgba(67,71,85,0.18)_0px_0px_0.25em,rgba(90,125,188,0.05)_0px_0.25em_1em] border border-gray-100 p-3 flex flex-col min-h-[320px]">
          <div className="mb-1.5">
            <h2 className="text-[14px] font-medium text-[#1a2b4b] tracking-tight">Last Payment Received</h2>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            {lastPayment ? (
              <div className="space-y-3 text-[12px]">
                <div className="flex justify-between items-center gap-3">
                  <span className="font-medium text-slate-500 whitespace-nowrap">Payment No.</span>
                  <span className="text-slate-600 whitespace-nowrap truncate">{lastPayment.payment_no || '-'}</span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="font-medium text-slate-500 whitespace-nowrap">Payment Date</span>
                  <span className="text-slate-600 whitespace-nowrap">
                    {(lastPayment.payment_date || lastPayment.added)
                      ? new Date(lastPayment.payment_date || lastPayment.added).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="font-medium text-slate-500 whitespace-nowrap">Amount Received</span>
                  <span className="font-medium text-[#00a86b] text-[15px] whitespace-nowrap">{formatCurrency(lastPayment.amount_text)}</span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="font-medium text-slate-500 whitespace-nowrap">Payment Mode</span>
                  <span className="text-slate-600 whitespace-nowrap">{lastPayment.payment_mode}</span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="font-medium text-slate-500 whitespace-nowrap">Reference No.</span>
                  <span className="text-slate-600 whitespace-nowrap truncate">{lastPayment.utr_no || lastPayment.cheque_no || lastPayment.card_transaction_no || lastPayment.wallet_transaction_no || '-'}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 text-sm">
                <p>No payments recorded yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Footer / Exhibitor Contact */}
      <div className="bg-white rounded-lg shadow-[rgba(67,71,85,0.18)_0px_0px_0.25em,rgba(90,125,188,0.05)_0px_0.25em_1em] border border-gray-100 p-6 flex flex-col md:flex-row items-center gap-6 justify-between">
        <h2 className="text-[15px] font-medium text-[#1a2b4b] tracking-tight shrink-0">Exhibitor Contact</h2>

        <div className="flex-1 flex flex-wrap justify-between items-center gap-4 w-full text-[13px] text-slate-700">
          <div className="flex items-center gap-3">
            <User size={18} className="text-[#194090]" />
            <span className="font-semibold">{companyInfo?.contactPerson}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-[#194090]" />
            <span>{companyInfo?.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={18} className="text-[#194090]" />
            <span>{companyInfo?.mobile}</span>
          </div>
          <div className="flex items-center gap-3 max-w-xs">
            <MapPin size={18} className="text-[#194090] shrink-0" />
            <span className="truncate">{companyInfo?.address}</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AccountOverview;
