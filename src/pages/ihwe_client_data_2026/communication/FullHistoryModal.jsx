import React, { useState } from "react";
import { X, Phone, Mail, MessageSquare, Activity, FolderOpen } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import SingleDetailModal from "./SingleDetailModal";

const TYPE_CONFIG = {
  whatsapp:    { icon: FaWhatsapp, color: "text-green-600",  bg: "bg-green-50",  label: "WhatsApp" },
  call:        { icon: Phone,      color: "text-teal-600",   bg: "bg-teal-50",   label: "Call" },
  email:       { icon: Mail,       color: "text-blue-600",   bg: "bg-blue-50",   label: "Email Sent" },
  email_reply: { icon: Mail,       color: "text-indigo-600", bg: "bg-indigo-50", label: "Email Reply" },
  status:      { icon: Activity,   color: "text-orange-500", bg: "bg-orange-50", label: "Status Update" },
  log:         { icon: FolderOpen, color: "text-purple-600", bg: "bg-purple-50", label: "Log" },
};

const formatDateTime = (dt) => {
  if (!dt) return "";
  return new Date(dt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const FullHistoryModal = ({ reviews, companyName, onClose }) => {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const tabs = ["All", "WhatsApp", "Calls", "Emails", "Status", "Logs"];

  const tabTypeMap = {
    All: null, WhatsApp: "whatsapp", Calls: "call",
    Emails: ["email", "email_reply"], Status: "status", Logs: "log",
  };

  const filtered = activeTab === "All"
    ? reviews
    : reviews.filter((r) => {
        const f = tabTypeMap[activeTab];
        if (!f) return true;
        if (Array.isArray(f)) return f.includes(r.type);
        return r.type === f;
      });

  const sorted = [...(filtered || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const boxStyle = {
    boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
      <div
        className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-[#15173D]"
        style={{
          fontFamily: 'Inter, sans-serif',
          ...boxStyle,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 bg-slate-100 border-b border-slate-200">
          <div>
            <h2 className="text-[13px] font-bold text-[#15173D] tracking-tight uppercase">Full Communication History</h2>
            <p className="text-[11px] font-bold text-slate-500 mt-0.5">{companyName} • {sorted.length} records</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 px-4 pt-3 pb-1 flex-wrap bg-slate-50 border-b border-slate-100">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-7 px-3.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors shadow-sm ${
                activeTab === tab
                  ? "bg-[#15173D] text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {sorted.length === 0 ? (
            <p className="text-center text-slate-400 text-xs py-10 font-bold">No records found.</p>
          ) : (
            sorted.map((item, idx) => {
              const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.log;
              const Icon = cfg.icon;

              let label = cfg.label;
              let text = item.re_msg;
              if ((item.type === 'log' || item.type === 'status') && text && text.startsWith('[')) {
                const endIdx = text.indexOf(']');
                if (endIdx > 0) {
                  label = text.substring(1, endIdx);
                  text = text.substring(endIdx + 1).trim();
                }
              }

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedItem(item)}
                  className="flex gap-3 p-3 rounded-lg bg-white transition-all cursor-pointer hover:bg-slate-50/80"
                  style={boxStyle}
                >
                  <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 border border-slate-200 mt-0.5`}>
                    <Icon size={15} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-0.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>{label}</span>
                      <span className="text-[10px] font-bold" style={{ color: '#133458' }}>{formatDateTime(item.createdAt)}</span>
                    </div>
                    {item.status_short && (
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-[9.5px] font-extrabold uppercase">
                        {item.status_short}
                      </span>
                    )}
                    {item.email_subject && (
                      <p className="text-[11px] font-bold text-slate-800 mt-0.5">📧 {item.email_subject}</p>
                    )}
                    {text && (
                      <p className="text-[11px] font-medium text-slate-700 mt-1 leading-relaxed whitespace-pre-wrap">
                        {text.split(/(' to ')/g).map((part, i) => 
                          part === "' to '" 
                            ? <span key={i}>' <span className="font-extrabold text-blue-600 mx-0.5">TO</span> '</span> 
                            : part
                        )}
                      </p>
                    )}
                    {item.call_duration && (
                      <p className="text-[10px] font-bold text-teal-700 mt-1">Call Duration: {item.call_duration}</p>
                    )}
                    {item.type === "email_reply" && item.updated_by && (
                      <p className="text-[10px] text-indigo-600 font-bold mt-1">↩ From: {item.updated_by}</p>
                    )}
                    {item.reminder_dt && (
                      <p className="text-[10px] font-bold text-red-600 mt-1">
                        ⏰ Reminder: {formatDateTime(item.reminder_dt)}
                      </p>
                    )}
                    {item.type !== "email_reply" && item.updated_by && (
                      <p className="text-[10px] font-bold text-blue-600 mt-0.5">By: {item.updated_by}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedItem && (
        <SingleDetailModal
          item={selectedItem}
          companyName={companyName}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default FullHistoryModal;
