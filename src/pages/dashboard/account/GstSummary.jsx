export default function GstSummary({ comingSoon }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-sm h-full flex flex-col justify-between">
      {/* Header */}
      <div className="shrink-0 mb-1.5 pb-1 border-b border-slate-100">
        <h3 className="text-[12.5px] font-md text-slate-800 tracking-tight">
          GST Summary <span className="text-slate-400 font-bold text-[10px] leading-none">(This Month)</span>
        </h3>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
          State and central tax collections
        </p>
      </div>

      {comingSoon ? (
        <div className="flex-1 flex items-center justify-center min-h-[70px]">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Coming Soon</span>
        </div>
      ) : null}
    </div>
  );
}
