import { useState, useEffect, useCallback } from 'react';

import {
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Eye,
    Plus
} from 'lucide-react';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import api from "../../lib/api";
import PageHeader from '../../components/PageHeader';


const TestimonialsList = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [rowsPerPage] = useState(50);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
    const navigate = useNavigate();


    const fetchTestimonials = useCallback(async () => {
        try {
            setLoading(true);

            const response = await api.get('/api/testimonials', {
                params: {
                    page: currentPage,
                    limit: rowsPerPage,
                    search: searchTerm,
                    status: statusFilter
                }
            });

            if (response.data.success) {
                setTestimonials(response.data.data);
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to fetch testimonials',
                confirmButtonColor: '#3b82f6'
            });
        } finally {
            setLoading(false);
        }
    }, [currentPage, rowsPerPage, searchTerm, statusFilter]);


    // Fetch testimonials from API
    useEffect(() => {
        fetchTestimonials();
    }, [fetchTestimonials]);

    if (loading) {
        return (
            <div className="bg-white shadow-sm mt-6 p-4 md:p-6 flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading testimonials...</p>
                </div>
            </div>
        );
    }





    // Handle view testimonial
    const handleView = async (id) => {
        try {
            const response = await api.get(`/api/testimonials/${id}`);

            if (response.data.success) {
                const testimonial = response.data.data;
                Swal.fire({
                    title: testimonial.name,
                    html: `
                        <div class="text-left">
                            <p class="mb-2"><strong>Position:</strong> ${testimonial.role}</p>
                            <p class="mb-2"><strong>Organisation:</strong> ${testimonial.company || 'N/A'}</p>
                            <p class="mb-2"><strong>Rating:</strong> ${'⭐'.repeat(testimonial.rating)}</p>
                            <p class="mb-2"><strong>Status:</strong> ${testimonial.status}</p>
                            <p class="mb-2"><strong>Feedback:</strong></p>
                            <p class="text-gray-700 italic">"${testimonial.feedback}"</p>
                        </div>
                    `,
                    confirmButtonColor: '#3b82f6',
                    width: '600px'
                });
            }
        } catch (error) {
            console.error('Error viewing testimonial:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to load testimonial details',
                confirmButtonColor: '#3b82f6'
            });
        }
    };

    // Handle edit testimonial
    const handleEdit = (testimonial) => {
        navigate("/add-testimonials", {
            state: { testimonial }
        });
    };

    // Handle delete testimonial
    const handleDeleteClick = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await api.delete(`/api/testimonials/${id}`);

                    if (response.data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: 'Testimonial has been deleted.',
                            confirmButtonColor: '#3b82f6',
                            timer: 2000
                        });
                        fetchTestimonials();
                    }
                } catch (error) {
                    console.error('Error deleting testimonial:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: error.response?.data?.message || 'Failed to delete testimonial',
                        confirmButtonColor: '#3b82f6'
                    });
                }
            }
        });
    };

    // Toggle status
    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

            const response = await api.patch(
                `/api/testimonials/${id}/status`,
                { status: newStatus }
            );

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Status updated successfully',
                    confirmButtonColor: '#3b82f6',
                    timer: 2000
                });
                fetchTestimonials();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to update status',
                confirmButtonColor: '#3b82f6'
            });
        }
    };

    // Toggle row selection
    const toggleRowSelection = (id) => {
        if (selectedRows.includes(id)) {
            setSelectedRows(selectedRows.filter(rowId => rowId !== id));
        } else {
            setSelectedRows([...selectedRows, id]);
        }
    };

    // Select all rows
    const toggleSelectAll = () => {
        if (selectedRows.length === testimonials.length) {
            setSelectedRows([]);
        } else {
            const allIds = testimonials.map(t => t._id);
            setSelectedRows(allIds);
        }
    };

    // Bulk delete selected rows
    const handleBulkDelete = () => {
        if (selectedRows.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Selection',
                text: 'Please select testimonials to delete',
                confirmButtonColor: '#3b82f6'
            });
            return;
        }

        Swal.fire({
            title: 'Delete Multiple Testimonials?',
            text: `You are about to delete ${selectedRows.length} testimonial(s)`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete them!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await api.post(
                        '/api/testimonials/bulk-delete',
                        { ids: selectedRows }
                    );

                    if (response.data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: response.data.message,
                            confirmButtonColor: '#3b82f6',
                            timer: 2000
                        });
                        setSelectedRows([]);
                        fetchTestimonials();
                    }
                } catch (error) {
                    console.error('Error bulk deleting:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: error.response?.data?.message || 'Failed to delete testimonials',
                        confirmButtonColor: '#3b82f6'
                    });
                }
            }
        });
    };

    return (
        <div className="bg-white shadow-md p-6 mt-6 min-h-screen">
            <div className="w-full">
                {/* Header - Fixed Layout */}
                <PageHeader
                    title="TESTIMONIALS LIST"
                    description="Manage and view all testimonials in your system"
                >
                    <button
                        onClick={() => navigate('/add-testimonials')}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-bold"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Testimonial</span>
                    </button>
                </PageHeader>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Total</p>
                        <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
                    </div>
                    <div className="bg-linear-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-600 font-medium">Active</p>
                        <p className="text-3xl font-bold text-green-700">{stats.active}</p>
                    </div>
                    <div className="bg-linear-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-600 font-medium">Inactive</p>
                        <p className="text-3xl font-bold text-red-700">{stats.inactive}</p>
                    </div>
                </div>


                {/* Search and Filters */}
                <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <input
                        type="text"
                        placeholder="Search by name, role, company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    {selectedRows.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm whitespace-nowrap"
                        >
                            Delete Selected ({selectedRows.length})
                        </button>
                    )}
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-[#061E29]">
                                <tr>
                                    <th className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            checked={selectedRows.length === testimonials.length && testimonials.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                                        Position
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                                        Organisation
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                                        Rating
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {testimonials.map((testimonial) => (
                                    <tr
                                        key={testimonial._id}
                                        className={`hover:bg-gray-50 transition-colors ${selectedRows.includes(testimonial._id) ? 'bg-blue-50' : ''}`}
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                checked={selectedRows.includes(testimonial._id)}
                                                onChange={() => toggleRowSelection(testimonial._id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {testimonial.name || "No Name"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {testimonial.role || "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {testimonial.company || "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {'⭐'.repeat(testimonial.rating || 5)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleStatus(testimonial._id, testimonial.status)}
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${testimonial.status === 'active'
                                                    ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200'
                                                    }`}
                                            >
                                                {testimonial.status === 'active' ? (
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                ) : (
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                )}
                                                {testimonial.status}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => handleView(testimonial._id)}
                                                    className="text-green-600 hover:text-green-900 p-1.5 rounded-lg hover:bg-green-50 transition-colors border border-green-200"
                                                    title="View"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(testimonial)}
                                                    className="text-blue-600 hover:text-blue-900 p-1.5 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(testimonial._id)}
                                                    className="text-red-600 hover:text-red-900 p-1.5 rounded-lg hover:bg-red-50 transition-colors border border-red-200"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty state */}
                    {testimonials.length === 0 && (
                        <div className="py-12">
                            <EmptyState
                                title="No testimonials found"
                                description="You haven't added any testimonial yet."
                                actionLabel="Add Testimonial"
                                onAction={() => navigate("/add-testimonials")}
                            />
                        </div>
                    )}
                </div>

                {/* Footer with Pagination */}
                {testimonials.length > 0 && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={stats.total}
                            itemsPerPage={rowsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestimonialsList;