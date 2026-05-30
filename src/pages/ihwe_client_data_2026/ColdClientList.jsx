import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCompanies } from "../../features/company/companySlice";
import BaseLeadPage from "../../layout/BaseLeadPage";
import {
  Download, Search, Plus, Filter, AlertCircle, FileText, Upload, RefreshCw, MoreVertical,
  CalendarDays, Trash2, Archive, UserPlus, Phone, Mail, PauseCircle, XCircle, Hourglass, BarChart3
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

const dummyRows = [
  { id: 1, name: "HealthPlus Solutions", industry: "Healthcare", status: "On Hold", reason: "Budget Approval Pending", source: "Website", date: "28 May 2026", value: "₹ 2,40,000" },
  { id: 2, name: "NutriCare Pvt. Ltd.", industry: "Nutrition", status: "On Hold", reason: "Decision in Next Quarter", source: "Referral", date: "26 May 2026", value: "₹ 1,80,000" },
  { id: 3, name: "MediWell Clinic", industry: "Healthcare", status: "Lost", reason: "Chose Competitor", source: "Trade Show", date: "25 May 2026", value: "₹ 1,25,000" },
  { id: 4, name: "BioLife Sciences", industry: "Biotechnology", status: "Lost", reason: "Not a Good Fit", source: "Website", date: "24 May 2026", value: "₹ 95,000" },
  { id: 5, name: "Fit & Active Gym", industry: "Fitness", status: "On Hold", reason: "Requirement on Hold", source: "Social Media", date: "22 May 2026", value: "₹ 1,10,000" },
  { id: 6, name: "Care Point Hospital", industry: "Healthcare", status: "Lost", reason: "No Response", source: "Referral", date: "21 May 2026", value: "₹ 2,75,000" },
  { id: 7, name: "Herbalife Stores", industry: "Retail", status: "On Hold", reason: "Comparing Vendors", source: "Google Ads", date: "20 May 2026", value: "₹ 75,000" },
  { id: 8, name: "PharmaCare Distributors", industry: "Pharmaceuticals", status: "Lost", reason: "Pricing Issues", source: "Email Campaign", date: "19 May 2026", value: "₹ 1,45,000" },
  { id: 9, name: "Wellness Tracks", industry: "Wellness", status: "On Hold", reason: "Internal Discussion", source: "Website", date: "18 May 2026", value: "₹ 90,000" },
  { id: 10, name: "OrthoLife Clinic", industry: "Healthcare", status: "Lost", reason: "Not Interested", source: "Trade Show", date: "17 May 2026", value: "₹ 1,35,000" },
];

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

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  // Dummy filtering logic
  const filteredDummyRows = dummyRows.filter(r => {
    const s = searchTerm.toLowerCase();
    const matchSearch = s === '' || (r.name.toLowerCase().includes(s) || r.industry.toLowerCase().includes(s));
    const matchSource = filterSource === '' || r.source === filterSource;
    const matchIndustry = filterIndustry === '' || r.industry === filterIndustry;
    const matchStatus = filterStatus === '' || r.status === filterStatus;
    const matchReason = filterReason === '' || r.reason.includes(filterReason);
    return matchSearch && matchSource && matchIndustry && matchStatus && matchReason;
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

  const uniqueSources = [...new Set(dummyRows.map(r => r.source).filter(Boolean))];
  const uniqueIndustries = [...new Set(dummyRows.map(r => r.industry).filter(Boolean))];

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

  // Header Actions
  const headerActions = (
    <>
      <div className="relative flex-grow xl:flex-grow-0 min-w-[200px] w-full sm:w-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <input
          type="text"
          placeholder="Search by Name, Company, Email..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button onClick={() => navigate("/ihweClientData2026/addNewClients")} className="flex items-center gap-2 bg-[#00a65a] hover:bg-[#008d4c] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm">
        <Plus size={14} /> Add Lead
      </button>
      <button onClick={() => navigate("/ihweClientData2026/uploadExhibitor")} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm">
        <Upload size={14} className="text-blue-500" /> Import Leads
      </button>
      <button className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm">
        <FaWhatsapp size={14} /> Send Bulk WhatsApp
      </button>
    </>
  );

  // Stat Cards
  const statCards = (
    <>
      <div className="bg-white p-3 rounded-xl border border-orange-100 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
          <PauseCircle size={20} className="text-orange-500" />
        </div>
        <div>
          <div className="text-slate-800 text-[10px] font-bold">Total Hold Leads</div>
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-bold text-slate-800 leading-none mb-1">14</div>
            <div className="text-[9px] text-orange-500 font-medium">52% of total</div>
          </div>
        </div>
      </div>
      <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
          <XCircle size={20} className="text-rose-500" />
        </div>
        <div>
          <div className="text-slate-800 text-[10px] font-bold">Total Lost Leads</div>
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-bold text-slate-800 leading-none mb-1">13</div>
            <div className="text-[9px] text-rose-500 font-medium">48% of total</div>
          </div>
        </div>
      </div>
      <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
          <Hourglass size={18} className="text-blue-500" />
        </div>
        <div>
          <div className="text-slate-800 text-[10px] font-bold">Avg. Hold Duration</div>
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-bold text-slate-800 leading-none mb-1">18 Days</div>
            <div className="text-[9px] text-slate-500 font-medium">For hold leads</div>
          </div>
        </div>
      </div>
      <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
          <BarChart3 size={18} className="text-purple-500" />
        </div>
        <div>
          <div className="text-slate-800 text-[10px] font-bold">Potential Revenue Lost</div>
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-bold text-slate-800 leading-none mb-1">₹ 8,75,000</div>
            <div className="text-[9px] text-slate-500 font-medium">Estimated value</div>
          </div>
        </div>
      </div>
    </>
  );

  // Filter Bar
  const filterBar = (
    <>
      <div className="relative min-w-[180px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
        <input
          type="text"
          placeholder="Search within hold / lost leads..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="py-1.5 px-2 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-700 outline-none cursor-pointer">
        <option value="">Status ⌄</option>
        <option value="On Hold">On Hold</option>
        <option value="Lost">Lost</option>
      </select>
      <select value={filterReason} onChange={e => { setFilterReason(e.target.value); setPage(1); }} className="py-1.5 px-2 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-700 outline-none cursor-pointer">
        <option value="">Reason ⌄</option>
        <option value="Budget">Budget</option>
        <option value="Competitor">Competitor</option>
        <option value="Not interested">Not interested</option>
      </select>
      <select value={filterSource} onChange={e => { setFilterSource(e.target.value); setPage(1); }} className="py-1.5 px-2 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-700 outline-none cursor-pointer">
        <option value="">Source ⌄</option>
        {uniqueSources.map((s, i) => <option key={i} value={s}>{s}</option>)}
      </select>
      <select value={filterIndustry} onChange={e => { setFilterIndustry(e.target.value); setPage(1); }} className="py-1.5 px-2 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-700 outline-none cursor-pointer">
        <option value="">Industry ⌄</option>
        {uniqueIndustries.map((s, i) => <option key={i} value={s}>{s}</option>)}
      </select>
    </>
  );

  // Table Headers
  const tableHeaders = (
    <>
      <th className="px-2 py-2 font-medium">Company / Lead</th>
      <th className="px-2 py-2 font-medium text-center">Status</th>
      <th className="px-2 py-2 font-medium">Reason</th>
      <th className="px-2 py-2 font-medium">Source</th>
      <th className="px-2 py-2 font-medium">Last Contacted</th>
      <th className="px-2 py-2 font-medium">Potential Value</th>
      <th className="px-2 py-2 w-10 text-center">Action</th>
    </>
  );

  const tableBody = (
    <>
      {paginatedRows.length === 0 ? (
        <tr>
          <td colSpan="7" className="px-2 py-4 text-center text-slate-500 font-medium">No results found</td>
        </tr>
      ) : paginatedRows.map((row, i) => {
        return (
          <tr key={row.id} className="hover:bg-slate-50 transition-colors">
            <td className="px-2 py-2 text-center">
              <input
                type="checkbox"
                className="w-3 h-3 accent-blue-500 cursor-pointer rounded-sm"
                checked={selectedIds.includes(row.id)}
                onChange={() => onSelectRow(row.id)}
              />
            </td>
            <td className="px-2 py-2">
              <div className="font-semibold text-slate-800 text-[11px] cursor-pointer hover:text-blue-600">
                <Link to={`/client-overview/${row.id}`}>{row.name}</Link>
              </div>
              <div className="text-[9px] text-slate-500">{row.industry}</div>
            </td>
            <td className="px-2 py-2 text-center">
              <span className={`inline-flex px-2 py-0.5 rounded font-semibold text-[9px] ${getStatusStyle(row.status)}`}>
                {row.status}
              </span>
            </td>
            <td className="px-2 py-2 text-slate-700 font-medium text-[9px]">
              {row.reason}
            </td>
            <td className="px-2 py-2">
              <span className={`px-1.5 py-0.5 rounded font-semibold text-[9px] flex inline-flex items-center gap-1 ${getSourceStyle(row.source)}`}>
                <span className="text-[10px]">⊕</span> {row.source}
              </span>
            </td>
            <td className="px-2 py-2">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="text-slate-400" size={10} />
                <div className="text-[10px] font-medium text-slate-800">{row.date}</div>
              </div>
            </td>
            <td className="px-2 py-2 font-medium text-slate-800 text-[10px]">
              {row.value}
            </td>
            <td className="px-2 py-2 text-center">
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
      {/* Lead Status Overview */}
      <div className="bg-white rounded-xl border border-gray-100 p-3">
        <h3 className="text-[14px] font-semibold text-[#0F172A] mb-2">Lead Status Overview</h3>
        <div className="flex items-center justify-between gap-2">
          <div className="relative w-[70px] h-[70px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "On Hold", value: 14, color: "#f97316" },
                    { name: "Lost", value: 13, color: "#ef4444" }
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
              <h3 className="text-[14px] font-bold text-[#0F172A] leading-none">27</h3>
              <p className="text-[9px] text-gray-500">Total</p>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 flex-grow">
            {[
              { name: "On Hold", value: 14, pct: "52%", color: "#f97316" },
              { name: "Lost", value: 13, pct: "48%", color: "#ef4444" }
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

      {/* Hold Leads by Reason */}
      <div className="bg-white rounded-xl border border-gray-100 p-3">
        <h3 className="text-[14px] font-semibold text-[#0F172A] mb-2">Hold Leads by Reason</h3>
        <div className="flex flex-col gap-2">
          {[
            { label: "Budget Approval Pending", count: 4, pct: "29%", color: "bg-orange-500" },
            { label: "Decision in Next Quarter", count: 3, pct: "21%", color: "bg-orange-400" },
            { label: "Requirement on Hold", count: 3, pct: "21%", color: "bg-orange-400" },
            { label: "Comparing Vendors", count: 2, pct: "14%", color: "bg-orange-300" },
            { label: "Internal Discussion", count: 2, pct: "14%", color: "bg-orange-300" },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between text-[11px]">
              <span className="text-slate-700 w-[145px] font-medium pr-2 shrink-0">{s.label}</span>
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

      {/* Lost Leads by Reason */}
      <div className="bg-white rounded-xl border border-gray-100 p-3">
        <h3 className="text-[14px] font-semibold text-[#0F172A] mb-2">Lost Leads by Reason</h3>
        <div className="flex flex-col gap-2">
          {[
            { label: "Chose Competitor", count: 5, pct: "39%", color: "bg-red-600" },
            { label: "Not a Good Fit", count: 3, pct: "23%", color: "bg-red-500" },
            { label: "Pricing Issues", count: 3, pct: "23%", color: "bg-red-500" },
            { label: "No Response", count: 1, pct: "8%", color: "bg-red-400" },
            { label: "Not Interested", count: 1, pct: "8%", color: "bg-red-400" },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between text-[11px]">
              <span className="text-slate-700 w-32 font-medium truncate pr-2">{s.label}</span>
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

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 p-2">
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
            <UserPlus size={12} className="text-blue-600 shrink-0" />
            <span className="text-[9px] font-bold text-blue-700 leading-tight">Add to Nurture List</span>
          </button>
        </div>
      </div>
    </>
  );

  const pagination = (
    <>
      <div className="text-slate-500">
        Showing {paginatedRows.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, totalLeads)} of {totalLeads} leads
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
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </>
  );

  return (
    <BaseLeadPage
      title="Hold / Lost Leads"
      subtitle="Leads that are currently on hold or lost"
      badgeCount={<span className="text-rose-500 bg-rose-50 inline-block px-1 rounded-full border-none">27</span>}
      headerActions={headerActions}
      statCards={statCards}
      filterBar={filterBar}
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
        setFilterReason('');
        setFilterStatus('');
        setPage(1);
        setSelectedIds([]);
      }}
    />
  );
};

export default ColdClientList;
