import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft, Receipt, UploadCloud, CheckCircle, ChevronRight, ChevronDown, Wallet,
} from "lucide-react";
import api from "../../../lib/api";
import { resolveLinkedIds } from "../../../utils/resolveLinkedIds";
import { getCurrentUserName } from "../../../utils/currentUser";
import CompanyAccountSummary, { formatCurrency } from "./CompanyAccountSummary";

const PAYMENT_FOR_OPTIONS = ["Advance Payment", "Running Payment", "Final Payment", "Part Payment", "Balance Payment"];
const PAYMENT_MODE_OPTIONS = ["NEFT", "RTGS", "UPI", "Cash", "Cheque", "Card", "Wallet", "Bank Transfer", "Other"];
const TDS_RATE_OPTIONS = ["1", "2", "5", "10"];
const TDS_SECTION_OPTIONS = ["194C", "194J", "194Q", "194I", "Other"];

const today = () => new Date().toISOString().split("T")[0];

const AddPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accountData, setAccountData] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [proformas, setProformas] = useState([]);
  const [payments, setPayments] = useState([]);

  const [docType, setDocType] = useState("Invoice");
  const [selectedDocId, setSelectedDocId] = useState("");
  const [paymentFor, setPaymentFor] = useState(PAYMENT_FOR_OPTIONS[0]);
  const [paymentDate, setPaymentDate] = useState(today());
  const [amountReceived, setAmountReceived] = useState("");
  const [paymentMode, setPaymentMode] = useState(PAYMENT_MODE_OPTIONS[0]);
  const [referenceNo, setReferenceNo] = useState("");
  const [bankName, setBankName] = useState("");
  const [txnDate, setTxnDate] = useState(today());
  const [deductTds, setDeductTds] = useState(false);
  const [tdsRate, setTdsRate] = useState(TDS_RATE_OPTIONS[3]);
  const [tdsSection, setTdsSection] = useState(TDS_SECTION_OPTIONS[0]);
  const [tdsCertNo, setTdsCertNo] = useState("");
  const [notes, setNotes] = useState("");
  const [proofFile, setProofFile] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        const [linkedIds, overviewRes, invRes, estRes, payRes] = await Promise.all([
          resolveLinkedIds(id),
          api.get(`/api/account-overview/${id}`),
          api.get("/api/invoices"),
          api.get("/api/estimates"),
          api.get("/api/payments"),
        ]);

        if (overviewRes.data.success) setAccountData(overviewRes.data.data);

        const allInvoices = Array.isArray(invRes.data) ? invRes.data : invRes.data?.data || [];
        const allEstimates = Array.isArray(estRes.data) ? estRes.data : estRes.data?.data || [];
        const allPayments = Array.isArray(payRes.data) ? payRes.data : payRes.data?.data || [];

        setInvoices(allInvoices.filter((inv) => linkedIds.includes(inv.companyId)));
        setProformas(allEstimates.filter((est) => linkedIds.includes(est.companyId)));
        setPayments(allPayments);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load account data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const documentOptions = useMemo(
    () => (docType === "Invoice" ? invoices : proformas),
    [docType, invoices, proformas]
  );

  const selectedDoc = useMemo(
    () => documentOptions.find((d) => d._id === selectedDocId) || null,
    [documentOptions, selectedDocId]
  );

  const invoiceAmount = selectedDoc?.finalAmount || 0;

  const outstandingAmount = useMemo(() => {
    if (!selectedDoc) return 0;
    const docPaid = payments
      .filter((p) => p.invoice_id === selectedDoc._id)
      .reduce((sum, p) => sum + (parseFloat(p.amount_text) || 0), 0);
    return Math.max(0, invoiceAmount - docPaid);
  }, [selectedDoc, payments, invoiceAmount]);

  const tdsAmount = useMemo(() => {
    if (!deductTds) return 0;
    const received = parseFloat(amountReceived) || 0;
    return Math.round(received * (parseFloat(tdsRate) / 100) * 100) / 100;
  }, [deductTds, amountReceived, tdsRate]);

  const netAmountReceived = Math.max(0, (parseFloat(amountReceived) || 0) - tdsAmount);
  const outstandingAfterPayment = Math.max(0, outstandingAmount - (parseFloat(amountReceived) || 0));

  const handleDocTypeChange = (type) => {
    setDocType(type);
    setSelectedDocId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDoc) {
      toast.error("Please select a document to record payment against.");
      return;
    }
    const received = parseFloat(amountReceived);
    if (!received || received <= 0) {
      toast.error("Please enter a valid amount received.");
      return;
    }
    if (!paymentMode) {
      toast.error("Please select a payment mode.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("companyId", selectedDoc.companyId || id);
      formData.append("invoice_id", selectedDoc._id);
      formData.append("f_amount", String(invoiceAmount));
      formData.append("amount_text", String(received));
      formData.append("tds_text", String(tdsAmount || 0));
      formData.append("payment_date", paymentDate);
      formData.append("pymnt_type", paymentFor);
      formData.append("payment_mode", paymentMode);
      formData.append("utr_no", referenceNo);
      formData.append("bankId", bankName);
      formData.append("cheque_date", txnDate);
      formData.append("card_date", txnDate);
      formData.append("neft_date", txnDate);
      formData.append("tds_rate", deductTds ? tdsRate : "");
      formData.append("tds_section", deductTds ? tdsSection : "");
      formData.append("tds_certificate_no", deductTds ? tdsCertNo : "");
      formData.append("ex_no", docType === "Invoice" ? selectedDoc.invoice_no : selectedDoc.est_no);
      formData.append("added_by", getCurrentUserName());
      formData.append("notes", notes);
      if (proofFile) formData.append("paymentProof", proofFile);

      await api.post("/api/payments", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Payment recorded successfully!");
      navigate(`/dashboard/account/${id}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to record payment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-6">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8 text-center max-w-md">
          <p className="text-[#1a2b4b] font-bold mb-2">No exhibitor account selected</p>
          <p className="text-slate-500 text-sm mb-4">Open this page from an exhibitor's Account Overview to record a payment against their invoices.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-[#194090] text-white rounded-lg text-sm font-bold"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { companyInfo, financials } = accountData || {};

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-4 lg:p-6 lg:pr-20">
      {/* Breadcrumb (hidden visually in mockup, but good to keep for UX, or we can remove it. Mockup doesn't show it, so let's keep it minimal or remove it. I'll keep it as it's standard) */}
      <div className="flex items-center gap-2 text-sm text-[#194090] font-semibold mb-4">
        <span>Exhibitors</span>
        <ChevronRight size={14} className="text-gray-400" />
        <span>{companyInfo?.name}</span>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-slate-500 font-normal">Accounts</span>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-slate-800">Add Payment</span>
      </div>

      <CompanyAccountSummary companyInfo={companyInfo} financials={financials} />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-4 mt-2">
        {/* LEFT: Payment Details */}
        <div className="xl:col-span-8 bg-white rounded-xl shadow-sm border border-gray-100 p-2 md:p-4">
          <div className="mb-2 border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded flex items-center justify-center bg-[#f0f5ff] text-[#194090]">
                <Receipt size={14} />
              </div>
              <h2 className="text-[16px] font-medium text-[#1a2b4b]">Payment Details</h2>
            </div>
            <p className="text-[12px] text-slate-500 ml-8">Record and manage payment for this exhibitor</p>
          </div>

          {/* STEP 1: Document & Invoice */}
          <div className="mb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-5 h-5 rounded-full bg-[#3b82f6] text-white flex items-center justify-center text-[11px] font-bold">1</div>
              <h3 className="text-[14px] font-medium text-[#1a2b4b]">Document & Invoice</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-8">
              <div className="md:col-span-1">
                <label className="block text-[12px] font-medium text-[#1a2b4b] mb-1">Document Type <span className="text-red-500">*</span></label>
                <div className="flex gap-6 items-center h-[32px] px-4 border border-gray-200 rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors hover:border-gray-300">
                  {["Invoice", "Proforma Invoice"].map((type) => (
                    <label key={type} className="flex items-center gap-2.5 cursor-pointer group flex-1">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors group-hover:border-[#3b82f6] ${docType === type ? "border-[#3b82f6]" : "border-gray-300"}`}>
                        {docType === type && <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />}
                      </div>
                      <span className={`text-[13px] font-semibold transition-colors ${docType === type ? "text-[#1a2b4b]" : "text-slate-500 group-hover:text-slate-700"}`}>
                        {type === "Proforma Invoice" ? "Proforma" : type}
                      </span>
                      <input type="radio" checked={docType === type} onChange={() => handleDocTypeChange(type)} className="hidden" />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#1a2b4b] mb-1">Select Document <span className="text-red-500">*</span></label>
                <div className="relative h-[32px]">
                  <select
                    value={selectedDocId}
                    onChange={(e) => setSelectedDocId(e.target.value)}
                    required
                    className="w-full h-full appearance-none border border-gray-200 rounded-lg px-3 py-1 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all cursor-pointer"
                  >
                    <option value="" disabled className="text-gray-400">Select {docType}</option>
                    {documentOptions.length === 0 && <option value="" disabled>No documents found</option>}
                    {documentOptions.map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        {docType === "Invoice" ? doc.invoice_no : doc.est_no}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#1a2b4b] mb-1">Invoice Amount</label>
                <div className="flex items-center h-[32px] px-3.5 bg-slate-50/80 border border-slate-200 rounded-lg shadow-inner">
                  <span className="text-slate-400 font-medium mr-1.5 text-[14px]">₹</span>
                  <span className="text-[14px] font-bold text-[#1a2b4b]">
                    {invoiceAmount ? formatCurrency(invoiceAmount) : "0.00"}
                  </span>
                </div>
              </div>
            </div>

            <div className="ml-8 mt-2 h-px bg-gray-100" />
          </div>

          {/* STEP 2: Payment Information */}
          <div className="mb-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-5 h-5 rounded-full bg-[#3b82f6] text-white flex items-center justify-center text-[11px] font-bold">2</div>
              <h3 className="text-[14px] font-medium text-[#1a2b4b]">Payment Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-8">
              <div>
                <label className="block text-[12px] font-medium text-[#1a2b4b] mb-1">Select Payment For <span className="text-red-500">*</span></label>
                <select
                  value={paymentFor}
                  onChange={(e) => setPaymentFor(e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-1 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all h-[32px]"
                >
                  {PAYMENT_FOR_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
                {/* <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">Example: Advance Payment / Final Payment /<br />Part Payment / Balance Payment</p> */}
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#1a2b4b] mb-1">Outstanding Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[13px]">₹</span>
                  <input
                    value={outstandingAmount || 0}
                    readOnly
                    className="w-full appearance-none border border-gray-200 bg-[#f8fafc] rounded-lg pl-7 pr-3 py-1 text-[13px] text-slate-600 focus:outline-none cursor-not-allowed h-[32px]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#1a2b4b] mb-1">Payment Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-1 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all h-[32px]"
                />
              </div>
            </div>

            <div className="ml-8 mt-4 h-px bg-gray-100" />
          </div>

          {/* STEP 3: Payment Received Details */}
          <div className="mb-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-5 h-5 rounded-full bg-[#3b82f6] text-white flex items-center justify-center text-[11px] font-bold">3</div>
              <h3 className="text-[14px] font-medium text-[#1a2b4b]">Payment Received Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pl-8 mb-4">
              <div>
                <label className="block text-[12px] font-medium text-[#1a2b4b] mb-1">Amount Received <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder="Enter Amount"
                    required
                    className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-1 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all h-[32px]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-[13px]">₹</span>
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#1a2b4b] mb-1">Payment Mode <span className="text-red-500">*</span></label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  required
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-1 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all h-[32px]"
                >
                  {PAYMENT_MODE_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#1a2b4b] mb-1">Reference No.</label>
                <input
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="Enter Reference No."
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-1 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all h-[32px]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#1a2b4b] mb-1">Bank Name</label>
                <input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Enter Bank Name"
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-1 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all h-[32px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
              <div>
                <label className="block text-[12px] font-medium text-[#1a2b4b] mb-1">Transaction / Cheque Date</label>
                <input
                  type="date"
                  value={txnDate}
                  onChange={(e) => setTxnDate(e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-1 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all h-[32px]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#1a2b4b] mb-1">TDS Deduction</label>
                <div className="flex items-center gap-4 h-[32px] px-4">
                  <label className="flex items-center gap-2 text-[13px] font-medium text-[#1a2b4b] cursor-pointer">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${deductTds ? "border-[#3b82f6]" : "border-gray-300"}`}>
                      {deductTds && <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />}
                    </div>
                    <input type="radio" checked={deductTds} onChange={() => setDeductTds(true)} className="hidden" />
                    Yes, Deduct TDS
                  </label>
                  <label className="flex items-center gap-2 text-[13px] font-medium text-[#1a2b4b] cursor-pointer">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${!deductTds ? "border-[#3b82f6]" : "border-gray-300"}`}>
                      {!deductTds && <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />}
                    </div>
                    <input type="radio" checked={!deductTds} onChange={() => setDeductTds(false)} className="hidden" />
                    No, Do not Deduct
                  </label>
                </div>
              </div>
            </div>

            {deductTds && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pl-8">
                <div>
                  <label className="block text-[12px] font-medium text-slate-600 mb-1">TDS Rate (%) <span className="text-red-500">*</span></label>
                  <select value={tdsRate} onChange={(e) => setTdsRate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-[#1a2b4b] bg-white focus:outline-none focus:border-[#3b82f6]">
                    {TDS_RATE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}%</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-slate-600 mb-1">TDS Amount (₹)</label>
                  <input value={tdsAmount.toFixed(2)} readOnly className="w-full appearance-none border border-gray-200 bg-gray-100 rounded-lg px-3 py-1 text-[13px] text-slate-600 h-[32px]" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-slate-600 mb-1">TDS Section</label>
                  <select value={tdsSection} onChange={(e) => setTdsSection(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-[#1a2b4b] bg-white focus:outline-none focus:border-[#3b82f6]">
                    {TDS_SECTION_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-slate-600 mb-1">TDS Cert. No.</label>
                  <input value={tdsCertNo} onChange={(e) => setTdsCertNo(e.target.value)} placeholder="Enter Cert No." className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-1 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all h-[32px]" />
                </div>
              </div>
            )}

            <div className="ml-8 mt-4 h-px bg-gray-100" />
          </div>

          {/* STEP 4: Additional Information */}
          <div className="mb-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-5 h-5 rounded-full bg-[#3b82f6] text-white flex items-center justify-center text-[11px] font-bold">4</div>
              <h3 className="text-[14px] font-medium text-[#1a2b4b]">Additional Information</h3>
            </div>

            <div className="pl-8">
              <div className="mb-2">
                <label className="block text-[12px] font-medium text-[#1a2b4b] mb-1">Notes (Optional)</label>
                <div className="relative">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value.slice(0, 250))}
                    maxLength={250}
                    placeholder="Add any notes (optional)"
                    className="w-full border border-gray-200 rounded-lg px-3 py-3 text-[13px] text-[#1a2b4b] min-h-[80px] focus:outline-none focus:border-[#3b82f6] resize-y"
                  />
                  <div className="absolute bottom-2 right-2 flex flex-col items-end pointer-events-none">
                    <span className="text-[10px] text-slate-400 bg-white px-1">{notes.length} / 250</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#1a2b4b] mb-1">Upload Payment Proof (Optional)</label>
                <label className="border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 py-6 cursor-pointer hover:bg-[#f8fafc] hover:border-[#3b82f6] transition text-[13px] text-slate-500 bg-white">
                  <UploadCloud size={16} className="text-[#3b82f6]" />
                  {proofFile ? (
                    <span className="text-[#3b82f6] font-semibold flex items-center gap-1.5">
                      <CheckCircle size={14} /> {proofFile.name}
                    </span>
                  ) : (
                    <span>
                      Drag &amp; drop your file here or <span className="text-[#3b82f6] font-bold cursor-pointer">browse</span>
                    </span>
                  )}
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">Supports: JPG, PNG, PDF (Max. 5MB)</p>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-8">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/account/${id}`)}
              className="px-6 py-2.5 border border-gray-200 rounded-lg text-[13px] font-bold text-slate-600 hover:bg-gray-50 transition flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#4338ca] hover:bg-[#3730a3] text-white rounded-lg text-[13px] font-bold shadow-sm transition disabled:opacity-60 flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              {submitting ? "Saving..." : "Save Payment"}
            </button>
          </div>
        </div>

        {/* RIGHT: Account Financial Summary */}
        <div className="xl:col-span-4">
          <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-6 md:p-8 sticky top-20">
            <div className="mb-6 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded flex items-center justify-center bg-[#f0fdf4] text-[#16a34a]">
                  <Wallet size={14} strokeWidth={2.5} />
                </div>
                <h2 className="text-[16px] font-bold text-[#1a2b4b]">Account Overview</h2>
              </div>
              <p className="text-[12px] text-slate-500 ml-8">Overall financial status for this company</p>
            </div>

            <div className="space-y-5 text-[13px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Total Billed</span>
                <span className="font-bold text-[#1a2b4b]">{formatCurrency(financials?.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Total Received</span>
                <span className="font-bold text-[#16a34a]">{formatCurrency(financials?.paidAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">TDS Deducted</span>
                <span className="font-bold text-[#ea580c]">{formatCurrency(financials?.tdsAmount)}</span>
              </div>

              <div className="h-px bg-gray-100 my-2 border border-dashed border-gray-200" style={{ borderWidth: "0 0 1px 0" }} />

              <div className="flex justify-between items-center">
                <span className="font-bold text-[#1a2b4b]">Total Outstanding</span>
                <span className="font-black text-[#dc2626] text-[16px]">{formatCurrency(financials?.outstandingAmount)}</span>
              </div>
            </div>

            <div className="mt-8 bg-[#f8fafc] rounded-lg p-4 flex items-start gap-3 border border-gray-100">
              <div className="w-5 h-5 rounded-full bg-[#3b82f6] text-white flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[11px] font-bold">i</span>
              </div>
              <p className="text-[12px] text-slate-600 font-medium leading-relaxed">
                These figures reflect the real-time financial data from the server. Newly added payments will update these totals.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddPayment;
