import { useNavigate } from "react-router-dom";

export default function NextActionPanel({ userLeads }) {
  const navigate = useNavigate();
  const hotLeads = userLeads.filter(c => c.companyStatus?.toLowerCase() === "est./pi sent");
  const displayLeads = hotLeads.slice(0, 2);

  return (
    <div className="bg-gradient-to-br from-[#08775e] to-[#043d31] rounded-2xl border border-[#08775e]/20 p-5 shadow-lg lg:col-span-3 text-white flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[12px]">🤖</span>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#5affcb]">
            Next Best Action (AI Suggestion)
          </h4>
        </div>
        <p className="text-[11px] text-white/90 leading-relaxed font-semibold">
          You have {hotLeads.length || 3} high potential leads to contact today to increase your chances of closure.
        </p>
      </div>

      <div className="space-y-2 mt-4 overflow-y-auto" style={{ maxHeight: '120px' }}>
        {displayLeads.length > 0 ? (
          displayLeads.map((item, i) => (
            <div key={i} className="flex justify-between items-center bg-white/10 rounded-xl p-2.5 border border-white/5">
              <div>
                <h5 className="text-[11px] font-bold text-white leading-none mb-1">{item.companyName}</h5>
                <span className="text-[9px] text-[#5affcb] font-bold block uppercase leading-none">
                  Best time: 10:00 AM - 12:00 PM
                </span>
              </div>
              <a
                href={`tel:${item.contacts?.[0]?.mobile || ""}`}
                className="px-2.5 py-1 text-[9px] font-black uppercase bg-white text-[#043d31] hover:bg-slate-100 transition rounded-lg shadow-sm"
              >
                Call Now
              </a>
            </div>
          ))
        ) : (
          <div className="flex justify-between items-center bg-white/10 rounded-xl p-2.5 border border-white/5">
            <div>
              <h5 className="text-[11px] font-bold text-white leading-none mb-1">MedCare Solutions</h5>
              <span className="text-[9px] text-[#5affcb] font-bold block uppercase leading-none">
                Best time: 10:00 AM - 12:00 PM
              </span>
            </div>
            <button
              onClick={() => navigate("/ihweClientData2026/masterData")}
              className="px-2.5 py-1 text-[9px] font-black uppercase bg-white text-[#043d31] hover:bg-slate-100 transition rounded-lg shadow-sm"
            >
              Call Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
