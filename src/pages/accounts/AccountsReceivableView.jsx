import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, Filter, Plus, Search, Download, Eye, MoreVertical,
    CreditCard, ArrowDownToLine, Clock, AlertCircle, FileText,
    Users, PieChart, CheckCircle2, TrendingUp, TrendingDown,
    Building2, FileSpreadsheet, Landmark, MessageCircleMore,
    Mail, RefreshCw, BarChart2
} from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

function StatCard({ icon, iconBg, iconColor, title, value, subLabel, subText, trendUp, bottomText }) {
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
            {(subText || bottomText) && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
                    {subText && (
                        <span className={`font-bold flex items-center gap-1 ${trendUp === true ? 'text-emerald-600' : trendUp === false ? 'text-rose-600' : 'text-slate-500'}`}>
                            {trendUp === true ? <TrendingUp className="w-3 h-3" /> : trendUp === false ? <TrendingDown className="w-3 h-3" /> : null}
                            {subText}
                        </span>
                    )}
                    {bottomText && <span className="text-slate-500 font-semibold">{bottomText}</span>}
                </div>
            )}
        </div>
    );
}

const mockData = [
    {
        sno: 1,
        client: 'City Dental', stallNo: '91', sqMtr: '12 Sq. Mtr.', contact: 'Dr. Ashish Verma',
        invNo: 'NGW/INV/26-27/039', invDate: '03 Jul 26', totalInv: 2,
        paymentType: 'Advance', paymentTypeColor: 'text-blue-600 bg-blue-50 border-blue-200',
        invValue: '₹ 2,27,174.00',
        received: '₹ 1,29,769.00', receivedPct: '57.14%',
        tds: '₹ 2,595.38', tdsColor: 'text-rose-600',
        netReceived: '₹ 1,27,173.62', netReceivedColor: 'text-emerald-600',
        outstanding: '₹ 97,404.62',
        paymentMode: 'NEFT', bank: 'HDFC Bank',
        utr: 'HDFC260704672981', utrDate: '04 Jul 26',
        dueDate: '06 Aug 26',
        status: 'Partially Paid', statusColor: 'bg-orange-50 text-orange-600 border-orange-200'
    },
    {
        sno: 2,
        client: 'Ayush Wellness Pvt. Ltd.', stallNo: '157', sqMtr: '9 Sq. Mtr.', contact: 'Mr. Rajesh Mehra',
        invNo: 'NGW/INV/26-27/038', invDate: '03 Jul 26', totalInv: 1,
        paymentType: 'Full Payment', paymentTypeColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        invValue: '₹ 2,27,183.04',
        received: '₹ 2,27,183.04', receivedPct: '100%',
        tds: '₹ 0.00', tdsColor: 'text-rose-600',
        netReceived: '₹ 2,27,183.04', netReceivedColor: 'text-emerald-600',
        outstanding: '₹ 0.00',
        paymentMode: 'Online', bank: 'Razorpay',
        utr: 'pay_T9LH7YGH40jKAM', utrDate: '04 Jul 26',
        dueDate: '-',
        status: 'Paid', statusColor: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
        sno: 3,
        client: 'Wellness Forever', stallNo: '203', sqMtr: '18 Sq. Mtr.', contact: 'Mr. Sandeep Rao',
        invNo: 'NGW/INV/26-27/040', invDate: '03 Jul 26', totalInv: 1,
        paymentType: 'Full Payment', paymentTypeColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        invValue: '₹ 12,01,334.00',
        received: '₹ 12,01,334.00', receivedPct: '100%',
        tds: '₹ 0.00', tdsColor: 'text-rose-600',
        netReceived: '₹ 12,01,334.00', netReceivedColor: 'text-emerald-600',
        outstanding: '₹ 0.00',
        paymentMode: 'NEFT', bank: 'HDFC Bank',
        utr: 'HDFC260703458921', utrDate: '04 Jul 26',
        dueDate: '-',
        status: 'Paid', statusColor: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
        sno: 4,
        client: 'Werbal India', stallNo: '112', sqMtr: '9 Sq. Mtr.', contact: 'Ms. Neha Gupta',
        invNo: 'NGW/INV/26-27/041', invDate: '03 Jul 26', totalInv: 2,
        paymentType: 'Running', paymentTypeColor: 'text-orange-600 bg-orange-50 border-orange-200',
        invValue: '₹ 2,27,183.00',
        received: '₹ 10,000.00', receivedPct: '4.40%',
        tds: '₹ 4,543.66', tdsColor: 'text-rose-600',
        netReceived: '₹ 5,456.34', netReceivedColor: 'text-emerald-600',
        outstanding: '₹ 2,17,183.00',
        paymentMode: 'NEFT', bank: 'HDFC Bank',
        utr: '95855599595', utrDate: '04 Jul 26',
        dueDate: '07 Jul 26',
        status: 'Partially Paid', statusColor: 'bg-orange-50 text-orange-600 border-orange-200'
    },
    {
        sno: 5,
        client: 'Health Kart', stallNo: '305', sqMtr: '12 Sq. Mtr.', contact: 'Mr. Vivek Sharma',
        invNo: 'NGW/INV/26-27/031', invDate: '02 Jul 26', totalInv: 1,
        paymentType: 'Full Payment', paymentTypeColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        invValue: '₹ 1,18,944.00',
        received: '₹ 1,18,944.00', receivedPct: '100%',
        tds: '₹ 0.00', tdsColor: 'text-rose-600',
        netReceived: '₹ 1,18,944.00', netReceivedColor: 'text-emerald-600',
        outstanding: '₹ 0.00',
        paymentMode: 'NEFT', bank: 'HDFC Bank',
        utr: '467654345676543', utrDate: '03 Jul 26',
        dueDate: '-',
        status: 'Paid', statusColor: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
        sno: 6,
        client: 'Arogya Naturals', stallNo: '78', sqMtr: '9 Sq. Mtr.', contact: 'Mr. Amit Tiwari',
        invNo: 'NGW/26-27/PI/017', invDate: '01 Jul 26', totalInv: 1,
        paymentType: 'Advance', paymentTypeColor: 'text-blue-600 bg-blue-50 border-blue-200',
        invValue: '₹ 1,18,944.00',
        received: '₹ 200.00', receivedPct: '0.17%',
        tds: '₹ 0.00', tdsColor: 'text-rose-600',
        netReceived: '₹ 200.00', netReceivedColor: 'text-emerald-600',
        outstanding: '₹ 1,18,744.00',
        paymentMode: 'NEFT', bank: 'Bank',
        utr: '1212', utrDate: '01 Jul 26',
        dueDate: '15 Jul 26',
        status: 'Partially Paid', statusColor: 'bg-orange-50 text-orange-600 border-orange-200'
    },
    {
        sno: 7,
        client: 'GreenLife Pharma', stallNo: '66', sqMtr: '9 Sq. Mtr.', contact: 'Mr. Rohit Jain',
        invNo: 'NGW/INV/26-27/013', invDate: '29 Jun 26', totalInv: 1,
        paymentType: 'Advance', paymentTypeColor: 'text-blue-600 bg-blue-50 border-blue-200',
        invValue: '₹ 1,18,944.00',
        received: '₹ 1,212.00', receivedPct: '1.02%',
        tds: '₹ 0.00', tdsColor: 'text-rose-600',
        netReceived: '₹ 1,212.00', netReceivedColor: 'text-emerald-600',
        outstanding: '₹ 1,17,732.00',
        paymentMode: 'NEFT', bank: '1212',
        utr: '1212', utrDate: '30 Jun 26',
        dueDate: '30 Jun 26',
        status: 'Overdue', statusColor: 'bg-rose-50 text-rose-600 border-rose-200'
    }
];

const AccountsReceivableView = () => {
    const navigate = useNavigate();

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
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-md text-[11px] font-bold text-slate-700 shadow-sm">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" /> 01 Jun 2026 - 04 Jul 2026
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-md text-[11px] font-bold text-blue-600 shadow-sm">
                        <Filter className="w-3.5 h-3.5" /> Filters
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-bold shadow-sm transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add Payment
                    </button>
                </div>
            </div>

            {/* Stat Cards - Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
                <StatCard
                    icon={<CreditCard className="w-4 h-4" />} iconBg="bg-blue-100" iconColor="text-blue-600"
                    title="Total Collections" value="₹ 20,03,230.04" subLabel="This Month"
                    subText="18.6%" trendUp={true} bottomText="vs May '26"
                />
                <StatCard
                    icon={<ArrowDownToLine className="w-4 h-4" />} iconBg="bg-emerald-100" iconColor="text-emerald-600"
                    title="Net Amount Received" value="₹ 19,96,091.00" subLabel="This Month"
                    subText="17.3%" trendUp={true} bottomText="vs May '26"
                />
                <StatCard
                    icon={<Clock className="w-4 h-4" />} iconBg="bg-orange-100" iconColor="text-orange-600"
                    title="Pending Collections" value="₹ 6,80,550.00" subLabel="Due & Upcoming"
                    subText="8.2%" trendUp={false} bottomText="vs May '26"
                />
                <StatCard
                    icon={<AlertCircle className="w-4 h-4" />} iconBg="bg-rose-100" iconColor="text-rose-600"
                    title="Overdue Collections" value="₹ 38,120.00" subLabel="Overdue"
                    subText="12.5%" trendUp={false} bottomText="vs May '26"
                />
                <StatCard
                    icon={<FileText className="w-4 h-4" />} iconBg="bg-purple-100" iconColor="text-purple-600"
                    title="TDS Deducted" value="₹ 7,139.04" subLabel="This Month"
                    subText="5.1%" trendUp={false} bottomText="vs May '26"
                />
            </div>

            {/* Stat Cards - Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                <StatCard
                    icon={<FileText className="w-4 h-4" />} iconBg="bg-blue-100" iconColor="text-blue-600"
                    title="Total Invoices" value="7" subLabel="This Month"
                />
                <StatCard
                    icon={<CheckCircle2 className="w-4 h-4" />} iconBg="bg-emerald-100" iconColor="text-emerald-600"
                    title="Fully Paid Invoices" value="4" subLabel="57.14%"
                />
                <StatCard
                    icon={<PieChart className="w-4 h-4" />} iconBg="bg-orange-100" iconColor="text-orange-600"
                    title="Partially Paid Invoices" value="2" subLabel="28.57%"
                />
                <StatCard
                    icon={<FileSpreadsheet className="w-4 h-4" />} iconBg="bg-rose-100" iconColor="text-rose-600"
                    title="Unpaid Invoices" value="1" subLabel="14.29%"
                />
                <StatCard
                    icon={<Users className="w-4 h-4" />} iconBg="bg-purple-100" iconColor="text-purple-600"
                    title="Total Clients" value="5" subLabel="Active Clients"
                />
            </div>

            {/* Filters Row */}
            <div className="bg-white p-2.5 rounded-t-xl border border-slate-200 border-b-0 shadow-sm flex flex-col md:flex-row items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search by invoice no., client, stall no., UTR..."
                        className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-md text-[11px] w-full focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-hide">
                    <select className="border border-slate-200 rounded-md px-2 py-1.5 text-[11px] font-bold text-slate-700 focus:outline-none bg-slate-50 min-w-[120px]">
                        <option>All Banks</option>
                    </select>
                    <select className="border border-slate-200 rounded-md px-2 py-1.5 text-[11px] font-bold text-slate-700 focus:outline-none bg-slate-50 min-w-[130px]">
                        <option>All Payment Types</option>
                    </select>
                    <select className="border border-slate-200 rounded-md px-2 py-1.5 text-[11px] font-bold text-slate-700 focus:outline-none bg-slate-50 min-w-[110px]">
                        <option>All Status</option>
                    </select>
                    <select className="border border-slate-200 rounded-md px-2 py-1.5 text-[11px] font-bold text-slate-700 focus:outline-none bg-slate-50 min-w-[140px]">
                        <option>All Sales Persons</option>
                    </select>
                    <button className="flex items-center gap-1 text-blue-600 font-bold text-[11px] px-2 whitespace-nowrap">
                        <Filter className="w-3 h-3" /> More Filters
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-[11px] font-bold text-slate-700 hover:bg-slate-50 ml-auto whitespace-nowrap">
                        <Download className="w-3.5 h-3.5" /> Export
                    </button>
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
                        {mockData.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                <td className="px-3 py-2 font-black text-slate-800 text-center">{row.sno}</td>
                                <td className="px-3 py-2">
                                    <div className="font-bold text-blue-600 text-[12px]">{row.client}</div>
                                    <div className="text-slate-600 font-bold mt-0.5 text-[10px]">Stall No. {row.stallNo} <span className="text-slate-400 font-medium">| {row.sqMtr}</span></div>
                                    <div className="text-slate-500 font-medium mt-0.5 text-[10px] flex items-center gap-1"><Users className="w-3 h-3" /> Contact: {row.contact}</div>
                                </td>
                                <td className="px-3 py-2">
                                    <div className="font-bold text-slate-800 text-[11px]">{row.invNo}</div>
                                    <div className="text-slate-500 mt-0.5 text-[10px] font-medium">Date: {row.invDate}</div>
                                    <div className="text-slate-500 mt-0.5 text-[10px] font-medium">Total Invoices: <span className="font-bold text-slate-700">{row.totalInv}</span></div>
                                </td>
                                <td className="px-3 py-2 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border ${row.paymentTypeColor}`}>
                                        {row.paymentType}
                                    </span>
                                </td>
                                <td className="px-3 py-2 font-bold text-slate-800 text-[11px] text-right">
                                    {row.invValue}
                                </td>
                                <td className="px-3 py-2 text-center">
                                    <div className="font-bold text-emerald-600 text-[11px]">{row.received}</div>
                                    <div className="text-blue-600 font-bold mt-0.5 text-[10px]">{row.receivedPct}</div>
                                </td>
                                <td className="px-3 py-2 text-center">
                                    <div className={`font-bold text-[11px] ${row.tdsColor}`}>{row.tds}</div>
                                </td>
                                <td className="px-3 py-2 text-center">
                                    <div className={`font-bold text-[11px] ${row.netReceivedColor}`}>{row.netReceived}</div>
                                </td>
                                <td className="px-3 py-2 font-bold text-slate-800 text-[11px] text-right">
                                    {row.outstanding}
                                </td>
                                <td className="px-3 py-2">
                                    <div className="font-bold text-slate-800 text-[11px]">{row.paymentMode}</div>
                                    <div className="text-slate-500 font-medium mt-0.5 text-[10px]">{row.bank}</div>
                                </td>
                                <td className="px-3 py-2">
                                    <div className="font-medium text-slate-700 text-[11px]">{row.utr}</div>
                                    <div className="text-slate-500 font-medium mt-0.5 text-[10px]">{row.utrDate}</div>
                                </td>
                                <td className="px-3 py-2 font-black text-slate-700 text-center">
                                    {row.dueDate}
                                </td>
                                <td className="px-3 py-2 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${row.statusColor}`}>
                                        {row.status}
                                    </span>
                                </td>
                                <td className="px-3 py-2">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <button className="w-6 h-6 flex items-center justify-center border border-blue-100 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                                            <Eye className="w-3.5 h-3.5" />
                                        </button>
                                        <button className="w-6 h-6 flex items-center justify-center border border-slate-200 text-slate-500 rounded hover:bg-slate-50 transition-colors">
                                            <MoreVertical className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bottom Summary Bar */}
            <div className="mt-3 bg-white border border-slate-200 rounded-xl shadow-sm p-3 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6 overflow-x-auto w-full md:w-auto scrollbar-hide">
                    <div className="font-black text-slate-800 text-[12px] whitespace-nowrap">Total Summary</div>
                    
                    <div className="flex flex-col border-l border-slate-200 pl-4 whitespace-nowrap">
                        <span className="text-emerald-600 font-black text-[12px]">₹ 28,39,706.04</span>
                        <span className="text-slate-500 text-[9px] font-bold mt-0.5">Total Invoice Value</span>
                    </div>

                    <div className="flex flex-col border-l border-slate-200 pl-4 whitespace-nowrap">
                        <span className="text-emerald-600 font-black text-[12px]">₹ 20,03,230.04</span>
                        <span className="text-slate-500 text-[9px] font-bold mt-0.5">Total Received</span>
                    </div>

                    <div className="flex flex-col border-l border-slate-200 pl-4 whitespace-nowrap">
                        <span className="text-orange-500 font-black text-[12px]">₹ 7,139.04</span>
                        <span className="text-slate-500 text-[9px] font-bold mt-0.5">Total TDS Deducted</span>
                    </div>

                    <div className="flex flex-col border-l border-slate-200 pl-4 whitespace-nowrap">
                        <span className="text-emerald-600 font-black text-[12px]">₹ 19,96,091.00</span>
                        <span className="text-slate-500 text-[9px] font-bold mt-0.5">Net Amount Received</span>
                    </div>

                    <div className="flex flex-col border-l border-slate-200 pl-4 whitespace-nowrap">
                        <span className="text-slate-800 font-black text-[12px]">₹ 6,80,550.00</span>
                        <span className="text-slate-500 text-[9px] font-bold mt-0.5">Total Outstanding</span>
                    </div>

                    <div className="flex flex-col border-l border-slate-200 pl-4 whitespace-nowrap">
                        <span className="text-rose-600 font-black text-[12px]">₹ 38,120.00</span>
                        <span className="text-slate-500 text-[9px] font-bold mt-0.5">Overdue Amount</span>
                    </div>
                </div>

                <button className="flex items-center gap-1.5 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-bold whitespace-nowrap hover:bg-blue-100 transition-colors shrink-0">
                    <BarChart2 className="w-4 h-4" /> View Summary Report
                </button>
            </div>
            
            <div className="mt-4 flex items-center gap-1.5 text-[9px] font-medium text-slate-400">
                <AlertCircle className="w-3.5 h-3.5" /> Amounts are inclusive of GST where applicable.
            </div>
        </div>
    );
};

export default AccountsReceivableView;
