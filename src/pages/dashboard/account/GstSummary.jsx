export default function GstSummary() {
  const taxes = [
    {
      label: "CGST Collected",
      value: "₹ 9,22,500",
      colors: "bg-[#f4faf6] border-[#d2edd9] text-[#15803d]"
    },
    {
      label: "SGST Collected",
      value: "₹ 9,22,500",
      colors: "bg-[#f4faf6] border-[#d2edd9] text-[#15803d]"
    },
    {
      label: "IGST Collected",
      value: "₹ 0",
      colors: "bg-[#fffaf0] border-[#fed7aa] text-[#ea580c]"
    },
    {
      label: "Total GST",
      value: "₹ 18,45,000",
      colors: "bg-[#faf5ff] border-[#e9d5ff] text-[#7e22ce]"
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-sm h-full flex flex-col justify-between">
      {/* Header */}
      <div className="shrink-0 mb-1.5 pb-1 border-b border-slate-100">
        <h3 className="text-[12.5px] font-black text-slate-800 tracking-tight">
          GST Summary <span className="text-slate-400 font-bold text-[10px] leading-none">(This Month)</span>
        </h3>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
          State and central tax collections
        </p>
      </div>

      {/* 2x2 Grid of GST boxes */}
      <div className="grid grid-cols-2 gap-1.5 flex-1 items-center justify-center">
        {taxes.map((item, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-1.5 py-2 flex flex-col justify-between shadow-sm transition-all duration-300 hover:shadow-md ${item.colors}`}
          >
            <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 mb-1">
              {item.label}
            </span>
            <span className="text-[13px] font-black tracking-tight leading-none">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
