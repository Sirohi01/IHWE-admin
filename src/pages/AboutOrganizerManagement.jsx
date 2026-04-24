import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import {
    Type,
    Save,
    Image as ImageIcon,
    Plus,
    Trash2,
    CheckCircle,
    Heading,
    Quote,
    Award
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import RichTextEditor from '../components/RichTextEditor';

const AboutOrganizerManagement = () => {
    const [data, setData] = useState({
        subtitle: 'ABOUT THE ORGANIZER',
        title: 'Namo Gange Wellness Pvt. Ltd.',
        descriptionHtml: '',
        capabilitiesTitle: 'CORE CAPABILITIES',
        capabilities: [
            "International exhibitions & trade shows",
            "Healthcare conferences & seminars",
            "Buyer–Seller Meets (B2B matchmaking)",
            "Sponsorship & brand partnerships",
            "International collaborations & delegations",
            "Focused on delivering measurable ROI and business growth for participants."
        ],
        imageUrl: '',
        imageAltText: 'Organizer Image',
        experienceText: '10+ Years'
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/about-organizer');
            if (response.data.success && response.data.data) {
                setData(response.data.data);
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

    const handleCapabilityChange = (index, value) => {
        const newCapabilities = [...data.capabilities];
        newCapabilities[index] = value;
        setData(prev => ({ ...prev, capabilities: newCapabilities }));
    };

    const addCapability = () => {
        setData(prev => ({ 
            ...prev, 
            capabilities: [...prev.capabilities, ''] 
        }));
    };

    const removeCapability = (index) => {
        const newCapabilities = [...data.capabilities];
        newCapabilities.splice(index, 1);
        setData(prev => ({ ...prev, capabilities: newCapabilities }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setIsLoading(true);
            const response = await api.post('/api/about-organizer/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setData(prev => ({ ...prev, imageUrl: response.data.imageUrl }));
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
            const response = await api.post('/api/about-organizer/update', data);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'About Organizer content updated successfully',
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
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-poppins text-[#1a2e1a]">
            <PageHeader
                title="ABOUT ORGANIZER MANAGEMENT"
                description="Manage the information of the organizer on the About Us page"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                {/* Left Side: General Content */}
                <div className="space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#23471d]">
                            <Type className="w-5 h-5 text-[#d26019]" /> Main Content
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Subtitle</label>
                                <input
                                    type="text"
                                    value={data.subtitle}
                                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Title</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Description</label>
                                <div className="border-2 border-gray-200 rounded overflow-hidden">
                                     <RichTextEditor
                                        value={data.descriptionHtml}
                                        onChange={(val) => handleInputChange('descriptionHtml', val)}
                                        placeholder="Enter organizer description here..."
                                        minHeight="250px"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-[#23471d]">
                                <Plus className="w-5 h-5 text-[#d26019]" /> Core Capabilities
                            </h2>
                            <button 
                                onClick={addCapability}
                                className="px-3 py-1 bg-[#23471d] text-white text-[10px] font-black rounded hover:bg-[#1a3615] transition-all uppercase tracking-widest"
                            >
                                Add Point
                            </button>
                        </div>
                        
                        <div className="mb-4">
                             <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Section Subheading</label>
                             <input
                                 type="text"
                                 value={data.capabilitiesTitle}
                                 onChange={(e) => handleInputChange('capabilitiesTitle', e.target.value)}
                                 className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                             />
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {data.capabilities.map((cap, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center font-bold text-[#23471d] shrink-0 text-xs">{idx + 1}</div>
                                    <textarea
                                        value={cap}
                                        onChange={(e) => handleCapabilityChange(idx, e.target.value)}
                                        className="flex-1 px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                        rows="2"
                                        placeholder={`Point ${idx + 1}...`}
                                    />
                                    <button 
                                        onClick={() => removeCapability(idx)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Media & Features */}
                <div className="space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#23471d]">
                            <ImageIcon className="w-5 h-5 text-[#d26019]" /> Media Settings
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="border-2 border-gray-100 p-4 rounded-lg bg-gray-50/30">
                                <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-tighter">Organizer Image</label>
                                {data.imageUrl ? (
                                    <div className="relative aspect-video rounded overflow-hidden border-2 border-white shadow-sm bg-white group">
                                        <img src={`${SERVER_URL}${data.imageUrl}`} className="w-full h-full object-cover" alt="Preview" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button 
                                                onClick={() => handleInputChange('imageUrl', '')}
                                                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative aspect-video rounded border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center group hover:border-[#23471d] transition-all">
                                        <input
                                            type="file"
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <ImageIcon className="w-8 h-8 text-gray-300 group-hover:text-[#23471d] transition-colors mb-2" />
                                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#23471d]">CLICK TO UPLOAD</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Image Alt Text (SEO)</label>
                                <input
                                    type="text"
                                    value={data.imageAltText}
                                    onChange={(e) => handleInputChange('imageAltText', e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#23471d]">
                            <Award className="w-5 h-5 text-[#d26019]" /> Experience Badge
                        </h2>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight font-italic">Badge Text (e.g. 10+ Years)</label>
                            <input
                                type="text"
                                value={data.experienceText}
                                onChange={(e) => handleInputChange('experienceText', e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                placeholder="Leave empty to hide badge on website"
                            />
                            <p className="text-[10px] text-gray-500 mt-2 italic">Note: If this field is empty, the badge will not be displayed on the About Us page.</p>
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
                                    <Save className="w-6 h-6" /> Save Organizer Profile
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutOrganizerManagement;
