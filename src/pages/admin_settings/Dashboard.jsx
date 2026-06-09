import { useEffect, useState, useMemo } from "react";
import api from "../../lib/api";

// ─── Sub-components ───────────────────────────────────────────────────────────
import DashboardHeader      from "../dashboard/DashboardHeader";
import DashboardStatsGrid   from "../dashboard/DashboardStatsGrid";
import LeadSummaryCard      from "../dashboard/LeadSummaryCard";
import FollowupsTable       from "../dashboard/FollowupsTable";
import TargetGaugeCard      from "../dashboard/TargetGaugeCard";
import PerformanceOverview  from "../dashboard/PerformanceOverview";
import RecentActivities     from "../dashboard/RecentActivities";
import QuickActions         from "../dashboard/QuickActions";
import TopLeadsCard         from "../dashboard/TopLeadsCard";
import SalesLeaderboard     from "../dashboard/SalesLeaderboard";
import RemindersCard        from "../dashboard/RemindersCard";
import NextActionPanel      from "../dashboard/NextActionPanel";
import AccountDashboard     from "../dashboard/AccountDashboard";

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
  const [fullProfile, setFullProfile] = useState(null);
  const [companies,   setCompanies]   = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [targets,     setTargets]     = useState([]);
  const [allAdmins,   setAllAdmins]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  
  const [actualRevenue, setActualRevenue] = useState(0);
  const [actualConvertedCount, setActualConvertedCount] = useState(0);
  const [actualLeaderboard, setActualLeaderboard] = useState([]);
  const [revenuePeriod, setRevenuePeriod] = useState("this_month");
  const [leaderboardPeriod, setLeaderboardPeriod] = useState("this_month");
  const [callsPeriod, setCallsPeriod] = useState("today");

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
    const fetchRevenue = async () => {
      try {
        const res = await api.get(`/api/companies/achievement-revenue?username=${encodeURIComponent(currentUser.username)}&period=${revenuePeriod}`);
        if (res.data?.success) {
          setActualRevenue(res.data.revenue || 0);
          setActualConvertedCount(res.data.convertedCount || 0);
        }
      } catch (err) {
        console.error("Error fetching achievement revenue", err);
      }
    };
    
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get(`/api/companies/leaderboard?period=${leaderboardPeriod}`);
        if (res.data?.success) {
          setActualLeaderboard(res.data.leaderboard || []);
        }
      } catch (err) {
        console.error("Error fetching leaderboard", err);
      }
    };
    
    fetchLeaderboard();
  }, [currentUser, leaderboardPeriod]);

  // ─── Fetch real revenue based on period ─────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const fetchRevenue = async () => {
      try {
        const res = await api.get(`/api/companies/achievement-revenue?username=${encodeURIComponent(currentUser.username)}&period=${revenuePeriod}`);
        if (res.data?.success) {
          setActualRevenue(res.data.revenue || 0);
          setActualConvertedCount(res.data.convertedCount || 0);
        }
      } catch (err) {
        console.error("Error fetching achievement revenue", err);
      }
    };
    fetchRevenue();
  }, [currentUser, revenuePeriod]);

  // ─── Fetch actual calls made from CallLogs ───────────────────────────────────
  const [actualCallsMade, setActualCallsMade] = useState(0);
  useEffect(() => {
    if (!currentUser) return;
    const fetchCalls = async () => {
      try {
        // Find user ID (from fullProfile if available, else fallback to currentUser._id)
        const userId = fullProfile?._id || fullProfile?.id || currentUser?._id || currentUser?.id || "";
        const res = await api.get(`/api/user-targets/stats/dashboard?username=${encodeURIComponent(currentUser.username)}&userId=${encodeURIComponent(userId)}&period=${callsPeriod}`);
        if (res.data?.success) {
          setActualCallsMade(res.data.completed.call || 0);
        }
      } catch (err) {
        console.error("Error fetching calls made", err);
      }
    };
    fetchCalls();
  }, [currentUser, fullProfile, callsPeriod]);

  // ─── Fetch dashboard data ────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [compRes, actRes, admRes] = await Promise.all([
          api.get(`/api/companies?dashboard=true&username=${encodeURIComponent(currentUser.username)}&role=${encodeURIComponent(currentUser.role || '')}`),
          api.get("/api/activity-logs"),
          api.get("/api/admin/public-list"),
        ]);
        if (compRes.data)                            setCompanies(compRes.data);
        if (actRes.data?.success)                    setActivityLogs(actRes.data.data || []);
        if (admRes.data?.success) {
          setAllAdmins(admRes.data.data || []);
          const match = admRes.data.data.find(
            u => u.username.toLowerCase() === currentUser.username.toLowerCase()
          );
          if (match) setFullProfile(match);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  // ─── Scoped leads for active user ────────────────────────────────────────────
  const userLeads = useMemo(() => {
    if (!currentUser) return [];
    const u = currentUser.username.toLowerCase();
    return companies.filter(c =>
      c.forwardTo?.toLowerCase() === u || c.added_by?.toLowerCase() === u
    );
  }, [companies, currentUser]);

  // ─── Stats metrics ───────────────────────────────────────────────────────────
  const statsMetrics = useMemo(() => {
    const total     = userLeads.length;
    const converted = userLeads.filter(c =>
      ["adc. recd", "inv. req.", "under pymt followups"].includes(c.companyStatus?.toLowerCase())
    ).length;
    const warm      = userLeads.filter(c =>
      ["warm client", "follow-up call", "sent details"].includes(c.companyStatus?.toLowerCase())
    ).length;
    const hot       = userLeads.filter(c => c.companyStatus?.toLowerCase() === "est./pi sent").length;
    const cold      = userLeads.filter(c => c.companyStatus?.toLowerCase() === "not interested").length;
    const newLeads  = userLeads.filter(c => c.companyStatus?.toLowerCase() === "new lead").length;

    const callsMade = actualCallsMade;

    const revenue          = (actualRevenue / 100000).toFixed(2);
    const pendingFollowups = userLeads.filter(c => c.reminder && new Date(c.reminder) > new Date()).length;
    const collection       = (converted * 0.35).toFixed(2);

    return {
      total, callsMade, interested: warm, meetings: hot,
      closed: actualConvertedCount, revenue, pendingFollowups, collection,
      categories: { newLeads, hot, warm, cold, converted: actualConvertedCount },
    };
  }, [userLeads, activityLogs, currentUser, actualConvertedCount, actualRevenue, callsPeriod]);

  // ─── Target metrics ──────────────────────────────────────────────────────────
  const targetMetrics = useMemo(() => {
    if (!currentUser) return { target: "0.00", achieved: "0.00", remaining: "0.00", pct: 0 };
    const u         = currentUser.username.toLowerCase();
    const userTargets = targets.filter(t => t.username?.toLowerCase() === u || t.user?.toLowerCase() === u);
    
    // Find the active target for the user
    const match = userTargets.find(t => t.status === "Active") || userTargets[0];
    
    let targetVal = 0;
    if (match) {
      if (revenuePeriod === "today") targetVal = Number(match.daily?.revenueTarget) || 0;
      else if (revenuePeriod === "this_week") targetVal = Number(match.weekly?.revenueTarget) || 0;
      else if (revenuePeriod === "this_month") targetVal = Number(match.monthly?.revenueTarget) || 0;
      else if (revenuePeriod === "this_year") targetVal = Number(match.yearly?.revenueTarget) || 0;
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
  }, [currentUser, targets, actualRevenue, revenuePeriod]);

  // ─── Follow-ups list ─────────────────────────────────────────────────────────
  const followupsList = useMemo(() =>
    userLeads.filter(c => c.reminder).slice(0, 5).map(c => {
      const contact = c.contacts?.[0] || {};
      const remDate = new Date(c.reminder);
      let priority = "Medium";
      let priorityColor = "bg-amber-50 text-amber-600 border border-amber-200";
      if (c.companyStatus === "Est./PI Sent") {
        priority = "High"; priorityColor = "bg-rose-50 text-rose-600 border border-rose-200";
      } else if (c.companyStatus === "Not Interested") {
        priority = "Low";  priorityColor = "bg-emerald-50 text-emerald-600 border border-emerald-200";
      }
      const lastConv = c.lastNote || c.companyStatus || "Follow-up scheduled";
      const convTime = c.updatedAt
        ? (() => {
            const diff = Math.floor((Date.now() - new Date(c.updatedAt)) / 86400000);
            if (diff === 0) return "Today";
            if (diff === 1) return "Yesterday";
            return `${diff} days ago`;
          })()
        : "";

      return {
        id:            c._id,
        name:          `${contact.firstName || "Client"} ${contact.surname || ""}`.trim(),
        company:       c.companyName || "Company Name",
        time:          remDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date:          remDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        priority, priorityColor,
        status:        c.companyStatus || "Follow-up",
        phone:         contact.mobile || "",
        lastConv,
        convTime,
      };
    }),
  [userLeads]);

  // ─── Donut segments ──────────────────────────────────────────────────────────
  const donutData = [
    { name: "New Leads", value: statsMetrics.categories?.newLeads  || 0, color: "#0b57d0" },
    { name: "Hot Leads", value: statsMetrics.categories?.hot       || 0, color: "#f24259" },
    { name: "Warm Leads",value: statsMetrics.categories?.warm      || 0, color: "#ffa800" },
    { name: "Cold Leads", value: statsMetrics.categories?.cold     || 0, color: "#00a499" },
    { name: "Converted",  value: actualConvertedCount              || 0, color: "#845ef7" },
  ];

  const isAccountRole = currentUser?.role?.toLowerCase() === "ihwe-account manager" || currentUser?.role?.toLowerCase() === "ihwe-accounts executive";
  if (isAccountRole) {
    return <AccountDashboard currentUser={currentUser} loading={loading} />;
  }

  return (
    <div className="w-full bg-[#f8fafc] px-3 sm:px-6 py-2 font-sans">
      {/* Row 0 — Header */}
      <DashboardHeader fullProfile={fullProfile} currentUser={currentUser} loading={loading} />

      {/* Row 1 — 8 Stat Cards */}
      <DashboardStatsGrid statsMetrics={statsMetrics} callsPeriod={callsPeriod} setCallsPeriod={setCallsPeriod} />

      {/* Row 2 — Lead Summary | Follow-ups | Target Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-2 mb-1.5">
        <LeadSummaryCard donutData={donutData} totalLeads={statsMetrics.total} />
        <FollowupsTable  followupsList={followupsList} />
        <TargetGaugeCard targetMetrics={targetMetrics} revenuePeriod={revenuePeriod} setRevenuePeriod={setRevenuePeriod} />
      </div>

      {/* Row 3 — Performance | Recent Activities | Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-2 mb-1.5">
        <PerformanceOverview statsMetrics={statsMetrics} />
        <RecentActivities    activityLogs={activityLogs} />
        <QuickActions />
      </div>

      {/* Row 4 — Top Leads | Leaderboard | Reminders | Next Action */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 items-stretch">
        <TopLeadsCard     userLeads={userLeads} />
        <SalesLeaderboard leaderboard={actualLeaderboard} currentUser={currentUser} leaderboardPeriod={leaderboardPeriod} setLeaderboardPeriod={setLeaderboardPeriod} />
        <RemindersCard    userLeads={userLeads} />
        <NextActionPanel />
      </div>

    </div>
  );
}
