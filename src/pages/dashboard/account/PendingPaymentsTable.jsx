import { Eye, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const formatCurrency = (val) => `₹ ${Math.round(val || 0).toLocaleString("en-IN")}`;
const formatDate = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
};

const STATUS_STYLES = {
  Overdue: "bg-rose-50 border-rose-200 text-rose-700",
  Unpaid: "bg-amber-50 border-amber-200 text-amber-700",
};

export default function PendingPaymentsTable({ rows = [], loading }) {
  const navigate = useNavigate();

  const pendingData = rows
    .filter((r) => r.outstanding > 0)
    .sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-100 shrink-0">
        <div>
          <h3 className="text-[12.5px] font-md text-slate-800 tracking-tight">
            Top Pending Payments
          </h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Accounts with pending balances
          </p>
        </div>
        <button
          onClick={() => navigate("/accounts/invoices")}
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
              <th className="py-1.5 px-2">Company / Client</th>
              <th className="py-1.5 px-1">Total</th>
              <th className="py-1.5 px-1">Paid</th>
              <th className="py-1.5 px-1">Due</th>
              <th className="py-1.5 px-1">Due Date</th>
              <th className="py-1.5 px-1 text-center">Status</th>
              <th className="py-1.5 px-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!loading && pendingData.length === 0 && (
              <tr><td colSpan={7} className="py-4 text-center text-slate-400">No pending payments.</td></tr>
            )}
            {pendingData.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50 transition-colors font-semibold text-slate-700">
                <td className="py-1 px-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-md text-slate-800 leading-tight">
                      {row.client}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold leading-none mt-0.5">
                      {row.contact}
                    </span>
                  </div>
                </td>
                <td className="py-1 px-1 font-md text-slate-800">{formatCurrency(row.invValue)}</td>
                <td className="py-1 px-1 text-slate-500">{formatCurrency(row.received)}</td>
                <td className="py-1 px-1 text-red-600 font-md">{formatCurrency(row.outstanding)}</td>
                <td className="py-1 px-1 text-slate-600">{formatDate(row.dueDate)}</td>
                <td className="py-1 px-1 text-center">
                  <span className={`inline-flex px-1.5 py-0.2 rounded-full text-[7.5px] font-black border uppercase tracking-wider ${STATUS_STYLES[row.status] || "bg-slate-50 border-slate-200 text-slate-600"}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-1 px-2">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => navigate(`/dashboard/account/${row.companyId}`)}
                      title="View client overview"
                      className="p-0.5 rounded-full hover:bg-blue-50 text-blue-600 border border-transparent hover:border-blue-100 transition-colors cursor-pointer"
                    >
                      <Eye size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
