import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCompanies } from "../../features/company/companySlice";
import BaseLeadPage from "../../layout/BaseLeadPage";
import { useEventContext } from "../../context/EventContext";
import {
  Search, Download, Plus, Upload, RefreshCw, Calendar,
  Users, Package, DollarSign, Banknote, Clock, TrendingUp, Phone, CalendarDays,
  MessageCircle, Mail
} from "lucide-react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { getLeadScore } from "../../utils/leadScoring";

const toTitleCase = (str) => {
  if (!str || typeof str !== "string") return str;
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

const getConvIcon = (type) => {
  if (type === "WhatsApp") return <MessageCircle size={12} className="text-emerald-500" />;
  if (type === "Call") return <Phone size={12} className="text-blue-500" />;
  if (type === "Email") return <Mail size={12} className="text-blue-500" />;
  return <Phone size={12} className="text-slate-400" />;
};

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);
  useEffect(() => {
    if (!started) return;
    const n = parseFloat(target) || 0;
    if (n === 0) { setCount(0); return; }
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      setCount((1 - Math.pow(1 - p, 3)) * n);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);
  return { ref, count };
}

function AnimatedStatCard({ icon, gradientTo, iconBg, rawValue, displayValue, label, subLabel, subColor }) {
  const { ref, count } = useCountUp(rawValue);
  return (
    <div ref={ref} className={`group cursor-pointer relative bg-gradient-to-br from-white ${gradientTo} p-4 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden`}>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center shrink-0`}>{icon}</div>
          <div className="flex flex-col">
            <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", lineHeight: 1, marginBottom: 4, display: "block", fontFamily: "Inter, sans-serif" }}>{displayValue(count)}</span>
            <span style={{ fontSize: "9px", fontWeight: 800, color: "#334155", lineHeight: 1.2, display: "block", fontFamily: "Inter, sans-serif" }}>{label}</span>
          </div>
        </div>
        <div style={{ fontSize: "10px", fontWeight: 700, color: subColor, textAlign: "center", fontFamily: "Inter, sans-serif" }}>{subLabel}</div>
      </div>
    </div>
  );
}

const STATUS_CONFIG = {
  "new":       { bg: "bg-orange-50",   text: "text-orange-700",   dot: "bg-orange-500",   label: "New Lead" },
  "follow":    { bg: "bg-amber-50",    text: "text-amber-700",    dot: "bg-amber-500",    label: "Follow-Up" },
  "warm":      { bg: "bg-blue-50",     text: "text-blue-700",     dot: "bg-blue-500",     label: "Warm" },
  "hot":       { bg: "bg-red-50",      text: "text-red-700",      dot: "bg-red-500",      label: "Hot" },
  "cold":      { bg: "bg-slate-50",    text: "text-slate-600",    dot: "bg-slate-400",    label: "Cold" },
  "lost":      { bg: "bg-rose-50",     text: "text-rose-700",     dot: "bg-rose-500",     label: "Lost" },
  "closed":    { bg: "bg-emerald-50",  text: "text-emerald-700",  dot: "bg-emerald-500",  label: "Converted Client" },
  "converted": { bg: "bg-emerald-50",  text: "text-emerald-700",  dot: "bg-emerald-500",  label: "Converted Client" },
  default:     { bg: "bg-gray-50",     text: "text-gray-600",     dot: "bg-gray-400",     label: "New Lead" },
};
const getStatusStyle = (status) => {
  const s = (status || "").toLowerCase();
  const key = Object.keys(STATUS_CONFIG).find((k) => s.includes(k));
  return STATUS_CONFIG[key] || STATUS_CONFIG.default;
};
const getSourceStyle = (source) => {
  const s = (source || "").toLowerCase();
  if (s.includes("website")) return "text-blue-600 bg-blue-50";
  if (s.includes("referral")) return "text-purple-600 bg-purple-50";
  if (s.includes("email")) return "text-indigo-600 bg-indigo-50";
  if (s.includes("whatsapp")) return "text-emerald-600 bg-emerald-50";
  if (s.includes("social")) return "text-pink-600 bg-pink-50";
  return "text-slate-600 bg-slate-50";
};

const AllLeadsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Currently selected event (global, from Navbar) — scopes the leads fetch below.
  const { currentEventId } = useEventContext();

  const { user } = useSelector((s) => s.auth);
  const isSuperAdmin = user?.role?.toLowerCase().replace(/[^a-z]/g, "") === "superadmin";
  const companiesState = useSelector((s) => s.companies);
  const companies = Array.isArray(companiesState?.companies) ? companiesState.companies : [];
  const pagination = companiesState?.pagination;
  const isLoading = companiesState?.loading ?? false;

  useEffect(() => {
    const t = setTimeout(() => {
      dispatch(fetchCompanies({ page, limit, search: searchTerm, source: filterSource, startDate, endDate, eventId: currentEventId }));
    }, 400);
    return () => clearTimeout(t);
  }, [dispatch, page, limit, searchTerm, startDate, endDate, filterSource, currentEventId]);

  const filtered = filterStatus
    ? companies.filter((c) => (c.companyStatus || "").toLowerCase().includes(filterStatus.toLowerCase()))
    : companies;

  const uniqueSources  = [...new Set(companies.map((c) => c.dataSource).filter(Boolean))];
  const uniqueStatuses = [...new Set(companies.map((c) => c.companyStatus).filter(Boolean))];
  const total = pagination?.total || 0;

  // ── Stat cards ──────────────────────────────────────────────────────────────
  const statCards = (
    <>
      <AnimatedStatCard icon={<Users className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />} gradientTo="to-emerald-50" iconBg="bg-emerald-100" rawValue={total} displayValue={(c) => Math.round(c)} label="TOTAL LEADS" subLabel="All Categories" subColor="#059669" />
      <AnimatedStatCard icon={<TrendingUp className="w-5 h-5 text-blue-600" strokeWidth={2.5} />} gradientTo="to-blue-50" iconBg="bg-blue-100" rawValue={companies.filter((c) => (c.companyStatus || "").toLowerCase().includes("new")).length} displayValue={(c) => Math.round(c)} label="NEW LEADS" subLabel="This Period" subColor="#2563eb" />
      <AnimatedStatCard icon={<Package className="w-5 h-5 text-orange-600" strokeWidth={2.5} />} gradientTo="to-orange-50" iconBg="bg-orange-100" rawValue={companies.filter((c) => ["warm","follow"].some((k) => (c.companyStatus || "").toLowerCase().includes(k))).length} displayValue={(c) => Math.round(c)} label="FOLLOW-UPS" subLabel="Warm Leads" subColor="#d97706" />
      <AnimatedStatCard icon={<Banknote className="w-5 h-5 text-red-600" strokeWidth={2.5} />} gradientTo="to-red-50" iconBg="bg-red-100" rawValue={companies.filter((c) => (c.companyStatus || "").toLowerCase().includes("hot")).length} displayValue={(c) => Math.round(c)} label="HOT LEADS" subLabel="High Priority" subColor="#dc2626" />
      <AnimatedStatCard icon={<Clock className="w-5 h-5 text-rose-600" strokeWidth={2.5} />} gradientTo="to-rose-50" iconBg="bg-rose-100" rawValue={companies.filter((c) => ["cold","lost"].some((k) => (c.companyStatus || "").toLowerCase().includes(k))).length} displayValue={(c) => Math.round(c)} label="LOST / COLD" subLabel="Inactive" subColor="#e11d48" />
      <AnimatedStatCard icon={<DollarSign className="w-5 h-5 text-purple-600" strokeWidth={2.5} />} gradientTo="to-purple-50" iconBg="bg-purple-100" rawValue={companies.filter((c) => (c.companyStatus || "").toLowerCase().includes("convert")).length} displayValue={(c) => Math.round(c)} label="CONVERTED" subLabel="Closed Won" subColor="#7c3aed" />
    </>
  );

  // ── Filters ──────────────────────────────────────────────────────────────────
  const filters = (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <input type="text" placeholder="Search lead..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          className="w-full sm:w-56 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500" />
      </div>
      <select value={filterSource} onChange={(e) => { setFilterSource(e.target.value); setPage(1); }}
        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:border-blue-500">
        <option value="">Source</option>
        {uniqueSources.map((s, i) => <option key={i} value={s}>{s}</option>)}
      </select>
      <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:border-blue-500">
        <option value="">All Statuses</option>
        {uniqueStatuses.map((s, i) => <option key={i} value={s}>{s}</option>)}
      </select>
      <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs">
        <CalendarDays size={13} className="text-slate-400" />
        <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="outline-none bg-transparent text-xs w-[88px] cursor-pointer text-slate-600" />
        <span className="text-slate-300">-</span>
        <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="outline-none bg-transparent text-xs w-[88px] cursor-pointer text-slate-600" />
      </div>
    </>
  );

  // ── Table headers ─────────────────────────────────────────────────────────────
  const tableHeaders = (
    <>
      <th className="px-2 py-2 font-medium">Company Name</th>
      <th className="px-2 py-2 font-medium">Contact Details</th>
      <th className="px-2 py-2 font-medium">Location</th>
      <th className="px-2 py-2 font-medium">Source</th>
      <th className="px-2 py-2 font-medium text-center">Status</th>
      {isSuperAdmin && <th className="px-2 py-2 font-medium">Assigned To</th>}
      <th className="px-2 py-2 font-medium">Lead Score</th>
      <th className="px-2 py-2 font-medium">Last Conversation / Handled By</th>
      <th className="px-2 py-2 font-medium">Last Updated</th>
    </>
  );

  // ── Table body ────────────────────────────────────────────────────────────────
  const tableBody = (
    <>
      {isLoading ? (
        [...Array(10)].map((_, i) => (
          <tr key={i} className="animate-pulse border-b border-slate-100 bg-white">
            <td className="px-2 py-3"><div className="w-3 h-3 bg-slate-200 rounded-sm mx-auto" /></td>
            <td className="px-2 py-3"><div className="h-3 w-32 bg-slate-200 rounded mb-1" /><div className="h-2 w-20 bg-slate-100 rounded" /></td>
            <td className="px-2 py-3"><div className="h-3 w-20 bg-slate-200 rounded" /></td>
            <td className="px-2 py-3"><div className="h-3 w-16 bg-slate-200 rounded mx-auto" /></td>
            <td className="px-2 py-3"><div className="h-4 w-16 bg-slate-200 rounded-full" /></td>
            <td className="px-2 py-3 text-center"><div className="h-4 w-16 bg-slate-200 rounded-full mx-auto" /></td>
            {isSuperAdmin && <td className="px-2 py-3"><div className="h-3 w-20 bg-slate-200 rounded" /></td>}
            <td className="px-2 py-3"><div className="h-3 w-16 bg-slate-200 rounded" /></td>
            <td className="px-2 py-3"><div className="h-3 w-24 bg-slate-200 rounded" /></td>
            <td className="px-2 py-3"><div className="h-3 w-24 bg-slate-200 rounded" /></td>
          </tr>
        ))
      ) : filtered.length === 0 ? (
        <tr><td colSpan={isSuperAdmin ? 11 : 10} className="text-center py-10 text-slate-500 text-xs">No leads found.</td></tr>
      ) : (
        filtered.map((row, i) => {
          const status = row.companyStatus || "New Lead";
          const { bg, text, dot, label } = getStatusStyle(status);
          const source = row.dataSource || "Direct";
          const contactPerson = row.contacts?.[0]?.name || (row.contacts?.[0]?.firstName ? `${row.contacts[0].firstName} ${row.contacts[0].surname || ""}`.trim() : null) || row.contactPerson || "—";
          const contactMobile = row.contacts?.[0]?.mobile || row.mobile || "—";

          return (
            <tr key={row._id || i} className="hover:bg-slate-50 transition-colors border-b border-slate-100 bg-white">
              <td className="px-2 py-2 text-center"><input type="checkbox" className="w-3 h-3 accent-blue-500 cursor-pointer rounded-sm" /></td>
              <td className="px-2 py-2">
                <Link to={`/client-overview/${row._id}`}>
                  <div className="font-bold text-[11px] hover:text-blue-600 hover:underline cursor-pointer" style={{ color: "#093C5D" }}>{toTitleCase(row.companyName)}</div>
                </Link>
                <div className="text-[9px] font-bold mt-0.5" style={{ color: "#5E0006" }}>
                  {toTitleCase(row.businessNature) || "—"}
                </div>
              </td>
              <td className="px-2 py-2 text-[10px] font-medium">
                <div className="font-bold text-[10px]" style={{ color: "#15173D" }}>
                  {toTitleCase(contactPerson)}
                </div>
                <div className="text-[9px] text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                  <Phone size={9} className="text-blue-500 shrink-0" />
                  {contactMobile}
                </div>
              </td>
              <td className="px-2 py-2">
                <div className="font-bold text-[10px]" style={{ color: '#093C5D' }}>
                  {toTitleCase(row.city || row.address?.city || row.companyCity || "—")}
                </div>
                <div className="text-[9px] font-bold mt-0.5" style={{ color: '#5E0006' }}>
                  {toTitleCase(row.state || row.address?.state || row.companyState || "—")}
                </div>
              </td>
              <td className="px-2 py-2">
                <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${getSourceStyle(source)}`} style={{ color: "#443199" }}>@{toTitleCase(source)}</span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${bg} ${text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />{label}
                </span>
              </td>
              {isSuperAdmin && <td className="px-2 py-2 font-bold text-blue-600 text-[10px]">{toTitleCase(row.forwardTo) || "Unassigned"}</td>}
              <td className="px-2 py-2">
                {(() => {
                  const score = row.leadScore ?? getLeadScore(row.companyStatus);
                  const filledStars = Math.round(score / 20);
                  return (
                    <div className="flex items-center gap-0.5 text-emerald-500 text-[9px]">
                      {[...Array(5)].map((_, i) =>
                        i < filledStars ? <FaStar key={i} /> : <FaRegStar key={i} className="text-slate-300" />
                      )}
                      <span className="ml-1 font-bold text-slate-700">{score}</span>
                    </div>
                  );
                })()}
              </td>
              <td className="px-2 py-1.5">
                <div className="flex items-start gap-1.5">
                  <div className="shrink-0 p-1 bg-slate-100 rounded-full mt-0.5">
                    {getConvIcon("WhatsApp")}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium whitespace-nowrap">
                      {row.updatedAt ? (
                        <>
                          <span style={{ color: '#111844', fontWeight: 'bold' }}>{new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(row.updatedAt))}</span>
                          <span className="text-slate-400">, </span>
                          <span style={{ color: '#810B38', fontWeight: 'bold' }}>{new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(row.updatedAt))}</span>
                        </>
                      ) : "—"}
                    </span>
                    <span className="text-[9px] font-bold mt-0.5" style={{ color: '#0D530E' }}>(WhatsApp)</span>
                  </div>
                </div>
              </td>
              <td className="px-2 py-2 text-[10px] font-medium" style={{ color: "#334155" }}>
                {row.updatedAt ? (() => {
                  const d = new Date(row.updatedAt);
                  const date = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(d);
                  const time = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).format(d);
                  return <><div className="flex items-center gap-1"><CalendarDays size={10} className="text-slate-400" /><span className="font-bold text-[10px]" style={{ color: "#111844" }}>{date}</span></div><span className="text-[9px] text-slate-500">{time}</span></>;
                })() : "—"}
              </td>
            </tr>
          );
        })
      )}
    </>
  );

  // ── Pagination ────────────────────────────────────────────────────────────────
  const totalPages = pagination?.totalPages || 1;
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const paginationBar = (
    <>
      <div className="flex items-center gap-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
        <span className="text-[11px] font-bold" style={{ color: "#334155" }}>Showing</span>
        <span className="text-[11px] font-black px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-100" style={{ color: "#016B61" }}>
          {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)}
        </span>
        <span className="text-[11px] font-bold" style={{ color: "#334155" }}>of</span>
        <span className="text-[11px] font-black" style={{ color: "#15173D" }}>{total}</span>
        <span className="text-[11px] font-bold" style={{ color: "#334155" }}>leads</span>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(1)} disabled={page === 1} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100" style={{ borderColor: "#e2e8f0", color: "#334155" }}>«</button>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100" style={{ borderColor: "#e2e8f0", color: "#334155" }}>‹</button>
        {getPageNumbers().map((p, i) =>
          p === "..." ? (
            <span key={`d${i}`} className="w-7 h-7 flex items-center justify-center text-[11px] text-slate-400 font-bold">…</span>
          ) : (
            <button key={p} onClick={() => setPage(p)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black border transition-all"
              style={p === page ? { backgroundColor: "#016B61", color: "#fff", borderColor: "#016B61", boxShadow: "0 2px 8px rgba(1,107,97,0.3)" } : { backgroundColor: "#fff", color: "#15173D", borderColor: "#e2e8f0" }}>
              {p}
            </button>
          )
        )}
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100" style={{ borderColor: "#e2e8f0", color: "#334155" }}>›</button>
        <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100" style={{ borderColor: "#e2e8f0", color: "#334155" }}>»</button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold" style={{ color: "#334155" }}>Rows:</span>
        <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="border rounded-lg py-1 px-2 bg-white outline-none cursor-pointer text-[11px] font-bold" style={{ borderColor: "#e2e8f0", color: "#15173D" }}>
          <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
        </select>
      </div>
    </>
  );

  return (
    <BaseLeadPage
      title="All Leads"
      subtitle="Combined view of all leads — New, Follow-Up, Hot, Lost and more"
      badgeCount={<span className="text-blue-700">{total}</span>}
      headerActions={
        <div className="flex flex-wrap items-center gap-1.5">
          <Link to="/book-a-stand" className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm" style={{ fontFamily: "Inter, sans-serif" }}>Book a Stand</Link>
          <Link to="/ihweClientData2026/newLeadList" className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm" style={{ fontFamily: "Inter, sans-serif" }}>New Leads</Link>
          <Link to="/ihweClientData2026/warmClientList" className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm" style={{ fontFamily: "Inter, sans-serif" }}>Follow-Ups</Link>
          <Link to="/ihweClientData2026/hotClientList" className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm" style={{ fontFamily: "Inter, sans-serif" }}>Hot Leads</Link>
          <Link to="/ihweClientData2026/proposalSentList" className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm" style={{ fontFamily: "Inter, sans-serif" }}>Proposal Sent</Link>
          <Link to="/ihweClientData2026/coldClientList" className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm" style={{ fontFamily: "Inter, sans-serif" }}>Lost Leads</Link>
          <Link to="/ihweClientData2026/allLeadsList" className="px-2.5 py-1.5 bg-blue-600 text-white rounded-md text-[10px] font-bold shadow-sm" style={{ fontFamily: "Inter, sans-serif" }}>All Leads</Link>
          <Link to="/ihweClientData2026/convertedList" className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm" style={{ fontFamily: "Inter, sans-serif" }}>Converted</Link>
        </div>
      }
      statCards={statCards}
      filterBar={filters}
      tableHeaders={tableHeaders}
      tableBody={tableBody}
      pagination={paginationBar}
      isAllSelected={false}
      onSelectAll={() => {}}
      onReset={() => { setSearchTerm(""); setFilterSource(""); setFilterStatus(""); setStartDate(""); setEndDate(""); setPage(1); }}
    />
  );
};

export default AllLeadsList;
