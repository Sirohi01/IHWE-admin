import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, ChevronDown, ChevronLeft, ChevronRight,
    Download, FileText, CalendarClock, AlertTriangle, IndianRupee,
    SlidersHorizontal, Calendar, Loader2, CreditCard, FileSearch,
    ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import api from '../../lib/api';

function StatCard({ icon, iconBg, iconColor, label, value, count }) {
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

const formatAmount = (value) => Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const CATEGORY_STYLES = {
    'Overdue': { text: 'text-rose-600', badge: 'bg-rose-50 text-rose-600 border-rose-200', rowBorder: 'border-l-rose-400' },
    'Due Today': { text: 'text-amber-600', badge: 'bg-amber-50 text-amber-600 border-amber-200', rowBorder: 'border-l-amber-400' },
    'Upcoming': { text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-600 border-emerald-200', rowBorder: 'border-l-emerald-400' },
};

const getCategory = (row) => {
    if (row.isOverdue) return 'Overdue';
    if (Number(row.dueDaysDiff) === 0) return 'Due Today';
    return 'Upcoming';
};

const getDaysLabel = (row, category) => {
    if (category === 'Overdue') return `${row.overdueDays || 0} Days`;
    if (category === 'Due Today') return '0 Days';
    return `${row.dueDaysDiff ?? 0} Days`;
};

const TABS = [
    { key: 'all', label: 'All Outstanding' },
    { key: 'Overdue', label: 'Overdue' },
    { key: 'Due Today', label: 'Due Today' },
    { key: 'Upcoming', label: 'Upcoming' },
];

const AccountsReceivableView = () => {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentTermsFilter, setPaymentTermsFilter] = useState('all');
    const [dueDateFrom, setDueDateFrom] = useState('');
    const [dueDateTo, setDueDateTo] = useState('');
    const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

    const [activeTab, setActiveTab] = useState('all');
    const [sortBy, setSortBy] = useState('dueDateAsc');

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
                setError('Failed to load outstanding payments.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Only documents that still have money owed belong on this page.
    const outstandingRows = useMemo(
        () => rows.filter((row) => Number(row.outstanding) > 0).map((row) => ({ ...row, category: getCategory(row) })),
        [rows]
    );

    const paymentTermsOptions = useMemo(() => {
        const values = new Set(outstandingRows.map((row) => row.pymtType).filter(Boolean));
        return Array.from(values);
    }, [outstandingRows]);

    const searchedRows = useMemo(() => {
        const s = search.trim().toLowerCase();
        return outstandingRows.filter((row) => {
            const matchesSearch = !s || [row.invNo, row.client, row.stallNo, row.gstin]
                .some((field) => String(field || '').toLowerCase().includes(s));
            const matchesStatus = statusFilter === 'all' || row.category === statusFilter;
            const matchesPaymentTerms = paymentTermsFilter === 'all' || row.pymtType === paymentTermsFilter;
            const matchesFrom = !dueDateFrom || (row.dueDate && new Date(row.dueDate) >= new Date(dueDateFrom));
            const matchesTo = !dueDateTo || (row.dueDate && new Date(row.dueDate) <= new Date(dueDateTo));
            return matchesSearch && matchesStatus && matchesPaymentTerms && matchesFrom && matchesTo;
        });
    }, [outstandingRows, search, statusFilter, paymentTermsFilter, dueDateFrom, dueDateTo]);

    const tabCounts = useMemo(() => {
        const base = outstandingRows.filter((row) => {
            const s = search.trim().toLowerCase();
            const matchesSearch = !s || [row.invNo, row.client, row.stallNo].some((f) => String(f || '').toLowerCase().includes(s));
            const matchesPaymentTerms = paymentTermsFilter === 'all' || row.pymtType === paymentTermsFilter;
            const matchesFrom = !dueDateFrom || (row.dueDate && new Date(row.dueDate) >= new Date(dueDateFrom));
            const matchesTo = !dueDateTo || (row.dueDate && new Date(row.dueDate) <= new Date(dueDateTo));
            return matchesSearch && matchesPaymentTerms && matchesFrom && matchesTo;
        });
        return {
            all: base.length,
            'Overdue': base.filter((r) => r.category === 'Overdue').length,
            'Due Today': base.filter((r) => r.category === 'Due Today').length,
            'Upcoming': base.filter((r) => r.category === 'Upcoming').length,
        };
    }, [outstandingRows, search, paymentTermsFilter, dueDateFrom, dueDateTo]);

    const tabFilteredRows = useMemo(
        () => searchedRows.filter((row) => activeTab === 'all' || row.category === activeTab),
        [searchedRows, activeTab]
    );

    const sortedRows = useMemo(() => {
        const list = [...tabFilteredRows];
        switch (sortBy) {
            case 'dueDateDesc':
                return list.sort((a, b) => new Date(b.dueDate || 0) - new Date(a.dueDate || 0));
            case 'amountDesc':
                return list.sort((a, b) => Number(b.outstanding || 0) - Number(a.outstanding || 0));
            case 'amountAsc':
                return list.sort((a, b) => Number(a.outstanding || 0) - Number(b.outstanding || 0));
            case 'dueDateAsc':
            default:
                return list.sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
        }
    }, [tabFilteredRows, sortBy]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, paymentTermsFilter, dueDateFrom, dueDateTo, activeTab]);

    const stats = useMemo(() => {
        const build = (list) => ({
            amount: list.reduce((sum, r) => sum + Number(r.outstanding || 0), 0),
            count: list.length,
        });
        const overdue = searchedRows.filter((r) => r.category === 'Overdue');
        const dueToday = searchedRows.filter((r) => r.category === 'Due Today');
        const upcoming = searchedRows.filter((r) => r.category === 'Upcoming');
        return {
            total: build(searchedRows),
            overdue: build(overdue),
            dueToday: build(dueToday),
            upcoming: build(upcoming),
        };
    }, [searchedRows]);

    const totalPages = Math.ceil(sortedRows.length / itemsPerPage);
    const paginatedRows = sortedRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('all');
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
            const worksheet = workbook.addWorksheet('Outstanding Payments');
            worksheet.columns = [
                { header: 'S.No.', key: 'sno', width: 8 },
                { header: 'Invoice No', key: 'invNo', width: 22 },
                { header: 'Client / Company', key: 'client', width: 28 },
                { header: 'Handled By', key: 'handledBy', width: 18 },
                { header: 'Invoice Date', key: 'invDate', width: 16 },
                { header: 'Due Date', key: 'dueDate', width: 16 },
                { header: 'Total Amount', key: 'total', width: 16 },
                { header: 'Outstanding Amount', key: 'outstanding', width: 18 },
                { header: 'Status', key: 'status', width: 14 },
                { header: 'Days', key: 'days', width: 10 },
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
                    status: row.category,
                    days: getDaysLabel(row, row.category),
                });
                excelRow.getCell('total').numFmt = '₹#,##0.00';
                excelRow.getCell('outstanding').numFmt = '₹#,##0.00';
                excelRow.height = 20;
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long' }).replace(/ /g, '');
            saveAs(new Blob([buffer]), `outstandingPaymentsExport_${formattedDate}.xlsx`);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Outstanding Payments</h1>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Track all outstanding invoices and follow up for payments.
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
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading outstanding payments...
                </div>
            ) : (
                <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        <StatCard
                            icon={<FileText className="w-5 h-5" />} iconBg="bg-violet-100" iconColor="text-violet-600"
                            label="Total Outstanding (₹)" value={formatAmount(stats.total.amount)} count={`${stats.total.count} Invoices`}
                        />
                        <StatCard
                            icon={<CalendarClock className="w-5 h-5" />} iconBg="bg-rose-100" iconColor="text-rose-600"
                            label="Overdue (₹)" value={formatAmount(stats.overdue.amount)} count={`${stats.overdue.count} Invoices`}
                        />
                        <StatCard
                            icon={<AlertTriangle className="w-5 h-5" />} iconBg="bg-amber-100" iconColor="text-amber-600"
                            label="Due Today (₹)" value={formatAmount(stats.dueToday.amount)} count={`${stats.dueToday.count} Invoices`}
                        />
                        <StatCard
                            icon={<IndianRupee className="w-5 h-5" />} iconBg="bg-emerald-100" iconColor="text-emerald-600"
                            label="Upcoming (₹)" value={formatAmount(stats.upcoming.amount)} count={`${stats.upcoming.count} Invoices`}
                        />
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-sm mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                            <div className="md:col-span-4">
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
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Status</label>
                                <div className="relative">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="appearance-none w-full bg-white border border-slate-200 text-slate-700 pl-3 pr-7 py-1.5 rounded-md text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="Overdue">Overdue</option>
                                        <option value="Due Today">Due Today</option>
                                        <option value="Upcoming">Upcoming</option>
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                            <div className="md:col-span-1">
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
                            <div className="md:col-span-3 relative">
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
                            <div className="md:col-span-2 flex items-center justify-end gap-3">
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
                                {TABS.map((tab) => (
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
                            <table className="w-full min-w-[1200px] text-left border-collapse">
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
                                        <th className="px-3 py-2.5">Due Date</th>
                                        <th className="px-3 py-2.5 text-right">Total Amount (₹)</th>
                                        <th className="px-3 py-2.5 text-right">Outstanding Amount (₹)</th>
                                        <th className="px-3 py-2.5 text-center">Status</th>
                                        <th className="px-3 py-2.5 text-center">Days Overdue</th>
                                        <th className="px-3 py-2.5 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[11px] whitespace-nowrap">
                                    {paginatedRows.length === 0 && (
                                        <tr>
                                            <td colSpan={11} className="py-8 text-center text-slate-400">No outstanding payments found.</td>
                                        </tr>
                                    )}
                                    {paginatedRows.map((row) => {
                                        const style = CATEGORY_STYLES[row.category];
                                        return (
                                            <tr key={row.id} className={`border-b border-slate-100 hover:bg-slate-50/60 transition-colors`}>
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
                                                <td className="px-3 py-2.5 text-center">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border ${style.badge}`}>
                                                        {row.category}
                                                    </span>
                                                </td>
                                                <td className={`px-3 py-2.5 text-center font-bold ${style.text}`}>{getDaysLabel(row, row.category)}</td>
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
                                                            className="w-6 h-6 flex items-center justify-center border border-slate-200 text-slate-500 rounded hover:bg-slate-50 transition-colors"
                                                            title="Invoice Details"
                                                        >
                                                            <FileSearch className="w-3.5 h-3.5" />
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
                                >
                                    <ChevronsLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-[11px]"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </button>

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
                                    className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-[11px]"
                                >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronsRight className="w-3.5 h-3.5" />
                                </button>
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

export default AccountsReceivableView;
