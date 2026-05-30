import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, Download, UploadCloud, Check, Eye,
  Mail, MessageCircle, FileText, CheckCircle, CreditCard, Building2
} from "lucide-react";
import Swal from "sweetalert2";

const CLIENTS = [
  { id: "1", name: "GreenLife Ayurveda Pvt. Ltd.", outstanding: 50000.00, invoice: "INV/26-27/0001", date: "15 May 2026", total: 100000.00, paid: 50000.00 },
  { id: "2", name: "Wellness Forever", outstanding: 75000.00, invoice: "INV/26-27/0002", date: "18 May 2026", total: 150000.00, paid: 75000.00 },
  { id: "3", name: "Herbal Care India Pvt. Ltd.", outstanding: 25000.00, invoice: "INV/26-27/0003", date: "20 May 2026", total: 80000.00, paid: 55000.00 },
  { id: "4", name: "Nature's Harmony Pvt. Ltd.", outstanding: 120000.00, invoice: "INV/26-27/0004", date: "22 May 2026", total: 200000.00, paid: 80000.00 }
];

export default function AddPayment() {
  const navigate = useNavigate();

  // Form State
  const [selectedClientId, setSelectedClientId] = useState("1");
  const [receiptNo, setReceiptNo] = useState("RCPT/26-27/0002");
  const [paymentDate, setPaymentDate] = useState("2026-05-31");
  const [paymentMode, setPaymentMode] = useState("NEFT");
  const [transactionId, setTransactionId] = useState("NEFT/IDFB/31052026/001");
  const [paymentType, setPaymentType] = useState("advance"); // advance | running | final | settlement
  const [receivedAmount, setReceivedAmount] = useState("25000.00");
  const [tdsDeducted, setTdsDeducted] = useState("0.00");
  const [bankCharges, setBankCharges] = useState("0.00");
  const [netReceived, setNetReceived] = useState(25000);
  const [remarks, setRemarks] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  // Bank Info
  const [bankName, setBankName] = useState("HDFC Bank");
  const [accountNo, setAccountNo] = useState("50200012345678");
  const [ifscCode, setIfscCode] = useState("HDFC0001234");
  const [branchName, setBranchName] = useState("Connaught Place, New Delhi");
  const [saveBankDetails, setSaveBankDetails] = useState(true);

  // Active Client computed state
  const activeClient = CLIENTS.find(c => c.id === selectedClientId) || CLIENTS[0];

  // Dynamic calculations when monetary amounts change
  useEffect(() => {
    const amt = parseFloat(receivedAmount) || 0;
    const tds = parseFloat(tdsDeducted) || 0;
    const chg = parseFloat(bankCharges) || 0;
    setNetReceived(Math.max(0, amt - tds - chg));
  }, [receivedAmount, tdsDeducted, bankCharges]);

  // Handle file drops / browse
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      Swal.fire({
        title: "File Uploaded",
        text: `"${e.target.files[0].name}" successfully attached.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        confirmButtonColor: "#095b55"
      });
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(val);
  };

  const handleSavePayment = (e) => {
    e.preventDefault();
    if (!receivedAmount || parseFloat(receivedAmount) <= 0) {
      Swal.fire("Error", "Please enter a valid Received Amount.", "error");
      return;
    }

    Swal.fire({
      title: "Confirm Payment Entry",
      html: `Are you sure you want to log a payment of <b>${formatCurrency(netReceived)}</b> for <b>${activeClient.name}</b>?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Save",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#095b55",
      cancelButtonColor: "#64748b"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Payment Logged!",
          text: "The invoice collection and ledger transactions have been successfully updated.",
          icon: "success",
          confirmButtonColor: "#095b55"
        }).then(() => {
          navigate("/dashboard");
        });
      }
    });
  };

  const handleDraftSave = () => {
    Swal.fire({
      title: "Draft Saved",
      text: "Payment details have been stored as draft and will not update ledger records yet.",
      icon: "info",
      confirmButtonColor: "#095b55",
      timer: 1800,
      showConfirmButton: false
    });
  };

  return (
    <div className="w-full bg-[#f8fafc] px-3 py-2 font-sans">
      {/* ─── HEADER BAR ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 pb-1.5 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <span className="text-[17px] font-md">₹</span>
          </div>
          <div>
            <h1 className="text-[18px] font-md text-slate-800 tracking-tight flex items-center gap-2 leading-none">
              Add Payment
            </h1>
            <p className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 pt-2 leading-none">
              Record a payment received from client
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 px-2.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg shadow-sm text-[10.5px] font-md text-slate-700 transition cursor-pointer"
        >
          <ArrowLeft size={12} strokeWidth={2.5} />
          <span>Back</span>
        </button>
      </div>

      {/* ─── TWO COLUMN FORM LAYOUT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 mt-1 items-start">
        {/* LEFT COLUMN: Form Elements */}
        <form onSubmit={handleSavePayment} className="lg:col-span-8 flex flex-col gap-2">

          {/* SECTION 1: Payment Information */}
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm flex flex-col gap-2.5">
            <h3 className="text-[11.5px] font-md text-slate-800 tracking-tight flex items-center gap-1 pb-1 border-b border-slate-100 uppercase">
              <span className="w-4 h-4 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center text-[9px] font-md">1</span>
              Payment Information
            </h3>

            {/* Single grid: Row 1 = Client, Invoice, Outstanding, Receipt No. | Row 2 = Payment Status, Payment Date, Payment Mode, Transaction ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {/* Client select */}
              <div className="flex flex-col gap-0.5">
                <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Client / Company <span className="text-red-500">*</span></label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="px-2 py-1 text-[11px] font-bold text-slate-800 border border-slate-200 bg-slate-50/50 rounded-lg outline-none focus:border-indigo-500 transition"
                  required
                >
                  {CLIENTS.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Invoice selection */}
              <div className="flex flex-col gap-0.5">
                <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Invoice / Estimate <span className="text-red-500">*</span></label>
                <select
                  className="px-2 py-1 text-[10.5px] font-bold text-slate-800 border border-slate-200 bg-slate-50/50 rounded-lg outline-none focus:border-indigo-500 transition"
                  required
                >
                  <option>{activeClient.invoice}</option>
                </select>
              </div>

              {/* Outstanding value */}
              <div className="flex flex-col gap-0.5">
                <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Outstanding Amount</label>
                <input
                  type="text"
                  value={formatCurrency(activeClient.outstanding)}
                  disabled
                  className="px-2 py-1 text-[10.5px] font-md text-slate-500 bg-slate-100/70 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              {/* Receipt No. */}
              <div className="flex flex-col gap-0.5">
                <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Receipt No. <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                  placeholder="e.g. RCPT/26-27/0002"
                  className="px-2 py-1 text-[10.5px] font-bold text-slate-800 border border-slate-200 bg-slate-50/50 rounded-lg outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              {/* Payment Status */}
              <div className="flex flex-col gap-0.5">
                <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Payment Status</label>
                <div className="px-2 py-1 text-[10.5px] bg-slate-50/50 border border-slate-200 rounded-lg flex items-center h-[28px]">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-[8.5px] font-md text-emerald-700 uppercase tracking-wider leading-none">
                    Received
                  </span>
                </div>
              </div>

              {/* Payment Date */}
              <div className="flex flex-col gap-0.5">
                <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Payment Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="px-2 py-1 text-[10.5px] font-bold text-slate-800 border border-slate-200 bg-slate-50/50 rounded-lg outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              {/* Payment Mode */}
              <div className="flex flex-col gap-0.5">
                <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Payment Mode <span className="text-red-500">*</span></label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="px-2 py-1 text-[10.5px] font-bold text-slate-800 border border-slate-200 bg-slate-50/50 rounded-lg outline-none focus:border-indigo-500 transition"
                  required
                >
                  <option value="NEFT">NEFT</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="RTGS">RTGS</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              {/* Transaction ID */}
              <div className="flex flex-col gap-0.5">
                <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Transaction ID / Reference No.</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter Bank Ref/Txn ID"
                  className="px-2 py-1 text-[10.5px] font-bold text-slate-800 border border-slate-200 bg-slate-50/50 rounded-lg outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Payment Type Selection Grid */}
            <div className="flex flex-col gap-1 mt-0.5">
              <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Payment Type <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">

                {/* Type 1: Advance */}
                <div
                  onClick={() => setPaymentType("advance")}
                  className={`border rounded-lg p-1.5 py-2 flex flex-col gap-0.5 cursor-pointer transition-all ${paymentType === "advance"
                    ? "bg-indigo-50/40 border-indigo-500 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50/40"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-md text-slate-800 uppercase tracking-tight">Advance Payment</span>
                    <input
                      type="radio"
                      checked={paymentType === "advance"}
                      onChange={() => setPaymentType("advance")}
                      className="accent-indigo-600 w-2.5 h-2.5"
                    />
                  </div>
                  <p className="text-[9px] text-slate-450 font-bold leading-normal">
                    Payment received before the event / invoice.
                  </p>
                </div>

                {/* Type 2: Running */}
                <div
                  onClick={() => setPaymentType("running")}
                  className={`border rounded-lg p-1.5 py-2 flex flex-col gap-0.5 cursor-pointer transition-all ${paymentType === "running"
                    ? "bg-indigo-50/40 border-indigo-500 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50/40"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-md text-slate-800 uppercase tracking-tight">Running Payment</span>
                    <input
                      type="radio"
                      checked={paymentType === "running"}
                      onChange={() => setPaymentType("running")}
                      className="accent-indigo-600 w-2.5 h-2.5"
                    />
                  </div>
                  <p className="text-[9px] text-slate-450 font-bold leading-normal">
                    Part payment made towards an ongoing invoice.
                  </p>
                </div>

                {/* Type 3: Final */}
                <div
                  onClick={() => setPaymentType("final")}
                  className={`border rounded-lg p-1.5 py-2 flex flex-col gap-0.5 cursor-pointer transition-all ${paymentType === "final"
                    ? "bg-indigo-50/40 border-indigo-500 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50/40"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-md text-slate-800 uppercase tracking-tight">Final Payment</span>
                    <input
                      type="radio"
                      checked={paymentType === "final"}
                      onChange={() => setPaymentType("final")}
                      className="accent-indigo-600 w-2.5 h-2.5"
                    />
                  </div>
                  <p className="text-[9px] text-slate-450 font-bold leading-normal">
                    Final payment against the invoice / balance due.
                  </p>
                </div>

                {/* Type 4: Settlement */}
                <div
                  onClick={() => setPaymentType("settlement")}
                  className={`border rounded-lg p-1.5 py-2 flex flex-col gap-0.5 cursor-pointer transition-all ${paymentType === "settlement"
                    ? "bg-indigo-50/40 border-indigo-500 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50/40"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-md text-slate-800 uppercase tracking-tight">Settlement Amount</span>
                    <input
                      type="radio"
                      checked={paymentType === "settlement"}
                      onChange={() => setPaymentType("settlement")}
                      className="accent-indigo-600 w-2.5 h-2.5"
                    />
                  </div>
                  <p className="text-[9px] text-slate-450 font-bold leading-normal">
                    Full & final settlement of dues (closing account).
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* SECTION 2: Payment Details */}
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm flex flex-col gap-2.5">
            <h3 className="text-[11.5px] font-md text-slate-800 tracking-tight flex items-center gap-1 pb-1 border-b border-slate-100 uppercase">
              <span className="w-4 h-4 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center text-[9px] font-md">2</span>
              Payment Details
            </h3>

            {/* Calculations Fields Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="flex flex-col gap-0.5">
                <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Received Amount (₹) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  className="px-2 py-1 text-[10.5px] font-bold text-slate-800 border border-slate-200 bg-slate-50/50 rounded-lg outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">TDS Deducted (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={tdsDeducted}
                  onChange={(e) => setTdsDeducted(e.target.value)}
                  className="px-2 py-1 text-[10.5px] font-bold text-slate-800 border border-slate-200 bg-slate-50/50 rounded-lg outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Bank Charges (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={bankCharges}
                  onChange={(e) => setBankCharges(e.target.value)}
                  className="px-2 py-1 text-[10.5px] font-bold text-slate-800 border border-slate-200 bg-slate-50/50 rounded-lg outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Net Received (₹)</label>
                <input
                  type="text"
                  value={formatCurrency(netReceived)}
                  disabled
                  className="px-2 py-1 text-[10.5px] font-md text-indigo-750 bg-indigo-50/50 border border-indigo-200 rounded-lg outline-none shadow-inner"
                />
              </div>
            </div>

            {/* Remarks textarea */}
            <div className="flex flex-col gap-0.5">
              <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Remarks / Notes</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter remarks or notes (optional)"
                className="px-2 py-1 text-[10.5px] font-bold text-slate-800 border border-slate-200 bg-slate-50/50 rounded-lg outline-none focus:border-indigo-500 transition min-h-[35px] resize-y"
              />
            </div>

            {/* Upload Payment Proof Drag Area */}
            <div className="flex flex-col gap-1">
              <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Upload Payment Proof</label>
              <div className="border border-dashed border-slate-200 rounded-xl bg-slate-50/30 p-2.5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 hover:bg-slate-50/60 transition">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 shadow-inner">
                    <UploadCloud size={14} strokeWidth={2.5} />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-md text-indigo-600 hover:text-indigo-700 cursor-pointer hover:underline flex items-center gap-1">
                      <span>Click to upload</span>
                      <span className="text-slate-450 font-bold hover:no-underline">or drag and drop</span>
                      <input type="file" onChange={handleFileChange} className="hidden" accept=".jpg,.jpeg,.png,.pdf" />
                    </label>
                    <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 leading-none">PNG, JPG, PDF (Max. 5MB)</p>
                    {uploadedFile && (
                      <p className="text-[9px] text-emerald-600 font-extrabold mt-0.5 flex items-center gap-1 leading-none">
                        <CheckCircle size={9} strokeWidth={3} />
                        Attached: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(0)} KB)
                      </p>
                    )}
                  </div>
                </div>

                <label className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-[9px] font-md tracking-tight text-slate-700 rounded-lg shadow-sm transition cursor-pointer shrink-0">
                  Browse Files
                  <input type="file" onChange={handleFileChange} className="hidden" accept=".jpg,.jpeg,.png,.pdf" />
                </label>
              </div>
            </div>

          </div>

          {/* SECTION 3: Bank Details */}
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm flex flex-col gap-2.5">
            <h3 className="text-[11.5px] font-md text-slate-800 tracking-tight flex items-center gap-1 pb-1 border-b border-slate-100 uppercase">
              <span className="w-4 h-4 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center text-[9px] font-md">3</span>
              Bank Details <span className="text-[9px] font-bold text-slate-400 leading-none normal-case">(If applicable)</span>
            </h3>

            {/* Bank detail fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="flex flex-col gap-0.5">
                <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Bank Name</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="px-2 py-1 text-[10.5px] font-bold text-slate-800 border border-slate-200 bg-slate-50/50 rounded-lg outline-none focus:border-indigo-500 transition"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="State Bank of India">SBI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                </select>
              </div>

              <div className="flex flex-col gap-0.5">
                <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Account No.</label>
                <input
                  type="text"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  className="px-2 py-1 text-[10.5px] font-bold text-slate-800 border border-slate-200 bg-slate-50/50 rounded-lg outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">IFSC Code</label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  className="px-2 py-1 text-[10.5px] font-bold text-slate-800 border border-slate-200 bg-slate-50/50 rounded-lg outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <label className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">Branch Name</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="px-2 py-1 text-[10.5px] font-bold text-slate-800 border border-slate-200 bg-slate-50/50 rounded-lg outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Checkbox Save */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <input
                type="checkbox"
                id="saveBank"
                checked={saveBankDetails}
                onChange={(e) => setSaveBankDetails(e.target.checked)}
                className="accent-indigo-600 w-3 h-3 rounded cursor-pointer"
              />
              <label htmlFor="saveBank" className="text-[9.5px] font-md text-slate-600 select-none cursor-pointer">
                Save this bank detail for future use
              </label>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between mt-1.5 mb-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-3 py-1.5 border border-slate-250 hover:bg-slate-50 text-[9.5px] font-md text-slate-600 rounded-lg shadow-sm transition cursor-pointer"
            >
              ✕ Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDraftSave}
                className="px-3 py-1.5 bg-indigo-50/50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100/60 text-[9.5px] font-md rounded-lg shadow-sm transition cursor-pointer"
              >
                Save as Draft
              </button>

              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#095b55] hover:bg-[#074742] text-white text-[9.5px] font-md rounded-lg shadow-md transition flex items-center gap-1 cursor-pointer"
              >
                <Check size={12} strokeWidth={3} />
                <span>Save Payment</span>
              </button>
            </div>
          </div>

        </form>

        {/* RIGHT COLUMN: Summaries and Feeds */}
        <div className="lg:col-span-4 flex flex-col gap-2">

          {/* CARD 1: Payment Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm flex flex-col justify-between">
            <h3 className="text-[11px] font-md text-slate-800 tracking-tight flex items-center gap-1 pb-1 border-b border-slate-100 uppercase mb-2">
              <FileText size={12} className="text-indigo-600" />
              Payment Summary
            </h3>

            {/* Values listing */}
            <div className="flex flex-col gap-1.5 text-[10px] font-bold text-slate-500">
              <div className="flex justify-between items-center">
                <span>Invoice Number</span>
                <span className="text-slate-800 font-extrabold">{activeClient.invoice}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Invoice Date</span>
                <span className="text-slate-800 font-extrabold">{activeClient.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Amount</span>
                <span className="text-slate-800 font-md">{formatCurrency(activeClient.total)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Paid Amount</span>
                <span className="text-slate-800 font-extrabold">{formatCurrency(activeClient.paid)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Outstanding Amount</span>
                <span className="text-slate-800 font-md text-amber-600">{formatCurrency(activeClient.outstanding)}</span>
              </div>

              {/* Dotted spacer */}
              <div className="border-t border-dashed border-slate-200 my-0.5" />

              <div className="flex justify-between items-center">
                <span>Received Amount</span>
                <span className="text-emerald-600 font-md">{formatCurrency(parseFloat(receivedAmount) || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>TDS Deducted</span>
                <span className="text-slate-700 font-extrabold">{formatCurrency(parseFloat(tdsDeducted) || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Bank Charges</span>
                <span className="text-slate-700 font-extrabold">{formatCurrency(parseFloat(bankCharges) || 0)}</span>
              </div>

              {/* Solid spacer */}
              <div className="border-t border-slate-200 my-0.5" />

              {/* Large highlight block */}
              <div className="bg-indigo-50/50 border border-indigo-150 rounded-xl p-2 flex items-center justify-between mt-0.5 shadow-sm">
                <span className="text-indigo-850 text-[10px] font-md uppercase tracking-tight">Net Received</span>
                <span className="text-indigo-700 text-[13px] font-md tracking-tight">{formatCurrency(netReceived)}</span>
              </div>
            </div>
          </div>

          {/* CARD 2: Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm flex flex-col justify-between">
            <h3 className="text-[11px] font-md text-slate-800 tracking-tight flex items-center gap-1 pb-1 border-b border-slate-100 uppercase mb-1">
              <CreditCard size={12} className="text-indigo-600" />
              Quick Actions
            </h3>

            {/* List links */}
            <div className="flex flex-col divide-y divide-slate-100">
              <button
                type="button"
                onClick={() => Swal.fire("View Invoice", `Opening estimated sheet for ${activeClient.invoice}`, "info")}
                className="py-1.5 flex items-center justify-between text-[10px] font-md text-slate-700 hover:text-indigo-600 text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Eye size={12} className="text-slate-400" />
                  <span>View Invoice</span>
                </div>
                <span className="text-slate-400">→</span>
              </button>

              <button
                type="button"
                onClick={() => Swal.fire("Download Receipt", "PDF file will download once you save this payment entry.", "warning")}
                className="py-1.5 flex items-center justify-between text-[10px] font-md text-slate-700 hover:text-indigo-600 text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Download size={12} className="text-slate-400" />
                  <span>Download Receipt (After Save)</span>
                </div>
                <span className="text-slate-400">→</span>
              </button>

              <button
                type="button"
                onClick={() => Swal.fire("Send Receipt Email", `Preparing direct email draft to financial desks.`, "question")}
                className="py-1.5 flex items-center justify-between text-[10px] font-md text-slate-700 hover:text-indigo-600 text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Mail size={12} className="text-slate-400" />
                  <span>Send Receipt via Email</span>
                </div>
                <span className="text-slate-400">→</span>
              </button>

              <button
                type="button"
                onClick={() => Swal.fire("WhatsApp Reminder", "Initiating WhatsApp desktop gateway queue...", "info")}
                className="py-1.5 flex items-center justify-between text-[10px] font-md text-slate-700 hover:text-indigo-600 text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <MessageCircle size={12} className="text-slate-400" />
                  <span>Send Receipt via WhatsApp</span>
                </div>
                <span className="text-slate-400">→</span>
              </button>
            </div>
          </div>

          {/* CARD 3: Recent Payments */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-3">
              <h3 className="text-[12px] font-md text-slate-800 tracking-tight flex items-center gap-1 uppercase">
                <Building2 size={13} className="text-indigo-600" />
                Recent Payments
              </h3>
              <button
                type="button"
                onClick={() => Swal.fire("All Ledger Entries", "Redirecting to payments index tab...", "info")}
                className="text-[10px] font-md text-indigo-600 hover:underline hover:text-indigo-700"
              >
                View All
              </button>
            </div>

            {/* List item rows */}
            <div className="flex flex-col gap-3">
              {/* Item 1 */}
              <div className="flex justify-between items-start gap-2 text-[11px]">
                <div className="flex-1 min-w-0">
                  <h4 className="font-md text-slate-800 truncate">GreenLife Ayurveda Pvt. Ltd.</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 leading-none">RCPT/26-27/0001 • 15 May 2026</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-md text-slate-800 block leading-tight">₹ 50,000.00</span>
                  <span className="inline-block px-1.5 py-0.5 text-[8px] font-md bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase rounded tracking-wide mt-0.5 leading-none">Received</span>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex justify-between items-start gap-2 text-[11px] pt-2.5 border-t border-slate-100">
                <div className="flex-1 min-w-0">
                  <h4 className="font-md text-slate-800 truncate">Wellness Forever</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 leading-none">RCPT/26-27/0001 • 10 May 2026</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-md text-slate-800 block leading-tight">₹ 25,000.00</span>
                  <span className="inline-block px-1.5 py-0.5 text-[8px] font-md bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase rounded tracking-wide mt-0.5 leading-none">Received</span>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex justify-between items-start gap-2 text-[11px] pt-2.5 border-t border-slate-100">
                <div className="flex-1 min-w-0">
                  <h4 className="font-md text-slate-800 truncate">Herbal Care India Pvt. Ltd.</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 leading-none">RCPT/26-27/0001 • 05 May 2026</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-md text-slate-800 block leading-tight">₹ 75,000.00</span>
                  <span className="inline-block px-1.5 py-0.5 text-[8px] font-md bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase rounded tracking-wide mt-0.5 leading-none">Received</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
