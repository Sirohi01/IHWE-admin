import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchSecondaryProduct,
    addSecondaryProduct,
    updateSecondaryProduct,
    deleteSecondaryProduct,
} from "../../features/add_by_admin/secondary_product/SecondaryProductSlice";

export default function SecondaryProductCategories() {
    const dispatch = useDispatch();
    const { secondaryProduct = [], loading = false } = useSelector(
        (state) => state.secondaryProduct || {}
    );
    const [form, setForm] = useState({ secondary_product_categories: "", status: "" });
    const [editingId, setEditingId] = useState(null);

    const isEditing = editingId !== null;

    useEffect(() => {
        dispatch(fetchSecondaryProduct());
    }, [dispatch]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const getSecondaryProductLabel = (item) =>
        item?.secondary_product_categories ||
        item?.secondary_product_category ||
        item?.secondary_product ||
        "";

    const handleSubmit = async () => {
        if (!form.secondary_product_categories || !form.status) return alert("Please fill all fields.");

        let adminData = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
        let adminId = sessionStorage.getItem("user_id");
        if (adminData && !adminId) {
            try {
                adminId = JSON.parse(adminData)._id || JSON.parse(adminData).id;
            } catch (e) { }
        }

        const payload = {
            ...form,
            secondary_product: form.secondary_product_categories,
            added_by: adminId || "admin",
        };

        if (isEditing) {
            try {
                await dispatch(
                    updateSecondaryProduct({ id: editingId, updatedData: payload })
                ).unwrap();
                resetForm();
            } catch (error) {
                alert(`Failed to update: ${error?.message || error}`);
            }
        } else {
            try {
                await dispatch(addSecondaryProduct(payload)).unwrap();
                resetForm();
            } catch (error) {
                alert(`Failed to add: ${error?.message || error}`);
            }
        }
    };

    const handleEdit = (item) => {
        setEditingId(item._id || item.id);
        setForm({
            secondary_product_categories: getSecondaryProductLabel(item),
            status: item.status,
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this secondary product categories?")) return;
        try {
            await dispatch(deleteSecondaryProduct(id)).unwrap();
            if (editingId === id) resetForm();
        } catch (error) {
            alert("Failed to delete secondary product categories");
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({ secondary_product_categories: "", status: "" });
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-[#23471d] mb-1">Manage Secondary Product Categories</h1>
            <p className="text-gray-500 mb-6 text-sm">Manage secondary product categories and their status</p>

            {/* Form Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 shadow-sm">
                <p className="text-sm font-medium text-gray-600 mb-4">
                    {isEditing ? `Editing: ${form.secondary_product_categories}` : "Add new secondary product categories"}
                </p>
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Secondary Product Categories <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="secondary_product_categories"
                            value={form.secondary_product_categories}
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
                            {isEditing ? "Update Secondary Product Categories" : "+ Add Secondary Product Categories"}
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
                    <h2 className="text-white font-medium">Secondary Product Categories list</h2>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium">S.No</th>
                            <th className="text-left px-4 py-3 font-medium">Secondary Product Categories</th>
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
                        {!loading && secondaryProduct.map((b, i) => (
                            <tr key={b._id || b.id} className="border-t border-gray-100">
                                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                                <td className="px-4 py-3">{getSecondaryProductLabel(b)}</td>
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
