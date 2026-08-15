import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FileText, Download, Search, Eye, CheckCircle2, AlertTriangle, RefreshCcw, Activity, Calendar, FilePlus, ChevronRight, SquarePen } from 'lucide-react';
import api from '../../lib/api';
import { resolveLinkedIds } from '../../utils/resolveLinkedIds';
import toast from 'react-hot-toast';
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

const CreditNotesView = () => {
    const [searchParams] = useSearchParams();
    const scopedEventId = searchParams.get('eventId') || '';
    const navigate = useNavigate();
    const { id = 'all' } = useParams();
    const isAllList = id === 'all';

    const [loading, setLoading] = useState(true);
    const [creditNotes, setCreditNotes] = useState([]);
    const [searchInput, setSearchInput] = useState('');

    // Dropdown Filters State
    const [statusFilter, setStatusFilter] = useState('All');
    const [inlineDateRange, setInlineDateRange] = useState('');
    const [inlineSalesPerson, setInlineSalesPerson] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    // Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [modalCompanies, setModalCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [loadingCompanies, setLoadingCompanies] = useState(false);

    const [companies, setCompanies] = useState([]);
    const [adminUsers, setAdminUsers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cnRes, dnRes, compRes, adminRes, invRes] = await Promise.all([
                    api.get('/api/creditnotes', { params: scopedEventId ? { eventId: scopedEventId } : {} }).catch(() => ({ data: { data: [] } })),
                    api.get('/api/debitnotes', { params: scopedEventId ? { eventId: scopedEventId } : {} }).catch(() => ({ data: { data: [] } })),
                    api.get('/api/companies'),
                    api.get('/api/admin/all').catch(() => ({ data: { data: [] } })),
                    api.get('/api/invoices', { params: scopedEventId ? { eventId: scopedEventId } : {} }).catch(() => ({ data: [] })),
                ]);

                const compData = compRes.data?.data || compRes.data || [];
                setCompanies(compData);

                // Same admin-users list shown on /admin-users — used to populate "Added By"
                // with every real user (not just whoever happens to already have a note),
                // and with their canonical name instead of whatever raw string got stored.
                setAdminUsers(adminRes.data?.data || []);

                const invoicesData = invRes.data?.data || invRes.data || [];

                // Merge old credit notes + new debit notes
                const oldCNs = cnRes.data?.data || cnRes.data || [];
                const newDNs = dnRes.data?.data || dnRes.data || [];

                // Normalize old credit notes to have common fields
                const normalizedOld = (Array.isArray(oldCNs) ? oldCNs : []).map(n => {
                    // Calculate total from items if total_value is 0 or missing
                    const itemsTotal = (n.items || []).reduce((sum, item) => {
                        const qty = parseFloat(item.quantity || item.qty || 1);
                        const amt = parseFloat(item.cn_amount || item.rate || item.amount || 0);
                        return sum + (qty * amt);
                    }, 0);
                    const total = n.totalAmount || n.total_value || itemsTotal || 0;
                    return {
                        ...n,
                        _source: 'creditnote',
                        debit_note_no: n.debit_note_no || n.create_note_no || n.est_no,
                        debit_note_date: n.debit_note_date || n.credit_note_date || n.created_at,
                        toInvoiceNo: n.toInvoiceNo || n.reference_invoice_no || n.est_no,
                        totalAmount: total,
                        type: n.type || n.credit_note_type || 'Credit Note',
                        reason: n.reason || n.remarks || 'N/A',
                        clientName: n.clientName || '',
                    };
                });

                // Normalize new debit notes
                const normalizedNew = (Array.isArray(newDNs) ? newDNs : []).map(n => ({
                    ...n,
                    _source: 'debitnote',
                }));

                let allNotes = [...normalizedNew, ...normalizedOld];

                if (!isAllList) {
                    const linkedIds = new Set(await resolveLinkedIds(id));
                    allNotes = allNotes.filter(n => linkedIds.has(String(n.companyId)));
                }

                // Map company details and invoice details
                allNotes = allNotes.map(n => {
                    const comp = compData.find(c => String(c._id) === String(n.companyId));
                    const invoice = invoicesData.find(inv =>
                        inv._id === n.toInvoiceId ||
                        inv.invoice_no === n.toInvoiceNo ||
                        inv.invoice_no === n.reference_invoice_no
                    );

                    // Extract stall from items description
                    let stallExtract = 'N/A';
                    let hallExtract = 'N/A';
                    const stallMatch = (n.items?.[0]?.description || invoice?.items?.[0]?.description || '').match(/Stall\s*(?:Booking)?\s*:\s*([\w-]+)/i);
                    if (stallMatch) stallExtract = stallMatch[1];
                    if (stallExtract === 'N/A' && comp?.stallNo) stallExtract = comp.stallNo;
                    if (comp?.hallNo) hallExtract = comp.hallNo;

                    return {
                        ...n,
                        companyName: comp?.companyName || comp?.name || n.clientName || 'Unknown Company',
                        hallStall: n.hall_stall || `Hall: ${hallExtract}, Stall: ${stallExtract}`,
                        totalAmount: n.totalAmount || n.total_value || 0,
                        mapped_invoice_date: invoice?.invoice_date || n.invoice_date,
                        originalAmount: invoice?.finalAmount || invoice?.invoice_amount || n.originalAmount
                    };
                });

                setCreditNotes(allNotes);
            } catch (err) {
                console.error("Failed to fetch", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isAllList, scopedEventId]);

    const handleOpenAddCreditNote = async () => {
        if (!isAllList) {
            navigate(`/dashboard/account/create-credit-note/${id}`);
        } else {
            setIsAddModalOpen(true);
            setLoadingCompanies(true);
            try {
                const res = await api.get('/api/companies');
                const compData = res.data?.data || res.data || [];
                const options = compData.map(c => ({ value: c._id, label: c.companyName || c.name || 'Unknown Company' }));
                setModalCompanies(options);
            } catch (error) {
                toast.error('Failed to load exhibitors');
            } finally {
                setLoadingCompanies(false);
            }
        }
    };

    const exportToExcel = async (rows, filename) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Credit Notes');
        worksheet.columns = [
            { header: 'S.No.', key: 'sno', width: 8 },
            { header: 'Credit Note No', key: 'note_no', width: 20 },
            { header: 'Invoice No', key: 'invoice_no', width: 20 },
            { header: 'Client', key: 'client', width: 25 },
            { header: 'Reason', key: 'reason', width: 30 },
            { header: 'Date', key: 'date', width: 16 },
            { header: 'Value', key: 'value', width: 16 },
            { header: 'Status', key: 'status', width: 14 },
        ];
        const headerRow = worksheet.getRow(1);
        headerRow.font = { name: 'Arial', family: 4, size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;

        rows.forEach((note, index) => {
            const row = worksheet.addRow({
                sno: index + 1,
                note_no: note.debit_note_no || note.create_note_no || note.est_no || 'N/A',
                invoice_no: note.toInvoiceNo || note.reference_invoice_no || note.est_no || 'N/A',
                client: note.clientName || note.companyName || 'N/A',
                reason: note.reason || 'N/A',
                date: note.debit_note_date || note.added ? new Date(note.debit_note_date || note.added).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A',
                value: Number(note.totalAmount !== undefined ? note.totalAmount : note.total_value) || 0,
                status: normalizeStatus(note.status),
            });
            row.getCell('value').numFmt = '₹#,##0.00';
            row.height = 20;
        });

        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFD4D4D8' } },
                    left: { style: 'thin', color: { argb: 'FFD4D4D8' } },
                    bottom: { style: 'thin', color: { argb: 'FFD4D4D8' } },
                    right: { style: 'thin', color: { argb: 'FFD4D4D8' } },
                };
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long' }).replace(/ /g, '');
        saveAs(new Blob([buffer]), `creditNoteExport_${formattedDate}.xlsx`);
    };

    const handleProceedAddCreditNote = () => {
        if (!selectedCompanyId) {
            toast.error('Please select an exhibitor first');
            return;
        }
        navigate(`/dashboard/account/create-credit-note/${selectedCompanyId}`);
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);

    // Real lifecycle status for this legacy model is just active/cancelled/updated
    // (there is no partial-adjustment tracking in the underlying CreditNote/DebitNote
    // schema) — a credit note takes full effect the moment it's active, and stops
    // applying the moment it's cancelled.
    const normalizeStatus = (status) => {
        const s = String(status || 'active').toLowerCase();
        if (s === 'cancelled') return 'Cancelled';
        if (s === 'updated') return 'Updated';
        return 'Active';
    };
    const getStatusBadge = (status) => {
        switch (normalizeStatus(status)) {
            case 'Cancelled': return <span className="text-[10px] font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded">Cancelled</span>;
            case 'Updated': return <span className="text-[10px] font-medium text-blue-500">Updated</span>;
            default: return <span className="text-[10px] font-medium text-emerald-600">Active</span>;
        }
    };

    // "Added By" is stored on the note as whatever string was passed at creation time —
    // sometimes a username, sometimes a full name (confirmed by real data: "test6", "Admin",
    // "Vansh Chaudhary" all appear) — so match against BOTH of the selected admin's fields.
    const selectedAdmin = adminUsers.find((u) => u.username === inlineSalesPerson);
    const selectedAdminNames = selectedAdmin ? [selectedAdmin.username, selectedAdmin.fullName].filter(Boolean) : [];

    // Apply Search + real filters (status/date-range/added-by)
    const filteredNotes = creditNotes.filter(n => {
        if (statusFilter !== 'All' && normalizeStatus(n.status) !== statusFilter) return false;
        if (inlineSalesPerson && !selectedAdminNames.includes(n.added_by)) return false;

        if (inlineDateRange) {
            const d = new Date(n.debit_note_date || n.added);
            if (isNaN(d.getTime())) return false;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (inlineDateRange === 'Today') {
                if (d.toDateString() !== today.toDateString()) return false;
            } else if (inlineDateRange === 'This Week') {
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                if (d < weekAgo || d > today) return false;
            } else if (inlineDateRange === 'This Month') {
                if (d.getMonth() !== today.getMonth() || d.getFullYear() !== today.getFullYear()) return false;
            }
        }

        if (!searchInput) return true;
        const s = searchInput.toLowerCase();
        return (
            (n.debit_note_no && n.debit_note_no.toLowerCase().includes(s)) ||
            (n.companyName && n.companyName.toLowerCase().includes(s)) ||
            (n.toInvoiceNo && n.toInvoiceNo.toLowerCase().includes(s))
        );
    });

    const totalNotes = filteredNotes.length;
    const totalValue = filteredNotes.reduce((sum, n) => sum + (Number(n.totalAmount) || 0), 0);
    // This legacy model has no partial-adjustment tracking: a note takes full effect the
    // moment it's active/updated, and none once cancelled — so "adjusted" is just the
    // active total, and "cancelled" (voided, never applied) replaces the old, always-zero
    // "outstanding" figure (there is no such field on CreditNote/DebitNote at all).
    const activeNotes = filteredNotes.filter(n => normalizeStatus(n.status) !== 'Cancelled');
    const cancelledNotes = filteredNotes.filter(n => normalizeStatus(n.status) === 'Cancelled');
    const totalAdjusted = activeNotes.reduce((sum, n) => sum + (Number(n.totalAmount) || 0), 0);
    const totalCancelled = cancelledNotes.reduce((sum, n) => sum + (Number(n.totalAmount) || 0), 0);

    const adjustedPct = totalValue > 0 ? ((totalAdjusted / totalValue) * 100).toFixed(2) + '%' : '0%';
    const cancelledPct = totalValue > 0 ? ((totalCancelled / totalValue) * 100).toFixed(2) + '%' : '0%';

    const cancelledCount = cancelledNotes.length;

    const refundsIssued = 0; // No refund tracking exists yet anywhere in this system
    const avgValue = totalNotes > 0 ? (totalValue / totalNotes) : 0;

    const now = new Date();
    const thisMonthNotes = filteredNotes.filter((n) => {
        const d = new Date(n.debit_note_date || n.added);
        return !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const thisMonthValue = thisMonthNotes.reduce((sum, n) => sum + (Number(n.totalAmount) || 0), 0);

    // Pagination state derived
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredNotes.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(totalNotes / itemsPerPage);

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-2 font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Credit Notes</h1>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                        <span>Accounts Management</span>
                        <ChevronRight className="w-3 h-3" />
                        <span>Billing & Invoices</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-blue-600 font-bold">Credit Notes</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
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
                        onClick={() => navigate('/account-debit-notes')}
                        className="px-3 py-1.5 rounded text-xs font-bold border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                        Debit Notes
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-2">
                <StatCard
                    icon={<FileText className="w-4 h-4 text-blue-600" />} iconBg="bg-blue-100"
                    rawValue={totalNotes} displayValue={totalNotes.toString()}
                    label="Total Credit Notes" subLabel={`Value: ${formatCurrency(totalValue)}`}
                />
                <StatCard
                    icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />} iconBg="bg-emerald-100"
                    rawValue={totalAdjusted} displayValue={formatCurrency(totalAdjusted)} isCurrency
                    label="Total Adjusted" subLabel={`${adjustedPct} of Value`}
                />
                <StatCard
                    icon={<AlertTriangle className="w-4 h-4 text-orange-600" />} iconBg="bg-orange-100"
                    rawValue={totalCancelled} displayValue={formatCurrency(totalCancelled)} isCurrency
                    label="Cancelled" subLabel={`${cancelledCount} Voided Notes`}
                />
                <StatCard
                    icon={<Calendar className="w-4 h-4 text-indigo-600" />} iconBg="bg-indigo-100"
                    rawValue={thisMonthValue} displayValue={formatCurrency(thisMonthValue)} isCurrency
                    label="This Month Issued" subLabel={`${thisMonthNotes.length} Credit Notes`}
                />
                <StatCard
                    icon={<RefreshCcw className="w-4 h-4 text-purple-600" />} iconBg="bg-purple-100"
                    rawValue={refundsIssued} displayValue={formatCurrency(refundsIssued)} isCurrency
                    label="Refunds Issued" subLabel="Total Refunded"
                />
                <StatCard
                    icon={<Activity className="w-4 h-4 text-blue-600" />} iconBg="bg-blue-100"
                    rawValue={avgValue} displayValue={formatCurrency(avgValue)} isCurrency
                    label="Avg Credit Note Value" subLabel="Overall"
                />
            </div>

            {/* Filter Row */}
            <div className="bg-white p-3 py-1 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-3 mb-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide w-full">
                    <div className="relative shrink-0">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => { setSearchInput(e.target.value); setCurrentPage(1); }}
                            placeholder="Search by credit note no., client..."
                            className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-[11px] w-[260px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <select
                        value={inlineDateRange}
                        onChange={(e) => { setInlineDateRange(e.target.value); setCurrentPage(1); }}
                        className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white"
                    >
                        <option value="">Date Range</option>
                        <option value="Today">Today</option>
                        <option value="This Week">This Week</option>
                        <option value="This Month">This Month</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white"
                    >
                        <option value="All">Status</option>
                        <option value="Active">Active</option>
                        <option value="Updated">Updated</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                    <select
                        value={inlineSalesPerson}
                        onChange={(e) => { setInlineSalesPerson(e.target.value); setCurrentPage(1); }}
                        className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white"
                    >
                        <option value="">Added By</option>
                        {adminUsers.map((u) => (
                            <option key={u._id} value={u.username}>{u.fullName || u.username}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => {
                            setSearchInput('');
                            setInlineDateRange('');
                            setStatusFilter('All');
                            setInlineSalesPerson('');
                        }}
                        className="flex items-center gap-1 text-blue-600 font-bold text-[11px] px-2 shrink-0"
                    >
                        <RefreshCcw className="w-3 h-3" /> Reset
                    </button>
                    <div className="flex-1" />
                    <button
                        onClick={() => exportToExcel(filteredNotes)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 rounded-md text-[11px] font-bold border border-slate-300 hover:bg-slate-50 transition-colors shrink-0 whitespace-nowrap"
                    >
                        <Download className="w-3.5 h-3.5" /> Export Excel
                    </button>
                    <button
                        onClick={handleOpenAddCreditNote}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md text-[11px] font-bold hover:bg-blue-700 transition-colors shrink-0 whitespace-nowrap"
                    >
                        <FilePlus className="w-3.5 h-3.5" /> Create Credit Note
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-auto max-h-[460px]">
                <table className="w-full min-w-[1300px] text-left border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-white text-[8px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 whitespace-nowrap">
                            <th className="px-2 py-1 text-center">S.No.</th>
                            <th className="px-2 py-1">Credit Note Details</th>
                            <th className="px-2 py-1">Invoice Details</th>
                            <th className="px-2 py-1">Client & Stall</th>
                            <th className="px-2 py-1">Type & Reason</th>
                            <th className="px-2 py-1 text-center">Date</th>
                            <th className="px-2 py-1 text-right">Value</th>
                            <th className="px-2 py-1 text-right">Adjusted</th>
                            <th className="px-2 py-1 text-right">Outstanding</th>
                            <th className="px-2 py-1 text-center">Status</th>
                            <th className="px-2 py-1 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-[11px] whitespace-nowrap">
                        {currentItems.length === 0 && (
                            <tr className="border-b border-slate-100"><td colSpan={11} className="py-8 text-center text-slate-400 h-[33px]">No credit notes found.</td></tr>
                        )}
                        {currentItems.map((note, idx) => {
                            const noteTotal = note.totalAmount !== undefined ? note.totalAmount : note.total_value;
                            const isCancelledNote = normalizeStatus(note.status) === 'Cancelled';
                            const adjustedAmt = isCancelledNote ? 0 : (Number(noteTotal) || 0);
                            const outstandingAmt = isCancelledNote ? (Number(noteTotal) || 0) : 0;
                            return (
                                <tr key={note._id || idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-2 py-1 font-bold text-slate-700 text-center">{indexOfFirstItem + idx + 1}</td>
                                    <td className="px-2 py-1">
                                        <div className="font-bold text-slate-800 text-[11px]">{note.debit_note_no || note.create_note_no || note.est_no || 'N/A'}</div>
                                        {/* Both _source values are credit-adjustment documents on this page (see backend/services/ledgerTotals.js) — always label the date as a Credit Note date so it isn't misread as a debit (charge-increasing) document. */}
                                        <div className="text-[10px] text-slate-500 mt-0.5">Credit Note Date: {note.debit_note_date || note.added ? new Date(note.debit_note_date || note.added).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A'}</div>
                                    </td>
                                    <td className="px-2 py-1">
                                        <div className="font-bold text-slate-800 text-[11px]">{note.toInvoiceNo || note.reference_invoice_no || note.est_no || 'N/A'}</div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">Invoice Date: {note.mapped_invoice_date ? new Date(note.mapped_invoice_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A'}</div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">Invoice Value: {note.originalAmount !== undefined ? formatCurrency(note.originalAmount) : (note.invoice_amount !== undefined ? formatCurrency(note.invoice_amount) : 'N/A')}</div>
                                    </td>
                                    <td className="px-2 py-1">
                                        <div className="font-bold text-blue-600 text-[11px] mb-0.5 cursor-pointer hover:underline">{note.clientName || note.companyName || 'N/A'}</div>
                                        <div className="text-[10px] text-slate-500">{note.hallStall ? note.hallStall.split(',')[1]?.trim() : 'N/A'}</div>
                                    </td>
                                    <td className="px-2 py-1">
                                        <div className="font-bold text-slate-800 text-[11px] mb-0.5">
                                            {(note.type || note.credit_note_type)
                                                ? (note.type || note.credit_note_type).split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                                : 'N/A'}
                                        </div>
                                        <div className="group relative w-32">
                                            <div className="text-[10px] text-slate-500 truncate cursor-help">
                                                {note.reason || 'N/A'}
                                            </div>
                                            {(note.reason && note.reason !== 'N/A') && (
                                                <div className="absolute z-[999] left-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg whitespace-normal leading-tight">
                                                    {note.reason}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-2 py-1 font-bold text-[11px] text-slate-700 text-center">
                                        {note.debit_note_date || note.added ? new Date(note.debit_note_date || note.added).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A'}
                                    </td>
                                    <td className="px-2 py-1 text-right">
                                        <div className="font-bold text-emerald-600 text-[11px]">{formatCurrency(note.totalAmount !== undefined ? note.totalAmount : note.total_value)}</div>
                                    </td>
                                    <td className="px-2 py-1 text-right">
                                        <div className="font-bold text-slate-800 text-[11px]">{formatCurrency(adjustedAmt)}</div>
                                        <div className="text-[10px] text-slate-500 font-bold mt-0.5">{noteTotal > 0 ? Math.round((adjustedAmt / noteTotal) * 100) : 0}%</div>
                                    </td>
                                    <td className="px-2 py-1 text-right">
                                        <div className={`font-bold text-[11px] ${outstandingAmt > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                                            {formatCurrency(outstandingAmt)}
                                        </div>
                                    </td>
                                    <td className="px-2 py-1 text-center">
                                        {getStatusBadge(note.status)}
                                    </td>
                                    <td className="px-2 py-1">
                                        <div className="flex items-center justify-center gap-1.5">
                                            {note._source === 'creditnote' && (
                                                <>
                                                    <button onClick={() => navigate(`/credit-note-view/${note._id}`)} className="w-6 h-6 flex items-center justify-center text-emerald-600 bg-emerald-50/50 border border-emerald-100 rounded hover:bg-emerald-100 transition-colors" title="View / print credit note"><FileText className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => navigate(`/dashboard/account/create-credit-note/${note.companyId}?edit=${note._id}`)} className="w-6 h-6 flex items-center justify-center text-amber-600 bg-amber-50/50 border border-amber-100 rounded hover:bg-amber-100 transition-colors" title="Edit credit note"><SquarePen className="w-3.5 h-3.5" /></button>
                                                </>
                                            )}
                                            <button onClick={() => navigate(isAllList ? '/accounts/client-ledger' : `/dashboard/account/client-ledger/${id}`)} className="w-6 h-6 flex items-center justify-center text-blue-600 bg-blue-50/50 border border-blue-100 rounded hover:bg-blue-100 transition-colors" title="View client ledger"><Eye className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {currentItems.length < itemsPerPage &&
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
                <div>
                    Showing {totalNotes === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalNotes)} of {totalNotes} entries
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

            {/* Financial Summary Bar */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm mt-2 px-6 py-4 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Credit Note Value</span>
                    <span className="text-sm font-black text-slate-800">{formatCurrency(totalValue)}</span>
                </div>
                <div className="w-px h-10 bg-slate-200 mx-2"></div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Adjusted</span>
                    <span className="text-sm font-black text-slate-800">{formatCurrency(totalAdjusted)} <span className="text-[10px] font-medium text-emerald-600 normal-case">({adjustedPct})</span></span>
                </div>
                <div className="w-px h-10 bg-slate-200 mx-2"></div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Cancelled</span>
                    <span className="text-sm font-black text-rose-600">{formatCurrency(totalCancelled)} <span className="text-[10px] font-medium text-rose-600 normal-case">({cancelledPct})</span></span>
                </div>
                <div className="w-px h-10 bg-slate-200 mx-2"></div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Refunds Issued</span>
                    <span className="text-sm font-black text-slate-800">{formatCurrency(refundsIssued)}</span>
                </div>
                <div className="w-px h-10 bg-slate-200 mx-2"></div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Avg Adjustment Days</span>
                    <span className="text-sm font-black text-slate-800">0 Days</span>
                </div>
                <div className="w-px h-10 bg-slate-200 mx-2"></div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Total Credit Notes</span>
                    <span className="text-sm font-black text-slate-800">{totalNotes}</span>
                </div>
            </div>

            {/* Add Credit Note Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="font-semibold text-slate-800 text-sm">Select Client</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-4">
                            <label className="block text-[11px] font-medium text-slate-700 mb-2">Search & Select Company</label>
                            <Select
                                options={modalCompanies}
                                isLoading={loadingCompanies}
                                onChange={(selected) => setSelectedCompanyId(selected ? selected.value : '')}
                                placeholder="Select exhibitor..."
                                className="text-xs"
                                isClearable
                                menuPortalTarget={document.body}
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            />
                        </div>
                        <div className="p-3 border-t border-gray-100 flex justify-end gap-2 bg-slate-50 rounded-b-lg">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-3 py-1.5 text-[11px] font-medium text-slate-600 bg-white border border-gray-200 rounded hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleProceedAddCreditNote}
                                className="px-3 py-1.5 text-[11px] font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                                disabled={!selectedCompanyId}
                            >
                                Proceed
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditNotesView;
