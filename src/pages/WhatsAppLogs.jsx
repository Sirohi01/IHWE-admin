import React, { useState, useEffect, useCallback } from 'react';
import { 
    MessageSquare, 
    Search, 
    Trash2, 
    Eye, 
    Calendar, 
    User, 
    CheckCircle2, 
    XCircle,
    Smartphone,
    Filter,
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    Users,
    Lock,
    Info
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../lib/api';
import Table from '../components/table/Table';

const WhatsAppLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [filterType, setFilterType] = useState('all');
    const limit = 25;

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/whatsapp-logs`, {
                params: {
                    page: currentPage,
                    limit,
                    search: searchTerm,
                    status: statusFilter,
                    type: filterType
                }
            });
            if (response.data.success) {
                setLogs(response.data.data);
                setTotal(response.data.total);
            }
        } catch (error) {
            console.error('Error fetching WhatsApp logs:', error);
            Swal.fire('Error', 'Failed to load WhatsApp logs', 'error');
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, statusFilter, filterType]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This log entry will be permanently deleted.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await api.delete(`/api/whatsapp-logs/${id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Log has been deleted.', 'success');
                    fetchLogs();
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete log', 'error');
            }
        }
    };

    const viewDetails = (log) => {
        const isAdminMsg = log.message.toUpperCase().includes('NEW CONTACT ENQUIRY');
        const isOtpMsg = log.message.toUpperCase().includes('OTP');
        
        let themeColor = '#f0f9ff'; // blue for user
        let borderColor = '#bae6fd';
        let labelColor = '#0369a1';
        let labelText = 'User Communication';

        if (isAdminMsg) {
            themeColor = '#fff7ed';
            borderColor = '#fdba74';
            labelColor = '#c2410c';
            labelText = 'Admin Notification';
        } else if (isOtpMsg) {
            themeColor = '#f5f3ff';
            borderColor = '#ddd6fe';
            labelColor = '#7c3aed';
            labelText = 'OTP Verification';
        }

        Swal.fire({
            title: '<span style="color: #23471d; font-weight: bold;">WhatsApp Message Details</span>',
            html: `
                <div style="text-align: left; font-family: sans-serif; padding: 10px;">
                    <div style="margin-bottom: 20px; padding: 15px; background: ${themeColor}; border-radius: 8px; border: 1px solid ${borderColor};">
                         <div style="font-weight: bold; color: ${labelColor}; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">
                            ${labelText}
                         </div>
                         <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div style="font-size: 15px; color: #1e293b;"><strong>Name:</strong> ${log.name || 'N/A'}</div>
                            <div style="font-size: 15px; color: #1e293b;"><strong>Mobile:</strong> ${log.recipient}</div>
                         </div>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <div style="font-weight: bold; color: #64748b; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">Message Content</div>
                        <div style="font-size: 15px; line-height: 1.6; color: #334155; max-height: 300px; overflow-y: auto; padding: 15px; background: #f1f5f9; border-radius: 8px; white-space: pre-wrap;">
                            ${log.message}
                        </div>
                    </div>

                    ${log.error ? `
                    <div style="margin-bottom: 10px; padding: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px;">
                        <div style="font-weight: bold; color: #991b1b; font-size: 12px; text-transform: uppercase; margin-bottom: 4px;">Error Details</div>
                        <div style="font-size: 13px; color: #991b1b;">${log.error}</div>
                    </div>
                    ` : ''}

                    <div style="font-size: 12px; color: #94a3b8; text-align: right; margin-top: 10px;">
                        Sent At: ${new Date(log.sentAt).toLocaleString()}
                    </div>
                </div>
            `,
            width: '600px',
            confirmButtonText: 'Done',
            confirmButtonColor: '#23471d',
            customClass: {
                popup: 'rounded-xl'
            }
        });
    };

    const columns = [
        {
            key: "sno",
            label: "S.NO",
            width: "80px",
            render: (row, index) => (
                <div className="font-bold text-gray-900">
                    {(currentPage - 1) * limit + index + 1}
                </div>
            )
        },
        {
            key: "category",
            label: "CATEGORY",
            render: (row) => {
                const isAdmin = row.message.toUpperCase().includes('NEW CONTACT ENQUIRY');
                const isOtp = row.message.toUpperCase().includes('OTP');
                
                if (isAdmin) {
                    return (
                        <div className="p-2 rounded-lg w-fit flex items-center gap-2 bg-orange-50 text-orange-600 border border-orange-100">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-tight">Admin</span>
                        </div>
                    );
                }

                if (isOtp) {
                    return (
                        <div className="p-2 rounded-lg w-fit flex items-center gap-2 bg-purple-50 text-purple-600 border border-purple-100">
                            <Lock className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-tight">OTP</span>
                        </div>
                    );
                }

                return (
                    <div className="p-2 rounded-lg w-fit flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100">
                        <Users className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">User</span>
                    </div>
                );
            }
        },
        {
            key: "contact",
            label: "RECIPIENT",
            render: (row) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#23471d]" />
                        <span className="font-semibold text-gray-900 text-sm">{row.name || 'System'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-600 font-medium">{row.recipient}</span>
                    </div>
                </div>
            )
        },
        {
            key: "message",
            label: "WHATSAPP MESSAGE",
            render: (row) => (
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm truncate max-w-[220px]">
                    <Info className="w-4 h-4 text-[#d26019]" />
                    {row.message}
                </div>
            )
        },
        {
            key: "status",
            label: "STATUS",
            render: (row) => (
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-fit uppercase ${
                    row.status === 'success' 
                    ? "bg-green-50 text-green-700 border border-green-200" 
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                    {row.status === 'success' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {row.status}
                </div>
            )
        },
        {
            key: "date",
            label: "SENT AT",
            render: (row) => (
                <div className="flex items-center gap-2 text-gray-900 text-sm font-medium">
                    <Calendar className="w-4 h-4 text-[#23471d]" />
                    {new Date(row.sentAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            )
        },
        {
            key: "actions",
            label: "ACTIONS",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => viewDetails(row)}
                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                        title="View Full Content"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleDelete(row._id)}
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                        title="Delete Log"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    const filterOptions = [
        { id: 'all', label: 'All Logs', icon: Filter },
        { id: 'admin', label: 'Admin Alerts', icon: ShieldCheck },
        { id: 'user', label: 'User Messages', icon: Users },
        { id: 'otp', label: 'OTP Verifications', icon: Lock }
    ];

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="bg-white shadow-md mt-6 p-6">
            <div className="w-full">
                <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#23471d]">WHATSAPP AUDIT LOGS</h1>
                        <p className="text-gray-600 mt-2 text-lg">Real-time Messaging Repository & Audit History</p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg border border-gray-200 w-fit">
                        {filterOptions.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => {
                                    setFilterType(opt.id);
                                    setCurrentPage(1);
                                }}
                                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                                    filterType === opt.id 
                                    ? "bg-white text-[#23471d] shadow-sm" 
                                    : "text-gray-500 hover:text-[#23471d] hover:bg-gray-200"
                                }`}
                            >
                                <opt.icon className={`w-3.5 h-3.5 ${filterType === opt.id ? (opt.id === 'otp' ? "text-purple-600" : "text-[#d26019]") : "text-gray-400"}`} />
                                <span className="uppercase tracking-wide">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-lg">
                    <div className="px-6 py-4 border-b bg-[#23471d]">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                                    <MessageSquare className="text-white w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">
                                        {filterOptions.find(o => o.id === filterType)?.label}
                                    </h2>
                                    <p className="text-sm text-green-100 mt-0.5 opacity-80">
                                        {filterType === 'all' && 'Reviewing entire transmission history'}
                                        {filterType === 'admin' && 'Viewing high-priority lead alerts'}
                                        {filterType === 'user' && 'Viewing automated delivery confirmations'}
                                        {filterType === 'otp' && 'Viewing security verification transactions'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="text"
                                        placeholder="Search logs..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full h-10 pl-10 pr-4 text-sm border-2 border-gray-100 focus:outline-none focus:border-white/50 transition-colors bg-white/10 text-white placeholder:text-white/60 shadow-inner rounded-md"
                                    />
                                </div>
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="h-10 px-4 text-sm border-2 border-gray-100 focus:outline-none bg-white/10 text-white rounded-md cursor-pointer"
                                    style={{ colorScheme: 'dark' }}
                                >
                                    <option value="" className="text-black">All Status</option>
                                    <option value="success" className="text-black">Success Only</option>
                                    <option value="failed" className="text-black">Failed Only</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white">
                        {loading && logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-10 h-10 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-slate-500 font-medium animate-pulse">Fetching audit records...</p>
                            </div>
                        ) : (
                            <div className="min-h-[400px]">
                                <Table 
                                    columns={columns} 
                                    data={logs} 
                                />
                                {logs.length === 0 && !loading && (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                        <Filter size={48} className="mb-4 opacity-20" />
                                        <p className="text-lg font-medium">No audit logs found matching your criteria</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-4 px-6 pb-6 flex items-center justify-between border-t pt-6 bg-slate-50/50">
                            <div className="text-sm text-slate-500 whitespace-nowrap">
                                Page <span className="font-bold text-[#23471d]">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-[#23471d]"
                                >
                                    <ArrowLeft size={16} />
                                </button>
                                {[...Array(totalPages)].map((_, i) => {
                                    const pageNum = i + 1;
                                    if (
                                        pageNum === 1 || 
                                        pageNum === totalPages || 
                                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                    ) {
                                        return (
                                            <button 
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-10 h-10 border rounded-lg transition-all font-bold ${
                                                    currentPage === pageNum 
                                                    ? "bg-[#23471d] text-white border-[#23471d] shadow-lg scale-110" 
                                                    : "hover:bg-white text-slate-600"
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (
                                        pageNum === currentPage - 2 || 
                                        pageNum === currentPage + 2
                                    ) {
                                        return <span key={pageNum} className="px-1 text-slate-400 font-bold">...</span>;
                                    }
                                    return null;
                                })}
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-[#23471d]"
                                >
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WhatsAppLogs;
