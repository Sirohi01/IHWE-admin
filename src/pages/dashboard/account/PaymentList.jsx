import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, MessageCircleMore, Mail, Users, DollarSign, CreditCard, Loader2, Eye } from 'lucide-react';
import api, { SERVER_URL } from '../../../lib/api';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import AccountNavigation from '../../../components/AccountNavigation';
import { resolveLinkedIds } from '../../../utils/resolveLinkedIds';

// Hook: animate number from 0 to target when element enters viewport
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
        <div ref={ref} className={`group cursor-pointer relative bg-gradient-to-br from-white ${gradientTo} p-4 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden`}>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
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
    const [searchParams] = useSearchParams();
    const crmEventId = searchParams.get('crmEventId');
    const isAllList = id === 'all';
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [accountName, setAccountName] = useState('Account');
    const [activeEventId, setActiveEventId] = useState(crmEventId || null);
    const [sendingReceipt, setSendingReceipt] = useState({});
    const [linkedAccountIds, setLinkedAccountIds] = useState([]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const [res, linkedIds] = await Promise.all([
                    api.get('/api/payments'),
                    isAllList ? Promise.resolve([]) : resolveLinkedIds(id),
                ]);
                setPayments(res.data?.data || res.data || []);
                setLinkedAccountIds(linkedIds);
            } catch (err) {
                console.error("Failed to fetch payments", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, [id, isAllList]);

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
                    if (!activeEventId && res.data.data?.companyInfo?.crm_event_id) {
                        setActiveEventId(res.data.data.companyInfo.crm_event_id);
                    } else if (!activeEventId && res.data.data?.companyInfo?.event_id) {
                        setActiveEventId(res.data.data.companyInfo.event_id);
                    }
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
        if (String(pmt.payment_mode || '').toLowerCase() === 'cash') {
            if (pmt.received_by) lines.push(`Received By: ${pmt.received_by}`);
            if (pmt.received_date) lines.push(`Received Date: ${formatDate(pmt.received_date)}`);
            return lines.length ? lines : ['N/A'];
        }
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

    const filteredPayments = payments.filter(pmt => {
        // filter by company if not all list
        if (!isAllList && !linkedAccountIds.includes(String(pmt.companyId || ''))) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            (pmt.invoice_no || pmt.invoice_id || '').toLowerCase().includes(q) ||
            (pmt.payment_mode || '').toLowerCase().includes(q) ||
            (pmt.status_short || '').toLowerCase().includes(q) ||
            (pmt.added_by || '').toLowerCase().includes(q)
        );
    });

    const derivedEventId = activeEventId || (filteredPayments.length > 0 ? filteredPayments.find(p => p.crmEventId)?.crmEventId : null) || '69edb20efdd846637abaaee0';

    const groupedPayments = Object.values(filteredPayments.reduce((acc, pmt) => {
        const invoiceKey = String(pmt.payment_group_id || pmt.invoice_id || pmt.invoice_no || 'no-invoice');
        if (!acc[invoiceKey]) {
            acc[invoiceKey] = {
                key: invoiceKey,
                invoiceNo: pmt.invoice_no || pmt.invoice_id || 'N/A',
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <AnimatedStatCard
                icon={<CreditCard className="w-5 h-5 text-blue-600" strokeWidth={2.5} />}
                gradientTo="to-blue-50" iconBg="bg-blue-100"
                rawValue={totalPayments}
                displayValue={(c) => Math.round(c)}
                label="TOTAL PAYMENTS"
                subLabel={`${totalInvoices} Invoice${totalInvoices === 1 ? '' : 's'}`} subColor="#2563eb"
            />
            <AnimatedStatCard
                icon={<DollarSign className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />}
                gradientTo="to-emerald-50" iconBg="bg-emerald-100"
                rawValue={totalReceived / 100000}
                displayValue={(c) => `₹ ${c.toFixed(1)}L`}
                label="TOTAL RECEIVED"
                subLabel="Amount" subColor="#059669"
            />
            <AnimatedStatCard
                icon={<DollarSign className="w-5 h-5 text-orange-600" strokeWidth={2.5} />}
                gradientTo="to-orange-50" iconBg="bg-orange-100"
                rawValue={totalTds / 1000}
                displayValue={(c) => `₹ ${c.toFixed(1)}k`}
                label="TOTAL TDS"
                subLabel="Deducted" subColor="#d97706"
            />
            <AnimatedStatCard
                icon={<Users className="w-5 h-5 text-rose-600" strokeWidth={2.5} />}
                gradientTo="to-rose-50" iconBg="bg-rose-100"
                rawValue={totalClients}
                displayValue={(c) => Math.round(c)}
                label="CLIENT"
                subLabel="Paid" subColor="#e11d48"
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pl-4 pr-4 py-4">
            {!isAllList && <AccountNavigation id={id} accountName={accountName} pageName="Payments" />}

            {/* -- Header -- */}
            <div className="flex items-center justify-between mb-3 px-1 mt-1">
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Payments</h1>
                    {isAllList && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <span className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => navigate('/dashboard')}>Home</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-gray-700 font-medium">All Payments</span>
                        </div>
                    )}
                </div>
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Search payments..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#3598dc]"
                    />
                    {id !== 'all' && derivedEventId && (
                        <button
                            onClick={() => navigate(`/crm-event/${derivedEventId}/payment-mail?clientId=${id}`)}
                            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md font-bold transition text-[13px]"
                        >
                            Reminder
                        </button>
                    )}
                    {id !== 'all' && (
                        <button
                            onClick={() => navigate(`/dashboard/account/AddPayment/${id}`)}
                            className="flex items-center gap-1.5 bg-[#194090] hover:bg-[#112f6b] text-white px-3 py-1.5 rounded-md font-bold transition text-[13px]"
                        >
                            Add Payment
                        </button>
                    )}
                </div>
            </div>

            {statCards}

            {/* -- Table Container -- */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                <table className="w-full min-w-[1120px] border-collapse text-left text-[11px] leading-tight">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-[0.02em] text-slate-700">
                            <th className="w-[48px] px-3 py-2">S.No.</th>
                            <th className="min-w-[195px] px-3 py-2">Invoice Details</th>
                            <th className="min-w-[120px] px-3 py-2">Received</th>
                            <th className="min-w-[90px] px-3 py-2">TDS</th>
                            <th className="min-w-[180px] px-3 py-2">Payment Details</th>
                            <th className="min-w-[120px] px-3 py-2">Payment Date</th>
                            <th className="min-w-[115px] px-3 py-2">Created By</th>
                            <th className="min-w-[112px] px-3 py-2 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="py-8 text-center text-gray-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-[#3598dc] border-t-transparent rounded-full animate-spin"></div>
                                        <span>Loading payments...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedGroups.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="py-8 text-center text-gray-500 text-[12px]">
                                    No payments found.
                                </td>
                            </tr>
                        ) : (
                            paginatedGroups.map((group, idx) => {
                                const rowIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                                return (
                                    <tr key={group.key} className="border-b border-slate-100 text-[11px] text-slate-600 transition-colors hover:bg-blue-50/30">
                                        <td className="px-3 py-2 font-bold text-slate-700">{rowIdx}</td>
                                        <td className="px-3 py-2">
                                            <div className="font-bold text-slate-950">{group.invoiceNo}</div>
                                            <div className="mt-0.5 text-slate-500">Date: <span className="font-semibold text-slate-700">{formatDate(group.invoiceDate)}</span></div>
                                            <div className="mt-0.5 text-slate-500">Invoice Total: <span className="font-semibold text-slate-800">{formatCurrency(group.invoiceAmount)}</span></div>
                                            <div className="mt-1 inline-flex rounded-full bg-blue-50 px-1.5 py-[1px] text-[10px] font-bold text-blue-700">
                                                {group.payments.length} Payment{group.payments.length === 1 ? '' : 's'}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-emerald-700">
                                            {group.payments.map((pmt, paymentIndex) => (
                                                <div key={`${pmt._id}-received`} className={paymentIndex > 0 ? 'mt-1 border-t border-slate-100 pt-1' : ''}>
                                                    <div className="font-bold">{formatCurrency(pmt.amount_text)}</div>
                                                </div>
                                            ))}
                                            {group.payments.length > 1 && (
                                                <div className="mt-1 border-t border-emerald-100 pt-1 text-[10px] font-bold uppercase text-emerald-800">
                                                    Total: {formatCurrency(group.receivedTotal)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-orange-600">
                                            {group.payments.map((pmt, paymentIndex) => (
                                                <div key={`${pmt._id}-tds`} className={paymentIndex > 0 ? 'mt-1 border-t border-slate-100 pt-1' : ''}>
                                                    <div className="font-bold">{formatCurrency(pmt.tds_text)}</div>
                                                </div>
                                            ))}
                                            {group.payments.length > 1 && (
                                                <div className="mt-1 border-t border-orange-100 pt-1 text-[10px] font-bold uppercase text-orange-700">
                                                    Total: {formatCurrency(group.tdsTotal)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-1.5 text-slate-600 leading-[1.15]">
                                            {group.payments.map((pmt, paymentIndex) => (
                                                <div key={pmt._id} className={paymentIndex > 0 ? 'mt-1 border-t border-slate-100 pt-1' : ''}>
                                                    {getPaymentDetailLines(pmt).map((line, lineIndex) => (
                                                        <div key={`${pmt._id}-${lineIndex}`} className={lineIndex === 0 ? 'font-bold text-slate-900' : 'mt-[1px] text-slate-500'}>
                                                            {line}
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-slate-600">
                                            {group.payments.map((pmt, paymentIndex) => (
                                                <div key={`${pmt._id}-date`} className={paymentIndex > 0 ? 'mt-1 border-t border-slate-100 pt-1' : ''}>
                                                    <div className="font-bold text-slate-900">{formatDateTime(pmt.payment_date)}</div>
                                                </div>
                                            ))}
                                        </td>
                                        <td className="px-3 py-2">
                                            {group.payments.map((pmt, paymentIndex) => (
                                                <div key={`${pmt._id}-created`} className={paymentIndex > 0 ? 'mt-1 border-t border-slate-100 pt-1' : ''}>
                                                    <div className="font-bold text-[#194090]">{pmt.added_by || 'Admin'}</div>
                                                    <div className="mt-0.5 text-slate-500">{formatDateTime(pmt.added)}</div>
                                                </div>
                                            ))}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            {group.payments.map((pmt, paymentIndex) => (
                                                <div key={`${pmt._id}-actions`} className={`flex items-center justify-center gap-1.5 ${paymentIndex > 0 ? 'mt-1 border-t border-slate-100 pt-1' : ''}`}>
                                                    <button
                                                        onClick={() => openReceipt(pmt)}
                                                        title="View Payment Receipt"
                                                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleSendReceipt(pmt._id, 'whatsapp')}
                                                        disabled={sendingReceipt[`${pmt._id}-whatsapp`]}
                                                        title="Send WhatsApp Receipt"
                                                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-50 text-green-600 transition-colors hover:bg-green-100 disabled:opacity-50"
                                                    >
                                                        {sendingReceipt[`${pmt._id}-whatsapp`] ? <Loader2 size={14} className="animate-spin" /> : <MessageCircleMore size={14} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleSendReceipt(pmt._id, 'email')}
                                                        disabled={sendingReceipt[`${pmt._id}-email`]}
                                                        title="Send Email Receipt with PDF"
                                                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50"
                                                    >
                                                        {sendingReceipt[`${pmt._id}-email`] ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                                                    </button>
                                                </div>
                                            ))}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                    {!loading && groupedPayments.length > 0 && (
                        <tfoot>
                            <tr className="bg-slate-50 text-[11px] font-bold uppercase text-slate-800">
                                <td className="px-3 py-2" colSpan="2">Total</td>
                                <td className="whitespace-nowrap px-3 py-2 text-emerald-700">{formatCurrency(totalReceived)}</td>
                                <td className="whitespace-nowrap px-3 py-2 text-orange-700">{formatCurrency(totalTds)}</td>
                                <td className="px-3 py-2 text-slate-600" colSpan="4">
                                    {totalPayments} payment{totalPayments === 1 ? '' : 's'} against {totalInvoices} invoice{totalInvoices === 1 ? '' : 's'}
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 px-2">
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
            )}
        </div>
    );
};

export default PaymentList;
