import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Clock, Phone, User, Smartphone, X, ExternalLink, ChevronUp } from "lucide-react";
import api from "../lib/api";

const getReminderDateTime = (item) => {
  if (!item) return null;

  const parseAny = (dateStr, timeStr = "") => {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;

    let fullStr = String(dateStr).trim();
    if (timeStr) fullStr += " " + String(timeStr).trim();

    // Direct Date parse
    let d = new Date(fullStr);
    if (!isNaN(d.getTime())) return d;

    // Try hyphens to slashes
    let altStr = fullStr.replace(/-/g, "/");
    d = new Date(altStr);
    if (!isNaN(d.getTime())) return d;

    // Manual regex parse for DD/MM/YYYY or DD-MM-YYYY with HH:mm:ss am/pm
    try {
      const dMatch = fullStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
      const tMatch = fullStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i);

      if (dMatch) {
        const day = parseInt(dMatch[1], 10);
        const month = parseInt(dMatch[2], 10) - 1; // 0-indexed month
        const year = parseInt(dMatch[3], 10);

        let hours = 0;
        let minutes = 0;
        let seconds = 0;

        if (tMatch) {
          hours = parseInt(tMatch[1], 10);
          minutes = parseInt(tMatch[2], 10);
          if (tMatch[3]) seconds = parseInt(tMatch[3], 10);
          const ampm = tMatch[4] ? tMatch[4].toLowerCase() : null;
          if (ampm === "pm" && hours < 12) hours += 12;
          if (ampm === "am" && hours === 12) hours = 0;
        }

        const parsed = new Date(year, month, day, hours, minutes, seconds);
        if (!isNaN(parsed.getTime())) return parsed;
      }
    } catch (e) {}

    return null;
  };

  return parseAny(item.date, item.time) || parseAny(item.followUpDate);
};

export default function GlobalReminderPopup() {
  const navigate = useNavigate();
  const [dueReminders, setDueReminders] = useState([]);
  const [currentReminder, setCurrentReminder] = useState(null);
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);

  // Snoozed map stored in localStorage: { [reminderId]: snoozedUntilTimestamp }
  const [snoozedMap, setSnoozedMap] = useState(() => {
    try {
      const saved = localStorage.getItem("snoozed_reminders_map");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {}
  };

  const checkReminders = async () => {
    try {
      const res = await api.get("/api/crm-follow-ups");
      const list = res.data?.data || res.data || [];

      const now = new Date().getTime();
      const tenMinutesMs = 10 * 60 * 1000;
      const twentyFourHoursMs = 24 * 60 * 60 * 1000;

      const upcoming = list.filter((item) => {
        // Skip completed reminders
        if (item.status === "Completed") return false;
        
        const rDate = getReminderDateTime(item);
        if (!rDate) return false;
        const itemTime = rDate.getTime();

        const id = item.id || item._id;

        // Check if currently snoozed
        const snoozedUntil = snoozedMap[id];
        if (snoozedUntil && now < snoozedUntil) {
          return false; // Snooze duration not expired yet
        }

        const diff = itemTime - now;

        // TRIGGER CONDITION:
        // Remaining time <= 10 mins (e.g. 10m, 8m, 5m, 2m, 0m) AND overdue by up to 24 hrs
        const isDueSoonOrOverdue = diff <= tenMinutesMs && diff >= -twentyFourHoursMs;

        return isDueSoonOrOverdue;
      });

      setDueReminders(upcoming);

      if (upcoming.length > 0) {
        const first = upcoming[0];
        const firstId = first.id || first._id;
        const currentId = currentReminder ? (currentReminder.id || currentReminder._id) : null;

        if (!currentReminder || currentId !== firstId) {
          setCurrentReminder(first);
          playNotificationSound();
        }
      } else {
        setCurrentReminder(null);
      }
    } catch (error) {
      console.error("Error checking global reminders:", error);
    }
  };

  useEffect(() => {
    checkReminders();
    const interval = setInterval(checkReminders, 3000); // Check every 3 seconds for immediate response
    return () => clearInterval(interval);
  }, [snoozedMap]);

  const applyCustomSnooze = (minutes) => {
    if (!currentReminder) return;
    const id = currentReminder.id || currentReminder._id;
    const snoozedUntil = new Date().getTime() + minutes * 60 * 1000;

    const newMap = { ...snoozedMap, [id]: snoozedUntil };
    setSnoozedMap(newMap);
    try {
      localStorage.setItem("snoozed_reminders_map", JSON.stringify(newMap));
    } catch (e) {}

    setShowSnoozeMenu(false);
    
    // Switch to next reminder or close
    const remaining = dueReminders.filter((r) => (r.id || r._id) !== id);
    if (remaining.length > 0) {
      setCurrentReminder(remaining[0]);
      playNotificationSound();
    } else {
      setCurrentReminder(null);
    }
  };

  // Dismissing default = Re-alerts in 1 Minute!
  const handleDismiss = (id) => {
    applyCustomSnooze(1);
  };

  if (!currentReminder) return null;

  const getTimeLabel = () => {
    const rDate = getReminderDateTime(currentReminder);
    if (!rDate) return "";
    const diffMs = rDate.getTime() - new Date().getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins > 0) {
      return `Scheduled in ${diffMins} min${diffMins > 1 ? "s" : ""}`;
    } else if (diffMins === 0) {
      return "Due right now!";
    } else {
      return `Overdue by ${Math.abs(diffMins)} min${Math.abs(diffMins) > 1 ? "s" : ""}`;
    }
  };

  const snoozeOptions = [
    { label: "1 Minute", mins: 1 },
    { label: "5 Minutes", mins: 5 },
    { label: "10 Minutes", mins: 10 },
    { label: "15 Minutes", mins: 15 },
    { label: "30 Minutes", mins: 30 },
    { label: "1 Hour", mins: 60 },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-[99999] max-w-md w-full p-1 animate-bounce-short">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-red-500/80 overflow-hidden transform transition-all text-[#15173D]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-600 px-4 py-3 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
                <Bell size={18} className="animate-wiggle" />
              </div>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider leading-none flex items-center gap-1.5">
                <span>Follow-Up Reminder Alert</span>
              </h4>
              <p className="text-[10px] font-semibold text-yellow-300 mt-1 flex items-center gap-1">
                <Clock size={11} className="text-yellow-300" />
                <span>{getTimeLabel()}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDismiss(currentReminder.id || currentReminder._id)}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Re-alert in 1 minute"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3 bg-slate-50/60 text-[11px]" style={{ fontFamily: 'Inter, sans-serif' }}>
          {/* Company Name */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[9px] font-medium text-black uppercase tracking-wider block">Company Name</span>
            <div className="text-xs font-semibold mt-0.5 truncate" style={{ color: '#133458' }}>
              {currentReminder.company}
            </div>
            {currentReminder.industry && (
              <span className="inline-block text-[9px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded mt-1 border border-rose-100">
                {currentReminder.industry}
              </span>
            )}
          </div>

          {/* Contact Details & Action Grid */}
          <div className="grid grid-cols-2 gap-2 text-slate-700">
            {/* Contact */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[9px] font-semibold text-black uppercase tracking-wider block">Contact</span>
              <div className="font-bold text-slate-800 flex items-center gap-1.5 truncate">
                <User size={11} className="text-emerald-600 shrink-0" />
                <span className="truncate">{currentReminder.leadName || "N/A"}</span>
              </div>
              <div className="font-semibold text-blue-600 flex items-center gap-1.5 text-[10px]">
                <Smartphone size={11} className="text-blue-500 shrink-0" />
                <span>{currentReminder.mobile || "N/A"}</span>
              </div>
            </div>

            {/* Next Action & Forward To */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[9px] font-semibold text-black uppercase tracking-wider block">Next Action</span>
              <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-extrabold border border-emerald-200">
                <Phone size={10} /> {currentReminder.nextAction || currentReminder.type || "Call"}
              </div>
              {currentReminder.assignedTo && (
                <div className="text-[9.5px] font-bold text-red-600 pt-0.5">
                  Forward To: {currentReminder.assignedTo}
                </div>
              )}
            </div>
          </div>

          {/* Remark / Notes */}
          {currentReminder.lastRemark && (
            <div className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80 space-y-1">
              <span className="text-[9px] font-extrabold text-amber-800 uppercase tracking-wider block">Follow-Up Note</span>
              <p className="text-[10.5px] font-semibold text-slate-800 leading-snug line-clamp-2">
                {currentReminder.lastRemark}
              </p>
            </div>
          )}
        </div>

        {/* Custom Snooze Selector Drawer */}
        {showSnoozeMenu && (
          <div className="p-3 bg-slate-100 border-t border-slate-200 animate-fadeIn space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Snooze Alert Until:
              </span>
              <button
                onClick={() => setShowSnoozeMenu(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {snoozeOptions.map((opt) => (
                <button
                  key={opt.mins}
                  onClick={() => applyCustomSnooze(opt.mins)}
                  className="py-1.5 px-2 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-[10px] rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors shadow-2xs text-center"
                >
                  + {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2 relative">
          <button
            onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
            className={`px-3 py-1.5 text-[10.5px] font-bold rounded-lg transition-colors border flex items-center gap-1 ${
              showSnoozeMenu
                ? "bg-amber-100 text-amber-800 border-amber-300"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
            }`}
          >
            <span>Snooze</span>
            <ChevronUp size={12} className={`transition-transform ${showSnoozeMenu ? "rotate-180" : ""}`} />
          </button>

          <button
            onClick={() => {
              applyCustomSnooze(1);
              navigate(`/client-overview/${currentReminder.companyId || currentReminder.id}`);
            }}
            className="flex-1 py-1.5 px-3 text-white text-[10.5px] font-extrabold rounded-lg transition-all duration-200 hover:opacity-90 shadow-md flex items-center justify-center gap-1.5"
            style={{ backgroundColor: '#0A2947' }}
          >
            <span>View Follow-Up Lead</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
