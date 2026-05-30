import { useState, useEffect } from "react";
import { X, Search, MessageSquare, Send, Check, RefreshCw, Calendar, User, Phone } from "lucide-react";
import api from "../../lib/api";

export default function WhatsAppSenderModal({ onClose }) {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [modalMode, setModalMode] = useState("send"); // 'send' | 'history'
  const [loading, setLoading] = useState(false);

  // Sending states
  const [selectedClient, setSelectedClient] = useState(null);
  const [msgTitle, setMsgTitle] = useState("IHWE Broadcast");
  const [msgText, setMsgText] = useState("");
  const [sendState, setSendState] = useState("select"); // 'select' | 'compose' | 'sending' | 'done'

  // History states
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const LOGS_PER_PAGE = 5;

  const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo") || "{}");
  const adminUsername = adminInfo.fullName || adminInfo.username || "Admin";
  const adminRole = adminInfo.role || "";
  const isSuperAdmin = adminRole === "super-admin";

  // 1. Fetch leads on mount
  useEffect(() => {
    setLoading(true);
    api.get("/api/companies")
      .then(res => {
        if (res.data) {
          // Scope leads based on relationship manager
          const u = adminInfo.username?.toLowerCase() || "";
          const scoped = isSuperAdmin
            ? res.data
            : res.data.filter(c => c.forwardTo?.toLowerCase() === u || c.added_by?.toLowerCase() === u);
          setCompanies(scoped);
        }
      })
      .catch(err => console.error("Error loading leads for WhatsApp:", err))
      .finally(() => setLoading(false));
  }, []);

  // Lock background scroll when modal is open
  useEffect(() => {
    document.documentElement.classList.add("modal-open");
    return () => {
      document.documentElement.classList.remove("modal-open");
    };
  }, []);

  // 2. Fetch history records
  const fetchHistory = () => {
    setHistoryLoading(true);
    api.get("/api/whatsapp")
      .then(res => {
        if (res.data && res.data.data) {
          // Scope history logs: RMs see only their logged messages, Super Admin sees all
          const logs = res.data.data;
          const u = adminUsername.toLowerCase();
          const scopedLogs = isSuperAdmin
            ? logs
            : logs.filter(log => log.user?.toLowerCase() === u);
          setHistoryLogs(scopedLogs);
        }
      })
      .catch(err => console.error("Error fetching WhatsApp history:", err))
      .finally(() => setHistoryLoading(false));
  };

  useEffect(() => {
    if (modalMode === "history") {
      fetchHistory();
    }
  }, [modalMode]);

  // Helper date formatting
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + " " +
      d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const getFiltered = () => {
    return companies.filter(c => {
      const matchesSearch = c.companyName.toLowerCase().includes(search.toLowerCase()) ||
        `${c.contacts?.[0]?.firstName || ""} ${c.contacts?.[0]?.surname || ""}`.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (activeTab === "All") return true;

      const status = c.companyStatus?.toLowerCase() || "";
      if (activeTab === "Hot") return status === "est./pi sent";
      if (activeTab === "Warm") return ["warm client", "follow-up call", "sent details"].includes(status);
      if (activeTab === "Cold") return ["cold client", "not interested"].includes(status);
      if (activeTab === "New") return status === "new lead";
      if (activeTab === "Converted") return ["adc. recd", "inv. req.", "under pymt followups", "confirmed / paid", "paid", "advance-paid", "confirmed"].includes(status);
      return true;
    });
  };

  const selectClient = (client) => {
    setSelectedClient(client);
    setMsgText(`Namo Gange Namaskar!\n\nDear ${client.contacts?.[0]?.firstName || 'Sir/Madam'},\n\nThis is ${adminUsername} from the International Health & Wellness Expo (IHWE) 2026. We are reaching out regarding...`);
    setSendState("compose");
  };

  const sendWhatsApp = async () => {
    if (!msgText.trim()) return;
    setSendState("sending");

    try {
      const mobile = selectedClient.contacts?.[0]?.mobile || "";
      const payload = {
        compny_id: selectedClient._id,
        phone_no: mobile,
        whtsapp_title: msgTitle.trim() || "CRM Broadcast",
        whtsapp_desc: msgText.trim(),
        sent_files_img: "none",
        user: adminUsername
      };

      const res = await api.post("/api/whatsapp", payload);

      if (res.data.success) {
        setSendState("done");
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error(res.data.message || "Failed to send message.");
      }
    } catch (err) {
      alert("Error sending WhatsApp: " + err.message);
      setSendState("compose");
    }
  };

  const filteredList = getFiltered();

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
      style={{ paddingTop: '72px', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200"
        style={{ height: '100%', maxHeight: '640px' }}
        onClick={e => e.stopPropagation()}
      >

        {/* Dynamic Green Header */}
        <div className="bg-[#128c7e] px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider leading-none">WhatsApp Messenger</h3>
            <p className="text-[9px] text-emerald-100/80 font-bold uppercase mt-1 leading-none">Powered by OPUS API</p>
          </div>

          {/* Header Mode Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => { setModalMode("send"); setSendState("select"); }}
              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition ${modalMode === "send" ? "bg-white text-[#128c7e] shadow-sm" : "bg-[#0f7166] text-white/80 hover:bg-[#0c5950]"
                }`}
            >
              Send Message
            </button>
            <button
              onClick={() => setModalMode("history")}
              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition ${modalMode === "history" ? "bg-white text-[#128c7e] shadow-sm" : "bg-[#0f7166] text-white/80 hover:bg-[#0c5950]"
                }`}
            >
              Logs History
            </button>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition ml-2">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* --- MODE 1: SEND MESSAGE --- */}
        {modalMode === "send" && (
          <div className="flex-grow flex flex-col overflow-hidden bg-slate-50/50">

            {/* Phase A: Client Selection */}
            {sendState === "select" && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="px-5 py-3.5 bg-white border-b border-slate-100 space-y-3 shrink-0">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search by company or client name..."
                      className="w-full pl-9 pr-4 h-9.5 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#128c7e] bg-slate-50 focus:bg-white transition-all shadow-inner"
                    />
                  </div>

                  {/* Category tabs */}
                  <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                    {["All", "New", "Hot", "Warm", "Cold", "Converted"].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition ${activeTab === tab
                            ? 'bg-[#128c7e] text-white shadow-sm'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200/70'
                          }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Client List */}
                <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
                  {loading ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="w-8 h-8 border-3 border-[#128c7e] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : filteredList.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 font-bold uppercase tracking-wider text-[11px] italic">
                      No match found
                    </div>
                  ) : (
                    filteredList.map(c => {
                      const hasContact = c.contacts && c.contacts[0];
                      const cName = `${hasContact?.firstName || "Client"} ${hasContact?.surname || ""}`.trim();
                      const cMobile = hasContact?.mobile || c.email;
                      const cStatus = c.companyStatus || "New Lead";

                      let pillClass = "bg-slate-100 text-slate-600 border-slate-200";
                      if (cStatus.toLowerCase() === "est./pi sent") pillClass = "bg-rose-50 text-rose-600 border-rose-100";
                      else if (["warm client", "follow-up call", "sent details"].includes(cStatus.toLowerCase())) pillClass = "bg-amber-50 text-amber-700 border-amber-100";
                      else if (cStatus.toLowerCase() === "new lead") pillClass = "bg-blue-50 text-blue-600 border-blue-100";
                      else if (["adc. recd", "inv. req.", "under pymt followups", "confirmed / paid", "paid", "advance-paid", "confirmed"].includes(cStatus.toLowerCase())) pillClass = "bg-emerald-50 text-emerald-700 border-emerald-100";

                      return (
                        <div key={c._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 shadow-sm hover:shadow transition duration-200">
                          <div className="min-w-0 flex-1 pl-1">
                            <div className="flex items-center gap-2 mb-1 leading-none">
                              <h4 className="text-xs font-black text-slate-800 truncate">{c.companyName}</h4>
                              <span className={`text-[6.5px] px-1 py-0.5 border font-black uppercase rounded-sm leading-none flex-shrink-0 ${pillClass}`}>
                                {cStatus === "est./pi sent" ? "Hot" : cStatus}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-extrabold truncate">
                              {cName} <span className="text-slate-300 font-bold font-mono">|</span> <span className="font-medium font-mono text-[9.5px] text-slate-400">{cMobile}</span>
                            </p>
                          </div>

                          <button
                            onClick={() => selectClient(c)}
                            className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center shadow-sm border border-emerald-100/60 transition"
                          >
                            <Send size={13} className="stroke-[2.5] ml-0.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Phase B: Compose Broadcast Message */}
            {sendState === "compose" && (
              <div className="flex-1 flex flex-col p-6 overflow-hidden justify-between">
                <div className="space-y-4 overflow-y-auto flex-1 pr-1 scrollbar-none">
                  {/* Selected Client header details */}
                  <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-lg p-4 flex items-center justify-between shadow-sm">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Recipient Info</h4>
                      <p className="text-[10px] text-emerald-800 font-extrabold uppercase mt-0.5">{selectedClient?.companyName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[8.5px] font-bold text-slate-400 block uppercase leading-none">Contact</span>
                      <span className="text-[10px] font-black text-slate-700 block mt-1 leading-none font-mono">
                        {selectedClient?.contacts?.[0]?.firstName} ({selectedClient?.contacts?.[0]?.mobile})
                      </span>
                    </div>
                  </div>

                  {/* Broadcast Template Title */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black uppercase text-slate-500 tracking-wider">Broadcast Title / Reason</label>
                    <input
                      type="text"
                      value={msgTitle}
                      onChange={e => setMsgTitle(e.target.value)}
                      placeholder="e.g. IHWE Invitation, Brochure Share..."
                      className="w-full text-xs h-9.5 px-3 border border-slate-200 rounded-xl outline-none focus:border-[#128c7e] bg-white transition shadow-sm font-bold"
                    />
                  </div>

                  {/* Message Input Textarea */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black uppercase text-slate-500 tracking-wider">WhatsApp Message Text</label>
                    <textarea
                      value={msgText}
                      onChange={e => setMsgText(e.target.value)}
                      placeholder="Write message here..."
                      rows={5}
                      className="w-full text-xs p-3.5 border border-slate-200 rounded-lg outline-none focus:border-[#128c7e] bg-white transition shadow-sm resize-none"
                    />
                  </div>

                  {/* WhatsApp Custom Interactive Chat Bubble Preview! */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">Interactive Live WhatsApp Preview</label>
                    <div className="bg-[#efeae2] border border-slate-200/50 rounded-lg p-4 relative overflow-hidden shadow-inner flex flex-col justify-end min-h-[100px]">
                      {/* WhatsApp green header mock */}
                      <div className="absolute top-0 inset-x-0 h-1 bg-[#075e54] opacity-80" />

                      <div className="self-end bg-[#d9fdd3] text-slate-800 text-[11px] font-semibold leading-relaxed px-3.5 py-2 rounded-lg rounded-tr-none shadow-sm max-w-[85%] whitespace-pre-wrap relative border border-emerald-100/50">
                        {msgText || <span className="text-slate-400 italic">No content written yet...</span>}
                        <div className="text-[8px] font-mono text-slate-400 text-right mt-1.5 leading-none">
                          {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action triggers */}
                <div className="flex gap-3 border-t border-slate-200/60 pt-4 shrink-0">
                  <button
                    onClick={() => setSendState("select")}
                    className="flex-1 h-9 rounded-xl border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-wider hover:bg-slate-100 transition"
                  >
                    Change Lead
                  </button>
                  <button
                    onClick={sendWhatsApp}
                    disabled={!msgText.trim()}
                    className="flex-2 h-9 rounded-xl bg-[#128c7e] hover:bg-[#0c5950] disabled:opacity-40 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[#128c7e]/10 transition duration-200"
                  >
                    <Send size={12} /> Send Live WhatsApp Message
                  </button>
                </div>
              </div>
            )}

            {/* Phase C: Sending API loader */}
            {sendState === "sending" && (
              <div className="flex-1 flex flex-col items-center justify-center bg-white p-8">
                <div className="w-10 h-10 border-4 border-[#128c7e] border-t-transparent rounded-full animate-spin mb-4" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 leading-none">Sending Broadcast via OPUS</h4>
                <p className="text-[8.5px] text-slate-400 font-extrabold uppercase mt-1 leading-none tracking-wide animate-pulse">Routing through cellular gate</p>
              </div>
            )}

            {/* Phase D: Sending Success Overlay */}
            {sendState === "done" && (
              <div className="flex-grow flex flex-col items-center justify-center bg-white p-8 animate-in zoom-in-95 duration-300">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center mb-4 shadow-sm">
                  <Check size={22} className="stroke-[3]" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 leading-none">WhatsApp Sent Successfully</h4>
                <p className="text-[8.5px] text-slate-400 font-extrabold uppercase mt-1 leading-none tracking-wide">Saved in CRM Message History Logs</p>
              </div>
            )}

          </div>
        )}

        {/* --- MODE 2: VIEW LOGS HISTORY --- */}
        {modalMode === "history" && (() => {
          const totalPages = Math.ceil(historyLogs.length / LOGS_PER_PAGE);
          const paginatedLogs = historyLogs.slice(
            (historyPage - 1) * LOGS_PER_PAGE,
            historyPage * LOGS_PER_PAGE
          );
          return (
            <div className="flex-grow flex flex-col overflow-hidden bg-slate-50/50 p-5">
              {/* Header row */}
              <div className="flex justify-between items-center mb-3 shrink-0">
                <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">
                  Sent Messages Feed
                  {historyLogs.length > 0 && (
                    <span className="ml-2 text-[#128c7e]">({historyLogs.length} total)</span>
                  )}
                </span>
                <button
                  onClick={fetchHistory}
                  className="flex items-center gap-1 text-[8.5px] font-black uppercase text-[#128c7e]"
                >
                  <RefreshCw size={9} className={historyLoading ? "animate-spin" : ""} /> Refresh
                </button>
              </div>

              {/* Log List */}
              <div className="flex-grow overflow-y-auto space-y-3 pr-1 scrollbar-none">
                {historyLoading && historyLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-8 h-8 border-3 border-[#128c7e] border-t-transparent rounded-full animate-spin mb-3" />
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Loading Logs...</span>
                  </div>
                ) : historyLogs.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-lg border border-slate-100 shadow-sm">
                    <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-2 stroke-[1.5]" />
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">No Sent Messages Found</h4>
                    <p className="text-[8.5px] text-slate-300 font-extrabold uppercase mt-0.5">Your sent broadcast logs show here</p>
                  </div>
                ) : (
                  paginatedLogs.map(log => (
                    <div key={log._id} className="bg-white rounded-lg border border-slate-100/80 p-3.5 shadow-sm space-y-2">
                      <div className="flex items-center justify-between leading-none">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8.5px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 font-black uppercase">
                            {log.whtsapp_title}
                          </span>
                        </div>
                        <span className="text-[8px] font-bold text-slate-400 font-mono">
                          {formatDate(log.added)}
                        </span>
                      </div>

                      <div className="text-[11px] leading-relaxed text-slate-600 bg-slate-50 border border-slate-100 p-2.5 rounded-xl whitespace-pre-wrap font-medium">
                        {log.whtsapp_desc}
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 border-t border-slate-50 pt-2 leading-none">
                        <div className="flex items-center gap-1">
                          <Phone size={10} className="text-slate-400" />
                          <span className="font-mono text-slate-500">{log.phone_no}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User size={10} className="text-slate-400" />
                          <span>Sent By: <strong className="text-slate-500 font-black uppercase">{log.user || "System"}</strong></span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="shrink-0 flex items-center justify-between pt-3 border-t border-slate-100 mt-3">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">
                    Page {historyPage} of {totalPages}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                      disabled={historyPage === 1}
                      className="h-7 px-3 rounded-lg border border-slate-200 text-[9px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      ← Prev
                    </button>

                    {/* Page number pills */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                      <button
                        key={pg}
                        onClick={() => setHistoryPage(pg)}
                        className={`w-7 h-7 rounded-lg text-[9px] font-black transition ${
                          pg === historyPage
                            ? "bg-[#128c7e] text-white shadow-sm"
                            : "border border-slate-200 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {pg}
                      </button>
                    ))}

                    <button
                      onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                      disabled={historyPage === totalPages}
                      className="h-7 px-3 rounded-lg border border-slate-200 text-[9px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

      </div>
    </div>
  );
}

