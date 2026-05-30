import {
  FileText, FilePlus, BellRing, DownloadCloud,
  PhoneForwarded, FileSpreadsheet, Percent, RotateCcw, LayoutGrid
} from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function AccountQuickActions() {
  const navigate = useNavigate();
  const actions = [
    {
      label: "Create Invoice",
      icon: FileText,
      colors: "bg-[#f0faf2] hover:bg-[#e1f7e6] border-[#ccefd7] text-[#15803d]"
    },
    {
      label: "Add Payment",
      icon: FilePlus,
      colors: "bg-[#f0f7ff] hover:bg-[#e0efff] border-[#cce3ff] text-[#1d4ed8]"
    },
    {
      label: "Send Reminder",
      icon: BellRing,
      colors: "bg-[#fffaf0] hover:bg-[#fef1db] border-[#fee6c2] text-[#d97706]"
    },
    {
      label: "Download GST Report",
      icon: DownloadCloud,
      colors: "bg-[#faf5ff] hover:bg-[#f3e8ff] border-[#e9d5ff] text-[#7e22ce]"
    },
    {
      label: "Payment Follow-Up",
      icon: PhoneForwarded,
      colors: "bg-[#f0fdfa] hover:bg-[#ccfbf1] border-[#99f6e4] text-[#0d9488]"
    },
    {
      label: "Export Report",
      icon: FileSpreadsheet,
      colors: "bg-[#eef2ff] hover:bg-[#e0e7ff] border-[#c7d2fe] text-[#4f46e5]"
    },
    {
      label: "Proforma Invoice",
      icon: Percent,
      colors: "bg-[#fffbeb] hover:bg-[#fef3c7] border-[#fde68a] text-[#b45309]"
    },
    {
      label: "Refund / Credit Note",
      icon: RotateCcw,
      colors: "bg-[#fff5f5] hover:bg-[#ffe3e3] border-[#fecaca] text-[#dc2626]"
    },
    {
      label: "View All Invoices",
      icon: LayoutGrid,
      colors: "bg-[#f0f9ff] hover:bg-[#e0f2fe] border-[#bae6fd] text-[#0369a1]"
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-sm h-full flex flex-col justify-between">
      {/* Title */}
      <div className="shrink-0 mb-1.5 pb-1 border-b border-slate-100">
        <h3 className="text-[12.5px] font-md text-slate-800 tracking-tight">
          Quick Actions
        </h3>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
          Finance operations and documents
        </p>
      </div>

      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-1.5 flex-1 items-stretch">
        {actions.map((act, i) => {
          const Icon = act.icon;
          return (
            <button
              key={i}
              disabled={act.label !== "Add Payment"}
              onClick={() => {
                if (act.label === "Add Payment") {
                  navigate("/dashboard/add-payment");
                }
              }}
              className={`border rounded-lg px-1 py-1.5 flex flex-col items-center justify-center text-center transition-all duration-350 ${act.colors} ${act.label === "Add Payment"
                ? "cursor-pointer hover:shadow-sm hover:scale-102"
                : "opacity-50 cursor-not-allowed pointer-events-none"
                }`}
            >
              <Icon size={13} className="mb-0.5 shrink-0" strokeWidth={2.5} />
              <span className="text-[8px] font-black leading-tight uppercase tracking-tight">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
