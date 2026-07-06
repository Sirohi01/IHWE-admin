import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, CreditCard, PieChart as PieChartIcon, Activity, Download, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import api from '../../lib/api';
import toast from 'react-hot-toast';

function PaymentsSummaryReport() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);

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

    // Derived Metrics
    const totalCollected = payments.reduce((sum, p) => sum + (parseFloat(p.amount_text) || 0), 0);
    const totalTds = payments.reduce((sum, p) => sum + (parseFloat(p.tds_text) || 0), 0);
    const completedCount = payments.filter(p => p.status === 'Completed' || p.status === '1' || String(p.status).toLowerCase() === 'completed').length;
    const overdueCount = payments.filter(p => String(p.status).toLowerCase() === 'overdue').length;
    const totalCount = payments.length || 1;

    const formatCurrency = (val) => `₹ ${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    // Data for Bank Bar Chart
    const bankMap = payments.reduce((acc, p) => {
        const bank = p.bankId || 'Other';
        if (!acc[bank]) acc[bank] = 0;
        acc[bank] += (parseFloat(p.amount_text) || 0);
        return acc;
    }, {});
    const bankData = Object.entries(bankMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5); // Top 5

    // Data for Mode Pie Chart
    const modeMap = payments.reduce((acc, p) => {
        const mode = p.payment_mode || 'Unknown';
        if (!acc[mode]) acc[mode] = 0;
        acc[mode] += (parseFloat(p.amount_text) || 0);
        return acc;
    }, {});
    const modeData = Object.entries(modeMap).map(([name, value]) => ({ name, value }));
    const PIE_COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

    // Data for Monthly Trend Line Chart (Last 6 Months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trendMap = payments.reduce((acc, p) => {
        const d = new Date(p.payment_date || p.added);
        if(!isNaN(d)) {
            const mYear = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            if (!acc[mYear]) acc[mYear] = { name: mYear, Revenue: 0, time: d.getTime() };
            acc[mYear].Revenue += (parseFloat(p.amount_text) || 0);
        }
        return acc;
    }, {});
    const trendData = Object.values(trendMap).sort((a,b) => a.time - b.time).slice(-6); // Last 6 months

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-5">
                    <button onClick={() => navigate(-1)} className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all text-slate-600">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Financial Overview</h1>
                        <p className="text-sm font-semibold text-slate-500 mt-1">Comprehensive breakdown of all collected payments and metrics</p>
                    </div>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-indigo-200 transition-all text-sm group">
                    <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                    Export PDF Report
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="text-indigo-600 font-bold tracking-widest text-sm uppercase">Aggregating Data...</div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Top KPI Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* KPI 1 */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity group-hover:scale-110 duration-500">
                                <DollarSign className="w-24 h-24" />
                            </div>
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 border border-indigo-100">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div className="text-3xl font-black text-slate-900 mb-1">{formatCurrency(totalCollected)}</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue</div>
                        </div>

                        {/* KPI 2 */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity group-hover:scale-110 duration-500">
                                <Activity className="w-24 h-24" />
                            </div>
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 border border-emerald-100">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div className="text-3xl font-black text-slate-900 mb-1">{completedCount} <span className="text-lg text-slate-400 font-semibold">/ {totalCount}</span></div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Transactions</div>
                        </div>

                        {/* KPI 3 */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity group-hover:scale-110 duration-500">
                                <CreditCard className="w-24 h-24" />
                            </div>
                            <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4 border border-pink-100">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div className="text-3xl font-black text-slate-900 mb-1">{formatCurrency(totalTds)}</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">TDS Deducted</div>
                        </div>

                        {/* KPI 4 */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity group-hover:scale-110 duration-500">
                                <AlertCircle className="w-24 h-24" />
                            </div>
                            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4 border border-rose-100">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div className="text-3xl font-black text-slate-900 mb-1">{overdueCount}</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overdue Payments</div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Monthly Trend Chart */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Revenue Trend</h2>
                                    <p className="text-xs font-semibold text-slate-500">Last 6 active months</p>
                                </div>
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Activity className="w-4 h-4" /></div>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`} />
                                        <RechartsTooltip 
                                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                            formatter={(value) => [formatCurrency(value), 'Revenue']}
                                        />
                                        <Line type="monotone" dataKey="Revenue" stroke="#4f46e5" strokeWidth={4} dot={{r: 6, fill: '#4f46e5', strokeWidth: 3, stroke: '#fff'}} activeDot={{r: 8}} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Banks Bar Chart */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Top Receiving Banks</h2>
                                    <p className="text-xs font-semibold text-slate-500">Highest collection by bank account</p>
                                </div>
                                <div className="p-2 bg-pink-50 text-pink-600 rounded-lg"><Building2 className="w-4 h-4" /></div>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={bankData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                        <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`} />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 700}} width={100} />
                                        <RechartsTooltip 
                                            cursor={{fill: 'transparent'}}
                                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                            formatter={(value) => [formatCurrency(value), 'Collection']}
                                        />
                                        <Bar dataKey="value" fill="#ec4899" radius={[0, 6, 6, 0]} barSize={24} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row - Pie Chart & Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Payment Mode Distribution */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><PieChartIcon className="w-4 h-4" /></div>
                                <h2 className="text-lg font-bold text-slate-900">Payment Modes</h2>
                            </div>
                            <div className="h-[250px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={modeData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {modeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip 
                                            formatter={(value) => formatCurrency(value)}
                                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3 mt-4">
                                {modeData.map((item, idx) => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: PIE_COLORS[idx % PIE_COLORS.length]}}></div>
                                            <span className="text-sm font-semibold text-slate-600">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{formatCurrency(item.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Large Transactions */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Top 5 Collections</h2>
                                    <p className="text-xs font-semibold text-slate-500">Highest value single transactions</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                                            <th className="pb-3">Invoice No</th>
                                            <th className="pb-3">Bank</th>
                                            <th className="pb-3">Mode</th>
                                            <th className="pb-3">Date</th>
                                            <th className="pb-3 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {[...payments].sort((a,b) => (parseFloat(b.amount_text)||0) - (parseFloat(a.amount_text)||0)).slice(0, 5).map((pmt, i) => (
                                            <tr key={i} className="group hover:bg-slate-50 transition-colors">
                                                <td className="py-4 font-bold text-indigo-600">{pmt.invoice_no || pmt.invoice_id}</td>
                                                <td className="py-4 font-semibold text-slate-700">{pmt.bankId}</td>
                                                <td className="py-4 font-semibold text-slate-600">
                                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                                                        {pmt.payment_mode}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-slate-500 font-medium">
                                                    {pmt.payment_date ? new Date(pmt.payment_date).toLocaleDateString('en-GB') : 'N/A'}
                                                </td>
                                                <td className="py-4 font-black text-slate-900 text-right">
                                                    {formatCurrency(pmt.amount_text)}
                                                </td>
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

export default PaymentsSummaryReport;
