import { ResponsiveContainer, AreaChart, Area } from "recharts";

const sparklineData = [{ v: 12 }, { v: 8 }, { v: 15 }, { v: 10 }, { v: 18 }, { v: 14 }, { v: 20 }, { v: 16 }, { v: 24 }, { v: 32 }];
const meetData      = [{ v: 2 }, { v: 5 }, { v: 3 }, { v: 6 }, { v: 4 }, { v: 7 }, { v: 5 }, { v: 6 }, { v: 7 }, { v: 8 }];
const closeData     = [{ v: 1 }, { v: 3 }, { v: 2 }, { v: 4 }, { v: 2 }, { v: 3 }, { v: 4 }, { v: 3 }, { v: 4 }, { v: 5 }];
const revData       = [{ v: 1.5 }, { v: 2 }, { v: 3 }, { v: 4.5 }, { v: 4 }, { v: 5.5 }, { v: 6 }, { v: 7 }, { v: 7.5 }, { v: 8.75 }];

const cards = [
  { label: "Calls Made", color: "#22c55e", gradId: "callsG", trend: "↑ 14%", trendUp: true,  data: sparklineData, valueKey: "callsMadeToday", prefix: "",   suffix: "" },
  { label: "Meetings",   color: "#3b82f6", gradId: "meetG",  trend: "↑ 6%",  trendUp: true,  data: meetData,      valueKey: "meetings",       prefix: "",   suffix: "" },
  { label: "Closures",   color: "#f97316", gradId: "closeG", trend: "↓ 25%", trendUp: false, data: closeData,     valueKey: "closed",         prefix: "",   suffix: "" },
  { label: "Revenue",    color: "#8b5cf6", gradId: "revG",   trend: "↑ 18%", trendUp: true,  data: revData,       valueKey: "revenue",        prefix: "₹ ", suffix: " L" },
];

export default function PerformanceOverview({ statsMetrics }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm lg:col-span-5 col-span-1 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h3 className="text-base font-bold text-slate-800">Daily Performance Overview</h3>
        <button className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition">
          Today
          {/* <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5L5 6.5L8 3.5" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg> */}
        </button>
      </div>

      {/* 4 metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-slate-100 p-3 flex flex-col shadow-sm"
          >
            {/* Label — colored */}
            <span className="text-[12px] font-semibold mb-1" style={{ color: card.color }}>
              {card.label}
            </span>

            {/* Value — large, colored */}
            <span className="text-[18px] font-black leading-none mb-2 truncate" style={{ color: card.color }}>
              {card.prefix}{statsMetrics[card.valueKey]}{card.suffix}
            </span>

            {/* Sparkline */}
            <div className="flex-1 min-h-[60px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={card.data} margin={{ top: 4, right: 2, left: 2, bottom: 4 }}>
                  <defs>
                    <linearGradient id={card.gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={card.color} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={card.color} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={card.color}
                    strokeWidth={2}
                    fill={`url(#${card.gradId})`}
                    dot={{ r: 3, fill: "#fff", stroke: card.color, strokeWidth: 2 }}
                    activeDot={{ r: 4, fill: card.color, stroke: "#fff", strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Trend */}
            <span className={`text-[12px] font-semibold mt-1 text-right ${card.trendUp ? "text-emerald-500" : "text-orange-500"}`}>
              <span className="text-[15px] font-black">{card.trendUp ? "↑" : "↓"}</span> {card.trend.replace("↑ ", "").replace("↓ ", "")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
