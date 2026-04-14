import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchPrimaryProduct,
    addPrimaryProduct,
    updatePrimaryProduct,
    deletePrimaryProduct,
} from "../../features/add_by_admin/primary_product/PrimaryProductSlice";

export default function PrimaryProductInterest() {
    const dispatch = useDispatch();
    const { primaryProduct = [], loading = false } = useSelector(
        (state) => state.primaryProduct || {}
    );
    const [form, setForm] = useState({ primary_product_interest: "", status: "" });
    const [editingId, setEditingId] = useState(null);

    const isEditing = editingId !== null;

    useEffect(() => {
        dispatch(fetchPrimaryProduct());
    }, [dispatch]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const getPrimaryProductLabel = (item) =>
        item?.primary_product_interest || item?.primary_product || "";

    const handleSubmit = async () => {
        if (!form.primary_product_interest || !form.status) return alert("Please fill all fields.");

        let adminData = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
        let adminId = sessionStorage.getItem("user_id");
        if (adminData && !adminId) {
            try {
                adminId = JSON.parse(adminData)._id || JSON.parse(adminData).id;
            } catch (e) { }
        }

        const payload = {
            ...form,
            primary_product: form.primary_product_interest,
            added_by: adminId || "admin",
        };

        if (isEditing) {
            try {
                await dispatch(
                    updatePrimaryProduct({ id: editingId, updatedData: payload })
                ).unwrap();
                resetForm();
            } catch (error) {
                alert(`Failed to update: ${error?.message || error}`);
            }
        } else {
            try {
                await dispatch(addPrimaryProduct(payload)).unwrap();
                resetForm();
            } catch (error) {
                alert(`Failed to add: ${error?.message || error}`);
            }
        }
    };

    const handleEdit = (item) => {
        setEditingId(item._id || item.id);
        setForm({
            primary_product_interest: getPrimaryProductLabel(item),
            status: item.status,
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this primary product interest?")) return;
        try {
            await dispatch(deletePrimaryProduct(id)).unwrap();
            if (editingId === id) resetForm();
        } catch (error) {
            alert("Failed to delete primary product interest");
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({ primary_product_interest: "", status: "" });
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-[#23471d] mb-1">Manage Primary Product Interest</h1>
            <p className="text-gray-500 mb-6 text-sm">Manage primary product interest and their status</p>

            {/* Form Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 shadow-sm">
                <p className="text-sm font-medium text-gray-600 mb-4">
                    {isEditing ? `Editing: ${form.primary_product_interest}` : "Add new primary product interest"}
                </p>
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Primary Product Interest <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="primary_product_interest"
                            value={form.primary_product_interest}
                            onChange={handleChange}
                            placeholder="e.g. Retail, Manufacturing"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#134698] text-sm"
                        />
                    </div>

                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#134698] text-sm bg-white"
                        >
                            <option value="">Select status</option>
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
                            {isEditing ? "Update Primary Product Interest" : "+ Add Primary Product Interest"}
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
                    <h2 className="text-white font-medium">Primary Product Interest list</h2>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium">S.No</th>
                            <th className="text-left px-4 py-3 font-medium">Primary Product Interest</th>
                            <th className="text-left px-4 py-3 font-medium">Status</th>
                            <th className="text-left px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan="4" className="px-4 py-3 text-center text-gray-500">Loading...</td>
                            </tr>
                        )}
                        {!loading && primaryProduct.map((b, i) => (
                            <tr key={b._id || b.id} className="border-t border-gray-100">
                                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                                <td className="px-4 py-3">{getPrimaryProductLabel(b)}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.status === "Active"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {b.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(b)}
                                        className="px-3 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(b._id || b.id)}
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
