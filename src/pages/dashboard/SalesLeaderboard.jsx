export default function SalesLeaderboard({ leaderboard, currentUser }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm lg:col-span-3 col-span-1 flex flex-col justify-start">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Sales Leaderboard</h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase">Team ranking</span>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto" style={{ maxHeight: '140px' }}>
        {leaderboard.map((item, i) => {
          const isActiveUser = item.username.toLowerCase() === (currentUser?.username?.toLowerCase() || "");
          return (
            <div
              key={i}
              className={`flex items-center justify-between p-2 rounded-xl border ${
                isActiveUser
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                  : "bg-white border-slate-100 text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-black w-4 text-center ${i === 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                  {i + 1}
                </span>
                <div className={`w-6 h-6 rounded-full overflow-hidden flex items-center justify-center ${
                  isActiveUser ? 'bg-emerald-200 border-2 border-emerald-400' : 'bg-slate-100'
                }`}>
                  <span className="text-[9px] font-bold uppercase">{item.name?.[0] || 'S'}</span>
                </div>
                <span className="text-[11px] font-bold truncate max-w-[90px]">{item.name}</span>
              </div>
              <span className="text-[11px] font-black">₹ {item.revenue.toFixed(2)} L</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

