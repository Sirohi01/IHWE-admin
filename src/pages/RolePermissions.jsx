import React, { useState, useEffect } from "react";
import { ShieldCheck, Save, RefreshCw, CheckSquare, Square, ChevronDown, ChevronRight, Info, Search, Users } from "lucide-react";
import api from "../lib/api";
import { menuItems } from "../data/menuItems";
import PageHeader from "../components/PageHeader";
import Swal from "sweetalert2";

export default function RolePermissions() {
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState("");
    const [permissions, setPermissions] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedSections, setExpandedSections] = useState({});

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

    const handleRoleSelect = (roleId) => {
        const role = roles.find(r => r._id === roleId);
        setSelectedRole(roleId);
        if (role) {
            setPermissions(role.permissions || {});
        } else {
            setPermissions({});
        }
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
                    text: "Sidebar permissions updated successfully. Changes will take effect on next login or refresh.",
                    timer: 2000,
                    showConfirmButton: false
                });
                // Update local roles state
                setRoles(prev => prev.map(r => r._id === selectedRole ? { ...r, permissions } : r));
            }
        } catch (error) {
            console.error("Error saving permissions:", error);
            Swal.fire({ icon: "error", title: "Error", text: "Failed to save permissions.", confirmButtonColor: "#23471d" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <RefreshCw className="animate-spin text-[#23471d] mb-4" size={40} />
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Role Permissions...</span>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader 
                title="ROLE PERMISSIONS" 
                description="Manage sidebar visibility and access control for administrative roles"
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
                {/* Role Selection Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
                            <Users className="w-5 h-5 text-[#d26019]" />
                            Select Role
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Administrative Role</label>
                                <select 
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm font-semibold uppercase tracking-tight"
                                    value={selectedRole}
                                    onChange={(e) => handleRoleSelect(e.target.value)}
                                >
                                    <option value="">-- Choose Role --</option>
                                    {roles.map(role => (
                                        <option key={role._id} value={role._id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {selectedRole && (
                                <div className="p-4 bg-orange-50 border border-orange-100 flex gap-3">
                                    <Info className="w-5 h-5 text-[#d26019] shrink-0" />
                                    <p className="text-[10px] text-orange-800 font-bold uppercase leading-relaxed">
                                        You are editing permissions for <span className="text-black font-black underline">{roles.find(r => r._id === selectedRole)?.name}</span>.
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleSave}
                                disabled={isSaving || !selectedRole}
                                className="w-full py-3 bg-[#23471d] text-white font-black hover:bg-green-900 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                                {isSaving ? "Saving..." : "Save Permissions"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Permissions Matrix */}
                <div className="lg:col-span-3">
                    <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b bg-[#23471d] flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-[#d26019]" /> 
                                Sidebar Visibility Matrix
                            </h2>
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
                                    className="px-3 py-1 bg-[#d26019] text-white text-[10px] font-black uppercase tracking-tighter hover:bg-orange-600 transition-colors"
                                >
                                    Select All
                                </button>
                                <button 
                                    onClick={() => setPermissions({})}
                                    className="px-3 py-1 bg-white text-[#23471d] text-[10px] font-black uppercase tracking-tighter hover:bg-gray-100 transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>

                        {!selectedRole ? (
                            <div className="p-20 text-center text-gray-400">
                                <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-10" />
                                <p className="text-sm font-bold uppercase tracking-widest">Please select a role to manage permissions</p>
                            </div>
                        ) : (
                            <div className="p-0">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-600 text-[11px] uppercase font-black border-b">
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
