import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api, { API_URL, SERVER_URL } from "../lib/api";
import {
    Type,
    Save,
    Image as ImageIcon,
    Plus,
    Trash2,
    CheckCircle,
    Heading,
    Quote,
    Globe
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import RichTextEditor from '../components/RichTextEditor';

const GlobalPlatform = () => {
    const [data, setData] = useState({
        subheading: 'GLOBAL PLATFORM',
        title: "India's Impactful Health & Wellness Stage",
        highlightText: 'Health & Wellness Stage',
        descriptionHtml: '',
        points: [
            'Global Networking',
            'Innovation Hub',
            'Holistic Wellness',
            'B2B Opportunities'
        ],
        tagline: 'Our vision is to empower every individual with the knowledge of preventive healthcare and the tools for a sustainable, healthy future.',
        images: [
            { url: '', altText: '' },
            { url: '', altText: '' },
            { url: '', altText: '' },
            { url: '', altText: '' }
        ]
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/global-platform');
            if (response.data.success && response.data.data) {
                const fetched = response.data.data;
                setData({
                    ...fetched,
                    points: fetched.points?.length ? [...fetched.points] : [
                        'Global Networking',
                        'Innovation Hub',
                        'Holistic Wellness',
                        'B2B Opportunities'
                    ],
                    images: fetched.images?.length === 4 ? [...fetched.images] : [
                        { url: '', altText: '' },
                        { url: '', altText: '' },
                        { url: '', altText: '' },
                        { url: '', altText: '' }
                    ]
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const handlePointChange = (index, value) => {
        const newPoints = [...data.points];
        newPoints[index] = value;
        setData(prev => ({ ...prev, points: newPoints }));
    };

    const handleImageChange = (index, field, value) => {
        const newImages = [...data.images];
        newImages[index] = { ...newImages[index], [field]: value };
        setData(prev => ({ ...prev, images: newImages }));
    };

    const handleImageUpload = async (index, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setIsLoading(true);
            const response = await api.post('/api/global-platform/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                handleImageChange(index, 'url', response.data.imageUrl);
                e.target.value = null;
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to upload image', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const response = await api.post('/api/global-platform/update', data);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Global Platform content updated successfully',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to update content', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-poppins">
            <PageHeader
                title="GLOBAL PLATFORM MANAGEMENT"
                description="Manage the main about section of your website home page"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                {/* Left Side: Text Inputs */}
                <div className="space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#23471d]">
                            <Type className="w-5 h-5 text-[#d26019]" /> General Content
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Subheading</label>
                                <input
                                    type="text"
                                    value={data.subheading}
                                    onChange={(e) => handleInputChange('subheading', e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                    placeholder="e.g. GLOBAL PLATFORM"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Main Title</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                    placeholder="e.g. India's Impactful Health & Wellness Stage"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight text-[#d26019]">Highlight Text (Orange)</label>
                                <input
                                    type="text"
                                    value={data.highlightText}
                                    onChange={(e) => handleInputChange('highlightText', e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-[#d26019] focus:border-[#23471d] outline-none shadow-sm"
                                    placeholder="Text to highlight in orange..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Main Description</label>
                                <div className="border-2 border-gray-200 rounded overflow-hidden">
                                     <RichTextEditor
                                        value={data.descriptionHtml}
                                        onChange={(val) => handleInputChange('descriptionHtml', val)}
                                        placeholder="Start writing description here..."
                                        minHeight="250px"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight font-italic">Tagline (Vision Statement)</label>
                                <input
                                    type="text"
                                    value={data.tagline}
                                    onChange={(e) => handleInputChange('tagline', e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm italic"
                                    placeholder="Our vision is to empower every individual..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#23471d]">
                            <Plus className="w-5 h-5 text-[#d26019]" /> Key Points (4 Features)
                        </h2>
                        <div className="space-y-4">
                            {data.points.slice(0, 4).map((point, idx) => (
                                <div key={idx} className="flex flex-col gap-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Point {idx + 1}</label>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center font-bold text-[#23471d] shrink-0">{idx + 1}</div>
                                        <input
                                            type="text"
                                            value={point}
                                            onChange={(e) => handlePointChange(idx, e.target.value)}
                                            className="flex-1 px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                            placeholder={`Point ${idx + 1}...`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Images */}
                <div className="space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#23471d]">
                            <ImageIcon className="w-5 h-5 text-[#d26019]" /> Component Images (4 Slots)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.images.map((img, idx) => (
                                <div key={idx} className="border-2 border-gray-100 p-4 rounded-lg bg-gray-50/30 space-y-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Image Slot 0{idx + 1}</span>
                                        {img.url && (
                                            <button 
                                                onClick={() => handleImageChange(idx, 'url', '')}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    {img.url ? (
                                        <div className="relative aspect-video rounded overflow-hidden border-2 border-white shadow-sm bg-white">
                                            <img src={`${SERVER_URL}${img.url}`} className="w-full h-full object-cover" alt="Preview" />
                                        </div>
                                    ) : (
                                        <div className="relative aspect-video rounded border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center group hover:border-[#23471d] transition-all">
                                            <input
                                                type="file"
                                                onChange={(e) => handleImageUpload(idx, e)}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            />
                                            <ImageIcon className="w-8 h-8 text-gray-300 group-hover:text-[#23471d] transition-colors mb-2" />
                                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#23471d]">CLICK TO UPLOAD</span>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-tighter">Alt Text (SEO)</label>
                                        <input
                                            type="text"
                                            value={img.altText}
                                            onChange={(e) => handleImageChange(idx, 'altText', e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded text-xs focus:border-[#23471d] outline-none bg-white shadow-sm"
                                            placeholder="e.g. India Health Expo"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="w-full py-4 bg-[#23471d] text-white font-black hover:bg-[#1a3615] transition-all flex items-center justify-center gap-3 rounded shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em]"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save className="w-6 h-6" /> Save All Content
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalPlatform;
