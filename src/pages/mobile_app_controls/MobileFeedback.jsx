import { useEffect, useState } from "react";
import { CheckCircle, RefreshCw, Star } from "lucide-react";
import api from "../../lib/api";

export default function MobileFeedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/exhibitor-feedback/admin/all");
      setItems(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markReviewed = async (id) => {
    await api.put(`/api/exhibitor-feedback/admin/${id}/review`, { status: "reviewed" });
    load();
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Exhibitor Feedback</h1>
          <p className="text-sm text-slate-500">Feedback submitted from the mobile app.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-bold">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? <div className="text-slate-400">Loading...</div> : items.map(item => (
          <div key={item._id} className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="font-bold text-slate-800">{item.companyName || item.exhibitorName}</h2>
                <p className="text-xs text-slate-400">{item.registrationId} - Stall {item.stallNumber || "-"}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="flex items-center gap-1 text-amber-600 font-bold"><Star size={14} />{item.responses?.overallRating || "-"}</span>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.status === "reviewed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {item.status || "new"}
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <p><b>Participate Again:</b> {item.responses?.participateAgain || "-"}</p>
              <p><b>Visitor Quality:</b> {item.responses?.visitorQuality || "-"}</p>
              <p><b>Buyer Meetings:</b> {item.responses?.buyerMeetings || "-"}</p>
              <p><b>Business:</b> {item.responses?.estimatedBusiness || "-"}</p>
              <p><b>Suggestions:</b> {item.responses?.specialSuggestions || item.responses?.improvements || "-"}</p>
            </div>
            {item.status !== "reviewed" && (
              <button onClick={() => markReviewed(item._id)} className="mt-4 inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-bold">
                <CheckCircle size={14} /> Mark Reviewed
              </button>
            )}
          </div>
        ))}
        {!loading && items.length === 0 && <div className="text-slate-400">No feedback submitted yet.</div>}
      </div>
    </div>
  );
}
