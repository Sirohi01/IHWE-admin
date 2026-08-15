import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const formatCurrency = (val) => `₹ ${Math.round(val || 0).toLocaleString("en-IN")}`;
const formatCompact = (val) => {
  const n = Math.round(val || 0);
  if (n >= 10000000) return `₹ ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹ ${(n / 100000).toFixed(2)} L`;
  return formatCurrency(n);
};

export default function PaymentStatusOverview({ stats, loading }) {
  const total = stats?.totalInvoiceValue || 0;
  const received = stats?.totalReceived || 0;
  const pending = stats?.pendingAmount || 0;
  const overdue = stats?.overdueAmount || 0;
  const pct = (val) => (total > 0 ? Math.round((val / total) * 100) : 0);

  const data = [
    { name: "Paid", value: pct(received), amount: formatCurrency(received), color: "#10b981" },
    { name: "Pending", value: pct(pending), amount: formatCurrency(pending), color: "#f59e0b" },
    { name: "Overdue", value: pct(overdue), amount: formatCurrency(overdue), color: "#ef4444" }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-sm flex flex-col justify-between h-full">
      {/* Title */}
      <div className="shrink-0 mb-1.5 pb-1 border-b border-slate-100">
        <h3 className="text-[12.5px] font-md text-slate-800 tracking-tight">
          Payment Status Overview
        </h3>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
          Breakdown by settlement status
        </p>
      </div>

      {/* Row containing Donut and Legend Details */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 flex-1">
        {/* Left Side: Donut Chart with Absolute Centered Text */}
        <div className="relative w-[95px] h-[95px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={38}
                paddingAngle={3}
                dataKey="value"
                isAnimationActive={true}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Absolute centered values inside Donut hole */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[9.5px] font-black text-slate-800 tracking-tight leading-none">
              {loading ? "…" : formatCompact(total)}
            </span>
            <span className="text-[6.5px] text-slate-400 font-black uppercase tracking-wider mt-0.5 leading-none">
              Total
            </span>
          </div>
        </div>

        {/* Right Side: Detailed Legend List */}
        <div className="flex-1 w-full flex flex-col gap-1">
          {data.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-slate-50/50 border border-slate-100/55 py-0.5 px-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block shrink-0 shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[9.5px] font-black text-slate-700">
                  {item.name}
                </span>
              </div>
              <div className="text-right flex items-center gap-1.5">
                <span className="text-[9.5px] font-black text-slate-800">
                  {item.value}%
                </span>
                <span className="text-[8.5px] text-slate-400 font-black min-w-[60px] text-right">
                  ({item.amount})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
