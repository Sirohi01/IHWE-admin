import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCompanies } from "../../features/company/companySlice";
import useDashboardStats from "../../hooks/useDashboardStats";
import { useEventContext } from "../../context/EventContext";
import BaseLeadPage from "../../layout/BaseLeadPage";
import { motion } from "framer-motion";
import {
  Search, Plus, Upload, MessageCircle, CalendarDays, Clock3, Filter, ChevronDown, MoreVertical, ArrowRight, Bell, Phone, Mail
} from "lucide-react";
import { FaWhatsapp, FaStar, FaRegStar } from 'react-icons/fa';
import { getLeadScore } from "../../utils/leadScoring";

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

const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};



const WarmClientList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterSource, setFilterSource] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Currently selected event (global, from Navbar) — scopes the leads fetch below.
  const { currentEventId } = useEventContext();

  // Auth State
  const { user } = useSelector(state => state.auth);

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
        status: filterStatus || 'Follow-Up Call',
        source: filterSource,
        eventId: currentEventId,
      }));
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, page, limit, searchTerm, filterSource, filterStatus, currentEventId]);

  const {
    totalLeads: hookTotal, pendingFollowUpsCount, thisWeekLeads, thisMonthLeads,
    overviewData, overdueLeads
  } = useDashboardStats('Follow', null, currentEventId);

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
    
    const element = document.getElementById('followup-donut-chart-container');
    if (element) {
      observer.observe(element);
    }
    
    return () => observer.disconnect();
  }, []);

  const overviewTotal = overviewData?.reduce((acc, curr) => acc + curr.value, 0) || 0;

  const totalLeads = pagination?.total || allCompanies.length;
  const isAllSelected = allCompanies.length > 0 && selectedIds.length === allCompanies.length;

  const onSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(allCompanies.map(r => r._id));
    else setSelectedIds([]);
  };

  const onSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const uniqueSources = [...new Set(allCompanies.map(r => r.dataSource).filter(Boolean))];
  const uniqueStatuses = [...new Set(allCompanies.map(r => r.companyStatus).filter(Boolean))];

  const getSourceStyle = (source) => {
    const s = (source || "").toLowerCase();
    if (s.includes('website')) return "text-blue-600 bg-blue-50";
    if (s.includes('referral')) return "text-purple-600 bg-purple-50";
    if (s.includes('trade show')) return "text-orange-600 bg-orange-50";
    if (s.includes('social media')) return "text-pink-600 bg-pink-50";
    if (s.includes('google')) return "text-emerald-600 bg-emerald-50";
    if (s.includes('email')) return "text-sky-600 bg-sky-50";
    return "text-slate-600 bg-slate-50";
  };

  const getStatusStyle = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes('today')) return "bg-orange-50 text-orange-700 border-orange-100 dot-orange-500";
    if (s.includes('overdue')) return "bg-red-50 text-red-700 border-red-100 dot-red-500";
    if (s.includes('upcoming')) return "bg-blue-50 text-blue-700 border-blue-100 dot-blue-500";
    if (s.includes('follow-up')) return "bg-cyan-50 text-cyan-700 border-cyan-100 dot-cyan-500";
    return "bg-slate-50 text-slate-700 border-slate-200 dot-slate-500";
  };

  // Header Actions
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

  // Stat Cards
  const dueTodayCount = overviewData?.[0]?.value || 0;
  const overdueCount = overviewData?.[3]?.value || 0;

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

  const statCards = (
    <>
      <AnimatedStatCard
        icon={<CalendarDays className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />}
        gradientTo="to-emerald-50" iconBg="bg-emerald-100"
        rawValue={pendingFollowUpsCount}
        displayValue={(c) => Math.round(c)}
        label="TOTAL FOLLOW-UPS"
        subLabel="Pending" subColor="#059669"
      />
      <AnimatedStatCard
        icon={<CalendarDays className="w-5 h-5 text-orange-600" strokeWidth={2.5} />}
        gradientTo="to-orange-50" iconBg="bg-orange-100"
        rawValue={dueTodayCount}
        displayValue={(c) => Math.round(c).toString().padStart(2, '0')}
        label="DUE TODAY"
        subLabel="Follow-ups" subColor="#ea580c"
      />
      <AnimatedStatCard
        icon={<Clock3 className="w-5 h-5 text-red-600" strokeWidth={2.5} />}
        gradientTo="to-red-50" iconBg="bg-red-100"
        rawValue={overdueCount}
        displayValue={(c) => Math.round(c).toString().padStart(2, '0')}
        label="OVERDUE"
        subLabel="Follow-ups" subColor="#dc2626"
      />
      <AnimatedStatCard
        icon={<CalendarDays className="w-5 h-5 text-blue-600" strokeWidth={2.5} />}
        gradientTo="to-blue-50" iconBg="bg-blue-100"
        rawValue={thisWeekLeads}
        displayValue={(c) => Math.round(c).toString().padStart(2, '0')}
        label="DUE THIS WEEK"
        subLabel="Follow-ups" subColor="#2563eb"
      />
      <AnimatedStatCard
        icon={<CalendarDays className="w-5 h-5 text-purple-600" strokeWidth={2.5} />}
        gradientTo="to-purple-50" iconBg="bg-purple-100"
        rawValue={thisMonthLeads}
        displayValue={(c) => Math.round(c).toString().padStart(2, '0')}
        label="DUE THIS MONTH"
        subLabel="Follow-ups" subColor="#9333ea"
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
          placeholder="Search within follow-ups..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          className="w-full pl-6 pr-2 py-1 bg-white border border-slate-200 rounded text-[9px] text-slate-800 font-medium placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>
      <button className="flex items-center gap-1 py-1 px-1.5 bg-white border border-slate-200 rounded text-[9px] font-medium text-slate-800 shrink-0">
        Follow-Up Date <CalendarDays size={10} className="text-slate-500" />
      </button>
      <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="py-1 px-1.5 bg-white border border-slate-200 rounded text-[9px] font-medium text-slate-800 focus:outline-none focus:border-emerald-500 shrink-0 cursor-pointer">
        <option value="">Status</option>
        {uniqueStatuses.map((s, i) => <option key={i} value={s}>{s}</option>)}
      </select>
      <select value={filterSource} onChange={e => { setFilterSource(e.target.value); setPage(1); }} className="py-1 px-1.5 bg-white border border-slate-200 rounded text-[9px] font-medium text-slate-800 focus:outline-none focus:border-emerald-500 shrink-0 cursor-pointer">
        <option value="">Source</option>
        {uniqueSources.map((s, i) => <option key={i} value={s}>{s}</option>)}
      </select>
      <button className="flex items-center gap-1 py-1 px-1.5 bg-white border border-slate-200 rounded text-[9px] font-medium text-slate-800 shrink-0">
        Lead Owner: Me <ChevronDown size={10} className="text-slate-500" />
      </button>
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
      <th className="px-2 py-2 font-medium">Lead Score</th>
      <th className="px-2 py-2 font-medium text-center">Status</th>
      <th className="px-2 py-2 font-medium">Follow-Up Date</th>
      <th className="px-2 py-2 font-medium">Last Conversation</th>
      <th className="px-2 py-2 w-10 text-center">Action</th>
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
        const source = row.dataSource || "Website";
        const status = row.companyStatus || "Due Today";
        const style = getStatusStyle(status);
        const statusBg = style.split(' ')[0];
        const statusText = style.split(' ')[1];
        const statusDot = style.split(' ')[3]?.replace('dot-', 'bg-') || "bg-slate-500";
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
                  <Link to={`/client-overview/${row._id}`}>{toTitleCase(row.companyName)}</Link>
                </div>
              </td>
              <td className="px-2 py-2">
                <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${getSourceStyle(source)}`} style={{ color: '#443199' }}>
                  @{toTitleCase(source)}
                </span>
              </td>
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
              <td className="px-2 py-2 text-center">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusBg} ${statusText} border-transparent`}>
                  <span className={`w-1 h-1 rounded-full ${statusDot}`}></span>
                  {toTitleCase(status)}
                </span>
              </td>
              <td className="px-2 py-1.5">
                <span className="text-[10px] font-medium whitespace-nowrap">
                  {row.updatedAt ? (
                    <>
                      <span style={{ color: '#111844', fontWeight: 'bold' }}>{new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(row.updatedAt))}</span>
                      <span className="text-slate-400">, </span>
                      <span style={{ color: '#810B38', fontWeight: 'bold' }}>{new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(row.updatedAt))}</span>
                    </>
                  ) : "-"}
                </span>
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
              <td className="px-2 py-1.5 text-right">
                <button className="text-slate-400 hover:text-slate-700">
                  <MoreVertical size={14} />
                </button>
              </td>
            </tr>
        );
      })}
    </>
  );

  const rightSidebar = (
    <>
      {/* Follow-Up Overview */}
      <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
        <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
          <h3 className="text-sm font-bold text-[#15173D] tracking-tight">Follow-Up Overview</h3>
          <span className="text-[10px] font-bold text-slate-500">
            Total: <strong className="font-bold text-[#15173D]">{overviewTotal}</strong>
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 my-2">
          {/* Pure SVG Donut Chart (Left) */}
          <div id="followup-donut-chart-container" className="relative flex-shrink-0 flex items-center justify-center" style={{ width: '85px', height: '85px' }}>
            <svg viewBox="0 0 85 85" width="85" height="85" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background track */}
              <circle cx="42.5" cy="42.5" r="32" fill="none" stroke="#f1f5f9" strokeWidth="14" />
              {/* Segments */}
              {(() => {
                if (overviewTotal === 0) {
                  return <circle cx="42.5" cy="42.5" r="32" fill="none" stroke="#e2e8f0" strokeWidth="14" />;
                }
                const gap = 0;
                let cumulativeAngle = 0;
                return overviewData?.filter(d => d.value > 0).map((d, i) => {
                  const segLen = (d.value / overviewTotal) * circumference - gap;
                  const duration = (d.value / overviewTotal) * 2.0; 
                  const delay = (cumulativeAngle / 360) * 2.0;
                  const currentAngle = cumulativeAngle;
                  
                  cumulativeAngle += (d.value / overviewTotal) * 360;
                  
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
              <p className="text-base font-bold text-[#15173D] tracking-tight leading-none mb-0.5">{overviewTotal}</p>
              <span className="text-[10px] font-bold text-[#15173D] tracking-tight leading-none block">Total</span>
            </div>
          </div>

          {/* Legend (Right) */}
          <div className="flex-1 space-y-2 text-[11px] font-semibold text-slate-600 pl-1 min-w-0">
            {overviewData?.map((d, i) => (
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
                    {d.value} <span style={{ color: d.color }}>({d.percentage})</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
        <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
          <h3 className="text-sm font-bold text-[#15173D] tracking-tight">Overdue Follow-Ups</h3>
          <button className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline">View All</button>
        </div>
        <div className="space-y-3">
          {overdueLeads?.length === 0 ? <p className="text-xs text-slate-400">No overdue follow-ups.</p> : overdueLeads?.map((lead, index) => (
            <div key={index} className={`flex items-start justify-between pb-3 ${index !== overdueLeads.length - 1 ? "border-b border-gray-100" : ""}`}>
              <div>
                <h4 className="text-[10px] font-bold leading-tight mb-0.5" style={{ color: '#5E0006' }}>{lead.company}</h4>
                <p className="text-[10px] font-bold" style={{ color: '#093C5D' }}>Due: <span style={{ color: '#15173D' }}>{lead.date}</span></p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[9px] font-bold uppercase tracking-wider flex items-center justify-center text-center leading-tight">
                {lead.days}
              </span>
            </div>
          ))}
          {overdueLeads?.length > 0 && (
            <button className="w-full flex items-center justify-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all pt-1">
              <span>View All Overdue ({overdueLeads.length})</span>
              <ArrowRight size={10} />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
        <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
          <h3 className="text-sm font-bold text-[#15173D] tracking-tight">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button className="h-[40px] rounded-lg bg-[#F8F1FF] flex items-center justify-center gap-1.5 hover:opacity-90 px-2">
            <CalendarDays size={14} className="text-purple-600 shrink-0" />
            <span className="text-[10px] font-bold text-[#15173D] leading-tight text-left">Schedule<br />Follow-Up</span>
          </button>
          <button className="h-[40px] rounded-lg bg-[#EEF9F2] flex items-center justify-center gap-1.5 hover:opacity-90 px-2">
            <Phone size={14} className="text-green-600 shrink-0" />
            <span className="text-[10px] font-bold text-[#15173D] leading-tight text-left">Log Call</span>
          </button>
          <button className="h-[40px] rounded-lg bg-[#EEF9F2] flex items-center justify-center gap-1.5 hover:opacity-90 px-2">
            <MessageCircle size={14} className="text-green-600 shrink-0" />
            <span className="text-[10px] font-bold text-[#15173D] leading-tight text-left">Send<br />WhatsApp</span>
          </button>
          <button className="h-[40px] rounded-lg bg-[#F4F7FF] flex items-center justify-center gap-1.5 hover:opacity-90 px-2">
            <Mail size={14} className="text-blue-600 shrink-0" />
            <span className="text-[10px] font-bold text-[#15173D] leading-tight text-left">Send Email</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
        <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
          <h3 className="text-sm font-bold text-[#15173D] tracking-tight">Reminder Settings</h3>
        </div>
        <div className="flex items-start gap-2 mb-3">
          <Bell size={16} className="text-[#15173D] mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-slate-500 mt-0.5 leading-none">Get reminded before follow-up is due</p>
          </div>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-[#15173D]">Enable Reminders</span>
          <label className="relative inline-flex cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:w-3 after:h-3 after:rounded-full after:transition-all peer-checked:after:translate-x-4" />
          </label>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-[#15173D]">Remind me</span>
          <select className="border border-gray-200 rounded-lg px-2 py-1 text-[10px] font-bold outline-none">
            <option>1 Hour Before</option>
            <option>2 Hours Before</option>
            <option>1 Day Before</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#15173D]">Send via</span>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-blue-600 w-3 h-3" /> WhatsApp
            </label>
            <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-blue-600 w-3 h-3" /> Email
            </label>
          </div>
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
        <span className="text-[11px] font-bold" style={{ color: '#334155' }}>follow-ups</span>
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
      title="My Follow-Ups"
      subtitle="Leads with pending follow-ups"
      badgeCount={totalLeads}
      headerActions={headerActions}
      statCards={statCards}
      filterBar={filterBar}
      tableHeaders={tableHeaders}
      tableBody={tableBody}
      rightSidebar={rightSidebar}
      pagination={paginationBar}
      isAllSelected={isAllSelected}
      onSelectAll={onSelectAll}
      cardsInRow={5}
      onReset={() => {
        setSearchTerm('');
        setFilterSource('');
        setFilterStatus('');
        setPage(1);
        setSelectedIds([]);
      }}
    />
  );
};

export default WarmClientList;
