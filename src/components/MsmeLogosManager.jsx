import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, CheckCircle, Upload } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../lib/api';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

const MsmeLogosManager = ({ msmeLogos, setMsmeLogos, isMsmeLogoActive, setIsMsmeLogoActive }) => {
    const [newLogo, setNewLogo] = useState({
        file: null,
        preview: '',
        title: '',
        category: 'Supported By'
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewLogo({ ...newLogo, file, preview: URL.createObjectURL(file) });
        }
    };

    const addLogo = async () => {
        if (!newLogo.file || !newLogo.title) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please upload an image and provide a title.',
                confirmButtonColor: '#23471d'
            });
            return;
        }

        try {
            setIsLoading(true);

            // Step 1: Upload file
            const formData = new FormData();
            formData.append('msmeLogoFile', newLogo.file);

            const uploadRes = await api.put('/api/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (uploadRes.data.success && uploadRes.data.uploadedMsmeLogoPath) {
                const uploadedPath = uploadRes.data.uploadedMsmeLogoPath;

                // Step 2: Add to array
                const newLogoObj = {
                    imageUrl: uploadedPath,
                    title: newLogo.title,
                    category: newLogo.category,
                    isActive: true,
                    displayOrder: msmeLogos.length
                };

                const updatedLogos = [...msmeLogos, newLogoObj];

                // Step 3: Save array
                const saveFormData = new FormData();
                saveFormData.append('msmeLogos', JSON.stringify(updatedLogos));
                saveFormData.append('isMsmeLogoActive', isMsmeLogoActive);

                const saveRes = await api.put('/api/settings', saveFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (saveRes.data.success) {
                    setMsmeLogos(saveRes.data.data.msmeLogos.map((logo, index) => ({
                        ...logo,
                        id: Date.now() + index,
                        preview: `${SERVER_URL}${logo.imageUrl}`
                    })));

                    setNewLogo({ file: null, preview: '', title: '', category: 'Supported By' });

                    Swal.fire({
                        icon: 'success',
                        title: 'Logo Added!',
                        text: 'Partner logo has been saved successfully.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            }
        } catch (error) {
            console.error('Error adding logo:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to add logo. Please try again.',
                confirmButtonColor: '#23471d'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const removeLogo = async (index) => {
        const result = await Swal.fire({
            title: 'Remove Logo?',
            text: 'This will permanently remove the logo.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Remove'
        });

        if (result.isConfirmed) {
            try {
                setIsLoading(true);

                const updatedLogos = msmeLogos.filter((_, i) => i !== index);
                updatedLogos.forEach((logo, idx) => {
                    logo.displayOrder = idx;
                });

                const formData = new FormData();
                const logosToSave = updatedLogos.map(({ id, preview, ...rest }) => rest);
                formData.append('msmeLogos', JSON.stringify(logosToSave));
                formData.append('isMsmeLogoActive', isMsmeLogoActive);

                const res = await api.put('/api/settings', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (res.data.success) {
                    setMsmeLogos(res.data.data.msmeLogos.map((logo, index) => ({
                        ...logo,
                        id: Date.now() + index,
                        preview: `${SERVER_URL}${logo.imageUrl}`
                    })));

                    Swal.fire({
                        icon: 'success',
                        title: 'Removed!',
                        text: 'Logo has been removed successfully.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            } catch (error) {
                console.error('Error removing logo:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to remove logo. Please try again.',
                    confirmButtonColor: '#23471d'
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const toggleActive = (index) => {
        const updated = [...msmeLogos];
        updated[index].isActive = !updated[index].isActive;
        setMsmeLogos(updated);
    };

    const updateField = (index, field, value) => {
        const updated = [...msmeLogos];
        updated[index][field] = value;
        setMsmeLogos(updated);
    };

    const moveUp = (index) => {
        if (index === 0) return;
        const updated = [...msmeLogos];
        [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
        updated.forEach((logo, idx) => {
            logo.displayOrder = idx;
        });
        setMsmeLogos(updated);
    };

    const moveDown = (index) => {
        if (index === msmeLogos.length - 1) return;
        const updated = [...msmeLogos];
        [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
        updated.forEach((logo, idx) => {
            logo.displayOrder = idx;
        });
        setMsmeLogos(updated);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-bold text-gray-800 uppercase tracking-wide">Partner Logos Management</h3>
                        <span className="px-2.5 py-0.5 text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 rounded-full">
                            {msmeLogos.length} {msmeLogos.length === 1 ? 'logo' : 'logos'}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500">Manage footer partner logos (Supported By, Approved By, etc.)</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        {isMsmeLogoActive ? 'Section Active' : 'Section Hidden'}
                    </span>
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isMsmeLogoActive}
                            onChange={() => setIsMsmeLogoActive(!isMsmeLogoActive)}
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#23471d]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#23471d] shadow-inner"></div>
                    </label>
                </div>
            </div>

            {/* Add New Logo Form */}
            <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add New Partner Logo
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Logo Title</label>
                        <input
                            type="text"
                            value={newLogo.title}
                            onChange={(e) => setNewLogo({ ...newLogo, title: e.target.value })}
                            placeholder="e.g., MSME Logo"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23471d] focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Category</label>
                        <input
                            type="text"
                            value={newLogo.category}
                            onChange={(e) => setNewLogo({ ...newLogo, category: e.target.value })}
                            placeholder="e.g., Supported By"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23471d] focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="flex gap-3 items-end">
                    <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Upload Logo Image</label>
                        <div className="border-2 border-dashed border-gray-300 p-6 text-center relative group bg-white rounded-lg hover:border-[#23471d] transition-colors cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            {newLogo.preview ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 mb-2 border border-gray-200 rounded flex items-center justify-center bg-gray-50">
                                        <img src={newLogo.preview} alt="Preview" className="max-w-full max-h-full object-contain p-2" />
                                    </div>
                                    <p className="text-[10px] font-semibold text-green-600">✓ Image Selected</p>
                                    <p className="text-[9px] text-gray-400 mt-0.5">Click to change</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-2">
                                    <Upload className="w-8 h-8 text-gray-300 mb-2" />
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Click to Upload Logo</p>
                                    <p className="text-[9px] text-gray-400 mt-1">PNG, JPG, SVG (Max 2MB)</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={addLogo}
                        disabled={isLoading}
                        className="px-6 py-3 bg-[#23471d] text-white text-sm font-bold rounded-lg hover:bg-[#1a3516] transition-colors flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                        <Plus className="w-5 h-5" /> Add Logo
                    </button>
                </div>
            </div>

            {/* Logos List */}
            {msmeLogos.length > 0 ? (
                <div className="space-y-2">
                    {msmeLogos.map((logo, index) => (
                        <div key={logo.id || index} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:shadow-sm transition-shadow">
                            {/* Logo Preview */}
                            <div className="w-16 h-16 border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0">
                                <img
                                    src={logo.preview || `${SERVER_URL}${logo.imageUrl}`}
                                    alt={logo.title}
                                    className="max-w-full max-h-full object-contain p-1"
                                />
                            </div>

                            {/* Logo Details */}
                            <div className="flex-1 grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[8px] font-bold text-gray-400 uppercase mb-0.5">Title</label>
                                    <input
                                        type="text"
                                        value={logo.title}
                                        onChange={(e) => updateField(index, 'title', e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#23471d]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-bold text-gray-400 uppercase mb-0.5">Category</label>
                                    <input
                                        type="text"
                                        value={logo.category}
                                        onChange={(e) => updateField(index, 'category', e.target.value)}
                                        placeholder="e.g., Supported By"
                                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#23471d]"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                    onClick={() => toggleActive(index)}
                                    className={`p-1.5 rounded transition-colors ${logo.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                                    title={logo.isActive ? 'Active' : 'Inactive'}
                                >
                                    <CheckCircle className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => moveUp(index)}
                                    disabled={index === 0}
                                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Move Up"
                                >
                                    <ArrowUp className="w-4 h-4 text-gray-600" />
                                </button>

                                <button
                                    onClick={() => moveDown(index)}
                                    disabled={index === msmeLogos.length - 1}
                                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rotate-180"
                                    title="Move Down"
                                >
                                    <ArrowUp className="w-4 h-4 text-gray-600" />
                                </button>

                                <button
                                    onClick={() => removeLogo(index)}
                                    className="p-1.5 rounded hover:bg-red-100 text-red-500"
                                    title="Remove"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-400">
                    <Upload className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-semibold">No partner logos added yet</p>
                    <p className="text-[10px] mt-1">Add logos using the form above</p>
                </div>
            )}
        </div>
    );
};

export default MsmeLogosManager;
