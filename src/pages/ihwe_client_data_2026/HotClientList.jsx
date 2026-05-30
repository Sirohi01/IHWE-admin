import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCompanies } from "../../features/company/companySlice";
import BaseLeadPage from "../../layout/BaseLeadPage";
import {
  Search, Download, Plus, Upload, MessageCircle, Phone, Mail, MoreVertical,
  Calendar, CalendarDays, ArrowRight, RefreshCw, Flame, MessageSquare, Send, CheckCircle2
} from "lucide-react";
import { FaStar, FaRegStar, FaWhatsapp } from 'react-icons/fa';
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

const dummyHotRows = [
  { id: 1, name: "GreenLife Ayurveda", industry: "Ayurveda & Herbs", source: "Website", score: 95, status: "In Discussion", lastDate: "27 May 2026", lastTime: "11:00 AM", lastType: "WhatsApp", nextAction: "Follow-up Call", nextDate: "Today, 04:00 PM" },
  { id: 2, name: "Nature's Harmony Pvt. Ltd.", industry: "Health & Wellness", source: "Referral", score: 92, status: "Proposal Sent", lastDate: "28 May 2026", lastTime: "03:00 PM", lastType: "Call", nextAction: "Send Proposal", nextDate: "Today, 05:00 PM" },
  { id: 3, name: "Wellness World", industry: "Wellness Products", source: "Trade Show", score: 90, status: "In Discussion", lastDate: "29 May 2026", lastTime: "02:00 PM", lastType: "WhatsApp", nextAction: "Demo Call", nextDate: "Tomorrow, 11:00 AM" },
  { id: 4, name: "Herbal King Exports", industry: "Herbal Products", source: "Social Media", score: 88, status: "In Discussion", lastDate: "28 May 2026", lastTime: "05:00 PM", lastType: "Email", nextAction: "Follow-up Email", nextDate: "Today, 01:00 PM" },
  { id: 5, name: "Arogya Organics", industry: "Organic Food", source: "Google Ads", score: 85, status: "Proposal Sent", lastDate: "26 May 2026", lastTime: "11:00 AM", lastType: "Call", nextAction: "Negotiation Call", nextDate: "Tomorrow, 04:00 PM" },
  { id: 6, name: "Pureveda Solutions", industry: "Healthcare", source: "Email Campaign", score: 83, status: "In Discussion", lastDate: "27 May 2026", lastTime: "10:30 AM", lastType: "WhatsApp", nextAction: "Product Demo", nextDate: "30 May 2026, 11:00 AM" },
  { id: 7, name: "Shakti Bio Products", industry: "Biotechnology", source: "Referral", score: 82, status: "In Discussion", lastDate: "30 May 2026", lastTime: "11:30 AM", lastType: "WhatsApp", nextAction: "Follow-up Call", nextDate: "30 May 2026, 04:00 PM" },
  { id: 8, name: "Holistic Nutrition Co.", industry: "Nutrition", source: "Website", score: 80, status: "Ready to Convert", lastDate: "28 May 2026", lastTime: "04:00 PM", lastType: "Call", nextAction: "Final Discussion", nextDate: "Tomorrow, 12:00 PM" },
];

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

  // Auth State
  const { user } = useSelector(state => state.auth);
  const isSuperAdmin = user?.role?.toLowerCase().replace(/[^a-z]/g, '') === 'superadmin';

  // Redux data
  const companiesState = useSelector((state) => state.companies);
  const allCompanies = Array.isArray(companiesState?.companies) ? companiesState.companies : [];
  const isLoading = companiesState?.loading ?? false;

  useEffect(() => {
    dispatch(fetchCompanies({ status: 'Est./PI Sent' })); // Or whatever the real status is for 'Hot'
  }, [dispatch]);

  // Dummy Hot filtering logic
  const filteredDummyRows = dummyHotRows.filter(r => {
    const s = searchTerm.toLowerCase();
    const matchSearch = s === '' || (r.name.toLowerCase().includes(s) || r.industry.toLowerCase().includes(s));
    const matchSource = filterSource === '' || r.source === filterSource;
    const matchIndustry = filterIndustry === '' || r.industry === filterIndustry;
    const matchStatus = filterStatus === '' || r.status === filterStatus;
    const matchScore = filterLeadScore === '' ||
      (filterLeadScore === '90' ? r.score >= 90 :
        filterLeadScore === '80' ? (r.score >= 80 && r.score < 90) :
          filterLeadScore === '70' ? (r.score >= 70 && r.score < 80) : true);
    return matchSearch && matchSource && matchIndustry && matchStatus && matchScore;
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

  const uniqueSources = [...new Set(dummyHotRows.map(r => r.source).filter(Boolean))];
  const uniqueIndustries = [...new Set(dummyHotRows.map(r => r.industry).filter(Boolean))];
  const uniqueStatuses = [...new Set(dummyHotRows.map(r => r.status).filter(Boolean))];

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
    return "bg-slate-50 text-slate-700 border-slate-200 dot-slate-500";
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
      <button className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm">
        <FaWhatsapp size={14} /> Send Bulk WhatsApp
      </button>
    </>
  );

  // Stat Cards
  const statCards = (
    <>
      <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
          <Flame size={20} className="fill-rose-500" />
        </div>
        <div>
          <div className="text-slate-800 text-[10px] font-bold">Total Hot Leads</div>
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-bold text-slate-800 leading-none mb-1">{totalLeads}</div>
            <div className="text-[9px] text-rose-500 font-medium">High potential</div>
          </div>
        </div>
      </div>
      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
          <MessageSquare size={18} />
        </div>
        <div>
          <div className="text-slate-800 text-[10px] font-bold">In Discussion</div>
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-bold text-slate-800 leading-none mb-1">11</div>
            <div className="text-[9px] text-orange-600 font-medium">Actively engaged</div>
          </div>
        </div>
      </div>
      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
          <Send size={18} />
        </div>
        <div>
          <div className="text-slate-800 text-[10px] font-bold">Proposal Sent</div>
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-bold text-slate-800 leading-none mb-1">5</div>
            <div className="text-[9px] text-blue-600 font-medium">Awaiting response</div>
          </div>
        </div>
      </div>
      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
          <CheckCircle2 size={18} />
        </div>
        <div>
          <div className="text-slate-800 text-[10px] font-bold">Ready to Convert</div>
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-bold text-slate-800 leading-none mb-1">2</div>
            <div className="text-[9px] text-emerald-600 font-medium">Final stage</div>
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
          placeholder="Search within my hot leads..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <select value={filterSource} onChange={e => { setFilterSource(e.target.value); setPage(1); }} className="py-1.5 px-2 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-700 outline-none cursor-pointer">
        <option value="">Source ⌄</option>
        {uniqueSources.map((s, i) => <option key={i} value={s}>{s}</option>)}
      </select>
      <select value={filterIndustry} onChange={e => { setFilterIndustry(e.target.value); setPage(1); }} className="py-1.5 px-2 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-700 outline-none cursor-pointer">
        <option value="">Industry ⌄</option>
        {uniqueIndustries.map((s, i) => <option key={i} value={s}>{s}</option>)}
      </select>
      <select value={filterLeadScore} onChange={e => { setFilterLeadScore(e.target.value); setPage(1); }} className="py-1.5 px-2 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-700 outline-none cursor-pointer">
        <option value="">Lead Score ⌄</option>
        <option value="90">90 - 100</option>
        <option value="80">80 - 89</option>
        <option value="70">70 - 79</option>
      </select>
      <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="py-1.5 px-2 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-700 outline-none cursor-pointer">
        <option value="">Status ⌄</option>
        {uniqueStatuses.map((s, i) => <option key={i} value={s}>{s}</option>)}
      </select>
    </>
  );

  // Table Headers
  const tableHeaders = (
    <>
      <th className="px-2 py-2 font-medium">Company / Lead</th>
      <th className="px-2 py-2 font-medium">Source</th>
      <th className="px-2 py-2 font-medium">Lead Score</th>
      <th className="px-2 py-2 font-medium">Status</th>
      <th className="px-2 py-2 font-medium">Last Conversation</th>
      <th className="px-2 py-2 font-medium">Next Action</th>
      <th className="px-2 py-2 w-10">Action</th>
    </>
  );

  const tableBody = (
    <>
      {paginatedRows.length === 0 ? (
        <tr>
          <td colSpan="7" className="px-2 py-4 text-center text-slate-500 font-medium">No results found</td>
        </tr>
      ) : paginatedRows.map((row, i) => {
        const style = getStatusStyle(row.status);
        const statusBg = style.split(' ')[0];
        const statusText = style.split(' ')[1];
        const statusDot = style.split(' ')[3]?.replace('dot-', 'bg-') || "bg-slate-500";

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
            <td className="px-2 py-2">
              <span className={`px-1.5 py-0.5 rounded font-semibold text-[9px] ${getSourceStyle(row.source)}`}>
                @{row.source}
              </span>
            </td>
            <td className="px-2 py-2">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-rose-500 text-[10px]">{row.score}/100</span>
                <div className="flex text-[8px] text-rose-500">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                </div>
              </div>
            </td>
            <td className="px-2 py-2">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${statusBg} ${statusText} border-transparent`}>
                <span className={`w-1 h-1 rounded-full ${statusDot}`}></span>
                {row.status}
              </span>
            </td>
            <td className="px-2 py-2">
              <div className="flex items-center gap-1.5">
                {row.lastType === 'WhatsApp' ? <div className="p-1 bg-emerald-50 rounded-full"><FaWhatsapp className="text-emerald-500" size={10} /></div> :
                  row.lastType === 'Call' ? <div className="p-1 bg-blue-50 rounded-full"><Phone className="text-blue-500" size={10} /></div> :
                    <div className="p-1 bg-slate-100 rounded-full"><Mail className="text-slate-500" size={10} /></div>}
                <div>
                  <div className="text-[9px] font-medium text-slate-800">{row.lastDate}</div>
                  <div className="text-[8px] text-slate-500">{row.lastTime}</div>
                </div>
              </div>
            </td>
            <td className="px-2 py-2">
              <div className="flex items-center gap-1.5">
                {row.nextAction.includes('Call') ? <div className="p-1"><Phone className="text-rose-500" size={10} /></div> :
                  <div className="p-1"><CalendarDays className="text-rose-500" size={10} /></div>}
                <div>
                  <div className="text-[9px] font-medium text-slate-800">{row.nextAction}</div>
                  <div className="text-[8px] text-rose-500 font-semibold">{row.nextDate}</div>
                </div>
              </div>
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
      <div className="flex flex-col gap-1">
        {/* Hot Leads Overview */}
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <h3 className="text-[13px] font-semibold text-[#0F172A] mb-2">Hot Leads Overview</h3>
          <div className="flex items-center justify-between gap-2">
            <div className="relative w-[70px] h-[70px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "In Discussion", value: 11, color: "#f97316" },
                      { name: "Proposal Sent", value: 5, color: "#eab308" },
                      { name: "Ready to Convert", value: 2, color: "#10b981" }
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
                      { color: "#eab308" },
                      { color: "#10b981" }
                    ].map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <h3 className="text-[14px] font-bold text-[#0F172A] leading-none">{totalLeads}</h3>
                <p className="text-[9px] text-gray-500">Total</p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 flex-grow">
              {[
                { name: "In Discussion", value: 11, pct: "61%", color: "#f97316" },
                { name: "Proposal Sent", value: 5, pct: "28%", color: "#eab308" },
                { name: "Ready to Convert", value: 2, pct: "11%", color: "#10b981" }
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between text-[10px]">
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

        {/* Lead Score Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <h3 className="text-[13px] font-semibold text-[#0F172A] mb-2">Lead Score Distribution</h3>
          <div className="flex flex-col gap-1.5">
            {[
              { label: "90 - 100", count: 6, pct: "33%", color: "bg-rose-500" },
              { label: "80 - 89", count: 7, pct: "29%", color: "bg-orange-500" },
              { label: "70 - 79", count: 3, pct: "17%", color: "bg-yellow-500" },
              { label: "Below 70", count: 2, pct: "11%", color: "bg-emerald-500" },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between text-[10px]">
                <span className="text-slate-700 w-12 font-medium">{s.label}</span>
                <div className="flex-grow mx-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full`} style={{ width: s.pct }}></div>
                </div>
                <div className="flex items-center gap-1 w-10 justify-end">
                  <span className="font-semibold text-slate-800">{s.count}</span>
                  <span className="text-slate-400">({s.pct})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Hot Leads by Score */}
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[13px] font-semibold text-[#0F172A]">Top Hot Leads by Score</h3>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { name: "GreenLife Ayurveda", score: 95, icon: <FaWhatsapp size={10} className="text-emerald-500" /> },
              { name: "Nature's Harmony Pvt. Ltd.", score: 92, icon: <FaWhatsapp size={10} className="text-emerald-500" /> },
              { name: "Wellness World", score: 90, icon: <FaWhatsapp size={10} className="text-emerald-500" /> },
            ].map((l, i) => (
              <div key={i} className={`flex items-center justify-between ${i !== 2 ? 'pb-2 border-b border-gray-50' : ''}`}>
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                    {l.icon}
                  </div>
                  <span className="font-medium text-[#0F172A] text-[10px] truncate">{l.name}</span>
                </div>
                <span className="shrink-0 h-4 px-1.5 rounded bg-rose-50 text-rose-600 text-[9px] font-bold flex items-center justify-center ml-2">
                  {l.score}/100
                </span>
              </div>
            ))}
            <div className="mt-1 pt-2 border-t border-gray-100">
              <button className="w-full flex items-center justify-center gap-1 text-[10px] font-semibold text-slate-600 hover:text-slate-800 transition-all">
                <span>View All Hot Leads</span>
                <ArrowRight size={10} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="mt-auto">
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <h3 className="text-[13px] font-semibold text-[#0F172A] mb-2">Quick Actions</h3>
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
              <Phone size={12} className="text-blue-600 shrink-0" />
              <span className="text-[9px] font-bold text-blue-700 leading-tight">Make a Call</span>
            </button>
          </div>
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
      title="My Hot Leads"
      subtitle="High potential leads that are most likely to convert"
      badgeCount={<><Flame size={12} className="inline mr-1 fill-rose-500 text-rose-500" />18</>}
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
        setFilterLeadScore('');
        setFilterStatus('');
        setPage(1);
        setSelectedIds([]);
      }}
    />
  );
};

export default HotClientList;
