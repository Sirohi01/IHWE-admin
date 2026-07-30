import React, { useState, useEffect, useRef, useCallback } from "react";
import { Eye } from 'lucide-react';
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createActivityLogThunk } from '../../features/activityLog/activityLogSlice';
import api from "../../lib/api";
import { handleStatusUpdate } from '../../utils/statusUpdateHelper';
import { useEventContext } from '../../context/EventContext';

import BaseLeadPage from "../../layout/BaseLeadPage";
import {
  Search, Download, Plus, Upload, MessageCircle, Phone, Mail, MoreVertical,
  Calendar, CalendarDays, ArrowRight, RefreshCw, Flame, MessageSquare, Send, CheckCircle2,
  Users, DollarSign, Star, FileText, ChevronDown, TrendingUp, Ticket, ShieldCheck, X, Banknote, Clock, Package
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
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(ease * numTarget);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return { ref, count };
}

import ManageFinanceModal from './ManageFinanceModal';

// Removed dummy rows

// Module-level cache for non-registration data (events, settings, etc.)
let _cachedMasterCompanies = null;
let _cachedAllReviews = null;
let _cachedEvents = null;
let _cachedSettings = null;


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

  // Currently selected event (global, from Navbar, or pinned to the URL's
  // CrmEvent via CrmEventScopedRoute when reached from crm-event/:eventId/bookings)
  // — every fetch below scopes to this. Company.eventAssignments[].eventId
  // already IS the CrmEvent id, so (unlike the old ExhibitorRegistration-based
  // fetch) no extra registrationEventId resolution hop is needed.
  const { currentEventId, currentEvent } = useEventContext();
  const { eventId: routeCrmEventId } = useParams();
  const effectiveEventId = currentEventId;

  // Auth State — the logged-in admin's profile lives under the "adminInfo" key,
  // in localStorage (remember-me) or sessionStorage — NOT in the auth Redux slice,
  // which only tracks isAuthenticated/loading flags.
  const user = (() => {
    const raw = localStorage.getItem('adminInfo') || sessionStorage.getItem('adminInfo');
    try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
  })();
  const roleSlug = (user?.role || '').toLowerCase().replace(/[^a-z]/g, '');
  const isSuperAdmin = roleSlug === 'superadmin' || roleSlug === 'ihwesuperadministrator';

  // All "Booked" companies for this event (client-side filter/paginate/stat,
  // same pattern as ConvertedList.jsx) — companies whose eventAssignments.status
  // is "Booked" AND who don't have a Payment recorded yet (see getBookedCompanies
  // in companyController.js). The moment a Payment appears, a company leaves
  // this list and shows up in Converted instead.
  const [registrations, setRegistrations] = useState([]);

  const [masterCompanies, setMasterCompanies] = useState(_cachedMasterCompanies || []);
  const [allReviews, setAllReviews] = useState(_cachedAllReviews || []);
  const [events, setEvents] = useState(_cachedEvents || []);
  const [settings, setSettings] = useState(_cachedSettings || null);
  const [isLoading, setIsLoading] = useState(true);

  // Finance Modal State
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [selectedClientForFinance, setSelectedClientForFinance] = useState(null);

  // Fetch all Booked companies for this event
  const fetchRegistrations = useCallback(async () => {
    if (!effectiveEventId) {
      setRegistrations([]);
      return;
    }
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        eventId: effectiveEventId,
        ...(user?.username && { username: user.username }),
        ...(user?.role && { role: user.role }),
      });
      const regRes = await api.get(`/api/companies/booked?${params}`);
      if (regRes.data?.success) {
        setRegistrations(Array.isArray(regRes.data.data) ? regRes.data.data : []);
      }
    } catch (error) {
      console.error('Error fetching booked companies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.username, user?.role, effectiveEventId]);

  // Fetch static data only once (cached)
  const fetchStaticData = async () => {
    try {
      const [compRes, reviewRes, eventsRes, settingsRes] = await Promise.all([
        _cachedMasterCompanies ? Promise.resolve({ data: _cachedMasterCompanies }) : api.get('/api/companies?dashboard=true').catch(() => ({ data: [] })),
        _cachedAllReviews      ? Promise.resolve({ data: _cachedAllReviews })      : api.get('/api/crm-exhibator-reviews').catch(() => ({ data: [] })),
        _cachedEvents          ? Promise.resolve({ data: { success: true, data: _cachedEvents } }) : api.get('/api/events/active').catch(() => ({ data: [] })),
        _cachedSettings        ? Promise.resolve({ data: { success: true, data: _cachedSettings } }) : api.get('/api/settings').catch(() => ({ data: null })),
      ]);

      if (compRes.data && Array.isArray(compRes.data)) {
        setMasterCompanies(compRes.data); _cachedMasterCompanies = compRes.data;
      } else if (compRes.data?.data && Array.isArray(compRes.data.data)) {
        setMasterCompanies(compRes.data.data); _cachedMasterCompanies = compRes.data.data;
      }
      if (reviewRes.data && Array.isArray(reviewRes.data)) {
        setAllReviews(reviewRes.data); _cachedAllReviews = reviewRes.data;
      } else if (reviewRes.data?.data && Array.isArray(reviewRes.data.data)) {
        setAllReviews(reviewRes.data.data); _cachedAllReviews = reviewRes.data.data;
      }
      if (eventsRes.data?.success) {
        const evts = Array.isArray(eventsRes.data.data) ? eventsRes.data.data : [];
        setEvents(evts); _cachedEvents = evts;
      }
      if (settingsRes.data?.success) {
        setSettings(settingsRes.data.data); _cachedSettings = settingsRes.data.data;
      }
    } catch (error) {
      console.error('Error fetching static data:', error);
    }
  };

  // Initial load: static data once, booked companies on every event/user change
  useEffect(() => { fetchStaticData(); }, []);

  useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);

  // Frontend filtering and pagination — same pattern as ConvertedList.jsx
  const filteredRegs = registrations.filter(r => {
    if (filterStage && filterStage !== 'Booked' && (r.status || 'Booked') !== filterStage) return false;
    if (filterSource && (r.referredBy || r.dataSource || 'Direct') !== filterSource) return false;
    if (filterIndustry && (r.natureOfBusiness || r.industrySector || r.typeOfBusiness) !== filterIndustry) return false;
    if (searchTerm) {
      const searchStr = `${r.exhibitorName} ${r.companyName} ${r.contact1?.email} ${r.contact1?.mobile}`.toLowerCase();
      if (!searchStr.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  const totalLeads = filteredRegs.length;
  const totalPages = Math.ceil(totalLeads / limit) || 1;
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

  // Filter dropdown options derived from ALL booked companies for this event
  // (not just the current page/filtered set), so the dropdowns show full choices.
  const uniqueSources = [...new Set(registrations.map(r => r.referredBy || r.dataSource).filter(Boolean))];
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
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
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

  // Stat cards computed client-side from the full filtered set — same pattern
  // (and same name/email/mobile matching heuristic against masterCompanies)
  // as ConvertedList.jsx.
  const totalConverted = filteredRegs.length;
  const existingClientsCount = filteredRegs.filter(reg => {
    const rName = (reg.companyName || reg.exhibitorName || "").toLowerCase().trim();
    const rEmail1 = (reg.contact1?.email || "").toLowerCase().trim();
    const rEmail2 = (reg.contact2?.email || "").toLowerCase().trim();
    const rMobile1 = (reg.contact1?.mobile || "").trim();
    const rMobile2 = (reg.contact2?.mobile || "").trim();

    return masterCompanies.some(comp => {
      if (comp._id === reg._id) return false;
      const cName = (comp.companyName || comp.exhibitorName || "").toLowerCase().trim();
      const cEmail = (comp.email || "").toLowerCase().trim();
      const cMobile = (comp.mobile || "").trim();

      if (rName && cName && rName === cName) return true;
      if (cEmail && (rEmail1 === cEmail || rEmail2 === cEmail)) return true;
      if (cMobile && (rMobile1 === cMobile || rMobile2 === cMobile)) return true;

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

  const newClientsCount = totalConverted - existingClientsCount;
  const totalArea = filteredRegs.reduce((acc, curr) => acc + (Number(curr.participation?.stallSize) || Number(curr.stallSize) || 0), 0);
  const totalRevenue = filteredRegs.reduce((acc, curr) => acc + (Number(curr.financeBreakdown?.netPayable) || Number(curr.participation?.total) || Number(curr.amountPaid) || 0), 0);
  const paymentReceived = filteredRegs.reduce((acc, curr) => acc + (Number(curr.amountPaid) || Number(curr.financeBreakdown?.paidAmount) || 0), 0);
  const balancePayment = totalRevenue - paymentReceived;

  // Animated stat card component
  function AnimatedStatCard({ icon, gradientTo, iconBg, iconClass, rawValue, displayValue, label, subLabel, subColor }) {
    const { ref, count } = useCountUp(rawValue);
    return (
      <div ref={ref} className={`group cursor-pointer relative bg-gradient-to-br from-white ${gradientTo} p-4 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden`}>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center shrink-0`}>
              {icon}
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '4px', display: 'block', fontFamily: 'Inter, sans-serif' }}>
                {displayValue(count)}
              </span>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#334155', lineHeight: 1.2, display: 'block', fontFamily: 'Inter, sans-serif' }}>{label}</span>
            </div>
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: subColor, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{subLabel}</div>
        </div>
      </div>
    );
  }

  const statCards = (
    <>
      <AnimatedStatCard
        icon={<Users className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />}
        gradientTo="to-emerald-50" iconBg="bg-emerald-100"
        rawValue={totalConverted}
        displayValue={(c) => Math.round(c)}
        label="TOTAL EXHIBITORS"
        subLabel="Till Date" subColor="#059669"
      />
      <AnimatedStatCard
        icon={<Package className="w-5 h-5 text-indigo-600" strokeWidth={2.5} />}
        gradientTo="to-indigo-50" iconBg="bg-indigo-100"
        rawValue={totalArea}
        displayValue={(c) => <>{Math.round(c)} <span className="text-sm">sqm</span></>}
        label="TOTAL AREA"
        subLabel="Booked Space" subColor="#4f46e5"
      />
      <AnimatedStatCard
        icon={<DollarSign className="w-5 h-5 text-blue-600" strokeWidth={2.5} />}
        gradientTo="to-blue-50" iconBg="bg-blue-100"
        rawValue={totalRevenue / 100000}
        displayValue={(c) => `₹ ${c.toFixed(2)}L`}
        label="TOTAL REVENUE"
        subLabel="Expected" subColor="#2563eb"
      />
      <AnimatedStatCard
        icon={<Banknote className="w-5 h-5 text-green-600" strokeWidth={2.5} />}
        gradientTo="to-green-50" iconBg="bg-green-100"
        rawValue={paymentReceived / 100000}
        displayValue={(c) => `₹ ${c.toFixed(2)}L`}
        label="PAYMENT RECEIVED"
        subLabel="Collected" subColor="#16a34a"
      />
      <AnimatedStatCard
        icon={<Clock className="w-5 h-5 text-rose-600" strokeWidth={2.5} />}
        gradientTo="to-rose-50" iconBg="bg-rose-100"
        rawValue={balancePayment > 0 ? balancePayment / 100000 : 0}
        displayValue={(c) => `₹ ${c.toFixed(2)}L`}
        label="BALANCE PAYMENT"
        subLabel="Pending" subColor="#e11d48"
      />
      <AnimatedStatCard
        icon={<TrendingUp className="w-5 h-5 text-cyan-600" strokeWidth={2.5} />}
        gradientTo="to-cyan-50" iconBg="bg-cyan-100"
        rawValue={totalConverted}
        displayValue={(c) => Math.round(c)}
        label="CLIENT STATUS"
        subLabel={`New - ${newClientsCount} | Existing - ${existingClientsCount}`}
        subColor="#0891b2"
      />
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
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
        />
      </div>

      <select
        value={filterIndustry}
        onChange={(e) => { setFilterIndustry(e.target.value); setPage(1); }}
        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:border-emerald-500"
      >
        <option value="">Industry</option>
        {uniqueIndustries.map(ind => (
          <option key={ind} value={ind}>{ind}</option>
        ))}
      </select>

      <select
        value={filterSource}
        onChange={(e) => { setFilterSource(e.target.value); setPage(1); }}
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
        onChange={(e) => { setFilterStage(e.target.value); setPage(1); }}
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
      <th className="min-w-[185px] px-2 py-2 font-medium">Company Name</th>
      <th className="min-w-[230px] px-2 py-2 font-medium">Expo / Event</th>
      <th className="min-w-[150px] px-2 py-2 font-medium">Contact Details</th>
      <th className="min-w-[150px] px-2 py-2 font-medium text-left">Category</th>
      <th className="min-w-[125px] px-2 py-2 font-medium text-left">Source</th>
      <th className="min-w-[125px] px-2 py-2 font-medium text-center">Stall Size</th>
      <th className="min-w-[145px] px-2 py-2 font-medium text-center">Booking Date</th>
      <th className="min-w-[125px] px-2 py-2 font-medium text-left">Location</th>
      <th className="min-w-[90px] px-2 py-2 font-medium text-right">Revenue</th>
      <th className="min-w-[110px] px-2 py-2 font-medium text-center">PYMT Status</th>
      <th className="min-w-[155px] px-2 py-2 font-medium text-center">Updated Details</th>
    </>
  );

  const tableBody = (
    <>
      {isLoading ? (
        [...Array(10)].map((_, index) => (
          <tr key={`skeleton-${index}`} className="animate-pulse border-b border-slate-100 bg-white">
            <td className="px-1 py-3 text-center"><div className="w-3 h-3 bg-slate-200 rounded-sm mx-auto"></div></td>
            <td className="px-1 py-3"><div className="h-3 w-32 bg-slate-200 rounded mb-1.5"></div><div className="h-2 w-24 bg-slate-100 rounded"></div></td>
            <td className="px-1 py-3"><div className="h-3 w-24 bg-slate-200 rounded mb-1.5"></div><div className="h-2 w-20 bg-slate-100 rounded"></div></td>
            <td className="px-1 py-3"><div className="h-4 w-20 bg-slate-200 rounded"></div></td>
            <td className="px-1 py-3"><div className="h-3 w-16 bg-slate-200 rounded"></div></td>
            <td className="px-1 py-3 text-center"><div className="h-3 w-12 bg-slate-200 rounded mx-auto"></div></td>
            <td className="px-1 py-3 text-center"><div className="h-3 w-16 bg-slate-200 rounded mx-auto mb-1.5"></div><div className="h-2 w-12 bg-slate-100 rounded mx-auto"></div></td>
            <td className="px-1 py-3"><div className="h-3 w-20 bg-slate-200 rounded mb-1.5"></div><div className="h-2 w-16 bg-slate-100 rounded"></div></td>
            <td className="px-1 py-3 text-center"><div className="h-3 w-16 bg-slate-200 rounded mx-auto"></div></td>
            <td className="px-1 py-3 text-center"><div className="h-4 w-16 bg-slate-200 rounded-full mx-auto"></div></td>
            <td className="px-1 py-3 text-center"><div className="h-3 w-16 bg-slate-200 rounded mx-auto mb-1.5"></div><div className="h-2 w-12 bg-slate-100 rounded mx-auto"></div></td>
          </tr>
        ))
      ) : allCompanies.length === 0 ? (
        <tr>
          <td colSpan="8" className="px-2 py-4 text-center text-slate-500 font-medium">No results found</td>
        </tr>
      ) : allCompanies.map((row, i) => {
        const isSelected = selectedIds.includes(row._id);
        const isIncompleteBooking =
          !row.participation?.stallNo
          || Number(row.participation?.stallSize || 0) <= 0
          || Number(row.participation?.total || 0) <= 0;
        const source = row.referredBy || "Direct";
        const primaryTeamMember = row.teamMembers?.find((member) =>
          member.isPrimary || /primary contact/i.test(member.roleAtExhibition || '')
        ) || row.teamMembers?.[0];
        const companyContact =
          row.contacts?.find((contact) => contact.isPrimary)
          || row.contacts?.[0];
        const contactEmail =
          row.contact1?.email
          || primaryTeamMember?.email
          || companyContact?.email
          || row.companyEmail
          || row.email
          || "N/A";
        const contactMobile =
          row.contact1?.mobile
          || row.contact1?.phone
          || primaryTeamMember?.mobile
          || companyContact?.mobile
          || row.mobile
          || row.phone
          || "N/A";
        return (
          <tr key={row._id || i} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-emerald-50/30' : ''}`}>
            <td className="px-1 py-2 text-center">
              <input
                type="checkbox"
                className="w-3 h-3 accent-emerald-500 cursor-pointer rounded-sm"
                checked={isSelected}
                onChange={() => onSelectRow(row._id)}
              />
            </td>
            <td className="min-w-[185px] px-2 py-2">
              <div className="font-bold text-[11px] cursor-pointer hover:text-emerald-600 hover:underline" style={{ color: '#093C5D' }}>
                <Link to={`/client-overview/${row._id}?source=exhibitor&eventId=${routeCrmEventId || currentEventId}`}>{toTitleCase(row.exhibitorName || row.companyName)}</Link>
              </div>
              <div className="text-[9px] font-bold" style={{ color: '#5E0006' }}>{toTitleCase(row.natureOfBusiness || row.industrySector || row.typeOfBusiness) || "-"}</div>
            </td>
            <td className="min-w-[230px] max-w-[230px] px-2 py-2 text-left">
              <span
                className="block w-[210px] overflow-hidden text-ellipsis whitespace-nowrap rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700"
                title={row.eventId?.name || "Event Not Assigned"}
              >
                {row.eventId?.name || "Event Not Assigned"}
              </span>
            </td>
            <td className="min-w-[150px] px-2 py-2">
              <div className="font-bold text-[10px] lowercase" style={{ color: '#15173D' }}>
                {contactEmail}
              </div>
              <div className="text-[9px] text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                <Phone size={9} className="text-blue-500 shrink-0" />
                {contactMobile}
              </div>
            </td>
            <td className="px-1 py-2 text-left">
              {(() => {
                const cat = row.participation?.stallCategory || row.exhibitorCategory || row.msme?.msmeCategory || null;
                const isMsme = cat?.toLowerCase().includes('msme') || cat?.toLowerCase().includes('psm') || row.msme?.udyamRegNo || row.isMSME;
                
                if (cat) {
                  // Show actual category from backend
                  const isGreen = cat.toLowerCase().includes('msme') || cat.toLowerCase().includes('psm');
                  const isAmber = cat.toLowerCase().includes('general') || cat.toLowerCase().includes('non');
                  const isPurple = cat.toLowerCase().includes('startup') || cat.toLowerCase().includes('women');
                  return (
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-bold text-[9px] ${
                      isGreen ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' :
                      isAmber ? 'text-amber-700 bg-amber-50 border border-amber-200' :
                      isPurple ? 'text-purple-700 bg-purple-50 border border-purple-200' :
                      'text-blue-700 bg-blue-50 border border-blue-200'
                    }`}>
                      {cat}
                    </span>
                  );
                }
                // Fallback: derive from msme fields
                return isMsme ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded font-bold text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200">
                    MSME
                  </span>
                ) : (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded font-bold text-[9px] text-amber-700 bg-amber-50 border border-amber-200">
                    General
                  </span>
                );
              })()}
            </td>
            <td className="px-1 py-2 text-left">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold text-[9px] ${getSourceStyle(source)}`} style={{ color: '#443199' }}>
                @{toTitleCase(source)}
              </span>
            </td>
            <td className="px-1 py-2 text-center">
              <span className="font-bold text-[10px]" style={{ color: '#016B61' }}>
                {isIncompleteBooking
                  ? <span className="text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">Incomplete Booking</span>
                  : `${row.participation?.stallSize || row.stallSize} sqm`}
              </span>
            </td>
            <td className="px-1 py-2 text-center">
              <div className="flex items-center justify-center gap-1">
                {(row.createdAt || row.updatedAt) ? (() => {
                  const d = new Date(row.createdAt || row.updatedAt);
                  const date = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).format(d);
                  const time = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).format(d);
                  return (
                    <>
                      <CalendarDays className="text-slate-400 shrink-0" size={10} />
                      <span className="text-[10px] font-bold whitespace-nowrap" style={{ color: '#111844' }}>{date}</span>
                      <span className="text-[9px] text-slate-500 font-medium whitespace-nowrap">{time}</span>
                    </>
                  );
                })() : "-"}
              </div>
            </td>

            <td className="px-1 py-2 text-left">
              <div className="font-bold text-[10px]" style={{ color: '#093C5D' }}>
                {toTitleCase(row.city || row.address?.city || row.companyCity || "N/A")}
              </div>
              <div className="text-[9px] font-bold" style={{ color: '#5E0006' }}>
                {toTitleCase(row.state || row.address?.state || row.companyState || "N/A")}
              </div>
            </td>
            <td className="px-1 py-2 text-right">
              <span className="font-bold text-[10px]" style={{ color: '#064232' }}>{row.participation?.currency === 'USD' ? '$' : '₹'} {(row.amountPaid || row.financeBreakdown?.netPayable || row.participation?.total || 0).toLocaleString()}</span>
            </td>
            <td className="px-1 py-2 text-center">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold whitespace-nowrap ${
                isIncompleteBooking ? 'bg-red-50 text-red-700 border border-red-200' :
                row.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                row.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-200' :
                row.status === 'approved' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                row.status === 'advance-paid' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' :
                row.status === 'rejected' || row.status === 'payment-failed' ? 'bg-red-50 text-red-600 border border-red-200' :
                'bg-amber-50 text-amber-600 border border-amber-200'
              }`}>
                {isIncompleteBooking ? 'Incomplete' :
                 row.status === 'paid' ? 'Paid (Full)' :
                 row.status === 'confirmed' ? 'Confirmed' :
                 row.status === 'approved' ? 'Approved' :
                 row.status === 'advance-paid' ? 'Installment' :
                 row.status === 'rejected' ? 'Rejected' :
                 row.status === 'payment-failed' ? 'Failed' :
                 'Pending'}
              </span>
            </td>
            <td className="px-1 py-2 text-center">
              <div className="flex flex-col items-center justify-center gap-0.5">
                {row.updatedAt ? (() => {
                  const d = new Date(row.updatedAt);
                  const date = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).format(d);
                  const time = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).format(d);
                  return (
                    <>
                      <div className="flex items-center gap-1">
                        <RefreshCw className="text-slate-400 shrink-0" size={10} />
                        <span className="text-[10px] font-bold text-slate-700 whitespace-nowrap">{date}</span>
                        <span className="text-[9px] text-slate-500 font-medium whitespace-nowrap">{time}</span>
                      </div>
                      {(row.updatedByName || row.filledByFullName) && (
                        <span className="text-[9px] font-bold" style={{ color: '#443199' }}>by {toTitleCase(row.updatedByName || row.filledByFullName)}</span>
                      )}
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




  const paginationTotalPages = pagination?.totalPages || 1;

  const getPageNumbers = () => {
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

  const paginationBar = (
    <>
      {/* Showing info */}
      <div className="flex items-center gap-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
        <span className="text-[11px] font-bold" style={{ color: '#334155' }}>Showing</span>
        <span className="text-[11px] font-black px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-100" style={{ color: '#016B61' }}>
          {totalLeads === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, totalLeads)}
        </span>
        <span className="text-[11px] font-bold" style={{ color: '#334155' }}>of</span>
        <span className="text-[11px] font-black" style={{ color: '#15173D' }}>{totalLeads}</span>
        <span className="text-[11px] font-bold" style={{ color: '#334155' }}>clients</span>
      </div>

      {/* Page buttons */}
      <div className="flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
        {/* First */}
        <button
          onClick={() => setPage(1)}
          disabled={page === 1}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
          style={{ borderColor: '#e2e8f0', color: '#334155' }}
        >«</button>

        {/* Prev */}
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
          style={{ borderColor: '#e2e8f0', color: '#334155' }}
        >‹</button>

        {/* Numbered pages */}
        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`dot-${i}`} className="w-7 h-7 flex items-center justify-center text-[11px] text-slate-400 font-bold">…</span>
          ) : (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black border transition-all duration-200"
              style={
                p === page
                  ? { backgroundColor: '#016B61', color: '#fff', borderColor: '#016B61', boxShadow: '0 2px 8px rgba(1,107,97,0.3)' }
                  : { backgroundColor: '#fff', color: '#15173D', borderColor: '#e2e8f0' }
              }
            >{p}</button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => setPage(p => Math.min(paginationTotalPages, p + 1))}
          disabled={page >= paginationTotalPages}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
          style={{ borderColor: '#e2e8f0', color: '#334155' }}
        >›</button>

        {/* Last */}
        <button
          onClick={() => setPage(paginationTotalPages)}
          disabled={page >= paginationTotalPages}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
          style={{ borderColor: '#e2e8f0', color: '#334155' }}
        >»</button>
      </div>

      {/* Rows per page */}
      <div className="flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
        <span className="text-[11px] font-bold" style={{ color: '#334155' }}>Rows:</span>
        <select
          value={limit}
          onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
          className="border rounded-lg py-1 px-2 bg-white outline-none cursor-pointer text-[11px] font-bold"
          style={{ borderColor: '#e2e8f0', color: '#15173D', fontFamily: 'Inter, sans-serif' }}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </>
  );

  return (
    <BaseLeadPage
      title={routeCrmEventId ? `${currentEvent?.event_name || currentEvent?.event_fullName || "Expo"} Bookings` : "Exhibitor List"}
      subtitle="Exhibitor registrations and stall bookings for this Expo"
      badgeCount={<span className="text-emerald-700">{totalLeads}</span>}
      headerActions={
        <div className="flex flex-wrap items-center gap-1.5">
          <Link to={routeCrmEventId ? `/book-a-stand?crmEventId=${routeCrmEventId}` : "/book-a-stand"} className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            Book a Stand
          </Link>
          <Link to={routeCrmEventId ? `/crm-event/${routeCrmEventId}/new-leads` : "/ihweClientData2026/newLeadList"} className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            New Lead List
          </Link>
          <Link to={routeCrmEventId ? `/crm-event/${routeCrmEventId}/follow-ups` : "/ihweClientData2026/warmClientList"} className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            Warm Client
          </Link>
          <Link to={routeCrmEventId ? `/crm-event/${routeCrmEventId}/hot-leads` : "/ihweClientData2026/hotClientList"} className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            Hot Client
          </Link>
          <Link to={routeCrmEventId ? `/crm-event/${routeCrmEventId}/lost-leads` : "/ihweClientData2026/coldClientList"} className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            Cold Client
          </Link>
          <Link to={routeCrmEventId ? `/crm-event/${routeCrmEventId}/all-leads` : "/ihweClientData2026/rawDataList"} className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            Raw Data List
          </Link>
        </div>
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
