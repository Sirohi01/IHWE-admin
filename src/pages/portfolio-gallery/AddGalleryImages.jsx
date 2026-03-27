import { useState, useEffect } from "react";
import { List, UploadCloud, X, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../lib/api";
import PageHeader from "../../components/PageHeader";

const AddGalleryImages = () => {
    const navigate = useNavigate();
    const [galleries, setGalleries] = useState([]);
    const [selectedGallery, setSelectedGallery] = useState("");
    const [images, setImages] = useState([]);
    const [altTexts, setAltTexts] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Fetch Existing Galleries for Dropdown
    useEffect(() => {
        const fetchGalleries = async () => {
            try {
                const response = await api.get("/api/portfolio-gallery/all");
                if (response.data.success) {
                    setGalleries(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch galleries", error);
            }
        };
        fetchGalleries();
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
        // Also remove alt text logic if needed, but keeping it simple
    };

    const handleAltTextChange = (index, value) => {
        setAltTexts((prev) => ({ ...prev, [index]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedGallery || images.length === 0) {
            Swal.fire("Error", "Please select a gallery and upload images", "error");
            return;
        }

        const formData = new FormData();
        formData.append("galleryId", selectedGallery);

        // Create ordered array of alt texts matching the files
        const altTextArray = images.map((_, idx) => altTexts[idx] || "");
        formData.append("altTexts", JSON.stringify(altTextArray));

        images.forEach((file) => {
            formData.append("images", file);
        });

        try {
            setIsLoading(true);
            const response = await api.post("/api/portfolio-gallery/add-images", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data.success) {
                Swal.fire("Success", "Images Added Successfully!", "success");
                setImages([]);
                setAltTexts({});
                navigate("/gallery-list");
            }
        } catch (error) {
            Swal.fire(
                "Error",
                error.response?.data?.message || "Something went wrong",
                "error"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md p-6 mt-6 min-h-screen">
            <PageHeader
                title="ADD GALLERY IMAGES"
                description="Upload multiple images to your existing portfolio events"
                buttonText="View All Listings"
                buttonPath="/gallery-list"
                buttonIcon={List}
            />

            <div className="bg-white rounded-sm shadow-lg border-2 border-gray-200 p-6 md:p-8 space-y-8 mt-6">

                <div className="grid md:grid-cols-2 gap-8">
                    {/* STEP 1: SELECT GALLERY */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <LayoutGrid size={18} className="text-[#134698]" />
                            Select Existing Gallery Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedGallery}
                            onChange={(e) => setSelectedGallery(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors shadow-sm bg-white"
                        >
                            <option value="">-- Choose Gallery to Add Images --</option>
                            {galleries.map((g) => (
                                <option key={g._id} value={g._id}>
                                    {g.title} ({g.category} {g.subCategory ? `- ${g.subCategory}` : ""})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* STEP 2: UPLOAD AREA */}
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
                                    <UploadCloud size={20} />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-sm font-bold text-gray-700">Click to Upload Images</h3>
                                    <p className="text-gray-500 text-[10px]">Select up to 10 images at once (JPG, PNG, WEBP)</p>
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

                {/* STEP 3: PREVIEW LIST */}
                {images.length > 0 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center justify-between border-b-2 border-gray-100 pb-3">
                            <label className="text-sm font-bold text-[#134698] flex items-center gap-2">
                                <LayoutGrid size={18} />
                                Selected Images Preview ({images.length})
                            </label>
                            <span className="text-xs text-gray-400 italic">Individual SEO Alt Tags are required for better ranking</span>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {images.map((file, idx) => (
                                <div key={idx} className="group relative bg-white p-4 rounded-md border-2 border-gray-200 shadow-sm hover:border-[#134698] transition-all overflow-hidden">
                                    <div className="relative mb-4">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt="preview"
                                            className="w-full h-40 object-cover rounded-md border-2 border-gray-100"
                                        />
                                        <button
                                            onClick={() => removeImage(idx)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 shadow-lg border-2 border-white transition-transform hover:scale-110"
                                            title="Remove Image"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[11px] font-bold text-gray-500 truncate pr-2 uppercase italic">{file.name}</p>
                                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-400"># {idx + 1}</span>
                                        </div>
                                        <div>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Enter Image Alt Tag..."
                                                    className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 focus:bg-white focus:outline-none focus:border-[#134698] text-sm transition-all shadow-inner rounded"
                                                    value={altTexts[idx] || ""}
                                                    onChange={(e) => handleAltTextChange(idx, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 4: SUBMIT */}
                <div className="pt-6 border-t-2 border-gray-100">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full bg-[#1e3a8a] text-white font-bold py-5 shadow-lg hover:shadow-2xl transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed group rounded-sm"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>PROCESSING UPLOAD...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-3">
                                <UploadCloud size={24} className="group-hover:translate-y-[-2px] transition-transform" />
                                <span>{images.length > 0 ? `UPLOAD ${images.length} IMAGES TO GALLERY` : "UPLOAD IMAGES"}</span>
                            </div>
                        )}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-[0.2em]">IHWE • Media Management System</p>
                </div>

            </div>
        </div>
    );
};

export default AddGalleryImages;
