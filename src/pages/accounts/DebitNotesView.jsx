import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronRight, FileText, CheckCircle2, AlertTriangle, Clock, Calendar,
    Download, Eye, Filter, Search, Plus, CalendarDays, RefreshCw, BarChart2,
    Wallet, ClipboardList, Send, Target, FileSpreadsheet, MoreVertical, Loader2, ChevronDown
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import Select from 'react-select';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

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
        <div ref={ref} className="bg-white p-1 border border-slate-200 rounded-xl shadow-sm flex items-center h-full cursor-pointer hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 xl:w-11 xl:h-11 ${iconBg} rounded-full flex items-center justify-center shrink-0 mr-1`}>
                {React.cloneElement(icon, { className: "w-5 h-5 xl:w-5 xl:h-5" })}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="text-slate-700 font-semibold text-[10px] mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{label}</div>
                <div className={`text-[12px] font-semibold leading-tight text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis`}>
                    {isCurrency && displayValue.startsWith('₹') ? '₹ ' : ''}
                    {isCurrency
                        ? new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(count)
                        : Math.round(count).toLocaleString('en-IN')}
                    {!isCurrency && displayValue.includes('%') ? '%' : ''}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 xl:mt-1 flex-wrap">
                    {bottomValue && bottomValue.includes('↑') || bottomValue.includes('↓') ? (
                        <span className="text-[10px] font-bold text-emerald-600 leading-none">{bottomValue}</span>
                    ) : null}
                    <div className="text-slate-500 font-medium text-[9px] xl:text-[10px] whitespace-nowrap overflow-hidden text-ellipsis">
                        {subLabel} {bottomValue && !bottomValue.includes('↑') && !bottomValue.includes('↓') ? `• ${bottomValue}` : ''}
                    </div>
                </div>
            </div>
        </div>
    );
}

const TYPE_LABELS = {
    additional_charges: 'Additional Charges',
    late_fee: 'Late Fee / Penalty',
    expense_recovery: 'Expense Recovery',
    tds_shortfall: 'TDS Shortfall Recovery',
    other: 'Other',
};

const STATUS_STYLES = {
    Outstanding: 'bg-rose-50 text-rose-600',
    'Partially Adjusted': 'bg-amber-50 text-amber-600',
    Adjusted: 'bg-emerald-50 text-emerald-600',
};
const STATUS_DOT = {
    Outstanding: 'bg-rose-500',
    'Partially Adjusted': 'bg-amber-500',
    Adjusted: 'bg-emerald-500',
};
const PIE_COLORS = { Adjusted: '#059669', 'Partially Adjusted': '#f59e0b', Outstanding: '#e11d48' };

const DOC_STATUS_LABELS = { draft: 'Draft', active: 'Active', cancelled: 'Cancelled' };
const DOC_STATUS_STYLES = {
    draft: 'bg-blue-50 text-blue-600',
    active: 'bg-emerald-50 text-emerald-600',
    cancelled: 'bg-rose-50 text-rose-600',
};

const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);
const formatDate = (val) => {
    if (!val) return 'N/A';
    const d = new Date(val);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const DebitNotesView = () => {
    const navigate = useNavigate();
    const { id = 'all' } = useParams();
    const isAllList = id === 'all';

    const [loading, setLoading] = useState(true);
    const [debitNotes, setDebitNotes] = useState([]);
    const [payments, setPayments] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [createdByFilter, setCreatedByFilter] = useState('');

    const [dateRangeOpen, setDateRangeOpen] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [modalCompanies, setModalCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [statusUpdatingId, setStatusUpdatingId] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [notesRes, paymentsRes] = await Promise.all([
                    api.get('/api/account-debit-notes', { params: isAllList ? {} : { companyId: id } }),
                    api.get('/api/payments').catch(() => ({ data: [] })),
                ]);
                setDebitNotes(notesRes.data?.data || []);
                setPayments(paymentsRes.data?.data || paymentsRes.data || []);
            } catch {
                toast.error('Failed to load debit notes');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isAllList]);

    const handleOpenCreate = async () => {
        if (!isAllList) {
            navigate(`/create-account-debit-note/${id}`);
            return;
        }
        setIsAddModalOpen(true);
        setLoadingCompanies(true);
        try {
            const res = await api.get('/api/companies');
            const compData = res.data?.data || res.data || [];
            setModalCompanies(compData.map((c) => ({ value: c._id, label: c.companyName || c.name || 'Unknown Company' })));
        } catch {
            toast.error('Failed to load exhibitors');
        } finally {
            setLoadingCompanies(false);
        }
    };

    const handleProceedCreate = () => {
        if (!selectedCompanyId) {
            toast.error('Please select an exhibitor first');
            return;
        }
        navigate(`/create-account-debit-note/${selectedCompanyId}`);
    };

    const handleStatusChange = async (note, newStatus) => {
        if (newStatus === 'cancelled') {
            const result = await Swal.fire({
                title: 'Cancel this debit note?',
                text: `${note.debit_note_no} will be marked as cancelled. This can be reversed later if needed.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#e11d48',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, Cancel It',
            });
            if (!result.isConfirmed) return;
        }

        setStatusUpdatingId(note._id);
        try {
            const res = await api.put(`/api/account-debit-notes/${note._id}`, { status: newStatus });
            if (res.data?.success) {
                setDebitNotes((prev) => prev.map((n) => n._id === note._id ? { ...n, status: newStatus } : n));
                Swal.fire({
                    icon: 'success',
                    title: newStatus === 'cancelled' ? 'Debit Note Cancelled' : newStatus === 'active' && note.status === 'cancelled' ? 'Debit Note Reactivated' : 'Debit Note Activated',
                    timer: 1400,
                    showConfirmButton: false,
                });
            } else {
                Swal.fire({ icon: 'error', title: 'Could Not Update', text: res.data?.message || 'Failed to update status.' });
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Could Not Update', text: err.response?.data?.message || 'Failed to update status.' });
        } finally {
            setStatusUpdatingId('');
        }
    };

    const exportToExcel = async (rows, filename) => {
        setExporting(true);
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Debit Notes');
            worksheet.columns = [
                { header: 'Debit Note No.', key: 'no', width: 22 },
                { header: 'Date', key: 'date', width: 14 },
                { header: 'Client', key: 'client', width: 26 },
                { header: 'Type', key: 'type', width: 20 },
                { header: 'Reason', key: 'reason', width: 30 },
                { header: 'Debit Note Value', key: 'value', width: 18 },
                { header: 'Adjusted', key: 'adjusted', width: 16 },
                { header: 'Outstanding', key: 'outstanding', width: 16 },
                { header: 'Status', key: 'status', width: 18 },
                { header: 'Created By', key: 'createdBy', width: 16 },
            ];
            const headerRow = worksheet.getRow(1);
            headerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
            headerRow.height = 25;

            rows.forEach((n) => {
                const r = worksheet.addRow({
                    no: n.debit_note_no,
                    date: formatDate(n.debit_note_date || n.added),
                    client: n.clientName || 'N/A',
                    type: TYPE_LABELS[n.debitNoteType] || n.debitNoteType,
                    reason: n.reason,
                    value: n.totalAmount || 0,
                    adjusted: n.settledAmount || 0,
                    outstanding: n.outstandingAmount || 0,
                    status: n.settlementStatus,
                    createdBy: n.added_by || 'Admin',
                });
                r.getCell('value').numFmt = '₹#,##0.00';
                r.getCell('adjusted').numFmt = '₹#,##0.00';
                r.getCell('outstanding').numFmt = '₹#,##0.00';
            });

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), filename);
        } finally {
            setExporting(false);
        }
    };

    const uniqueCreators = [...new Set(debitNotes.map((n) => n.added_by).filter(Boolean))];

    const filteredNotes = debitNotes.filter((n) => {
        if (statusFilter && n.settlementStatus !== statusFilter) return false;
        if (typeFilter && n.debitNoteType !== typeFilter) return false;
        if (createdByFilter && n.added_by !== createdByFilter) return false;
        if (dateFilter) {
            const now = new Date();
            const d = new Date(n.debit_note_date || n.added);
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
        return (
            (n.debit_note_no || '').toLowerCase().includes(s) ||
            (n.clientName || '').toLowerCase().includes(s) ||
            (n.allocations || []).some((a) => (a.invoiceNo || '').toLowerCase().includes(s))
        );
    });

    const totalNotes = filteredNotes.length;
    const totalValue = filteredNotes.reduce((sum, n) => sum + (n.totalAmount || 0), 0);
    const totalAdjusted = filteredNotes.reduce((sum, n) => sum + (n.settledAmount || 0), 0);
    const totalOutstanding = filteredNotes.reduce((sum, n) => sum + (n.outstandingAmount || 0), 0);
    const adjustedPct = totalValue > 0 ? ((totalAdjusted / totalValue) * 100).toFixed(2) : '0.00';
    const outstandingPct = totalValue > 0 ? ((totalOutstanding / totalValue) * 100).toFixed(2) : '0.00';
    const uniqueInvoices = new Set(filteredNotes.flatMap((n) => (n.allocations || []).map((a) => a.invoiceId))).size;
    const avgValue = totalNotes > 0 ? totalValue / totalNotes : 0;

    const now = new Date();
    const thisMonthNotes = filteredNotes.filter((n) => {
        const d = new Date(n.debit_note_date || n.added);
        return !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const thisMonthRaised = thisMonthNotes.reduce((sum, n) => sum + (n.totalAmount || 0), 0);
    const lastMonthRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthRaised = filteredNotes
        .filter((n) => { const d = new Date(n.debit_note_date || n.added); return !isNaN(d.getTime()) && d.getMonth() === lastMonthRef.getMonth() && d.getFullYear() === lastMonthRef.getFullYear(); })
        .reduce((sum, n) => sum + (n.totalAmount || 0), 0);
    const monthGrowthPct = lastMonthRaised > 0 ? (((thisMonthRaised - lastMonthRaised) / lastMonthRaised) * 100).toFixed(2) : null;

    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const overdueNotes = filteredNotes.filter((n) => {
        const d = new Date(n.debit_note_date || n.added);
        return n.outstandingAmount > 0 && !isNaN(d.getTime()) && d < thirtyDaysAgo;
    });
    const overdueValue = overdueNotes.reduce((sum, n) => sum + (n.outstandingAmount || 0), 0);

    const avgAgeDays = totalNotes > 0
        ? Math.round(filteredNotes.reduce((sum, n) => {
            const d = new Date(n.debit_note_date || n.added);
            return sum + (isNaN(d.getTime()) ? 0 : Math.max(0, Math.round((now - d) / 86400000)));
        }, 0) / totalNotes)
        : 0;

    const statusCounts = { Adjusted: 0, 'Partially Adjusted': 0, Outstanding: 0 };
    filteredNotes.forEach((n) => { if (statusCounts[n.settlementStatus] !== undefined) statusCounts[n.settlementStatus]++; });
    const totalStatusCount = totalNotes || 1;
    const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value, color: PIE_COLORS[name] }));

    // Collection summary (real, computed from Payment records — same pattern as ReceiptsView)
    const scopedPayments = isAllList ? payments : payments.filter((p) => String(p.companyId) === String(id));
    const todayCollection = scopedPayments.filter((p) => new Date(p.payment_date || p.added).toDateString() === now.toDateString()).reduce((s, p) => s + (parseFloat(p.amount_text) || 0), 0);
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0, 0, 0, 0);
    const weekCollection = scopedPayments.filter((p) => new Date(p.payment_date || p.added) >= startOfWeek).reduce((s, p) => s + (parseFloat(p.amount_text) || 0), 0);
    const monthCollection = scopedPayments.filter((p) => { const d = new Date(p.payment_date || p.added); return !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).reduce((s, p) => s + (parseFloat(p.amount_text) || 0), 0);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredNotes.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(totalNotes / itemsPerPage);

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-2 font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Debit Notes</h1>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                        <span>Accounts Receivable (AR)</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-blue-600 font-bold">Debit Notes</span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setDateRangeOpen(!dateRangeOpen)}
                            className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50"
                        >
                            <CalendarDays className="w-4 h-4 text-slate-500" />
                            {fromDate && toDate ? `${new Date(fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${new Date(toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}` : 'Date Range'}
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>

                        {dateRangeOpen && (
                            <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-50 w-64">
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">From Date</label>
                                        <input
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">To Date</label>
                                        <input
                                            type="date"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setDateRangeOpen(false)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 rounded transition-colors mt-2"
                                    >
                                        Apply Range
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setFiltersOpen(!filtersOpen)}
                            className="flex items-center gap-2 bg-white border border-slate-300 text-blue-600 px-3 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50"
                        >
                            <Filter className="w-4 h-4 text-blue-600" /> Filters
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
                                            <option value="">All Statuses</option>
                                            <option value="draft">Draft</option>
                                            <option value="active">Active</option>
                                            <option value="cancelled">Cancelled</option>
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
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Create Debit Note
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-2 mt-2">
                {/* Left */}
                <div className="w-full lg:w-[80%] space-y-2">

                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                        <StatCard
                            icon={<FileText className="w-4 h-4 text-blue-600" />} iconBg="bg-blue-100"
                            rawValue={totalNotes} displayValue={totalNotes.toString()}
                            label="Total Debit Notes" subLabel={`Against ${uniqueInvoices} Invoices`}
                            bottomLabel="Total Value" bottomValue={`₹ ${formatCurrency(totalValue)}`}
                        />
                        <StatCard
                            icon={<Wallet className="w-4 h-4 text-indigo-600" />} iconBg="bg-indigo-100"
                            rawValue={totalValue} displayValue={`₹ ${formatCurrency(thisMonthRaised)}`} isCurrency
                            label="Total Raised" subLabel="This Month"
                            bottomLabel={monthGrowthPct !== null ? 'vs Last Month' : 'Overall'} bottomValue={monthGrowthPct !== null ? `${monthGrowthPct >= 0 ? '↑' : '↓'} ${Math.abs(monthGrowthPct)}%` : `₹ ${formatCurrency(totalValue)}`}
                        />
                        <StatCard
                            icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />} iconBg="bg-emerald-100"
                            rawValue={totalAdjusted} displayValue={`₹ ${formatCurrency(totalAdjusted)}`} isCurrency
                            label="Total Adjusted" subLabel="Already Adjusted"
                            bottomLabel="% of Value" bottomValue={`${adjustedPct}%`}
                        />
                        <StatCard
                            icon={<Clock className="w-4 h-4 text-amber-600" />} iconBg="bg-amber-100"
                            rawValue={totalOutstanding} displayValue={`₹ ${formatCurrency(totalOutstanding)}`} isCurrency
                            label="Total Outstanding" subLabel="Yet to be Adjusted"
                            bottomLabel="% of Value" bottomValue={`${outstandingPct}%`}
                        />
                        <StatCard
                            icon={<AlertTriangle className="w-4 h-4 text-rose-600" />} iconBg="bg-rose-100"
                            rawValue={overdueNotes.length} displayValue={overdueNotes.length.toString()}
                            label="Overdue Debit Notes" subLabel="Outstanding > 30 Days"
                            bottomLabel="Overdue Value" bottomValue={`₹ ${formatCurrency(overdueValue)}`}
                        />
                        <StatCard
                            icon={<BarChart2 className="w-4 h-4 text-purple-600" />} iconBg="bg-purple-100"
                            rawValue={avgValue} displayValue={`₹ ${formatCurrency(avgValue)}`} isCurrency
                            label="Avg Debit Note Value" subLabel="This Month"
                            bottomLabel="Avg. Age" bottomValue={`${avgAgeDays} Days`}
                        />
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-3 py-2 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-2">
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide w-full">
                            <div className="relative shrink-0">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => { setSearchInput(e.target.value); setCurrentPage(1); }}
                                    placeholder="Search by debit note no., client name, invoice no..."
                                    className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-[11px] w-[280px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <select value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }} className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white">
                                <option value="">Date Range</option>
                                <option value="this_month">This Month</option>
                                <option value="last_3_months">Last 3 Months</option>
                                <option value="this_year">This Year</option>
                            </select>
                            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white">
                                <option value="">Adjustment Status</option>
                                <option value="Outstanding">Outstanding</option>
                                <option value="Partially Adjusted">Partially Adjusted</option>
                                <option value="Adjusted">Adjusted</option>
                            </select>
                            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }} className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white">
                                <option value="">Debit Note Type</option>
                                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                            <select value={createdByFilter} onChange={(e) => { setCreatedByFilter(e.target.value); setCurrentPage(1); }} className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white">
                                <option value="">Created By</option>
                                {uniqueCreators.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <button
                                onClick={() => { setSearchInput(''); setDateFilter(''); setStatusFilter(''); setTypeFilter(''); setCreatedByFilter(''); setCurrentPage(1); }}
                                className="flex items-center gap-1 text-blue-600 font-bold text-[11px] px-2 shrink-0"
                            >
                                <RefreshCw className="w-3 h-3" /> Reset
                            </button>
                        </div>
                        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-2">
                            <button
                                disabled={exporting}
                                onClick={() => exportToExcel(filteredNotes, 'Debit_Notes_Export.xlsx')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 rounded-md text-[11px] font-bold border border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} Export
                            </button>
                            <button onClick={() => navigate('/accounts/summary-report')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 rounded-md text-[11px] font-bold border border-slate-300 hover:bg-slate-50 transition-colors">
                                <BarChart2 className="w-3.5 h-3.5" /> Debit Note Report
                            </button>
                            <button
                                onClick={() => exportToExcel(filteredNotes.filter(n => n.outstandingAmount > 0), 'Outstanding_Debit_Notes.xlsx')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 rounded-md text-[11px] font-bold border border-slate-300 hover:bg-slate-50 transition-colors"
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5" /> Outstanding Report
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
                        <table className="w-full min-w-[1200px] text-left border-collapse">
                            <thead>
                                <tr className="bg-white text-[8px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 whitespace-nowrap">
                                    <th className="px-2 py-2 text-center">S.No.</th>
                                    <th className="px-2 py-2">Debit Note Details</th>
                                    <th className="px-2 py-2">Invoice Details</th>
                                    <th className="px-2 py-2">Client &amp; Stall</th>
                                    <th className="px-2 py-2">Debit Note Type &amp; Reason</th>
                                    <th className="px-2 py-2 text-center">Debit Note Date</th>
                                    <th className="px-2 py-2 text-right">Debit Note Value</th>
                                    <th className="px-2 py-2 text-right">Adjusted Amount</th>
                                    <th className="px-2 py-2 text-right">Outstanding Amount</th>
                                    <th className="px-2 py-2 text-center">Status</th>
                                    <th className="px-2 py-2 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px]">
                                {loading ? (
                                    <tr><td colSpan="11" className="py-6 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading debit notes...</div>
                                    </td></tr>
                                ) : currentItems.length === 0 ? (
                                    <tr><td colSpan="11" className="py-6 text-center text-slate-500">No debit notes found.</td></tr>
                                ) : currentItems.map((note, idx) => {
                                    const primaryAlloc = (note.allocations || [])[0];
                                    const extraAllocs = (note.allocations || []).length - 1;
                                    const adjustedPctRow = note.totalAmount > 0 ? Math.round(((note.settledAmount || 0) / note.totalAmount) * 100) : 0;
                                    return (
                                        <tr key={note._id || idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-2 py-2 font-bold text-slate-700 text-center align-top">{indexOfFirstItem + idx + 1}</td>
                                            <td className="px-2 py-2 align-top">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="font-bold text-slate-800 text-[11px]">{note.debit_note_no}</div>
                                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${DOC_STATUS_STYLES[note.status] || 'bg-slate-100 text-slate-500'}`}>{DOC_STATUS_LABELS[note.status] || note.status}</span>
                                                </div>
                                                <div className="text-slate-500 mt-0.5 text-[10px] font-medium">Debit Note Date: {formatDate(note.debit_note_date || note.added)}</div>
                                                <button onClick={() => navigate(`/create-account-debit-note/${note.companyId}?view=${note._id}`)} className="text-blue-600 font-bold mt-1 text-[10px] cursor-pointer">View Details ˅</button>
                                            </td>
                                            <td className="px-2 py-2 align-top">
                                                <div className="font-bold text-slate-800 text-[11px]">{primaryAlloc?.invoiceNo || 'N/A'}</div>
                                                <div className="text-slate-500 mt-0.5 text-[10px] font-medium">Invoice Date: {formatDate(primaryAlloc?.invoiceDate)}</div>
                                                <div className="text-slate-500 text-[10px] font-medium">Invoice Value: ₹ {formatCurrency(primaryAlloc?.invoiceAmount)}</div>
                                                {extraAllocs > 0 && <div className="text-blue-500 text-[10px] font-medium mt-0.5">+{extraAllocs} more invoice{extraAllocs === 1 ? '' : 's'}</div>}
                                            </td>
                                            <td className="px-2 py-2 align-top">
                                                <div className="font-bold text-blue-600 text-[11px]">{note.clientName || 'N/A'}</div>
                                                <div className="text-slate-500 mt-0.5 text-[10px] font-medium">{note.stallNo ? `Stall No: ${note.stallNo}` : 'N/A'}</div>
                                                {note.hallNo && <div className="text-slate-500 text-[10px] font-medium">Hall: {note.hallNo}</div>}
                                            </td>
                                            <td className="px-2 py-2 align-top">
                                                <div className="font-bold text-slate-700 text-[11px] mb-0.5">{TYPE_LABELS[note.debitNoteType] || note.debitNoteType}</div>
                                                <div title={note.reason} className="text-slate-500 text-[10px] font-medium whitespace-normal w-40 line-clamp-2">{note.reason}</div>
                                            </td>
                                            <td className="px-2 py-2 font-bold text-slate-700 text-center align-top whitespace-nowrap">{formatDate(note.debit_note_date || note.added)}</td>
                                            <td className="px-2 py-2 text-right align-top">
                                                <div className="font-bold text-slate-800 text-[11px]">₹ {formatCurrency(note.totalAmount)}</div>
                                            </td>
                                            <td className="px-2 py-2 text-right align-top">
                                                <div className="font-bold text-emerald-600 text-[11px]">₹ {formatCurrency(note.settledAmount)}</div>
                                                <div className="text-slate-500 text-[10px] font-medium mt-0.5">{adjustedPctRow}%</div>
                                            </td>
                                            <td className="px-2 py-2 text-right align-top">
                                                <div className={`font-bold text-[11px] ${note.outstandingAmount > 0 ? 'text-rose-500' : 'text-slate-500'}`}>₹ {formatCurrency(note.outstandingAmount)}</div>
                                            </td>
                                            <td className="px-2 py-2 text-center align-top">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[note.settlementStatus] || 'bg-slate-100 text-slate-600'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[note.settlementStatus] || 'bg-slate-400'}`}></div>
                                                    {note.settlementStatus}
                                                </span>
                                            </td>
                                            <td className="px-2 py-2 align-top">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button onClick={() => navigate(`/create-account-debit-note/${note.companyId}?view=${note._id}`)} title="View" className="w-6 h-6 flex items-center justify-center text-blue-600 bg-blue-50/50 border border-blue-100 rounded hover:bg-blue-100 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                                                    <button title="Download" className="w-6 h-6 flex items-center justify-center text-blue-600 bg-blue-50/50 border border-blue-100 rounded hover:bg-blue-100 transition-colors"><Download className="w-3.5 h-3.5" /></button>
                                                    <div className="relative group">
                                                        <button title="More" className="w-6 h-6 flex items-center justify-center text-blue-600 bg-blue-50/50 border border-blue-100 rounded hover:bg-blue-100 transition-colors"><MoreVertical className="w-3 h-3" /></button>
                                                        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 flex flex-col py-1">
                                                            {note.status === 'draft' && (
                                                                <button onClick={() => handleStatusChange(note, 'active')} disabled={statusUpdatingId === note._id} className="flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors w-full text-left disabled:opacity-50">
                                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Activate Debit Note
                                                                </button>
                                                            )}
                                                            {note.status !== 'cancelled' && (
                                                                <button onClick={() => handleStatusChange(note, 'cancelled')} disabled={statusUpdatingId === note._id} className="flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition-colors w-full text-left disabled:opacity-50">
                                                                    <AlertTriangle className="w-3.5 h-3.5" /> Cancel Debit Note
                                                                </button>
                                                            )}
                                                            {note.status === 'cancelled' && (
                                                                <button onClick={() => handleStatusChange(note, 'active')} disabled={statusUpdatingId === note._id} className="flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors w-full text-left disabled:opacity-50">
                                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Reactivate Debit Note
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="bg-white border-t border-slate-200 p-4">
                            <div className="flex justify-between items-center text-[11px] text-slate-500">
                                <div>Showing {totalNotes === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalNotes)} of {totalNotes} entries</div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">&lt;</button>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum = i + 1;
                                        if (totalPages > 5 && currentPage > 3) pageNum = currentPage - 2 + i;
                                        if (pageNum > totalPages) return null;
                                        return (
                                            <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-6 h-6 flex items-center justify-center rounded font-bold ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'border border-slate-300 hover:bg-slate-50'}`}>{pageNum}</button>
                                        );
                                    })}
                                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">&gt;</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>Rows per page</span>
                                    <select value={itemsPerPage} disabled className="border border-slate-300 rounded px-2 py-1 focus:outline-none">
                                        <option value={10}>10</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Totals */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2 px-3 flex items-center justify-between overflow-x-auto mt-2">
                        <div className="flex items-center flex-1 divide-x divide-slate-200 min-w-max justify-between">
                            <div className="pr-3 text-center">
                                <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Total Debit Note Value</div>
                                <div className="text-[11px] font-bold text-slate-800">₹ {formatCurrency(totalValue)}</div>
                            </div>
                            <div className="px-3 text-center">
                                <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Total Raised</div>
                                <div className="text-[11px] font-bold text-slate-800">₹ {formatCurrency(totalValue)}</div>
                            </div>
                            <div className="px-3 text-center">
                                <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Total Adjusted</div>
                                <div className="text-[11px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                                    ₹ {formatCurrency(totalAdjusted)} <span className="text-[9px] text-slate-500 font-medium">({adjustedPct}%)</span>
                                </div>
                            </div>
                            <div className="px-3 text-center">
                                <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Total Outstanding</div>
                                <div className="text-[11px] font-bold text-rose-500 flex flex-col items-center">
                                    ₹ {formatCurrency(totalOutstanding)}
                                    <span className="text-[9px] text-slate-500 font-medium mt-0.5">{filteredNotes.filter(n => n.outstandingAmount > 0).length} Debit Notes</span>
                                </div>
                            </div>
                            <div className="px-3 text-center">
                                <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Total Invoices Affected</div>
                                <div className="text-[11px] font-bold text-slate-800">{uniqueInvoices}</div>
                            </div>
                            <div className="pl-3 text-center">
                                <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Average Debit Note Age</div>
                                <div className="text-[11px] font-bold text-slate-800">{avgAgeDays} Days</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-full lg:w-[20%] flex flex-col gap-2">
                    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-800 mb-3 tracking-wide">Collection Summary</h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><ClipboardList className="w-3.5 h-3.5" /></div>
                                <div><div className="text-[10px] font-semibold text-slate-600">Today's Collection</div><div className="font-bold text-slate-800 text-xs">₹ {formatCurrency(todayCollection)}</div></div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><Calendar className="w-3.5 h-3.5" /></div>
                                <div><div className="text-[10px] font-semibold text-slate-600">This Week Collection</div><div className="font-bold text-slate-800 text-xs">₹ {formatCurrency(weekCollection)}</div></div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-orange-50 flex items-center justify-center text-orange-600 shrink-0"><Wallet className="w-3.5 h-3.5" /></div>
                                <div><div className="text-[10px] font-semibold text-slate-600">This Month Collection</div><div className="font-bold text-slate-800 text-xs">₹ {formatCurrency(monthCollection)}</div></div>
                            </div>
                            <div className="h-[1px] bg-slate-100 my-1.5"></div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-red-50 flex items-center justify-center text-red-500 shrink-0"><Target className="w-3.5 h-3.5" /></div>
                                <div><div className="text-[10px] font-semibold text-slate-600">Overdue Recovery Target</div><div className="font-bold text-slate-800 text-xs">₹ {formatCurrency(overdueValue)}</div></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-800 mb-3 tracking-wide">Quick Actions</h2>
                        <div className="space-y-2">
                            {[
                                { icon: <FileText className="w-3.5 h-3.5 text-blue-500" />, title: 'Create Debit Note', sub: 'Raise a new debit note', onClick: handleOpenCreate },
                                { icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />, title: 'View Client Ledger', sub: 'Detailed ledger history', onClick: () => navigate(isAllList ? '/accounts/client-ledger' : `/dashboard/account/client-ledger/${id}`) },
                                { icon: <Download className="w-3.5 h-3.5 text-blue-500" />, title: 'Download Debit Note Report', sub: 'Get detailed report', onClick: () => exportToExcel(filteredNotes, 'Debit_Notes_Export.xlsx') },
                            ].map((item, i) => (
                                <div key={i} onClick={item.onClick} className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">{item.icon}</div>
                                        <div><div className="text-[11px] font-semibold text-slate-800 leading-tight">{item.title}</div><div className="text-[9px] font-medium text-slate-500 leading-tight mt-0.5">{item.sub}</div></div>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-800 mb-3 tracking-wide">Debit Note Status Overview</h2>
                        <div className="flex items-center justify-between h-[100px]">
                            <div className="w-[100px] h-full shrink-0 -ml-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={45} paddingAngle={2} dataKey="value" stroke="none">
                                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Pie>
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                                {pieData.map((item, i) => (
                                    <div key={i} className="flex flex-col items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-[10px] font-semibold text-slate-600">{item.name}</span>
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-800 text-right">
                                            {item.value} <span className="font-medium text-slate-500 ml-0.5">({totalStatusCount > 0 ? ((item.value / totalStatusCount) * 100).toFixed(0) : 0}%)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-2 text-center">
                            <button onClick={() => navigate('/accounts/summary-report')} className="text-blue-600 hover:text-blue-700 text-[11px] font-bold tracking-wide transition-colors">
                                View All Reports →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Debit Note Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-4 border-b border-slate-100">
                            <h3 className="font-semibold text-slate-800 text-sm">Select Exhibitor</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-4">
                            <label className="block text-[11px] font-medium text-slate-700 mb-2">Search &amp; Select Company</label>
                            <Select
                                options={modalCompanies}
                                isLoading={loadingCompanies}
                                onChange={(selected) => setSelectedCompanyId(selected ? selected.value : '')}
                                placeholder="Select exhibitor..."
                                className="text-xs"
                                isClearable
                                menuPortalTarget={document.body}
                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                            />
                        </div>
                        <div className="p-3 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 rounded-b-lg">
                            <button onClick={() => setIsAddModalOpen(false)} className="px-3 py-1.5 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors">Cancel</button>
                            <button onClick={handleProceedCreate} className="px-3 py-1.5 text-[11px] font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50" disabled={!selectedCompanyId}>Proceed</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DebitNotesView;
