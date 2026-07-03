import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Edit, MessageCircleMore, Mail, FileText, CheckCircle2, Clock, Users, DollarSign, Package, CreditCard } from 'lucide-react';
import api from '../../../lib/api';
import Swal from 'sweetalert2';
import AccountNavigation from '../../../components/AccountNavigation';

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
    const isAllList = id === 'all';
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [accountName, setAccountName] = useState('');
    const itemsPerPage = 10;

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

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const dateObj = new Date(dateString);
        return dateObj.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).replace(/\//g, " ");
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A";
        const dateObj = new Date(dateString);
        return dateObj.toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric"
        }).replace(/\//g, " ") + ", " + dateObj.toLocaleTimeString("en-US", {
            hour: "2-digit", minute: "2-digit", hour12: true
        });
    };

    const filteredPayments = payments.filter(pmt => {
        // filter by company if not all list
        if (!isAllList && String(pmt.companyId || '') !== String(id)) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            (pmt.invoice_no || pmt.invoice_id || '').toLowerCase().includes(q) ||
            (pmt.payment_mode || '').toLowerCase().includes(q) ||
            (pmt.status_short || '').toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const paginatedPayments = filteredPayments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const totalPayments = filteredPayments.length;
    const totalReceived = filteredPayments.reduce((sum, pmt) => sum + (parseFloat(pmt.amount_text) || 0), 0);
    const totalTds = filteredPayments.reduce((sum, pmt) => sum + (parseFloat(pmt.tds_text) || 0), 0);
    const totalClients = new Set(filteredPayments.map(pmt => pmt.companyId).filter(Boolean)).size;

    const statCards = (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <AnimatedStatCard
                icon={<CreditCard className="w-5 h-5 text-blue-600" strokeWidth={2.5} />}
                gradientTo="to-blue-50" iconBg="bg-blue-100"
                rawValue={totalPayments}
                displayValue={(c) => Math.round(c)}
                label="TOTAL PAYMENTS"
                subLabel="Received" subColor="#2563eb"
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
                label="TOTAL CLIENTS"
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
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-1 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-gray-100 border-b border-gray-200 text-xs font-semibold text-gray-700">
                            <th className="py-2.5 px-4 font-bold">#</th>
                            <th className="py-2.5 px-4 font-bold">Invoice Details</th>
                            <th className="py-2.5 px-4 font-bold">Received (?)</th>
                            <th className="py-2.5 px-4 font-bold">TDS (?)</th>
                            <th className="py-2.5 px-4 font-bold">Payment Details</th>
                            <th className="py-2.5 px-4 font-bold">Added On / By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="py-8 text-center text-gray-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-[#3598dc] border-t-transparent rounded-full animate-spin"></div>
                                        <span>Loading payments...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedPayments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-8 text-center text-gray-500 text-sm">
                                    No payments found.
                                </td>
                            </tr>
                        ) : (
                            paginatedPayments.map((pmt, idx) => {
                                const rowIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                                return (
                                    <tr key={pmt._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-sm">
                                        <td className="py-3 px-4 font-medium text-gray-700">{rowIdx}</td>
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-gray-900">{pmt.invoice_no || pmt.invoice_id || 'N/A'}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">Inv. Amount: ₹ {parseFloat(pmt.f_amount || 0).toFixed(2)}</div>
                                        </td>
                                        <td className="py-3 px-4 font-medium text-emerald-600">
                                            {parseFloat(pmt.amount_text || 0).toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4 text-orange-600 font-medium">
                                            {parseFloat(pmt.tds_text || 0).toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4 text-[13px] text-gray-600">
                                            <div><span className="font-medium text-gray-800">{pmt.payment_mode || 'N/A'}</span> - {pmt.status === 1 ? 'Received' : 'Pending'}</div>
                                            {(pmt.bankId || pmt.utr_no) && (
                                                <div className="text-xs text-gray-400 mt-0.5">{pmt.bankId} {pmt.utr_no ? `| Ref: ${pmt.utr_no}` : ''}</div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-[13px] text-gray-600 whitespace-nowrap">
                                            <div className="font-medium text-gray-800">{formatDateTime(pmt.added)}</div>
                                            <div className="text-[12px] text-gray-500 mt-0.5">By: <span className="font-medium text-[#194090]">{pmt.added_by || 'Admin'}</span></div>
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
                <div className="flex justify-between items-center mt-4 px-2">
                    <span className="text-sm text-gray-500 font-medium">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length} entries
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
