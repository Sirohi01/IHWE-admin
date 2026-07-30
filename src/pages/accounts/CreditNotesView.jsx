import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FileText, Download, Search, Plus, Eye, Filter, CheckCircle2, AlertTriangle, RefreshCcw, Activity, Calendar, BarChart2, FilePlus, ChevronRight, ChevronDown, Building2, SquarePen } from 'lucide-react';
import api from '../../lib/api';
import { resolveLinkedIds } from '../../utils/resolveLinkedIds';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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
    const [dateRangeOpen, setDateRangeOpen] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');
    const [inlineDateRange, setInlineDateRange] = useState('');
    const [inlineSalesPerson, setInlineSalesPerson] = useState('');
    const [events, setEvents] = useState([]);
    const [filterEvent, setFilterEvent] = useState(scopedEventId || 'all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

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
                const [cnRes, dnRes, compRes, adminRes, invRes, eventsRes] = await Promise.all([
                    api.get('/api/creditnotes', { params: scopedEventId ? { eventId: scopedEventId } : {} }).catch(() => ({ data: { data: [] } })),
                    api.get('/api/debitnotes', { params: scopedEventId ? { eventId: scopedEventId } : {} }).catch(() => ({ data: { data: [] } })),
                    api.get('/api/companies'),
                    api.get('/api/admin/all').catch(() => ({ data: { data: [] } })),
                    api.get('/api/invoices', { params: scopedEventId ? { eventId: scopedEventId } : {} }).catch(() => ({ data: [] })),
                    api.get('/api/events').catch(() => ({ data: { data: [] } }))
                ]);

                const eventsData = eventsRes.data?.data || eventsRes.data || [];
                eventsData.sort((a, b) => (a.order || 0) - (b.order || 0));
                setEvents(eventsData);
                if (!scopedEventId && eventsData.length > 0) {
                    setFilterEvent(eventsData[0]._id);
                }

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
        if (filterEvent !== 'all' && String(n.eventId || '') !== String(filterEvent)) return false;
        if (statusFilter !== 'All' && normalizeStatus(n.status) !== statusFilter) return false;
        if (inlineSalesPerson && !selectedAdminNames.includes(n.added_by)) return false;

        if (fromDate || toDate) {
            const d = new Date(n.debit_note_date || n.added);
            if (isNaN(d.getTime())) return false;
            if (fromDate && d < new Date(fromDate)) return false;
            if (toDate && d > new Date(new Date(toDate).setHours(23, 59, 59, 999))) return false;
        }

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

    const activeCount = filteredNotes.filter(n => normalizeStatus(n.status) === 'Active').length;
    const updatedCount = filteredNotes.filter(n => normalizeStatus(n.status) === 'Updated').length;
    const cancelledCount = cancelledNotes.length;

    const pieData = [
        { name: 'Active', value: activeCount, color: '#059669' },
        { name: 'Updated', value: updatedCount, color: '#2563eb' },
        { name: 'Cancelled', value: cancelledCount, color: '#e11d48' },
    ];

    const totalStatusCount = pieData.reduce((sum, item) => sum + item.value, 0) || 1;

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
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-2">
            {/* Header Area */}
            <div className="px-6 py-2 flex justify-between items-center bg-white sticky top-0 z-40 border-b border-gray-100">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-1">
                        Credit Notes
                    </h1>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                        Accounts Receivable (AR) <ChevronRight className="w-3 h-3 text-slate-400" /> <span className="text-slate-700">Credit Notes</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setDateRangeOpen(!dateRangeOpen)}
                            className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50"
                        >
                            <Calendar className="w-4 h-4 text-slate-500" />
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
                            className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 cursor-pointer pointer-events-none"
                        >
                            <Building2 className="w-4 h-4 text-slate-500" />
                            <select
                                value={filterEvent}
                                onChange={(e) => setFilterEvent(e.target.value)}
                                className="appearance-none bg-transparent border-none text-slate-700 focus:outline-none focus:ring-0 cursor-pointer pointer-events-auto pr-2 max-w-[150px] truncate"
                            >
                                <option value="all">All Events</option>
                                {events.map(event => <option key={event._id} value={event._id}>{event.name}</option>)}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 -ml-1" />
                        </button>
                    </div>
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
                                            <option value="Active">Active</option>
                                            <option value="Updated">Updated</option>
                                            <option value="Cancelled">Cancelled</option>
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
                    <button onClick={handleOpenAddCreditNote} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors">
                        <Plus className="w-4 h-4" /> Create Credit Note
                    </button>
                </div>
            </div>

            <div className="px-6 py-2">
                <div className="flex flex-col xl:flex-row gap-2">
                    {/* Left Main Content */}
                    <div className="flex-1 space-y-2 min-w-0">

                        {/* Stat Cards Row */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
                            <StatCard
                                icon={<FileText className="w-4 h-4 text-blue-600" />} iconBg="bg-blue-100"
                                rawValue={totalNotes} displayValue={totalNotes.toString()}
                                label="Total Credit Notes" subLabel={`Against ${totalNotes} Invoices`}
                                bottomLabel="Total Value" bottomValue={`₹ ${formatCurrency(totalValue)}`}
                            />
                            <StatCard
                                icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />} iconBg="bg-emerald-100"
                                rawValue={totalAdjusted} displayValue={`₹ ${formatCurrency(totalAdjusted)}`} isCurrency
                                label="Total Adjusted" subLabel="Already Adjusted"
                                bottomLabel="% of Value" bottomValue={`${adjustedPct}%`}
                            />
                            <StatCard
                                icon={<AlertTriangle className="w-4 h-4 text-orange-600" />} iconBg="bg-orange-100"
                                rawValue={totalCancelled} displayValue={`₹ ${formatCurrency(totalCancelled)}`} isCurrency
                                label="Cancelled" subLabel={`${cancelledCount} Voided Notes`}
                                bottomLabel="% of Value" bottomValue={`${cancelledPct}%`}
                            />
                            <StatCard
                                icon={<Calendar className="w-4 h-4 text-indigo-600" />} iconBg="bg-indigo-100"
                                rawValue={thisMonthValue} displayValue={`₹ ${formatCurrency(thisMonthValue)}`} isCurrency
                                label="This Month Issued" subLabel={`${thisMonthNotes.length} Credit Notes`}
                                bottomLabel="" bottomValue=""
                            />
                            <StatCard
                                icon={<RefreshCcw className="w-4 h-4 text-purple-600" />} iconBg="bg-purple-100"
                                rawValue={refundsIssued} displayValue={`₹ ${formatCurrency(refundsIssued)}`} isCurrency
                                label="Refunds Issued" subLabel="Total Refunded"
                                bottomLabel="Refunds" bottomValue="0 Refunds"
                            />
                            <StatCard
                                icon={<Activity className="w-4 h-4 text-blue-600" />} iconBg="bg-blue-100"
                                rawValue={avgValue} displayValue={`₹ ${formatCurrency(avgValue)}`} isCurrency
                                label="Avg Credit Note Value" subLabel="Overall"
                                bottomLabel="" bottomValue="Avg. per Credit Note"
                            />
                        </div>

                        {/* Filters Row */}
                        <div className="bg-white rounded border border-gray-200 px-3 py-2 mb-3">
                            <div className="flex flex-col gap-3">
                                {/* Top Row: Filter Controls */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="relative">
                                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={searchInput}
                                            onChange={(e) => {
                                                setSearchInput(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            placeholder="Search by credit note no., client..."
                                            className="pl-8 pr-3 py-1.5 border border-gray-200 rounded text-[11px] w-56 focus:outline-none focus:border-blue-400 placeholder:text-slate-400"
                                        />
                                    </div>
                                    <select
                                        value={inlineDateRange}
                                        onChange={(e) => { setInlineDateRange(e.target.value); setCurrentPage(1); }}
                                        className="border border-gray-200 rounded text-[11px] px-2 py-1.5 outline-none text-slate-600 bg-white"
                                    >
                                        <option value="">Date Range</option>
                                        <option value="Today">Today</option>
                                        <option value="This Week">This Week</option>
                                        <option value="This Month">This Month</option>
                                    </select>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                        className="border border-gray-200 rounded text-[11px] px-2 py-1.5 outline-none text-slate-600 bg-white"
                                    >
                                        <option value="All">Status</option>
                                        <option value="Active">Active</option>
                                        <option value="Updated">Updated</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                    <select
                                        value={inlineSalesPerson}
                                        onChange={(e) => { setInlineSalesPerson(e.target.value); setCurrentPage(1); }}
                                        className="border border-gray-200 rounded text-[11px] px-2 py-1.5 outline-none text-slate-600 bg-white"
                                    >
                                        <option value="">Added By</option>
                                        {adminUsers.map((u) => (
                                            <option key={u._id} value={u.username}>{u.fullName || u.username}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Bottom Row: Action Buttons */}
                                <div className="flex flex-wrap items-center justify-end gap-2">
                                    <button
                                        onClick={() => exportToExcel(filteredNotes)}
                                        className="flex items-center px-4 py-2 bg-white text-slate-700 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 transition-colors border border-slate-300"
                                    >
                                        <Download className="w-3 h-3 mr-1.5" /> Export Excel
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Table */}
                        <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse whitespace-nowrap">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="py-1 px-2 text-[8px] font-bold text-slate-700 uppercase tracking-wider w-10 text-center">S.NO.</th>
                                            <th className="py-1 px-2 text-[8px] font-bold text-slate-700 uppercase tracking-wider">CREDIT NOTE DETAILS</th>
                                            <th className="py-1 px-2 text-[8px] font-bold text-slate-700 uppercase tracking-wider">INVOICE DETAILS</th>
                                            <th className="py-1 px-2 text-[8px] font-bold text-slate-700 uppercase tracking-wider">CLIENT & STALL</th>
                                            <th className="py-1 px-2 text-[8px] font-bold text-slate-700 uppercase tracking-wider">CREDIT NOTE TYPE & REASON</th>
                                            <th className="py-1 px-2 text-[8px] font-bold text-slate-700 uppercase tracking-wider text-center">CREDIT NOTE DATE</th>
                                            <th className="py-1 px-2 text-[8px] font-bold text-slate-700 uppercase tracking-wider text-right">CREDIT NOTE VALUE</th>
                                            <th className="py-1 px-2 text-[8px] font-bold text-slate-700 uppercase tracking-wider text-right">ADJUSTED AMOUNT</th>
                                            <th className="py-1 px-2 text-[8px] font-bold text-slate-700 uppercase tracking-wider text-right">OUTSTANDING AMOUNT</th>
                                            <th className="py-1 px-2 text-[8px] font-bold text-slate-700 uppercase tracking-wider text-center">STATUS</th>
                                            <th className="py-1 px-2 text-[8px] font-bold text-slate-700 uppercase tracking-wider text-center">ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 text-[11px]">
                                        {currentItems.map((note, idx) => {
                                            const noteTotal = note.totalAmount !== undefined ? note.totalAmount : note.total_value;
                                            const isCancelledNote = normalizeStatus(note.status) === 'Cancelled';
                                            const adjustedAmt = isCancelledNote ? 0 : (Number(noteTotal) || 0);
                                            const outstandingAmt = isCancelledNote ? (Number(noteTotal) || 0) : 0;
                                            return (
                                                <tr key={note._id || idx} className="hover:bg-slate-50/50">
                                                    <td className="py-1 px-2 font-bold text-slate-700 text-center">{indexOfFirstItem + idx + 1}</td>
                                                    <td className="py-1 px-2">
                                                        <div className="font-bold text-slate-800 text-[11px]">{note.debit_note_no || note.create_note_no || note.est_no || 'N/A'}</div>
                                                        {/* Both _source values are credit-adjustment documents on this page (see backend/services/ledgerTotals.js) — always label the date as a Credit Note date so it isn't misread as a debit (charge-increasing) document. */}
                                                        <div className="text-[10px] text-slate-500 mt-0.5">Credit Note Date: {note.debit_note_date || note.added ? new Date(note.debit_note_date || note.added).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A'}</div>
                                                        {/* <div className="text-[10px] font-bold text-blue-600 mt-0.5 cursor-pointer hover:underline">View Details <ChevronRight className="inline w-3 h-3 rotate-90" /></div> */}
                                                    </td>
                                                    <td className="py-1 px-2">
                                                        <div className="font-bold text-slate-800 text-[11px]">{note.toInvoiceNo || note.reference_invoice_no || note.est_no || 'N/A'}</div>
                                                        <div className="text-[10px] text-slate-500 mt-0.5">Invoice Date: {note.mapped_invoice_date ? new Date(note.mapped_invoice_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A'}</div>
                                                        <div className="text-[10px] text-slate-500 mt-0.5">Invoice Value: {note.originalAmount !== undefined ? `₹ ${formatCurrency(note.originalAmount)}` : (note.invoice_amount !== undefined ? `₹ ${formatCurrency(note.invoice_amount)}` : 'N/A')}</div>
                                                    </td>
                                                    <td className="py-1 px-2">
                                                        <div className="font-bold text-blue-600 text-[11px] mb-0.5 cursor-pointer hover:underline">{note.clientName || note.companyName || 'N/A'}</div>
                                                        <div className="text-[10px] text-slate-500">{note.hallStall ? note.hallStall.split(',')[1]?.trim() : 'N/A'}</div>
                                                    </td>
                                                    <td className="py-1 px-2">
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
                                                    <td className="py-1 px-2 font-bold text-[11px] text-slate-700 text-center">
                                                        {note.debit_note_date || note.added ? new Date(note.debit_note_date || note.added).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A'}
                                                    </td>
                                                    <td className="py-1 px-2 text-right">
                                                        <div className="font-bold text-emerald-600 text-[11px]">₹ {formatCurrency(note.totalAmount !== undefined ? note.totalAmount : note.total_value)}</div>
                                                    </td>
                                                    <td className="py-1 px-2 text-right">
                                                        <div className="font-bold text-slate-800 text-[11px]">₹ {formatCurrency(adjustedAmt)}</div>
                                                        <div className="text-[10px] text-slate-500 font-bold mt-0.5">{noteTotal > 0 ? Math.round((adjustedAmt / noteTotal) * 100) : 0}%</div>
                                                    </td>
                                                    <td className="py-1 px-2 text-right">
                                                        <div className={`font-bold text-[11px] ${outstandingAmt > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                                                            ₹ {formatCurrency(outstandingAmt)}
                                                        </div>
                                                    </td>
                                                    <td className="py-1 px-2 text-center">
                                                        {getStatusBadge(note.status)}
                                                    </td>
                                                    <td className="py-1 px-2 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            {note._source === 'creditnote' && (
                                                                <>
                                                                    <button onClick={() => navigate(`/credit-note-view/${note._id}`)} className="w-6 h-6 flex items-center justify-center text-emerald-600 bg-emerald-50/50 border border-emerald-100 rounded hover:bg-emerald-100 transition-colors" title="View / print credit note"><FileText className="w-3.5 h-3.5" /></button>
                                                                    <button onClick={() => navigate(`/dashboard/account/create-credit-note/${note.companyId}?edit=${note._id}`)} className="w-6 h-6 flex items-center justify-center text-amber-600 bg-amber-50/50 border border-amber-100 rounded hover:bg-amber-100 transition-colors" title="Edit credit note"><SquarePen className="w-3.5 h-3.5" /></button>
                                                                </>
                                                            )}
                                                            <button onClick={() => navigate(`/dashboard/account/client-ledger/${note.companyId}`)} className="w-6 h-6 flex items-center justify-center text-blue-600 bg-blue-50/50 border border-blue-100 rounded hover:bg-blue-100 transition-colors" title="View client ledger"><Eye className="w-3.5 h-3.5" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between p-3 border-t border-gray-100 bg-white">
                                <div className="text-[11px] text-slate-600">
                                    Showing {totalNotes === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalNotes)} of {totalNotes} entries
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 disabled:opacity-50"><ChevronRight className="w-3.5 h-3.5 rotate-180" /></button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-6 h-6 flex items-center justify-center rounded text-[11px] font-medium ${currentPage === page ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 disabled:opacity-50"><ChevronRight className="w-3.5 h-3.5" /></button>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                                    Rows per page:
                                    <div className="relative">
                                        <select className="border-none bg-transparent outline-none pr-3 appearance-none cursor-pointer">
                                            <option>10</option>
                                        </select>
                                        <ChevronRight className="w-3 h-3 text-slate-400 absolute right-0 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Totals */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2 px-3 flex items-center justify-between overflow-x-auto mt-2">
                            <div className="flex items-center flex-1 divide-x divide-slate-200 min-w-max">
                                <div className="pr-3 text-center">
                                    <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">TOTAL CREDIT NOTE VALUE</div>
                                    <div className="text-[11px] font-bold text-slate-800">₹ {formatCurrency(totalValue)}</div>
                                </div>
                                <div className="px-3 text-center">
                                    <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">TOTAL ADJUSTED</div>
                                    <div className="text-[11px] font-bold text-slate-800 flex items-center justify-center gap-2">
                                        <span>₹ {formatCurrency(totalAdjusted)}</span>
                                        <span className="text-[9px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">↑ {adjustedPct}</span>
                                    </div>
                                </div>
                                <div className="px-3 text-center">
                                    <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">TOTAL CANCELLED</div>
                                    <div className="text-[11px] font-bold text-slate-800 flex items-center justify-center gap-2">
                                        <span>₹ {formatCurrency(totalCancelled)}</span>
                                        <span className="text-[9px] text-rose-600 font-medium bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100">{cancelledPct}</span>
                                    </div>
                                </div>
                                <div className="px-3 text-center">
                                    <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">TOTAL REFUNDS ISSUED</div>
                                    <div className="text-[11px] font-bold text-slate-800">₹ {formatCurrency(refundsIssued)}</div>
                                </div>
                                <div className="px-3 text-center">
                                    <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">AVG ADJUSTMENT DAYS</div>
                                    <div className="text-[11px] font-bold text-slate-800">0 Days</div>
                                </div>
                                <div className="pl-3 text-center">
                                    <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">TOTAL CREDIT NOTES</div>
                                    <div className="text-[11px] font-bold text-slate-800">{totalNotes}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="w-full xl:w-72 shrink-0 space-y-2 sticky top-4">

                        {/* Summary Widget */}
                        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                            <h2 className="text-sm font-semibold text-slate-800 mb-3 tracking-wide">Credit Note Summary</h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><FileText className="w-3.5 h-3.5" /></div>
                                    <div>
                                        <div className="text-[10px] font-semibold text-slate-600">Total Credit Notes</div>
                                        <div className="font-bold text-slate-800 text-xs">{totalNotes}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><Calendar className="w-3.5 h-3.5" /></div>
                                    <div>
                                        <div className="text-[10px] font-semibold text-slate-600">Total Value</div>
                                        <div className="font-bold text-slate-800 text-xs">₹ {formatCurrency(totalValue)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                                    <div>
                                        <div className="text-[10px] font-semibold text-slate-600">Total Adjusted</div>
                                        <div className="font-bold text-slate-800 text-xs">₹ {formatCurrency(totalAdjusted)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-md bg-rose-50 flex items-center justify-center text-rose-600 shrink-0"><AlertTriangle className="w-3.5 h-3.5" /></div>
                                    <div>
                                        <div className="text-[10px] font-semibold text-slate-600">Total Cancelled</div>
                                        <div className="font-bold text-slate-800 text-xs">₹ {formatCurrency(totalCancelled)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-md bg-purple-50 flex items-center justify-center text-purple-600 shrink-0"><RefreshCcw className="w-3.5 h-3.5" /></div>
                                    <div>
                                        <div className="text-[10px] font-semibold text-slate-600">Refunds Issued</div>
                                        <div className="font-bold text-slate-800 text-xs">₹ {formatCurrency(refundsIssued)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><Activity className="w-3.5 h-3.5" /></div>
                                    <div>
                                        <div className="text-[10px] font-semibold text-slate-600">Avg Adjustment Days</div>
                                        <div className="font-bold text-slate-800 text-xs">0 Days</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Widget */}
                        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                            <h2 className="text-sm font-semibold text-slate-800 mb-3 tracking-wide">Quick Actions</h2>
                            <div className="space-y-1">
                                <button onClick={handleOpenAddCreditNote} className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors group text-left">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><FilePlus className="w-3.5 h-3.5" /></div>
                                        <div>
                                            <div className="text-[11px] font-semibold text-slate-800 leading-tight">Create Credit Note</div>
                                            <div className="text-[9px] font-medium text-slate-500 mt-0.5">Generate new credit note</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-3 h-3 text-slate-300" />
                                </button>
                                <button disabled title="Coming soon" className="w-full flex items-center justify-between p-2 rounded transition-colors group text-left opacity-50 cursor-not-allowed">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-6 h-6 rounded bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                                        <div>
                                            <div className="text-[11px] font-semibold text-slate-800 leading-tight">Adjust Credit Note</div>
                                            <div className="text-[9px] font-medium text-slate-500 mt-0.5">Coming soon</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-3 h-3 text-slate-300" />
                                </button>
                                <button disabled title="Coming soon" className="w-full flex items-center justify-between p-2 rounded transition-colors group text-left opacity-50 cursor-not-allowed">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-6 h-6 rounded bg-purple-50 flex items-center justify-center text-purple-600 shrink-0"><RefreshCcw className="w-3.5 h-3.5" /></div>
                                        <div>
                                            <div className="text-[11px] font-semibold text-slate-800 leading-tight">Issue Refund</div>
                                            <div className="text-[9px] font-medium text-slate-500 mt-0.5">Coming soon</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-3 h-3 text-slate-300" />
                                </button>
                                <button
                                    onClick={() => navigate(isAllList ? '/accounts/client-ledger' : `/dashboard/account/client-ledger/${id}`)}
                                    className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors group text-left"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0"><FileText className="w-3.5 h-3.5" /></div>
                                        <div>
                                            <div className="text-[11px] font-semibold text-slate-800 leading-tight">View Ledger</div>
                                            <div className="text-[9px] font-medium text-slate-500 mt-0.5">Detailed credit note history</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-3 h-3 text-slate-300" />
                                </button>
                                <button disabled title="Coming soon" className="w-full flex items-center justify-between p-2 rounded transition-colors group text-left opacity-50 cursor-not-allowed">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><BarChart2 className="w-3.5 h-3.5" /></div>
                                        <div>
                                            <div className="text-[11px] font-semibold text-slate-800 leading-tight">Download Report</div>
                                            <div className="text-[10px] font-medium text-slate-500 mt-0.5">Coming soon</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-3 h-3 text-slate-300" />
                                </button>
                            </div>
                        </div>

                        {/* Chart Widget */}
                        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                            <h2 className="text-sm font-semibold text-slate-800 mb-3 tracking-wide">Credit Note Status Overview</h2>

                            <div className="flex items-center justify-between h-[100px]">
                                <div className="w-[100px] h-full shrink-0 -ml-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={30}
                                                outerRadius={45}
                                                paddingAngle={2}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-col gap-1 shrink-0">
                                    {pieData.map((item, i) => {
                                        const pct = totalStatusCount > 0 ? ((item.value / totalStatusCount) * 100).toFixed(2) : 0;
                                        return (
                                            <div key={i} className="flex flex-col items-center justify-between gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                    <span className="text-[10px] font-semibold text-slate-600">{item.name}</span>
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-800 text-right">
                                                    {item.value} <span className="font-medium text-slate-500 ml-0.5">({pct}%)</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="mt-2 text-center">
                                <button disabled title="Coming soon" className="text-blue-600 text-[11px] font-bold tracking-wide opacity-50 cursor-not-allowed">
                                    View All Reports →
                                </button>
                            </div>
                        </div>

                    </div>
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
