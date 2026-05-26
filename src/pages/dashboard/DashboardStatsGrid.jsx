import { Users, Phone, Flame, Calendar, ShoppingBag, IndianRupee, Clock, Wallet } from "lucide-react";

export default function DashboardStatsGrid({ statsMetrics }) {
  const stats = [
    {
      label: "Total Leads",
      value: statsMetrics.total,
      icon: <Users size={16} strokeWidth={2.5} />,
      iconBg: "bg-emerald-50 text-emerald-600",
      trend: "▲ 12% vs yesterday",
      trendColor: "text-emerald-500",
    },
    {
      label: "Calls Made",
      value: statsMetrics.callsMadeToday,
      icon: <Phone size={16} strokeWidth={2.5} />,
      iconBg: "bg-blue-50 text-blue-600",
      trend: "▲ 14% vs yesterday",
      trendColor: "text-emerald-500",
    },
    {
      label: "Interested",
      value: statsMetrics.interested,
      icon: <Flame size={16} strokeWidth={2.5} />,
      iconBg: "bg-rose-50 text-rose-600",
      trend: "▲ 9% vs yesterday",
      trendColor: "text-emerald-500",
    },
    {
      label: "Meetings",
      value: statsMetrics.meetings,
      icon: <Calendar size={16} strokeWidth={2.5} />,
      iconBg: "bg-teal-50 text-teal-600",
      trend: "▲ 6% vs yesterday",
      trendColor: "text-emerald-500",
    },
    {
      label: "Stalls Closed",
      value: statsMetrics.closed,
      icon: <ShoppingBag size={16} strokeWidth={2.5} />,
      iconBg: "bg-amber-50 text-amber-600",
      trend: "▲ 25% vs yesterday",
      trendColor: "text-emerald-500",
    },
    {
      label: "Revenue",
      value: `₹ ${statsMetrics.revenue} L`,
      icon: <IndianRupee size={16} strokeWidth={2.5} />,
      iconBg: "bg-emerald-50 text-emerald-600",
      trend: "▲ 18% vs yesterday",
      trendColor: "text-emerald-500",
    },
    {
      label: "Pending F/U",
      value: statsMetrics.pendingFollowups,
      icon: <Clock size={16} strokeWidth={2.5} />,
      iconBg: "bg-pink-50 text-pink-600",
      trend: "▼ 8% vs yesterday",
      trendColor: "text-red-500",
    },
    {
      label: "Pending Pay",
      value: `₹ ${statsMetrics.collection} L`,
      icon: <Wallet size={16} strokeWidth={2.5} />,
      iconBg: "bg-purple-50 text-purple-600",
      trend: "▼ 5% vs yesterday",
      trendColor: "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
      {stats.map((s, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.iconBg}`}>
              {s.icon}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 leading-none">{s.value}</h3>
          <span className={`text-[9px] font-bold block mt-1 ${s.trendColor}`}>{s.trend}</span>
        </div>
      ))}
    </div>
  );
}
