export default function SalesLeaderboard({ leaderboard, currentUser, leaderboardPeriod, setLeaderboardPeriod }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-2 shadow-sm lg:col-span-3 col-span-1 flex flex-col justify-start">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Sales Leaderboard</h3>
        <select 
          value={leaderboardPeriod} 
          onChange={(e) => setLeaderboardPeriod(e.target.value)}
          className="text-[10px] bg-slate-50 border border-slate-200 px-2 py-0.5 font-bold uppercase rounded-md text-slate-600 outline-none cursor-pointer"
        >
          <option value="today">Today</option>
          <option value="this_week">This Week</option>
          <option value="this_month">This Month</option>
          <option value="this_year">This Year</option>
        </select>
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
                  : "bg-white border-slate-100 text-slate-800"
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
                    <img src={item.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold uppercase">{item.name?.[0] || 'S'}</span>
                  )}
                </div>
                <span className="text-[11px] font-bold truncate max-w-[90px]">{item.name}</span>
              </div>
              <span className="text-[11px] font-black">₹ {(item.revenue / 100000).toFixed(2)} L</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

