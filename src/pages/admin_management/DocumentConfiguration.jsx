import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchDocumentRequirements,
    addDocumentRequirement,
    updateDocumentRequirement,
    deleteDocumentRequirement,
} from "../../features/add_by_admin/document-requirements/DocumentRequirementSlice";

export default function DocumentConfiguration() {
    const dispatch = useDispatch();
    const { documentRequirements = [], loading = false } = useSelector(
        (state) => state.documentRequirements || {}
    );
    const [form, setForm] = useState({ document_name: "", category: "", order: 0, status: "Active" });
    const [editingId, setEditingId] = useState(null);

    const isEditing = editingId !== null;

    useEffect(() => {
        dispatch(fetchDocumentRequirements());
    }, [dispatch]);

    const handleChange = (e) => {
        const value = e.target.name === "order" ? parseInt(e.target.value) || 0 : e.target.value;
        setForm({ ...form, [e.target.name]: value });
    };

    const handleSubmit = async () => {
        if (!form.document_name || !form.category || !form.status) return alert("Please fill all fields.");

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
                dispatch(fetchDocumentRequirements());
                resetForm();
            } catch (error) {
                alert(`Failed to update: ${error?.message || error}`);
            }
        } else {
            try {
                await dispatch(addDocumentRequirement(payload)).unwrap();
                dispatch(fetchDocumentRequirements());
                resetForm();
            } catch (error) {
                alert(`Failed to add: ${error?.message || error}`);
            }
        }
    };

    const handleEdit = (item) => {
        setEditingId(item._id || item.id);
        setForm({
            document_name: item.document_name,
            category: item.category,
            order: item.order || 0,
            status: item.status,
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this document requirement?")) return;
        try {
            await dispatch(deleteDocumentRequirement(id)).unwrap();
            if (editingId === id) resetForm();
        } catch (error) {
            alert("Failed to delete document requirement");
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({ document_name: "", category: "", order: 0, status: "Active" });
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-[#23471d] mb-1">Manage Document Configuration</h1>
            <p className="text-gray-500 mb-6 text-sm">Manage required documents for clients</p>

            {/* Form Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 shadow-sm">
                <p className="text-sm font-medium text-gray-600 mb-4">
                    {isEditing ? `Editing: ${form.document_name}` : "Add new document requirement"}
                </p>
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Document Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="document_name"
                            value={form.document_name}
                            onChange={handleChange}
                            placeholder="e.g. Udyam Certificate, GST"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#134698] text-sm"
                        />
                    </div>

                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#134698] text-sm bg-white"
                        >
                            <option value="">Select Category</option>
                            <option value="MSME Related Documents">MSME Related Documents</option>
                            <option value="General Documents">General Documents</option>
                        </select>
                    </div>

                    <div className="flex-1 min-w-[80px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Order
                        </label>
                        <input
                            type="number"
                            name="order"
                            value={form.order}
                            onChange={handleChange}
                            placeholder="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#134698] text-sm"
                        />
                    </div>

                    <div className="flex-1 min-w-[120px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#134698] text-sm bg-white"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleSubmit}
                            className={`px-5 py-2 text-white text-sm font-medium rounded ${isEditing ? "bg-[#134698] hover:bg-[#0f3a7a]" : "bg-[#d26019] hover:bg-[#b04e14]"
                                }`}
                        >
                            {isEditing ? "Update Document" : "+ Add Document"}
                        </button>
                        {isEditing && (
                            <button
                                onClick={resetForm}
                                className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-[#23471d] px-5 py-3">
                    <h2 className="text-white font-medium">Document Configuration List</h2>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium">S.No</th>
                            <th className="text-left px-4 py-3 font-medium">Document Name</th>
                            <th className="text-left px-4 py-3 font-medium">Category</th>
                            <th className="text-left px-4 py-3 font-medium">Order</th>
                            <th className="text-left px-4 py-3 font-medium">Status</th>
                            <th className="text-left px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan="6" className="px-4 py-3 text-center text-gray-500">Loading...</td>
                            </tr>
                        )}
                        {!loading && documentRequirements.map((d, i) => (
                            <tr key={d._id || d.id} className="border-t border-gray-100">
                                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                                <td className="px-4 py-3 font-medium">{d.document_name}</td>
                                <td className="px-4 py-3 text-gray-600">{d.category}</td>
                                <td className="px-4 py-3 text-gray-600">{d.order || 0}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.status === "Active"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {d.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(d)}
                                        className="px-3 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(d._id || d.id)}
                                        className="px-3 py-1 border border-red-200 rounded text-xs text-red-600 hover:bg-red-50"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
