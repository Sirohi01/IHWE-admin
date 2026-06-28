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
      className="bg-white rounded-lg border border-gray-100 p-2 lg:col-span-4 col-span-1 flex flex-col"
      style={{ boxShadow: 'rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em', fontFamily: 'Inter, sans-serif' }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2 shrink-0">
        <h3 className="text-sm font-bold" style={{ color: '#15173D' }}>Recent Activities</h3>
        <button className="text-[10px] font-bold text-[#08775e] hover:underline">View All</button>
      </div>

      {/* Scrollable list */}
      <div
        className="flex-1 overflow-y-auto space-y-1.5 pr-1"
        style={{ maxHeight: "100px", scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
      >
        {activityLogs.length === 0 ? (
          <p className="text-slate-400 italic text-center py-2 text-[10px]">No recent activities found</p>
        ) : (
          activityLogs.map((log, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg[i % iconBg.length]}`}>
                <ActivityIcon message={log.details || log.message} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold leading-snug truncate" style={{ color: '#15173D' }}>
                  {log.details || log.message}
                </p>
              </div>
              <span className="text-[9px] font-bold whitespace-nowrap flex-shrink-0" style={{ color: '#5E0006' }}>
                {timeAgo(log.createdAt)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


