import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCompanies } from "../../features/company/companySlice";
import BaseLeadPage from "../../layout/BaseLeadPage";
import {
  Search, Download, Plus, Upload, MessageCircle, Phone, Mail, MoreVertical,
  Calendar, CalendarDays, ArrowRight, RefreshCw, Flame, MessageSquare, Send, CheckCircle2,
  Users, DollarSign, Star, FileText, ChevronDown
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

const dummyConvertedRows = [
  { id: 1, name: "GreenLife Ayurveda", industry: "Healthcare", source: "Website", convertedDate: "27 May 2026", stage: "Deal Won", revenue: "₹ 3,50,000", subName: "Ayurveda & Herbs" },
  { id: 2, name: "Nature's Harmony Pvt. Ltd.", industry: "Healthcare", source: "Referral", convertedDate: "26 May 2026", stage: "Deal Won", revenue: "₹ 4,20,000", subName: "Health & Wellness" },
  { id: 3, name: "Wellness World", industry: "Retail", source: "Trade Show", convertedDate: "25 May 2026", stage: "Deal Won", revenue: "₹ 2,75,000", subName: "Wellness Products" },
  { id: 4, name: "Herbal King Exports", industry: "Manufacturing", source: "Social Media", convertedDate: "24 May 2026", stage: "Deal Won", revenue: "₹ 5,80,000", subName: "Herbal Products" },
  { id: 5, name: "Arogya Organics", industry: "FMCG", source: "Google Ads", convertedDate: "23 May 2026", stage: "Deal Won", revenue: "₹ 3,10,000", subName: "Organic Food" },
  { id: 6, name: "Pureveda Solutions", industry: "Healthcare", source: "Email Campaign", convertedDate: "22 May 2026", stage: "Deal Won", revenue: "₹ 2,45,000", subName: "Healthcare" },
  { id: 7, name: "Shakti Bio Products", industry: "Biotechnology", source: "Referral", convertedDate: "21 May 2026", stage: "Deal Won", revenue: "₹ 1,95,000", subName: "Biotechnology" },
  { id: 8, name: "Holistic Nutrition Co.", industry: "FMCG", source: "Website", convertedDate: "20 May 2026", stage: "Deal Won", revenue: "₹ 2,55,000", subName: "Nutrition" },
];

const ConfirmClientList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterSource, setFilterSource] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Auth State
  const { user } = useSelector(state => state.auth);
  const isSuperAdmin = user?.role?.toLowerCase().replace(/[^a-z]/g, '') === 'superadmin';

  // Redux data
  const companiesState = useSelector((state) => state.companies);
  const allCompanies = Array.isArray(companiesState?.companies) ? companiesState.companies : [];
  const isLoading = companiesState?.loading ?? false;

  useEffect(() => {
    dispatch(fetchCompanies({ status: 'Converted' }));
  }, [dispatch]);

  // Filtering
  const filteredDummyRows = dummyConvertedRows.filter(r => {
    const s = searchTerm.toLowerCase();
    const matchSearch = s === '' || (r.name.toLowerCase().includes(s) || r.industry.toLowerCase().includes(s));
    const matchSource = filterSource === '' || r.source === filterSource;
    const matchIndustry = filterIndustry === '' || r.industry === filterIndustry;
    const matchStage = filterStage === '' || r.stage === filterStage;
    return matchSearch && matchSource && matchIndustry && matchStage;
  });

  const totalPages = Math.ceil(filteredDummyRows.length / limit) || 1;
  const paginatedRows = filteredDummyRows.slice((page - 1) * limit, page * limit);
  const totalLeads = filteredDummyRows.length;

  const isAllSelected = paginatedRows.length > 0 && selectedIds.length === paginatedRows.length;
  const onSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(paginatedRows.map(r => r.id));
    else setSelectedIds([]);
  };

  const onSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const uniqueSources = [...new Set(dummyConvertedRows.map(r => r.source).filter(Boolean))];
  const uniqueIndustries = [...new Set(dummyConvertedRows.map(r => r.industry).filter(Boolean))];
  const uniqueStages = [...new Set(dummyConvertedRows.map(r => r.stage).filter(Boolean))];

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

  const getIndustryStyle = (ind) => {
    const s = (ind || "").toLowerCase();
    if (s.includes('health')) return "text-emerald-600 bg-emerald-50";
    if (s.includes('fmcg')) return "text-blue-600 bg-blue-50";
    if (s.includes('retail')) return "text-orange-600 bg-orange-50";
    if (s.includes('biotech')) return "text-purple-600 bg-purple-50";
    if (s.includes('manufacturing')) return "text-sky-600 bg-sky-50";
    return "text-slate-600 bg-slate-50";
  };

  // Header Actions
  const headerActions = (
    <>
      <div className="relative flex-grow xl:flex-grow-0 min-w-[200px] w-full sm:w-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <input
          type="text"
          placeholder="Search by Name, Company, Email, Mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button onClick={() => navigate("/ihweClientData2026/addNewClients")} className="flex items-center gap-2 bg-[#00a65a] hover:bg-[#008d4c] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm">
        <Plus size={14} /> Add Lead
      </button>
      <button onClick={() => navigate("/ihweClientData2026/uploadExhibitor")} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm">
        <Upload size={14} /> Import Leads
      </button>
      <button className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 border border-purple-100 text-purple-600 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm">
        <FaWhatsapp size={14} /> Send Bulk WhatsApp
      </button>
    </>
  );

  // Stat Cards
  const statCards = (
    <>
      <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Users size={20} className="fill-emerald-600" />
        </div>
        <div>
          <div className="text-slate-800 text-[10px] font-bold">Total Converted</div>
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-bold text-slate-800 leading-none mb-1">32</div>
          </div>
          <div className="text-[9px] text-emerald-600 font-medium">+18% from last month</div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <div className="border border-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">₹</div>
        </div>
        <div>
          <div className="text-slate-800 text-[10px] font-bold">Total Revenue</div>
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-bold text-slate-800 leading-none mb-1">₹ 24,75,000</div>
          </div>
          <div className="text-[9px] text-emerald-600 font-medium">+22% from last month</div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <CalendarDays size={20} />
        </div>
        <div>
          <div className="text-slate-800 text-[10px] font-bold">Avg. Conversion Time</div>
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-bold text-slate-800 leading-none mb-1">14 Days</div>
          </div>
          <div className="text-[9px] text-emerald-600 font-medium">-3 Days from last month</div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-orange-100 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
          <Star size={20} className="fill-orange-500" />
        </div>
        <div>
          <div className="text-slate-800 text-[10px] font-bold">Repeat Clients</div>
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-bold text-slate-800 leading-none mb-1">8</div>
          </div>
          <div className="text-[9px] text-orange-500 font-medium">25% of total clients</div>
        </div>
      </div>
    </>
  );

  // Filters
  const filters = (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <input
          type="text"
          placeholder="Search within converted clients..."
          className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <select
        value={filterIndustry}
        onChange={(e) => setFilterIndustry(e.target.value)}
        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:border-emerald-500"
      >
        <option value="">Industry</option>
        {uniqueIndustries.map(ind => (
          <option key={ind} value={ind}>{ind}</option>
        ))}
      </select>

      <select
        value={filterSource}
        onChange={(e) => setFilterSource(e.target.value)}
        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:border-emerald-500"
      >
        <option value="">Source</option>
        {uniqueSources.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <div className="relative">
        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <input
          type="text"
          placeholder="Converted Date"
          className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 w-36 cursor-pointer text-slate-600"
          readOnly
        />
      </div>

      <select
        value={filterStage}
        onChange={(e) => setFilterStage(e.target.value)}
        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:border-emerald-500"
      >
        <option value="">Sales Stage</option>
        {uniqueStages.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>


      {/* <button
        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
        onClick={() => {
          setSearchTerm('');
          setFilterSource('');
          setFilterIndustry('');
          setFilterStage('');
        }}
      >
        <RefreshCw size={14} />
      </button> */}
    </>
  );

  // Table Config
  const tableHeaders = (
    <>
      <th className="px-2 py-2 font-medium">Company / Client</th>
      <th className="px-2 py-2 font-medium">Industry</th>
      <th className="px-2 py-2 font-medium text-center">Source</th>
      <th className="px-2 py-2 font-medium text-center">Converted Date</th>
      <th className="px-2 py-2 font-medium text-center">Sales Stage</th>
      <th className="px-2 py-2 font-medium text-right">Revenue</th>
      <th className="px-2 py-2 font-medium text-center">Action</th>
    </>
  );

  const tableBody = (
    <>
      {paginatedRows.length === 0 ? (
        <tr>
          <td colSpan="8" className="px-2 py-4 text-center text-slate-500 font-medium">No results found</td>
        </tr>
      ) : paginatedRows.map((row) => {
        const isSelected = selectedIds.includes(row.id);
        return (
          <tr key={row.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-emerald-50/30' : ''}`}>
            <td className="px-2 py-2 text-center">
              <input
                type="checkbox"
                className="w-3 h-3 accent-emerald-500 cursor-pointer rounded-sm"
                checked={isSelected}
                onChange={() => onSelectRow(row.id)}
              />
            </td>
            <td className="px-2 py-2">
              <div className="font-semibold text-slate-800 text-[11px] cursor-pointer hover:text-emerald-600">
                <Link to={`/client-overview/${row.id}`}>{row.name}</Link>
              </div>
              <div className="text-[9px] text-slate-500">{row.subName}</div>
            </td>
            <td className="px-2 py-2">
              <span className={`px-1.5 py-0.5 rounded font-semibold text-[9px] ${getIndustryStyle(row.industry)}`}>
                {row.industry}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-semibold text-[9px] ${getSourceStyle(row.source)}`}>
                @{row.source}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <CalendarDays className="text-slate-400" size={10} />
                <span className="text-[9px] font-medium text-slate-800">{row.convertedDate}</span>
              </div>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-emerald-600 bg-emerald-50">
                {row.stage}
              </span>
            </td>
            <td className="px-2 py-2 text-right">
              <span className="font-semibold text-slate-800 text-[10px]">{row.revenue}</span>
            </td>
            <td className="px-2 py-2 text-center">
              <button className="p-1 hover:bg-slate-100 rounded text-slate-400 transition-colors">
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
      {/* Conversion Overview */}
      <div className="bg-white rounded-xl border border-gray-100 p-3">
        <h3 className="text-[13px] font-semibold text-[#0F172A] mb-2">Conversion Overview</h3>
        <div className="flex items-center justify-between gap-1">
          <div className="relative w-[56px] h-[56px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "This Month", value: 32, color: "#059669" }, // Emerald 600
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={18}
                  outerRadius={26}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#059669" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
              <h3 className="text-[14px] font-bold text-[#0F172A] leading-none">32</h3>
              <p className="text-[7px] text-gray-500 uppercase tracking-wider">Total</p>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 flex-grow">
            {[
              { name: "This Month", value: 32, pct: "100%", color: "#059669" },
              { name: "Last Month", value: 27, pct: "100%", color: "#cbd5e1" },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="font-medium text-[#0F172A] truncate">{item.name}</span>
                </div>
                <span className="font-semibold text-[#0F172A] shrink-0 ml-1">{item.value} <span className="text-gray-400 font-normal">({item.pct})</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Industry Wise Conversions */}
      <div className="bg-white rounded-xl border border-gray-100 p-3">
        <h3 className="text-[14px] font-semibold text-[#0F172A] mb-2">Industry Wise Conversions</h3>
        <div className="flex flex-col gap-2.5">
          {[
            { label: "Healthcare", count: 12, pct: "38%", color: "bg-emerald-600" },
            { label: "FMCG", count: 8, pct: "25%", color: "bg-blue-600" },
            { label: "Retail", count: 5, pct: "16%", color: "bg-orange-500" },
            { label: "Biotechnology", count: 4, pct: "13%", color: "bg-purple-600" },
            { label: "Manufacturing", count: 3, pct: "9%", color: "bg-sky-500" },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between text-[11px]">
              <span className="text-slate-700 w-24 font-medium pr-2 shrink-0">{s.label}</span>
              <div className="flex-grow mx-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${s.color} rounded-full`} style={{ width: s.pct }}></div>
              </div>
              <div className="flex items-center gap-1 w-12 justify-end shrink-0">
                <span className="font-semibold text-slate-800">{s.count}</span>
                <span className="text-slate-400 text-[9px]">({s.pct})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Conversions */}
      <div className="bg-white rounded-xl border border-gray-100 p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Recent Conversions</h3>
        </div>
        <div className="flex flex-col gap-2.5">
          {[
            { name: "GreenLife Ayurveda", date: "27 May 2026" },
            { name: "Nature's Harmony Pvt. Ltd.", date: "26 May 2026" },
            { name: "Wellness World", date: "25 May 2026" },
            { name: "Herbal King Exports", date: "24 May 2026" },
            { name: "Arogya Organics", date: "23 May 2026" },
          ].map((lead, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Users size={12} className="fill-emerald-600" />
                </div>
                <span className="text-[11px] font-medium text-slate-700 truncate max-w-[130px]">{lead.name}</span>
              </div>
              <span className="text-[9px] text-slate-400 font-medium shrink-0">{lead.date}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 p-3">
        <h3 className="text-[14px] font-semibold text-[#0F172A] mb-2">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <button className="h-[34px] rounded-lg bg-[#EEF9F2] flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity">
            <FaWhatsapp size={12} className="text-green-600 shrink-0" />
            <span className="text-[9px] font-bold text-green-700 leading-tight">Send Bulk WhatsApp</span>
          </button>
          <button className="h-[34px] rounded-lg bg-[#FFF3E0] flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity">
            <CalendarDays size={12} className="text-orange-600 shrink-0" />
            <span className="text-[9px] font-bold text-orange-700 leading-tight">Schedule Follow-Up</span>
          </button>
          <button className="h-[34px] rounded-lg bg-[#F3E8FF] flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity">
            <Mail size={12} className="text-purple-600 shrink-0" />
            <span className="text-[9px] font-bold text-purple-700 leading-tight">Send Email</span>
          </button>
          <button className="h-[34px] rounded-lg bg-[#E0F2FE] flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity">
            <FileText size={12} className="text-blue-600 shrink-0" />
            <span className="text-[9px] font-bold text-blue-700 leading-tight">Create Proposal</span>
          </button>
        </div>
      </div>
    </>
  );

  const pagination = (
    <>
      <div className="text-slate-500">
        Showing {paginatedRows.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, totalLeads)} of {totalLeads} clients
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(1)} disabled={page === 1} className="p-1 rounded hover:bg-slate-100 text-slate-400 disabled:opacity-50">«</button>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded hover:bg-slate-100 text-slate-400 disabled:opacity-50">‹</button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`w-6 h-6 rounded font-bold flex items-center justify-center ${page === p ? 'bg-[#00a65a] text-white' : 'hover:bg-slate-100'}`}
          >
            {p}
          </button>
        ))}

        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 rounded hover:bg-slate-100 text-slate-400 disabled:opacity-50">›</button>
        <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-1 rounded hover:bg-slate-100 text-slate-400 disabled:opacity-50">»</button>
      </div>
      <div className="flex items-center gap-2 text-slate-500">
        <span>Rows per page:</span>
        <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="border border-slate-200 rounded py-0.5 px-1 bg-white outline-none cursor-pointer text-slate-700">
          <option value={8}>8</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </>
  );

  return (
    <BaseLeadPage
      title="Converted Clients"
      subtitle="Leads that have been successfully converted into clients"
      badgeCount={<span className="text-emerald-700">{totalLeads}</span>}
      headerActions={
        <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm">
          <CalendarDays size={14} className="text-slate-500" /> This Month <ChevronDown size={14} className="text-slate-500" />
        </button>
      }
      statCards={statCards}
      filterBar={filters}
      tableHeaders={tableHeaders}
      tableBody={tableBody}
      rightSidebar={rightSidebar}
      pagination={pagination}
      isAllSelected={isAllSelected}
      onSelectAll={onSelectAll}
      onReset={() => {
        setSearchTerm('');
        setFilterSource('');
        setFilterIndustry('');
        setFilterStage('');
        setPage(1);
        setSelectedIds([]);
      }}
    />
  );
};

export default ConfirmClientList;
