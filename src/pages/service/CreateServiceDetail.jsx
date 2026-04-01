import { useState, useEffect, useRef } from 'react';
import {
    Save,
    Upload,
    Image as ImageIcon,
    X,
    Check,
    Link as LinkIcon,
    Code,
    FileText,
    Tag,
    Briefcase,
    Sparkles
} from 'lucide-react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../../lib/api";
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import RichTextEditor from '../../components/RichTextEditor';

const initialFormState = {
    serviceName: "",
    bgImage: null,
    bgImagePreview: null,
    bgImagePath: "",
    bgAltText: "",
    bgTitle: "",
    title: "",
    highlightText: "",
    description: "",
    galleryImages: [
        { file: null, preview: null, altText: "", existingPath: "" },
        { file: null, preview: null, altText: "", existingPath: "" },
        { file: null, preview: null, altText: "", existingPath: "" },
        { file: null, preview: null, altText: "", existingPath: "" },
    ],
    metaTitle: "",
    metaKeywords: "",
    metaDescription: "",
    ogTitle: "",
    ogDescription: "",
    canonicalTag: "",
    schemaMarkup: "",
    openGraphTags: "",
    ogImage: null,
    ogImagePreview: null,
    ogImagePath: "",
    ogImageAltText: ""
};

const CreateServiceDetail = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const lastFetchedServiceRef = useRef("");

    const [formData, setFormData] = useState(initialFormState);

    const categorizedServices = [
        {
            category: "Interiors",
            services: ["Retail Interior", "Corporate Interior", "Restaurant Interior", "Shop In Shops", "Interior Design Company"]
        },
        {
            category: "Merchandising",
            services: ["Retail Display Merchandising", "Acrylic Displays", "Gondolas", "Window Display"]
        },
        {
            category: "Kiosk",
            services: ["Retail Kiosk", "Mobile Booth"]
        },
        {
            category: "Office Interior",
            services: ["Modular Work Station", "MD Cabin", "Chairs", "Office Interior"]
        },
        {
            category: "Exhibition & Events",
            services: ["Exhibition & Events"]
        },
        {
            category: "Furniture",
            services: ["Modular Wardrobe", "Modular Kitchen", "Modular LCD Unit", "Dressing Table", "Sofas", "Space Saving Furniture", "Furniture"]
        },
        {
            category: "Signage",
            services: ["Signage"]
        }
    ];

    // Handle pre-selected service from navigation state (Edit mode)
    useEffect(() => {
        if (location.state && location.state.serviceName) {
            setFormData(prev => ({ ...prev, serviceName: location.state.serviceName }));
        }
    }, [location.state]);

    // Fetch existing data when service name changes
    useEffect(() => {
        // Only fetch if the service name has ACTUALLY changed to a different service
        if (formData.serviceName && formData.serviceName !== lastFetchedServiceRef.current) {
            fetchServiceDetail(formData.serviceName);
        }
    }, [formData.serviceName]);

    const fetchServiceDetail = async (name) => {
        try {
            const response = await api.get(`/api/service-details/${encodeURIComponent(name)}`);
            if (response.data.success) {
                const data = response.data.data;
                const DATA_SERVER_URL = SERVER_URL;

                setFormData(prev => ({
                    ...prev,
                    bgImage: null,
                    bgImagePreview: data.bgImage ? `${DATA_SERVER_URL}${data.bgImage}` : null,
                    bgImagePath: data.bgImage || "",
                    bgAltText: data.bgAltText || "",
                    bgTitle: data.bgTitle || "",
                    title: data.title || "",
                    highlightText: data.highlightText || "",
                    description: data.description || "",
                    galleryImages: data.galleryImages.map(img => ({
                        file: null,
                        preview: img.url ? `${DATA_SERVER_URL}${img.url}` : null,
                        existingPath: img.url || "",
                        altText: img.altText || ""
                    })),
                    // Ensure we have 4 slots
                    ...(data.galleryImages.length < 4 ? {
                        galleryImages: [
                            ...data.galleryImages.map(img => ({
                                file: null,
                                preview: img.url ? `${DATA_SERVER_URL}${img.url}` : null,
                                existingPath: img.url || "",
                                altText: img.altText || ""
                            })),
                            ...Array(4 - data.galleryImages.length).fill({ file: null, preview: null, altText: "", existingPath: "" })
                        ]
                    } : {}),
                    metaTitle: data.seo?.metaTitle || "",
                    metaKeywords: data.seo?.metaKeywords || "",
                    metaDescription: data.seo?.metaDescription || "",
                    ogTitle: data.seo?.ogTitle || "",
                    ogDescription: data.seo?.ogDescription || "",
                    canonicalTag: data.seo?.canonicalTag || "",
                    schemaMarkup: data.seo?.schemaMarkup || "",
                    openGraphTags: data.seo?.openGraphTags || "",
                    ogImage: null,
                    ogImagePreview: data.seo?.ogImage ? `${DATA_SERVER_URL}${data.seo.ogImage}` : null,
                    ogImagePath: data.seo?.ogImage || "",
                    ogImageAltText: data.seo?.ogImageAltText || ""
                }));
                lastFetchedServiceRef.current = name;
            }
        } catch (error) {
            console.log("No existing data found for this service.");
            // We NO LONGER reset fields here. 
            // This allows users to keep data from a previous service if they switch names.
            lastFetchedServiceRef.current = name;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBgImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // 🚨 100KB SIZE VALIDATION
            if (file.size > 100 * 1024) {
                Swal.fire({
                    icon: 'warning',
                    title: 'IMAGE TOO HEAVY!',
                    text: 'Bhai, image 100KB se badi hai. Please compress karke upload karo taaki site fast chale! 🚀',
                    confirmButtonColor: '#23471d',
                    background: '#fff'
                });
                if (e.target) e.target.value = '';
                return;
            }

            setFormData(prev => ({
                ...prev,
                bgImage: file,
                bgImagePreview: URL.createObjectURL(file)
            }));
        }
    };

    const handleOgImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                ogImage: file,
                ogImagePreview: URL.createObjectURL(file)
            }));
        }
    };

    const handleGalleryImageChange = (index, file) => {
        if (file) {
            const updated = [...formData.galleryImages];
            updated[index] = {
                ...updated[index],
                file,
                preview: URL.createObjectURL(file)
            };
            setFormData(prev => ({ ...prev, galleryImages: updated }));
        }
    };

    const handleGalleryAltChange = (index, value) => {
        const updated = [...formData.galleryImages];
        updated[index] = { ...updated[index], altText: value };
        setFormData(prev => ({ ...prev, galleryImages: updated }));
    };

    const removeGalleryImage = (index) => {
        const updated = [...formData.galleryImages];
        updated[index] = { file: null, preview: null, altText: "" };
        setFormData(prev => ({ ...prev, galleryImages: updated }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setIsLoading(true);

        try {
            const data = new FormData();

            // Append basic fields
            data.append('serviceName', formData.serviceName);
            data.append('bgAltText', formData.bgAltText);
            data.append('bgTitle', formData.bgTitle);
            data.append('title', formData.title);
            data.append('highlightText', formData.highlightText);
            data.append('description', formData.description);

            // Append SEO fields
            data.append('metaTitle', formData.metaTitle);
            data.append('metaKeywords', formData.metaKeywords);
            data.append('metaDescription', formData.metaDescription);
            data.append('ogTitle', formData.ogTitle);
            data.append('ogDescription', formData.ogDescription);
            data.append('canonicalTag', formData.canonicalTag);
            data.append('schemaMarkup', formData.schemaMarkup);
            data.append('openGraphTags', formData.openGraphTags);
            data.append('ogImageAltText', formData.ogImageAltText);

            // Append Background Image
            if (formData.bgImage) {
                data.append('bgImage', formData.bgImage);
            } else if (formData.bgImagePath) {
                data.append('existingBgImage', formData.bgImagePath);
            }

            // Append OG Image
            if (formData.ogImage) {
                data.append('ogImage', formData.ogImage);
            } else if (formData.ogImagePath) {
                data.append('existingOgImage', formData.ogImagePath);
            }

            // Append Gallery Images and Alts
            formData.galleryImages.forEach((img, index) => {
                if (img.file) {
                    data.append('galleryImages', img.file);
                } else if (img.existingPath) {
                    data.append('existingGalleryPaths', img.existingPath);
                }
                data.append('galleryAlts', img.altText || "");
            });

            const response = await api.post('/api/service-details', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Service details have been saved successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });

                // Clear the form after successful save
                setFormData(initialFormState);
                lastFetchedServiceRef.current = "";
            }
        } catch (error) {
            console.error('Error saving service details:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to save service details. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md p-6 mt-6 min-h-screen">
            <PageHeader
                title="CREATE SERVICE DETAIL"
                description="Manage individual service page content and SEO settings"
            />

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Left Column - Config & SEO (1/4) */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Service Selection Card */}
                        <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 rounded">
                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900 uppercase">Service Detail</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-widest text-center">Select Service *</label>
                                    <select
                                        name="serviceName"
                                        value={formData.serviceName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border-2 border-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded font-bold text-xs uppercase tracking-widest text-blue-700 bg-blue-50/30"
                                        required
                                    >
                                        <option value="">-- Choose Service --</option>
                                        {categorizedServices.map((catObj, i) => (
                                            <optgroup key={i} label={catObj.category.toUpperCase()}>
                                                {catObj.services.map((service, j) => (
                                                    <option key={`${i}-${j}`} value={service}>
                                                        {catObj.category === service ? service : `${catObj.category} / ${service}`}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SEO Metadata Card */}
                        <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-50 rounded">
                                    <FileText className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900 uppercase">SEO Metadata</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-xs font-medium text-gray-700">Meta Title</label>
                                        <span className={`text-[10px] font-bold ${formData.metaTitle.length > 65 ? 'text-orange-500' : 'text-gray-400'}`}>
                                            {formData.metaTitle.length}/65
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        name="metaTitle"
                                        value={formData.metaTitle}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border-2 border-gray-200 focus:outline-none focus:border-blue-500 text-xs shadow-sm"
                                        placeholder="Enter meta title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Meta Keywords</label>
                                    <input
                                        type="text"
                                        name="metaKeywords"
                                        value={formData.metaKeywords}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border-2 border-gray-200 focus:outline-none focus:border-blue-500 text-xs shadow-sm"
                                        placeholder="Keywords, comma separated"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-xs font-medium text-gray-700">Meta Description</label>
                                        <span className={`text-[10px] font-bold ${formData.metaDescription.length > 155 ? 'text-red-500' : 'text-gray-400'}`}>
                                            {formData.metaDescription.length}/155
                                        </span>
                                    </div>
                                    <textarea
                                        name="metaDescription"
                                        value={formData.metaDescription}
                                        onChange={handleInputChange}
                                        rows={3}
                                        maxLength={155}
                                        className="w-full px-3 py-2 border border-gray-200 focus:outline-none focus:border-blue-500 text-xs shadow-sm resize-none"
                                        placeholder="Brief summary..."
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 text-center bg-gray-50 py-1">Open Graph (Social)</h3>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            name="ogTitle"
                                            value={formData.ogTitle}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded text-[11px]"
                                            placeholder="Social Sharing Title"
                                        />
                                        <textarea
                                            name="ogDescription"
                                            value={formData.ogDescription}
                                            onChange={handleInputChange}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded text-[11px] resize-none"
                                            placeholder="Social Sharing Summary"
                                        />
                                        <div>
                                            <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">OG Image</label>
                                            <div className="border border-dashed border-gray-300 rounded p-2 text-center relative hover:bg-gray-50 bg-gray-50/50">
                                                <input
                                                    type="file"
                                                    onChange={handleOgImageUpload}
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                    accept="image/*"
                                                />
                                                {formData.ogImagePreview ? (
                                                    <img src={formData.ogImagePreview} alt="OG Preview" className="h-16 w-full object-cover rounded shadow-sm" />
                                                ) : (
                                                    <div className="py-2 flex flex-col items-center">
                                                        <Upload className="w-4 h-4 text-gray-300" />
                                                        <span className="text-[8px] text-gray-400 block mt-1 uppercase font-bold tracking-tighter">Upload OG Image</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            name="ogImageAltText"
                                            value={formData.ogImageAltText}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-1.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded text-[10px]"
                                            placeholder="OG Image Alt Text"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                        <LinkIcon className="w-3 h-3" /> Canonical Tag
                                    </h3>
                                    <input
                                        type="text"
                                        name="canonicalTag"
                                        value={formData.canonicalTag}
                                        onChange={handleInputChange}
                                        placeholder="Enter canonical URL"
                                        className="w-full px-3 py-1.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded text-[10px] font-medium"
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                        <Code className="w-3 h-3" /> Schema Markup (JSON-LD)
                                    </label>
                                    <RichTextEditor
                                        value={formData.schemaMarkup}
                                        onChange={(val) => setFormData(prev => ({ ...prev, schemaMarkup: val }))}
                                        placeholder='{"@context": "https://schema.org", ...}'
                                        minHeight="150px"
                                        isCodeEditor={true}
                                    />
                                </div>

                                <div className="pt-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                        <Code className="w-3 h-3" /> Additional OG Tags
                                    </label>
                                    <RichTextEditor
                                        value={formData.openGraphTags}
                                        onChange={(val) => setFormData(prev => ({ ...prev, openGraphTags: val }))}
                                        placeholder='<meta property="..." content="..." />'
                                        minHeight="150px"
                                        isCodeEditor={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Main Content (3/4) */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Hero & Primary Content Card */}
                        <div className="bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-lg font-semibold text-blue-900 uppercase tracking-tight">Hero Section Settings</h3>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Background Image Upload */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end mb-2">
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-none">Hero Background Image *</label>
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-full">
                                                    <Sparkles className="w-3 h-3 text-amber-500" />
                                                    <span className="text-[9px] font-black text-amber-700 uppercase tracking-wider">1600 x 400 PX Recommended</span>
                                                </div>
                                            </div>

                                            <div className="relative group overflow-hidden">
                                                <div className="w-full h-44 overflow-hidden border-2 border-gray-200 shadow-sm relative group bg-slate-50">
                                                    <input
                                                        type="file"
                                                        onChange={handleBgImageUpload}
                                                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                                        accept="image/*"
                                                    />
                                                    
                                                    {formData.bgImagePreview ? (
                                                        <div className="w-full h-full">
                                                            <img src={formData.bgImagePreview} alt="Hero Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                            <div className="absolute top-3 left-3 bg-[#23471d] text-white text-[10px] font-black px-3 py-1 uppercase tracking-[0.2em] shadow-lg">
                                                                {formData.bgImage ? 'New Selection' : 'Current Banner'}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center h-full text-slate-300">
                                                            <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">No Background Uploaded</span>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                        <div className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full">
                                                            <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Upload New Asset</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* 🚨 100KB POLICY BADGE */}
                                                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-black uppercase tracking-widest shadow-xl">
                                                    <X size={10} className="stroke-[4px]" />
                                                    100KB LIMIT
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 border border-slate-100 p-3 flex items-start gap-3">
                                                <div className="mt-0.5"><Check className="w-4 h-4 text-green-600" /></div>
                                                <p className="text-[10px] text-slate-500 leading-relaxed">
                                                    <span className="font-bold text-slate-700 uppercase">Pro Tip:</span> Always compress your images before uploading. We recommend using <a href="https://tinypng.com" target="_blank" className="text-blue-600 underline font-bold">TinyPNG</a> to hit that 100KB target without losing quality.
                                                </p>
                                            </div>
                                        <input
                                            type="text"
                                            name="bgAltText"
                                            value={formData.bgAltText}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded font-medium text-gray-800 text-xs shadow-sm"
                                            placeholder="Background Image Alt Text (SEO)"
                                        />
                                    </div>

                                    {/* Hero Content text */}
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Background Image Title (H1) *</label>
                                            <input
                                                type="text"
                                                name="bgTitle"
                                                value={formData.bgTitle}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded font-bold text-gray-800 text-lg placeholder:text-gray-300"
                                                placeholder="Main Heading in Hero"
                                                required
                                            />
                                            <p className="text-[10px] text-gray-400 mt-1 italic">This will be the main H1 tag for the service page.</p>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Title</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded font-medium text-gray-800"
                                                placeholder="e.g. Best Retail Showroom"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Highlighted Text</label>
                                            <input
                                                type="text"
                                                name="highlightText"
                                                value={formData.highlightText}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-200 shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 rounded font-medium text-gray-800 italic"
                                                placeholder="e.g. Interior Designer In India"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rich Text Description Section */}
                        <div className="bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-lg font-semibold text-blue-900 uppercase tracking-tight">Main Page Content (Description)</h3>
                            </div>
                            <div className="p-6">
                                <RichTextEditor
                                    value={formData.description}
                                    onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
                                    placeholder="Start typing service details..."
                                    minHeight="400px"
                                />
                            </div>
                        </div>

                        {/* Gallery Section */}
                        <div className="bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-blue-900 uppercase tracking-tight">Service Portfolio Gallery (4 Images)</h3>
                                <div className="p-1 px-3 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-tighter">Required</div>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {formData.galleryImages.map((img, index) => (
                                        <div key={index} className="space-y-3 group">
                                            <div className="border-4 border-dashed border-gray-100 rounded-xl p-2 bg-gray-50 relative transition-all hover:bg-white hover:border-blue-400 hover:shadow-xl overflow-hidden">
                                                <div className="h-32 w-full rounded-lg flex items-center justify-center overflow-hidden bg-white shadow-inner">
                                                    {img.preview ? (
                                                        <div className="relative w-full h-full">
                                                            <img src={img.preview} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeGalleryImage(index)}
                                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded shadow-lg hover:bg-red-600 transition-colors"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="relative w-full h-full flex flex-col items-center justify-center">
                                                            <ImageIcon className="w-8 h-8 text-blue-100 group-hover:text-blue-200 mb-1" />
                                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Box {index + 1}</span>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                                onChange={(e) => handleGalleryImageChange(index, e.target.files[0])}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                value={img.altText}
                                                onChange={(e) => handleGalleryAltChange(index, e.target.value)}
                                                placeholder={`Alt Tag for Image ${index + 1}`}
                                                className="w-full px-3 py-2 border border-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded text-[10px] font-medium placeholder:italic shadow-sm bg-blue-50/10"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Save Actions */}
                        <div className="flex items-center justify-end gap-3 mt-2">
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="px-6 py-3 bg-[#6b21a8] text-white font-bold transition-all shadow-lg hover:shadow-xl hover:bg-[#581c87] flex items-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>Publish Service Update</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateServiceDetail;
