import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, UserCheck, FileText, Handshake, Flame, IndianRupee, Search,
  ChevronDown, Settings, MoreVertical,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import api from "../lib/api";
import { getAdminInfo } from "../utils/roles";
import { getPeriodRange } from "../utils/periodRange";
import { toTitleCase } from "../utils/toTitleCase";
import {
  PERIOD_OPTIONS, PREV_PERIOD, COLUMNS, STATUS_BUCKETS, BAR_COLORS, AVATAR_COLORS,
  isFollowUp, inr, pctChange, inRange, Delta,
} from "../utils/salesTeam";



export default function SalesTeamDashboard() {
  const navigate = useNavigate();
  const me = getAdminInfo();
  const [admins, setAdmins] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [payments, setPayments] = useState([]);
  const [estimates, setEstimates] = useState([]); // Proforma Invoices (PI)
  const [revenue, setRevenue] = useState({}); // { periodKey: { username: revenue } }
  const [conv, setConv] = useState({}); // { periodKey: { username: clients who paid in that period } }
  const [period, setPeriod] = useState("today");
  const [teamFilter, setTeamFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [hiddenCols, setHiddenCols] = useState([]);
  const [colsOpen, setColsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const keys = PERIOD_OPTIONS.map((p) => p.key);
        const [admRes, compRes, payRes, estRes, ...lbRes] = await Promise.all([
          api.get("/api/admin/public-list"),
          api.get(`/api/companies?dashboard=true&username=${encodeURIComponent(me.username || "")}&role=${encodeURIComponent(me.role || "")}`),
          api.get("/api/payments").catch(() => ({ data: [] })),
          api.get("/api/estimates").catch(() => ({ data: [] })),
          ...keys.map((k) => api.get(`/api/companies/leaderboard?period=${k}`)),
        ]);
        if (cancelled) return;
        if (admRes.data?.success) setAdmins(admRes.data.data || []);
        setCompanies(Array.isArray(compRes.data) ? compRes.data : []);
        const pays = Array.isArray(payRes.data) ? payRes.data : payRes.data?.data || [];
        setPayments(Array.isArray(pays) ? pays : []);
        const ests = Array.isArray(estRes.data) ? estRes.data : estRes.data?.data || [];
        setEstimates(Array.isArray(ests) ? ests : []);
        const rev = {};
        keys.forEach((k, i) => {
          rev[k] = {};
          (lbRes[i].data?.leaderboard || []).forEach((r) => { rev[k][r.username?.toLowerCase()] = r.revenue || 0; });
        });
        setRevenue(rev);
      } catch (err) {
        console.error("Sales team dashboard fetch error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const salesUsernames = useMemo(
    () => admins.filter((a) => a.username).map((a) => a.username),
    [admins],
  );

  // Conversions = clients who made a payment in the Duration (same source as the personal dashboard).
  useEffect(() => {
    if (!salesUsernames.length) return;
    const keys = [...new Set([period, PREV_PERIOD[period], ...COLUMNS.map((c) => c.key)].filter(Boolean))].filter((k) => !conv[k]);
    if (!keys.length) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(keys.map(async (k) => {
        const counts = {};
        await Promise.all(salesUsernames.map(async (u) => {
          try {
            const res = await api.get(`/api/companies/achievement-revenue?username=${encodeURIComponent(u)}&period=${k}`);
            counts[u.toLowerCase()] = res.data?.convertedCount || 0;
          } catch { counts[u.toLowerCase()] = 0; }
        }));
        return [k, counts];
      }));
      if (!cancelled) setConv((c) => ({ ...c, ...Object.fromEntries(entries) }));
    })();
    return () => { cancelled = true; };
  }, [salesUsernames, period]);

  const team = useMemo(() => {
    const members = admins.filter((a) => a.username);
    return members.map((a) => {
      const u = a.username.toLowerCase();
      const mine = (x) => x.forwardTo?.toLowerCase() === u;
      const leads = companies.filter((c) => mine(c) || (c.eventAssignments || []).some(mine));
      const statusOf = (c) => {
        const asg = (c.eventAssignments || []).filter(mine)
          .sort((x, y) => new Date(y.updatedAt || 0) - new Date(x.updatedAt || 0))[0];
        return (asg?.status || c.companyStatus || "").trim().toLowerCase();
      };
      // A lead counts in a Duration by the date it was assigned to this member (falls back to creation date).
      const assignedAt = (c) => {
        const ts = (c.eventAssignments || []).filter((x) => mine(x) && (x.assignedAt || x.createdAt)).map((x) => new Date(x.assignedAt || x.createdAt).getTime());
        return ts.length ? Math.max(...ts) : c.createdAt;
      };
      const within = (key) => { const r = getPeriodRange(key); return leads.filter((c) => inRange(assignedAt(c), r)); };
      // Hot lead = one of this member's leads that had a PI (estimate) made in the Duration.
      const myIds = new Set(leads.map((c) => String(c._id)));
      const hotOf = (key) => {
        const r = getPeriodRange(key);
        return new Set(estimates
          .filter((e) => myIds.has(String(e.companyId || "")) && String(e.status || "").trim().toLowerCase() !== "cancelled"
            && inRange(e.estimate_date || e.createdAt, r))
          .map((e) => String(e.companyId))).size;
      };
      const stats = (ls, key) => ({
        leads: ls.length,
        hot: hotOf(key),
        followups: ls.filter((c) => isFollowUp(statusOf(c))).length,
        conversions: conv[key]?.[u] || 0,
      });
      const buckets = Object.fromEntries(COLUMNS.map((c) => [c.key, { ...stats(within(c.key), c.key), revenue: revenue[c.key]?.[u] || 0 }]));
      const prevKey = PREV_PERIOD[period];
      const periodStats = stats(within(period), period);
      const prevStats = prevKey ? stats(within(prevKey), prevKey) : null;
      return {
        username: a.username,
        name: a.fullName || a.username,
        role: a.role || "",
        totalLeads: periodStats.leads,
        followups: periodStats.followups,
        conversions: periodStats.conversions,
        hot: periodStats.hot,
        deltas: Object.fromEntries(["leads", "followups", "hot", "conversions"].map((k) => [k, prevStats ? pctChange(periodStats[k], prevStats[k]) : null])),
        buckets,
        periodStats,
        prevStats,
        periodRevenue: revenue[period]?.[u] || 0,
        prevRevenue: prevKey ? revenue[prevKey]?.[u] || 0 : null,
        totalRevenue: revenue[period]?.[u] || 0,
        statuses: within(period).map(statusOf),
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [admins, companies, estimates, revenue, conv, period]);

  const totals = useMemo(() => {
    const sum = (f) => team.reduce((s, m) => s + f(m), 0);
    const hasPrev = !!PREV_PERIOD[period];
    const d = (k) => (hasPrev ? pctChange(sum((m) => m.periodStats[k]), sum((m) => m.prevStats[k])) : null);
    return {
      members: team.length,
      leads: sum((m) => m.periodStats.leads),
      followups: sum((m) => m.periodStats.followups),
      conversions: sum((m) => m.periodStats.conversions),
      hot: sum((m) => m.periodStats.hot),
      revenue: sum((m) => m.periodRevenue),
      dLeads: d("leads"),
      dFollowups: d("followups"),
      dConversions: d("conversions"),
      dHot: d("hot"),
      dRevenue: hasPrev ? pctChange(sum((m) => m.periodRevenue), sum((m) => m.prevRevenue)) : null,
    };
  }, [team, period]);

  const statusData = useMemo(() => {
    const all = team.flatMap((m) => m.statuses);
    const data = STATUS_BUCKETS.map((b) => ({ name: b.name, color: b.color, value: all.filter(b.match).length }));
    const total = data.reduce((s, d) => s + d.value, 0);
    return { data, total };
  }, [team]);

  const revenueByMember = useMemo(() => {
    const sorted = team.filter((m) => m.periodRevenue > 0).sort((a, b) => b.periodRevenue - a.periodRevenue);
    const top = sorted.slice(0, 5).map((m) => ({ name: toTitleCase(m.name), value: m.periodRevenue }));
    const others = sorted.slice(5).reduce((s, m) => s + m.periodRevenue, 0);
    if (others > 0) top.push({ name: "Others", value: others });
    return top;
  }, [team]);

  const trendData = useMemo(() => {
    const { start, end } = getPeriodRange(period);
    const days = {};
    payments.forEach((p) => {
      const d = p.paymentDate || p.date || p.createdAt;
      const amt = Number(p.amount ?? p.paidAmount ?? p.totalAmount ?? 0);
      if (!d || !amt || !inRange(d, { start, end })) return;
      const key = new Date(d).toISOString().slice(0, 10);
      days[key] = (days[key] || 0) + amt;
    });
    const out = [];
    for (let t = new Date(start); t < end && t <= new Date(); t.setDate(t.getDate() + 1)) {
      const key = new Date(t.getTime() - t.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      out.push({ name: t.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), revenue: days[key] || 0 });
    }
    return out;
  }, [payments, period]);

  const roles = useMemo(() => [...new Set(team.map((m) => m.role).filter(Boolean))], [team]);
  const rows = team.filter((m) =>
    (teamFilter === "all" || m.role === teamFilter) &&
    `${m.name} ${m.username}`.toLowerCase().includes(query.toLowerCase()));
  const visibleCols = COLUMNS.filter((c) => !hiddenCols.includes(c.key));
  const periodLabel = PERIOD_OPTIONS.find((p) => p.key === period)?.label;

  const cards = [
    { label: "Total Team", value: totals.members, delta: null, icon: Users, bg: "bg-blue-50 border-blue-100", ic: "bg-blue-100 text-blue-600" },
    { label: "Total Leads Assigned", value: totals.leads.toLocaleString("en-IN"), delta: totals.dLeads, icon: UserCheck, bg: "bg-emerald-50 border-emerald-100", ic: "bg-emerald-100 text-emerald-600" },
    { label: "Total Follow-ups", value: totals.followups.toLocaleString("en-IN"), delta: totals.dFollowups, icon: FileText, bg: "bg-violet-50 border-violet-100", ic: "bg-violet-100 text-violet-600" },
    { label: "Total Hot Leads", value: totals.hot.toLocaleString("en-IN"), delta: totals.dHot, icon: Flame, bg: "bg-red-50 border-red-100", ic: "bg-red-100 text-red-600" },
    { label: "Total Conversions", value: totals.conversions.toLocaleString("en-IN"), delta: totals.dConversions, icon: Handshake, bg: "bg-orange-50 border-orange-100", ic: "bg-orange-100 text-orange-600" },
    { label: "Total Revenue", value: inr(totals.revenue), delta: totals.dRevenue, icon: IndianRupee, bg: "bg-teal-50 border-teal-100", ic: "bg-teal-100 text-teal-600" },
  ];

  const maxRev = Math.max(1, ...revenueByMember.map((r) => r.value));

  const CARD = { boxShadow: "rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em", fontFamily: "Inter, sans-serif" };
  const cardTitle = "text-xs font-bold text-slate-900 uppercase tracking-wide";
  const cardHead = "flex justify-between items-center -mx-3 -mt-3 mb-3 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg";

  return (
    <div className="w-full bg-white px-3 sm:px-6 py-2 font-sans" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-3 p-3 bg-white rounded-lg border border-slate-100" style={CARD}>
        <div className="flex flex-col justify-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">IHWE Sales CRM</p>
          <h2 className="text-lg font-bold text-[#124170] leading-tight">Sales Team Dashboard</h2>
          <p className="text-xs font-medium text-slate-500 leading-relaxed mt-0.5">
            Team-wise leads, follow-ups, revenue and performance overview
          </p>
        </div>
        <div className="flex items-center gap-2 px-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5">
          <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest pl-1">Duration</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-[11px] bg-white border border-slate-200 px-2 py-1 font-bold rounded-md text-[#111844] shadow-sm outline-none cursor-pointer"
          >
            {PERIOD_OPTIONS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 mb-3">
        {cards.map(({ label, value, delta, icon: Icon, bg, ic }) => (
          <div key={label} className={`flex items-center gap-3 p-3 rounded-lg border ${bg}`} style={CARD}>
            <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${ic}`}><Icon size={16} strokeWidth={2.5} /></div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{label}</p>
              <p className="text-lg font-black text-slate-900 leading-tight">{loading ? "…" : value}</p>
              <Delta value={delta} light />
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 mb-3">
        <div className="lg:col-span-5 bg-white rounded-lg border border-gray-100 p-3" style={CARD}>
          <div className={cardHead}>
            <h3 className={cardTitle}>Revenue Trend ({periodLabel})</h3>
            <span className="text-[10px] font-semibold text-slate-500"><span className="inline-block w-2 h-2 bg-blue-600 rounded-sm mr-1" />Revenue (₹)</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer>
              <BarChart data={trendData} margin={{ left: 0, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} tickLine={false} interval="preserveStartEnd" />
                <YAxis fontSize={10} tickLine={false} axisLine={false} width={52}
                  tickFormatter={(v) => (v >= 100000 ? `₹ ${(v / 100000).toFixed(1)}L` : `₹ ${v}`)} />
                <Tooltip formatter={(v) => inr(v)} />
                <Bar dataKey="revenue" fill="#2563eb" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-lg border border-gray-100 p-3" style={CARD}>
          <div className={cardHead}><h3 className={cardTitle}>Leads Status ({periodLabel})</h3></div>
          <div className="flex items-center justify-center gap-6">
            <div className="relative shrink-0" style={{ width: 128, height: 128 }}>
              <svg width="128" height="128" viewBox="0 0 128 128" className="block" style={{ width: 128, height: 128 }}>
                <circle cx="64" cy="64" r="46" fill="none" stroke="#f1f5f9" strokeWidth="16" />
                {(() => {
                  const C = 2 * Math.PI * 46;
                  let offset = 0;
                  return statusData.data.filter((d) => d.value > 0).map((d) => {
                    const len = (d.value / statusData.total) * C;
                    const seg = (
                      <circle key={d.name} cx="64" cy="64" r="46" fill="none" stroke={d.color} strokeWidth="16"
                        strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} transform="rotate(-90 64 64)">
                        <title>{`${d.name}: ${d.value}`}</title>
                      </circle>
                    );
                    offset += len;
                    return seg;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-black text-slate-900">{statusData.total.toLocaleString("en-IN")}</span>
                <span className="text-[10px] font-semibold text-slate-500">Leads</span>
              </div>
            </div>
            <ul className="flex-1 min-w-0 max-w-[230px] space-y-1.5 text-[10px]">
              {statusData.data.map((s) => (
                <li key={s.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700"><span className="w-2 h-2 rounded-full" style={{ background: s.color }} />{s.name}</span>
                  <span className="font-black text-slate-900 whitespace-nowrap">
                    {s.value} <span className="font-semibold text-slate-500">({statusData.total ? Math.round((s.value / statusData.total) * 100) : 0}%)</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-lg border border-gray-100 p-3" style={CARD}>
          <div className={cardHead}><h3 className={cardTitle}>Revenue by Team Member</h3></div>
          <div className="space-y-3">
            {revenueByMember.length === 0 && <p className="text-xs text-slate-400">No revenue yet</p>}
            {revenueByMember.map((r, i) => (
              <div key={r.name} className="flex items-center gap-2 text-[11px]">
                <span className="w-16 shrink-0 font-semibold text-slate-700 truncate">{r.name}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded-sm overflow-hidden">
                  <div className="h-full rounded-sm" style={{ width: `${(r.value / maxRev) * 100}%`, background: BAR_COLORS[i % BAR_COLORS.length] }} />
                </div>
                <span className="w-20 shrink-0 text-right font-black text-[#0D530E]">{inr(r.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance table */}
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden" style={CARD}>
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-slate-100 border-b border-slate-200">
          <h3 className={`${cardTitle} mr-2`}>Sales Team Performance</h3>
          <div className="relative">
            <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 text-[11px] border border-slate-200 rounded-md bg-white font-bold text-[#111844] outline-none">
              <option value="all">All Teams</option>
              {roles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search team member..."
              className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-white border border-slate-200 rounded-md outline-none" />
          </div>
          <div className="relative ml-auto">
            <button onClick={() => setColsOpen((o) => !o)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-[#111844] border border-slate-200 rounded-md bg-white">
              <Settings size={13} /> Columns <ChevronDown size={12} />
            </button>
            {colsOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-10 p-2 text-[11px]">
                {COLUMNS.map((c) => (
                  <label key={c.key} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer font-semibold">
                    <input type="checkbox" checked={!hiddenCols.includes(c.key)}
                      onChange={() => setHiddenCols((h) => (h.includes(c.key) ? h.filter((k) => k !== c.key) : [...h, c.key]))} />
                    {c.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 text-[10px] font-bold uppercase tracking-wide">
                <th className="p-2.5 text-left w-8">#</th>
                <th className="p-2.5 text-left">Team Member</th>
                <th className="p-2.5 text-left">Total Leads</th>
                <th className="p-2.5 text-left">Follow-ups</th>
                <th className="p-2.5 text-left">Hot Leads</th>
                <th className="p-2.5 text-left">Conversions</th>
                {visibleCols.map((c) => <th key={c.key} className={`p-2.5 text-left ${c.head}`}>{c.label}</th>)}
                <th className="p-2.5 text-left bg-blue-50 text-blue-600">Total Revenue</th>
                <th className="p-2.5 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m, i) => (
                <Fragment key={m.username}>
                  <tr className="border-t border-slate-200 align-middle">
                    <td className="p-2.5 text-slate-600">{i + 1}</td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
                          style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                          {(m.name[0] || "?").toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{toTitleCase(m.name)}</div>
                          <div className="text-[10px] font-medium text-slate-500">{m.role}</div>
                        </div>
                      </div>
                    </td>
                    {[["totalLeads", "leads"], ["followups", "followups"], ["hot", "hot"], ["conversions", "conversions"]].map(([k, d]) => (
                      <td key={k} className="p-2.5">
                        <div className="text-xs font-black text-slate-900">{m[k]}</div>
                        <Delta value={m.deltas[d]} />
                      </td>
                    ))}
                    {visibleCols.map((c) => {
                      const b = m.buckets[c.key];
                      return (
                        <td key={c.key} className="p-2.5 text-[10px] leading-4 whitespace-nowrap text-slate-600 font-medium">
                          <div>Leads: <b className="text-slate-800">{b.leads}</b></div>
                          <div>Conversions: <b className="text-slate-800">{b.conversions}</b></div>
                          <div className="font-bold text-[#0D530E]">Revenue: {inr(b.revenue)}</div>
                        </td>
                      );
                    })}
                    <td className="p-2.5 text-xs font-black text-[#0D530E] whitespace-nowrap">{inr(m.totalRevenue)}</td>
                    <td className="p-2.5 whitespace-nowrap">
                      <button onClick={() => navigate(`/sales-team-dashboard/member/${encodeURIComponent(m.username)}`)}
                        className="px-2.5 py-1 text-[10px] font-bold text-[#124170] border border-slate-200 rounded-md hover:bg-slate-50">
                        View Details
                      </button>
                      <button onClick={() => navigate(`/sales-team-dashboard/member/${encodeURIComponent(m.username)}`)} className="ml-1.5 text-slate-500 align-middle">
                        <MoreVertical size={14} />
                      </button>
                    </td>
                  </tr>
                </Fragment>
              ))}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={8 + visibleCols.length} className="p-6 text-center text-xs text-slate-400">No team members found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
