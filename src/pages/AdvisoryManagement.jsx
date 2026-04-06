import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import {
    Save, Image as ImageIcon, Plus, Trash2, Edit,
    Users, Briefcase, Building, Type
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const EMPTY_MEMBER = {
    name: '',
    role: '',
    organization: '',
    image: '',
    imageAlt: ''
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
            imageAlt: member.imageAlt || ''
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
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="ADVISORY BOARD MANAGEMENT"
                description="Manage advisory board members, their roles, and organizations"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* LEFT: Member Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm sticky top-6">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#23471d]">
                            {isEditingId ? <Edit className="w-5 h-5 text-[#d26019]" /> : <Plus className="w-5 h-5 text-[#d26019]" />}
                            {isEditingId ? 'Edit Advisory Member' : 'Add Advisory Member'}
                        </h2>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Member Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Users size={14} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={memberForm.name}
                                        onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                        placeholder="e.g. Dr. Rajiv Chhibber"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role / Designation</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Briefcase size={14} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={memberForm.role}
                                        onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                        placeholder="e.g. Vice President"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Organization</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Building size={14} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={memberForm.organization}
                                        onChange={(e) => setMemberForm({ ...memberForm, organization: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                        placeholder="e.g. SMT Ltd."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Member Photo</label>
                                {imagePreview ? (
                                    <div className="relative h-48 border-2 border-gray-200 overflow-hidden mb-2 group">
                                        <img 
                                            src={imagePreview.startsWith('blob:') ? imagePreview : `${SERVER_URL}${imagePreview}`} 
                                            className="w-full h-full object-cover" 
                                            alt="Preview" 
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={() => { setImageFile(null); setImagePreview(''); setMemberForm({ ...memberForm, image: '' }); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#23471d] hover:bg-gray-50 transition-all">
                                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-500 font-medium">Click to upload photo</span>
                                        <span className="text-[10px] text-gray-400 mt-1 uppercase">JPG, PNG or WEBP</span>
                                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                    </label>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image Alt Text (SEO)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Type size={14} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={memberForm.imageAlt}
                                        onChange={(e) => setMemberForm({ ...memberForm, imageAlt: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                        placeholder="Alt text for screen readers..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="flex-1 py-3 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            {isEditingId ? 'Update Member' : 'Save Member'}
                                        </>
                                    )}
                                </button>
                                {isEditingId && (
                                    <button 
                                        onClick={resetForm} 
                                        className="px-6 py-3 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors shadow-sm"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Members List Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-[#23471d] px-4 py-2.5 flex items-center justify-between">
                            <h2 className="text-white text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                                <Users className="w-4 h-4" /> Advisory Members List
                            </h2>
                            <span className="bg-[#d26019] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                {members.length} Members
                            </span>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-[12px]">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="text-left py-2.5 px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest w-16">Photo</th>
                                        <th className="text-left py-2.5 px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Member Details</th>
                                        <th className="text-left py-2.5 px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Organization</th>
                                        <th className="text-center py-2.5 px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">LAST UPDATED BY</th>
                                        <th className="text-right py-2.5 px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Actions</th>

                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {members.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-10 text-gray-400 italic">
                                                No advisory members found.
                                            </td>
                                        </tr>
                                    ) : members.map((member) => (
                                        <tr key={member._id} className="hover:bg-gray-50/50 transition-colors group/row">
                                            <td className="py-2.5 px-4">
                                                <div className="w-12 h-12 rounded overflow-hidden border border-gray-200">
                                                    <img 
                                                        src={`${SERVER_URL}${member.image}`} 
                                                        alt={member.imageAlt} 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700 text-sm">{member.name}</span>
                                                    <span className="text-[#d26019] text-[10px] font-bold uppercase tracking-wide mt-0.5">{member.role}</span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-4">
                                                <span className="inline-flex items-center px-2 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-bold rounded uppercase tracking-tighter border border-slate-100">
                                                    {member.organization}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-4 text-center">
                                                <div className="flex flex-col gap-1 items-center">
                                                    <span className="font-bold text-red-600 underline underline-offset-2 uppercase text-[10px]">
                                                        {member.updatedBy || 'System'}
                                                    </span>
                                                    <span className="text-[9px] text-gray-500 font-bold whitespace-nowrap text-center">
                                                        {member.updatedAt ? new Date(member.updatedAt).toLocaleString('en-GB', { 
                                                            day: '2-digit', month: 'short', year: 'numeric', 
                                                            hour: '2-digit', minute: '2-digit', hour12: true 
                                                        }) : 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-4 text-right">

                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => startEdit(member)} 
                                                        className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-all"
                                                        title="Edit Member"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(member._id)} 
                                                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                                                        title="Delete Member"
                                                    >
                                                        <Trash2 size={16} />
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

export default AdvisoryManagement;
