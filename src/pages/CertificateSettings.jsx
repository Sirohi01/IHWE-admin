import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CertificateSettings = () => {
    const [formData, setFormData] = useState({
        certi_name: '',
        sign1_name: '',
        sign1_designation: '',
        sign2_name: '',
        sign2_designation: ''
    });

    const [files, setFiles] = useState({
        expo_logo: null,
        sign1_image: null,
        sign2_image: null,
        namo_gange_trust_logos: [],
        concurrent_events: []
    });

    const [previews, setPreviews] = useState({});
    const [localPreviews, setLocalPreviews] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            // Assuming your backend runs on same origin or proxy is setup.
            // Adjust base URL if needed.
            const response = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/certificate-data`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success && response.data.data) {
                const data = response.data.data;
                setFormData({
                    certi_name: data.certi_name || '',
                    sign1_name: data.sign1_name || '',
                    sign1_designation: data.sign1_designation || '',
                    sign2_name: data.sign2_name || '',
                    sign2_designation: data.sign2_designation || ''
                });
                setPreviews({
                    expo_logo: data.expo_logo,
                    sign1_image: data.sign1_image,
                    sign2_image: data.sign2_image,
                    namo_gange_trust_logos: data.namo_gange_trust_logos || [],
                    concurrent_events: data.concurrent_events || []
                });
            }
        } catch (error) {
            console.error('Error fetching certificate data:', error);
            toast.error('Failed to load certificate settings');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, fieldName) => {
        if (e.target.files.length > 0) {
            if (fieldName === 'namo_gange_trust_logos' || fieldName === 'concurrent_events') {
                const newSelectedFiles = Array.from(e.target.files);
                
                // Append instead of replace
                setFiles(prev => ({ 
                    ...prev, 
                    [fieldName]: [...(prev[fieldName] || []), ...newSelectedFiles] 
                }));
                
                // Append preview URLs
                const newPreviewUrls = newSelectedFiles.map(file => URL.createObjectURL(file));
                setLocalPreviews(prev => ({ 
                    ...prev, 
                    [fieldName]: [...(prev[fieldName] || []), ...newPreviewUrls] 
                }));
            } else {
                const file = e.target.files[0];
                setFiles(prev => ({ ...prev, [fieldName]: file }));
                
                // Set local preview URL for single file
                setLocalPreviews(prev => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
            }
        }
        // Reset file input so same file can be selected again if needed
        e.target.value = null;
    };

    const removeLocalFile = (fieldName, index) => {
        setFiles(prev => {
            const updatedFiles = [...prev[fieldName]];
            updatedFiles.splice(index, 1);
            return { ...prev, [fieldName]: updatedFiles };
        });
        setLocalPreviews(prev => {
            const updatedPreviews = [...prev[fieldName]];
            updatedPreviews.splice(index, 1);
            return { ...prev, [fieldName]: updatedPreviews };
        });
    };

    const removeExistingFile = (fieldName, index) => {
        setPreviews(prev => {
            const updated = [...prev[fieldName]];
            updated.splice(index, 1);
            return { ...prev, [fieldName]: updated };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');
        
        const payload = new FormData();
        Object.keys(formData).forEach(key => payload.append(key, formData[key]));
        
        if (files.expo_logo) payload.append('expo_logo', files.expo_logo);
        if (files.sign1_image) payload.append('sign1_image', files.sign1_image);
        if (files.sign2_image) payload.append('sign2_image', files.sign2_image);
        
        if (files.namo_gange_trust_logos.length > 0) {
            files.namo_gange_trust_logos.forEach(file => {
                payload.append('namo_gange_trust_logos', file);
            });
        }
        if (files.concurrent_events.length > 0) {
            files.concurrent_events.forEach(file => {
                payload.append('concurrent_events', file);
            });
        }

        // Send existing items to backend so it knows what to keep
        if (previews.namo_gange_trust_logos) {
            payload.append('existing_namo_logos', JSON.stringify(previews.namo_gange_trust_logos));
        }
        if (previews.concurrent_events) {
            payload.append('existing_concurrent_events', JSON.stringify(previews.concurrent_events));
        }

        try {
            const toastId = toast.loading('Saving settings...');
            const response = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/certificate-data/update`, payload, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Certificate settings updated!', { id: toastId });
            setLocalPreviews({}); // Clear local previews on successful save
            fetchData(); // Refresh previews from server
        } catch (error) {
            console.error('Error updating certificate data:', error);
            toast.error('Failed to update certificate settings');
        }
    };

    const imgBaseUrl = import.meta.env.VITE_API_URL || '';

    return (
        <div className="p-2 bg-gray-50 min-h-screen">
            <h1 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Certificate Data Settings</h1>
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-lg w-full">
                
                {/* Expo Logo */}
                <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-lg font-semibold mb-3 text-gray-700">Expo Logo (Top Left)</label>
                    <input type="file" onChange={(e) => handleFileChange(e, 'expo_logo')} accept="image/*" className="mb-4 w-full p-2 bg-white border rounded" />
                    
                    {localPreviews.expo_logo ? (
                        <div className="mt-2"><span className="text-xs text-green-600 font-bold mb-1 block">New Selection Preview:</span><img src={localPreviews.expo_logo} alt="Expo Logo Preview" className="h-20 object-contain border bg-white p-2 shadow-sm" /></div>
                    ) : previews.expo_logo && (
                        <div className="mt-2"><span className="text-xs text-gray-500 font-bold mb-1 block">Currently Saved:</span><img src={`${imgBaseUrl}${previews.expo_logo}`} alt="Expo Logo" className="h-20 object-contain border bg-white p-2 shadow-sm" /></div>
                    )}
                </div>

                {/* Certificate Name */}
                <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-lg font-semibold mb-2 text-gray-700">Certificate Main Heading</label>
                    <input 
                        type="text" 
                        name="certi_name" 
                        value={formData.certi_name} 
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="CERTIFICATE Of Participation & Appreciation"
                    />
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                        <h3 className="text-lg font-bold mb-3 text-gray-800 border-b pb-2">Signature 1 (Left)</h3>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Upload Signature Image</label>
                        <input type="file" onChange={(e) => handleFileChange(e, 'sign1_image')} accept="image/*" className="mb-2 w-full p-1 bg-white border rounded" />
                        
                        {localPreviews.sign1_image ? (
                            <div className="mb-2"><span className="text-xs text-green-600 font-bold mb-1 block">New Selection:</span><img src={localPreviews.sign1_image} alt="Sign 1 Preview" className="h-12 object-contain border bg-white p-1 shadow-sm" /></div>
                        ) : previews.sign1_image && (
                            <div className="mb-2"><span className="text-xs text-gray-500 font-bold mb-1 block">Currently Saved:</span><img src={`${imgBaseUrl}${previews.sign1_image}`} alt="Sign 1" className="h-12 object-contain border bg-white p-1 shadow-sm" /></div>
                        )}
                        
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Name</label>
                        <input type="text" name="sign1_name" value={formData.sign1_name} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. H.H.Shri Acharya Jagdish ji" />
                        
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Designation</label>
                        <input type="text" name="sign1_designation" value={formData.sign1_designation} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Founder" />
                    </div>
                    
                    <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                        <h3 className="text-lg font-bold mb-3 text-gray-800 border-b pb-2">Signature 2 (Right)</h3>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Upload Signature Image</label>
                        <input type="file" onChange={(e) => handleFileChange(e, 'sign2_image')} accept="image/*" className="mb-2 w-full p-1 bg-white border rounded" />
                        
                        {localPreviews.sign2_image ? (
                            <div className="mb-2"><span className="text-xs text-green-600 font-bold mb-1 block">New Selection:</span><img src={localPreviews.sign2_image} alt="Sign 2 Preview" className="h-12 object-contain border bg-white p-1 shadow-sm" /></div>
                        ) : previews.sign2_image && (
                            <div className="mb-2"><span className="text-xs text-gray-500 font-bold mb-1 block">Currently Saved:</span><img src={`${imgBaseUrl}${previews.sign2_image}`} alt="Sign 2" className="h-12 object-contain border bg-white p-1 shadow-sm" /></div>
                        )}
                        
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Name</label>
                        <input type="text" name="sign2_name" value={formData.sign2_name} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Shri Vijay Sharma" />
                        
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Designation</label>
                        <input type="text" name="sign2_designation" value={formData.sign2_designation} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Chairman" />
                    </div>
                </div>

                {/* Bulk Uploads */}
                <div className="mb-4 border border-gray-200 p-4 rounded-lg bg-gray-50">
                    <label className="block text-lg font-semibold mb-2 text-gray-700">Namo Gange Trust Initiatives (Upload up to 24 Images)</label>
                    <p className="text-xs text-gray-500 mb-2">You can add new images or remove existing ones using the 'X' button.</p>
                    <input type="file" multiple onChange={(e) => handleFileChange(e, 'namo_gange_trust_logos')} accept="image/*" className="mb-2 w-full p-1 bg-white border rounded" />
                    
                    <div className="flex flex-col gap-4 mt-2">
                        {previews.namo_gange_trust_logos?.length > 0 && (
                            <div>
                                <span className="text-xs text-gray-500 font-bold mb-2 block">Currently Saved ({previews.namo_gange_trust_logos.length} files):</span>
                                <div className="flex flex-wrap gap-3">
                                    {previews.namo_gange_trust_logos.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                            <img src={`${imgBaseUrl}${img}`} className="h-16 w-24 object-contain border bg-white p-1 shadow-sm rounded" alt="Initiative" />
                                            <button type="button" onClick={() => removeExistingFile('namo_gange_trust_logos', idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">X</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {localPreviews.namo_gange_trust_logos?.length > 0 && (
                            <div>
                                <span className="text-xs text-green-600 font-bold mb-2 block">Newly Selected to Add ({localPreviews.namo_gange_trust_logos.length} files):</span>
                                <div className="flex flex-wrap gap-3">
                                    {localPreviews.namo_gange_trust_logos.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                            <img src={img} className="h-16 w-24 object-contain border border-green-300 bg-green-50 p-1 shadow-sm rounded" alt="Initiative Preview" />
                                            <button type="button" onClick={() => removeLocalFile('namo_gange_trust_logos', idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">X</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-4 border border-gray-200 p-4 rounded-lg bg-gray-50">
                    <label className="block text-lg font-semibold mb-2 text-gray-700">Concurrent Events (Upload up to 7 Images)</label>
                    <p className="text-xs text-gray-500 mb-2">You can add new images or remove existing ones using the 'X' button.</p>
                    <input type="file" multiple onChange={(e) => handleFileChange(e, 'concurrent_events')} accept="image/*" className="mb-2 w-full p-1 bg-white border rounded" />
                    
                    <div className="flex flex-col gap-4 mt-2">
                        {previews.concurrent_events?.length > 0 && (
                            <div>
                                <span className="text-xs text-gray-500 font-bold mb-2 block">Currently Saved ({previews.concurrent_events.length} files):</span>
                                <div className="flex flex-wrap gap-3">
                                    {previews.concurrent_events.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                            <img src={`${imgBaseUrl}${img}`} className="h-16 w-24 object-contain border bg-white p-1 shadow-sm rounded" alt="Event" />
                                            <button type="button" onClick={() => removeExistingFile('concurrent_events', idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">X</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {localPreviews.concurrent_events?.length > 0 && (
                            <div>
                                <span className="text-xs text-green-600 font-bold mb-2 block">Newly Selected to Add ({localPreviews.concurrent_events.length} files):</span>
                                <div className="flex flex-wrap gap-3">
                                    {localPreviews.concurrent_events.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                            <img src={img} className="h-16 w-24 object-contain border border-green-300 bg-green-50 p-1 shadow-sm rounded" alt="Event Preview" />
                                            <button type="button" onClick={() => removeLocalFile('concurrent_events', idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">X</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end border-t pt-4">
                    <button type="submit" className="px-8 py-3 bg-blue-600 text-white text-lg font-bold rounded-lg shadow hover:bg-blue-700 transition-colors">
                        Save Certificate Data
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CertificateSettings;
