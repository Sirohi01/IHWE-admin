import { useState } from "react";

const initialData = [
    { id: 1, primary_product_interest: "Ayurveda", status: "Active" },
    { id: 2, primary_product_interest: "Pharma", status: "Inactive" },
    { id: 3, primary_product_interest: "Cosmetics", status: "Active" },
    { id: 4, primary_product_interest: "Organic", status: "Inactive" },
    { id: 5, primary_product_interest: "Wellness", status: "Active" },
];

export default function PrimaryProductInterest() {
    const [primaryProductInterests, setPrimaryProductInterests] = useState(initialData);
    const [form, setForm] = useState({ primary_product_interest: "", status: "" });
    const [editingId, setEditingId] = useState(null);

    const isEditing = editingId !== null;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        if (!form.primary_product_interest || !form.status) return alert("Please fill all fields.");

        if (isEditing) {
            setPrimaryProductInterests((prev) =>
                prev.map((b) => (b.id === editingId ? { ...b, ...form } : b))
            );
            resetForm();
        } else {
            setPrimaryProductInterests((prev) => [
                ...prev,
                { id: Date.now(), ...form },
            ]);
            setForm({ primary_product_interest: "", status: "" });
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setForm({ primary_product_interest: item.primary_product_interest, status: item.status });
    };

    const handleDelete = (id) => {
        if (!window.confirm("Delete this annual turnover?")) return;
        setPrimaryProductInterests((prev) => prev.filter((b) => b.id !== id));
        if (editingId === id) resetForm();
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({ primary_product_interest: "", status: "" });
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-[#23471d] mb-1">Manage Annual Turnover</h1>
            <p className="text-gray-500 mb-6 text-sm">Manage annual turnover and their status</p>

            {/* Form Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 shadow-sm">
                <p className="text-sm font-medium text-gray-600 mb-4">
                    {isEditing ? `Editing: ${form.primary_product_interest}` : "Add new annual turnover"}
                </p>
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Annual Turnover <span className="text-red-500">*</span>
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
                    <h2 className="text-white font-medium">Annual Turnover list</h2>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium">S.No</th>
                            <th className="text-left px-4 py-3 font-medium">Annual Turnover</th>
                            <th className="text-left px-4 py-3 font-medium">Status</th>
                            <th className="text-left px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {primaryProductInterests.map((b, i) => (
                            <tr key={b.id} className="border-t border-gray-100">
                                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                                <td className="px-4 py-3">{b.primary_product_interest}</td>
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
                                        onClick={() => handleDelete(b.id)}
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