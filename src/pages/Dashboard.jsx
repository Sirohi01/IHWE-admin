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

export default function Dashboard() {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);
  const [fullProfile, setFullProfile] = useState(null);
  const [companies,   setCompanies]   = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [targets,     setTargets]     = useState([]);
  const [allAdmins,   setAllAdmins]   = useState([]);
  const [loading,     setLoading]     = useState(true);

  // ─── Init: user context + targets ───────────────────────────────────────────
  useEffect(() => {
    const info = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
    if (info) {
      try { setCurrentUser(JSON.parse(info)); }
      catch (e) { console.error("Error parsing adminInfo", e); }
    }
    try {
      const raw = localStorage.getItem("app_user_targets_v1");
      setTargets(raw ? JSON.parse(raw) : []);
    } catch (e) { console.error("Error reading targets", e); }
  }, []);

  // ─── Fetch dashboard data ────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [compRes, actRes, admRes] = await Promise.all([
          api.get("/api/companies"),
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

    const todayStr  = new Date().toDateString();
    const callsMadeToday = activityLogs.filter(log =>
      log.user?.toLowerCase() === currentUser?.username?.toLowerCase() &&
      new Date(log.createdAt).toDateString() === todayStr
    ).length || 12;

    const revenue          = (converted * 1.50).toFixed(2);
    const pendingFollowups = userLeads.filter(c => c.reminder && new Date(c.reminder) > new Date()).length || 8;
    const collection       = (converted * 0.35).toFixed(2);

    return {
      total, callsMadeToday, interested: warm, meetings: hot,
      closed: converted, revenue, pendingFollowups, collection,
      categories: { newLeads, hot, warm, cold, converted },
    };
  }, [userLeads, activityLogs, currentUser]);

  // ─── Target metrics ──────────────────────────────────────────────────────────
  const targetMetrics = useMemo(() => {
    if (!currentUser) return { target: "15.00", achieved: "0.00", remaining: "15.00", pct: 0 };
    const u         = currentUser.username.toLowerCase();
    const match     = targets.find(t => t.user.toLowerCase() === u);
    const targetVal = match ? Number(match.target) : 15;
    const achieved  = Number(statsMetrics.revenue);
    const remaining = Math.max(0, targetVal - achieved);
    return {
      target:    targetVal.toFixed(2),
      achieved:  achieved.toFixed(2),
      remaining: remaining.toFixed(2),
      pct:       Math.min(100, Math.round((achieved / targetVal) * 100)),
    };
  }, [currentUser, targets, statsMetrics.revenue]);

  // ─── Leaderboard ─────────────────────────────────────────────────────────────
  const leaderboard = useMemo(() =>
    allAdmins.map(admin => {
      const u = admin.username;
      const count = companies.filter(c =>
        (c.forwardTo?.toLowerCase() === u.toLowerCase() || c.added_by?.toLowerCase() === u.toLowerCase()) &&
        ["adc. recd", "inv. req.", "under pymt followups"].includes(c.companyStatus?.toLowerCase())
      ).length;
      return { name: admin.fullName || u, username: u, revenue: count * 1.50 };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5),
  [companies, allAdmins]);

  // ─── Follow-ups list ─────────────────────────────────────────────────────────
  const followupsList = useMemo(() =>
    userLeads.filter(c => c.reminder).slice(0, 5).map(c => {
      const contact = c.contacts?.[0] || {};
      const remDate = new Date(c.reminder);
      let priority = "Medium";
      let priorityColor = "bg-amber-50 text-amber-700 border border-amber-200";
      if (c.companyStatus === "Est./PI Sent") {
        priority = "High"; priorityColor = "bg-rose-50 text-rose-700 border border-rose-200";
      } else if (c.companyStatus === "Not Interested") {
        priority = "Low";  priorityColor = "bg-slate-50 text-slate-700 border border-slate-200";
      }
      return {
        id:            c._id,
        name:          `${contact.firstName || "Client"} ${contact.surname || ""}`,
        company:       c.companyName || "Company Name",
        time:          remDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        priority, priorityColor,
        status:        c.companyStatus || "Follow-up",
        phone:         contact.mobile || "",
      };
    }),
  [userLeads]);

  // ─── Donut segments ──────────────────────────────────────────────────────────
  const donutData = [
    { name: "New Leads", value: statsMetrics.categories?.newLeads  || 0, color: "#3b82f6" },
    { name: "Hot Leads", value: statsMetrics.categories?.hot       || 0, color: "#f97316" },
    { name: "Warm Leads",value: statsMetrics.categories?.warm      || 0, color: "#14b8a6" },
    { name: "Cold Leads", value: statsMetrics.categories?.cold     || 0, color: "#94a3b8" },
    { name: "Converted",  value: statsMetrics.categories?.converted|| 0, color: "#10b981" },
  ].filter(d => d.value > 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] px-6 py-6 font-sans">
      {/* Row 0 — Header */}
      <DashboardHeader fullProfile={fullProfile} currentUser={currentUser} loading={loading} />

      {/* Row 1 — 8 Stat Cards */}
      <DashboardStatsGrid statsMetrics={statsMetrics} />

      {/* Row 2 — Lead Summary | Follow-ups | Target Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <LeadSummaryCard donutData={donutData} totalLeads={statsMetrics.total} />
        <FollowupsTable  followupsList={followupsList} />
        <TargetGaugeCard targetMetrics={targetMetrics} />
      </div>

      {/* Row 3 — Performance | Recent Activities | Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <PerformanceOverview statsMetrics={statsMetrics} />
        <RecentActivities    activityLogs={activityLogs} />
        <QuickActions />
      </div>

      {/* Row 4 — Top Leads | Leaderboard | Reminders | Next Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" style={{ minHeight: '220px' }}>
        <TopLeadsCard     userLeads={userLeads} />
        <SalesLeaderboard leaderboard={leaderboard} currentUser={currentUser} />
        <RemindersCard    userLeads={userLeads} />
        <NextActionPanel  userLeads={userLeads} />
      </div>

    </div>
  );
}