import { useEffect, useState } from "react";
import { RefreshCw, ScanLine } from "lucide-react";
import api from "../lib/api";

export default function MobileLeadCaptures() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mobile Scanned Leads</h1>
          <p className="text-sm text-slate-500">Buyer and visitor leads captured by exhibitors in the mobile scanner.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-bold">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-500 uppercase text-xs">
            <tr>
              <th className="p-4">Captured By</th>
              <th className="p-4">Lead</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Interest</th>
              <th className="p-4">Type</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-6 text-center text-slate-400" colSpan="6">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="p-6 text-center text-slate-400" colSpan="6">No scanned leads found</td></tr>
            ) : items.map(item => (
              <tr key={item._id} className="border-t">
                <td className="p-4">
                  <div className="font-bold text-slate-800">{item.exhibitorId?.exhibitorName || "Unknown"}</div>
                  <div className="text-xs text-slate-400">{item.exhibitorId?.registrationId}</div>
                </td>
                <td className="p-4">
                  <div className="font-bold">{item.name || item.company || "Lead"}</div>
                  <div className="text-xs text-slate-400">{item.company}</div>
                </td>
                <td className="p-4 text-xs">{item.phone || "-"}<br />{item.email || "-"}</td>
                <td className="p-4 text-xs">{item.interest || "-"}</td>
                <td className="p-4"><span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold"><ScanLine size={12} />{item.sourceType}</span></td>
                <td className="p-4 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
