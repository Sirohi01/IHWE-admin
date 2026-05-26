import { Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function TopLeadsCard({ userLeads }) {
  const hotLeads = userLeads.filter(c => c.companyStatus === "Est./PI Sent").slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm lg:col-span-3 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Top Leads (High Potential)</h3>
        <Link to="/ihweClientData2026/hotClientList" className="text-[10px] font-black text-[#08775e] hover:underline uppercase">
          View All
        </Link>
      </div>

      <div className="space-y-3 flex-1">
        {hotLeads.length === 0 ? (
          <div className="text-center py-8 text-slate-400 italic">No high-potential hot leads assigned</div>
        ) : (
          hotLeads.map((lead, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-xl border border-slate-50 bg-slate-50/30 hover:bg-slate-50 transition">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-xs font-black shadow-sm">
                  {lead.companyName?.[0] || 'L'}
                </div>
                <div>
                  <h5 className="text-[11px] font-extrabold text-slate-900 leading-none mb-1">{lead.companyName}</h5>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase leading-none">
                    {lead.contacts?.[0]?.firstName || "Client"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase leading-none">Score</span>
                  <span className="text-[11px] font-extrabold text-rose-600 block mt-1 leading-none">92</span>
                </div>
                <a
                  href={`tel:${lead.contacts?.[0]?.mobile || ""}`}
                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition shadow-sm"
                >
                  <Phone size={11} strokeWidth={2.5} />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
