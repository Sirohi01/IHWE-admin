import { Download, ArrowRight } from "lucide-react";
import Swal from "sweetalert2";

export default function RecentTransactionsTable() {
  const transactions = [
    {
      invoice: "INV-2026-1526",
      company: "GreenLife Ayurveda",
      amount: "₹ 2,40,000",
      mode: "NEFT",
      txnId: "HDFC00012345",
      date: "30 May 2026",
      status: "Received",
      statusColor: "bg-emerald-50 border-emerald-200 text-emerald-700"
    },
    {
      invoice: "INV-2026-1525",
      company: "Nature's Harmony Pvt. Ltd.",
      amount: "₹ 1,80,000",
      mode: "UPI",
      txnId: "UPI/512345678901",
      date: "30 May 2026",
      status: "Received",
      statusColor: "bg-emerald-50 border-emerald-200 text-emerald-700"
    },
    {
      invoice: "INV-2026-1524",
      company: "Wellness World",
      amount: "₹ 1,25,000",
      mode: "RTGS",
      txnId: "SBIN00098765",
      date: "29 May 2026",
      status: "Received",
      statusColor: "bg-emerald-50 border-emerald-200 text-emerald-700"
    },
    {
      invoice: "INV-2026-1523",
      company: "Herbal King Exports",
      amount: "₹ 95,000",
      mode: "Cheque",
      txnId: "125689",
      date: "29 May 2026",
      status: "Cleared",
      statusColor: "bg-emerald-50 border-emerald-200 text-emerald-700"
    },
    {
      invoice: "INV-2026-1522",
      company: "Arogya Organics",
      amount: "₹ 75,000",
      mode: "Cash",
      txnId: "—",
      date: "28 May 2026",
      status: "Received",
      statusColor: "bg-emerald-50 border-emerald-200 text-emerald-700"
    }
  ];

  const handleDownload = (txn) => {
    Swal.fire({
      title: "Download Receipt",
      html: `Generating receipt PDF for <b>${txn.invoice}</b> (${txn.company}) ...`,
      icon: "success",
      showConfirmButton: false,
      timer: 1500
    });
  };

  const getModeBadge = (mode) => {
    switch (mode) {
      case "NEFT":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "UPI":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "RTGS":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Cheque":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
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
          onClick={() => Swal.fire({ title: "Transactions Log", text: "Redirecting to detailed cashbook records.", icon: "info", confirmButtonColor: "#095b55" })}
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
              <th className="py-1.5 px-1 text-center">Status</th>
              <th className="py-1.5 px-2 text-center">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors font-md text-slate-700">
                <td className="py-1 px-2 font-md text-[#0369a1] hover:underline cursor-pointer">
                  {row.invoice}
                </td>
                <td className="py-1 px-1 text-[11px] font-md text-slate-800">{row.company}</td>
                <td className="py-1 px-1 font-md text-emerald-600">{row.amount}</td>
                <td className="py-1 px-1 text-center">
                  <span className={`inline-flex px-1 py-0.2 rounded text-[7.5px] font-md border uppercase tracking-wider ${getModeBadge(row.mode)}`}>
                    {row.mode}
                  </span>
                </td>
                <td className="py-1 px-1 text-slate-500 font-mono">{row.txnId}</td>
                <td className="py-1 px-1 text-slate-600">{row.date}</td>
                <td className="py-1 px-1 text-center">
                  <span className={`inline-flex px-1.5 py-0.2 rounded-full text-[7.5px] font-black border uppercase tracking-wider ${row.statusColor}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-1 px-2 text-center">
                  <button
                    onClick={() => handleDownload(row)}
                    className="p-0.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    <Download size={12} />
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
