import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Upload, Trash2, Plus, Save, Calendar, UserCheck, Utensils, Car, Info, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../lib/api';

const AddTeamMembersAdmin = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const emptyRow = { photo: null, photoPreview: '', name: '', designation: '', mobile: '', email: '', roleAtExhibition: '', idProof: '', idProofDoc: null, idProofDocPreview: '', isUploadingPhoto: false, isUploadingId: false };
    const [rows, setRows] = useState(Array(3).fill().map(() => ({ ...emptyRow })));
    const [isSaving, setIsSaving] = useState(false);

    const handleAddRow = () => {
        setRows([...rows, { ...emptyRow }]);
    };

    const handleDeleteRow = (index) => {
        if (rows.length === 1) return;
        const newRows = [...rows];
        newRows.splice(index, 1);
        setRows(newRows);
    };

    const handleFieldChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value;
        setRows(newRows);
    };

    const handlePhotoUpload = async (index, file) => {
        if (!file) return;

        let newRows = [...rows];
        newRows[index].isUploadingPhoto = true;
        setRows([...newRows]);

        const formData = new FormData();
        formData.append('photo', file);
        formData.append('documentType', 'personphoto');
        try {
            const uploadRes = await api.post('/api/client-contacts/admin-upload-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (uploadRes.data?.success) {
                newRows = [...rows];
                newRows[index].photoPreview = URL.createObjectURL(file);
                newRows[index].photoUrl = uploadRes.data.url || uploadRes.data.fileUrl;
                newRows[index].photo = file;
                newRows[index].isUploadingPhoto = false;
                setRows([...newRows]);
            }
        } catch (e) {
            console.log(e);
            Swal.fire('AI Verification Failed', e.response?.data?.message || 'Verification failed', 'error');
            newRows = [...rows];
            newRows[index].photoPreview = '';
            newRows[index].photo = null;
            newRows[index].photoUrl = '';
            newRows[index].isUploadingPhoto = false;
            setRows([...newRows]);
        }
    };

    const handleIdProofUpload = async (index, file) => {
        if (!file) return;

        let newRows = [...rows];
        newRows[index].isUploadingId = true;
        setRows([...newRows]);

        const formData = new FormData();
        formData.append('photo', file);
        formData.append('documentType', 'idproof');
        try {
            const uploadRes = await api.post('/api/client-contacts/admin-upload-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (uploadRes.data?.success) {
                newRows = [...rows];
                newRows[index].idProofDocPreview = file.name;
                newRows[index].idProofUrl = uploadRes.data.url || uploadRes.data.fileUrl;
                newRows[index].idProofDoc = file;
                newRows[index].isUploadingId = false;
                setRows([...newRows]);
            }
        } catch (e) {
            console.log(e);
            Swal.fire('AI Verification Failed', e.response?.data?.message || 'Verification failed', 'error');
            newRows = [...rows];
            newRows[index].idProofDocPreview = '';
            newRows[index].idProofDoc = null;
            newRows[index].idProofUrl = '';
            newRows[index].isUploadingId = false;
            setRows([...newRows]);
        }
    };

    const handleSaveAll = async () => {
        const validRows = rows.filter(r => r.name || r.email || r.mobile);

        if (validRows.length === 0) {
            Swal.fire('Warning', 'Please fill at least one row', 'warning');
            return;
        }

        for (let i = 0; i < validRows.length; i++) {
            const r = validRows[i];
            if (!r.name || !r.designation || !r.mobile || !r.email || !r.roleAtExhibition) {
                Swal.fire('Error', `Please fill all mandatory fields (*) for Row ${i + 1}`, 'error');
                return;
            }
        }

        setIsSaving(true);
        try {
            const uploadedMembers = [];
            for (const row of validRows) {
                let photoUrl = row.photoUrl || '';
                let idProofUrl = row.idProofUrl || '';

                uploadedMembers.push({
                    name: row.name,
                    designation: row.designation,
                    mobile: row.mobile,
                    email: row.email,
                    roleAtExhibition: row.roleAtExhibition,
                    idProof: row.idProof,
                    idProofUrl: idProofUrl,
                    photoUrl: photoUrl,
                    passes: {
                        exhibitor: true, vehicle: true, service: true, visitor: false
                    },
                    verificationStatus: "Verified" // Admins adding means they are verified
                });
            }

            // Fetch existing contacts for this client
            const getRes = await api.get(`/api/client-contacts/${id}`);
            let existingTeam = [];
            if (getRes.data.success) {
                existingTeam = getRes.data.data || [];
            }

            const updatedTeam = [...existingTeam, ...uploadedMembers];

            // Save back
            const updateRes = await api.put(`/api/client-contacts/${id}/contacts`, {
                contacts: updatedTeam
            });

            if (updateRes.data.success) {
                Swal.fire('Success', 'Team members added successfully!', 'success');
                navigate(`/client-contacts/${id}`);
            } else {
                throw new Error('Failed to update team members');
            }

        } catch (error) {
            console.error('Error saving members:', error);
            Swal.fire('Error', 'An error occurred while saving team members.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 font-sans">
            <div className="max-w-[1400px] mx-auto space-y-6">

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <UserCheck className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Add Team Members</h1>
                            <p className="text-sm text-slate-500 mt-1">Add multiple team members for this exhibitor.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(`/client-contacts/${id}`)} className="h-10 px-4 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSaveAll} disabled={isSaving} className="h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 shadow-md shadow-blue-200 transition-colors disabled:opacity-70">
                            <Save size={16} />
                            {isSaving ? 'Saving...' : 'Save All Members'}
                        </button>
                    </div>
                </div>



                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center gap-3 text-blue-800">
                    <Info size={18} className="text-blue-500 flex-shrink-0" />
                    <p className="text-sm font-medium">Add as many team members as required. Use 'Add Row' to insert more members.</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1200px]">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-50/50">
                                    <th className="p-4 w-12 text-center">#</th>
                                    <th className="p-4 w-24">Photo</th>
                                    <th className="p-4 min-w-[180px]">Full Name <span className="text-red-500">*</span></th>
                                    <th className="p-4 min-w-[160px]">Designation <span className="text-red-500">*</span></th>
                                    <th className="p-4 min-w-[150px]">Mobile Number <span className="text-red-500">*</span></th>
                                    <th className="p-4 min-w-[180px]">Email ID <span className="text-red-500">*</span></th>
                                    <th className="p-4 min-w-[160px]">Role at Exhibition <span className="text-red-500">*</span></th>
                                    <th className="p-4 min-w-[140px]">ID Proof</th>
                                    <th className="p-4 w-16 text-center">Delete</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((row, index) => (
                                    <tr key={index} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="p-4">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs mx-auto">
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <label className="w-14 h-14 rounded-lg border-2 border-dashed border-blue-200 bg-blue-50 hover:bg-blue-100 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden group mx-auto">
                                                <input type="file" accept="image/jpeg, image/png" className="hidden" onChange={(e) => handlePhotoUpload(index, e.target.files[0])} disabled={row.isUploadingPhoto} />
                                                {row.isUploadingPhoto ? (
                                                    <div className="flex flex-col items-center justify-center">
                                                        <Loader2 size={16} className="text-blue-500 animate-spin mb-1" />
                                                        <span className="text-[9px] font-semibold text-blue-600 uppercase text-center leading-none mt-1">Uploading...</span>
                                                    </div>
                                                ) : row.photoPreview ? (
                                                    <img src={row.photoPreview} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <>
                                                        <Upload size={14} className="text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
                                                        <span className="text-[9px] font-semibold text-blue-600 uppercase text-center leading-none mt-1">Upload<br /><span className="text-[7px] text-blue-400 font-normal">JPG, PNG</span></span>
                                                    </>
                                                )}
                                            </label>
                                        </td>
                                        <td className="p-4">
                                            <input type="text" value={row.name} onChange={(e) => handleFieldChange(index, 'name', e.target.value)} placeholder="Full Name" className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium text-slate-700" />
                                        </td>
                                        <td className="p-4">
                                            <select value={row.designation} onChange={(e) => handleFieldChange(index, 'designation', e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium text-slate-700 bg-white">
                                                <option value="">Select</option>
                                                <option value="Sales Manager">Sales Manager</option>
                                                <option value="Marketing Executive">Marketing Executive</option>
                                                <option value="Sales Executive">Sales Executive</option>
                                                <option value="Stall Incharge">Stall Incharge</option>
                                                <option value="Technical Executive">Technical Executive</option>
                                                <option value="CEO">CEO</option>
                                                <option value="CTO">CTO</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex h-10 rounded-lg border border-slate-200 overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                                                <div className="bg-slate-50 px-2 flex items-center justify-center border-r border-slate-200 text-slate-500 text-sm font-medium">
                                                    +91
                                                </div>
                                                <input type="tel" value={row.mobile} onChange={(e) => handleFieldChange(index, 'mobile', e.target.value)} placeholder="Mobile Number" className="w-full h-full px-3 outline-none text-sm font-medium text-slate-700" />
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <input type="email" value={row.email} onChange={(e) => handleFieldChange(index, 'email', e.target.value)} placeholder="Email ID" className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium text-slate-700" />
                                        </td>
                                        <td className="p-4">
                                            <select value={row.roleAtExhibition} onChange={(e) => handleFieldChange(index, 'roleAtExhibition', e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium text-slate-700 bg-white">
                                                <option value="">Select</option>
                                                <option value="Primary Contact">Primary Contact</option>
                                                <option value="Marketing Team">Marketing Team</option>
                                                <option value="Sales Team">Sales Team</option>
                                                <option value="Stall Incharge">Stall Incharge</option>
                                                <option value="Technical Team">Technical Team</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-2">
                                                <select value={row.idProof} onChange={(e) => handleFieldChange(index, 'idProof', e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium text-slate-700 bg-white">
                                                    <option value="">Select</option>
                                                    <option value="Aadhaar Card">Aadhaar Card</option>
                                                    <option value="PAN Card">PAN Card</option>
                                                    <option value="Driving Licence">Driving Licence</option>
                                                    <option value="Passport">Passport</option>
                                                </select>
                                                {row.idProof && (
                                                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg p-2 text-xs text-slate-600 transition-colors w-full justify-between">
                                                        <span className="truncate max-w-[80px]">
                                                            {row.isUploadingId ? 'Uploading...' : row.idProofDoc ? 'Uploaded' : 'Upload Doc'}
                                                        </span>
                                                        {row.isUploadingId ? (
                                                            <Loader2 size={14} className="text-blue-500 animate-spin" />
                                                        ) : (
                                                            <Upload size={14} className={row.idProofDoc ? 'text-green-500' : 'text-blue-500'} />
                                                        )}
                                                        <input type="file" accept="image/jpeg, image/png, application/pdf" className="hidden" onChange={(e) => handleIdProofUpload(index, e.target.files[0])} disabled={row.isUploadingId} />
                                                    </label>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => handleDeleteRow(index)} className="w-8 h-8 rounded-lg border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors mx-auto" disabled={rows.length === 1}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex gap-3">
                            <button onClick={handleAddRow} className="h-9 px-4 rounded-lg border border-blue-200 text-blue-600 font-semibold text-sm flex items-center gap-2 hover:bg-blue-50 transition-colors">
                                <Plus size={16} />
                                Add Row
                            </button>
                            <button className="h-9 px-4 rounded-lg border border-red-200 text-red-500 font-semibold text-sm flex items-center gap-2 hover:bg-red-50 transition-colors opacity-60 cursor-not-allowed">
                                <Trash2 size={16} />
                                Delete Row
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-700">Total Members Added:</span>
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                                {rows.filter(r => r.name || r.email || r.mobile).length}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 flex gap-4 overflow-hidden relative">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner z-10">
                        <AlertCircle className="text-emerald-600" size={20} />
                    </div>
                    <div className="z-10">
                        <h3 className="text-sm font-bold text-emerald-900 mb-1">Please Note</h3>
                        <ul className="list-disc pl-4 text-sm text-emerald-800 space-y-1">
                            <li>All fields marked with <span className="text-red-500 font-bold">*</span> are mandatory.</li>
                            <li>Please ensure correct details for smooth verification and entry at the venue.</li>
                        </ul>
                    </div>
                    <div className="absolute right-[-10px] bottom-[-20px] opacity-10 pointer-events-none">
                        <ShieldCheck size={120} className="text-emerald-600" />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AddTeamMembersAdmin;
