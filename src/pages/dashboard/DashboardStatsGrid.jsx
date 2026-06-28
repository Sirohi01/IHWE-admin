import { Users, Phone, Flame, Calendar, ShoppingBag, IndianRupee, Clock, Wallet } from "lucide-react";

export default function DashboardStatsGrid({ statsMetrics }) {
  const stats = [
    {
      label: "Total Leads",
      value: statsMetrics.total,
      icon: <Users size={18} strokeWidth={1.8} />,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      trend: "12%", up: true,
    },
    {
      label: "Calls Made",
      value: statsMetrics.callsMade,
      icon: <Phone size={18} strokeWidth={1.8} />,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      trend: "14%", up: true,
    },
    {
      label: "Interested Clients",
      value: statsMetrics.interested,
      icon: <Flame size={18} strokeWidth={1.8} />,
      iconColor: "text-rose-600",
      iconBg: "bg-rose-50",
      trend: "9%", up: true,
    },
    {
      label: "Meetings Scheduled",
      value: statsMetrics.meetings,
      icon: <Calendar size={18} strokeWidth={1.8} />,
      iconColor: "text-teal-600",
      iconBg: "bg-teal-50",
      trend: "6%", up: true,
    },
    {
      label: "Stall Booked",
      value: statsMetrics.closed,
      icon: <ShoppingBag size={18} strokeWidth={1.8} />,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      trend: "25%", up: true,
    },
    {
      label: "Revenue",
      value: `₹ ${statsMetrics.revenue} L`,
      icon: <IndianRupee size={18} strokeWidth={1.8} />,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      trend: "18%", up: true,
    },
    {
      label: "Follow-ups Due",
      value: statsMetrics.pendingFollowups,
      icon: <Clock size={18} strokeWidth={1.8} />,
      iconColor: "text-pink-600",
      iconBg: "bg-pink-50",
      trend: "8%", up: false,
    },
    {
      label: "Payments Due",
      value: `₹ ${statsMetrics.collection} L`,
      icon: <Wallet size={18} strokeWidth={1.8} />,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
      trend: "5%", up: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-1.5">
      {stats.map((s, i) => (
        <div
          key={i}
          className={`${s.iconBg} rounded-lg px-2 py-1.5 transition flex items-center gap-2`}
          style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px" }}
        >
          {/* Icon — left, colored, no background */}
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-white shadow-sm ${s.iconColor}`}>
            {s.icon}
          </div>

          {/* Text block */}
          <div className="min-w-0 flex-1 text-left">
              <p className="text-[9.5px] font-bold text-slate-800 tracking-wider leading-tight mb-0.5 truncate">{s.label}</p>
            <div className="flex items-end gap-1.5 mb-0.5">
              <h3 className={`text-[17px] font-semibold leading-none ${s.iconColor}`}>{s.value}</h3>
            </div>
            <p className={`text-[8.5px] font-semibold leading-none flex items-center gap-0.5 ${s.up ? "text-emerald-500" : "text-red-500"}`}>
              {s.up ? "↑" : "↓"} {s.trend} vs yesterday
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

