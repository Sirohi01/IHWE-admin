import { DollarSign, AlertCircle, Clock, Calendar, ShieldCheck, TrendingUp, TrendingDown } from "lucide-react";

export default function AccountStatsRow() {
  const cards = [
    {
      title: "Total Revenue Collected",
      value: "₹ 1,24,75,000",
      trend: "18.6%",
      trendLabel: "vs last month",
      trendUp: true,
      isRupee: true,
      colors: {
        bg: "bg-[#eefcf3]",
        border: "border-[#ccefd7]",
        text: "text-[#15803d]",
        iconBg: "bg-emerald-500",
        trendText: "text-emerald-600"
      }
    },
    {
      title: "Pending Payments",
      value: "₹ 28,40,000",
      trend: "12.4%",
      trendLabel: "vs last month",
      trendUp: true,
      icon: Clock,
      colors: {
        bg: "bg-[#fffaf0]",
        border: "border-[#fee6c2]",
        text: "text-[#d97706]",
        iconBg: "bg-amber-500",
        trendText: "text-amber-600"
      }
    },
    {
      title: "Today's Collection",
      value: "₹ 4,75,000",
      trend: "8.7%",
      trendLabel: "vs yesterday",
      trendUp: true,
      icon: Calendar,
      colors: {
        bg: "bg-[#f0f7ff]",
        border: "border-[#cce3ff]",
        text: "text-[#1d4ed8]",
        iconBg: "bg-blue-600",
        trendText: "text-blue-600"
      }
    },
    {
      title: "Overdue Payments",
      value: "₹ 12,80,000",
      trend: "15.3%",
      trendLabel: "vs last month",
      trendUp: true,
      icon: AlertCircle,
      colors: {
        bg: "bg-[#fef2f2]",
        border: "border-[#fecaca]",
        text: "text-[#dc2626]",
        iconBg: "bg-red-500",
        trendText: "text-red-600"
      }
    },
    {
      title: "GST Collected",
      value: "₹ 18,45,000",
      trend: "11.2%",
      trendLabel: "vs last month",
      trendUp: true,
      icon: ShieldCheck,
      colors: {
        bg: "bg-[#faf5ff]",
        border: "border-[#e9d5ff]",
        text: "text-[#7e22ce]",
        iconBg: "bg-purple-600",
        trendText: "text-purple-600"
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1.5 mb-1">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={`rounded-xl border ${card.colors.bg} ${card.colors.border} p-2 py-1.5 flex flex-col justify-between shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
          >
            {/* Header: Icon + Title */}
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full ${card.colors.iconBg} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                {card.isRupee ? (
                  <span className="text-[12px] font-black leading-none select-none">₹</span>
                ) : (
                  <Icon size={12} strokeWidth={2.5} />
                )}
              </div>
              <span className="text-[9px] font-black text-slate-500 tracking-tight leading-tight uppercase">
                {card.title}
              </span>
            </div>

            {/* Value (Large bold number) */}
            <div className="mt-1">
              <h2 className={`text-[15px] font-semibold tracking-tight leading-none ${card.colors.text}`}>
                {card.value}
              </h2>
            </div>

            {/* Footer: Trend Indicator */}
            <div className="flex items-center gap-1 mt-1">
              <span className={`flex items-center gap-0.5 text-[9px] font-black ${card.colors.trendText}`}>
                {card.trendUp ? <TrendingUp size={9} strokeWidth={3} /> : <TrendingDown size={9} strokeWidth={3} />}
                {card.trendUp ? "↑" : "↓"} {card.trend}
              </span>
              <span className="text-[8.5px] font-extrabold text-slate-400">
                {card.trendLabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
