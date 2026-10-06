import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Phone, Mail, CalendarDays, ChevronRight, PhoneCall } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import api from "../lib/api";
import { getAdminInfo } from "../utils/roles";
import { getPeriodRange } from "../utils/periodRange";
import { toTitleCase } from "../utils/toTitleCase";
import {
  PERIOD_OPTIONS, COLUMNS, STATUS_BUCKETS, BAR_COLORS, AVATAR_COLORS,
  isFollowUp, isConverted, isHotStatus, inr, inRange,
} from "../utils/salesTeam";

const CARD = { boxShadow: "rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em", fontFamily: "Inter, sans-serif" };
const cardTitle = "text-xs font-bold text-slate-900 uppercase tracking-wide";
const cardHead = "flex justify-between items-center -mx-3 -mt-3 mb-3 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg";
const PERIOD_STYLE = {
  today: "bg-blue-50 border-blue-100 text-blue-700",
  this_week: "bg-emerald-50 border-emerald-100 text-emerald-700",
  this_month: "bg-violet-50 border-violet-100 text-violet-700",
  last_month: "bg-orange-50 border-orange-100 text-orange-700",
};
const SOURCE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#94a3b8"];

const fmtDate = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");

export default function SalesMemberDetails() {
  const { username = "" } = useParams();
  const navigate = useNavigate();
  const me = getAdminInfo();
  const u = decodeURIComponent(username).toLowerCase();

  const [member, setMember] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [calls, setCalls] = useState([]);
  const [revenue, setRevenue] = useState({});
  const [conv, setConv] = useState({});
  const [period, setPeriod] = useState("this_month");
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const keys = [...new Set([...COLUMNS.map((c) => c.key), ...PERIOD_OPTIONS.map((p) => p.key)])];
        const callerName = encodeURIComponent(me.fullName || me.username || "Admin");
        const [admRes, compRes, estRes, callRes, ...rest] = await Promise.all([
          api.get("/api/admin/public-list"),
          api.get(`/api/companies?dashboard=true&username=${encodeURIComponent(me.username || "")}&role=${encodeURIComponent(me.role || "")}`),
          api.get("/api/estimates").catch(() => ({ data: [] })),
          api.get(`/api/calls/history?adminUsername=${callerName}&adminRole=${encodeURIComponent(me.role || "")}`).catch(() => ({ data: {} })),
          ...keys.map((k) => api.get(`/api/companies/leaderboard?period=${k}`).catch(() => ({ data: {} }))),
          ...keys.map((k) => api.get(`/api/companies/achievement-revenue?username=${encodeURIComponent(username)}&period=${k}`).catch(() => ({ data: {} }))),
        ]);
        if (cancelled) return;
        const found = (admRes.data?.data || []).find((a) => a.username?.toLowerCase() === u);
        setMember(found || { username: decodeURIComponent(username) });
        setCompanies(Array.isArray(compRes.data) ? compRes.data : []);
        const ests = Array.isArray(estRes.data) ? estRes.data : estRes.data?.data || [];
        setEstimates(Array.isArray(ests) ? ests : []);
        setCalls(callRes.data?.success ? callRes.data.data || [] : []);
        const rev = {}, cv = {};
        keys.forEach((k, i) => {
          rev[k] = (rest[i].data?.leaderboard || []).find((r) => r.username?.toLowerCase() === u)?.revenue || 0;
          cv[k] = rest[keys.length + i].data?.convertedCount || 0;
        });
        setRevenue(rev);
        setConv(cv);
      } catch (err) {
        console.error("Member details fetch error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [username]);

  const data = useMemo(() => {
    const mine = (x) => x.forwardTo?.toLowerCase() === u;
    const leads = companies.filter((c) => mine(c) || (c.eventAssignments || []).some(mine));
    const statusOf = (c) => {
      const a = (c.eventAssignments || []).filter(mine).sort((x, y) => new Date(y.updatedAt || 0) - new Date(x.updatedAt || 0))[0];
      return (a?.status || c.companyStatus || "").trim().toLowerCase();
    };
    const assignedAt = (c) => {
      const ts = (c.eventAssignments || []).filter((x) => mine(x) && x.createdAt).map((x) => new Date(x.createdAt).getTime());
      return ts.length ? Math.max(...ts) : c.createdAt;
    };
    const within = (key) => { const r = getPeriodRange(key); return leads.filter((c) => inRange(assignedAt(c), r)); };
    const myIds = new Set(leads.map((c) => String(c._id)));
    const hotIds = (key) => {
      const r = getPeriodRange(key);
      return new Set(estimates
        .filter((e) => myIds.has(String(e.companyId || "")) && String(e.status || "").trim().toLowerCase() !== "cancelled" && inRange(e.estimate_date || e.createdAt, r))
        .map((e) => String(e.companyId)));
    };
    const rows = within(period)
      .map((c) => ({ c, status: statusOf(c), at: assignedAt(c) }))
      .sort((a, b) => new Date(b.at) - new Date(a.at));
    const hot = hotIds(period);
    const callerNames = [member?.fullName, member?.username].filter(Boolean).map((n) => n.toLowerCase());
    const myCalls = calls
      .filter((l) => callerNames.includes(String(l.callerName || "").toLowerCase()) && inRange(l.callDate, getPeriodRange(period)))
      .sort((a, b) => new Date(b.callDate) - new Date(a.callDate));
    return {
      rows,
      followups: rows.filter((r) => isFollowUp(r.status)),
      hotRows: rows.filter((r) => hot.has(String(r.c._id))),
      hotCount: hot.size,
      calls: myCalls,
      cards: COLUMNS.map((col) => ({ ...col, leads: within(col.key).length, conversions: conv[col.key] || 0, revenue: revenue[col.key] || 0 })),
    };
  }, [companies, estimates, calls, member, conv, revenue, period, u]);

  const statusCounts = useMemo(() => STATUS_BUCKETS.map((b) => ({ ...b, value: data.rows.filter((r) => b.match(r.status)).length })), [data]);

  const sources = useMemo(() => {
    const map = {};
    data.rows.forEach((r) => { const s = toTitleCase(r.c.dataSource || "Direct"); map[s] = (map[s] || 0) + 1; });
    const arr = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const top = arr.slice(0, 5).map(([name, value]) => ({ name, value }));
    const other = arr.slice(5).reduce((s, [, v]) => s + v, 0);
    if (other) top.push({ name: "Other", value: other });
    return top;
  }, [data]);

  const trend = useMemo(() => {
    const { start, end } = getPeriodRange(period);
    const days = {};
    data.rows.forEach((r) => { const k = new Date(r.at).toDateString(); days[k] = (days[k] || 0) + 1; });
    const out = [];
    for (let t = new Date(start); t < end && t <= new Date(); t.setDate(t.getDate() + 1)) {
      out.push({ name: t.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), leads: days[t.toDateString()] || 0 });
    }
    return out;
  }, [data, period]);

  const funnel = [
    { name: "Total Leads", value: data.rows.length, color: "#3b82f6" },
    { name: "Contacted", value: data.rows.filter((r) => r.status && r.status !== "new lead").length, color: "#22c55e" },
    { name: "Follow-up", value: data.followups.length, color: "#f59e0b" },
    { name: "Hot (PI Made)", value: data.hotCount, color: "#ef4444" },
    { name: "Converted", value: conv[period] || 0, color: "#8b5cf6" },
  ];

  const periodLabel = PERIOD_OPTIONS.find((p) => p.key === period)?.label;
  const range = getPeriodRange(period);
  const rangeText = `${range.start.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${new Date(range.end - 1).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
  const name = member?.fullName || member?.username || "";
  const mobile = member?.mobile || member?.phone || member?.contactNumber;

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "leads", label: `Leads (${data.rows.length})` },
    { key: "followups", label: `Follow-ups (${data.followups.length})` },
    { key: "hot", label: `Hot Leads (${data.hotCount})` },
    { key: "calls", label: `Calls (${data.calls.length})` },
  ];

  const statusChip = (s) => {
    const cls = isConverted(s) ? "bg-emerald-50 text-emerald-600 border-emerald-200"
      : isFollowUp(s) ? "bg-amber-50 text-amber-600 border-amber-200"
      : isHotStatus(s) ? "bg-rose-50 text-rose-600 border-rose-200"
      : "bg-slate-100 text-slate-600 border-slate-200";
    return <span className={`px-2 py-0.5 rounded border text-[10px] font-bold capitalize ${cls}`}>{s || "—"}</span>;
  };

  const LeadsTable = ({ list, limit }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 text-slate-700 text-[10px] font-bold uppercase tracking-wide">
            <th className="p-2.5 text-left w-8">#</th>
            <th className="p-2.5 text-left">Lead Details</th>
            <th className="p-2.5 text-left">Source</th>
            <th className="p-2.5 text-left">Status</th>
            <th className="p-2.5 text-left">Assigned On</th>
            <th className="p-2.5 text-left">Last Remark</th>
          </tr>
        </thead>
        <tbody>
          {list.slice(0, limit || list.length).map(({ c, status, at }, i) => {
            const ct = c.contacts?.[0] || {};
            return (
              <tr key={c._id} className="border-t border-slate-200">
                <td className="p-2.5 text-slate-600">{i + 1}</td>
                <td className="p-2.5">
                  <div className="font-bold text-slate-900">{toTitleCase(`${ct.firstName || ""} ${ct.surname || ""}`.trim() || "Client")}</div>
                  <div className="text-[10px] text-slate-500">{c.companyName}</div>
                </td>
                <td className="p-2.5 text-slate-600">{toTitleCase(c.dataSource || "Direct")}</td>
                <td className="p-2.5">{statusChip(status)}</td>
                <td className="p-2.5 text-slate-600 whitespace-nowrap">{fmtDate(at)}</td>
                <td className="p-2.5 text-slate-600 max-w-[260px] truncate">{c.lastNote || "—"}</td>
              </tr>
            );
          })}
          {list.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-400">No records in {periodLabel}</td></tr>}
        </tbody>
      </table>
    </div>
  );

  const CallsList = ({ limit }) => (
    <div className="space-y-2">
      {data.calls.slice(0, limit || data.calls.length).map((l, i) => (
        <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100">
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><PhoneCall size={13} /></div>
          <div className="min-w-0 flex-1 text-[11px]">
            <div className="flex justify-between gap-2">
              <span className="font-bold text-slate-900 truncate">{toTitleCase(l.clientName || "Client")} <span className="font-medium text-slate-500">({l.companyName})</span></span>
              <span className="text-slate-400 whitespace-nowrap">{fmtDate(l.callDate)}</span>
            </div>
            <div className="text-slate-600">Call · {l.duration ? `${l.duration}s` : "—"} · {l.companyStatus || "—"}</div>
          </div>
        </div>
      ))}
      {data.calls.length === 0 && <p className="text-xs text-slate-400 py-4 text-center">No calls in {periodLabel}</p>}
    </div>
  );

  return (
    <div className="w-full bg-white px-3 sm:px-6 py-2 font-sans" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mb-2">
        <button onClick={() => navigate("/sales-team-dashboard")} className="hover:underline">Sales Team</button>
        <ChevronRight size={12} /> <span className="text-slate-700">Team Member Details</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-3 p-3 bg-white rounded-lg border border-slate-100" style={CARD}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full text-white text-lg font-bold flex items-center justify-center" style={{ background: AVATAR_COLORS[0] }}>
            {(name[0] || "?").toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#124170] leading-tight">{toTitleCase(name)} <span className="font-semibold text-slate-500 text-sm">– {member?.role || ""}</span></h2>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold">Active</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-medium text-slate-500 mt-0.5">
              {member?.createdAt && <span>Joined: {new Date(member.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>}
              {mobile && <span className="flex items-center gap-1"><Phone size={11} />{mobile}</span>}
              {member?.email && <span className="flex items-center gap-1"><Mail size={11} />{member.email}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5">
            <CalendarDays size={14} className="text-[#0A2947]" />
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Date Range</span>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}
              className="text-[11px] bg-white border border-slate-200 px-2 py-1 font-bold rounded-md text-[#111844] shadow-sm outline-none cursor-pointer">
              {PERIOD_OPTIONS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
            <span className="text-[10px] font-semibold text-slate-500 hidden sm:inline">({rangeText})</span>
          </div>
          <button onClick={() => navigate("/sales-team-dashboard")} className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-[#124170] border border-slate-200 rounded-lg hover:bg-slate-50">
            <ArrowLeft size={13} /> Back to Team List
          </button>
        </div>
      </div>

      {/* Today / Week / Month / Last Month */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        {data.cards.map((c) => (
          <div key={c.key} className={`p-3 rounded-lg border ${PERIOD_STYLE[c.key]}`} style={CARD}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2">{c.label}</p>
            <div className="grid grid-cols-3 text-center divide-x divide-slate-200">
              <div><p className="text-base font-black text-slate-900">{loading ? "…" : c.leads}</p><p className="text-[10px] font-semibold text-slate-500">Leads</p></div>
              <div><p className="text-base font-black text-slate-900">{loading ? "…" : c.conversions}</p><p className="text-[10px] font-semibold text-slate-500">Conversions</p></div>
              <div><p className="text-sm font-black text-slate-900 whitespace-nowrap">{loading ? "…" : inr(c.revenue)}</p><p className="text-[10px] font-semibold text-slate-500">Revenue</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-3 p-1 bg-white rounded-lg border border-slate-100" style={CARD}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-md ${tab === t.key ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 mb-3">
            <div className="lg:col-span-5 bg-white rounded-lg border border-gray-100 p-3" style={CARD}>
              <div className={cardHead}><h3 className={cardTitle}>Leads Assigned Trend ({periodLabel})</h3></div>
              <div className="h-48">
                <ResponsiveContainer>
                  <BarChart data={trend} margin={{ left: 0, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={10} tickLine={false} interval="preserveStartEnd" />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="leads" name="Leads" fill="#60a5fa" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white rounded-lg border border-gray-100 p-3" style={CARD}>
              <div className={cardHead}><h3 className={cardTitle}>Lead Source Breakdown</h3></div>
              <div className="flex items-center gap-3">
                <div className="w-36 h-36 relative shrink-0">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={sources} dataKey="value" innerRadius={42} outerRadius={66} stroke="#fff">
                        {sources.map((s, i) => <Cell key={s.name} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-base font-black text-slate-900">{data.rows.length}</span>
                    <span className="text-[9px] font-semibold text-slate-500">Total Leads</span>
                  </div>
                </div>
                <ul className="flex-1 space-y-1.5 text-[11px]">
                  {sources.map((s, i) => (
                    <li key={s.name} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-700"><span className="w-2 h-2 rounded-full" style={{ background: SOURCE_COLORS[i % SOURCE_COLORS.length] }} />{s.name}</span>
                      <span className="font-black text-slate-900">{s.value} <span className="font-semibold text-slate-500">({data.rows.length ? Math.round((s.value / data.rows.length) * 100) : 0}%)</span></span>
                    </li>
                  ))}
                  {sources.length === 0 && <li className="text-slate-400">No leads in {periodLabel}</li>}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-3 bg-white rounded-lg border border-gray-100 p-3" style={CARD}>
              <div className={cardHead}><h3 className={cardTitle}>Sales Funnel</h3></div>
              <div className="space-y-2.5">
                {funnel.map((f, i) => (
                  <div key={f.name} className="flex items-center gap-2 text-[11px]">
                    <span className="w-24 shrink-0 font-semibold text-slate-700 truncate">{f.name}</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-sm overflow-hidden">
                      <div className="h-full rounded-sm" style={{ width: `${funnel[0].value ? Math.min(100, (f.value / funnel[0].value) * 100) : 0}%`, background: f.color }} />
                    </div>
                    <span className="w-16 shrink-0 text-right font-black text-slate-900">{f.value} <span className="font-semibold text-slate-500">({funnel[0].value ? Math.round((f.value / funnel[0].value) * 100) : 0}%)</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 mb-3">
            <div className="lg:col-span-8 bg-white rounded-lg border border-gray-100 p-3" style={CARD}>
              <div className={cardHead}>
                <h3 className={cardTitle}>Recent Leads ({periodLabel})</h3>
                <button onClick={() => setTab("leads")} className="text-[10px] font-bold text-[#08775e] hover:underline">View All</button>
              </div>
              <LeadsTable list={data.rows} limit={5} />
            </div>
            <div className="lg:col-span-4 bg-white rounded-lg border border-gray-100 p-3" style={CARD}>
              <div className={cardHead}>
                <h3 className={cardTitle}>Recent Calls</h3>
                <button onClick={() => setTab("calls")} className="text-[10px] font-bold text-[#08775e] hover:underline">View All</button>
              </div>
              <CallsList limit={4} />
            </div>
          </div>
        </>
      )}

      {tab === "leads" && <div className="bg-white rounded-lg border border-gray-100 p-3" style={CARD}><div className={cardHead}><h3 className={cardTitle}>Leads ({periodLabel})</h3></div><LeadsTable list={data.rows} /></div>}
      {tab === "followups" && <div className="bg-white rounded-lg border border-gray-100 p-3" style={CARD}><div className={cardHead}><h3 className={cardTitle}>Contacted / Follow-ups ({periodLabel})</h3></div><LeadsTable list={data.followups} /></div>}
      {tab === "hot" && <div className="bg-white rounded-lg border border-gray-100 p-3" style={CARD}><div className={cardHead}><h3 className={cardTitle}>Hot Leads – PI Made ({periodLabel})</h3></div><LeadsTable list={data.hotRows} /></div>}
      {tab === "calls" && <div className="bg-white rounded-lg border border-gray-100 p-3" style={CARD}><div className={cardHead}><h3 className={cardTitle}>Calls ({periodLabel})</h3></div><CallsList /></div>}
    </div>
  );
}
