import { useState, useEffect, useRef, Fragment } from "react";
import { Phone, Search, Play, Pause, Download, Calendar, User, ChevronDown, ChevronUp, Clock, RefreshCw } from "lucide-react";
import api from "../lib/api";
import CallingDialerModal from "./dashboard/CallingDialerModal";

function timeStr(d) {
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function dateStr(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function formatDuration(secs) {
  const mins = Math.floor(secs / 60);
  const remaining = secs % 60;
  if (mins === 0) return `${remaining}s`;
  return `${mins}m ${remaining}s`;
}

// Custom Audio Player component for each call log row
function CustomAudioPlayer({ url }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [url]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(err => console.error("Playback block:", err));
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const seekTime = parseFloat(e.target.value);
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const formatProgressTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!url) return <span className="text-[10px] text-slate-300 italic font-medium">No recording</span>;

  return (
    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 w-full max-w-[280px] shadow-inner">
      <audio ref={audioRef} src={url} preload="none" />
      
      <button 
        onClick={togglePlay}
        className="w-7 h-7 rounded-lg bg-[#23471d] hover:bg-[#1a3516] text-white flex items-center justify-center flex-shrink-0 transition shadow-sm"
      >
        {isPlaying ? <Pause size={12} className="fill-white" /> : <Play size={12} className="fill-white ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <input 
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-slate-200 accent-[#23471d] rounded-lg appearance-none cursor-pointer outline-none"
        />
        <div className="flex justify-between text-[8px] text-slate-400 font-bold font-mono mt-1 leading-none">
          <span>{formatProgressTime(currentTime)}</span>
          <span>{formatProgressTime(duration || 0)}</span>
        </div>
      </div>

      <a 
        href={url} 
        download="call-recording.webm" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="p-1.5 rounded-lg bg-slate-200/50 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition"
      >
        <Download size={11} />
      </a>
    </div>
  );
}

export default function CallHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [expandedRow, setExpandedRow] = useState(null);
  
  // Dialer Trigger
  const [redialClient, setRedialClient] = useState(null);

  const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo") || "{}");
  const adminUsername = adminInfo.fullName || adminInfo.username || "Admin";
  const adminRole = adminInfo.role || "";
  const isSuperAdmin = adminRole === "super-admin";

  const fetchHistory = () => {
    setLoading(true);
    api.get(`/api/calls/history?adminUsername=${encodeURIComponent(adminUsername)}&adminRole=${encodeURIComponent(adminRole)}`)
      .then(res => {
        if (res.data.success) {
          setLogs(res.data.data);
        }
      })
      .catch(err => console.error("Error loading call history:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getFilteredLogs = () => {
    return logs.filter(log => {
      const query = search.toLowerCase();
      const matchesSearch = log.companyName.toLowerCase().includes(query) || 
        log.clientName.toLowerCase().includes(query) || 
        log.mobile.includes(query) || 
        log.callerName.toLowerCase().includes(query);

      if (!matchesSearch) return false;
      if (selectedStatus === "All") return true;

      const status = log.companyStatus?.toLowerCase() || "";
      if (selectedStatus === "Hot") return status === "est./pi sent";
      if (selectedStatus === "Warm") return ["warm client", "follow-up call", "sent details"].includes(status);
      if (selectedStatus === "Cold") return ["cold client", "not interested"].includes(status);
      if (selectedStatus === "New") return status === "new lead";
      if (selectedStatus === "Converted") return ["adc. recd", "inv. req.", "under pymt followups", "confirmed / paid", "paid", "advance-paid", "confirmed"].includes(status);
      return true;
    });
  };

  const filteredLogs = getFilteredLogs();

  return (
    <div className="p-6 bg-slate-50/50 min-h-[calc(100vh-80px)] mt-6 border border-slate-100 rounded-3xl">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#23471d] text-white flex items-center justify-center shadow-lg shadow-[#23471d]/20">
            <Phone size={18} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 uppercase tracking-widest leading-none">Call Logs & History</h1>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-1 leading-none">Cloudinary Recording Panel</p>
          </div>
        </div>

        <button 
          onClick={fetchHistory}
          className="flex items-center gap-1.5 px-4 h-9 bg-white border border-slate-200 hover:border-slate-300 text-[10px] font-black uppercase text-slate-600 rounded-xl transition shadow-sm"
        >
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} /> Refresh Logs
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by company, client name, mobile or agent..."
            className="w-full pl-10 pr-4 h-10 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#23471d] bg-slate-50 focus:bg-white transition-all shadow-inner"
          />
        </div>

        <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {["All", "New", "Hot", "Warm", "Cold", "Converted"].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedStatus(tab)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition ${
                selectedStatus === tab 
                  ? 'bg-[#23471d] text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200/70'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider animate-pulse">Loading Logs...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-24">
            <Phone className="w-12 h-12 text-slate-200 mx-auto mb-3 stroke-[1.5]" />
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">No Call Logs Found</h4>
            <p className="text-[9px] text-slate-300 font-extrabold uppercase mt-1">Calling history will be shown here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[9.5px] text-slate-400 font-black uppercase tracking-wider select-none">
                  <th className="py-3.5 px-6">Client / Company</th>
                  <th className="py-3.5 px-4">Call Details</th>
                  {isSuperAdmin && <th className="py-3.5 px-4">Salesperson</th>}
                  <th className="py-3.5 px-4">Recording</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLogs.map(log => {
                  const isExpanded = expandedRow === log._id;
                  const cStatus = log.companyStatus || "New Lead";
                  
                  // Status tag colors
                  let pillClass = "bg-slate-100 text-slate-600 border-slate-200";
                  if (cStatus.toLowerCase() === "est./pi sent") pillClass = "bg-rose-50 text-rose-600 border-rose-100";
                  else if (["warm client", "follow-up call", "sent details"].includes(cStatus.toLowerCase())) pillClass = "bg-amber-50 text-amber-700 border-amber-100";
                  else if (cStatus.toLowerCase() === "new lead") pillClass = "bg-blue-50 text-blue-600 border-blue-100";
                  else if (["adc. recd", "inv. req.", "under pymt followups", "confirmed / paid", "paid", "advance-paid", "confirmed"].includes(cStatus.toLowerCase())) pillClass = "bg-emerald-50 text-emerald-700 border-emerald-100";

                  return (
                    <Fragment key={log._id}>
                      <tr className="hover:bg-slate-50/40 transition duration-150 group">
                        <td className="py-4 px-6 min-w-[200px]">
                          <div className="flex items-center gap-2 mb-1.5 leading-none">
                            <h4 className="font-extrabold text-slate-800 text-[12.5px] truncate max-w-[150px]">{log.companyName}</h4>
                            <span className={`text-[6.5px] px-1 py-0.5 border font-black uppercase rounded-sm leading-none flex-shrink-0 ${pillClass}`}>
                              {cStatus === "est./pi sent" ? "Hot" : cStatus}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-extrabold truncate">
                            {log.clientName} <span className="text-slate-200 font-light font-mono">|</span> <span className="font-medium font-mono text-[9px] text-slate-400">{log.mobile}</span>
                          </p>
                        </td>

                        <td className="py-4 px-4 min-w-[150px]">
                          <div className="flex items-center gap-1.5 font-bold text-slate-700">
                            <Calendar size={11} className="text-slate-400" />
                            <span>{dateStr(log.callDate)}</span>
                            <span className="text-slate-300 font-normal font-mono">|</span>
                            <span className="text-slate-500 text-[11px] font-medium font-mono">{timeStr(log.callDate)}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-[10px] font-black text-[#23471d] font-mono leading-none">
                            <Clock size={11} className="text-[#23471d]" />
                            <span>{formatDuration(log.duration)}</span>
                          </div>
                        </td>

                        {isSuperAdmin && (
                          <td className="py-4 px-4 font-bold text-slate-700">
                            <div className="flex items-center gap-1.5">
                              <User size={11} className="text-slate-400" />
                              <span>{log.callerName}</span>
                            </div>
                          </td>
                        )}

                        <td className="py-4 px-4 min-w-[300px]">
                          <CustomAudioPlayer url={log.recordingUrl} />
                        </td>

                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Collapse/Expand details */}
                            <button 
                              onClick={() => setExpandedRow(isExpanded ? null : log._id)}
                              className="p-2 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-500 transition shadow-sm"
                              title="View Call Notes"
                            >
                              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>

                            {/* Redial Action */}
                            <button 
                              onClick={() => setRedialClient({
                                _id: log.companyId,
                                companyName: log.companyName,
                                companyStatus: log.companyStatus,
                                contacts: [{ firstName: log.clientName.split(" ")[0], surname: log.clientName.split(" ").slice(1).join(" "), mobile: log.mobile }]
                              })}
                              className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-100/60 shadow-sm transition"
                              title="Redial Client"
                            >
                              <Phone size={12} className="stroke-[2.5]" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Notes details */}
                      {isExpanded && (
                        <tr className="bg-slate-50/20">
                          <td colSpan={isSuperAdmin ? 5 : 4} className="py-3 px-8 text-xs text-slate-600 border-b border-slate-100">
                            <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-white border border-slate-100 shadow-inner">
                              <h5 className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">Conversation Notes / Client Comments</h5>
                              <p className="leading-relaxed font-bold text-slate-700 italic">
                                {log.notes || <span className="text-slate-300 italic">No notes were written for this call.</span>}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Redial Overlay Dialer Modal */}
      {redialClient && (
        <CallingDialerModal 
          onClose={() => setRedialClient(null)}
          onCallLogged={fetchHistory}
        />
      )}
    </div>
  );
}
