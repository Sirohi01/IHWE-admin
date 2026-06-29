import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ExternalLink, Search, ShoppingBag, Gift, CreditCard, CheckCircle2, Loader2, X } from 'lucide-react';
import api, { SERVER_URL } from '../lib/api';

const STATUS_STYLE = {
    paid: 'bg-blue-50 text-blue-700 border-blue-200',
    complimentary: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function AccessoryOrders() {
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(new URLSearchParams(location.search).get('search') || '');
    const [approvingOrder, setApprovingOrder] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

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
    const getAssetUrl = (url) => {
        if (!url) return '';
        if (/^https?:\/\//i.test(url)) return url;
        return `${SERVER_URL}${url.startsWith('/') ? url : `/${url}`}`;
    };

    const filtered = orders.filter(o =>
        !search ||
        o.exhibitorName?.toLowerCase().includes(search.toLowerCase()) ||
        o.orderNo?.toLowerCase().includes(search.toLowerCase()) ||
        o.registrationId?.toLowerCase().includes(search.toLowerCase()) ||
        o.stallNo?.toLowerCase().includes(search.toLowerCase())
    );

    const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + (o.grandTotal || 0), 0);

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

    return (
        <div className="p-6 min-h-screen bg-gray-50">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-base font-black text-[#23471d] uppercase tracking-tight">Accessory Orders</h1>
                    <p className="text-[11px] text-gray-400 mt-0.5">Track all accessory & extras purchases by exhibitors</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-slate-700' },
                    { label: 'Complimentary', value: orders.filter(o => o.paymentStatus === 'complimentary').length, icon: Gift, color: 'text-emerald-600' },
                    { label: 'Pending NEFT', value: orders.filter(o => o.paymentStatus === 'pending' && o.paymentMode === 'neft').length, icon: CreditCard, color: 'text-amber-600' },
                    { label: 'Total Revenue', value: fmt(totalRevenue), icon: CheckCircle2, color: 'text-[#23471d]' },
                ].map((s, i) => (
                    <div key={i} className="bg-white border border-gray-200 px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <s.icon size={14} className={s.color} />
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                        </div>
                        <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative mb-4 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by exhibitor, order no, stall..."
                    className="w-full pl-9 pr-4 h-9 border border-gray-300 rounded-[2px] text-xs outline-none focus:border-[#23471d]" />
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <ShoppingBag className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">No orders found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#23471d]">
                                    {['Order No', 'Exhibitor', 'Stall', 'Items', 'Grand Total', 'Status', 'Payment Mode', 'Processed By', 'Date', 'Receipt'].map(h => (
                                        <th key={h} className="py-2.5 px-4 text-[10px] font-black text-white uppercase text-left whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((order, i) => (
                                    <tr key={order._id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                                        <td className="py-2.5 px-4">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="text-xs font-bold text-[#23471d] font-mono hover:underline"
                                            >
                                                {order.orderNo}
                                            </button>
                                        </td>
                                        <td className="py-2.5 px-4">
                                            <p className="text-xs font-bold text-gray-800">{order.exhibitorName}</p>
                                            <p className="text-[10px] text-gray-400">{order.registrationId}</p>
                                        </td>
                                        <td className="py-2.5 px-4 text-xs font-bold text-[#d26019]">{order.stallNo || '—'}</td>
                                        <td className="py-2.5 px-4">
                                            <div className="space-y-0.5">
                                                {order.items.slice(0, 2).map((item, j) => (
                                                    <p key={j} className="text-[10px] text-gray-600">{item.qty}× {item.name}</p>
                                                ))}
                                                {order.items.length > 2 && <p className="text-[10px] text-gray-400">+{order.items.length - 2} more</p>}
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-4 text-xs font-black text-gray-800">
                                            {order.paymentStatus === 'complimentary' ? <span className="text-emerald-600">Complimentary</span> : fmt(order.grandTotal)}
                                        </td>
                                        <td className="py-2.5 px-4">
                                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full border ${STATUS_STYLE[order.paymentStatus] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4 text-xs font-bold uppercase text-blue-700">
                                            {order.paymentMode === 'neft' ? 'NEFT / RTGS' : (order.paymentMode || '—')}
                                        </td>
                                        <td className="py-2.5 px-4 text-xs text-gray-600">{order.processedBy || 'Admin'}</td>
                                        <td className="py-2.5 px-4 text-xs text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="py-2.5 px-4">
                                            {order.receiptUrl ? (
                                                <a href={order.receiptUrl} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-[10px] font-bold text-[#23471d] hover:underline">
                                                    <ExternalLink size={11} /> View
                                                </a>
                                            ) : <span className="text-[10px] text-gray-400">—</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-2xl border border-gray-200">
                        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-black text-[#23471d] uppercase tracking-wide">Order Overview</h2>
                                <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedOrder.orderNo}</p>
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
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Exhibitor</p>
                                    <p className="text-xs font-bold text-gray-800 mt-1">{selectedOrder.exhibitorName || '—'}</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">{selectedOrder.registrationId || '—'}</p>
                                </div>
                                <div className="border border-gray-200 rounded p-3">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full border ${STATUS_STYLE[selectedOrder.paymentStatus] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                            {selectedOrder.paymentStatus}
                                        </span>
                                        <span className="text-[10px] font-black uppercase text-blue-700">
                                            {selectedOrder.paymentMode === 'neft' ? 'NEFT / RTGS' : selectedOrder.paymentMode || '—'}
                                        </span>
                                    </div>
                                </div>
                                <div className="border border-gray-200 rounded p-3">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Grand Total</p>
                                    <p className="text-sm font-black text-gray-800 mt-1">
                                        {selectedOrder.paymentStatus === 'complimentary' ? 'Complimentary' : fmt(selectedOrder.grandTotal)}
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">
                                        {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
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
                                            <div key={label} className="px-4 py-2 border-b border-r border-gray-100">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</p>
                                                <p className="text-xs font-bold text-gray-800 mt-0.5">{value || '—'}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {selectedOrder.paymentStatus === 'pending' && (
                                        <div className="px-4 py-3 bg-amber-50 border-t border-amber-100 flex justify-end">
                                            <button
                                                onClick={() => approveNeftOrder(selectedOrder)}
                                                disabled={approvingOrder === selectedOrder._id}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-[#23471d] text-white text-xs font-bold disabled:opacity-60"
                                            >
                                                {approvingOrder === selectedOrder._id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                                                Approve Payment
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="border border-gray-200 rounded overflow-hidden">
                                <div className="bg-slate-50 px-4 py-2 border-b border-gray-200">
                                    <p className="text-[11px] font-black text-gray-700 uppercase tracking-wider">Items</p>
                                </div>
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-white">
                                            {['Item', 'Qty', 'Unit Price', 'GST', 'Total'].map(h => (
                                                <th key={h} className="py-2 px-4 text-[10px] font-black text-gray-400 uppercase text-left">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {selectedOrder.items.map((item, i) => (
                                            <tr key={i}>
                                                <td className="py-2 px-4 text-xs font-bold text-gray-800">{item.name}</td>
                                                <td className="py-2 px-4 text-xs text-gray-600">{item.qty}</td>
                                                <td className="py-2 px-4 text-xs text-gray-600">{fmt(item.unitPrice)}</td>
                                                <td className="py-2 px-4 text-xs text-gray-600">{fmt(item.gstAmount)}</td>
                                                <td className="py-2 px-4 text-xs font-bold text-gray-800">{fmt(item.totalPrice)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
