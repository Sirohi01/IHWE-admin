import { useEffect, useMemo, useState } from 'react';
import {
    Search, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    Download, FileText, ClipboardCheck, UsersRound, TriangleAlert, BarChart, Calendar, Loader2,
} from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import api from '../../lib/api';

function StatCard({ icon, iconBg, iconColor, label, value, sub, progressPct, progressColor }) {
    return (
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
                    {icon}
                </div>
                <div className="min-w-0">
                    <div className="text-slate-700 font-bold text-[11px] whitespace-nowrap">{label}</div>
                    <div className={`text-xl font-black mt-0.5 truncate ${iconColor}`}>{value}</div>
                    <div className="text-slate-400 text-[10px] font-semibold mt-0.5">{sub}</div>
                </div>
            </div>
            {progressPct !== undefined && (
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
                    <div className={`h-full rounded-full ${progressColor}`} style={{ width: `${Math.min(100, progressPct)}%` }} />
                </div>
            )}
        </div>
    );
}

function BucketCard({ label, sub, value, valueColor }) {
    return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
            <div className="text-slate-700 font-bold text-[11px]">{label}</div>
            {sub && <div className="text-slate-400 text-[9px] font-semibold">{sub}</div>}
            <div className={`text-lg font-black mt-1 ${valueColor}`}>₹ {formatAmount(value.amount)}</div>
            <div className="text-slate-400 text-[10px] font-semibold mt-0.5">{value.count} Clients | {value.pct}%</div>
        </div>
    );
}

const formatAmount = (value) => Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const BUCKET_KEYS = ['current', 'b31_60', 'b61_90', 'b91_180', 'b181plus'];
const BUCKET_LABELS = {
    current: 'Current (0-30 Days)',
    b31_60: '31-60 Days',
    b61_90: '61-90 Days',
    b91_180: '91-180 Days',
    b181plus: '181+ Days',
};

const getBucketKey = (row) => {
    const daysPastDue = row.isOverdue ? Number(row.overdueDays || 0) : 0;
    if (daysPastDue <= 30) return 'current';
    if (daysPastDue <= 60) return 'b31_60';
    if (daysPastDue <= 90) return 'b61_90';
    if (daysPastDue <= 180) return 'b91_180';
    return 'b181plus';
};

const CollectionAgeingReportsView = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);

    const [reportBasis, setReportBasis] = useState('invDate');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
    const [clientSearch, setClientSearch] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('all');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/accounts-receivable');
            setRows(res.data?.data?.rows || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching accounts receivable data:', err);
            setError('Failed to load collection & ageing data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            const dateField = reportBasis === 'dueDate' ? row.dueDate : row.invDate;
            const matchesFrom = !dateFrom || (dateField && new Date(dateField) >= new Date(dateFrom));
            const matchesTo = !dateTo || (dateField && new Date(dateField) <= new Date(dateTo));
            const matchesClient = !clientSearch.trim() || String(row.client || '').toLowerCase().includes(clientSearch.trim().toLowerCase());
            const matchesStatus = paymentStatus === 'all'
                || (paymentStatus === 'Overdue' ? row.isOverdue : row.status === paymentStatus || row.paymentType === paymentStatus);
            return matchesFrom && matchesTo && matchesClient && matchesStatus;
        });
    }, [rows, reportBasis, dateFrom, dateTo, clientSearch, paymentStatus]);

    const clientRows = useMemo(() => {
        const byCompany = {};
        filteredRows.forEach((row) => {
            const key = row.companyId || row.client;
            if (!byCompany[key]) {
                byCompany[key] = {
                    companyId: row.companyId,
                    client: row.client,
                    totalInvoiced: 0,
                    totalCollected: 0,
                    outstanding: 0,
                    current: 0,
                    b31_60: 0,
                    b61_90: 0,
                    b91_180: 0,
                    b181plus: 0,
                };
            }
            const entry = byCompany[key];
            entry.totalInvoiced += Number(row.invValue || 0);
            entry.totalCollected += Number(row.received || 0);
            const outstanding = Number(row.outstanding || 0);
            entry.outstanding += outstanding;
            if (outstanding > 0) {
                entry[getBucketKey(row)] += outstanding;
            }
        });
        return Object.values(byCompany).map((c) => ({
            ...c,
            overdue: c.b31_60 + c.b61_90 + c.b91_180 + c.b181plus,
        })).sort((a, b) => b.outstanding - a.outstanding);
    }, [filteredRows]);

    useEffect(() => {
        setCurrentPage(1);
    }, [reportBasis, dateFrom, dateTo, clientSearch, paymentStatus]);

    const totals = useMemo(() => {
        const t = { totalInvoiced: 0, totalCollected: 0, outstanding: 0, current: 0, b31_60: 0, b61_90: 0, b91_180: 0, b181plus: 0, overdue: 0 };
        clientRows.forEach((c) => {
            t.totalInvoiced += c.totalInvoiced;
            t.totalCollected += c.totalCollected;
            t.outstanding += c.outstanding;
            t.current += c.current;
            t.b31_60 += c.b31_60;
            t.b61_90 += c.b61_90;
            t.b91_180 += c.b91_180;
            t.b181plus += c.b181plus;
            t.overdue += c.overdue;
        });
        return t;
    }, [clientRows]);

    const bucketStats = useMemo(() => {
        const build = (key) => {
            const amount = totals[key];
            const count = clientRows.filter((c) => c[key] > 0).length;
            const pct = totals.outstanding > 0 ? Math.round((amount / totals.outstanding) * 1000) / 10 : 0;
            return { amount, count, pct };
        };
        return {
            current: build('current'),
            b31_60: build('b31_60'),
            b61_90: build('b61_90'),
            b91_180: build('b91_180'),
            b181plus: build('b181plus'),
        };
    }, [totals, clientRows]);

    const overdueClientCount = useMemo(() => clientRows.filter((c) => c.overdue > 0).length, [clientRows]);
    const collectedPct = totals.totalInvoiced > 0 ? Math.round((totals.totalCollected / totals.totalInvoiced) * 1000) / 10 : 0;
    const outstandingPct = totals.totalInvoiced > 0 ? Math.round((totals.outstanding / totals.totalInvoiced) * 1000) / 10 : 0;

    const totalPages = Math.ceil(clientRows.length / itemsPerPage);
    const paginatedRows = clientRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const clearFilters = () => {
        setReportBasis('invDate');
        setDateFrom('');
        setDateTo('');
        setClientSearch('');
        setPaymentStatus('all');
    };

    const handleGenerateReport = () => {
        setCurrentPage(1);
        toast.success('Report generated for the selected filters');
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Collection & Ageing');
            worksheet.columns = [
                { header: 'S.No.', key: 'sno', width: 8 },
                { header: 'Client / Company', key: 'client', width: 28 },
                { header: 'Total Invoiced', key: 'totalInvoiced', width: 16 },
                { header: 'Total Collected', key: 'totalCollected', width: 16 },
                { header: 'Outstanding', key: 'outstanding', width: 16 },
                { header: '0-30 Days', key: 'current', width: 14 },
                { header: '31-60 Days', key: 'b31_60', width: 14 },
                { header: '61-90 Days', key: 'b61_90', width: 14 },
                { header: '91-180 Days', key: 'b91_180', width: 14 },
                { header: '181+ Days', key: 'b181plus', width: 14 },
                { header: 'Overdue', key: 'overdue', width: 16 },
            ];
            const headerRow = worksheet.getRow(1);
            headerRow.font = { name: 'Arial', family: 4, size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
            headerRow.height = 25;

            const moneyCols = ['totalInvoiced', 'totalCollected', 'outstanding', 'current', 'b31_60', 'b61_90', 'b91_180', 'b181plus', 'overdue'];
            clientRows.forEach((c, index) => {
                const row = worksheet.addRow({ sno: index + 1, client: c.client, ...c });
                moneyCols.forEach((col) => { row.getCell(col).numFmt = '₹#,##0.00'; });
                row.height = 20;
            });

            const totalRow = worksheet.addRow({ sno: '', client: 'Grand Total', ...totals });
            totalRow.font = { bold: true };
            moneyCols.forEach((col) => { totalRow.getCell(col).numFmt = '₹#,##0.00'; });

            const buffer = await workbook.xlsx.writeBuffer();
            const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long' }).replace(/ /g, '');
            saveAs(new Blob([buffer]), `collectionAgeingReport_${formattedDate}.xlsx`);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Collection & Ageing Reports</h1>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Real-time overview of collections and outstanding ageing.
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 rounded-md text-[11px] font-bold border border-slate-300 hover:bg-slate-50 transition-colors whitespace-nowrap disabled:opacity-60"
                    >
                        {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} Export
                    </button>
                    <button
                        onClick={handleGenerateReport}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-bold shadow-sm transition-colors whitespace-nowrap"
                    >
                        <BarChart className="w-3.5 h-3.5" /> Generate Report
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
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading report...
                </div>
            ) : (
                <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        <StatCard
                            icon={<FileText className="w-5 h-5" />} iconBg="bg-blue-100" iconColor="text-blue-600"
                            label="Total Invoiced" value={`₹ ${formatAmount(totals.totalInvoiced)}`} sub={`${filteredRows.length} Invoices`}
                        />
                        <StatCard
                            icon={<ClipboardCheck className="w-5 h-5" />} iconBg="bg-emerald-100" iconColor="text-emerald-600"
                            label="Total Collected" value={`₹ ${formatAmount(totals.totalCollected)}`} sub={`${collectedPct}% of Invoiced`}
                            progressPct={collectedPct} progressColor="bg-emerald-500"
                        />
                        <StatCard
                            icon={<UsersRound className="w-5 h-5" />} iconBg="bg-orange-100" iconColor="text-orange-600"
                            label="Total Outstanding" value={`₹ ${formatAmount(totals.outstanding)}`} sub={`${outstandingPct}% of Invoiced`}
                            progressPct={outstandingPct} progressColor="bg-orange-500"
                        />
                        <StatCard
                            icon={<TriangleAlert className="w-5 h-5" />} iconBg="bg-rose-100" iconColor="text-rose-600"
                            label="Overdue" value={`₹ ${formatAmount(totals.overdue)}`} sub={`${overdueClientCount} Clients`}
                        />
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-sm mb-4">
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="w-[220px] shrink-0 relative">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Date Range</label>
                                <button
                                    type="button"
                                    onClick={() => setIsDateRangeOpen((v) => !v)}
                                    className="w-full flex items-center justify-between gap-2 border border-slate-200 rounded-md px-3 py-1.5 text-[11px] font-bold text-slate-600 bg-white hover:bg-slate-50"
                                >
                                    <span className="truncate">
                                        {dateFrom || dateTo
                                            ? `${dateFrom ? formatDate(dateFrom) : '...'} - ${dateTo ? formatDate(dateTo) : '...'}`
                                            : 'Select Date Range'}
                                    </span>
                                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                </button>
                                {isDateRangeOpen && (
                                    <div className="absolute z-20 mt-1 left-0 bg-white border border-slate-200 rounded-md shadow-lg p-3 w-64">
                                        <div className="mb-2">
                                            <label className="block text-[9px] font-bold text-slate-500 mb-1">From</label>
                                            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full border border-slate-200 rounded-md px-2 py-1 text-[11px]" />
                                        </div>
                                        <div className="mb-2">
                                            <label className="block text-[9px] font-bold text-slate-500 mb-1">To</label>
                                            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full border border-slate-200 rounded-md px-2 py-1 text-[11px]" />
                                        </div>
                                        <button
                                            onClick={() => setIsDateRangeOpen(false)}
                                            className="w-full mt-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-[11px] font-bold hover:bg-blue-700"
                                        >
                                            Done
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="w-[140px] shrink-0">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Report Basis</label>
                                <div className="relative">
                                    <select
                                        value={reportBasis}
                                        onChange={(e) => setReportBasis(e.target.value)}
                                        className="appearance-none w-full bg-white border border-slate-200 text-slate-700 pl-3 pr-7 py-1.5 rounded-md text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                    >
                                        <option value="invDate">Invoice Date</option>
                                        <option value="dueDate">Due Date</option>
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-[160px]">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Client / Company</label>
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={clientSearch}
                                        onChange={(e) => setClientSearch(e.target.value)}
                                        placeholder="Search Client / Company"
                                        className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-md text-[11px] w-full focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                                    />
                                </div>
                            </div>
                            <div className="w-[130px] shrink-0">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Payment Status</label>
                                <div className="relative">
                                    <select
                                        value={paymentStatus}
                                        onChange={(e) => setPaymentStatus(e.target.value)}
                                        className="appearance-none w-full bg-white border border-slate-200 text-slate-700 pl-3 pr-7 py-1.5 rounded-md text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                    >
                                        <option value="all">All</option>
                                        <option value="Full Payment">Fully Paid</option>
                                        <option value="Partial Payment">Partially Paid</option>
                                        <option value="Pending">Unpaid</option>
                                        <option value="Overdue">Overdue</option>
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <button onClick={clearFilters} className="text-blue-600 text-[11px] font-bold whitespace-nowrap hover:underline">
                                    Clear
                                </button>
                                <button
                                    onClick={handleGenerateReport}
                                    className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-[11px] font-bold hover:bg-blue-700 transition-colors whitespace-nowrap"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Ageing Summary */}
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-sm font-black text-slate-800">Ageing Summary <span className="text-slate-400 font-semibold text-[11px]">(Outstanding Amount)</span></h2>
                        <span className="text-[11px] text-slate-400 font-semibold">As on {formatDate(new Date())}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                        <BucketCard label="Current" sub="0 - 30 Days" value={bucketStats.current} valueColor="text-emerald-600" />
                        <BucketCard label="31 - 60 Days" value={bucketStats.b31_60} valueColor="text-amber-600" />
                        <BucketCard label="61 - 90 Days" value={bucketStats.b61_90} valueColor="text-orange-600" />
                        <BucketCard label="91 - 180 Days" value={bucketStats.b91_180} valueColor="text-rose-600" />
                        <BucketCard label="181+ Days" value={bucketStats.b181plus} valueColor="text-rose-700" />
                        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
                            <div className="text-slate-700 font-bold text-[11px]">Total Outstanding</div>
                            <div className="text-lg font-black mt-1 text-blue-600">₹ {formatAmount(totals.outstanding)}</div>
                            <div className="text-slate-400 text-[10px] font-semibold mt-0.5">{clientRows.filter((c) => c.outstanding > 0).length} Clients</div>
                        </div>
                    </div>

                    {/* Outstanding by Client */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 px-4 py-2.5">
                            <h3 className="text-[12px] font-black text-slate-800">Outstanding by Client</h3>
                        </div>
                        <div className="overflow-auto max-h-[640px]">
                            <table className="w-full min-w-[1250px] text-left border-collapse">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-white text-[9px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-200 shadow-sm whitespace-nowrap">
                                        <th className="px-3 py-2.5 text-center w-10">S.No.</th>
                                        <th className="px-3 py-2.5">Client / Company</th>
                                        <th className="px-3 py-2.5 text-right">Total Invoiced (₹)</th>
                                        <th className="px-3 py-2.5 text-right">Total Collected (₹)</th>
                                        <th className="px-3 py-2.5 text-right">Outstanding (₹)</th>
                                        <th className="px-3 py-2.5 text-right">0-30 Days (₹)</th>
                                        <th className="px-3 py-2.5 text-right">31-60 Days (₹)</th>
                                        <th className="px-3 py-2.5 text-right">61-90 Days (₹)</th>
                                        <th className="px-3 py-2.5 text-right">91-180 Days (₹)</th>
                                        <th className="px-3 py-2.5 text-right">181+ Days (₹)</th>
                                        <th className="px-3 py-2.5 text-right">Overdue (₹)</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[11px] whitespace-nowrap">
                                    {paginatedRows.length === 0 && (
                                        <tr>
                                            <td colSpan={11} className="py-8 text-center text-slate-400">No outstanding data found.</td>
                                        </tr>
                                    )}
                                    {paginatedRows.map((c, idx) => (
                                        <tr key={c.companyId || c.client} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                                            <td className="px-3 py-2.5 text-center text-slate-400 font-bold">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                            <td className="px-3 py-2.5 font-semibold text-slate-700">{c.client}</td>
                                            <td className="px-3 py-2.5 text-right text-slate-700 font-semibold">{formatAmount(c.totalInvoiced)}</td>
                                            <td className="px-3 py-2.5 text-right text-emerald-600 font-semibold">{formatAmount(c.totalCollected)}</td>
                                            <td className="px-3 py-2.5 text-right font-black text-slate-900">{formatAmount(c.outstanding)}</td>
                                            <td className="px-3 py-2.5 text-right text-slate-600">{c.current ? formatAmount(c.current) : '-'}</td>
                                            <td className="px-3 py-2.5 text-right text-slate-600">{c.b31_60 ? formatAmount(c.b31_60) : '-'}</td>
                                            <td className="px-3 py-2.5 text-right text-slate-600">{c.b61_90 ? formatAmount(c.b61_90) : '-'}</td>
                                            <td className="px-3 py-2.5 text-right text-slate-600">{c.b91_180 ? formatAmount(c.b91_180) : '-'}</td>
                                            <td className="px-3 py-2.5 text-right text-slate-600">{c.b181plus ? formatAmount(c.b181plus) : '-'}</td>
                                            <td className="px-3 py-2.5 text-right font-black text-rose-600">{c.overdue ? formatAmount(c.overdue) : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                {clientRows.length > 0 && (
                                    <tfoot className="sticky bottom-0 z-10">
                                        <tr className="bg-slate-50 text-[11px] font-black text-slate-900 border-t-2 border-slate-300">
                                            <td className="px-3 py-2.5" colSpan={2}>Grand Total</td>
                                            <td className="px-3 py-2.5 text-right">{formatAmount(totals.totalInvoiced)}</td>
                                            <td className="px-3 py-2.5 text-right text-emerald-700">{formatAmount(totals.totalCollected)}</td>
                                            <td className="px-3 py-2.5 text-right">{formatAmount(totals.outstanding)}</td>
                                            <td className="px-3 py-2.5 text-right">{formatAmount(totals.current)}</td>
                                            <td className="px-3 py-2.5 text-right">{formatAmount(totals.b31_60)}</td>
                                            <td className="px-3 py-2.5 text-right">{formatAmount(totals.b61_90)}</td>
                                            <td className="px-3 py-2.5 text-right">{formatAmount(totals.b91_180)}</td>
                                            <td className="px-3 py-2.5 text-right">{formatAmount(totals.b181plus)}</td>
                                            <td className="px-3 py-2.5 text-right text-rose-700">{formatAmount(totals.overdue)}</td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 border-t border-slate-200">
                            <div className="text-[11px] text-slate-500">
                                Showing {clientRows.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, clientRows.length)} of {clientRows.length} clients
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                ><ChevronsLeft className="w-3.5 h-3.5" /></button>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                ><ChevronLeft className="w-3.5 h-3.5" /></button>

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
                                    className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                ><ChevronRight className="w-3.5 h-3.5" /></button>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                ><ChevronsRight className="w-3.5 h-3.5" /></button>
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
                                    <option value={15}>15</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CollectionAgeingReportsView;
