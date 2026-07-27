import { useState, useEffect } from "react";
import { Users, Phone, Flame, Calendar, ShoppingBag, IndianRupee, Clock, Wallet } from "lucide-react";

// Helper component for smooth number animation
const AnimatedNumber = ({ value, isCurrency = false }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const end = parseFloat(value) || 0;
    if (end === 0) {
      setCount(0);
      return;
    }

    const duration = 1500; // 1.5 seconds animation
    let startTimestamp = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOut expo easing function
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(end * easeProgress);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value]);

  if (isCurrency) {
    return <>₹ {count.toFixed(2)} L</>;
  }
  return <>{Math.floor(count)}</>;
};

export default function DashboardStatsGrid({ statsMetrics }) {
  const stats = [
    {
      label: "TOTAL LEADS",
      value: statsMetrics.total,
      isCurrency: false,
      icon: <Users size={16} strokeWidth={2.5} />,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      gradientTo: "to-emerald-100",
      trend: "12%", up: true,
    },
    {
      label: "CALLS MADE",
      value: statsMetrics.callsMade,
      isCurrency: false,
      icon: <Phone size={16} strokeWidth={2.5} />,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      gradientTo: "to-blue-100",
      trend: "14%", up: true,
    },
    {
      label: "INTERESTED",
      value: statsMetrics.interested,
      isCurrency: false,
      icon: <Flame size={16} strokeWidth={2.5} />,
      iconColor: "text-rose-600",
      iconBg: "bg-rose-100",
      gradientTo: "to-rose-100",
      trend: "9%", up: true,
    },
    {
      label: "MEETINGS",
      value: statsMetrics.meetings,
      isCurrency: false,
      icon: <Calendar size={16} strokeWidth={2.5} />,
      iconColor: "text-teal-600",
      iconBg: "bg-teal-100",
      gradientTo: "to-teal-100",
      trend: "6%", up: true,
    },
    {
      label: "STALL BOOKED",
      value: statsMetrics.closed,
      isCurrency: false,
      icon: <ShoppingBag size={16} strokeWidth={2.5} />,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
      gradientTo: "to-amber-100",
      trend: "25%", up: true,
    },
    {
      label: "REVENUE",
      value: statsMetrics.revenue,
      isCurrency: true,
      icon: <IndianRupee size={16} strokeWidth={2.5} />,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      gradientTo: "to-emerald-100",
      trend: "18%", up: true,
    },
    {
      label: "FOLLOW-UPS",
      value: statsMetrics.pendingFollowups,
      isCurrency: false,
      icon: <Clock size={16} strokeWidth={2.5} />,
      iconColor: "text-pink-600",
      iconBg: "bg-pink-100",
      gradientTo: "to-pink-100",
      trend: "8%", up: false,
    },
    {
      label: "PAYMENTS DUE",
      value: statsMetrics.collection,
      isCurrency: true,
      icon: <Wallet size={16} strokeWidth={2.5} />,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      gradientTo: "to-purple-100",
      trend: "5%", up: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-1.5">
      {stats.map((s, i) => (
        <div
          key={i}
          className={`group cursor-pointer relative bg-gradient-to-br from-slate-50 from-50% ${s.gradientTo} p-3 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden`}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 xl:gap-3 mb-3">
              <div className={`w-8 h-8 xl:w-9 xl:h-9 ${s.iconBg} rounded-full flex items-center justify-center shrink-0`}>
                <div className={`${s.iconColor}`}>
                  {s.icon}
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="truncate" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '3px', display: 'block', fontFamily: 'Inter, sans-serif' }}>
                  <AnimatedNumber value={s.value} isCurrency={s.isCurrency} />
                </span>
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

