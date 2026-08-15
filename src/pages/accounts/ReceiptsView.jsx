import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FileText, Download, Search, Eye, Wallet, CheckCircle2, AlertTriangle,
    Calendar, BarChart2, ChevronRight, ChevronDown,
    Mail, MessageCircleMore, Loader2, MoreVertical, RefreshCw,
    IndianRupee, ClipboardList, ArrowDownLeft, CalendarCheck
} from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
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

function AnimatedStatCard({ icon, gradientTo, iconBg, rawValue, displayValue, label, subLabel, subColor }) {
    const { ref, count } = useCountUp(rawValue);
    return (
        <div ref={ref} className={`group cursor-pointer relative bg-gradient-to-br from-white ${gradientTo} px-4 py-2.5 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden`}>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center shrink-0`}>
                        {icon}
                    </div>
                    <div className="flex flex-col">
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '4px', display: 'block', fontFamily: 'Inter, sans-serif' }}>
                            {displayValue(count)}
                        </span>
                        <span style={{ fontSize: '9px', fontWeight: 800, color: '#334155', lineHeight: 1.2, display: 'block', fontFamily: 'Inter, sans-serif' }}>{label}</span>
                    </div>
                </div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: subColor, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{subLabel}</div>
            </div>
        </div>
    );
}

const ReceiptsView = () => {
    const navigate = useNavigate();
    const { id = 'all' } = useParams();
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

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return 'N/A';
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
    };

    const getBankLine = (pmt) => {
        if (String(pmt.payment_mode || '').toLowerCase() === 'cash') {
            return {
                bank: pmt.received_by ? `Received By: ${pmt.received_by}` : 'Cash',
                ref: pmt.received_date ? `Received Date: ${formatDate(pmt.received_date)}` : '',
            };
        }
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
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${running ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${running ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                {running ? 'Running' : 'Confirmed'}
            </div>
        );
    };

    const openReceipt = async (pmt) => {
        const receiptWindow = window.open('', '_blank');

        try {
            const res = await api.get(`/api/payments/${pmt._id}/receipt`, {
                responseType: 'blob',
            });
            const blobUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));

            if (receiptWindow) {
                receiptWindow.location.href = blobUrl;
            } else {
                window.open(blobUrl, '_blank', 'noopener,noreferrer');
            }

            setTimeout(() => URL.revokeObjectURL(blobUrl), 60 * 1000);
        } catch (err) {
            if (receiptWindow) receiptWindow.close();
            console.error(err);
            toast.error(err.response?.data?.message || 'Error opening payment receipt');
        }
    };

    const downloadReceipt = async (pmt) => {
        setDownloadingId(pmt._id);
        try {
            const res = await api.get(`/api/payments/${pmt._id}/receipt`, { responseType: 'blob' });
            const clientName = (pmt.client_name || 'Receipt').replace(/[^a-zA-Z0-9 -]/g, '').trim();
            const d = new Date(pmt.payment_date || pmt.added);
            const dateStr = !isNaN(d.getTime())
                ? `${String(d.getDate()).padStart(2, '0')}-${d.toLocaleDateString('en-GB', { month: 'long' })}`
                : 'Date';
            saveAs(new Blob([res.data], { type: 'application/pdf' }), `${clientName}_${dateStr}.pdf`);
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
        const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long' }).replace(/ /g, '');
        saveAs(new Blob([buffer]), `receiptExport_${formattedDate}.xlsx`);
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

    // Pagination
    const totalPages = Math.ceil(totalReceipts / itemsPerPage);
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
    const indexOfLastItem = indexOfFirstItem + itemsPerPage;
    const currentItems = filteredReceipts.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-2">
            {/* Header Area */}
            <div className="px-6 py-2 flex justify-between items-center bg-white sticky top-0 z-40 border-b border-gray-100">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Payment Receipts</h1>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                        <span>Accounts Management</span>
                        <ChevronRight className="w-3 h-3" />
                        <span>Payments & Collections</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-blue-600 font-bold">Payment Receipts</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/accounts/payments')}
                        className="px-3 py-1.5 rounded text-xs font-bold border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                        Payment Collection
                    </button>
                    <button
                        onClick={() => navigate('/accounts/ar')}
                        className="px-3 py-1.5 rounded text-xs font-bold border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                        Outstanding Payments
                    </button>
                    <button
                        onClick={() => navigate('/accounts/client-ledger')}
                        className="px-3 py-1.5 rounded text-xs font-bold border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                        Overdue Payments
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-2.5 mb-3 mt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
                    <AnimatedStatCard
                        icon={<ClipboardList className="w-5 h-5 text-blue-600" strokeWidth={2.5} />}
                        gradientTo="to-blue-50" iconBg="bg-blue-100"
                        rawValue={totalReceipts}
                        displayValue={(c) => Math.round(c)}
                        label="Total Receipts"
                        subLabel={`Against ${uniqueInvoiceCount} Invoices`} subColor="#2563eb"
                    />
                    <AnimatedStatCard
                        icon={<ArrowDownLeft className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />}
                        gradientTo="to-emerald-50" iconBg="bg-emerald-100"
                        rawValue={totalReceived}
                        displayValue={(c) => `₹ ${c.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                        label="Total Received"
                        subLabel="Including TDS" subColor="#059669"
                    />
                    <AnimatedStatCard
                        icon={<Wallet className="w-5 h-5 text-indigo-600" strokeWidth={2.5} />}
                        gradientTo="to-indigo-50" iconBg="bg-indigo-100"
                        rawValue={netAmountReceived}
                        displayValue={(c) => `₹ ${c.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                        label="Net Amount Received"
                        subLabel="After TDS Deduction" subColor="#4f46e5"
                    />
                    <AnimatedStatCard
                        icon={<IndianRupee className="w-5 h-5 text-rose-600" strokeWidth={2.5} />}
                        gradientTo="to-rose-50" iconBg="bg-rose-100"
                        rawValue={totalTds}
                        displayValue={(c) => `₹ ${c.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                        label="TDS Deducted"
                        subLabel="Awaiting Certificates" subColor="#e11d48"
                    />
                    <AnimatedStatCard
                        icon={<CalendarCheck className="w-5 h-5 text-purple-600" strokeWidth={2.5} />}
                        gradientTo="to-purple-50" iconBg="bg-purple-100"
                        rawValue={avgReceiptAmount}
                        displayValue={(c) => `₹ ${c.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                        label="Avg Receipt Amount"
                        subLabel="This Month" subColor="#7c3aed"
                    />
                    <AnimatedStatCard
                        icon={<Calendar className="w-5 h-5 text-orange-600" strokeWidth={2.5} />}
                        gradientTo="to-orange-50" iconBg="bg-orange-100"
                        rawValue={thisMonthCollection}
                        displayValue={(c) => `₹ ${c.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                        label="This Month Collection"
                        subLabel={monthGrowthPct !== null ? `${monthGrowthPct >= 0 ? '↑' : '↓'} ${Math.abs(monthGrowthPct)}% vs Last Month` : ''} subColor="#d97706"
                    />
                    <AnimatedStatCard
                        icon={<AlertTriangle className="w-5 h-5 text-amber-600" strokeWidth={2.5} />}
                        gradientTo="to-amber-50" iconBg="bg-amber-100"
                        rawValue={overdueRecoveryTarget}
                        displayValue={(c) => `₹ ${c.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                        label="Overdue Recovery Target"
                        subLabel="Invoice > 30 days old, still outstanding" subColor="#d97706"
                    />
                </div>
            </div>

            <div className="px-4">
                {/* Filters Row */}
                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-sm mb-2 overflow-x-auto">
                    <div className="flex items-center gap-3 flex-wrap">
                                    <div className="relative shrink-0">
                                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={searchInput}
                                            onChange={(e) => { setSearchInput(e.target.value); setCurrentPage(1); }}
                                            placeholder="Search by receipt no., invoice no., client name, UTR, cheque no..."
                                            className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-[11px] w-[210px] focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
                                        />
                                    </div>
                                    <select value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }} className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white w-[120px]">
                                        <option value="">Date Range</option>
                                        <option value="today">Today</option>
                                        <option value="this_week">This Week</option>
                                        <option value="this_month">This Month</option>
                                    </select>
                                    <select value={filterMode} onChange={(e) => { setFilterMode(e.target.value); setCurrentPage(1); }} className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white w-[145px]">
                                        <option value="">Payment Mode</option>
                                        {uniqueModes.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <select value={filterBank} onChange={(e) => { setFilterBank(e.target.value); setCurrentPage(1); }} className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white w-[135px]">
                                        <option value="">Bank</option>
                                        {uniqueBanks.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                    <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }} className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white w-[145px]">
                                        <option value="">Payment Type</option>
                                        {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white w-[105px]">
                                        <option value="">Status</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Running">Running</option>
                                    </select>
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
                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold text-[11px] px-2 transition-colors shrink-0"
                                    >
                                        <RefreshCw className="w-3 h-3" /> Reset
                                    </button>
                    </div>
                    <div className="shrink-0 pl-3 border-l border-slate-200 ml-3 flex gap-2">
                        <button
                            onClick={() => navigate('/accounts/summary-report')}
                            className="flex items-center gap-2 text-slate-700 bg-white border border-slate-300 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 shadow-sm transition-colors"
                        >
                            <BarChart2 className="w-4 h-4" />
                            Receipt Report
                        </button>
                        <button
                            onClick={() => exportToExcel(filteredReceipts)}
                            className="flex items-center gap-2 text-white bg-green-600 border border-green-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export Excel
                        </button>
                    </div>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                    <table className="w-full min-w-[1400px] border-collapse text-left text-[11px] leading-tight">
                        <thead>
                            <tr className="bg-white text-[8px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-200 whitespace-nowrap">
                                <th className="px-3 py-2.5 text-center">S.No.</th>
                                <th className="px-3 py-2.5">Receipt Details</th>
                                <th className="px-3 py-2.5">Invoice Details</th>
                                <th className="px-3 py-2.5">Client & Stall</th>
                                <th className="px-3 py-2.5">Payment Type</th>
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
                                                const { bank } = getBankLine(pmt);
                                                const { hallNo } = getStallLine(pmt);
                                                const received = Number(pmt.amount_text || 0);
                                                const tds = Number(pmt.tds_text || 0);
                                                return (
                                                    <tr key={pmt._id || idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-2 py-1 font-bold text-slate-700 text-center align-top">{indexOfFirstItem + idx + 1}</td>
                                                        <td className="px-2 py-1 align-top">
                                                            <div className="font-bold text-slate-800 text-[11px]">{pmt.receipt_no || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-2 py-1 align-top">
                                                            <div className="font-bold text-slate-800 text-[11px]">{pmt.invoice_no || pmt.invoice_id || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-2 py-1 align-top">
                                                            <div className="font-bold text-blue-600 text-[11px] mb-0.5">{pmt.client_name || 'N/A'}</div>
                                                            {hallNo && <div className="text-[10px] text-slate-500">Hall: {hallNo}</div>}
                                                        </td>
                                                        <td className="px-2 py-1 align-top">{getPaymentTypePill(pmt)}</td>
                                                        <td className="px-2 py-1 align-top text-[11px] font-semibold text-slate-700">{pmt.payment_mode || 'N/A'}</td>
                                                        <td className="px-2 py-1 align-top text-right">
                                                            <div className="font-medium text-slate-800 text-[11px]">₹ {formatCurrency(received)}</div>
                                                        </td>
                                                        <td className="px-2 py-1 align-top text-right">
                                                            <div className="font-medium text-rose-500 text-[11px]">₹ {formatCurrency(tds)}</div>
                                                        </td>
                                                        <td className="px-2 py-1 align-top text-right">
                                                            <div className="font-medium text-emerald-600 text-[11px]">₹ {formatCurrency(received - tds)}</div>
                                                        </td>
                                                        <td className="px-2 py-1 align-top text-[11px] text-slate-700">
                                                            <div className="font-bold">{formatDate(pmt.payment_date || pmt.added)}</div>
                                                        </td>
                                                        <td className="px-2 py-1 align-top">
                                                            <div className="font-bold text-slate-800 text-[11px]">{bank}</div>
                                                        </td>
                                                        <td className="px-2 py-1 align-top text-[10px] text-slate-500 whitespace-normal w-40">
                                                            <div className="line-clamp-2" title={pmt.notes || ''}>{pmt.notes || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-2 py-1 align-top text-center">{getStatusBadge(pmt)}</td>
                                                        <td className="px-2 py-1 align-top text-center">
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-2 px-2">
                        <span className="text-sm text-gray-500 font-medium">
                            Showing {totalReceipts === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalReceipts)} of {totalReceipts} receipts
                        </span>
                        <div className="flex gap-1 bg-white border border-gray-200 rounded-md shadow-sm p-1">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                Prev
                            </button>

                            {Array.from({ length: totalPages }).map((_, idx) => {
                                const pageNum = idx + 1;
                                if (
                                    pageNum === 1 ||
                                    pageNum === totalPages ||
                                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                }
                                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                    return <span key={pageNum} className="px-2 py-1.5 text-gray-400">...</span>;
                                }
                                return null;
                            })}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Total Summary Section (Outside Table) */}
                {!loading && filteredReceipts.length > 0 && (
                    <div className="mt-2 bg-white border border-slate-200 rounded-lg shadow-sm p-3 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-6 overflow-x-auto w-full md:w-auto scrollbar-hide">
                            <div className="font-black text-slate-800 text-[12px] whitespace-nowrap">Total Summary</div>

                            <div className="flex flex-col border-l border-slate-200 pl-4 whitespace-nowrap">
                                <span className="text-slate-800 font-black text-[12px]">{totalReceipts}</span>
                                <span className="text-slate-500 text-[9px] font-bold mt-0.5">Total Receipts</span>
                            </div>

                            <div className="flex flex-col border-l border-slate-200 pl-4 whitespace-nowrap">
                                <span className="text-emerald-600 font-black text-[12px]">₹ {formatCurrency(totalReceived)}</span>
                                <span className="text-slate-500 text-[9px] font-bold mt-0.5">Total Received</span>
                            </div>

                            <div className="flex flex-col border-l border-slate-200 pl-4 whitespace-nowrap">
                                <span className="text-rose-600 font-black text-[12px]">₹ {formatCurrency(totalTds)}</span>
                                <span className="text-slate-500 text-[9px] font-bold mt-0.5">Total TDS Deducted</span>
                            </div>

                            <div className="flex flex-col border-l border-slate-200 pl-4 whitespace-nowrap">
                                <span className="text-emerald-600 font-black text-[12px]">₹ {formatCurrency(netAmountReceived)}</span>
                                <span className="text-slate-500 text-[9px] font-bold mt-0.5">Net Amount Received</span>
                            </div>

                            <div className="flex flex-col border-l border-slate-200 pl-4 whitespace-nowrap">
                                <span className="text-slate-800 font-black text-[12px]">₹ {formatCurrency(creditNotesTotal)}</span>
                                <span className="text-slate-500 text-[9px] font-bold mt-0.5">Credit Notes Adjusted</span>
                            </div>

                            <div className="flex flex-col border-l border-slate-200 pl-4 whitespace-nowrap">
                                <span className="text-slate-800 font-black text-[12px]">{avgPaymentDays} Days</span>
                                <span className="text-slate-500 text-[9px] font-bold mt-0.5">Average Payment Days</span>
                            </div>
                        </div>

                        <div className="shrink-0 pl-2">
                            <button
                                onClick={() => navigate('/accounts/summary-report')}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 rounded-lg text-xs font-bold border border-indigo-200 hover:bg-indigo-50 transition-colors shadow-sm"
                            >
                                <FileText className="w-4 h-4" /> View Summary Report
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ReceiptsView;
