import { useState } from "react";
import { Download, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";
import api from "../../../lib/api";

const formatCurrency = (val) => `₹ ${Math.round(val || 0).toLocaleString("en-IN")}`;
const formatDate = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
};

const getTxnId = (pmt) =>
  pmt.utr_no || pmt.cheque_no || pmt.card_transaction_no || pmt.wallet_transaction_no || pmt.cash_receipt_no || "—";

const getModeBadge = (mode) => {
  switch (mode) {
    case "NEFT": return "bg-slate-100 text-slate-700 border-slate-200";
    case "UPI": return "bg-purple-50 text-purple-700 border-purple-200";
    case "RTGS": return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "Cheque": return "bg-blue-50 text-blue-700 border-blue-200";
    default: return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
};

export default function RecentTransactionsTable({ payments = [], loading }) {
  const navigate = useNavigate();
  const [downloadingId, setDownloadingId] = useState("");

  const transactions = [...payments]
    .sort((a, b) => new Date(b.payment_date || b.added) - new Date(a.payment_date || a.added))
    .slice(0, 5);

  const handleDownload = async (pmt) => {
    setDownloadingId(pmt._id);
    try {
      const res = await api.get(`/api/payments/${pmt._id}/receipt`, { responseType: "blob" });
      const clientName = (pmt.client_name || "Receipt").replace(/[^a-zA-Z0-9 -]/g, "").trim();
      saveAs(new Blob([res.data], { type: "application/pdf" }), `${clientName}_${pmt.receipt_no || pmt._id}.pdf`);
    } catch {
      toast.error("Failed to download receipt");
    } finally {
      setDownloadingId("");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-100 shrink-0">
        <div>
          <h3 className="text-[13.5px] font-md text-slate-800 tracking-tight">
            Recent Transactions
          </h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Real-time feed of cleared entries
          </p>
        </div>
        <button
          onClick={() => navigate("/accounts/receipts")}
          className="text-emerald-600 hover:text-emerald-700 text-[9.5px] font-black uppercase tracking-wider flex items-center gap-0.5 hover:underline"
        >
          View All <ArrowRight size={10} strokeWidth={2.5} />
        </button>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto flex-1 min-h-[140px]">
        <table className="w-full text-left border-collapse text-[10.5px]">
          <thead>
            <tr className="border-b border-slate-150 text-slate-400 font-black uppercase tracking-wider">
              <th className="py-1.5 px-2">Invoice No.</th>
              <th className="py-1.5 px-1">Company / Client</th>
              <th className="py-1.5 px-1">Amount</th>
              <th className="py-1.5 px-1 text-center">Mode</th>
              <th className="py-1.5 px-1">Transaction ID</th>
              <th className="py-1.5 px-1">Date</th>
              <th className="py-1.5 px-2 text-center">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!loading && transactions.length === 0 && (
              <tr><td colSpan={7} className="py-4 text-center text-slate-400">No transactions yet.</td></tr>
            )}
            {transactions.map((row) => (
              <tr key={row._id} className="hover:bg-slate-50/50 transition-colors font-md text-slate-700">
                <td className="py-1 px-2 font-md text-[#0369a1]">
                  {row.invoice_no || row.invoice_id || "N/A"}
                </td>
                <td className="py-1 px-1 text-[11px] font-md text-slate-800">{row.client_name || "N/A"}</td>
                <td className="py-1 px-1 font-md text-emerald-600">{formatCurrency(row.amount_text)}</td>
                <td className="py-1 px-1 text-center">
                  <span className={`inline-flex px-1 py-0.2 rounded text-[7.5px] font-md border uppercase tracking-wider ${getModeBadge(row.payment_mode)}`}>
                    {row.payment_mode || "N/A"}
                  </span>
                </td>
                <td className="py-1 px-1 text-slate-500 font-mono">{getTxnId(row)}</td>
                <td className="py-1 px-1 text-slate-600">{formatDate(row.payment_date || row.added)}</td>
                <td className="py-1 px-2 text-center">
                  <button
                    onClick={() => handleDownload(row)}
                    disabled={downloadingId === row._id}
                    className="p-0.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {downloadingId === row._id ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
