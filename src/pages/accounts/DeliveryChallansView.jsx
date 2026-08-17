import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight, Truck, FileText, Wallet, BarChart2, FileCheck2,
    Search, RefreshCw, Loader2, Eye, Download, MoreVertical,
    ClipboardCheck, ArrowRight
} from 'lucide-react';
import api, { SERVER_URL } from '../../lib/api';
import toast from 'react-hot-toast';

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

const formatCurrency = (val) => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;
const formatDate = (val) => {
    if (!val) return '—';
    const d = new Date(val);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const WORKFLOW_STAGES = [
    { n: 1, icon: FileText, label: 'Proforma Invoice /', sub: 'PI Created' },
    { n: 2, icon: Truck, label: 'Delivery Challan', sub: '(This Stage)' },
    { n: 3, icon: FileCheck2, label: 'Invoice', sub: 'Generated' },
    { n: 4, icon: Wallet, label: 'Payment Collection', sub: 'Against Invoice' },
    { n: 5, icon: BarChart2, label: 'Reports & Analysis', sub: '' },
];
const STAGE_COLORS = ['bg-emerald-500', 'bg-blue-600', 'bg-purple-600', 'bg-amber-500', 'bg-rose-500'];

const DeliveryChallansView = () => {
    const navigate = useNavigate();

    const [rows, setRows] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [inlinePI, setInlinePI] = useState('');
    const [inlineInvoice, setInlineInvoice] = useState('');
    const [inlineClient, setInlineClient] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        const fetchChallans = async () => {
            try {
                setLoading(true);
                const res = await api.get('/api/delivery-challans/overview');
                setRows(res.data?.data?.rows || []);
                setStats(res.data?.data?.stats || null);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch delivery challans', err);
                setError('Failed to load delivery challans.');
                toast.error('Failed to load delivery challans.');
            } finally {
                setLoading(false);
            }
        };
        fetchChallans();
    }, []);

    const piOptions = useMemo(() => [...new Set(rows.map((r) => r.estimateNo).filter(Boolean))].sort(), [rows]);
    const invoiceOptions = useMemo(() => [...new Set(rows.map((r) => r.invoiceNo).filter(Boolean))].sort(), [rows]);
    const clientOptions = useMemo(() => [...new Set(rows.map((r) => r.clientName).filter(Boolean))].sort(), [rows]);

    const filteredRows = rows.filter((row) => {
        if (inlinePI && row.estimateNo !== inlinePI) return false;
        if (inlineInvoice && row.invoiceNo !== inlineInvoice) return false;
        if (inlineClient && row.clientName !== inlineClient) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            (row.challanNo || '').toLowerCase().includes(q) ||
            (row.estimateNo || '').toLowerCase().includes(q) ||
            (row.invoiceNo || '').toLowerCase().includes(q) ||
            (row.clientName || '').toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
    const paginatedRows = filteredRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-2 font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Delivery Challans</h1>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                        <span>Accounts Management</span>
                        <ChevronRight className="w-3 h-3" />
                        <span>Sales & Billing</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-blue-600 font-bold">Delivery Challans</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-2 px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold rounded-md">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-24 text-slate-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading delivery challans...
                </div>
            ) : (
                <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-2">
                        <StatCard
                            icon={<Truck className="w-4 h-4 text-blue-600" />} iconBg="bg-blue-100"
                            rawValue={stats?.totalChallans || 0} displayValue={String(stats?.totalChallans || 0)}
                            label="Total Delivery Challans" subLabel="All Time"
                        />
                        <StatCard
                            icon={<FileText className="w-4 h-4 text-emerald-600" />} iconBg="bg-emerald-100"
                            rawValue={stats?.totalPIsLinked || 0} displayValue={String(stats?.totalPIsLinked || 0)}
                            label="Total PIs Linked" subLabel="All Time"
                        />
                        <StatCard
                            icon={<Wallet className="w-4 h-4 text-purple-600" />} iconBg="bg-purple-100"
                            rawValue={stats?.totalDCValue || 0} displayValue={formatCurrency(stats?.totalDCValue)} isCurrency
                            label="Total DC Value" subLabel="All Time"
                        />
                        <StatCard
                            icon={<BarChart2 className="w-4 h-4 text-orange-600" />} iconBg="bg-orange-100"
                            rawValue={stats?.avgDCValue || 0} displayValue={formatCurrency(stats?.avgDCValue)} isCurrency
                            label="Avg DC Value" subLabel="All Time"
                        />
                        <StatCard
                            icon={<FileCheck2 className="w-4 h-4 text-rose-600" />} iconBg="bg-rose-100"
                            rawValue={stats?.invoicesGenerated || 0} displayValue={String(stats?.invoicesGenerated || 0)}
                            label="Invoices Generated" subLabel="All Time"
                        />
                    </div>

                    {/* Filter Row */}
                    <div className="bg-white p-3 py-1 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-3 mb-2">
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide w-full">
                            <div className="relative shrink-0">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search by DC No., PI No., Invoice No., Client..."
                                    className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-[11px] w-[280px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                />
                            </div>
                            <select
                                value={inlinePI}
                                onChange={(e) => { setInlinePI(e.target.value); setCurrentPage(1); }}
                                className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white"
                            >
                                <option value="">All PIs</option>
                                {piOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <select
                                value={inlineInvoice}
                                onChange={(e) => { setInlineInvoice(e.target.value); setCurrentPage(1); }}
                                className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white"
                            >
                                <option value="">All Invoices</option>
                                {invoiceOptions.map((i) => <option key={i} value={i}>{i}</option>)}
                            </select>
                            <select
                                value={inlineClient}
                                onChange={(e) => { setInlineClient(e.target.value); setCurrentPage(1); }}
                                className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white"
                            >
                                <option value="">All Clients</option>
                                {clientOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setInlinePI('');
                                    setInlineInvoice('');
                                    setInlineClient('');
                                    setCurrentPage(1);
                                }}
                                className="flex items-center gap-1 text-blue-600 font-bold text-[11px] px-2 shrink-0"
                            >
                                <RefreshCw className="w-3 h-3" /> Reset
                            </button>
                        </div>
                    </div>

                    {/* Info Banner */}
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-800 text-[11px] font-medium rounded-lg px-3 py-2 mb-2">
                        <ClipboardCheck className="w-4 h-4 shrink-0" />
                        Each Delivery Challan is linked to a Proforma Invoice (PI). Multiple DCs can be created against a single PI.
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-auto max-h-[460px]">
                        <table className="w-full min-w-[1300px] text-left border-collapse">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-white text-[8px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 whitespace-nowrap">
                                    <th className="px-2 py-1 text-center">S.No.</th>
                                    <th className="px-2 py-1">DC No.</th>
                                    <th className="px-2 py-1 text-center">DC Date</th>
                                    <th className="px-2 py-1">PI / Proforma Invoice No.</th>
                                    <th className="px-2 py-1 text-center">PI Date</th>
                                    <th className="px-2 py-1">Invoice No.</th>
                                    <th className="px-2 py-1 text-center">Invoice Date</th>
                                    <th className="px-2 py-1 text-right">Invoice Value</th>
                                    <th className="px-2 py-1">Client Name</th>
                                    <th className="px-2 py-1 text-right">DC Value</th>
                                    <th className="px-2 py-1">Created By & Details</th>
                                    <th className="px-2 py-1 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] whitespace-nowrap">
                                {paginatedRows.length === 0 && (
                                    <tr className="border-b border-slate-100"><td colSpan={12} className="py-8 text-center text-slate-400 h-[33px]">No delivery challans found.</td></tr>
                                )}
                                {paginatedRows.map((row, idx) => (
                                    <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-2 py-1 font-bold text-slate-700 text-center">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                        <td className="px-2 py-1">
                                            <span
                                                onClick={() => navigate(`/dashboard/account/${row.companyId}/delivery-challans`)}
                                                className="font-bold text-blue-600 cursor-pointer hover:underline"
                                                title="View delivery challan"
                                            >
                                                {row.challanNo}
                                            </span>
                                        </td>
                                        <td className="px-2 py-1 text-center text-slate-700 font-semibold">{formatDate(row.challanDate)}</td>
                                        <td className="px-2 py-1">
                                            {row.estimateId ? (
                                                <span
                                                    onClick={() => navigate(`/payments/performanceInvoiceDetails/${row.estimateId}`)}
                                                    className="font-bold text-blue-600 cursor-pointer hover:underline"
                                                    title="View proforma invoice"
                                                >
                                                    {row.estimateNo}
                                                </span>
                                            ) : (
                                                <span className="font-bold text-slate-700">{row.estimateNo}</span>
                                            )}
                                        </td>
                                        <td className="px-2 py-1 text-center text-slate-700">{formatDate(row.piDate)}</td>
                                        <td className="px-2 py-1">
                                            {row.invoiceNo ? (
                                                <span className="font-bold text-blue-600">{row.invoiceNo}</span>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-2 py-1 text-center text-slate-700">{row.invoiceNo ? formatDate(row.invoiceDate) : '—'}</td>
                                        <td className="px-2 py-1 text-right font-bold text-slate-800">{row.invoiceNo ? formatCurrency(row.invoiceValue) : '—'}</td>
                                        <td className="px-2 py-1">
                                            <div
                                                onClick={() => navigate(`/dashboard/account/${row.companyId}`)}
                                                className="font-bold text-slate-800 cursor-pointer hover:underline hover:text-blue-600"
                                            >
                                                {row.clientName}
                                            </div>
                                        </td>
                                        <td className="px-2 py-1 text-right font-bold text-slate-800">{formatCurrency(row.dcValue)}</td>
                                        <td className="px-2 py-1">
                                            <div className="font-semibold text-slate-700">{row.addedBy || '—'}</div>
                                            <div className="text-[10px] text-slate-400">{formatDate(row.added)}</div>
                                        </td>
                                        <td className="px-2 py-1">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button onClick={() => navigate(`/dashboard/account/${row.companyId}/delivery-challans`)} className="w-6 h-6 flex items-center justify-center text-blue-600 bg-blue-50/50 border border-blue-100 rounded hover:bg-blue-100 transition-colors" title="View"><Eye className="w-3.5 h-3.5" /></button>
                                                <button
                                                    onClick={() => row.attachmentUrl && window.open(`${SERVER_URL}${row.attachmentUrl}`, '_blank', 'noopener,noreferrer')}
                                                    disabled={!row.attachmentUrl}
                                                    title={row.attachmentUrl ? 'Download attachment' : 'No attachment uploaded'}
                                                    className="w-6 h-6 flex items-center justify-center text-blue-600 bg-blue-50/50 border border-blue-100 rounded hover:bg-blue-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                ><Download className="w-3.5 h-3.5" /></button>
                                                <button className="w-6 h-6 flex items-center justify-center text-slate-500 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 transition-colors" title="More"><MoreVertical className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-3 flex justify-between items-center text-[11px] text-slate-500 px-1">
                        <div>
                            Showing {filteredRows.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRows.length)} of {filteredRows.length} entries
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >&lt;</button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum = i + 1;
                                if (totalPages > 5 && currentPage > 3) pageNum = currentPage - 2 + i;
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
                                    <button onClick={() => setCurrentPage(totalPages)} className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 font-bold">{totalPages}</button>
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
                                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
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

                    {/* Document Workflow Stepper */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm mt-2 p-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider shrink-0">Document Workflow</span>
                            {WORKFLOW_STAGES.map((stage, idx) => {
                                const Icon = stage.icon;
                                const isCurrent = stage.n === 2;
                                return (
                                    <div key={stage.n} className="flex items-center gap-3">
                                        <div className={`flex items-center gap-2 rounded-lg px-2 py-1 ${isCurrent ? 'bg-blue-50 border border-blue-200' : ''}`}>
                                            <div className={`w-7 h-7 rounded-full ${STAGE_COLORS[idx]} text-white flex items-center justify-center font-bold text-[11px] shrink-0`}>
                                                {stage.n}
                                            </div>
                                            <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                                            <div className="leading-tight">
                                                <div className={`text-[11px] font-bold ${isCurrent ? 'text-blue-700' : 'text-slate-700'}`}>{stage.label}</div>
                                                {stage.sub && <div className="text-[10px] text-slate-400">{stage.sub}</div>}
                                            </div>
                                        </div>
                                        {idx < WORKFLOW_STAGES.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-3 flex items-center gap-2 bg-slate-50 border border-slate-100 text-slate-500 text-[10.5px] font-medium rounded-md px-3 py-2">
                            Note: Tax Invoice can be created only after confirming delivery through Delivery Challan.
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DeliveryChallansView;
