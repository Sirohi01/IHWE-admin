import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import { Type, Save, Image as ImageIcon, Building2, Quote } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const OrganizedBy = () => {
    const [data, setData] = useState({
        subheading: 'The Visionaries',
        heading: 'Organized By',
        highlightText: 'By',
        badgeText: 'Non-Profit Organization',
        orgName: 'Namo Gange Trust',
        quote: '',
        logo: '',
        logoAlt: 'Namo Gange Trust'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/organized-by');
            if (response.data.success) {
                setData(response.data.data);
                if (response.data.data.logo) {
                    setPreviewUrl(`${SERVER_URL}${response.data.data.logo}`);
                }
            }
        } catch (error) {
            console.error('Error fetching:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key !== 'logo') formData.append(key, data[key]);
        });
        if (selectedFile) {
            formData.append('logo', selectedFile);
        }

        try {
            const response = await api.post('/api/organized-by/update', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: 'Updated Successfully!', timer: 1500, showConfirmButton: false });
                fetchData();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to update details', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-poppins">
            <PageHeader
                title="ORGANIZED BY MANAGEMENT"
                description="Manage the organizer details, logo, and description"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                {/* LEFT: Text Details */}
                <div className="space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
                            <Type className="w-5 h-5 text-[#d26019]" /> Section Headings
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Subheading</label>
                                <input
                                    type="text"
                                    value={data.subheading}
                                    onChange={(e) => setData({ ...data, subheading: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Main Heading</label>
                                <input
                                    type="text"
                                    value={data.heading}
                                    onChange={(e) => setData({ ...data, heading: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight text-[#d26019]">Highlight (Orange)</label>
                                <input
                                    type="text"
                                    value={data.highlightText}
                                    onChange={(e) => setData({ ...data, highlightText: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-[#d26019] focus:border-[#23471d] outline-none shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Badge Text</label>
                                <input
                                    type="text"
                                    value={data.badgeText}
                                    onChange={(e) => setData({ ...data, badgeText: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
                            <ImageIcon className="w-5 h-5 text-[#d26019]" /> Organization Info
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Organization Name</label>
                                <input
                                    type="text"
                                    value={data.orgName}
                                    onChange={(e) => setData({ ...data, orgName: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight flex items-center gap-2">
                                    <Quote size={14} /> Organization Description / Quote
                                </label>
                                <textarea
                                    value={data.quote}
                                    onChange={(e) => setData({ ...data, quote: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none h-32 shadow-sm text-sm resize-none"
                                    placeholder="Enter organization description..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Logo upload */}
                <div className="space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
                            <ImageIcon className="w-5 h-5 text-[#d26019]" /> Organization Logo
                        </h2>
                        <div className="mt-1 flex flex-col items-center gap-4">
                            <div className="w-full h-64 border-2 border-dashed border-gray-200 relative group overflow-hidden bg-gray-50 flex items-center justify-center p-8">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain filter drop-shadow-md" />
                                ) : (
                                    <div className="text-center">
                                        <ImageIcon className="mx-auto w-12 h-12 text-gray-300 mb-2" />
                                        <p className="text-gray-400 text-sm italic">No logo uploaded yet</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <p className="text-white text-xs font-bold uppercase tracking-widest">Change Logo</p>
                                </div>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    accept="image/*,.svg"
                                />
                            </div>
                            <div className="w-full">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Logo Alt Text (for SEO)</label>
                                <input
                                    type="text"
                                    value={data.logoAlt}
                                    onChange={(e) => setData({ ...data, logoAlt: e.target.value })}
                                    className="w-full px-3 py-1.5 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs"
                                    placeholder="Alt text..."
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-full py-4 bg-[#23471d] text-white font-black uppercase tracking-[0.2em] hover:bg-black transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Save className="w-5 h-5" /> Update Organized By</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrganizedBy;
