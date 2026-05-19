import React, { useState, useEffect } from 'react';
import { Trash2, Eye, Search, Handshake } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from "../lib/api";
import Swal from 'sweetalert2';
import Pagination from "../components/Pagination";
import { showSuccess, showError } from "../utils/toastMessage";

const toTitleCase = (str) => {
    if (!str || typeof str !== "string") return str;
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

const PartnerRegistrationsList = () => {
    const [registrations, setRegistrations] = useState([]);
    const [filteredRegistrations, setFilteredRegistrations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);
    const navigate = useNavigate();
    const itemsPerPage = 25;

    useEffect(() => {
        fetchRegistrations();
    }, []);

    useEffect(() => {
        filterRegistrations();
    }, [searchTerm, registrations]);

    const fetchRegistrations = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/api/partner-registration');
            if (response.data.success) {
                setRegistrations(response.data.data);
                setFilteredRegistrations(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching registrations:', error);
            showError('Failed to load registrations');
        } finally {
            setIsLoading(false);
        }
    };

    const filterRegistrations = () => {
        if (!searchTerm.trim()) {
            setFilteredRegistrations(registrations);
            return;
        }

        const searchLower = searchTerm.toLowerCase();
        const filtered = registrations.filter(item => {
            return (
                (item.companyName && item.companyName.toLowerCase().includes(searchLower)) ||
                (item.businessCategory && item.businessCategory.toLowerCase().includes(searchLower)) ||
                (item.fullName && item.fullName.toLowerCase().includes(searchLower)) ||
                (item.email && item.email.toLowerCase().includes(searchLower)) ||
                (item.mobile && item.mobile.toLowerCase().includes(searchLower)) ||
                (item.status && item.status.toLowerCase().includes(searchLower)) ||
                (item.registrationId && item.registrationId.toLowerCase().includes(searchLower))
            );
        });
        setFilteredRegistrations(filtered);
        setCurrentPage(1);
    };

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

    const handleDelete = async (row) => {
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
                const response = await api.delete(`/api/partner-registration/${row._id}`);
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

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRegistrations = filteredRegistrations.slice(startIndex, startIndex + itemsPerPage);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="bg-white mt-6">
            <div className="w-full">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 uppercase">Service Partner Registrations</h1>
                        <p className="text-gray-500 mt-2 text-lg">Manage all service partner registrations for IHWE 2026</p>
                    </div>
                </div>

                <div className="border border-gray-300 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-300 bg-white flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 uppercase">Registration List</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Showing {filteredRegistrations.length} total registrations
                            </p>
                        </div>
                        <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
                            {filteredRegistrations.length} Total
                        </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-white border-b border-gray-300">
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">S.NO</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">COMPANY DETAILS</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">REG ID</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">CONTACT PERSON</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">CONTACT INFO</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">STATUS</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">DATE</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedRegistrations.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-12 text-gray-500 border-b border-gray-300">
                                                {searchTerm ? 'No matching registrations found' : 'No registrations found'}
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedRegistrations.map((row, index) => (
                                            <tr key={row._id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                                                    {startIndex + index + 1}
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <div>
                                                        <Link
                                                            to={`/partner-registrations/${row._id}`}
                                                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-sm"
                                                        >
                                                            {toTitleCase(row.companyName) || 'N/A'}
                                                        </Link>
                                                        <div className="text-xs text-[#d26019] font-bold uppercase">{row.businessCategory}</div>
                                                        {row.website && (
                                                            <a
                                                                href={row.website.startsWith("http") ? row.website : `https://${row.website}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-blue-500 hover:underline text-[10px]"
                                                            >
                                                                {row.website}
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <span className="font-bold text-slate-800 text-[13px]">
                                                        {row.registrationId || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <div className="text-sm text-gray-800">{toTitleCase(row.fullName) || 'N/A'}</div>
                                                    <div className="text-xs text-gray-400">{row.designation || ''}</div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <div className="text-xs text-gray-600">{row.email || 'N/A'}</div>
                                                    <div className="text-xs text-gray-550">Mob: {row.mobile || 'N/A'}</div>
                                                    {row.whatsapp && <div className="text-[10px] text-green-600 font-medium">WA: {row.whatsapp}</div>}
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <div className="relative inline-block">
                                                        <select
                                                            value={row.status || "Pending"}
                                                            onChange={(e) => handleStatusChange(row._id, e.target.value)}
                                                            disabled={updatingStatusId === row._id}
                                                            className={`px-3 py-1 text-[10px] font-bold rounded-full border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pr-8 uppercase tracking-wider ${
                                                                (row.status || "Pending") === "Accepted"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : (row.status || "Pending") === "Rejected"
                                                                    ? "bg-red-100 text-red-800"
                                                                    : (row.status || "Pending") === "Reviewed"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : "bg-yellow-100 text-yellow-800"
                                                            }`}
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="Reviewed">Reviewed</option>
                                                            <option value="Accepted">Accepted</option>
                                                            <option value="Rejected">Rejected</option>
                                                        </select>
                                                        {updatingStatusId === row._id && (
                                                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                                <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200 whitespace-nowrap">
                                                    {formatDate(row.createdAt)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`/partner-registrations/${row._id}`)}
                                                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(row)}
                                                            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="px-4 py-4 bg-white border-t border-gray-300">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by company, name, email, phone, category, status..."
                                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 ease-in-out"
                                style={{
                                    transition: 'all 0.2s ease-in-out'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#3B82F6';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#D1D5DB';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    <span className="text-sm">✕</span>
                                </button>
                            )}
                        </div>
                        {searchTerm && (
                            <div className="mt-2 text-xs text-gray-500">
                                Found {filteredRegistrations.length} result(s) for "{searchTerm}"
                            </div>
                        )}
                    </div>

                    <div className="mt-4 px-4 pb-4 bg-white border-t border-gray-300 pt-4">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredRegistrations.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            label="registrations"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerRegistrationsList;
