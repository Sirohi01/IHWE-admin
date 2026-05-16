import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import {
    Save, Image as ImageIcon, Plus, Trash2, Edit,
    Users, Briefcase, Building, Type, Linkedin, Globe, ArrowRight, X
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const EMPTY_MEMBER = {
    name: '',
    role: '',
    organization: '',
    image: '',
    imageAlt: '',
    linkedin: '',
    country: 'India'
};

const AdvisoryManagement = () => {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [memberForm, setMemberForm] = useState({ ...EMPTY_MEMBER });
    const [isEditingId, setIsEditingId] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/advisory-members');
            if (response.data.success) {
                setMembers(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const uploadImage = async () => {
        if (!imageFile) return memberForm.image;
        const formData = new FormData();
        formData.append('image', imageFile);
        const res = await api.post('/api/advisory-members/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) return res.data.url;
        throw new Error('Image upload failed');
    };

    const handleSubmit = async () => {
        if (!memberForm.name || !memberForm.role || !memberForm.organization) {
            Swal.fire('Warning', 'Name, Role and Organization are required', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            let imageUrl = memberForm.image;
            if (imageFile) {
                imageUrl = await uploadImage();
            }

            if (!imageUrl && !isEditingId) {
                Swal.fire('Warning', 'Member photo is required', 'warning');
                setIsLoading(false);
                return;
            }

            const payload = { ...memberForm, image: imageUrl };
            if (!payload.imageAlt) payload.imageAlt = payload.name;

            let response;
            if (isEditingId) {
                response = await api.put(`/api/advisory-members/${isEditingId}`, payload);
            } else {
                response = await api.post('/api/advisory-members', payload);
            }

            if (response.data.success) {
                Swal.fire({ 
                    icon: 'success', 
                    title: isEditingId ? 'Member Updated!' : 'Member Added!', 
                    timer: 1500, 
                    showConfirmButton: false 
                });
                resetForm();
                fetchData();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to save member', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Member?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });
        if (!result.isConfirmed) return;

        setIsLoading(true);
        try {
            await api.delete(`/api/advisory-members/${id}`);
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
            fetchData();
        } catch (error) {
            Swal.fire('Error', 'Failed to delete member', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (member) => {
        setIsEditingId(member._id);
        setMemberForm({
            name: member.name,
            role: member.role,
            organization: member.organization,
            image: member.image,
            imageAlt: member.imageAlt || '',
            linkedin: member.linkedin || '',
            country: member.country || 'India'
        });
        setImagePreview(member.image || '');
        setImageFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditingId(null);
        setMemberForm({ ...EMPTY_MEMBER });
        setImageFile(null);
        setImagePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen p-4 md:p-8">
            <PageHeader
                title="ADVISORY BOARD MANAGEMENT"
                description="Create and manage your esteemed advisory board members"
            />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-8">
                
                {/* LEFT: FORM SECTION */}
                <div className="xl:col-span-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-8">
                        <div className={`p-4 flex items-center justify-between ${isEditingId ? 'bg-orange-50 border-b border-orange-100' : 'bg-green-50 border-b border-green-100'}`}>
                            <h2 className="font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide text-sm">
                                {isEditingId ? <Edit className="w-4 h-4 text-orange-600" /> : <Plus className="w-4 h-4 text-green-600" />}
                                {isEditingId ? 'Edit Member Details' : 'Add New Member'}
                            </h2>
                            {isEditingId && (
                                <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        <div className="p-6 space-y-5">
                            {/* PHOTO UPLOAD */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Member Portrait</label>
                                {imagePreview ? (
                                    <div className="relative group aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                        <img 
                                            src={imagePreview.startsWith('blob:') ? imagePreview : `${SERVER_URL}${imagePreview}`} 
                                            className="w-full h-full object-cover object-top" 
                                            alt="Preview" 
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                            <button
                                                onClick={() => { setImageFile(null); setImagePreview(''); setMemberForm({ ...memberForm, image: '' }); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                                className="bg-white/20 hover:bg-red-500 text-white p-2.5 rounded-full transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <label className="bg-white/20 hover:bg-blue-500 text-white p-2.5 rounded-full transition-all cursor-pointer">
                                                <ImageIcon size={18} />
                                                <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center aspect-[4/5] rounded-xl border-2 border-dashed border-slate-200 cursor-pointer hover:border-green-500 hover:bg-green-50/30 transition-all group">
                                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-green-600" />
                                        </div>
                                        <span className="text-sm text-slate-500 font-semibold">Upload Photo</span>
                                        <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">Recommended: 400x500px</span>
                                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                    </label>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            value={memberForm.name}
                                            onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-sm font-medium"
                                            placeholder="e.g. Dr. Randeep Guleria"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Role / Designation</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            value={memberForm.role}
                                            onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-sm font-medium"
                                            placeholder="e.g. Chairman"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Organization</label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            value={memberForm.organization}
                                            onChange={(e) => setMemberForm({ ...memberForm, organization: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-sm font-medium"
                                            placeholder="e.g. IHWE Expo"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Country</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="text"
                                                value={memberForm.country}
                                                onChange={(e) => setMemberForm({ ...memberForm, country: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-sm font-medium"
                                                placeholder="India"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">LinkedIn URL</label>
                                        <div className="relative">
                                            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="text"
                                                value={memberForm.linkedin}
                                                onChange={(e) => setMemberForm({ ...memberForm, linkedin: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-sm font-medium"
                                                placeholder="https://linkedin.com/in/..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className={`w-full py-3.5 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/10 disabled:opacity-50 active:scale-[0.98] ${isEditingId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-700 hover:bg-green-800'}`}
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            {isEditingId ? 'Update Member Profile' : 'Publish Member Profile'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: LIST SECTION */}
                <div className="xl:col-span-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Board Members Directory</h2>
                                    <p className="text-[10px] text-slate-400 font-medium">Currently showing {members.length} active members</p>
                                </div>
                            </div>
                        </div>

                        {/* GRID VIEW — Matching Frontend Aesthetic */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {members.length === 0 ? (
                                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-300">
                                        <Users size={64} strokeWidth={1} className="mb-4 opacity-20" />
                                        <p className="font-medium italic text-sm">No board members cataloged yet.</p>
                                    </div>
                                ) : members.map((member) => (
                                    <div 
                                        key={member._id} 
                                        className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                                    >
                                        {/* IMAGE */}
                                        <div className="w-full h-[180px] bg-slate-100 overflow-hidden relative">
                                            <img 
                                                src={`${SERVER_URL}${member.image}`} 
                                                alt={member.name} 
                                                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" 
                                            />
                                            {/* ACTION OVERLAY */}
                                            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button 
                                                    onClick={() => startEdit(member)}
                                                    className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(member._id)}
                                                    className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            {/* COUNTRY TAG */}
                                            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                <span className="text-[9px] font-bold text-white uppercase tracking-widest">{member.country || 'India'}</span>
                                            </div>
                                        </div>

                                        {/* CONTENT */}
                                        <div className="p-4 flex flex-col flex-1">
                                            <h3 className="text-[14px] font-black text-slate-800 leading-tight mb-1 group-hover:text-green-700 transition-colors">
                                                {member.name}
                                            </h3>
                                            <p className="text-green-600 text-[10px] font-bold uppercase tracking-wide mb-1">
                                                {member.role}
                                            </p>
                                            <p className="text-slate-500 text-[11px] leading-relaxed mb-3">
                                                {member.organization}
                                            </p>

                                            <div className="w-8 h-[2.5px] bg-green-600 mb-4 rounded-full" />

                                            <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-50">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Profile</span>
                                                    <ArrowRight size={10} className="text-slate-300" />
                                                </div>
                                                
                                                {member.linkedin && (
                                                    <a 
                                                        href={member.linkedin} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="w-7 h-7 rounded-lg bg-[#0077b5] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm"
                                                    >
                                                        <Linkedin size={12} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvisoryManagement;
