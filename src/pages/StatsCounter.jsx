import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api, { SERVER_URL } from "../lib/api";
import { Award, Users, Briefcase, TrendingUp, ShoppingBag, Target, Zap, Heart, Plus, Image } from "lucide-react";
import PageHeader from "../components/PageHeader";


const StatsCounter = () => {
    const [counters, setCounters] = useState([]);
    const [formData, setFormData] = useState({
        number: "",
        suffix: "+",
        label: "",
        description: "",
        icon: "Award",
        image: "",
        altText: "",
        overlayColor: "#134698",
        overlayOpacity: "50",
        order: 0
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const iconOptions = [
        { value: "Award", label: "Award", icon: Award },
        { value: "Users", label: "Users", icon: Users },
        { value: "Briefcase", label: "Briefcase", icon: Briefcase },
        { value: "TrendingUp", label: "Trending Up", icon: TrendingUp },
        { value: "ShoppingBag", label: "Shopping Bag", icon: ShoppingBag },
        { value: "Target", label: "Target", icon: Target },
        { value: "Zap", label: "Zap", icon: Zap },
        { value: "Heart", label: "Heart", icon: Heart }
    ];

    useEffect(() => {
        fetchCounters();
    }, []);

    const fetchCounters = async () => {
        try {
            const response = await api.get("/api/stats-counter");
            if (response.data.success) {
                setCounters(response.data.data.counters || []);
            }
        } catch (error) {
            console.error("Error fetching counters:", error);
            Swal.fire("Error", "Failed to fetch counters", "error");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return formData.image;

        const imageFormData = new FormData();
        imageFormData.append("image", imageFile);

        try {
            const response = await api.post("/api/stats-counter/images", imageFormData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return response.data.data.url;
        } catch (error) {
            throw new Error("Image upload failed");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const imageUrl = await uploadImage();
            const payload = { ...formData, image: imageUrl };

            if (editingId) {
                await api.put(`/api/stats-counter/cards/${editingId}`, payload);
                Swal.fire("Success", "Counter updated successfully", "success");
            } else {
                await api.post("/api/stats-counter/cards", payload);
                Swal.fire("Success", "Counter added successfully", "success");
            }

            resetForm();
            fetchCounters();
        } catch (error) {
            Swal.fire("Error", error.message || "Operation failed", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (counter) => {
        setFormData({
            number: counter.number,
            suffix: counter.suffix,
            label: counter.label,
            description: counter.description,
            icon: counter.icon,
            image: counter.image,
            altText: counter.altText,
            overlayColor: counter.overlayColor,
            overlayOpacity: counter.overlayOpacity,
            order: counter.order
        });
        setImagePreview(counter.image.startsWith('http') ? counter.image : `${SERVER_URL}${counter.image}`);
        setEditingId(counter._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This counter will be deleted permanently!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/api/stats-counter/cards/${id}`);
                Swal.fire("Deleted!", "Counter has been deleted.", "success");
                fetchCounters();
            } catch (error) {
                Swal.fire("Error", "Failed to delete counter", "error");
            }
        }
    };

    const resetForm = () => {
        setFormData({
            number: "",
            suffix: "+",
            label: "",
            description: "",
            icon: "Award",
            image: "",
            altText: "",
            overlayColor: "#134698",
            overlayOpacity: "50",
            order: 0
        });
        setImageFile(null);
        setImagePreview("");
        setEditingId(null);
    };

    // Calculate dynamic rows for text area if needed, but fixed height is good too
    const inputClass = "w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm";
    const labelClass = "block text-xs font-medium text-gray-700 mb-1";

    return (
        <div className="bg-white shadow-md mt-6 p-6">
            <div className="w-full">
                <PageHeader
                    title="STATS COUNTER MANAGEMENT"
                    description="Manage counter cards for the statistics section"
                />

                {/* Add/Edit Form */}
                <div className="bg-white border-2 border-gray-200 p-6 mb-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50">
                            <Image className="w-4 h-4 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {editingId ? "Edit Counter Card" : "Add New Counter Card"}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Number */}
                            <div>
                                <label className={labelClass}>NUMBER <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    name="number"
                                    value={formData.number}
                                    onChange={handleInputChange}
                                    className={inputClass}
                                    required
                                />
                            </div>

                            {/* Suffix */}
                            <div>
                                <label className={labelClass}>SUFFIX</label>
                                <input
                                    type="text"
                                    name="suffix"
                                    value={formData.suffix}
                                    onChange={handleInputChange}
                                    placeholder="e.g., +, %, K"
                                    className={inputClass}
                                />
                            </div>

                            {/* Icon */}
                            <div>
                                <label className={labelClass}>ICON</label>
                                <select
                                    name="icon"
                                    value={formData.icon}
                                    onChange={handleInputChange}
                                    className={inputClass}
                                >
                                    {iconOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Label */}
                            <div>
                                <label className={labelClass}>LABEL <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="label"
                                    value={formData.label}
                                    onChange={handleInputChange}
                                    className={inputClass}
                                    required
                                />
                            </div>

                            {/* Overlay Color */}
                            <div>
                                <label className={labelClass}>OVERLAY COLOR</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        name="overlayColor"
                                        value={formData.overlayColor}
                                        onChange={handleInputChange}
                                        className="h-9 w-20 p-1 border-2 border-gray-300 rounded cursor-pointer"
                                    />
                                    <span className="text-xs text-gray-500 uppercase">{formData.overlayColor}</span>
                                </div>
                            </div>

                            {/* Overlay Opacity */}
                            <div>
                                <label className={labelClass}>
                                    OVERLAY OPACITY ({formData.overlayOpacity}%)
                                </label>
                                <select
                                    name="overlayOpacity"
                                    value={formData.overlayOpacity}
                                    onChange={handleInputChange}
                                    className={inputClass}
                                >
                                    <option value="30">30% - Light</option>
                                    <option value="40">40%</option>
                                    <option value="50">50% - Medium</option>
                                    <option value="60">60%</option>
                                    <option value="70">70% - Dark</option>
                                    <option value="80">80% - Very Dark</option>
                                </select>
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className={labelClass}>DESCRIPTION <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className={inputClass}
                                    required
                                />
                            </div>

                            {/* Alt Text */}
                            <div className="md:col-span-2">
                                <label className={labelClass}>ALT TEXT <span className="text-gray-400 text-xs">(SEO)</span></label>
                                <input
                                    type="text"
                                    name="altText"
                                    value={formData.altText}
                                    onChange={handleInputChange}
                                    placeholder="Descriptive text for image"
                                    className={inputClass}
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">IMAGE</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-sm shadow-lg"
                                />
                                {imagePreview && (
                                    <div className="mt-4">
                                        <img src={imagePreview} alt="Preview" className="h-32 w-auto border-2 border-gray-300 shadow-lg object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-end gap-3 mt-6">
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 bg-gray-500 text-white font-bold transition-all shadow-lg hover:shadow-xl uppercase tracking-wider text-sm"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-3 bg-[#9E2A3A] text-white font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        <span>{editingId ? "Update Counter" : "Add Counter"}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Counters Table */}
                <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-lg">
                    <div className="px-6 py-4 border-b bg-[#1e3a8a]">
                        <h2 className="text-lg font-semibold text-white">Counter Cards List</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Label</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Icon</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Overlay</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {counters.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            No counters found. Add your first counter using the form above.
                                        </td>
                                    </tr>
                                ) : (
                                    counters.map((counter) => (
                                        <tr key={counter._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-lg font-bold text-gray-900">{counter.number}{counter.suffix}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{counter.label}</div>
                                                <div className="text-xs text-gray-500">{counter.description}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                                    {counter.icon}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-6 h-6 rounded border border-gray-300"
                                                        style={{ backgroundColor: counter.overlayColor }}
                                                    />
                                                    <span className="text-xs text-gray-600">{counter.overlayOpacity}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(counter)}
                                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(counter._id)}
                                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsCounter;
