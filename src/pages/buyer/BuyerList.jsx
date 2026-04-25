import React, { useState, useEffect } from 'react';
import { Trash2, Eye, Edit, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from "../../lib/api";
import Swal from 'sweetalert2';
import Pagination from "../../components/Pagination";

const BuyerList = () => {
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
            const response = await api.get('/api/buyer-registration');
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
                (item.companyName && item.companyName.toLowerCase().includes(searchLower)) ||
                (item.buyerTag && item.buyerTag.toLowerCase().includes(searchLower)) ||
                (item.fullName && item.fullName.toLowerCase().includes(searchLower)) ||
                (item.contactPerson && item.contactPerson.toLowerCase().includes(searchLower)) ||
                (item.emailAddress && item.emailAddress.toLowerCase().includes(searchLower)) ||
                (item.email && item.email.toLowerCase().includes(searchLower)) ||
                (item.mobileNumber && item.mobileNumber.toLowerCase().includes(searchLower)) ||
                (item.whatsapp && item.whatsapp.toLowerCase().includes(searchLower)) ||
                (item.country && item.country.toLowerCase().includes(searchLower)) ||
                (item.paymentStatus && item.paymentStatus.toLowerCase().includes(searchLower)) ||
                (item.registrationCategory && item.registrationCategory.toLowerCase().includes(searchLower))
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
                const response = await api.delete(`/api/buyer-registration/${registration._id}`);
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
        <div className="bg-white mt-6">
            <div className="w-full">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 uppercase">Buyer Registrations</h1>
                    <p className="text-gray-500 mt-2 text-lg">Manage all registrations from the Buyer Registration page</p>
                </div>

                <div className="border border-gray-300 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-300 bg-white">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 uppercase">Registration List</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Showing {filteredRegistrations.length} total registrations
                            </p>
                        </div>
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
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">COMPANY</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">CRM TAG</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">CONTACT PERSON</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">CONTACT INFO</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">PAYMENT</th>
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
                                                            to={`/buyer-registration/${row._id}`}
                                                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-sm"
                                                        >
                                                            {row.companyName || 'N/A'}
                                                        </Link>
                                                        <div className="text-xs text-gray-400">{row.country || ''}</div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <span className={`text-[10px] font-medium px-2 py-0.5 border ${(row.buyerTag || 'Cold') === 'Hot' ? 'border-red-300 text-red-600' : (row.buyerTag || 'Cold') === 'Warm' ? 'border-orange-300 text-orange-600' : 'border-blue-300 text-blue-600'}`}>
                                                        {row.buyerTag || 'Cold'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <div className="text-sm text-gray-800">{row.fullName || row.contactPerson || 'N/A'}</div>
                                                    <div className="text-xs text-gray-400">{row.designation || ''}</div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <div className="text-xs text-gray-600">{row.emailAddress || row.email || 'N/A'}</div>
                                                    <div className="text-xs text-gray-500">{row.mobileNumber || row.whatsapp || 'N/A'}</div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <div className="text-xs text-gray-600">{row.paymentStatus || 'Pending'}</div>
                                                    <div className="text-[10px] text-gray-400">{row.registrationCategory || 'N/A'}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200 whitespace-nowrap">
                                                    {formatDate(row.createdAt)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`/buyer-registration/${row._id}`)}
                                                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/buyer-registration/edit/${row._id}`)}
                                                            className="p-1 text-gray-500 hover:text-amber-600 transition-colors"
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
                                placeholder="Search by company, name, email, phone, country, payment status..."
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

export default BuyerList;