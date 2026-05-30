import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCompanies } from "../../features/company/companySlice";
import {
  Search, MoreVertical, Download, Filter, Calendar, MessageCircle, Phone, Mail, Users, Clock, CalendarDays, CalendarCheck, Target, ArrowRight, Plus, Upload, RefreshCw
} from "lucide-react";
import { FaStar, FaRegStar, FaWhatsapp } from 'react-icons/fa';

const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
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

  // Auth State
  const { user } = useSelector(state => state.auth);
  const isSuperAdmin = user?.role?.toLowerCase().replace(/[^a-z]/g, '') === 'superadmin';

  // 🏢 Company redux data
  const companiesState = useSelector((state) => state.companies);
  const newLeadCompanies = Array.isArray(companiesState?.companies) ? companiesState.companies : [];
  const pagination = companiesState?.pagination;
  const isLoading = companiesState?.loading ?? false;

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
        endDate
      }));
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, page, limit, searchTerm, startDate, endDate, filterSource, filterStatus, filterIndustry, filterAssignedTo]);

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

  const totalLeads = pagination?.total || newLeadCompanies.length;
  // Dummy stats for the UI to match the image
  const todaysLeads = Math.min(7, totalLeads);
  const thisWeekLeads = Math.min(18, totalLeads);
  const thisMonthLeads = Math.max(72, totalLeads);

  return (
    <div className="w-full bg-[#f8fafc] min-h-[calc(100vh-110px)] xl:h-[calc(100vh-110px)] flex flex-col font-sans text-slate-800 p-4 md:px-6 lg:px-8 xl:overflow-hidden">

      {/* TOP HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            My New Leads
            <span className="bg-emerald-100 text-emerald-700 text-sm py-1 px-3 rounded-full font-semibold">
              {totalLeads}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {isSuperAdmin ? "All newly generated leads from different sources" : "Leads assigned to you that are newly generated"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:gap-3 w-full xl:w-auto">
          <div className="relative flex-grow xl:flex-grow-0 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search by Name, Company, Email, Mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <button onClick={() => navigate("/ihweClientData2026/addNewClients")} className="flex items-center gap-2 bg-[#00a65a] hover:bg-[#008d4c] text-white px-4 py-2 rounded-lg text-[11px] font-semibold transition-colors shadow-sm">
            <Plus size={14} /> Add Lead
          </button>
          <button onClick={() => navigate("/ihweClientData2026/uploadExhibitor")} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-[11px] font-semibold transition-colors shadow-sm">
            <Upload size={14} className="text-blue-500" /> Import Leads
          </button>
          <button className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-4 py-2 rounded-lg text-[11px] font-semibold transition-colors shadow-sm">
            <FaWhatsapp size={14} /> Send Bulk WhatsApp
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col xl:flex-row gap-4 flex-grow items-stretch xl:min-h-0">

        {/* LEFT COLUMN: STATS & TABLE */}
        <div className="flex-grow flex flex-col gap-4 w-full xl:w-[78%] xl:min-h-0">

          {/* STATS CARDS (5 Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <div className="flex flex-col">
                <div className="text-[10px] text-slate-500 font-semibold mb-0.5">Total New Leads</div>
                <div className="text-xl font-bold text-slate-800 leading-none mb-1">{totalLeads}</div>
                <div className="text-[9px] text-emerald-600 font-medium">↑ 18% vs yesterday</div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <Clock size={20} />
              </div>
              <div className="flex flex-col">
                <div className="text-[10px] text-slate-500 font-semibold mb-0.5">Today's Leads</div>
                <div className="text-xl font-bold text-slate-800 leading-none mb-1">{todaysLeads}</div>
                <div className="text-[9px] text-blue-600 font-medium cursor-pointer">View Today</div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                <CalendarDays size={20} />
              </div>
              <div className="flex flex-col">
                <div className="text-[10px] text-slate-500 font-semibold mb-0.5">This Week</div>
                <div className="text-xl font-bold text-slate-800 leading-none mb-1">{thisWeekLeads}</div>
                <div className="text-[9px] text-emerald-600 font-medium">↑ 20% vs last week</div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                <CalendarCheck size={20} />
              </div>
              <div className="flex flex-col">
                <div className="text-[10px] text-slate-500 font-semibold mb-0.5">This Month</div>
                <div className="text-xl font-bold text-slate-800 leading-none mb-1">{thisMonthLeads}</div>
                <div className="text-[9px] text-emerald-600 font-medium">↑ 15% vs last month</div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center shrink-0">
                <Target size={20} />
              </div>
              <div className="flex flex-col">
                <div className="text-[10px] text-slate-500 font-semibold mb-0.5">Pending Follow-Ups</div>
                <div className="text-xl font-bold text-slate-800 leading-none mb-1">16</div>
                <div className="text-[9px] text-blue-600 font-medium cursor-pointer">View All</div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-grow flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-0">

            {/* Filter Bar */}
            <div className={`p-2 border-b flex flex-wrap items-center justify-between gap-2 transition-colors ${isSuperAdmin ? 'bg-[#1e1b4b] border-[#1e1b4b] text-white rounded-t-xl' : 'bg-white border-slate-100 text-slate-700'}`}>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[180px]">
                  <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isSuperAdmin ? 'text-slate-300' : 'text-slate-400'}`} size={12} />
                  <input
                    type="text"
                    placeholder="Search lead by name, company, email, mobile..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className={`w-full pl-7 pr-3 py-1.5 border rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 ${isSuperAdmin ? 'bg-indigo-900/50 border-indigo-500/30 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                  />
                </div>
                
                <select value={filterSource} onChange={e => { setFilterSource(e.target.value); setPage(1); }} className={`py-1.5 px-2 border rounded text-[10px] font-medium outline-none cursor-pointer ${isSuperAdmin ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
                  <option value="">Source</option>
                  {uniqueSources.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
                
                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className={`py-1.5 px-2 border rounded text-[10px] font-medium outline-none cursor-pointer ${isSuperAdmin ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
                  <option value="">Status</option>
                  {uniqueStatuses.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
                
                {isSuperAdmin && (
                  <select value={filterAssignedTo} onChange={e => { setFilterAssignedTo(e.target.value); setPage(1); }} className="py-1.5 px-2 border rounded text-[10px] font-medium outline-none cursor-pointer bg-teal-600 border-teal-500 text-white">
                    <option value="">Assigned To</option>
                    {uniqueAssignedTo.map((s, i) => <option key={i} value={s}>{s}</option>)}
                  </select>
                )}

                <select value={filterIndustry} onChange={e => { setFilterIndustry(e.target.value); setPage(1); }} className={`py-1.5 px-2 border rounded text-[10px] font-medium outline-none cursor-pointer ${isSuperAdmin ? 'bg-orange-500 border-orange-400 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
                  <option value="">Industry</option>
                  {uniqueIndustries.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
                
                <div className={`flex items-center gap-1.5 py-1 px-2 border rounded text-[10px] font-medium ${isSuperAdmin ? 'bg-[#1e1b4b] border-indigo-500/30' : 'bg-white border-slate-200 text-slate-700'}`}>
                  <Calendar size={12} className={isSuperAdmin ? "text-slate-300" : "text-slate-500"} />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                    className={`bg-transparent text-[10px] py-0.5 outline-none w-[85px] cursor-pointer ${isSuperAdmin ? 'text-white' : 'text-slate-700'}`}
                  />
                  <span className={isSuperAdmin ? "text-slate-400" : "text-slate-400"}>-</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                    className={`bg-transparent text-[10px] py-0.5 outline-none w-[85px] cursor-pointer ${isSuperAdmin ? 'text-white' : 'text-slate-700'}`}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setStartDate(''); setEndDate(''); setSearchTerm(''); setFilterSource(''); setFilterStatus(''); setFilterIndustry(''); setFilterAssignedTo(''); setPage(1); }} className={`flex items-center gap-1 py-1.5 px-2 transition-colors text-[10px] font-medium ${isSuperAdmin ? 'text-white hover:text-slate-200 bg-indigo-900/50 rounded border border-indigo-500/30' : 'text-slate-500 hover:text-slate-700'}`}>
                  <RefreshCw size={12} /> Reset
                </button>
                <button className={`flex items-center gap-1.5 py-1.5 px-3 border rounded text-[10px] font-medium transition-colors ${isSuperAdmin ? 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                  <Download size={12} /> Export
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-auto flex-grow relative">
              <table className="w-full text-left border-collapse whitespace-nowrap text-[10px]">
                <thead>
                  <tr className="bg-[#0f172a] text-white uppercase tracking-wider">
                    <th className="px-2 py-2 w-8 text-center">
                      <input type="checkbox" className="w-3 h-3 accent-blue-500 cursor-pointer rounded-sm" />
                    </th>
                    {/* <th className="px-2 py-2 w-10 font-medium">#</th> */}
                    <th className="px-2 py-2 font-medium">Company Name</th>
                    <th className="px-2 py-2 font-medium">Source</th>
                    <th className="px-2 py-2 font-medium">Industry</th>
                    <th className="px-2 py-2 font-medium">Status</th>
                    {isSuperAdmin && <th className="px-2 py-2 font-medium">Assigned To</th>}
                    <th className="px-2 py-2 font-medium">Lead Score</th>
                    <th className="px-2 py-2 font-medium">Last Conversation / Handled By</th>
                    <th className="px-2 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr><td colSpan="9" className="text-center py-8 text-slate-500">Loading leads...</td></tr>
                  ) : newLeadCompanies.length === 0 ? (
                    <tr><td colSpan="9" className="text-center py-8 text-slate-500">No new leads found.</td></tr>
                  ) : (
                    newLeadCompanies.map((row, i) => {
                      const status = row.companyStatus || "New";
                      const style = getStatusStyle(status);
                      const statusBg = style.split(' ')[0];
                      const statusText = style.split(' ')[1];
                      const statusDot = style.split(' ')[3]?.replace('dot-', 'bg-') || "bg-slate-500";
                      const source = row.dataSource || "Website";

                      return (
                        <tr key={row._id || i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-2 py-1.5 text-center">
                            <input type="checkbox" className="w-3 h-3 accent-blue-500 cursor-pointer rounded-sm" />
                          </td>
                          {/* <td className="px-2 py-1.5 text-slate-500">{i + 1}</td> */}
                          <td className="px-2 py-1.5 font-semibold text-slate-800 text-[11px] cursor-pointer hover:text-blue-600">
                            <Link to={`/client-overview/${row._id}`}>{toTitleCase(row.companyName)}</Link>
                          </td>
                          <td className="px-2 py-1.5">
                            <span className={`px-1.5 py-0.5 rounded font-semibold text-[9px] ${getSourceStyle(source)}`}>
                              @{toTitleCase(source)}
                            </span>
                          </td>
                          <td className="px-2 py-1.5 text-slate-600">{toTitleCase(row.businessNature) || "-"}</td>
                          <td className="px-2 py-1.5">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${statusBg} ${statusText} border-transparent`}>
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
                            <div className="flex items-center gap-0.5 text-emerald-500 text-[9px]">
                              <FaStar /><FaStar /><FaStar /><FaRegStar className="text-slate-300" /><FaRegStar className="text-slate-300" />
                              <span className="ml-1 font-semibold text-slate-700">{row.leadScore || 65}</span>
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <div className="shrink-0 p-1 bg-slate-100 rounded-full">
                                {getConvIcon("WhatsApp")}
                              </div>
                              <span className="text-[10px] font-medium text-slate-800 whitespace-nowrap">
                                {row.updatedAt ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(row.updatedAt)) : "-"}
                              </span>
                              <span className="text-[9px] text-slate-500">(WhatsApp)</span>
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
                </tbody>
              </table>
            </div>

            <div className="p-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 bg-slate-50/50">
              <div>Showing {totalLeads === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, totalLeads)} of {totalLeads} new leads</div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(1)} disabled={page === 1} className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-200 disabled:opacity-50">«</button>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-200 disabled:opacity-50">‹</button>
                  <button className="w-6 h-6 rounded flex items-center justify-center bg-blue-600 text-white font-medium">{page}</button>
                  <button onClick={() => setPage(p => Math.min(pagination?.totalPages || 1, p + 1))} disabled={page >= (pagination?.totalPages || 1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-200 disabled:opacity-50">›</button>
                  <button onClick={() => setPage(pagination?.totalPages || 1)} disabled={page >= (pagination?.totalPages || 1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-200 disabled:opacity-50">»</button>
                </div>
                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <select
                    value={limit}
                    onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                    className="border border-slate-200 rounded py-0.5 px-1 bg-white outline-none cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="w-full xl:w-[20%] flex flex-col gap-4 xl:gap-1.5 shrink-0 xl:justify-between xl:h-full">

          {!isSuperAdmin && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1.5 px-2">
              <h3 className="text-[11px] font-bold text-slate-800 mb-1">Follow-Ups Due <span className="text-[8px] text-slate-400 font-normal ml-1">(Next 7 Days)</span></h3>
              <div className="flex flex-col gap-1">
                {[
                  { name: "GreenLife Ayurveda", date: "27 May, 11:00 AM", type: "WhatsApp", icon: <MessageCircle size={12} className="text-emerald-500" />, tagBg: "bg-emerald-50 text-emerald-600", iconBg: "bg-emerald-50" },
                  { name: "Nature's Harmony", date: "28 May, 03:00 PM", type: "Call", icon: <Phone size={12} className="text-emerald-500" />, tagBg: "bg-emerald-50 text-emerald-600", iconBg: "bg-emerald-50" },
                  { name: "Herbal King", date: "28 May, 05:00 PM", type: "Email", icon: <Mail size={12} className="text-blue-500" />, tagBg: "bg-blue-50 text-blue-600", iconBg: "bg-blue-50" },
                  { name: "Wellness Center", date: "29 May, 10:00 AM", type: "Call", icon: <Phone size={12} className="text-emerald-500" />, tagBg: "bg-emerald-50 text-emerald-600", iconBg: "bg-emerald-50" },
                  { name: "Ayush Pharma", date: "29 May, 01:30 PM", type: "WhatsApp", icon: <MessageCircle size={12} className="text-emerald-500" />, tagBg: "bg-emerald-50 text-emerald-600", iconBg: "bg-emerald-50" },
                ].map((fu, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className={`w-7 h-7 rounded-full ${fu.iconBg} flex items-center justify-center shrink-0`}>
                      {fu.icon}
                    </div>
                    <div className="flex-grow">
                      <div className="text-[10px] font-bold text-slate-800 leading-tight">{fu.name}</div>
                      <div className="text-[8px] text-slate-500 mt-0.5">{fu.date}</div>
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1.5 px-2">
            <h3 className="text-[11px] font-bold text-slate-800 mb-1">{isSuperAdmin ? "Leads by Source (This Week)" : "Leads by Source"}</h3>
            <div className="flex items-center justify-between gap-2">
              {/* CSS Donut Chart */}
              <div className="relative w-12 h-12 rounded-full shrink-0 shadow-sm" style={{ background: `conic-gradient(#0ea5e9 0% 33%, #8b5cf6 33% 58%, #10b981 58% 79%, #f59e0b 79% 92%, #94a3b8 92% 100%)` }}>
                <div className="absolute inset-[25%] bg-white rounded-full flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-800 leading-none">{totalLeads}</span>
                </div>
              </div>
              <div className="flex-grow flex flex-col gap-0.5">
                {[
                  { label: "Website", count: Math.ceil(totalLeads * 0.33), pct: "33%", color: "bg-sky-500" },
                  { label: "Referral", count: Math.ceil(totalLeads * 0.25), pct: "25%", color: "bg-purple-500" },
                  { label: "WhatsApp", count: Math.ceil(totalLeads * 0.21), pct: "21%", color: "bg-emerald-500" },
                  { label: "Trade Show", count: Math.ceil(totalLeads * 0.13), pct: "13%", color: "bg-amber-500" },
                  { label: "Other", count: Math.ceil(totalLeads * 0.08), pct: "8%", color: "bg-slate-400" }
                ].map((s, i) => (
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
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1.5 px-2">
              <h3 className="text-[11px] font-bold text-slate-800 mb-1.5">Lead Status Overview</h3>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: "New", count: Math.ceil(totalLeads * 0.38), pct: "38%", color: "bg-emerald-500" },
                  { label: "Contacted", count: Math.ceil(totalLeads * 0.28), pct: "28%", color: "bg-blue-500" },
                  { label: "Interested", count: Math.ceil(totalLeads * 0.19), pct: "19%", color: "bg-purple-500" },
                  { label: "Not Contacted", count: Math.ceil(totalLeads * 0.09), pct: "9%", color: "bg-orange-500" },
                  { label: "Converted", count: Math.ceil(totalLeads * 0.06), pct: "6%", color: "bg-teal-500" },
                ].map((s, i) => (
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
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1.5 px-2">
              <h3 className="text-[11px] font-bold text-slate-800 mb-1">Recent Activities</h3>
              <div className="flex flex-col gap-1.5 relative">
                <div className="absolute left-[9px] top-2 bottom-2 w-px bg-slate-100"></div>
                {[
                  { icon: <Phone size={8} className="text-emerald-600" />, bg: "bg-emerald-50 border-emerald-100", text: "Spoke with Nature's Harmony", date: "28 May, 03:00 PM" },
                  { icon: <Mail size={8} className="text-blue-600" />, bg: "bg-blue-50 border-blue-100", text: "Sent email to Herbal King", date: "27 May, 05:00 PM" },
                  { icon: <FaWhatsapp size={8} className="text-emerald-600" />, bg: "bg-emerald-50 border-emerald-100", text: "WhatsApp chat with GreenLife", date: "27 May, 11:00 AM" }
                ].map((act, i) => (
                  <div key={i} className="flex items-start gap-2 relative z-10">
                    <div className={`w-5 h-5 rounded-full border ${act.bg} flex items-center justify-center bg-white shrink-0 mt-0.5`}>
                      {act.icon}
                    </div>
                    <div>
                      <div className="text-[9px] font-medium text-slate-700 leading-tight">{act.text}</div>
                      <div className="text-[8px] text-slate-400 mt-0.5">{act.date}</div>
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1.5 px-2">
            <h3 className="text-[11px] font-bold text-slate-800 mb-1">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={() => navigate("/ihweClientData2026/addNewClients")} className="flex items-center gap-1.5 p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded transition-colors border border-emerald-100">
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
              <button className="flex items-center gap-1.5 p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded transition-colors border border-purple-100">
                <Users size={12} />
                <span className="text-[9px] font-bold">Assign Leads</span>
              </button>
            </div>
          </div>

          {/* Top Assigned Executives (Super Admin Only) */}
          {isSuperAdmin && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1.5 px-2">
              <h3 className="text-[11px] font-bold text-slate-800 mb-1.5">Top Assigned Executives</h3>
              <div className="flex flex-col gap-1.5">
                {[
                  { name: "Vijay Sharma", init: "VS", count: 12, color: "bg-emerald-500" },
                  { name: "Rahul Verma", init: "RV", count: 7, color: "bg-blue-500" },
                  { name: "Neha Patil", init: "NP", count: 5, color: "bg-purple-500" }
                ].map((exec, i) => (
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

        </div>
      </div>
    </div>
  );
};

export default NewLeadList;
