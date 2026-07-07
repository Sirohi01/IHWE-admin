import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Eye, MoreVertical,
    CreditCard, ArrowDownToLine, Clock, AlertCircle, FileText,
    Users, PieChart, CheckCircle2, FileSpreadsheet,
    Loader2, X
} from 'lucide-react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import api from '../../lib/api';

function StatCard({ icon, iconBg, iconColor, title, value, subLabel }) {
    return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
                <div className={`w-9 h-9 ${iconBg} ${iconColor} rounded-lg flex items-center justify-center shrink-0`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-slate-700 font-bold text-[9px] uppercase tracking-wider leading-tight whitespace-nowrap truncate">{title}</h3>
                    <div className="text-lg font-black text-slate-800 leading-tight mt-1 truncate">
                        {value}
                    </div>
                    {subLabel && (
                        <div className="text-slate-500 text-[10px] font-medium mt-0.5">{subLabel}</div>
                    )}
                </div>
            </div>
        </div>
    );
}

const formatCurrency = (value) => {
    const amount = Number(value || 0);
    return `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
};

const STATUS_STYLES = {
    'Paid': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    'Partially Paid': 'bg-orange-50 text-orange-600 border-orange-200',
    'Unpaid': 'bg-slate-100 text-slate-600 border-slate-200',
    'Overdue': 'bg-rose-50 text-rose-600 border-rose-200',
};

const PAYMENT_TYPE_STYLES = {
    'Full Payment': 'text-emerald-600 bg-emerald-50 border-emerald-200',
    'Partial Payment': 'text-orange-600 bg-orange-50 border-orange-200',
    'Pending': 'text-blue-600 bg-blue-50 border-blue-200',
};

const AccountsReceivableView = () => {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [modalCompanies, setModalCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [loadingCompanies, setLoadingCompanies] = useState(false);

    const handleOpenAddPayment = async () => {
        setIsAddModalOpen(true);
        setLoadingCompanies(true);
        try {
            const res = await api.get('/api/companies');
            const compData = res.data?.data || res.data || [];
            const options = compData.map((c) => ({ value: c._id, label: c.companyName || c.name || 'Unknown Company' }));
            setModalCompanies(options);
        } catch (error) {
            toast.error('Failed to load clients');
        } finally {
            setLoadingCompanies(false);
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
        const fetchAR = async () => {
            try {
                setLoading(true);
                const res = await api.get('/api/accounts-receivable');
                setRows(res.data?.data?.rows || []);
                setStats(res.data?.data?.stats || null);
                setError(null);
            } catch (err) {
                console.error('Error fetching accounts receivable:', err);
                setError('Failed to load accounts receivable data.');
            } finally {
                setLoading(false);
            }
        };
        fetchAR();
    }, []);

    const filteredRows = useMemo(() => {
        const s = search.trim().toLowerCase();
        return rows.filter((row) => {
            const matchesSearch = !s || [row.client, row.invNo, row.stallNo, row.utr]
                .some((field) => String(field || '').toLowerCase().includes(s));
            const matchesStatus = statusFilter === 'All Status' || row.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [rows, search, statusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
    const paginatedRows = filteredRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Accounts Receivable (AR)</h1>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Track all payments received against invoices, outstanding amounts and collection status.
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-bold shadow-sm transition-colors" onClick={handleOpenAddPayment}>
                        <Plus className="w-3.5 h-3.5" /> Add Payment
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-3 px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold rounded-md">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-24 text-slate-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading accounts receivable...
                </div>
            ) : (
                <>
                    {/* Stat Cards - Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
                        <StatCard
                            icon={<CreditCard className="w-4 h-4" />} iconBg="bg-blue-100" iconColor="text-blue-600"
                            title="Total Collections" value={formatCurrency(stats?.totalCollections)} subLabel="All Time"
                        />
                        <StatCard
                            icon={<ArrowDownToLine className="w-4 h-4" />} iconBg="bg-emerald-100" iconColor="text-emerald-600"
                            title="Net Amount Received" value={formatCurrency(stats?.netAmountReceived)} subLabel="After TDS"
                        />
                        <StatCard
                            icon={<Clock className="w-4 h-4" />} iconBg="bg-orange-100" iconColor="text-orange-600"
                            title="Pending Collections" value={formatCurrency(stats?.pendingAmount)} subLabel="Not Yet Due"
                        />
                        <StatCard
                            icon={<AlertCircle className="w-4 h-4" />} iconBg="bg-rose-100" iconColor="text-rose-600"
                            title="Overdue Collections" value={formatCurrency(stats?.overdueAmount)} subLabel="Past Due Date"
                        />
                        <StatCard
                            icon={<FileText className="w-4 h-4" />} iconBg="bg-purple-100" iconColor="text-purple-600"
                            title="TDS Deducted" value={formatCurrency(stats?.tdsDeducted)} subLabel="All Time"
                        />
                    </div>

                    {/* Stat Cards - Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                        <StatCard
                            icon={<FileText className="w-4 h-4" />} iconBg="bg-blue-100" iconColor="text-blue-600"
                            title="Total Invoices" value={stats?.totalInvoices ?? 0} subLabel="Active"
                        />
                        <StatCard
                            icon={<CheckCircle2 className="w-4 h-4" />} iconBg="bg-emerald-100" iconColor="text-emerald-600"
                            title="Fully Paid Invoices" value={stats?.fullyPaidCount ?? 0}
                            subLabel={stats?.totalInvoices ? `${Math.round((stats.fullyPaidCount / stats.totalInvoices) * 100)}%` : '0%'}
                        />
                        <StatCard
                            icon={<PieChart className="w-4 h-4" />} iconBg="bg-orange-100" iconColor="text-orange-600"
                            title="Partially Paid Invoices" value={stats?.partiallyPaidCount ?? 0}
                            subLabel={stats?.totalInvoices ? `${Math.round((stats.partiallyPaidCount / stats.totalInvoices) * 100)}%` : '0%'}
                        />
                        <StatCard
                            icon={<FileSpreadsheet className="w-4 h-4" />} iconBg="bg-rose-100" iconColor="text-rose-600"
                            title="Unpaid Invoices" value={stats?.unpaidCount ?? 0}
                            subLabel={stats?.totalInvoices ? `${Math.round((stats.unpaidCount / stats.totalInvoices) * 100)}%` : '0%'}
                        />
                        <StatCard
                            icon={<Users className="w-4 h-4" />} iconBg="bg-purple-100" iconColor="text-purple-600"
                            title="Total Clients" value={stats?.totalClients ?? 0} subLabel="Active Clients"
                        />
                    </div>

                    {/* Filters Row */}
                    <div className="bg-white p-2.5 rounded-t-xl border border-slate-200 border-b-0 shadow-sm flex flex-col md:flex-row items-center gap-2">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by invoice no., client, stall no., UTR..."
                                className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-md text-[11px] w-full focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-hide">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-slate-200 rounded-md px-2 py-1.5 text-[11px] font-bold text-slate-700 focus:outline-none bg-slate-50 min-w-[110px]"
                            >
                                <option>All Status</option>
                                <option>Paid</option>
                                <option>Partially Paid</option>
                                <option>Unpaid</option>
                                <option>Overdue</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-slate-200 shadow-sm overflow-x-auto">
                        <table className="w-full min-w-[1300px] text-left border-collapse">
                            <thead>
                                <tr className="bg-white text-[8px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-200 whitespace-nowrap">
                                    <th className="px-3 py-2.5 text-center w-10">S.No.</th>
                                    <th className="px-3 py-2.5">Client & Stall Details</th>
                                    <th className="px-3 py-2.5">Invoice Details</th>
                                    <th className="px-3 py-2.5 text-center">Payment Type</th>
                                    <th className="px-3 py-2.5 text-right">Invoice Value</th>
                                    <th className="px-3 py-2.5 text-right">Credit / Debit Note</th>
                                    <th className="px-3 py-2.5 text-center">Received Till Date</th>
                                    <th className="px-3 py-2.5 text-center">TDS Deducted</th>
                                    <th className="px-3 py-2.5 text-center">Net Received</th>
                                    <th className="px-3 py-2.5 text-right">Outstanding Amount</th>
                                    <th className="px-3 py-2.5">Payment Mode</th>
                                    <th className="px-3 py-2.5">UTR / Cheque No.</th>
                                    <th className="px-3 py-2.5 text-center">Due Date</th>
                                    <th className="px-3 py-2.5 text-center">Status</th>
                                    <th className="px-3 py-2.5 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] whitespace-nowrap">
                                {filteredRows.length === 0 && (
                                    <tr>
                                        <td colSpan={15} className="py-8 text-center text-slate-400">No invoices found.</td>
                                    </tr>
                                )}
                                {paginatedRows.map((row, idx) => (
                                    <tr
                                        key={row.id}
                                        className={`border-b transition-colors ${row.status === 'Overdue'
                                            ? 'bg-rose-50 border-rose-100 hover:bg-rose-100 border-l-4 border-l-rose-500'
                                            : 'border-slate-100 hover:bg-slate-50/50'
                                            }`}
                                    >
                                        <td className="px-3 py-2 font-black text-slate-800 text-center">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                        <td className="px-3 py-2">
                                            <div className="font-bold text-blue-600 text-[12px]">{row.client}</div>
                                            <div className="text-slate-600 font-bold mt-0.5 text-[10px]">Stall No. {row.stallNo} <span className="text-slate-400 font-medium">| {row.sqMtr}</span></div>
                                            <div className="text-slate-500 font-medium mt-0.5 text-[10px] flex items-center gap-1"><Users className="w-3 h-3" /> Contact: {row.contact}</div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="font-bold text-slate-800 text-[11px]">{row.invNo}</div>
                                            <div className="text-slate-500 mt-0.5 text-[10px] font-medium">Date: {formatDate(row.invDate)}</div>
                                            <div className="text-slate-500 mt-0.5 text-[10px] font-medium">Total Invoices: <span className="font-bold text-slate-700">{row.totalInvoicesForClient}</span></div>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border ${PAYMENT_TYPE_STYLES[row.paymentType] || 'text-slate-600 bg-slate-50 border-slate-200'}`}>
                                                {row.paymentType}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 font-bold text-slate-800 text-[11px] text-right">
                                            {formatCurrency(row.invValue)}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            {(!row.credited && !row.debited) && <span className="text-slate-400 text-[11px]">-</span>}
                                            {row.credited > 0 && <div className="text-rose-600 font-bold text-[10px]">CN: {formatCurrency(row.credited)}</div>}
                                            {row.debited > 0 && <div className="text-orange-600 font-bold text-[10px] mt-0.5">DN: {formatCurrency(row.debited)}</div>}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <div className="font-bold text-emerald-600 text-[11px]">{formatCurrency(row.received)}</div>
                                            <div className="text-blue-600 font-bold mt-0.5 text-[10px]">{row.receivedPct}%</div>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <div className="font-bold text-[11px] text-rose-600">{formatCurrency(row.tds)}</div>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <div className="font-bold text-[11px] text-emerald-600">{formatCurrency(row.netReceived)}</div>
                                        </td>
                                        <td className="px-3 py-2 font-bold text-slate-800 text-[11px] text-right">
                                            {formatCurrency(row.outstanding)}
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="font-bold text-slate-800 text-[11px]">{row.paymentMode}</div>
                                            {row.bank && row.bank !== '-' && (
                                                <div className="text-slate-500 font-medium mt-0.5 text-[10px]">{row.bank}</div>
                                            )}
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="font-medium text-slate-700 text-[11px]">{row.utr}</div>
                                            {row.utrDate && (
                                                <div className="text-slate-500 font-medium mt-0.5 text-[10px]">{formatDate(row.utrDate)}</div>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 font-black text-slate-700 text-center">
                                            {formatDate(row.dueDate)}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${STATUS_STYLES[row.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    className="w-6 h-6 flex items-center justify-center border border-blue-100 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                                    onClick={() => navigate(`/dashboard/account/${row.companyId}`)}
                                                    title="View account overview"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    className="w-6 h-6 flex items-center justify-center border border-slate-200 text-slate-500 rounded hover:bg-slate-50 transition-colors"
                                                    onClick={() => navigate(`/dashboard/account/client-ledger/${row.companyId}`)}
                                                    title="View client ledger"
                                                >
                                                    <MoreVertical className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 border-t border-slate-200">
                            <div className="text-[11px] text-slate-500">
                                Showing {filteredRows.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRows.length)} of {filteredRows.length} entries
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-[11px]"
                                >&lt;</button>

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum = i + 1;
                                    if (totalPages > 5 && currentPage > 3) {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    if (pageNum > totalPages) return null;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-6 h-6 flex items-center justify-center rounded text-[11px] font-bold ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'border border-slate-300 hover:bg-slate-50'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                {totalPages > 5 && currentPage < totalPages - 2 && (
                                    <>
                                        <span className="px-1">...</span>
                                        <button
                                            onClick={() => setCurrentPage(totalPages)}
                                            className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 font-bold text-[11px]"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-[11px]"
                                >&gt;</button>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-600">
                                <span>Rows per page</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="border border-slate-300 rounded px-2 py-1 focus:outline-none"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Summary Bar */}
                    <div className="mt-3 bg-white border border-slate-200 rounded-xl shadow-sm p-3 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-6 overflow-x-auto w-full md:w-auto scrollbar-hide">
                            <div className="font-black text-slate-800 text-[12px] whitespace-nowrap">Total Summary</div>

                            <div className="flex flex-col border-l border-slate-200 pl-4 whitespace-nowrap">
                                <span className="text-emerald-600 font-black text-[12px]">{formatCurrency(stats?.totalInvoiceValue)}</span>
                                <span className="text-slate-500 text-[9px] font-bold mt-0.5">Total Invoice Value</span>
                            </div>

                            <div className="flex flex-col border-l border-slate-200 pl-4 whitespace-nowrap">
                                <span className="text-emerald-600 font-black text-[12px]">{formatCurrency(stats?.totalReceived)}</span>
                                <span className="text-slate-500 text-[9px] font-bold mt-0.5">Total Received</span>
                            </div>

                            <div className="flex flex-col border-l border-slate-200 pl-4 whitespace-nowrap">
                                <span className="text-orange-500 font-black text-[12px]">{formatCurrency(stats?.tdsDeducted)}</span>
                                <span className="text-slate-500 text-[9px] font-bold mt-0.5">Total TDS Deducted</span>
                            </div>

                            <div className="flex flex-col border-l border-slate-200 pl-4 whitespace-nowrap">
                                <span className="text-emerald-600 font-black text-[12px]">{formatCurrency(stats?.netAmountReceived)}</span>
                                <span className="text-slate-500 text-[9px] font-bold mt-0.5">Net Amount Received</span>
                            </div>

                            <div className="flex flex-col border-l border-slate-200 pl-4 whitespace-nowrap">
                                <span className="text-rose-600 font-black text-[12px]">{formatCurrency(stats?.totalCreditNotes)}</span>
                                <span className="text-slate-500 text-[9px] font-bold mt-0.5">Total Credit Notes (−)</span>
                            </div>

                            <div className="flex flex-col border-l border-slate-200 pl-4 whitespace-nowrap">
                                <span className="text-orange-600 font-black text-[12px]">{formatCurrency(stats?.totalDebitNotes)}</span>
                                <span className="text-slate-500 text-[9px] font-bold mt-0.5">Total Debit Notes (+)</span>
                            </div>

                            <div className="flex flex-col border-l border-slate-200 pl-4 whitespace-nowrap">
                                <span className="text-slate-800 font-black text-[12px]">{formatCurrency(stats?.totalOutstanding)}</span>
                                <span className="text-slate-500 text-[9px] font-bold mt-0.5">Total Outstanding</span>
                            </div>

                            <div className="flex flex-col border-l border-slate-200 pl-4 whitespace-nowrap">
                                <span className="text-rose-600 font-black text-[12px]">{formatCurrency(stats?.overdueAmount)}</span>
                                <span className="text-slate-500 text-[9px] font-bold mt-0.5">Overdue Amount</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-1.5 text-[9px] font-medium text-slate-400">
                        <AlertCircle className="w-3.5 h-3.5" /> Amounts are inclusive of GST where applicable.
                    </div>
                </>
            )}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800 text-lg">Select Client</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
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
        </div>
    );
};

export default AccountsReceivableView;
