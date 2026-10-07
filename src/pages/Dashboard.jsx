import { useEffect, useState, useMemo } from "react";
import api from "../lib/api";

// ─── Sub-components ───────────────────────────────────────────────────────────
import DashboardHeader      from "./dashboard/DashboardHeader";
import DashboardStatsGrid   from "./dashboard/DashboardStatsGrid";
import LeadSummaryCard      from "./dashboard/LeadSummaryCard";
import FollowupsTable       from "./dashboard/FollowupsTable";
import TargetGaugeCard      from "./dashboard/TargetGaugeCard";
import PerformanceOverview  from "./dashboard/PerformanceOverview";
import RecentActivities     from "./dashboard/RecentActivities";
import QuickActions         from "./dashboard/QuickActions";
import TopLeadsCard         from "./dashboard/TopLeadsCard";
import SalesLeaderboard     from "./dashboard/SalesLeaderboard";
import RemindersCard        from "./dashboard/RemindersCard";
import NextActionPanel      from "./dashboard/NextActionPanel";
import AccountDashboard     from "./dashboard/AccountDashboard";
import DashboardDetailModal from "./dashboard/DashboardDetailModal";
import { useSelector } from "react-redux";
import { getPeriodRange } from "../utils/periodRange";

// ─── Module-Level Cache for Instant Loading ───────────────────────────────────
let _cachedCompanies = null;
let _cachedActivityLogs = null;
let _cachedAllAdmins = null;
let _cachedFullProfile = null;
let _cachedTargets = null;

const PERIOD_LABELS = { today: "Today", yesterday: "Yesterday", this_week: "This Week", last_week: "Last Week", this_month: "This Month", last_month: "Last Month", this_quarter: "This Quarter", last_quarter: "Last Quarter", this_year: "This Year" };

// Lead Summary buckets, by the lead's current status (status master + the older legacy names).
const LEAD_SUMMARY_BUCKETS = {
  newLeads: ["new lead"],
  hot: ["hot lead", "est./pi sent"],
  warm: ["contacted", "follow-up", "follow up", "follow-up call", "warm client", "sent details", "proposal sent", "negotiation"],
  cold: ["not interested", "on hold", "hold"],
  converted: ["booking confirmed", "payment pending", "completed", "booked", "adc. recd", "inv. req.", "under pymt followups"],
};
const leadSummaryBucket = (status) => {
  const st = (status || "").trim().toLowerCase();
  return Object.keys(LEAD_SUMMARY_BUCKETS).find((k) => LEAD_SUMMARY_BUCKETS[k].includes(st)) || "other";
};

// "Contacted" / "Follow-up…" leads are the ones that count as follow-ups (same rule as the Follow-Ups list).
const isFollowUpStatus = (status) => {
  const st = (status || "").trim().toLowerCase();
  return st === "contacted" || /^follow[\s-]?up/.test(st);
};

const getTargetMonthForPeriod = (period) => {
  const now = new Date();
  const formatMonth = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  if (period === "previous_month") {
    return formatMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  }
  return formatMonth(new Date(now.getFullYear(), now.getMonth(), 1));
};

export default function Dashboard() {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);
  const [fullProfile, setFullProfile] = useState(_cachedFullProfile);
  const [companies,   setCompanies]   = useState(_cachedCompanies || []);
  const [activityLogs, setActivityLogs] = useState(_cachedActivityLogs || []);
  const [targets,     setTargets]     = useState(_cachedTargets || []);
  const [allAdmins,   setAllAdmins]   = useState(_cachedAllAdmins || []);
  const [loading,     setLoading]     = useState(!_cachedCompanies);
  
  const [actualRevenue, setActualRevenue] = useState(0);
  const [actualConvertedCount, setActualConvertedCount] = useState(0);
  const [bookedRegistrations, setBookedRegistrations] = useState([]);
  const [dueRows, setDueRows] = useState([]);
  const [dueTotal, setDueTotal] = useState(0);
  const [actualLeaderboard, setActualLeaderboard] = useState([]);
  const [globalPeriod, setGlobalPeriod] = useState("today");

  // ─── Init: user context + targets ───────────────────────────────────────────
  useEffect(() => {
    const info = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
    if (info) {
      try { setCurrentUser(JSON.parse(info)); }
      catch (e) { console.error("Error parsing adminInfo", e); }
    }
    // Fetch targets from backend
    const fetchTargets = async () => {
      try {
        const res = await api.get("/api/user-targets");
        if (res.data?.success) {
          setTargets(res.data.data || []);
          _cachedTargets = res.data.data || [];
        }
      } catch (err) {
        console.error("Error fetching targets", err);
      }
    };
    fetchTargets();
  }, []);

  // ─── Fetch real revenue and leaderboard based on period ─────────────────────
  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    
    const fetchRevenueAndLeaderboard = async () => {
      try {
        const username = encodeURIComponent(currentUser.username);
        const [revenueRes, leaderboardRes] = await Promise.all([
          api.get(`/api/companies/achievement-revenue?username=${username}&period=${globalPeriod}`),
          api.get(`/api/companies/leaderboard?period=${globalPeriod}`)
        ]);
        
        if (cancelled) return;
        if (revenueRes.data?.success) {
          setActualRevenue(revenueRes.data.revenue || 0);
          setActualConvertedCount(revenueRes.data.convertedCount || 0);
          setBookedRegistrations(revenueRes.data.registrations || []);
          setDueRows(revenueRes.data.dues || []);
          setDueTotal(revenueRes.data.dueTotal || 0);
        }
        
        if (leaderboardRes.data?.success) {
          setActualLeaderboard(leaderboardRes.data.leaderboard || []);
        }
      } catch (err) {
        console.error("Error fetching revenue/leaderboard", err);
      }
    };
    
    fetchRevenueAndLeaderboard();
    return () => { cancelled = true; };
  }, [currentUser, globalPeriod]);

  // ─── Fetch actual calls made from CallLogs ───────────────────────────────────
  const [actualCallsMade, setActualCallsMade] = useState(0);
  const [actualInterested, setActualInterested] = useState(0);
  const [actualFollowUps, setActualFollowUps] = useState(0);
  useEffect(() => {
    if (!currentUser) return;
    // A slower response for an older Duration must not overwrite the current one.
    let cancelled = false;
    const fetchCalls = async () => {
      try {
        // Find user ID (from fullProfile if available, else fallback to currentUser._id)
        const userId = fullProfile?._id || fullProfile?.id || currentUser?._id || currentUser?.id || "";
        const res = await api.get(`/api/user-targets/stats/dashboard?username=${encodeURIComponent(currentUser.username)}&userId=${encodeURIComponent(userId)}&period=${globalPeriod}`);
        if (!cancelled && res.data?.success) {
          setActualCallsMade(res.data.completed.statusUpdate || 0);
          setActualInterested(res.data.completed.interested || 0);
          setActualFollowUps(res.data.completed.followUp || 0);
        }
      } catch (err) {
        console.error("Error fetching calls made", err);
      }
    };
    fetchCalls();
    return () => { cancelled = true; };
  }, [currentUser, fullProfile, globalPeriod]);

  // ─── Fetch dashboard data ────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const fetchData = async () => {
      try {
        if (!_cachedCompanies) setLoading(true);
        const [compRes, actRes, admRes] = await Promise.all([
          api.get(`/api/companies?dashboard=true&username=${encodeURIComponent(currentUser.username)}&role=${encodeURIComponent(currentUser.role || '')}`),
          api.get("/api/activity-logs"),
          api.get("/api/admin/public-list"),
        ]);
        if (compRes.data) {
          setCompanies(compRes.data);
          _cachedCompanies = compRes.data;
        }
        if (actRes.data?.success) {
          setActivityLogs(actRes.data.data || []);
          _cachedActivityLogs = actRes.data.data || [];
        }
        if (admRes.data?.success) {
          setAllAdmins(admRes.data.data || []);
          _cachedAllAdmins = admRes.data.data || [];
          const match = admRes.data.data.find(
            u => u.username.toLowerCase() === currentUser.username.toLowerCase()
          );
          if (match) {
            setFullProfile(match);
            _cachedFullProfile = match;
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  // When this lead was (last) assigned to the user: the newest of their event assignments' assigned date
  // and the assignment history entries made out to them; falls back to when the lead was created.
  const assignedAtOf = (c, username) => {
    const u = username.toLowerCase();
    const times = [
      ...(c.eventAssignments || []).filter((a) => a.forwardTo?.toLowerCase() === u).map((a) => a.assignedAt || a.createdAt),
      ...(c.assignmentHistory || []).filter((h) => h.forwardTo?.toLowerCase() === u).map((h) => h.assignedAt),
    ].filter(Boolean).map((t) => new Date(t).getTime());
    return times.length ? Math.max(...times) : new Date(c.createdAt).getTime();
  };

  // ─── Scoped leads for active user ────────────────────────────────────────────
  const userLeads = useMemo(() => {
    if (!currentUser) return [];
    const u = currentUser.username.toLowerCase();
    const mine = (a) => a.forwardTo?.toLowerCase() === u;
    return companies
      .filter(c =>
        c.forwardTo?.toLowerCase() === u || c.added_by?.toLowerCase() === u ||
        (c.eventAssignments || []).some(mine)
      )
      .map(c => {
        // Status / follow-up live on the user's event assignment; use the latest one.
        const a = (c.eventAssignments || []).filter(mine)
          .sort((x, y) => new Date(y.updatedAt || 0) - new Date(x.updatedAt || 0))[0];
        if (!a) return c;
        return {
          ...c,
          companyStatus: a.status || c.companyStatus,
          reminder: a.reminder || a.followUpDate || c.reminder || c.followUpDate,
          lastNote: a.lastRemark || c.lastNote,
        };
      });
  }, [companies, currentUser]);

  // ─── Leads assigned to the user within the selected Duration ─────────────────
  const periodLeads = useMemo(() => {
    if (!currentUser) return [];
    const u = currentUser.username.toLowerCase();
    const { start, end } = getPeriodRange(globalPeriod);
    return userLeads.filter(c => {
      const ts = assignedAtOf(c, currentUser.username);
      return ts >= start.getTime() && ts < end.getTime();
    });
  }, [userLeads, currentUser, globalPeriod]);

  // ─── Stats metrics ───────────────────────────────────────────────────────────
  const statsMetrics = useMemo(() => {
    const total     = periodLeads.length;
    const converted = periodLeads.filter(c =>
      ["adc. recd", "inv. req.", "under pymt followups"].includes(c.companyStatus?.toLowerCase())
    ).length;
    // Warm = warm-type statuses in this Duration, plus every lead currently in Contacted /
    // Follow-up (pending follow-ups count as warm no matter when they were assigned).
    const followUpLeads = userLeads.filter(c => isFollowUpStatus(c.companyStatus));
    const warm      = new Set([
      ...periodLeads.filter(c => ["warm client", "follow-up call", "sent details"].includes(c.companyStatus?.toLowerCase())),
      ...followUpLeads,
    ].map(c => c._id)).size;
    // Lead Summary: leads assigned in this Duration, each counted once by its current status,
    // so the buckets always add up to the total.
    const summary = { newLeads: 0, hot: 0, warm: 0, cold: 0, converted: 0, other: 0 };
    periodLeads.forEach((c) => { summary[leadSummaryBucket(c.companyStatus)] += 1; });
    const summaryTotal = periodLeads.length;
    const hot       = periodLeads.filter(c => c.companyStatus?.toLowerCase() === "est./pi sent").length;
    const cold      = periodLeads.filter(c => c.companyStatus?.toLowerCase() === "not interested").length;
    const newLeads  = periodLeads.filter(c => c.companyStatus?.toLowerCase() === "new lead").length;

    const callsMade = actualCallsMade;

    const revenue          = (actualRevenue / 100000).toFixed(2);
    const pendingFollowups = userLeads.filter(c => isFollowUpStatus(c.companyStatus)).length;
    const collection       = (dueTotal / 100000).toFixed(2);

    return {
      total, summaryTotal, callsMade, interested: actualInterested, meetings: hot,
      closed: actualConvertedCount, revenue, pendingFollowups, followUpsMade: actualFollowUps, collection,
      categories: summary,
    };
  }, [userLeads, periodLeads, activityLogs, currentUser, actualConvertedCount, actualRevenue, actualInterested, actualCallsMade, actualFollowUps, dueTotal, globalPeriod]);

  // ─── Target metrics ──────────────────────────────────────────────────────────
  const targetMetrics = useMemo(() => {
    if (!currentUser) return { target: "0.00", achieved: "0.00", remaining: "0.00", pct: 0 };
    const u         = currentUser.username.toLowerCase();
    const userTargets = targets.filter(t => t.username?.toLowerCase() === u || t.user?.toLowerCase() === u);
    
    // Find the active target for the user
    const match = userTargets.find(t => t.status === "Active") || userTargets[0];
    
    let targetVal = 0;
    if (match) {
      const bucket = {
        today: "daily", yesterday: "daily",
        this_week: "weekly", last_week: "weekly",
        this_year: "yearly",
      }[globalPeriod] || "monthly";
      const multiplier = globalPeriod.endsWith("_quarter") ? 3 : 1;
      targetVal = (Number(match[bucket]?.revenueTarget) || 0) * multiplier;
    }
    
    // Scale down the achieved revenue to Lakhs for display
    const achievedLakhs = actualRevenue / 100000;
    const achieved  = Number(achievedLakhs);
    const remaining = Math.max(0, targetVal - achieved);
    
    return {
      target:    targetVal.toFixed(2),
      achieved:  achieved.toFixed(2),
      remaining: remaining.toFixed(2),
      pct:       targetVal > 0 ? Math.min(100, Math.round((achieved / targetVal) * 100)) : (achieved > 0 ? 100 : 0),
    };
  }, [currentUser, targets, actualRevenue, globalPeriod]);

  // ─── Follow-ups list ─────────────────────────────────────────────────────────


  // ─── Donut segments ──────────────────────────────────────────────────────────
  const donutData = [
    { name: "New Leads", value: statsMetrics.categories?.newLeads  || 0, color: "#0b57d0" },
    { name: "Hot Leads", value: statsMetrics.categories?.hot       || 0, color: "#f24259" },
    { name: "Warm Leads",value: statsMetrics.categories?.warm      || 0, color: "#ffa800" },
    { name: "Cold Leads", value: statsMetrics.categories?.cold     || 0, color: "#00a499" },
    { name: "Converted",  value: statsMetrics.categories?.converted || 0, color: "#845ef7" },
    ...((statsMetrics.categories?.other || 0) > 0 ? [{ name: "Other", value: statsMetrics.categories.other, color: "#94a3b8" }] : []),
  ];

  // ─── Stat card detail modals (Total Leads / Calls Made) ───────────────────────
  // Lead assignments point at CRM events (the ones in the sidebar's Projects menu).
  const eventList = useSelector((state) => state.crmEvents?.events) || [];
  const [detailModal, setDetailModal] = useState(null); // "TOTAL LEADS" | "CALLS MADE" | null
  const [statusUpdates, setStatusUpdates] = useState([]);
  const [statusUpdatesLoading, setStatusUpdatesLoading] = useState(false);
  const [interestedClients, setInterestedClients] = useState([]);
  const [interestedLoading, setInterestedLoading] = useState(false);

  const eventNameOf = (id) => {
    const ev = eventList.find((e) => String(e._id) === String(id));
    return ev ? (ev.event_fullName || ev.event_name || "") : "";
  };
  const fmtDateTime = (d) => (d ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date(d)) : "-");
  // Status updates are stored as "[Status Update] Changes by X • Next action: Y • Remark: text".
  // Only the user's remark is shown; system-generated notes (no "Remark:" part) stay blank.
  const remarkOnly = (msg) => {
    const m = String(msg || "").match(/Remark:\s*([\s\S]*)$/i);
    return m ? m[1].trim() : "";
  };
  const periodLabel = (PERIOD_LABELS[globalPeriod] || globalPeriod);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    setStatusUpdatesLoading(true);
    api.get(`/api/user-targets/stats/status-updates?username=${encodeURIComponent(currentUser.username)}&period=${globalPeriod}`)
      .then((res) => { if (!cancelled) setStatusUpdates(res.data?.success ? res.data.data : []); })
      .catch(() => { if (!cancelled) setStatusUpdates([]); })
      .finally(() => { if (!cancelled) setStatusUpdatesLoading(false); });
    return () => { cancelled = true; };
  }, [currentUser, globalPeriod]);

  useEffect(() => {
    if (detailModal !== "INTERESTED" || !currentUser) return;
    let cancelled = false;
    setInterestedLoading(true);
    api.get(`/api/user-targets/stats/interested-clients?username=${encodeURIComponent(currentUser.username)}&period=${globalPeriod}`)
      .then((res) => { if (!cancelled) setInterestedClients(res.data?.success ? res.data.data : []); })
      .catch(() => { if (!cancelled) setInterestedClients([]); })
      .finally(() => { if (!cancelled) setInterestedLoading(false); });
    return () => { cancelled = true; };
  }, [detailModal, currentUser, globalPeriod]);

  // Follow-up status updates in this Duration (same statuses the FOLLOW-UPS card counts).
  const followUpRows = useMemo(
    () => statusUpdates.filter((u) => /^\s*(follow[\s-]?up|contacted)/i.test(u.status || "")),
    [statusUpdates],
  );

  // "<Period>'s Follow-ups" table: the Contacted / Follow-up status updates made in this Duration
  // (the same ones the FOLLOW-UPS card counts), one row per client with their latest update.
  const followupsList = useMemo(() => {
    const todayStart = getPeriodRange("today").start;
    const seen = new Set();
    return followUpRows
      .filter((u) => {
        const key = String(u.companyId || u._id);
        if (seen.has(key)) return false; // rows arrive newest first
        seen.add(key);
        return true;
      })
      .slice(0, 50)
      .map((u) => {
        const lead = companies.find((c) => String(c._id) === String(u.companyId));
        const contact = lead?.contacts?.[0] || {};
        const nextDate = u.followUpDate ? new Date(u.followUpDate) : null;
        const validNext = nextDate && !isNaN(nextDate) ? nextDate : null;
        const diff = Math.floor((Date.now() - new Date(u.at)) / 86400000);
        return {
          id: u._id,
          name: `${contact.firstName || ""} ${contact.surname || ""}`.trim() || "-",
          company: u.companyName || lead?.companyName || "-",
          time: validNext ? validNext.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-",
          date: validNext ? validNext.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "No date",
          overdue: !!validNext && validNext < todayStart,
          priority: "Medium",
          priorityColor: "bg-amber-50 text-amber-600 border border-amber-200",
          status: u.status || "Follow-up",
          phone: contact.mobile || "",
          lastConv: remarkOnly(u.remark) || u.status || "Follow-up scheduled",
          convTime: diff <= 0 ? "Today" : diff === 1 ? "Yesterday" : `${diff} days ago`,
        };
      });
  }, [followUpRows, companies]);

  // One row per lead assigned in this duration: to whom, when, by whom, for which event.
  const assignedLeadRows = useMemo(() => {
    if (!currentUser) return [];
    const u = currentUser.username.toLowerCase();
    return periodLeads.map((c) => {
      const a = (c.eventAssignments || []).filter((x) => x.forwardTo?.toLowerCase() === u)
        .sort((x, y) => new Date(y.assignedAt || y.createdAt || 0) - new Date(x.assignedAt || x.createdAt || 0))[0];
      return {
        _id: c._id,
        companyName: c.companyName,
        assignedTo: a?.forwardTo || c.forwardTo || currentUser.username,
        assignedOn: assignedAtOf(c, currentUser.username),
        assignedBy: a?.assignedBy || c.added_by || "",
        eventName: eventNameOf(a?.eventId || c.eventId || c.events?.[0]),
        status: c.companyStatus || "",
      };
    }).sort((x, y) => new Date(y.assignedOn || 0) - new Date(x.assignedOn || 0));
  }, [periodLeads, currentUser, eventList]);

  const isAccountRole = currentUser?.role?.toLowerCase() === "ihwe-account manager" || currentUser?.role?.toLowerCase() === "ihwe-accounts executive";
 

  return (
    <div className="w-full bg-white px-3 sm:px-6 py-2 font-sans">
      {/* Row 0 — Header */}
      <DashboardHeader fullProfile={fullProfile} currentUser={currentUser} loading={loading} globalPeriod={globalPeriod} setGlobalPeriod={setGlobalPeriod} />

      {/* Row 1 — 8 Stat Cards */}
      <DashboardStatsGrid statsMetrics={statsMetrics} onCardClick={setDetailModal} />

      {/* Row 2 — Lead Summary | Follow-ups | Target Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-2 mb-1.5">
        <LeadSummaryCard donutData={donutData} totalLeads={statsMetrics.summaryTotal} />
        <FollowupsTable  followupsList={followupsList} loading={loading} globalPeriod={globalPeriod} />
        <TargetGaugeCard targetMetrics={targetMetrics} />
      </div>

      {/* Row 3 — Performance | Recent Activities | Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-2 mb-1.5">
        <PerformanceOverview statsMetrics={statsMetrics} globalPeriod={globalPeriod} />
        <RecentActivities    activityLogs={activityLogs} />
        <QuickActions />
      </div>

      {/* Row 4 — Top Leads | Leaderboard | Reminders | Next Action */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 items-stretch">
        <TopLeadsCard     userLeads={userLeads} />
        <SalesLeaderboard leaderboard={actualLeaderboard} currentUser={currentUser} />
        <RemindersCard    userLeads={userLeads} />
        <NextActionPanel />
      </div>


      {detailModal === "TOTAL LEADS" && (
        <DashboardDetailModal
          title="Total Leads - Assigned Leads"
          subtitle={`Leads assigned to ${currentUser?.username || "you"} - ${periodLabel}`}
          rows={assignedLeadRows}
          columns={[
            { key: "companyName", label: "Company" },
            { key: "assignedTo", label: "Assigned To", render: (r) => <span className="font-semibold capitalize">{r.assignedTo}</span> },
            { key: "assignedOn", label: "Assigned On", render: (r) => fmtDateTime(r.assignedOn) },
            { key: "assignedBy", label: "Assigned By", render: (r) => <span className="capitalize">{r.assignedBy || "-"}</span> },
            { key: "eventName", label: "Event" },
            { key: "status", label: "Status" },
          ]}
          onClose={() => setDetailModal(null)}
        />
      )}
      {detailModal === "INTERESTED" && (
        <DashboardDetailModal
          title="Interested - Hot Lead Clients"
          subtitle={`Clients with a Proforma Invoice raised - ${periodLabel}`}
          loading={interestedLoading}
          rows={interestedClients}
          columns={[
            { key: "companyName", label: "Client", render: (r) => r.companyName || "-" },
            { key: "piNo", label: "Last PI No", render: (r) => <span className="font-semibold whitespace-nowrap">{r.piNo || "-"}</span> },
            { key: "piDate", label: "PI Date", render: (r) => fmtDateTime(r.piDate) },
            { key: "piAmount", label: "PI Amount", render: (r) => <span className="font-semibold whitespace-nowrap">{"\u20B9 " + Number(r.piAmount || 0).toLocaleString("en-IN")}</span> },
            { key: "eventName", label: "Event", render: (r) => r.eventName || "-" },
            { key: "status", label: "Status" },
            { key: "remark", label: "Remark", render: (r) => r.remark || "-" },
            { key: "handledBy", label: "Handled By", render: (r) => <span className="capitalize">{r.handledBy || "-"}</span> },
          ]}
          onClose={() => setDetailModal(null)}
        />
      )}
      {detailModal === "PAYMENTS DUE" && (
        <DashboardDetailModal
          title="Payments Due - Outstanding"
          subtitle={`Total due ₹ ${dueRows.reduce((sum, r) => sum + Number(r.due || 0), 0).toLocaleString("en-IN")} from ${dueRows.length} client${dueRows.length === 1 ? "" : "s"}`}
          rows={dueRows}
          emptyText="No payments due"
          columns={[
            { key: "companyName", label: "Client", render: (r) => r.companyName || "-" },
            { key: "eventName", label: "Event", render: (r) => r.eventName || "-" },
            { key: "total", label: "Total Payable", render: (r) => <span className="whitespace-nowrap">{"₹ " + Number(r.total || 0).toLocaleString("en-IN")}</span> },
            { key: "paid", label: "Paid", render: (r) => <span className="whitespace-nowrap">{"₹ " + Number(r.paid || 0).toLocaleString("en-IN")}</span> },
            { key: "due", label: "Due", render: (r) => <span className="font-semibold text-red-600 whitespace-nowrap">{"₹ " + Number(r.due || 0).toLocaleString("en-IN")}</span> },
            { key: "nextDueDate", label: "Next Due Date", render: (r) => r.nextDueDate ? <span className={`whitespace-nowrap ${new Date(r.nextDueDate) < new Date() ? "text-red-600 font-semibold" : ""}`}>{fmtDateTime(r.nextDueDate)}{new Date(r.nextDueDate) < new Date() ? " (overdue)" : ""}</span> : "-" },
            { key: "status", label: "Payment Status", render: (r) => ({ confirmed: "Confirmed", approved: "Approved", "advance-paid": "Installment" }[r.status] || r.status || "-") },
            { key: "handledBy", label: "Handled By", render: (r) => <span className="capitalize">{r.handledBy || "-"}</span> },
          ]}
          onClose={() => setDetailModal(null)}
        />
      )}
      {detailModal === "FOLLOW-UPS" && (
        <DashboardDetailModal
          title="Follow-Ups - Status Updates"
          subtitle={`Contacted / Follow-up status updates - ${periodLabel}`}
          loading={statusUpdatesLoading}
          rows={followUpRows}
          columns={[
            { key: "companyName", label: "Client", render: (r) => r.companyName || "-" },
            { key: "eventName", label: "Event", render: (r) => eventNameOf(r.eventId) || r.eventName || "-" },
            { key: "status", label: "Status" },
            { key: "followUpDate", label: "Next Follow-Up", render: (r) => (r.followUpDate ? fmtDateTime(r.followUpDate) : "-") },
            { key: "remark", label: "Remark", render: (r) => remarkOnly(r.remark) || "-" },
            { key: "by", label: "Updated By", render: (r) => <span className="capitalize">{r.by || "-"}</span> },
            { key: "at", label: "When", render: (r) => fmtDateTime(r.at) },
          ]}
          onClose={() => setDetailModal(null)}
        />
      )}
      {detailModal === "REVENUE" && (
        <DashboardDetailModal
          title="Revenue - Client Wise"
          subtitle={`Total ₹ ${bookedRegistrations.reduce((sum, r) => sum + Number(r.amount || 0), 0).toLocaleString("en-IN")} from ${bookedRegistrations.length} client${bookedRegistrations.length === 1 ? "" : "s"} - ${periodLabel}`}
          rows={bookedRegistrations}
          columns={[
            { key: "companyName", label: "Client", render: (r) => r.companyName || "-" },
            { key: "eventName", label: "Event", render: (r) => r.eventName || "-" },
            { key: "amount", label: "Revenue", render: (r) => <span className="font-semibold whitespace-nowrap">{"₹ " + Number(r.amount || 0).toLocaleString("en-IN")}</span> },
            { key: "status", label: "Payment Status", render: (r) => ({ paid: "Paid (Full)", confirmed: "Confirmed", "advance-paid": "Installment" }[r.status] || r.status || "-") },
            { key: "bookedOn", label: "Booked On", render: (r) => fmtDateTime(r.bookedOn) },
            { key: "handledBy", label: "Handled By", render: (r) => <span className="capitalize">{r.handledBy || "-"}</span> },
          ]}
          onClose={() => setDetailModal(null)}
        />
      )}
      {detailModal === "STALL BOOKED" && (
        <DashboardDetailModal
          title="Stall Booked - Converted Clients"
          subtitle={`Clients who booked a stall - ${periodLabel}`}
          rows={bookedRegistrations}
          columns={[
            { key: "companyName", label: "Client", render: (r) => r.companyName || "-" },
            { key: "eventName", label: "Event", render: (r) => r.eventName || "-" },
            { key: "stallNo", label: "Stall", render: (r) => [r.stallNo, r.stallSize ? `${r.stallSize} sqm` : ""].filter(Boolean).join(" - ") || "-" },
            { key: "amount", label: "Amount", render: (r) => <span className="font-semibold whitespace-nowrap">{"₹ " + Number(r.amount || 0).toLocaleString("en-IN")}</span> },
            { key: "status", label: "Payment Status", render: (r) => ({ paid: "Paid (Full)", confirmed: "Confirmed", "advance-paid": "Installment" }[r.status] || r.status || "-") },
            { key: "bookedOn", label: "Booked On", render: (r) => fmtDateTime(r.bookedOn) },
            { key: "handledBy", label: "Handled By", render: (r) => <span className="capitalize">{r.handledBy || "-"}</span> },
          ]}
          onClose={() => setDetailModal(null)}
        />
      )}
      {detailModal === "CALLS MADE" && (
        <DashboardDetailModal
          title="Calls Made - Status Updates"
          subtitle={`Which status was set on which client - ${periodLabel}`}
          loading={statusUpdatesLoading}
          rows={statusUpdates}
          columns={[
            { key: "companyName", label: "Client", render: (r) => r.companyName || "-" },
            { key: "status", label: "Status Set" },
            { key: "remark", label: "Remark", render: (r) => remarkOnly(r.remark) || "-" },
            { key: "forwardTo", label: "Forwarded To", render: (r) => <span className="capitalize">{r.forwardTo || "-"}</span> },
            { key: "eventName", label: "Event", render: (r) => eventNameOf(r.eventId) || r.eventName || "-" },
            { key: "by", label: "Updated By", render: (r) => <span className="capitalize">{r.by || "-"}</span> },
            { key: "at", label: "When", render: (r) => fmtDateTime(r.at) },
          ]}
          onClose={() => setDetailModal(null)}
        />
      )}
    </div>
  );
}
