import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { 
    ChevronRight, FileText, CheckCircle2, AlertCircle, Clock, 
    Calendar, DollarSign, Download, Eye, MoreVertical, Send, Target, 
    ClipboardList, Filter, Search, Plus, CalendarDays, RefreshCw, BarChart2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import api, { SERVER_URL } from '../../lib/api';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import AccountNavigation from '../../components/AccountNavigation';

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

function StatCard({ icon, iconBg, rawValue, displayValue, label, subLabel, bottomLabel, bottomValue, isCurrency }) {
    const { ref, count } = useCountUp(rawValue);
    return (
        <div ref={ref} className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm flex flex-col justify-between h-full">
            <div className="flex items-start gap-2.5">
                <div className={`w-8 h-8 ${iconBg} rounded-full flex items-center justify-center shrink-0 mt-0.5`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className="text-slate-500 font-bold text-[9px] uppercase tracking-wider leading-tight">{label}</h3>
                    <div className="text-lg font-black text-slate-800 leading-none mt-1">
                        {isCurrency ? displayValue : Math.round(count).toLocaleString('en-IN')}
                    </div>
                    <div className="text-slate-400 text-[9px] font-semibold mt-0.5">{subLabel}</div>
                </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-between items-center text-[9px]">
                <span className="text-slate-500 font-medium">{bottomLabel}</span>
                <span className="text-slate-800 font-bold">{bottomValue}</span>
            </div>
        </div>
    );
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount || 0);
};

const InvoicesView = () => {
    const navigate = useNavigate();
    const { id = 'all' } = useParams();
    const isAllList = id === 'all';
    
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await api.get('/api/invoices');
                // Mocking additional fields for the UI until backend is fully synced
                const enhancedInvoices = (res.data || []).map((inv, idx) => {
                    const statuses = ['Paid', 'Partial', 'Unpaid', 'Running'];
                    const types = ['Overdue', 'Paid', 'Running', 'Advance', 'Full Payment'];
                    return {
                        ...inv,
                        mockStatus: statuses[idx % statuses.length],
                        mockType: types[idx % types.length],
                        mockReceived: inv.amount_paid || (idx % 2 === 0 ? inv.f_amount : 0),
                        mockOutstanding: inv.f_amount - (inv.amount_paid || (idx % 2 === 0 ? inv.f_amount : 0)),
                        mockTds: inv.f_amount * 0.02, // 2% TDS mock
                        mockDueDate: new Date(new Date().setDate(new Date().getDate() + (idx * 5 - 10)))
                    };
                });
                setInvoices(enhancedInvoices);
            } catch (err) {
                console.error("Failed to fetch invoices", err);
                toast.error("Failed to load invoices.");
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    // Pagination & Filtering Logic
    const filteredInvoices = invoices.filter(inv => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            (inv.invoice_no || '').toLowerCase().includes(q) ||
            (inv.company_name || '').toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const paginatedInvoices = filteredInvoices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Chart Data
    const chartData = [
        { name: 'Paid', value: 57.05, color: '#10b981' },
        { name: 'Partial', value: 26.28, color: '#f59e0b' },
        { name: 'Unpaid', value: 16.67, color: '#ef4444' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Invoices</h1>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                        <span>Accounts Receivable (AR)</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-blue-600 font-bold">Invoices</span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50">
                        <CalendarDays className="w-4 h-4 text-slate-500" />
                        01 Jun 2026 - 04 Jul 2026
                        <ChevronRight className="w-3 h-3 ml-1 rotate-90" />
                    </button>
                    <button className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50">
                        <Filter className="w-4 h-4 text-blue-600" />
                        Filters
                    </button>
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors">
                        <Plus className="w-4 h-4" />
                        Create Invoice
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex flex-col lg:flex-row gap-4">
                
                {/* Left Side: Table Area */}
                <div className="w-full lg:w-[80%] space-y-4">
                    
                    {/* Top Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-2">
                        <StatCard 
                            icon={<FileText className="w-4 h-4 text-blue-600" />} iconBg="bg-blue-100"
                            rawValue={156} displayValue="156"
                            label="Total Invoices" subLabel="This Month"
                            bottomLabel="Total Value" bottomValue="₹ 68,75,000.00"
                        />
                        <StatCard 
                            icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />} iconBg="bg-emerald-100"
                            rawValue={89} displayValue="89"
                            label="Fully Paid Invoices" subLabel="57.05%"
                            bottomLabel="Total Value" bottomValue="₹ 32,45,230.00"
                        />
                        <StatCard 
                            icon={<PieChart className="w-4 h-4 text-amber-600" />} iconBg="bg-amber-100"
                            rawValue={41} displayValue="41"
                            label="Partially Paid Invoices" subLabel="26.28%"
                            bottomLabel="Total Value" bottomValue="₹ 24,65,540.00"
                        />
                        <StatCard 
                            icon={<AlertCircle className="w-4 h-4 text-rose-600" />} iconBg="bg-rose-100"
                            rawValue={26} displayValue="26"
                            label="Unpaid Invoices" subLabel="16.67%"
                            bottomLabel="Total Value" bottomValue="₹ 11,64,230.00"
                        />
                        <StatCard 
                            icon={<Clock className="w-4 h-4 text-orange-600" />} iconBg="bg-orange-100"
                            rawValue={18} displayValue="18"
                            label="Overdue Invoices" subLabel="11.54%"
                            bottomLabel="Total Value" bottomValue="₹ 9,87,590.00"
                        />
                        <StatCard 
                            icon={<BarChart2 className="w-4 h-4 text-purple-600" />} iconBg="bg-purple-100"
                            rawValue={44070} displayValue="₹ 44,070" isCurrency={true}
                            label="Avg Invoice Value" subLabel="This Month"
                            bottomLabel="Avg Collection Days" bottomValue="21 Days"
                        />
                    </div>

                    {/* Filter Row */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-3">
                        {/* Line 1: All Filters */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide w-full">
                            <div className="relative shrink-0">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                    type="text" 
                                    placeholder="Search by invoice no., client name, stall no., GST no..." 
                                    className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-[11px] w-[260px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <select className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white">
                                <option>Date Range</option>
                            </select>
                            <select className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white">
                                <option>Invoice Status</option>
                            </select>
                            <select className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white">
                                <option>Payment Status</option>
                            </select>
                            <select className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white">
                                <option>Hall</option>
                            </select>
                            <select className="border border-slate-300 rounded-md px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none shrink-0 bg-white">
                                <option>Sales Person</option>
                            </select>
                            <button className="flex items-center gap-1 text-blue-600 font-bold text-[11px] px-2 shrink-0">
                                <Filter className="w-3 h-3" /> More Filters
                            </button>
                        </div>
                        {/* Line 2: Action Buttons */}
                        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-[11px] font-bold border border-blue-100 hover:bg-blue-100 transition-colors">
                                <Send className="w-3.5 h-3.5" /> Send Reminder
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 rounded-md text-[11px] font-bold border border-slate-300 hover:bg-slate-50 transition-colors">
                                <Download className="w-3.5 h-3.5" /> Export
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 rounded-md text-[11px] font-bold border border-slate-300 hover:bg-slate-50 transition-colors">
                                <BarChart2 className="w-3.5 h-3.5" /> Invoice Report
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
                        <table className="w-full min-w-[1200px] text-left border-collapse">
                            <thead>
                                <tr className="bg-white text-[10px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200">
                                    <th className="px-4 py-4 text-center">S.No.</th>
                                    <th className="px-4 py-4">Invoice Details</th>
                                    <th className="px-4 py-4">Client & Stall</th>
                                    <th className="px-4 py-4 text-center">Invoice Value</th>
                                    <th className="px-4 py-4 text-center">Invoice Date</th>
                                    <th className="px-4 py-4 text-center">Due Date</th>
                                    <th className="px-4 py-4 text-center">Payment Status</th>
                                    <th className="px-4 py-4 text-center">Received</th>
                                    <th className="px-4 py-4 text-center">Outstanding</th>
                                    <th className="px-4 py-4 text-center">TDS Deducted</th>
                                    <th className="px-4 py-4 text-center">Invoice Notes</th>
                                    <th className="px-4 py-4 text-center">Status</th>
                                    <th className="px-4 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px]">
                                {paginatedInvoices.map((inv, idx) => (
                                    <tr key={inv._id || idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-4 font-bold text-slate-700 text-center">{idx + 1}</td>
                                        <td className="px-4 py-4">
                                            <div className="font-bold text-slate-800 text-[11px]">{inv.invoice_no || `NGW/INV/26-27/0${39 - idx}`}</div>
                                            <div className="text-slate-500 mt-0.5 text-[10px] font-medium">PO No: PO/26/{String(17 - idx).padStart(3, '0')}</div>
                                            <div className="text-blue-600 font-bold mt-1 text-[10px] cursor-pointer">View More ˅</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="font-bold text-blue-600 text-[11px]">{inv.company_name || 'City Dental Pvt Ltd'}</div>
                                            <div className="text-slate-500 mt-0.5 text-[10px] font-medium">Stall No: H9-091</div>
                                            <div className="text-slate-500 text-[10px] font-medium">Hall: 9</div>
                                        </td>
                                        <td className="px-4 py-4 font-bold text-slate-800 text-[11px] text-center">
                                            {formatCurrency(inv.f_amount || 227174.00)}
                                        </td>
                                        <td className="px-4 py-4 font-bold text-slate-700 text-center">03 Jul 2026</td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="font-bold text-slate-700">06 Aug 2026</div>
                                            <div className="text-orange-500 font-bold text-[10px] mt-0.5">Due in 33 Days</div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                inv.mockStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                                                inv.mockStatus === 'Partial' ? 'bg-amber-100 text-amber-700' :
                                                inv.mockStatus === 'Running' ? 'bg-orange-100 text-orange-700' :
                                                'bg-rose-100 text-rose-700'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${
                                                    inv.mockStatus === 'Paid' ? 'bg-emerald-500' :
                                                    inv.mockStatus === 'Partial' ? 'bg-amber-500' :
                                                    inv.mockStatus === 'Running' ? 'bg-orange-500' :
                                                    'bg-rose-500'
                                                }`}></div>
                                                {inv.mockStatus}
                                            </span>
                                            <div className="text-slate-500 font-bold mt-1">{inv.mockStatus === 'Paid' ? '100%' : '57.14%'}</div>
                                        </td>
                                        <td className="px-4 py-4 font-bold text-emerald-600 text-[11px] text-center">
                                            {formatCurrency(inv.mockReceived || 129769.00)}
                                        </td>
                                        <td className="px-4 py-4 font-bold text-rose-600 text-[11px] text-center">
                                            {formatCurrency(inv.mockOutstanding || 94810.00)}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="font-bold text-slate-800 text-[11px]">{formatCurrency(inv.mockTds || 2595.38)}</div>
                                            <div className="text-slate-500 font-bold mt-0.5 text-[10px]">1.14%</div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="font-bold text-slate-800 text-[11px]">{formatCurrency(10000)}</div>
                                            <div className="text-slate-500 font-bold mt-0.5 text-[10px]">CN/26-27/015</div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold border ${
                                                inv.mockType === 'Overdue' ? 'border-red-200 text-red-600 bg-red-50' :
                                                inv.mockType === 'Paid' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' :
                                                inv.mockType === 'Running' ? 'border-orange-200 text-orange-600 bg-orange-50' :
                                                inv.mockType === 'Advance' ? 'border-blue-200 text-blue-600 bg-blue-50' :
                                                'border-emerald-200 text-emerald-600 bg-emerald-50'
                                            }`}>
                                                {inv.mockType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button className="w-6 h-6 flex items-center justify-center text-blue-600 bg-blue-50/50 border border-blue-100 rounded hover:bg-blue-100 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                                                <button className="w-6 h-6 flex items-center justify-center text-blue-600 bg-blue-50/50 border border-blue-100 rounded hover:bg-blue-100 transition-colors"><Download className="w-3.5 h-3.5" /></button>
                                                <button className="w-6 h-6 flex items-center justify-center text-blue-600 bg-blue-50/50 border border-blue-100 rounded hover:bg-blue-100 transition-colors"><MoreVertical className="w-3 h-3" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer Totals */}
                        <div className="bg-white border-t border-slate-200 p-4">
                            <div className="flex justify-between items-center mb-4 text-[11px] text-slate-500">
                                <div>Showing 1 to 8 of 156 entries</div>
                                <div className="flex items-center gap-1">
                                    <button className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50">&lt;</button>
                                    <button className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded font-bold">1</button>
                                    <button className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 font-bold">2</button>
                                    <button className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 font-bold">3</button>
                                    <span className="px-1">...</span>
                                    <button className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50 font-bold">20</button>
                                    <button className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50">&gt;</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>Rows per page</span>
                                    <select className="border border-slate-300 rounded px-2 py-1 focus:outline-none">
                                        <option>10</option>
                                        <option>20</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Side: Sidebar Area */}
                <div className="w-full lg:w-[20%] flex flex-col gap-2">
                    
                    {/* Collection Summary */}
                    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                        <h2 className="text-xs font-black text-slate-800 mb-3 tracking-wide">Collection Summary</h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><ClipboardList className="w-3.5 h-3.5" /></div>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-500">Today's Collection</div>
                                    <div className="font-black text-slate-800 text-sm">₹ 1,45,000</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><Calendar className="w-3.5 h-3.5" /></div>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-500">This Week Collection</div>
                                    <div className="font-black text-slate-800 text-sm">₹ 7,80,000</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-orange-50 flex items-center justify-center text-orange-600 shrink-0"><DollarSign className="w-3.5 h-3.5" /></div>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-500">This Month Collection</div>
                                    <div className="font-black text-slate-800 text-sm">₹ 20,03,230</div>
                                </div>
                            </div>
                            <div className="h-[1px] bg-slate-100 my-1.5"></div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-red-50 flex items-center justify-center text-red-500 shrink-0"><Target className="w-3.5 h-3.5" /></div>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-500">Overdue Recovery Target</div>
                                    <div className="font-black text-slate-800 text-sm">₹ 12,45,600</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0"><RefreshCw className="w-3.5 h-3.5" /></div>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-500">Pending Follow-ups</div>
                                    <div className="font-black text-slate-800 text-sm">18</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center text-blue-500 shrink-0"><Send className="w-3.5 h-3.5" /></div>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-500">Reminder Sent Today</div>
                                    <div className="font-black text-slate-800 text-sm">34</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                        <h2 className="text-xs font-black text-slate-800 mb-3 tracking-wide">Quick Actions</h2>
                        <div className="space-y-2">
                            {[
                                { icon: <FileText className="w-3.5 h-3.5 text-blue-500" />, title: 'Create Invoice', sub: 'Generate new invoice' },
                                { icon: <Plus className="w-3.5 h-3.5 text-emerald-500" />, title: 'Add Payment', sub: 'Record a new payment' },
                                { icon: <Send className="w-3.5 h-3.5 text-emerald-500" />, title: 'Send Reminder', sub: 'WhatsApp / Email / SMS' },
                                { icon: <FileText className="w-3.5 h-3.5 text-purple-500" />, title: 'Create Credit Note', sub: 'Adjust invoice amount' },
                                { icon: <Download className="w-3.5 h-3.5 text-blue-500" />, title: 'Download Invoice Report', sub: 'Get detailed invoice report' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-bold text-slate-700">{item.title}</div>
                                            <div className="text-[10px] font-medium text-slate-500">{item.sub}</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Invoice Status Overview Chart */}
                    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                        <h2 className="text-xs font-black text-slate-800 mb-3 tracking-wide">Invoice Status Overview</h2>
                        
                        <div className="flex items-center justify-between h-[140px]">
                            <div className="w-[100px] h-full shrink-0 -ml-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={30}
                                            outerRadius={45}
                                            paddingAngle={2}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-col gap-3 shrink-0">
                                {chartData.map((item, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <div className="text-[11px] font-black text-slate-800 whitespace-nowrap">
                                            {item.name} <span className="font-medium text-slate-500">({item.value}%)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-2 text-center">
                            <button className="text-blue-600 hover:text-blue-700 text-[11px] font-bold tracking-wide transition-colors">
                                View All Invoices →
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Totals Outside Table (Full Width) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between overflow-x-auto mt-4">
                <div className="flex items-center flex-1 divide-x divide-slate-200 min-w-max">
                    <div className="pr-4 text-center">
                        <div className="text-[11px] font-bold text-slate-600">Total Invoice Value</div>
                        <div className="font-black text-slate-800 mt-1 text-[13px]">₹ 68,75,000.00</div>
                    </div>
                    <div className="px-4 text-center">
                        <div className="text-[11px] font-bold text-slate-600">Total Collections</div>
                        <div className="font-black text-slate-800 mt-1 text-[13px]">₹ 20,03,230.04</div>
                    </div>
                    <div className="px-4 text-center">
                        <div className="text-[11px] font-bold text-slate-600">Total Outstanding</div>
                        <div className="font-black text-slate-800 mt-1 text-[13px]">₹ 48,72,630.96</div>
                    </div>
                    <div className="px-4 text-center">
                        <div className="text-[11px] font-bold text-slate-600">Total Overdue</div>
                        <div className="font-black text-red-500 mt-1 text-[13px]">₹ 12,45,600.00</div>
                    </div>
                    <div className="px-4 text-center">
                        <div className="text-[11px] font-bold text-slate-600">Total TDS Deducted</div>
                        <div className="font-black text-slate-800 mt-1 text-[13px]">₹ 7,139.04</div>
                    </div>
                    <div className="px-4 text-center">
                        <div className="text-[11px] font-bold text-slate-600">Total Credit Notes</div>
                        <div className="font-black text-slate-800 mt-1 text-[13px]">₹ 2,35,600.00</div>
                    </div>
                    <div className="pl-4 text-center">
                        <div className="text-[11px] font-bold text-slate-600">Net Amount Received</div>
                        <div className="font-black text-slate-800 mt-1 text-[13px]">₹ 19,96,091.00</div>
                        <div className="text-[10px] text-slate-500 font-bold">(After TDS)</div>
                    </div>
                </div>
                <div className="shrink-0 ml-4 flex items-center justify-center">
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-white text-blue-600 rounded-md text-[11px] font-bold border border-blue-200 hover:bg-blue-50 transition-colors">
                        <BarChart2 className="w-4 h-4" /> View Summary Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvoicesView;
