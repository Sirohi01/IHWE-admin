import { useState, useEffect } from 'react';
import {
    Calendar, Clock, MapPin, Download, Save, Upload, Image, FileText,
    Link2, AlignLeft, Type, Sparkles, RefreshCw
} from 'lucide-react';
import Swal from 'sweetalert2';
import api, { API_URL, SERVER_URL } from '../lib/api';
import PageHeader from '../components/PageHeader';

// ── Defined OUTSIDE the parent so React does not remount them on every render ──
const SectionCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white border-2 border-gray-200 shadow-lg overflow-hidden mb-6">
        <div className="bg-[#23471d] px-6 py-3 flex items-center gap-3">
            <Icon className="w-4 h-4 text-white" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const InputField = ({ label, name, value, placeholder, type = 'text', required = false, onChange }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#23471d] text-sm transition-colors shadow-sm"
        />
    </div>
);

const EventHighlightsPage = () => {
    const [formData, setFormData] = useState({
        subtitle: 'Mark Your Calendar',
        title: 'The Premier Healthcare Event of 2026',
        highlightText: 'Healthcare Event',
        countdownDate: '2026-08-21',
        imageAlt: 'IHWE 2026',
        downloadButtonName: 'Download Brochure',
        eventDate: '21 - 23 August 2026',
        eventDay: 'Friday - Sunday',
        exhibitionHours: '9:00 AM - 6:00 PM',
        timezone: 'Gulf Standard Time (GST)',
        venueName: 'Dubai World Trade Centre',
        venueAddress: 'Hall 6, Sheikh Zayed Road, Dubai',
        registerButtonName: 'Register as Visitor',
        registerButtonPath: '/register',
        isActive: true,
    });

    const [image, setImage] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const [pdfFile, setPdfFile] = useState(null);
    const [currentPdf, setCurrentPdf] = useState('');
    const [pdfName, setPdfName] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [isSavingImage, setIsSavingImage] = useState(false);
    const [isSavingPdf, setIsSavingPdf] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('/api/event-highlights');
            if (response.data.success) {
                const data = response.data.data;
                setFormData({
                    subtitle: data.subtitle || 'Mark Your Calendar',
                    title: data.title || 'The Premier Healthcare Event of 2026',
                    highlightText: data.highlightText || 'Healthcare Event',
                    countdownDate: data.countdownDate ? data.countdownDate.split('T')[0] : '2026-08-21',
                    imageAlt: data.imageAlt || 'IHWE 2026',
                    downloadButtonName: data.downloadButtonName || 'Download Brochure',
                    eventDate: data.eventDate || '21 - 23 August 2026',
                    eventDay: data.eventDay || 'Friday - Sunday',
                    exhibitionHours: data.exhibitionHours || '9:00 AM - 6:00 PM',
                    timezone: data.timezone || 'Gulf Standard Time (GST)',
                    venueName: data.venueName || 'Dubai World Trade Centre',
                    venueAddress: data.venueAddress || 'Hall 6, Sheikh Zayed Road, Dubai',
                    registerButtonName: data.registerButtonName || 'Register as Visitor',
                    registerButtonPath: data.registerButtonPath || '/register',
                    isActive: data.isActive !== false,
                });
                if (data.image) {
                    setImage(data.image);
                    setImagePreview(`${SERVER_URL}${data.image}`);
                }
                if (data.pdfFile) {
                    setCurrentPdf(data.pdfFile);
                    const parts = data.pdfFile.split('/');
                    setPdfName(parts[parts.length - 1]);
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (100KB = 100 * 1024 bytes)
            if (file.size > 100 * 1024) {
                Swal.fire({
                    icon: 'error',
                    title: 'Image Too Large',
                    text: 'Image size should not exceed 100KB. Please compress the image (e.g., using TinyPNG or WebP format) and try again.',
                    confirmButtonColor: '#d26019'
                });
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handlePdfChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPdfFile(file);
            setPdfName(file.name);
        }
    };

    const handleSaveText = async () => {
        setIsSaving(true);
        try {
            const response = await api.put('/api/event-highlights', formData);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Saved!',
                    text: 'Event highlights updated successfully',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to save data',
                confirmButtonColor: '#d26019'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleUploadImage = async () => {
        if (!imageFile) {
            Swal.fire({ icon: 'warning', title: 'No image', text: 'Please select an image first', confirmButtonColor: '#d26019' });
            return;
        }
        setIsSavingImage(true);
        try {
            const formDataImg = new FormData();
            formDataImg.append('image', imageFile);
            const response = await api.post('/api/event-highlights/upload-image', formDataImg, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                setImage(response.data.imagePath);
                setImageFile(null);
                Swal.fire({ icon: 'success', title: 'Uploaded!', text: 'Image uploaded successfully', timer: 2000, showConfirmButton: false });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error', title: 'Error',
                text: error.response?.data?.message || 'Failed to upload image',
                confirmButtonColor: '#d26019'
            });
        } finally {
            setIsSavingImage(false);
        }
    };

    const handleUploadPdf = async () => {
        if (!pdfFile) {
            Swal.fire({ icon: 'warning', title: 'No PDF', text: 'Please select a PDF first', confirmButtonColor: '#d26019' });
            return;
        }
        setIsSavingPdf(true);
        try {
            const formDataPdf = new FormData();
            formDataPdf.append('pdf', pdfFile);
            const response = await api.post('/api/event-highlights/upload-pdf', formDataPdf, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                setCurrentPdf(response.data.pdfPath);
                const parts = response.data.pdfPath.split('/');
                setPdfName(parts[parts.length - 1]);
                setPdfFile(null);
                Swal.fire({ icon: 'success', title: 'Uploaded!', text: 'PDF uploaded successfully', timer: 2000, showConfirmButton: false });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error', title: 'Error',
                text: error.response?.data?.message || 'Failed to upload PDF',
                confirmButtonColor: '#d26019'
            });
        } finally {
            setIsSavingPdf(false);
        }
    };


    return (
        <div className="bg-white shadow-md p-6 mt-6 min-h-screen">
            <div className="w-full">
                <PageHeader
                    title="EVENT HIGHLIGHTS"
                    description="Manage the event highlights section — countdown timer, venue, and brochure details"
                />

                {/* ── SECTION 1: HEADER CONTENT ─────────────────────────────────────────── */}
                <SectionCard title="Header Content" icon={Type}>
                    <div className="grid grid-cols-1 gap-5">
                        <InputField label="Subtitle Tag" name="subtitle" value={formData.subtitle} placeholder="Mark Your Calendar" onChange={handleChange} />
                        <InputField label="Main Title (H1)" name="title" value={formData.title} placeholder="The Premier Healthcare Event of 2026" onChange={handleChange} />
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Highlight Text</label>
                            <input
                                type="text"
                                name="highlightText"
                                value={formData.highlightText}
                                onChange={handleChange}
                                placeholder="Healthcare Event"
                                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#d26019] text-sm transition-colors shadow-sm"
                            />
                            <p className="mt-1.5 text-xs text-gray-400">These words will be highlighted in orange in the title.</p>
                        </div>
                    </div>
                </SectionCard>

                {/* ── SECTION 2: COUNTDOWN TIMER ────────────────────────────────────────── */}
                <SectionCard title="Countdown Timer" icon={Clock}>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Event Countdown Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="countdownDate"
                            value={formData.countdownDate}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#23471d] text-sm transition-colors shadow-sm"
                        />
                        <p className="mt-1.5 text-xs text-gray-400">The countdown timer on the website will count down to this date automatically.</p>
                    </div>
                </SectionCard>

                {/* ── SECTION 3: IMAGE ──────────────────────────────────────────────────── */}
                <SectionCard title="Event Image" icon={Image}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Image</label>
                                <div className="border-2 border-dashed border-gray-300 hover:border-[#23471d] transition-colors p-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-[#23471d] file:text-white hover:file:bg-[#d26019] file:cursor-pointer cursor-pointer"
                                    />
                                    <p className="text-xs text-gray-400 mt-2">Recommended: 800 x 800 px (1:1 Ratio) | JPG/PNG/WebP | Max Size: 100KB</p>
                                </div>
                            </div>
                            <InputField label="Image Alt Text" name="imageAlt" value={formData.imageAlt} placeholder="IHWE 2026" onChange={handleChange} />
                            {imageFile && (
                                <button
                                    onClick={handleUploadImage}
                                    disabled={isSavingImage}
                                    className="w-full px-4 py-3 bg-[#23471d] hover:bg-[#1a3615] text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSavingImage ? (
                                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
                                    ) : (
                                        <><Upload className="w-4 h-4" /> Upload Image</>
                                    )}
                                </button>
                            )}
                        </div>
                        <div>
                            {imagePreview ? (
                                <div className="relative">
                                    <img src={imagePreview} alt="Preview" className="w-full h-56 object-cover border-2 border-gray-200" />
                                    <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 font-semibold">
                                        {imageFile ? 'New Image' : 'Current Image'}
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-56 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                    <div className="text-center text-gray-400">
                                        <Image className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-sm">No image uploaded</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </SectionCard>

                {/* ── SECTION 4: BROCHURE PDF ───────────────────────────────────────────── */}
                <SectionCard title="Brochure / Download PDF" icon={FileText}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Brochure PDF</label>
                                <div className="border-2 border-dashed border-gray-300 hover:border-[#d26019] transition-colors p-4">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <span className="shrink-0 px-4 py-2 bg-[#d26019] hover:bg-[#b8521a] text-white text-sm font-semibold transition-colors">
                                            Choose File
                                        </span>
                                        <span className={`text-sm truncate ${pdfFile ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                                            {pdfFile ? pdfFile.name : 'No file chosen'}
                                        </span>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handlePdfChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {pdfFile && (
                                        <div className="mt-3 flex items-center gap-2 bg-orange-50 border border-orange-200 px-3 py-2">
                                            <FileText className="w-4 h-4 text-[#d26019] shrink-0" />
                                            <span className="text-xs font-semibold text-[#d26019] truncate">{pdfFile.name}</span>
                                            <span className="text-xs text-gray-400 shrink-0 ml-auto">({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-400 mt-2">PDF only, Max 20MB. Users will download this from the website.</p>
                                </div>
                            </div>
                            <InputField label="Download Button Name" name="downloadButtonName" value={formData.downloadButtonName} placeholder="Download Brochure" onChange={handleChange} />
                            {pdfFile && (
                                <button
                                    onClick={handleUploadPdf}
                                    disabled={isSavingPdf}
                                    className="w-full px-4 py-3 bg-[#d26019] hover:bg-[#b8521a] text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSavingPdf ? (
                                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
                                    ) : (
                                        <><Upload className="w-4 h-4" /> Upload PDF</>
                                    )}
                                </button>
                            )}
                        </div>
                        <div className="flex items-center justify-center">
                            {currentPdf ? (
                                <div className="w-full p-4 bg-green-50 border-2 border-green-200 text-center">
                                    <FileText className="w-10 h-10 text-green-600 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-green-700">PDF Uploaded</p>
                                    <p className="text-xs text-green-600 mt-1 break-all">{pdfName}</p>
                                    <a
                                        href={`${SERVER_URL}${currentPdf}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block mt-3 text-xs text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 font-semibold"
                                    >
                                        View PDF
                                    </a>
                                </div>
                            ) : (
                                <div className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                    <div className="text-center text-gray-400">
                                        <FileText className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-sm">No PDF uploaded</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </SectionCard>

                {/* ── SECTION 5: EVENT DATE ─────────────────────────────────────────────── */}
                <SectionCard title="Event Date" icon={Calendar}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField label="Event Date" name="eventDate" value={formData.eventDate} placeholder="21 - 23 August 2026" onChange={handleChange} />
                        <InputField label="Event Day" name="eventDay" value={formData.eventDay} placeholder="Friday - Sunday" onChange={handleChange} />
                    </div>
                </SectionCard>

                {/* ── SECTION 6: EXHIBITIONS HOURS ─────────────────────────────────────── */}
                <SectionCard title="Exhibition Hours" icon={Clock}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField label="Exhibition Hours" name="exhibitionHours" value={formData.exhibitionHours} placeholder="9:00 AM - 6:00 PM" onChange={handleChange} />
                        <InputField label="Timezone" name="timezone" value={formData.timezone} placeholder="Gulf Standard Time (GST)" onChange={handleChange} />
                    </div>
                </SectionCard>

                {/* ── SECTION 7: VENUE LOCATION ─────────────────────────────────────────── */}
                <SectionCard title="Venue Location" icon={MapPin}>
                    <div className="grid grid-cols-1 gap-5">
                        <InputField label="Venue Name" name="venueName" value={formData.venueName} placeholder="Dubai World Trade Centre" onChange={handleChange} />
                        <InputField label="Venue Address" name="venueAddress" value={formData.venueAddress} placeholder="Hall 6, Sheikh Zayed Road, Dubai" onChange={handleChange} />
                    </div>
                </SectionCard>

                {/* ── SECTION 8: REGISTER BUTTON ───────────────────────────────────────── */}
                <SectionCard title="Register as Visitor Button" icon={Link2}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField label="Button Name" name="registerButtonName" value={formData.registerButtonName} placeholder="Register as Visitor" onChange={handleChange} />
                        <InputField label="Button Path / URL" name="registerButtonPath" value={formData.registerButtonPath} placeholder="/register" onChange={handleChange} />
                    </div>
                    <p className="mt-3 text-xs text-gray-400">Clicking this button on the website will navigate to the path above.</p>
                </SectionCard>

                {/* ── SAVE BUTTON ───────────────────────────────────────────────────────── */}
                <div className="flex justify-end gap-4">
                    <button
                        onClick={fetchData}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-bold text-sm uppercase tracking-wider flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Reset
                    </button>
                    <button
                        onClick={handleSaveText}
                        disabled={isSaving}
                        className="px-10 py-3 bg-[#23471d] hover:bg-[#1a3615] text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg disabled:opacity-50"
                    >
                        {isSaving ? (
                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                        ) : (
                            <><Save className="w-4 h-4" /> Save All Changes</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventHighlightsPage;
