import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FileText, Download, Search, Plus, Eye, Filter, Wallet, CheckCircle2, AlertTriangle,
    Calendar, FileSpreadsheet, BarChart2, ChevronRight, ArrowRightCircle, ChevronDown,
    Mail, MessageCircleMore, Loader2, MoreVertical, Users, TrendingUp, Bell, RefreshCw,
    IndianRupee, Calculator, ClipboardList, ArrowDownLeft, CalendarCheck
} from 'lucide-react';
import api, { SERVER_URL } from '../../lib/api';
import toast from 'react-hot-toast';
import Select from 'react-select';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useDispatch } from 'react-redux';
import { createActivityLogThunk } from '../../features/activityLog/activityLogSlice';
import { getCurrentUserName } from '../../utils/currentUser';

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

function AnimatedStatCard({ icon, title, value, subText1, subText2, iconBg, valueColor, percentage }) {
    const { ref, count } = useCountUp(typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : value);
    
    let gradientTo = 'to-slate-50';
    const bgClass = iconBg || '';
    if (bgClass.includes('emerald')) gradientTo = 'to-emerald-50';
    else if (bgClass.includes('blue')) gradientTo = 'to-blue-50';
    else if (bgClass.includes('indigo')) gradientTo = 'to-indigo-50';
    else if (bgClass.includes('amber')) gradientTo = 'to-amber-50';
    else if (bgClass.includes('orange')) gradientTo = 'to-orange-50';
    else if (bgClass.includes('rose')) gradientTo = 'to-rose-50';
    else if (bgClass.includes('cyan')) gradientTo = 'to-cyan-50';

    return (
        <div ref={ref} className={`group cursor-pointer relative bg-gradient-to-br from-white ${gradientTo} p-2 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden h-full flex flex-col justify-center`}>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                    <div className={`w-8 h-8 ${iconBg} rounded-full flex items-center justify-center shrink-0`}>
                        {React.cloneElement(icon, { className: "w-4 h-4 xl:w-4 xl:h-4" })}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a', lineHeight: 1, marginBottom: '2px', display: 'block', fontFamily: 'Inter, sans-serif' }} className="truncate">
                            {typeof value === 'string' && value.startsWith('₹') ? '₹ ' : ''}
                            {typeof value === 'string' && (value.includes('.') || value.startsWith('₹'))
                                ? new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(count)
                                : new Intl.NumberFormat('en-IN').format(Math.round(count))}
                        </span>
                        <span style={{ fontSize: '7.5px', fontWeight: 700, color: '#334155', lineHeight: 1.2, display: 'block', fontFamily: 'Inter, sans-serif' }} className="truncate uppercase">{title}</span>
                    </div>
                </div>
                {(subText1 || subText2 || percentage) && (
                    <div style={{ fontSize: '8px', fontWeight: 600, color: '#475569', textAlign: 'center', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }} className="truncate mt-1">
                        {percentage && <span className="text-emerald-600 mr-1">{percentage}</span>}
                        {subText1} {subText2}
                    </div>
                )}
            </div>
        </div>
    );
}


const PIE_COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#94a3b8'];

const ReceiptsView = () => {
    const navigate = useNavigate();
    const { id = 'all' } = useParams();
    const dispatch = useDispatch();
    const isAllList = id === 'all';

    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    const [creditNotesTotal, setCreditNotesTotal] = useState(0);
    const [searchInput, setSearchInput] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filters
    const [filterDate, setFilterDate] = useState('');
    const [filterMode, setFilterMode] = useState('');
    const [filterBank, setFilterBank] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [sendingReceipt, setSendingReceipt] = useState({});
    const [downloadingId, setDownloadingId] = useState('');

    const [dateRangeOpen, setDateRangeOpen] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Add Payment Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [modalCompanies, setModalCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [loadingCompanies, setLoadingCompanies] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [payRes, dnRes] = await Promise.all([
                    api.get('/api/payments'),
                    api.get('/api/debitnotes').catch(() => ({ data: { data: [] } })),
                ]);

                let list = payRes.data?.data || payRes.data || [];
                if (!isAllList) list = list.filter(p => String(p.companyId) === String(id));
                setPayments(list);

                const debitNotes = dnRes.data?.data || dnRes.data || [];
                const adjustedTotal = (Array.isArray(debitNotes) ? debitNotes : [])
                    .reduce((sum, n) => sum + (Number(n.adjusted_amount) || 0), 0);
                setCreditNotesTotal(adjustedTotal);
            } catch (err) {
                console.error('Failed to fetch receipts', err);
                toast.error('Failed to load receipts');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isAllList]);

    const handleOpenAddPayment = async () => {
        if (id !== 'all') {
            navigate(`/dashboard/account/AddPayment/${id}`);
        } else {
            setIsAddModalOpen(true);
            setLoadingCompanies(true);
            try {
                const res = await api.get('/api/companies');
                const compData = res.data?.data || res.data || [];
                const options = compData.map(c => ({ value: c._id, label: c.companyName || c.name || 'Unknown Company' }));
                setModalCompanies(options);
            } catch {
                toast.error('Failed to load clients');
            } finally {
                setLoadingCompanies(false);
            }
        }
    };

    const handleProceedAddPayment = () => {
        if (!selectedCompanyId) {
            toast.error('Please select a client first');
            return;
        }
        navigate(`/dashboard/account/AddPayment/${selectedCompanyId}`);
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return 'N/A';
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const getBankLine = (pmt) => {
        const bank = pmt.bank_name || pmt.neft_bank || pmt.cheque_bank || pmt.card_bank || pmt.bankId || pmt.wallet_name || pmt.payment_mode || 'N/A';
        let ref = '';
        if (pmt.payment_ref) ref = pmt.utr_no ? `UTR: ${pmt.payment_ref}` : `Ref: ${pmt.payment_ref}`;
        else if (pmt.utr_no) ref = `UTR: ${pmt.utr_no}`;
        else if (pmt.cheque_no) ref = `Cheque No: ${pmt.cheque_no}`;
        else if (pmt.card_transaction_no) ref = `Card Txn: ${pmt.card_transaction_no}`;
        else if (pmt.wallet_transaction_no) ref = `Wallet Txn: ${pmt.wallet_transaction_no}`;
        else if (pmt.cash_receipt_no) ref = `Cash Receipt: ${pmt.cash_receipt_no}`;
        return { bank, ref };
    };

    const getStallLine = (pmt) => {
        const stallNo = pmt.stall_no || pmt.stallNo || pmt.stall_number || pmt.stallNumber || '';
        const hallNo = pmt.hall_no || pmt.hallNo || pmt.hall_number || pmt.hallNumber || '';
        return {
            stallNo: stallNo || 'Not assigned',
            hallNo,
        };
    };

    const isRunning = (pmt) => (pmt.pymnt_type || '').toLowerCase().includes('running');

    const getPaymentTypePill = (pmt) => {
        const t = (pmt.pymnt_type || '').toLowerCase();
        let cls = 'bg-slate-50 text-slate-600';
        if (t.includes('running')) cls = 'bg-orange-50 text-orange-600';
        else if (t.includes('full')) cls = 'bg-emerald-50 text-emerald-600';
        else if (t.includes('advance')) cls = 'bg-blue-50 text-blue-600';
        else if (t.includes('partial')) cls = 'bg-amber-50 text-amber-600';
        return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${cls}`}>{pmt.pymnt_type || 'N/A'}</span>;
    };

    const getStatusBadge = (pmt) => {
        const running = isRunning(pmt);
        return (
            <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${running ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {running ? 'RUNNING' : 'CONFIRMED'}
            </span>
        );
    };

    const openReceipt = (pmt) => {
        window.open(`${SERVER_URL}/api/payments/${pmt._id}/receipt`, '_blank', 'noopener,noreferrer');
    };

    const downloadReceipt = async (pmt) => {
        setDownloadingId(pmt._id);
        try {
            const res = await api.get(`/api/payments/${pmt._id}/receipt`, { responseType: 'blob' });
            saveAs(new Blob([res.data], { type: 'application/pdf' }), `${pmt.receipt_no || pmt._id}.pdf`);

            const currentAdminName = getCurrentUserName();
            dispatch(createActivityLogThunk({
                action: 'Download Single Receipt',
                module: 'Receipts',
                details: `Downloaded receipt ${pmt.receipt_no || 'N/A'} - ${pmt.client_name || 'N/A'}`,
                entityId: pmt._id,
                entityType: 'Payment',
                performedBy: currentAdminName
            }));
        } catch {
            toast.error('Failed to download receipt');
        } finally {
            setDownloadingId('');
        }
    };

    const handleSendReceipt = async (pmtId, type) => {
        setSendingReceipt(prev => ({ ...prev, [`${pmtId}-${type}`]: true }));
        try {
            const res = await api.post(`/api/payments/${pmtId}/send-receipt?type=${type}`);
            if (res.data?.success) {
                toast.success(`Receipt sent successfully via ${type === 'whatsapp' ? 'WhatsApp' : 'Email'}!`);
            } else {
                toast.error(res.data?.message || `Failed to send ${type} receipt`);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || `Error sending ${type} receipt`);
        } finally {
            setSendingReceipt(prev => ({ ...prev, [`${pmtId}-${type}`]: false }));
        }
    };

    const exportToExcel = async (rows, filename) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Receipts');
        worksheet.columns = [
            { header: 'S.No.', key: 'sno', width: 8 },
            { header: 'Receipt No', key: 'receipt_no', width: 20 },
            { header: 'Invoice No', key: 'invoice_no', width: 20 },
            { header: 'Client', key: 'client_name', width: 25 },
            { header: 'Payment Type', key: 'pymnt_type', width: 16 },
            { header: 'Payment Mode', key: 'payment_mode', width: 16 },
            { header: 'Received Amount', key: 'received', width: 18 },
            { header: 'TDS Deducted', key: 'tds', width: 18 },
            { header: 'Net Amount', key: 'net', width: 18 },
            { header: 'Receipt Date', key: 'date', width: 18 },
            { header: 'Bank / UTR / Cheque', key: 'bank_ref', width: 28 },
            { header: 'Remarks', key: 'remarks', width: 28 },
            { header: 'Status', key: 'status', width: 14 },
        ];
        const headerRow = worksheet.getRow(1);
        headerRow.font = { name: 'Arial', family: 4, size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;

        rows.forEach((pmt, index) => {
            const { bank, ref } = getBankLine(pmt);
            const received = Number(pmt.amount_text || 0);
            const tds = Number(pmt.tds_text || 0);
            const row = worksheet.addRow({
                sno: index + 1,
                receipt_no: pmt.receipt_no || 'N/A',
                invoice_no: pmt.invoice_no || pmt.invoice_id || 'N/A',
                client_name: pmt.client_name || 'N/A',
                pymnt_type: pmt.pymnt_type || 'N/A',
                payment_mode: pmt.payment_mode || 'N/A',
                received,
                tds,
                net: received - tds,
                date: formatDate(pmt.payment_date || pmt.added),
                bank_ref: `${bank}${ref ? ' - ' + ref : ''}`,
                remarks: pmt.notes || '',
                status: isRunning(pmt) ? 'Running' : 'Confirmed',
            });
            row.getCell('received').numFmt = '₹#,##0.00';
            row.getCell('tds').numFmt = '₹#,##0.00';
            row.getCell('net').numFmt = '₹#,##0.00';
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
        saveAs(new Blob([buffer]), filename);

        const userName = getCurrentUserName();
        const userStr = sessionStorage.getItem("user") || localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        const userId = user?._id || sessionStorage.getItem("user_id") || localStorage.getItem("user_id");

        const logPayload = {
            user: userName,
            action: "Downloaded",
            module: "Accounts / Receipts",
            details: "Downloaded Receipts list to Excel",
            link: `/accounts/receipts`
        };

        if (userId) {
            logPayload.user_id = userId;
        }

        dispatch(createActivityLogThunk(logPayload));
    };

    // ---- Filtering ----
    const uniqueModes = [...new Set(payments.map(p => p.payment_mode).filter(Boolean))];
    const uniqueBanks = [...new Set(payments.map(p => p.neft_bank || p.cheque_bank || p.card_bank || p.bankId).filter(Boolean))];
    const uniqueTypes = [...new Set(payments.map(p => p.pymnt_type).filter(Boolean))];

    const now = new Date();
    const filteredReceipts = payments.filter(pmt => {
        if (filterMode && pmt.payment_mode !== filterMode) return false;
        if (filterBank && (pmt.neft_bank || pmt.cheque_bank || pmt.card_bank || pmt.bankId) !== filterBank) return false;
        if (filterType && pmt.pymnt_type !== filterType) return false;
        if (filterStatus) {
            const running = isRunning(pmt);
            if (filterStatus === 'Running' && !running) return false;
            if (filterStatus === 'Confirmed' && running) return false;
        }
        if (filterDate) {
            const d = new Date(pmt.payment_date || pmt.added);
            if (!isNaN(d.getTime())) {
                if (filterDate === 'today') {
                    if (d.toDateString() !== now.toDateString()) return false;
                } else if (filterDate === 'this_week') {
                    const startOfWeek = new Date(now);
                    startOfWeek.setDate(now.getDate() - now.getDay());
                    startOfWeek.setHours(0, 0, 0, 0);
                    if (d < startOfWeek) return false;
                } else if (filterDate === 'this_month') {
                    if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
                }
            }
        }
        if (!searchInput) return true;
        const s = searchInput.toLowerCase();
        return (
            (pmt.receipt_no || '').toLowerCase().includes(s) ||
            (pmt.invoice_no || pmt.invoice_id || '').toLowerCase().includes(s) ||
            (pmt.client_name || '').toLowerCase().includes(s) ||
            (pmt.utr_no || '').toLowerCase().includes(s) ||
            (pmt.cheque_no || '').toLowerCase().includes(s)
        );
    });

    // ---- Stats ----
    const totalReceipts = filteredReceipts.length;
    const uniqueInvoiceCount = new Set(filteredReceipts.map(p => p.invoice_id).filter(Boolean)).size;
    const totalReceived = filteredReceipts.reduce((sum, p) => sum + (parseFloat(p.amount_text) || 0), 0);
    const totalTds = filteredReceipts.reduce((sum, p) => sum + (parseFloat(p.tds_text) || 0), 0);
    const netAmountReceived = totalReceived - totalTds;
    const avgReceiptAmount = totalReceipts > 0 ? totalReceived / totalReceipts : 0;

    const isSameMonth = (dateVal, ref) => {
        const d = new Date(dateVal);
        return !isNaN(d.getTime()) && d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
    };
    const thisMonthReceipts = filteredReceipts.filter(p => isSameMonth(p.payment_date || p.added, now));
    const thisMonthCollection = thisMonthReceipts.reduce((sum, p) => sum + (parseFloat(p.amount_text) || 0), 0);
    const lastMonthRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthCollection = filteredReceipts
        .filter(p => isSameMonth(p.payment_date || p.added, lastMonthRef))
        .reduce((sum, p) => sum + (parseFloat(p.amount_text) || 0), 0);
    const monthGrowthPct = lastMonthCollection > 0
        ? (((thisMonthCollection - lastMonthCollection) / lastMonthCollection) * 100).toFixed(2)
        : null;

    const todayCollection = filteredReceipts
        .filter(p => new Date(p.payment_date || p.added).toDateString() === now.toDateString())
        .reduce((sum, p) => sum + (parseFloat(p.amount_text) || 0), 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const weekCollection = filteredReceipts
        .filter(p => new Date(p.payment_date || p.added) >= startOfWeek)
        .reduce((sum, p) => sum + (parseFloat(p.amount_text) || 0), 0);

    // Overdue recovery target: outstanding balance on invoices older than 30 days
    const groupedByInvoice = Object.values(filteredReceipts.reduce((acc, p) => {
        const key = String(p.invoice_id || 'no-invoice');
        if (!acc[key]) {
            acc[key] = {
                invoiceAmount: Number(p.invoice_amount || 0),
                invoiceDate: p.invoice_date,
                received: 0,
            };
        }
        acc[key].received += Number(p.amount_text || 0);
        acc[key].invoiceAmount = Math.max(acc[key].invoiceAmount, Number(p.invoice_amount || 0));
        return acc;
    }, {}));
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const overdueInvoices = groupedByInvoice.filter(g => {
        const outstanding = g.invoiceAmount - g.received;
        return outstanding > 0 && g.invoiceDate && new Date(g.invoiceDate) < thirtyDaysAgo;
    });
    const overdueRecoveryTarget = overdueInvoices.reduce((sum, g) => sum + Math.max(0, g.invoiceAmount - g.received), 0);
    const pendingFollowUps = overdueInvoices.length;

    // Average payment days: days between invoice date and payment date
    const paymentDayDiffs = filteredReceipts
        .map(p => {
            const invDate = new Date(p.invoice_date);
            const payDate = new Date(p.payment_date || p.added);
            if (isNaN(invDate.getTime()) || isNaN(payDate.getTime())) return null;
            return Math.max(0, Math.round((payDate - invDate) / (1000 * 60 * 60 * 24)));
        })
        .filter(v => v !== null);
    const avgPaymentDays = paymentDayDiffs.length
        ? Math.round(paymentDayDiffs.reduce((a, b) => a + b, 0) / paymentDayDiffs.length)
        : 0;

    // Payment mode summary (donut)
    const modeMap = filteredReceipts.reduce((acc, p) => {
        const mode = p.payment_mode || 'Other';
        acc[mode] = (acc[mode] || 0) + (parseFloat(p.amount_text) || 0);
        return acc;
    }, {});
    const modeData = Object.entries(modeMap).map(([name, value]) => ({ name, value }));
    const modeTotal = modeData.reduce((sum, m) => sum + m.value, 0) || 1;

    // Pagination
    const totalPages = Math.ceil(totalReceipts / itemsPerPage);
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
    const indexOfLastItem = indexOfFirstItem + itemsPerPage;
    const currentItems = filteredReceipts.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-2">
            {/* Header Area */}
            <div className="px-6 pt-4">
                <div className="w-full flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 p-3 bg-white rounded-lg border border-slate-100" style={{ boxShadow: 'rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em', fontFamily: 'Inter, sans-serif' }}>
                    <div className="flex flex-col justify-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Accounts Receivable (AR)</p>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-lg font-bold text-[#124170] leading-tight">Receipts</h2>
                        </div>
                        <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
                            <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-2xl">
                                Download or resend the receipt document for a payment already recorded. For the full transaction log, see Payments.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <div className="relative w-full sm:w-auto">
                            <button
                                onClick={() => setDateRangeOpen(!dateRangeOpen)}
                                className="w-full flex items-center justify-between sm:justify-center gap-2 bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50"
                            >
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                    {fromDate && toDate ? `${new Date(fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${new Date(toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}` : 'Date Range'}
                                </div>
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
                                            className="w-full bg-[#124170] hover:bg-[#0c2b4a] text-white text-xs font-bold py-1.5 rounded transition-colors mt-2"
                                        >
                                            Apply Range
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative w-full sm:w-auto">
                            <button
                                onClick={() => setFiltersOpen(!filtersOpen)}
                                className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 text-[#124170] px-3 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50"
                            >
                                <Filter className="w-4 h-4 text-[#124170]" />
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
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Pending">Pending</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => setFiltersOpen(false)}
                                            className="w-full bg-[#124170] hover:bg-[#0c2b4a] text-white text-xs font-bold py-1.5 rounded transition-colors mt-2"
                                        >
                                            Apply Filters
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={handleOpenAddPayment} className="flex items-center justify-center gap-1.5 bg-[#124170] hover:bg-[#0c2b4a] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors w-full sm:w-auto whitespace-nowrap">
                            <Plus className="w-4 h-4" /> Add Payment (New)
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-6 py-2">
                <div className="flex flex-col xl:flex-row gap-2">
                    {/* Left Main Content */}
                    <div className="w-full lg:w-[80%] space-y-2 min-w-0">

                        {/* Stat Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-2">
                            <AnimatedStatCard
                                icon={<ClipboardList className="w-4 h-4 text-blue-500" />}
                                iconBg="bg-blue-50 text-blue-500"
                                title="Total Receipts"
                                value={totalReceipts.toString()}
                                subText1={`Against ${uniqueInvoiceCount} Invoices`}
                                subText2=""
                            />
                            <AnimatedStatCard
                                icon={<ArrowDownLeft className="w-4 h-4 text-emerald-500" />}
                                iconBg="bg-emerald-50 text-emerald-500"
                                title="Total Received"
                                value={`₹ ${formatCurrency(totalReceived)}`}
                                subText1="Including TDS"
                                valueColor="text-slate-800"
                            />
                            <AnimatedStatCard
                                icon={<Wallet className="w-4 h-4 text-indigo-500" />}
                                iconBg="bg-indigo-50 text-indigo-500"
                                title="Net Amount Received"
                                value={`₹ ${formatCurrency(netAmountReceived)}`}
                                subText1="After TDS Deduction"
                                valueColor="text-slate-800"
                            />
                            <AnimatedStatCard
                                icon={<IndianRupee className="w-4 h-4 text-rose-500" />}
                                iconBg="bg-rose-50 text-rose-500"
                                title="TDS Deducted"
                                value={`₹ ${formatCurrency(totalTds)}`}
                                subText1="Awaiting Certificates"
                                valueColor="text-slate-800"
                            />
                            <AnimatedStatCard
                                icon={<CalendarCheck className="w-4 h-4 text-purple-500" />}
                                iconBg="bg-purple-50 text-purple-500"
                                title="Avg Receipt Amount"
                                value={`₹ ${formatCurrency(avgReceiptAmount)}`}
                                subText1="This Month"
                                valueColor="text-slate-800"
                            />
                            <AnimatedStatCard
                                icon={<CalendarCheck className="w-4 h-4 text-orange-500" />}
                                iconBg="bg-orange-50 text-orange-500"
                                title="This Month Collection"
                                value={`₹ ${formatCurrency(thisMonthCollection)}`}
                                subText1=""
                                subText2="vs Last Month"
                                valueColor="text-slate-800"
                                percentage={monthGrowthPct !== null ? `${monthGrowthPct >= 0 ? '↑' : '↓'} ${Math.abs(monthGrowthPct)}%` : null}
                            />
                        </div>

                        {/* Filters Row */}
                        <div className="px-3 pt-4 pb-3 border border-slate-100 flex items-center gap-2 bg-white overflow-x-auto rounded-xl shadow-sm mb-2">
                            <div className="flex items-center gap-2 flex-nowrap min-w-0">
                                <div className="relative shrink-0">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => { setSearchInput(e.target.value); setCurrentPage(1); }}
                                        placeholder="Search by receipt no., invoice..."
                                        className="w-full sm:w-[180px] pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 placeholder:text-slate-400"
                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                    />
                                </div>
                                <select value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:border-emerald-500 shrink-0">
                                    <option value="">Date Range</option>
                                    <option value="today">Today</option>
                                    <option value="this_week">This Week</option>
                                    <option value="this_month">This Month</option>
                                </select>
                                <select value={filterMode} onChange={(e) => { setFilterMode(e.target.value); setCurrentPage(1); }} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:border-emerald-500 shrink-0">
                                    <option value="">Payment Mode</option>
                                    {uniqueModes.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <select value={filterBank} onChange={(e) => { setFilterBank(e.target.value); setCurrentPage(1); }} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:border-emerald-500 shrink-0">
                                    <option value="">Bank</option>
                                    {uniqueBanks.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                                <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:border-emerald-500 shrink-0">
                                    <option value="">Payment Type</option>
                                    {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:border-emerald-500 shrink-0">
                                    <option value="">Status</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Running">Running</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 ml-auto shrink-0">
                                <button
                                    onClick={() => {
                                        setFilterDate('');
                                        setFilterMode('');
                                        setFilterBank('');
                                        setFilterType('');
                                        setFilterStatus('');
                                        setSearchInput('');
                                        setCurrentPage(1);
                                    }}
                                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] font-bold text-white transition-all duration-200 hover:opacity-90 shadow-sm whitespace-nowrap" style={{ backgroundColor: '#EF4444', fontFamily: 'Inter, sans-serif' }}
                                >
                                    <RefreshCw size={11} /> Reset
                                </button>
                                <button
                                    onClick={() => exportToExcel(filteredReceipts, 'Receipts_Export.xlsx')}
                                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] font-bold text-white transition-all duration-200 hover:opacity-90 shadow-sm whitespace-nowrap" style={{ backgroundColor: '#10B981', fontFamily: 'Inter, sans-serif' }}
                                >
                                    <Download size={11} /> Export
                                </button>
                            </div>
                        </div>

                        {/* Main Table */}
                        <div className="bg-white border border-[#EDF0F7] rounded-xl overflow-hidden">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full min-w-[1400px] text-left border-collapse whitespace-nowrap text-[10px]" style={{ fontFamily: 'Inter, sans-serif', color: '#15173D' }}>
                                    <thead>
                                        <tr className="bg-white text-[8px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-200 whitespace-nowrap">
                                            <th className="px-3 py-2.5 text-center w-10">S.No.</th>
                                            <th className="px-3 py-2.5">Receipt Details</th>
                                            <th className="px-3 py-2.5">Invoice Details</th>
                                            <th className="px-3 py-2.5">Client & Stall</th>
                                            <th className="px-3 py-2.5 text-center">Payment Type</th>
                                            <th className="px-3 py-2.5">Payment Mode</th>
                                            <th className="px-3 py-2.5 text-right">Received Amount</th>
                                            <th className="px-3 py-2.5 text-right">TDS Deducted</th>
                                            <th className="px-3 py-2.5 text-right">Net Amount</th>
                                            <th className="px-3 py-2.5">Receipt Date</th>
                                            <th className="px-3 py-2.5">Bank/UTR/Cheque No</th>
                                            <th className="px-3 py-2.5">Remarks</th>
                                            <th className="px-3 py-2.5 text-center">Status</th>
                                            <th className="px-3 py-2.5 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[11px] whitespace-nowrap">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="14" className="py-6 text-center text-gray-500">
                                                    <div className="flex justify-center items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                        <span>Loading receipts...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : currentItems.length === 0 ? (
                                            <tr>
                                                <td colSpan="14" className="py-6 text-center text-gray-500">No receipts found.</td>
                                            </tr>
                                        ) : (
                                            currentItems.map((pmt, idx) => {
                                                const { bank, ref } = getBankLine(pmt);
                                                const { stallNo, hallNo } = getStallLine(pmt);
                                                const received = Number(pmt.amount_text || 0);
                                                const tds = Number(pmt.tds_text || 0);
                                                const tdsPct = received > 0 ? ((tds / received) * 100).toFixed(2) : '0.00';
                                                return (
                                                    <tr key={pmt._id || idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-3 py-2 font-black text-slate-800 text-center align-top">{indexOfFirstItem + idx + 1}</td>
                                                        <td className="px-3 py-2 align-top">
                                                            <div className="font-bold text-[11px]" style={{ color: '#093C5D' }}>{pmt.receipt_no || 'N/A'}</div>
                                                            <div className="text-[10px] font-bold mt-0.5" style={{ color: '#5E0006' }}>Receipt Date {formatDate(pmt.payment_date || pmt.added)}</div>
                                                            <button onClick={() => openReceipt(pmt)} className="text-[10px] text-blue-600 font-bold mt-0.5 hover:underline">
                                                                View Receipt <ChevronRight className="inline w-3 h-3 rotate-90" />
                                                            </button>
                                                        </td>
                                                        <td className="px-3 py-2 align-top">
                                                            <div className="font-bold text-[11px]" style={{ color: '#15173D' }}>{pmt.invoice_no || pmt.invoice_id || 'N/A'}</div>
                                                            <div className="text-[10px] font-bold mt-0.5" style={{ color: '#5E0006' }}>Invoice Date: {formatDate(pmt.invoice_date)}</div>
                                                            <div className="text-[10px] font-bold mt-0.5" style={{ color: '#064232' }}>Invoice Total: ₹ {formatCurrency(pmt.invoice_amount)}</div>
                                                        </td>
                                                        <td className="px-3 py-2 align-top">
                                                            <div className="font-bold text-[11px] mb-0.5" style={{ color: '#093C5D' }}>{pmt.client_name || 'N/A'}</div>
                                                            <div className="text-[10px] font-bold text-red-600">Stall No: {stallNo}</div>
                                                            {hallNo && <div className="text-[10px] font-bold text-red-600">Hall: {hallNo}</div>}
                                                        </td>
                                                        <td className="px-3 py-2 align-top text-center">{getPaymentTypePill(pmt)}</td>
                                                        <td className="px-3 py-2 align-top text-[11px] font-bold" style={{ color: '#15173D' }}>{pmt.payment_mode || 'N/A'}</td>
                                                        <td className="px-3 py-2 align-top text-right">
                                                            <div className="font-bold text-[11px]" style={{ color: '#064232' }}>₹ {formatCurrency(received)}</div>
                                                        </td>
                                                        <td className="px-3 py-2 align-top text-right">
                                                            <div className="font-bold text-[11px]" style={{ color: '#5E0006' }}>₹ {formatCurrency(tds)}</div>
                                                            <div className="text-[10px] font-bold mt-0.5" style={{ color: '#111844' }}>({tdsPct}%)</div>
                                                        </td>
                                                        <td className="px-3 py-2 align-top text-right">
                                                            <div className="font-bold text-[11px]" style={{ color: '#064232' }}>₹ {formatCurrency(received - tds)}</div>
                                                        </td>
                                                        <td className="px-3 py-2 align-top">
                                                            <div className="font-bold text-[11px]" style={{ color: '#111844' }}>{formatDate(pmt.payment_date || pmt.added)}</div>
                                                            <div className="text-[10px] font-bold mt-0.5" style={{ color: '#5E0006' }}>{formatTime(pmt.payment_date || pmt.added)}</div>
                                                        </td>
                                                        <td className="px-3 py-2 align-top">
                                                            <div className="font-bold text-[11px]" style={{ color: '#093C5D' }}>{bank}</div>
                                                            <div className="text-[10px] font-bold mt-0.5" style={{ color: '#111844' }}>{ref}</div>
                                                        </td>
                                                        <td className="px-3 py-2 align-top text-[10px] font-medium text-slate-600 whitespace-normal w-40">
                                                            <div className="line-clamp-2" title={pmt.notes || ''}>{pmt.notes || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-3 py-2 align-top text-center">{getStatusBadge(pmt)}</td>
                                                        <td className="px-3 py-2 align-top text-center">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <button onClick={() => openReceipt(pmt)} className="w-6 h-6 flex items-center justify-center text-blue-600 bg-blue-50/50 border border-blue-100 rounded hover:bg-blue-100 transition-colors" title="View Receipt">
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button onClick={() => downloadReceipt(pmt)} disabled={downloadingId === pmt._id} className="w-6 h-6 flex items-center justify-center text-blue-600 bg-blue-50/50 border border-blue-100 rounded hover:bg-blue-100 transition-colors disabled:opacity-50" title="Download Receipt">
                                                                    {downloadingId === pmt._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                                                                </button>
                                                                <div className="relative group">
                                                                    <button className="w-6 h-6 flex items-center justify-center text-blue-600 bg-blue-50/50 border border-blue-100 rounded hover:bg-blue-100 transition-colors" title="More Actions">
                                                                        <MoreVertical className="w-3 h-3" />
                                                                    </button>
                                                                    <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 flex flex-col py-1">
                                                                        <button
                                                                            onClick={() => handleSendReceipt(pmt._id, 'email')}
                                                                            disabled={sendingReceipt[`${pmt._id}-email`]}
                                                                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors w-full text-left disabled:opacity-50"
                                                                        >
                                                                            {sendingReceipt[`${pmt._id}-email`] ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                                                                            Send via Email
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleSendReceipt(pmt._id, 'whatsapp')}
                                                                            disabled={sendingReceipt[`${pmt._id}-whatsapp`]}
                                                                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors w-full text-left disabled:opacity-50"
                                                                        >
                                                                            {sendingReceipt[`${pmt._id}-whatsapp`] ? <Loader2 size={14} className="animate-spin" /> : <MessageCircleMore size={14} />}
                                                                            Send via WhatsApp
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="bg-white border-t border-slate-200 p-4 flex items-center justify-between text-[11px] text-slate-500">
                                <div>
                                    Showing {totalReceipts === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalReceipts)} of {totalReceipts} receipts
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="w-3.5 h-3.5 rotate-180" /></button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-6 h-6 flex items-center justify-center rounded font-bold ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-slate-300 hover:bg-slate-50'}`}>
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="w-3.5 h-3.5" /></button>
                                </div>
                                <div className="flex items-center gap-2">
                                    Rows per page
                                    <div className="relative">
                                        <select className="border border-slate-300 rounded px-2 py-1 bg-white outline-none pr-6 appearance-none cursor-pointer">
                                            <option>10</option>
                                        </select>
                                        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Totals */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2 px-3 flex items-center justify-between overflow-x-auto mt-2">
                            <div className="flex items-center flex-1 divide-x divide-slate-200 min-w-max justify-between">
                                <div className="pr-3 text-center">
                                    <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">TOTAL RECEIPTS</div>
                                    <div className="text-[11px] font-bold text-slate-800">{totalReceipts}</div>
                                </div>
                                <div className="px-3 text-center">
                                    <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">TOTAL RECEIVED</div>
                                    <div className="text-[11px] font-bold text-slate-800">₹ {formatCurrency(totalReceived)}</div>
                                </div>
                                <div className="px-3 text-center">
                                    <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">TOTAL TDS DEDUCTED</div>
                                    <div className="text-[11px] font-bold text-rose-500">₹ {formatCurrency(totalTds)}</div>
                                </div>
                                <div className="px-3 text-center">
                                    <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">NET AMOUNT RECEIVED</div>
                                    <div className="text-[11px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                                        ₹ {formatCurrency(netAmountReceived)} <span className="text-[9px] text-slate-500 font-medium">(After TDS)</span>
                                    </div>
                                </div>
                                <div className="px-3 text-center">
                                    <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">CREDIT NOTES ADJUSTED</div>
                                    <div className="text-[11px] font-bold text-slate-800">₹ {formatCurrency(creditNotesTotal)}</div>
                                </div>
                                <div className="px-3 text-center">
                                    <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">REFUNDS ISSUED</div>
                                    <div className="text-[11px] font-bold text-slate-800">₹ 0.00</div>
                                </div>
                                <div className="pl-3 text-center">
                                    <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">AVERAGE PAYMENT DAYS</div>
                                    <div className="text-[11px] font-bold text-slate-800">{avgPaymentDays} Days</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="w-full lg:w-[20%] flex flex-col gap-2">

                        {/* Collection Summary */}
                        <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px', fontFamily: 'Inter, sans-serif' }}>
                            <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
                                <h3 className="text-sm font-bold tracking-tight text-[#15173D]">Collection Summary</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center shrink-0"><Wallet className="w-3.5 h-3.5 text-blue-600" /></div>
                                    <div className="flex flex-col justify-center min-w-0">
                                        <div className="text-[10px] font-bold leading-tight truncate" style={{ color: '#15173D' }}>Today's Collection</div>
                                        <div className="text-[10px] font-bold truncate mt-0.5" style={{ color: '#093C5D' }}>₹ {formatCurrency(todayCollection)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center shrink-0"><TrendingUp className="w-3.5 h-3.5 text-emerald-600" /></div>
                                    <div className="flex flex-col justify-center min-w-0">
                                        <div className="text-[10px] font-bold leading-tight truncate" style={{ color: '#15173D' }}>This Week Collection</div>
                                        <div className="text-[10px] font-bold truncate mt-0.5" style={{ color: '#093C5D' }}>₹ {formatCurrency(weekCollection)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-md bg-orange-50 flex items-center justify-center shrink-0"><Calendar className="w-3.5 h-3.5 text-orange-600" /></div>
                                    <div className="flex flex-col justify-center min-w-0">
                                        <div className="text-[10px] font-bold leading-tight truncate" style={{ color: '#15173D' }}>This Month Collection</div>
                                        <div className="text-[10px] font-bold truncate mt-0.5" style={{ color: '#093C5D' }}>₹ {formatCurrency(thisMonthCollection)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-md bg-red-50 flex items-center justify-center shrink-0"><AlertTriangle className="w-3.5 h-3.5 text-red-500" /></div>
                                    <div className="flex flex-col justify-center min-w-0">
                                        <div className="text-[10px] font-bold leading-tight truncate" style={{ color: '#15173D' }}>Overdue Recovery Target</div>
                                        <div className="text-[10px] font-bold truncate mt-0.5" style={{ color: '#093C5D' }}>₹ {formatCurrency(overdueRecoveryTarget)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center shrink-0"><Bell className="w-3.5 h-3.5 text-indigo-500" /></div>
                                    <div className="flex flex-col justify-center min-w-0">
                                        <div className="text-[10px] font-bold leading-tight truncate" style={{ color: '#15173D' }}>Pending Follow-ups</div>
                                        <div className="text-[10px] font-bold truncate mt-0.5" style={{ color: '#093C5D' }}>{pendingFollowUps}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px', fontFamily: 'Inter, sans-serif' }}>
                            <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
                                <h3 className="text-sm font-bold tracking-tight text-[#15173D]">Quick Actions</h3>
                            </div>
                            <div className="space-y-2">
                                <button onClick={handleOpenAddPayment} className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors group text-left border border-transparent hover:border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-blue-500"><Plus className="w-3.5 h-3.5" /></div>
                                        <div>
                                            <div className="text-[10px] font-bold mb-0.5 leading-tight" style={{ color: '#4B1426' }}>Add Payment</div>
                                            <div className="text-[9px] font-medium text-black">Record a new payment</div>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => toast('Select a receipt row\'s ⋮ menu to email or WhatsApp it', { icon: 'ℹ️' })}
                                    className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors group text-left border border-transparent hover:border-slate-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded bg-emerald-50 flex items-center justify-center text-emerald-500"><Mail className="w-3.5 h-3.5" /></div>
                                        <div>
                                            <div className="text-[10px] font-bold mb-0.5 leading-tight" style={{ color: '#4B1426' }}>Send Receipt</div>
                                            <div className="text-[9px] font-medium text-black">Email/WhatsApp receipt</div>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => toast('Collection notes are coming soon', { icon: '📝' })}
                                    className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors group text-left border border-transparent hover:border-slate-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded bg-amber-50 flex items-center justify-center text-amber-500"><FileText className="w-3.5 h-3.5" /></div>
                                        <div>
                                            <div className="text-[10px] font-bold mb-0.5 leading-tight" style={{ color: '#4B1426' }}>Collection Notes</div>
                                            <div className="text-[9px] font-medium text-black">Add notes for receipt</div>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => exportToExcel(filteredReceipts, 'Receipts_Export.xlsx')}
                                    className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors group text-left border border-transparent hover:border-slate-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center text-indigo-500"><Download className="w-3.5 h-3.5" /></div>
                                        <div>
                                            <div className="text-[10px] font-bold mb-0.5 leading-tight" style={{ color: '#4B1426' }}>Download Receipts</div>
                                            <div className="text-[9px] font-medium text-black">Download selected receipts</div>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => navigate('/accounts/summary-report')}
                                    className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors group text-left border border-transparent hover:border-slate-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-blue-500"><BarChart2 className="w-3.5 h-3.5" /></div>
                                        <div>
                                            <div className="text-[10px] font-bold mb-0.5 leading-tight" style={{ color: '#4B1426' }}>Receipt Report</div>
                                            <div className="text-[9px] font-medium text-black">View detailed receipt report</div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Payment Mode Summary */}
                        <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px', fontFamily: 'Inter, sans-serif' }}>
                            <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
                                <h3 className="text-sm font-bold tracking-tight text-[#15173D]">Payment Mode Summary</h3>
                            </div>
                            <div className="flex items-center justify-between min-h-[140px]">
                                <div className="w-[100px] h-[100px] shrink-0 -ml-2 self-start mt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPieChart>
                                            <Pie
                                                data={modeData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={30}
                                                outerRadius={45}
                                                paddingAngle={2}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {modeData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ fontSize: '10px', padding: '4px', borderRadius: '4px' }} formatter={(value) => `₹ ${formatCurrency(value)}`} />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-col gap-2.5 ml-2 justify-center py-2 flex-1 min-w-0">
                                    {modeData.length === 0 ? (
                                        <div className="text-[10px] text-slate-400">No data</div>
                                    ) : modeData.map((m, i) => (
                                        <div key={m.name} className="flex items-start gap-1.5 w-full">
                                            <div className="w-1.5 h-1.5 rounded-full mt-[5px] shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                                            <div className="flex flex-col leading-tight min-w-0">
                                                <span className="text-[10px] font-bold truncate" style={{ color: '#15173D' }} title={m.name}>{m.name}</span>
                                                <div className="text-[10px] font-bold mt-0.5 truncate" style={{ color: '#093C5D' }} title={`₹ ${formatCurrency(m.value)} (${((m.value / modeTotal) * 100).toFixed(1)}%)`}>
                                                    ₹ {formatCurrency(m.value)} <span style={{ color: PIE_COLORS[i % PIE_COLORS.length] }}>({((m.value / modeTotal) * 100).toFixed(1)}%)</span>
                                                </div>
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
            </div>

            {/* Add Payment Modal */}
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
                                placeholder="Select client..."
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
                                onClick={handleProceedAddPayment}
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

export default ReceiptsView;
