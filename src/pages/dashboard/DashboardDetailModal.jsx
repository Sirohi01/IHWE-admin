import { useEffect } from "react";
import { X } from "lucide-react";

// Simple table modal used by the My Dashboard stat cards.
// columns: [{ key, label, render?(row) }]
export default function DashboardDetailModal({ title, subtitle, columns, rows, loading, emptyText = "No records for this duration", onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 sm:p-6" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-[1400px] max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-bold text-slate-800">{title}</h2>
            {subtitle && <p className="text-[10px] font-medium text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead className="sticky top-0 bg-[#0A2947] text-white">
              <tr>
                <th className="px-3 py-2 font-semibold w-10">#</th>
                {columns.map((c) => <th key={c.key} className="px-3 py-2 font-semibold whitespace-nowrap">{c.label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={columns.length + 1} className="px-3 py-8 text-center text-slate-500">Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={columns.length + 1} className="px-3 py-8 text-center text-slate-500">{emptyText}</td></tr>
              ) : rows.map((row, i) => (
                <tr key={row._id || i} className="hover:bg-slate-50 text-slate-800">
                  <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                  {columns.map((c) => <td key={c.key} className="px-3 py-2 align-top">{c.render ? c.render(row) : (row[c.key] || "-")}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-200 text-[10px] font-semibold text-slate-600">Total: {rows.length}</div>
        )}
      </div>
    </div>
  );
}
