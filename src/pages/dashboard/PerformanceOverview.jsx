import { ResponsiveContainer, AreaChart, Area } from "recharts";

const sparklineData = [
  { v: 12 }, { v: 19 }, { v: 15 }, { v: 22 }, { v: 28 }, { v: 32 },
];
const meetData  = [{ v: 2 }, { v: 4 }, { v: 3 }, { v: 5 }, { v: 6 }, { v: 8 }];
const closeData = [{ v: 1 }, { v: 0 }, { v: 2 }, { v: 1 }, { v: 1 }, { v: 5 }];
const revData   = [{ v: 1.5 }, { v: 1.5 }, { v: 4.5 }, { v: 6 }, { v: 7.5 }, { v: 8.75 }];

const cards = [
  { label: "Calls Made", color: "#3b82f6", gradId: "callsG", trend: "▲ 14%", data: sparklineData, valueKey: "callsMadeToday", prefix: "",   suffix: "" },
  { label: "Meetings",   color: "#14b8a6", gradId: "meetG",  trend: "▲ 6%",  data: meetData,      valueKey: "meetings",       prefix: "",   suffix: "" },
  { label: "Closures",   color: "#f97316", gradId: "closeG", trend: "▲ 25%", data: closeData,     valueKey: "closed",         prefix: "",   suffix: "" },
  { label: "Revenue",    color: "#8b5cf6", gradId: "revG",   trend: "▲ 18%", data: revData,       valueKey: "revenue",        prefix: "₹ ", suffix: " L" },
];

export default function PerformanceOverview({ statsMetrics }) {
  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm lg:col-span-5 flex flex-col"
      style={{ minHeight: '240px' }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-5 shrink-0">
        <h3 className="text-sm font-black text-slate-800">Daily Performance Overview</h3>
        <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 border border-slate-200 rounded-lg px-3 py-1 hover:bg-slate-50 transition">
          Today
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5L5 6.5L8 3.5" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* 4 metric columns */}
      <div className="flex gap-4 flex-1">
        {cards.map((card, i) => (
          <div key={i} className="flex flex-col flex-1">
            {/* Label */}
            <span className="text-[11px] font-semibold text-slate-500 mb-1 shrink-0">{card.label}</span>
            {/* Value */}
            <span className="text-[22px] font-black leading-none mb-2 shrink-0" style={{ color: card.color }}>
              {card.prefix}{statsMetrics[card.valueKey]}{card.suffix}
            </span>
            {/* Sparkline with dots + area fill */}
            <div className="flex-1 min-h-[50px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={card.data} margin={{ top: 6, right: 4, left: 4, bottom: 6 }}>
                  <defs>
                    <linearGradient id={card.gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={card.color} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={card.color} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={card.color}
                    strokeWidth={2}
                    fill={`url(#${card.gradId})`}
                    dot={{
                      r: 3,
                      fill: card.color,
                      stroke: '#ffffff',
                      strokeWidth: 1.5,
                    }}
                    activeDot={{ r: 4, fill: card.color, stroke: '#ffffff', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Trend */}
            <span className="text-[11px] font-bold mt-1 shrink-0" style={{ color: card.color }}>
              {card.trend}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
