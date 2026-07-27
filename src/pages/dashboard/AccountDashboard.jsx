import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarRange, ChevronDown, Plus, Download } from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

// ─── Subcomponents ───────────────────────────────────────────────────────────
import AccountStatsRow from "./account/AccountStatsRow";
import RevenueTrendChart from "./account/RevenueTrendChart";
import PaymentStatusOverview from "./account/PaymentStatusOverview";
import AccountQuickActions from "./account/AccountQuickActions";
import PendingPaymentsTable from "./account/PendingPaymentsTable";
import RecentTransactionsTable from "./account/RecentTransactionsTable";
import UpcomingDueDates from "./account/UpcomingDueDates";
import GstSummary from "./account/GstSummary";

export default function AccountDashboard({ currentUser, loading }) {
  const navigate = useNavigate();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedRange, setSelectedRange] = useState("This Month (01 May - 31 May 2026)");

  const ranges = [
    "Today",
    "Yesterday",
    "This Week",
    "This Month (01 May - 31 May 2026)",
    "Last Month",
    "Custom Range"
  ];

  const handleRangeSelect = (range) => {
    setSelectedRange(range);
    setShowDatePicker(false);
    Swal.fire({
      title: "Date Range Changed",
      text: `Account dashboard has updated metrics for: ${range}`,
      icon: "success",
      confirmButtonColor: "#095b55",
      timer: 1500,
      showConfirmButton: false
    });
  };

  return (
    <motion.div
      key="account-dashboard-premium"
      className="w-full bg-[#f8fafc] px-3 py-2 font-sans min-h-screen"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      {/* ─── HEADER ROW ─── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-1 pb-1.5 border-b border-slate-200">
        <div>
          <h1 className="text-[20px] font-md text-slate-800 tracking-tight flex items-center gap-2">
            Account Dashboard
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {currentUser?.role || "Finance Desk"}
            </span>
          </h1>
          <p className="text-[11.5px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Overview of your accounts and finance activities
          </p>
        </div>

        {/* Action buttons + Date Picker Container */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            disabled
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#095b55] text-white rounded-xl shadow-sm text-[11px] font-black opacity-50 cursor-not-allowed pointer-events-none"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>Create Invoice</span>
          </button>

          <button
            onClick={() => navigate("/dashboard/add-payment")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm text-[11px] font-black transition cursor-pointer"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>Add Payment</span>
          </button>

          <button
            disabled
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-400 rounded-xl shadow-sm text-[11px] font-black opacity-50 cursor-not-allowed pointer-events-none"
          >
            <Download size={13} strokeWidth={2.5} />
            <span>Export Report</span>
          </button>

          {/* Date Picker Selector */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-sm text-[11px] font-black text-slate-700 transition cursor-pointer"
            >
              <CalendarRange size={14} className="text-slate-500" />
              <span>{selectedRange}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1.5 overflow-hidden">
                {ranges.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => handleRangeSelect(r)}
                    className={`w-full px-4 py-2 text-left text-[11px] font-black tracking-tight transition-colors hover:bg-slate-50 ${selectedRange === r ? "text-emerald-600 bg-emerald-50/30" : "text-slate-600"
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── ROW 1: 5 STAT CARDS ─── */}
      <AccountStatsRow />

      {/* ─── TWO COLUMN DUAL GRID LAYOUT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
        {/* Left Spans (Area Trend & Wide Tables) */}
        <div className="lg:col-span-8 flex flex-col gap-2">
          <div className="w-full">
            <RevenueTrendChart />
          </div>
          <div className="w-full">
            <PendingPaymentsTable />
          </div>
          <div className="w-full">
            <RecentTransactionsTable />
          </div>
        </div>

        {/* Right Spans (Overview Ring, Actions, Due Timeline, GST blocks) */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          <div className="w-full">
            <PaymentStatusOverview />
          </div>
          <div className="w-full">
            <AccountQuickActions />
          </div>
          <div className="w-full">
            <UpcomingDueDates />
          </div>
          <div className="w-full">
            <GstSummary />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
