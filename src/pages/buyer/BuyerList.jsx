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
        <div className="bg-white">
            <div className="w-full">
                <div className=" flex justify-between items-center border-b border-gray-300 px-4">
                    <div className="">
                        <h1 className="text-2xl font-semibold text-[#23471d] uppercase tracking-tight">Registration List</h1>
                        <p className="text-gray-500 text-lg"> Showing {filteredRegistrations.length} total registrations</p>
                    </div>
                    <div>
                        <button className="bg-[#23471d] text-white px-4 py-2 rounded-sm">Add New Registration</button>
                    </div>
                </div>


                <div className="border border-gray-300 rounded-xl m-4 overflow-hidden">

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-3">
                                <div className="w-8 h-8 border-[3px] border-gray-200 border-t-[#23471d] rounded-full animate-spin" />
                                <span className="text-sm text-gray-400">Loading...</span>
                            </div>
                        ) : (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-300">
                                        <th className="px-4 py-1.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-300">S.No</th>
                                        <th className="px-4 py-1.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-300">Company</th>
                                        <th className="px-4 py-1.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-300">CRM Tag</th>
                                        <th className="px-4 py-1.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-300">Contact Person</th>
                                        <th className="px-4 py-1.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-300">Contact Info</th>
                                        <th className="px-4 py-1.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-300">Payment</th>
                                        <th className="px-4 py-1.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-300">Date</th>
                                        <th className="px-4 py-1.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedRegistrations.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center py-1 text-sm text-gray-400 border-t border-gray-200">
                                                {searchTerm ? `No results for "${searchTerm}"` : "No registrations found"}
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedRegistrations.map((row, index) => (
                                            <tr
                                                key={row._id}
                                                className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-100"
                                            >
                                                {/* S.No */}
                                                <td className="px-4 py-1 text-sm text-gray-500 border-r border-gray-200 w-12">
                                                    {startIndex + index + 1}
                                                </td>

                                                {/* Company */}
                                                <td className="px-4 py-1 border-r border-gray-200 min-w-[150px]">
                                                    <Link
                                                        to={`/buyer-registration/${row._id}`}
                                                        className="text-sm font-semibold text-gray-800 hover:text-[#23471d] hover:underline transition-colors"
                                                    >
                                                        {row.companyName || "N/A"}
                                                    </Link>
                                                    {row.country && (
                                                        <div className="text-xs text-gray-400 mt-0.5">{row.country}</div>
                                                    )}
                                                </td>

                                                {/* CRM Tag */}
                                                <td className="px-4 py-1 border-r border-gray-200">
                                                    {(() => {
                                                        const tag = row.buyerTag || "Cold";
                                                        const s = {
                                                            Hot: "bg-red-50 text-red-600 border-red-300",
                                                            Warm: "bg-orange-50 text-orange-600 border-orange-300",
                                                            Cold: "bg-blue-50 text-blue-600 border-blue-300",
                                                        };
                                                        return (
                                                            <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded border ${s[tag] || s.Cold}`}>
                                                                {tag}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>

                                                {/* Contact Person */}
                                                <td className="px-4 py-1 border-r border-gray-200 min-w-[130px]">
                                                    <div className="text-sm text-gray-800 font-medium">
                                                        {row.fullName || row.contactPerson || "N/A"}
                                                    </div>
                                                    {row.designation && (
                                                        <div className="text-xs text-gray-400 mt-0.5">{row.designation}</div>
                                                    )}
                                                </td>

                                                {/* Contact Info */}
                                                <td className="px-4 py-1 border-r border-gray-200 min-w-[160px]">
                                                    <div className="text-xs text-gray-700">{row.emailAddress || row.email || "N/A"}</div>
                                                    <div className="text-xs text-gray-400 mt-0.5">{row.mobileNumber || row.whatsapp || "N/A"}</div>
                                                </td>

                                                {/* Payment */}
                                                <td className="px-4 py-1 border-r border-gray-200">
                                                    {(() => {
                                                        const status = row.paymentStatus || "Pending";
                                                        const s = {
                                                            Paid: "bg-green-50 text-green-700 border-green-300",
                                                            Pending: "bg-amber-50 text-amber-700 border-amber-300",
                                                            Failed: "bg-red-50 text-red-600 border-red-300",
                                                        };
                                                        return (
                                                            <div>
                                                                <span className={`inline-block px-2 text-[10px] font-medium rounded border ${s[status] || s.Pending}`}>
                                                                    {status}
                                                                </span>
                                                                {row.registrationCategory && (
                                                                    <div className="text-[10px] text-gray-400">{row.registrationCategory}</div>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </td>

                                                {/* Date */}
                                                <td className="px-4 py-1 text-sm text-gray-600 border-r border-gray-200 whitespace-nowrap">
                                                    {formatDate(row.createdAt)}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => navigate(`/buyer-registration/${row._id}`)}
                                                            className="p-1.5 rounded border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                                            title="View"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/buyer-registration/edit/${row._id}`)}
                                                            className="p-1.5 rounded border border-gray-200 text-gray-500 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(row)}
                                                            className="p-1.5 rounded border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
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

                    {/* Search */}
                    <div className="px-4 py-2 border-t border-gray-300 bg-white">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by company, name, email, phone, country..."
                                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#23471d]/20 focus:border-[#23471d] transition-all"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        {searchTerm && (
                            <p className="mt-1.5 text-xs text-gray-400">
                                {filteredRegistrations.length} result(s) for{" "}
                                <span className="font-medium text-gray-600">"{searchTerm}"</span>
                            </p>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="px-4 py-2 border-t border-gray-300 bg-white">
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