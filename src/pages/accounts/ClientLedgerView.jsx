import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronRight, Calendar, Download, FileSpreadsheet, Search, Filter, Building2,
    Phone, Mail, BadgeCheck, MapPin, Wallet, TrendingUp, AlertTriangle, Clock,
    Plus, FileText, FileMinus, Send, BarChart2, ArrowRightCircle, Loader2, X, ChevronDown,
    CreditCard, FileSearch, FileWarning, CalendarClock, SlidersHorizontal, ArrowUpDown,
    ChevronLeft, ChevronsLeft, ChevronsRight
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

const formatAmount = (value) => Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const OVERDUE_BUCKET_STYLES = {
    '1-15 Days': { text: 'text-amber-600', badge: 'bg-amber-50 text-amber-600 border-amber-200', label: 'Overdue 1-15' },
    '16-30 Days': { text: 'text-orange-600', badge: 'bg-orange-50 text-orange-600 border-orange-200', label: 'Overdue 16-30' },
    '30+ Days': { text: 'text-rose-600', badge: 'bg-rose-50 text-rose-600 border-rose-200', label: 'Overdue 30+' },
};

const getOverdueBucket = (overdueDays) => {
    const days = Number(overdueDays) || 0;
    if (days <= 15) return '1-15 Days';
    if (days <= 30) return '16-30 Days';
    return '30+ Days';
};

const OVERDUE_TABS = [
    { key: 'all', label: 'All Overdue' },
    { key: '1-15 Days', label: '1-15 Days' },
    { key: '16-30 Days', label: '16-30 Days' },
    { key: '30+ Days', label: '30+ Days' },
];

function OverdueStatCard({ icon, iconBg, iconColor, label, value, count }) {
    return (
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
                {icon}
            </div>
            <div className="min-w-0">
                <div className="text-slate-700 font-bold text-[11px] whitespace-nowrap">{label}</div>
                <div className={`text-xl font-black mt-0.5 truncate ${iconColor}`}>{value}</div>
                <div className="text-slate-400 text-[10px] font-semibold mt-0.5">{count}</div>
            </div>
        </div>
    );
}

// Overdue Payments list shown when no specific company id is provided (entry point from the sidebar)
const ClientPicker = () => {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);

    const [search, setSearch] = useState('');
    const [handledByFilter, setHandledByFilter] = useState('all');
    const [paymentTermsFilter, setPaymentTermsFilter] = useState('all');
    const [dueDateFrom, setDueDateFrom] = useState('');
    const [dueDateTo, setDueDateTo] = useState('');
    const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

    const [activeTab, setActiveTab] = useState('all');
    const [sortBy, setSortBy] = useState('overdueDesc');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await api.get('/api/accounts-receivable');
                setRows(res.data?.data?.rows || []);
                setError(null);
            } catch (err) {
                console.error('Error fetching accounts receivable data:', err);
                setError('Failed to load overdue payments.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const overdueRows = useMemo(
        () => rows.filter((row) => row.isOverdue && Number(row.outstanding) > 0).map((row) => ({ ...row, bucket: getOverdueBucket(row.overdueDays) })),
        [rows]
    );

    const handledByOptions = useMemo(() => Array.from(new Set(overdueRows.map((row) => row.handledBy).filter(Boolean))), [overdueRows]);
    const paymentTermsOptions = useMemo(() => Array.from(new Set(overdueRows.map((row) => row.pymtType).filter(Boolean))), [overdueRows]);

    const searchedRows = useMemo(() => {
        const s = search.trim().toLowerCase();
        return overdueRows.filter((row) => {
            const matchesSearch = !s || [row.invNo, row.client, row.stallNo].some((field) => String(field || '').toLowerCase().includes(s));
            const matchesHandledBy = handledByFilter === 'all' || row.handledBy === handledByFilter;
            const matchesPaymentTerms = paymentTermsFilter === 'all' || row.pymtType === paymentTermsFilter;
            const matchesFrom = !dueDateFrom || (row.dueDate && new Date(row.dueDate) >= new Date(dueDateFrom));
            const matchesTo = !dueDateTo || (row.dueDate && new Date(row.dueDate) <= new Date(dueDateTo));
            return matchesSearch && matchesHandledBy && matchesPaymentTerms && matchesFrom && matchesTo;
        });
    }, [overdueRows, search, handledByFilter, paymentTermsFilter, dueDateFrom, dueDateTo]);

    const tabCounts = useMemo(() => ({
        all: searchedRows.length,
        '1-15 Days': searchedRows.filter((r) => r.bucket === '1-15 Days').length,
        '16-30 Days': searchedRows.filter((r) => r.bucket === '16-30 Days').length,
        '30+ Days': searchedRows.filter((r) => r.bucket === '30+ Days').length,
    }), [searchedRows]);

    const tabFilteredRows = useMemo(
        () => searchedRows.filter((row) => activeTab === 'all' || row.bucket === activeTab),
        [searchedRows, activeTab]
    );

    const sortedRows = useMemo(() => {
        const list = [...tabFilteredRows];
        switch (sortBy) {
            case 'overdueAsc':
                return list.sort((a, b) => (a.overdueDays || 0) - (b.overdueDays || 0));
            case 'dueDateAsc':
                return list.sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
            case 'dueDateDesc':
                return list.sort((a, b) => new Date(b.dueDate || 0) - new Date(a.dueDate || 0));
            case 'amountDesc':
                return list.sort((a, b) => Number(b.outstanding || 0) - Number(a.outstanding || 0));
            case 'amountAsc':
                return list.sort((a, b) => Number(a.outstanding || 0) - Number(b.outstanding || 0));
            case 'overdueDesc':
            default:
                return list.sort((a, b) => (b.overdueDays || 0) - (a.overdueDays || 0));
        }
    }, [tabFilteredRows, sortBy]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, handledByFilter, paymentTermsFilter, dueDateFrom, dueDateTo, activeTab]);

    const stats = useMemo(() => {
        const build = (list) => ({
            amount: list.reduce((sum, r) => sum + Number(r.outstanding || 0), 0),
            count: list.length,
        });
        return {
            total: build(searchedRows),
            b1to15: build(searchedRows.filter((r) => r.bucket === '1-15 Days')),
            b16to30: build(searchedRows.filter((r) => r.bucket === '16-30 Days')),
            b30plus: build(searchedRows.filter((r) => r.bucket === '30+ Days')),
        };
    }, [searchedRows]);

    const totalPages = Math.ceil(sortedRows.length / itemsPerPage);
    const paginatedRows = sortedRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const clearFilters = () => {
        setSearch('');
        setHandledByFilter('all');
        setPaymentTermsFilter('all');
        setDueDateFrom('');
        setDueDateTo('');
        setActiveTab('all');
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedRows.length) setSelectedIds([]);
        else setSelectedIds(paginatedRows.map((r) => r.id));
    };

    const toggleSelectRow = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Overdue Payments');
            worksheet.columns = [
                { header: 'S.No.', key: 'sno', width: 8 },
                { header: 'Invoice No', key: 'invNo', width: 22 },
                { header: 'Client / Company', key: 'client', width: 28 },
                { header: 'Handled By', key: 'handledBy', width: 18 },
                { header: 'Invoice Date', key: 'invDate', width: 16 },
                { header: 'Due Date', key: 'dueDate', width: 16 },
                { header: 'Total Amount', key: 'total', width: 16 },
                { header: 'Outstanding Amount', key: 'outstanding', width: 18 },
                { header: 'Days Overdue', key: 'days', width: 14 },
                { header: 'Status', key: 'status', width: 16 },
            ];
            const headerRow = worksheet.getRow(1);
            headerRow.font = { name: 'Arial', family: 4, size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
            headerRow.height = 25;

            sortedRows.forEach((row, index) => {
                const excelRow = worksheet.addRow({
                    sno: index + 1,
                    invNo: row.invNo,
                    client: row.client,
                    handledBy: row.handledBy,
                    invDate: formatDate(row.invDate),
                    dueDate: formatDate(row.dueDate),
                    total: Number(row.invValue) || 0,
                    outstanding: Number(row.outstanding) || 0,
                    days: `${row.overdueDays || 0} Days`,
                    status: OVERDUE_BUCKET_STYLES[row.bucket]?.label || row.bucket,
                });
                excelRow.getCell('total').numFmt = '₹#,##0.00';
                excelRow.getCell('outstanding').numFmt = '₹#,##0.00';
                excelRow.height = 20;
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long' }).replace(/ /g, '');
            saveAs(new Blob([buffer]), `overduePaymentsExport_${formattedDate}.xlsx`);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Overdue Payments</h1>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        List of invoices with payments that are overdue.
                    </div>
                </div>
                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 rounded-md text-[11px] font-bold border border-slate-300 hover:bg-slate-50 transition-colors shrink-0 whitespace-nowrap disabled:opacity-60"
                >
                    {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} Export
                </button>
            </div>

            {error && (
                <div className="mb-3 px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold rounded-md">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-24 text-slate-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading overdue payments...
                </div>
            ) : (
                <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        <OverdueStatCard
                            icon={<FileWarning className="w-5 h-5" />} iconBg="bg-rose-100" iconColor="text-rose-600"
                            label="Total Overdue (₹)" value={formatAmount(stats.total.amount)} count={`${stats.total.count} Invoices`}
                        />
                        <OverdueStatCard
                            icon={<CalendarClock className="w-5 h-5" />} iconBg="bg-amber-100" iconColor="text-amber-600"
                            label="Overdue 1-15 Days (₹)" value={formatAmount(stats.b1to15.amount)} count={`${stats.b1to15.count} Invoices`}
                        />
                        <OverdueStatCard
                            icon={<CalendarClock className="w-5 h-5" />} iconBg="bg-orange-100" iconColor="text-orange-600"
                            label="Overdue 16-30 Days (₹)" value={formatAmount(stats.b16to30.amount)} count={`${stats.b16to30.count} Invoices`}
                        />
                        <OverdueStatCard
                            icon={<CalendarClock className="w-5 h-5" />} iconBg="bg-rose-100" iconColor="text-rose-600"
                            label="Overdue 30+ Days (₹)" value={formatAmount(stats.b30plus.amount)} count={`${stats.b30plus.count} Invoices`}
                        />
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-sm mb-4">
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="flex-1 min-w-[160px]">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Search</label>
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search by Invoice No., Client, GSTIN..."
                                        className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-md text-[11px] w-full focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                                    />
                                </div>
                            </div>
                            <div className="w-[110px] shrink-0">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Handled By</label>
                                <div className="relative">
                                    <select
                                        value={handledByFilter}
                                        onChange={(e) => setHandledByFilter(e.target.value)}
                                        className="appearance-none w-full bg-white border border-slate-200 text-slate-700 pl-2 pr-6 py-1.5 rounded-md text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                    >
                                        <option value="all">All Users</option>
                                        {handledByOptions.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                            <div className="w-[130px] shrink-0">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Payment Terms</label>
                                <div className="relative">
                                    <select
                                        value={paymentTermsFilter}
                                        onChange={(e) => setPaymentTermsFilter(e.target.value)}
                                        className="appearance-none w-full bg-white border border-slate-200 text-slate-700 pl-2 pr-6 py-1.5 rounded-md text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                    >
                                        <option value="all">All Payment Terms</option>
                                        {paymentTermsOptions.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                            <div className="w-[110px] shrink-0">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Overdue Days</label>
                                <div className="relative">
                                    <select
                                        value={activeTab}
                                        onChange={(e) => setActiveTab(e.target.value)}
                                        className="appearance-none w-full bg-white border border-slate-200 text-slate-700 pl-2 pr-6 py-1.5 rounded-md text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                    >
                                        <option value="all">All</option>
                                        <option value="1-15 Days">1-15 Days</option>
                                        <option value="16-30 Days">16-30 Days</option>
                                        <option value="30+ Days">30+ Days</option>
                                    </select>
                                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                            <div className="w-[170px] shrink-0 relative">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Due Date</label>
                                <button
                                    type="button"
                                    onClick={() => setIsDateRangeOpen((v) => !v)}
                                    className="w-full flex items-center justify-between gap-2 border border-slate-200 rounded-md px-3 py-1.5 text-[11px] font-bold text-slate-600 bg-white hover:bg-slate-50"
                                >
                                    <span className="truncate">
                                        {dueDateFrom || dueDateTo
                                            ? `${dueDateFrom ? formatDate(dueDateFrom) : '...'} - ${dueDateTo ? formatDate(dueDateTo) : '...'}`
                                            : 'Select Date Range'}
                                    </span>
                                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                </button>
                                {isDateRangeOpen && (
                                    <div className="absolute z-20 mt-1 right-0 bg-white border border-slate-200 rounded-md shadow-lg p-3 w-64">
                                        <div className="mb-2">
                                            <label className="block text-[9px] font-bold text-slate-500 mb-1">From</label>
                                            <input type="date" value={dueDateFrom} onChange={(e) => setDueDateFrom(e.target.value)} className="w-full border border-slate-200 rounded-md px-2 py-1 text-[11px]" />
                                        </div>
                                        <div className="mb-2">
                                            <label className="block text-[9px] font-bold text-slate-500 mb-1">To</label>
                                            <input type="date" value={dueDateTo} onChange={(e) => setDueDateTo(e.target.value)} className="w-full border border-slate-200 rounded-md px-2 py-1 text-[11px]" />
                                        </div>
                                        <button
                                            onClick={() => setIsDateRangeOpen(false)}
                                            className="w-full mt-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-[11px] font-bold hover:bg-blue-700"
                                        >
                                            Done
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <button onClick={clearFilters} className="text-blue-600 text-[11px] font-bold whitespace-nowrap hover:underline">
                                    Clear Filters
                                </button>
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-[11px] font-bold hover:bg-blue-700 transition-colors whitespace-nowrap"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs + Sort + Table (unified card so there's no visible seam) */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 px-4 pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-5 overflow-x-auto scrollbar-hide">
                                {OVERDUE_TABS.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`pb-2.5 text-[12px] font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.key ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'
                                            }`}
                                    >
                                        {tab.label} <span className={activeTab === tab.key ? 'text-blue-500' : 'text-slate-400'}>({tabCounts[tab.key] ?? 0})</span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 pb-2 shrink-0">
                                <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap">Sort by</span>
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="appearance-none border border-slate-200 rounded-md pl-2.5 pr-7 py-1.5 text-[11px] font-bold text-slate-700 focus:outline-none bg-white cursor-pointer"
                                    >
                                        <option value="overdueDesc">Days Overdue (High to Low)</option>
                                        <option value="overdueAsc">Days Overdue (Low to High)</option>
                                        <option value="dueDateAsc">Due Date (Oldest)</option>
                                        <option value="dueDateDesc">Due Date (Newest)</option>
                                        <option value="amountDesc">Amount (High to Low)</option>
                                        <option value="amountAsc">Amount (Low to High)</option>
                                    </select>
                                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                                <button className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 transition-colors">
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Table — capped to ~15 rows tall, scrolls internally beyond that */}
                        <div className="overflow-auto max-h-[640px]">
                            <table className="w-full min-w-[1250px] text-left border-collapse">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-white text-[9px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-200 shadow-sm whitespace-nowrap">
                                        <th className="px-3 py-2.5 w-10">
                                            <input
                                                type="checkbox"
                                                checked={paginatedRows.length > 0 && selectedIds.length === paginatedRows.length}
                                                onChange={toggleSelectAll}
                                                className="rounded border-slate-300"
                                            />
                                        </th>
                                        <th className="px-3 py-2.5">Invoice Details</th>
                                        <th className="px-3 py-2.5">Client / Company</th>
                                        <th className="px-3 py-2.5">Handled By</th>
                                        <th className="px-3 py-2.5">Invoice Date</th>
                                        <th className="px-3 py-2.5">
                                            <button onClick={() => setSortBy(sortBy === 'dueDateAsc' ? 'dueDateDesc' : 'dueDateAsc')} className="flex items-center gap-1 hover:text-blue-600">
                                                Due Date <ArrowUpDown className="w-2.5 h-2.5" />
                                            </button>
                                        </th>
                                        <th className="px-3 py-2.5 text-right">Total Amount (₹)</th>
                                        <th className="px-3 py-2.5 text-right">Outstanding Amount (₹)</th>
                                        <th className="px-3 py-2.5 text-center">
                                            <button onClick={() => setSortBy(sortBy === 'overdueDesc' ? 'overdueAsc' : 'overdueDesc')} className="flex items-center gap-1 hover:text-blue-600 mx-auto">
                                                Days Overdue <ArrowUpDown className="w-2.5 h-2.5" />
                                            </button>
                                        </th>
                                        <th className="px-3 py-2.5 text-center">Status</th>
                                        <th className="px-3 py-2.5 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[11px] whitespace-nowrap">
                                    {paginatedRows.length === 0 && (
                                        <tr>
                                            <td colSpan={11} className="py-8 text-center text-slate-400">No overdue payments found.</td>
                                        </tr>
                                    )}
                                    {paginatedRows.map((row) => {
                                        const style = OVERDUE_BUCKET_STYLES[row.bucket];
                                        return (
                                            <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                                                <td className="px-3 py-2.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(row.id)}
                                                        onChange={() => toggleSelectRow(row.id)}
                                                        className="rounded border-slate-300"
                                                    />
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <button
                                                        onClick={() => navigate(row.docType === 'Invoice' ? `/payments/invoiceDetails/${row.id}` : `/payments/estimateDetails/${row.id}`)}
                                                        className="font-bold text-blue-600 hover:underline text-[11px]"
                                                    >
                                                        {row.invNo}
                                                    </button>
                                                </td>
                                                <td className="px-3 py-2.5 font-semibold text-slate-700">{row.client}</td>
                                                <td className="px-3 py-2.5 text-slate-600">{row.handledBy || '-'}</td>
                                                <td className="px-3 py-2.5 text-slate-600">{formatDate(row.invDate)}</td>
                                                <td className={`px-3 py-2.5 font-bold ${style.text}`}>{formatDate(row.dueDate)}</td>
                                                <td className="px-3 py-2.5 text-right font-semibold text-slate-700">{formatAmount(row.invValue)}</td>
                                                <td className="px-3 py-2.5 text-right font-black text-slate-900">{formatAmount(row.outstanding)}</td>
                                                <td className={`px-3 py-2.5 text-center font-bold ${style.text}`}>{row.overdueDays || 0} Days</td>
                                                <td className="px-3 py-2.5 text-center">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border ${style.badge}`}>
                                                        {style.label}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            onClick={() => navigate(`/dashboard/account/AddPayment/${row.companyId}`)}
                                                            className="flex items-center gap-1 px-2 py-1 border border-blue-200 bg-blue-50 text-blue-600 rounded text-[10px] font-bold hover:bg-blue-100 transition-colors"
                                                        >
                                                            <CreditCard className="w-3 h-3" /> Book PMT
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(row.docType === 'Invoice' ? `/payments/invoiceDetails/${row.id}` : `/payments/estimateDetails/${row.id}`)}
                                                            className="flex items-center gap-1 px-2 py-1 border border-slate-200 text-slate-600 rounded text-[10px] font-bold hover:bg-slate-50 transition-colors"
                                                        >
                                                            <FileSearch className="w-3 h-3" /> Invoice Details
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 border-t border-slate-200">
                            <div className="text-[11px] text-slate-500">
                                Showing {sortedRows.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedRows.length)} of {sortedRows.length} entries
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                ><ChevronsLeft className="w-3.5 h-3.5" /></button>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                ><ChevronLeft className="w-3.5 h-3.5" /></button>

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
                                            className={`w-6 h-6 flex items-center justify-center rounded text-[11px] font-bold ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'border border-slate-300 hover:bg-slate-50'}`}
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
                                            className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 font-bold text-[11px]"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                ><ChevronRight className="w-3.5 h-3.5" /></button>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                ><ChevronsRight className="w-3.5 h-3.5" /></button>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-600">
                                <span>Show</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="border border-slate-300 rounded px-2 py-1 focus:outline-none"
                                >
                                    <option value={15}>15</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span>per page</span>
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
