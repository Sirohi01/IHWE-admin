import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import {
    Type, Save, Image as ImageIcon, Plus, Trash2, Edit,
    Handshake, Package, ChevronDown, ChevronUp
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const PartnerManagement = () => {
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Group Form State (for adding/editing group headings)
    const [groupForm, setGroupForm] = useState({
        subheading: 'Title Partners',
        heading: 'Industry Leadership',
        highlightText: 'Leadership'
    });
    const [isEditingGroupId, setIsEditingGroupId] = useState(null);

    // Partner Form State (for adding logo to a specific group)
    const [partnerForm, setPartnerForm] = useState({
        name: '',
        logo: '',
        imageAlt: '',
        groupId: ''
    });
    const [isEditingPartnerId, setIsEditingPartnerId] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/partners');
            if (response.data.success) {
                setGroups(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching partners:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Group Operations ───
    const handleGroupSubmit = async () => {
        setIsLoading(true);
        try {
            let response;
            if (isEditingGroupId) {
                response = await api.put(`/api/partners/groups/${isEditingGroupId}`, groupForm);
            } else {
                response = await api.post('/api/partners/groups', groupForm);
            }

            if (response.data.success) {
                Swal.fire({ icon: 'success', title: isEditingGroupId ? 'Group Updated!' : 'Group Added!', timer: 1500, showConfirmButton: false });
                setGroupForm({ subheading: 'Title Partners', heading: 'Industry Leadership', highlightText: 'Leadership' });
                setIsEditingGroupId(null);
                fetchData();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to save group', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteGroup = async (groupId) => {
        const result = await Swal.fire({
            title: 'Delete this entire group?',
            text: "All partners in this group will be removed.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });
        if (!result.isConfirmed) return;

        setIsLoading(true);
        try {
            await api.delete(`/api/partners/groups/${groupId}`);
            fetchData();
            Swal.fire('Deleted', 'Group removed successfully', 'success');
        } catch (error) {
            Swal.fire('Error', 'Failed to delete group', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const startEditGroup = (group) => {
        setIsEditingGroupId(group._id);
        setGroupForm({
            subheading: group.subheading,
            heading: group.heading,
            highlightText: group.highlightText
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ─── Partner Operations ───
    const handleImageChange = (e, groupId) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        // Crucial: Set the groupId in partnerForm so the preview shows in the correct box immediately
        setPartnerForm(prev => ({ ...prev, groupId }));
    };

    const uploadLogo = async () => {
        if (!imageFile) return partnerForm.logo;
        const formData = new FormData();
        formData.append('logo', imageFile);
        const res = await api.post('/api/partners/upload-logo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) return res.data.imageUrl;
        throw new Error('Logo upload failed');
    };

    const handlePartnerSubmit = async (groupId) => {
        if (!imageFile && !partnerForm.logo) {
            Swal.fire('Warning', 'Please upload a logo', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            let logoUrl = partnerForm.logo;
            if (imageFile) {
                logoUrl = await uploadLogo();
            }
            
            let response;
            if (isEditingPartnerId) {
                // For simplicity in sub-document updates, we can use a PUT on the group with the partner ID
                // But I'll implement a specific route for updating partner details if needed.
                // For now, let's assume we add/delete or I'll add the PUT route in backend.
                response = await api.put(`/api/partners/groups/${groupId}/partners/${isEditingPartnerId}`, {
                    name: partnerForm.name,
                    logo: logoUrl,
                    imageAlt: partnerForm.imageAlt
                });
            } else {
                response = await api.post(`/api/partners/groups/${groupId}/partners`, {
                    name: partnerForm.name,
                    logo: logoUrl,
                    imageAlt: partnerForm.imageAlt
                });
            }

            if (response.data.success) {
                Swal.fire({ icon: 'success', title: isEditingPartnerId ? 'Partner Updated!' : 'Partner Added!', timer: 1500, showConfirmButton: false });
                resetPartnerForm();
                fetchData();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to save partner', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const startEditPartner = (group, partner) => {
        setIsEditingPartnerId(partner._id);
        setPartnerForm({
            name: partner.name || '',
            logo: partner.logo,
            imageAlt: partner.imageAlt || '',
            groupId: group._id
        });
        setImagePreview(`${SERVER_URL}${partner.logo}`);
        setImageFile(null);
        // Scroll to the group's "Add/Edit" section
        const element = document.getElementById(`group-section-${group._id}`);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleDeletePartner = async (groupId, partnerId) => {
        const result = await Swal.fire({
            title: 'Remove this partner?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, remove!'
        });
        if (!result.isConfirmed) return;

        setIsLoading(true);
        try {
            await api.delete(`/api/partners/groups/${groupId}/partners/${partnerId}`);
            fetchData();
            Swal.fire('Deleted', 'Partner removed', 'success');
        } catch (error) {
            Swal.fire('Error', 'Failed to remove partner', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const resetPartnerForm = () => {
        setPartnerForm({ name: '', logo: '', imageAlt: '', groupId: '' });
        setIsEditingPartnerId(null);
        setImageFile(null);
        setImagePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="PARTNERS MANAGEMENT"
                description="Manage partner groups, categories and logos"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* LEFT: Add/Edit Group Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm sticky top-24">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
                            {isEditingGroupId ? <Edit className="w-5 h-5 text-[#d26019]" /> : <Plus className="w-5 h-5 text-[#d26019]" />}
                            {isEditingGroupId ? 'Edit Partner Group' : 'Add New Partner Group'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Sub Heading (e.g. Title Partners)</label>
                                <input
                                    type="text"
                                    value={groupForm.subheading}
                                    onChange={(e) => setGroupForm({ ...groupForm, subheading: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                    placeholder="e.g. Strategic Partners"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Main Heading</label>
                                <input
                                    type="text"
                                    value={groupForm.heading}
                                    onChange={(e) => setGroupForm({ ...groupForm, heading: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                    placeholder="e.g. Industry Leadership"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight text-[#23471d]">Highlight Text (Green)</label>
                                <input
                                    type="text"
                                    value={groupForm.highlightText}
                                    onChange={(e) => setGroupForm({ ...groupForm, highlightText: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-[#23471d] focus:border-[#23471d] outline-none shadow-sm"
                                    placeholder="Word(s) to turn green in heading..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleGroupSubmit}
                                    disabled={isLoading}
                                    className="flex-1 py-2 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" /> {isEditingGroupId ? 'Update Group' : 'Save Group'}
                                </button>
                                {isEditingGroupId && (
                                    <button 
                                        onClick={() => { setIsEditingGroupId(null); setGroupForm({ subheading: 'Title Partners', heading: 'Industry Leadership', highlightText: 'Leadership' }); }}
                                        className="px-4 py-2 border-2 border-gray-200 text-gray-500 font-bold hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Quick Tip */}
                        <div className="mt-8 p-4 bg-orange-50 border-l-4 border-[#d26019] text-sm">
                            <p className="font-bold text-[#d26019] mb-1">How it works:</p>
                            <p className="text-gray-600 leading-relaxed italic">
                                Create a group first, then you can add multiple logos to that specific group below. Each group gets its own table.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT: List of Groups with their Tables */}
                <div className="lg:col-span-2 space-y-12">
                    {!groups.length ? (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 py-20 text-center rounded-xl">
                            <Handshake className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">No partner groups yet. Create your first group on the left.</p>
                        </div>
                    ) : groups.map((group) => (
                        <div key={group._id} id={`group-section-${group._id}`} className="bg-white border-2 border-gray-200 shadow-md rounded-lg overflow-hidden translate-y-0 hover:-translate-y-1 transition-all duration-300">
                            {/* Group Header */}
                            <div className="bg-slate-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-[#d26019] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                            {group.subheading}
                                        </span>
                                        <h3 className="text-white font-bold text-lg">
                                            {group.heading.split(group.highlightText).map((part, i, arr) => (
                                                <span key={i}>
                                                    {part}
                                                    {i < arr.length - 1 && <span className="text-[#4ade80]">{group.highlightText}</span>}
                                                </span>
                                            ))}
                                        </h3>
                                    </div>
                                    <p className="text-slate-400 text-xs italic">Manage logos for this section below.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => startEditGroup(group)} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors" title="Edit Headings">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteGroup(group._id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition-colors" title="Delete Entire Group">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Add Partner Form for this Group */}
                                <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row items-end gap-4">
                                    <div className="flex-1 w-full space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Brand/Partner Name (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={partnerForm.groupId === group._id ? partnerForm.name : ''}
                                                    onChange={(e) => setPartnerForm({ ...partnerForm, groupId: group._id, name: e.target.value })}
                                                    className="w-full px-3 py-2 border border-slate-300 focus:border-[#23471d] outline-none text-sm bg-white"
                                                    placeholder="e.g. Organixmantra"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Alt Text (SEO)</label>
                                                <input
                                                    type="text"
                                                    value={partnerForm.groupId === group._id ? partnerForm.imageAlt : ''}
                                                    onChange={(e) => setPartnerForm({ ...partnerForm, groupId: group._id, imageAlt: e.target.value })}
                                                    className="w-full px-3 py-2 border border-slate-300 focus:border-[#23471d] outline-none text-sm bg-white"
                                                    placeholder="Alt text for screen readers..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Logo Image</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        ref={partnerForm.groupId === group._id ? fileInputRef : null}
                                                        type="file"
                                                        onChange={(e) => handleImageChange(e, group._id)}
                                                        accept="image/*"
                                                        className="hidden"
                                                        id={`file-${group._id}`}
                                                    />
                                                    <label
                                                        htmlFor={`file-${group._id}`}
                                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-slate-300 hover:border-[#23471d] bg-white cursor-pointer transition-colors text-xs text-slate-500 font-bold"
                                                    >
                                                        {partnerForm.groupId === group._id && imagePreview ? (
                                                            <div className="flex items-center gap-2">
                                                                <img src={imagePreview} className="w-6 h-6 object-contain rounded" />
                                                                <span className="text-[#23471d]">Image Selected</span>
                                                            </div>
                                                        ) : (
                                                            <><ImageIcon className="w-4 h-4" /> Click to Upload Logo</>
                                                        )}
                                                    </label>
                                                    {partnerForm.groupId === group._id && imagePreview && (
                                                        <button onClick={resetPartnerForm} className="bg-red-50 text-red-500 p-2 rounded border border-red-100">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handlePartnerSubmit(group._id)}
                                        disabled={isLoading || (partnerForm.groupId !== group._id && partnerForm.groupId !== '')}
                                        className="bg-[#d26019] hover:bg-[#b05015] text-white px-6 py-2 rounded font-bold text-sm shadow-md transition-all flex items-center gap-2 h-[42px] disabled:opacity-50"
                                    >
                                        {isEditingPartnerId && partnerForm.groupId === group._id ? <><Edit className="w-4 h-4" /> Update Partner</> : <><Plus className="w-4 h-4" /> Add Partner</>}
                                    </button>
                                    {isEditingPartnerId && partnerForm.groupId === group._id && (
                                        <button onClick={resetPartnerForm} className="h-[42px] px-4 border border-slate-300 text-slate-500 font-bold text-xs hover:bg-slate-100 rounded">
                                            Cancel
                                        </button>
                                    )}
                                </div>

                                {/* Partners Table for this Group */}
                                <div className="overflow-x-auto rounded-lg border border-slate-100">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                                <th className="py-3 px-4 text-left w-12 font-black uppercase text-[10px]">No.</th>
                                                <th className="py-3 px-4 text-left w-32 font-black uppercase text-[10px]">Logo</th>
                                                <th className="py-3 px-4 text-left font-black uppercase text-[10px]">Brand Name / Alt</th>
                                                <th className="py-3 px-4 text-right font-black uppercase text-[10px]">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {!group.partners?.length ? (
                                                <tr>
                                                    <td colSpan={4} className="py-10 text-center text-slate-400 italic">
                                                        No logos added yet for this group.
                                                    </td>
                                                </tr>
                                            ) : group.partners.map((partner, pIdx) => (
                                                <tr key={partner._id} className="hover:bg-slate-50 transition-colors group/row">
                                                    <td className="py-3 px-4 font-bold text-slate-400">{pIdx + 1}</td>
                                                    <td className="py-3 px-4">
                                                        <div className="w-20 h-12 bg-white border border-slate-200 p-1 flex items-center justify-center rounded">
                                                            <img src={`${SERVER_URL}${partner.logo}`} className="max-h-full max-w-full object-contain" />
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 font-semibold text-slate-700">
                                                        <div>{partner.name || <span className="text-slate-300 font-normal">N/A</span>}</div>
                                                        <div className="text-[10px] text-slate-400 font-normal">Alt: {partner.imageAlt || 'N/A'}</div>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button 
                                                                onClick={() => startEditPartner(group, partner)}
                                                                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all"
                                                                title="Edit Partner"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeletePartner(group._id, partner._id)}
                                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
                                                                title="Delete Partner"
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
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PartnerManagement;
