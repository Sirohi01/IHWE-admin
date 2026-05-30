import { ArrowRight } from "lucide-react";
import Swal from "sweetalert2";

export default function UpcomingDueDates() {
  const dueDates = [
    {
      day: "05",
      month: "MAY",
      company: "Nature's Harmony Pvt. Ltd.",
      invoice: "INV-2026-1521",
      amount: "₹ 4,20,000",
      badge: "Overdue",
      badgeClass: "bg-rose-50 border-rose-200 text-rose-700"
    },
    {
      day: "10",
      month: "MAY",
      company: "GreenLife Ayurveda",
      invoice: "INV-2026-1520",
      amount: "₹ 2,50,000",
      badge: "Due Today",
      badgeClass: "bg-amber-50 border-amber-200 text-amber-700"
    },
    {
      day: "15",
      month: "MAY",
      company: "Wellness World",
      invoice: "INV-2026-1519",
      amount: "₹ 1,75,000",
      badge: "5 Days Left",
      badgeClass: "bg-blue-50 border-blue-200 text-blue-700"
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-1 pb-0.5 border-b border-slate-100 shrink-0">
        <div>
          <h3 className="text-[12px] font-black text-slate-800 tracking-tight">
            Upcoming Due Dates
          </h3>
          <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Milestones of scheduled collections
          </p>
        </div>
        <button
          onClick={() => Swal.fire({ title: "Collections Calendar", text: "Redirecting to all coming schedules.", icon: "info", confirmButtonColor: "#095b55" })}
          className="text-emerald-600 hover:text-emerald-700 text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 hover:underline"
        >
          View All <ArrowRight size={9} strokeWidth={2.5} />
        </button>
      </div>

      {/* List Feed */}
      <div className="flex flex-col gap-1 flex-1 justify-center">
        {dueDates.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1.5 hover:bg-slate-50/50 p-0.5 rounded-lg transition-all"
          >
            {/* Custom Styled Calendar Date Block */}
            <div className="w-8 h-8 flex flex-col items-center justify-center border border-slate-200 rounded-lg bg-slate-50/50 text-center shrink-0 shadow-sm">
              <span className="text-[10.5px] font-black text-slate-800 leading-none">
                {item.day}
              </span>
              <span className="text-[6px] font-black text-rose-500 uppercase tracking-widest leading-none mt-0.5">
                {item.month}
              </span>
            </div>

            {/* Client Info details */}
            <div className="flex-1 min-w-0">
              <h4 className="text-[10.5px] font-black text-slate-800 leading-tight truncate">
                {item.company}
              </h4>
              <p className="text-[8px] text-slate-400 font-extrabold mt-0 uppercase tracking-wider leading-none">
                INV: {item.invoice}
              </p>
            </div>

            {/* Pricing Amount & Overdue indicator badge */}
            <div className="text-right shrink-0">
              <span className="text-[10.5px] font-black text-slate-800 block leading-none">
                {item.amount}
              </span>
              <span className={`inline-flex px-1 py-0.2 rounded text-[7px] font-black border uppercase tracking-wider mt-0.5 ${item.badgeClass}`}>
                {item.badge}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
