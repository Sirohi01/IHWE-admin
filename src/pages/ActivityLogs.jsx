import React, { useState, useEffect, useCallback } from 'react';
import { 
    Activity, Search, Calendar, User, 
    Layers, Info, RefreshCw,
    PlusCircle, Edit3, Trash2, LogIn
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../lib/api';
import Pagination from '../components/Pagination';
import Table from '../components/table/Table';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState('all');
    const limit = 10;

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/activity-logs`, {
                params: { 
                    page: currentPage, 
                    limit, 
                    search: searchTerm,
                    module: moduleFilter === 'all' ? '' : moduleFilter
                }
            });
            if (response.data.success) {
                setLogs(response.data.data);
                setTotal(response.data.total);
            }
        } catch (error) {
            console.error('Error fetching activity logs:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load activity logs',
                confirmButtonColor: '#1e3a8a'
            });
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, moduleFilter]);

    useEffect(() => {
        const timer = setTimeout(() => fetchLogs(), 300);
        return () => clearTimeout(timer);
    }, [fetchLogs]);

    const getActionBadge = (action) => {
        switch (action) {
            case 'Created':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-green-50 text-green-700 border border-green-200">
                        <PlusCircle size={12} /> {action}
                    </span>
                );
            case 'Updated':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                        <Edit3 size={12} /> {action}
                    </span>
                );
            case 'Deleted':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-50 text-red-700 border border-red-200">
                        <Trash2 size={12} /> {action}
                    </span>
                );
            case 'Logged In':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                        <LogIn size={12} /> {action}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-50 text-gray-700 border border-gray-200">
                        {action}
                    </span>
                );
        }
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#1e3a8a]">MANAGE ACTIVITY LOGS</h1>
                <p className="text-gray-600 mt-2 text-lg">Detailed audit trail of all administrative actions and system changes</p>
            </div>

            <div className="w-full">
                {/* Search & Refresh Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search by user or details..." 
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full h-11 pl-10 pr-4 text-sm border-2 border-gray-200 focus:outline-none focus:border-[#1e3a8a] transition-all bg-white"
                            />
                        </div>
                        <button 
                            onClick={fetchLogs}
                            className="p-3 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg border-2 border-gray-200 transition-colors"
                            title="Refresh Logs"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider mr-2">Filter Module:</span>
                        <select 
                            value={moduleFilter} 
                            onChange={(e) => { setModuleFilter(e.target.value); setCurrentPage(1); }}
                            className="h-11 px-4 text-sm border-2 border-gray-300 focus:outline-none focus:border-[#1e3a8a] bg-white text-gray-700 font-semibold cursor-pointer"
                        >
                            <option value="all">ALL SECTIONS</option>
                            <optgroup label="── HOME ──">
                            <option value="Home Slider">HOME SLIDER</option>
                            <option value="Event Highlights">EVENT HIGHLIGHTS</option>
                            <option value="Marquee Text">MARQUEE TEXT</option>
                            <option value="Counters">COUNTERS</option>
                            <option value="Featured Services">FEATURED SERVICES</option>
                            <option value="Global Platform">GLOBAL PLATFORM</option>
                            <option value="Our Clients">OUR CLIENTS</option>
                            <option value="Testimonials">TESTIMONIALS</option>
                            </optgroup>
                            <optgroup label="── ABOUT ──">
                            <option value="About Us">ABOUT US</option>
                            <option value="Who We Are">WHO WE ARE</option>
                            <option value="Vision & Mission">VISION &amp; MISSION</option>
                            <option value="Why Attend">WHY ATTEND</option>
                            <option value="Target Audience">TARGET AUDIENCE</option>
                            <option value="Organized By">ORGANIZED BY</option>
                            </optgroup>
                            <optgroup label="── EXHIBIT ──">
                            <option value="Why Exhibit">WHY EXHIBIT</option>
                            <option value="Exhibitor Profile">EXHIBITOR PROFILE</option>
                            <option value="E-Promotion Management">E-PROMOTION MGMT</option>
                            <option value="Stall Vendor">STALL VENDOR</option>
                            <option value="Exhibitor List">EXHIBITOR LIST</option>
                            </optgroup>
                            <optgroup label="── VISIT ──">
                            <option value="Why Visit">WHY VISIT</option>
                            <option value="Travel & Accommodation">TRAVEL &amp; ACCOM.</option>
                            <option value="Visitor Registrations">VISITOR REGISTRATIONS</option>
                            <option value="Visitor Reviews">VISITOR REVIEWS</option>
                            </optgroup>
                            <optgroup label="── REGISTRATION ──">
                            <option value="Book A Stand">BOOK A STAND</option>
                            <option value="Buyer Registration">BUYER REGISTRATION</option>
                            <option value="Speaker Nomination">SPEAKER NOMINATION</option>
                            <option value="Contact Enquiries">CONTACT ENQUIRIES</option>
                            </optgroup>
                            <optgroup label="── STALLS & EVENTS ──">
                            <option value="Stalls">STALLS</option>
                            <option value="Stall Rates">STALL RATES</option>
                            <option value="Event Schedule">EVENT SCHEDULE</option>
                            <option value="Glimpse Management">GLIMPSE</option>
                            </optgroup>
                            <optgroup label="── PARTNERS & ADVISORY ──">
                            <option value="Partners">PARTNERS</option>
                            <option value="Advisory Board">ADVISORY BOARD</option>
                            </optgroup>
                            <optgroup label="── CONTENT ──">
                            <option value="Blogs">BLOGS</option>
                            <option value="FAQ Management">FAQ</option>
                            <option value="Gallery">GALLERY</option>
                            <option value="Portfolio Gallery">PORTFOLIO GALLERY</option>
                            <option value="Hero Background">HERO BACKGROUND</option>
                            <option value="Terms & Conditions">TERMS &amp; CONDITIONS</option>
                            <option value="Social Media">SOCIAL MEDIA</option>
                            <option value="SEO Settings">SEO SETTINGS</option>
                            <option value="SEO">SEO META</option>
                            </optgroup>
                            <optgroup label="── HR ──">
                            <option value="Vacancies">VACANCIES</option>
                            <option value="Career Applications">CAREER APPLICATIONS</option>
                            </optgroup>
                            <optgroup label="── SYSTEM ──">
                            <option value="Email Logs">EMAIL LOGS</option>
                            <option value="WhatsApp Logs">WHATSAPP LOGS</option>
                            <option value="Admin Management">ADMIN USERS</option>
                            <option value="Auth">AUTHENTICATION</option>
                            </optgroup>
                        </select>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white overflow-hidden shadow-lg">
                    {/* Dark Table Header Bar */}
                    <div className="bg-[#1e3a8a] px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Activity className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-lg uppercase tracking-wider">System Audit Trail</h2>
                                <p className="text-blue-100 text-xs font-medium opacity-80">
                                    Showing {logs.length} of {total} operations tracked
                                </p>
                            </div>
                        </div>
                        <div className="text-white/80 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-sm border border-white/20 uppercase tracking-tighter">
                            Total Records: {total}
                        </div>
                    </div>

                    {/* Table Implementation */}
                    {loading && logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-12 h-12 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Restoring audit history...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-gray-300">
                            <Info size={64} className="mb-4 opacity-10" />
                            <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest leading-loose">No Activity Logged</h3>
                            <p className="text-gray-400 italic font-medium">Verify after performing administrative actions</p>
                        </div>
                    ) : (
                        <div className="bg-white">
                            <Table 
                                columns={[
                                    {
                                        key: "index",
                                        label: "No.",
                                        width: "60px",
                                        render: (_, i) => (
                                            <span className="font-bold text-[#1e3a8a]">
                                                {(currentPage - 1) * limit + i + 1}
                                            </span>
                                        )
                                    },
                                    {
                                        key: "user",
                                        label: "Admin User",
                                        render: (row) => (
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-sm bg-red-50 flex items-center justify-center border border-red-100">
                                                    <User className="w-3.5 h-3.5 text-red-500" />
                                                </div>
                                                <span className="font-medium text-red-600 text-sm underline decoration-red-200 underline-offset-4">
                                                    {row.user}
                                                </span>
                                            </div>
                                        )
                                    },
                                    {
                                        key: "action",
                                        label: "Action Type",
                                        render: (row) => getActionBadge(row.action)
                                    },
                                    {
                                        key: "module",
                                        label: "Section / Module",
                                        headerClassName: "text-center",
                                        className: "text-center",
                                        render: (row) => (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded text-gray-700">
                                                <Layers className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="font-bold uppercase tracking-tight text-[11px]">
                                                    {row.module}
                                                </span>
                                            </div>
                                        )
                                    },
                                    {
                                        key: "details",
                                        label: "Log Details",
                                        render: (row) => (
                                            <div className="text-gray-900 font-medium text-xs leading-relaxed max-w-md truncate">
                                                {row.details}
                                            </div>
                                        )
                                    },
                                    {
                                        key: "createdAt",
                                        label: "Execution Time",
                                        render: (row) => (
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 text-gray-900 font-bold text-[11px] uppercase">
                                                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                                    {new Date(row.createdAt).toLocaleDateString('en-GB', { 
                                                        day: '2-digit', 
                                                        month: 'short', 
                                                        year: 'numeric' 
                                                    })}
                                                </div>
                                                <span className="text-[10px] text-gray-500 font-bold ml-6 uppercase">
                                                    {new Date(row.createdAt).toLocaleTimeString('en-GB', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit', 
                                                        hour12: true 
                                                    })}
                                                </span>
                                            </div>
                                        )
                                    }
                                ]}
                                data={logs}
                            />
                        </div>
                    )}

                    {/* Standardized Pagination */}
                    <div className="px-6 py-4 border-t bg-gray-50">
                        <Pagination 
                            currentPage={currentPage}
                            totalItems={total}
                            itemsPerPage={limit}
                            onPageChange={setCurrentPage}
                            label="activity records"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityLogs;
