import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Save, X } from 'lucide-react';
import api, { SERVER_URL } from '../lib/api';
import Swal from 'sweetalert2';
import PageHeader from '../components/PageHeader';

const AwardsGalleryManage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        label: 'NAMO GANGE GLOBAL HEALTH EXCELLENCE AWARDS',
        order: 0,
        status: 'Active'
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [bulkFiles, setBulkFiles] = useState([]);
    const [bulkPreviews, setBulkPreviews] = useState([]);
    const [bulkLabel, setBulkLabel] = useState('NAMO GANGE GLOBAL HEALTH EXCELLENCE AWARDS');
    const [bulkStatus, setBulkStatus] = useState('Active');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/awards-gallery/admin');
            if (res.data.success) {
                setItems(res.data.data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleBulkImageChange = (e) => {
        const files = Array.from(e.target.files);
        setBulkFiles(files);
        const previews = files.map(file => URL.createObjectURL(file));
        setBulkPreviews(previews);
    };

    const removeBulkImage = (index) => {
        const newFiles = bulkFiles.filter((_, i) => i !== index);
        const newPreviews = bulkPreviews.filter((_, i) => i !== index);
        setBulkFiles(newFiles);
        setBulkPreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isUploading) return;
        setIsUploading(true);
        
        if (!imageFile && !editingId) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Please select an image' });
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('label', formData.label);
        data.append('order', formData.order);
        data.append('status', formData.status);
        if (imageFile) data.append('image', imageFile);

        try {
            if (editingId) {
                await api.put(`/api/awards-gallery/${editingId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                Swal.fire({ icon: 'success', title: 'Updated!', timer: 1500, showConfirmButton: false });
            } else {
                await api.post('/api/awards-gallery', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                Swal.fire({ icon: 'success', title: 'Created!', timer: 1500, showConfirmButton: false });
            }
            resetForm();
            fetchItems();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save item' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleBulkUpload = async () => {
        if (isUploading) return;
        setIsUploading(true);
        if (bulkFiles.length === 0) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Please select at least one image' });
            return;
        }

        const data = new FormData();
        bulkFiles.forEach(file => {
            data.append('images', file);
        });
        data.append('label', bulkLabel);
        data.append('status', bulkStatus);

        try {
            const response = await api.post('/api/awards-gallery/bulk', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            Swal.fire({ 
                icon: 'success', 
                title: 'Success!', 
                text: response.data.message,
                timer: 2000, 
                showConfirmButton: false 
            });
            resetBulkForm();
            fetchItems();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to upload images' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setFormData({
            title: item.title,
            label: item.label,
            order: item.order,
            status: item.status
        });
        setImagePreview(`${SERVER_URL}${item.image}`);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Item?',
            text: 'This action cannot be undone',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Delete'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/api/awards-gallery/${id}`);
                Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
                fetchItems();
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete' });
            }
        }
    };

    const resetForm = () => {
        setFormData({ title: '', label: 'NAMO GANGE GLOBAL HEALTH EXCELLENCE AWARDS', order: 0, status: 'Active' });
        setImageFile(null);
        setImagePreview('');
        setEditingId(null);
        setShowForm(false);
    };

    const resetBulkForm = () => {
        setBulkFiles([]);
        setBulkPreviews([]);
        setBulkLabel('NAMO GANGE GLOBAL HEALTH EXCELLENCE AWARDS');
        setBulkStatus('Active');
        setShowBulkUpload(false);
    };

    return (
        <>
            {/* Hero Banner */}
            <div className="relative w-full h-64 overflow-hidden rounded mt-8">
                {/* Background Image */}
                <img
                    src="/activity_log.png"
                    alt="Awards Gallery Banner"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                
                {/* Content */}
                <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-6">
                    <ImageIcon className="w-16 h-16 mb-4" />
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-center">
                        Awards Gallery
                    </h1>
                    <p className="text-lg mt-2 text-center text-white/90">
                        Manage Glimpses of Past Editions gallery images
                    </p>
                </div>
            </div>

            <div className="p-6 space-y-6">
                <PageHeader
                    // title="Awards Gallery Management"
                    subtitle="Manage Glimpses of Past Editions gallery images"
                />

            {/* Add Buttons */}
            <div className="flex gap-3 justify-end">
                <button
                    onClick={() => { setShowBulkUpload(!showBulkUpload); setShowForm(false); }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm hover:bg-purple-700 transition-all"
                >
                    {showBulkUpload ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showBulkUpload ? 'Cancel' : 'Bulk Upload'}
                </button>
                <button
                    onClick={() => { setShowForm(!showForm); setShowBulkUpload(false); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#008d48] text-white rounded-lg font-bold text-sm hover:bg-[#007a3e] transition-all"
                >
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? 'Cancel' : 'Add Single Image'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-black text-[#0a2e5c] mb-4">
                        {editingId ? 'Edit Gallery Item' : 'Add New Gallery Item'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#008d48]"
                                    placeholder="e.g., Award ceremony past edition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Label</label>
                                <input
                                    type="text"
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#008d48]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Order</label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#008d48]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#008d48]"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Image</label>
                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="imageUpload"
                                />
                                <label htmlFor="imageUpload" className="cursor-pointer">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded" />
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <ImageIcon className="w-12 h-12 text-slate-300 mb-2" />
                                            <p className="text-sm text-slate-400">Click to upload image</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-2 bg-[#008d48] text-white rounded-lg font-bold text-sm hover:bg-[#007a3e] transition-all"
                            >
                                <Save className="w-4 h-4" />
                                {isUploading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Bulk Upload Form */}
            {showBulkUpload && (
                <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-black text-[#0a2e5c] mb-4">
                        Bulk Upload Gallery Images
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Default Label</label>
                                <input
                                    type="text"
                                    value={bulkLabel}
                                    onChange={(e) => setBulkLabel(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#008d48]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Status</label>
                                <select
                                    value={bulkStatus}
                                    onChange={(e) => setBulkStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#008d48]"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* Multiple Image Upload */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                                Select Multiple Images (Max 20)
                            </label>
                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleBulkImageChange}
                                    className="hidden"
                                    id="bulkImageUpload"
                                />
                                <label htmlFor="bulkImageUpload" className="cursor-pointer">
                                    <div className="flex flex-col items-center">
                                        <ImageIcon className="w-12 h-12 text-slate-300 mb-2" />
                                        <p className="text-sm text-slate-600 font-bold">Click to select multiple images</p>
                                        <p className="text-xs text-slate-400 mt-1">You can select up to 20 images at once</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Preview Grid */}
                        {bulkPreviews.length > 0 && (
                            <div>
                                <p className="text-xs font-bold text-slate-500 mb-2 uppercase">
                                    Selected Images ({bulkPreviews.length})
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                    {bulkPreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img 
                                                src={preview} 
                                                alt={`Preview ${index + 1}`} 
                                                className="w-full h-24 object-cover rounded-lg border border-slate-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeBulkImage(index)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <p className="text-[9px] text-slate-400 mt-1 truncate">
                                                {bulkFiles[index]?.name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleBulkUpload}
                                disabled={isUploading || bulkFiles.length === 0}
                                className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                {isUploading ? 'Uploading...' : `Upload ${bulkFiles.length} Image${bulkFiles.length !== 1 ? 's' : ''}`}
                            </button>
                            <button
                                type="button"
                                onClick={resetBulkForm}
                                className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Gallery Grid */}
            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-[#008d48] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <ImageIcon className="w-16 h-16 mx-auto mb-3 opacity-50" />
                        <p>No gallery images yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {items.map((item) => (
                            <div key={item._id} className="group relative rounded-lg overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <img
                                    src={`${SERVER_URL}${item.image}`}
                                    alt={item.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-3">
                                    <p className="text-sm font-bold text-slate-700 truncate">{item.title}</p>
                                    <p className="text-xs text-slate-400 mt-1">Order: {item.order}</p>
                                    <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {item.status}
                                    </span>
                                </div>
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

export default AwardsGalleryManage;
