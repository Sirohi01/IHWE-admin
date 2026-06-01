import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, Save, Building2, CheckCircle, XCircle, Search, Filter, Briefcase } from 'lucide-react';
import api from "../lib/api";
import Swal from 'sweetalert2';
import PageHeader from '../components/PageHeader';
import SearchableDropdown from '../components/SearchableDropdown';

const DesignationManagement = () => {
    const [designations, setDesignations] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [adminUsers, setAdminUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [form, setForm] = useState({ name: '', department: '', reportTo: '', status: 'Active' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Active');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter and search logic
    const filtered = designations.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            (item.department?.name && item.department.name.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
            (item.reportTo && item.reportTo.toLowerCase().includes(debouncedSearch.toLowerCase()));
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    }).sort((a, b) => a.name.localeCompare(b.name));

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const paginated = filtered.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    useEffect(() => {
        fetchDesignations();
        fetchDepartments();
        fetchAdminUsers();
    }, []);

    const fetchAdminUsers = async () => {
        try {
            const res = await api.get('/api/admin/all');
            if (res.data.success) {
                setAdminUsers(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching admin users:', error);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchDesignations = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/api/designations');
            if (res.data.success) {
                setDesignations(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching designations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/api/departments');
            if (res.data.success) {
                // Only show active departments in dropdown
                setDepartments(res.data.data.filter(d => d.status === 'Active' || !d.status));
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.department || !form.reportTo) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields',
                text: 'Please fill out all required fields (Name, Department, Report To)',
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
                res = await api.put(`/api/designations/update/${isEditing}`, { ...form, updatedBy: userName });
            } else {
                res = await api.post('/api/designations/create', { ...form, createdBy: userName });
            }

            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: isEditing ? 'Designation updated successfully' : 'Designation created successfully',
                    timer: 1500,
                    showConfirmButton: false
                });
                resetForm();
                fetchDesignations();
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

    const startEdit = (item) => {
        setIsEditing(item._id);
        setForm({
            name: item.name,
            department: item.department?._id || '',
            reportTo: item.reportTo || '',
            status: item.status || 'Active'
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setIsEditing(null);
        setForm({ name: '', department: '', reportTo: '', status: 'Active' });
        setIsModalOpen(false);
    };

    const handleDelete = async (item) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Delete designation "${item.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const res = await api.delete(`/api/designations/delete/${item._id}`);
                if (res.data.success) {
                    Swal.fire('Deleted!', 'Designation has been deleted.', 'success');
                    fetchDesignations();
                }
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Failed to delete designation', 'error');
            }
        }
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="DESIGNATION MANAGEMENT"
                description="Create and manage job designations linked to departments"
            />

            <div className="mt-6">
                {/* Modal for Add/Edit */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                            <button
                                onClick={resetForm}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
                                {isEditing ? <Edit className="w-5 h-5 text-[#d26019]" /> : <Plus className="w-5 h-5 text-[#d26019]" />}
                                {isEditing ? 'Edit Designation' : 'Add New Designation'}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Designation Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Senior Software Engineer"
                                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department <span className="text-red-500">*</span></label>
                                    <SearchableDropdown
                                        options={departments.map(dep => ({
                                            label: dep.name,
                                            value: dep._id
                                        }))}
                                        value={form.department}
                                        onChange={handleInputChange}
                                        name="department"
                                        placeholder="Search and Select Department..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Report To <span className="text-red-500">*</span></label>
                                    <SearchableDropdown
                                        options={adminUsers.map(u => ({
                                            label: `${u.fullName || u.username} ${u.department ? `(${u.department})` : ''}`,
                                            value: u.fullName || u.username
                                        }))}
                                        value={form.reportTo}
                                        onChange={handleInputChange}
                                        name="reportTo"
                                        placeholder="Search and Select Reporting Authority..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                                    <div className="flex gap-2 mt-0.5">
                                        {['Active', 'Inactive'].map(s => (
                                            <label key={s}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12px] cursor-pointer transition-colors ${form.status === s
                                                    ? 'bg-[#eef5ec] border-[#1e4018] text-[#1e4018]'
                                                    : 'border-gray-200 text-gray-500'
                                                    }`}>
                                                <input type="radio" name="status" value={s}
                                                    checked={form.status === s}
                                                    onChange={handleInputChange}
                                                    className="accent-[#1e4018]" />
                                                {s}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex-1 py-1 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                <span>{isEditing ? 'Update Designation' : 'Create Designation'}</span>
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
                        </div>
                    </div>
                )}

                {/* List Table */}
                <div className="w-full">
                    <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-3 border-b bg-[#23471d] flex justify-between items-center flex-wrap gap-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-[#d26019]" /> Designations List
                            </h2>
                            <div className="flex items-center gap-3">
                                {/* Filter Dropdown */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                        <Filter className="h-3 w-3 text-gray-400" />
                                    </div>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
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
                                        placeholder="Search designation..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 pr-3 py-1.5 bg-white/10 text-white placeholder-white/70 border border-white/30 rounded-sm text-xs font-semibold focus:outline-none focus:bg-white focus:text-[#23471d] focus:placeholder-gray-400 transition-colors w-48"
                                    />
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/70" />
                                </div>

                                <span className="bg-[#d26019] text-white text-xs font-black px-3 py-1 uppercase tracking-wider rounded-sm">
                                    {designations.length} DESIGNATIONS
                                </span>
                                <button
                                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                                    className="flex items-center gap-1 bg-white text-[#23471d] px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-gray-100 transition-colors"
                                >
                                    <Plus className="w-4 h-4" /> Add New Designation
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-[9px] uppercase font-bold">
                                        <th className="px-6 py-2 border-b">S.No.</th>
                                        <th className="px-6 py-2 border-b">Designation Name</th>
                                        <th className="px-6 py-2 border-b">Department</th>
                                        <th className="px-6 py-2 border-b">Report To</th>
                                        <th className="px-6 py-2 border-b text-center">Status</th>
                                        <th className="px-6 py-2 border-b text-center">Create/Updated By</th>
                                        <th className="px-6 py-2 border-b text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-8 h-8 border-4 border-[#23471d]/20 border-t-[#23471d] rounded-full animate-spin" />
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Syncing Designations...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <Briefcase className="w-12 h-12 mb-2 opacity-20" />
                                                    <p className="text-sm font-bold uppercase tracking-wider">No designations found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((item, index) => (
                                            <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-1.5 font-bold text-[#23471d]">
                                                    {(indexOfFirst + index + 1).toString().padStart(2, '0')}
                                                </td>
                                                <td className="px-6 py-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                                        <span className="font-semibold text-gray-900 tracking-tighter text-sm capitalize">
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-1.5 font-semibold text-gray-800 text-sm">
                                                    <span className="flex items-center gap-1.5">
                                                        <Building2 className="w-3.5 h-3.5 text-[#d26019]" />
                                                        {item.department?.name || <span className="text-red-500 text-xs">Deleted Department</span>}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-1.5 font-medium text-gray-500 text-sm capitalize">
                                                    {item.reportTo || '-'}
                                                </td>
                                                <td className="px-6 py-1.5 text-center">
                                                    <span className={`flex items-center justify-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase rounded-full w-fit mx-auto ${item.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                        {item.status === 'Active' ? <CheckCircle size={9} /> : <XCircle size={9} />}
                                                        {item.status || 'Active'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-1.5 text-center">
                                                    <div className="flex flex-col items-start">
                                                        <span className="text-xs font-semibold text-gray-800 capitalize">
                                                            {item.updatedBy || item.createdBy || 'System'}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-gray-500 whitespace-nowrap">
                                                            {item.updatedAt
                                                                ? new Date(item.updatedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                                : new Date(item.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-1.5">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => startEdit(item)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item)}
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
                                        Showing {paginated.length > 0 ? indexOfFirst + 1 : 0}-{Math.min(indexOfLast, filtered.length)} of {filtered.length} designations
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
                                                onClick={() => setCurrentPage(i + 1)}
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

export default DesignationManagement;
