import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCompanies } from "../../features/company/companySlice";
import useDashboardStats from "../../hooks/useDashboardStats";
import { useEventContext } from "../../context/EventContext";
import {
  Search, MoreVertical, Download, Filter, Calendar, MessageCircle, Phone, Mail, Users, Clock, CalendarDays, CalendarCheck, Target, ArrowRight, Plus, Upload, RefreshCw
} from "lucide-react";
import { FaStar, FaRegStar, FaWhatsapp } from 'react-icons/fa';
import { getLeadScore } from "../../utils/leadScoring";
import BaseLeadPage from "../../layout/BaseLeadPage";

// Hook: animate number from 0 to target when element enters viewport
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const numTarget = parseFloat(target) || 0;
    if (numTarget === 0) { setCount(0); return; }
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(ease * numTarget);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return { ref, count };
}

const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const NewLeadList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterAssignedTo, setFilterAssignedTo] = useState('');

  // Currently selected event (global, from Navbar) — scopes the leads fetch below.
  const { currentEventId, currentEvent } = useEventContext();
  const addClientPath = currentEvent?.event_name && currentEventId
    ? `/crm-event/${currentEventId}/add-client`
    : "/ihweClientData2026/addNewClients";

  // Auth State
  const { user } = useSelector(state => state.auth);
  const isSuperAdmin = user?.role?.toLowerCase().replace(/[^a-z]/g, '') === 'superadmin';

  // 🏢 Company redux data
  const companiesState = useSelector((state) => state.companies);
  const newLeadCompanies = Array.isArray(companiesState?.companies) ? companiesState.companies : [];
  const pagination = companiesState?.pagination;
  const isLoading = companiesState?.loading ?? false;
  const userRole = user?.role?.trim();



  const hasFullNewLeadAccess = [
    "IHWE–Super Administrator",
    "IHWE–Sales Manager",
    "IHWE–Platform Administrator",
  ].includes(userRole);

  {
    hasFullNewLeadAccess ? (
      "All newly generated leads from different sources"
    ) : (
      "Leads assigned to you that are newly generated"
    )
  }
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(fetchCompanies({
        page,
        limit,
        search: searchTerm,
        status: filterStatus || 'New Lead',
        source: filterSource,
        industry: filterIndustry,
        forwardTo: filterAssignedTo,
        startDate,
        endDate,
        eventId: currentEventId,
      }));
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, page, limit, searchTerm, startDate, endDate, filterSource, filterStatus, filterIndustry, filterAssignedTo, currentEventId]);

  const uniqueSources = [...new Set(newLeadCompanies.map(c => c.dataSource).filter(Boolean))];
  const uniqueStatuses = [...new Set(newLeadCompanies.map(c => c.companyStatus).filter(Boolean))];
  const uniqueIndustries = [...new Set(newLeadCompanies.map(c => c.businessNature).filter(Boolean))];
  const uniqueAssignedTo = [...new Set(newLeadCompanies.map(c => c.forwardTo).filter(Boolean))];

  const getStatusStyle = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes('new')) return "bg-emerald-50 text-emerald-700 border-emerald-100 dot-emerald-500";
    if (s.includes('contacted')) return "bg-blue-50 text-blue-700 border-blue-100 dot-blue-500";
    if (s.includes('interested')) return "bg-purple-50 text-purple-700 border-purple-100 dot-purple-500";
    if (s.includes('not')) return "bg-orange-50 text-orange-700 border-orange-100 dot-orange-500";
    return "bg-slate-50 text-slate-700 border-slate-200 dot-slate-500";
  };

  const getSourceStyle = (source) => {
    const s = (source || "").toLowerCase();
    if (s.includes('website')) return "text-blue-600 bg-blue-50";
    if (s.includes('referral')) return "text-purple-600 bg-purple-50";
    if (s.includes('trade show')) return "text-orange-600 bg-orange-50";
    if (s.includes('social media')) return "text-pink-600 bg-pink-50";
    if (s.includes('google')) return "text-emerald-600 bg-emerald-50";
    if (s.includes('email')) return "text-indigo-600 bg-indigo-50";
    if (s.includes('whatsapp')) return "text-emerald-600 bg-emerald-50";
    return "text-slate-600 bg-slate-50";
  };

  const getConvIcon = (type) => {
    if (type === 'WhatsApp') return <MessageCircle size={12} className="text-emerald-500" />;
    if (type === 'Call') return <Phone size={12} className="text-blue-500" />;
    if (type === 'Email') return <Mail size={12} className="text-blue-500" />;
    return <Phone size={12} className="text-slate-400" />;
  };

  const {
    totalLeads, todaysLeads, thisWeekLeads, thisMonthLeads,
    pendingFollowUpsCount, followUps, sourceChartData,
    statusChartData, recentActivities, topExecutives
  } = useDashboardStats('New Lead', null, currentEventId);

  function AnimatedStatCard({ icon, gradientTo, iconBg, iconClass, rawValue, displayValue, label, subLabel, subColor }) {
    const { ref, count } = useCountUp(rawValue);
    return (
      <div ref={ref} className={`group cursor-pointer relative bg-gradient-to-br from-white ${gradientTo} p-3 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden`}>
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-2">
            <div className={`w-9 h-9 ${iconBg} rounded-full flex items-center justify-center shrink-0`}>
              {icon}
            </div>
            <div className="flex flex-col min-w-0">
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '4px', display: 'block', fontFamily: 'Inter, sans-serif' }}>
                {displayValue(count)}
              </span>
              <span style={{ fontSize: '8.5px', fontWeight: 800, color: '#334155', lineHeight: 1.2, display: 'block', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
          </div>
          <div style={{ fontSize: '9.5px', fontWeight: 700, color: subColor, textAlign: 'center', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>{subLabel}</div>
        </div>
      </div>
    );
  }

  const statCards = (
    <>
      <AnimatedStatCard
        icon={<Users className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />}
        gradientTo="to-emerald-50" iconBg="bg-emerald-100"
        rawValue={totalLeads}
        displayValue={(c) => Math.round(c)}
        label="TOTAL NEW LEADS"
        subLabel="↑ 18% vs yesterday" subColor="#059669"
      />
      <AnimatedStatCard
        icon={<Clock className="w-5 h-5 text-blue-600" strokeWidth={2.5} />}
        gradientTo="to-blue-50" iconBg="bg-blue-100"
        rawValue={todaysLeads}
        displayValue={(c) => Math.round(c)}
        label="TODAY'S LEADS"
        subLabel="View Today" subColor="#2563eb"
      />
      <AnimatedStatCard
        icon={<CalendarDays className="w-5 h-5 text-purple-600" strokeWidth={2.5} />}
        gradientTo="to-purple-50" iconBg="bg-purple-100"
        rawValue={thisWeekLeads}
        displayValue={(c) => Math.round(c)}
        label="THIS WEEK"
        subLabel="↑ 20% vs last week" subColor="#9333ea"
      />
      <AnimatedStatCard
        icon={<CalendarCheck className="w-5 h-5 text-orange-600" strokeWidth={2.5} />}
        gradientTo="to-orange-50" iconBg="bg-orange-100"
        rawValue={thisMonthLeads}
        displayValue={(c) => Math.round(c)}
        label="THIS MONTH"
        subLabel="↑ 15% vs last month" subColor="#ea580c"
      />
      <AnimatedStatCard
        icon={<Target className="w-5 h-5 text-cyan-600" strokeWidth={2.5} />}
        gradientTo="to-cyan-50" iconBg="bg-cyan-100"
        rawValue={pendingFollowUpsCount}
        displayValue={(c) => Math.round(c)}
        label="PENDING FOLLOW-UPS"
        subLabel="View All" subColor="#0891b2"
      />
    </>
  );

  const headerActions = (
    <div className="flex flex-wrap items-center gap-1.5">
      <Link to={addClientPath} className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
        <Plus size={12} /> Add Lead
      </Link>
      <Link to="/ihweClientData2026/uploadExhibitor" className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
        <Upload size={12} /> Import Leads
      </Link>
      <button className="px-2.5 py-1.5 bg-[#0D530E] text-white rounded-md text-[10px] font-bold hover:bg-[#093a0a] transition-all shadow-sm flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
        <FaWhatsapp size={12} /> Send Bulk WhatsApp
      </button>
    </div>
  );

  const filterBar = (
    <>
      <div className="relative shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <input
          type="text"
          placeholder="Search lead by name, company, email, mobile..."
          className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <select
        value={filterSource}
        onChange={(e) => setFilterSource(e.target.value)}
        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 shrink-0"
      >
        <option value="">Source</option>
        {uniqueSources.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 shrink-0"
      >
        <option value="">Status</option>
        {uniqueStatuses.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        value={filterIndustry}
        onChange={(e) => setFilterIndustry(e.target.value)}
        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 shrink-0"
      >
        <option value="">Industry</option>
        {uniqueIndustries.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {isSuperAdmin && (
        <select
          value={filterAssignedTo}
          onChange={(e) => setFilterAssignedTo(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 shrink-0"
        >
          <option value="">Assigned To</option>
          {uniqueAssignedTo.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )}
    </>
  );

  const tableHeadersComponent = (
    <>
      <th className="px-2 py-2 font-medium">Company Name</th>
      <th className="px-2 py-2 font-medium">Source</th>
      <th className="px-2 py-2 font-medium">Industry</th>
      <th className="px-2 py-2 font-medium text-center">Status</th>
      {isSuperAdmin && <th className="px-2 py-2 font-medium">Assigned To</th>}
      <th className="px-2 py-2 font-medium">Lead Score</th>
      <th className="px-2 py-2 font-medium">Last Conversation / Handled By</th>
      <th className="px-2 py-2 w-10"></th>
    </>
  );
  const tableBodyContent = (
    <>
      {isLoading ? (
        [...Array(10)].map((_, index) => (
          <tr key={`skeleton-${index}`} className="animate-pulse border-b border-slate-100 bg-white">
            <td className="px-2 py-3 text-center"><div className="w-3 h-3 bg-slate-200 rounded-sm mx-auto"></div></td>
            <td className="px-2 py-3"><div className="h-3 w-32 bg-slate-200 rounded mb-1"></div><div className="h-2 w-20 bg-slate-100 rounded"></div></td>
            <td className="px-2 py-3"><div className="h-4 w-16 bg-slate-200 rounded-full"></div></td>
            <td className="px-2 py-3"><div className="h-3 w-20 bg-slate-200 rounded"></div></td>
            <td className="px-2 py-3 text-center"><div className="h-4 w-16 bg-slate-200 rounded-full mx-auto"></div></td>
            {isSuperAdmin && <td className="px-2 py-3"><div className="h-3 w-20 bg-slate-200 rounded"></div></td>}
            <td className="px-2 py-3"><div className="h-3 w-16 bg-slate-200 rounded"></div></td>
            <td className="px-2 py-3"><div className="h-3 w-24 bg-slate-200 rounded"></div></td>
            <td className="px-2 py-3"></td>
          </tr>
        ))
      ) : newLeadCompanies.length === 0 ? (
        <tr><td colSpan="9" className="text-center py-8 text-slate-500 text-[11px]">No new leads found.</td></tr>
      ) : (
        newLeadCompanies.map((row, i) => {
          const status = row.companyStatus || "New";
          const style = getStatusStyle(status);
          const statusBg = style.split(' ')[0];
          const statusText = style.split(' ')[1];
          const statusDot = style.split(' ')[3]?.replace('dot-', 'bg-') || "bg-slate-500";
          const source = row.dataSource || "Website";

          return (
            <tr key={row._id || i} className="hover:bg-slate-50 transition-colors border-b border-slate-100 bg-white">
              <td className="px-2 py-2 text-center">
                <input type="checkbox" className="w-3 h-3 accent-blue-500 cursor-pointer rounded-sm" />
              </td>
              <td className="px-2 py-2">
                <div className="font-bold text-[11px] cursor-pointer hover:text-emerald-600 hover:underline" style={{ color: '#093C5D', fontFamily: 'Inter, sans-serif' }}>
                  <Link to={`/crm-event/${currentEventId}/client/${row._id}`} state={{ fromPageLabel: 'New Leads' }}>{toTitleCase(row.companyName)}</Link>
                </div>
              </td>
              <td className="px-2 py-2">
                <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${getSourceStyle(source)}`} style={{ color: '#443199' }}>
                  @{toTitleCase(source)}
                </span>
              </td>
              <td className="px-2 py-2">
                <div className="text-[9px] font-bold" style={{ color: '#5E0006' }}>
                  {toTitleCase(row.businessNature) || "-"}
                </div>
              </td>
              <td className="px-2 py-2 text-center">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusBg} ${statusText} border-transparent`}>
                  <span className={`w-1 h-1 rounded-full ${statusDot}`}></span>
                  {toTitleCase(status)}
                </span>
              </td>
              {isSuperAdmin && (
                <td className="px-2 py-1.5 text-slate-800 font-semibold text-[10px]">
                  {toTitleCase(row.forwardTo) || "Unassigned"}
                </td>
              )}
              <td className="px-2 py-1.5">
                {(() => {
                  const score = row.leadScore ?? getLeadScore(row.companyStatus);
                  const filledStars = Math.round(score / 20);
                  return (
                    <div className="flex items-center gap-0.5 text-emerald-500 text-[9px]">
                      {[...Array(5)].map((_, i) =>
                        i < filledStars ? <FaStar key={i} /> : <FaRegStar key={i} className="text-slate-300" />
                      )}
                      <span className="ml-1 font-semibold text-slate-700">{score}</span>
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
                      ) : "-"}
                    </span>
                    <span className="text-[9px] font-bold mt-0.5" style={{ color: '#0D530E' }}>(WhatsApp)</span>
                  </div>
                </div>
              </td>
              <td className="px-2 py-1.5 text-right">
                <button className="text-slate-400 hover:text-slate-700">
                  <MoreVertical size={14} />
                </button>
              </td>
            </tr>
          );
        })
      )}
    </>
  );

  const rightSidebarContent = (
    <>
      {!isSuperAdmin && (
        <div className="bg-white rounded-lg p-2.5" style={{ fontFamily: 'Inter, sans-serif', boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
          <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
            <h3 className="text-sm font-bold text-[#15173D] tracking-tight">Follow-Ups Due <span className="text-[10px] text-red-500 font-bold ml-1 tracking-normal">(Next 7 Days)</span></h3>
          </div>
          <div className="flex flex-col gap-1">
            {followUps.length === 0 ? <p className="text-xs text-slate-400">No follow-ups due.</p> : followUps.map((fu, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className={`w-7 h-7 rounded-full ${fu.iconBg} flex items-center justify-center shrink-0`}>
                  <Phone size={12} className="text-blue-500" />
                </div>
                <div className="flex-grow">
                  <div className="text-[10px] font-bold leading-tight" style={{ color: '#093C5D' }}>{fu.name}</div>
                  <div className="text-[8px] mt-0.5 whitespace-nowrap">
                    {(() => {
                      const parts = fu.date ? fu.date.split(', ') : [];
                      return (
                        <>
                          <span style={{ color: '#111844', fontWeight: 'bold' }}>{parts[0]}</span>
                          {parts.length > 1 && <span className="text-slate-400">, </span>}
                          {parts.length > 1 && <span style={{ color: '#810B38', fontWeight: 'bold' }}>{parts.slice(1).join(', ')}</span>}
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div className={`px-1.5 py-0.5 rounded text-[8px] font-semibold ${fu.tagBg}`}>
                  {fu.type}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/ihweClientData2026/followUpList")} className="w-full mt-1.5 text-[8px] font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
            View All Follow-Ups (16) <ArrowRight size={8} />
          </button>
        </div>
      )}

      {/* Leads by Source (Donut Chart) */}
      <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
        <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
          <h3 className="text-sm font-bold text-[#15173D] tracking-tight">{isSuperAdmin ? "Leads by Source (This Week)" : "Leads by Source"}</h3>
        </div>
        <div className="flex items-center justify-between gap-2">
          {/* CSS Donut Chart */}
          <div className="relative w-12 h-12 rounded-full shrink-0 shadow-sm" style={{ background: `conic-gradient(#0ea5e9 0% 33%, #8b5cf6 33% 58%, #10b981 58% 79%, #f59e0b 79% 92%, #94a3b8 92% 100%)` }}>
            <div className="absolute inset-[25%] bg-white rounded-full flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-slate-800 leading-none">{totalLeads}</span>
            </div>
          </div>
          <div className="flex-grow flex flex-col gap-0.5">
            {sourceChartData.length === 0 ? <p className="text-xs text-slate-400">No data</p> : sourceChartData.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-[8px]">
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${s.color}`}></div>
                  <span className="text-slate-700 font-medium">{s.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-800">{s.count}</span>
                  <span className="text-slate-400">({s.pct})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isSuperAdmin && (
        <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
          <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
            <h3 className="text-sm font-bold text-[#15173D] tracking-tight">Lead Status Overview</h3>
          </div>
          <div className="flex flex-col gap-1.5">
            {statusChartData.length === 0 ? <p className="text-xs text-slate-400">No data</p> : statusChartData.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-[8px]">
                <span className="text-slate-700 w-16">{s.label}</span>
                <div className="flex-grow mx-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full`} style={{ width: s.pct }}></div>
                </div>
                <div className="flex items-center gap-1 w-10 justify-end">
                  <span className="font-bold text-slate-800">{s.count}</span>
                  <span className="text-slate-400">({s.pct})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isSuperAdmin && (
        <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
          <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
            <h3 className="text-sm font-bold text-[#15173D] tracking-tight">Recent Activities</h3>
          </div>
          <div className="flex flex-col gap-1.5 relative">
            <div className="absolute left-[9px] top-2 bottom-2 w-px bg-slate-100"></div>
            {recentActivities.length === 0 ? <p className="text-xs text-slate-400 mt-2 ml-4">No recent activity.</p> : recentActivities.map((act, i) => (
              <div key={i} className="flex items-start gap-2 relative z-10">
                <div className={`w-5 h-5 rounded-full border ${act.bg} flex items-center justify-center bg-white shrink-0 mt-0.5`}>
                  <Mail size={8} className="text-emerald-600" />
                </div>
                <div>
                  <div className="text-[10px] font-bold leading-tight mb-0.5" style={{ color: '#5E0006' }}>{act.text}</div>
                  <div className="text-[9px] font-bold" style={{ color: '#15173D' }}>{act.date}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-1.5 text-[8px] font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
            View All Activities <ArrowRight size={8} />
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
        <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
          <h3 className="text-sm font-bold text-[#15173D] tracking-tight">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button onClick={() => navigate(addClientPath)} className="flex items-center gap-1.5 p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded transition-colors border border-emerald-100">
            <Plus size={12} />
            <span className="text-[9px] font-bold">Add Lead</span>
          </button>
          <button onClick={() => navigate("/ihweClientData2026/uploadExhibitor")} className="flex items-center gap-1.5 p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors border border-blue-100">
            <Upload size={12} />
            <span className="text-[9px] font-bold">Import</span>
          </button>
          <button onClick={() => navigate("/whatsapp-logs")} className="flex items-center gap-1.5 p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded transition-colors border border-emerald-100">
            <FaWhatsapp size={12} />
            <span className="text-[9px] font-bold">WhatsApp</span>
          </button>
          <button onClick={() => navigate("#")} className="flex items-center gap-1.5 p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded transition-colors border border-purple-100">
            <Users size={12} />
            <span className="text-[9px] font-bold">Assign Leads</span>
          </button>
        </div>
      </div>

      {/* Top Assigned Executives (Super Admin Only) */}
      {isSuperAdmin && (
        <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
          <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
            <h3 className="text-sm font-bold text-[#15173D] tracking-tight">Top Assigned Executives</h3>
          </div>
          <div className="flex flex-col gap-1.5">
            {topExecutives.length === 0 ? <p className="text-xs text-slate-400">No assignments</p> : topExecutives.map((exec, i) => (
              <div key={i} className="flex items-center justify-between text-[9px]">
                <div className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full ${exec.color} text-white flex items-center justify-center font-bold text-[8px]`}>
                    {exec.init}
                  </div>
                  <span className="font-semibold text-slate-800">{exec.name}</span>
                </div>
                <span className="text-slate-600 font-medium">{exec.count} Leads</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded text-[8px] font-bold transition-colors">
            View All Executives
          </button>
        </div>
      )}

    </>
  );

  const paginationTotalPages = pagination?.totalPages || 1;
  const getPageNumbers = () => {
    const pages = [];
    if (paginationTotalPages <= 7) {
      for (let i = 1; i <= paginationTotalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(paginationTotalPages - 1, page + 1); i++) pages.push(i);
      if (page < paginationTotalPages - 2) pages.push('...');
      pages.push(paginationTotalPages);
    }
    return pages;
  };

  const paginationBar = (
    <>
      <div className="flex items-center gap-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
        <span className="text-[11px] font-bold" style={{ color: '#334155' }}>Showing</span>
        <span className="text-[11px] font-black px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-100" style={{ color: '#016B61' }}>
          {pagination?.total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, pagination?.total || 0)}
        </span>
        <span className="text-[11px] font-bold" style={{ color: '#334155' }}>of</span>
        <span className="text-[11px] font-black" style={{ color: '#15173D' }}>{pagination?.total || 0}</span>
        <span className="text-[11px] font-bold" style={{ color: '#334155' }}>new leads</span>
      </div>
      <div className="flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
        <button onClick={() => setPage(1)} disabled={page === 1} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100" style={{ borderColor: '#e2e8f0', color: '#334155' }}>«</button>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100" style={{ borderColor: '#e2e8f0', color: '#334155' }}>‹</button>
        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`dot-${i}`} className="w-7 h-7 flex items-center justify-center text-[11px] text-slate-400 font-bold">…</span>
          ) : (
            <button key={p} onClick={() => setPage(p)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black border transition-all duration-200" style={p === page ? { backgroundColor: '#016B61', color: '#fff', borderColor: '#016B61', boxShadow: '0 2px 8px rgba(1,107,97,0.3)' } : { backgroundColor: '#fff', color: '#15173D', borderColor: '#e2e8f0' }}>{p}</button>
          )
        )}
        <button onClick={() => setPage(p => Math.min(paginationTotalPages, p + 1))} disabled={page >= paginationTotalPages} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100" style={{ borderColor: '#e2e8f0', color: '#334155' }}>›</button>
        <button onClick={() => setPage(paginationTotalPages)} disabled={page >= paginationTotalPages} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100" style={{ borderColor: '#e2e8f0', color: '#334155' }}>»</button>
      </div>
      <div className="flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
        <span className="text-[11px] font-bold" style={{ color: '#334155' }}>Rows:</span>
        <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="border rounded-lg py-1 px-2 bg-white outline-none cursor-pointer text-[11px] font-bold" style={{ borderColor: '#e2e8f0', color: '#15173D', fontFamily: 'Inter, sans-serif' }}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </>
  );

  return (
    <BaseLeadPage
      title="New Leads"
      subtitle={isSuperAdmin ? "All newly generated leads from different sources" : "Leads assigned to you that are newly generated"}
      // badgeCount={<span className="text-emerald-700">{totalLeads}</span>}
      cardsInRow={5}
      headerActions={headerActions}
      statCards={statCards}
      filterBar={filterBar}
      tableHeaders={tableHeadersComponent}
      tableBody={tableBodyContent}
      rightSidebar={rightSidebarContent}
      pagination={paginationBar}
      onReset={() => {
        setSearchTerm('');
        setFilterSource('');
        setFilterIndustry('');
        setFilterStatus('');
        setFilterAssignedTo('');
        setStartDate('');
        setEndDate('');
        setPage(1);
      }}
    />
  );
};

export default NewLeadList;
