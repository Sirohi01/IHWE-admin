import { useState, useEffect } from "react";
import { List, Image, LayoutGrid, Type } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../lib/api"; // Verify this path
import PageHeader from "../../components/PageHeader";
import RichTextEditor from "../../components/RichTextEditor";

const GalleryCategory = () => {
    const navigate = useNavigate();

    // Portfolio Structure from Navbar (Hardcoded for now as per user request context)
    const portfolioStructure = [
        {
            label: "Interiors",
            subItems: [
                "Retail Interior",
                "Corporate Interior",
                "Restaurant Interior",
                "Shop in Shops",
            ],
        },
        {
            label: "Merchandising",
            subItems: [
                "Retail Display Merchandising",
                "Acrylic Display",
                "Gondolas",
                "Window Display",
            ],
        },
        {
            label: "Kiosk",
            subItems: ["Retail Kiosk", "Mobile Booth"],
        },
        { label: "Signage", subItems: [] },
        { label: "Exhibitions & Events", subItems: [] },
        {
            label: "Office Interior",
            subItems: ["Modular Work Station", "MD Cabin", "Chairs"],
        },
        {
            label: "Furniture",
            subItems: ["Wardrobe", "Kitchen", "LCD Unit", "Dressing Table", "Sofas"],
        },
    ];

    const [formData, setFormData] = useState({
        category: "",
        subCategory: "",
        title: "",
        highlightText: "",
        description: "",
        displayNumber: "",
        buttonLabel: "View Details",
        buttonUrl: "",
        slug: "",
        altText: "",
    });

    const [mainImage, setMainImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [availableSubCategories, setAvailableSubCategories] = useState([]);

    // Handle Category Change to populate SubCategories
    const handleCategoryChange = (e) => {
        const selectedCategory = e.target.value;
        const categoryData = portfolioStructure.find(
            (item) => item.label === selectedCategory
        );

        setFormData((prev) => ({
            ...prev,
            category: selectedCategory,
            subCategory: "", // Reset subcategory
        }));

        if (categoryData && categoryData.subItems.length > 0) {
            setAvailableSubCategories(categoryData.subItems);
        } else {
            setAvailableSubCategories([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.category || !mainImage) {
            Swal.fire("Error", "Please fill all required fields", "error");
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            data.append(key, formData[key]);
        });
        data.append("mainImage", mainImage);

        try {
            setIsLoading(true);
            const response = await api.post("/api/portfolio-gallery/create", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data.success) {
                Swal.fire("Success", "Gallery Category Created!", "success");
                navigate("/gallery-list"); // Redirect to list
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
                title="PORTFOLIO EVENT GALLERY"
                description="Manage your portfolio items with stunning visual layouts"
                buttonText="View All Listings"
                buttonPath="/gallery-list"
                buttonIcon={List}
            />

            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-sm shadow-lg border-2 border-gray-200 p-6 md:p-8 space-y-6 mt-6"
            >
                {/* ROW 1: CATEGORY & TITLE */}
                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Select Portfolio Gallery <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleCategoryChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors shadow-sm"
                            required
                        >
                            <option value="">Choose Category...</option>
                            {portfolioStructure.map((item, idx) => (
                                <option key={idx} value={item.label}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Gallery Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="e.g. Retail Kiosk"
                            className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors shadow-sm"
                            required
                        />
                    </div>
                </div>

                {/* ROW 2: SUBCATEGORY (IF AVAILABLE) */}
                {availableSubCategories.length > 0 && (
                    <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Select Sub-Category
                        </label>
                        <select
                            name="subCategory"
                            value={formData.subCategory}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors shadow-sm"
                        >
                            <option value="">Choose Sub-Category...</option>
                            {availableSubCategories.map((sub, idx) => (
                                <option key={idx} value={sub}>
                                    {sub}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* ROW 3: HIGHLIGHT & NUMBER */}
                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Highlight Text
                        </label>
                        <input
                            type="text"
                            name="highlightText"
                            value={formData.highlightText}
                            onChange={handleInputChange}
                            placeholder="e.g. Interior Design"
                            className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Display Number
                        </label>
                        <input
                            type="text"
                            name="displayNumber"
                            value={formData.displayNumber}
                            onChange={handleInputChange}
                            placeholder="e.g. 01"
                            className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors shadow-sm"
                        />
                    </div>
                </div>

                {/* ROW 4: DESCRIPTION */}
                <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                        Short Description (Rich Text)
                    </label>
                    <RichTextEditor
                        value={formData.description}
                        onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
                        placeholder="Enter description..."
                        minHeight="200px"
                    />
                </div>

                {/* IMAGE & ALT TEXT */}
                <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Main Display Image <span className="text-red-500">*</span>
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 shadow-sm">
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-md bg-white p-2 border-2 border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMainImage(null);
                                            setImagePreview(null);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 shadow-md"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <label className="cursor-pointer text-blue-600 font-semibold flex flex-col items-center gap-2 py-4">
                                    <Image size={40} className="text-gray-400" />
                                    <span className="text-lg">Click to Upload</span>
                                    <span className="text-sm text-gray-500">PNG, JPG, WEBP (Max 5MB)</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col justify-end">
                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Image Alt Text
                        </label>
                        <input
                            type="text"
                            name="altText"
                            value={formData.altText}
                            onChange={handleInputChange}
                            placeholder="SEO Alt Tags"
                            className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors shadow-sm"
                        />
                    </div>
                </div>

                {/* BUTTON SETTINGS & STATUS */}
                <div className="grid md:grid-cols-3 gap-5">
                    <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Btn Label
                        </label>
                        <input
                            type="text"
                            name="buttonLabel"
                            value={formData.buttonLabel}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Btn URL/Slug
                        </label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleInputChange}
                            placeholder="Auto-generated if empty"
                            className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Display Status
                        </label>
                        <div className="flex items-center gap-4 h-[52px] px-4 border-2 border-gray-300 shadow-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="status" value="Active" checked={formData.status !== "Inactive"} onChange={handleInputChange} className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">Active</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="status" value="Inactive" checked={formData.status === "Inactive"} onChange={handleInputChange} className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-medium text-gray-700">Hidden</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#1e3a8a] text-white font-bold py-4 shadow-lg hover:shadow-xl transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Creating...</span>
                        </div>
                    ) : (
                        <span>Create Gallery Category</span>
                    )}
                </button>
            </form>
        </div>
    );
};

export default GalleryCategory;
