import { useState, useEffect, useRef } from 'react';
import { Save, Globe, Pencil, Upload, Image as ImageIcon, X, Sparkles, Briefcase, Link as LinkIcon, Sun } from 'lucide-react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../../lib/api";
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import RichTextEditor from '../../components/RichTextEditor';

const CreateServiceDetail = () => {
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [featuredServices, setFeaturedServices] = useState([]);

    const [formData, setFormData] = useState({
        serviceCardId: "",
        serviceTitle: "",
        slug: "",
        heroImage: null,
        heroImagePreview: null,
        heroImageAlt: "",
        heroOverlayOpacity: 0.7,
        h1Heading: "",
        content: ""
    });

    useEffect(() => {
        fetchFeaturedServices();
        if (location.state && location.state.serviceDetail) {
            const data = location.state.serviceDetail;
            setFormData({
                serviceCardId: data.serviceCardId || "",
                serviceTitle: data.serviceTitle || "",
                slug: data.slug || "",
                heroImage: null,
                heroImagePreview: data.heroImage ? `${SERVER_URL}${data.heroImage}` : null,
                heroImageAlt: data.heroImageAlt || "",
                heroOverlayOpacity: data.heroOverlayOpacity !== undefined ? data.heroOverlayOpacity : 0.7,
                h1Heading: data.h1Heading || "",
                content: data.content || ""
            });
            setEditId(data._id);
            setIsEditMode(true);
        }
    }, [location.state]);

    const fetchFeaturedServices = async () => {
        try {
            const response = await api.get('/api/featured-services');
            if (response.data.success) {
                setFeaturedServices(response.data.data.cards || []);
            }
        } catch (error) {
            console.error("Error fetching featured services:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "serviceCardId") {
            const selected = featuredServices.find(s => s._id === value);
            setFormData(prev => ({
                ...prev,
                serviceCardId: value,
                serviceTitle: selected ? selected.title : "",
                // Auto-generate slug if it's empty
                slug: prev.slug || (selected ? selected.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : "")
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 100 * 1024) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Image Too Large',
                    text: 'Image size exceeds 100KB. Please compress the image and try again! 🚀',
                    confirmButtonColor: '#23471d'
                });
                return;
            }
            setFormData(prev => ({
                ...prev,
                heroImage: file,
                heroImagePreview: URL.createObjectURL(file)
            }));
        }
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            heroImage: null,
            heroImagePreview: null
        }));
    };

    const handleSubmit = async () => {
        if (!formData.serviceCardId) {
            Swal.fire({ icon: 'warning', title: 'Selection Required', text: 'Please select a service card' });
            return;
        }
        if (!formData.h1Heading) {
            Swal.fire({ icon: 'warning', title: 'Heading Required', text: 'Please enter H1 Heading' });
            return;
        }

        try {
            setIsLoading(true);

            let heroImageUrl = formData.heroImagePreview ? formData.heroImagePreview.replace(SERVER_URL, '') : '';
            
            if (formData.heroImage) {
                const imgData = new FormData();
                imgData.append('image', formData.heroImage);
                const uploadRes = await api.post('/api/service-details/upload', imgData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (uploadRes.data.success) {
                    heroImageUrl = uploadRes.data.imageUrl;
                }
            }

            const payload = {
                serviceCardId: formData.serviceCardId,
                serviceTitle: formData.serviceTitle,
                slug: formData.slug,
                heroImage: heroImageUrl,
                heroImageAlt: formData.heroImageAlt,
                heroOverlayOpacity: parseFloat(formData.heroOverlayOpacity),
                h1Heading: formData.h1Heading,
                content: formData.content
            };

            const response = await api.post('/api/service-details/save', payload);

            if (response.data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Service detail saved successfully',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/service-list');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to save service detail'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <div className="w-full">
                <PageHeader
                    title={isEditMode ? 'EDIT SERVICE PAGE' : 'ADD SERVICE PAGE'}
                    description="Configure the detail page for industry zones / services"
                />

                <div className="bg-white border-2 border-gray-200 p-6 mb-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 uppercase">
                            Page Configuration
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Service Selection */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                                Select Service From Featured Services <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="serviceCardId"
                                value={formData.serviceCardId}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-sm font-bold shadow-sm bg-gray-50"
                                disabled={isEditMode}
                            >
                                <option value="">-- Choose A Service --</option>
                                {featuredServices.map((service) => (
                                    <option key={service._id} value={service._id}>
                                        {service.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* URL Slug / Path */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-1">
                                <LinkIcon className="w-4 h-4 text-[#d26019]" />
                                <label className="block text-xs font-bold text-[#d26019] uppercase tracking-wider">
                                    URL Slug / Custom Path (Optional)
                                </label>
                            </div>
                            <div className="flex items-center">
                                <span className="bg-gray-100 px-4 py-3 border-2 border-r-0 border-gray-300 text-gray-500 text-sm font-medium">
                                    /industry-zone/
                                </span>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleInputChange}
                                    placeholder="leave empty for default"
                                    className="flex-1 px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-sm font-bold shadow-sm"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest italic">
                                Note: If left empty, the system will use the service ID as the URL.
                            </p>
                        </div>

                        {/* Hero Image */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                                Hero Section Image (16:9)
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center relative hover:bg-gray-50 transition-colors min-h-[160px] flex items-center justify-center bg-gray-50/50">
                                <input
                                    type="file"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    accept="image/*"
                                />
                                {formData.heroImagePreview ? (
                                    <div className="relative w-full h-full">
                                        <div className="relative">
                                            <img src={formData.heroImagePreview} alt="Hero Preview" className="h-32 w-full object-cover rounded shadow-md border-2 border-white" />
                                            {/* Overlay Preview */}
                                            <div 
                                                className="absolute inset-0 bg-black rounded"
                                                style={{ opacity: formData.heroOverlayOpacity }}
                                            ></div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg z-20 hover:bg-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="absolute top-2 left-2 bg-[#23471d] text-white text-[9px] font-black px-2 py-1 uppercase tracking-widest shadow-lg">
                                            {formData.heroImage ? 'NEW UPLOAD' : 'CURRENT HERO'}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-2 flex flex-col items-center">
                                        <div className="p-3 bg-white rounded-full shadow-sm mb-2">
                                            <Upload className="w-6 h-6 text-gray-300" />
                                        </div>
                                        <span className="text-[10px] text-gray-400 block mt-1 uppercase font-black tracking-widest">Upload Hero Image (Max 100KB)</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Hero Settings (Overlay & Alt) */}
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        <Sun className="w-3.5 h-3.5 text-orange-500" />
                                        Overlay Darkness (Opacity)
                                    </label>
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                        {Math.round(formData.heroOverlayOpacity * 100)}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    name="heroOverlayOpacity"
                                    value={formData.heroOverlayOpacity}
                                    onChange={(e) => setFormData(prev => ({ ...prev, heroOverlayOpacity: parseFloat(e.target.value) }))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#23471d]"
                                />
                                <div className="flex justify-between mt-1">
                                    <span className="text-[8px] font-bold text-gray-400 uppercase">Bright (0%)</span>
                                    <span className="text-[8px] font-bold text-gray-400 uppercase">Dark (100%)</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                                    Hero Image Alt Text (SEO)
                                </label>
                                <input
                                    type="text"
                                    name="heroImageAlt"
                                    value={formData.heroImageAlt}
                                    onChange={handleInputChange}
                                    placeholder="Enter alt text for image"
                                    className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-sm shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider text-[#d26019]">
                                    H1 Heading (Over Hero Section) <span className="text-red-500">*</span>
                                </label>
                                <div className="border-2 border-[#d26019] rounded-lg overflow-hidden shadow-inner">
                                    <RichTextEditor
                                        value={formData.h1Heading}
                                        onChange={(val) => setFormData(prev => ({ ...prev, h1Heading: val }))}
                                        placeholder="Driving Innovation & Excellence..."
                                        minHeight="120px"
                                        showColorPicker={true}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Text Editor */}
                        <div className="md:col-span-2 mt-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-purple-50">
                                    <Globe className="w-4 h-4 text-purple-600" />
                                </div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Main Page Content (Description & Sections)
                                </label>
                            </div>
                            <div className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-inner">
                                <RichTextEditor
                                    value={formData.content}
                                    onChange={(val) => setFormData(prev => ({ ...prev, content: val }))}
                                    placeholder="Add service details, objectives, who should exhibit..."
                                    minHeight="400px"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-end gap-3 mt-8">
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="px-8 py-3.5 bg-[#23471d] text-white font-black transition-all shadow-xl hover:shadow-2xl hover:bg-[#d26019] flex items-center gap-3 uppercase tracking-[0.1em] text-sm disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Saving Data...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>{isEditMode ? 'Update Service Detail' : 'Save Service Detail'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateServiceDetail;
