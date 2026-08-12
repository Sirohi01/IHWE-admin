import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Check } from "lucide-react";
import api from "../../../lib/api";
import { resolveLinkedIds } from "../../../utils/resolveLinkedIds";
import { getCurrentUserName } from "../../../utils/currentUser";
import AccountNavigation from '../../../components/AccountNavigation';

// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const PAYMENT_MODE_OPTIONS = ["NEFT", "IMPS", "RTGS", "UPI", "Cash", "Cheque", "Card", "Wallet", "Other"];
const PAYMENT_TYPE_OPTIONS = ["Advance Payment", "Final Payment", "Full Payment", "Running Payment"];
const getAutomaticNarration = (paymentType) => paymentType.replace(/\s+Payment$/i, "");

const nowLocalDate = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const isCancelled = (doc) => String(doc?.status || "").toLowerCase() === "cancelled";
const getDocumentNo = (doc, docType) => docType === "Invoice" ? doc.invoice_no : doc.est_no;
const getDocumentPartyName = (doc, fallbackName) => (
  doc.company_name ||
  doc.consignee_name ||
  doc.clientName ||
  doc.companyName ||
  fallbackName ||
  ""
);
const getDocumentLabel = (doc, docType, fallbackName) => [
  getDocumentNo(doc, docType),
  getDocumentPartyName(doc, fallbackName),
  formatCurrency(doc.finalAmount),
].filter(Boolean).join(" • ");

const AddPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accountData, setAccountData] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [proformas, setProformas] = useState([]);
  const [payments, setPayments] = useState([]);

  // New UI States
  const [paymentForSelection, setPaymentForSelection] = useState("Against Proforma Invoice");
  const docType = paymentForSelection === "Against Proforma Invoice" ? "Proforma Invoice" : "Invoice";

  const [selectedDocId, setSelectedDocId] = useState("");
  const [paymentDate, setPaymentDate] = useState(nowLocalDate());
  const [paymentMode, setPaymentMode] = useState(PAYMENT_MODE_OPTIONS[0]);
  const [paymentType, setPaymentType] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [bankName, setBankName] = useState("");
  const [receivedBy, setReceivedBy] = useState(getCurrentUserName() || "");
  const [receivedDate, setReceivedDate] = useState(nowLocalDate());
  const [bankAccounts, setBankAccounts] = useState([]);

  const [deductTds, setDeductTds] = useState("No");
  const [tdsAmountInput, setTdsAmountInput] = useState("");
  const [creditNoteAdjustment, setCreditNoteAdjustment] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");

  const [internalRemarks, setInternalRemarks] = useState("");
  const [narrationMode, setNarrationMode] = useState("automatic");
  const [customNarration, setCustomNarration] = useState("");
  const [proofFile, setProofFile] = useState(null);

  useEffect(() => {
    api.get("/api/banks")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setBankAccounts(list.filter((b) => String(b.status || "").toLowerCase() === "active"));
      })
      .catch((err) => console.error("Error fetching bank accounts:", err));
  }, []);

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

        const accountInvoices = allInvoices.filter((inv) => linkedIds.includes(inv.companyId) && !isCancelled(inv));
        const convertedEstimateIds = new Set(
          accountInvoices.map((inv) => String(inv.source_estimate_id || "")).filter(Boolean)
        );
        const convertedEstimateNos = new Set(
          accountInvoices.map((inv) => String(inv.estimate_no || "")).filter(Boolean)
        );
        setInvoices(accountInvoices);
        setProformas(allEstimates.filter((est) =>
          linkedIds.includes(est.companyId)
          && !isCancelled(est)
          && !convertedEstimateIds.has(String(est._id))
          && !convertedEstimateNos.has(String(est.est_no))
        ));
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

  const documentOptions = useMemo(() => {
    const list = docType === "Invoice" ? invoices : proformas;
    return list.filter((doc) => {
      const amount = doc.finalAmount || 0;
      if (amount <= 0) return true;
      const relatedDocumentIds = new Set([
        String(doc._id),
        String(doc.source_estimate_id || ""),
      ].filter(Boolean));
      const docPaid = payments
        .filter((p) => relatedDocumentIds.has(String(p.invoice_id)))
        .reduce((sum, p) => sum + (parseFloat(p.amount_text) || 0), 0);
      return docPaid < amount;
    });
  }, [docType, invoices, proformas, payments]);

  useEffect(() => {
    setSelectedDocId("");
  }, [paymentForSelection]);

  const selectedDoc = useMemo(
    () => documentOptions.find((d) => d._id === selectedDocId) || null,
    [documentOptions, selectedDocId]
  );

  const invoiceAmount = selectedDoc?.finalAmount || 0;

  const outstandingAmount = useMemo(() => {
    if (!selectedDoc) return 0;
    const relatedDocumentIds = new Set([
      String(selectedDoc._id),
      String(selectedDoc.source_estimate_id || ""),
    ].filter(Boolean));
    const docPaid = payments
      .filter((p) => relatedDocumentIds.has(String(p.invoice_id)))
      .reduce((sum, p) => sum + (parseFloat(p.amount_text) || 0), 0);
    return Math.max(0, invoiceAmount - docPaid);
  }, [selectedDoc, payments, invoiceAmount]);

  const parsedAmountReceived = parseFloat(amountReceived) || 0;
  const parsedTds = parseFloat(tdsAmountInput) || 0;
  const parsedCreditNode = parseFloat(creditNoteAdjustment) || 0;

  const balanceAfterPosting = Math.max(0, outstandingAmount - parsedAmountReceived - parsedTds - parsedCreditNode);
  const automaticNarration = getAutomaticNarration(paymentType);
  const narration = narrationMode === "custom" ? customNarration.trim() : automaticNarration;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDoc) {
      toast.error("Please select a document from the Allocate Payment table.");
      return;
    }
    if (isCancelled(selectedDoc)) {
      toast.error("Payment cannot be recorded against a cancelled document.");
      return;
    }
    if (!parsedAmountReceived || parsedAmountReceived <= 0) {
      toast.error("Please enter a valid amount received.");
      return;
    }
    if (!paymentMode) {
      toast.error("Please select a payment mode.");
      return;
    }
    if (!paymentType) {
      toast.error("Please select a payment type.");
      return;
    }
    if (paymentMode === "Cash" && (!receivedBy.trim() || !receivedDate)) {
      toast.error("Please enter received by and received date for cash payment.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("companyId", selectedDoc.companyId || id);
      formData.append("invoice_id", selectedDoc._id);
      formData.append("f_amount", String(invoiceAmount));
      formData.append("amount_text", String(parsedAmountReceived));
      formData.append("tds_text", String(parsedTds));
      formData.append("payment_date", paymentDate);
      formData.append("pymnt_type", paymentType);
      formData.append("status_short", paymentType);
      formData.append("payment_mode", paymentMode);
      formData.append("utr_no", paymentMode === "Cash" ? "" : referenceNo);
      formData.append("bankId", paymentMode === "Cash" ? "" : bankName);
      formData.append("received_by", paymentMode === "Cash" ? receivedBy.trim() : "");
      formData.append("received_date", paymentMode === "Cash" ? receivedDate : "");
      formData.append("ex_no", docType === "Invoice" ? selectedDoc.invoice_no : selectedDoc.est_no);
      formData.append("added_by", getCurrentUserName());
      // An empty custom narration tells the receipt generator to build the complete
      // automatic narration from the selected payment/document details.
      formData.append("customNarration", narrationMode === "custom" ? customNarration.trim() : "");
      formData.append("notes", internalRemarks);
      if (proofFile) formData.append("paymentProof", proofFile);

      await api.post("/api/payments", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Payment recorded successfully!");
      navigate(`/payment-list/${id}`);
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
        <p className="text-[#1a2b4b] font-bold">No exhibitor account selected</p>
      </div>
    );
  }

  const { companyInfo, financials } = accountData || {};

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-3 lg:p-4 text-slate-800 font-sans">

      {/* Header */}
      {/* Header */}
      <div className="mb-2">
        <AccountNavigation id={id} accountName={companyInfo?.name} pageName="Payments" />
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Add Payment</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/payment-list/${id}`)}
              className="px-5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="addPaymentForm"
              disabled={submitting}
              className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Payment"}
            </button>
          </div>
        </div>
      </div>

      {/* Top Summary Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-3 py-1 mb-2 flex flex-wrap lg:flex-nowrap items-center gap-3">
        <div className="flex-1 min-w-[250px]">
          <div className="text-[11px] text-slate-500 font-medium mb-0.5">Exhibitor</div>
          <div className="text-base font-bold text-slate-900 truncate">{companyInfo?.name || "N/A"}</div>
          {companyInfo?.stallNo && companyInfo?.stallNo !== 'N/A' && (
            <div className="text-[11px] text-slate-500 mt-0.5">
              Stall No. {companyInfo?.stallNo} {companyInfo?.stallSize && companyInfo?.stallSize !== 'N/A' ? `• ${companyInfo?.stallSize}` : ''} • IHWE 2026
            </div>
          )}
        </div>

        <div className="w-px h-10 bg-slate-200 hidden lg:block" />

        <div className="min-w-[120px]">
          <div className="text-[11px] text-slate-500 font-medium mb-0.5">Total Payable</div>
          <div className="text-xl font-bold text-slate-900"> {formatCurrency(financials?.totalDue)}</div>
        </div>

        <div className="w-px h-10 bg-slate-200 hidden lg:block" />

        <div className="min-w-[120px]">
          <div className="text-[11px] text-slate-500 font-medium mb-0.5">Received</div>
          <div className="text-xl font-bold text-emerald-500"> {formatCurrency(financials?.paidAmount)}</div>
        </div>

        <div className="w-px h-10 bg-slate-200 hidden lg:block" />

        <div className="min-w-[120px]">
          <div className="text-[11px] text-slate-500 font-medium mb-0.5">Outstanding</div>
          <div className="text-xl font-bold text-rose-500"> {formatCurrency(financials?.remainingBalance)}</div>
        </div>

        <div className="w-px h-10 bg-slate-200 hidden lg:block" />

        <div className="min-w-[100px]">
          <div className="text-[11px] text-slate-500 font-medium mb-1">Account Status</div>
          <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded text-xs font-semibold border border-amber-100">
            {companyInfo?.statusLabel || "Lead"}
          </span>
        </div>
      </div>

      <form id="addPaymentForm" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-2">

        {/* LEFT COLUMN */}
        <div className="xl:col-span-8 flex flex-col gap-2">

          {/* Payment Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-[15px] font-bold text-slate-900">Payment Details</h2>
              <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium">Manual Entry</span>
            </div>

            <div className="mb-2">
              <label className="block text-[11px] text-slate-600 font-semibold mb-1.5">Payment For *</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {[
                  { title: "Against Proforma Invoice", desc: "Select PI and record advance/payment." },
                  { title: "Against Tax Invoice", desc: "Record payment against final invoice." },
                  { title: "Other Payment", desc: "Registration, add-on service, adjustment etc." }
                ].map((opt) => (
                  <div
                    key={opt.title}
                    onClick={() => setPaymentForSelection(opt.title)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${paymentForSelection === opt.title ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200 hover:border-blue-200'}`}
                  >
                    <div className="text-[13px] font-semibold text-slate-800">{opt.title}</div>
                    <div className="text-[11px] text-slate-500 mt-1 leading-tight">{opt.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 gap-y-2">
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Select Proforma / Invoice *</label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded text-[13px] px-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option value="" disabled>Select {docType}</option>
                  {documentOptions.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {getDocumentLabel(doc, docType, companyInfo?.name)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Payment Date *</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded text-[13px] px-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-400 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Payment Mode *</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded text-[13px] px-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-400 bg-white"
                >
                  {PAYMENT_MODE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Type of Payment *</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded text-[13px] px-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option value="" disabled>Select payment type</option>
                  {PAYMENT_TYPE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                  {paymentMode === "Cash" ? "Received By *" : "Transaction / UTR No."}
                </label>
                <input
                  type="text"
                  value={paymentMode === "Cash" ? receivedBy : referenceNo}
                  onChange={(e) => paymentMode === "Cash" ? setReceivedBy(e.target.value) : setReferenceNo(e.target.value)}
                  placeholder={paymentMode === "Cash" ? "Enter receiver name" : "Enter UTR, cheque no. or reference no."}
                  required={paymentMode === "Cash"}
                  className="w-full border border-slate-200 rounded text-[13px] px-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-400 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Received Amount *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[13px]">₹</span>
                  <input
                    type="number"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded text-[13px] pl-7 pr-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-400 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                  {paymentMode === "Cash" ? "Received Date *" : "Bank Account"}
                </label>
                {paymentMode === "Cash" ? (
                  <input
                    type="date"
                    value={receivedDate}
                    onChange={(e) => setReceivedDate(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded text-[13px] px-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-400 bg-white"
                  />
                ) : (
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full border border-slate-200 rounded text-[13px] px-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-400 bg-white"
                  >
                    <option value="">Select bank account</option>
                    {bankAccounts.map((b) => (
                      <option key={b._id} value={b.accountDisplayName || b.bankname}>
                        {b.accountDisplayName || b.bankname}
                        {b.accountno ? ` — A/C ${b.accountno}` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Deduction & Adjustment */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-[15px] font-bold text-slate-900">Deduction & Adjustment</h2>
              <span className="text-[11px] text-slate-400">Optional but important for reconciliation</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 gap-y-2">
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">TDS Deducted?</label>
                <select
                  value={deductTds}
                  onChange={(e) => setDeductTds(e.target.value)}
                  className="w-full border border-slate-200 rounded text-[13px] px-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">TDS Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[13px]"></span>
                  <input
                    type="number"
                    value={tdsAmountInput}
                    onChange={(e) => setTdsAmountInput(e.target.value)}
                    disabled={deductTds === "No"}
                    placeholder="0"
                    className="w-full border border-slate-200 rounded text-[13px] pl-7 pr-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-400 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Credit Note / Adjustment</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[13px]"></span>
                  <input
                    type="number"
                    value={creditNoteAdjustment}
                    onChange={(e) => setCreditNoteAdjustment(e.target.value)}
                    placeholder="0"
                    className="w-full border border-slate-200 rounded text-[13px] pl-7 pr-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-400 bg-white"
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Adjustment Reason</label>
                <textarea
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="e.g. Rate difference"
                  className="w-full h-[72px] border border-slate-200 rounded text-[13px] px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-400 bg-white resize-y"
                />
              </div>
            </div>
          </div>

          {/* Allocate Payment Table & Uploads */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-[15px] font-bold text-slate-900">Allocate Payment</h2>
              <span className="text-[11px] text-slate-400">Auto allocation can be edited</span>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden mb-2">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 font-semibold">
                  <tr>
                    <th className="px-4 py-2 w-10"></th>
                    <th className="px-4 py-2">Document</th>
                    <th className="px-4 py-2">Due Date</th>
                    <th className="px-4 py-2">Outstanding</th>
                    <th className="px-4 py-2">Allocate</th>
                  </tr>
                </thead>
                <tbody className="text-[12px] text-slate-700">
                  {documentOptions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-3 text-center text-slate-500">No documents available</td>
                    </tr>
                  ) : (
                    documentOptions.map((doc) => {
                      const isSelected = selectedDocId === doc._id;
                      const outstandingForDoc = Math.max(0, (doc.finalAmount || 0) - payments.filter(p => p.invoice_id === doc._id).reduce((sum, p) => sum + (parseFloat(p.amount_text) || 0), 0));

                      return (
                        <tr key={doc._id} className={`border-b border-slate-100 last:border-0 ${isSelected ? 'bg-blue-50/30' : ''}`} onClick={() => setSelectedDocId(doc._id)}>
                          <td className="px-4 py-2.5 cursor-pointer">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'}`}>
                              {isSelected && <Check size={10} strokeWidth={3} />}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 cursor-pointer">
                            <div className="font-semibold text-slate-900">{docType === "Invoice" ? doc.invoice_no : doc.est_no}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{docType} • Stall Booking Advance</div>
                          </td>
                          <td className="px-4 py-2.5">
                            {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}
                          </td>
                          <td className="px-4 py-2.5 font-medium"> {formatCurrency(outstandingForDoc)}</td>
                          <td className="px-4 py-2.5 font-semibold text-slate-900">
                            {isSelected && parsedAmountReceived > 0 ? ` ${formatCurrency(parsedAmountReceived)}` : " 0"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Receipt Upload</label>
                <label className="border border-slate-200 rounded flex items-center justify-center gap-2 py-2.5 cursor-pointer hover:bg-slate-50 transition text-center bg-white h-[52px]">
                  <div>
                    <div className="text-[12px] font-semibold text-slate-800">{proofFile ? proofFile.name : "Upload Payment Screenshot / Bank Advice"}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">PDF, JPG or PNG up to 5 MB</div>
                  </div>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Internal Remarks</label>
                <textarea
                  value={internalRemarks}
                  onChange={(e) => setInternalRemarks(e.target.value)}
                  placeholder="Add remarks for accounts team, approval note or client communication..."
                  className="w-full border border-slate-200 rounded text-[12px] px-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-400 bg-white h-[52px] resize-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] text-slate-600 font-semibold mb-1.5">Narration</label>
                <div className="flex flex-wrap items-center gap-5 mb-2">
                  <label className="flex items-center gap-2 text-[12px] font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="narrationMode"
                      value="automatic"
                      checked={narrationMode === "automatic"}
                      onChange={() => setNarrationMode("automatic")}
                      className="accent-blue-600"
                    />
                    Automatic
                  </label>
                  <label className="flex items-center gap-2 text-[12px] font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="narrationMode"
                      value="custom"
                      checked={narrationMode === "custom"}
                      onChange={() => setNarrationMode("custom")}
                      className="accent-blue-600"
                    />
                    Custom
                  </label>
                </div>

                {narrationMode === "automatic" ? (
                  <div className="w-full border border-slate-200 rounded text-[12px] px-3 py-2 text-slate-700 bg-slate-50 min-h-[38px]">
                    {automaticNarration || "Select Type of Payment to generate narration"}
                  </div>
                ) : (
                  <textarea
                    value={customNarration}
                    onChange={(e) => setCustomNarration(e.target.value)}
                    required
                    placeholder="Enter custom narration..."
                    className="w-full border border-slate-200 rounded text-[12px] px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-400 bg-white h-[76px] resize-y"
                  />
                )}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="xl:col-span-4 flex flex-col gap-2">

          {/* Payment Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
            <h2 className="text-[15px] font-bold text-slate-900 mb-2">Payment Summary</h2>

            <div className="space-y-2.5 text-[13px]">
              <div className="flex justify-between items-center text-slate-600">
                <span>Invoice / PI Amount</span>
                <span className="font-semibold text-slate-900">{formatCurrency(invoiceAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Already Received</span>
                <span className="font-semibold text-slate-900">{formatCurrency(invoiceAmount - outstandingAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Current Payment</span>
                <span className="font-semibold text-slate-900">{formatCurrency(parsedAmountReceived)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>TDS Deduction</span>
                <span className="font-semibold text-slate-900">{formatCurrency(parsedTds)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 mb-1.5">
                <span>Credit Note / Adjustment</span>
                <span className="font-semibold text-slate-900">{formatCurrency(parsedCreditNode)}</span>
              </div>

              <div className="bg-[#111827] text-white rounded-lg p-2.5 flex justify-between items-center mt-2">
                <span className="text-[13px] font-medium text-slate-300">Balance After Posting</span>
                <span className="text-[18px] font-bold">{formatCurrency(balanceAfterPosting)}</span>
              </div>
            </div>
          </div>

          {/* Receipt Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
            <h2 className="text-[15px] font-bold text-slate-900 mb-2">Receipt Preview</h2>

            <div className="space-y-2.5 text-[12px]">
              <div className="flex justify-between items-start">
                <span className="text-slate-500">Receipt No.</span>
                <span className="font-semibold text-slate-900 text-right">RCPT-XXXX-XXXX</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-500">Receipt Date</span>
                <span className="font-semibold text-slate-900 text-right">
                  {paymentDate ? new Date(paymentDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-500">Received From</span>
                <span className="font-semibold text-slate-900 text-right w-2/3 truncate">{companyInfo?.name || "-"}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-500">Payment Type</span>
                <span className="font-semibold text-slate-900 text-right">{paymentType || "-"}</span>
              </div>
              <div className="flex justify-between items-start gap-3">
                <span className="text-slate-500">Narration</span>
                <span className="font-semibold text-slate-900 text-right break-words max-w-[65%]">{narration || "-"}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-500">Status</span>
                <span className="font-medium text-emerald-500 text-right">Ready</span>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-lg p-3.5">
            <p className="text-[12px] text-amber-800 font-semibold mb-1">Accounts Check:</p>
            <p className="text-[11px] text-amber-700 leading-snug">
              If TDS is deducted by client, enter TDS amount separately in the deductions section to ensure proper reconciliation of ledger balances.
            </p>
          </div>

        </div>
      </form>
    </div>
  );
};

export default AddPayment;
