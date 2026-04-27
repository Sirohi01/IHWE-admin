import React, { useState, useEffect } from 'react';
import { Trash2, Eye, Edit, Search, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from "../../lib/api";
import Swal from 'sweetalert2';
import Pagination from "../../components/Pagination";

const InternationalBuyerList = () => {
    const [registrations, setRegistrations] = useState([]);
    const [filteredRegistrations, setFilteredRegistrations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
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
            const response = await api.get('/api/international-buyer');
            if (response.data.success) {
                setRegistrations(response.data.data);
                setFilteredRegistrations(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching registrations:', error);
            Swal.fire('Error', 'Failed to load registrations', 'error');
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
                (item.brandName && item.brandName.toLowerCase().includes(searchLower)) ||
                (item.registrationId && item.registrationId.toLowerCase().includes(searchLower)) ||
                (item.primaryContact?.fullName && item.primaryContact.fullName.toLowerCase().includes(searchLower)) ||
                (item.primaryContact?.emailId && item.primaryContact.emailId.toLowerCase().includes(searchLower)) ||
                (item.primaryContact?.mobileNumber && item.primaryContact.mobileNumber.toLowerCase().includes(searchLower)) ||
                (item.country && item.country.toLowerCase().includes(searchLower)) ||
                (item.countryOfRegistration && item.countryOfRegistration.toLowerCase().includes(searchLower)) ||
                (item.paymentStatus && item.paymentStatus.toLowerCase().includes(searchLower)) ||
                (item.verification?.adminApprovalStatus && item.verification.adminApprovalStatus.toLowerCase().includes(searchLower))
            );
        });
        setFilteredRegistrations(filtered);
        setCurrentPage(1);
    };

    const handleDelete = async (registration) => {
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
                const response = await api.delete(`/api/international-buyer/${registration._id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Registration has been deleted.', 'success');
                    fetchRegistrations();
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete registration', 'error');
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
        <div className="bg-white mt-6 px-4 sm:px-6 lg:px-8">
            <div className="w-full">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 uppercase flex items-center gap-3">
                            <Globe className="w-8 h-8 text-blue-600" />
                            International Buyer Registrations
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg">Manage registrations from the International Buyer Registration page</p>
                    </div>
                    <button
                        onClick={() => navigate('/international-buyer-registration')}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
                    >
                        <Globe className="w-4 h-4" />
                        Add New International Buyer
                    </button>
                </div>

                <div className="border border-gray-300 overflow-hidden rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-300 bg-gray-50">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 uppercase">International List</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Showing {filteredRegistrations.length} total international registrations
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-300">
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">S.NO</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">COMPANY / BRAND</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">REG. ID</th>
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
                                                        <div className="font-medium text-gray-900 text-sm">{row.brandName || 'N/A'}</div>
                                                        <div className="text-xs text-gray-400">{row.countryOfRegistration || row.country || ''}</div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <span className="text-xs font-mono text-gray-600">
                                                        {row.registrationId || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <div className="text-sm text-gray-800">{row.primaryContact?.fullName || 'N/A'}</div>
                                                    <div className="text-xs text-gray-400">{row.primaryContact?.designation || ''}</div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <div className="text-xs text-gray-600">{row.primaryContact?.emailId || 'N/A'}</div>
                                                    <div className="text-xs text-gray-500">{row.primaryContact?.mobileNumber || 'N/A'}</div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                        (row.verification?.adminApprovalStatus || 'Pending') === 'Approved' 
                                                        ? 'border-green-200 bg-green-50 text-green-700' 
                                                        : (row.verification?.adminApprovalStatus || 'Pending') === 'Rejected' 
                                                        ? 'border-red-200 bg-red-50 text-red-700' 
                                                        : 'border-amber-200 bg-amber-50 text-amber-700'
                                                    }`}>
                                                        {row.verification?.adminApprovalStatus || 'Pending'}
                                                    </span>
                                                    <div className="text-[10px] text-gray-400 mt-1">{row.paymentStatus || 'Pending Payment'}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200 whitespace-nowrap">
                                                    {formatDate(row.createdAt)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`/international-buyer/${row._id}`)}
                                                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/international-buyer/edit/${row._id}`)}
                                                            className="p-1 text-gray-500 hover:text-emerald-600 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
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
                                placeholder="Search by brand, name, email, phone, country..."
                                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
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

export default InternationalBuyerList;
