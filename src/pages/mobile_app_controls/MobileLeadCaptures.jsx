import { useEffect, useMemo, useState } from "react";
import { Download, Filter, RefreshCw, ScanLine, Search, Thermometer, Users } from "lucide-react";
import api from "../../lib/api";

const sourceOptions = ["all", "buyer", "visitor", "unknown"];
const temperatureOptions = ["all", "Hot", "Warm", "Cold", "Uncategorized"];

const csvEscape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export default function MobileLeadCaptures() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [temperatureFilter, setTemperatureFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/exhibitor-leads/admin/all");
      setItems(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      const sourceMatches = sourceFilter === "all" || item.sourceType === sourceFilter;
      const tempMatches = temperatureFilter === "all" || (item.temperature || "Uncategorized") === temperatureFilter;
      const text = [
        item.name,
        item.company,
        item.email,
        item.phone,
        item.registrationId,
        item.interest,
        item.exhibitorId?.exhibitorName,
        item.exhibitorId?.registrationId,
      ].join(" ").toLowerCase();

      return sourceMatches && tempMatches && (!needle || text.includes(needle));
    });
  }, [items, query, sourceFilter, temperatureFilter]);

  const stats = useMemo(() => ({
    total: items.length,
    buyers: items.filter(item => item.sourceType === "buyer").length,
    visitors: items.filter(item => item.sourceType === "visitor").length,
    hot: items.filter(item => item.temperature === "Hot").length,
  }), [items]);

  const exportCsv = () => {
    const rows = [
      ["Captured By", "Exhibitor Registration", "Lead Name", "Company", "Phone", "Email", "Interest", "Source", "Temperature", "Date"],
      ...filteredItems.map((item) => [
        item.exhibitorId?.exhibitorName || "",
        item.exhibitorId?.registrationId || "",
        item.name || "",
        item.company || "",
        item.phone || "",
        item.email || "",
        item.interest || "",
        item.sourceType || "",
        item.temperature || "Uncategorized",
        item.createdAt ? new Date(item.createdAt).toLocaleString() : "",
      ]),
    ];

    const csv = rows.map(row => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mobile-scanned-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sourceBadge = (source) => {
    const classes = {
      buyer: "bg-blue-50 text-blue-700 border-blue-100",
      visitor: "bg-emerald-50 text-emerald-700 border-emerald-100",
      unknown: "bg-slate-100 text-slate-600 border-slate-200",
    };
    return classes[source] || classes.unknown;
  };

  const temperatureBadge = (temperature) => {
    const classes = {
      Hot: "bg-red-50 text-red-700 border-red-100",
      Warm: "bg-orange-50 text-orange-700 border-orange-100",
      Cold: "bg-sky-50 text-sky-700 border-sky-100",
      Uncategorized: "bg-slate-100 text-slate-600 border-slate-200",
    };
    return classes[temperature || "Uncategorized"] || classes.Uncategorized;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#23471d]/10 bg-[#23471d]/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#23471d]">
            <ScanLine size={13} /> Mobile Scanner
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Mobile Scanned Leads</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Buyer and visitor leads captured by exhibitors in the mobile scanner.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl bg-[#23471d] px-4 py-2.5 text-sm font-black text-white shadow-sm disabled:opacity-60" disabled={filteredItems.length === 0}>
            <Download size={16} /> Export CSV
          </button>
          <button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-4">
        {[
          { label: "Total Leads", value: stats.total, icon: Users },
          { label: "Buyer Leads", value: stats.buyers, icon: ScanLine },
          { label: "Visitor Leads", value: stats.visitors, icon: ScanLine },
          { label: "Hot Leads", value: stats.hot, icon: Thermometer },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                <Icon size={16} className="text-slate-400" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_200px]">
          <label className="relative block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lead, exhibitor, company, phone, email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#23471d] focus:ring-2 focus:ring-[#23471d]/10"
            />
          </label>

          <label className="relative block">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-black capitalize text-slate-700 outline-none">
              {sourceOptions.map(option => <option key={option} value={option}>{option === "all" ? "All Sources" : option}</option>)}
            </select>
          </label>

          <label className="relative block">
            <Thermometer size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select value={temperatureFilter} onChange={(e) => setTemperatureFilter(e.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-black text-slate-700 outline-none">
              {temperatureOptions.map(option => <option key={option} value={option}>{option === "all" ? "All Temperatures" : option}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-4">Captured By</th>
                <th className="p-4">Lead</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Interest</th>
                <th className="p-4">Source</th>
                <th className="p-4">Temperature</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-8 text-center font-bold text-slate-400" colSpan="7">Loading scanned leads...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr><td className="p-8 text-center font-bold text-slate-400" colSpan="7">No scanned leads match your filters</td></tr>
              ) : filteredItems.map(item => (
                <tr key={item._id} className="border-t border-slate-100 hover:bg-slate-50/70">
                  <td className="p-4">
                    <div className="font-black text-slate-800">{item.exhibitorId?.exhibitorName || "Unknown"}</div>
                    <div className="text-xs font-semibold text-slate-400">{item.exhibitorId?.registrationId || "-"}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-black text-slate-900">{item.name || item.company || "Lead"}</div>
                    <div className="text-xs font-semibold text-slate-400">{item.company || item.registrationId || "-"}</div>
                  </td>
                  <td className="p-4 text-xs font-semibold text-slate-600">
                    <div>{item.phone || "-"}</div>
                    <div>{item.email || "-"}</div>
                  </td>
                  <td className="max-w-[180px] p-4 text-xs font-semibold text-slate-600">{item.interest || "-"}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-black capitalize ${sourceBadge(item.sourceType)}`}>
                      <ScanLine size={12} />{item.sourceType || "unknown"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-black ${temperatureBadge(item.temperature)}`}>
                      <Thermometer size={12} />{item.temperature || "Uncategorized"}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-semibold text-slate-500">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
