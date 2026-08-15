import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight, FileText, CheckCircle2, AlertCircle, Clock,
    Calendar, Eye, BookOpen, Target,
    ClipboardList, Search, RefreshCw, BarChart2, Loader2
} from 'lucide-react';
import { PieChart } from 'recharts';
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
                    <h3 className="text-slate-700 font-bold text-[10px] uppercase tracking-wider leading-tight whitespace-nowrap truncate">{label}</h3>
                    <div className="text-2xl font-semibold text-slate-800 leading-none mt-1">
                        {isCurrency ? displayValue : Math.round(count).toLocaleString('en-IN')}
                    </div>
                    <div className="text-slate-400 text-[11px] font-semibold mt-0.5">{subLabel}</div>
                </div>
            </div>
            {(bottomLabel || bottomValue) && (
                <div className=" pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 font-medium">{bottomLabel}</span>
                    <span className="text-slate-800 font-bold">{bottomValue}</span>
                </div>
            )}
        </div>
    );
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount || 0);
};

const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
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
    'Unpaid': { badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
    'Overdue': { badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

const PAYMENT_TYPE_STYLES = {
    'Full Payment': 'border-emerald-200 text-emerald-600 bg-emerald-50',
    'Partial Payment': 'border-orange-200 text-orange-600 bg-orange-50',
    'Pending': 'border-blue-200 text-blue-600 bg-blue-50',
};

const ProformaInvoicesView = () => {
    const navigate = useNavigate();

    const [rows, setRows] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Inline filters state
    const [inlineDateRange, setInlineDateRange] = useState('');
    const [inlineInvoiceStatus, setInlineInvoiceStatus] = useState('');
    const [inlinePaymentType, setInlinePaymentType] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                setLoading(true);
                // includeAllProformas keeps PIs that have already been converted into a Tax
                // Invoice, or cancelled, in this list too — instead of dropping them silently.
                const arRes = await api.get('/api/accounts-receivable', {
                    params: { docType: 'Proforma Invoice', includeAllProformas: 'true' },
                });

                setRows(arRes.data?.data?.rows || []);
                setStats(arRes.data?.data?.stats || null);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch proforma invoices', err);
                setError('Failed to load proforma invoices.');
                toast.error('Failed to load proforma invoices.');
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    // Pagination & Filtering Logic
    const filteredInvoices = rows.filter((row) => {
        if (statusFilter !== 'All' && row.status !== statusFilter) return false;
        if (inlineInvoiceStatus && row.status !== inlineInvoiceStatus) return false;
        if (inlinePaymentType && row.paymentType !== inlinePaymentType) return false;

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
    }).sort((a, b) => {
        // Sort by the numeric PI suffix (e.g. ".../PI/009") ascending, not by date.
        const numA = parseInt(String(a.invNo || '').match(/(\d+)\s*$/)?.[1] || '0', 10);
        const numB = parseInt(String(b.invNo || '').match(/(\d+)\s*$/)?.[1] || '0', 10);
        return numA - numB;
    });

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const paginatedInvoices = filteredInvoices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const perStatusValue = useMemo(() => {
        const sums = { Paid: 0, 'Partially Paid': 0, Unpaid: 0, Overdue: 0 };
        rows.forEach((r) => {
            // Fully/Partially Paid are payment-progress buckets (paymentType), valued by what's
            // actually been received; Unpaid/Overdue are due-date buckets (status), valued by
            // the PI's full face value since little/nothing has come in yet.
            if (r.paymentType === 'Full Payment') sums.Paid += r.received;
            else if (r.paymentType === 'Partial Payment') sums['Partially Paid'] += r.received;
            if (r.status === 'Unpaid' || r.status === 'Overdue') sums[r.status] += r.invValue;
        });
        return sums;
    }, [rows]);

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-2 font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Proforma Invoice</h1>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                        <span>Accounts Management</span>
                        <ChevronRight className="w-3 h-3" />
                        <span>Billing & Invoices</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-blue-600 font-bold">Proforma Invoice</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/accounts/invoices')}
                        className="px-3 py-1.5 rounded text-xs font-bold border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                        Tax Invoices
                    </button>
                    <button
                        onClick={() => navigate('/accounts/credit-notes')}
                        className="px-3 py-1.5 rounded text-xs font-bold border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                        Credit Notes
                    </button>
                    <button
                        onClick={() => navigate('/account-debit-notes')}
                        className="px-3 py-1.5 rounded text-xs font-bold border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                        Debit Notes
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
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading proforma invoices...
                </div>
            ) : (
                <>
                    {/* Main Content Grid */}
                    <div className="flex flex-col gap-2">

                        {/* Table Area */}
                        <div className="w-full space-y-2">


                            {/* Top Stat Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-2">
                                <StatCard
                                    icon={<FileText className="w-4 h-4 text-blue-600" />} iconBg="bg-blue-100"
                                    rawValue={stats?.totalInvoiceValue || 0} displayValue={formatCurrency(stats?.totalInvoiceValue)} isCurrency={true}
                                    label="Total PI Value" subLabel={`No of PI: ${stats?.totalInvoices || 0}`}
                                />
                                <StatCard
                                    icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />} iconBg="bg-emerald-100"
                                    rawValue={perStatusValue.Paid || 0} displayValue={formatCurrency(perStatusValue.Paid)} isCurrency={true}
                                    label="Total Fully Paid Value" subLabel={`No of PI: ${stats?.fullyPaidCount || 0}`}
                                />
                                <StatCard
                                    icon={<PieChart className="w-4 h-4 text-amber-600" />} iconBg="bg-amber-100"
                                    rawValue={perStatusValue['Partially Paid'] || 0} displayValue={formatCurrency(perStatusValue['Partially Paid'])} isCurrency={true}
                                    label="Total Partially Paid Value" subLabel={`No of PI: ${stats?.partiallyPaidCount || 0}`}
                                />
                                <StatCard
                                    icon={<AlertCircle className="w-4 h-4 text-rose-600" />} iconBg="bg-rose-100"
                                    rawValue={perStatusValue.Unpaid || 0} displayValue={formatCurrency(perStatusValue.Unpaid)} isCurrency={true}
                                    label="Total Unpaid Value" subLabel={`No of PI: ${stats?.unpaidCount || 0}`}
                                />
                                <StatCard
                                    icon={<Clock className="w-4 h-4 text-orange-600" />} iconBg="bg-orange-100"
                                    rawValue={perStatusValue.Overdue || 0} displayValue={formatCurrency(perStatusValue.Overdue)} isCurrency={true}
                                    label="Total Overdue Value" subLabel={`No of PI: ${stats?.overdueCount || 0}`}
                                />
                                <StatCard
                                    icon={<BarChart2 className="w-4 h-4 text-purple-600" />} iconBg="bg-purple-100"
                                    rawValue={stats?.avgInvoiceValue || 0} displayValue={formatCurrency(stats?.avgInvoiceValue)} isCurrency={true}
                                    label="Avg PI Value" subLabel={`No of PI: ${stats?.totalInvoices || 0}`}
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
                                            placeholder="Search by PI no., client name, stall no..."
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
                                        <option value="">PI Status</option>
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
                                    <button
                                        onClick={() => {
                                            setInlineDateRange('');
                                            setInlineInvoiceStatus('');
                                            setInlinePaymentType('');
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
                            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-auto max-h-[460px]">
                                <table className="w-full min-w-[1200px] text-left border-collapse">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-white text-[8px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 whitespace-nowrap">
                                            <th className="px-2 py-1 text-center">S.No.</th>
                                            <th className="px-2 py-1">Proforma No.</th>
                                            <th className="px-2 py-1">Client & Stall</th>
                                            <th className="px-2 py-1 text-center">PI Value</th>
                                            <th className="px-2 py-1 text-center">PI Date</th>
                                            <th className="px-2 py-1 text-center">Due Date</th>
                                            <th className="px-2 py-1 text-center">Payment Status</th>
                                            <th className="px-2 py-1 text-center">Received</th>
                                            <th className="px-2 py-1 text-center">Outstanding</th>
                                            <th className="px-2 py-1 text-center">TDS Deducted</th>
                                            <th className="px-2 py-1 text-center">Credit Note</th>
                                            <th className="px-2 py-1 text-center">Payment Type</th>
                                            <th className="px-2 py-1 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[11px] whitespace-nowrap">
                                        {paginatedInvoices.length === 0 && (
                                            <tr className="border-b border-slate-100"><td colSpan={13} className="py-8 text-center text-slate-400 h-[33px]">No proforma invoices found.</td></tr>
                                        )}
                                        {paginatedInvoices.map((row, idx) => {
                                            const dueNote = dueDateNote(row);
                                            const statusStyle = STATUS_STYLES[row.status] || { badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
                                            return (
                                                <tr key={row.id} className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${dueNote?.text?.startsWith('Overdue') ? 'bg-rose-50/50' : dueNote?.text?.startsWith('Due') ? 'bg-orange-50/50' : ''}`}>
                                                    <td className="px-2 py-1 font-bold text-slate-700 text-center">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                                    <td className="px-2 py-1">
                                                        <div className="font-bold text-slate-800 text-[11px]">{row.invNo}</div>
                                                    </td>
                                                    <td className="px-2 py-1">
                                                        <div
                                                            onClick={() => navigate(`/dashboard/account/${row.companyId}`)}
                                                            className="font-bold text-blue-600 text-[11px] cursor-pointer hover:underline"
                                                            title="View client overview"
                                                        >
                                                            {row.client}
                                                        </div>
                                                        {row.hallNo && <div className="text-slate-500 text-[10px] font-medium">Hall: {row.hallNo}</div>}
                                                    </td>
                                                    <td className="px-2 py-1 font-bold text-slate-800 text-[11px] text-center">
                                                        {formatCurrency(row.invValue)}
                                                    </td>
                                                    <td className="px-2 py-1 font-bold text-slate-700 text-center">{formatDate(row.invDate)}</td>
                                                    <td className="px-2 py-1 text-center">
                                                        <div className="font-bold text-slate-700">{formatDate(row.dueDate)}</div>
                                                    </td>
                                                    <td className="px-2 py-1 text-center">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusStyle.badge}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></div>
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 py-1 font-bold text-emerald-600 text-[11px] text-center">
                                                        {formatCurrency(row.received)}
                                                    </td>
                                                    <td className="px-2 py-1 font-bold text-rose-600 text-[11px] text-center">
                                                        {formatCurrency(row.outstanding)}
                                                    </td>
                                                    <td className="px-2 py-1 text-center">
                                                        <div className="font-bold text-slate-800 text-[11px]">{formatCurrency(row.tds)}</div>
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
                                                            <button onClick={() => navigate(`/payments/performanceInvoiceDetails/${row.id}`)} className="w-6 h-6 flex items-center justify-center text-blue-600 bg-blue-50/50 border border-blue-100 rounded hover:bg-blue-100 transition-colors" title="View proforma invoice"><Eye className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => navigate(`/dashboard/account/client-ledger/${row.companyId}`)} className="w-6 h-6 flex items-center justify-center text-blue-600 bg-blue-50/50 border border-blue-100 rounded hover:bg-blue-100 transition-colors" title="View client ledger"><BookOpen className="w-3.5 h-3.5" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {paginatedInvoices.length < itemsPerPage &&
                                            Array.from({ length: itemsPerPage - (paginatedInvoices.length === 0 ? 1 : paginatedInvoices.length) }).map((_, idx) => (
                                                <tr key={`filler-${idx}`} className="border-b border-slate-100">
                                                    <td colSpan={13} className="px-2 py-1 h-[33px]">&nbsp;</td>
                                                </tr>
                                            ))
                                        }
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
                                        <option value={12}>12</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>

                            {/* Horizontal Financial Summary Bar */}
                            <div className="bg-white border border-slate-200 rounded-xl shadow-sm mt-2 px-6 py-4 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total PI Value</span>
                                    <span className="text-sm font-black text-slate-800">{formatCurrency(stats?.totalInvoiceValue || 0)}</span>
                                </div>
                                <div className="w-px h-10 bg-slate-200 mx-2"></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Collections</span>
                                    <span className="text-sm font-black text-slate-800">{formatCurrency(stats?.totalCollections || 0)}</span>
                                </div>
                                <div className="w-px h-10 bg-slate-200 mx-2"></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Outstanding</span>
                                    <span className="text-sm font-black text-slate-800">{formatCurrency(stats?.totalOutstanding || 0)}</span>
                                </div>
                                <div className="w-px h-10 bg-slate-200 mx-2"></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Overdue</span>
                                    <span className="text-sm font-black text-rose-600">{formatCurrency(stats?.overdueAmount || 0)}</span>
                                </div>
                                <div className="w-px h-10 bg-slate-200 mx-2"></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total TDS Deducted</span>
                                    <span className="text-sm font-black text-slate-800">{formatCurrency(stats?.tdsDeducted || 0)}</span>
                                </div>
                                <div className="w-px h-10 bg-slate-200 mx-2"></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Credit Notes</span>
                                    <span className="text-sm font-black text-slate-800">{formatCurrency(stats?.totalCreditNotes || 0)}</span>
                                </div>
                                <div className="w-px h-10 bg-slate-200 mx-2"></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Net Amount Received</span>
                                    <span className="text-sm font-black text-slate-800">{formatCurrency((stats?.totalCollections || 0) - (stats?.tdsDeducted || 0))} <span className="text-[10px] font-medium text-slate-500 normal-case">(After TDS)</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProformaInvoicesView;
