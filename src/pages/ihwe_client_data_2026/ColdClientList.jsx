import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCompanies } from "../../features/company/companySlice";
import useDashboardStats from "../../hooks/useDashboardStats";
import { useEventContext } from "../../context/EventContext";
import BaseLeadPage from "../../layout/BaseLeadPage";
import { motion } from "framer-motion";
import {
  Download, Search, Plus, Filter, AlertCircle, FileText, Upload, RefreshCw, MoreVertical,
  CalendarDays, Trash2, Archive, UserPlus, Phone, Mail, PauseCircle, XCircle, Hourglass, BarChart3, ChevronDown
} from "lucide-react";
import { FaWhatsapp } from 'react-icons/fa';

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

const FILTER_STATUS = ['On Hold', 'Hold', 'Lost', 'Not Interested'];
const FILTER_STATUS_STRING = FILTER_STATUS.join(',');

const ColdClientList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterSource, setFilterSource] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterReason, setFilterReason] = useState('');
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
        status: filterStatus || FILTER_STATUS_STRING,
        source: filterSource,
        industry: filterIndustry,
        eventId: currentEventId,
      }));
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, page, limit, searchTerm, filterSource, filterStatus, filterIndustry, currentEventId]);

  const { totalLeads: hookTotal, statusStats, holdReasonsData, lostReasonsData } = useDashboardStats(FILTER_STATUS, null, currentEventId);

  const getStatusCount = (statusMatch) => {
    if (!statusStats) return 0;
    return Object.keys(statusStats).reduce((acc, key) => {
      if (key.toLowerCase().includes(statusMatch)) acc += statusStats[key];
      return acc;
    }, 0);
  };

  const holdCount = getStatusCount('hold');
  const lostCount = getStatusCount('lost');

  const totalLeads = pagination?.total || allCompanies.length;

  const validTotal = (holdCount + lostCount) || 1;
  const overviewData = [
    { name: "On Hold", value: holdCount, pct: hookTotal > 0 ? Math.round((holdCount / hookTotal) * 100) + "%" : "0%", color: "#f97316" },
    { name: "Lost", value: lostCount, pct: hookTotal > 0 ? Math.round((lostCount / hookTotal) * 100) + "%" : "0%", color: "#ef4444" }
  ];

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
    
    const element = document.getElementById('cold-donut-chart-container');
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
    if (s.includes('hold')) return "bg-orange-50 text-orange-700 border-orange-100";
    if (s.includes('lost')) return "bg-rose-50 text-rose-700 border-rose-100";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

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
        icon={<PauseCircle className="w-5 h-5 text-orange-600" strokeWidth={2.5} />}
        gradientTo="to-orange-50" iconBg="bg-orange-100"
        rawValue={totalLeads || 0}
        displayValue={(c) => Math.round(c)}
        label="TOTAL HOLD LEADS"
        subLabel={`${hookTotal > 0 ? Math.round((totalLeads / hookTotal) * 100) : 0}% of total`} subColor="#ea580c"
      />
      <AnimatedStatCard
        icon={<XCircle className="w-5 h-5 text-rose-600" strokeWidth={2.5} />}
        gradientTo="to-rose-50" iconBg="bg-rose-100"
        rawValue={lostCount}
        displayValue={(c) => Math.round(c)}
        label="TOTAL LOST LEADS"
        subLabel={`${hookTotal > 0 ? Math.round((lostCount / hookTotal) * 100) : 0}% of total`} subColor="#e11d48"
      />
      <AnimatedStatCard
        icon={<Hourglass className="w-5 h-5 text-blue-600" strokeWidth={2.5} />}
        gradientTo="to-blue-50" iconBg="bg-blue-100"
        rawValue={0}
        displayValue={(c) => `${Math.round(c)} Days`}
        label="AVG. HOLD DURATION"
        subLabel="For hold leads" subColor="#2563eb"
      />
      <AnimatedStatCard
        icon={<BarChart3 className="w-5 h-5 text-purple-600" strokeWidth={2.5} />}
        gradientTo="to-purple-50" iconBg="bg-purple-100"
        rawValue={0}
        displayValue={(c) => `₹ ${Math.round(c)}`}
        label="POTENTIAL REVENUE LOST"
        subLabel="Estimated value" subColor="#9333ea"
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
          placeholder="Search hold / lost leads..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          className="w-full pl-6 pr-2 py-1 bg-white border border-slate-200 rounded text-[9px] text-slate-800 font-medium placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>
      <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="py-1 px-1.5 bg-white border border-slate-200 rounded text-[9px] font-medium text-slate-800 focus:outline-none focus:border-emerald-500 shrink-0 cursor-pointer">
        <option value="">Status</option>
        <option value="On Hold">On Hold</option>
        <option value="Lost">Lost</option>
      </select>
      <select value={filterReason} onChange={e => { setFilterReason(e.target.value); setPage(1); }} className="py-1 px-1.5 bg-white border border-slate-200 rounded text-[9px] font-medium text-slate-800 focus:outline-none focus:border-emerald-500 shrink-0 cursor-pointer">
        <option value="">Reason</option>
        <option value="Budget">Budget</option>
        <option value="Competitor">Competitor</option>
        <option value="Not interested">Not interested</option>
      </select>
      <select value={filterSource} onChange={e => { setFilterSource(e.target.value); setPage(1); }} className="py-1 px-1.5 bg-white border border-slate-200 rounded text-[9px] font-medium text-slate-800 focus:outline-none focus:border-emerald-500 shrink-0 cursor-pointer">
        <option value="">Source</option>
        {uniqueSources.map((s, i) => <option key={i} value={s}>{s}</option>)}
      </select>
      <select value={filterIndustry} onChange={e => { setFilterIndustry(e.target.value); setPage(1); }} className="py-1 px-1.5 bg-white border border-slate-200 rounded text-[9px] font-medium text-slate-800 focus:outline-none focus:border-emerald-500 shrink-0 cursor-pointer">
        <option value="">Industry</option>
        {uniqueIndustries.map((s, i) => <option key={i} value={s}>{s}</option>)}
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
      <th className="px-2 py-2 font-medium">Reason</th>
      <th className="px-2 py-2 font-medium">Last Contacted</th>
      <th className="px-2 py-2 font-medium">Potential Value</th>
      <th className="px-2 py-2 w-28 text-right">Action</th>
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
        const style = getStatusStyle(row.companyStatus || "Lost/Hold");
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
                <Link to={`/crm-event/${currentEventId}/client/${row._id}`} state={{ fromPageLabel: 'Lost Leads' }}>{toTitleCase(row.companyName)}</Link>
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
                {toTitleCase(row.companyStatus || "Lost/Hold")}
              </span>
            </td>
            <td className="px-2 py-2 text-[9px] font-medium text-slate-700">
              {row.reason || "-"}
            </td>
            <td className="px-2 py-1.5">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <div className="shrink-0 p-1 bg-slate-100 rounded-full">
                  <CalendarDays size={12} className="text-emerald-500" />
                </div>
                <span className="text-[10px] font-medium whitespace-nowrap">
                  {row.updatedAt ? (
                    <>
                      <span style={{ color: '#111844', fontWeight: 'bold' }}>{new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(row.updatedAt))}</span>
                      <span className="text-slate-400">, </span>
                      <span style={{ color: '#810B38', fontWeight: 'bold' }}>{new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(row.updatedAt))}</span>
                    </>
                  ) : "-"}
                </span>
              </div>
            </td>
            <td className="px-2 py-2 font-medium text-slate-800 text-[10px]">
              {row.value || "-"}
            </td>
            <td className="px-2 py-2 text-right">
              <button className="text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 px-2 py-1 rounded-md shadow-sm mr-2 transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>
                View
              </button>
            </td>
          </tr>
        );
      })}
    </>
  );

  const rightSidebar = (
    <>
      {/* Lead Status Overview */}
      <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
        <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
          <h3 className="text-sm font-bold text-[#15173D] tracking-tight">Lead Status Overview</h3>
          <span className="text-[10px] font-bold text-slate-500">
            Total: <strong className="font-bold text-[#15173D]">{holdCount + lostCount}</strong>
          </span>
        </div>
        <div className="flex items-center justify-between gap-1 my-2">
          {/* Pure SVG Donut Chart (Left) */}
          <div id="cold-donut-chart-container" className="relative flex-shrink-0 flex items-center justify-center" style={{ width: '85px', height: '85px' }}>
            <svg viewBox="0 0 85 85" width="85" height="85" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background track */}
              <circle cx="42.5" cy="42.5" r="32" fill="none" stroke="#f1f5f9" strokeWidth="14" />
              {/* Segments */}
              {(() => {
                if (validTotal === 0 || (holdCount === 0 && lostCount === 0)) {
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
              <p className="text-base font-bold text-[#15173D] tracking-tight leading-none mb-0.5">{holdCount + lostCount}</p>
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

      {/* Hold Leads by Reason */}
      <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
        <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
          <h3 className="text-sm font-bold text-[#15173D] tracking-tight">Hold Leads by Reason</h3>
        </div>
        <div className="flex flex-col gap-1.5">
          {[
            { label: "Budget Approval Pending", count: 0, pct: "29%", color: "bg-orange-500" },
            { label: "Decision in Next Quarter", count: 0, pct: "21%", color: "bg-orange-400" },
            { label: "Requirement on Hold", count: 0, pct: "21%", color: "bg-orange-400" },
            { label: "Comparing Vendors", count: 0, pct: "14%", color: "bg-orange-300" },
            { label: "Internal Discussion", count: 0, pct: "14%", color: "bg-orange-300" },
          ].map((s, i) => (
            <div key={i} className="flex items-center text-[10px]">
              <span className="w-[110px] shrink-0 font-bold whitespace-nowrap truncate" style={{ color: '#5E0006' }}>{s.label}</span>
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

      {/* Lost Leads by Reason */}
      <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
        <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
          <h3 className="text-sm font-bold text-[#15173D] tracking-tight">Lost Leads by Reason</h3>
        </div>
        <div className="flex flex-col gap-1.5">
          {[
            { label: "Chose Competitor", count: 0, pct: "39%", color: "bg-red-600" },
            { label: "Not a Good Fit", count: 0, pct: "23%", color: "bg-red-500" },
            { label: "Pricing Issues", count: 0, pct: "23%", color: "bg-red-500" },
            { label: "No Response", count: 0, pct: "8%", color: "bg-red-400" },
            { label: "Not Interested", count: 0, pct: "8%", color: "bg-red-400" },
          ].map((s, i) => (
            <div key={i} className="flex items-center text-[10px]">
              <span className="w-[110px] shrink-0 font-bold whitespace-nowrap truncate" style={{ color: '#5E0006' }}>{s.label}</span>
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
            <UserPlus size={12} className="text-blue-600 shrink-0" />
            <span className="text-[9px] font-bold text-[#15173D] leading-tight text-left">Add to<br/>Nurture List</span>
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
      title="Hold & Lost Leads"
      subtitle="Track leads that need re-engagement or reasons for drop-offs"
      badgeCount={<><AlertCircle size={12} className="inline mr-1 text-slate-500" />{totalLeads || 0}</>}
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
        setFilterReason('');
        setFilterStatus('');
        setPage(1);
        setSelectedIds([]);
      }}
    />
  );
};

export default ColdClientList;
