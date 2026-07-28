import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../lib/api";
import {
  Search, RefreshCw, Download, FileText, Smartphone, Mail, Building2, Eye, User, ArrowLeft
} from "lucide-react";
import { FaWhatsapp, FaEnvelope, FaFilePdf, FaImage, FaVideo, FaLink, FaFilePowerpoint, FaFileAlt } from 'react-icons/fa';
import BaseLeadPage from "../../layout/BaseLeadPage";

const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const ProposalSentList = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [expandedKitId, setExpandedKitId] = useState(null);
  
  // New Filters
  const [filterSentVia, setFilterSentVia] = useState("");
  const [filterMaterial, setFilterMaterial] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { user } = useSelector(state => state.auth);
  const isSuperAdmin = user?.role?.toLowerCase().replace(/[^a-z]/g, '') === 'superadmin';

  useEffect(() => {
    fetchHistory();
  }, [eventId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (eventId) params.set("eventId", eventId);
      const queryString = params.toString();
      const res = await api.get(`/api/marketing-materials/history/all${queryString ? `?${queryString}` : ""}`);
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique options for dropdowns
  const uniqueMaterials = [...new Set(history.flatMap(h => h.materials?.map(m => m.category || m.title)).filter(Boolean))];
  const uniqueIndustries = [...new Set(history.map(h => h.cmpny_id?.category).filter(Boolean))];

  // Filter Data
  const baseFilteredHistory = history.filter((item) => {
    const cName = (item.clientName || item.cmpny_id?.companyName || item.cmpny_id?.exhibitorName || "").toLowerCase();
    const cEmail = (item.clientEmail || item.cmpny_id?.email || "").toLowerCase();
    const cMobile = (item.clientMobile || item.cmpny_id?.mobile || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    if (search && !cName.includes(search) && !cEmail.includes(search) && !cMobile.includes(search)) return false;
    
    if (filterSentVia && item.sentVia !== filterSentVia) return false;
    
    if (filterMaterial && !item.materials?.some(m => m.category === filterMaterial || m.title === filterMaterial)) return false;

    const compIndustry = item.cmpny_id?.category || "General";
    if (filterIndustry && compIndustry !== filterIndustry) return false;

    if (startDate && new Date(item.createdAt) < new Date(startDate)) return false;
    
    if (endDate) {
      const endD = new Date(endDate);
      endD.setHours(23, 59, 59, 999);
      if (new Date(item.createdAt) > endD) return false;
    }

    return true;
  });

  // Grouping Logic
  let filteredHistory = baseFilteredHistory;
  if (selectedCompanyId) {
    filteredHistory = baseFilteredHistory.filter(item => item.cmpny_id?._id === selectedCompanyId);
  } else {
    // Group by company ID
    const grouped = new Map();
    baseFilteredHistory.forEach(item => {
      const id = item.cmpny_id?._id || item.clientEmail;
      if (!grouped.has(id)) {
        grouped.set(id, { ...item, totalShares: 1 });
      } else {
        const existing = grouped.get(id);
        existing.totalShares += 1;
        // Keep the most recent one
        if (new Date(item.createdAt) > new Date(existing.createdAt)) {
          grouped.set(id, { ...item, totalShares: existing.totalShares });
        }
      }
    });
    filteredHistory = Array.from(grouped.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Pagination
  const totalItems = filteredHistory.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const paginatedData = filteredHistory.slice((page - 1) * limit, page * limit);

  // Stats
  const totalSent = history.length;
  const whatsappSent = history.filter(h => h.sentVia === 'WhatsApp').length;
  const emailSent = history.filter(h => h.sentVia === 'Email').length;
  const uniqueClients = new Set(history.map(h => h.cmpny_id?._id?.toString() || h.clientEmail)).size;
  const materialsSent = history.reduce((acc, h) => acc + (h.materials?.length || 0), 0);
  const thisWeek = history.filter(h => new Date(h.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;

  const statCardsData = [
    {
      title: "TOTAL SENT",
      value: totalSent,
      desc: "All Materials Shared",
      icon: FileText,
      iconBg: "bg-blue-100",
      bg: "bg-gradient-to-br from-white from-50% to-blue-50",
      text: "text-blue-600"
    },
    {
      title: "VIA WHATSAPP",
      value: whatsappSent,
      desc: "Direct Messages",
      icon: FaWhatsapp,
      iconBg: "bg-green-100",
      bg: "bg-gradient-to-br from-white from-50% to-green-50",
      text: "text-green-600"
    },
    {
      title: "VIA EMAIL",
      value: emailSent,
      desc: "Inbox Deliveries",
      icon: Mail,
      iconBg: "bg-purple-100",
      bg: "bg-gradient-to-br from-white from-50% to-purple-50",
      text: "text-purple-600"
    },
    {
      title: "UNIQUE CLIENTS",
      value: uniqueClients,
      desc: "Total Outreach",
      icon: Building2,
      iconBg: "bg-orange-100",
      bg: "bg-gradient-to-br from-white from-50% to-orange-50",
      text: "text-orange-600"
    },
    {
      title: "THIS WEEK",
      value: thisWeek,
      desc: "Recent Shares",
      icon: User,
      iconBg: "bg-yellow-100",
      bg: "bg-gradient-to-br from-white from-50% to-yellow-50",
      text: "text-yellow-600"
    },
    {
      title: "FILES SHARED",
      value: materialsSent,
      desc: "Total Attachments",
      icon: Eye,
      iconBg: "bg-cyan-100",
      bg: "bg-gradient-to-br from-white from-50% to-cyan-50",
      text: "text-cyan-600"
    }
  ];

  const statCards = (
    <>
      {statCardsData.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className={`group cursor-pointer relative ${item.bg} p-4 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden`}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 ${item.iconBg} rounded-full flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${item.text}`} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <p className="text-xl font-extrabold text-slate-900 leading-none mb-1">
                    {item.value < 10 && item.value > 0 ? `0${item.value}` : item.value}
                  </p>
                  <p className="text-[9px] font-extrabold text-slate-700 leading-tight">
                    {item.title}
                  </p>
                </div>
              </div>
              <div className={`text-[10px] font-bold mt-2 ${item.text} text-center`}>
                {item.desc}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );

  const handleReset = () => {
    setSearchTerm("");
    setFilterSentVia("");
    setFilterMaterial("");
    setFilterIndustry("");
    setStartDate("");
    setEndDate("");
    setSelectedCompanyId(null);
    setPage(1);
  };

  const filterBar = (
    <>
      {selectedCompanyId ? (
        <button 
          onClick={() => setSelectedCompanyId(null)}
          className="flex items-center gap-1.5 py-1.5 px-3 border border-slate-200 rounded text-[10px] font-bold bg-white text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={12} /> Back to All
        </button>
      ) : null}
      <div className="relative min-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
        <input
          type="text"
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          className="w-full pl-7 pr-3 py-1.5 border rounded text-[10px] focus:outline-none bg-white border-slate-200 text-slate-700 placeholder-slate-400"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
      </div>

      <select 
        value={filterIndustry} 
        onChange={e => { setFilterIndustry(e.target.value); setPage(1); }} 
        className="py-1.5 px-2 border rounded text-[10px] font-medium outline-none cursor-pointer bg-white border-slate-200 text-slate-700 min-w-[100px]"
      >
        <option value="">Industry</option>
        {uniqueIndustries.map((ind, i) => <option key={i} value={ind}>{ind}</option>)}
      </select>

      <select 
        value={filterSentVia} 
        onChange={e => { setFilterSentVia(e.target.value); setPage(1); }} 
        className="py-1.5 px-2 border rounded text-[10px] font-medium outline-none cursor-pointer bg-white border-slate-200 text-slate-700 min-w-[100px]"
      >
        <option value="">Source</option>
        <option value="WhatsApp">WhatsApp</option>
        <option value="Email">Email</option>
      </select>
      
      <select 
        value={filterMaterial} 
        onChange={e => { setFilterMaterial(e.target.value); setPage(1); }} 
        className="py-1.5 px-2 border rounded text-[10px] font-medium outline-none cursor-pointer bg-white border-slate-200 text-slate-700 min-w-[100px]"
      >
        <option value="">Material</option>
        {uniqueMaterials.map((m, i) => <option key={i} value={m}>{m}</option>)}
      </select>

      <div className="flex items-center gap-1.5 py-1 px-2 border rounded text-[10px] font-medium bg-white border-slate-200">
        <input 
          type="date" 
          value={startDate} 
          onChange={(e) => { setStartDate(e.target.value); setPage(1); }} 
          className="bg-transparent text-[10px] py-0.5 outline-none w-[85px] cursor-pointer text-slate-700" 
        />
        <span className="text-slate-400">-</span>
        <input 
          type="date" 
          value={endDate} 
          onChange={(e) => { setEndDate(e.target.value); setPage(1); }} 
          className="bg-transparent text-[10px] py-0.5 outline-none w-[85px] cursor-pointer text-slate-700" 
        />
      </div>
    </>
  );

  const tableHeadersComponent = (
    <>
      <th className="px-2 py-2 font-medium">Company Name</th>
      <th className="px-2 py-2 font-medium">Contact Details</th>
      <th className="px-2 py-2 font-medium text-center">Sent Via</th>
      <th className="px-2 py-2 font-medium">Documents</th>
      <th className="px-2 py-2 font-medium">Updated Details</th>
      <th className="px-2 py-2 w-10 text-center">Action</th>
    </>
  );

  const tableBodyContent = (
    <>
      {loading ? (
        [...Array(6)].map((_, index) => (
          <tr key={`skeleton-${index}`} className="animate-pulse border-b border-slate-100">
            <td className="px-2 py-3"><div className="w-3 h-3 bg-slate-200 rounded-sm mx-auto"></div></td>
            <td className="px-2 py-3"><div className="h-3 w-32 bg-slate-200 rounded mb-1"></div><div className="h-2 w-20 bg-slate-100 rounded"></div></td>
            <td className="px-2 py-3"><div className="h-3 w-24 bg-slate-200 rounded mb-1"></div><div className="h-2 w-20 bg-slate-100 rounded"></div></td>
            <td className="px-2 py-3"><div className="h-4 w-16 bg-slate-200 rounded-full mx-auto"></div></td>
            <td className="px-2 py-3"><div className="h-3 w-32 bg-slate-200 rounded"></div></td>
            <td className="px-2 py-3"><div className="h-3 w-24 bg-slate-200 rounded mb-1"></div><div className="h-2 w-16 bg-slate-100 rounded"></div></td>
            <td className="px-2 py-3"></td>
          </tr>
        ))
      ) : paginatedData.length === 0 ? (
        <tr>
          <td colSpan="7" className="text-center py-10 text-slate-500 text-[11px]">No proposal history found.</td>
        </tr>
      ) : (
        paginatedData.map((row, index) => {
          const compName = row.clientName || row.cmpny_id?.companyName || row.cmpny_id?.exhibitorName || "Unknown Client";
          const compIndustry = row.cmpny_id?.category || "General";
          const email = row.clientEmail || row.cmpny_id?.email || row.cmpny_id?.companyEmail || "N/A";
          const mobile = row.clientMobile || row.cmpny_id?.mobile || row.cmpny_id?.companyMobile || "N/A";
          
          return (
            <tr key={row._id || index} className={`hover:bg-slate-50 transition-colors border-b border-slate-100 ${selectedCompanyId ? 'bg-indigo-50/20' : ''}`}>
              <td className="px-2 py-2 text-center">
                <input type="checkbox" className="w-3 h-3 accent-blue-500 cursor-pointer rounded-sm" />
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-1.5">
                    {row.cmpny_id?._id ? (
                      <Link to={eventId ? `/crm-event/${eventId}/client/${row.cmpny_id._id}` : `/client-overview/${row.cmpny_id._id}`} className="font-bold text-[11px] hover:text-emerald-600 hover:underline transition-colors" style={{ color: '#093C5D' }}>
                        {toTitleCase(compName)}
                      </Link>
                    ) : (
                      <span className="font-bold text-[11px]" style={{ color: '#093C5D' }}>
                        {toTitleCase(compName)}
                      </span>
                    )}
                    {!selectedCompanyId && row.totalShares > 1 && (
                      <button 
                        onClick={() => setSelectedCompanyId(row.cmpny_id._id)} 
                        className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-bold hover:bg-blue-200 transition-colors shadow-sm cursor-pointer"
                        title="View all shares for this company"
                      >
                        +{row.totalShares - 1} More
                      </button>
                    )}
                  </div>
                  <span className="text-[9px] font-bold" style={{ color: '#5E0006' }}>{toTitleCase(compIndustry)}</span>
                </div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1 font-bold text-[10px]" style={{ color: '#15173D' }}>
                    <User size={10} className="text-emerald-600" />
                    {toTitleCase(row.clientName || "Contact")}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-blue-600 font-semibold hover:underline cursor-pointer">
                    <Smartphone size={10} className="text-blue-500" />
                    {mobile}
                  </div>
                </div>
              </td>
              <td className="px-3 py-2 text-center whitespace-nowrap">
                {row.sentVia === 'WhatsApp' ? (
                  <span className="inline-flex items-center gap-1 bg-[#25D366]/10 text-[#075E54] px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                    <FaWhatsapp size={10} /> WhatsApp
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                    <FaEnvelope size={10} /> Email
                  </span>
                )}
              </td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                  {row.materials?.length > 1 && expandedKitId !== row._id ? (
                    <span className="flex items-center gap-1 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold text-red-600 bg-red-50 shadow-sm">
                      Quick Share Kit
                      <button 
                        onClick={() => setExpandedKitId(row._id)}
                        className="ml-1 bg-red-100 text-red-700 px-1.5 rounded-sm hover:bg-red-200 transition-colors cursor-pointer"
                        title="View all materials in this kit"
                      >
                        +{row.materials.length} Items
                      </button>
                    </span>
                  ) : (
                    <>
                      {row.materials?.length > 1 && expandedKitId === row._id && (
                        <span 
                          onClick={() => setExpandedKitId(null)}
                          className="flex items-center gap-1 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold text-red-600 bg-red-50 shadow-sm cursor-pointer hover:bg-red-100 mr-1"
                          title="Hide kit materials"
                        >
                          Quick Share Kit (Hide)
                        </span>
                      )}
                      {row.materials?.map((m, i) => {
                        const fType = m.material_id?.fileType || "Link";
                        let Icon = FaLink;
                        let typeColor = "text-blue-500 bg-blue-50 border-blue-100";
                        if (fType === "PDF") { Icon = FaFilePdf; typeColor = "text-red-500 bg-red-50 border-red-100"; }
                        else if (fType === "Image") { Icon = FaImage; typeColor = "text-orange-500 bg-orange-50 border-orange-100"; }
                        else if (fType === "Video") { Icon = FaVideo; typeColor = "text-purple-500 bg-purple-50 border-purple-100"; }
                        else if (fType === "PPT") { Icon = FaFilePowerpoint; typeColor = "text-amber-500 bg-amber-50 border-amber-100"; }
                        else if (fType === "Word") { Icon = FaFileAlt; typeColor = "text-indigo-500 bg-indigo-50 border-indigo-100"; }

                        return (
                          <span key={i} className={`flex items-center gap-1 border px-1.5 py-0.5 rounded text-[9px] font-semibold ${typeColor} truncate max-w-full`} title={m.title}>
                            <Icon size={9} className="shrink-0" />
                            <span className="truncate">{m.category || m.title}</span>
                          </span>
                        );
                      })}
                    </>
                  )}
                  {(!row.materials || row.materials.length === 0) && <span className="text-slate-400 text-[10px]">-</span>}
                </div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold" style={{ color: '#4B1426' }}>
                    {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(row.createdAt))}
                  </span>
                  <span className="text-[9px] font-bold uppercase" style={{ color: '#0A2947' }}>
                    By: {row.sentBy || "Admin"}
                  </span>
                </div>
              </td>
              <td className="px-3 py-2 text-center">
                {row.cmpny_id?._id && (
                  <button onClick={() => navigate(eventId ? `/crm-event/${eventId}/client/${row.cmpny_id._id}` : `/client-overview/${row.cmpny_id._id}`)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-colors shadow-sm">
                    <Eye size={12} />
                  </button>
                )}
              </td>
            </tr>
          );
        })
      )}
    </>
  );

  const paginationBar = (
    <div className="flex flex-wrap items-center justify-between w-full gap-4">
      <div className="flex items-center gap-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
        <span className="text-[11px] font-bold" style={{ color: '#334155' }}>Showing</span>
        <span className="text-[11px] font-black px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-100" style={{ color: '#016B61' }}>
          {totalItems === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, totalItems)}
        </span>
        <span className="text-[11px] font-bold" style={{ color: '#334155' }}>of</span>
        <span className="text-[11px] font-black" style={{ color: '#15173D' }}>{totalItems}</span>
        <span className="text-[11px] font-bold" style={{ color: '#334155' }}>records</span>
      </div>
      <div className="flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
        <button onClick={() => setPage(1)} disabled={page === 1} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100" style={{ borderColor: '#e2e8f0', color: '#334155' }}>«</button>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100" style={{ borderColor: '#e2e8f0', color: '#334155' }}>‹</button>
        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black border" style={{ backgroundColor: '#016B61', color: '#fff', borderColor: '#016B61', boxShadow: '0 2px 8px rgba(1,107,97,0.3)' }}>{page}</button>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100" style={{ borderColor: '#e2e8f0', color: '#334155' }}>›</button>
        <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100" style={{ borderColor: '#e2e8f0', color: '#334155' }}>»</button>
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
  );

  return (
    <BaseLeadPage
      title="Proposal Sent"
      subtitle="History of all marketing materials, proposals, and brochures sent to clients"
      badgeCount={totalItems}
      cardsInRow={6}
      statCards={statCards}
      filterBar={filterBar}
      tableHeaders={tableHeadersComponent}
      tableBody={tableBodyContent}
      pagination={paginationBar}
      onReset={handleReset}
    />
  );
};

export default ProposalSentList;
