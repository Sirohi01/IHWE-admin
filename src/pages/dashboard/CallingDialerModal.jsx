import { useState, useEffect, useRef } from "react";
import { X, Search, Phone, PhoneOff, Mic, MicOff, Volume2, Save, Check, MessageCircle } from "lucide-react";
import api from "../../lib/api";

export default function CallingDialerModal({ onClose, onCallLogged }) {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(false);

  // Calling States: 'select' | 'calling' | 'connected' | 'summary' | 'saving' | 'done'
  const [callState, setCallState] = useState("select");
  const [selectedClient, setSelectedClient] = useState(null);

  // Call Metrics
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [notes, setNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");

  // Media Recording & AudioContext references
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Audio Visualizer states
  const [audioLevel, setAudioLevel] = useState(0);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo") || "{}");
  const adminId = adminInfo._id || adminInfo.id || "admin";
  const adminName = adminInfo.fullName || adminInfo.username || "Admin";
  const adminRole = adminInfo.role || "";
  const isSuperAdmin = adminRole === "super-admin";

  // 1. Fetch initial companies on mount
  useEffect(() => {
    setLoading(true);
    api.get("/api/companies")
      .then(res => {
        if (res.data) {
          // Scope leads based on logged-in user unless super admin
          const u = adminInfo.username?.toLowerCase() || "";
          const scoped = isSuperAdmin
            ? res.data
            : res.data.filter(c => c.forwardTo?.toLowerCase() === u || c.added_by?.toLowerCase() === u);
          setCompanies(scoped);
        }
      })
      .catch(err => console.error("Error loading leads for calling:", err))
      .finally(() => setLoading(false));
  }, []);

  // Lock background scroll when modal is open
  useEffect(() => {
    document.documentElement.classList.add("modal-open");
    return () => {
      document.documentElement.classList.remove("modal-open");
    };
  }, []);

  // 2. Format timer string
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const startCall = (client) => {
    setSelectedClient(client);
    setNewStatus(client.companyStatus || "New Lead");
    setCallState("calling");
    setDuration(0);
    audioChunksRef.current = [];

    // ─── Launch Browser Native Phone Dialer ────────────────────────────────────
    const mobile = client.contacts?.[0]?.mobile || "";
    if (mobile) {
      try {
        const hasPlus = mobile.trim().startsWith("+");
        const cleanMobile = mobile.replace(/\D/g, ""); // remove non-digits
        // Do not force '91' prefix unless the user explicitly stored it, as local SIMs reject forced prefixes
        const dialUrl = `tel:${hasPlus ? '+' : ''}${cleanMobile}`;
        window.location.href = dialUrl;
      } catch (dialErr) {
        console.warn("Browser native dialer trigger failed:", dialErr);
      }
    }
  };

  // 3b. Manually connect call (triggered when user clicks 'Start Call & Recording')
  const connectCall = async () => {
    setCallState("connected");

    // Start Call Timer
    timerIntervalRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    // Request Mic Permission & Setup MediaRecorder
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup Real Web Audio Visualizer
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);

        source.connect(analyser);
        analyser.fftSize = 64; // Small fftSize for visual wave bars
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        const updateLevels = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          // Calculate average frequency level
          let total = 0;
          for (let i = 0; i < bufferLength; i++) {
            total += dataArray[i];
          }
          const average = total / bufferLength;
          setAudioLevel(average / 128); // Normalize to 0-2 scale
          animationFrameRef.current = requestAnimationFrame(updateLevels);
        };
        updateLevels();
      } catch (audioErr) {
        console.warn("Web Audio API not supported or blocked:", audioErr);
      }

      // Initialize MediaRecorder with robust mimeType fallback
      let options = { mimeType: "audio/webm" };
      if (typeof MediaRecorder.isTypeSupported === "function") {
        if (!MediaRecorder.isTypeSupported("audio/webm")) {
          options = { mimeType: "audio/ogg" };
        }
        if (!MediaRecorder.isTypeSupported("audio/ogg") && !MediaRecorder.isTypeSupported("audio/webm")) {
          options = {}; // browser default
        }
      } else {
        options = {}; // fallback
      }

      const recorder = new MediaRecorder(stream, options);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start(250); // Slice chunks every 250ms for stability
    } catch (err) {
      console.warn("Microphone access denied or failed. Simulated call will run without voice recording:", err);
    }
  };

  // 3c. Cancel dialing and return to selection
  const cancelCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => { });
    }
    setCallState("select");
    setSelectedClient(null);
  };

  const openWhatsApp = () => {
    if (!selectedClient) return;
    const mobile = selectedClient.contacts?.[0]?.mobile || "";
    const cleanMobile = mobile.replace(/\D/g, "");
    const phoneWithCode = cleanMobile.length === 10 ? '91' + cleanMobile : cleanMobile;
    window.open(`https://api.whatsapp.com/send?phone=${phoneWithCode}`, "_blank");
  };

  // 4. Hang up the call
  const hangUp = () => {
    clearInterval(timerIntervalRef.current);

    // Stop Microphone Recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => { });
    }

    setCallState("summary");
  };

  // 5. Save Call Log and Upload Audio
  const saveCallLog = async () => {
    setCallState("saving");

    try {
      const formData = new FormData();
      formData.append("callerId", adminId);
      formData.append("callerName", adminName);
      formData.append("companyId", selectedClient._id);
      formData.append("companyName", selectedClient.companyName);

      const clientNameText = `${selectedClient.contacts?.[0]?.firstName || "Client"} ${selectedClient.contacts?.[0]?.surname || ""}`.trim();
      formData.append("clientName", clientNameText);
      formData.append("mobile", selectedClient.contacts?.[0]?.mobile || selectedClient.email);
      formData.append("duration", duration);
      formData.append("companyStatus", selectedClient.companyStatus || "New Lead");
      formData.append("newStatus", newStatus);
      formData.append("notes", notes);

      // Attach audio Blob if recorded
      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        formData.append("audio", audioBlob, "recording.webm");
      }

      const res = await api.post("/api/calls/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setCallState("done");
        if (onCallLogged) onCallLogged();
        setTimeout(() => onClose(), 1500);
      } else {
        throw new Error(res.data.message || "Failed to save call log.");
      }
    } catch (err) {
      alert("Error saving call: " + err.message);
      setCallState("summary"); // revert
    }
  };

  // Helper: filter status tags
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

  const filteredList = getFiltered();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200" style={{ height: '520px' }}>

        {/* Dynamic header depending on state */}
        {callState === "select" && (
          <div className="bg-[#23471d] px-6 py-4 flex items-center justify-between text-white">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider leading-none">Select Client</h3>
              <p className="text-[9px] text-emerald-100/80 font-bold uppercase mt-1 leading-none">Instant Internet Calling</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Phase 1: Client Selection */}
        {callState === "select" && (
          <div className="flex flex-col flex-1 overflow-hidden bg-slate-50/50">
            {/* Search and Tabs */}
            <div className="px-5 py-3.5 bg-white border-b border-slate-100 space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by company or client name..."
                  className="w-full pl-9 pr-4 h-9.5 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#23471d] bg-slate-50 focus:bg-white transition-all shadow-inner"
                />
              </div>

              {/* Category tabs */}
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                {["All", "New", "Hot", "Warm", "Cold", "Converted"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition ${activeTab === tab
                      ? 'bg-[#23471d] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200/70'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Client Lists */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-8 h-8 border-3 border-[#23471d] border-t-transparent rounded-full animate-spin" />
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

                  // Status pill color
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
                        onClick={() => startCall(c)}
                        className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center shadow-sm border border-emerald-100/60 transition"
                      >
                        <Phone size={14} className="stroke-[2.5]" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Phase 2: Dialing / Ringing Screen */}
        {callState === "calling" && (
          <div className="flex-1 bg-slate-950 text-white flex flex-col justify-between p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)] animate-pulse" />

            <div className="text-center z-10 mt-6">
              <span className="text-[8.5px] px-2.5 py-0.5 rounded-full font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider animate-pulse">
                DIALING VIA PHONE LINK...
              </span>

              <h2 className="text-lg font-black mt-4 tracking-tight leading-tight">{selectedClient?.companyName}</h2>
              <p className="text-xs text-slate-400 font-extrabold mt-1">
                {selectedClient?.contacts?.[0]?.firstName} {selectedClient?.contacts?.[0]?.surname}
              </p>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5 tracking-wide">
                {selectedClient?.contacts?.[0]?.mobile || selectedClient?.email}
              </p>
            </div>

            {/* Dialing Pulsing Ring */}
            <div className="flex items-center justify-center py-4 z-10">
              <div className="relative flex items-center justify-center w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-amber-500/10 border border-amber-500/20 animate-ping" />
                <div className="absolute inset-2 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-xl">
                  <Phone size={24} className="text-amber-400 stroke-[2] animate-bounce" />
                </div>
              </div>
            </div>

            {/* Interactive instructions & actions */}
            <div className="z-10 flex flex-col items-center px-4 mb-4">
              <p className="text-[10px] text-slate-400 text-center font-semibold leading-relaxed mb-4">
                जैसे ही फोन लिंक पर कॉल कनेक्ट हो जाए या घंटी बजना शुरू हो, नीचे <span className="text-emerald-400 font-extrabold">"Start Call & Recording"</span> पर क्लिक करें!
              </p>

              <button
                onClick={connectCall}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition transform hover:scale-102 active:scale-98"
              >
                <Phone size={14} className="stroke-[2.5]" /> Start Call & Recording
              </button>

              <button
                onClick={cancelCall}
                className="text-[9px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-400 mt-3 transition"
              >
                Cancel Call
              </button>
            </div>
          </div>
        )}

        {/* Phase 3: Active Connected Call & Microphone Recording Screen */}
        {callState === "connected" && (
          <div className="flex-1 bg-slate-950 text-white flex flex-col justify-between p-8 relative overflow-hidden">
            {/* Visual background voice ripples */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(35,71,29,0.15)_0%,transparent_70%)] animate-pulse" />

            {/* Caller Top Details */}
            <div className="text-center z-10 mt-6">
              <span className="text-[8.5px] px-2.5 py-0.5 rounded-full font-black bg-[#23471d]/30 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                CONNECTED
              </span>

              <h2 className="text-lg font-black mt-4 tracking-tight leading-tight">{selectedClient?.companyName}</h2>
              <p className="text-xs text-slate-400 font-extrabold mt-1">
                {selectedClient?.contacts?.[0]?.firstName} {selectedClient?.contacts?.[0]?.surname}
              </p>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5 tracking-wide">
                {selectedClient?.contacts?.[0]?.mobile || selectedClient?.email}
              </p>
            </div>

            {/* Pulsing Visualizer & Wave Rings */}
            <div className="flex items-center justify-center py-6 z-10 relative">
              <div className="relative flex items-center justify-center w-28 h-28">
                {/* Visualizer Glowing Waves */}
                <div
                  className="absolute inset-0 rounded-full bg-[#23471d]/20 border border-[#23471d]/40 transition-transform duration-75"
                  style={{ transform: `scale(${1 + audioLevel * 0.4})` }}
                />
                <div
                  className="absolute inset-2 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl"
                />

                <div className="z-10 flex flex-col items-center justify-center">
                  <Phone size={26} className="text-emerald-400 stroke-[2]" />
                  <span className="text-xs font-black font-mono tracking-wider text-emerald-400/90 mt-2 leading-none">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Pulsing REC Recording Overlay */}
              <div className="absolute top-0 right-4 flex items-center gap-1 bg-red-950/40 text-red-500 border border-red-500/25 px-2 py-0.5 rounded-full backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                <span className="text-[8px] font-black uppercase tracking-wider font-mono">REC {formatTime(duration)}</span>
              </div>
            </div>

            {/* Custom Interactive Bouncing Audio Visualizer Bar */}
            <div className="h-6 flex items-center justify-center gap-0.5 z-10 w-full px-8">
              {Array.from({ length: 24 }).map((_, i) => {
                // Random dynamic scales multiplied by microphone input levels
                const randomMultiplier = 0.2 + Math.sin((i / 24) * Math.PI) * 0.8;
                const activeHeight = Math.max(4, 24 * audioLevel * randomMultiplier);
                return (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-emerald-500 transition-all duration-75"
                    style={{ height: `${activeHeight}px`, opacity: 0.85 }}
                  />
                );
              })}
            </div>

            {/* Dialer control keys */}
            <div className="flex items-center justify-center gap-8 z-10 mb-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-lg border transition ${isMuted
                  ? "bg-red-500 border-red-400 text-white"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                  }`}
              >
                {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              <button
                onClick={hangUp}
                className="w-14 h-14 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition transform hover:scale-105 active:scale-95"
              >
                <PhoneOff size={22} className="stroke-[2.5]" />
              </button>

              <button
                onClick={openWhatsApp}
                className="p-3 rounded-lg border bg-emerald-950/40 border-emerald-800 text-emerald-400 hover:bg-emerald-800 hover:text-white transition"
                title="Open WhatsApp Chat"
              >
                <MessageCircle size={16} className="stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* Phase 4: Post-Call Summary & Notes */}
        {callState === "summary" && (
          <div className="flex-1 flex flex-col justify-between bg-slate-50/50 p-6">
            <div className="space-y-4">
              {/* Call Stat details */}
              <div className="bg-white rounded-lg border border-slate-100 p-4 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-800 truncate uppercase tracking-wide">Call Summary</h4>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5">{selectedClient?.companyName}</p>
                </div>
                <div className="text-right">
                  <span className="text-[8.5px] font-bold text-slate-400 block uppercase leading-none">Duration</span>
                  <span className="text-[13px] font-black text-emerald-600 block mt-1 leading-none font-mono">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Status Update */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-black uppercase text-slate-500 tracking-wider">Update Lead Status</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full text-xs h-9.5 px-3 border border-slate-200 rounded-xl outline-none focus:border-[#23471d] bg-white transition shadow-sm font-bold"
                >
                  <option value="New Lead">New Lead</option>
                  <option value="Warm Client">Warm Lead</option>
                  <option value="Follow-Up Call">Follow-Up Call</option>
                  <option value="Sent Details">Sent Details</option>
                  <option value="Est./pi sent">Hot Lead (Est./PI Sent)</option>
                  <option value="Cold Client">Cold Lead</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Confirmed / Paid">Converted (Confirmed / Paid)</option>
                </select>
              </div>

              {/* Textarea Notes */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-black uppercase text-slate-500 tracking-wider">Call Notes / Comments</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Enter details of conversation... e.g. Client requested quotation tomorrow, very interested."
                  rows={4}
                  className="w-full text-xs p-3.5 border border-slate-200 rounded-lg outline-none focus:border-[#23471d] bg-white transition shadow-sm resize-none"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 border-t border-slate-200/60 pt-4">
              <button
                onClick={onClose}
                className="flex-1 h-9 rounded-xl border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-wider hover:bg-slate-100 transition"
              >
                Discard
              </button>
              <button
                onClick={saveCallLog}
                disabled={!notes.trim()}
                className="flex-2 h-9 rounded-xl bg-[#23471d] hover:bg-[#193315] disabled:opacity-40 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[#23471d]/10 transition duration-200"
              >
                <Save size={12} /> Save & Log Call
              </button>
            </div>
          </div>
        )}

        {/* Phase 5: Saving Loader State */}
        {callState === "saving" && (
          <div className="flex-1 flex flex-col items-center justify-center bg-white p-8">
            <div className="w-10 h-10 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin mb-4" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 leading-none">Uploading Call Recording</h4>
            <p className="text-[8.5px] text-slate-400 font-extrabold uppercase mt-1 leading-none tracking-wide animate-pulse">Saving logs on Cloudinary CDN</p>
          </div>
        )}

        {/* Phase 6: Completed Success State */}
        {callState === "done" && (
          <div className="flex-1 flex flex-col items-center justify-center bg-white p-8 animate-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center mb-4 shadow-sm">
              <Check size={22} className="stroke-[3]" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 leading-none">Call Saved Successfully</h4>
            <p className="text-[8.5px] text-slate-400 font-extrabold uppercase mt-1 leading-none tracking-wide">Call Logged in Activity Feed</p>
          </div>
        )}
      </div>
    </div>
  );
}

