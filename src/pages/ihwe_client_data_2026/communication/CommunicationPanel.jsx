import React, { useState } from "react";
import { Phone, Mail, Activity, FolderOpen, MessageCircleMore } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import WhatsAppModal from "./WhatsAppModal";
import EmailModal from "./EmailModal";
import CallLogModal from "./CallLogModal";
import FullHistoryModal from "./FullHistoryModal";

const TYPE_CONFIG = {
  whatsapp:    { icon: FaWhatsapp, color: "text-green-600",  bg: "bg-green-50",  label: "WhatsApp" },
  call:        { icon: Phone,      color: "text-teal-600",   bg: "bg-teal-50",   label: "Call" },
  email:       { icon: Mail,       color: "text-blue-600",   bg: "bg-blue-50",   label: "Email Sent" },
  email_reply: { icon: Mail,       color: "text-indigo-600", bg: "bg-indigo-50", label: "Email Reply" },
  status:      { icon: Activity,   color: "text-orange-500", bg: "bg-orange-50", label: "Status" },
  log:         { icon: FolderOpen, color: "text-purple-600", bg: "bg-purple-50", label: "Log" },
};

const formatDateTime = (dt) => {
  if (!dt) return "";
  return new Date(dt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const TABS = ["All", "WhatsApp", "Calls", "Emails", "Logs/Status"];
const TAB_TYPE_MAP = {
  All: null, WhatsApp: "whatsapp", Calls: "call",
  Emails: ["email", "email_reply"], "Logs/Status": ["status", "log"],
};

const CommunicationPanel = ({ company, reviews, onSendEntry, onWhatsApp, onEmail, onCall }) => {
  const [activeTab, setActiveTab] = useState("All");
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Allow parent (action cards) to trigger modals
  React.useEffect(() => { if (onWhatsApp) setShowWhatsApp(true); }, [onWhatsApp]);
  React.useEffect(() => { if (onEmail) setShowEmail(true); }, [onEmail]);
  React.useEffect(() => { if (onCall) setShowCall(true); }, [onCall]);
  const filtered = (reviews || []).filter((r) => {
    const typeFilter = TAB_TYPE_MAP[activeTab];
    if (!typeFilter) return true;
    if (Array.isArray(typeFilter)) return typeFilter.includes(r.type);
    return r.type === typeFilter;
  });

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const displayed = sorted.slice(0, 8);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-300 p-4 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[#0f172a]">CHAT & COMMUNICATION</h2>
        </div>

        {/* Action Buttons */}

        {/* Tabs */}
        <div className="flex flex-nowrap gap-1.5 mb-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-7 px-3 rounded-xl border text-[11px] font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Feed */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2">
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageCircleMore size={36} className="mb-2 opacity-30" />
              <p className="text-sm">No communication records yet.</p>
            </div>
          ) : (
            displayed.map((item, idx) => {
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
                <div key={idx} className="flex gap-2">
                  <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon size={13} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`rounded-xl px-2.5 py-2 ${cfg.bg}`}>
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className={`text-[10px] font-bold uppercase ${cfg.color} flex-shrink-0`}>{label}</span>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{formatDateTime(item.createdAt)}</span>
                      </div>
                      {(item.status_short || item.email_subject || text) && (
                        <p className="text-[11px] text-gray-700 truncate mt-0.5 leading-relaxed">
                          {item.status_short && (
                            <span className="inline-block px-1.5 py-[1px] rounded bg-orange-100 text-orange-600 text-[9px] font-bold uppercase tracking-wider mr-1.5 align-middle">
                              {item.status_short}
                            </span>
                          )}
                          {item.email_subject && <span className="font-semibold mr-1 text-gray-800 align-middle">📧 {item.email_subject}</span>}
                          {item.email_subject && text && <span className="text-gray-400 mx-1 align-middle">|</span>}
                          {text && <span className="align-middle">{text.replace(/\n/g, ' - ').split(/(' to ')/g).map((part, i) => 
                            part === "' to '" 
                              ? <span key={i}>' <span className="font-extrabold text-blue-600 mx-0.5">TO</span> '</span> 
                              : part
                          )}</span>}
                        </p>
                      )}                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-3">
          <button
            onClick={() => setShowHistory(true)}
            className="w-full h-9 border border-green-300 text-green-600 rounded-2xl font-semibold text-sm hover:bg-green-50 transition-colors"
          >
            View Full Communication History
          </button>
        </div>
      </div>

      {/* Modals */}
      {showWhatsApp && (
        <WhatsAppModal
          company={company}
          onClose={() => setShowWhatsApp(false)}
          onSend={onSendEntry}
        />
      )}
      {showEmail && (
        <EmailModal
          company={company}
          onClose={() => setShowEmail(false)}
          onSend={onSendEntry}
        />
      )}
      {showCall && (
        <CallLogModal
          company={company}
          onClose={() => setShowCall(false)}
          onSave={onSendEntry}
        />
      )}
      {showHistory && (
        <FullHistoryModal
          reviews={reviews || []}
          companyName={company?.companyName}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
};

export default CommunicationPanel;
