import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const formatCurrency = (val) => `₹ ${Math.round(val || 0).toLocaleString("en-IN")}`;

const getBadge = (row) => {
  if (row.isOverdue) return { text: "Overdue", cls: "bg-rose-50 border-rose-200 text-rose-700" };
  if (row.dueDaysDiff === 0) return { text: "Due Today", cls: "bg-amber-50 border-amber-200 text-amber-700" };
  if (row.dueDaysDiff > 0) return { text: `${row.dueDaysDiff} Days Left`, cls: "bg-blue-50 border-blue-200 text-blue-700" };
  return { text: "Due", cls: "bg-slate-50 border-slate-200 text-slate-600" };
};

export default function UpcomingDueDates({ rows = [], loading }) {
  const navigate = useNavigate();

  const dueDates = rows
    .filter((r) => r.outstanding > 0 && r.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3)
    .map((r) => {
      const d = new Date(r.dueDate);
      return {
        day: String(d.getDate()).padStart(2, "0"),
        month: d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
        company: r.client,
        invoice: r.invNo,
        amount: formatCurrency(r.outstanding),
        companyId: r.companyId,
        badge: getBadge(r),
      };
    });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-1 pb-0.5 border-b border-slate-100 shrink-0">
        <div>
          <h3 className="text-[12px] font-md text-slate-800 tracking-tight">
            Upcoming Due Dates
          </h3>
          <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Milestones of scheduled collections
          </p>
        </div>
        <button
          onClick={() => navigate("/accounts/invoices")}
          className="text-emerald-600 hover:text-emerald-700 text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 hover:underline"
        >
          View All <ArrowRight size={9} strokeWidth={2.5} />
        </button>
      </div>

      {/* List Feed */}
      <div className="flex flex-col gap-1 flex-1 justify-center">
        {!loading && dueDates.length === 0 && (
          <div className="text-center text-[10px] text-slate-400 py-3">Nothing due right now.</div>
        )}
        {dueDates.map((item, idx) => (
          <div
            key={idx}
            onClick={() => navigate(`/dashboard/account/${item.companyId}`)}
            className="flex items-center gap-1.5 hover:bg-slate-50/50 p-0.5 rounded-lg transition-all cursor-pointer"
          >
            {/* Custom Styled Calendar Date Block */}
            <div className="w-8 h-8 flex flex-col items-center justify-center border border-slate-200 rounded-lg bg-slate-50/50 text-center shrink-0 shadow-sm">
              <span className="text-[10.5px] font-black text-slate-800 leading-none">
                {item.day}
              </span>
              <span className="text-[6px] font-md text-rose-500 uppercase tracking-widest leading-none mt-0.5">
                {item.month}
              </span>
            </div>

            {/* Client Info details */}
            <div className="flex-1 min-w-0">
              <h4 className="text-[10.5px] font-md text-slate-800 leading-tight truncate">
                {item.company}
              </h4>
              <p className="text-[8px] text-slate-400 font-md mt-0 uppercase tracking-wider leading-none">
                INV: {item.invoice}
              </p>
            </div>

            {/* Pricing Amount & Overdue indicator badge */}
            <div className="text-right shrink-0">
              <span className="text-[10.5px] font-bold text-slate-800 block leading-none">
                {item.amount}
              </span>
              <span className={`inline-flex px-1 py-0.2 rounded text-[7px] font-black border uppercase tracking-wider mt-0.5 ${item.badge.cls}`}>
                {item.badge.text}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
