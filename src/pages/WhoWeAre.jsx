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
    Quote
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const WhoWeAre = () => {
    const [data, setData] = useState({
        subheading: 'Who We Are',
        title: 'A Decade of Global Healthcare Leadership',
        highlightText: 'Healthcare Leadership',
        description: '',
        points: ['', '', '', '', ''],
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
            const response = await api.get('/api/who-we-are');
            if (response.data.success && response.data.data) {
                const fetched = response.data.data;
                // Ensure array structures are maintained
                setData({
                    ...fetched,
                    points: fetched.points?.length ? [...fetched.points] : ['', '', '', '', ''],
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

        // 100KB Size check
        if (file.size > 100 * 1024) {
            Swal.fire({
                icon: 'error',
                title: 'Image Too Large',
                text: 'Image should not exceed 100KB to maintain loading speed. Please compress and try again.',
                confirmButtonColor: '#23471d'
            });
            e.target.value = null;
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            setIsLoading(true);
            const response = await api.post('/api/who-we-are/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                handleImageChange(index, 'url', response.data.imageUrl);
                // Reset file input
                e.target.value = null;
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to upload image', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        // Validate description
        if (!data.description) {
            Swal.fire('Warning', 'Description is required', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/api/who-we-are', data);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Who We Are content updated successfully',
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

    const imageSlots = [
        { label: 'Image 1 (Square)', aspect: 'aspect-square', dims: '800x800' },
        { label: 'Image 2 (Portrait)', aspect: 'aspect-[4/5]', dims: '800x1000' },
        { label: 'Image 3 (Portrait)', aspect: 'aspect-[4/5]', dims: '800x1000' },
        { label: 'Image 4 (Square)', aspect: 'aspect-square', dims: '800x800' }
    ];

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-poppins">
            <PageHeader
                title="WHO WE ARE MANAGEMENT"
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
                                    placeholder="e.g. WHO WE ARE"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Main Title</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                    placeholder="e.g. A Decade of Global Healthcare Leadership"
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
                                <textarea
                                    value={data.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 focus:border-[#23471d] outline-none h-48 text-gray-700 leading-relaxed shadow-sm"
                                    placeholder="Write the introduction description here..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#23471d]">
                            <Plus className="w-5 h-5 text-[#d26019]" /> Key Points (5 Features)
                        </h2>
                        <div className="space-y-4">
                            {data.points.map((point, idx) => (
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
                        <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-[#23471d]">
                            <ImageIcon className="w-5 h-5 text-[#d26019]" /> Component Images (4 Slots)
                        </h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">Each Image MUST be under 100KB</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.images.map((img, idx) => (
                                <div key={idx} className="border-2 border-gray-100 p-4 rounded-lg bg-gray-50/30 space-y-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">{imageSlots[idx].label}</span>
                                            <span className="text-[9px] font-bold text-[#d26019] mt-1">{imageSlots[idx].dims} PX</span>
                                        </div>
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
                                        <div className={`relative ${imageSlots[idx].aspect} rounded overflow-hidden border-2 border-white shadow-sm bg-white`}>
                                            <img src={`${SERVER_URL}${img.url}`} className="w-full h-full object-cover" alt="Preview" />
                                        </div>
                                    ) : (
                                        <div className={`relative ${imageSlots[idx].aspect} rounded border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center group hover:border-[#23471d] transition-all`}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(idx, e)}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            />
                                            <ImageIcon className="w-8 h-8 text-gray-300 group-hover:text-[#23471d] transition-colors mb-2" />
                                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#23471d]">UPLOAD IMAGE</span>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-tighter">Alt Text (SEO)</label>
                                        <input
                                            type="text"
                                            value={img.altText}
                                            onChange={(e) => handleImageChange(idx, 'altText', e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded text-xs focus:border-[#23471d] outline-none bg-white shadow-sm"
                                            placeholder="e.g. Networking at Expo"
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

export default WhoWeAre;
