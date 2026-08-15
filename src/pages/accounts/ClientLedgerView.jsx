import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronRight, Calendar, Download, FileSpreadsheet, Search, Filter, Building2,
    Phone, Mail, BadgeCheck, MapPin, Wallet, TrendingUp, AlertTriangle, Clock,
    Plus, FileText, FileMinus, Send, BarChart2, ArrowRightCircle, Loader2, X, ChevronDown
} from 'lucide-react';
import api, { SERVER_URL } from '../../lib/api';
import toast from 'react-hot-toast';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const AGING_COLORS = ['#3b82f6', '#f59e0b', '#f97316', '#e11d48'];

const TYPE_STYLES = {
    Invoice: 'bg-blue-50 text-blue-600',
    Payment: 'bg-emerald-50 text-emerald-600',
    'Credit Note': 'bg-purple-50 text-purple-600',
};

const STATUS_STYLES = {
    Open: 'bg-blue-50 text-blue-600',
    Paid: 'bg-emerald-50 text-emerald-600',
    'Partially Paid': 'bg-amber-50 text-amber-600',
    Received: 'bg-emerald-50 text-emerald-600',
    Adjusted: 'bg-purple-50 text-purple-600',
};

const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);
const formatDate = (val) => {
    if (!val) return 'N/A';
    const d = new Date(val);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
};

// Hook: animate number from 0 to target when element enters viewport (matches InvoicesView.jsx)
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

// Matches InvoicesView.jsx's StatCard exactly, for visual/typography consistency across Accounts pages
function StatCard({ icon, iconBg, accent, rawValue, displayValue, label, subLabel, bottomLabel, bottomValue, isCurrency }) {
    const { ref, count } = useCountUp(rawValue);
    return (
        <div ref={ref} className="relative bg-white p-3.5 border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between h-full overflow-hidden hover:shadow-md hover:border-slate-300 transition-all">
            <div className={`absolute top-0 left-0 right-0 h-[3px] ${accent || 'bg-slate-200'}`} />
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-slate-500 font-bold text-[9px] uppercase tracking-wider leading-tight whitespace-nowrap truncate">{label}</h3>
                    <div className="text-xl font-bold text-slate-800 leading-tight mt-1 truncate">
                        {isCurrency ? displayValue : Math.round(count).toLocaleString('en-IN')}
                    </div>
                    <div className="text-slate-400 text-[10px] font-semibold mt-0.5 truncate">{subLabel}</div>
                </div>
            </div>
            <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex justify-between items-center text-[10px]">
                <span className="text-slate-500 font-medium">{bottomLabel}</span>
                <span className="text-slate-700 font-bold">{bottomValue}</span>
            </div>
        </div>
    );
}

const statusBadgeStyle = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('won') || s.includes('active') || s.includes('confirmed') || s.includes('paid')) return 'bg-emerald-50 text-emerald-600';
    if (s.includes('lost') || s.includes('rejected') || s.includes('fail')) return 'bg-rose-50 text-rose-600';
    if (s.includes('pending') || s.includes('lead')) return 'bg-amber-50 text-amber-600';
    return 'bg-slate-100 text-slate-500';
};

function MiniStatCard({ icon, iconBg, iconColor, title, value, subLabel }) {
    return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
                <div className={`w-9 h-9 ${iconBg} ${iconColor} rounded-lg flex items-center justify-center shrink-0`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-slate-700 font-bold text-[9px] uppercase tracking-wider leading-tight whitespace-nowrap truncate">{title}</h3>
                    <div className="text-lg font-black text-slate-800 leading-tight mt-1 truncate">
                        {value}
                    </div>
                    {subLabel && (
                        <div className="text-slate-500 text-[10px] font-medium mt-0.5">{subLabel}</div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Client picker shown when no specific company id is provided (entry point from the sidebar)
const ClientPicker = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [events, setEvents] = useState([]);
    const [filterEvent, setFilterEvent] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [compRes, arRes, eventsRes] = await Promise.all([
                    api.get('/api/companies'),
                    api.get('/api/accounts-receivable').catch(() => ({ data: { data: { rows: [] } } })),
                    api.get('/api/events').catch(() => ({ data: { data: [] } }))
                ]);

                const eventsData = eventsRes.data?.data || eventsRes.data || [];
                eventsData.sort((a, b) => (a.order || 0) - (b.order || 0));
                setEvents(eventsData);
                if (eventsData.length > 0) {
                    setFilterEvent(eventsData[0]._id);
                }

                const compData = compRes.data?.data || compRes.data || [];
                const arRows = arRes.data?.data?.rows || [];

                const clientFinancials = {};
                arRows.forEach(row => {
                    const cid = String(row.companyId);
                    if (!clientFinancials[cid]) {
                        clientFinancials[cid] = { invoiced: 0, received: 0, outstanding: 0, stallNo: row.stallNo, sqMtr: row.sqMtr, eventId: row.eventId };
                    }
                    clientFinancials[cid].invoiced += (row.invValue || 0);
                    clientFinancials[cid].received += (row.received || 0);
                    clientFinancials[cid].outstanding += (row.outstanding || 0);
                    if (row.stallNo && !clientFinancials[cid].stallNo) clientFinancials[cid].stallNo = row.stallNo;
                    if (row.sqMtr && !clientFinancials[cid].sqMtr) clientFinancials[cid].sqMtr = row.sqMtr;
                    if (row.eventId && !clientFinancials[cid].eventId) clientFinancials[cid].eventId = row.eventId;
                });

                let merged = compData.map(c => {
                    let status = c.companyStatus || 'N/A';
                    if (status === 'Closed - Won') status = 'Converted Client';

                    const fin = clientFinancials[String(c._id)] || { invoiced: 0, received: 0, outstanding: 0, stallNo: null, sqMtr: null, eventId: null };
                    fin.receivedPct = fin.invoiced > 0 ? Math.min(100, Math.round((fin.received / fin.invoiced) * 100)) : 0;

                    return {
                        ...c,
                        companyStatus: status,
                        eventId: fin.eventId || c.eventId,
                        financials: fin
                    };
                });

                // Sort: Converted Client at the top
                merged.sort((a, b) => {
                    if (a.companyStatus === 'Converted Client' && b.companyStatus !== 'Converted Client') return -1;
                    if (b.companyStatus === 'Converted Client' && a.companyStatus !== 'Converted Client') return 1;
                    return 0;
                });

                setCompanies(merged);
            } catch {
                toast.error('Failed to load clients data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const statusOptions = [...new Set(companies.map((c) => c.companyStatus).filter(Boolean))];

    const filtered = companies.filter((c) => {
        if (filterEvent !== 'all' && String(c.eventId || '') !== String(filterEvent)) return false;
        if (statusFilter && statusFilter !== 'All Statuses' && c.companyStatus !== statusFilter) return false;
        if (!search) return true;
        const q = search.trim().toLowerCase();
        return (
            (c.companyName || c.name || '').toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q) ||
            (c.city || '').toLowerCase().includes(q)
        );
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, filterEvent]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const stats = {
        total: companies.length,
        converted: companies.filter(c => c.companyStatus === 'Converted Client').length,
        lead: companies.filter(c => c.companyStatus === 'New Lead').length,
        warm: companies.filter(c => c.companyStatus === 'Warm client').length,
        followUp: companies.filter(c => c.companyStatus === 'Follow-Up Call' || c.companyStatus === 'Follow Up').length,
    };

    // Ledger-level financial roll-up across every client — this page is Client Ledger,
    // so its headline stats should be money-in/money-out, not the CRM pipeline funnel.
    const finTotals = companies.reduce((acc, c) => {
        acc.invoiced += c.financials.invoiced || 0;
        acc.received += c.financials.received || 0;
        acc.outstanding += c.financials.outstanding || 0;
        if ((c.financials.outstanding || 0) > 0) acc.clientsWithDues += 1;
        return acc;
    }, { invoiced: 0, received: 0, outstanding: 0, clientsWithDues: 0 });
    const collectionRatePct = finTotals.invoiced > 0 ? Math.round((finTotals.received / finTotals.invoiced) * 100) : 0;

    return (
        <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Overdue Payments</h1>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Accounts Receivable (AR) &gt; <span className="text-blue-600 font-bold">Overdue Payments</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/accounts/payments')}
                        className="px-3 py-1.5 rounded text-xs font-bold border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                        Payment Collection
                    </button>
                    <button
                        onClick={() => navigate('/accounts/receipts')}
                        className="px-3 py-1.5 rounded text-xs font-bold border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                        Payment Receipts
                    </button>
                    <button
                        onClick={() => navigate('/accounts/ar')}
                        className="px-3 py-1.5 rounded text-xs font-bold border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                        Outstanding Payments
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24 text-slate-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading clients...
                </div>
            ) : (
                <>
                    {/* Stat Cards — ledger roll-up: money in, money out, money still owed */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                        <StatCard
                            icon={<Building2 className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-50" accent="bg-blue-500"
                            rawValue={stats.total} displayValue={stats.total}
                            label="Total Clients" subLabel="All registered profiles"
                            bottomLabel="Converted" bottomValue={stats.converted}
                        />
                        <StatCard
                            icon={<FileText className="w-5 h-5 text-indigo-600" />} iconBg="bg-indigo-50" accent="bg-indigo-500"
                            rawValue={finTotals.invoiced} displayValue={`₹ ${formatCurrency(finTotals.invoiced)}`} isCurrency
                            label="Total Invoiced" subLabel="Across all clients"
                            bottomLabel="Clients Billed" bottomValue={companies.filter(c => c.financials.invoiced > 0).length}
                        />
                        <StatCard
                            icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" accent="bg-emerald-500"
                            rawValue={finTotals.received} displayValue={`₹ ${formatCurrency(finTotals.received)}`} isCurrency
                            label="Total Collected" subLabel={`${collectionRatePct}% of invoiced value`}
                            bottomLabel="Collection Rate" bottomValue={`${collectionRatePct}%`}
                        />
                        <StatCard
                            icon={<Wallet className="w-5 h-5 text-rose-600" />} iconBg="bg-rose-50" accent="bg-rose-500"
                            rawValue={finTotals.outstanding} displayValue={`₹ ${formatCurrency(finTotals.outstanding)}`} isCurrency
                            label="Total Outstanding" subLabel="Pending recovery"
                            bottomLabel="Clients w/ Dues" bottomValue={finTotals.clientsWithDues}
                        />
                        <StatCard
                            icon={<AlertTriangle className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50" accent="bg-amber-500"
                            rawValue={finTotals.clientsWithDues} displayValue={finTotals.clientsWithDues}
                            label="Clients with Dues" subLabel="Need follow-up"
                            bottomLabel="Follow-Ups" bottomValue={stats.followUp}
                        />
                    </div>

                    {/* Filters Row */}
                    <div className="bg-white p-3 rounded-t-xl border border-slate-200 border-b-0 shadow-sm flex flex-col md:flex-row items-center gap-2.5">
                        <div className="relative">
                            <select
                                value={filterEvent}
                                onChange={(e) => setFilterEvent(e.target.value)}
                                className="w-full sm:w-auto appearance-none bg-white border border-slate-200 text-slate-700 pl-3 pr-8 py-2 rounded-lg text-[12px] font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer max-w-[150px] truncate"
                            >
                                <option value="all">All Events</option>
                                {events.map(event => <option key={event._id} value={event._id}>{event.name}</option>)}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <div className="relative flex-1 min-w-[200px] w-full">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by client name, email, or city..."
                                className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-[12px] w-full focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-shadow"
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-hide">
                            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-slate-200 rounded-lg px-2.5 py-2 text-[11px] font-bold text-slate-700 focus:outline-none bg-slate-50 min-w-[130px] shrink-0"
                            >
                                <option value="All Statuses">All Statuses</option>
                                {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <span className="text-[10px] font-semibold text-slate-400 shrink-0 whitespace-nowrap pl-1">{filtered.length} of {companies.length} clients</span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-slate-200 rounded-b-xl shadow-sm overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1050px]">
                            <thead>
                                <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 whitespace-nowrap">
                                    <th className="px-3 py-3 text-center w-10">S.No.</th>
                                    <th className="px-3 py-3">Client Profile</th>
                                    <th className="px-3 py-3">Contact & Location</th>
                                    <th className="px-3 py-3 text-center">Status</th>
                                    <th className="px-3 py-3 text-right">Invoiced (₹)</th>
                                    <th className="px-3 py-3 text-right">Collections</th>
                                    <th className="px-3 py-3 text-right">Outstanding (₹)</th>
                                    <th className="px-3 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] whitespace-nowrap">
                                {paginated.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                                            <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                            No clients found.
                                        </td>
                                    </tr>
                                )}
                                {paginated.map((c, idx) => {
                                    const fin = c.financials;
                                    const stallInfo = c.stallNo || fin.stallNo;
                                    const sqMtrInfo = c.stallSize || fin.sqMtr;

                                    const primaryContact = c.contacts?.find(contact => contact.isPrimary) || c.contacts?.[0];
                                    const mobile = primaryContact?.mobile || c.landline || 'N/A';
                                    const email = c.email || primaryContact?.email || 'N/A';
                                    const clientName = c.companyName || c.name || 'Unknown Client';
                                    const initial = clientName.charAt(0).toUpperCase();

                                    return (
                                        <tr key={c._id} className="border-b border-slate-100 even:bg-slate-50/40 hover:bg-blue-50/40 transition-colors">
                                            <td className="px-3 py-3 font-bold text-slate-400 text-center tabular-nums">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-[12px] shrink-0">
                                                        {initial}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-slate-800 text-[12px] truncate max-w-[180px]">{clientName}</div>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <span className="text-slate-400 font-medium text-[10px]">{c.category || 'Standard'}</span>
                                                            {(stallInfo && stallInfo !== 'N/A') && (
                                                                <span className="bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                                                    Stall {stallInfo}{sqMtrInfo && sqMtrInfo !== 'N/A' ? ` · ${sqMtrInfo}` : ''}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="font-semibold text-slate-700 text-[11px] truncate max-w-[150px] flex items-center gap-1.5">
                                                    <Mail className="w-3 h-3 text-slate-400 shrink-0" /> {email}
                                                </div>
                                                <div className="text-slate-500 font-medium mt-1 text-[10px] truncate max-w-[150px] flex items-center gap-1.5">
                                                    <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {mobile}
                                                    {c.city && <span className="ml-0.5 px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-semibold">{c.city}</span>}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <span className={`inline-block px-2 py-1 rounded-full text-[9px] font-bold ${statusBadgeStyle(c.companyStatus)}`}>
                                                    {c.companyStatus || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <div className="font-bold text-slate-700 text-[11px] tabular-nums">{fin.invoiced > 0 ? `₹ ${formatCurrency(fin.invoiced)}` : '—'}</div>
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <div className="font-bold text-emerald-600 text-[11px] mb-1.5 tabular-nums">{fin.received > 0 ? `₹ ${formatCurrency(fin.received)}` : '—'}</div>
                                                {fin.invoiced > 0 && (
                                                    <div className="w-24 h-1.5 bg-emerald-50 rounded-full ml-auto overflow-hidden" title={`${fin.receivedPct}% collected`}>
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${fin.receivedPct === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                            style={{ width: `${fin.receivedPct}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <div className={`font-bold text-[12px] tabular-nums ${fin.outstanding > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                    {fin.outstanding > 0 ? `₹ ${formatCurrency(fin.outstanding)}` : 'Settled'}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-center">
                                                    <button
                                                        className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[10px] font-bold hover:bg-blue-600 hover:text-white hover:shadow-sm transition-all flex items-center gap-1"
                                                        onClick={() => navigate(`/dashboard/account/client-ledger/${c._id}`)}
                                                    >
                                                        View Ledger <ChevronRight className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 border-t border-slate-200 bg-slate-50 rounded-b-xl">
                            <div className="text-[11px] text-slate-500 font-medium">
                                Showing {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-[11px] bg-white"
                                >&lt;</button>

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum = i + 1;
                                    if (totalPages > 5 && currentPage > 3) {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    if (pageNum > totalPages) return null;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-6 h-6 flex items-center justify-center rounded text-[11px] font-bold shadow-sm ${currentPage === pageNum ? 'bg-blue-600 text-white border-blue-600' : 'border border-slate-300 hover:bg-slate-50 bg-white'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                {totalPages > 5 && currentPage < totalPages - 2 && (
                                    <>
                                        <span className="px-1 text-slate-400 font-bold">...</span>
                                        <button
                                            onClick={() => setCurrentPage(totalPages)}
                                            className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 font-bold text-[11px] bg-white shadow-sm"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-[11px] bg-white"
                                >&gt;</button>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                                <span>Rows per page</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="border border-slate-300 rounded px-2 py-1 focus:outline-none font-bold bg-white shadow-sm"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const ClientLedgerView = () => {
    const navigate = useNavigate();
    const { id = 'all' } = useParams();

    const [loading, setLoading] = useState(true);
    const [ledger, setLedger] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('');
    const [downloadingStatement, setDownloadingStatement] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(13);

    useEffect(() => {
        if (id === 'all') return;
        const fetchLedger = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/api/client-ledger/${id}`);
                if (res.data?.success) setLedger(res.data.data);
                else toast.error('Failed to load client ledger');
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to load client ledger');
            } finally {
                setLoading(false);
            }
        };
        fetchLedger();
    }, [id]);

    const downloadStatement = async () => {
        setDownloadingStatement(true);
        try {
            const res = await api.get(`/api/client-ledger/${id}/statement`, { responseType: 'blob' });
            const name = ledger?.companyInfo?.name?.replace(/[^a-z0-9]+/gi, '_') || 'Client';
            saveAs(new Blob([res.data], { type: 'application/pdf' }), `Statement_${name}.pdf`);
        } catch {
            toast.error('Failed to generate statement');
        } finally {
            setDownloadingStatement(false);
        }
    };

    const exportLedger = async () => {
        if (!ledger) return;
        setExporting(true);
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Client Ledger');
            worksheet.columns = [
                { header: 'Date', key: 'date', width: 14 },
                { header: 'Type', key: 'type', width: 14 },
                { header: 'Document No.', key: 'documentNo', width: 20 },
                { header: 'Reference / Narration', key: 'reference', width: 40 },
                { header: 'Debit', key: 'debit', width: 16 },
                { header: 'Credit', key: 'credit', width: 16 },
                { header: 'Balance', key: 'balance', width: 16 },
                { header: 'Status', key: 'status', width: 16 },
            ];
            const headerRow = worksheet.getRow(1);
            headerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
            headerRow.height = 25;

            worksheet.addRow({});
            worksheet.addRow({ date: `Opening Balance: Rs. ${formatCurrency(ledger.openingBalance)}` });

            filteredLedger.forEach((row) => {
                const r = worksheet.addRow({
                    date: formatDate(row.date),
                    type: row.type,
                    documentNo: row.documentNo,
                    reference: row.reference,
                    debit: row.debit || 0,
                    credit: row.credit || 0,
                    balance: row.balance,
                    status: row.status,
                });
                r.getCell('debit').numFmt = '₹#,##0.00';
                r.getCell('credit').numFmt = '₹#,##0.00';
                r.getCell('balance').numFmt = '₹#,##0.00';
            });

            worksheet.addRow({ date: `Closing Balance: Rs. ${formatCurrency(ledger.closingBalance)}` });

            const buffer = await workbook.xlsx.writeBuffer();
            const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long' }).replace(/ /g, '');
            saveAs(new Blob([buffer]), `ledgerExport_${formattedDate}.xlsx`);
        } finally {
            setExporting(false);
        }
    };

    if (id === 'all') return <ClientPicker />;

    if (loading || !ledger) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading client ledger...
                </div>
            </div>
        );
    }

    const { companyInfo, financials, documentSummary, outstandingBreakdown, agingBuckets, currentStatus, lastPayment, nextDueDate, openingBalance, closingBalance } = ledger;

    const now = new Date();
    const fullLedger = ledger.ledger || [];
    const filteredLedger = fullLedger.filter((row) => {
        if (typeFilter !== 'All' && row.type !== typeFilter) return false;
        if (dateFilter) {
            const d = new Date(row.date);
            if (!isNaN(d.getTime())) {
                if (dateFilter === 'this_month' && (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear())) return false;
                if (dateFilter === 'last_3_months') {
                    const threeMonthsAgo = new Date(); threeMonthsAgo.setMonth(now.getMonth() - 3);
                    if (d < threeMonthsAgo) return false;
                }
                if (dateFilter === 'this_year' && d.getFullYear() !== now.getFullYear()) return false;
            }
        }
        if (!searchInput) return true;
        const s = searchInput.toLowerCase();
        return (row.documentNo || '').toLowerCase().includes(s) || (row.reference || '').toLowerCase().includes(s);
    });
    const totalPages = Math.ceil(filteredLedger.length / itemsPerPage);
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
    const indexOfLastItem = indexOfFirstItem + itemsPerPage;
    const paginatedLedger = filteredLedger.slice(indexOfFirstItem, indexOfLastItem);

    const chips = [
        { key: 'All', label: 'All Transactions', count: fullLedger.length, total: null },
        { key: 'Invoice', label: 'Invoices', count: documentSummary.invoices.count, total: documentSummary.invoices.total },
        { key: 'Payment', label: 'Payments', count: documentSummary.payments.count, total: documentSummary.payments.total },
        { key: 'Credit Note', label: 'Credit Notes', count: documentSummary.creditNotes.count, total: documentSummary.creditNotes.total },
        { key: 'Debit Note', label: 'Debit Notes', count: documentSummary.debitNotes.count, total: documentSummary.debitNotes.total },
    ];

    const firstDate = fullLedger[0]?.date;
    const lastDate = fullLedger[fullLedger.length - 1]?.date;

    const gaugeColor = currentStatus.label === 'Fully Paid' ? '#059669' : currentStatus.label === 'Unpaid' ? '#e11d48' : '#f59e0b';
    const gaugeCircumference = 2 * Math.PI * 32;
    const gaugeOffset = gaugeCircumference * (1 - (currentStatus.percentPaid / 100));

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-2 font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Client Ledger</h1>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                        <span>Accounts Receivable (AR)</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-blue-600 font-bold">Client Ledger</span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold shadow-sm">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        {formatDate(firstDate || new Date(now.getFullYear(), now.getMonth(), 1))} - {formatDate(lastDate || now)}
                    </div>
                    <button
                        onClick={exportLedger}
                        disabled={exporting}
                        className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 disabled:opacity-50"
                    >
                        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-slate-500" />} Export Ledger Excel
                    </button>
                    <button
                        onClick={downloadStatement}
                        disabled={downloadingStatement}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                    >
                        {downloadingStatement ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />} Download Statement
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex flex-col lg:flex-row gap-2 mt-2">

                {/* Left Side */}
                <div className="w-full lg:w-[80%] space-y-2">

                    {/* Client Info Card */}
                    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex flex-wrap items-center gap-x-8 gap-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-800 text-[13px]">{companyInfo.name}</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${companyInfo.statusColor === 'green' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {companyInfo.statusLabel}
                                    </span>
                                </div>
                                <div className="text-[10px] font-semibold text-slate-500 mt-0.5">Stall No. {companyInfo.stallNo}</div>
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-700 font-bold text-[8px] uppercase tracking-wider mb-0.5">Contact Person</div>
                            <div className="text-[11px] font-semibold text-slate-700">{companyInfo.contactPerson}</div>
                        </div>
                        <div>
                            <div className="text-slate-700 font-bold text-[8px] uppercase tracking-wider mb-0.5 flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> Mobile</div>
                            <div className="text-[11px] font-semibold text-slate-700">{companyInfo.mobile}</div>
                        </div>
                        <div>
                            <div className="text-slate-700 font-bold text-[8px] uppercase tracking-wider mb-0.5 flex items-center gap-1"><Mail className="w-2.5 h-2.5" /> Email</div>
                            <div className="text-[11px] font-semibold text-slate-700">{companyInfo.email}</div>
                        </div>
                        <div>
                            <div className="text-slate-700 font-bold text-[8px] uppercase tracking-wider mb-0.5 flex items-center gap-1"><BadgeCheck className="w-2.5 h-2.5" /> GST No.</div>
                            <div className="text-[11px] font-semibold text-slate-700">{companyInfo.gstNo}</div>
                        </div>
                        {/* <div>
                            <div className="text-slate-700 font-bold text-[8px] uppercase tracking-wider mb-0.5">PAN</div>
                            <div className="text-[11px] font-semibold text-slate-700">{companyInfo.panNo}</div>
                        </div> */}
                        <div>
                            <div className="text-slate-700 font-bold text-[8px] uppercase tracking-wider mb-0.5 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> State</div>
                            <div className="text-[11px] font-semibold text-slate-700">{companyInfo.state}</div>
                        </div>
                    </div>

                    {/* Stat Cards + Status Gauge */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                        <StatCard
                            icon={<FileText className="w-4 h-4 text-blue-600" />} iconBg="bg-blue-100"
                            rawValue={financials.totalInvoiced} displayValue={`₹ ${formatCurrency(financials.totalInvoiced)}`} isCurrency
                            label="Total Invoiced" subLabel={`${financials.invoiceCount} Invoice${financials.invoiceCount === 1 ? '' : 's'}`}
                            bottomLabel="Invoices" bottomValue={financials.invoiceCount}
                        />
                        <StatCard
                            icon={<TrendingUp className="w-4 h-4 text-emerald-600" />} iconBg="bg-emerald-100"
                            rawValue={financials.totalReceived} displayValue={`₹ ${formatCurrency(financials.totalReceived)}`} isCurrency
                            label="Total Received" subLabel={`${financials.paymentCount} Payment${financials.paymentCount === 1 ? '' : 's'}`}
                            bottomLabel="Payments" bottomValue={financials.paymentCount}
                        />
                        <StatCard
                            icon={<FileMinus className="w-4 h-4 text-purple-600" />} iconBg="bg-purple-100"
                            rawValue={financials.totalAdjustments} displayValue={`₹ ${formatCurrency(financials.totalAdjustments)}`} isCurrency
                            label="Total Adjustments" subLabel={`${documentSummary.creditNotes.count} Credit Notes`}
                            bottomLabel="Credit" bottomValue={`₹ ${formatCurrency(documentSummary.creditNotes.total)}`}
                        />
                        <StatCard
                            icon={<Wallet className="w-4 h-4 text-rose-600" />} iconBg="bg-rose-100"
                            rawValue={financials.outstandingAmount} displayValue={`₹ ${formatCurrency(financials.outstandingAmount)}`} isCurrency
                            label="Outstanding Amount" subLabel={`As on ${formatDate(now)}`}
                            bottomLabel="Status" bottomValue={currentStatus.label}
                        />
                        <StatCard
                            icon={<Clock className="w-4 h-4 text-amber-600" />} iconBg="bg-amber-100"
                            rawValue={financials.overdueAmount} displayValue={`₹ ${formatCurrency(financials.overdueAmount)}`} isCurrency
                            label="Overdue Amount" subLabel={financials.overdueAmount > 0 ? 'Overdue' : 'No Overdue'}
                            bottomLabel="Next Due" bottomValue={nextDueDate ? formatDate(nextDueDate) : '-'}
                        />
                        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm flex flex-col items-center justify-center">
                            <div className="relative w-14 h-14">
                                <svg viewBox="0 0 80 80" className="w-14 h-14 -rotate-90">
                                    <circle cx="40" cy="40" r="32" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                                    <circle cx="40" cy="40" r="32" fill="none" stroke={gaugeColor} strokeWidth="8" strokeDasharray={gaugeCircumference} strokeDashoffset={gaugeOffset} strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-slate-800">{currentStatus.percentPaid}%</div>
                            </div>
                            <div className="text-slate-700 font-bold text-[8px] uppercase tracking-wider mt-1 text-center">{currentStatus.label}</div>
                            <div className="text-slate-400 text-[9px] font-semibold">Payment Received</div>
                        </div>
                    </div>

                    {/* Last payment / next due strip */}
                    <div className="flex flex-wrap items-center gap-6 bg-white rounded-lg shadow-sm border border-slate-200 px-3 py-2">
                        <div>
                            <span className="text-slate-700 font-bold text-[8px] uppercase tracking-wider mr-2">Last Payment</span>
                            <span className="text-[11px] font-bold text-emerald-600">₹ {formatCurrency(lastPayment?.amount_text)}</span>
                            <span className="text-[10px] font-semibold text-slate-500 ml-1">on {formatDate(lastPayment?.payment_date || lastPayment?.added)}</span>
                        </div>
                        <div>
                            <span className="text-slate-700 font-bold text-[8px] uppercase tracking-wider mr-2">Next Due Date</span>
                            <span className="text-[11px] font-bold text-slate-800">{nextDueDate ? formatDate(nextDueDate) : 'No Dues Pending'}</span>
                        </div>
                    </div>

                    {/* Filter Row */}
                    <div className="bg-white p-3 py-2 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-3">
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide w-full">
                            <div className="relative shrink-0">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => { setSearchInput(e.target.value); setCurrentPage(1); }}
                                    placeholder="Search by invoice no, reference, narration..."
                                    className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-[11px] w-[280px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <select
                                value={typeFilter}
                                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                                className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white"
                            >
                                <option value="All">All Transaction Types</option>
                                <option value="Invoice">Invoices</option>
                                <option value="Payment">Payments</option>
                                <option value="Credit Note">Credit Notes</option>
                                <option value="Debit Note">Debit Notes</option>
                            </select>
                            <select
                                value={dateFilter}
                                onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                                className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white"
                            >
                                <option value="">Date Range</option>
                                <option value="this_month">This Month</option>
                                <option value="last_3_months">Last 3 Months</option>
                                <option value="this_year">This Year</option>
                            </select>
                            <button className="flex items-center gap-1 text-blue-600 font-bold text-[11px] px-2 shrink-0">
                                <Filter className="w-3 h-3" /> Filter
                            </button>
                            {(searchInput || typeFilter !== 'All' || dateFilter) && (
                                <button
                                    onClick={() => { setSearchInput(''); setTypeFilter('All'); setDateFilter(''); setCurrentPage(1); }}
                                    className="flex items-center gap-1 text-slate-500 font-bold text-[11px] px-2 shrink-0"
                                >
                                    <X className="w-3 h-3" /> Clear All
                                </button>
                            )}
                        </div>

                        {/* Transaction type chips */}
                        <div className="flex items-center justify-end gap-1.5 flex-nowrap border-t border-slate-100 pt-2">
                            {chips.map((chip) => (
                                <button
                                    key={chip.key}
                                    onClick={() => { setTypeFilter(chip.key); setCurrentPage(1); }}
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-left transition-colors shrink-0 whitespace-nowrap min-w-0 ${typeFilter === chip.key ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:bg-slate-50'}`}
                                >
                                    <span className="text-[10px] font-bold text-slate-700">{chip.label} <span className="text-slate-400 font-medium">{chip.count}</span></span>
                                    {chip.total !== null && <span className="text-[9px] font-semibold text-slate-500">₹ {formatCurrency(chip.total)}</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Ledger Table */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left border-collapse">
                            <thead>
                                <tr className="bg-white text-[8px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 whitespace-nowrap">
                                    <th className="px-2 py-2">Date</th>
                                    <th className="px-2 py-2">Type</th>
                                    <th className="px-2 py-2">Document No.</th>
                                    <th className="px-2 py-2">Reference / Narration</th>
                                    <th className="px-2 py-2 text-right">Debit (₹)</th>
                                    <th className="px-2 py-2 text-right">Credit (₹)</th>
                                    <th className="px-2 py-2 text-right">Balance (₹)</th>
                                    <th className="px-2 py-2 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px]">
                                {paginatedLedger.length === 0 ? (
                                    <tr><td colSpan="8" className="py-6 text-center text-slate-500">No transactions found.</td></tr>
                                ) : paginatedLedger.map((row, idx) => (
                                    <tr key={row.id || idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-2 py-1.5 font-semibold text-slate-700 whitespace-nowrap">{formatDate(row.date)}</td>
                                        <td className="px-2 py-1.5">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${TYPE_STYLES[row.type] || 'bg-slate-50 text-slate-600'}`}>{row.type}</span>
                                        </td>
                                        <td className="px-2 py-1.5 font-semibold text-slate-800 whitespace-nowrap">{row.documentNo}</td>
                                        <td className="px-2 py-1.5 font-medium text-slate-600 whitespace-normal max-w-xs">{row.reference}</td>
                                        <td className="px-2 py-1.5 font-semibold text-rose-500 text-right whitespace-nowrap">{row.debit ? formatCurrency(row.debit) : '-'}</td>
                                        <td className="px-2 py-1.5 font-semibold text-emerald-600 text-right whitespace-nowrap">{row.credit ? formatCurrency(row.credit) : '-'}</td>
                                        <td className="px-2 py-1.5 font-bold text-slate-900 text-right whitespace-nowrap">{formatCurrency(row.balance)}</td>
                                        <td className="px-2 py-1.5 text-center">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[row.status] || 'bg-slate-50 text-slate-600'}`}>{row.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer Totals + Pagination */}
                        <div className="bg-white border-t border-slate-200 p-3">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-slate-500 font-medium">
                                <div>
                                    Showing {filteredLedger.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLedger.length)} of {filteredLedger.length} entries
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >&lt;</button>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum = i + 1;
                                        if (totalPages > 5 && currentPage > 3) {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        if (pageNum > totalPages) return null;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-6 h-6 flex items-center justify-center rounded font-bold ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'border border-slate-300 hover:bg-slate-50'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    {totalPages > 5 && currentPage < totalPages - 2 && (
                                        <>
                                            <span className="px-1">...</span>
                                            <button
                                                onClick={() => setCurrentPage(totalPages)}
                                                className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 font-bold"
                                            >
                                                {totalPages}
                                            </button>
                                        </>
                                    )}

                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >&gt;</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>Rows per page</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                        className="border border-slate-300 rounded px-2 py-1 focus:outline-none"
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-2 pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-500">
                                <span>Opening Balance as on {formatDate(firstDate)}: <span className="font-bold text-slate-800">₹ {formatCurrency(openingBalance)}</span></span>
                                <span>Closing Balance as on {formatDate(lastDate || now)}: <span className="font-bold text-slate-800">₹ {formatCurrency(closingBalance)}</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Sidebar */}
                <div className="w-full lg:w-[20%] flex flex-col gap-2">

                    {/* Outstanding Amount */}
                    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-800 mb-3 tracking-wide">Outstanding Amount</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-semibold text-slate-600">Current Outstanding</span>
                                <span className="font-bold text-slate-800 text-xs">₹ {formatCurrency(outstandingBreakdown.currentOutstanding)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-semibold text-slate-600">Overdue (&gt; 30 Days)</span>
                                <span className="font-bold text-rose-500 text-xs">₹ {formatCurrency(outstandingBreakdown.overdueOver30)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-semibold text-slate-600">Due in Next 30 Days</span>
                                <span className="font-bold text-slate-800 text-xs">₹ {formatCurrency(outstandingBreakdown.dueNext30)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-semibold text-slate-600">Due in Next 60 Days</span>
                                <span className="font-bold text-slate-800 text-xs">₹ {formatCurrency(outstandingBreakdown.dueNext60)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Document Summary */}
                    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-800 mb-3 tracking-wide">Document Summary</h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><FileText className="w-3.5 h-3.5" /></div>
                                <div className="flex-1 flex justify-between items-center">
                                    <span className="text-[10px] font-semibold text-slate-600">Invoices {documentSummary.invoices.count}</span>
                                    <span className="font-bold text-slate-800 text-xs">₹ {formatCurrency(documentSummary.invoices.total)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><TrendingUp className="w-3.5 h-3.5" /></div>
                                <div className="flex-1 flex justify-between items-center">
                                    <span className="text-[10px] font-semibold text-slate-600">Payments {documentSummary.payments.count}</span>
                                    <span className="font-bold text-slate-800 text-xs">₹ {formatCurrency(documentSummary.payments.total)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-purple-50 flex items-center justify-center text-purple-600 shrink-0"><FileMinus className="w-3.5 h-3.5" /></div>
                                <div className="flex-1 flex justify-between items-center">
                                    <span className="text-[10px] font-semibold text-slate-600">Credit Notes {documentSummary.creditNotes.count}</span>
                                    <span className="font-bold text-slate-800 text-xs">₹ {formatCurrency(documentSummary.creditNotes.total)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 shrink-0"><FileMinus className="w-3.5 h-3.5" /></div>
                                <div className="flex-1 flex justify-between items-center">
                                    <span className="text-[10px] font-semibold text-slate-600">Debit Notes {documentSummary.debitNotes.count}</span>
                                    <span className="font-bold text-slate-800 text-xs">₹ {formatCurrency(documentSummary.debitNotes.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Aging Details */}
                    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-800 mb-2 tracking-wide">Aging Details</h2>
                        <div className="flex items-center justify-between gap-2 min-h-[110px]">
                            <div className="w-[90px] h-[90px] shrink-0 -ml-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie data={agingBuckets} cx="50%" cy="50%" innerRadius={25} outerRadius={38} paddingAngle={2} dataKey="amount" stroke="none">
                                            {agingBuckets.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={AGING_COLORS[index % AGING_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ fontSize: '10px', padding: '4px', borderRadius: '4px' }} formatter={(value) => `₹ ${formatCurrency(value)}`} />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-col gap-2 flex-1 min-w-0">
                                {agingBuckets.map((bucket, i) => (
                                    <div key={bucket.label} className="flex items-start gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: AGING_COLORS[i % AGING_COLORS.length] }}></div>
                                        <div className="min-w-0">
                                            <div className="text-[10px] font-semibold text-slate-600">{bucket.label}</div>
                                            <div className="text-[9px] font-bold text-slate-800 break-words">₹ {formatCurrency(bucket.amount)} <span className="font-medium text-slate-500">({bucket.pct}%)</span></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-800 mb-3 tracking-wide">Quick Actions</h2>
                        <div className="space-y-2">
                            {[
                                { icon: <Plus className="w-3.5 h-3.5 text-blue-500" />, title: 'Add Payment', sub: 'Record a new payment', onClick: () => navigate(`/dashboard/account/AddPayment/${id}`) },
                                { icon: <FileText className="w-3.5 h-3.5 text-indigo-500" />, title: 'Create Invoice', sub: 'Generate new invoice', onClick: () => navigate(`/page-create-invoice/${id}`) },
                                { icon: <FileMinus className="w-3.5 h-3.5 text-purple-500" />, title: 'Issue Credit Note', sub: 'Adjust invoice amount', onClick: () => navigate(`/dashboard/account/create-credit-note/${id}`) },
                                { icon: downloadingStatement ? <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" /> : <Send className="w-3.5 h-3.5 text-emerald-500" />, title: 'Send Statement', sub: 'Download PDF statement', onClick: downloadStatement },
                                { icon: <BarChart2 className="w-3.5 h-3.5 text-blue-500" />, title: 'Client Ledger Report', sub: 'View detailed report', onClick: () => navigate('/accounts/summary-report') },
                            ].map((item, i) => (
                                <div key={i} onClick={item.onClick} className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-semibold text-slate-800 leading-tight">{item.title}</div>
                                            <div className="text-[9px] font-medium text-slate-500 leading-tight mt-0.5">{item.sub}</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </div>
                            ))}
                        </div>
                        <div className="mt-1 text-center">
                            <button onClick={() => navigate('/accounts/ar')} className="text-blue-600 hover:text-blue-700 text-[11px] font-bold tracking-wide transition-colors">
                                View All Reports →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientLedgerView;
