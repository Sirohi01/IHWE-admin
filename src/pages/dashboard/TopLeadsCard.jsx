import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

// Hardcoded scores & est values per rank
const SCORES    = [92, 89, 78];
const EST_VALUE = ["₹ 3.20 L", "₹ 2.75 L", "₹ 2.10 L"];

export default function TopLeadsCard({ userLeads }) {
  const navigate = useNavigate();
  const hotLeads = userLeads
    .filter(c => ["est./pi sent", "warm client", "follow-up call"].includes(c.companyStatus?.toLowerCase()))
    .slice(0, 3);

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-2 lg:col-span-3 col-span-1 flex flex-col" style={{ boxShadow: 'rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-center -mx-2 -mt-2 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Top Leads (High Potential)</h3>
        <Link to="/ihweClientData2026/hotClientList" className="text-[10px] font-bold text-blue-500 hover:underline">
          View All
        </Link>
      </div>

      {/* Column headers */}
      {hotLeads.length > 0 && (
        <div className="flex items-center mb-1 px-1">
          <div className="flex-1" />
          <div className="w-12 text-[9px] font-bold text-[#111844] text-center">Score</div>
          <div className="w-20 text-[9px] font-bold text-[#111844] text-center">Est. Value</div>
          <div className="w-14" />
        </div>
      )}

      {/* Rows */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1" style={{ maxHeight: '125px', scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
        {hotLeads.length === 0 ? (
          <div className="text-center py-8 text-slate-400 italic text-sm">
            No high-potential leads assigned
          </div>
        ) : (
          hotLeads.map((lead, i) => {
            const contact = lead.contacts?.[0] || {};
            const name = `${contact.firstName || ""} ${contact.surname || ""}`.trim() || "Client";
            const isHot  = lead.companyStatus?.toLowerCase() === "est./pi sent";
            const isWarm = ["warm client", "follow-up call"].includes(lead.companyStatus?.toLowerCase());

            return (
              <div
                key={i}
                onClick={() => navigate(`/client-overview/${lead._id}`, { state: { fromPageLabel: 'Hot Leads' } })}
                className="flex items-center gap-3 py-0.5 border-b border-slate-50 hover:bg-slate-50/60 transition cursor-pointer"
              >
                {/* Avatar */}
                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-black text-slate-500 flex-shrink-0">
                  {lead.companyName?.[0]?.toUpperCase() || "L"}
                </div>

                {/* Company + Name + Badge */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 leading-tight truncate">{lead.companyName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-[9px] font-bold text-slate-700 truncate">{name}</span>
                    {isHot && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-50 text-rose-500 border border-rose-100 flex-shrink-0">Hot</span>
                    )}
                    {isWarm && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-50 text-amber-500 border border-amber-100 flex-shrink-0">Warm</span>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="w-12 text-center">
                  <span className="text-[10px] font-bold text-slate-800">{SCORES[i]}</span>
                </div>

                {/* Est. Value */}
                <div className="w-20 text-center">
                  <span className="text-[10px] font-bold text-emerald-600">{EST_VALUE[i]}</span>
                </div>

                {/* Call button */}
                <a
                  href={`tel:${contact.mobile || ""}`}
                  onClick={e => e.stopPropagation()}
                  className="w-10 py-0 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 text-[11px] font-semibold text-center hover:bg-emerald-100 transition flex-shrink-0"
                >
                  Call
                </a>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
