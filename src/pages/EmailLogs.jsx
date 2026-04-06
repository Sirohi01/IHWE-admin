import React, { useState, useEffect } from 'react';
import { Search, Trash2, Mail, Calendar, Info, CheckCircle2, XCircle, Eye, Phone, User, Filter, ShieldCheck, Users, Lock } from 'lucide-react';
import api from "../lib/api";
import Swal from 'sweetalert2';
import Table from '../components/table/Table';
import Pagination from "../components/Pagination";

const EmailLogs = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const itemsPerPage = 25;

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchLogs();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [currentPage, filterType, searchTerm]);

    const fetchLogs = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/api/email-logs`, {
                params: {
                    page: currentPage,
                    limit: itemsPerPage,
                    type: filterType,
                    search: searchTerm
                }
            });
            if (response.data.success) {
                setLogs(response.data.data);
                setTotalLogs(response.data.total);
            }
        } catch (error) {
            console.error('Error fetching email logs:', error);
            Swal.fire('Error', 'Failed to load email logs', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleView = (log) => {
        const isAdminEmail = log.subject.toLowerCase().includes('contact enquiry');
        const isOtpEmail = log.subject.toLowerCase().includes('otp') || log.subject.toLowerCase().includes('verification');
        
        let themeColor = '#f0f9ff'; // blue for user
        let borderColor = '#bae6fd';
        let labelColor = '#0369a1';
        let labelText = 'User Confirmation';

        if (isAdminEmail) {
            themeColor = '#fff7ed';
            borderColor = '#fdba74';
            labelColor = '#c2410c';
            labelText = 'Admin Notification';
        } else if (isOtpEmail) {
            themeColor = '#f5f3ff';
            borderColor = '#ddd6fe';
            labelColor = '#7c3aed';
            labelText = 'OTP Verification';
        }

        Swal.fire({
            title: `<div style="color: #23471d; font-size: 24px;">Email Log Details</div>`,
            html: `
                <div style="text-align: left; font-family: sans-serif; padding: 10px;">
                    <div style="margin-bottom: 20px; padding: 15px; background: ${themeColor}; border-radius: 8px; border: 1px solid ${borderColor};">
                         <div style="font-weight: bold; color: ${labelColor}; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">
                            ${labelText}
                         </div>
                         <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div style="font-size: 15px; color: #1e293b;"><strong>Name:</strong> ${log.name || 'N/A'}</div>
                            <div style="font-size: 15px; color: #1e293b;"><strong>Recipient:</strong> ${log.recipient}</div>
                            <div style="font-size: 15px; color: #1e293b;"><strong>Phone:</strong> ${log.phone || 'N/A'}</div>
                         </div>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <div style="font-weight: bold; color: #64748b; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">Email Subject</div>
                        <div style="font-size: 15px; color: #1e293b; background: #f8fafc; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0; font-weight: bold;">
                            ${log.subject}
                        </div>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <div style="font-weight: bold; color: #64748b; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">Form Message</div>
                        <div style="font-size: 15px; line-height: 1.6; color: #334155; max-height: 200px; overflow-y: auto; padding: 15px; background: #f1f5f9; border-radius: 8px; white-space: pre-wrap;">
                            ${log.message || 'No message content recorded.'}
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                        <div style="font-size: 12px; color: #94a3b8;">Sent At: ${new Date(log.sentAt).toLocaleString()}</div>
                        <div style="font-size: 12px; font-weight: bold; color: ${log.status === 'success' ? '#166534' : '#991b1b'}; text-transform: uppercase;">
                            ${log.status}
                        </div>
                    </div>
                </div>
            `,
            width: '600px',
            confirmButtonText: 'Close',
            confirmButtonColor: '#23471d',
            showCloseButton: true
        });
    };

    const handleDelete = async (log) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await api.delete(`/api/email-logs/${log._id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Log entry has been deleted.', 'success');
                    fetchLogs();
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete log', 'error');
            }
        }
    };

    const columns = [
        {
            key: "sno",
            label: "S.NO",
            width: "80px",
            render: (_, index) => (
                <div className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + index + 1}</div>
            )
        },
        {
            key: "type",
            label: "CATEGORY",
            render: (row) => {
                const isAdmin = row.subject.toLowerCase().includes('contact enquiry');
                const isOtp = row.subject.toLowerCase().includes('otp') || row.subject.toLowerCase().includes('verification');
                
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
            label: "CONTACT INFO",
            render: (row) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#23471d]" />
                        <span className="font-semibold text-gray-900 text-sm">{row.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-600 font-medium">{row.recipient}</span>
                    </div>
                    {row.phone && (
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-gray-600 font-medium">{row.phone}</span>
                        </div>
                    )}
                </div>
            )
        },
        {
            key: "subject",
            label: "EMAIL SUBJECT",
            render: (row) => (
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm truncate max-w-[220px]">
                    <Info className="w-4 h-4 text-[#d26019]" />
                    {row.subject}
                </div>
            )
        },
        {
            key: "message",
            label: "MESSAGE",
            render: (row) => (
                <div className="max-w-[220px] text-sm font-normal line-clamp-2 text-gray-500">
                    {row.message || 'No message content'}
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
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleView(row)}
                        className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
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
        { id: 'admin', label: 'Admin Notifications', icon: ShieldCheck },
        { id: 'user', label: 'User Emails', icon: Users }
    ];

    return (
        <div className="bg-white shadow-md mt-6 p-6">
            <div className="w-full">
                <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#23471d]">EMAIL AUDIT LOGS</h1>
                        <p className="text-gray-600 mt-2 text-lg">System Communication Repository & Audit Logs</p>
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
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    {filterOptions.find(o => o.id === filterType)?.label}
                                </h2>
                                <p className="text-sm text-blue-100 mt-0.5">
                                    {filterType === 'all' && 'Reviewing entire transmission history'}
                                    {filterType === 'admin' && 'Viewing high-priority lead notifications'}
                                    {filterType === 'user' && 'Viewing automated delivery confirmations'}
                                </p>
                            </div>

                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search logs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-11 pl-11 pr-4 text-sm rounded-xl border-none focus:ring-2 focus:ring-[#d26019] transition-all bg-white/95 shadow-inner placeholder:text-slate-400 font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-4">
                                <div className="w-10 h-10 border-[3px] border-[#23471d]/20 border-t-[#d26019] rounded-full animate-spin"></div>
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Syncing Logs...</span>
                            </div>
                        ) : (
                            <Table
                                columns={columns}
                                data={logs}
                                wrapperClassName="border-none shadow-none rounded-none"
                            />
                        )}
                    </div>

                    <div className="px-6 py-5 bg-slate-50 border-t border-slate-100">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={totalLogs}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            label="logs"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailLogs;
