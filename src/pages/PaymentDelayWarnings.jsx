import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import {
    AlertTriangle, Search, RefreshCw, Send, Mail,
    MessageSquare, Calendar, DollarSign, Clock, Filter,
    ChevronRight, Eye, Phone, Mail as MailIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

const PAGE_SIZE = 15;

const PaymentDelayWarnings = () => {
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState({ totalOverdue: 0, totalAmount: 0, totalPenalty: 0 });
    const [daysFilter, setDaysFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchOverduePayments();
    }, [currentPage, daysFilter]);

    const fetchOverduePayments = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/api/payment-delay/overdue', {
                params: {
                    page: currentPage,
                    limit: PAGE_SIZE,
                    search: searchTerm,
                    daysOverdue: daysFilter
                }
            });
            if (res.data.success) {
                setRecords(res.data.data);
                setStats(res.data.stats);
            }
        } catch (error) {
            console.error('Error fetching overdue payments:', error);
            Swal.fire('Error', 'Failed to fetch overdue payments', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchOverduePayments();
    };

    const handleSendWarning = async (registrationId, type) => {
        const result = await Swal.fire({
            title: `Send ${type === 'both' ? 'Email & WhatsApp' : type.toUpperCase()} Warning?`,
            text: 'This will send a payment reminder to the exhibitor.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            confirmButtonText: 'Yes, send it!'
        });

        if (!result.isConfirmed) return;

        try {
            const res = await api.post(`/api/payment-delay/send-warning/${registrationId}`, { type });
            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Warning Sent!',
                    html: `
                        <p>Email: ${res.data.data.emailSent ? '✅ Sent' : '❌ Failed'}</p>
                        <p>WhatsApp: ${res.data.data.whatsappSent ? '✅ Sent' : '❌ Failed'}</p>
                    `,
                    timer: 2000
                });
                fetchOverduePayments();
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to send warning', 'error');
        }
    };

    const handleSendBulkWarnings = async () => {
        const result = await Swal.fire({
            title: 'Send Bulk Warnings?',
            text: 'This will send warnings to all overdue exhibitors.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Yes, send to all!'
        });

        if (!result.isConfirmed) return;

        Swal.fire({
            title: 'Sending Warnings...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const res = await api.post('/api/payment-delay/bulk-warning', { type: 'both' });
            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Bulk Warnings Sent!',
                    html: `
                        <p>Total: ${res.data.data.total}</p>
                        <p>Emails Sent: ${res.data.data.emailSent}</p>
                        <p>WhatsApp Sent: ${res.data.data.whatsappSent}</p>
                        <p>Failed: ${res.data.data.failed}</p>
                    `
                });
                fetchOverduePayments();
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to send bulk warnings', 'error');
        }
    };

    const formatCurrency = (amount) => {
        return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
    };

    const getDaysOverdueColor = (days) => {
        if (days <= 7) return 'text-yellow-600 bg-yellow-50';
        if (days <= 14) return 'text-orange-600 bg-orange-50';
        if (days <= 30) return 'text-red-600 bg-red-50';
        return 'text-red-800 bg-red-100';
    };

    return (
        <div className="p-6">
            <PageHeader
                title="Payment Delay Warnings"
                subtitle="Track and manage overdue payments"
                icon={AlertTriangle}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Total Overdue</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.totalOverdue}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <DollarSign className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Total Amount</p>
                            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalAmount)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <DollarSign className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Total Penalty</p>
                            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalPenalty)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <button
                        onClick={handleSendBulkWarnings}
                        className="w-full h-full flex items-center justify-center gap-2 text-[#23471d] hover:bg-[#23471d] hover:text-white transition-colors rounded-lg"
                    >
                        <Send className="w-5 h-5" />
                        <span className="font-bold">Send Bulk Warnings</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    <form onSubmit={handleSearch} className="flex-1 min-w-[300px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, ID, email, phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#23471d]"
                            />
                        </div>
                    </form>
                    <select
                        value={daysFilter}
                        onChange={(e) => setDaysFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#23471d]"
                    >
                        <option value="all">All Overdue</option>
                        <option value="7">1-7 Days</option>
                        <option value="14">8-14 Days</option>
                        <option value="30">15-30 Days</option>
                        <option value="31">30+ Days</option>
                    </select>
                    <button
                        onClick={fetchOverduePayments}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Exhibitor</th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Event / Stall</th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Overdue</th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Warnings</th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : records.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                        No overdue payments found
                                    </td>
                                </tr>
                            ) : (
                                records.map((record) => (
                                    <tr key={record._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{record.exhibitorName}</p>
                                                <p className="text-xs text-gray-500">{record.registrationId}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <MailIcon className="w-3 h-3 text-gray-400" />
                                                    <span className="text-xs text-gray-500">{record.contact1?.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-3 h-3 text-gray-400" />
                                                    <span className="text-xs text-gray-500">{record.contact1?.mobile}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-gray-800">{record.event?.name || 'N/A'}</p>
                                            <p className="text-xs text-gray-500">Stall: {record.participation?.stallNo || 'N/A'}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-bold text-gray-800">{formatCurrency(record.balanceAmount)}</p>
                                            {record.penaltyAmount > 0 && (
                                                <p className="text-xs text-red-600">+ {formatCurrency(record.penaltyAmount)} penalty</p>
                                            )}
                                            <p className="text-xs text-gray-500">Total: {formatCurrency(record.totalPayable)}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getDaysOverdueColor(record.daysOverdue)}`}>
                                                <Clock className="w-3 h-3 mr-1" />
                                                {record.daysOverdue} days
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Due: {record.paymentDueDate ? new Date(record.paymentDueDate).toLocaleDateString('en-IN') : 'N/A'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-bold text-gray-800">{record.warningCount || 0}</p>
                                            {record.lastWarningSentAt && (
                                                <p className="text-xs text-gray-500">
                                                    Last: {new Date(record.lastWarningSentAt).toLocaleDateString('en-IN')}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/exhibitor-bookings/${record._id}`)}
                                                    className="p-1.5 text-gray-500 hover:text-[#23471d] hover:bg-gray-100 rounded"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleSendWarning(record._id, 'email')}
                                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Send Email"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleSendWarning(record._id, 'whatsapp')}
                                                    className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                                                    title="Send WhatsApp"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleSendWarning(record._id, 'both')}
                                                    className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                                                    title="Send Both"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {records.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {records.length} of {stats.totalOverdue} overdue payments
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1 text-sm">Page {currentPage}</span>
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={records.length < PAGE_SIZE}
                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentDelayWarnings;
