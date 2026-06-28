import React, { useState, useEffect } from "react";
import { Eye } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { createActivityLogThunk } from '../../features/activityLog/activityLogSlice';
import api from "../../lib/api";
import { handleStatusUpdate } from '../../utils/statusUpdateHelper';

import BaseLeadPage from "../../layout/BaseLeadPage";
import {
  Search, Download, Plus, Upload, MessageCircle, Phone, Mail, MoreVertical,
  Calendar, CalendarDays, ArrowRight, RefreshCw, Flame, MessageSquare, Send, CheckCircle2,
  Users, DollarSign, Star, FileText, ChevronDown, TrendingUp, Ticket
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

// Removed dummy rows

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

  const [registrations, setRegistrations] = useState([]);
  const [masterCompanies, setMasterCompanies] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [regRes, compRes, reviewRes] = await Promise.all([
        api.get('/api/exhibitor-registration'),
        api.get('/api/companies?dashboard=true').catch(() => ({ data: [] })),
        api.get('/api/crm-exhibator-reviews').catch(() => ({ data: [] }))
      ]);

      if (regRes.data?.success) {
        setRegistrations(Array.isArray(regRes.data.data) ? regRes.data.data : []);
      }

      if (compRes.data && Array.isArray(compRes.data)) {
        setMasterCompanies(compRes.data);
      } else if (compRes.data?.data && Array.isArray(compRes.data.data)) {
        setMasterCompanies(compRes.data.data);
      }

      if (reviewRes.data && Array.isArray(reviewRes.data)) {
        setAllReviews(reviewRes.data);
      } else if (reviewRes.data?.data && Array.isArray(reviewRes.data.data)) {
        setAllReviews(reviewRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  // Frontend filtering and pagination
  const filteredRegs = registrations.filter(r => {
    if (filterStage && filterStage !== 'Converted' && (r.status || 'Converted') !== filterStage) return false;
    if (filterSource && (r.referredBy || 'Direct') !== filterSource) return false;
    if (filterIndustry && (r.natureOfBusiness || r.industrySector || r.typeOfBusiness) !== filterIndustry) return false;
    if (searchTerm) {
      const searchStr = `${r.exhibitorName} ${r.contact1?.email} ${r.contact1?.mobile}`.toLowerCase();
      if (!searchStr.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  const totalLeads = filteredRegs.length;
  const totalPages = Math.ceil(totalLeads / limit);
  const allCompanies = filteredRegs.slice((page - 1) * limit, page * limit);
  const pagination = { totalPages };

  const isAllSelected = allCompanies.length > 0 && selectedIds.length === allCompanies.length;
  const onSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(allCompanies.map(r => r._id));
    else setSelectedIds([]);
  };

  const onSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const uniqueSources = [...new Set(registrations.map(r => r.referredBy).filter(Boolean))];
  const uniqueIndustries = [...new Set(registrations.map(r => r.natureOfBusiness || r.industrySector || r.typeOfBusiness).filter(Boolean))];
  const uniqueStages = [...new Set(registrations.map(r => r.status).filter(Boolean))];

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
    if (s.includes('health') || s.includes('ayurveda') || s.includes('pharma')) return "text-emerald-600 bg-emerald-50";
    if (s.includes('fmcg') || s.includes('cosmetics')) return "text-blue-600 bg-blue-50";
    if (s.includes('retail') || s.includes('franchise')) return "text-orange-600 bg-orange-50";
    if (s.includes('biotech') || s.includes('organic')) return "text-purple-600 bg-purple-50";
    if (s.includes('manufacturing') || s.includes('machinery') || s.includes('packaging')) return "text-sky-600 bg-sky-50";
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

  const totalConverted = filteredRegs.length;
  const totalRevenue = filteredRegs.reduce((acc, curr) => acc + (curr.amountPaid || curr.financeBreakdown?.netPayable || curr.participation?.total || 0), 0);

  // Calculate existing clients by checking company name, email, or mobile against masterCompanies
  const existingClientsCount = filteredRegs.filter(reg => {
    const rName = (reg.companyName || reg.exhibitorName || "").toLowerCase().trim();
    const rEmail1 = (reg.contact1?.email || "").toLowerCase().trim();
    const rEmail2 = (reg.contact2?.email || "").toLowerCase().trim();
    const rMobile1 = (reg.contact1?.mobile || "").trim();
    const rMobile2 = (reg.contact2?.mobile || "").trim();

    return masterCompanies.some(comp => {
      // Don't match against itself if it somehow ended up in masterCompanies with same ID
      if (comp._id === reg._id) return false;

      const cName = (comp.companyName || comp.exhibitorName || "").toLowerCase().trim();
      const cEmail = (comp.email || "").toLowerCase().trim();
      const cMobile = (comp.mobile || "").trim();

      if (rName && cName && rName === cName) return true;
      if (cEmail && (rEmail1 === cEmail || rEmail2 === cEmail)) return true;
      if (cMobile && (rMobile1 === cMobile || rMobile2 === cMobile)) return true;

      // Also check contacts array if it exists
      if (comp.contacts && Array.isArray(comp.contacts)) {
        return comp.contacts.some(contact => {
          const cntEmail = (contact.email || "").toLowerCase().trim();
          const cntMobile = (contact.mobile || "").trim();
          if (cntEmail && (rEmail1 === cntEmail || rEmail2 === cntEmail)) return true;
          if (cntMobile && (rMobile1 === cntMobile || rMobile2 === cntMobile)) return true;
          return false;
        });
      }

      return false;
    });
  }).length;

  // Calculate Avg Conversion Time (New Lead to Est./PI Sent)
  let totalConversionDays = 0;
  let companiesWithConversion = 0;

  filteredRegs.forEach(reg => {
    // Find all reviews for this company
    const companyReviews = allReviews.filter(r => r.cmpny_id === reg._id);
    if (companyReviews.length > 0) {
      // Sort reviews by date ascending
      companyReviews.sort((a, b) => new Date(a.createdAt || a.re_added) - new Date(b.createdAt || b.re_added));

      // Find New Lead date (or earliest review if not explicitly 'new lead')
      const newLeadReview = companyReviews.find(r => (r.status_short || "").toLowerCase().includes("follow-up call")) || companyReviews[0];
      const newLeadDate = new Date(newLeadReview.createdAt || newLeadReview.re_added);

      // Find Est./PI Sent date
      const piSentReview = companyReviews.find(r => {
        const date = new Date(r.createdAt || r.re_added);
        return (r.status_short || "").toLowerCase().includes("est./pi sent") && date >= newLeadDate;
      });

      if (piSentReview) {
        const piSentDate = new Date(piSentReview.createdAt || piSentReview.re_added);
        const diffTime = Math.abs(piSentDate - newLeadDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalConversionDays += diffDays;
        companiesWithConversion++;
      }
    }
  });

  const avgConversionTime = companiesWithConversion > 0 ? Math.round(totalConversionDays / companiesWithConversion) : 0;

  const statCards = (
    <>
      <div className="group cursor-pointer relative bg-gradient-to-br from-white from-50% to-emerald-50 p-4 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '4px', display: 'block', fontFamily: 'Inter, sans-serif' }}>{totalConverted || 0}</span>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#334155', lineHeight: 1.2, display: 'block', fontFamily: 'Inter, sans-serif' }}>TOTAL EXHIBITORS</span>
            </div>
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#059669', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>Till Date</div>
        </div>
      </div>

      <div className="group cursor-pointer relative bg-gradient-to-br from-white from-50% to-blue-50 p-4 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '4px', display: 'block', fontFamily: 'Inter, sans-serif' }}>₹ {totalRevenue ? (totalRevenue / 100000).toFixed(1) + 'L' : 0}</span>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#334155', lineHeight: 1.2, display: 'block', fontFamily: 'Inter, sans-serif' }}>TOTAL REVENUE</span>
            </div>
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#2563eb', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>All Time</div>
        </div>
      </div>

      <div className="group cursor-pointer relative bg-gradient-to-br from-white from-50% to-purple-50 p-4 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '4px', display: 'block', fontFamily: 'Inter, sans-serif' }}>{avgConversionTime || 0} Days</span>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#334155', lineHeight: 1.2, display: 'block', fontFamily: 'Inter, sans-serif' }}>AVG. CONVERSION</span>
            </div>
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#9333ea', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>Average time</div>
        </div>
      </div>

      <div className="group cursor-pointer relative bg-gradient-to-br from-white from-50% to-orange-50 p-4 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-orange-500 fill-orange-500" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '4px', display: 'block', fontFamily: 'Inter, sans-serif' }}>{existingClientsCount || 0}</span>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#334155', lineHeight: 1.2, display: 'block', fontFamily: 'Inter, sans-serif' }}>EXISTING CLIENTS</span>
            </div>
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#f97316', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{totalConverted ? Math.round((existingClientsCount / totalConverted) * 100) : 0}% of total clients</div>
        </div>
      </div>

      <div className="group cursor-pointer relative bg-gradient-to-br from-white from-50% to-green-50 p-4 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-green-600" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '4px', display: 'block', fontFamily: 'Inter, sans-serif' }}>{totalConverted > 0 ? Math.round((existingClientsCount / totalConverted) * 100) : 0}%</span>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#334155', lineHeight: 1.2, display: 'block', fontFamily: 'Inter, sans-serif' }}>CONVERSION RATE</span>
            </div>
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>Overall</div>
        </div>
      </div>

      <div className="group cursor-pointer relative bg-gradient-to-br from-white from-50% to-cyan-50 p-4 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center shrink-0">
              <Ticket className="w-5 h-5 text-cyan-600" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '4px', display: 'block', fontFamily: 'Inter, sans-serif' }}>{(totalConverted - existingClientsCount) || 0}</span>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#334155', lineHeight: 1.2, display: 'block', fontFamily: 'Inter, sans-serif' }}>NEW CLIENTS</span>
            </div>
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#0891b2', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>First-time exhibitors</div>
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
      <th className="px-2 py-2 font-medium">Company Name</th>
      <th className="px-2 py-2 font-medium">Contact Details</th>
      <th className="px-2 py-2 font-medium text-center">Category</th>
      <th className="px-2 py-2 font-medium text-center">Source</th>
      <th className="px-2 py-2 font-medium text-center">Stall Size</th>
      <th className="px-2 py-2 font-medium text-center">Booking Date</th>
      <th className="px-2 py-2 font-medium text-center">Location</th>
      <th className="px-2 py-2 font-medium text-right">Revenue</th>
      <th className="px-2 py-2 font-medium text-center">PYMT Status</th>
      <th className="px-2 py-2 font-medium text-center">Updated Details</th>
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
        const source = row.referredBy || "Direct";
        return (
          <tr key={row._id || i} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-emerald-50/30' : ''}`}>
            <td className="px-2 py-2 text-center">
              <input
                type="checkbox"
                className="w-3 h-3 accent-emerald-500 cursor-pointer rounded-sm"
                checked={isSelected}
                onChange={() => onSelectRow(row._id)}
              />
            </td>
            <td className="px-2 py-2">
              <div className="font-bold text-[11px] cursor-pointer hover:text-emerald-600 hover:underline" style={{ color: '#093C5D' }}>
                <Link to={`/client-overview/${row._id}?source=exhibitor`}>{toTitleCase(row.exhibitorName || row.companyName)}</Link>
              </div>
              <div className="text-[9px] font-bold" style={{ color: '#5E0006' }}>{toTitleCase(row.natureOfBusiness || row.industrySector || row.typeOfBusiness) || "-"}</div>
            </td>
            <td className="px-2 py-2">
              <div className="font-bold text-[10px]" style={{ color: '#15173D' }}>
                {toTitleCase(row.contact1?.name || (row.contact1?.firstName ? `${row.contact1.firstName} ${row.contact1.lastName || ''}`.trim() : null) || row.contactPerson || "N/A")}
              </div>
              <div className="text-[9px] text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                <Phone size={9} className="text-blue-500 shrink-0" />
                {row.contact1?.mobile || row.contact1?.phone || row.mobile || row.phone || "N/A"}
              </div>
            </td>
            <td className="px-2 py-2 text-center">
              {row.msme?.udyamRegNo || row.msme?.msmeCategory || row.isMSME ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded font-bold text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200">
                  MSME
                </span>
              ) : (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded font-bold text-[9px] text-amber-700 bg-amber-50 border border-amber-200">
                  Non-MSME
                </span>
              )}
            </td>
            <td className="px-2 py-2 text-center">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-semibold text-[9px] ${getSourceStyle(source)}`}>
                @{toTitleCase(source)}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-bold text-[10px]" style={{ color: '#016B61' }}>
                {row.participation?.stallSize || row.stallSize ? `${row.participation?.stallSize || row.stallSize} sqm` : "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <div className="flex flex-col items-center justify-center gap-0.5">
                {(row.createdAt || row.updatedAt) ? (() => {
                  const d = new Date(row.createdAt || row.updatedAt);
                  const date = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).format(d);
                  const time = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).format(d);
                  return (
                    <>
                      <div className="flex items-center gap-1">
                        <CalendarDays className="text-slate-400" size={10} />
                        <span className="text-[10px] font-bold" style={{ color: '#111844' }}>{date}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-medium">{time}</span>
                    </>
                  );
                })() : "-"}
              </div>
            </td>

            <td className="px-2 py-2 text-center">
              <div className="font-bold text-[10px]" style={{ color: '#093C5D' }}>
                {toTitleCase(row.city || row.address?.city || row.companyCity || "N/A")}
              </div>
              <div className="text-[9px] font-bold" style={{ color: '#5E0006' }}>
                {toTitleCase(row.state || row.address?.state || row.companyState || "N/A")}
              </div>
            </td>
            <td className="px-2 py-2 text-right">
              <span className="font-bold text-[10px]" style={{ color: '#064232' }}>{row.participation?.currency === 'USD' ? '$' : '₹'} {(row.amountPaid || row.financeBreakdown?.netPayable || row.participation?.total || 0).toLocaleString()}</span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold whitespace-nowrap ${
                row.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                row.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-200' :
                row.status === 'approved' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                row.status === 'advance-paid' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' :
                row.status === 'rejected' || row.status === 'payment-failed' ? 'bg-red-50 text-red-600 border border-red-200' :
                'bg-amber-50 text-amber-600 border border-amber-200'
              }`}>
                {row.status === 'paid' ? 'Paid (Full)' :
                 row.status === 'confirmed' ? 'Confirmed' :
                 row.status === 'approved' ? 'Approved' :
                 row.status === 'advance-paid' ? 'Installment' :
                 row.status === 'rejected' ? 'Rejected' :
                 row.status === 'payment-failed' ? 'Failed' :
                 'Pending'}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <div className="flex flex-col items-center justify-center gap-0.5">
                {row.updatedAt ? (() => {
                  const d = new Date(row.updatedAt);
                  const date = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).format(d);
                  const time = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).format(d);
                  return (
                    <>
                      <div className="flex items-center gap-1">
                        <RefreshCw className="text-slate-400" size={10} />
                        <span className="text-[10px] font-bold text-slate-700">{date}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-medium">{time}</span>
                    </>
                  );
                })() : "-"}
              </div>
            </td>

          </tr>
        );
      })}
    </>
  );




  const paginationBar = (
    <>
      <div className="text-blue-600 font-medium">
        Showing {totalLeads === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, totalLeads)} of {totalLeads} clients
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(1)} disabled={page === 1} className="p-1 rounded hover:bg-slate-100 text-slate-400 disabled:opacity-50">«</button>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded hover:bg-slate-100 text-slate-400 disabled:opacity-50">‹</button>

        <button className={`w-6 h-6 rounded font-bold flex items-center justify-center bg-[#00a65a] text-white`}>
          {page}
        </button>

        <button onClick={() => setPage(p => Math.min(pagination?.totalPages || 1, p + 1))} disabled={page >= (pagination?.totalPages || 1)} className="p-1 rounded hover:bg-slate-100 text-slate-400 disabled:opacity-50">›</button>
        <button onClick={() => setPage(pagination?.totalPages || 1)} disabled={page >= (pagination?.totalPages || 1)} className="p-1 rounded hover:bg-slate-100 text-slate-400 disabled:opacity-50">»</button>
      </div>
      <div className="flex items-center gap-2 text-blue-600 font-medium">
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
      title="Exhibitor List"
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

      pagination={paginationBar}
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
