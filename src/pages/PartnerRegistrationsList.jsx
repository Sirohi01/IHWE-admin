import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Search, Trash2, CalendarDays, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from "../lib/api";
import Swal from 'sweetalert2';
import { showSuccess, showError } from "../utils/toastMessage";
import BaseLeadPage from "../layout/BaseLeadPage";

const toTitleCase = (str) => {
    if (!str || typeof str !== "string") return str;
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

const PartnerRegistrationsList = () => {
    const [registrations, setRegistrations] = useState([]);
    const [filteredRegistrations, setFilteredRegistrations] = useState([]);

    // Pagination & Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [totalLeads, setTotalLeads] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    const navigate = useNavigate();

    const fetchRegistrations = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/api/partner-registration');
            if (response.data.success) {
                const data = response.data.data || [];
                setRegistrations(data);
                setTotalLeads(data.length);
            }
        } catch (error) {
            console.error('Error fetching registrations:', error);
            showError('Failed to load registrations');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]);

    useEffect(() => {
        let filtered = registrations;

        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                (item.companyName && item.companyName.toLowerCase().includes(searchLower)) ||
                (item.businessCategory && item.businessCategory.toLowerCase().includes(searchLower)) ||
                (item.fullName && item.fullName.toLowerCase().includes(searchLower)) ||
                (item.email && item.email.toLowerCase().includes(searchLower)) ||
                (item.registrationId && item.registrationId.toLowerCase().includes(searchLower))
            );
        }

        if (filterStatus) {
            filtered = filtered.filter(item => (item.status || "Pending") === filterStatus);
        }

        setFilteredRegistrations(filtered);
        setTotalLeads(filtered.length);
        setPage(1); // Reset page on filter
    }, [searchTerm, filterStatus, registrations]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            setUpdatingStatusId(id);
            const response = await api.patch(`/api/partner-registration/${id}/status`, { status: newStatus });
            if (response.data.success) {
                showSuccess("Status updated successfully");
                fetchRegistrations();
            }
        } catch (error) {
            console.error("Error updating status:", error);
            showError("Failed to update status");
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const handleDelete = async (id) => {
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
                const response = await api.delete(`/api/partner-registration/${id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Registration has been deleted.', 'success');
                    fetchRegistrations();
                }
            } catch (error) {
                console.error("Error deleting registration:", error);
                showError('Failed to delete registration');
            }
        }
    };

    const startIndex = (page - 1) * limit;
    const paginatedRegistrations = filteredRegistrations.slice(startIndex, startIndex + limit);

    const isAllSelected = paginatedRegistrations.length > 0 && selectedIds.length === paginatedRegistrations.length;

    const onSelectAll = (e) => {
        if (e.target.checked) setSelectedIds(paginatedRegistrations.map(r => r._id));
        else setSelectedIds([]);
    };

    const onSelectRow = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    // Derived Stats
    const totalCount = registrations.length;
    const pendingCount = registrations.filter(r => (r.status || 'Pending') === 'Pending').length;
    const acceptedCount = registrations.filter(r => r.status === 'Accepted').length;
    const rejectedCount = registrations.filter(r => r.status === 'Rejected').length;
    const reviewedCount = registrations.filter(r => r.status === 'Reviewed').length;

    // --- BaseLeadPage Props ---

    const statCards = (
        <>
            <div className="bg-white rounded-lg border border-slate-200 p-3 flex flex-col justify-between shadow-sm">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Total</div>
                <div className="text-xl font-black text-slate-800 mt-1">{totalCount}</div>
            </div>
            <div className="bg-white rounded-lg border border-emerald-200 p-3 flex flex-col justify-between shadow-sm">
                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-wide">Accepted</div>
                <div className="text-xl font-black text-emerald-700 mt-1">{acceptedCount}</div>
            </div>
            <div className="bg-white rounded-lg border border-amber-200 p-3 flex flex-col justify-between shadow-sm">
                <div className="text-[10px] font-black text-amber-600 uppercase tracking-wide">Pending</div>
                <div className="text-xl font-black text-amber-700 mt-1">{pendingCount}</div>
            </div>
            <div className="bg-white rounded-lg border border-blue-200 p-3 flex flex-col justify-between shadow-sm">
                <div className="text-[10px] font-black text-blue-600 uppercase tracking-wide">Reviewed</div>
                <div className="text-xl font-black text-blue-700 mt-1">{reviewedCount}</div>
            </div>
            <div className="bg-white rounded-lg border border-red-200 p-3 flex flex-col justify-between shadow-sm">
                <div className="text-[10px] font-black text-red-600 uppercase tracking-wide">Rejected</div>
                <div className="text-xl font-black text-red-700 mt-1">{rejectedCount}</div>
            </div>
        </>
    );

    const filters = (
        <>
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                <input
                    type="text"
                    placeholder="Search partner registrations..."
                    className="pl-8 pr-3 py-1.5 border border-slate-300 rounded text-[11px] w-52 focus:outline-none focus:border-blue-500 font-medium bg-slate-50 focus:bg-white transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <select
                className="pl-2 pr-6 py-1.5 border border-slate-300 rounded text-[11px] focus:outline-none focus:border-blue-500 font-bold text-slate-600 bg-slate-50 cursor-pointer appearance-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
            >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
            </select>
        </>
    );

    const tableHeaders = (
        <>
            <th className="px-2 py-3 text-left font-medium">Company Details</th>
            <th className="px-2 py-3 text-center font-medium">Reg ID</th>
            <th className="px-2 py-3 text-left font-medium">Contact Person</th>
            <th className="px-2 py-3 text-left font-medium">Location</th>
            <th className="px-2 py-3 text-left font-medium">Services</th>
            <th className="px-2 py-3 text-center font-medium">Status</th>
            <th className="px-2 py-3 text-center font-medium">Date</th>
            <th className="px-2 py-3 text-right font-medium">Actions</th>
        </>
    );

    const tableBody = (
        <>
            {isLoading ? (
                [...Array(10)].map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse border-b border-slate-100 bg-white">
                        <td className="px-2 py-3 text-center"><div className="w-3 h-3 bg-slate-200 rounded-sm mx-auto"></div></td>
                        <td className="px-2 py-3"><div className="h-3 w-32 bg-slate-200 rounded mb-1.5"></div><div className="h-2 w-24 bg-slate-100 rounded"></div></td>
                        <td className="px-2 py-3 text-center"><div className="h-3 w-20 bg-slate-200 rounded mx-auto"></div></td>
                        <td className="px-2 py-3"><div className="h-3 w-24 bg-slate-200 rounded mb-1.5"></div><div className="h-2 w-20 bg-slate-100 rounded"></div></td>
                        <td className="px-2 py-3"><div className="h-3 w-16 bg-slate-200 rounded mb-1.5"></div><div className="h-2 w-12 bg-slate-100 rounded"></div></td>
                        <td className="px-2 py-3"><div className="h-3 w-24 bg-slate-200 rounded"></div></td>
                        <td className="px-2 py-3 text-center"><div className="h-4 w-16 bg-slate-200 rounded-full mx-auto"></div></td>
                        <td className="px-2 py-3 text-center"><div className="h-3 w-16 bg-slate-200 rounded mx-auto mb-1.5"></div><div className="h-2 w-12 bg-slate-100 rounded mx-auto"></div></td>
                        <td className="px-2 py-3 text-right"><div className="h-4 w-12 bg-slate-200 rounded ml-auto"></div></td>
                    </tr>
                ))
            ) : paginatedRegistrations.length === 0 ? (
                <tr>
                    <td colSpan="9" className="px-2 py-8 text-center text-slate-500 font-medium italic bg-slate-50">
                        {searchTerm ? 'No matching registrations found' : 'No registrations found'}
                    </td>
                </tr>
            ) : paginatedRegistrations.map((row, i) => {
                const isSelected = selectedIds.includes(row._id);
                return (
                    <tr key={row._id || i} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-emerald-50/30' : ''} border-b border-slate-200`}>
                        <td className="px-2 py-2 text-center">
                            <input
                                type="checkbox"
                                className="w-3 h-3 accent-emerald-500 cursor-pointer rounded-sm"
                                checked={isSelected}
                                onChange={() => onSelectRow(row._id)}
                            />
                        </td>
                        <td className="px-2 py-2 text-left">
                            <Link to={`/partner-registrations/${row._id}`} className="font-bold text-[11px] text-blue-600 hover:text-blue-800 hover:underline">
                                {toTitleCase(row.companyName) || 'N/A'}
                            </Link>
                            <div className="text-[9px] font-black uppercase" style={{ color: '#d26019' }}>{row.businessCategory}</div>
                        </td>
                        <td className="px-2 py-2 text-center">
                            <span className="font-bold text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {row.registrationId || 'N/A'}
                            </span>
                        </td>
                        <td className="px-2 py-2 text-left">
                            <div className="font-bold text-[10px] text-slate-800">{toTitleCase(row.fullName)}</div>
                            <div className="text-[9px] text-slate-500 font-medium">{row.email} | {row.mobile}</div>
                        </td>
                        <td className="px-2 py-2 text-left">
                            <div className="font-bold text-[10px] text-slate-800">{row.city || '-'}</div>
                            <div className="text-[9px] text-slate-500 font-medium">{row.state || '-'}</div>
                        </td>
                        <td className="px-2 py-2 text-left">
                            <div className="text-[10px] text-slate-800 line-clamp-2 max-w-[150px]" title={row.selectedServices?.join(', ')}>{row.selectedServices?.join(', ') || '-'}</div>
                        </td>
                        <td className="px-2 py-2 text-center">
                            <div className="relative inline-block w-full max-w-[90px] mx-auto">
                                <select
                                    value={row.status || "Pending"}
                                    onChange={(e) => handleStatusChange(row._id, e.target.value)}
                                    disabled={updatingStatusId === row._id}
                                    className={`w-full px-2 py-1 text-[9px] font-black rounded border border-transparent cursor-pointer disabled:opacity-50 appearance-none uppercase tracking-wide focus:outline-none ${(row.status || "Pending") === "Accepted"
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : (row.status || "Pending") === "Rejected"
                                                ? "bg-red-50 text-red-700 border-red-200"
                                                : (row.status || "Pending") === "Reviewed"
                                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                        }`}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Reviewed">Reviewed</option>
                                    <option value="Accepted">Accepted</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                                {updatingStatusId === row._id && (
                                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <div className="w-2.5 h-2.5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                        </td>
                        <td className="px-2 py-2 text-center">
                            <div className="flex flex-col items-center justify-center gap-0.5">
                                {row.createdAt ? (() => {
                                    const d = new Date(row.createdAt);
                                    const date = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).format(d);
                                    const time = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).format(d);
                                    return (
                                        <>
                                            <div className="flex items-center gap-1">
                                                <CalendarDays className="text-slate-400" size={10} />
                                                <span className="text-[10px] font-bold text-slate-800">{date}</span>
                                            </div>
                                            <span className="text-[9px] text-slate-500 font-medium">{time}</span>
                                        </>
                                    );
                                })() : "-"}
                            </div>
                        </td>
                        <td className="px-2 py-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                                <button
                                    onClick={() => navigate(`/partner-registrations/${row._id}`)}
                                    className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                    title="View Details"
                                >
                                    <Eye size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(row._id)}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </td>
                    </tr>
                );
            })}
        </>
    );

    const totalPages = Math.ceil(totalLeads / limit) || 1;
    const paginationBar = (
        <>
            <div className="flex items-center gap-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span className="text-[11px] font-bold text-slate-600">Showing</span>
                <span className="text-[11px] font-black px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700">
                    {totalLeads === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + limit, totalLeads)}
                </span>
                <span className="text-[11px] font-bold text-slate-600">of</span>
                <span className="text-[11px] font-black text-slate-800">{totalLeads}</span>
                <span className="text-[11px] font-bold text-slate-600">registrations</span>
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400"
                >
                    &laquo;
                </button>
                <div className="w-6 h-6 flex items-center justify-center bg-[#016B61] text-white text-[10px] font-bold rounded-sm">
                    {page}
                </div>
                <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || totalLeads === 0}
                    className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400"
                >
                    &raquo;
                </button>
            </div>

            <div className="flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span className="text-[11px] font-bold text-slate-600">Rows:</span>
                <select
                    className="border border-slate-300 rounded text-[11px] font-bold px-1.5 py-0.5 outline-none cursor-pointer text-slate-700 bg-white"
                    value={limit}
                    onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>
        </>
    );

    return (
        <BaseLeadPage
            title="Partner Registrations"
            subtitle="View and manage service partner sign-ups"
            badgeCount={<span className="text-emerald-700">{totalLeads}</span>}
            cardsInRow={5}
            statCards={statCards}
            filterBar={filters}
            tableHeaders={tableHeaders}
            tableBody={tableBody}
            pagination={paginationBar}
            isAllSelected={isAllSelected}
            onSelectAll={onSelectAll}
            onReset={() => {
                setSearchTerm('');
                setFilterStatus('');
                setPage(1);
                setSelectedIds([]);
            }}
        />
    );
};

export default PartnerRegistrationsList;
