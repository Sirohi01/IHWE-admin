import { Phone, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function FollowupsTable({ followupsList }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm lg:col-span-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Today's Follow-ups</h3>
        <Link to="/ihweClientData2026/warmClientList" className="text-[10px] font-black text-[#08775e] hover:underline uppercase">
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
              <th className="py-2.5">Client Name</th>
              <th className="py-2.5">Company</th>
              <th className="py-2.5">Time</th>
              <th className="py-2.5">Priority</th>
              <th className="py-2.5">Status</th>
              <th className="py-2.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {followupsList.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-slate-400 italic">
                  No scheduled follow-ups for today
                </td>
              </tr>
            ) : (
              followupsList.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 font-bold text-slate-900 text-[13px]">{item.name}</td>
                  <td className="py-3.5 font-semibold text-slate-500 text-[13px]">{item.company}</td>
                  <td className="py-3.5 font-bold text-slate-800 text-[13px]">{item.time}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-[4px] text-[11px] font-black uppercase ${item.priorityColor}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-3.5 font-bold text-teal-600 text-[13px]">{item.status}</td>
                  <td className="py-3.5 text-center">
                    <div className="flex justify-center items-center gap-1.5">
                      <a href={`tel:${item.phone}`} className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition">
                        <Phone size={13} strokeWidth={2.5} />
                      </a>
                      <a href="https://web.whatsapp.com" target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition text-[13px]">
                        💬
                      </a>
                      <button
                        onClick={() => navigate(`/client-overview/${item.id}`)}
                        className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                      >
                        <Calendar size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
