import { Clock, Calendar, AlertCircle, ShieldCheck } from "lucide-react";

const formatCurrency = (val) => `₹ ${Math.round(val || 0).toLocaleString("en-IN")}`;

export default function AccountStatsRow({ stats, payments = [], loading }) {
  const today = new Date();
  const todaysCollection = payments
    .filter((p) => {
      const d = new Date(p.payment_date || p.added);
      return !isNaN(d.getTime()) && d.toDateString() === today.toDateString();
    })
    .reduce((sum, p) => sum + (parseFloat(p.amount_text) || 0), 0);

  const cards = [
    {
      title: "Revenue Generated",
      value: formatCurrency(stats?.totalReceived),
      isRupee: true,
      colors: {
        bg: "bg-[#eefcf3]",
        border: "border-[#ccefd7]",
        text: "text-[#15803d]",
        iconBg: "bg-emerald-500",
      }
    },
    {
      title: "Pending Payments",
      value: formatCurrency(stats?.pendingAmount),
      icon: Clock,
      colors: {
        bg: "bg-[#fffaf0]",
        border: "border-[#fee6c2]",
        text: "text-[#d97706]",
        iconBg: "bg-amber-500",
      }
    },
    {
      title: "Today's Collection",
      value: formatCurrency(todaysCollection),
      icon: Calendar,
      colors: {
        bg: "bg-[#f0f7ff]",
        border: "border-[#cce3ff]",
        text: "text-[#1d4ed8]",
        iconBg: "bg-blue-600",
      }
    },
    {
      title: "Overdue Payments",
      value: formatCurrency(stats?.overdueAmount),
      icon: AlertCircle,
      colors: {
        bg: "bg-[#fef2f2]",
        border: "border-[#fecaca]",
        text: "text-[#dc2626]",
        iconBg: "bg-red-500",
      }
    },
    {
      title: "GST Collected",
      value: null,
      comingSoon: true,
      icon: ShieldCheck,
      colors: {
        bg: "bg-[#faf5ff]",
        border: "border-[#e9d5ff]",
        text: "text-[#7e22ce]",
        iconBg: "bg-purple-600",
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
            className={`rounded-xl border ${card.colors.bg} ${card.colors.border} p-2 py-1.5 flex flex-col justify-between shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${card.comingSoon ? "opacity-60" : ""}`}
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
              {card.comingSoon ? (
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Coming Soon</span>
              ) : (
                <h2 className={`text-[15px] font-semibold tracking-tight leading-none ${card.colors.text}`}>
                  {loading ? "…" : card.value}
                </h2>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
