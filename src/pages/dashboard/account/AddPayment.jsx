import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft, Receipt, UploadCloud, CheckCircle, ChevronRight,
} from "lucide-react";
import api from "../../../lib/api";
import { resolveLinkedIds } from "../../../utils/resolveLinkedIds";
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
      formData.append("added_by", localStorage.getItem("user_name") || "Admin");
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

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#194090] font-semibold mb-1">
        <span>Exhibitors</span>
        <ChevronRight size={14} className="text-gray-400" />
        <span>{companyInfo?.name}</span>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-slate-500 font-normal">Accounts</span>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-slate-800">Add Payment</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-[#1a2b4b]">Add Payment</h1>
          <p className="text-[13px] text-slate-500">Record a payment received from the exhibitor.</p>
        </div>
        <button
          onClick={() => navigate(`/dashboard/account/${id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-[13px] font-bold text-[#194090] hover:bg-gray-50 transition"
        >
          <ArrowLeft size={14} /> Back to Overview
        </button>
      </div>

      <CompanyAccountSummary companyInfo={companyInfo} financials={financials} />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT: Payment Details */}
        <div className="xl:col-span-8 bg-white rounded-xl shadow-[0px_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-1">
            <Receipt size={18} className="text-[#194090]" />
            <h2 className="text-[16px] font-bold text-[#1a2b4b]">Payment Details</h2>
          </div>

          {/* Row: Document type + document + amount */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-1">
            <div className="md:col-span-1">
              <label className="block text-[12px] font-bold text-slate-600 mb-1">Select Document Type</label>
              <div className="flex gap-2">
                {["Invoice", "Proforma Invoice"].map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => handleDocTypeChange(type)}
                    className={`flex-1 text-left border rounded-lg px-3 py-2 transition ${docType === type ? "border-[#194090] bg-[#f0f5ff]" : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${docType === type ? "border-[#194090]" : "border-gray-300"
                          }`}
                      >
                        {docType === type && <span className="w-1.5 h-1.5 rounded-full bg-[#194090]" />}
                      </span>
                      <span className="text-[12px] font-bold text-[#1a2b4b]">{type}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 ml-5">
                      Record payment against {type === "Invoice" ? "an invoice" : "a proforma invoice"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-1">Select Document</label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-[#1a2b4b] focus:outline-none focus:border-[#194090]"
              >
                <option value="">{documentOptions.length ? "Select Invoice" : "No documents found"}</option>
                {documentOptions.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {docType === "Invoice" ? doc.invoice_no : doc.est_no}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-1">Invoice Amount</label>
              <input
                value={formatCurrency(invoiceAmount)}
                readOnly
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-[13px] text-slate-600"
              />
            </div>
          </div>

          {/* Row: payment for + outstanding + date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-1">
            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-1">Select Payment For <span className="text-red-500">*</span></label>
              <select
                value={paymentFor}
                onChange={(e) => setPaymentFor(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-[#1a2b4b] focus:outline-none focus:border-[#194090]"
              >
                {PAYMENT_FOR_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Example: Advance Payment / Final Payment / Part Payment / Balance Payment</p>
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-1">Outstanding Amount</label>
              <input
                value={formatCurrency(outstandingAmount)}
                readOnly
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-[13px] text-slate-600"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-1">Payment Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-[#1a2b4b] focus:outline-none focus:border-[#194090]"
              />
            </div>
          </div>

          {/* Row: amount received + mode + ref + bank */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-1">
            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-1">Amount Received <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                placeholder="₹ Enter Amount"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-[#1a2b4b] focus:outline-none focus:border-[#194090]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-1">Payment Mode <span className="text-red-500">*</span></label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-[#1a2b4b] focus:outline-none focus:border-[#194090]"
              >
                {PAYMENT_MODE_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-1">Reference No.</label>
              <input
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="Enter Reference No."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-[#1a2b4b] focus:outline-none focus:border-[#194090]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-1">Bank Name</label>
              <input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Enter Bank Name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-[#1a2b4b] focus:outline-none focus:border-[#194090]"
              />
            </div>
          </div>

          {/* Row: txn date + tds toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-1">
            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-1">Transaction / Cheque Date</label>
              <input
                type="date"
                value={txnDate}
                onChange={(e) => setTxnDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-[#1a2b4b] focus:outline-none focus:border-[#194090]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-1">TDS Deduction</label>
              <div className="flex items-center gap-5 h-[42px]">
                <label className="flex items-center gap-2 text-[13px] text-[#1a2b4b] cursor-pointer">
                  <input type="radio" checked={deductTds} onChange={() => setDeductTds(true)} className="accent-[#194090]" />
                  Yes, Deduct TDS
                </label>
                <label className="flex items-center gap-2 text-[13px] text-[#1a2b4b] cursor-pointer">
                  <input type="radio" checked={!deductTds} onChange={() => setDeductTds(false)} className="accent-[#194090]" />
                  No, Do not Deduct
                </label>
              </div>
            </div>
          </div>

          {deductTds && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-1 bg-[#f8f9fc] rounded-lg p-4 border border-gray-100">
              <div>
                <label className="block text-[12px] font-bold text-slate-600 mb-1">TDS Rate (%) <span className="text-red-500">*</span></label>
                <select
                  value={tdsRate}
                  onChange={(e) => setTdsRate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-[#1a2b4b] bg-white focus:outline-none focus:border-[#194090]"
                >
                  {TDS_RATE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}%</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-600 mb-1">TDS Amount (₹)</label>
                <input value={tdsAmount.toFixed(2)} readOnly className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2.5 text-[13px] text-slate-600" />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-600 mb-1">TDS Section</label>
                <select
                  value={tdsSection}
                  onChange={(e) => setTdsSection(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-[#1a2b4b] bg-white focus:outline-none focus:border-[#194090]"
                >
                  {TDS_SECTION_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-600 mb-1">TDS Certificate No.</label>
                <input
                  value={tdsCertNo}
                  onChange={(e) => setTdsCertNo(e.target.value)}
                  placeholder="Enter Certificate No."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-[#1a2b4b] focus:outline-none focus:border-[#194090]"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mb-1">
            <label className="block text-[12px] font-bold text-slate-600 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 250))}
              maxLength={250}
              placeholder="Add any notes (optional)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-[#1a2b4b] min-h-[60px] focus:outline-none focus:border-[#194090]"
            />
            <p className="text-[10px] text-slate-400 text-right mt-1">{notes.length} / 250</p>
          </div>

          {/* Upload proof */}
          <div className="mb-6">
            <label className="block text-[12px] font-bold text-slate-600 mb-1">Upload Payment Proof</label>
            <label className="border border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 py-5 cursor-pointer hover:bg-gray-50 transition text-[13px] text-slate-500">
              <UploadCloud size={16} />
              {proofFile ? (
                <span className="text-[#194090] font-semibold flex items-center gap-1.5">
                  <CheckCircle size={14} /> {proofFile.name}
                </span>
              ) : (
                <span>
                  Drag &amp; drop your file here or <span className="text-[#194090] font-bold">browse</span>
                </span>
              )}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              />
            </label>
            <p className="text-[10px] text-slate-400 mt-1">Supports: JPG, PNG, PDF (Max. 5MB)</p>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/account/${id}`)}
              className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-bold text-slate-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#4338ca] hover:bg-[#3730a3] text-white rounded-lg text-[13px] font-bold shadow-sm transition disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Payment"}
            </button>
          </div>
        </div>

        {/* RIGHT: Amount Summary */}
        <div className="xl:col-span-4">
          <div className="bg-white rounded-xl shadow-[0px_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 p-6 sticky top-20">
            <h2 className="text-[16px] font-bold text-[#1a2b4b] mb-1">Amount Summary</h2>
            <div className="space-y-4 text-[13px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Invoice Amount</span>
                <span className="font-bold text-[#1a2b4b]">{formatCurrency(invoiceAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment For</span>
                <span className="font-bold text-[#1a2b4b]">{paymentFor}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Amount Received</span>
                <span className="font-bold text-[#1a2b4b]">{formatCurrency(parseFloat(amountReceived) || 0)}</span>
              </div>
              {deductTds && (
                <div className="flex justify-between items-center text-[#ea580c]">
                  <span>(-) TDS Deduction ({tdsRate}%)</span>
                  <span className="font-bold">{formatCurrency(tdsAmount)}</span>
                </div>
              )}
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#1a2b4b]">Net Amount Received</span>
                <span className="font-black text-[#00a86b] text-[16px]">{formatCurrency(netAmountReceived)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Outstanding Amount (After Payment)</span>
                <span className="font-bold text-[#1a2b4b]">{formatCurrency(outstandingAfterPayment)}</span>
              </div>
            </div>
            <div className="mt-5 bg-[#f0f5ff] border border-[#dbe6fa] rounded-lg p-3 text-[11px] text-[#194090] leading-snug">
              TDS will be reflected in your invoice summary and can be downloaded from payment details.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddPayment;
