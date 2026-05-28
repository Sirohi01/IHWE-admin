export default function TargetGaugeCard({ targetMetrics }) {
  // Arc length of the semicircle path (π × radius = π × 82 ≈ 257.6)
  const arcLength = 257.6;
  const achieved = Math.min(Number(targetMetrics.pct) || 0, 100);
  const currentMonth = new Date().toLocaleString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-2.5 shadow-sm lg:col-span-3 col-span-1 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Target vs Achievement</h3>
        <span className="text-[10px] bg-slate-50 border border-slate-200 px-2 py-0.5 font-bold uppercase rounded-md text-slate-600">
          {currentMonth}
        </span>
      </div>

      {/* Pure SVG half-donut gauge */}
      <div className="flex flex-col items-center mt-1">
        <div className="relative" style={{ width: '110px', height: '60px' }}>
          <svg
            viewBox="0 0 200 110"
            width="110" height="60"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: 'visible' }}
          >
            {/* Grey background track */}
            <path
              d="M 18,100 A 82,82 0 0,1 182,100"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="20"
              strokeLinecap="round"
            />
            {/* Green achieved arc */}
            <path
              d="M 18,100 A 82,82 0 0,1 182,100"
              fill="none"
              stroke="#10b981"
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={`${(achieved / 100) * arcLength} ${arcLength}`}
              strokeDashoffset="0"
            />
          </svg>
          {/* Percentage label */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
            <p className="text-lg font-black text-slate-900 leading-none">{targetMetrics.pct}%</p>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">Achieved</span>
          </div>
        </div>
      </div>

      {/* Details Row */}
      <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-2 mt-2 text-center">
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target</p>
          <h5 className="text-[11px] font-black text-slate-900 leading-none">₹ {targetMetrics.target} L</h5>
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Achieved</p>
          <h5 className="text-[11px] font-black text-emerald-600 leading-none">₹ {targetMetrics.achieved} L</h5>
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Remaining</p>
          <h5 className="text-[11px] font-black text-slate-600 leading-none">₹ {targetMetrics.remaining} L</h5>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2 bg-emerald-50/70 border border-emerald-100 rounded-xl p-2.5 mt-1 shadow-inner">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[9px] font-extrabold text-emerald-700 leading-snug">
          You are on track! Keep pushing to achieve your target.
        </span>
      </div>
    </div>
  );
}

