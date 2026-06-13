import { useEffect, useState } from "react";
import { CheckCircle, XCircle, RefreshCw, Ticket } from "lucide-react";
import api from "../lib/api";

export default function MobilePassRequests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/exhibitor-pass-requests/admin/all");
      setItems(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/api/exhibitor-pass-requests/admin/${id}/status`, { status });
    load();
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mobile Pass Requests</h1>
          <p className="text-sm text-slate-500">Approve or reject exhibitor pass, vehicle, service, and visitor requests.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-bold">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-500 uppercase text-xs">
            <tr>
              <th className="p-4">Exhibitor</th>
              <th className="p-4">Type</th>
              <th className="p-4">Quantity</th>
              <th className="p-4">Details</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-6 text-center text-slate-400" colSpan="6">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="p-6 text-center text-slate-400" colSpan="6">No pass requests found</td></tr>
            ) : items.map((item) => (
              <tr key={item._id} className="border-t align-top">
                <td className="p-4">
                  <div className="font-bold text-slate-800">{item.exhibitorId?.exhibitorName || "Unknown"}</div>
                  <div className="text-xs text-slate-400">{item.exhibitorId?.registrationId}</div>
                </td>
                <td className="p-4 capitalize"><Ticket size={14} className="inline mr-1" />{item.passType}</td>
                <td className="p-4 font-bold">{item.quantity}</td>
                <td className="p-4 text-xs text-slate-600 max-w-md">
                  {item.passType === "vehicle"
                    ? (item.vehicles || []).map(v => `${v.vehicleType}: ${v.vehicleNumber}`).join(", ")
                    : (item.personnel || []).map(p => `${p.name || "Unnamed"} (${p.designation || "-"})`).join(", ")}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.status === "approved" ? "bg-green-100 text-green-700" : item.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => updateStatus(item._id, "approved")} className="p-2 bg-green-100 text-green-700 rounded"><CheckCircle size={16} /></button>
                    <button onClick={() => updateStatus(item._id, "rejected")} className="p-2 bg-red-100 text-red-700 rounded"><XCircle size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
