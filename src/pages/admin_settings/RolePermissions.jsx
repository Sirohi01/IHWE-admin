import React, { useState, useEffect } from "react";
import { ShieldCheck, Save, RefreshCw, CheckSquare, Square, ChevronDown, ChevronRight, Info, Search, Users, Edit } from "lucide-react";
import api from "../../lib/api";
import { menuItems } from "../../data/menuItems";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import Swal from "sweetalert2";

export default function RolePermissions() {
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const rolesPerPage = 10;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRoles, setExpandedRoles] = useState({});

    const toggleExpandRole = (roleId) => {
        setExpandedRoles(prev => ({ ...prev, [roleId]: !prev[roleId] }));
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setIsLoading(true);
            const res = await api.get("/api/roles");
            if (res.data.success) {
                setRoles(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleSelect = (role) => {
        setSelectedRole(role._id);
        setPermissions(role.permissions || {});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRole(null);
        setPermissions({});
    };

    const togglePermission = (label) => {
        setPermissions(prev => {
            const newState = { ...prev };
            newState[label] = !newState[label];
            return newState;
        });
    };

    const toggleAllInSection = (section, visible) => {
        setPermissions(prev => {
            const newState = { ...prev };
            if (section.children) {
                section.children.forEach(child => {
                    newState[child.label] = visible;
                });
            } else {
                newState[section.label] = visible;
            }
            return newState;
        });
    };

    const handleSave = async () => {
        if (!selectedRole) {
            Swal.fire({ icon: "warning", title: "Select Role", text: "Please select a role to update permissions.", confirmButtonColor: "#23471d" });
            return;
        }

        try {
            setIsSaving(true);
            const res = await api.put(`/api/roles/update/${selectedRole}`, {
                permissions: permissions
            });
            if (res.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Permissions Saved",
                    text: "Sidebar permissions updated successfully.",
                    timer: 2000,
                    showConfirmButton: false
                });
                setRoles(prev => prev.map(r => r._id === selectedRole ? { ...r, permissions } : r));
                closeModal();
            }
        } catch (error) {
            console.error("Error saving permissions:", error);
            Swal.fire({ icon: "error", title: "Error", text: "Failed to save permissions.", confirmButtonColor: "#23471d" });
        } finally {
            setIsSaving(false);
        }
    };

    const filteredRoles = roles
        .filter(role => role.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    // Reset page when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Pagination logic
    const indexOfLastRole = currentPage * rolesPerPage;
    const indexOfFirstRole = indexOfLastRole - rolesPerPage;
    const currentRoles = filteredRoles.slice(indexOfFirstRole, indexOfLastRole);
    const totalPages = Math.ceil(filteredRoles.length / rolesPerPage);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <RefreshCw className="animate-spin text-[#23471d] mb-4" size={40} />
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Role Permissions...</span>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md mt-1 p-6 min-h-screen">
            <PageHeader
                title="User Access Management"
                description="Manage sidebar visibility and access control for administrative roles"
            />

            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-100">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-[#d26019]" />
                    <h2 className="text-lg font-black text-[#23471d] uppercase tracking-tight">Role Access List</h2>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search roles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-sm text-xs font-semibold focus:outline-none focus:border-[#23471d] w-64"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#23471d] text-white text-[10px] uppercase tracking-widest font-black">
                                <th className="px-6 py-2 w-16 text-center">S.No</th>
                                <th className="px-6 py-2 w-48">Role Name</th>
                                <th className="px-6 py-2">Accessible Pages</th>
                                <th className="px-6 py-2">Updated By</th>
                                <th className="px-6 py-2 text-right">Status / Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentRoles.map((role, index) => (
                                <tr key={role._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-2 text-center font-md text-[#23471d] text-[9px]">
                                        {(indexOfFirstRole + index + 1).toString().padStart(2, '0')}
                                    </td>
                                    <td className="px-6 py-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-semibold text-gray-800 uppercase tracking-tight">{role.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-2">
                                        <div className="flex flex-wrap gap-1 max-w-full">
                                            {Object.keys(role.permissions || {}).filter(k => role.permissions[k]).slice(0, expandedRoles[role._id] ? undefined : 6).map((page, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-gray-50 text-gray-600 text-[9px] font-bold uppercase rounded-sm border border-gray-200 whitespace-nowrap">
                                                    {page}
                                                </span>
                                            ))}
                                            {!expandedRoles[role._id] && Object.keys(role.permissions || {}).filter(k => role.permissions[k]).length > 6 && (
                                                <button
                                                    onClick={() => toggleExpandRole(role._id)}
                                                    className="px-2 py-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 text-[9px] font-bold uppercase rounded-sm border border-blue-200 whitespace-nowrap transition-colors cursor-pointer"
                                                >
                                                    +{Object.keys(role.permissions || {}).filter(k => role.permissions[k]).length - 6} More
                                                </button>
                                            )}
                                            {expandedRoles[role._id] && Object.keys(role.permissions || {}).filter(k => role.permissions[k]).length > 6 && (
                                                <button
                                                    onClick={() => toggleExpandRole(role._id)}
                                                    className="px-2 py-0.5 bg-gray-100 text-gray-600 hover:bg-gray-200 text-[9px] font-bold uppercase rounded-sm border border-gray-300 whitespace-nowrap transition-colors cursor-pointer"
                                                >
                                                    Show Less
                                                </button>
                                            )}
                                            {Object.keys(role.permissions || {}).filter(k => role.permissions[k]).length === 0 && (
                                                <span className="text-[10px] text-gray-400 font-semibold italic">No pages assigned</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-2">
                                        <div className="flex flex-col items-start">
                                            <span className="text-[9px] font-bold text-gray-800 uppercase">
                                                {role.updatedBy || role.createdBy || 'System'}
                                            </span>
                                            <span className="text-[9px] font-semibold text-gray-500 whitespace-nowrap">
                                                {role.updatedAt
                                                    ? new Date(role.updatedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                    : role.createdAt ? new Date(role.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-2 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full ${role.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {role.status || 'Active'}
                                            </span>
                                            <button
                                                onClick={() => handleRoleSelect(role)}
                                                title="Edit Permissions"
                                                className="p-1.5 bg-[#d26019]/10 text-[#d26019] hover:bg-[#d26019] hover:text-white transition-colors rounded-sm shadow-sm inline-flex items-center"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredRoles.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest">
                                        No roles found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredRoles.length > 0 && (
                <div className="mt-6">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredRoles.length}
                        itemsPerPage={rolesPerPage}
                        onPageChange={setCurrentPage}
                        label="roles"
                    />
                </div>
            )}

            {/* Permissions Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col relative overflow-hidden">
                        <div className="px-6 py-4 border-b bg-[#23471d] flex justify-between items-center">
                            <h2 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-tight">
                                <ShieldCheck className="w-5 h-5 text-[#d26019]" />
                                Edit Permissions - {roles.find(r => r._id === selectedRole)?.name}
                            </h2>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const newPerms = {};
                                            menuItems.forEach(item => {
                                                if (item.label) newPerms[item.label] = true;
                                                if (item.children) item.children.forEach(c => newPerms[c.label] = true);
                                            });
                                            setPermissions(newPerms);
                                        }}
                                        className="px-3 py-1 bg-[#d26019] text-white text-[10px] font-black uppercase tracking-tighter hover:bg-orange-600 transition-colors rounded-sm"
                                    >
                                        Select All
                                    </button>
                                    <button
                                        onClick={() => setPermissions({})}
                                        className="px-3 py-1 bg-white text-[#23471d] text-[10px] font-black uppercase tracking-tighter hover:bg-gray-100 transition-colors rounded-sm"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-0">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-[11px] uppercase font-black border-b sticky top-0 z-10">
                                        <th className="px-6 py-4">Menu Section / Link</th>
                                        <th className="px-6 py-4 text-center w-24">Visible</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {menuItems.map((item, index) => (
                                        <React.Fragment key={item.label || `heading-${index}`}>
                                            {/* Heading Row */}
                                            {item.type === "heading" && (
                                                <tr className="bg-slate-50/50">
                                                    <td className="px-6 py-3 font-black text-[10px] text-[#d26019] uppercase tracking-widest">
                                                        {item.label}
                                                    </td>
                                                    <td className="px-6 py-3 text-center">
                                                        <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded">SECTION</span>
                                                    </td>
                                                </tr>
                                            )}

                                            {/* Standard Item Row */}
                                            {item.type === "item" && (
                                                <tr className="hover:bg-green-50/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {item.icon && <item.icon size={16} className="text-slate-400" />}
                                                            <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{item.label}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => togglePermission(item.label)}
                                                            className={`transition-colors p-1 ${permissions[item.label] ? "text-green-600" : "text-gray-300"}`}
                                                        >
                                                            {permissions[item.label] ? <CheckSquare size={24} /> : <Square size={24} />}
                                                        </button>
                                                    </td>
                                                </tr>
                                            )}

                                            {/* Dropdown Row */}
                                            {item.type === "dropdown" && (
                                                <>
                                                    <tr className="hover:bg-green-50/30 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    {item.icon && <item.icon size={16} className="text-slate-400" />}
                                                                    <span className="text-sm font-bold text-[#23471d] uppercase tracking-tight">{item.label}</span>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => toggleAllInSection(item, true)} className="text-[9px] font-black text-blue-600">ENABLE ALL</button>
                                                                    <button onClick={() => toggleAllInSection(item, false)} className="text-[9px] font-black text-red-600">DISABLE ALL</button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="text-[10px] font-bold text-gray-300 italic">NESTED</span>
                                                        </td>
                                                    </tr>
                                                    {item.children?.map(child => (
                                                        <tr key={child.label} className="bg-slate-50/20">
                                                            <td className="px-12 py-3 border-l-4 border-slate-100">
                                                                <span className="text-xs font-semibold text-slate-600 uppercase">{child.label}</span>
                                                            </td>
                                                            <td className="px-6 py-3 text-center">
                                                                <button
                                                                    onClick={() => togglePermission(child.label)}
                                                                    className={`transition-colors p-1 ${permissions[child.label] ? "text-green-600" : "text-gray-300"}`}
                                                                >
                                                                    {permissions[child.label] ? <CheckSquare size={20} /> : <Square size={20} />}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-200 text-gray-800 font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-2 bg-[#d26019] text-white font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-orange-700 transition-colors flex items-center gap-2"
                            >
                                {isSaving ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                                {isSaving ? "Saving..." : "Save Permissions"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
