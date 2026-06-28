import { Users, Phone, Flame, Calendar, ShoppingBag, IndianRupee, Clock, Wallet } from "lucide-react";

export default function DashboardStatsGrid({ statsMetrics }) {
  const stats = [
    {
      label: "TOTAL LEADS",
      value: statsMetrics.total,
      icon: <Users size={16} strokeWidth={2.5} />,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      gradientTo: "to-emerald-50",
      trend: "12%", up: true,
    },
    {
      label: "CALLS MADE",
      value: statsMetrics.callsMade,
      icon: <Phone size={16} strokeWidth={2.5} />,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      gradientTo: "to-blue-50",
      trend: "14%", up: true,
    },
    {
      label: "INTERESTED",
      value: statsMetrics.interested,
      icon: <Flame size={16} strokeWidth={2.5} />,
      iconColor: "text-rose-600",
      iconBg: "bg-rose-100",
      gradientTo: "to-rose-50",
      trend: "9%", up: true,
    },
    {
      label: "MEETINGS",
      value: statsMetrics.meetings,
      icon: <Calendar size={16} strokeWidth={2.5} />,
      iconColor: "text-teal-600",
      iconBg: "bg-teal-100",
      gradientTo: "to-teal-50",
      trend: "6%", up: true,
    },
    {
      label: "STALL BOOKED",
      value: statsMetrics.closed,
      icon: <ShoppingBag size={16} strokeWidth={2.5} />,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
      gradientTo: "to-amber-50",
      trend: "25%", up: true,
    },
    {
      label: "REVENUE",
      value: `₹ ${statsMetrics.revenue} L`,
      icon: <IndianRupee size={16} strokeWidth={2.5} />,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      gradientTo: "to-emerald-50",
      trend: "18%", up: true,
    },
    {
      label: "FOLLOW-UPS",
      value: statsMetrics.pendingFollowups,
      icon: <Clock size={16} strokeWidth={2.5} />,
      iconColor: "text-pink-600",
      iconBg: "bg-pink-100",
      gradientTo: "to-pink-50",
      trend: "8%", up: false,
    },
    {
      label: "PAYMENTS DUE",
      value: `₹ ${statsMetrics.collection} L`,
      icon: <Wallet size={16} strokeWidth={2.5} />,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      gradientTo: "to-purple-50",
      trend: "5%", up: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-1.5">
      {stats.map((s, i) => (
        <div
          key={i}
          className={`group cursor-pointer relative bg-gradient-to-br from-white from-50% ${s.gradientTo} p-3 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden`}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 xl:gap-3 mb-3">
              <div className={`w-8 h-8 xl:w-9 xl:h-9 ${s.iconBg} rounded-full flex items-center justify-center shrink-0`}>
                <div className={`${s.iconColor}`}>
                  {s.icon}
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="truncate" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '3px', display: 'block', fontFamily: 'Inter, sans-serif' }}>{s.value}</span>
                <span className="truncate" style={{ fontSize: '8px', fontWeight: 800, color: '#334155', lineHeight: 1.2, display: 'block', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}>{s.label}</span>
              </div>
            </div>
            <div style={{ fontSize: '9px', fontWeight: 700, fontFamily: 'Inter, sans-serif' }} className={`text-center ${s.up ? "text-emerald-600" : "text-red-600"}`}>
              {s.up ? "↑" : "↓"} {s.trend} vs yesterday
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

