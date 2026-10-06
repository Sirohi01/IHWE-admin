import { ArrowUp, ArrowDown } from "lucide-react";

export const PERIOD_OPTIONS = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "this_week", label: "This Week" },
  { key: "last_week", label: "Last Week" },
  { key: "this_month", label: "This Month" },
  { key: "last_month", label: "Last Month" },
  { key: "this_quarter", label: "This Quarter" },
  { key: "last_quarter", label: "Last Quarter" },
  { key: "this_year", label: "This Year" },
];
export const PREV_PERIOD = { today: "yesterday", this_week: "last_week", this_month: "last_month", this_quarter: "last_quarter" };

// Only users with these roles are part of the sales team ("IHWE–B2B Connect", "IHWE–Sales Team").
export const isSalesTeamRole = (role = "") => {
  const slug = String(role).toLowerCase().replace(/[^a-z0-9]/g, "");
  return slug.includes("b2bconnect") || slug.includes("salesteam");
};

export const COLUMNS = [
  { key: "today", label: "Today", head: "bg-blue-50 text-blue-600" },
  { key: "this_week", label: "This Week", head: "bg-emerald-50 text-emerald-600" },
  { key: "this_month", label: "This Month", head: "bg-violet-50 text-violet-600" },
  { key: "last_month", label: "Last Month", head: "bg-orange-50 text-orange-600" },
];

export const STATUS_BUCKETS = [
  { name: "New Leads", color: "#3b82f6", match: (s) => s === "new lead" },
  { name: "Contacted", color: "#22c55e", match: (s) => s === "contacted" },
  { name: "Follow-up", color: "#f59e0b", match: (s) => /^follow[\s-]?up/.test(s) || ["warm client", "sent details"].includes(s) },
  { name: "Converted", color: "#8b5cf6", match: (s) => isConverted(s) },
  { name: "Closed Lost", color: "#ef4444", match: (s) => s === "not interested" },
];
export const BAR_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#f43f5e", "#94a3b8"];
export const AVATAR_COLORS = ["#4f46e5", "#64748b", "#f97316", "#9333ea", "#ef4444", "#6366f1", "#0891b2", "#16a34a"];

export function isConverted(s) { return ["adc. recd", "inv. req.", "under pymt followups"].includes(s); }
export const isFollowUp = (s) => s === "contacted" || /^follow[\s-]?up/.test(s);
export const isHotStatus = (s) => s === "est./pi sent";
export const inr = (n) => `₹ ${Math.round(n || 0).toLocaleString("en-IN")}`;
export const pctChange = (cur, prev) => (prev > 0 ? Math.round(((cur - prev) / prev) * 100) : cur > 0 ? 100 : 0);
export const inRange = (d, { start, end }) => { const t = new Date(d).getTime(); return t >= start.getTime() && t < end.getTime(); };

export function Delta({ value, light }) {
  if (value === null || value === undefined) return null;
  const up = value >= 0;
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${up ? "text-emerald-600" : "text-rose-600"}`}>
      <Icon size={10} />{Math.abs(value)}%{light ? " vs prev. period" : ""}
    </span>
  );
}
