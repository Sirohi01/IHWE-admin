import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight, FileText, CheckCircle2, AlertCircle, Clock,
    Calendar, Eye, MoreVertical, Target,
    ClipboardList, Filter, Search, Plus, RefreshCw, BarChart2, Loader2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import api from '../../lib/api';
import toast from 'react-hot-toast';

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
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(ease * numTarget);
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [started, target, duration]);

    return { ref, count };
}

function StatCard({ icon, iconBg, rawValue, displayValue, label, subLabel, bottomLabel, bottomValue, isCurrency }) {
    const { ref, count } = useCountUp(rawValue);
    return (
        <div ref={ref} className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm flex flex-col justify-between h-full">
            <div className="flex items-start gap-2.5">
                <div className={`w-8 h-8 ${iconBg} rounded-full flex items-center justify-center shrink-0 mt-0.5`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-slate-700 font-bold text-[8px] uppercase tracking-wider leading-tight whitespace-nowrap truncate">{label}</h3>
                    <div className="text-lg font-semibold text-slate-800 leading-none mt-1">
                        {isCurrency ? displayValue : Math.round(count).toLocaleString('en-IN')}
                    </div>
                    <div className="text-slate-400 text-[9px] font-semibold mt-0.5">{subLabel}</div>
                </div>
            </div>
            <div className=" pt-2 border-t border-slate-100 flex justify-between items-center text-[9px]">
                <span className="text-slate-500 font-medium">{bottomLabel}</span>
                <span className="text-slate-800 font-bold">{bottomValue}</span>
            </div>
        </div>
    );
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount || 0);
};

const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const dueDateNote = (row) => {
    if (!row.dueDate) return null;
    if (row.status === 'Paid') return null;
    const due = new Date(row.dueDate);
    if (isNaN(due.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)} Days`, color: 'text-rose-500' };
    if (diffDays === 0) return { text: 'Due Today', color: 'text-orange-500' };
    return { text: `Due in ${diffDays} Days`, color: 'text-orange-500' };
};

const STATUS_STYLES = {
    'Paid': { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    'Partially Paid': { badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    'Unpaid': { badge: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' },
    'Overdue': { badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
};

const PAYMENT_TYPE_STYLES = {
    'Full Payment': 'border-emerald-200 text-emerald-600 bg-emerald-50',
    'Partial Payment': 'border-orange-200 text-orange-600 bg-orange-50',
    'Pending': 'border-blue-200 text-blue-600 bg-blue-50',
};

const InvoicesView = () => {
    const navigate = useNavigate();

    const [rows, setRows] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');

    // Inline filters state
    const [inlineDateRange, setInlineDateRange] = useState('');
    const [inlineInvoiceStatus, setInlineInvoiceStatus] = useState('');
    const [inlinePaymentType, setInlinePaymentType] = useState('');
    const [inlineHall, setInlineHall] = useState('');
    const [inlineSalesPerson, setInlineSalesPerson] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                setLoading(true);
                const res = await api.get('/api/accounts-receivable');
                setRows(res.data?.data?.rows || []);
                setStats(res.data?.data?.stats || null);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch invoices', err);
                setError('Failed to load invoices.');
                toast.error('Failed to load invoices.');
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    const hallOptions = useMemo(() => [...new Set(rows.map((r) => r.hallNo).filter(Boolean))].sort(), [rows]);
    const salesPersonOptions = useMemo(() => [...new Set(rows.map((r) => r.addedBy).filter(Boolean))].sort(), [rows]);

    // Pagination & Filtering Logic
    const filteredInvoices = rows.filter((row) => {
        if (statusFilter !== 'All' && row.status !== statusFilter) return false;
        if (inlineInvoiceStatus && row.status !== inlineInvoiceStatus) return false;
        if (inlinePaymentType && row.paymentType !== inlinePaymentType) return false;
        if (inlineHall && row.hallNo !== inlineHall) return false;
        if (inlineSalesPerson && row.addedBy !== inlineSalesPerson) return false;

        if (inlineDateRange && row.invDate) {
            const invDate = new Date(row.invDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (inlineDateRange === 'Today') {
                if (invDate.toDateString() !== today.toDateString()) return false;
            } else if (inlineDateRange === 'Last 7 Days') {
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                if (invDate < sevenDaysAgo || invDate > today) return false;
            } else if (inlineDateRange === 'This Month') {
                if (invDate.getMonth() !== today.getMonth() || invDate.getFullYear() !== today.getFullYear()) return false;
            }
        }

        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            (row.invNo || '').toLowerCase().includes(q) ||
            (row.client || '').toLowerCase().includes(q) ||
            (row.stallNo || '').toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const paginatedInvoices = filteredInvoices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Chart Data — derived from real per-invoice status counts (Unpaid bucket folds in Overdue)
    const chartData = useMemo(() => {
        if (!stats || !stats.totalInvoices) return [];
        const unpaidTotal = (stats.unpaidCount || 0) + (stats.overdueCount || 0);
        const total = stats.totalInvoices;
        const pct = (n) => Math.round((n / total) * 10000) / 100;
        return [
            { name: 'Paid', value: pct(stats.fullyPaidCount), count: stats.fullyPaidCount, color: '#10b981' },
            { name: 'Partial', value: pct(stats.partiallyPaidCount), count: stats.partiallyPaidCount, color: '#f59e0b' },
            { name: 'Unpaid', value: pct(unpaidTotal), count: unpaidTotal, color: '#ef4444' },
        ];
    }, [stats]);

    const perStatusValue = useMemo(() => {
        const sums = { Paid: 0, 'Partially Paid': 0, Unpaid: 0, Overdue: 0 };
        rows.forEach((r) => { sums[r.status] = (sums[r.status] || 0) + r.invValue; });
        return sums;
    }, [rows]);

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-2 font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Invoices</h1>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                        <span>Accounts Receivable (AR)</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-blue-600 font-bold">Invoices</span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setFiltersOpen(!filtersOpen)}
                            className="flex items-center gap-2 bg-white border border-slate-300 text-blue-600 px-3 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50"
                        >
                            <Filter className="w-4 h-4 text-blue-600" />
                            Filters
                        </button>

                        {filtersOpen && (
                            <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-50 w-56">
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="All">All Statuses</option>
                                            <option value="Paid">Paid</option>
                                            <option value="Partially Paid">Partially Paid</option>
                                            <option value="Unpaid">Unpaid</option>
                                            <option value="Overdue">Overdue</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => setFiltersOpen(false)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 rounded transition-colors mt-2"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => navigate('/page-create-invoice')}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Invoice
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-2 px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold rounded-md">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-24 text-slate-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading invoices...
                </div>
            ) : (
            <>
            {/* Main Content Grid */}
            <div className="flex flex-col lg:flex-row gap-2">

                {/* Left Side: Table Area */}
                <div className="w-full lg:w-[80%] space-y-2">

                    {/* Top Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-2">
                        <StatCard
                            icon={<FileText className="w-4 h-4 text-blue-600" />} iconBg="bg-blue-100"
                            rawValue={stats?.totalInvoices || 0} displayValue={String(stats?.totalInvoices || 0)}
                            label="Total Invoices" subLabel="Active"
                            bottomLabel="Total Value" bottomValue={formatCurrency(stats?.totalInvoiceValue)}
                        />
                        <StatCard
                            icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />} iconBg="bg-emerald-100"
                            rawValue={stats?.fullyPaidCount || 0} displayValue={String(stats?.fullyPaidCount || 0)}
                            label="Fully Paid Invoices" subLabel={stats?.totalInvoices ? `${Math.round((stats.fullyPaidCount / stats.totalInvoices) * 100)}%` : '0%'}
                            bottomLabel="Total Value" bottomValue={formatCurrency(perStatusValue.Paid)}
                        />
                        <StatCard
                            icon={<PieChart className="w-4 h-4 text-amber-600" />} iconBg="bg-amber-100"
                            rawValue={stats?.partiallyPaidCount || 0} displayValue={String(stats?.partiallyPaidCount || 0)}
                            label="Partially Paid Invoices" subLabel={stats?.totalInvoices ? `${Math.round((stats.partiallyPaidCount / stats.totalInvoices) * 100)}%` : '0%'}
                            bottomLabel="Total Value" bottomValue={formatCurrency(perStatusValue['Partially Paid'])}
                        />
                        <StatCard
                            icon={<AlertCircle className="w-4 h-4 text-rose-600" />} iconBg="bg-rose-100"
                            rawValue={stats?.unpaidCount || 0} displayValue={String(stats?.unpaidCount || 0)}
                            label="Unpaid Invoices" subLabel={stats?.totalInvoices ? `${Math.round((stats.unpaidCount / stats.totalInvoices) * 100)}%` : '0%'}
                            bottomLabel="Total Value" bottomValue={formatCurrency(perStatusValue.Unpaid)}
                        />
                        <StatCard
                            icon={<Clock className="w-4 h-4 text-orange-600" />} iconBg="bg-orange-100"
                            rawValue={stats?.overdueCount || 0} displayValue={String(stats?.overdueCount || 0)}
                            label="Overdue Invoices" subLabel={stats?.totalInvoices ? `${Math.round((stats.overdueCount / stats.totalInvoices) * 100)}%` : '0%'}
                            bottomLabel="Total Value" bottomValue={formatCurrency(perStatusValue.Overdue)}
                        />
                        <StatCard
                            icon={<BarChart2 className="w-4 h-4 text-purple-600" />} iconBg="bg-purple-100"
                            rawValue={stats?.avgInvoiceValue || 0} displayValue={formatCurrency(stats?.avgInvoiceValue)} isCurrency={true}
                            label="Avg Invoice Value" subLabel="Across active invoices"
                            bottomLabel="Total Invoices" bottomValue={String(stats?.totalInvoices || 0)}
                        />
                    </div>

                    {/* Filter Row */}
                    <div className="bg-white p-3 py-1 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-3">
                        {/* Line 1: All Filters */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide w-full">
                            <div className="relative shrink-0">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search by invoice no., client name, stall no..."
                                    className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-[11px] w-[260px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <select
                                value={inlineDateRange}
                                onChange={(e) => setInlineDateRange(e.target.value)}
                                className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white"
                            >
                                <option value="">Date Range</option>
                                <option value="Today">Today</option>
                                <option value="Last 7 Days">Last 7 Days</option>
                                <option value="This Month">This Month</option>
                            </select>
                            <select
                                value={inlineInvoiceStatus}
                                onChange={(e) => setInlineInvoiceStatus(e.target.value)}
                                className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white"
                            >
                                <option value="">Invoice Status</option>
                                <option value="Paid">Paid</option>
                                <option value="Partially Paid">Partially Paid</option>
                                <option value="Unpaid">Unpaid</option>
                                <option value="Overdue">Overdue</option>
                            </select>
                            <select
                                value={inlinePaymentType}
                                onChange={(e) => setInlinePaymentType(e.target.value)}
                                className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white"
                            >
                                <option value="">Payment Type</option>
                                <option value="Full Payment">Full Payment</option>
                                <option value="Partial Payment">Partial Payment</option>
                                <option value="Pending">Pending</option>
                            </select>
                            <select
                                value={inlineHall}
                                onChange={(e) => setInlineHall(e.target.value)}
                                className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white"
                            >
                                <option value="">Hall</option>
                                {hallOptions.map((h) => <option key={h} value={h}>{`Hall ${h}`}</option>)}
                            </select>
                            <select
                                value={inlineSalesPerson}
                                onChange={(e) => setInlineSalesPerson(e.target.value)}
                                className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white"
                            >
                                <option value="">Added By</option>
                                {salesPersonOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <button
                                onClick={() => {
                                    setInlineDateRange('');
                                    setInlineInvoiceStatus('');
                                    setInlinePaymentType('');
                                    setInlineHall('');
                                    setInlineSalesPerson('');
                                    setSearchQuery('');
                                    setStatusFilter('All');
                                }}
                                className="flex items-center gap-1 text-blue-600 font-bold text-[11px] px-2 shrink-0"
                            >
                                <RefreshCw className="w-3 h-3" /> Reset
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
                        <table className="w-full min-w-[1200px] text-left border-collapse">
                            <thead>
                                <tr className="bg-white text-[8px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 whitespace-nowrap">
                                    <th className="px-2 py-1 text-center">S.No.</th>
                                    <th className="px-2 py-1">Invoice Details</th>
                                    <th className="px-2 py-1">Client & Stall</th>
                                    <th className="px-2 py-1 text-center">Invoice Value</th>
                                    <th className="px-2 py-1 text-center">Invoice Date</th>
                                    <th className="px-2 py-1 text-center">Due Date</th>
                                    <th className="px-2 py-1 text-center">Payment Status</th>
                                    <th className="px-2 py-1 text-center">Received</th>
                                    <th className="px-2 py-1 text-center">Outstanding</th>
                                    <th className="px-2 py-1 text-center">TDS Deducted</th>
                                    <th className="px-2 py-1 text-center">Credit Adjustments</th>
                                    <th className="px-2 py-1 text-center">Payment Type</th>
                                    <th className="px-2 py-1 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] whitespace-nowrap">
                                {paginatedInvoices.length === 0 && (
                                    <tr><td colSpan={13} className="py-8 text-center text-slate-400">No invoices found.</td></tr>
                                )}
                                {paginatedInvoices.map((row, idx) => {
                                    const dueNote = dueDateNote(row);
                                    const statusStyle = STATUS_STYLES[row.status] || { badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
                                    return (
                                    <tr key={row.id} className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${dueNote?.text?.startsWith('Overdue') ? 'bg-rose-50/50' : dueNote?.text?.startsWith('Due') ? 'bg-orange-50/50' : ''}`}>
                                        <td className="px-2 py-1 font-bold text-slate-700 text-center">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                        <td className="px-2 py-1">
                                            <div className="font-bold text-slate-800 text-[11px]">{row.invNo}</div>
                                            {row.poNo && <div className="text-slate-500 mt-0.5 text-[10px] font-medium">PO No: {row.poNo}</div>}
                                            <div
                                                className="text-blue-600 font-bold mt-1 text-[10px] cursor-pointer"
                                                onClick={() => navigate(`/payments/invoiceDetails/${row.id}`)}
                                            >
                                                View Details
                                            </div>
                                        </td>
                                        <td className="px-2 py-1">
                                            <div className="font-bold text-blue-600 text-[11px]">{row.client}</div>
                                            <div className="text-slate-500 mt-0.5 text-[10px] font-medium">Stall No: {row.stallNo}</div>
                                            {row.hallNo && <div className="text-slate-500 text-[10px] font-medium">Hall: {row.hallNo}</div>}
                                        </td>
                                        <td className="px-2 py-1 font-bold text-slate-800 text-[11px] text-center">
                                            {formatCurrency(row.invValue)}
                                        </td>
                                        <td className="px-2 py-1 font-bold text-slate-700 text-center">{formatDate(row.invDate)}</td>
                                        <td className="px-2 py-1 text-center">
                                            <div className="font-bold text-slate-700">{formatDate(row.dueDate)}</div>
                                            {dueNote && <div className={`${dueNote.color} font-bold text-[10px] mt-0.5`}>{dueNote.text}</div>}
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusStyle.badge}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></div>
                                                {row.status}
                                            </span>
                                            <div className="text-slate-500 font-bold mt-1">{row.receivedPct}%</div>
                                        </td>
                                        <td className="px-2 py-1 font-bold text-emerald-600 text-[11px] text-center">
                                            {formatCurrency(row.received)}
                                        </td>
                                        <td className="px-2 py-1 font-bold text-rose-600 text-[11px] text-center">
                                            {formatCurrency(row.outstanding)}
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                            <div className="font-bold text-slate-800 text-[11px]">{formatCurrency(row.tds)}</div>
                                            {row.invValue > 0 && <div className="text-slate-500 font-bold mt-0.5 text-[10px]">{Math.round((row.tds / row.invValue) * 10000) / 100}%</div>}
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                            <div className="font-bold text-slate-800 text-[11px]">{row.credited > 0 ? formatCurrency(row.credited) : '-'}</div>
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                            <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold border ${PAYMENT_TYPE_STYLES[row.paymentType] || 'border-slate-200 text-slate-600 bg-slate-50'}`}>
                                                {row.paymentType}
                                            </span>
                                        </td>
                                        <td className="px-2 py-1">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button onClick={() => navigate(`/payments/invoiceDetails/${row.id}`)} className="w-6 h-6 flex items-center justify-center text-blue-600 bg-blue-50/50 border border-blue-100 rounded hover:bg-blue-100 transition-colors" title="View invoice"><Eye className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => navigate(`/dashboard/account/client-ledger/${row.companyId}`)} className="w-6 h-6 flex items-center justify-center text-blue-600 bg-blue-50/50 border border-blue-100 rounded hover:bg-blue-100 transition-colors" title="View client ledger"><MoreVertical className="w-3 h-3" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );})}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-3 flex justify-between items-center text-[11px] text-slate-500 px-1">
                                <div>
                                    Showing {filteredInvoices.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} entries
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
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="border border-slate-300 rounded px-2 py-1 focus:outline-none"
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                {/* Right Side: Sidebar Area */}
                <div className="w-full lg:w-[20%] flex flex-col gap-2">

                    {/* Collection Summary — real totals only, no fabricated "today/this week" breakdowns
                        or reminder/follow-up counters since no such tracking exists in this system yet */}
                    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-800 mb-3 tracking-wide">Collection Summary</h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><ClipboardList className="w-3.5 h-3.5" /></div>
                                <div>
                                    <div className="text-[10px] font-semibold text-slate-600">Total Collections</div>
                                    <div className="font-bold text-slate-800 text-xs">{formatCurrency(stats?.totalCollections)}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-rose-50 flex items-center justify-center text-rose-600 shrink-0"><Target className="w-3.5 h-3.5" /></div>
                                <div>
                                    <div className="text-[10px] font-semibold text-slate-600">Total Outstanding</div>
                                    <div className="font-bold text-slate-800 text-xs">{formatCurrency(stats?.totalOutstanding)}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-orange-50 flex items-center justify-center text-orange-600 shrink-0"><AlertCircle className="w-3.5 h-3.5" /></div>
                                <div>
                                    <div className="text-[10px] font-semibold text-slate-600">Overdue Amount</div>
                                    <div className="font-bold text-slate-800 text-xs">{formatCurrency(stats?.overdueAmount)}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0"><Calendar className="w-3.5 h-3.5" /></div>
                                <div>
                                    <div className="text-[10px] font-semibold text-slate-600">Total TDS Deducted</div>
                                    <div className="font-bold text-slate-800 text-xs">{formatCurrency(stats?.tdsDeducted)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-800 mb-3 tracking-wide">Quick Actions</h2>
                        <div className="space-y-2">
                            {[
                                { icon: <FileText className="w-3.5 h-3.5 text-blue-500" />, title: 'Create Invoice', sub: 'Generate new invoice', path: '/page-create-invoice' },
                                { icon: <Plus className="w-3.5 h-3.5 text-emerald-500" />, title: 'Add Payment', sub: 'Record a new payment', path: '/accounts/payments' },
                                { icon: <FileText className="w-3.5 h-3.5 text-purple-500" />, title: 'Create Credit Note', sub: 'Adjust invoice amount', path: '/accounts/credit-notes' },
                            ].map((item, i) => (
                                <div key={i} onClick={() => navigate(item.path)} className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group">
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
                    </div>

                    {/* Invoice Status Overview Chart */}
                    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-800 mb-3 tracking-wide">Invoice Status Overview</h2>

                        {chartData.length === 0 ? (
                            <div className="text-center text-[11px] text-slate-400 py-8">No invoices yet.</div>
                        ) : (
                        <div className="flex items-center justify-between h-[140px]">
                            <div className="w-[100px] h-full shrink-0 -ml-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={30}
                                            outerRadius={45}
                                            paddingAngle={2}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-col gap-3 shrink-0">
                                {chartData.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-[10px] font-semibold text-slate-600">{item.name}</span>
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-800 text-right">
                                            {item.count} <span className="font-medium text-slate-500 ml-0.5">({item.value}%)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Bottom Totals Outside Table (Full Width) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2 px-3 flex items-center justify-between overflow-x-auto mt-2">
                <div className="flex items-center flex-1 divide-x divide-slate-200 min-w-max">
                    <div className="pr-3 text-center">
                        <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Invoice Value</div>
                        <div className="font-bold text-slate-800 mt-0.5 text-[11px]">{formatCurrency(stats?.totalInvoiceValue)}</div>
                    </div>
                    <div className="px-3 text-center">
                        <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Collections</div>
                        <div className="font-bold text-slate-800 mt-0.5 text-[11px]">{formatCurrency(stats?.totalCollections)}</div>
                    </div>
                    <div className="px-3 text-center">
                        <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Outstanding</div>
                        <div className="font-bold text-slate-800 mt-0.5 text-[11px]">{formatCurrency(stats?.totalOutstanding)}</div>
                    </div>
                    <div className="px-3 text-center">
                        <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Overdue</div>
                        <div className="font-bold text-red-500 mt-0.5 text-[11px]">{formatCurrency(stats?.overdueAmount)}</div>
                    </div>
                    <div className="px-3 text-center">
                        <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total TDS Deducted</div>
                        <div className="font-bold text-slate-800 mt-0.5 text-[11px]">{formatCurrency(stats?.tdsDeducted)}</div>
                    </div>
                    <div className="px-3 text-center">
                        <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Credit Notes</div>
                        <div className="font-bold text-slate-800 mt-0.5 text-[11px]">{formatCurrency(stats?.totalCreditNotes)}</div>
                    </div>
                    <div className="pl-3 text-center">
                        <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Net Amount Received</div>
                        <div className="font-bold text-slate-800 mt-0.5 text-[11px]">{formatCurrency(stats?.netAmountReceived)} <span className="text-[9px] text-slate-500 font-medium ml-1">(After TDS)</span></div>
                    </div>
                </div>
            </div>
            </>
            )}
        </div>
    );
};

export default InvoicesView;
