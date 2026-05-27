import { Link } from "react-router-dom";

export default function LeadSummaryCard({ donutData, totalLeads }) {
  const circumference = 2 * Math.PI * 46; // ≈ 289.03

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm lg:col-span-3 col-span-1 flex flex-col justify-between" style={{ minHeight: '260px' }}>
      {/* Top Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md font-black text-[#1e2e5c] tracking-tight">Lead Summary</h3>
        <span className="text-[12px] font-medium text-slate-500">
          Total Leads: <strong className="font-bold text-[#1e2e5c]">{totalLeads}</strong>
        </span>
      </div>

      {/* Main Flex Layout: Chart Left, Legend Right */}
      <div className="flex items-center justify-between gap-4 flex-1 my-2">
        {/* Pure SVG Donut Chart (Left) */}
        <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: '130px', height: '130px' }}>
          <svg viewBox="0 0 120 120" width="130" height="130" xmlns="http://www.w3.org/2000/svg">
            {/* Background track */}
            <circle cx="60" cy="60" r="46" fill="none" stroke="#f1f5f9" strokeWidth="16" />
            {/* Segments */}
            {(() => {
              const total = donutData.reduce((s, d) => s + d.value, 0);
              // If all zero, just show grey track
              if (total === 0) {
                return <circle cx="60" cy="60" r="46" fill="none" stroke="#e2e8f0" strokeWidth="16" />;
              }
              const gap = 3;
              let offset = 0;
              return donutData.filter(d => d.value > 0).map((d, i) => {
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
            <p className="text-[20px] font-black text-[#1e2e5c] leading-none mb-0.5">{totalLeads}</p>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none block">Total</span>
          </div>
        </div>

        {/* Legend (Right) */}
        <div className="flex-1 space-y-2 text-[11px] font-semibold text-slate-600 pl-2 min-w-0">
          {donutData.map((d, i) => {
            const pct = totalLeads > 0 ? Math.round((d.value / totalLeads) * 100) : 0;
            return (
              <div key={i} className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <div className="flex items-center justify-between w-full min-w-0 gap-1">
                  <span className="text-slate-700 font-bold truncate text-[10px]">{d.name}</span>
                  <span className="text-slate-500 font-bold flex-shrink-0 text-[10px]">
                    {d.value} <span className="text-slate-400">({pct}%)</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer view all link with line separator */}
      <div className="border-t border-slate-100/80 pt-3 mt-1">
        <Link
          to="/ihweClientData2026/masterData"
          className="text-[12px] font-black text-[#08775e] uppercase tracking-wider flex items-center justify-center gap-1 hover:underline text-center"
        >
          View All Leads <span className="text-[14px] leading-none">→</span>
        </Link>
      </div>
    </div>
  );
}

