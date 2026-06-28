import { ResponsiveContainer, BarChart, Bar, Cell, Tooltip } from "recharts";

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

export default function PerformanceOverview({ statsMetrics, globalPeriod }) {
  const periodLabel = globalPeriod 
    ? globalPeriod.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) 
    : "Today";

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-2 shadow-sm lg:col-span-5 col-span-1 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-2 shrink-0">
        <h3 className="text-base font-semibold text-slate-800">Daily Performance Overview</h3>
        <button className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition">
          {periodLabel}
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
            className="bg-white rounded-lg border border-slate-100 p-1.5 flex flex-col shadow-sm"
          >
            {/* Label — colored */}
            <span className="text-[12px] font-semibold mb-1" style={{ color: card.color }}>
              {card.label}
            </span>

            {/* Value — large, colored */}
            <span className="text-[15px] font-black leading-none mb-1 truncate" style={{ color: card.color }}>
              {card.prefix}{statsMetrics[card.valueKey]}{card.suffix}
            </span>

            {/* Sparkline */}
            <div className="flex-1 min-h-[35px] w-full mt-1 mb-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={card.data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px', padding: '4px 8px' }}
                    labelStyle={{ display: 'none' }}
                    itemStyle={{ color: card.color, fontWeight: 'bold' }}
                    formatter={(value) => [`${card.prefix}${value}${card.suffix}`, '']}
                  />
                  <Bar dataKey="v" radius={[2, 2, 0, 0]}>
                    {card.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={card.color} fillOpacity={index === card.data.length - 1 ? 1 : 0.3} />
                    ))}
                  </Bar>
                </BarChart>
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
