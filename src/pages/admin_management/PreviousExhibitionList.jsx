import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Edit3, Plus, Search, Trash2, X } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../lib/api";

const EMPTY_FORM = { name: "", year: "", status: "Active" };

const formatDateTime = (value) => value
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(new Date(value))
    : "—";

export default function PreviousExhibitionList() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);

    const loadItems = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/api/previous-exhibitions");
            setItems(data.data || []);
        } catch (error) {
            Swal.fire("Error", error.response?.data?.message || "Could not load exhibitions.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadItems(); }, []);

    useEffect(() => {
        if (!showModal) return;
        const handleEscape = (event) => {
            if (event.key === "Escape" && !saving) {
                setShowModal(false);
                setEditingId(null);
                setForm(EMPTY_FORM);
            }
        };
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleEscape);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleEscape);
        };
    }, [showModal, saving]);

    const filteredItems = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return items;
        return items.filter((item) =>
            [
                item.name,
                item.year,
                item.status,
                item.createdBy?.fullName,
                item.createdBy?.username,
                item.updatedBy?.fullName,
                item.updatedBy?.username
            ]
                .some((value) => String(value || "").toLowerCase().includes(term))
        );
    }, [items, search]);

    const resetForm = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setShowModal(false);
    };

    const openAddModal = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!form.name.trim() || !form.year) {
            return Swal.fire("Required", "Name and year are required.", "warning");
        }

        setSaving(true);
        try {
            const payload = { ...form, year: Number(form.year) };
            if (editingId) {
                await api.put(`/api/previous-exhibitions/${editingId}`, payload);
            } else {
                await api.post("/api/previous-exhibitions", payload);
            }
            await loadItems();
            resetForm();
            Swal.fire({
                icon: "success",
                title: editingId ? "Updated" : "Created",
                timer: 1200,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire("Error", error.response?.data?.message || "Could not save exhibition.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setForm({
            name: item.name,
            year: String(item.year),
            status: item.status
        });
        setShowModal(true);
    };

    const handleDelete = async (item) => {
        const result = await Swal.fire({
            title: "Delete exhibition?",
            text: `${item.name} (${item.year})`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            confirmButtonText: "Delete"
        });
        if (!result.isConfirmed) return;
        try {
            await api.delete(`/api/previous-exhibitions/${item._id}`);
            if (editingId === item._id) resetForm();
            await loadItems();
        } catch (error) {
            Swal.fire("Error", error.response?.data?.message || "Could not delete exhibition.", "error");
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <CalendarDays className="text-[#23471d]" />
                        Previous Exhibition List
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage the searchable Previous Exhibition dropdown shown on Book A Stand.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#23471d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#183314]"
                >
                    <Plus size={17} />
                    Add Exhibition
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <h2 className="font-semibold text-slate-800">All exhibitions ({filteredItems.length})</h2>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search records or users..."
                            className="w-full sm:w-72 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm outline-none"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1050px] text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                {["S.No.", "Exhibition Name", "Year", "Status", "Modified At", "Actions"].map((head) => (
                                    <th key={head} className="text-left px-4 py-3 font-semibold">{head}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-500">Loading...</td></tr>
                            ) : filteredItems.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-500">No exhibitions found.</td></tr>
                            ) : filteredItems.map((item, index) => (
                                <tr key={item._id} className="border-t border-slate-100 hover:bg-slate-50/60">
                                    <td className="px-4 py-3 text-slate-400">{index + 1}</td>
                                    <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                                    <td className="px-4 py-3">{item.year}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === "Active"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-slate-200 text-slate-600"}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {new Date(item.updatedAt).getTime() > new Date(item.createdAt).getTime() ? (
                                            <>
                                                <div className="font-medium text-slate-800">
                                                    {item.updatedBy?.fullName || item.updatedBy?.username || "System"}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    Updated: {formatDateTime(item.updatedAt)}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="font-medium text-slate-800">
                                                    {item.createdBy?.fullName || item.createdBy?.username || "System"}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    Created: {formatDateTime(item.createdAt)}
                                                </div>
                                            </>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100" title="Edit">
                                                <Edit3 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(item)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100" title="Delete">
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

            {showModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !saving) resetForm();
                    }}
                >
                    <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    {editingId ? "Edit Exhibition" : "Add Exhibition"}
                                </h2>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    Enter the exhibition name, year and status.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={saving}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 p-5">
                            <label className="block text-sm font-medium text-slate-700">
                                Exhibition Name <span className="text-red-500">*</span>
                                <input
                                    autoFocus
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    maxLength={150}
                                    placeholder="International Health & Wellness Expo"
                                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-[#23471d] focus:ring-2 focus:ring-[#23471d]/15"
                                />
                            </label>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <label className="block text-sm font-medium text-slate-700">
                                    Year <span className="text-red-500">*</span>
                                    <input
                                        type="number"
                                        min="1900"
                                        max="2200"
                                        value={form.year}
                                        onChange={(e) => setForm({ ...form, year: e.target.value })}
                                        placeholder="2025"
                                        className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-[#23471d] focus:ring-2 focus:ring-[#23471d]/15"
                                    />
                                </label>
                                <label className="block text-sm font-medium text-slate-700">
                                    Status
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-[#23471d] focus:ring-2 focus:ring-[#23471d]/15"
                                    >
                                        <option>Active</option>
                                        <option>Inactive</option>
                                    </select>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={saving}
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-lg bg-[#23471d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#183314] disabled:opacity-60"
                            >
                                {editingId ? <Edit3 size={16} /> : <Plus size={16} />}
                                {saving ? "Saving..." : editingId ? "Update Exhibition" : "Add Exhibition"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
