import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import {
    Plus, Trash2, Edit, Building2, MapPin, Globe, Image as ImageIcon, Save, X
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const EMPTY_FORM = {
    title: '',
    location: '',
    websiteUrl: '',
    altText: '',
    image: null
};

const ExhibitorListManage = () => {
    const [exhibitors, setExhibitors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [isEditing, setIsEditing] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => { fetchExhibitors(); }, []);

    const fetchExhibitors = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/exhibitor');
            if (response.data.success) {
                setExhibitors(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching exhibitors:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm({ ...form, image: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!form.title || !form.location || (!isEditing && !form.image)) {
            Swal.fire('Warning', 'Title, Location and Image are required!', 'warning');
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('location', form.location);
        formData.append('websiteUrl', form.websiteUrl);
        formData.append('altText', form.altText || form.title);
        if (form.image) formData.append('image', form.image);

        try {
            let response;
            if (isEditing) {
                response = await api.put(`/api/exhibitor/${isEditing}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                response = await api.post('/api/exhibitor', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (response.data.success) {
                Swal.fire({ icon: 'success', title: isEditing ? 'Updated!' : 'Added!', timer: 1500, showConfirmButton: false });
                resetForm();
                fetchExhibitors();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to save exhibitor', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This exhibitor will be permanently removed.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });

        if (!result.isConfirmed) return;

        setIsLoading(true);
        try {
            await api.delete(`/api/exhibitor/${id}`);
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
            fetchExhibitors();
        } catch (error) {
            Swal.fire('Error', 'Failed to delete', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (exhibitor) => {
        setIsEditing(exhibitor._id);
        setForm({
            title: exhibitor.title,
            location: exhibitor.location,
            websiteUrl: exhibitor.websiteUrl,
            altText: exhibitor.altText,
            image: null
        });
        setPreview(`${SERVER_URL}/${exhibitor.image}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditing(null);
        setForm({ ...EMPTY_FORM });
        setPreview(null);
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader 
                title="EXHIBITOR LIST MANAGEMENT" 
                description="Manage brands and exhibitors list with logos and locations"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* FORM SECTION */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
                            {isEditing ? <Edit className="w-5 h-5 text-[#d26019]" /> : <Plus className="w-5 h-5 text-[#d26019]" />}
                            {isEditing ? 'Edit Exhibitor' : 'Add New Exhibitor'}
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 font-inter">Exhibitor Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-inter"
                                    placeholder="e.g. Organixmantra"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 font-inter">Location</label>
                                <input
                                    type="text"
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-inter"
                                    placeholder="e.g. INDIA"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 font-inter">Website URL (Optional)</label>
                                <input
                                    type="text"
                                    value={form.websiteUrl}
                                    onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-inter"
                                    placeholder="https://example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 font-inter">Logo Image</label>
                                <div className="mt-1 flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#23471d] transition-colors relative group cursor-pointer">
                                    <input 
                                        type="file" 
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    {preview ? (
                                        <div className="relative w-full aspect-video">
                                            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <ImageIcon className="text-white w-8 h-8" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <span className="mt-2 block text-sm font-medium text-gray-600">Click to upload logo</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 font-inter">Image Alt Text</label>
                                <input
                                    type="text"
                                    value={form.altText}
                                    onChange={(e) => setForm({ ...form, altText: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-inter"
                                    placeholder="SEO Alt Text"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-inter uppercase tracking-wider text-xs shadow-sm"
                                >
                                    {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> 
                                    : isEditing ? <><Save className="w-4 h-4" /> Save Changes</> : <><Plus className="w-4 h-4" /> Add Exhibitor</>}
                                </button>
                                {isEditing && (
                                    <button onClick={resetForm} className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-xs uppercase tracking-wider font-inter">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLE SECTION */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2 font-inter uppercase tracking-wide text-sm">
                                <Building2 className="w-4 h-4" /> Exhibitor List
                            </h2>
                            <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest">
                                {exhibitors.length} BRANDS
                            </span>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase font-inter">Logo</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase font-inter">Brand Info</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase font-inter">Location</th>
                                        <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase font-inter w-28">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exhibitors.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-10 text-gray-400 font-inter font-medium italic text-xs">
                                                No exhibitors found. Add your first brand okh! 🚀
                                            </td>
                                        </tr>
                                    ) : Object.values(exhibitors).map((ex) => (
                                        <tr key={ex._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-2.5 px-4">
                                                <div className="w-16 h-10 bg-white border border-gray-200 p-1 flex items-center justify-center rounded">
                                                    <img 
                                                    src={ex.image.startsWith('http') ? ex.image : `${SERVER_URL}${ex.image}`} 
                                                        alt={ex.altText} 
                                                        className="max-w-full max-h-full object-contain"
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-4">
                                                <p className="font-bold text-[#23471d] text-[11px] uppercase tracking-wide font-inter">{ex.title}</p>
                                                {ex.websiteUrl && (
                                                    <a href={ex.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[9px] text-blue-500 hover:underline mt-0.5">
                                                        <Globe className="w-2.5 h-2.5" /> {new URL(ex.websiteUrl).hostname}
                                                    </a>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-4">
                                                <div className="flex items-center gap-1.5 text-gray-600">
                                                    <MapPin className="w-3 h-3 text-[#d26019]" />
                                                    <span className="text-[10px] font-bold uppercase tracking-tight font-inter">{ex.location}</span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => startEdit(ex)}
                                                        className="text-blue-500 hover:text-blue-700 p-1.5 transition-colors border border-blue-100 rounded bg-blue-50"
                                                        title="Edit"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(ex._id)}
                                                        className="text-red-500 hover:text-red-700 p-1.5 transition-colors border border-red-100 rounded bg-red-50"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExhibitorListManage;
