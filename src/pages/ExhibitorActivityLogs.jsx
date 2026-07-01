import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { Search, Filter, Eye, Download, Calendar } from 'lucide-react';
import api from '../lib/api';

const ExhibitorActivityLogs = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEntries, setTotalEntries] = useState(0);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/api/exhibitor-activity-logs?page=${page}&limit=10`);
                if (res.data.success) {
                    setLogs(res.data.data);
                    setTotalPages(res.data.totalPages);
                    setTotalEntries(res.data.total);
                }
            } catch (error) {
                console.error('Failed to fetch exhibitor activity logs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [page]);

    const getStatusColor = (status) => {
        switch(status) {
            case 'Success': return 'bg-green-100 text-green-700 border-green-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Failed': return 'bg-red-100 text-red-700 border-red-200';
            case 'Info': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return {
            date: d.toLocaleDateString('en-GB'),
            time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const handlePrev = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNext = () => {
        if (page < totalPages) setPage(page + 1);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <PageHeader 
                title="Exhibitor Activity Logs" 
                subtitle="Track and monitor all exhibitor activities like login, tab switching, payments, and profile updates."
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-gray-400" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search activities by company, action, or module..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#23471d] focus:border-transparent transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center">
                            <Calendar size={16} />
                            Date Range
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center">
                            <Filter size={16} />
                            Filter
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#23471d] text-white rounded-lg text-sm font-medium hover:bg-[#1a3515] transition-colors w-full sm:w-auto justify-center">
                            <Download size={16} />
                            Export
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Company Name</th>
                                <th className="px-6 py-4">Module</th>
                                <th className="px-6 py-4">Action Details</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-6 text-gray-500">Loading...</td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-6 text-gray-500">No logs found</td>
                                </tr>
                            ) : (
                                logs.filter(l => 
                                    (l.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    (l.action || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    (l.module || '').toLowerCase().includes(searchTerm.toLowerCase())
                                ).map((log) => {
                                    const { date, time } = formatDate(log.createdAt);
                                    return (
                                        <tr key={log._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{date}</div>
                                                <div className="text-xs text-gray-500">{time}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-[#23471d]">{log.companyName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded text-xs font-semibold">
                                                    {log.module}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-800 font-medium">{log.action}</p>
                                                {log.details && <p className="text-xs text-gray-500 mt-1">{log.details}</p>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded border text-xs font-bold ${getStatusColor(log.status)}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalEntries > 0 && (
                    <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                        <span className="text-sm text-gray-600">Showing <span className="font-bold">{(page - 1) * 10 + 1}</span> to <span className="font-bold">{Math.min(page * 10, totalEntries)}</span> of <span className="font-bold">{totalEntries}</span> entries</span>
                        <div className="flex gap-1">
                            <button 
                                onClick={handlePrev} 
                                disabled={page === 1}
                                className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <button className="px-3 py-1 border border-[#23471d] rounded text-sm font-bold text-white bg-[#23471d]">{page}</button>
                            <button 
                                onClick={handleNext} 
                                disabled={page === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50"
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

export default ExhibitorActivityLogs;
