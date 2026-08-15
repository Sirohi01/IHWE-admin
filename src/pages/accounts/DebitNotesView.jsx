import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    ChevronRight, FileText, CheckCircle2, AlertTriangle, Clock, Calendar,
    Download, Eye, Search, RefreshCw, BarChart2,
    Wallet, FilePlus, MoreVertical, Loader2
} from 'lucide-react';
import api, { SERVER_URL } from '../../lib/api';
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

function StatCard({ icon, iconBg, rawValue, displayValue, label, subLabel, isCurrency }) {
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
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
};

const DebitNotesView = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const scopedEventId = searchParams.get('eventId') || '';
    const { id = 'all' } = useParams();
    const isAllList = id === 'all';

    const [loading, setLoading] = useState(true);
    const [debitNotes, setDebitNotes] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [createdByFilter, setCreatedByFilter] = useState('');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [modalCompanies, setModalCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [statusUpdatingId, setStatusUpdatingId] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const notesRes = await api.get('/api/account-debit-notes', {
                    params: {
                        ...(isAllList ? {} : { companyId: id }),
                        ...(scopedEventId ? { eventId: scopedEventId } : {}),
                    }
                });

                setDebitNotes(notesRes.data?.data || []);
            } catch {
                toast.error('Failed to load debit notes');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isAllList, scopedEventId]);

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
            const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long' }).replace(/ /g, '');
            saveAs(new Blob([buffer]), `debitNoteExport_${formattedDate}.xlsx`);
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

    const now = new Date();
    const thisMonthNotes = filteredNotes.filter((n) => {
        const d = new Date(n.debit_note_date || n.added);
        return !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const thisMonthRaised = thisMonthNotes.reduce((sum, n) => sum + (n.totalAmount || 0), 0);
    const avgValueThisMonth = thisMonthNotes.length > 0 ? thisMonthRaised / thisMonthNotes.length : 0;
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
                    <button
                        onClick={() => navigate('/accounts/proforma-invoices')}
                        className="px-3 py-1.5 rounded text-xs font-bold border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                        Proforma Invoices
                    </button>
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
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-2">
                <StatCard
                    icon={<FileText className="w-4 h-4 text-blue-600" />} iconBg="bg-blue-100"
                    rawValue={totalNotes} displayValue={totalNotes.toString()}
                    label="Total Debit Notes" subLabel={`Against ${uniqueInvoices} Invoices`}
                />
                <StatCard
                    icon={<Wallet className="w-4 h-4 text-indigo-600" />} iconBg="bg-indigo-100"
                    rawValue={thisMonthRaised} displayValue={formatCurrency(thisMonthRaised)} isCurrency
                    label="Total Raised" subLabel={monthGrowthPct !== null ? `${monthGrowthPct >= 0 ? '↑' : '↓'} ${Math.abs(monthGrowthPct)}% vs Last Month` : 'This Month'}
                />
                <StatCard
                    icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />} iconBg="bg-emerald-100"
                    rawValue={totalAdjusted} displayValue={formatCurrency(totalAdjusted)} isCurrency
                    label="Total Adjusted" subLabel={`${adjustedPct}% of Value`}
                />
                <StatCard
                    icon={<Clock className="w-4 h-4 text-amber-600" />} iconBg="bg-amber-100"
                    rawValue={totalOutstanding} displayValue={formatCurrency(totalOutstanding)} isCurrency
                    label="Total Outstanding" subLabel={`${outstandingPct}% of Value`}
                />
                <StatCard
                    icon={<AlertTriangle className="w-4 h-4 text-rose-600" />} iconBg="bg-rose-100"
                    rawValue={overdueNotes.length} displayValue={overdueNotes.length.toString()}
                    label="Overdue Debit Notes" subLabel={`Value: ${formatCurrency(overdueValue)}`}
                />
                <StatCard
                    icon={<BarChart2 className="w-4 h-4 text-purple-600" />} iconBg="bg-purple-100"
                    rawValue={avgValueThisMonth} displayValue={formatCurrency(avgValueThisMonth)} isCurrency
                    label="Avg Debit Note Value" subLabel={`Avg. Age: ${avgAgeDays} Days`}
                />
            </div>

            {/* Filters */}
            <div className="bg-white p-3 py-1 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-3 mb-2">
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
                    <div className="flex-1" />
                    <button
                        disabled={exporting}
                        onClick={() => exportToExcel(filteredNotes)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 rounded-md text-[11px] font-bold border border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50 shrink-0 whitespace-nowrap"
                    >
                        {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} Export Excel
                    </button>
                    <button onClick={() => navigate('/accounts/summary-report')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 rounded-md text-[11px] font-bold border border-slate-300 hover:bg-slate-50 transition-colors shrink-0 whitespace-nowrap">
                        <BarChart2 className="w-3.5 h-3.5" /> Debit Note Report
                    </button>
                    <button onClick={() => navigate(isAllList ? '/accounts/client-ledger' : `/dashboard/account/client-ledger/${id}`)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 rounded-md text-[11px] font-bold border border-slate-300 hover:bg-slate-50 transition-colors shrink-0 whitespace-nowrap">
                        <Eye className="w-3.5 h-3.5" /> View Client Ledger
                    </button>
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md text-[11px] font-bold hover:bg-blue-700 transition-colors shrink-0 whitespace-nowrap"
                    >
                        <FilePlus className="w-3.5 h-3.5" /> Create Debit Note
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-auto max-h-[460px]">
                <table className="w-full min-w-[1300px] text-left border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-white text-[8px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 whitespace-nowrap">
                            <th className="px-2 py-1 text-center">S.No.</th>
                            <th className="px-2 py-1">Debit Note Details</th>
                            <th className="px-2 py-1">Invoice Details</th>
                            <th className="px-2 py-1">Client &amp; Stall</th>
                            <th className="px-2 py-1">Type &amp; Reason</th>
                            <th className="px-2 py-1 text-center">Date</th>
                            <th className="px-2 py-1 text-right">Value</th>
                            <th className="px-2 py-1 text-right">Adjusted</th>
                            <th className="px-2 py-1 text-right">Outstanding</th>
                            <th className="px-2 py-1 text-center">Status</th>
                            <th className="px-2 py-1 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-[11px]">
                        {loading ? (
                            <tr><td colSpan="11" className="py-6 text-center text-slate-500 h-[33px]">
                                <div className="flex justify-center items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading debit notes...</div>
                            </td></tr>
                        ) : currentItems.length === 0 ? (
                            <tr className="border-b border-slate-100"><td colSpan="11" className="py-6 text-center text-slate-500 h-[33px]">No debit notes found.</td></tr>
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
                                                    <button onClick={() => navigate(`/debit-note-view-account/${note._id}`)} title="View / print debit note" className="w-6 h-6 flex items-center justify-center text-emerald-600 bg-emerald-50/50 border border-emerald-100 rounded hover:bg-emerald-100 transition-colors"><FileText className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => navigate(`/create-account-debit-note/${note.companyId}?view=${note._id}`)} title="Edit" className="w-6 h-6 flex items-center justify-center text-blue-600 bg-blue-50/50 border border-blue-100 rounded hover:bg-blue-100 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                                                    <button
                                                        title={note.attachmentUrl ? 'Download supporting attachment' : 'No attachment uploaded for this debit note'}
                                                        disabled={!note.attachmentUrl}
                                                        onClick={() => window.open(`${SERVER_URL}${note.attachmentUrl}`, '_blank', 'noopener,noreferrer')}
                                                        className="w-6 h-6 flex items-center justify-center text-blue-600 bg-blue-50/50 border border-blue-100 rounded hover:bg-blue-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                    ><Download className="w-3.5 h-3.5" /></button>
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
                        {!loading && currentItems.length < itemsPerPage &&
                            Array.from({ length: itemsPerPage - (currentItems.length === 0 ? 1 : currentItems.length) }).map((_, idx) => (
                                <tr key={`filler-${idx}`} className="border-b border-slate-100">
                                    <td colSpan={11} className="px-2 py-1 h-[33px]">&nbsp;</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-3 flex justify-between items-center text-[11px] text-slate-500 px-1">
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
                    <select
                        value={itemsPerPage}
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
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

            {/* Financial Summary Bar */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm mt-2 px-6 py-4 flex items-center justify-between overflow-x-auto">
                <div className="flex flex-col shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Debit Note Value</span>
                    <span className="text-sm font-black text-slate-800">{formatCurrency(totalValue)}</span>
                </div>
                <div className="w-px h-10 bg-slate-200 mx-2 shrink-0"></div>
                <div className="flex flex-col shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Adjusted</span>
                    <span className="text-sm font-black text-emerald-600">{formatCurrency(totalAdjusted)} <span className="text-[10px] font-medium text-slate-500 normal-case">({adjustedPct}%)</span></span>
                </div>
                <div className="w-px h-10 bg-slate-200 mx-2 shrink-0"></div>
                <div className="flex flex-col shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Outstanding</span>
                    <span className="text-sm font-black text-rose-600">{formatCurrency(totalOutstanding)} <span className="text-[10px] font-medium text-slate-500 normal-case">({filteredNotes.filter(n => n.outstandingAmount > 0).length} Notes)</span></span>
                </div>
                <div className="w-px h-10 bg-slate-200 mx-2 shrink-0"></div>
                <div className="flex flex-col shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Overdue Value</span>
                    <span className="text-sm font-black text-rose-600">{formatCurrency(overdueValue)}</span>
                </div>
                <div className="w-px h-10 bg-slate-200 mx-2 shrink-0"></div>
                <div className="flex flex-col shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Invoices Affected</span>
                    <span className="text-sm font-black text-slate-800">{uniqueInvoices}</span>
                </div>
                <div className="w-px h-10 bg-slate-200 mx-2 shrink-0"></div>
                <div className="flex flex-col shrink-0">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Average Debit Note Age</span>
                    <span className="text-sm font-black text-slate-800">{avgAgeDays} Days</span>
                </div>
            </div>

            {/* Create Debit Note Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-4 border-b border-slate-100">
                            <h3 className="font-semibold text-slate-800 text-sm">Select Client</h3>
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
