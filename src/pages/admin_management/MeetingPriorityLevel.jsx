import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchMeetingPriorities,
    addMeetingPriority,
    updateMeetingPriority,
    deleteMeetingPriority,
} from "../../features/add_by_admin/meeting-priority/MeetingPrioritySlice";

export default function MeetingPriorityLevel() {
    const dispatch = useDispatch();
    const { meetingPriority = [], loading = false } = useSelector(
        (state) => state.meetingPriority || {}
    );
    const [form, setForm] = useState({ meeting_priority_level: "", status: "" });
    const [editingId, setEditingId] = useState(null);

    const isEditing = editingId !== null;

    useEffect(() => {
        dispatch(fetchMeetingPriorities());
    }, [dispatch]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const getMeetingPriorityLabel = (item) =>
        item?.meeting_priority_level || item?.meeting_priority || item?.priority || "";

    const handleSubmit = async () => {
        if (!form.meeting_priority_level || !form.status) return alert("Please fill all fields.");

        let adminData = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
        let adminId = sessionStorage.getItem("user_id");
        if (adminData && !adminId) {
            try {
                adminId = JSON.parse(adminData)._id || JSON.parse(adminData).id;
            } catch (e) { }
        }

        const payload = {
            ...form,
            meeting_priority: form.meeting_priority_level,
            added_by: adminId || "admin",
        };

        if (isEditing) {
            try {
                await dispatch(
                    updateMeetingPriority({ id: editingId, updatedData: payload })
                ).unwrap();
                resetForm();
            } catch (error) {
                alert(`Failed to update: ${error?.message || error}`);
            }
        } else {
            try {
                await dispatch(addMeetingPriority(payload)).unwrap();
                resetForm();
            } catch (error) {
                alert(`Failed to add: ${error?.message || error}`);
            }
        }
    };

    const handleEdit = (item) => {
        setEditingId(item._id || item.id);
        setForm({
            meeting_priority_level: getMeetingPriorityLabel(item),
            status: item.status,
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this meeting priority level?")) return;
        try {
            await dispatch(deleteMeetingPriority(id)).unwrap();
            if (editingId === id) resetForm();
        } catch (error) {
            alert("Failed to delete meeting priority level");
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({ meeting_priority_level: "", status: "" });
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-[#23471d] mb-1">Manage Meeting Priority Level</h1>
            <p className="text-gray-500 mb-6 text-sm">Manage meeting priority levels and their status</p>

            {/* Form Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 shadow-sm">
                <p className="text-sm font-medium text-gray-600 mb-4">
                    {isEditing ? `Editing: ${form.meeting_priority_level}` : "Add new meeting priority level"}
                </p>
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Meeting Priority Level <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="meeting_priority_level"
                            value={form.meeting_priority_level}
                            onChange={handleChange}
                            placeholder="e.g. High, Medium, Low"
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
                            {isEditing ? "Update Meeting Priority Level" : "+ Add Meeting Priority Level"}
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
                    <h2 className="text-white font-medium">Meeting Priority Level list</h2>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium">S.No</th>
                            <th className="text-left px-4 py-3 font-medium">Meeting Priority Level</th>
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
                        {!loading && meetingPriority.map((b, i) => (
                            <tr key={b._id || b.id} className="border-t border-gray-100">
                                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                                <td className="px-4 py-3">{getMeetingPriorityLabel(b)}</td>
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
