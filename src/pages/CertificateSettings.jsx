import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CertificateSettings = () => {
    const [formData, setFormData] = useState({
        certi_name: '',
        certi_desc1: '',
        certi_desc1_part2: '',
        certi_desc2: '',
        certi_desc3: '',
        certi_address: '',
        sign1_name: '',
        sign1_designation: '',
        sign2_name: '',
        sign2_designation: '',
        header_left_heading: 'SUPPORTED BY:',
        header_left_enable: true,
        header_center_text: 'Presents',
        header_center_enable: true,
        header_right_heading: 'SUPPORTED BY:',
        header_right_enable: false,
        header_right_bottom_heading: 'AFFILIATED BY:',
        header_right_bottom_enable: false
    });

    const [files, setFiles] = useState({
        expo_logo: null,
        sign1_image: null,
        sign2_image: null,
        header_left_logo: null,
        header_center_logo: null,
        header_right_logo: null,
        header_right_bottom_logo: null,
        certificate_title_image: null,
        namo_gange_trust_logos: [],
        concurrent_events: []
    });

    const [previews, setPreviews] = useState({});
    const [localPreviews, setLocalPreviews] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
            // Assuming your backend runs on same origin or proxy is setup.
            // Adjust base URL if needed.
            const response = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/certificate-data`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success && response.data.data) {
                const data = response.data.data;
                setFormData({
                    certi_name: data.certi_name || '',
                    certi_desc1: data.certi_desc1 || '',
                    certi_desc1_part2: data.certi_desc1_part2 || '',
                    certi_desc2: data.certi_desc2 || '',
                    certi_desc3: data.certi_desc3 || '',
                    certi_address: data.certi_address || '',
                    sign1_name: data.sign1_name || '',
                    sign1_designation: data.sign1_designation || '',
                    sign2_name: data.sign2_name || '',
                    sign2_designation: data.sign2_designation || '',
                    header_left_heading: data.header_left_heading || 'SUPPORTED BY:',
                    header_left_enable: data.header_left_enable !== false,
                    header_center_text: data.header_center_text || 'Presents',
                    header_center_enable: data.header_center_enable !== false,
                    header_right_heading: data.header_right_heading || 'SUPPORTED BY:',
                    header_right_enable: data.header_right_enable || false,
                    header_right_bottom_heading: data.header_right_bottom_heading || 'AFFILIATED BY:',
                    header_right_bottom_enable: data.header_right_bottom_enable || false
                });
                setPreviews({
                    expo_logo: data.expo_logo,
                    sign1_image: data.sign1_image,
                    sign2_image: data.sign2_image,
                    header_left_logo: data.header_left_logo,
                    header_center_logo: data.header_center_logo,
                    header_right_logo: data.header_right_logo,
                    header_right_bottom_logo: data.header_right_bottom_logo,
                    certificate_title_image: data.certificate_title_image,
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
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e, fieldName) => {
        if (e.target.files.length > 0) {
            if (fieldName === 'namo_gange_trust_logos' || fieldName === 'concurrent_events') {
                const newSelectedFiles = Array.from(e.target.files);

                // Replace instead of append (like standard file inputs)
                setFiles(prev => ({
                    ...prev,
                    [fieldName]: newSelectedFiles
                }));

                // Replace preview URLs
                const newPreviewUrls = newSelectedFiles.map(file => URL.createObjectURL(file));
                setLocalPreviews(prev => ({
                    ...prev,
                    [fieldName]: newPreviewUrls
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

    const handleDragStart = (e, index, fieldName) => {
        e.dataTransfer.setData('dragIndex', index);
        e.dataTransfer.setData('fieldName', fieldName);
    };

    const handleDrop = (e, dropIndex, fieldName) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('dragIndex'));
        const dragField = e.dataTransfer.getData('fieldName');

        if (dragField === fieldName && dragIndex !== dropIndex) {
            setPreviews(prev => {
                const newArray = [...prev[fieldName]];
                const temp = newArray[dragIndex];
                newArray[dragIndex] = newArray[dropIndex];
                newArray[dropIndex] = temp;
                return { ...prev, [fieldName]: newArray };
            });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');

        if (!token) {
            toast.error('Authentication token not found. Please log in again.');
            setIsSaving(false);
            return;
        }

        const payload = new FormData();

        // Append all text/boolean data
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                payload.append(key, formData[key]);
            }
        });

        // Append single files
        const singleFiles = ['expo_logo', 'sign1_image', 'sign2_image', 'header_left_logo', 'header_center_logo', 'header_right_logo', 'header_right_bottom_logo', 'certificate_title_image'];
        singleFiles.forEach(key => {
            if (files[key]) payload.append(key, files[key]);
        });

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
            setFiles({
                expo_logo: null,
                sign1_image: null,
                sign2_image: null,
                header_left_logo: null,
                header_center_logo: null,
                header_right_logo: null,
                header_right_bottom_logo: null,
                certificate_title_image: null,
                namo_gange_trust_logos: [],
                concurrent_events: []
            });
            fetchData(); // Refresh previews from server
        } catch (error) {
            console.error('Error updating certificate data:', error);
            toast.error('Failed to update certificate settings');
        } finally {
            setIsSaving(false);
        }
    };

    const imgBaseUrl = import.meta.env.VITE_API_URL || '';

    return (
        <div className="p-2 bg-gray-50 min-h-screen">
            <h1 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Certificate Data Settings</h1>
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-lg w-full">

                {/* Header Configuration */}
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h2 className="text-xl font-bold mb-4 text-blue-800 border-b border-blue-200 pb-2">Top Header Configuration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Header Left */}
                        <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-3">
                                <label className="font-semibold text-gray-700">Left Section</label>
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" name="header_left_enable" checked={formData.header_left_enable} onChange={handleInputChange} className="mr-2 h-4 w-4 text-blue-600 rounded" />
                                    <span className="text-sm font-medium">Enable</span>
                                </label>
                            </div>
                            <input type="text" name="header_left_heading" value={formData.header_left_heading} onChange={handleInputChange} className="w-full p-2 border rounded mb-3 text-sm" placeholder="e.g. SUPPORTED BY:" />
                            <input type="file" onChange={(e) => handleFileChange(e, 'header_left_logo')} accept="image/*" className="w-full p-1 border rounded text-sm" />
                            {localPreviews.header_left_logo ? (
                                <img src={localPreviews.header_left_logo} className="h-12 mt-2 object-contain" />
                            ) : previews.header_left_logo && (
                                <img src={`${imgBaseUrl}${previews.header_left_logo}`} className="h-12 mt-2 object-contain" />
                            )}
                        </div>

                        {/* Header Center */}
                        <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-3">
                                <label className="font-semibold text-gray-700">Center Section</label>
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" name="header_center_enable" checked={formData.header_center_enable} onChange={handleInputChange} className="mr-2 h-4 w-4 text-blue-600 rounded" />
                                    <span className="text-sm font-medium">Enable</span>
                                </label>
                            </div>
                            <input type="text" name="header_center_text" value={formData.header_center_text} onChange={handleInputChange} className="w-full p-2 border rounded mb-3 text-sm" placeholder="e.g. Presents" />
                            <input type="file" onChange={(e) => handleFileChange(e, 'header_center_logo')} accept="image/*" className="w-full p-1 border rounded text-sm" />
                            {localPreviews.header_center_logo ? (
                                <img src={localPreviews.header_center_logo} className="h-12 mt-2 object-contain" />
                            ) : previews.header_center_logo && (
                                <img src={`${imgBaseUrl}${previews.header_center_logo}`} className="h-12 mt-2 object-contain" />
                            )}
                        </div>

                        {/* Header Right */}
                        <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-3">
                                <label className="font-semibold text-gray-700">Right Section</label>
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" name="header_right_enable" checked={formData.header_right_enable} onChange={handleInputChange} className="mr-2 h-4 w-4 text-blue-600 rounded" />
                                    <span className="text-sm font-medium">Enable</span>
                                </label>
                            </div>
                            <input type="text" name="header_right_heading" value={formData.header_right_heading} onChange={handleInputChange} className="w-full p-2 border rounded mb-3 text-sm" placeholder="e.g. SPONSORED BY:" />
                            <input type="file" onChange={(e) => handleFileChange(e, 'header_right_logo')} accept="image/*" className="w-full p-1 border rounded text-sm" />
                            {localPreviews.header_right_logo ? (
                                <img src={localPreviews.header_right_logo} className="h-12 mt-2 object-contain" />
                            ) : previews.header_right_logo && (
                                <img src={`${imgBaseUrl}${previews.header_right_logo}`} className="h-12 mt-2 object-contain" />
                            )}
                        </div>

                        {/* Header Right Bottom */}
                        <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-3">
                                <label className="font-semibold text-gray-700">Right Bottom Section</label>
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" name="header_right_bottom_enable" checked={formData.header_right_bottom_enable} onChange={handleInputChange} className="mr-2 h-4 w-4 text-blue-600 rounded" />
                                    <span className="text-sm font-medium">Enable</span>
                                </label>
                            </div>
                            <input type="text" name="header_right_bottom_heading" value={formData.header_right_bottom_heading} onChange={handleInputChange} className="w-full p-2 border rounded mb-3 text-sm" placeholder="e.g. AFFILIATED BY:" />
                            <input type="file" onChange={(e) => handleFileChange(e, 'header_right_bottom_logo')} accept="image/*" className="w-full p-1 border rounded text-sm" />
                            {localPreviews.header_right_bottom_logo ? (
                                <img src={localPreviews.header_right_bottom_logo} className="h-12 mt-2 object-contain" />
                            ) : previews.header_right_bottom_logo && (
                                <img src={`${imgBaseUrl}${previews.header_right_bottom_logo}`} className="h-12 mt-2 object-contain" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Logos & Top Text Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Expo Logo */}
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 flex flex-col">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Expo Logo (Top Left)</label>
                        <input type="file" onChange={(e) => handleFileChange(e, 'expo_logo')} accept="image/*" className="mb-4 w-full p-2 bg-white border rounded text-sm" />

                        {localPreviews.expo_logo ? (
                            <div className=""><span className="text-xs text-green-600 font-bold mb-1 block">New Selection Preview:</span><img src={localPreviews.expo_logo} alt="Expo Logo Preview" className="h-16 object-contain border bg-white p-2 shadow-sm" /></div>
                        ) : previews.expo_logo && (
                            <div className=""><span className="text-xs text-gray-500 font-bold mb-1 block">Currently Saved:</span><img src={`${imgBaseUrl}${previews.expo_logo}`} alt="Expo Logo" className="h-16 object-contain border bg-white p-2 shadow-sm" /></div>
                        )}
                    </div>

                    {/* Certificate Title Image */}
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 flex flex-col">
                        <label className="block text-sm font-semibold mb-3 text-gray-700">Certificate Title Image</label>
                        <input type="file" onChange={(e) => handleFileChange(e, 'certificate_title_image')} accept="image/*" className="mb-4 w-full p-2 bg-white border rounded text-sm" />

                        {localPreviews.certificate_title_image ? (
                            <div className="mt-2"><span className="text-xs text-green-600 font-bold mb-1 block">New Selection Preview:</span><img src={localPreviews.certificate_title_image} alt="Certificate Title Image Preview" className="h-16 object-contain border bg-white p-2 shadow-sm" /></div>
                        ) : previews.certificate_title_image && (
                            <div className="mt-2"><span className="text-xs text-gray-500 font-bold mb-1 block">Currently Saved:</span><img src={`${imgBaseUrl}${previews.certificate_title_image}`} alt="Certificate Title Image" className="h-16 object-contain border bg-white p-2 shadow-sm" /></div>
                        )}
                    </div>

                    {/* Certificate Main Heading */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col">
                        <label className="block text-sm font-semibold mb-3 text-gray-700">Certificate Main Heading</label>
                        <textarea
                            name="certi_name"
                            value={formData.certi_name}
                            onChange={handleInputChange}
                            rows="4"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none flex-grow text-sm"
                            placeholder="CERTIFICATE Of Participation & Appreciation"
                        />
                    </div>

                    {/* Description 1 (Before Heading) */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col">
                        <label className="block text-sm font-semibold mb-3 text-gray-700">Description 1 (Before Heading)</label>
                        <textarea
                            name="certi_desc1"
                            value={formData.certi_desc1}
                            onChange={handleInputChange}
                            rows="4"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none flex-grow text-sm"
                            placeholder="We extend our heartfelt gratitude to "
                        />
                    </div>
                </div>

                {/* Remaining Certificate Text */}
                <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Description 1 (After Heading)</label>
                            <textarea
                                name="certi_desc1_part2"
                                value={formData.certi_desc1_part2}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder="for valuable participation in the 9th..."
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Description 2 (Second Paragraph)</label>
                            <textarea
                                name="certi_desc2"
                                value={formData.certi_desc2}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder="Your stall and the innovative solutions showcased..."
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Description 3 (Third Paragraph)</label>
                            <textarea
                                name="certi_desc3"
                                value={formData.certi_desc3}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder="We deeply appreciate your commitment and support..."
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Address & Contact Info</label>
                            <textarea
                                name="certi_address"
                                value={formData.certi_address}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder="Head Office: 12/52..."
                            />
                        </div>
                    </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div className="border border-gray-200 p-4 rounded-lg bg-gray-50 flex flex-col">
                        <h3 className="text-lg font-bold mb-3 text-gray-800 border-b pb-2">Signature 1 (Left)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Upload Image</label>
                                <input type="file" onChange={(e) => handleFileChange(e, 'sign1_image')} accept="image/*" className="mb-2 w-full p-1 bg-white border rounded text-xs" />
                                {localPreviews.sign1_image ? (
                                    <div className="mb-2"><span className="text-[10px] text-green-600 font-bold mb-1 block">New:</span><img src={localPreviews.sign1_image} alt="Sign 1 Preview" className="h-10 object-contain border bg-white p-1 shadow-sm" /></div>
                                ) : previews.sign1_image && (
                                    <div className="mb-2"><span className="text-[10px] text-gray-500 font-bold mb-1 block">Saved:</span><img src={`${imgBaseUrl}${previews.sign1_image}`} alt="Sign 1" className="h-10 object-contain border bg-white p-1 shadow-sm" /></div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Name</label>
                                <input type="text" name="sign1_name" value={formData.sign1_name} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="e.g. H.H.Shri Acharya..." />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Designation</label>
                                <input type="text" name="sign1_designation" value={formData.sign1_designation} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="e.g. Founder" />
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 p-4 rounded-lg bg-gray-50 flex flex-col">
                        <h3 className="text-lg font-bold mb-3 text-gray-800 border-b pb-2">Signature 2 (Right)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Upload Image</label>
                                <input type="file" onChange={(e) => handleFileChange(e, 'sign2_image')} accept="image/*" className="mb-2 w-full p-1 bg-white border rounded text-xs" />
                                {localPreviews.sign2_image ? (
                                    <div className="mb-2"><span className="text-[10px] text-green-600 font-bold mb-1 block">New:</span><img src={localPreviews.sign2_image} alt="Sign 2 Preview" className="h-10 object-contain border bg-white p-1 shadow-sm" /></div>
                                ) : previews.sign2_image && (
                                    <div className="mb-2"><span className="text-[10px] text-gray-500 font-bold mb-1 block">Saved:</span><img src={`${imgBaseUrl}${previews.sign2_image}`} alt="Sign 2" className="h-10 object-contain border bg-white p-1 shadow-sm" /></div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Name</label>
                                <input type="text" name="sign2_name" value={formData.sign2_name} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="e.g. Shri Vijay Sharma" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Designation</label>
                                <input type="text" name="sign2_designation" value={formData.sign2_designation} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="e.g. Chairman" />
                            </div>
                        </div>
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
                                        <div
                                            key={idx}
                                            className="relative group cursor-move"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, idx, 'namo_gange_trust_logos')}
                                            onDrop={(e) => handleDrop(e, idx, 'namo_gange_trust_logos')}
                                            onDragOver={handleDragOver}
                                        >
                                            <span className="absolute -top-2 -left-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs z-10 shadow">{idx + 1}</span>
                                            <img src={`${imgBaseUrl}${img}`} className="h-16 w-24 object-contain border bg-white p-1 shadow-sm rounded" alt="Initiative" />
                                            <button type="button" onClick={() => removeExistingFile('namo_gange_trust_logos', idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10">X</button>
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
                                        <div
                                            key={idx}
                                            className="relative group cursor-move"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, idx, 'concurrent_events')}
                                            onDrop={(e) => handleDrop(e, idx, 'concurrent_events')}
                                            onDragOver={handleDragOver}
                                        >
                                            <span className="absolute -top-2 -left-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs z-10 shadow">{idx + 1}</span>
                                            <img src={`${imgBaseUrl}${img}`} className="h-16 w-24 object-contain border bg-white p-1 shadow-sm rounded" alt="Event" />
                                            <button type="button" onClick={() => removeExistingFile('concurrent_events', idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10">X</button>
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
                    <button type="submit" disabled={isSaving} className="px-8 py-3 bg-blue-600 text-white text-lg font-bold rounded-lg shadow hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center gap-2">
                        {isSaving ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            'Save Certificate Data'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CertificateSettings;
