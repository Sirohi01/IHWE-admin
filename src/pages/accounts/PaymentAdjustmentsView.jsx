import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Search, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    Plus, FileText, CheckCircle2, Undo2, Percent, SlidersHorizontal, Calendar,
    Loader2, X, Eye, Info,
} from 'lucide-react';
import AsyncSelect from 'react-select/async';
import toast from 'react-hot-toast';
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

const TYPE_STYLES = {
    against_invoice: { badge: 'bg-violet-50 text-violet-700 border-violet-200', amountText: 'text-emerald-600' },
    against_performa_invoice: { badge: 'bg-blue-50 text-blue-700 border-blue-200', amountText: 'text-emerald-600' },
    against_estimate: { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', amountText: 'text-emerald-600' },
    against_credit_note: { badge: 'bg-orange-50 text-orange-700 border-orange-200', amountText: 'text-emerald-600' },
    against_debit_note: { badge: 'bg-amber-50 text-amber-700 border-amber-200', amountText: 'text-emerald-600' },
    write_off: { badge: 'bg-rose-50 text-rose-700 border-rose-200', amountText: 'text-rose-600' },
};

const TABS = [
    { key: 'all', label: 'All Adjustments', activeClass: 'text-blue-600 border-blue-600', inactiveClass: 'text-slate-500 border-transparent hover:text-slate-700' },
    { key: 'against_invoice', label: 'Against Invoices', activeClass: 'text-emerald-600 border-emerald-600', inactiveClass: 'text-emerald-600/80 border-transparent hover:text-emerald-700' },
    { key: 'against_credit_note', label: 'Against Credit Notes', activeClass: 'text-orange-600 border-orange-600', inactiveClass: 'text-orange-600/80 border-transparent hover:text-orange-700' },
    { key: 'write_off', label: 'Write-offs', activeClass: 'text-rose-600 border-rose-600', inactiveClass: 'text-rose-600/80 border-transparent hover:text-rose-700' },
];

const ADJUSTMENT_TYPE_OPTIONS = [
    { value: 'against_invoice', label: 'Against Invoice', help: 'Adjust amount against an outstanding invoice.', refLabel: 'Invoice' },
    { value: 'against_performa_invoice', label: 'Against Performa Invoice', help: 'Adjust amount against a performa invoice.', refLabel: 'Performa Invoice' },
    { value: 'against_estimate', label: 'Against Estimate', help: 'Adjust amount against an estimate.', refLabel: 'Estimate' },
    { value: 'against_credit_note', label: 'Against Credit Note', help: 'Adjust amount against an existing credit note.', refLabel: 'Credit Note' },
    { value: 'against_debit_note', label: 'Against Debit Note', help: 'Adjust amount against an existing debit note.', refLabel: 'Debit Note' },
];

const emptyForm = {
    adjustmentType: 'against_invoice',
    referenceId: '',
    amount: '',
    reason: '',
    adjustment_date: new Date().toISOString().slice(0, 10),
};

const PaymentAdjustmentsView = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [adjustAgainstFilter, setAdjustAgainstFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

    const [activeTab, setActiveTab] = useState('all');
    const [sortBy, setSortBy] = useState('dateDesc');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [selectedReference, setSelectedReference] = useState(null);
    const [referenceKey, setReferenceKey] = useState(0); // bumped on type change to force AsyncSelect to refetch its default options
    const [submitting, setSubmitting] = useState(false);
    const [detailRow, setDetailRow] = useState(null);
    const searchDebounceRef = useRef(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/payment-adjustments');
            setRows(res.data?.data?.rows || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching payment adjustments:', err);
            setError('Failed to load payment adjustments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openNewAdjustmentModal = () => {
        setForm(emptyForm);
        setSelectedReference(null);
        setReferenceKey((k) => k + 1);
        setIsModalOpen(true);
    };

    const selectedTypeMeta = ADJUSTMENT_TYPE_OPTIONS.find((o) => o.value === form.adjustmentType) || ADJUSTMENT_TYPE_OPTIONS[0];

    // Debounced so react-select/async's AsyncSelect doesn't fire an API call on every
    // keystroke — waits for a pause in typing before hitting the server-side search.
    const loadReferenceOptions = (inputValue) => {
        return new Promise((resolve) => {
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
            searchDebounceRef.current = setTimeout(async () => {
                try {
                    const res = await api.get('/api/payment-adjustments/search-reference', {
                        params: { type: form.adjustmentType, q: inputValue },
                    });
                    resolve(res.data?.data || []);
                } catch (err) {
                    console.error('Error searching reference documents:', err);
                    resolve([]);
                }
            }, 300);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedReference) { toast.error(`Please select a ${selectedTypeMeta.refLabel.toLowerCase()}`); return; }
        if (!form.amount || Number(form.amount) <= 0) { toast.error('Amount must be greater than 0'); return; }
        if (!form.reason.trim()) { toast.error('Reason is required'); return; }

        setSubmitting(true);
        try {
            await api.post('/api/payment-adjustments', { ...form, referenceId: selectedReference.value });
            toast.success('Adjustment recorded');
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create adjustment');
        } finally {
            setSubmitting(false);
        }
    };

    const searchedRows = useMemo(() => {
        const s = search.trim().toLowerCase();
        return rows.filter((row) => {
            const matchesSearch = !s || [row.adjustmentNo, row.referenceNo, row.client].some((f) => String(f || '').toLowerCase().includes(s));
            const matchesType = typeFilter === 'all' || row.adjustmentType === typeFilter;
            const matchesAgainst = adjustAgainstFilter === 'all' || row.adjustAgainst === adjustAgainstFilter;
            const matchesFrom = !dateFrom || (row.adjustmentDate && new Date(row.adjustmentDate) >= new Date(dateFrom));
            const matchesTo = !dateTo || (row.adjustmentDate && new Date(row.adjustmentDate) <= new Date(dateTo));
            return matchesSearch && matchesType && matchesAgainst && matchesFrom && matchesTo;
        });
    }, [rows, search, typeFilter, adjustAgainstFilter, dateFrom, dateTo]);

    const tabCounts = useMemo(() => ({
        all: searchedRows.length,
        against_invoice: searchedRows.filter((r) => r.adjustmentType === 'against_invoice').length,
        against_credit_note: searchedRows.filter((r) => r.adjustmentType === 'against_credit_note').length,
        write_off: searchedRows.filter((r) => r.adjustmentType === 'write_off').length,
    }), [searchedRows]);

    const tabFilteredRows = useMemo(
        () => searchedRows.filter((row) => activeTab === 'all' || row.adjustmentType === activeTab),
        [searchedRows, activeTab]
    );

    const sortedRows = useMemo(() => {
        const list = [...tabFilteredRows];
        switch (sortBy) {
            case 'dateAsc':
                return list.sort((a, b) => new Date(a.adjustmentDate || 0) - new Date(b.adjustmentDate || 0));
            case 'amountDesc':
                return list.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));
            case 'amountAsc':
                return list.sort((a, b) => Number(a.amount || 0) - Number(b.amount || 0));
            case 'dateDesc':
            default:
                return list.sort((a, b) => new Date(b.adjustmentDate || 0) - new Date(a.adjustmentDate || 0));
        }
    }, [tabFilteredRows, sortBy]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, typeFilter, adjustAgainstFilter, dateFrom, dateTo, activeTab]);

    const stats = useMemo(() => {
        const build = (list) => ({ amount: list.reduce((s, r) => s + Number(r.amount || 0), 0), count: list.length });
        return {
            total: build(searchedRows),
            invoice: build(searchedRows.filter((r) => r.adjustmentType === 'against_invoice')),
            creditNote: build(searchedRows.filter((r) => r.adjustmentType === 'against_credit_note')),
            writeOff: build(searchedRows.filter((r) => r.adjustmentType === 'write_off')),
        };
    }, [searchedRows]);

    const totalPages = Math.ceil(sortedRows.length / itemsPerPage);
    const paginatedRows = sortedRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const clearFilters = () => {
        setSearch('');
        setTypeFilter('all');
        setAdjustAgainstFilter('all');
        setDateFrom('');
        setDateTo('');
        setActiveTab('all');
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payment Adjustments</h1>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Track and manage adjustments made to invoices and payments.
                    </div>
                </div>
                <button
                    onClick={openNewAdjustmentModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-bold shadow-sm transition-colors whitespace-nowrap"
                >
                    <Plus className="w-3.5 h-3.5" /> New Adjustment
                </button>
            </div>

            {error && (
                <div className="mb-3 px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold rounded-md">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-24 text-slate-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading payment adjustments...
                </div>
            ) : (
                <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        <StatCard
                            icon={<FileText className="w-5 h-5" />} iconBg="bg-violet-100" iconColor="text-violet-600"
                            label="Total Adjustments (₹)" value={formatAmount(stats.total.amount)} count={`${stats.total.count} Adjustments`}
                        />
                        <StatCard
                            icon={<CheckCircle2 className="w-5 h-5" />} iconBg="bg-emerald-100" iconColor="text-emerald-600"
                            label="Against Invoices (₹)" value={formatAmount(stats.invoice.amount)} count={`${stats.invoice.count} Adjustments`}
                        />
                        <StatCard
                            icon={<Undo2 className="w-5 h-5" />} iconBg="bg-orange-100" iconColor="text-orange-600"
                            label="Against Credit Notes (₹)" value={formatAmount(stats.creditNote.amount)} count={`${stats.creditNote.count} Adjustments`}
                        />
                        <StatCard
                            icon={<Percent className="w-5 h-5" />} iconBg="bg-blue-100" iconColor="text-blue-600"
                            label="Write-offs (₹)" value={formatAmount(stats.writeOff.amount)} count={`${stats.writeOff.count} Adjustment${stats.writeOff.count === 1 ? '' : 's'}`}
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
                                        placeholder="Search by Adjustment No., Invoice No., Client..."
                                        className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-md text-[11px] w-full focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                                    />
                                </div>
                            </div>
                            <div className="w-[140px] shrink-0">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Adjustment Type</label>
                                <div className="relative">
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="appearance-none w-full bg-white border border-slate-200 text-slate-700 pl-3 pr-7 py-1.5 rounded-md text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="against_invoice">Against Invoice</option>
                                        <option value="against_credit_note">Against Credit Note</option>
                                        <option value="write_off">Write-off</option>
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                            <div className="w-[120px] shrink-0">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Adjust Against</label>
                                <div className="relative">
                                    <select
                                        value={adjustAgainstFilter}
                                        onChange={(e) => setAdjustAgainstFilter(e.target.value)}
                                        className="appearance-none w-full bg-white border border-slate-200 text-slate-700 pl-3 pr-7 py-1.5 rounded-md text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                    >
                                        <option value="all">All</option>
                                        <option value="Invoice">Invoice</option>
                                        <option value="Credit Note">Credit Note</option>
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                            <div className="w-[170px] shrink-0 relative">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Adjustment Date</label>
                                <button
                                    type="button"
                                    onClick={() => setIsDateRangeOpen((v) => !v)}
                                    className="w-full flex items-center justify-between gap-2 border border-slate-200 rounded-md px-3 py-1.5 text-[11px] font-bold text-slate-600 bg-white hover:bg-slate-50"
                                >
                                    <span className="truncate">
                                        {dateFrom || dateTo
                                            ? `${dateFrom ? formatDate(dateFrom) : '...'} - ${dateTo ? formatDate(dateTo) : '...'}`
                                            : 'Select Date Range'}
                                    </span>
                                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                </button>
                                {isDateRangeOpen && (
                                    <div className="absolute z-20 mt-1 right-0 bg-white border border-slate-200 rounded-md shadow-lg p-3 w-64">
                                        <div className="mb-2">
                                            <label className="block text-[9px] font-bold text-slate-500 mb-1">From</label>
                                            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full border border-slate-200 rounded-md px-2 py-1 text-[11px]" />
                                        </div>
                                        <div className="mb-2">
                                            <label className="block text-[9px] font-bold text-slate-500 mb-1">To</label>
                                            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full border border-slate-200 rounded-md px-2 py-1 text-[11px]" />
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

                    {/* Tabs + Sort + Table (unified card) */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 px-4 pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-5 overflow-x-auto scrollbar-hide">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`pb-2.5 text-[12px] font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.key ? tab.activeClass : tab.inactiveClass}`}
                                    >
                                        {tab.label} <span className="opacity-70">({tabCounts[tab.key] ?? 0})</span>
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
                                        <option value="dateDesc">Adjustment Date (Newest)</option>
                                        <option value="dateAsc">Adjustment Date (Oldest)</option>
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
                                        <th className="px-3 py-2.5">Adjustment No.</th>
                                        <th className="px-3 py-2.5">Adjustment Date</th>
                                        <th className="px-3 py-2.5">Adjustment Type</th>
                                        <th className="px-3 py-2.5">Adjust Against</th>
                                        <th className="px-3 py-2.5">Reference No.</th>
                                        <th className="px-3 py-2.5">Client / Company</th>
                                        <th className="px-3 py-2.5 text-right">Amount (₹)</th>
                                        <th className="px-3 py-2.5">Reason / Description</th>
                                        <th className="px-3 py-2.5">Adjusted By</th>
                                        <th className="px-3 py-2.5 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[11px] whitespace-nowrap">
                                    {paginatedRows.length === 0 && (
                                        <tr>
                                            <td colSpan={10} className="py-8 text-center text-slate-400">No payment adjustments found.</td>
                                        </tr>
                                    )}
                                    {paginatedRows.map((row) => {
                                        const style = TYPE_STYLES[row.adjustmentType] || TYPE_STYLES.against_invoice;
                                        return (
                                            <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                                                <td className="px-3 py-2.5 font-bold text-slate-800">{row.adjustmentNo}</td>
                                                <td className="px-3 py-2.5 text-slate-600">{formatDate(row.adjustmentDate)}</td>
                                                <td className="px-3 py-2.5">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border ${style.badge}`}>
                                                        {row.adjustmentTypeLabel}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2.5 text-slate-600">{row.adjustAgainst}</td>
                                                <td className="px-3 py-2.5 font-bold text-blue-600">{row.referenceNo || '-'}</td>
                                                <td className="px-3 py-2.5 font-semibold text-slate-700">{row.client}</td>
                                                <td className={`px-3 py-2.5 text-right font-black ${style.amountText}`}>{formatAmount(row.amount)}</td>
                                                <td className="px-3 py-2.5 text-slate-600 whitespace-normal max-w-[220px]">{row.reason}</td>
                                                <td className="px-3 py-2.5 text-slate-600">{row.adjustedBy}</td>
                                                <td className="px-3 py-2.5 text-center">
                                                    <button
                                                        onClick={() => setDetailRow(row)}
                                                        className="flex items-center gap-1 px-2 py-1 border border-slate-200 text-slate-600 rounded text-[10px] font-bold hover:bg-slate-50 transition-colors mx-auto"
                                                    >
                                                        <Eye className="w-3 h-3" /> View Details
                                                    </button>
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

            {/* New Adjustment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start p-5 border-b border-slate-100">
                            <div className="flex items-start gap-3">
                                <div className="w-11 h-11 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg leading-tight">New Adjustment</h3>
                                    <p className="text-slate-500 text-[12px] font-medium mt-0.5">Create a new adjustment to manage overpayments, advances, or write-offs.</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Adjustment Type <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <select
                                            value={form.adjustmentType}
                                            onChange={(e) => {
                                                setForm((f) => ({ ...f, adjustmentType: e.target.value }));
                                                setSelectedReference(null);
                                                setReferenceKey((k) => k + 1);
                                            }}
                                            className="appearance-none w-full border border-slate-200 rounded-lg pl-3 pr-8 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
                                        >
                                            {ADJUSTMENT_TYPE_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                    <p className="text-slate-400 text-[11px] font-medium mt-1">{selectedTypeMeta.help}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Adjust Against <span className="text-rose-500">*</span></label>
                                    <AsyncSelect
                                        key={referenceKey}
                                        cacheOptions={form.adjustmentType}
                                        defaultOptions
                                        loadOptions={loadReferenceOptions}
                                        value={selectedReference}
                                        onChange={(selected) => setSelectedReference(selected)}
                                        isClearable
                                        isSearchable
                                        placeholder={`Search & select ${selectedTypeMeta.refLabel}...`}
                                        noOptionsMessage={() => 'No matches found'}
                                        loadingMessage={() => 'Searching...'}
                                        className="text-sm"
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Adjustment Date <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={form.adjustment_date}
                                            onChange={(e) => setForm((f) => ({ ...f, adjustment_date: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-lg pl-3 pr-9 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                        />
                                        <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Company Name</label>
                                    <div className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium bg-slate-50 text-slate-600 truncate">
                                        {selectedReference?.companyName || <span className="text-slate-400">Auto-filled on selection</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Adjustment Amount (₹) <span className="text-rose-500">*</span></label>
                                    <div className="flex items-stretch gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.amount}
                                            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                                            className="flex-1 min-w-0 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                            placeholder="Enter amount"
                                        />
                                        <div className="shrink-0 flex items-center px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-sm font-bold whitespace-nowrap">
                                            ₹ {formatAmount(form.amount || 0)}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Reason / Description <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        value={form.reason}
                                        onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                        placeholder="Enter reason or description"
                                    />
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 bg-violet-50 border border-violet-100 rounded-lg px-3.5 py-3">
                                <Info className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                                <p className="text-violet-700 text-[12px] font-medium leading-snug">
                                    The adjustment will be reflected against the selected {selectedTypeMeta.refLabel.toLowerCase()} and outstanding amount will be updated.
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />} Save Adjustment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {detailRow && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800 text-lg">{detailRow.adjustmentNo}</h3>
                            <button onClick={() => setDetailRow(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500 font-semibold">Date</span><span className="font-bold text-slate-800">{formatDate(detailRow.adjustmentDate)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500 font-semibold">Type</span><span className="font-bold text-slate-800">{detailRow.adjustmentTypeLabel}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500 font-semibold">Adjust Against</span><span className="font-bold text-slate-800">{detailRow.adjustAgainst}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500 font-semibold">Reference No.</span><span className="font-bold text-blue-600">{detailRow.referenceNo}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500 font-semibold">Client</span><span className="font-bold text-slate-800">{detailRow.client}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500 font-semibold">Amount</span><span className="font-black text-emerald-600">₹ {formatAmount(detailRow.amount)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500 font-semibold">Adjusted By</span><span className="font-bold text-slate-800">{detailRow.adjustedBy}</span></div>
                            <div>
                                <span className="text-slate-500 font-semibold block mb-1">Reason</span>
                                <span className="font-medium text-slate-700">{detailRow.reason}</span>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50 rounded-b-xl">
                            <button
                                onClick={() => setDetailRow(null)}
                                className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentAdjustmentsView;
