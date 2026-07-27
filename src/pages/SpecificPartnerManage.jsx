import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import { Image as ImageIcon, Plus, Trash2, Edit, Save } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const SpecificPartnerManage = ({ pageTitle, subheading, heading }) => {
    const [group, setGroup] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Partner Form State
    const [partnerForm, setPartnerForm] = useState({
        name: '',
        logo: '',
        imageAlt: ''
    });
    const [isEditingPartnerId, setIsEditingPartnerId] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => { fetchData(); }, [subheading]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/partners');
            if (response.data.success) {
                let targetGroup = response.data.data.find(g => g.subheading === subheading);
                if (!targetGroup) {
                    // Create if doesn't exist
                    const createRes = await api.post('/api/partners/groups', { subheading, heading, highlightText: 'Leadership' });
                    if (createRes.data.success) targetGroup = createRes.data.data;
                }
                setGroup(targetGroup);
            }
        } catch (error) {
            console.error('Error fetching group:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const uploadLogo = async () => {
        const formData = new FormData();
        formData.append('logo', imageFile);
        const res = await api.post('/api/partners/upload-logo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) return res.data.imageUrl;
        throw new Error('Logo upload failed');
    };

    const handlePartnerSubmit = async () => {
        if (!imageFile && !partnerForm.logo && !partnerForm.name) {
            Swal.fire('Warning', 'Please provide a name or upload a logo', 'warning');
            return;
        }
        if (!group) return;

        setIsLoading(true);
        try {
            let logoUrl = partnerForm.logo;
            if (imageFile) {
                logoUrl = await uploadLogo();
            }

            let response;
            if (isEditingPartnerId) {
                response = await api.put(`/api/partners/groups/${group._id}/partners/${isEditingPartnerId}`, {
                    ...partnerForm,
                    logo: logoUrl
                });
            } else {
                response = await api.post(`/api/partners/groups/${group._id}/partners`, {
                    ...partnerForm,
                    logo: logoUrl
                });
            }

            if (response.data.success) {
                Swal.fire({ icon: 'success', title: isEditingPartnerId ? 'Updated!' : 'Added!', timer: 1500, showConfirmButton: false });
                resetPartnerForm();
                fetchData();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to save', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePartner = async (partnerId) => {
        const result = await Swal.fire({
            title: 'Remove this entry?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, remove'
        });
        if (!result.isConfirmed) return;

        setIsLoading(true);
        try {
            await api.delete(`/api/partners/groups/${group._id}/partners/${partnerId}`);
            fetchData();
            Swal.fire('Deleted', 'Entry removed', 'success');
        } catch (error) {
            Swal.fire('Error', 'Failed to remove', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const startEditPartner = (partner) => {
        setIsEditingPartnerId(partner._id);
        setPartnerForm({
            name: partner.name || '',
            logo: partner.logo || '',
            imageAlt: partner.imageAlt || ''
        });
        setImageFile(null);
        if (partner.logo) {
            setImagePreview(partner.logo.startsWith('http') ? partner.logo : `${SERVER_URL}${partner.logo}`);
        } else {
            setImagePreview('');
        }
    };

    const resetPartnerForm = () => {
        setIsEditingPartnerId(null);
        setPartnerForm({ name: '', logo: '', imageAlt: '' });
        setImageFile(null);
        setImagePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto bg-slate-50 min-h-screen">
            <PageHeader title={pageTitle} />
            
            {/* Form Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-[#012112]">{isEditingPartnerId ? 'Edit Entry' : 'Add New Entry'}</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Brand/Name</label>
                            <input
                                type="text"
                                value={partnerForm.name}
                                onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-300 focus:border-[#23471d] outline-none rounded text-sm transition-colors"
                                placeholder="Name of Partner"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Alt Text</label>
                            <input
                                type="text"
                                value={partnerForm.imageAlt}
                                onChange={(e) => setPartnerForm({ ...partnerForm, imageAlt: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-300 focus:border-[#23471d] outline-none rounded text-sm transition-colors"
                                placeholder="For screen readers"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Logo (Optional)</label>
                            <div className="flex gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id={`file-upload`}
                                    accept="image/*"
                                />
                                <label
                                    htmlFor={`file-upload`}
                                    className="flex-1 px-4 py-2.5 border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded text-sm font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2"
                                >
                                    {imagePreview ? (
                                        <div className="flex items-center gap-2">
                                            <img src={imagePreview} className="w-6 h-6 object-contain rounded" />
                                            <span className="text-[#23471d]">Selected</span>
                                        </div>
                                    ) : (
                                        <><ImageIcon size={16} /> Upload</>
                                    )}
                                </label>
                                {imagePreview && (
                                    <button onClick={() => { setImageFile(null); setImagePreview(''); setPartnerForm({ ...partnerForm, logo: '' }); }} className="bg-red-50 text-red-500 p-2.5 rounded border border-red-100 hover:bg-red-100 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePartnerSubmit}
                                disabled={isLoading}
                                className="flex-1 bg-[#d26019] hover:bg-[#b05015] text-white px-6 py-2.5 rounded font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isEditingPartnerId ? <><Save size={16} /> Update</> : <><Plus size={16} /> Save</>}
                            </button>
                            {isEditingPartnerId && (
                                <button onClick={resetPartnerForm} className="px-4 py-2.5 border border-slate-300 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded transition-colors">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-[#012112]">Current Entries</h3>
                    <span className="text-xs font-semibold bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">{group?.partners?.length || 0} Total</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-white text-slate-500 border-b border-slate-200">
                                <th className="py-4 px-6 text-left w-16 font-black uppercase text-[10px]">No.</th>
                                <th className="py-4 px-6 text-left w-32 font-black uppercase text-[10px]">Logo</th>
                                <th className="py-4 px-6 text-left font-black uppercase text-[10px]">Name</th>
                                <th className="py-4 px-6 text-right font-black uppercase text-[10px]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading && !group ? (
                                <tr><td colSpan={4} className="py-10 text-center text-slate-400">Loading...</td></tr>
                            ) : !group?.partners?.length ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-slate-400 italic bg-slate-50/50">
                                        No entries found. Add your first {pageTitle.toLowerCase()} above.
                                    </td>
                                </tr>
                            ) : group.partners.map((partner, idx) => (
                                <tr key={partner._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-6 font-bold text-slate-400">{idx + 1}</td>
                                    <td className="py-4 px-6">
                                        {partner.logo ? (
                                            <div className="w-20 h-12 bg-white border border-slate-200 p-1 flex items-center justify-center rounded">
                                                <img src={partner.logo.startsWith('http') ? partner.logo : `${SERVER_URL}${partner.logo}`} className="max-h-full max-w-full object-contain" />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-12 bg-slate-100 border border-slate-200 p-1 flex items-center justify-center rounded text-xs text-slate-400 font-medium italic">
                                                No Logo
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 font-semibold text-slate-700">
                                        <div>{partner.name || <span className="text-slate-300 font-normal">N/A</span>}</div>
                                        {partner.imageAlt && <div className="text-[10px] text-slate-400 font-normal mt-0.5">Alt: {partner.imageAlt}</div>}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => startEditPartner(partner)} className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors" title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDeletePartner(partner._id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors" title="Delete">
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
    );
};

export default SpecificPartnerManage;
