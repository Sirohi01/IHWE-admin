import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, CreditCard, PieChart as PieChartIcon, Activity, Download, Building2, CheckCircle2, AlertTriangle, CalendarDays, ChevronDown, Settings } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import api from '../../lib/api';
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

function PaymentsSummaryReport() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);

    const [filterDate, setFilterDate] = useState('all');
    const [filterBank, setFilterBank] = useState('');
    const [filterMode, setFilterMode] = useState('');

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await api.get('/api/payments');
                setPayments(res.data?.data || res.data || []);
            } catch (err) {
                console.error("Failed to fetch payments", err);
                toast.error("Failed to load summary data");
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const filteredPayments = payments.filter(pmt => {
        if (filterBank && pmt.bankId !== filterBank) return false;
        if (filterMode && pmt.payment_mode !== filterMode) return false;

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
        return true;
    });

    const uniqueBanks = [...new Set(payments.map(p => p.bankId).filter(Boolean))];
    const uniqueModes = [...new Set(payments.map(p => p.payment_mode).filter(Boolean))];

    // Derived Metrics
    const totalCollected = filteredPayments.reduce((sum, p) => sum + (parseFloat(p.amount_text) || 0), 0);
    const totalTds = filteredPayments.reduce((sum, p) => sum + (parseFloat(p.tds_text) || 0), 0);
    const completedCount = filteredPayments.filter(p => p.status === 'Completed' || p.status === '1' || String(p.status).toLowerCase() === 'completed').length;
    const overdueCount = filteredPayments.filter(p => String(p.status).toLowerCase() === 'overdue').length;
    const avgTicket = filteredPayments.length > 0 ? (totalCollected / filteredPayments.length) : 0;

    const formatCurrency = (val) => `₹ ${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    // Data for Bank Bar Chart
    const bankMap = filteredPayments.reduce((acc, p) => {
        const bank = p.bankId || 'Other';
        if (!acc[bank]) acc[bank] = 0;
        acc[bank] += (parseFloat(p.amount_text) || 0);
        return acc;
    }, {});
    const bankData = Object.entries(bankMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);

    // Data for Mode Pie Chart
    const modeMap = filteredPayments.reduce((acc, p) => {
        const mode = p.payment_mode || 'Unknown';
        if (!acc[mode]) acc[mode] = 0;
        acc[mode] += (parseFloat(p.amount_text) || 0);
        return acc;
    }, {});
    const modeData = Object.entries(modeMap).map(([name, value]) => ({ name, value }));
    const PIE_COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

    // Data for Monthly Trend Line Chart (Last 6 Months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trendMap = filteredPayments.reduce((acc, p) => {
        const d = new Date(p.payment_date || p.added);
        if (!isNaN(d)) {
            const mYear = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            if (!acc[mYear]) acc[mYear] = { name: mYear, Revenue: 0, time: d.getTime() };
            acc[mYear].Revenue += (parseFloat(p.amount_text) || 0);
        }
        return acc;
    }, {});
    const trendData = Object.values(trendMap).sort((a, b) => a.time - b.time).slice(-6);

    return (
        <div className="min-h-screen bg-gray-50 pl-4 pr-4 py-4">
            {/* -- Header -- */}
            <div className="flex items-center justify-between mb-4 mt-2">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition-colors text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payments Summary</h1>
                        <div className="text-sm text-slate-500 mt-1">Detailed breakdown of payment collections</div>
                    </div>
                </div>

            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20 text-slate-400">Loading...</div>
            ) : (
                <>
                    {/* -- Stat Cards -- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mb-4">
                        <AnimatedStatCard
                            icon={<DollarSign className="w-5 h-5 text-indigo-600" strokeWidth={2.5} />}
                            gradientTo="to-indigo-50" iconBg="bg-indigo-100"
                            rawValue={totalCollected}
                            displayValue={(c) => `₹ ${c.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                            label="Total Revenue"
                            subLabel="" subColor="#4f46e5"
                        />
                        <AnimatedStatCard
                            icon={<Activity className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />}
                            gradientTo="to-emerald-50" iconBg="bg-emerald-100"
                            rawValue={completedCount}
                            displayValue={(c) => Math.round(c)}
                            label="Completed Txns"
                            subLabel="" subColor="#059669"
                        />
                        <AnimatedStatCard
                            icon={<CreditCard className="w-5 h-5 text-pink-600" strokeWidth={2.5} />}
                            gradientTo="to-pink-50" iconBg="bg-pink-100"
                            rawValue={totalTds}
                            displayValue={(c) => `₹ ${c.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                            label="TDS Deducted"
                            subLabel="" subColor="#ec4899"
                        />
                        <AnimatedStatCard
                            icon={<AlertTriangle className="w-5 h-5 text-amber-600" strokeWidth={2.5} />}
                            gradientTo="to-amber-50" iconBg="bg-amber-100"
                            rawValue={overdueCount}
                            displayValue={(c) => Math.round(c)}
                            label="Overdue Payments"
                            subLabel="" subColor="#d97706"
                        />
                        <AnimatedStatCard
                            icon={<PieChartIcon className="w-5 h-5 text-rose-600" strokeWidth={2.5} />}
                            gradientTo="to-rose-50" iconBg="bg-rose-100"
                            rawValue={avgTicket}
                            displayValue={(c) => `₹ ${c.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                            label="Avg. Ticket Size"
                            subLabel="" subColor="#e11d48"
                        />
                    </div>

                    {/* -- Filters -- */}
                    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-sm mb-4 overflow-x-auto">
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
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Monthly Trend Chart */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">Revenue Trend</h2>
                                    <p className="text-[10px] font-semibold text-slate-500">Last 6 active months</p>
                                </div>
                                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md"><Activity className="w-3.5 h-3.5" /></div>
                            </div>
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`} />
                                        <RechartsTooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                            formatter={(value) => [formatCurrency(value), 'Revenue']}
                                        />
                                        <Line type="monotone" dataKey="Revenue" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Banks Bar Chart */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">Top Receiving Banks</h2>
                                    <p className="text-[10px] font-semibold text-slate-500">Highest collection by bank account</p>
                                </div>
                                <div className="p-1.5 bg-pink-50 text-pink-600 rounded-md"><Building2 className="w-3.5 h-3.5" /></div>
                            </div>
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={bankData} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`} />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} width={90} />
                                        <RechartsTooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                            formatter={(value) => [formatCurrency(value), 'Collection']}
                                        />
                                        <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={16} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                        {/* Payment Mode Distribution */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-md"><PieChartIcon className="w-3.5 h-3.5" /></div>
                                <h2 className="text-sm font-bold text-slate-900">Payment Modes</h2>
                            </div>
                            <div className="h-[200px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={modeData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {modeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value) => formatCurrency(value)}
                                            contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2.5 mt-2">
                                {modeData.map((item, idx) => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></div>
                                            <span className="text-[11px] font-semibold text-slate-600">{item.name}</span>
                                        </div>
                                        <span className="text-[11px] font-black text-slate-900">{formatCurrency(item.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Large Transactions */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 overflow-x-auto">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">Top 5 Collections</h2>
                                    <p className="text-[10px] font-semibold text-slate-500">Highest value single transactions</p>
                                </div>
                            </div>
                            <table className="w-full text-left text-[11px]">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                        <th className="pb-3 px-2">Invoice No</th>
                                        <th className="pb-3 px-2">Bank</th>
                                        <th className="pb-3 px-2">Mode</th>
                                        <th className="pb-3 px-2">Date</th>
                                        <th className="pb-3 px-2 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {[...filteredPayments].sort((a, b) => (parseFloat(b.amount_text) || 0) - (parseFloat(a.amount_text) || 0)).slice(0, 5).map((pmt, i) => (
                                        <tr key={i} className="group hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-2 font-bold text-blue-600">{pmt.invoice_no || pmt.invoice_id}</td>
                                            <td className="py-3 px-2 font-semibold text-slate-700">{pmt.bankId}</td>
                                            <td className="py-3 px-2 font-semibold text-slate-600">
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-sm text-[10px]">
                                                    {pmt.payment_mode}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-slate-500 font-medium">
                                                {pmt.payment_date ? new Date(pmt.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A'}
                                            </td>
                                            <td className="py-3 px-2 font-black text-slate-900 text-right">
                                                {formatCurrency(pmt.amount_text)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default PaymentsSummaryReport;
