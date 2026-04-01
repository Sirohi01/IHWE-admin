import { useState, useEffect } from "react";
import { 
    TrendingUp, Plus, Trash2, Edit, Save, Globe, Users, Heart, Image as ImageIcon, 
    Type, Hash, Zap, Layout
} from "lucide-react";
import Swal from "sweetalert2";
import api, { SERVER_URL } from "../lib/api";
import PageHeader from "../components/PageHeader";

const ICON_OPTIONS = [
    { label: "Globe", value: "Globe", icon: Globe },
    { label: "Users", value: "Users", icon: Users },
    { label: "TrendingUp", value: "TrendingUp", icon: TrendingUp },
    { label: "Heart", value: "Heart", icon: Heart },
];

const EMPTY_FORM = {
    icon: "Globe",
    end: "",
    suffix: "+",
    label: "",
    altText: "",
    overlay: 0.4,
    image: null,
};

const StatsManage = () => {
    const [counters, setCounters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [isEditing, setIsEditing] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        fetchCounters();
    }, []);

    const fetchCounters = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/counters");
            if (res.data.success) {
                setCounters(res.data.data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm({ ...form, image: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.label || !form.end || (!isEditing && !form.image)) {
            Swal.fire("Warning", "Please fill all required fields", "warning");
            return;
        }

        const formData = new FormData();
        formData.append("icon", form.icon);
        formData.append("end", form.end);
        formData.append("suffix", form.suffix);
        formData.append("label", form.label);
        formData.append("altText", form.altText);
        formData.append("overlay", form.overlay);
        if (form.image) formData.append("image", form.image);

        setLoading(true);
        try {
            let res;
            if (isEditing) {
                res = await api.put(`/api/counters/${isEditing}`, formData);
            } else {
                res = await api.post("/api/counters", formData);
            }

            if (res.data.success) {
                Swal.fire({ icon: "success", title: isEditing ? "Updated!" : "Added!", timer: 1500, showConfirmButton: false });
                resetForm();
                fetchCounters();
            }
        } catch (error) {
            Swal.fire("Error", "Failed to save counter", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setIsEditing(item._id || item.id);
        setForm({
            icon: item.icon,
            end: item.end,
            suffix: item.suffix,
            label: item.label,
            altText: item.altText || "",
            overlay: item.overlay || 0.4,
            image: null,
        });
        setPreview(`${SERVER_URL}${item.bg}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (origId) => {
        // Support both _id and id (some serializers rename it)
        const id = origId || null;
        if (!id) {
            Swal.fire("Error", "Missing Counter ID - this item cannot be deleted normally.", "error");
            return;
        }
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This will permanently delete this counter.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                const res = await api.delete(`/api/counters/${id}`);
                if (res.data.success) {
                    Swal.fire({ icon: "success", title: "Deleted!", timer: 1200, showConfirmButton: false });
                    fetchCounters();
                }
            } catch (error) {
                Swal.fire("Error", error.response?.data?.message || "Failed to delete counter", "error");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCleanup = async () => {
        const result = await Swal.fire({
            title: "Corrupted Data Cleanup",
            text: "This will remove all blank items without labels/numbers. Proceed?",
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#EF4444",
            confirmButtonText: "Yes, Cleanup"
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                const res = await api.get("/api/counters/cleanup");
                if (res.data.success) {
                    Swal.fire({ icon: "success", title: "Cleanup Success!", text: res.data.message, timer: 1500, showConfirmButton: false });
                    fetchCounters();
                }
            } catch (error) {
                Swal.fire("Error", "Cleanup failed", "error");
            } finally {
                setLoading(false);
            }
        }
    };


    const resetForm = () => {
        setIsEditing(null);
        setForm({ ...EMPTY_FORM });
        setPreview(null);
    };

    const SelectedIcon = ICON_OPTIONS.find(i => i.value === form.icon)?.icon || Globe;

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader 
                title="COUNTERS MANAGEMENT" 
                description="Manage statistics and achievement counters for home section" 
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* LEFT: Add/Edit Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
                            {isEditing ? <Edit className="w-5 h-5 text-[#d26019]" /> : <Plus className="w-5 h-5 text-[#d26019]" />}
                            {isEditing ? "Edit Counter" : "Add New Counter"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Icon Selection */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Icon</label>
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-[#23471d]">
                                        <SelectedIcon size={20} />
                                    </div>
                                    <select
                                        value={form.icon}
                                        onChange={(e) => setForm({ ...form, icon: e.target.value })}
                                        className="flex-1 px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                    >
                                        {ICON_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Number & Suffix */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                        <Hash size={12} /> Target Number
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 25"
                                        value={form.end}
                                        onChange={(e) => setForm({ ...form, end: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Suffix</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. +"
                                        value={form.suffix}
                                        onChange={(e) => setForm({ ...form, suffix: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                    />
                                </div>
                            </div>

                            {/* Label */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                    <Type size={12} /> Label
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Countries Represented"
                                    value={form.label}
                                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                />
                            </div>

                            {/* Background Image */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                    <ImageIcon size={12} /> Background Image
                                </label>
                                <div className="space-y-3">
                                    {preview && (
                                        <div className="relative w-full h-32 border-2 border-dashed border-gray-300 overflow-hidden group">
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <label className="cursor-pointer text-white text-xs font-bold underline">Change</label>
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-[#23471d]/10 file:text-[#23471d] hover:file:bg-[#23471d]/20"
                                        accept="image/*"
                                    />
                                </div>
                            </div>

                            {/* Alt Text & Overlay */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                        <Layout size={12} /> Alt Text
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="SEO Description"
                                        value={form.altText}
                                        onChange={(e) => setForm({ ...form, altText: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                        <Zap size={12} /> Overlay (0-1)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="1"
                                        value={form.overlay}
                                        onChange={(e) => setForm({ ...form, overlay: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-2.5 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        : isEditing ? <><Save className="w-4 h-4" /> Update Counter</> : <><Plus className="w-4 h-4" /> Add Counter</>}
                                </button>
                                {isEditing && (
                                    <button onClick={resetForm} type="button" className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* RIGHT: Table List */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm">
                        <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2 text-sm">
                                <TrendingUp className="w-4 h-4" /> Counters List
                            </h2>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handleCleanup}
                                    className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest transition-all"
                                    title="Delete all blank/corrupted items"
                                >
                                    Cleanup
                                </button>
                                <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest">
                                    {counters.length} ITEMS
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 font-bold text-gray-500 uppercase w-10">NO.</th>
                                        <th className="text-left py-3 px-4 font-bold text-gray-500 uppercase">ICON</th>
                                        <th className="text-left py-3 px-4 font-bold text-gray-500 uppercase">BG IMAGE</th>
                                        <th className="text-left py-3 px-4 font-bold text-gray-500 uppercase">TITLE & VALUE</th>
                                        <th className="text-left py-3 px-4 font-bold text-gray-500 uppercase">OVERLAY</th>
                                        <th className="text-center py-3 px-4 font-bold text-gray-500 uppercase w-24">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!counters.length ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-gray-400">
                                                No counters found. Create your first statistics card.
                                            </td>
                                        </tr>
                                    ) : counters.map((item, idx) => {
                                        const ItemIcon = ICON_OPTIONS.find(i => i.value === item.icon)?.icon || Globe;
                                        return (
                                            <tr key={item._id || item.id || idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-4 font-bold text-gray-400">{idx + 1}</td>
                                                <td className="py-4 px-4 text-[#23471d]">
                                                    <div className="w-8 h-8 rounded-full bg-[#23471d]/10 flex items-center justify-center">
                                                        <ItemIcon size={14} />
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="w-16 h-10 rounded-lg overflow-hidden border border-gray-200">
                                                        <img src={`${SERVER_URL}${item.bg}`} alt={item.altText} className="w-full h-full object-cover" />
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <p className="font-bold text-gray-900 text-sm">{item.end}{item.suffix}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase font-black">{item.label}</p>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="bg-gray-100 px-2 py-1 rounded font-bold text-gray-600 tracking-tighter">
                                                        {item.overlay * 100}%
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700 p-1.5 bg-blue-50 rounded-lg transition-colors">
                                                            <Edit size={14} />
                                                        </button>
                                                        <button onClick={() => handleDelete(item._id || item.id)} className="text-red-500 hover:text-red-700 p-1.5 bg-red-50 rounded-lg transition-colors">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsManage;
