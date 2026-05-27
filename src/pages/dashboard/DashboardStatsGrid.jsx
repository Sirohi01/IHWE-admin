import { Users, Phone, Flame, Calendar, ShoppingBag, IndianRupee, Clock, Wallet } from "lucide-react";

export default function DashboardStatsGrid({ statsMetrics }) {
  const stats = [
    {
      label: "Total Leads",
      value: statsMetrics.total,
      icon: <Users size={22} strokeWidth={1.8} />,
      iconColor: "text-emerald-500",
      trend: "12%", up: true,
    },
    {
      label: "Calls Made Today",
      value: statsMetrics.callsMadeToday,
      icon: <Phone size={22} strokeWidth={1.8} />,
      iconColor: "text-blue-500",
      trend: "14%", up: true,
    },
    {
      label: "Interested Clients",
      value: statsMetrics.interested,
      icon: <Flame size={22} strokeWidth={1.8} />,
      iconColor: "text-rose-500",
      trend: "9%", up: true,
    },
    {
      label: "Meetings Scheduled",
      value: statsMetrics.meetings,
      icon: <Calendar size={22} strokeWidth={1.8} />,
      iconColor: "text-teal-500",
      trend: "6%", up: true,
    },
    {
      label: "Stall Bookings Closed",
      value: statsMetrics.closed,
      icon: <ShoppingBag size={22} strokeWidth={1.8} />,
      iconColor: "text-amber-500",
      trend: "25%", up: true,
    },
    {
      label: "Revenue Generated",
      value: `₹ ${statsMetrics.revenue} L`,
      icon: <IndianRupee size={22} strokeWidth={1.8} />,
      iconColor: "text-emerald-500",
      trend: "18%", up: true,
    },
    {
      label: "Pending Follow-ups",
      value: statsMetrics.pendingFollowups,
      icon: <Clock size={22} strokeWidth={1.8} />,
      iconColor: "text-pink-500",
      trend: "8%", up: false,
    },
    {
      label: "Collection Pending",
      value: `₹ ${statsMetrics.collection} L`,
      icon: <Wallet size={22} strokeWidth={1.8} />,
      iconColor: "text-purple-500",
      trend: "5%", up: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-2">
      {stats.map((s, i) => (
        <div
          key={i}
          className="bg-white rounded-lg border border-slate-100 px-3 py-4 shadow-sm hover:shadow-md transition flex items-center gap-3"
        >
          {/* Icon — left, colored, no background */}
          <div className={`flex-shrink-0 ${s.iconColor}`}>
            {s.icon}
          </div>

          {/* Text block */}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-black leading-none mb-1 truncate">{s.label}</p>
            <h3 className="text-[18px] font-semibold text-slate-900 leading-none mb-2">{s.value}</h3>
            <p className={`text-[10px] font-semibold leading-none flex items-center gap-0.5 ${s.up ? "text-emerald-500" : "text-red-500"}`}>
              {s.up ? "↑" : "↓"} {s.trend} vs yesterday
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

