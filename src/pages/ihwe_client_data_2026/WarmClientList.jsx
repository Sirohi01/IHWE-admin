import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCompanies } from "../../features/company/companySlice";
import BaseLeadPage from "../../layout/BaseLeadPage";
import {
  Search, Plus, Upload, MessageCircle, CalendarDays, Clock3, Filter, ChevronDown, MoreVertical, ArrowRight, Bell, Phone, Mail
} from "lucide-react";
import { FaWhatsapp, FaStar } from 'react-icons/fa';
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

const overviewData = [
  { name: "Due Today", value: 5, percentage: "42%", color: "#FF7A1A" },
  { name: "Due Tomorrow", value: 2, percentage: "17%", color: "#FACC15" },
  { name: "Due This Week", value: 5, percentage: "41%", color: "#3B82F6" },
  { name: "Overdue", value: 2, percentage: "17%", color: "#EF4444" },
];

const overdueLeads = [
  { company: "ABC Organics", date: "25 May 2026", days: "4 days overdue" },
  { company: "Green Foods", date: "27 May 2026", days: "2 days overdue" },
];

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
      }));
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, page, limit, searchTerm, filterSource, filterStatus]);

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
    if (s.includes('today')) return "bg-orange-100 text-orange-700";
    if (s.includes('overdue')) return "bg-red-100 text-red-700";
    if (s.includes('upcoming')) return "bg-blue-100 text-blue-700";
    return "bg-slate-100 text-slate-700";
  };

  // Header Actions
  const headerActions = (
    <>
      <button onClick={() => navigate("/ihweClientData2026/addNewClients")} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm">
        <Plus size={14} /> Add Lead
      </button>
      <button onClick={() => navigate("/ihweClientData2026/uploadExhibitor")} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm">
        <Upload size={14} /> Import Leads
      </button>
      <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm">
        <MessageCircle size={14} /> Send Bulk WhatsApp
      </button>
    </>
  );

  // Stat Cards
  const stats = [
    { title: "Total Follow-Ups", value: "12", subtitle: "Pending", icon: CalendarDays, bg: "bg-[#F3F7FF]", iconBg: "bg-[#E7F0FF]", iconColor: "text-[#2563EB]" },
    { title: "Due Today", value: "05", subtitle: "Follow-ups", icon: CalendarDays, bg: "bg-[#FFF8EE]", iconBg: "bg-[#FFE8C7]", iconColor: "text-[#F97316]" },
    { title: "Overdue", value: "02", subtitle: "Follow-ups", icon: Clock3, bg: "bg-[#FFF2F4]", iconBg: "bg-[#FFDDE3]", iconColor: "text-[#EF4444]" },
    { title: "Due This Week", value: "07", subtitle: "Follow-ups", icon: CalendarDays, bg: "bg-[#F1FBF5]", iconBg: "bg-[#DDF7E6]", iconColor: "text-[#16A34A]" },
    { title: "Due This Month", value: "10", subtitle: "Follow-ups", icon: CalendarDays, bg: "bg-[#F8F3FF]", iconBg: "bg-[#EBDDFF]", iconColor: "text-[#7C3AED]" },
  ];

  const statCards = (
    <>
      {stats.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className={`${item.bg} rounded-xl border border-gray-100 p-3 shadow-sm flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.iconBg}`}>
              <Icon size={18} className={item.iconColor} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-800">{item.title}</div>
              <div className="flex items-baseline gap-2">
                <div className="text-xl font-bold text-slate-800 leading-none mb-1">{item.value}</div>
              </div>
              <div className="text-[9px] text-slate-500 font-medium">{item.subtitle}</div>
            </div>
          </div>
        );
      })}
    </>
  );

  // Filter Bar
  const filterBar = (
    <>
      <div className="relative min-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
        <input
          type="text"
          placeholder="Search within follow-ups..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <button className="flex items-center gap-2 py-1.5 px-3 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-700">
        Follow-Up Date <CalendarDays size={12} className="text-slate-500" />
      </button>
      <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="py-1.5 px-2 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-700 outline-none cursor-pointer">
        <option value="">Status</option>
        {uniqueStatuses.map((s, i) => <option key={i} value={s}>{s}</option>)}
      </select>
      <select value={filterSource} onChange={e => { setFilterSource(e.target.value); setPage(1); }} className="py-1.5 px-2 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-700 outline-none cursor-pointer">
        <option value="">Source</option>
        {uniqueSources.map((s, i) => <option key={i} value={s}>{s}</option>)}
      </select>
      <button className="flex items-center gap-2 py-1.5 px-3 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-700">
        Lead Owner: Me <ChevronDown size={12} className="text-slate-500" />
      </button>
      <button className="flex items-center gap-2 py-1.5 px-3 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-700">
        <Filter size={12} /> More Filters <ChevronDown size={12} className="text-slate-500" />
      </button>
    </>
  );

  // Table Headers
  const tableHeaders = (
    <>
      <th className="px-2 py-2 font-medium">Company Name</th>
      <th className="px-2 py-2 font-medium">Source</th>
      <th className="px-2 py-2 font-medium">Lead Score</th>
      <th className="px-2 py-2 font-medium">Status</th>
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
        return (
          <tr key={row._id || i} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}>
            <td className="px-2 py-2 text-center">
              <input
                type="checkbox"
                className="w-3 h-3 accent-blue-500 cursor-pointer rounded-sm"
                checked={isSelected}
                onChange={() => onSelectRow(row._id)}
              />
            </td>
            <td className="px-2 py-2 font-semibold text-slate-800 text-[11px] cursor-pointer hover:text-blue-600">
              <Link to={`/client-overview/${row._id}`}>{toTitleCase(row.companyName)}</Link>
            </td>
            <td className="px-2 py-2">
              <span className={`px-2 py-0.5 rounded-full font-semibold text-[9px] ${getSourceStyle(source)}`}>
                {toTitleCase(source)}
              </span>
            </td>
            <td className="px-2 py-2">
              <div className="flex items-center gap-1.5">
                <div className="flex text-green-500 text-[9px]">
                  <FaStar /><FaStar /><FaStar /><FaStar />
                  <FaStar className="text-green-200" />
                </div>
                <span className="font-semibold text-slate-700 text-[10px]">{row.leadScore || 70}</span>
              </div>
            </td>
            <td className="px-2 py-2">
              <span className={`inline-flex px-2 py-0.5 rounded font-semibold text-[9px] ${getStatusStyle(row.companyStatus || "Due Today")}`}>
                {toTitleCase(row.companyStatus || "Due Today")}
              </span>
            </td>
            <td className="px-2 py-2">
              <div className="flex flex-col">
                <span className="font-medium text-slate-800 text-[10px]">
                  {row.updatedAt ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(row.updatedAt)) : "-"}
                </span>
                <span className="text-[9px] text-slate-500">
                  {row.updatedAt ? new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(row.updatedAt)) : "-"}
                </span>
              </div>
            </td>
            <td className="px-2 py-2">
              <div className="flex gap-2">
                <MessageCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] font-medium text-slate-800">
                    {row.updatedAt ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(row.updatedAt)) : "-"}
                  </p>
                  <p className="text-[8px] text-slate-500">WhatsApp</p>
                </div>
              </div>
            </td>
            <td className="px-2 py-2 text-center">
              <div className="flex items-center justify-center gap-2">
                <Phone size={14} className="text-green-600 cursor-pointer hover:text-green-700" />
                <MessageCircle size={14} className="text-green-600 cursor-pointer hover:text-green-700" />
                <MoreVertical size={14} className="text-slate-400 cursor-pointer hover:text-slate-700" />
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );

  const rightSidebar = (
    <>
      <div className="bg-white rounded-xl border border-gray-100 p-3">
        <h3 className="text-[14px] font-semibold text-[#0F172A] mb-3">Follow-Up Overview</h3>
        <div className="flex flex-row items-center gap-4">
          <div className="relative w-[90px] h-[90px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={overviewData} cx="50%" cy="50%" innerRadius={28} outerRadius={40} dataKey="value" stroke="none">
                  {overviewData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h3 className="text-[16px] font-bold text-[#0F172A] leading-none">12</h3>
              <p className="text-[9px] text-gray-500">Total</p>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {overviewData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-[10px] font-medium text-[#0F172A] leading-none">{item.name}</span>
                </div>
                <span className="text-[10px] font-semibold text-[#0F172A] leading-none">
                  {item.value} <span className="text-gray-400 font-normal">({item.percentage})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Overdue Follow-Ups</h3>
          <button className="text-[10px] text-[#2563EB] font-medium hover:underline">View All</button>
        </div>
        <div className="space-y-3">
          {overdueLeads.map((lead, index) => (
            <div key={index} className={`flex items-center justify-between pb-3 ${index !== overdueLeads.length - 1 ? "border-b border-gray-100" : ""}`}>
              <div>
                <h4 className="text-[11px] font-semibold text-[#0F172A] leading-tight">{lead.company}</h4>
                <p className="text-[9px] text-gray-500 mt-0.5 leading-none">Due: {lead.date}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-semibold flex items-center justify-center text-center leading-tight">
                {lead.days}
              </span>
            </div>
          ))}
          <button className="w-full flex items-center justify-between text-[10px] font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-all pt-1">
            <span>View All Overdue ({overdueLeads.length})</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-3">
        <h3 className="text-[14px] font-semibold text-[#0F172A] mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="h-[40px] rounded-lg bg-[#F8F1FF] flex items-center justify-center gap-1.5 hover:opacity-90 px-2">
            <CalendarDays size={14} className="text-purple-600 shrink-0" />
            <span className="text-[10px] font-medium text-[#0F172A] leading-tight text-left">Schedule<br />Follow-Up</span>
          </button>
          <button className="h-[40px] rounded-lg bg-[#EEF9F2] flex items-center justify-center gap-1.5 hover:opacity-90 px-2">
            <Phone size={14} className="text-green-600 shrink-0" />
            <span className="text-[10px] font-medium text-[#0F172A] leading-tight text-left">Log Call</span>
          </button>
          <button className="h-[40px] rounded-lg bg-[#EEF9F2] flex items-center justify-center gap-1.5 hover:opacity-90 px-2">
            <MessageCircle size={14} className="text-green-600 shrink-0" />
            <span className="text-[10px] font-medium text-[#0F172A] leading-tight text-left">Send<br />WhatsApp</span>
          </button>
          <button className="h-[40px] rounded-lg bg-[#F4F7FF] flex items-center justify-center gap-1.5 hover:opacity-90 px-2">
            <Mail size={14} className="text-blue-600 shrink-0" />
            <span className="text-[10px] font-medium text-[#0F172A] leading-tight text-left">Send Email</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-3">
        <div className="flex items-start gap-2 mb-3">
          <Bell size={16} className="text-[#0F172A] mt-0.5 shrink-0" />
          <div>
            <h3 className="text-[13px] font-semibold text-[#0F172A] leading-tight">Reminder Settings</h3>
            <p className="text-[9px] text-gray-500 mt-0.5 leading-none">Get reminded before follow-up is due</p>
          </div>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-medium text-[#0F172A]">Enable Reminders</span>
          <label className="relative inline-flex cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:w-3 after:h-3 after:rounded-full after:transition-all peer-checked:after:translate-x-4" />
          </label>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-medium text-[#0F172A]">Remind me</span>
          <select className="border border-gray-200 rounded-lg px-2 py-1 text-[10px] outline-none">
            <option>1 Hour Before</option>
            <option>2 Hours Before</option>
            <option>1 Day Before</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-[#0F172A]">Send via</span>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-[10px] cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-blue-600 w-3 h-3" /> WhatsApp
            </label>
            <label className="flex items-center gap-1.5 text-[10px] cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-blue-600 w-3 h-3" /> Email
            </label>
          </div>
        </div>
      </div>
    </>
  );

  const paginationBar = (
    <>
      <div className="text-slate-500">
        Showing {totalLeads === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, totalLeads)} of {totalLeads} follow-ups
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(1)} disabled={page === 1} className="p-1 rounded hover:bg-slate-100 text-slate-400 disabled:opacity-50">«</button>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded hover:bg-slate-100 text-slate-400 disabled:opacity-50">‹</button>

        <button className={`w-6 h-6 rounded font-bold flex items-center justify-center bg-[#082A84] text-white`}>
          {page}
        </button>

        <button onClick={() => setPage(p => Math.min(pagination?.totalPages || 1, p + 1))} disabled={page >= (pagination?.totalPages || 1)} className="p-1 rounded hover:bg-slate-100 text-slate-400 disabled:opacity-50">›</button>
        <button onClick={() => setPage(pagination?.totalPages || 1)} disabled={page >= (pagination?.totalPages || 1)} className="p-1 rounded hover:bg-slate-100 text-slate-400 disabled:opacity-50">»</button>
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
