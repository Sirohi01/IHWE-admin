import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Bell, Clock, Phone, User, Smartphone, X, ExternalLink, ChevronUp, CheckCircle2 } from "lucide-react";
import api from "../lib/api";

const MONTH_NAMES = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11
};

const getReminderDateTime = (item) => {
  if (!item) return null;

  const parseString = (dStr, tStr = "") => {
    if (!dStr) return null;
    let combined = (String(dStr).trim() + " " + String(tStr || "").trim()).trim();

    // Try standard JS Date parse
    let d = new Date(combined);
    if (!isNaN(d.getTime())) return d;

    // Try regex for DD-MM-YYYY, DD/MM/YYYY or DD Month YYYY
    try {
      const match = combined.match(/(\d{1,2})[\s\/\-](([a-zA-Z]+)|\d{1,2})[\s\/\-](\d{4})/);
      const timeMatch = combined.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i);

      if (match) {
        const day = parseInt(match[1], 10);
        let month;
        if (match[3]) {
          month = MONTH_NAMES[match[3].toLowerCase()];
        } else {
          month = parseInt(match[2], 10) - 1;
        }
        const year = parseInt(match[4], 10);

        let hours = 0, minutes = 0, seconds = 0;
        if (timeMatch) {
          hours = parseInt(timeMatch[1], 10);
          minutes = parseInt(timeMatch[2], 10);
          if (timeMatch[3]) seconds = parseInt(timeMatch[3], 10);
          const ampm = timeMatch[4] ? timeMatch[4].toLowerCase() : null;
          if (ampm === "pm" && hours < 12) hours += 12;
          if (ampm === "am" && hours === 12) hours = 0;
        }

        if (month !== undefined && !isNaN(month)) {
          const parsed = new Date(year, month, day, hours, minutes, seconds);
          if (!isNaN(parsed.getTime())) return parsed;
        }
      }
    } catch (e) {}

    return null;
  };

  // 1. Prioritize combined date + time string if available (e.g. "12 Aug 2026" + "07:10 PM")
  if (item.date && item.time) {
    const parsedDateTime = parseString(item.date, item.time);
    if (parsedDateTime) return parsedDateTime;
  }

  // 2. Fallback to raw followUpDate ISO string if valid Date object
  if (item.followUpDate) {
    const rawF = new Date(item.followUpDate);
    if (!isNaN(rawF.getTime())) return rawF;
  }

  return parseString(item.date, item.time) || parseString(item.followUpDate);
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

  // Completed map stored in localStorage: { [reminderId]: true }
  const [completedMap, setCompletedMap] = useState(() => {
    try {
      const saved = localStorage.getItem("completed_reminders_map");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
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

      const upcoming = list.filter((item) => {
        const id = item.id || item._id;

        // Skip items marked completed in backend DB
        if (item.status === "Completed") return false;
        
        const rDate = getReminderDateTime(item);
        if (!rDate) return false;
        const itemTime = rDate.getTime();

        // Check completed map stored in localStorage
        const completedEntry = completedMap[id];
        if (completedEntry) {
          // If completedEntry is a timestamp, only skip if the item's follow-up time is <= completed time
          if (typeof completedEntry === "number" && itemTime <= completedEntry) {
            return false;
          }
          // If legacy boolean true, only skip if status in DB is also Completed
          if (completedEntry === true && (item.status !== "Pending" && item.status !== "Overdue")) {
            return false;
          }
        }

        // Check if currently snoozed (auto-clear if follow-up time is updated)
        const snoozedUntil = snoozedMap[id];
        if (snoozedUntil && now < snoozedUntil && itemTime <= snoozedUntil) {
          return false; // Snooze duration not expired yet
        }

        const diff = itemTime - now;

        // TRIGGER CONDITION:
        // Remaining time <= 10 mins (e.g. 10m, 5m, 0m, or any pending overdue)
        const isDueSoonOrOverdue = diff <= tenMinutesMs;

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
        window.dispatchEvent(new CustomEvent('crm-reminder-alert-active', { detail: { active: true, count: upcoming.length } }));
      } else {
        setCurrentReminder(null);
        window.dispatchEvent(new CustomEvent('crm-reminder-alert-active', { detail: { active: false, count: 0 } }));
      }
    } catch (error) {
      console.error("Error checking global reminders:", error);
    }
  };

  useEffect(() => {
    checkReminders();
    const interval = setInterval(checkReminders, 3000); // Check every 3 seconds for immediate response
    return () => clearInterval(interval);
  }, [snoozedMap, completedMap]);

  // Re-play alert chime sound every 1 minute (60s) while popup remains active & unhandled
  useEffect(() => {
    if (!currentReminder) return;

    const soundInterval = setInterval(() => {
      playNotificationSound();
    }, 60000);

    return () => clearInterval(soundInterval);
  }, [currentReminder]);

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

  const handleMarkCompleted = async () => {
    if (!currentReminder) return;
    const id = currentReminder.id || currentReminder._id;

    try {
      await api.put(`/api/crm-follow-ups/${id}/complete`);
    } catch (err) {
      console.warn("Complete API notice:", err);
    }

    const rDate = getReminderDateTime(currentReminder);
    const rTimestamp = rDate ? rDate.getTime() : new Date().getTime();
    const newCompleted = { ...completedMap, [id]: rTimestamp };
    setCompletedMap(newCompleted);
    try {
      localStorage.setItem("completed_reminders_map", JSON.stringify(newCompleted));
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

  return createPortal(
    <div className="fixed bottom-5 right-5 z-[999999] max-w-md w-full p-1 animate-bounce-short" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
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
              <h4 className="text-[13px] font-semibold text-white leading-none flex items-center gap-1.5">
                <span>Follow-Up Reminder Alert</span>
              </h4>
              <p className="text-[11px] font-semibold text-yellow-300 mt-1 flex items-center gap-1">
                <Clock size={11} className="text-yellow-300" />
                <span>{getTimeLabel()}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDismiss(currentReminder.id || currentReminder._id)}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Re-alert in 1 minute"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3 bg-slate-50/60">
          {/* Company Name */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Company Name</span>
            <div className="text-[13px] font-semibold text-black mt-0.5 truncate">
              {currentReminder.company}
            </div>
            {currentReminder.industry && (
              <span className="inline-block text-[11px] font-semibold text-[#4B1426] bg-[#4B1426]/5 px-2 py-0.5 rounded mt-1 border border-[#4B1426]/10">
                {currentReminder.industry}
              </span>
            )}
          </div>

          {/* Contact Details & Action Grid */}
          <div className="grid grid-cols-2 gap-2 text-slate-700">
            {/* Contact */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Contact</span>
              <div className="text-[12px] font-semibold text-[#0A2947] flex items-center gap-1.5 truncate">
                <User size={12} className="text-emerald-600 shrink-0" />
                <span className="truncate">{currentReminder.leadName || "N/A"}</span>
              </div>
              <div className="text-[11px] font-semibold text-blue-600 flex items-center gap-1.5">
                <Smartphone size={12} className="text-blue-500 shrink-0" />
                <span>{currentReminder.mobile || "N/A"}</span>
              </div>
            </div>

            {/* Next Action & Forward To */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Next Action</span>
              <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
                <Phone size={11} /> {currentReminder.nextAction || currentReminder.type || "Call"}
              </div>
              {currentReminder.assignedTo && (
                <div className="text-[11px] font-semibold text-red-600 pt-0.5">
                  Forward To: {currentReminder.assignedTo}
                </div>
              )}
            </div>
          </div>

          {/* Remark / Notes */}
          {currentReminder.lastRemark && (
            <div className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80 space-y-1">
              <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider block">Follow-Up Note</span>
              <p className="text-[12px] font-semibold text-[#0A2947] leading-snug line-clamp-2">
                {currentReminder.lastRemark}
              </p>
            </div>
          )}
        </div>

        {/* Custom Snooze Selector Drawer */}
        {showSnoozeMenu && (
          <div className="p-3 bg-slate-100 border-t border-slate-200 animate-fadeIn space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                Snooze Alert Until:
              </span>
              <button
                onClick={() => setShowSnoozeMenu(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {snoozeOptions.map((opt) => (
                <button
                  key={opt.mins}
                  onClick={() => applyCustomSnooze(opt.mins)}
                  className="py-1.5 px-2 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-semibold text-[11px] rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors shadow-2xs text-center cursor-pointer"
                >
                  + {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-white border-t border-slate-200 flex items-center justify-between gap-1.5 relative">
          <button
            onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
            className={`px-3 py-2 text-[12px] font-semibold rounded-lg transition-colors border flex items-center gap-1 cursor-pointer ${
              showSnoozeMenu
                ? "bg-amber-100 text-amber-800 border-amber-300"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
            }`}
          >
            <span>Snooze</span>
            <ChevronUp size={12} className={`transition-transform ${showSnoozeMenu ? "rotate-180" : ""}`} />
          </button>

          <button
            onClick={handleMarkCompleted}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold rounded-lg transition-all duration-200 shadow-sm flex items-center gap-1 shrink-0 cursor-pointer"
            title="Mark follow-up as done & turn off alert popup for this client"
          >
            <CheckCircle2 size={13} />
            <span>Mark Done</span>
          </button>

          <button
            onClick={() => {
              applyCustomSnooze(1);
              navigate(`/client-overview/${currentReminder.companyId || currentReminder.id}`);
            }}
            className="flex-1 py-2 px-3 text-white text-[12px] font-semibold rounded-lg transition-all duration-200 hover:opacity-90 shadow-md flex items-center justify-center gap-1 truncate cursor-pointer"
            style={{ backgroundColor: '#0A2947' }}
          >
            <span className="truncate">View Lead</span>
            <ExternalLink size={12} className="shrink-0" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
