import React, { useState, useEffect, useMemo } from 'react';
import { Edit, Plus, Save, Search, Trash2, Filter, Info, Pencil } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchNatures,
    createNature,
    updateNature,
    deleteNature,
} from '../../features/add_by_admin/nature/natureSlice';
import Swal from 'sweetalert2';
import PageHeader from '../../components/PageHeader';
import { createActivityLogThunk } from '../../features/activityLog/activityLogSlice';

const AddNatureOfBusiness = () => {
    const dispatch = useDispatch();

    const { natures, loading: isLoading } = useSelector((state) => state.natures);

    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(null); // ID of nature being edited
    const [formData, setFormData] = useState({ name: '', status: 'Active' });
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Search and Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        dispatch(fetchNatures());
    }, [dispatch]);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset to first page on search
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1); // Reset to first page on filter change
    };

    const filteredNatures = useMemo(() => {
        let list = Array.isArray(natures) ? natures.filter(Boolean) : [];
        if (debouncedSearch?.trim()) list = list.filter((n) => (n?.nature_name || "").toLowerCase().includes(debouncedSearch.trim().toLowerCase()));
        if (statusFilter === "Active" || statusFilter === "Inactive") list = list.filter((n) => (n?.nature_status || "").toLowerCase() === statusFilter.toLowerCase());

        // Sort by name A-Z
        list.sort((a, b) => (a.nature_name || "").localeCompare(b.nature_name || ""));
        return list;
    }, [natures, debouncedSearch, statusFilter]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedNatures = filteredNatures.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.max(1, Math.ceil(filteredNatures.length / itemsPerPage));

    useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [totalPages, currentPage]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setIsEditing(null);
        setFormData({ name: '', status: 'Active' });
        setIsModalOpen(false);
    };

    const startEdit = (natureId) => {
        const n = natures.find((nat) => nat?._id === natureId);
        if (n) {
            setIsEditing(n._id);
            setFormData({
                name: n.nature_name,
                status: n.nature_status ? n.nature_status.charAt(0).toUpperCase() + n.nature_status.slice(1) : "Active"
            });
            setIsModalOpen(true);
        }
    };

    const handleAddOrUpdateNature = async (e) => {
        if (e) e.preventDefault();

        if (!formData.name.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Field',
                text: 'Please enter a business name',
                confirmButtonColor: '#23471d'
            });
            return;
        }

        const trimmedName = formData.name.trim();
        const duplicate = (Array.isArray(natures) ? natures : []).find(
            (n) => (n?.nature_name || "").trim().toLowerCase() === trimmedName.toLowerCase() && n._id !== isEditing
        );

        if (duplicate) {
            Swal.fire({
                title: "Duplicate",
                text: "A nature of business with that name already exists!",
                icon: "warning",
                confirmButtonColor: "#23471d",
            });
            return;
        }

        try {
            setIsSaving(true);
            const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo") || "{}");
            const userName = adminInfo.fullName || adminInfo.name || adminInfo.username || "Admin User";

            const natureData = {
                nature_name: trimmedName,
                nature_status: formData.status.toLowerCase(),
                added: new Date().toISOString(),
                updated_by: userName
            };

            if (isEditing) {
                await dispatch(updateNature({ id: isEditing, updates: natureData })).unwrap();

                // Log activity
                const userId = sessionStorage.getItem("user_id");
                if (userId) {
                    dispatch(createActivityLogThunk({
                        user_id: userId,
                        message: `System Config: Updated nature of business '${formData.name}'`,
                        section: "System Configuration",
                        data: { action: "UPDATE", type: "NATURE_OF_BUSINESS", name: formData.name }
                    }));
                }
            } else {
                const newId = natures?.length > 0 ? Math.max(...natures.map((n) => n.nature_id || 0)) + 1 : 1;
                await dispatch(createNature({ ...natureData, nature_id: newId, updated_by: userName })).unwrap();

                // Log activity
                const userId = sessionStorage.getItem("user_id");
                if (userId) {
                    dispatch(createActivityLogThunk({
                        user_id: userId,
                        message: `System Config: Added new nature of business '${formData.name}'`,
                        section: "System Configuration",
                        data: { action: "ADD", type: "NATURE_OF_BUSINESS", name: formData.name }
                    }));
                }
            }

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: isEditing ? 'Nature of Business updated successfully' : 'Nature of Business added successfully',
                timer: 1500,
                showConfirmButton: false
            });
            resetForm();
            dispatch(fetchNatures());
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error?.message || 'Operation failed',
                confirmButtonColor: '#23471d'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteNature = async (natureId) => {
        const natureToDelete = natures.find((n) => n._id === natureId);
        if (!natureToDelete) return;

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Delete nature of business "${natureToDelete.nature_name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await dispatch(deleteNature(natureId)).unwrap();

                // Log activity
                const userId = sessionStorage.getItem("user_id");
                if (userId) {
                    dispatch(createActivityLogThunk({
                        user_id: userId,
                        message: `System Config: Deleted nature of business '${natureToDelete.nature_name}'`,
                        section: "System Configuration",
                        data: { action: "DELETE", type: "NATURE_OF_BUSINESS", name: natureToDelete.nature_name }
                    }));
                }

                Swal.fire('Deleted!', 'Nature of Business has been deleted.', 'success');
                dispatch(fetchNatures());
            } catch (error) {
                Swal.fire('Error', error?.message || 'Failed to delete record', 'error');
            }
        }
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen animate-fadeIn">
            <PageHeader
                title="NATURE OF BUSINESS CONFIGURATION"
                description="Business Categories | Lead Classification for International Health & Wellness Expo 2026"
            />

            <div className="mt-6">
                {/* Modal for Add/Edit Form */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                            <button
                                onClick={resetForm}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
                                {isEditing ? <Edit className="w-5 h-5 text-[#d26019]" /> : <Plus className="w-5 h-5 text-[#d26019]" />}
                                {isEditing ? 'Edit Business Details' : 'Add New Nature of Business'}
                            </h2>
                            <form onSubmit={handleAddOrUpdateNature} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Business Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Distributor, Retailer"
                                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                                    <div className="flex gap-2 mt-0.5">
                                        {['Active', 'Inactive'].map(s => (
                                            <label key={s}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12px] cursor-pointer transition-colors ${formData.status === s
                                                    ? 'bg-[#eef5ec] border-[#1e4018] text-[#1e4018]'
                                                    : 'border-gray-200 text-gray-500'
                                                    }`}>
                                                <input type="radio" name="status" value={s}
                                                    checked={formData.status === s}
                                                    onChange={handleInputChange}
                                                    className="accent-[#1e4018]" />
                                                {s}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 py-1 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                <span>{isEditing ? 'Update' : 'Save'}</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-1 bg-gray-500 text-white font-bold hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>

                            <div className="mt-4 p-4 bg-green-50 border border-green-100 flex gap-3">
                                <Info className="w-5 h-5 text-green-600 shrink-0" />
                                <p className="text-[10px] text-green-700 font-bold uppercase leading-relaxed">
                                    These business classifications will be available for exhibitors and leads.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex flex-1 gap-4 items-center w-full md:w-auto">
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#23471d] outline-none"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={handleFilterChange}
                                className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#23471d] outline-none appearance-none bg-white cursor-pointer"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#23471d] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#1a3516] transition-colors whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> Add Nature of Business
                    </button>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold border-b">No.</th>
                                <th className="p-4 font-bold border-b">Business Name</th>
                                <th className="p-4 font-bold border-b text-center">Status</th>
                                <th className="p-4 font-bold border-b text-center">Created At</th>
                                <th className="p-4 font-bold border-b text-center">Updated By</th>
                                <th className="p-4 font-bold border-b text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-8 h-8 border-4 border-[#23471d]/20 border-t-[#23471d] rounded-full animate-spin" />
                                            <span className="text-sm font-medium">Loading records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedNatures.length > 0 ? (
                                paginatedNatures.map((nature, index) => (
                                    <tr key={nature._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-sm font-medium text-gray-900">
                                            {indexOfFirstItem + index + 1}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-[#23471d]">{nature.nature_name}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-full ${nature.nature_status?.toLowerCase() === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {nature.nature_status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-center text-gray-500 whitespace-nowrap">
                                            {new Date(nature.added).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-sm text-center text-gray-500">
                                            {nature.updated_by ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">{nature.updated_by}</span>
                                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                        {new Date(nature.updated || nature.added).toLocaleString()}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">N/A</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => startEdit(nature._id)}
                                                    className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteNature(nature._id)}
                                                    className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Info className="w-8 h-8 text-gray-400" />
                                            <p className="text-sm">No records found matching your criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="mt-4 flex justify-end">
                        <div className="flex gap-1">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium ${currentPage === i + 1 ? 'bg-[#23471d] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddNatureOfBusiness;
