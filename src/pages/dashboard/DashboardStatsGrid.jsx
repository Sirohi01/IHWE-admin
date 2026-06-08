import { Users, Phone, Flame, Calendar, ShoppingBag, IndianRupee, Clock, Wallet } from "lucide-react";

export default function DashboardStatsGrid({ statsMetrics, callsPeriod, setCallsPeriod }) {
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
      hasDropdown: true
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
      label: "Stall Bookings Closed",
      value: statsMetrics.closed,
      icon: <ShoppingBag size={18} strokeWidth={1.8} />,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      trend: "25%", up: true,
    },
    {
      label: "Revenue Generated",
      value: `₹ ${statsMetrics.revenue} L`,
      icon: <IndianRupee size={18} strokeWidth={1.8} />,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      trend: "18%", up: true,
    },
    {
      label: "Pending Follow-ups",
      value: statsMetrics.pendingFollowups,
      icon: <Clock size={18} strokeWidth={1.8} />,
      iconColor: "text-pink-600",
      iconBg: "bg-pink-50",
      trend: "8%", up: false,
    },
    {
      label: "Collection Pending",
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
          className="bg-white rounded-lg border border-slate-100 px-2 py-1.5 shadow-sm hover:shadow-md transition flex items-center gap-2"
        >
          {/* Icon — left, colored, no background */}
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${s.iconBg} ${s.iconColor}`}>
            {s.icon}
          </div>

          {/* Text block */}
          <div className="min-w-0 flex-1 text-left">
            {s.hasDropdown ? (
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[9px] font-semibold text-black leading-tight truncate pr-1">{s.label}</p>
                <select
                  value={callsPeriod}
                  onChange={(e) => setCallsPeriod(e.target.value)}
                  className="text-[8px] border border-slate-200 rounded px-0.5 py-0.5 text-slate-600 bg-transparent outline-none cursor-pointer"
                >
                  <option value="today">Today</option>
                  <option value="this_week">This Week</option>
                  <option value="this_month">This Month</option>
                  <option value="this_year">This Year</option>
                </select>
              </div>
            ) : (
              <p className="text-[9px] font-semibold text-black leading-tight mb-0.5 truncate">{s.label}</p>
            )}
            <div className="flex items-end gap-1.5 mb-0.5">
              <h3 className="text-[16px] font-bold text-slate-900 leading-none">{s.value}</h3>
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

