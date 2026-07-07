import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ChevronRight, MessageCircleMore, Mail, FileText, Users, DollarSign, CreditCard, Loader2, Search, Plus, CalendarDays, ChevronDown, Building2, Settings, CheckCircle2, Filter, Download, AlertTriangle, Clock, MoreVertical } from 'lucide-react';
import api, { SERVER_URL } from '../../lib/api';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import AccountNavigation from '../../components/AccountNavigation';
import Select from 'react-select';
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

const PaymentList = () => {
    const navigate = useNavigate();
    const { id = 'all' } = useParams();
    const isAllList = id === 'all';
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [accountName, setAccountName] = useState('Account');
    const [sendingReceipt, setSendingReceipt] = useState({});

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter states
    const [filterDate, setFilterDate] = useState('all');
    const [filterBank, setFilterBank] = useState('');
    const [filterMode, setFilterMode] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // Add Payment Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [modalCompanies, setModalCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [loadingCompanies, setLoadingCompanies] = useState(false);

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
            } catch (error) {
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

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await api.get('/api/payments');
                setPayments(res.data?.data || res.data || []);
            } catch (err) {
                console.error("Failed to fetch payments", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    useEffect(() => {
        if (isAllList) {
            setAccountName('');
            return;
        }

        let cancelled = false;
        const fetchAccountName = async () => {
            try {
                const res = await api.get(`/api/account-overview/${id}`);
                if (!cancelled && res.data?.success) {
                    setAccountName(res.data.data?.companyInfo?.name || '');
                }
            } catch (err) {
                if (!cancelled) setAccountName('');
            }
        };

        fetchAccountName();
        return () => {
            cancelled = true;
        };
    }, [id, isAllList]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchQuery(searchInput);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchInput]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return "N/A";
        const day = String(d.getDate()).padStart(2, '0');
        const month = d.toLocaleString('en-US', { month: 'short' });
        const year = String(d.getFullYear()).slice(-2);
        return `${day} ${month} ${year}`;
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A";
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return "N/A";
        const day = String(d.getDate()).padStart(2, '0');
        const month = d.toLocaleString('en-US', { month: 'short' });
        const year = String(d.getFullYear()).slice(-2);
        const time = d.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        return `${day} ${month} ${year}, ${time}`;
    };

    const formatCurrency = (value) => {
        const amount = Number(value || 0);
        return `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getPaymentDetailLines = (pmt) => {
        const lines = [];
        if (pmt.payment_mode) lines.push(pmt.payment_mode);
        if (pmt.bankId) lines.push(`Bank: ${pmt.bankId}`);
        if (pmt.utr_no) lines.push(`UTR: ${pmt.utr_no}`);
        if (pmt.cash_receipt_no) lines.push(`Cash Receipt: ${pmt.cash_receipt_no}`);
        if (pmt.cheque_no) lines.push(`Cheque: ${pmt.cheque_no}`);
        if (pmt.card_transaction_no) lines.push(`Card Txn: ${pmt.card_transaction_no}`);
        if (pmt.wallet_transaction_no) lines.push(`Wallet Txn: ${pmt.wallet_transaction_no}`);
        const txnDate = pmt.cheque_date || pmt.card_date || pmt.neft_date;
        if (txnDate) lines.push(`Txn Date: ${formatDateTime(txnDate)}`);
        return lines.length ? lines : ['N/A'];
    };

    const openReceipt = (pmt) => {
        window.open(`${SERVER_URL}/api/payments/${pmt._id}/receipt`, '_blank', 'noopener,noreferrer');
    };

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Payments');

        // Define columns
        worksheet.columns = [
            { header: 'S.No.', key: 'sno', width: 8 },
            { header: 'Invoice No', key: 'invoice_no', width: 20 },
            { header: 'Client / Company', key: 'client_name', width: 25 },
            { header: 'Received Amount', key: 'received', width: 20 },
            { header: 'TDS Deducted', key: 'tds', width: 20 },
            { header: 'Payment Mode', key: 'mode', width: 18 },
            { header: 'Bank', key: 'bank', width: 20 },
            { header: 'UTR / Ref No', key: 'utr', width: 25 },
            { header: 'Payment Date', key: 'date', width: 18 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Created By', key: 'created_by', width: 15 },
            { header: 'Created Date', key: 'created_date', width: 18 }
        ];

        // Style the header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { name: 'Arial', family: 4, size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;

        // Add Data
        filteredPayments.forEach((pmt, index) => {
            const rawStatus = String(pmt.status || 'Completed');
            const pmtStatus = (rawStatus.toLowerCase() === 'completed' || rawStatus === '1') ? 'Completed' : (rawStatus.toLowerCase() === 'overdue' ? 'Overdue' : 'Partially Paid');

            const row = worksheet.addRow({
                sno: index + 1,
                invoice_no: pmt.invoice_no || pmt.invoice_id || 'N/A',
                client_name: pmt.client_name || 'N/A',
                received: Number(pmt.amount_text || 0),
                tds: Number(pmt.tds_text || 0),
                mode: pmt.payment_mode || 'N/A',
                bank: pmt.bankId || 'N/A',
                utr: pmt.utr_no || 'N/A',
                date: formatDate(pmt.payment_date || pmt.added),
                status: pmtStatus,
                created_by: pmt.added_by || 'Admin',
                created_date: formatDate(pmt.added)
            });

            // Center alignment for specific columns
            row.getCell('sno').alignment = { horizontal: 'center', vertical: 'middle' };
            row.getCell('status').alignment = { horizontal: 'center', vertical: 'middle' };
            row.getCell('date').alignment = { horizontal: 'center', vertical: 'middle' };

            // Currency formatting for amount columns
            row.getCell('received').numFmt = '₹#,##0.00';
            row.getCell('tds').numFmt = '₹#,##0.00';

            // Color code status
            const statusCell = row.getCell('status');
            const statusValue = statusCell.value;
            if (statusValue === 'Completed') {
                statusCell.font = { color: { argb: 'FF059669' }, bold: true };
            } else if (statusValue === 'Overdue') {
                statusCell.font = { color: { argb: 'FFDC2626' }, bold: true };
            } else {
                statusCell.font = { color: { argb: 'FFD97706' }, bold: true };
            }

            row.height = 22;
            row.alignment = { vertical: 'middle' };
        });

        // Add borders to all cells
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFD4D4D8' } },
                    left: { style: 'thin', color: { argb: 'FFD4D4D8' } },
                    bottom: { style: 'thin', color: { argb: 'FFD4D4D8' } },
                    right: { style: 'thin', color: { argb: 'FFD4D4D8' } }
                };
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), 'Payments_Export.xlsx');
    };

    const filteredPayments = payments.filter(pmt => {
        // filter by company if not all list
        if (!isAllList && String(pmt.companyId || '') !== String(id)) return false;

        // Bank filter
        if (filterBank && pmt.bankId !== filterBank) return false;

        // Mode filter
        if (filterMode && pmt.payment_mode !== filterMode) return false;

        // Status filter
        const rawStatus = String(pmt.status || 'Completed');
        const pmtStatus = (rawStatus.toLowerCase() === 'completed' || rawStatus === '1') ? 'Completed' : (rawStatus.toLowerCase() === 'overdue' ? 'Overdue' : 'Partially Paid');
        if (filterStatus && pmtStatus !== filterStatus) return false;

        // Date filter
        if (filterDate !== 'all') {
            const pmtDate = new Date(pmt.payment_date || pmt.added);
            if (!isNaN(pmtDate.getTime())) {
                const now = new Date();
                if (filterDate === 'this_month') {
                    if (pmtDate.getMonth() !== now.getMonth() || pmtDate.getFullYear() !== now.getFullYear()) return false;
                } else if (filterDate === 'last_3_months') {
                    const threeMonthsAgo = new Date();
                    threeMonthsAgo.setMonth(now.getMonth() - 3);
                    if (pmtDate < threeMonthsAgo) return false;
                } else if (filterDate === 'this_year') {
                    if (pmtDate.getFullYear() !== now.getFullYear()) return false;
                }
            }
        }

        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            (pmt.invoice_no || pmt.invoice_id || '').toLowerCase().includes(q) ||
            (pmt.payment_mode || '').toLowerCase().includes(q) ||
            (pmt.status_short || '').toLowerCase().includes(q) ||
            (pmt.added_by || '').toLowerCase().includes(q)
        );
    });

    const uniqueBanks = [...new Set(payments.map(p => p.bankId).filter(Boolean))];
    const uniqueModes = [...new Set(payments.map(p => p.payment_mode).filter(Boolean))];

    const groupedPayments = Object.values(filteredPayments.reduce((acc, pmt) => {
        const invoiceKey = String(pmt.invoice_id || pmt.invoice_no || 'no-invoice');
        if (!acc[invoiceKey]) {
            acc[invoiceKey] = {
                key: invoiceKey,
                invoiceNo: pmt.invoice_no || pmt.invoice_id || 'N/A',
                clientName: pmt.client_name || 'N/A',
                invoiceDate: pmt.invoice_date || pmt.added,
                invoiceAmount: Number(pmt.invoice_amount || pmt.f_amount || 0),
                payments: [],
                receivedTotal: 0,
                tdsTotal: 0,
            };
        }

        acc[invoiceKey].payments.push(pmt);
        acc[invoiceKey].receivedTotal += Number(pmt.amount_text || 0);
        acc[invoiceKey].tdsTotal += Number(pmt.tds_text || 0);
        acc[invoiceKey].invoiceAmount = Math.max(acc[invoiceKey].invoiceAmount, Number(pmt.invoice_amount || pmt.f_amount || 0));
        return acc;
    }, {}));

    const totalPages = Math.ceil(groupedPayments.length / itemsPerPage);
    const paginatedGroups = groupedPayments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const totalPayments = filteredPayments.length;
    const totalInvoices = groupedPayments.length;
    const totalReceived = filteredPayments.reduce((sum, pmt) => sum + (parseFloat(pmt.amount_text) || 0), 0);
    const totalTds = filteredPayments.reduce((sum, pmt) => sum + (parseFloat(pmt.tds_text) || 0), 0);
    const totalClients = new Set(filteredPayments.map(pmt => pmt.companyId).filter(Boolean)).size;

    const totalInvoiceValue = groupedPayments.reduce((sum, group) => sum + (group.invoiceAmount || 0), 0);
    const totalOutstanding = Math.max(0, totalInvoiceValue - totalReceived);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalOverdue = groupedPayments.reduce((sum, group) => {
        const outstanding = Math.max(0, (group.invoiceAmount || 0) - (group.receivedTotal || 0));
        if (outstanding > 0 && new Date(group.invoiceDate) < thirtyDaysAgo) {
            return sum + outstanding;
        }
        return sum;
    }, 0);

    const totalCreditNotes = filteredPayments.reduce((sum, pmt) => sum + (parseFloat(pmt.debit_note_ammount || pmt.credit_note_amount) || 0), 0);
    const netAmountReceived = totalReceived - totalTds;
    const totalPending = Math.max(0, totalOutstanding - totalOverdue);

    const now = new Date();
    const thisMonthPayments = filteredPayments.filter((pmt) => {
        const d = new Date(pmt.payment_date || pmt.added);
        return !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const thisMonthReceived = thisMonthPayments.reduce((sum, pmt) => sum + (parseFloat(pmt.amount_text) || 0), 0);
    const thisMonthTds = thisMonthPayments.reduce((sum, pmt) => sum + (parseFloat(pmt.tds_text) || 0), 0);

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
            console.error(err);
            toast.error(err.response?.data?.message || `Error sending ${type} receipt`);
        } finally {
            setSendingReceipt(prev => ({ ...prev, [`${pmtId}-${type}`]: false }));
        }
    };

    const statCards = (
        <div className="flex flex-col gap-2.5 mb-3 mt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <AnimatedStatCard
                    icon={<CreditCard className="w-5 h-5 text-blue-600" strokeWidth={2.5} />}
                    gradientTo="to-blue-50" iconBg="bg-blue-100"
                    rawValue={totalPayments}
                    displayValue={(c) => Math.round(c)}
                    label="Total Payments"
                    subLabel={`${totalInvoices} Invoices`} subColor="#2563eb"
                />
                <AnimatedStatCard
                    icon={<DollarSign className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />}
                    gradientTo="to-emerald-50" iconBg="bg-emerald-100"
                    rawValue={totalReceived}
                    displayValue={(c) => `₹ ${c.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    label="Total Received"
                    subLabel={`₹ ${thisMonthReceived.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} This Month`} subColor="#059669"
                />
                <AnimatedStatCard
                    icon={<DollarSign className="w-5 h-5 text-orange-600" strokeWidth={2.5} />}
                    gradientTo="to-orange-50" iconBg="bg-orange-100"
                    rawValue={totalTds}
                    displayValue={(c) => `₹ ${c.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    label="Total TDS Deducted"
                    subLabel={`₹ ${thisMonthTds.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} This Month`} subColor="#d97706"
                />
                <AnimatedStatCard
                    icon={<Users className="w-5 h-5 text-rose-600" strokeWidth={2.5} />}
                    gradientTo="to-rose-50" iconBg="bg-rose-100"
                    rawValue={totalClients}
                    displayValue={(c) => Math.round(c)}
                    label="Client"
                    subLabel="Paid" subColor="#e11d48"
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <AnimatedStatCard
                    icon={<DollarSign className="w-5 h-5 text-indigo-600" strokeWidth={2.5} />}
                    gradientTo="to-indigo-50" iconBg="bg-indigo-100"
                    rawValue={netAmountReceived}
                    displayValue={(c) => `₹ ${c.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    label="Net Amount Received"
                    subLabel="" subColor="#4f46e5"
                />
                <AnimatedStatCard
                    icon={<AlertTriangle className="w-5 h-5 text-amber-600" strokeWidth={2.5} />}
                    gradientTo="to-amber-50" iconBg="bg-amber-100"
                    rawValue={totalOverdue}
                    displayValue={(c) => `₹ ${c.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    label="Overdue Amount"
                    subLabel="Invoice > 30 days old, still outstanding" subColor="#d97706"
                />
                <AnimatedStatCard
                    icon={<Clock className="w-5 h-5 text-blue-600" strokeWidth={2.5} />}
                    gradientTo="to-blue-50" iconBg="bg-blue-100"
                    rawValue={totalPending}
                    displayValue={(c) => `₹ ${c.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    label="Pending Amount"
                    subLabel="Outstanding, not yet overdue" subColor="#2563eb"
                />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pl-4 pr-4 py-4">
            {!isAllList && <AccountNavigation id={id} accountName={accountName} pageName="Payments" />}

            {/* -- Header -- */}
            <div className="flex items-center justify-between mb-2 mt-2">
                <div>
                    <h1 className="text-2xl font-medium text-slate-900 tracking-tight">Payments</h1>
                    <div className="text-sm text-slate-500 mt-1">Internal transaction log — every payment recorded against an invoice, who recorded it and when. For the receipt document to send a client, see Receipts.</div>
                </div>
                <div className="flex gap-3 items-center">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by invoice no., UTR, txn id..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-[300px] border border-slate-200 rounded-lg pl-3 pr-10 py-2 text-[13px] bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-shadow placeholder:text-slate-400"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <button
                        onClick={handleOpenAddPayment}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition-colors text-[13px]"
                    >
                        <Plus className="w-4 h-4" />
                        Add Payment
                    </button>
                </div>
            </div>

            {statCards}

            {/* -- Filters -- */}
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-sm mb-2 overflow-x-auto">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <CalendarDays className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="appearance-none bg-white border border-slate-200 text-slate-700 pl-9 pr-8 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer"
                        >
                            <option value="all">All Dates</option>
                            <option value="this_month">This Month</option>
                            <option value="last_3_months">Last 3 Months</option>
                            <option value="this_year">This Year</option>
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                            value={filterBank}
                            onChange={(e) => setFilterBank(e.target.value)}
                            className="appearance-none bg-white border border-slate-200 text-slate-700 pl-9 pr-8 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer"
                        >
                            <option value="">All Banks</option>
                            {uniqueBanks.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <Settings className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                            value={filterMode}
                            onChange={(e) => setFilterMode(e.target.value)}
                            className="appearance-none bg-white border border-slate-200 text-slate-700 pl-9 pr-8 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer"
                        >
                            <option value="">All Modes</option>
                            {uniqueModes.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <CheckCircle2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none bg-white border border-slate-200 text-slate-700 pl-9 pr-8 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer"
                        >
                            <option value="">All Status</option>
                            <option value="Completed">Completed</option>
                            <option value="Partially Paid">Partially Paid</option>
                            <option value="Overdue">Overdue</option>
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
                <div className="shrink-0 pl-3 border-l border-slate-200 ml-3 flex gap-2">
                    <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 text-blue-600 bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 shadow-sm transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* -- Table Container -- */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                <table className="w-full min-w-[1120px] border-collapse text-left text-[11px] leading-tight">
                    <thead>
                        <tr className="border-b border-slate-200 bg-white text-[10px] font-bold uppercase tracking-wider text-slate-700">
                            <th className="px-3 py-2 w-[40px]">S.No.</th>
                            <th className="px-3 py-2 min-w-[160px]">Invoice Details</th>
                            <th className="px-3 py-2 min-w-[160px]">Client / Company</th>
                            <th className="px-3 py-2 min-w-[100px]">Received</th>
                            <th className="px-3 py-2 min-w-[100px]">TDS Deducted</th>
                            <th className="px-3 py-2 min-w-[180px]">Payment Details</th>
                            <th className="px-3 py-2 min-w-[130px]">Payment Date</th>
                            <th className="px-3 py-2 min-w-[130px]">Created By</th>
                            <th className="px-3 py-2 min-w-[100px] text-center">Status</th>
                            <th className="px-3 py-2 min-w-[100px] text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="10" className="py-6 text-center text-gray-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-[#3598dc] border-t-transparent rounded-full animate-spin"></div>
                                        <span>Loading payments...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedGroups.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="py-6 text-center text-gray-500">
                                    No payments found.
                                </td>
                            </tr>
                        ) : (
                            paginatedGroups.map((group, idx) => {
                                const rowIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                                return (
                                    <tr key={group.key} className="border-b border-slate-200 bg-white hover:bg-slate-50/50 transition-colors">
                                        <td className="px-3 py-2.5 text-[11px] font-bold text-slate-900 align-top">{rowIdx}</td>
                                        <td className="px-3 py-2.5 align-top">
                                            <div className="font-bold text-slate-900 text-[11px]">{group.invoiceNo}</div>
                                            <div className="mt-1 text-slate-500 text-[10px]">Date: <span className="text-slate-700">{formatDate(group.invoiceDate)}</span></div>
                                            <div className="mt-0.5 text-slate-500 text-[10px]">Invoice Total: <span className="text-slate-700">{formatCurrency(group.invoiceAmount)}</span></div>
                                            <div className="mt-1.5 inline-flex rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                                                {group.payments.length} Payment{group.payments.length === 1 ? '' : 's'}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 align-top">
                                            <div className="font-bold text-slate-800 text-[11px]">{group.clientName}</div>
                                        </td>
                                        <td className="px-3 py-2.5 align-top">
                                            {group.payments.map((pmt, paymentIndex) => (
                                                <div key={`${pmt._id}-received`} className={paymentIndex > 0 ? 'mt-1.5 border-t border-slate-200 pt-1.5' : ''}>
                                                    <div className="font-bold text-[11px] text-emerald-600">{formatCurrency(pmt.amount_text)}</div>
                                                </div>
                                            ))}
                                            {group.payments.length > 1 && (
                                                <div className="mt-1.5 text-[10px] text-slate-500">
                                                    Total: {formatCurrency(group.receivedTotal)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-2.5 align-top">
                                            {group.payments.map((pmt, paymentIndex) => (
                                                <div key={`${pmt._id}-tds`} className={paymentIndex > 0 ? 'mt-1.5 border-t border-slate-200 pt-1.5' : ''}>
                                                    <div className="font-bold text-[11px] text-orange-600">{formatCurrency(pmt.tds_text)}</div>
                                                </div>
                                            ))}
                                            {group.payments.length > 1 && (
                                                <div className="mt-1.5 text-[10px] text-slate-500">
                                                    Total: {formatCurrency(group.tdsTotal)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-2.5 align-top">
                                            {group.payments.map((pmt, paymentIndex) => (
                                                <div key={pmt._id} className={paymentIndex > 0 ? 'mt-1.5 border-t border-slate-200 pt-1.5' : ''}>
                                                    {getPaymentDetailLines(pmt).map((line, lineIndex) => (
                                                        <div key={`${pmt._id}-${lineIndex}`} className={lineIndex === 0 ? 'font-bold text-[11px] text-slate-900 mb-0.5' : 'text-[10px] text-slate-500'}>
                                                            {line}
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </td>
                                        <td className="px-3 py-2.5 align-top">
                                            {group.payments.map((pmt, paymentIndex) => (
                                                <div key={`${pmt._id}-date`} className={paymentIndex > 0 ? 'mt-1.5 border-t border-slate-200 pt-1.5' : ''}>
                                                    <div className="font-bold text-[11px] text-slate-900">{formatDateTime(pmt.payment_date)}</div>
                                                </div>
                                            ))}
                                        </td>
                                        <td className="px-3 py-2.5 align-top">
                                            {group.payments.map((pmt, paymentIndex) => (
                                                <div key={`${pmt._id}-created`} className={paymentIndex > 0 ? 'mt-1.5 border-t border-slate-200 pt-1.5' : ''}>
                                                    <div className="font-bold text-[11px] text-blue-600">{pmt.added_by || 'Admin'}</div>
                                                    <div className="text-[10px] text-slate-500">{formatDateTime(pmt.added)}</div>
                                                </div>
                                            ))}
                                        </td>
                                        <td className="px-3 py-2.5 align-top text-center">
                                            {group.payments.map((pmt, paymentIndex) => {
                                                const status = String(pmt.status || 'Completed'); // Mocking status logic since it isn't in original JSX clearly
                                                const isCompleted = status.toLowerCase() === 'completed' || status === '1';
                                                const isOverdue = status.toLowerCase() === 'overdue';
                                                const isPartiallyPaid = status.toLowerCase() === 'partially paid';
                                                return (
                                                    <div key={`${pmt._id}-status`} className={paymentIndex > 0 ? 'mt-1.5 border-t border-slate-200 pt-1.5' : ''}>
                                                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${isCompleted ? 'bg-emerald-50 text-emerald-600' :
                                                            isOverdue ? 'bg-red-50 text-red-600' :
                                                                'bg-orange-50 text-orange-600'
                                                            }`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' :
                                                                isOverdue ? 'bg-red-500' :
                                                                    'bg-orange-500'
                                                                }`}></div>
                                                            {isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Partially Paid'}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </td>
                                        <td className="px-3 py-2.5 align-top text-center">
                                            {group.payments.map((pmt, paymentIndex) => (
                                                <div key={`${pmt._id}-actions`} className={`flex items-center justify-center gap-1.5 ${paymentIndex > 0 ? 'mt-1.5 border-t border-slate-200 pt-1.5' : ''}`}>
                                                    <button
                                                        onClick={() => handleSendReceipt(pmt._id, 'email')}
                                                        disabled={sendingReceipt[`${pmt._id}-email`]}
                                                        title="Send Email Receipt"
                                                        className="w-6 h-6 rounded bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
                                                    >
                                                        {sendingReceipt[`${pmt._id}-email`] ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleSendReceipt(pmt._id, 'whatsapp')}
                                                        disabled={sendingReceipt[`${pmt._id}-whatsapp`]}
                                                        title="Send WhatsApp Receipt"
                                                        className="w-6 h-6 rounded bg-green-50 border border-green-100 flex items-center justify-center text-emerald-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                                                    >
                                                        {sendingReceipt[`${pmt._id}-whatsapp`] ? <Loader2 size={12} className="animate-spin" /> : <MessageCircleMore size={12} />}
                                                    </button>
                                                    <div className="relative group">
                                                        <button
                                                            title="More Actions"
                                                            className="w-6 h-6 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                                                        >
                                                            <MoreVertical size={12} />
                                                        </button>
                                                        <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 flex flex-col py-1">
                                                            <button
                                                                onClick={() => openReceipt(pmt)}
                                                                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors w-full text-left"
                                                            >
                                                                <FileText size={14} />
                                                                View Document
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </td>
                                    </tr>

                                );
                            })
                        )}
                    </tbody>
                </table >
            </div >

            {/* Pagination Controls */}
            {
                totalPages > 1 && (
                    <div className="flex justify-between items-center mt-2 px-2">
                        <span className="text-sm text-gray-500 font-medium">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, groupedPayments.length)} of {groupedPayments.length} invoice entries
                        </span>
                        <div className="flex gap-1 bg-white border border-gray-200 rounded-md shadow-sm p-1">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
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
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${currentPage === pageNum ? 'bg-[#194090] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
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
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Total Summary Section (Outside Table) */}
            {!loading && groupedPayments.length > 0 && (
                <div className="mt-2 bg-white border border-slate-200 rounded-lg shadow-sm p-3 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-1 flex-wrap items-center justify-between gap-4 pr-6 border-r border-slate-200">
                        {/* Total Invoice Value */}
                        <div className="flex flex-col gap-1 items-center px-2 whitespace-nowrap">
                            <span className="text-[10px] font-bold text-slate-500">Total Invoice Value</span>
                            <span className="text-sm font-black text-slate-800">{formatCurrency(totalInvoiceValue)}</span>
                        </div>

                        <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

                        {/* Total Collections */}
                        <div className="flex flex-col gap-1 items-center px-2 whitespace-nowrap">
                            <span className="text-[10px] font-bold text-slate-500">Total Collections</span>
                            <span className="text-sm font-black text-slate-800">{formatCurrency(totalReceived)}</span>
                        </div>

                        <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

                        {/* Total Outstanding */}
                        <div className="flex flex-col gap-1 items-center px-2 whitespace-nowrap">
                            <span className="text-[10px] font-bold text-slate-500">Total Outstanding</span>
                            <span className="text-sm font-black text-slate-800">{formatCurrency(totalOutstanding)}</span>
                        </div>

                        <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

                        {/* Total Overdue */}
                        <div className="flex flex-col gap-1 items-center px-2 whitespace-nowrap">
                            <span className="text-[10px] font-bold text-slate-500">Total Overdue</span>
                            <span className="text-sm font-black text-red-600">{formatCurrency(totalOverdue)}</span>
                        </div>

                        <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

                        {/* Total TDS Deducted */}
                        <div className="flex flex-col gap-1 items-center px-2 whitespace-nowrap">
                            <span className="text-[10px] font-bold text-slate-500">Total TDS Deducted</span>
                            <span className="text-sm font-black text-slate-800">{formatCurrency(totalTds)}</span>
                        </div>

                        <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

                        {/* Total Credit Notes */}
                        <div className="flex flex-col gap-1 items-center px-2 whitespace-nowrap">
                            <span className="text-[10px] font-bold text-slate-500">Total Credit Notes</span>
                            <span className="text-sm font-black text-slate-800">{formatCurrency(totalCreditNotes)}</span>
                        </div>

                        <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

                        {/* Net Amount Received */}
                        <div className="flex flex-col items-center px-2 text-center whitespace-nowrap">
                            <span className="text-[10px] font-bold text-slate-500">Net Amount Received</span>
                            <span className="text-sm font-black text-slate-800 mt-1">{formatCurrency(netAmountReceived)}</span>
                            <span className="text-[9px] text-slate-500 font-medium">(After TDS)</span>
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

            {/* Add Payment Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800 text-lg">Select Client</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-4">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Search & Select Company</label>
                            <Select
                                options={modalCompanies}
                                isLoading={loadingCompanies}
                                onChange={(selected) => setSelectedCompanyId(selected ? selected.value : '')}
                                placeholder="Select client..."
                                className="text-sm"
                                isClearable
                                menuPortalTarget={document.body}
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            />
                        </div>
                        <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleProceedAddPayment}
                                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                disabled={!selectedCompanyId}
                            >
                                Proceed
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default PaymentList;
