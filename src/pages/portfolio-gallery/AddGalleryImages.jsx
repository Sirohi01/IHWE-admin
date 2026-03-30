import { useState, useEffect } from "react";
import { UploadCloud, X, LayoutGrid, ChevronLeft, Camera } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../lib/api";
import PageHeader from "../../components/PageHeader";

const AddGalleryImages = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [images, setImages] = useState([]);
    const [altTexts, setAltTexts] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Pre-fill category if navigating from the category table's "Add Images" button
    useEffect(() => {
        if (location.state?.categoryId) {
            setSelectedCategory(location.state.categoryId);
        }
    }, [location.state]);

    // Fetch Gallery Categories from new API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get("/api/gallery-category");
                if (res.data.success) setCategories(res.data.data);
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCategories();
    }, []);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 10) {
            Swal.fire("Warning", "Max 10 images at a time", "warning");
            return;
        }
        setImages((prev) => [...prev, ...files]);
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setAltTexts((prev) => {
            const next = { ...prev };
            delete next[index];
            return next;
        });
    };

    const handleAltTextChange = (index, value) => {
        setAltTexts((prev) => ({ ...prev, [index]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCategory || images.length === 0) {
            Swal.fire("Error", "Please select a gallery category and upload at least one image", "error");
            return;
        }

        setIsLoading(true);
        try {
            // Upload images one by one to the main gallery API, grouped by category title
            const uploadPromises = images.map(async (file, idx) => {
                const formData = new FormData();
                formData.append("file", file);
                const uploadRes = await api.post("/api/gallery/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                return {
                    imageUrl: uploadRes.data.url,
                    altText: altTexts[idx] || ""
                };
            });

            const uploadedImages = await Promise.all(uploadPromises);

            // Now create gallery items for each uploaded image
            const createPromises = uploadedImages.map((imgData) =>
                api.post("/api/gallery", {
                    title: selectedCategory,
                    description: "",
                    category: "photo",
                    mediaType: "image",
                    image: imgData.imageUrl,
                    imageAlt: imgData.altText
                })
            );
            await Promise.all(createPromises);

            Swal.fire({ icon: "success", title: `${images.length} Image${images.length > 1 ? 's' : ''} Added!`, timer: 1800, showConfirmButton: false });
            setImages([]);
            setAltTexts({});
            navigate("/gallery-list");
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || "Something went wrong", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const isCategoryLocked = !!location.state?.categoryId;

    return (
        <div className="bg-white shadow-md p-6 mt-6 min-h-screen">
            <div className="flex items-center justify-between mb-6">
                <PageHeader
                    title="ADD GALLERY IMAGES"
                    description="Upload images into a gallery event category"
                />
                <button
                    onClick={() => navigate('/gallery-category')}
                    className="flex items-center gap-2 text-gray-500 hover:text-[#1A3263] font-bold text-xs uppercase transition-colors"
                >
                    <ChevronLeft size={16} /> Back to Categories
                </button>
            </div>

            <div className="bg-white rounded-sm shadow-lg border-2 border-gray-200 p-6 md:p-8 space-y-8">

                <div className="grid md:grid-cols-2 gap-8">
                    {/* STEP 1: SELECT CATEGORY */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <LayoutGrid size={18} className="text-[#134698]" />
                            Select Gallery Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            disabled={isCategoryLocked}
                            className={`w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1A3263] transition-all cursor-pointer ${isCategoryLocked ? 'opacity-70 cursor-not-allowed bg-gray-50' : ''}`}
                            required
                        >
                            <option value="">-- Choose Gallery Category --</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat.title}>
                                    {cat.title} {cat.heading ? `(${cat.heading})` : ''}
                                </option>
                            ))}
                        </select>
                        {isCategoryLocked && (
                            <p className="text-[11px] text-[#23471d] font-semibold">
                                ✓ Category pre-selected: <strong>{selectedCategory}</strong>
                            </p>
                        )}
                    </div>

                    {/* STEP 2: UPLOAD */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <UploadCloud size={18} className="text-[#134698]" />
                            Upload Images <span className="text-red-500">*</span>
                        </label>
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-5 bg-gray-50 text-center hover:bg-gray-100 transition-all cursor-pointer group"
                            onClick={() => document.getElementById('multiImgInput').click()}
                        >
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 group-hover:text-[#134698] transition-colors">
                                    <Camera size={20} />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-sm font-bold text-gray-700">Click to Upload Images</h3>
                                    <p className="text-gray-500 text-[10px]">Select up to 10 images (JPG, PNG, WEBP)</p>
                                </div>
                            </div>
                            <input
                                type="file"
                                id="multiImgInput"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>
                </div>

                {/* STEP 3: IMAGE PREVIEW */}
                {images.length > 0 && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between border-b-2 border-gray-100 pb-3">
                            <label className="text-sm font-bold text-[#134698] flex items-center gap-2">
                                <LayoutGrid size={18} />
                                Selected Images ({images.length})
                            </label>
                            <span className="text-xs text-gray-400 italic">Add SEO alt text for each image</span>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {images.map((file, idx) => (
                                <div key={idx} className="relative bg-white p-3 rounded-md border-2 border-gray-200 shadow-sm hover:border-[#134698] transition-all">
                                    <div className="relative mb-3">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt="preview"
                                            className="w-full h-36 object-cover rounded-md border border-gray-100"
                                        />
                                        <button
                                            onClick={() => removeImage(idx)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 shadow-lg border-2 border-white"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 truncate uppercase italic mb-1">{file.name}</p>
                                    <input
                                        type="text"
                                        placeholder="Alt tag for SEO..."
                                        className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 focus:bg-white focus:outline-none focus:border-[#134698] text-xs rounded transition-all"
                                        value={altTexts[idx] || ""}
                                        onChange={(e) => handleAltTextChange(idx, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 4: SUBMIT */}
                <div className="pt-4 border-t-2 border-gray-100">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !selectedCategory || images.length === 0}
                        className="w-full bg-[#1e3a8a] text-white font-bold py-4 shadow-lg hover:bg-[#152c69] transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 rounded-sm"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                UPLOADING...
                            </>
                        ) : (
                            <>
                                <UploadCloud size={22} />
                                {images.length > 0
                                    ? `UPLOAD ${images.length} IMAGE${images.length > 1 ? 'S' : ''} TO "${selectedCategory || 'GALLERY'}"`
                                    : "SELECT IMAGES TO UPLOAD"}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddGalleryImages;
