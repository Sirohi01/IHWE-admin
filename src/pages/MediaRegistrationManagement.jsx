import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import {
    Save, Plus, Trash2, Edit, Globe, Play, Image as ImageIcon,
    FileText, Download, User, Share2, Filter, Search, X, Check,
    LayoutGrid, Video, Handshake, Briefcase, Mail, Phone
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const MediaRegistrationManagement = () => {
    const [activeTab, setActiveTab] = useState('coverage');
    const [isLoading, setIsLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [enquiries, setEnquiries] = useState([]);
    const [isEditing, setIsEditing] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // Form States
    const [coverageForm, setCoverageForm] = useState({ title: '', logo: '', image: '', date: '', link: '', order: 0, isActive: true });
    const [pressForm, setPressForm] = useState({ title: '', date: '', summary: '', file: '', image: '', order: 0, isActive: true });
    const [videoForm, setVideoForm] = useState({ title: '', videoUrl: '', thumbnail: '', order: 0, isActive: true });
    const [partnerForm, setPartnerForm] = useState({ name: '', logo: '', link: '', category: 'Lead Media', order: 0, isActive: true });
    const [kitForm, setKitForm] = useState({ title: '', type: 'download', link: '', icon: 'FileText', isMain: false, order: 0, isActive: true });
    const [bannerForm, setBannerForm] = useState({ name: '', logo: '', order: 0, isActive: true });
    const [bannerSettingsForm, setBannerSettingsForm] = useState({
        heroTitle: '',
        heroSubtitle: '',
        stats: [
            { number: '100+', label: 'Media Mentions' },
            { number: '1M+', label: 'Audience Reach' },
            { number: '20+', label: 'Media Partners' },
            { number: '12+', label: 'Countries Coverage' }
        ]
    });
    const [mainDownloadFile, setMainDownloadFile] = useState('');

    const [filePreview, setFilePreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const info = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
        if (info) setCurrentUser(JSON.parse(info));
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            let endpoint = '';
            switch (activeTab) {
                case 'coverage': endpoint = '/api/media-registration/coverage'; break;
                case 'press': endpoint = '/api/media-registration/press-releases'; break;
                case 'videos': endpoint = '/api/media-registration/videos'; break;
                case 'partners': endpoint = '/api/media-registration/partners'; break;
                case 'kit': endpoint = '/api/media-registration/resources'; break;
                case 'banner': endpoint = '/api/media-registration/banner-logos'; break;
                case 'bannerSettings': endpoint = '/api/media-registration/banner-settings'; break;
                case 'enquiries': endpoint = '/api/contact-enquiry'; break;
            }
            const response = await api.get(endpoint);
            if (response.data.success) {
                if (activeTab === 'enquiries') {
                    const filtered = response.data.data.filter(e => e.source === 'Media Registration Page');
                    setItems(filtered);
                } else if (activeTab === 'bannerSettings') {
                    const settings = response.data.data;
                    setBannerSettingsForm({
                        heroTitle: settings.heroTitle || '9th INTERNATIONAL HEALTH & WELLNESS EXPO 2026',
                        heroSubtitle: settings.heroSubtitle || 'Showcasing the global recognition and media visibility of IHWE 2026',
                        stats: settings.stats && settings.stats.length > 0 ? settings.stats : [
                            { number: '100+', label: 'Media Mentions' },
                            { number: '1M+', label: 'Audience Reach' },
                            { number: '20+', label: 'Media Partners' },
                            { number: '12+', label: 'Countries Coverage' }
                        ]
                    });
                    setItems([]); // Clear items for settings tab
                } else {
                    setItems(response.data.data);
                }

                // If on kit tab, extract the main download from results
                if (activeTab === 'kit') {
                    const main = response.data.data.find(r => r.isMain);
                    if (main) setMainDownloadFile(main.link);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleFileUpload = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/api/media-registration/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                const url = res.data.url;
                updateFormField(url, fieldName);
                if (fieldName === 'image' || fieldName === 'logo' || fieldName === 'thumbnail') {
                    setFilePreview(url);
                }
            }
        } catch (error) {
            Swal.fire('Error', 'Upload failed', 'error');
        } finally {
            setUploading(false);
        }
    };

    const updateFormField = (url, fieldName) => {
        if (fieldName === 'mainDownload') {
            setMainDownloadFile(url);
            saveMainDownload(url);
            return;
        }

        switch (activeTab) {
            case 'coverage': setCoverageForm(prev => ({ ...prev, [fieldName]: url })); break;
            case 'press': setPressForm(prev => ({ ...prev, [fieldName]: url })); break;
            case 'videos': setVideoForm(prev => ({ ...prev, [fieldName]: url })); break;
            case 'partners': setPartnerForm(prev => ({ ...prev, [fieldName]: url })); break;
            case 'kit': setKitForm(prev => ({ ...prev, [fieldName]: url })); break;
            case 'banner': setBannerForm(prev => ({ ...prev, [fieldName]: url })); break;
        }
    };

    const saveMainDownload = async (url) => {
        if (!url) {
            Swal.fire('Error', 'Please upload a file first', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const res = await api.get('/api/media-registration/resources');
            const resources = res.data.data || [];
            const existingMain = resources.find(i => i.isMain);

            const payload = {
                title: 'FULL MEDIA KIT (ZIP/PDF)',
                link: url,
                icon: 'FileArchive',
                isMain: true,
                order: -1,
                isActive: true,
                type: 'download',
                updatedBy: currentUser?.name || 'Admin'
            };

            if (existingMain) {
                await api.put(`/api/media-registration/resources/${existingMain._id}`, payload);
            } else {
                await api.post('/api/media-registration/resources', payload);
            }
            
            Swal.fire({ icon: 'success', title: 'Media Kit Saved!', text: 'The "Download All" button is now linked to this file.', timer: 2000 });
            fetchData();
        } catch (error) {
            console.error('Failed to save main download:', error);
            Swal.fire('Error', 'Failed to save settings. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            let endpoint = '';
            let payload = {};

            const updatedBy = currentUser?.name || 'Admin';

            switch (activeTab) {
                case 'coverage':
                    endpoint = '/api/media-registration/coverage';
                    payload = { ...coverageForm, updatedBy };
                    break;
                case 'press':
                    endpoint = '/api/media-registration/press-releases';
                    payload = { ...pressForm, updatedBy };
                    break;
                case 'videos':
                    endpoint = '/api/media-registration/videos';
                    payload = { ...videoForm, updatedBy };
                    break;
                case 'partners':
                    endpoint = '/api/media-registration/partners';
                    payload = { ...partnerForm, updatedBy };
                    break;
                case 'kit':
                    endpoint = '/api/media-registration/resources';
                    payload = { ...kitForm, updatedBy };
                    break;
                case 'banner':
                    endpoint = '/api/media-registration/banner-logos';
                    payload = { ...bannerForm, updatedBy };
                    break;
                case 'bannerSettings':
                    endpoint = '/api/media-registration/banner-settings';
                    payload = { ...bannerSettingsForm, updatedBy };
                    break;
            }

            let response;
            if (activeTab === 'bannerSettings') {
                response = await api.put(endpoint, payload);
            } else if (isEditing) {
                response = await api.put(`${endpoint}/${isEditing}`, payload);
            } else {
                response = await api.post(endpoint, payload);
            }

            if (response.data.success) {
                Swal.fire({ icon: 'success', title: isEditing ? 'Updated!' : 'Saved!', timer: 1500, showConfirmButton: false });
                resetForm();
                fetchData();
            }
        } catch (error) {
            Swal.fire('Error', 'Operation failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        setIsLoading(true);
        try {
            let endpoint = '';
            switch (activeTab) {
                case 'coverage': endpoint = '/api/media-registration/coverage'; break;
                case 'press': endpoint = '/api/media-registration/press-releases'; break;
                case 'videos': endpoint = '/api/media-registration/videos'; break;
                case 'partners': endpoint = '/api/media-registration/partners'; break;
                case 'kit': endpoint = '/api/media-registration/resources'; break;
                case 'banner': endpoint = '/api/media-registration/banner-logos'; break;
            }
            await api.delete(`${endpoint}/${id}`);
            Swal.fire('Deleted!', 'Item has been deleted.', 'success');
            fetchData();
        } catch (error) {
            Swal.fire('Error', 'Deletion failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (item) => {
        setIsEditing(item._id);
        setFilePreview(item.image || item.logo || item.thumbnail || '');
        switch (activeTab) {
            case 'coverage': setCoverageForm({ ...item }); break;
            case 'press': setPressForm({ ...item }); break;
            case 'videos': setVideoForm({ ...item }); break;
            case 'partners': setPartnerForm({ ...item }); break;
            case 'kit': setKitForm({ ...item }); break;
            case 'banner': setBannerForm({ ...item }); break;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditing(null);
        setFilePreview('');
        setCoverageForm({ title: '', logo: '', image: '', date: '', link: '', order: 0, isActive: true });
        setPressForm({ title: '', date: '', summary: '', file: '', image: '', order: 0, isActive: true });
        setVideoForm({ title: '', videoUrl: '', thumbnail: '', order: 0, isActive: true });
        setPartnerForm({ name: '', logo: '', link: '', category: 'Lead Media', order: 0, isActive: true });
        setKitForm({ title: '', type: 'download', link: '', icon: 'FileText', isMain: false, order: 0, isActive: true });
        setBannerForm({ name: '', logo: '', order: 0, isActive: true });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const tabs = [
        { id: 'bannerSettings', label: 'Banner Settings', icon: Globe },
        { id: 'coverage', label: 'Featured Media', icon: LayoutGrid },
        { id: 'press', label: 'Press Releases', icon: FileText },
        { id: 'videos', label: 'Video & TV', icon: Video },
        { id: 'partners', label: 'Media Partners', icon: Handshake },
        { id: 'banner', label: 'Banner Logos', icon: ImageIcon },
        { id: 'kit', label: 'Media Kit', icon: Briefcase },
        { id: 'enquiries', label: 'PR Enquiries', icon: Mail },
    ];

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="MEDIA REGISTRATION MANAGEMENT"
                description="Manage all dynamic content for the Media Registration portal"
            />

            {/* TAB NAVIGATION */}
            <div className="flex flex-wrap gap-2 mt-6 border-b border-gray-200 pb-px">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); resetForm(); }}
                        className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === tab.id
                                ? "border-[#d26019] text-[#d26019] bg-orange-50"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* LEFT: FORM */}
                <div className="lg:col-span-1">
                    {activeTab === 'kit' && (
                        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5 mb-6">
                            <h3 className="text-orange-800 font-bold text-xs uppercase mb-4 flex items-center gap-2">
                                <Download size={16} /> MEDIA KIT GLOBAL SETTINGS
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-orange-700 uppercase mb-2">Main Download File (ZIP/PDF)</label>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <input type="text" value={mainDownloadFile} readOnly className="flex-1 px-3 py-2 bg-white border border-orange-200 rounded text-xs outline-none" placeholder={uploading ? "Uploading..." : "No file uploaded"} />
                                            <input type="file" id="main-kit-upload" className="hidden" disabled={uploading} onChange={e => handleFileUpload(e, 'mainDownload')} />
                                            <label htmlFor="main-kit-upload" className={`px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white cursor-pointer rounded flex items-center shadow-sm ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                {uploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Plus size={14} className="mr-1"/> UPLOAD</>}
                                            </label>
                                        </div>
                                        {mainDownloadFile && (
                                            <button 
                                                onClick={() => saveMainDownload(mainDownloadFile)}
                                                disabled={isLoading || uploading}
                                                className="w-full py-2.5 bg-[#23471d] hover:bg-[#1a3516] text-white rounded font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                <Save size={14}/> UPDATE DOWNLOAD ALL LINK
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[9px] text-orange-600 mt-3 font-medium italic leading-relaxed">
                                        * Upload your full media kit ZIP/PDF here. Once uploaded, click <strong>UPDATE</strong> to link it to the main button.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'enquiries' ? (
                        <div className="bg-orange-50 border-2 border-orange-100 p-6 rounded-xl sticky top-24">
                            <h2 className="text-lg font-bold mb-4 text-[#d26019] flex items-center gap-2">
                                <Mail className="w-5 h-5" />
                                PR ENQUIRIES
                            </h2>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                This section displays all messages submitted by media professionals through the <strong>"Contact Our PR Team"</strong> form on the Media Registration page.
                            </p>
                            <div className="mt-6 p-4 bg-white rounded-lg border border-orange-100">
                                <h4 className="text-xs font-black text-gray-400 uppercase mb-2">Instructions</h4>
                                <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
                                    <li>Review the organization and message.</li>
                                    <li>Use the email or phone provided to respond.</li>
                                    <li>Delete enquiries only after processing them.</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-gray-100 p-6 shadow-sm sticky top-24 rounded-xl max-h-[85vh] overflow-y-auto">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#23471d]">
                                {isEditing ? <Edit className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-[#d26019]" />}
                                {isEditing ? 'Edit Item' : (activeTab === 'bannerSettings' ? 'Update Banner Settings' : 'Add New Item')}
                            </h2>

                            <div className="space-y-4">
                                {/* DYNAMIC FORM BASED ON TAB */}
                                {activeTab === 'coverage' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                                            <input type="text" value={coverageForm.title} onChange={e => setCoverageForm({ ...coverageForm, title: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:border-[#d26019] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date (e.g. May 20, 2026)</label>
                                            <input type="text" value={coverageForm.date} onChange={e => setCoverageForm({ ...coverageForm, date: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:border-[#d26019] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Media Logo</label>
                                            <input type="file" onChange={e => handleFileUpload(e, 'logo')} className="w-full" />
                                            {coverageForm.logo && <img src={`${SERVER_URL}${coverageForm.logo}`} className="h-10 mt-2 object-contain" />}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Featured Image</label>
                                            <input type="file" onChange={e => handleFileUpload(e, 'image')} className="w-full" />
                                            {coverageForm.image && <img src={`${SERVER_URL}${coverageForm.image}`} className="h-20 mt-2 object-contain" />}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">News Link</label>
                                            <input type="text" value={coverageForm.link} onChange={e => setCoverageForm({ ...coverageForm, link: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:border-[#d26019] outline-none" />
                                        </div>
                                    </>
                                )}

                                {activeTab === 'press' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Press Release Title</label>
                                            <input type="text" value={pressForm.title} onChange={e => setPressForm({ ...pressForm, title: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:border-[#d26019] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date String (e.g. MAY 15, 2026)</label>
                                            <input type="text" value={pressForm.date} onChange={e => setPressForm({ ...pressForm, date: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:border-[#d26019] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Summary</label>
                                            <textarea value={pressForm.summary} onChange={e => setPressForm({ ...pressForm, summary: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:border-[#d26019] outline-none h-20" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Feature Image</label>
                                            <input type="file" onChange={e => handleFileUpload(e, 'image')} className="w-full" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">PDF Resource</label>
                                            <input type="file" onChange={e => handleFileUpload(e, 'file')} className="w-full" accept=".pdf" />
                                            {pressForm.file && <span className="text-xs text-green-600 font-bold block mt-1 flex items-center gap-1"><Check size={12} /> PDF Uploaded</span>}
                                        </div>
                                    </>
                                )}

                                {activeTab === 'videos' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Video Title</label>
                                            <input type="text" value={videoForm.title} onChange={e => setVideoForm({ ...videoForm, title: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:border-[#d26019] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">YouTube Embed URL</label>
                                            <input type="text" value={videoForm.videoUrl} onChange={e => setVideoForm({ ...videoForm, videoUrl: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:border-[#d26019] outline-none" placeholder="e.g. https://www.youtube.com/embed/..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Custom Thumbnail</label>
                                            <input type="file" onChange={e => handleFileUpload(e, 'thumbnail')} className="w-full" />
                                        </div>
                                    </>
                                )}

                                {activeTab === 'partners' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Partner Name</label>
                                            <input type="text" value={partnerForm.name} onChange={e => setPartnerForm({ ...partnerForm, name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:border-[#d26019] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                            <select value={partnerForm.category} onChange={e => setPartnerForm({ ...partnerForm, category: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:border-[#d26019] outline-none">
                                                <option>Featured Media</option>
                                                <option>Lead Media</option>
                                                <option>Global Partners</option>
                                                <option>Supportive Media</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Logo</label>
                                            <input type="file" onChange={e => handleFileUpload(e, 'logo')} className="w-full" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Website URL</label>
                                            <input type="text" value={partnerForm.link} onChange={e => setPartnerForm({ ...partnerForm, link: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:border-[#d26019] outline-none" />
                                        </div>
                                    </>
                                )}

                                {activeTab === 'kit' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Resource Title</label>
                                            <input type="text" value={kitForm.title} onChange={e => setKitForm({ ...kitForm, title: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:border-[#d26019] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Resource Type</label>
                                            <select value={kitForm.type} onChange={e => setKitForm({ ...kitForm, type: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:border-[#d26019] outline-none">
                                                <option value="download">Download</option>
                                                <option value="view">View Online</option>
                                                <option value="watch">Watch Video</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">File Upload / Link</label>
                                            <div className="flex gap-2">
                                                <input type="text" value={kitForm.link} onChange={e => setKitForm({ ...kitForm, link: e.target.value })} className="flex-1 px-4 py-2 border border-gray-200 rounded-md focus:border-[#d26019] outline-none" placeholder="Paste URL or upload file" />
                                                <input type="file" id="kit-upload" className="hidden" onChange={e => handleFileUpload(e, 'link')} />
                                                <label htmlFor="kit-upload" className="px-3 py-2 bg-gray-100 hover:bg-gray-200 cursor-pointer rounded-md flex items-center"><Download size={16} /></label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Resource Icon</label>
                                            <select value={kitForm.icon} onChange={e => setKitForm({ ...kitForm, icon: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:border-[#d26019] outline-none">
                                                <option value="FileText">Document (PDF)</option>
                                                <option value="ImageIcon">Image / Gallery</option>
                                                <option value="FileArchive">Archive (ZIP/RAR)</option>
                                                <option value="Video">Video Link</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2 pt-2">
                                            <input type="checkbox" checked={kitForm.isMain} onChange={e => setKitForm({ ...kitForm, isMain: e.target.checked })} id="isMain" />
                                            <label htmlFor="isMain" className="text-xs font-bold text-gray-500 uppercase cursor-pointer">Set as "Download All" Link</label>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'banner' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Media Name</label>
                                            <input type="text" value={bannerForm.name} onChange={e => setBannerForm({ ...bannerForm, name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:border-[#d26019] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Logo</label>
                                            <input type="file" onChange={e => handleFileUpload(e, 'logo')} className="w-full" />
                                        </div>
                                    </>
                                )}

                                {activeTab === 'bannerSettings' && (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hero Title</label>
                                            <input type="text" value={bannerSettingsForm.heroTitle} onChange={e => setBannerSettingsForm({ ...bannerSettingsForm, heroTitle: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:border-[#d26019] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hero Subtitle</label>
                                            <textarea rows={3} value={bannerSettingsForm.heroSubtitle} onChange={e => setBannerSettingsForm({ ...bannerSettingsForm, heroSubtitle: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:border-[#d26019] outline-none" />
                                        </div>
                                        <div className="pt-4 border-t border-gray-100">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Hero Statistics</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                {(bannerSettingsForm?.stats?.length > 0 ? bannerSettingsForm.stats : [
                                                    { number: '100+', label: 'Media Mentions' },
                                                    { number: '1M+', label: 'Audience Reach' },
                                                    { number: '20+', label: 'Media Partners' },
                                                    { number: '12+', label: 'Countries Coverage' }
                                                ]).map((stat, idx) => (
                                                    <div key={idx} className="space-y-2 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                                        <label className="block text-[9px] font-bold text-gray-400 uppercase">Stat {idx + 1}</label>
                                                        <input type="text" placeholder="Number (e.g. 100+)" value={stat.number} onChange={e => {
                                                            const newStats = [...bannerSettingsForm.stats];
                                                            newStats[idx].number = e.target.value;
                                                            setBannerSettingsForm({ ...bannerSettingsForm, stats: newStats });
                                                        }} className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded outline-none" />
                                                        <input type="text" placeholder="Label (e.g. Media Mentions)" value={stat.label} onChange={e => {
                                                            const newStats = [...bannerSettingsForm.stats];
                                                            newStats[idx].label = e.target.value;
                                                            setBannerSettingsForm({ ...bannerSettingsForm, stats: newStats });
                                                        }} className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded outline-none" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab !== 'enquiries' && activeTab !== 'bannerSettings' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Display Order</label>
                                        <input type="number" value={
                                            activeTab === 'coverage' ? coverageForm.order :
                                                activeTab === 'press' ? pressForm.order :
                                                    activeTab === 'videos' ? videoForm.order :
                                                        activeTab === 'partners' ? partnerForm.order :
                                                            activeTab === 'kit' ? kitForm.order :
                                                                activeTab === 'banner' ? bannerForm.order : 0
                                        } onChange={e => {
                                            const val = parseInt(e.target.value) || 0;
                                            if (activeTab === 'coverage') setCoverageForm({ ...coverageForm, order: val });
                                            if (activeTab === 'press') setPressForm({ ...pressForm, order: val });
                                            if (activeTab === 'videos') setVideoForm({ ...videoForm, order: val });
                                            if (activeTab === 'partners') setPartnerForm({ ...partnerForm, order: val });
                                            if (activeTab === 'kit') setKitForm({ ...kitForm, order: val });
                                            if (activeTab === 'banner') setBannerForm({ ...bannerForm, order: val });
                                        }} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:border-[#d26019] outline-none" />
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isLoading || uploading}
                                        className="flex-1 py-3 bg-[#d26019] text-white font-bold rounded-lg hover:bg-orange-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-orange-500/20"
                                    >
                                        {isLoading ? 'Processing...' : isEditing ? 'Update Item' : (activeTab === 'bannerSettings' ? 'Save Settings' : 'Save Item')}
                                    </button>
                                    {isEditing && (
                                        <button onClick={resetForm} className="px-6 py-3 border-2 border-gray-200 rounded-lg text-gray-500 font-bold hover:bg-gray-50">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: LIST */}
                {activeTab !== 'bannerSettings' && (
                    <div className="lg:col-span-2">
                        <div className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-[#23471d] px-6 py-4 flex items-center justify-between">
                                <h3 className="text-white font-bold uppercase tracking-wider flex items-center gap-2">
                                    <Globe size={18} className="text-orange-400" />
                                    {activeTab.replace(/([A-Z])/g, ' $1')} List
                                </h3>
                                <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full">
                                    {items.length} ITEMS
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            {activeTab !== 'enquiries' && <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase">Preview</th>}
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase">Details</th>
                                            <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase">{activeTab === 'enquiries' ? 'Date' : 'Order'}</th>
                                            <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {items.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-20 text-center text-gray-400 italic">No items found in this category.</td>
                                            </tr>
                                        ) : items.map((item, idx) => (
                                            <tr key={item._id} className="hover:bg-gray-50/50 transition-colors group">
                                                {activeTab !== 'enquiries' && (
                                                    <td className="px-6 py-4">
                                                        <div className="w-20 h-14 bg-gray-100 rounded overflow-hidden border border-gray-200 flex items-center justify-center">
                                                            {(item.image || item.logo || item.thumbnail) ? (
                                                                <img src={`${SERVER_URL}${item.image || item.logo || item.thumbnail}`} className="w-full h-full object-contain" />
                                                            ) : (
                                                                <div className="text-gray-300"><ImageIcon size={24} /></div>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-800 text-sm line-clamp-1">{item.title || item.name}</span>
                                                        <span className="text-[10px] text-gray-400 uppercase mt-1">
                                                            {activeTab === 'enquiries' ? item.organization : (item.source || item.category || item.type || 'Media Asset')}
                                                        </span>
                                                        {activeTab === 'enquiries' && (
                                                            <div className="mt-2 space-y-1">
                                                                <div className="flex items-center gap-1 text-[10px] text-gray-500"><Mail size={10} /> {item.email}</div>
                                                                <div className="flex items-center gap-1 text-[10px] text-gray-500"><Phone size={10} /> {item.phone}</div>
                                                                <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-100 text-[10px] italic text-gray-600">"{item.message}"</div>
                                                            </div>
                                                        )}
                                                        {item.updatedBy && (
                                                            <span className="text-[9px] text-orange-500 font-bold mt-1">Updated by: {item.updatedBy}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-gray-400">{activeTab === 'enquiries' ? new Date(item.createdAt).toLocaleDateString() : item.order}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {activeTab !== 'enquiries' && (
                                                            <button onClick={() => startEdit(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-all"><Edit size={16} /></button>
                                                        )}
                                                        <button onClick={() => handleDelete(item._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all"><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaRegistrationManagement;
