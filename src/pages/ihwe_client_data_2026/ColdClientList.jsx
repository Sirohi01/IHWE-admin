import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCompanies } from "../../features/company/companySlice";
import useDashboardStats from "../../hooks/useDashboardStats";
import BaseLeadPage from "../../layout/BaseLeadPage";
import {
  Download, Search, Plus, Filter, AlertCircle, FileText, Upload, RefreshCw, MoreVertical,
  CalendarDays, Trash2, Archive, UserPlus, Phone, Mail, PauseCircle, XCircle, Hourglass, BarChart3, ChevronDown
} from "lucide-react";
import { FaWhatsapp } from 'react-icons/fa';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
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

const FILTER_STATUS = ['Hold', 'Lost'];

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
        status: filterStatus || 'Hold,Lost,Not Interested',
        source: filterSource,
        industry: filterIndustry,
      }));
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, page, limit, searchTerm, filterSource, filterStatus, filterIndustry]);

  const { totalLeads: hookTotal, statusStats, holdReasonsData, lostReasonsData } = useDashboardStats(FILTER_STATUS);

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
                <Link to={`/client-overview/${row._id}`}>{toTitleCase(row.companyName)}</Link>
              </div>
            </td>
            <td className="px-2 py-2">
              <span className={`px-1.5 py-0.5 rounded font-semibold text-[9px] ${getSourceStyle(source)}`}>
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
    <div style={{ fontFamily: 'Inter, sans-serif' }} className="flex flex-col gap-3">
      {/* Lead Status Overview */}
      <div className="bg-white rounded-xl p-3" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
        <h3 className="text-[11px] font-semibold text-slate-800 mb-2">Lead Status Overview</h3>
        <div className="flex items-center justify-between gap-2">
          <div className="relative w-[70px] h-[70px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "On Hold", value: holdCount, color: "#f97316" },
                    { name: "Lost", value: lostCount, color: "#ef4444" }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={22}
                  outerRadius={32}
                  dataKey="value"
                  stroke="none"
                >
                  {[
                    { color: "#f97316" },
                    { color: "#ef4444" }
                  ].map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h3 className="text-[12px] font-bold text-slate-800 leading-none">{holdCount + lostCount}</h3>
              <p className="text-[8px] text-slate-500 font-medium">Total</p>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 flex-grow">
            {[
              { name: "On Hold", value: holdCount, pct: hookTotal > 0 ? Math.round((holdCount / hookTotal) * 100) + "%" : "0%", color: "#f97316" },
              { name: "Lost", value: lostCount, pct: hookTotal > 0 ? Math.round((lostCount / hookTotal) * 100) + "%" : "0%", color: "#ef4444" }
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="font-medium text-slate-700 truncate">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800 shrink-0 ml-1">{item.value} <span className="text-slate-400 font-medium">({item.pct})</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hold Leads by Reason */}
      <div className="bg-white rounded-xl p-3" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
        <h3 className="text-[11px] font-semibold text-slate-800 mb-2">Hold Leads by Reason</h3>
        <div className="flex flex-col gap-2">
          {[
            { label: "Budget Approval Pending", count: 0, pct: "29%", color: "bg-orange-500" },
            { label: "Decision in Next Quarter", count: 0, pct: "21%", color: "bg-orange-400" },
            { label: "Requirement on Hold", count: 0, pct: "21%", color: "bg-orange-400" },
            { label: "Comparing Vendors", count: 0, pct: "14%", color: "bg-orange-300" },
            { label: "Internal Discussion", count: 0, pct: "14%", color: "bg-orange-300" },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between text-[9px]">
              <span className="text-slate-700 w-[145px] font-medium pr-2 shrink-0">{s.label}</span>
              <div className="flex-grow mx-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${s.color} rounded-full`} style={{ width: s.pct }}></div>
              </div>
              <div className="flex items-center gap-1 w-10 justify-end shrink-0">
                <span className="font-bold text-slate-800">{s.count}</span>
                <span className="text-slate-400 font-medium">({s.pct})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lost Leads by Reason */}
      <div className="bg-white rounded-xl p-3" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
        <h3 className="text-[11px] font-semibold text-slate-800 mb-2">Lost Leads by Reason</h3>
        <div className="flex flex-col gap-2">
          {[
            { label: "Chose Competitor", count: 0, pct: "39%", color: "bg-red-600" },
            { label: "Not a Good Fit", count: 0, pct: "23%", color: "bg-red-500" },
            { label: "Pricing Issues", count: 0, pct: "23%", color: "bg-red-500" },
            { label: "No Response", count: 0, pct: "8%", color: "bg-red-400" },
            { label: "Not Interested", count: 0, pct: "8%", color: "bg-red-400" },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between text-[9px]">
              <span className="text-slate-700 w-[145px] font-medium truncate pr-2">{s.label}</span>
              <div className="flex-grow mx-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${s.color} rounded-full`} style={{ width: s.pct }}></div>
              </div>
              <div className="flex items-center gap-1 w-10 justify-end shrink-0">
                <span className="font-bold text-slate-800">{s.count}</span>
                <span className="text-slate-400 font-medium">({s.pct})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-2" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
        <h3 className="text-[11px] font-semibold text-slate-800 mb-2 px-1">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <button className="py-2 px-1 rounded-lg bg-[#EEF9F2] flex flex-col items-center justify-center gap-1 hover:opacity-90 transition-opacity">
            <FaWhatsapp size={12} className="text-green-600" />
            <span className="text-[8px] font-bold text-green-700">Send Bulk WhatsApp</span>
          </button>
          <button onClick={() => navigate("/ihweClientData2026/warmClientsList")} className="py-2 px-1 rounded-lg bg-[#FFF3E0] flex flex-col items-center justify-center gap-1 hover:opacity-90 transition-opacity">
            <CalendarDays size={12} className="text-orange-600" />
            <span className="text-[8px] font-bold text-orange-700">Schedule Follow-Up</span>
          </button>
          <button className="py-2 px-1 rounded-lg bg-[#F3E8FF] flex flex-col items-center justify-center gap-1 hover:opacity-90 transition-opacity">
            <Mail size={12} className="text-purple-600" />
            <span className="text-[8px] font-bold text-purple-700">Send Email</span>
          </button>
          <button className="py-2 px-1 rounded-lg bg-[#E0F2FE] flex flex-col items-center justify-center gap-1 hover:opacity-90 transition-opacity">
            <UserPlus size={12} className="text-blue-600" />
            <span className="text-[8px] font-bold text-blue-700">Add to Nurture List</span>
          </button>
        </div>
      </div>
    </div>
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
