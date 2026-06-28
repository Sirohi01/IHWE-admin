import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCompanies } from "../../features/company/companySlice";
import {
  Search, MoreVertical, Download, Filter, Calendar, MessageCircle,
  Phone, Mail, Users, RefreshCw, Upload, Plus
} from "lucide-react";
import { FaStar, FaRegStar, FaWhatsapp } from 'react-icons/fa';

const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

const STATUS_CONFIG = {
  'New Lead':    { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Follow-Up':   { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500' },
  'Warm':        { bg: 'bg-orange-50',  text: 'text-orange-700',  dot: 'bg-orange-500' },
  'Hot':         { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500' },
  'Cold':        { bg: 'bg-slate-50',   text: 'text-slate-600',   dot: 'bg-slate-400' },
  'Lost':        { bg: 'bg-rose-50',    text: 'text-rose-700',    dot: 'bg-rose-500' },
  default:       { bg: 'bg-purple-50',  text: 'text-purple-700',  dot: 'bg-purple-500' },
};

const getStatusStyle = (status) => {
  const key = Object.keys(STATUS_CONFIG).find(k => (status || '').toLowerCase().includes(k.toLowerCase()));
  return STATUS_CONFIG[key] || STATUS_CONFIG.default;
};

const getSourceStyle = (source) => {
  const s = (source || '').toLowerCase();
  if (s.includes('website')) return 'text-blue-600 bg-blue-50';
  if (s.includes('referral')) return 'text-purple-600 bg-purple-50';
  if (s.includes('email')) return 'text-indigo-600 bg-indigo-50';
  if (s.includes('whatsapp')) return 'text-emerald-600 bg-emerald-50';
  if (s.includes('social')) return 'text-pink-600 bg-pink-50';
  return 'text-slate-600 bg-slate-50';
};

const ProposalSentList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssignedTo, setFilterAssignedTo] = useState('');

  const { user } = useSelector(state => state.auth);
  const isSuperAdmin = user?.role?.toLowerCase().replace(/[^a-z]/g, '') === 'superadmin';

  const companiesState = useSelector((state) => state.companies);
  const companies = Array.isArray(companiesState?.companies) ? companiesState.companies : [];
  const pagination = companiesState?.pagination;
  const isLoading = companiesState?.loading ?? false;

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(fetchCompanies({
        page,
        limit,
        search: searchTerm,
        status: filterStatus || 'Est./PI Sent', // Default filter for Proposal Sent
        source: filterSource,
        forwardTo: filterAssignedTo,
        startDate,
        endDate,
      }));
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, page, limit, searchTerm, startDate, endDate, filterSource, filterStatus, filterAssignedTo]);

  const uniqueSources = [...new Set(companies.map(c => c.dataSource).filter(Boolean))];
  const uniqueStatuses = [...new Set(companies.map(c => c.companyStatus).filter(Boolean))];
  const uniqueAssignedTo = [...new Set(companies.map(c => c.forwardTo).filter(Boolean))];

  return (
    <div className="w-full bg-[#f8fafc] min-h-[calc(100vh-110px)] xl:h-[calc(100vh-110px)] flex flex-col font-sans text-slate-800 p-4 md:px-6 lg:px-8 xl:overflow-hidden">

      {/* TOP HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            Proposal Sent
            <span className="bg-blue-100 text-blue-700 text-sm py-1 px-3 rounded-full font-semibold">
              {pagination?.total || 0}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Leads where an estimate or proposal has been sent to the client
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
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
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-grow flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-0">

        {/* Filter Bar */}
        <div className="p-2 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-[#0A2947] rounded-t-xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
              <input
                type="text"
                placeholder="Search lead..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-7 pr-3 py-1.5 border rounded text-[10px] focus:outline-none bg-indigo-900/50 border-indigo-500/30 text-white placeholder-slate-400"
              />
            </div>
            <select value={filterSource} onChange={e => { setFilterSource(e.target.value); setPage(1); }} className="py-1.5 px-2 border rounded text-[10px] font-medium outline-none cursor-pointer bg-blue-600 border-blue-500 text-white">
              <option value="">Source</option>
              {uniqueSources.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
            {isSuperAdmin && (
              <select value={filterAssignedTo} onChange={e => { setFilterAssignedTo(e.target.value); setPage(1); }} className="py-1.5 px-2 border rounded text-[10px] font-medium outline-none cursor-pointer bg-teal-600 border-teal-500 text-white">
                <option value="">Assigned To</option>
                {uniqueAssignedTo.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>
            )}
            <div className="flex items-center gap-1.5 py-1 px-2 border rounded text-[10px] font-medium bg-[#0A2947] border-indigo-500/30">
              <Calendar size={12} className="text-slate-300" />
              <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="bg-transparent text-[10px] py-0.5 outline-none w-[85px] cursor-pointer text-white" />
              <span className="text-slate-400">-</span>
              <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="bg-transparent text-[10px] py-0.5 outline-none w-[85px] cursor-pointer text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setStartDate(''); setEndDate(''); setSearchTerm(''); setFilterSource(''); setFilterStatus(''); setFilterAssignedTo(''); setPage(1); }} className="flex items-center gap-1 py-1.5 px-2 text-white hover:text-slate-200 bg-indigo-900/50 rounded border border-indigo-500/30 text-[10px] font-medium">
              <RefreshCw size={12} /> Reset
            </button>
            <button className="flex items-center gap-1.5 py-1.5 px-3 border rounded text-[10px] font-medium bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700">
              <Download size={12} /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-grow relative custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap text-[10px]" style={{ fontFamily: 'Inter, sans-serif', color: '#15173D' }}>
            <thead>
              <tr className="text-white tracking-wider" style={{ backgroundColor: '#0A2947' }}>
                <th className="px-2 py-2 w-8 text-center">
                  <input type="checkbox" className="w-3 h-3 accent-blue-500 cursor-pointer rounded-sm" />
                </th>
                <th className="px-2 py-2 font-medium">Company Name</th>
                <th className="px-2 py-2 font-medium">Source</th>
                <th className="px-2 py-2 font-medium">Industry</th>
                <th className="px-2 py-2 font-medium text-center">Status</th>
                {isSuperAdmin && <th className="px-2 py-2 font-medium">Assigned To</th>}
                <th className="px-2 py-2 font-medium">Lead Score</th>
                <th className="px-2 py-2 font-medium">Last Updated</th>
                <th className="px-2 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
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
              ) : companies.length === 0 ? (
                <tr><td colSpan="9" className="text-center py-8 text-slate-500 text-[11px]">No leads found.</td></tr>
              ) : (
                companies.map((row, i) => {
                  const status = row.companyStatus || 'Proposal Sent';
                  const { bg, text, dot } = getStatusStyle(status);
                  const source = row.dataSource || 'Direct';

                  return (
                    <tr key={row._id || i} className="hover:bg-slate-50 transition-colors border-b border-slate-100 bg-white">
                      <td className="px-2 py-2 text-center">
                        <input type="checkbox" className="w-3 h-3 accent-blue-500 cursor-pointer rounded-sm" />
                      </td>
                      <td className="px-2 py-2 cursor-pointer hover:text-blue-600">
                        <Link to={`/client-overview/${row._id}`}>
                          <div className="font-bold text-[11px]" style={{ color: '#093C5D' }}>{toTitleCase(row.companyName)}</div>
                        </Link>
                      </td>
                      <td className="px-2 py-2">
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${getSourceStyle(source)}`}>
                          @{toTitleCase(source)}
                        </span>
                      </td>
                      <td className="px-2 py-2 font-medium">{toTitleCase(row.businessNature) || '-'}</td>
                      <td className="px-2 py-2 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${bg} ${text}`}>
                          <span className={`w-1 h-1 rounded-full ${dot}`}></span>
                          {toTitleCase(status)}
                        </span>
                      </td>
                      {isSuperAdmin && (
                        <td className="px-2 py-2 font-bold text-blue-600">{toTitleCase(row.forwardTo) || 'Unassigned'}</td>
                      )}
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-0.5 text-emerald-500 text-[9px]">
                          <FaStar /><FaStar /><FaStar /><FaRegStar className="text-slate-300" /><FaRegStar className="text-slate-300" />
                          <span className="ml-1 font-bold text-slate-700">{row.leadScore || 65}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 font-medium">
                        {row.updatedAt ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(row.updatedAt)) : '-'}
                      </td>
                      <td className="px-2 py-2 text-right">
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

        {/* Pagination */}
        <div className="p-2 border-t border-slate-100 bg-white flex flex-wrap items-center justify-between text-[10px] font-medium text-slate-600 gap-4">
          <div className="flex items-center gap-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            <span className="text-[11px] font-bold" style={{ color: '#334155' }}>Showing</span>
            <span className="text-[11px] font-black px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-100" style={{ color: '#016B61' }}>
              {pagination?.total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, pagination?.total || 0)}
            </span>
            <span className="text-[11px] font-bold" style={{ color: '#334155' }}>of</span>
            <span className="text-[11px] font-black" style={{ color: '#15173D' }}>{pagination?.total || 0}</span>
            <span className="text-[11px] font-bold" style={{ color: '#334155' }}>leads</span>
          </div>
          <div className="flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
            <button onClick={() => setPage(1)} disabled={page === 1} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100" style={{ borderColor: '#e2e8f0', color: '#334155' }}>«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100" style={{ borderColor: '#e2e8f0', color: '#334155' }}>‹</button>
            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black border" style={{ backgroundColor: '#016B61', color: '#fff', borderColor: '#016B61', boxShadow: '0 2px 8px rgba(1,107,97,0.3)' }}>{page}</button>
            <button onClick={() => setPage(p => Math.min(pagination?.totalPages || 1, p + 1))} disabled={page >= (pagination?.totalPages || 1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100" style={{ borderColor: '#e2e8f0', color: '#334155' }}>›</button>
            <button onClick={() => setPage(pagination?.totalPages || 1)} disabled={page >= (pagination?.totalPages || 1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100" style={{ borderColor: '#e2e8f0', color: '#334155' }}>»</button>
          </div>
          <div className="flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            <span className="text-[11px] font-bold" style={{ color: '#334155' }}>Rows:</span>
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="border rounded-lg py-1 px-2 bg-white outline-none cursor-pointer text-[11px] font-bold" style={{ borderColor: '#e2e8f0', color: '#15173D' }}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProposalSentList;
