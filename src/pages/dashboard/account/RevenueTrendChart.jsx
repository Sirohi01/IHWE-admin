import { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

// ─── Dummy Datasets for interactive transitions ─────────────────────────────
const monthlyData = [
  { name: "01 May", revenue: 550000, target: 300000 },
  { name: "05 May", revenue: 1080000, target: 550000 },
  { name: "09 May", revenue: 800000, target: 350000 },
  { name: "13 May", revenue: 1450000, target: 780000 },
  { name: "17 May", revenue: 1050000, target: 500000 },
  { name: "21 May", revenue: 1720000, target: 1080000 },
  { name: "25 May", revenue: 1200000, target: 720000 },
  { name: "29 May", revenue: 1800000, target: 1200000 },
  { name: "31 May", revenue: 1920000, target: 1480000 }
];

const weeklyData = [
  { name: "Week 1", revenue: 2500000, target: 2000000 },
  { name: "Week 2", revenue: 3800000, target: 3000000 },
  { name: "Week 3", revenue: 3100000, target: 2800000 },
  { name: "Week 4", revenue: 4500000, target: 4000000 }
];

const dailyData = [
  { name: "Mon", revenue: 120000, target: 100000 },
  { name: "Tue", revenue: 250000, target: 150000 },
  { name: "Wed", revenue: 180000, target: 200000 },
  { name: "Thu", revenue: 360000, target: 280000 },
  { name: "Fri", revenue: 290000, target: 300000 },
  { name: "Sat", revenue: 480000, target: 350000 },
  { name: "Sun", revenue: 520000, target: 400000 }
];

export default function RevenueTrendChart() {
  const [timeframe, setTimeframe] = useState("Monthly"); // 'Daily' | 'Weekly' | 'Monthly'
  const [showRevenue, setShowRevenue] = useState(true);
  const [showTarget, setShowTarget] = useState(true);

  const activeData = timeframe === "Monthly"
    ? monthlyData
    : timeframe === "Weekly"
      ? weeklyData
      : dailyData;

  const formatIndianCurrency = (num) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const yFormatter = (val) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1).replace(/\.0$/, "")}L`;
    }
    return `₹${val}`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-sm flex flex-col justify-between h-full">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1 shrink-0">
        <div>
          <h3 className="text-[12.5px] font-black text-slate-800 tracking-tight">
            Revenue Collection Trend
          </h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Comparison vs monthly targets
          </p>
        </div>

        {/* Action Toggle Filters */}
        <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-100 p-0.5 rounded-lg shrink-0">
          {["Daily", "Weekly", "Monthly"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-2 py-0.5 rounded-md text-[9.5px] font-black transition-all ${
                timeframe === t
                  ? "bg-white text-emerald-600 shadow-sm border border-slate-100"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Graph Legend */}
      <div className="flex items-center gap-3 mb-1 px-1 shrink-0">
        <button
          onClick={() => setShowRevenue(!showRevenue)}
          className={`flex items-center gap-1.5 text-[9.5px] font-black transition-all ${
            showRevenue ? "opacity-100" : "opacity-40"
          }`}
        >
          <span className="w-2.5 h-1 bg-emerald-500 rounded-full inline-block" />
          <span className="text-slate-700">Revenue Collected (₹)</span>
        </button>
        <button
          onClick={() => setShowTarget(!showTarget)}
          className={`flex items-center gap-1.5 text-[9.5px] font-black transition-all ${
            showTarget ? "opacity-100" : "opacity-40"
          }`}
        >
          <span className="w-2.5 h-1 bg-blue-500 rounded-full inline-block" />
          <span className="text-slate-700">Collection Target (₹)</span>
        </button>
      </div>

      {/* Main Recharts Area Container */}
      <div className="w-full h-[110px] xl:h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {/* Green glow gradient */}
              <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
              </linearGradient>
              {/* Blue glow gradient */}
              <linearGradient id="targetGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={10}
              fontWeight="bold"
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={10}
              fontWeight="bold"
              tickLine={false}
              axisLine={false}
              tickFormatter={yFormatter}
              dx={-5}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-3 shadow-xl flex flex-col gap-1 text-[11px] font-black">
                      <p className="text-slate-400 mb-1 border-b border-slate-800 pb-1 uppercase tracking-wider">{payload[0].payload.name}</p>
                      {payload.map((item, index) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: item.color }}
                            />
                            <span>{item.name}</span>
                          </span>
                          <span className="font-extrabold text-white">{formatIndianCurrency(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            {showRevenue && (
              <Area
                type="monotone"
                name="Revenue Collected"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#revenueGlow)"
                dot={{ r: 4, stroke: "#10b981", strokeWidth: 2, fill: "#fff" }}
                activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
              />
            )}
            {showTarget && (
              <Area
                type="monotone"
                name="Collection Target"
                dataKey="target"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#targetGlow)"
                dot={{ r: 4, stroke: "#3b82f6", strokeWidth: 2, fill: "#fff" }}
                activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
