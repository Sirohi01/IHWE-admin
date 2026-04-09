import React, { useState, useEffect } from 'react';
import { ShieldPlus, Trash2, Edit, Plus, ShieldCheck, Info, Save, Users, Shield } from 'lucide-react';
import api from "../lib/api";
import Swal from 'sweetalert2';
import PageHeader from '../components/PageHeader';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(null); // ID of role being edited
    const [roleForm, setRoleForm] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchRoles();
    }, []);

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
                    text: isEditing ? 'Role updated успешно' : 'Role created successfully',
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
        setRoleForm({ name: role.name, description: role.description || '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditing(null);
        setRoleForm({ name: '', description: '' });
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
                title="ROLE MANAGEMENT"
                description="Create and manage administrative roles and permissions"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* Left Section: Role Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
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
                                    rows="4"
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleAddOrUpdateRole}
                                    disabled={isSaving}
                                    className="flex-1 py-2 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
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
                                {isEditing && (
                                    <button
                                        onClick={resetForm}
                                        className="px-4 py-2 bg-gray-500 text-white font-bold hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-green-50 border border-green-100 flex gap-3">
                            <Info className="w-5 h-5 text-green-600 shrink-0" />
                            <p className="text-[10px] text-green-700 font-bold uppercase leading-relaxed">
                                Roles defined here will be available for selection in the "Manage Admin Users" section.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Section: Roles List Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b bg-[#23471d] flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-[#d26019]" /> Defined Roles List
                            </h2>
                            <span className="bg-[#d26019] text-white text-xs font-black px-3 py-1 uppercase tracking-wider">
                                {roles.length} ROLES
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                                        <th className="px-6 py-3 border-b">No.</th>
                                        <th className="px-6 py-3 border-b">Role Name</th>
                                        <th className="px-6 py-3 border-b">Description</th>
                                        <th className="px-6 py-3 border-b text-center">Added On</th>
                                        <th className="px-6 py-3 border-b text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-8 h-8 border-4 border-[#23471d]/20 border-t-[#23471d] rounded-full animate-spin" />
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Syncing Roles...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : roles.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">
                                                No roles found. Create your first role using the form.
                                            </td>
                                        </tr>
                                    ) : (
                                        roles.map((role, index) => (
                                            <tr key={role._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-[#23471d]">
                                                    {(index + 1).toString().padStart(2, '0')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="w-3.5 h-3.5 text-gray-400" />
                                                        <span className="font-bold text-gray-900 uppercase tracking-tighter text-sm">
                                                            {role.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-500 text-xs">
                                                    {role.description || 'No description provided'}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                                                        {new Date(role.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleManagement;
