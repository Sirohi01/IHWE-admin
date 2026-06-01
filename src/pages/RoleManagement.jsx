import React, { useState, useEffect } from 'react';
import { ShieldPlus, Trash2, Edit, Plus, ShieldCheck, Info, Save, Users, Shield, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import api from "../lib/api";
import Swal from 'sweetalert2';
import PageHeader from '../components/PageHeader';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(null); // ID of role being edited
    const [roleForm, setRoleForm] = useState({ name: '', description: '', status: 'Active' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Active');
    const [currentPage, setCurrentPage] = useState(1);
    const rolesPerPage = 10;

    // Filter and search logic
    const filteredRoles = roles.filter(role => {
        const matchesSearch = role.name.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchesStatus = statusFilter === 'All' || role.status === statusFilter;
        return matchesSearch && matchesStatus;
    }).sort((a, b) => a.name.localeCompare(b.name));

    const indexOfLastRole = currentPage * rolesPerPage;
    const indexOfFirstRole = indexOfLastRole - rolesPerPage;
    const paginatedRoles = filteredRoles.slice(indexOfFirstRole, indexOfLastRole);
    const totalPages = Math.ceil(filteredRoles.length / rolesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        fetchRoles();
    }, []);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset to first page on search
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Handle filter change
    const handleFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1); // Reset to first page on filter change
    };

    const fetchRoles = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/api/roles');
            if (res.data.success) {
                setRoles(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRoleForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddOrUpdateRole = async () => {
        if (!roleForm.name.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Field',
                text: 'Please enter a role name',
                confirmButtonColor: '#23471d'
            });
            return;
        }

        try {
            setIsSaving(true);
            const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo") || "{}");
            const userName = adminInfo.username || "Admin User";

            let res;
            if (isEditing) {
                res = await api.put(`/api/roles/update/${isEditing}`, { ...roleForm, updatedBy: userName });
            } else {
                res = await api.post('/api/roles/create', { ...roleForm, createdBy: userName });
            }

            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: isEditing ? 'Role updated successfully' : 'Role created successfully',
                    timer: 1500,
                    showConfirmButton: false
                });
                resetForm();
                fetchRoles();
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Operation failed',
                confirmButtonColor: '#23471d'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const startEdit = (role) => {
        setIsEditing(role._id);
        setRoleForm({ name: role.name, description: role.description || '', status: role.status || 'Active' });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setIsEditing(null);
        setRoleForm({ name: '', description: '', status: 'Active' });
        setIsModalOpen(false);
    };

    const handleDeleteRole = async (role) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Delete role "${role.name}"? This might affect users assigned to it.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo") || "{}");
                const updatedBy = adminInfo.username || "Admin User";
                const res = await api.delete(`/api/roles/delete/${role._id}?updatedBy=${encodeURIComponent(updatedBy)}`);
                if (res.data.success) {
                    Swal.fire('Deleted!', 'Role has been deleted.', 'success');
                    fetchRoles();
                }
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Failed to delete role', 'error');
            }
        }
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="USER ROLE MANAGEMENT"
                description="Create and manage administrative roles and permissions"
            />

            <div className="mt-6">
                {/* Modal for Add/Edit Role Form */}
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
                                {isEditing ? 'Edit Role Details' : 'Add New Role'}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={roleForm.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Account Manager"
                                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={roleForm.description}
                                        onChange={handleInputChange}
                                        placeholder="Define role responsibilities..."
                                        rows="6"
                                        className="w-full px-3 py-7 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                                    <div className="flex gap-2 mt-0.5">
                                        {['Active', 'Inactive'].map(s => (
                                            <label key={s}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12px] cursor-pointer transition-colors ${roleForm.status === s
                                                    ? 'bg-[#eef5ec] border-[#1e4018] text-[#1e4018]'
                                                    : 'border-gray-200 text-gray-500'
                                                    }`}>
                                                <input type="radio" name="status" value={s}
                                                    checked={roleForm.status === s}
                                                    onChange={(e) => handleInputChange({ target: { name: 'status', value: e.target.value } })}
                                                    className="accent-[#1e4018]" />
                                                {s}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAddOrUpdateRole}
                                        disabled={isSaving}
                                        className="flex-1 py-1 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                <span>{isEditing ? 'Update Role' : 'Create Role'}</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={resetForm}
                                        className="px-4 py-1 bg-gray-500 text-white font-bold hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>

                            <div className="mt-2 p-4 bg-green-50 border border-green-100 flex gap-3">
                                <Info className="w-5 h-5 text-green-600 shrink-0" />
                                <p className="text-[10px] text-green-700 font-bold uppercase leading-relaxed">
                                    Roles defined here will be available for selection in the "Manage Admin Users" section.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Roles List Table */}
                <div className="w-full">
                    <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-3 border-b bg-[#23471d] flex justify-between items-center flex-wrap gap-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-[#d26019]" /> Defined Roles List
                            </h2>
                            <div className="flex items-center gap-3">
                                {/* Filter Dropdown */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                        <Filter className="h-3 w-3 text-gray-400" />
                                    </div>
                                    <select
                                        value={statusFilter}
                                        onChange={handleFilterChange}
                                        className="pl-7 pr-6 py-1.5 bg-white text-[#23471d] text-xs font-bold uppercase tracking-wider rounded-sm outline-none cursor-pointer hover:bg-gray-50 border-none appearance-none shadow-sm"
                                    >
                                        <option value="Active">Active Only</option>
                                        <option value="Inactive">Inactive Only</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                        <svg className="w-3 h-3 text-[#23471d]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>

                                {/* Search Bar */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search role name"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 pr-3 py-1.5 bg-white/10 text-white placeholder-white/70 border border-white/30 rounded-sm text-xs font-semibold focus:outline-none focus:bg-white focus:text-[#23471d] focus:placeholder-gray-400 transition-colors w-48"
                                    />
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/70" />
                                </div>

                                <span className="bg-[#d26019] text-white text-xs font-black px-3 py-1 uppercase tracking-wider rounded-sm">
                                    {roles.length} ROLES
                                </span>
                                <button
                                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                                    className="flex items-center gap-1 bg-white text-[#23471d] px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-gray-100 transition-colors"
                                >
                                    <Plus className="w-4 h-4" /> Add New Role
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-[9px] uppercase font-bold">
                                        <th className="px-6 py-2 border-b">S.No.</th>
                                        <th className="px-6 py-2 border-b">Role Name</th>
                                        <th className="px-6 py-2 border-b">User Role Summary</th>
                                        <th className="px-6 py-2 border-b text-center">Status</th>
                                        <th className="px-6 py-2 border-b text-center">Create/Updated Details</th>
                                        <th className="px-6 py-2 border-b text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-8 h-8 border-4 border-[#23471d]/20 border-t-[#23471d] rounded-full animate-spin" />
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Syncing Roles...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : paginatedRoles.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <ShieldCheck className="w-12 h-12 mb-2 opacity-20" />
                                                    <p className="text-sm font-bold uppercase tracking-wider">No roles found matching criteria</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedRoles.map((role, index) => (
                                            <tr key={role._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-1.5 font-bold text-[#23471d]">
                                                    {(indexOfFirstRole + index + 1).toString().padStart(2, '0')}
                                                </td>
                                                <td className="px-6 py-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="w-3.5 h-3.5 text-gray-400" />
                                                        <span className="font-semibold text-gray-900 tracking-tighter text-sm">
                                                            {role.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-1.5 font-medium text-gray-500 text-xs capitalize">
                                                    {role.description || 'No description provided'}
                                                </td>
                                                <td className="px-6 py-1.5 text-center">
                                                    <span className={`flex items-center justify-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase rounded-full w-fit mx-auto ${role.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                        {role.status === 'Active' ? <CheckCircle size={9} /> : <XCircle size={9} />}
                                                        {role.status || 'Active'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-1.5 text-center">
                                                    <div className="flex flex-col items-start">
                                                        <span className="text-xs font-semibold text-gray-800 capitalize">
                                                            {role.updatedBy || role.createdBy || 'System'}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-gray-500 whitespace-nowrap">
                                                            {role.updatedAt
                                                                ? new Date(role.updatedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                                : new Date(role.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-1.5">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => startEdit(role)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRole(role)}
                                                            className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t flex flex-wrap justify-between items-center bg-gray-50 gap-4">
                                    <span className="text-xs text-gray-500 font-semibold">
                                        Showing {paginatedRoles.length > 0 ? indexOfFirstRole + 1 : 0}-{Math.min(indexOfLastRole, filteredRoles.length)} of {filteredRoles.length} roles
                                    </span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 border border-gray-300 rounded text-xs font-bold text-gray-700 disabled:opacity-50 hover:bg-gray-100 transition-colors"
                                        >
                                            Prev
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => paginate(i + 1)}
                                                className={`px-3 py-1 border rounded text-xs font-bold transition-colors ${currentPage === i + 1 ? 'bg-[#d26019] text-white border-[#d26019]' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 border border-gray-300 rounded text-xs font-bold text-gray-700 disabled:opacity-50 hover:bg-gray-100 transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleManagement;
