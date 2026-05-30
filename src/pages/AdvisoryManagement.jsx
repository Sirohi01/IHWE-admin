import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import {
    Save, Image as ImageIcon, Plus, Trash2, Edit,
    Users, Briefcase, Building, Linkedin, Globe, X, ArrowUp10
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const EMPTY_MEMBER = {
    name: '',
    role: '',
    organization: '',
    image: '',
    imageAlt: '',
    linkedin: '',
    country: 'India',
    displayOrder: 0
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

        if (file.size > 500 * 1024) {
            Swal.fire({
                icon: 'error',
                title: 'Image Too Large',
                text: 'Image size should not exceed 500KB.',
                confirmButtonColor: '#23471d'
            });
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

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

            const payload = { 
                ...memberForm, 
                image: imageUrl,
                displayOrder: memberForm.displayOrder !== '' ? Number(memberForm.displayOrder) : 0
            };
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
            country: member.country || 'India',
            displayOrder: member.displayOrder !== undefined ? member.displayOrder : 0
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
                description="Create and manage your esteemed advisory board members"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                
                {/* LEFT: FORM SECTION */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
                            {isEditingId ? <Edit className="w-5 h-5 text-[#d26019]" /> : <Plus className="w-5 h-5 text-[#d26019]" />}
                            {isEditingId ? 'Edit Member Details' : 'Add New Member'}
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={memberForm.name}
                                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                    placeholder="e.g. Dr. Soumya Swaminathan"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role / Designation</label>
                                <input
                                    type="text"
                                    value={memberForm.role}
                                    onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                    placeholder="e.g. Chairman"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Organization</label>
                                <input
                                    type="text"
                                    value={memberForm.organization}
                                    onChange={(e) => setMemberForm({ ...memberForm, organization: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                    placeholder="e.g. WHO (Former Chief Scientist)"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Country</label>
                                    <input
                                        type="text"
                                        value={memberForm.country}
                                        onChange={(e) => setMemberForm({ ...memberForm, country: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                        placeholder="e.g. India"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        value={memberForm.displayOrder}
                                        onChange={(e) => setMemberForm({ ...memberForm, displayOrder: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                        placeholder="e.g. 1"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">LinkedIn URL</label>
                                <input
                                    type="text"
                                    value={memberForm.linkedin}
                                    onChange={(e) => setMemberForm({ ...memberForm, linkedin: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-tight">Member Portrait</label>
                                <div className="grid grid-cols-1 gap-4">
                                     <div className="border-2 border-dashed border-gray-300 hover:border-[#23471d] transition-colors p-3 bg-gray-50">
                                         <input
                                             type="file"
                                             ref={fileInputRef}
                                             accept="image/*"
                                             onChange={handleImageChange}
                                             className="w-full text-[10px] text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-[10px] file:font-bold file:bg-[#23471d] file:text-white hover:file:bg-[#d26019] file:cursor-pointer cursor-pointer uppercase"
                                         />
                                         <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">Max: 500KB</p>
                                     </div>

                                     {imagePreview ? (
                                         <div className="relative h-48 group">
                                             <img 
                                                src={imagePreview.startsWith('blob:') ? imagePreview : `${SERVER_URL}${imagePreview}`} 
                                                className="w-full h-full object-cover border-2 border-gray-200 shadow-sm object-top" 
                                                alt="Preview" 
                                             />
                                             <button
                                                 type="button"
                                                 onClick={() => { setImageFile(null); setImagePreview(''); setMemberForm({ ...memberForm, image: '' }); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                                 className="absolute bottom-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg"
                                             >
                                                 <Trash2 size={14} />
                                             </button>
                                         </div>
                                     ) : (
                                         <div className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                                             <ImageIcon className="w-8 h-8 mb-1 opacity-20" />
                                             <p className="text-[10px] font-bold uppercase">No image selected</p>
                                         </div>
                                     )}

                                     <input
                                         type="text"
                                         value={memberForm.imageAlt}
                                         onChange={(e) => setMemberForm({ ...memberForm, imageAlt: e.target.value })}
                                         className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs shadow-sm bg-white"
                                         placeholder="Image Alt Text..."
                                     />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        : isEditingId ? <><Edit className="w-4 h-4" /> Update Profile</> : <><Plus className="w-4 h-4" /> Add Member</>}
                                </button>
                                {isEditingId && (
                                    <button onClick={resetForm} className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: LIST SECTION */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm">
                        <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2">
                                <Users className="w-4 h-4" /> Board Members List
                            </h2>
                            <span className="bg-[#d26019] text-white text-xs font-black px-3 py-1 uppercase tracking-wider">
                                {members.length} MEMBERS
                            </span>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-10">NO.</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">IMAGE</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">NAME</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">DESIGNATION & ORG</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase text-center w-24">ORDER</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-20">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!members?.length ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-gray-400">
                                                No board members cataloged yet.
                                            </td>
                                        </tr>
                                    ) : members.map((member, idx) => (
                                        <tr key={member._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-gray-500 font-bold">{idx + 1}</td>
                                            <td className="py-3 px-4">
                                                {member.image ? (
                                                    <img src={`${SERVER_URL}${member.image}`} alt={member.imageAlt} className="w-10 h-12 object-cover border border-gray-200 object-top" />
                                                ) : (
                                                    <div className="w-10 h-12 bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                                                        <ImageIcon size={14} />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-bold text-gray-800 text-sm">{member.name}</p>
                                                {member.country && (
                                                    <span className="inline-block text-[9px] font-bold text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5 mt-1 uppercase tracking-wider">
                                                        {member.country}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-xs text-gray-600">
                                                <div className="font-bold text-gray-700">{member.role}</div>
                                                <div className="text-gray-500">{member.organization}</div>
                                                {member.linkedin && (
                                                    <a 
                                                        href={member.linkedin} 
                                                        target="_blank" 
                                                        rel="noreferrer" 
                                                        className="inline-flex items-center gap-1 text-[#0077b5] hover:underline font-semibold mt-1"
                                                    >
                                                        <Linkedin size={10} /> LinkedIn
                                                    </a>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded border border-gray-200">
                                                    {member.displayOrder || 0}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => startEdit(member)} className="text-blue-500 hover:text-blue-700 p-1 transition-colors" title="Edit">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(member._id)} className="text-red-500 hover:text-red-700 p-1 transition-colors" title="Delete">
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
