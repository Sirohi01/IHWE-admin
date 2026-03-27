import { useState, useEffect } from "react";
import { Upload, X, Trash2, CheckCircle, Info } from "lucide-react";
import PageHeader from '../../components/PageHeader';
import api from "../../lib/api";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const AddGalleryImages = () => {
    const [galleryItems, setGalleryItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Array of 6 images
    const [images, setImages] = useState(
        Array(6).fill(null).map(() => ({ file: null, preview: null, altText: "" }))
    );

    useEffect(() => {
        fetchGalleryItems();
    }, []);

    const fetchGalleryItems = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/api/gallery/items');
            if (response.data.success) {
                setGalleryItems(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching items:", error);
            toast.error("Failed to fetch gallery items");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (index, e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const newImages = [...images];
            newImages[index] = {
                ...newImages[index],
                file: file,
                preview: URL.createObjectURL(file)
            };
            setImages(newImages);
        }
    };

    const handleAltChange = (index, e) => {
        const newImages = [...images];
        newImages[index].altText = e.target.value;
        setImages(newImages);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages[index] = { file: null, preview: null, altText: "" };
        setImages(newImages);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedItem) {
            toast.warning("Please select a Portfolio Item (Title)");
            return;
        }

        const validImages = images.filter(img => img.file !== null);
        if (validImages.length === 0) {
            toast.warning("Please upload at least one image");
            return;
        }

        const data = new FormData();
        data.append("galleryItemId", selectedItem);

        const altTexts = images.map(img => img.altText);
        data.append("altTexts", JSON.stringify(altTexts));

        images.forEach((img) => {
            if (img.file) {
                data.append("images", img.file);
            }
        });

        try {
            setIsSubmitting(true);
            const response = await api.post('/api/gallery/images', data);
            if (response.data.success) {
                Swal.fire({
                    title: "Success!",
                    text: "Gallery images uploaded successfully.",
                    icon: "success",
                    confirmButtonColor: "#1A3263"
                });
                resetForm();
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(error.response?.data?.message || "Failed to upload images");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setSelectedItem("");
        setImages(Array(6).fill(null).map(() => ({ file: null, preview: null, altText: "" })));
    };

    return (
        <div className="bg-white shadow-md p-6 mt-6 min-h-screen">
            <PageHeader
                title="ADD PORTFOLIO GALLERY IMAGES"
                description="Upload multiple images for a specific portfolio item (Max 6)"
            />

            <div className="max-w-6xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Selection Header */}
                    <div className="bg-[#1A3263] rounded-xl p-8 shadow-2xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/10 rounded-full -ml-12 -mb-12 blur-xl"></div>

                        <div className="relative z-10 max-w-2xl">
                            <label className="block text-blue-100 text-xs font-bold uppercase tracking-[0.2em] mb-3">
                                Select Target Portfolio Item
                            </label>
                            <select
                                value={selectedItem}
                                onChange={(e) => setSelectedItem(e.target.value)}
                                className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-6 py-4 text-lg font-bold focus:outline-none focus:bg-white focus:text-[#1A3263] transition-all cursor-pointer backdrop-blur-sm"
                                required
                            >
                                <option value="" className="text-gray-900">Choose a Title Entry...</option>
                                {galleryItems.map(item => (
                                    <option key={item._id} value={item._id} className="text-gray-900">
                                        {item.title} ({item.category?.name})
                                    </option>
                                ))}
                            </select>
                            <div className="mt-4 flex items-center gap-2 text-blue-200 text-[10px] font-medium uppercase tracking-widest">
                                <Info className="w-3.5 h-3.5" />
                                These images will be displayed inside the selected portfolio detail page
                            </div>
                        </div>
                    </div>

                    {/* Image Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                        {images.map((img, index) => (
                            <div key={index} className={`group relative transition-all duration-300 ${img.preview ? 'scale-[1.02]' : ''}`}>
                                <div className={`h-full border-2 rounded-2xl overflow-hidden transition-all duration-300 bg-white ${img.preview ? 'border-[#1A3263] shadow-xl' : 'border-dashed border-gray-300 hover:border-blue-400'}`}>
                                    {/* Slot Number Badge */}
                                    <div className={`absolute top-4 left-4 z-20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${img.preview ? 'bg-[#1A3263] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        {index + 1}
                                    </div>

                                    {/* Upload/Preview Area */}
                                    <div className="aspect-[4/3] relative">
                                        {img.preview ? (
                                            <div className="w-full h-full relative group/img">
                                                <img src={img.preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all gap-3">
                                                    <label className="bg-white text-black px-4 py-2 rounded-full text-[10px] font-bold cursor-pointer hover:bg-gray-100 transition-transform hover:scale-105 shadow-lg uppercase">
                                                        Change
                                                        <input type="file" onChange={(e) => handleImageChange(index, e)} className="hidden" accept="image/*" />
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-transform hover:scale-110 shadow-lg"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/30 transition-colors gap-3 p-6 text-center">
                                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Upload className="w-6 h-6 text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Add Image {index + 1}</p>
                                                    <p className="text-[9px] text-gray-400 mt-1">Recommended: 800x600</p>
                                                </div>
                                                <input type="file" onChange={(e) => handleImageChange(index, e)} className="hidden" accept="image/*" />
                                            </label>
                                        )}
                                    </div>

                                    {/* Alt Text Input */}
                                    <div className={`p-4 transition-colors ${img.preview ? 'bg-blue-50/30' : 'bg-gray-50/50'}`}>
                                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Alt Text / Description</label>
                                        <input
                                            type="text"
                                            value={img.altText}
                                            onChange={(e) => handleAltChange(index, e)}
                                            placeholder="Enter descriptive text..."
                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A3263] focus:ring-1 focus:ring-blue-100 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Submit Footer */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t-2 border-gray-100">
                        <div className="flex items-center gap-3 text-gray-500">
                            <CheckCircle className={`w-5 h-5 ${images.filter(i => i.file).length > 0 ? 'text-green-500' : 'text-gray-300'}`} />
                            <span className="text-sm font-medium">
                                {images.filter(i => i.file).length} of 6 images selected
                            </span>
                        </div>

                        <div className="flex gap-4 w-full md:w-auto">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-8 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-gray-200 transition-colors flex-1 md:flex-none"
                            >
                                Clear All
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-12 py-4 bg-[#1A3263] text-white rounded-xl font-bold uppercase text-xs tracking-[0.2em] shadow-2xl hover:shadow-blue-900/40 hover:-translate-y-1 transition-all flex-1 md:flex-none disabled:opacity-50"
                            >
                                {isSubmitting ? "Uploading Progress..." : "Finalize & Upload"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddGalleryImages;