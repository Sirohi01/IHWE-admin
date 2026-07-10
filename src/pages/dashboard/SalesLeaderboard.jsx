export default function SalesLeaderboard({ leaderboard, currentUser }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-2 lg:col-span-3 col-span-1 flex flex-col justify-start" style={{ boxShadow: 'rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em', fontFamily: 'Inter, sans-serif' }}>
      <div className="flex justify-between items-center -mx-2 -mt-2 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Sales Leaderboard</h3>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto pr-1" style={{ maxHeight: '125px', scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
        {leaderboard.slice(0, 5).map((item, i) => {
          const isActiveUser = item.username.toLowerCase() === (currentUser?.username?.toLowerCase() || "");
          return (
            <div
              key={i}
              className={`flex items-center justify-between p-1.5 rounded-xl border ${
                isActiveUser
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                  : "bg-white border-slate-100 text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-black w-4 text-center ${i === 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                  {i + 1}
                </span>
                <div className={`w-6 h-6 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${
                  isActiveUser ? 'border-2 border-emerald-400' : 'bg-slate-100'
                }`}>
                  {item.profileImage ? (
                    <img loading="lazy" decoding="async" src={item.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold uppercase">{item.name?.[0] || 'S'}</span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-800 truncate max-w-[90px]">{item.name}</span>
              </div>
              <span className="text-[10px] font-black text-[#0D530E]">₹ {(item.revenue / 100000).toFixed(2)} L</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

