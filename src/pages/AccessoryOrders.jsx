import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ExternalLink, Search, ShoppingBag, Gift, CreditCard, CheckCircle2, X, RefreshCw, CalendarDays } from 'lucide-react';
import api, { SERVER_URL } from '../lib/api';
import BaseLeadPage from '../layout/BaseLeadPage';

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

// Animated stat card component
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
                {subLabel && <div style={{ fontSize: '10px', fontWeight: 700, color: subColor, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{subLabel}</div>}
            </div>
        </div>
    );
}

const STATUS_STYLE = {
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    complimentary: 'bg-blue-50 text-blue-700 border-blue-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function AccessoryOrders() {
    const location = useLocation();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(new URLSearchParams(location.search).get('search') || '');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterMode, setFilterMode] = useState('');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [approvingOrder, setApprovingOrder] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Pagination & Selection
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selectedIds, setSelectedIds] = useState([]);

    const loadOrders = () => {
        setLoading(true);
        api.get('/api/stall-accessories/orders')
            .then(res => setOrders(res.data.data || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    const formatDate = (value) => value
        ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—';
    const formatTime = (value) => value
        ? new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        : '—';
    const getAssetUrl = (url) => {
        if (!url) return '';
        if (/^https?:\/\//i.test(url)) return url;
        return `${SERVER_URL}${url.startsWith('/') ? url : `/${url}`}`;
    };

    const filtered = orders.filter(o => {
        const matchesSearch = !searchTerm ||
            o.exhibitorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.orderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.registrationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.stallNo?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = !filterStatus || o.paymentStatus === filterStatus;
        const matchesMode = !filterMode || o.paymentMode === filterMode;
        
        let matchesDate = true;
        if (dateRange.from || dateRange.to) {
            const orderDate = new Date(o.createdAt);
            if (dateRange.from) {
                matchesDate = matchesDate && orderDate >= new Date(dateRange.from);
            }
            if (dateRange.to) {
                const toDate = new Date(dateRange.to);
                toDate.setHours(23, 59, 59, 999);
                matchesDate = matchesDate && orderDate <= toDate;
            }
        }

        return matchesSearch && matchesStatus && matchesMode && matchesDate;
    });

    const totalOrders = filtered.length;
    const currentOrders = filtered.slice((page - 1) * limit, page * limit);
    const totalPages = Math.ceil(totalOrders / limit) || 1;

    const isAllSelected = currentOrders.length > 0 && selectedIds.length === currentOrders.length;
    const onSelectAll = (e) => {
        if (e.target.checked) setSelectedIds(currentOrders.map(r => r._id));
        else setSelectedIds([]);
    };
    const onSelectRow = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + (o.grandTotal || 0), 0);
    const complimentaryCount = orders.filter(o => o.paymentStatus === 'complimentary').length;
    const pendingNeftCount = orders.filter(o => o.paymentStatus === 'pending' && o.paymentMode === 'neft').length;

    const approveNeftOrder = async (order) => {
        if (!window.confirm(`Approve NEFT payment for ${order.orderNo}?`)) return;
        setApprovingOrder(order._id);
        try {
            await api.put(`/api/stall-accessories/orders/${order._id}/approve-neft`, {
                processedBy: 'Admin',
                notes: 'NEFT payment approved by admin',
            });
            loadOrders();
            setSelectedOrder(prev => prev?._id === order._id ? { ...prev, paymentStatus: 'paid', processedBy: 'Admin' } : prev);
        } finally {
            setApprovingOrder('');
        }
    };

    const totalItems = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + (Number(i.qty) || 1), 0), 0);
    const paidOrdersCount = orders.filter(o => o.paymentStatus === 'paid').length;

    const statCards = (
        <>
            <AnimatedStatCard
                icon={<ShoppingBag className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />}
                gradientTo="to-emerald-50" iconBg="bg-emerald-100"
                rawValue={orders.length}
                displayValue={(c) => Math.round(c)}
                label="TOTAL ORDERS"
                subLabel="All Time" subColor="#059669"
            />
            <AnimatedStatCard
                icon={<ShoppingBag className="w-5 h-5 text-purple-600" strokeWidth={2.5} />}
                gradientTo="to-purple-50" iconBg="bg-purple-100"
                rawValue={totalItems}
                displayValue={(c) => Math.round(c)}
                label="TOTAL ITEMS"
                subLabel="Sold" subColor="#9333ea"
            />
            <AnimatedStatCard
                icon={<CheckCircle2 className="w-5 h-5 text-cyan-600" strokeWidth={2.5} />}
                gradientTo="to-cyan-50" iconBg="bg-cyan-100"
                rawValue={paidOrdersCount}
                displayValue={(c) => Math.round(c)}
                label="PAID ORDERS"
                subLabel="Completed" subColor="#0891b2"
            />
            <AnimatedStatCard
                icon={<Gift className="w-5 h-5 text-indigo-600" strokeWidth={2.5} />}
                gradientTo="to-indigo-50" iconBg="bg-indigo-100"
                rawValue={complimentaryCount}
                displayValue={(c) => Math.round(c)}
                label="COMPLIMENTARY"
                subLabel="Orders" subColor="#4f46e5"
            />
            <AnimatedStatCard
                icon={<CreditCard className="w-5 h-5 text-rose-600" strokeWidth={2.5} />}
                gradientTo="to-rose-50" iconBg="bg-rose-100"
                rawValue={pendingNeftCount}
                displayValue={(c) => Math.round(c)}
                label="PENDING NEFT"
                subLabel="Awaiting Approval" subColor="#e11d48"
            />
            <AnimatedStatCard
                icon={<CheckCircle2 className="w-5 h-5 text-blue-600" strokeWidth={2.5} />}
                gradientTo="to-blue-50" iconBg="bg-blue-100"
                rawValue={totalRevenue}
                displayValue={(c) => `₹ ${c.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                label="TOTAL REVENUE"
                subLabel="Paid Orders" subColor="#2563eb"
            />
        </>
    );

    const filters = (
        <>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                    type="text"
                    placeholder="Search by exhibitor, order no, stall..."
                    className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 text-black font-semibold placeholder:font-normal"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                />
            </div>
            <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-black font-semibold focus:outline-none focus:border-emerald-500 min-w-[140px]"
            >
                <option value="">All Payment Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="complimentary">Complimentary</option>
            </select>
            <select
                value={filterMode}
                onChange={(e) => { setFilterMode(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-black font-semibold focus:outline-none focus:border-emerald-500 min-w-[140px]"
            >
                <option value="">All Payment Modes</option>
                <option value="online">Online</option>
                <option value="neft">NEFT / RTGS</option>
            </select>
            <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 gap-2">
                <CalendarDays className="text-slate-400" size={14} />
                <span className="text-xs text-black font-semibold whitespace-nowrap">Select Date Range:</span>
                <input
                    type="date"
                    className="border-none bg-transparent text-xs focus:outline-none text-black font-semibold cursor-pointer"
                    value={dateRange.from}
                    onChange={e => { setDateRange(prev => ({ ...prev, from: e.target.value })); setPage(1); }}
                />
                <span className="text-[10px] text-slate-400 font-bold uppercase">to</span>
                <input
                    type="date"
                    className="border-none bg-transparent text-xs focus:outline-none text-black font-semibold cursor-pointer"
                    value={dateRange.to}
                    onChange={e => { setDateRange(prev => ({ ...prev, to: e.target.value })); setPage(1); }}
                />
            </div>
        </>
    );

    const tableHeaders = (
        <>
            <th className="px-2 py-2 font-medium">Order No</th>
            <th className="px-2 py-2 font-medium">Exhibitor</th>
            <th className="px-2 py-2 font-medium text-center">Stall</th>
            <th className="px-2 py-2 font-medium text-center">Items</th>
            <th className="px-2 py-2 font-medium text-right">Grand Total</th>
            <th className="px-2 py-2 font-medium text-center">Status</th>
            <th className="px-2 py-2 font-medium text-center">Payment Mode</th>
            <th className="px-2 py-2 font-medium text-center">Processed By</th>
            <th className="px-2 py-2 font-medium text-center">Date</th>
            <th className="px-2 py-2 font-medium text-center">Receipt</th>
            <th className="px-2 py-2 font-medium text-center">Action</th>
        </>
    );

    const tableBody = (
        <>
            {loading ? (
                [...Array(10)].map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse border-b border-slate-100 bg-white">
                        <td className="px-2 py-3 text-center"><div className="w-3 h-3 bg-slate-200 rounded-sm mx-auto"></div></td>
                        <td className="px-2 py-3"><div className="h-3 w-16 bg-slate-200 rounded"></div></td>
                        <td className="px-2 py-3"><div className="h-3 w-32 bg-slate-200 rounded mb-1.5"></div><div className="h-2 w-24 bg-slate-100 rounded"></div></td>
                        <td className="px-2 py-3 text-center"><div className="h-4 w-12 bg-slate-200 rounded mx-auto"></div></td>
                        <td className="px-2 py-3 text-center"><div className="h-3 w-20 bg-slate-200 rounded mx-auto mb-1.5"></div><div className="h-2 w-16 bg-slate-100 rounded mx-auto"></div></td>
                        <td className="px-2 py-3"><div className="h-3 w-20 bg-slate-200 rounded mx-auto"></div></td>
                        <td className="px-2 py-3 text-center"><div className="h-4 w-16 bg-slate-200 rounded-full mx-auto"></div></td>
                        <td className="px-2 py-3 text-center"><div className="h-3 w-16 bg-slate-200 rounded mx-auto"></div></td>
                        <td className="px-2 py-3 text-center"><div className="h-3 w-16 bg-slate-200 rounded mx-auto"></div></td>
                        <td className="px-2 py-3 text-center"><div className="h-3 w-16 bg-slate-200 rounded mx-auto mb-1.5"></div><div className="h-2 w-12 bg-slate-100 rounded mx-auto"></div></td>
                        <td className="px-2 py-3 text-center"><div className="h-3 w-8 bg-slate-200 rounded mx-auto"></div></td>
                        <td className="px-2 py-3 text-center"><div className="h-3 w-8 bg-slate-200 rounded mx-auto"></div></td>
                    </tr>
                ))
            ) : currentOrders.length === 0 ? (
                <tr>
                    <td colSpan="12" className="px-2 py-4 text-center text-slate-500 font-medium">No results found</td>
                </tr>
            ) : currentOrders.map((order, i) => {
                const isSelected = selectedIds.includes(order._id);
                return (
                    <tr key={order._id || i} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-emerald-50/30' : ''}`}>
                        <td className="px-2 py-2 text-center">
                            <input
                                type="checkbox"
                                className="w-3 h-3 accent-emerald-500 cursor-pointer rounded-sm"
                                checked={isSelected}
                                onChange={() => onSelectRow(order._id)}
                            />
                        </td>
                        <td className="px-2 py-2">
                            <div className="font-bold text-[11px] font-mono cursor-pointer text-[#4B1426] hover:text-emerald-600 hover:underline" onClick={() => setSelectedOrder(order)}>
                                {order.orderNo}
                            </div>
                        </td>
                        <td className="px-2 py-2">
                            <div className="font-bold text-[11px]" style={{ color: '#093C5D' }}>{order.exhibitorName}</div>
                            <div className="text-[9px] font-bold text-[#215E61] mt-0.5">{order.registrationId}</div>
                        </td>
                        <td className="px-2 py-2 text-center">
                            <span className="font-bold text-[10px] text-red-600">{order.stallNo || '—'}</span>
                        </td>
                        <td className="px-2 py-2 text-center">
                            <div className="space-y-0.5">
                                {order.items.slice(0, 2).map((item, j) => (
                                    <p key={j} className="text-[10px] font-semibold text-[#2C5EAD]">{item.qty}× {item.name}</p>
                                ))}
                                {order.items.length > 2 && <p className="text-[9px] text-[#2C5EAD] opacity-80">+{order.items.length - 2} more</p>}
                            </div>
                        </td>
                        <td className="px-2 py-2 text-right">
                            {order.paymentStatus === 'complimentary' ? (
                                <span className="font-bold text-[10px] text-emerald-600">Complimentary</span>
                            ) : (
                                <span className="font-bold text-[10px]" style={{ color: '#064232' }}>{fmt(order.grandTotal)}</span>
                            )}
                        </td>
                        <td className="px-2 py-2 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-[9px] uppercase border ${STATUS_STYLE[order.paymentStatus] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus}
                            </span>
                        </td>
                        <td className="px-2 py-2 text-center">
                            <span className="text-[10px] font-bold uppercase text-blue-700">
                                {order.paymentMode === 'neft' ? 'NEFT / RTGS' : (order.paymentMode || '—')}
                            </span>
                        </td>
                        <td className="px-2 py-2 text-center">
                            <span className="text-[10px] font-semibold text-gray-800">{order.processedBy || 'Admin'}</span>
                        </td>
                        <td className="px-2 py-2 text-center">
                            <div className="flex flex-col items-center justify-center gap-0.5">
                                <span className="text-[10px] font-bold" style={{ color: '#111844' }}>{formatDate(order.createdAt)}</span>
                                <span className="text-[9px] text-[#2C5EAD] font-medium">{formatTime(order.createdAt)}</span>
                            </div>
                        </td>
                        <td className="px-2 py-2 text-center">
                            {order.receiptUrl ? (
                                <a href={getAssetUrl(order.receiptUrl)} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#016B61] hover:underline">
                                    <ExternalLink size={11} /> View
                                </a>
                            ) : <span className="text-[10px] text-gray-400">—</span>}
                        </td>
                        <td className="px-2 py-2 text-center">
                            <button
                                onClick={() => setSelectedOrder(order)}
                                className="text-[10px] font-bold text-blue-600 hover:underline"
                            >
                                Details
                            </button>
                        </td>
                    </tr>
                );
            })}
        </>
    );

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (page > 3) pages.push('...');
            for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
            if (page < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    const paginationBar = (
        <>
            <div className="flex items-center gap-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span className="text-[11px] font-bold" style={{ color: '#334155' }}>Showing</span>
                <span className="text-[11px] font-black px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-100" style={{ color: '#016B61' }}>
                    {totalOrders === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, totalOrders)}
                </span>
                <span className="text-[11px] font-bold" style={{ color: '#334155' }}>of</span>
                <span className="text-[11px] font-black" style={{ color: '#15173D' }}>{totalOrders}</span>
                <span className="text-[11px] font-bold" style={{ color: '#334155' }}>orders</span>
            </div>

            <div className="flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
                    style={{ borderColor: '#e2e8f0', color: '#334155' }}
                >«</button>
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
                    style={{ borderColor: '#e2e8f0', color: '#334155' }}
                >‹</button>
                {getPageNumbers().map((p, i) =>
                    p === '...' ? (
                        <span key={`dot-${i}`} className="w-7 h-7 flex items-center justify-center text-[11px] text-slate-400 font-bold">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black border transition-all duration-200"
                            style={
                                p === page
                                    ? { backgroundColor: '#016B61', color: '#fff', borderColor: '#016B61', boxShadow: '0 2px 8px rgba(1,107,97,0.3)' }
                                    : { backgroundColor: '#fff', color: '#15173D', borderColor: '#e2e8f0' }
                            }
                        >{p}</button>
                    )
                )}
                <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
                    style={{ borderColor: '#e2e8f0', color: '#334155' }}
                >›</button>
                <button
                    onClick={() => setPage(totalPages)}
                    disabled={page >= totalPages}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
                    style={{ borderColor: '#e2e8f0', color: '#334155' }}
                >»</button>
            </div>

            <div className="flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span className="text-[11px] font-bold" style={{ color: '#334155' }}>Rows:</span>
                <select
                    value={limit}
                    onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                    className="border rounded-lg py-1 px-2 bg-white outline-none cursor-pointer text-[11px] font-bold"
                    style={{ borderColor: '#e2e8f0', color: '#15173D', fontFamily: 'Inter, sans-serif' }}
                >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
            </div>
        </>
    );

    return (
        <>
            <BaseLeadPage
                title="Accessory Orders"
                subtitle="Track all accessory & extras purchases by exhibitors"
                badgeCount={<span className="text-emerald-700">{totalOrders}</span>}
                statCards={statCards}
                filterBar={filters}
                tableHeaders={tableHeaders}
                tableBody={tableBody}
                pagination={paginationBar}
                isAllSelected={isAllSelected}
                onSelectAll={onSelectAll}
                onReset={() => {
                    setSearchTerm('');
                    setFilterStatus('');
                    setFilterMode('');
                    setDateRange({ from: '', to: '' });
                    setPage(1);
                    setSelectedIds([]);
                }}
            />

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-2xl border border-gray-200" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-black text-[#23471d] uppercase tracking-wide">Order Overview</h2>
                                <p className="text-xs font-bold font-mono mt-0.5 text-[#4B1426]">{selectedOrder.orderNo}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-8 h-8 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="border border-gray-200 rounded p-3">
                                    <p className="text-[10px] font-semibold text-black uppercase tracking-widest">Exhibitor</p>
                                    <p className="text-xs font-bold mt-1 text-[#093C5D]">{selectedOrder.exhibitorName || '—'}</p>
                                    <p className="text-[10px] font-bold text-[#215E61] mt-0.5">{selectedOrder.registrationId || '—'}</p>
                                </div>
                                <div className="border border-gray-200 rounded p-3">
                                    <p className="text-[10px] font-semibold text-black uppercase tracking-widest">Payment</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full border ${STATUS_STYLE[selectedOrder.paymentStatus] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                            {selectedOrder.paymentStatus === 'paid' ? 'Paid' : selectedOrder.paymentStatus}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase text-blue-700">
                                            {selectedOrder.paymentMode === 'neft' ? 'NEFT / RTGS' : selectedOrder.paymentMode || '—'}
                                        </span>
                                    </div>
                                </div>
                                <div className="border border-gray-200 rounded p-3">
                                    <p className="text-[10px] font-semibold text-black uppercase tracking-widest">Grand Total</p>
                                    <p className="text-sm font-bold text-[#064232] mt-1">
                                        {selectedOrder.paymentStatus === 'complimentary' ? 'Complimentary' : fmt(selectedOrder.grandTotal)}
                                    </p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <span className="text-[10px] font-bold text-[#111844]">
                                            {formatDate(selectedOrder.createdAt)}
                                        </span>
                                        <span className="text-[9px] font-medium text-[#2C5EAD]">
                                            {formatTime(selectedOrder.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {selectedOrder.paymentMode === 'neft' && (
                                <div className="border border-gray-200 rounded overflow-hidden">
                                    <div className="bg-slate-50 px-4 py-2 border-b border-gray-200">
                                        <p className="text-[11px] font-black text-gray-700 uppercase tracking-wider">NEFT / RTGS Details</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                                        {[
                                            ['Transaction Reference Number (UTR No.)', selectedOrder.bankTransferDetails?.transactionReferenceNumber || selectedOrder.transactionId],
                                            ['Transaction Date', formatDate(selectedOrder.bankTransferDetails?.transactionDate)],
                                            ['Transaction Time', selectedOrder.bankTransferDetails?.transactionTime],
                                            ['Transferred Amount', fmt(selectedOrder.bankTransferDetails?.transferredAmount || selectedOrder.grandTotal)],
                                            ['Sender Bank Name', selectedOrder.bankTransferDetails?.senderBankName],
                                            ['Sender Account Holder Name', selectedOrder.bankTransferDetails?.senderAccountHolderName],
                                            [
                                                'Payment Screenshot / Bank Receipt',
                                                selectedOrder.bankTransferDetails?.paymentScreenshotUrl
                                                    ? (
                                                        <a
                                                            href={getAssetUrl(selectedOrder.bankTransferDetails.paymentScreenshotUrl)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-[#23471d] hover:underline"
                                                        >
                                                            <ExternalLink size={11} /> View Receipt
                                                        </a>
                                                    )
                                                    : '—'
                                            ],
                                        ].map(([label, value]) => (
                                            <div key={label} className="px-4 py-3 border-b border-r border-gray-200 last:border-b-0 even:border-r-0">
                                                <p className="text-[10px] text-gray-500 font-medium mb-1">{label}</p>
                                                <p className="text-xs font-bold text-gray-800 break-words">{value || '—'}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {selectedOrder.paymentStatus === 'pending' && (
                                        <div className="bg-amber-50 px-4 py-3 border-t border-gray-200 flex justify-end">
                                            <button
                                                onClick={() => approveNeftOrder(selectedOrder)}
                                                disabled={approvingOrder === selectedOrder._id}
                                                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded text-xs font-bold hover:bg-amber-700 disabled:opacity-50"
                                            >
                                                {approvingOrder === selectedOrder._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                                Approve Payment
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="border border-gray-200 rounded overflow-hidden">
                                <div className="bg-slate-50 px-4 py-2 border-b border-gray-200">
                                    <p className="text-[11px] font-semibold text-gray-800 uppercase tracking-wider">Order Items</p>
                                </div>
                                <table className="w-full text-left">
                                    <thead style={{ backgroundColor: '#0A2947' }}>
                                        <tr className="text-white tracking-wider">
                                            <th className="px-4 py-2 text-[10px] font-medium">Item</th>
                                            <th className="px-4 py-2 text-[10px] font-medium text-center">Qty</th>
                                            <th className="px-4 py-2 text-[10px] font-medium text-right">Unit Price</th>
                                            <th className="px-4 py-2 text-[10px] font-medium text-right">GST</th>
                                            <th className="px-4 py-2 text-[10px] font-medium text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {selectedOrder.items.map((item, i) => (
                                            <tr key={i} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-2">
                                                    <p className="text-xs font-semibold text-[#2C5EAD]">{item.name}</p>
                                                    <p className="text-[10px] font-medium text-[#4B1426]">{item.type}</p>
                                                </td>
                                                <td className="px-4 py-2 text-center text-xs font-bold text-[#2C5EAD]">{item.qty}</td>
                                                <td className="px-4 py-2 text-right text-xs font-semibold text-green-700">{fmt(item.unitPrice)}</td>
                                                <td className="px-4 py-2 text-right">
                                                    <p className="text-xs font-semibold text-black">{fmt(item.gstAmount)}</p>
                                                    <p className="text-[9px] font-medium text-red-500">({item.gstPercent}%)</p>
                                                </td>
                                                <td className="px-4 py-2 text-right text-xs font-bold text-[#064232]">{fmt(item.totalPrice)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 border-t border-gray-200">
                                        <tr>
                                            <td colSpan="4" className="px-4 py-2 text-right text-[11px] font-semibold text-black uppercase">Subtotal</td>
                                            <td className="px-4 py-2 text-right text-xs font-bold text-[#064232]">{fmt(selectedOrder.subtotal)}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="4" className="px-4 py-2 text-right text-[11px] font-semibold text-black uppercase">Total GST</td>
                                            <td className="px-4 py-2 text-right text-xs font-bold text-[#064232]">{fmt(selectedOrder.totalGst)}</td>
                                        </tr>
                                        <tr className="bg-[#064232]/5">
                                            <td colSpan="4" className="px-4 py-3 text-right text-xs font-semibold text-black uppercase">Grand Total</td>
                                            <td className="px-4 py-3 text-right text-sm font-black text-[#064232]">{fmt(selectedOrder.grandTotal)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
