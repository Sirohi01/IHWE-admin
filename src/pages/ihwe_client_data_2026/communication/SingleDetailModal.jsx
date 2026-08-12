import React from "react";
import { X, Phone, Mail, Activity, FolderOpen } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const TYPE_CONFIG = {
  whatsapp:    { icon: FaWhatsapp, color: "text-green-600",  bg: "bg-green-50",  label: "WhatsApp Chat" },
  call:        { icon: Phone,      color: "text-teal-600",   bg: "bg-teal-50",   label: "Call Log" },
  email:       { icon: Mail,       color: "text-blue-600",   bg: "bg-blue-50",   label: "Email Sent" },
  email_reply: { icon: Mail,       color: "text-indigo-600", bg: "bg-indigo-50", label: "Email Reply" },
  status:      { icon: Activity,   color: "text-orange-500", bg: "bg-orange-50", label: "Status Update" },
  log:         { icon: FolderOpen, color: "text-purple-600", bg: "bg-purple-50", label: "Log Details" },
};

const formatDateTime = (dt) => {
  if (!dt) return "";
  return new Date(dt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const SingleDetailModal = ({ item, companyName, onClose }) => {
  if (!item) return null;

  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.log;
  const Icon = cfg.icon;

  let label = cfg.label;
  let text = item.re_msg || "";
  if ((item.type === 'log' || item.type === 'status') && text && text.startsWith('[')) {
    const endIdx = text.indexOf(']');
    if (endIdx > 0) {
      label = text.substring(1, endIdx);
      text = text.substring(endIdx + 1).trim();
    }
  }

  const boxStyle = {
    boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[10000] flex items-center justify-center p-4">
      <div
        className="bg-white w-full max-w-lg rounded-xl overflow-hidden animate-fadeIn text-[#15173D]"
        style={{
          fontFamily: 'Inter, sans-serif',
          ...boxStyle,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 bg-slate-100 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 ${cfg.bg} rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200`}>
              <Icon size={16} className={cfg.color} />
            </div>
            <div>
              <h3 className={`text-[12px] font-bold uppercase tracking-wider ${cfg.color}`}>{label}</h3>
              <p className="text-[10px] font-bold" style={{ color: '#133458' }}>{formatDateTime(item.createdAt)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {companyName && (
            <div className="bg-white p-2.5 rounded-lg" style={boxStyle}>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Client</span>
              <span className="text-[11px] font-bold text-[#093C5D]">{companyName}</span>
            </div>
          )}

          {item.status_short && (
            <div className="bg-white p-2.5 rounded-lg flex items-center justify-between" style={boxStyle}>
              <span className="text-[10px] font-bold text-slate-600">Status:</span>
              <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-[10px] font-extrabold uppercase">
                {item.status_short}
              </span>
            </div>
          )}

          {item.email_subject && (
            <div className="bg-white p-2.5 rounded-lg" style={boxStyle}>
              <span className="text-[9px] font-bold text-blue-700 block uppercase tracking-wider mb-0.5">Subject</span>
              <p className="text-[11px] font-bold text-slate-800">{item.email_subject}</p>
            </div>
          )}

          {text && (
            <div className="bg-white p-3 rounded-lg" style={boxStyle}>
              <span className="text-[9px] font-semibold text-slate-400 block uppercase tracking-wider mb-1">Details / Message</span>
              <p className="text-[11px] font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                {text.split(/(' to ')/g).map((part, i) =>
                  part === "' to '"
                    ? <span key={i}>' <span className="font-extrabold text-blue-600 mx-0.5">TO</span> '</span>
                    : part
                )}
              </p>
            </div>
          )}

          {item.call_duration && (
            <div className="bg-white p-2.5 rounded-lg flex items-center justify-between" style={boxStyle}>
              <span className="text-[10px] font-bold text-slate-600">Call Duration:</span>
              <span className="text-[11px] font-bold text-teal-700">{item.call_duration}</span>
            </div>
          )}

          {item.reminder_dt && (
            <div className="bg-red-50/50 p-2.5 rounded-lg border border-red-100" style={boxStyle}>
              <span className="text-[11px] font-bold text-red-600 block">
                ⏰ Reminder: {formatDateTime(item.reminder_dt)}
              </span>
            </div>
          )}

          {item.updated_by && (
            <div className="text-[11px] font-bold text-blue-600 text-right pt-1.5 border-t border-slate-100">
              By: {item.updated_by}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#15173D] text-white text-[11px] font-bold rounded-lg hover:bg-[#0A2643] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleDetailModal;
