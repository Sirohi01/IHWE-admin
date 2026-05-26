import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function LeadSummaryCard({ donutData, totalLeads }) {
  const circumference = 2 * Math.PI * 46; // ≈ 289.03

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm lg:col-span-3 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Lead Summary</h3>
        <span className="text-[10px] text-slate-400 font-bold uppercase">Total: {totalLeads}</span>
      </div>

      {/* Pure SVG full donut */}
      <div className="flex items-center justify-center relative my-1" style={{ height: '144px' }}>
        <svg viewBox="0 0 120 120" width="144" height="144" xmlns="http://www.w3.org/2000/svg">
          {/* Background track */}
          <circle cx="60" cy="60" r="46" fill="none" stroke="#f1f5f9" strokeWidth="16" />
          {/* Segments */}
          {(() => {
            const total = donutData.reduce((s, d) => s + d.value, 0) || 1;
            const gap = donutData.length > 1 ? 4 : 0;
            let offset = 0;
            if (donutData.length === 0) {
              return <circle cx="60" cy="60" r="46" fill="none" stroke="#e2e8f0" strokeWidth="16" />;
            }
            return donutData.map((d, i) => {
              const segLen = (d.value / total) * circumference - gap;
              const dashArray = `${Math.max(segLen, 0)} ${circumference - Math.max(segLen, 0)}`;
              const dashOffset = circumference * 0.25 - offset;
              offset += (d.value / total) * circumference;
              return (
                <circle
                  key={i}
                  cx="60" cy="60" r="46"
                  fill="none"
                  stroke={d.color}
                  strokeWidth="16"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                />
              );
            });
          })()}
        </svg>
        <div className="absolute text-center">
          <p className="text-2xl font-black text-slate-950 leading-none">{totalLeads}</p>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-1.5 mt-4 text-[11px] font-bold">
        {donutData.map((d, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              <span>{d.name}</span>
            </div>
            <span className="text-slate-800">{d.value} ({Math.round((d.value / totalLeads) * 100) || 0}%)</span>
          </div>
        ))}
      </div>

      <Link
        to="/ihweClientData2026/masterData"
        className="text-[10px] font-black text-[#08775e] uppercase tracking-wider flex items-center justify-center gap-1 mt-4 hover:underline"
      >
        View All Leads <ArrowRight size={12} />
      </Link>
    </div>
  );
}
