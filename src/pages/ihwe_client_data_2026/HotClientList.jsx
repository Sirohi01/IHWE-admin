import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCompanies } from "../../features/company/companySlice";
import useDashboardStats from "../../hooks/useDashboardStats";
import { useEventContext } from "../../context/EventContext";
import BaseLeadPage from "../../layout/BaseLeadPage";
import { motion } from "framer-motion";
import {
  Search, Download, Plus, Upload, MessageCircle, Phone, Mail, MoreVertical,
  Calendar, CalendarDays, ArrowRight, RefreshCw, Flame, MessageSquare, Send, CheckCircle2, Filter, ChevronDown
} from "lucide-react";
import { FaStar, FaRegStar, FaWhatsapp } from 'react-icons/fa';
import { getLeadScore } from "../../utils/leadScoring";

const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

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
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(ease * numTarget);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return { ref, count };
}

const HotClientList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterSource, setFilterSource] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterLeadScore, setFilterLeadScore] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Currently selected event (global, from Navbar) — scopes the leads fetch below.
  const { currentEventId } = useEventContext();

  // Auth State
  const { user } = useSelector(state => state.auth);
  const isSuperAdmin = user?.role?.toLowerCase().replace(/[^a-z]/g, '') === 'superadmin';

  // Redux data
  const companiesState = useSelector((state) => state.companies);
  const allCompanies = Array.isArray(companiesState?.companies) ? companiesState.companies : [];
  const isLoading = companiesState?.loading ?? false;

  const pagination = companiesState?.pagination;

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(fetchCompanies({
        page,
        limit,
        search: searchTerm,
        status: filterStatus || 'Hot Lead',
        source: filterSource,
        industry: filterIndustry,
        eventId: currentEventId,
      }));
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, page, limit, searchTerm, filterSource, filterStatus, filterIndustry, currentEventId]);

  // Hook for accurate stats
  const { totalLeads: hookTotal, statusStats } = useDashboardStats('Est./PI Sent', null, currentEventId);

  const totalLeads = pagination?.total || allCompanies.length;

  const circumference = 2 * Math.PI * 32;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => setMounted(true), 250);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    const element = document.getElementById('hot-donut-chart-container');
    if (element) {
      observer.observe(element);
    }
    
    return () => observer.disconnect();
  }, []);

  const isAllSelected = allCompanies.length > 0 && selectedIds.length === allCompanies.length;
  const onSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(allCompanies.map(r => r._id));
    else setSelectedIds([]);
  };

  const onSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const uniqueSources = [...new Set(allCompanies.map(r => r.dataSource).filter(Boolean))];
  const uniqueIndustries = [...new Set(allCompanies.map(r => r.businessNature).filter(Boolean))];
  const uniqueStatuses = [...new Set(allCompanies.map(r => r.companyStatus).filter(Boolean))];

  const getSourceStyle = (source) => {
    const s = (source || "").toLowerCase();
    if (s.includes('website')) return "text-blue-600 bg-blue-50";
    if (s.includes('referral')) return "text-purple-600 bg-purple-50";
    if (s.includes('trade show')) return "text-orange-600 bg-orange-50";
    if (s.includes('social media')) return "text-pink-600 bg-pink-50";
    if (s.includes('google')) return "text-emerald-600 bg-emerald-50";
    if (s.includes('whatsapp')) return "text-emerald-600 bg-emerald-50";
    if (s.includes('email')) return "text-sky-600 bg-sky-50";
    return "text-slate-600 bg-slate-50";
  };

  const getStatusStyle = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes('in discussion')) return "bg-orange-50 text-orange-700 border-orange-100 dot-orange-500";
    if (s.includes('proposal sent')) return "bg-blue-50 text-blue-700 border-blue-100 dot-blue-500";
    if (s.includes('ready')) return "bg-emerald-50 text-emerald-700 border-emerald-100 dot-emerald-500";
    return "bg-emerald-50 text-emerald-700 border-emerald-100 dot-emerald-500";
  };

  // Dynamic stats computation
  const getStatusCount = (statusMatch) => {
    if (!statusStats) return 0;
    return Object.keys(statusStats).reduce((acc, key) => {
      if (key.toLowerCase().includes(statusMatch)) acc += statusStats[key];
      return acc;
    }, 0);
  };

  const inDiscussionCount = getStatusCount('discussion');
  const proposalSentCount = getStatusCount('proposal');
  const readyCount = getStatusCount('ready');

  const validTotal = inDiscussionCount + proposalSentCount + readyCount || 1;
  const pct = (val) => Math.round((val / validTotal) * 100) + '%';

  const overviewData = [
    { name: "In Discussion", value: inDiscussionCount, pct: pct(inDiscussionCount), color: "#f97316" },
    { name: "Proposal Sent", value: proposalSentCount, pct: pct(proposalSentCount), color: "#eab308" },
    { name: "Ready to Convert", value: readyCount, pct: pct(readyCount), color: "#10b981" }
  ];

  const scoreOf = (c) => c.leadScore ?? getLeadScore(c.companyStatus);

  const scoreDist = [
    { label: "90 - 100", count: allCompanies.filter(c => scoreOf(c) >= 90).length, color: "bg-rose-500" },
    { label: "80 - 89", count: allCompanies.filter(c => scoreOf(c) >= 80 && scoreOf(c) < 90).length, color: "bg-orange-500" },
    { label: "70 - 79", count: allCompanies.filter(c => scoreOf(c) >= 70 && scoreOf(c) < 80).length, color: "bg-yellow-500" },
    { label: "Below 70", count: allCompanies.filter(c => scoreOf(c) < 70).length, color: "bg-emerald-500" },
  ].map(s => ({ ...s, pct: Math.round((s.count / Math.max(allCompanies.length, 1)) * 100) + '%' }));

  const topHotLeads = [...allCompanies]
    .sort((a, b) => scoreOf(b) - scoreOf(a))
    .slice(0, 3)
    .map(c => ({
      name: c.companyName || "Unknown",
      score: scoreOf(c),
      icon: <FaWhatsapp size={10} className="text-emerald-500" />
    }));

  const headerActions = (
    <div className="flex flex-wrap items-center gap-1.5">
      <Link to="/ihweClientData2026/addNewClients" className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
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

  function AnimatedStatCard({ icon, gradientTo, iconBg, rawValue, displayValue, label, subLabel, subColor }) {
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

  // Stat Cards
  const statCards = (
    <>
      <AnimatedStatCard
        icon={<Flame className="w-5 h-5 text-rose-600" strokeWidth={2.5} />}
        gradientTo="to-rose-50" iconBg="bg-rose-100"
        rawValue={totalLeads}
        displayValue={(c) => Math.round(c)}
        label="TOTAL HOT LEADS"
        subLabel="High potential" subColor="#e11d48"
      />
      <AnimatedStatCard
        icon={<MessageSquare className="w-5 h-5 text-orange-600" strokeWidth={2.5} />}
        gradientTo="to-orange-50" iconBg="bg-orange-100"
        rawValue={inDiscussionCount}
        displayValue={(c) => Math.round(c)}
        label="IN DISCUSSION"
        subLabel="Actively engaged" subColor="#ea580c"
      />
      <AnimatedStatCard
        icon={<Send className="w-5 h-5 text-blue-600" strokeWidth={2.5} />}
        gradientTo="to-blue-50" iconBg="bg-blue-100"
        rawValue={proposalSentCount}
        displayValue={(c) => Math.round(c)}
        label="PROPOSAL SENT"
        subLabel="Awaiting response" subColor="#2563eb"
      />
      <AnimatedStatCard
        icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />}
        gradientTo="to-emerald-50" iconBg="bg-emerald-100"
        rawValue={readyCount}
        displayValue={(c) => Math.round(c)}
        label="READY TO CONVERT"
        subLabel="Hot prospects" subColor="#059669"
      />
    </>
  );

  // Filter Bar
  const filterBar = (
    <>
      <div className="relative shrink-0 w-[140px]">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={10} />
        <input
          type="text"
          placeholder="Search hot leads..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          className="w-full pl-6 pr-2 py-1 bg-white border border-slate-200 rounded text-[9px] text-slate-800 font-medium placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>
      <select value={filterSource} onChange={e => { setFilterSource(e.target.value); setPage(1); }} className="py-1 px-1.5 bg-white border border-slate-200 rounded text-[9px] font-medium text-slate-800 focus:outline-none focus:border-emerald-500 shrink-0 cursor-pointer">
        <option value="">Source</option>
        {uniqueSources.map((s, i) => <option key={i} value={s}>{s}</option>)}
      </select>
      <select value={filterIndustry} onChange={e => { setFilterIndustry(e.target.value); setPage(1); }} className="py-1 px-1.5 bg-white border border-slate-200 rounded text-[9px] font-medium text-slate-800 focus:outline-none focus:border-emerald-500 shrink-0 cursor-pointer">
        <option value="">Industry</option>
        {uniqueIndustries.map((s, i) => <option key={i} value={s}>{s}</option>)}
      </select>
      <select value={filterLeadScore} onChange={e => { setFilterLeadScore(e.target.value); setPage(1); }} className="py-1 px-1.5 bg-white border border-slate-200 rounded text-[9px] font-medium text-slate-800 focus:outline-none focus:border-emerald-500 shrink-0 cursor-pointer">
        <option value="">Lead Score</option>
        <option value="90">90 - 100</option>
        <option value="80">80 - 89</option>
        <option value="70">70 - 79</option>
      </select>
      <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="py-1 px-1.5 bg-white border border-slate-200 rounded text-[9px] font-medium text-slate-800 focus:outline-none focus:border-emerald-500 shrink-0 cursor-pointer">
        <option value="">Status</option>
        {uniqueStatuses.map((s, i) => <option key={i} value={s}>{s}</option>)}
      </select>
      <button className="flex items-center gap-1 py-1 px-1.5 bg-white border border-slate-200 rounded text-[9px] font-medium text-slate-800 shrink-0">
        <Filter size={10} /> More Filters <ChevronDown size={10} className="text-slate-500" />
      </button>
    </>
  );

  // Table Headers
  const tableHeaders = (
    <>
      <th className="px-2 py-2 font-medium">Company Name</th>
      <th className="px-2 py-2 font-medium">Source</th>
      <th className="px-2 py-2 font-medium">Industry</th>
      <th className="px-2 py-2 font-medium text-center">Status</th>
      <th className="px-2 py-2 font-medium">Lead Score</th>
      <th className="px-2 py-2 font-medium">Last Conversation / Handled By</th>
      <th className="px-2 py-2 w-28 text-center">Action</th>
    </>
  );

  const tableBody = (
    <>
      {isLoading ? (
        <tr><td colSpan="8" className="text-center py-8 text-slate-500">Loading leads...</td></tr>
      ) : allCompanies.length === 0 ? (
        <tr>
          <td colSpan="8" className="px-2 py-4 text-center text-slate-500 font-medium">No results found</td>
        </tr>
      ) : allCompanies.map((row, i) => {
        const isSelected = selectedIds.includes(row._id);
        const style = getStatusStyle(row.companyStatus || "Est./PI Sent");
        const statusBg = style.split(' ')[0];
        const statusText = style.split(' ')[1];
        const statusDot = style.split(' ')[3]?.replace('dot-', 'bg-') || "bg-slate-500";
        const source = row.dataSource || "Website";

        return (
          <tr key={row._id || i} className={`hover:bg-slate-50 transition-colors bg-white border-b border-slate-100 ${isSelected ? 'bg-blue-50/30' : ''}`}>
            <td className="px-2 py-2 text-center">
              <input
                type="checkbox"
                className="w-3 h-3 accent-blue-500 cursor-pointer rounded-sm"
                checked={isSelected}
                onChange={() => onSelectRow(row._id)}
              />
            </td>
            <td className="px-2 py-2">
              <div className="font-bold text-[11px] cursor-pointer hover:text-emerald-600 hover:underline" style={{ color: '#093C5D', fontFamily: 'Inter, sans-serif' }}>
                <Link to={`/crm-event/${currentEventId}/client/${row._id}`}>{toTitleCase(row.companyName)}</Link>
              </div>
            </td>
            <td className="px-2 py-2">
              <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${getSourceStyle(source)}`} style={{ color: '#443199' }}>
                @{toTitleCase(source)}
              </span>
            </td>
            <td className="px-2 py-2 text-[9px] font-bold" style={{ color: '#5E0006' }}>{toTitleCase(row.businessNature) || "-"}</td>
            <td className="px-2 py-2 text-center">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusBg} ${statusText} border-transparent`}>
                <span className={`w-1 h-1 rounded-full ${statusDot}`}></span>
                {toTitleCase(row.companyStatus || "Est./PI Sent")}
              </span>
            </td>
            <td className="px-2 py-1.5">
              {(() => {
                const score = row.leadScore ?? getLeadScore(row.companyStatus);
                const starsToFill = Math.round(score / 20);
                return (
                  <div className="flex items-center gap-0.5 text-rose-500 text-[9px]">
                    {Array.from({ length: 5 }).map((_, starIdx) => (
                      starIdx < starsToFill ? <FaStar key={starIdx} /> : <FaRegStar key={starIdx} className="text-slate-300" />
                    ))}
                    <span className="ml-1 font-semibold text-slate-700">{score}/100</span>
                  </div>
                );
              })()}
            </td>
            <td className="px-2 py-1.5">
              <div className="flex items-start gap-1.5">
                <div className="shrink-0 p-1 bg-slate-100 rounded-full mt-0.5">
                  <MessageCircle size={12} className="text-emerald-500" />
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
            <td className="px-2 py-2 text-center">
              {row.exhibitorRegistrationId ? (
                <button
                  disabled
                  className="text-[9px] font-bold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded shadow-sm cursor-not-allowed" style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Stand Booked
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/book-a-stand/${row._id}`)}
                  className="text-[9px] font-bold bg-[#124170] hover:bg-[#0A2643] text-white px-1.5 py-0.5 rounded shadow-sm transition-all" style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Book Stand
                </button>
              )}
            </td>
          </tr>
        );
      })}
    </>
  );

  const rightSidebar = (
    <>
      {/* Hot Leads Overview */}
      <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
        <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
          <h3 className="text-sm font-bold text-[#15173D] tracking-tight">Hot Leads Overview</h3>
          <span className="text-[10px] font-bold text-slate-500">
            Total: <strong className="font-bold text-[#15173D]">{totalLeads}</strong>
          </span>
        </div>
        <div className="flex items-center justify-between gap-1 my-2">
          {/* Pure SVG Donut Chart (Left) */}
          <div id="hot-donut-chart-container" className="relative flex-shrink-0 flex items-center justify-center" style={{ width: '85px', height: '85px' }}>
            <svg viewBox="0 0 85 85" width="85" height="85" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background track */}
              <circle cx="42.5" cy="42.5" r="32" fill="none" stroke="#f1f5f9" strokeWidth="14" />
              {/* Segments */}
              {(() => {
                if (validTotal === 0) {
                  return <circle cx="42.5" cy="42.5" r="32" fill="none" stroke="#e2e8f0" strokeWidth="14" />;
                }
                const gap = 0;
                let cumulativeAngle = 0;
                return overviewData.filter(d => d.value > 0).map((d, i) => {
                  const segLen = (d.value / validTotal) * circumference - gap;
                  const duration = (d.value / validTotal) * 2.0; 
                  const delay = (cumulativeAngle / 360) * 2.0;
                  const currentAngle = cumulativeAngle;
                  
                  cumulativeAngle += (d.value / validTotal) * 360;
                  
                  return (
                    <g key={i} style={{ transform: `rotate(${currentAngle}deg)`, transformOrigin: 'center' }}>
                      <circle
                        cx="42.5" cy="42.5" r="32"
                        fill="none"
                        stroke={d.color}
                        strokeWidth="14"
                        strokeDasharray={circumference}
                        strokeDashoffset={mounted ? circumference - Math.max(segLen, 0) : circumference}
                        strokeLinecap="butt"
                        style={{ 
                          transition: `stroke-dashoffset ${duration}s linear ${delay}s` 
                        }}
                      />
                    </g>
                  );
                });
              })()}
            </svg>
            <div className="absolute text-center mt-0.5">
              <p className="text-base font-bold text-[#15173D] tracking-tight leading-none mb-0.5">{totalLeads}</p>
              <span className="text-[10px] font-bold text-[#15173D] tracking-tight leading-none block">Total</span>
            </div>
          </div>

          {/* Legend (Right) */}
          <div className="flex-1 space-y-2 text-[11px] font-semibold text-slate-600 pl-0 min-w-0">
            {overviewData.map((d, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: 10 }}
                animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
                transition={{ delay: 0.1 + (i * 0.1), duration: 0.3 }}
                className="flex items-center gap-1.5 min-w-0"
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <div className="flex items-center justify-between w-full min-w-0 gap-0.5">
                  <span className="text-[#15173D] font-bold whitespace-nowrap text-[9px]">{d.name}</span>
                  <span className="text-[#093C5D] font-bold flex-shrink-0 text-[9px]">
                    {d.value} <span style={{ color: d.color }}>({d.pct})</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Score Distribution */}
      <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
        <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
          <h3 className="text-sm font-bold text-[#15173D] tracking-tight">Lead Score Distribution</h3>
        </div>
        <div className="flex flex-col gap-1.5">
          {scoreDist.map((s, i) => (
            <div key={i} className="flex items-center text-[10px]">
              <span className="w-[48px] shrink-0 font-bold whitespace-nowrap" style={{ color: '#5E0006' }}>{s.label}</span>
              <div className="flex-grow mx-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${s.color} rounded-full`} style={{ width: s.pct }}></div>
              </div>
              <div className="w-[36px] shrink-0 flex items-center justify-end gap-0.5 whitespace-nowrap">
                <span className="font-bold" style={{ color: '#15173D' }}>{s.count}</span>
                <span className="font-bold text-[9px]" style={{ color: '#093C5D' }}>({s.pct})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Hot Leads by Score */}
      <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
        <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
          <h3 className="text-sm font-bold text-[#15173D] tracking-tight">Top Hot Leads by Score</h3>
        </div>
        <div className="flex flex-col gap-2">
          {topHotLeads.map((l, i) => (
            <div key={i} className={`flex items-center justify-between ${i !== 2 ? 'pb-2 border-b border-gray-50' : ''}`}>
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                  {l.icon}
                </div>
                <span className="font-bold text-[#093C5D] text-[10px] truncate">{l.name}</span>
              </div>
              <span className="shrink-0 h-4 px-1.5 rounded bg-rose-50 text-rose-600 text-[9px] font-bold flex items-center justify-center ml-2">
                {l.score}/100
              </span>
            </div>
          ))}
          <div className="mt-1 pt-2 border-t border-gray-100">
            <button className="w-full flex items-center justify-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all">
              <span>View All Hot Leads</span>
              <ArrowRight size={10} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
        <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
          <h3 className="text-sm font-bold text-[#15173D] tracking-tight">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="h-[34px] rounded-lg bg-[#EEF9F2] flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity">
            <FaWhatsapp size={12} className="text-green-600 shrink-0" />
            <span className="text-[9px] font-bold text-[#15173D] leading-tight text-left">Send Bulk<br/>WhatsApp</span>
          </button>
          <button onClick={() => navigate("/ihweClientData2026/warmClientsList")} className="h-[34px] rounded-lg bg-[#FFF3E0] flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity">
            <CalendarDays size={12} className="text-orange-600 shrink-0" />
            <span className="text-[9px] font-bold text-[#15173D] leading-tight text-left">Schedule<br/>Follow-Up</span>
          </button>
          <button className="h-[34px] rounded-lg bg-[#F3E8FF] flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity">
            <Mail size={12} className="text-purple-600 shrink-0" />
            <span className="text-[9px] font-bold text-[#15173D] leading-tight text-left">Send Email</span>
          </button>
          <button className="h-[34px] rounded-lg bg-[#E0F2FE] flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity">
            <Phone size={12} className="text-blue-600 shrink-0" />
            <span className="text-[9px] font-bold text-[#15173D] leading-tight text-left">Make a Call</span>
          </button>
        </div>
      </div>
    </>
  );

  const getPageNumbers = () => {
    const paginationTotalPages = pagination?.totalPages || 1;
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

  const paginationTotalPages = pagination?.totalPages || 1;

  const paginationBar = (
    <>
      <div className="flex items-center gap-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
        <span className="text-[11px] font-bold" style={{ color: '#334155' }}>Showing</span>
        <span className="text-[11px] font-black px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-100" style={{ color: '#016B61' }}>
          {totalLeads === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, totalLeads)}
        </span>
        <span className="text-[11px] font-bold" style={{ color: '#334155' }}>of</span>
        <span className="text-[11px] font-black" style={{ color: '#15173D' }}>{totalLeads}</span>
        <span className="text-[11px] font-bold" style={{ color: '#334155' }}>leads</span>
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
      title="My Hot Leads"
      subtitle="High potential leads that are most likely to convert"
      badgeCount={<><Flame size={12} className="inline mr-1 fill-rose-500 text-rose-500" />{totalLeads || 0}</>}
      cardsInRow={4}
      headerActions={headerActions}
      statCards={statCards}
      filterBar={filterBar}
      tableHeaders={tableHeaders}
      tableBody={tableBody}
      rightSidebar={rightSidebar}
      pagination={paginationBar}
      isAllSelected={isAllSelected}
      onSelectAll={onSelectAll}
      onReset={() => {
        setSearchTerm('');
        setFilterSource('');
        setFilterIndustry('');
        setFilterLeadScore('');
        setFilterStatus('');
        setPage(1);
        setSelectedIds([]);
      }}
    />
  );
};

export default HotClientList;
