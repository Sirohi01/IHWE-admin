import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CallingDialerModal from "./CallingDialerModal";
import WhatsAppSenderModal from "./WhatsAppSenderModal";

const ACTIONS = [
  {
    key: "addLead",
    label: "Add Lead",
    route: "/ihweClientData2026/addNewClients",
    iconBg: "bg-teal-50",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" />
      </svg>
    ),
  },
  {
    key: "callNow",
    label: "Call Now",
    route: null,
    iconBg: "bg-green-50",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    key: "whatsapp",
    label: "Send WhatsApp",
    route: null,
    iconBg: "bg-green-50",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#22c55e">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>
    ),
  },
  {
    key: "schedule",
    label: "Schedule Meeting",
    route: null,
    disabled: true,
    iconBg: "bg-blue-50",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    key: "proposal",
    label: "Send Proposal",
    route: null,
    disabled: true,
    iconBg: "bg-orange-50",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    key: "brochure",
    label: "Share Brochure",
    route: null,
    disabled: true,
    iconBg: "bg-amber-50",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    key: "invoice",
    label: "Generate Invoice",
    route: null,
    disabled: true,
    iconBg: "bg-blue-50",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    key: "paymentLink",
    label: "Share Payment Link",
    route: null,
    disabled: true,
    iconBg: "bg-rose-50",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
];

export default function QuickActions() {
  const navigate = useNavigate();
  const [isDialerOpen, setIsDialerOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  const handleClick = (action) => {
    if (action.disabled) return;
    if (action.key === "callNow") {
      setIsDialerOpen(true);
    } else if (action.key === "whatsapp") {
      setIsWhatsAppOpen(true);
    } else if (action.route) {
      navigate(action.route);
    }
  };

  return (
    <>
      <div
        className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm lg:col-span-3 col-span-1 flex flex-col"
        style={{ minHeight: '240px', maxHeight: '240px' }}
      >
        <h3 className="text-lg font-black text-slate-800 mb-3 shrink-0">Quick Actions</h3>

        <div className="grid grid-cols-4 gap-2 flex-1 content-center">
          {ACTIONS.map((action) => (
            <button
              key={action.key}
              onClick={() => handleClick(action)}
              title={action.disabled ? "Coming soon" : action.label}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition group ${
                action.disabled
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${action.iconBg} ${!action.disabled ? "group-hover:scale-105" : ""} transition`}>
                {action.icon}
              </div>
              <span className="text-[9px] font-semibold text-slate-600 text-center leading-tight">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {isDialerOpen && (
        <CallingDialerModal 
          onClose={() => setIsDialerOpen(false)} 
          onCallLogged={() => {
            // Refresh parent state or reload if needed
          }}
        />
      )}

      {isWhatsAppOpen && (
        <WhatsAppSenderModal 
          onClose={() => setIsWhatsAppOpen(false)} 
        />
      )}
    </>
  );
}

