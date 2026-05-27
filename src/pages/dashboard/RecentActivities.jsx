// Utility: format "X min ago / X hr ago"
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return new Date(dateStr).toLocaleDateString();
}

// Icon by activity type keyword
function ActivityIcon({ message }) {
  const m = (message || "").toLowerCase();
  if (m.includes("lead")) return <span className="text-base">🧑‍💼</span>;
  if (m.includes("email") || m.includes("replied")) return <span className="text-base">✉️</span>;
  if (m.includes("meeting")) return <span className="text-base">🤝</span>;
  if (m.includes("payment") || m.includes("pay")) return <span className="text-base">💰</span>;
  if (m.includes("proposal") || m.includes("opened")) return <span className="text-base">📄</span>;
  return <span className="text-base">📋</span>;
}

const iconBg = [
  "bg-blue-50",
  "bg-purple-50",
  "bg-emerald-50",
  "bg-amber-50",
  "bg-rose-50",
];

export default function RecentActivities({ activityLogs }) {
  return (
    <div
      className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm lg:col-span-4 col-span-1 flex flex-col"
      style={{ minHeight: '240px', maxHeight: '240px' }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h3 className="text-lg font-black text-slate-800">Recent Activities</h3>
        <button className="text-[11px] font-bold text-[#08775e] hover:underline">View All</button>
      </div>

      {/* Scrollable list — fills remaining space and scrolls */}
      <div
        className="flex-1 overflow-y-auto space-y-3 pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
      >
        {activityLogs.length === 0 ? (
          <p className="text-slate-400 italic text-center py-6 text-xs">No recent activities found</p>
        ) : (
          activityLogs.map((log, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg[i % iconBg.length]}`}>
                <ActivityIcon message={log.details || log.message} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-slate-800 leading-snug truncate">
                  {log.details || log.message}
                </p>
              </div>
              <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap flex-shrink-0">
                {timeAgo(log.createdAt)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


