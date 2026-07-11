import { useEffect, useState } from "react";
import { CheckCircle, RefreshCw, Star, Eye, MessageSquare, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export default function MobileFeedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const navigate = useNavigate();

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

  const markReviewed = async (id, e) => {
    if (e) e.stopPropagation();
    await api.put(`/api/exhibitor-feedback/admin/${id}/review`, { status: "reviewed" });
    load();
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ color: '#093C5D' }}>Exhibitor Feedback</h1>
          <p className="text-sm text-slate-500 font-medium">Feedback submitted from the mobile app.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats Cards - Matching Screenshot Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        
        {/* Card 1: Total Feedbacks */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between" style={{ minHeight: '90px' }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              <MessageSquare size={18} className="text-slate-600" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 leading-none">{items.length}</h3>
              <p className="text-[9px] font-bold text-slate-700 uppercase tracking-wide mt-1">TOTAL FEEDBACKS</p>
            </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] font-bold text-slate-500">All submissions</p>
          </div>
        </div>

        {/* Card 2: High Rated */}
        <div className="bg-[#fff9eb] border border-[#fde68a] rounded-xl p-3 flex flex-col justify-between" style={{ minHeight: '90px' }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Star size={18} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 leading-none">{items.filter(i => i.responses?.overallRating === "Excellent" || i.responses?.overallRating === "Very Good").length}</h3>
              <p className="text-[9px] font-bold text-slate-700 uppercase tracking-wide mt-1">HIGH RATED</p>
            </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] font-bold text-[#d97706]">Excellent experience</p>
          </div>
        </div>

        {/* Card 3: Reviewed */}
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-3 flex flex-col justify-between" style={{ minHeight: '90px' }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={18} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 leading-none">{items.filter(i => i.status === 'reviewed').length}</h3>
              <p className="text-[9px] font-bold text-slate-700 uppercase tracking-wide mt-1">REVIEWED</p>
            </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] font-bold text-[#16a34a]">Action taken</p>
          </div>
        </div>

        {/* Card 4: Pending */}
        <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-xl p-3 flex flex-col justify-between" style={{ minHeight: '90px' }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
              <Clock size={18} className="text-rose-500" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 leading-none">{items.filter(i => i.status !== 'reviewed').length}</h3>
              <p className="text-[9px] font-bold text-slate-700 uppercase tracking-wide mt-1">PENDING</p>
            </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] font-bold text-[#e11d48]">Action required</p>
          </div>
        </div>

      </div>

      {/* Filters Bar like screenshot */}
      <div className="flex flex-col sm:flex-row items-center gap-2 mb-4 w-full">
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Search feedbacks..."
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <select className="border border-slate-300 rounded py-1.5 px-3 text-xs w-full sm:w-auto bg-white focus:outline-none">
          <option>Status</option>
          <option>Pending</option>
          <option>Reviewed</option>
        </select>
        <select className="border border-slate-300 rounded py-1.5 px-3 text-xs w-full sm:w-auto bg-white focus:outline-none">
          <option>Rating</option>
          <option>4 Stars & Up</option>
          <option>Below 4 Stars</option>
        </select>
        <div className="flex-1"></div>
        <button className="px-3 py-1.5 bg-[#ef4444] text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-sm hover:bg-red-600 transition-colors">
          <RefreshCw size={12} /> Reset
        </button>
        <button className="px-3 py-1.5 bg-[#10b981] text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-sm hover:bg-emerald-600 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#0f2c41] text-white shadow-sm sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2.5 font-bold tracking-wide w-8 text-center">
                  <input type="checkbox" className="w-3 h-3 rounded-sm accent-emerald-500" />
                </th>
                <th className="px-3 py-2.5 font-bold tracking-wide">Company Name</th>
                <th className="px-3 py-2.5 font-bold tracking-wide">Reg ID</th>
                <th className="px-3 py-2.5 font-bold tracking-wide">Contact Info</th>
                <th className="px-3 py-2.5 font-bold tracking-wide text-center">Stall</th>
                <th className="px-3 py-2.5 font-bold tracking-wide text-center">Rating</th>
                <th className="px-3 py-2.5 font-bold tracking-wide text-center">Status</th>
                <th className="px-3 py-2.5 font-bold tracking-wide text-center">Date</th>
                <th className="px-3 py-2.5 font-bold tracking-wide text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">Loading...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">No feedback submitted yet.</td>
                </tr>
              ) : (
                items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(item => (
                  <tr 
                    key={item._id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/mobile-feedback/${item._id}`)}
                  >
                    <td className="px-3 py-3 text-center">
                      <input type="checkbox" onClick={(e) => e.stopPropagation()} className="w-3 h-3 rounded-sm accent-emerald-500" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-bold text-[12px] hover:text-emerald-600 hover:underline" style={{ color: '#093C5D' }}>{item.companyName || item.exhibitorName}</div>
                    </td>
                    <td className="px-3 py-3 text-[11px] text-slate-600 font-bold">{item.registrationId}</td>
                    <td className="px-3 py-3">
                      <div className="text-[11px] font-bold text-slate-800">{item.responses?.contactPerson || item.contactPerson || "-"}</div>
                      <div className="text-[9px] text-slate-500 font-medium mt-0.5">{item.mobileNumber || item.emailId || ""}</div>
                    </td>
                    <td className="px-3 py-3 text-center text-[11px] font-bold text-slate-700">{item.stallNumber || "-"}</td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-700 font-bold text-[11px]">
                        <Star size={14} className={(item.responses?.overallRating === "Excellent" || item.responses?.overallRating === "Very Good") ? "fill-amber-500 text-amber-500" : "text-slate-300"} />
                        {item.responses?.overallRating || "-"}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-bold text-[9px] capitalize ${item.status === "reviewed" ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-amber-700 bg-amber-50 border border-amber-200"}`}>
                        {item.status || "new"}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        {item.createdAt ? (
                          <>
                            <span className="text-[10px] font-bold" style={{ color: '#111844' }}>
                              {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).format(new Date(item.createdAt))}
                            </span>
                            <span className="text-[9px] text-slate-500 font-medium">
                              {new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(item.createdAt))}
                            </span>
                          </>
                        ) : "-"}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/mobile-feedback/${item._id}`); }} 
                        className="inline-flex items-center justify-center px-3 py-1.5 bg-[#124170] hover:bg-[#092643] text-white text-[10px] font-bold rounded transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination like screenshot */}
        {items.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-white border-t border-slate-200">
            <div className="text-[12px] font-bold text-slate-800">
              Showing <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, items.length)}</span> of {items.length} feedbacks
            </div>
            
            <div className="flex items-center gap-1 my-2 sm:my-0">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                &laquo;
              </button>
              
              {Array.from({ length: Math.ceil(items.length / itemsPerPage) }, (_, i) => i + 1)
                .filter(p => p === 1 || p === Math.ceil(items.length / itemsPerPage) || Math.abs(currentPage - p) <= 1)
                .map((p, i, arr) => (
                  <div key={p} className="flex items-center">
                    {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-slate-400">...</span>}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                        currentPage === p 
                          ? 'bg-[#006b5a] text-white' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  </div>
                ))}

              <button 
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(items.length / itemsPerPage), p + 1))}
                disabled={currentPage === Math.ceil(items.length / itemsPerPage)}
                className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                &raquo;
              </button>
            </div>

            <div className="flex items-center gap-2 text-[12px] font-bold text-slate-800">
              Rows: 
              <select className="border border-slate-300 rounded px-2 py-0.5 focus:outline-none bg-white">
                <option>15</option>
                <option>30</option>
                <option>50</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
