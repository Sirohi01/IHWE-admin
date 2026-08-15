import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, ArrowLeft, MessageCircleMore, Mail, FileText, CheckCircle2, Clock, Users, DollarSign, Package } from 'lucide-react';
import api from '../../../lib/api';
import Swal from 'sweetalert2';
import CommunicationModal from '../../../components/CommunicationModal';
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

const InvoiceList = () => {
    const navigate = useNavigate();
    const { id = 'all' } = useParams();
    const [searchParams] = useSearchParams();
    const crmEventId = searchParams.get('crmEventId') || '';
    const isAllList = id === 'all';
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [accountName, setAccountName] = useState('');
    const [actionLoaders, setActionLoaders] = useState({});
    const [linkedAccountIds, setLinkedAccountIds] = useState([]);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const [res, linkedIds] = await Promise.all([
                    api.get('/api/invoices'),
                    isAllList ? Promise.resolve([]) : resolveLinkedIds(id),
                ]);
                setInvoices(res.data?.data || res.data || []);
                setLinkedAccountIds(linkedIds);
            } catch (err) {
                console.error("Failed to fetch invoices", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
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
        const time = d.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        return `${day} ${month} ${year}, ${time}`;
    };

    const filteredInvoices = invoices.filter(inv => {
        if (!isAllList && !linkedAccountIds.includes(String(inv.companyId || ''))) return false;
        if (crmEventId && String(inv.crmEventId || '') !== String(crmEventId)) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            (inv.invoice_no || '').toLowerCase().includes(q) ||
            (inv.estimate_no || '').toLowerCase().includes(q) ||
            (inv.company_name || '').toLowerCase().includes(q)
        );
    });

    const [commModal, setCommModal] = useState({
        isOpen: false,
        type: 'whatsapp',
        docType: 'invoice',
        docId: null
    });

    const handleSendWhatsApp = (invoiceId) => {
        setCommModal({ isOpen: true, type: 'whatsapp', docType: 'invoice', docId: invoiceId });
    };

    const handleSendEmail = (invoiceId) => {
        setCommModal({ isOpen: true, type: 'email', docType: 'invoice', docId: invoiceId });
    };

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const paginatedInvoices = filteredInvoices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const totalInvoices = filteredInvoices.length;
    const totalValue = filteredInvoices.reduce((sum, inv) => sum + (parseFloat(inv.finalAmount) || 0), 0);
    const avgValue = totalInvoices > 0 ? totalValue / totalInvoices : 0;
    const totalClients = new Set(filteredInvoices.map(inv => inv.company_name).filter(Boolean)).size;

    const statCards = (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <AnimatedStatCard
                icon={<FileText className="w-5 h-5 text-blue-600" strokeWidth={2.5} />}
                gradientTo="to-blue-50" iconBg="bg-blue-100"
                rawValue={totalInvoices}
                displayValue={(c) => Math.round(c)}
                label="TOTAL INVOICES"
                subLabel="Created" subColor="#2563eb"
            />
            <AnimatedStatCard
                icon={<DollarSign className="w-5 h-5 text-indigo-600" strokeWidth={2.5} />}
                gradientTo="to-indigo-50" iconBg="bg-indigo-100"
                rawValue={totalValue / 100000}
                displayValue={(c) => `₹ ${c.toFixed(1)}L`}
                label="TOTAL VALUE"
                subLabel="Amount" subColor="#4f46e5"
            />
            <AnimatedStatCard
                icon={<DollarSign className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />}
                gradientTo="to-emerald-50" iconBg="bg-emerald-100"
                rawValue={avgValue / 1000}
                displayValue={(c) => `₹ ${c.toFixed(1)}k`}
                label="AVG VALUE"
                subLabel="Per Invoice" subColor="#059669"
            />
            <AnimatedStatCard
                icon={<Users className="w-5 h-5 text-rose-600" strokeWidth={2.5} />}
                gradientTo="to-rose-50" iconBg="bg-rose-100"
                rawValue={totalClients}
                displayValue={(c) => Math.round(c)}
                label="TOTAL CLIENTS"
                subLabel="Billed" subColor="#e11d48"
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pl-4 pr-4 py-4">
            {/* Sub-Navigation for Account pages */}
            {!isAllList && <AccountNavigation id={id} accountName={accountName} pageName="Invoices" />}

            {/* ── Header ── */}
            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-3 px-1 mt-1">
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Invoices</h1>
                    {isAllList && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <span className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => navigate('/dashboard')}>Home</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-gray-700 font-medium">All Invoices</span>
                        </div>
                    )}
                </div>
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#3598dc]"
                    />
                    {/* <button
	                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-semibold transition text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button> */}
                </div>
            </div>

            {statCards}

            {/* ── Table Container ── */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
                <table className="min-w-full text-left text-xs whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <thead className="bg-slate-50 uppercase tracking-wide text-slate-500 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 font-bold">S.No.</th>
                            <th className="px-4 py-3 font-bold">Invoice No.</th>
                            <th className="px-4 py-3 font-bold">PI No.</th>
                            <th className="px-4 py-3 font-bold">Company / Client</th>
                            <th className="px-4 py-3 font-bold">Date</th>
                            <th className="px-4 py-3 font-bold">Amount (₹)</th>
                            <th className="px-4 py-3 font-bold">Added By</th>
                            <th className="px-4 py-3 font-bold text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4 text-gray-500">Loading invoices...</td>
                            </tr>
                        ) : paginatedInvoices.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4 text-gray-500">No invoices found.</td>
                            </tr>
                        ) : (
                            paginatedInvoices.map((inv, idx) => (
                                <tr key={inv._id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-[11px]" style={{ color: '#093C5D' }}>
                                        {(currentPage - 1) * itemsPerPage + idx + 1}
                                    </td>
                                    <td className="px-4 py-3 text-[10px]">
                                        <Link to={`/payments/invoiceDetails/${inv._id}`} className="text-[#194090] font-bold hover:text-blue-700">
                                            {inv.invoice_no}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-[10px] font-bold text-slate-700">
                                        {inv.estimate_no || "—"}
                                    </td>
                                    <td className="px-4 py-3 text-[10px] font-bold text-slate-800">
                                        {(!isAllList && accountName) ? accountName : (inv.company_name || 'Unknown')}
                                    </td>
                                    <td className="px-4 py-3 text-[10px] font-medium text-slate-500">
                                        {formatDate(inv.invoice_date || inv.added)}
                                    </td>
                                    <td className="px-4 py-3 text-[10px] font-bold text-emerald-600">
                                        {inv.finalAmount?.toFixed(2) || "0.00"}
                                    </td>
                                    <td className="px-4 py-3 text-[10px] font-bold text-slate-700 capitalize">
                                        {inv.added_by || "Unknown"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1.5 justify-center">
                                            <button
                                                type="button"
                                                disabled={actionLoaders[`${inv._id}_wa`]}
                                                onClick={() => handleSendWhatsApp(inv._id)}
                                                className="rounded border border-slate-200 p-1.5 text-emerald-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                                title="Send WhatsApp"
                                            >
                                                {actionLoaders[`${inv._id}_wa`] ? <span className="animate-spin text-[10px] inline-block">↻</span> : <MessageCircleMore size={13} />}
                                            </button>
                                            <button
                                                type="button"
                                                disabled={actionLoaders[`${inv._id}_email`]}
                                                onClick={() => handleSendEmail(inv._id)}
                                                className="rounded border border-slate-200 p-1.5 text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                                title="Send Email"
                                            >
                                                {actionLoaders[`${inv._id}_email`] ? <span className="animate-spin text-[10px] inline-block">↻</span> : <Mail size={13} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold">{Math.min(currentPage * itemsPerPage, filteredInvoices.length)}</span> of <span className="font-semibold">{filteredInvoices.length}</span> entries
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }).map((_, idx) => (
                            <button
                                key={idx + 1}
                                onClick={() => handlePageChange(idx + 1)}
                                className={`px-3 py-1 border rounded text-sm ${currentPage === idx + 1 ? 'bg-[#3598dc] text-white' : 'hover:bg-gray-50'}`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            <CommunicationModal
                isOpen={commModal.isOpen}
                onClose={() => setCommModal({ ...commModal, isOpen: false, docId: null })}
                type={commModal.type}
                docType={commModal.docType}
                docId={commModal.docId}
            />
        </div>
    );
};

export default InvoiceList;
