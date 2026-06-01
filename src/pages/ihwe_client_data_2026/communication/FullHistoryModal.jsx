import React, { useState } from "react";
import { X, Phone, Mail, MessageSquare, Activity, FolderOpen } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const TYPE_CONFIG = {
  whatsapp: { icon: FaWhatsapp, color: "text-green-600", bg: "bg-green-50", label: "WhatsApp" },
  call:     { icon: Phone,      color: "text-teal-600",  bg: "bg-teal-50",  label: "Call" },
  email:    { icon: Mail,       color: "text-blue-600",  bg: "bg-blue-50",  label: "Email" },
  status:   { icon: Activity,   color: "text-orange-500",bg: "bg-orange-50",label: "Status Update" },
  log:      { icon: FolderOpen, color: "text-purple-600",bg: "bg-purple-50",label: "Log" },
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
  const tabs = ["All", "WhatsApp", "Calls", "Emails", "Status", "Logs"];

  const tabTypeMap = {
    All: null, WhatsApp: "whatsapp", Calls: "call",
    Emails: "email", Status: "status", Logs: "log",
  };

  const filtered = activeTab === "All"
    ? reviews
    : reviews.filter((r) => r.type === tabTypeMap[activeTab]);

  const sorted = [...(filtered || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Full Communication History</h2>
            <p className="text-xs text-gray-500 mt-0.5">{companyName} • {sorted.length} records</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-5 pt-3 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-8 px-4 rounded-xl border text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {sorted.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">No records found.</p>
          ) : (
            sorted.map((item, idx) => {
              const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.log;
              const Icon = cfg.icon;
              return (
                <div key={idx} className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`text-[11px] font-bold uppercase tracking-wide ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-[10px] text-gray-400">{formatDateTime(item.createdAt)}</span>
                    </div>
                    {item.status_short && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-semibold">
                        {item.status_short}
                      </span>
                    )}
                    {item.email_subject && (
                      <p className="text-[11px] font-semibold text-gray-700 mt-1">Subject: {item.email_subject}</p>
                    )}
                    {item.re_msg && (
                      <p className="text-[12px] text-gray-700 mt-1 leading-5">{item.re_msg}</p>
                    )}
                    {item.call_duration && (
                      <p className="text-[10px] text-gray-400 mt-1">Duration: {item.call_duration}</p>
                    )}
                    {item.forward_to && (
                      <p className="text-[10px] text-gray-400 mt-1">Next Action: {item.forward_to}</p>
                    )}
                    {item.reminder_dt && (
                      <p className="text-[10px] text-gray-400 mt-0.5">Reminder: {formatDateTime(item.reminder_dt)}</p>
                    )}
                    {item.updated_by && (
                      <p className="text-[10px] text-gray-400 mt-0.5">By: {item.updated_by}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default FullHistoryModal;
