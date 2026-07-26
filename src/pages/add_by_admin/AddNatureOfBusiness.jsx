import React, { useState, useEffect, useMemo } from 'react';
import { 
    Plus, Search, Edit, Trash2, Filter, 
    RefreshCcw, Download, MoreVertical, Briefcase, 
    CheckCircle2, XCircle, Calendar, X, Save
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchNatures,
    createNature,
    updateNature,
    deleteNature,
} from '../../features/add_by_admin/nature/natureSlice';
import Swal from 'sweetalert2';
import { createActivityLogThunk } from '../../features/activityLog/activityLogSlice';

const AddNatureOfBusiness = () => {
    const dispatch = useDispatch();
    const { natures, loading: isLoading } = useSelector((state) => state.natures);

    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(null); 
    const [formData, setFormData] = useState({ name: '', description: '', status: 'Active' });
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Search and Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        dispatch(fetchNatures());
    }, [dispatch]);

    const filteredNatures = useMemo(() => {
        let list = Array.isArray(natures) ? natures.filter(Boolean) : [];
        if (searchTerm.trim()) {
            list = list.filter((n) => (n?.nature_name || "").toLowerCase().includes(searchTerm.trim().toLowerCase()));
        }
        if (statusFilter !== "All Status") {
            list = list.filter((n) => {
                const s = n?.nature_status || "Active";
                return s.toLowerCase() === statusFilter.toLowerCase();
            });
        }
        list.sort((a, b) => (a.nature_name || "").localeCompare(b.nature_name || ""));
        return list;
    }, [natures, searchTerm, statusFilter]);

    const activeCount = filteredNatures.filter(n => (n.nature_status || 'Active').toLowerCase() === 'active').length;
    const inactiveCount = filteredNatures.length - activeCount;

    // Last Updated Data
    let lastUpdatedText = "N/A";
    let lastUpdatedTime = "";
    if (filteredNatures.length > 0) {
        const sortedByUpdate = [...filteredNatures].sort((a, b) => new Date(b.updated || b.added) - new Date(a.updated || a.added));
        const latest = sortedByUpdate[0];
        if (latest && (latest.updated || latest.added)) {
            const d = new Date(latest.updated || latest.added);
            lastUpdatedText = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            lastUpdatedTime = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        }
    }

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
        setFormData({ name: '', description: '', status: 'Active' });
        setIsModalOpen(false);
    };

    const startEdit = (natureId) => {
        const n = natures.find((nat) => nat?._id === natureId);
        if (n) {
            setIsEditing(n._id);
            setFormData({
                name: n.nature_name,
                description: n.description || '',
                status: n.nature_status ? n.nature_status.charAt(0).toUpperCase() + n.nature_status.slice(1) : "Active"
            });
            setIsModalOpen(true);
        }
    };

    const handleAddOrUpdateNature = async (e) => {
        if (e) e.preventDefault();

        if (!formData.name.trim()) {
            return Swal.fire({ icon: 'warning', title: 'Missing Field', text: 'Please enter a business name', confirmButtonColor: '#1B42C1' });
        }

        const trimmedName = formData.name.trim();
        const duplicate = (Array.isArray(natures) ? natures : []).find(
            (n) => (n?.nature_name || "").trim().toLowerCase() === trimmedName.toLowerCase() && n._id !== isEditing
        );

        if (duplicate) {
            return Swal.fire({ title: "Duplicate", text: "A nature of business with that name already exists!", icon: "warning", confirmButtonColor: "#1B42C1" });
        }

        try {
            setIsSaving(true);
            const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo") || "{}");
            const userName = adminInfo.fullName || adminInfo.name || adminInfo.username || "Admin User";

            const natureData = {
                nature_name: trimmedName,
                description: formData.description.trim(),
                nature_status: formData.status.toLowerCase(),
                added: new Date().toISOString(),
                updated_by: userName
            };

            const userId = sessionStorage.getItem("user_id");

            if (isEditing) {
                await dispatch(updateNature({ id: isEditing, updates: natureData })).unwrap();
                if (userId) dispatch(createActivityLogThunk({ user_id: userId, message: `System Config: Updated business nature '${formData.name}'`, section: "System Configuration", data: { action: "UPDATE", type: "NATURE_OF_BUSINESS" } }));
            } else {
                const newId = natures?.length > 0 ? Math.max(...natures.map((n) => n.nature_id || 0)) + 1 : 1;
                await dispatch(createNature({ ...natureData, nature_id: newId, updated_by: userName })).unwrap();
                if (userId) dispatch(createActivityLogThunk({ user_id: userId, message: `System Config: Added business nature '${formData.name}'`, section: "System Configuration", data: { action: "ADD", type: "NATURE_OF_BUSINESS" } }));
            }

            Swal.fire({ icon: 'success', title: 'Success', text: 'Saved successfully', timer: 1500, showConfirmButton: false });
            resetForm();
            dispatch(fetchNatures());
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Operation failed', confirmButtonColor: '#1B42C1' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteNature = async (natureId) => {
        const natureToDelete = natures.find((n) => n._id === natureId);
        if (!natureToDelete) return;

        const result = await Swal.fire({
            title: 'Are you sure?', text: `Delete "${natureToDelete.nature_name}"?`, icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await dispatch(deleteNature(natureId)).unwrap();
                const userId = sessionStorage.getItem("user_id");
                if (userId) dispatch(createActivityLogThunk({ user_id: userId, message: `System Config: Deleted business nature '${natureToDelete.nature_name}'`, section: "System Configuration", data: { action: "DELETE", type: "NATURE_OF_BUSINESS" } }));
                Swal.fire('Deleted!', 'Record deleted.', 'success');
                dispatch(fetchNatures());
            } catch (error) {
                Swal.fire('Error', error?.message || 'Failed to delete record', 'error');
            }
        }
    };

    return (
        <div className="bg-[#f8f9fc] min-h-screen font-sans text-sm pb-10" style={{ fontFamily: 'Inter, sans-serif' }}>
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-6 bg-white border-b border-gray-100">
                <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-[#0e3f94] text-white flex items-center justify-center shadow-sm">
                        <Briefcase size={22} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 mb-0.5">
                            <span>System Configuration</span>
                            <span className="text-gray-300">›</span>
                            <span className="text-green-600">Business Nature</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Business Nature</h1>
                        <p className="text-xs text-gray-500 font-medium">Manage business nature options used in exhibitor lead and registration.</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 md:mt-0 flex items-center gap-2 bg-[#1B42C1] hover:bg-[#15349e] text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm"
                >
                    <Plus size={16} /> Add Business Nature
                </button>
            </div>

            <div className="px-6 mt-4 max-w-[1600px] mx-auto">
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Stat 1 */}
                    <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#f0f4ff] text-[#1B42C1] flex items-center justify-center shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Total Business Nature</p>
                            <h3 className="text-xl font-bold text-gray-800">{filteredNatures.length}</h3>
                            <p className="text-[10px] text-gray-400 font-medium">All Business Nature</p>
                        </div>
                    </div>
                    {/* Stat 2 */}
                    <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Active</p>
                            <h3 className="text-xl font-bold text-gray-800">{activeCount}</h3>
                            <p className="text-[10px] text-gray-400 font-medium">Currently Active</p>
                        </div>
                    </div>
                    {/* Stat 3 */}
                    <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                            <X size={26} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Inactive</p>
                            <h3 className="text-xl font-bold text-gray-800">{inactiveCount}</h3>
                            <p className="text-[10px] text-gray-400 font-medium">Not in Use</p>
                        </div>
                    </div>
                    {/* Stat 4 */}
                    <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Last Updated</p>
                            <h3 className="text-[15px] font-bold text-gray-800 leading-snug">{lastUpdatedText}</h3>
                            <p className="text-[10px] text-gray-400 font-medium">{lastUpdatedTime}</p>
                        </div>
                    </div>
                </div>

                {/* Filter Row */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                    <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-72">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search business nature..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none shadow-sm"
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <label className="text-[9px] font-bold text-gray-500 uppercase absolute -mt-2 ml-2 bg-[#f8f9fc] px-1 z-10">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white shadow-sm focus:border-blue-500 outline-none"
                            >
                                <option value="All Status">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button 
                            onClick={() => { setSearchTerm(''); setStatusFilter('All Status'); }}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 shadow-sm transition-colors"
                        >
                            <RefreshCcw size={14} /> Reset
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 shadow-sm transition-colors">
                            <Download size={14} /> Export
                        </button>
                        <button className="flex items-center justify-center p-2 border border-gray-200 bg-white text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors">
                            <Filter size={16} />
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-[#f5f8ff] text-[#4a5568] border-b border-gray-100">
                                    <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-wider w-16">S.No.</th>
                                    <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-wider">Business Nature</th>
                                    <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-wider">Description</th>
                                    <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-wider text-center">Status</th>
                                    <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-wider text-center">Created / Updated</th>
                                    <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-wider text-center w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                <span className="text-xs font-semibold">Loading records...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedNatures.length > 0 ? (
                                    paginatedNatures.map((nature, index) => (
                                        <tr key={nature._id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="py-3 px-5 text-xs font-bold text-gray-500">
                                                {indexOfFirstItem + index + 1}
                                            </td>
                                            <td className="py-3 px-5">
                                                <div className="text-[13px] font-bold text-gray-800">{nature.nature_name}</div>
                                            </td>
                                            <td className="py-3 px-5">
                                                <div className="text-[12px] text-gray-500 truncate max-w-[300px]">
                                                    {nature.description || `Entity involved in ${nature.nature_name.toLowerCase()}.`}
                                                </div>
                                            </td>
                                            <td className="py-3 px-5 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-md ${nature.nature_status?.toLowerCase() === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${nature.nature_status?.toLowerCase() === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    {nature.nature_status?.charAt(0).toUpperCase() + nature.nature_status?.slice(1)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="flex items-center gap-1.5 text-gray-600 text-[11px] font-semibold">
                                                        <Calendar size={12} className="text-gray-400"/>
                                                        {new Date(nature.updated || nature.added).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                                                    </div>
                                                    <div className="text-[9px] text-gray-400 mt-0.5">by {nature.updated_by || 'Admin'}</div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-5">
                                                <div className="flex items-center justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => startEdit(nature._id)} className="w-7 h-7 flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded border border-blue-100 transition-colors" title="Edit">
                                                        <Edit size={13} />
                                                    </button>
                                                    <button onClick={() => handleDeleteNature(nature._id)} className="w-7 h-7 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded border border-red-100 transition-colors" title="Delete">
                                                        <Trash2 size={13} />
                                                    </button>
                                                    <button className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-10 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Filter size={32} className="text-gray-300" />
                                                <p className="text-sm font-semibold text-gray-400">No records found matching your criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Footer / Pagination */}
                    <div className="flex items-center justify-between px-5 py-3 bg-white border-t border-gray-100">
                        <div className="text-[11px] font-semibold text-gray-500">
                            Showing {filteredNatures.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredNatures.length)} of {filteredNatures.length} entries
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    &lt;
                                </button>
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-7 h-7 flex items-center justify-center rounded text-[11px] font-bold transition-colors ${currentPage === i + 1 ? 'bg-blue-600 text-white border-blue-600' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    &gt;
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                        <div className="bg-[#1B42C1] px-6 py-4 flex items-center justify-between">
                            <h2 className="text-white text-base font-bold flex items-center gap-2">
                                {isEditing ? <Edit size={18} /> : <Plus size={18} />}
                                {isEditing ? 'Edit Business Nature' : 'Add Business Nature'}
                            </h2>
                            <button onClick={resetForm} className="text-white/70 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddOrUpdateNature} className="p-6 space-y-5">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Business Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Distributor, Retailer"
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm text-gray-800 font-medium shadow-sm transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Brief description of the business nature"
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm text-gray-800 shadow-sm transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Status</label>
                                <div className="flex gap-3 mt-1">
                                    {['Active', 'Inactive'].map(s => (
                                        <label key={s}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-semibold cursor-pointer transition-all ${formData.status === s
                                                ? (s === 'Active' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700')
                                                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                                }`}>
                                            <input type="radio" name="status" value={s}
                                                checked={formData.status === s}
                                                onChange={handleInputChange}
                                                className="hidden" />
                                            {s === 'Active' ? <CheckCircle2 size={16} className={formData.status === s ? 'text-green-600' : ''}/> : <XCircle size={16} className={formData.status === s ? 'text-red-600' : ''}/>}
                                            {s}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 py-2.5 bg-[#1B42C1] text-white rounded-lg font-bold hover:bg-[#15349e] transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
                                >
                                    {isSaving ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            <span>{isEditing ? 'Update' : 'Save'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddNatureOfBusiness;
