import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchDocumentRequirements,
    addDocumentRequirement,
    updateDocumentRequirement,
    deleteDocumentRequirement,
} from "../../features/add_by_admin/document-requirements/DocumentRequirementSlice";
import { Plus, Edit, Trash2, Package, FileText, LayoutDashboard } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Swal from "sweetalert2";

export default function DocumentConfiguration() {
    const dispatch = useDispatch();
    const { documentRequirements = [], loading = false } = useSelector(
        (state) => state.documentRequirements || {}
    );
    const [form, setForm] = useState({ document_name: "", category: "", order: 0, status: "Active" });
    const [editingId, setEditingId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const isEditing = editingId !== null;

    useEffect(() => {
        dispatch(fetchDocumentRequirements());
    }, [dispatch]);

    const handleChange = (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : (e.target.name === "order" ? parseInt(e.target.value) || 0 : e.target.value);
        setForm({ ...form, [e.target.name]: value });
    };

    const handleSubmit = async () => {
        if (!form.document_name || !form.category || !form.status) {
            Swal.fire("Warning", "Please fill all required fields.", "warning");
            return;
        }

        setIsSaving(true);
        let adminData = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
        let adminId = sessionStorage.getItem("user_id");
        if (adminData && !adminId) {
            try {
                adminId = JSON.parse(adminData)._id || JSON.parse(adminData).id;
            } catch (e) { }
        }

        const payload = {
            ...form,
            added_by: adminId || "admin",
        };

        if (isEditing) {
            try {
                await dispatch(
                    updateDocumentRequirement({ id: editingId, updatedData: payload })
                ).unwrap();
                Swal.fire({ icon: 'success', title: 'Document Updated!', timer: 1500, showConfirmButton: false });
                dispatch(fetchDocumentRequirements());
                resetForm();
            } catch (error) {
                Swal.fire("Error", `Failed to update: ${error?.message || error}`, "error");
            }
        } else {
            try {
                await dispatch(addDocumentRequirement(payload)).unwrap();
                Swal.fire({ icon: 'success', title: 'Document Added!', timer: 1500, showConfirmButton: false });
                dispatch(fetchDocumentRequirements());
                resetForm();
            } catch (error) {
                Swal.fire("Error", `Failed to add: ${error?.message || error}`, "error");
            }
        }
        setIsSaving(false);
    };

    const handleEdit = (item) => {
        setEditingId(item._id || item.id);
        setForm({
            document_name: item.document_name,
            category: item.category,
            order: item.order || 0,
            order: item.order || 0,
            status: item.status,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Document?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });
        if (!result.isConfirmed) return;
        
        try {
            await dispatch(deleteDocumentRequirement(id)).unwrap();
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
            if (editingId === id) resetForm();
        } catch (error) {
            Swal.fire("Error", "Failed to delete document requirement", "error");
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({ document_name: "", category: "", order: 0, status: "Active" });
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="Manage Document Configuration"
                description="Manage required documents for clients"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                <div className="lg:col-span-1 space-y-6">
                    {/* Form Card */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
                            {isEditing ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isEditing ? 'Edit Document' : 'Add New Document'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    Document Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="document_name"
                                    value={form.document_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                    placeholder="e.g. Udyam Certificate, GST"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm bg-white"
                                >
                                    <option value="">Select Category</option>
                                    <option value="MSME Related Documents">MSME Related Documents</option>
                                    <option value="General Documents">General Documents</option>
                                </select>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        Order
                                    </label>
                                    <input
                                        type="number"
                                        name="order"
                                        value={form.order}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm bg-white"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    className="flex-1 py-2.5 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        : isEditing ? <><Edit className="w-4 h-4" /> Update Document</> : <><Plus className="w-4 h-4" /> Add Document</>}
                                </button>
                                {isEditing && (
                                    <button onClick={resetForm} className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm">
                        <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Document Configuration List
                            </h2>
                            <span className="bg-[#d26019] text-white text-xs font-black px-3 py-1 uppercase tracking-wider">
                                {documentRequirements?.length || 0} DOCUMENTS
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-10">NO.</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">DOCUMENT NAME</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">CATEGORY</th>

                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase text-center">STATUS</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-gray-400">
                                                <div className="w-6 h-6 border-2 border-[#23471d] border-t-transparent rounded-full animate-spin mx-auto"></div>
                                            </td>
                                        </tr>
                                    ) : !documentRequirements?.length ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-gray-400">
                                                No document requirements found.
                                            </td>
                                        </tr>
                                    ) : documentRequirements.map((d, i) => (
                                        <tr key={d._id || d.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-gray-500 font-bold">{i + 1}</td>
                                            <td className="py-3 px-4 font-bold text-gray-800">{d.document_name}</td>
                                            <td className="py-3 px-4 text-gray-600 text-xs">{d.category}</td>

                                            <td className="py-3 px-4 text-center">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${d.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                    {d.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleEdit(d)} className="text-blue-500 hover:text-blue-700 p-1 transition-colors">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(d._id || d.id)} className="text-red-500 hover:text-red-700 p-1 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
