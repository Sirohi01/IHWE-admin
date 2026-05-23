import { useState, useEffect, useRef } from 'react';
import { Save, Globe, Pencil, Upload, Image as ImageIcon, X } from 'lucide-react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../../lib/api";
import { useLocation, useNavigate } from 'react-router-dom';
import { pagesList } from '../../data/pagesList';
import PageHeader from '../../components/PageHeader';


const AddSeo = () => {
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        page: "",
        metaTitle: "",
        metaKeywords: "",
        metaDescription: "",
        openGraphTags: "",
        schemaMarkup: "",
        canonicalTag: "",
        ogImage: null,
        ogImagePreview: null,
        isActive: true
    });

    const [dynamicPages, setDynamicPages] = useState({
        services: [],
        custom: []
    });

    const [existingSeoItems, setExistingSeoItems] = useState([]);

    // Editor Refs
    const ogEditorRef = useRef(null);
    const schemaEditorRef = useRef(null);
    const canonicalEditorRef = useRef(null);

    const fetchExistingSeo = async () => {
        try {
            const res = await api.get('/api/seo/all');
            if (res.data.success) {
                setExistingSeoItems(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching existing SEO data:", err);
        }
    };

    useEffect(() => {
        fetchDynamicPages();
        fetchExistingSeo();

        if (location.state && location.state.seoData) {
            const data = location.state.seoData;
            setFormData({
                page: data.page || "",
                metaTitle: data.metaTitle || "",
                metaKeywords: data.metaKeywords || "",
                metaDescription: data.metaDescription || "",
                openGraphTags: data.openGraphTags || "",
                schemaMarkup: data.schemaMarkup || "",
                canonicalTag: data.canonicalTag || "",
                ogImage: null,
                ogImagePreview: data.ogImage ? `${SERVER_URL}${data.ogImage}` : null,
                isActive: data.isActive
            });
            setEditId(data._id);
            setIsEditMode(true);

            // Set editor content after state update and render
            setTimeout(() => {
                if (ogEditorRef.current) ogEditorRef.current.innerText = data.openGraphTags || "";
                if (schemaEditorRef.current) schemaEditorRef.current.innerText = data.schemaMarkup || "";
                if (canonicalEditorRef.current) canonicalEditorRef.current.innerText = data.canonicalTag || "";
            }, 100);
        }
    }, [location.state]);

    const fetchDynamicPages = async () => {
        try {
            // Get all static paths to avoid duplicates using a Set
            const staticPaths = pagesList.map(p => p.path);
            const seenPaths = new Set(staticPaths);

            // Fetch Service Pages
            const serviceRes = await api.get('/api/service-details');
            const services = [];
            if (serviceRes.data.success) {
                serviceRes.data.data.forEach(item => {
                    const path = `/industry-zone/${item.slug || item.serviceCardId}`;
                    if (!seenPaths.has(path)) {
                        seenPaths.add(path);
                        services.push({
                            name: `Service / ${item.serviceTitle}`,
                            path
                        });
                    }
                });
            }

            // Fetch Custom Pages
            const customRes = await api.get('/api/custom-pages');
            const custom = [];
            if (customRes.data.success) {
                customRes.data.data.forEach(item => {
                    const path = `/${item.slug}`;
                    if (!seenPaths.has(path)) {
                        seenPaths.add(path);
                        custom.push({
                            name: `Page / ${item.title}`,
                            path
                        });
                    }
                });
            }

            setDynamicPages({ services, custom });
        } catch (error) {
            console.error("Error fetching dynamic pages:", error);
        }
    };

    const getExistingSeo = (path) => {
        if (!path) return null;
        if (isEditMode && formData.page === path) {
            return { page: path }; // Dummy object to satisfy truthy check
        }
        return existingSeoItems.find(item => item.page === path);
    };

    const isPagePathInOptions = (path) => {
        if (!path) return false;
        if (pagesList.some(p => p.path === path)) return true;
        if (dynamicPages.services.some(p => p.path === path)) return true;
        if (dynamicPages.custom.some(p => p.path === path)) return true;
        return false;
    };

    const getPageName = (path) => {
        const found = pagesList.find(p => p.path === path);
        if (found) return found.name;
        
        const foundService = dynamicPages.services.find(p => p.path === path);
        if (foundService) return foundService.name;
        
        const foundCustom = dynamicPages.custom.find(p => p.path === path);
        if (foundCustom) return foundCustom.name;
        
        return path;
    };

    const renderPageOption = (page, index, prefix) => {
        const existing = getExistingSeo(page.path);
        const optionStyle = existing 
            ? { color: '#16a34a', backgroundColor: '#f0fdf4', fontWeight: 'bold' }
            : { color: '#dc2626', backgroundColor: '#fef2f2' };
            
        return (
            <option 
                key={`${prefix}-${index}`} 
                value={page.path}
                style={optionStyle}
            >
                {existing ? '✓' : '✗'} {page.name} ({page.path})
            </option>
        );
    };

    const handlePageSelect = (e) => {
        const selectedPage = e.target.value;
        if (!selectedPage) {
            setFormData({
                page: "",
                metaTitle: "",
                metaKeywords: "",
                metaDescription: "",
                openGraphTags: "",
                schemaMarkup: "",
                canonicalTag: "",
                ogImage: null,
                ogImagePreview: null,
                isActive: true
            });
            setIsEditMode(false);
            setEditId(null);
            if (ogEditorRef.current) ogEditorRef.current.innerText = "";
            if (schemaEditorRef.current) schemaEditorRef.current.innerText = "";
            if (canonicalEditorRef.current) canonicalEditorRef.current.innerText = "";
            return;
        }

        const existing = existingSeoItems.find(item => item.page === selectedPage);
        if (existing) {
            setFormData({
                page: selectedPage,
                metaTitle: existing.metaTitle || "",
                metaKeywords: existing.metaKeywords || "",
                metaDescription: existing.metaDescription || "",
                openGraphTags: existing.openGraphTags || "",
                schemaMarkup: existing.schemaMarkup || "",
                canonicalTag: existing.canonicalTag || "",
                ogImage: null,
                ogImagePreview: existing.ogImage ? `${SERVER_URL}${existing.ogImage}` : null,
                isActive: existing.isActive
            });
            setEditId(existing._id);
            setIsEditMode(true);

            setTimeout(() => {
                if (ogEditorRef.current) ogEditorRef.current.innerText = existing.openGraphTags || "";
                if (schemaEditorRef.current) schemaEditorRef.current.innerText = existing.schemaMarkup || "";
                if (canonicalEditorRef.current) canonicalEditorRef.current.innerText = existing.canonicalTag || "";
            }, 50);

            Swal.fire({
                icon: 'info',
                title: 'Existing SEO Data Loaded',
                text: `We found and loaded existing SEO tags for ${selectedPage}. Saving will update this record.`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
        } else {
            setFormData({
                page: selectedPage,
                metaTitle: "",
                metaKeywords: "",
                metaDescription: "",
                openGraphTags: "",
                schemaMarkup: "",
                canonicalTag: "",
                ogImage: null,
                ogImagePreview: null,
                isActive: true
            });
            setIsEditMode(false);
            setEditId(null);
            if (ogEditorRef.current) ogEditorRef.current.innerText = "";
            if (schemaEditorRef.current) schemaEditorRef.current.innerText = "";
            if (canonicalEditorRef.current) canonicalEditorRef.current.innerText = "";

            Swal.fire({
                icon: 'success',
                title: 'New Page Selected',
                text: `Create new SEO tags for ${selectedPage}.`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                ogImage: file,
                ogImagePreview: URL.createObjectURL(file)
            }));
        }
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            ogImage: null,
            ogImagePreview: null
        }));
    };

    // ================= TEXT EDITOR COMMANDS =================
    const execCommand = (command, value = null, ref = null) => {
        document.execCommand(command, false, value);
        if (ref && ref.current) {
            ref.current.focus();
        }
    };

    const handleEditorInput = (field, ref) => {
        setFormData((prev) => ({
            ...prev,
            [field]: ref.current?.innerText || "",
        }));
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    };

    const handleSubmit = async () => {
        if (!formData.page) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Page',
                text: 'Please select a page',
                confirmButtonColor: '#134698'
            });
            return;
        }

        try {
            setIsLoading(true);

            const data = new FormData();
            data.append('page', formData.page);
            data.append('metaTitle', formData.metaTitle);
            data.append('metaKeywords', formData.metaKeywords);
            data.append('metaDescription', formData.metaDescription);
            data.append('openGraphTags', formData.openGraphTags);
            data.append('schemaMarkup', formData.schemaMarkup);
            data.append('canonicalTag', formData.canonicalTag);
            data.append('isActive', formData.isActive);

            if (formData.ogImage) {
                data.append('ogImage', formData.ogImage);
            }

            let response;
            if (isEditMode && editId) {
                response = await api.put(`/api/seo/update/${editId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                response = await api.post('/api/seo/create', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (response.data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: isEditMode ? 'Updated!' : 'Success!',
                    text: `SEO data ${isEditMode ? 'updated' : 'added'} successfully`,
                    confirmButtonColor: '#134698',
                    timer: 2000
                });

                fetchExistingSeo(); // Refresh local SEO cache list!

                if (isEditMode) {
                    navigate('/meta-list');
                } else {
                    setFormData({
                        page: "",
                        metaTitle: "",
                        metaKeywords: "",
                        metaDescription: "",
                        openGraphTags: "",
                        schemaMarkup: "",
                        canonicalTag: "",
                        ogImage: null,
                        ogImagePreview: null,
                        isActive: true
                    });
                    if (ogEditorRef.current) ogEditorRef.current.innerText = "";
                    if (schemaEditorRef.current) schemaEditorRef.current.innerText = "";
                    if (canonicalEditorRef.current) canonicalEditorRef.current.innerText = "";
                }
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} SEO data`,
                confirmButtonColor: '#134698'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const EditorToolbar = ({ targetRef }) => (
        <div className="border-b-2 border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1">
            <button
                type="button"
                onClick={() => execCommand("bold", null, targetRef)}
                className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 font-bold shadow-sm rounded text-xs"
                title="Bold"
            >
                B
            </button>
            <button
                type="button"
                onClick={() => execCommand("italic", null, targetRef)}
                className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 italic shadow-sm rounded text-xs"
                title="Italic"
            >
                I
            </button>
            <button
                type="button"
                onClick={() => execCommand("underline", null, targetRef)}
                className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 underline shadow-sm rounded text-xs"
                title="Underline"
            >
                U
            </button>
            <div className="w-px bg-gray-300 mx-1"></div>
            <button
                type="button"
                onClick={() => execCommand("justifyLeft", null, targetRef)}
                className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs"
                title="Align Left"
            >
                ≡
            </button>
            <button
                type="button"
                onClick={() => execCommand("justifyCenter", null, targetRef)}
                className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs"
                title="Align Center"
            >
                ≡
            </button>
            <button
                type="button"
                onClick={() => execCommand("justifyRight", null, targetRef)}
                className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs"
                title="Align Right"
            >
                ≡
            </button>
            <div className="w-px bg-gray-300 mx-1"></div>
            <button
                type="button"
                onClick={() => execCommand("insertUnorderedList", null, targetRef)}
                className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs"
                title="Bullet List"
            >
                • List
            </button>
            <button
                type="button"
                onClick={() => execCommand("insertOrderedList", null, targetRef)}
                className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs"
                title="Numbered List"
            >
                1. List
            </button>
            <div className="w-px bg-gray-300 mx-1"></div>
            <select
                onChange={(e) => execCommand("formatBlock", e.target.value, targetRef)}
                className="px-2 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs"
                defaultValue=""
            >
                <option value="">Normal</option>
                <option value="h1">H1</option>
                <option value="h2">H2</option>
                <option value="h3">H3</option>
                <option value="h4">H4</option>
                <option value="h5">H5</option>
                <option value="h6">H6</option>
            </select>
            <button
                type="button"
                onClick={() => {
                    const url = prompt("Enter URL:");
                    if (url) execCommand("createLink", url, targetRef);
                }}
                className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs"
                title="Insert Link"
            >
                🔗
            </button>
        </div>
    );

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <div className="w-full">
                <PageHeader
                    title={isEditMode ? 'EDIT SEO META' : 'ADD SEO META'}
                    description={isEditMode ? 'Update SEO meta tags' : 'Add SEO meta tags for website pages'}
                />

                <div className="bg-white border-2 border-gray-200 p-6 mb-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50">
                            <Globe className="w-4 h-4 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            SEO Information
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                Select Page <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="page"
                                value={formData.page}
                                onChange={handlePageSelect}
                                className="w-full px-3 py-2.5 border-2 border-gray-300 focus:outline-none focus:border-[#134698] font-semibold transition-colors text-xs shadow-sm bg-white"
                            >
                                <option value="">-- Select a Page --</option>
                                {!isPagePathInOptions(formData.page) && formData.page && (
                                    <option value={formData.page} style={getExistingSeo(formData.page) ? { color: '#16a34a', fontWeight: 'bold' } : { color: '#dc2626' }}>
                                        {getPageName(formData.page)} ({formData.page})
                                    </option>
                                )}
                                <optgroup label="Static Pages">
                                    {pagesList.map((page, index) => renderPageOption(page, index, 'static'))}
                                </optgroup>

                                {dynamicPages.services.length > 0 && (
                                    <optgroup label="Featured Service Pages">
                                        {dynamicPages.services.map((page, index) => renderPageOption(page, index, 'service'))}
                                    </optgroup>
                                )}

                                {dynamicPages.custom.length > 0 && (
                                    <optgroup label="Custom Pages">
                                        {dynamicPages.custom.map((page, index) => renderPageOption(page, index, 'custom'))}
                                    </optgroup>
                                )}
                            </select>
                            <p className="text-[10px] text-gray-400 mt-1 font-medium">
                                <span className="text-green-600 font-bold">Green pages (✓)</span> have existing SEO data. <span className="text-red-500 font-bold">Red pages (✗)</span> are pending. Selecting any page will load its metadata automatically.
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-medium text-gray-700">
                                    Meta Title
                                </label>
                                <span className={`text-[10px] font-bold ${formData.metaTitle.length > 55 ? 'text-orange-500' : 'text-gray-400'}`}>
                                    {formData.metaTitle.length}/65
                                </span>
                            </div>
                            <input
                                type="text"
                                name="metaTitle"
                                value={formData.metaTitle}
                                onChange={handleInputChange}
                                placeholder="Enter meta title"
                                maxLength={65}
                                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Meta Keywords
                            </label>
                            <input
                                type="text"
                                name="metaKeywords"
                                value={formData.metaKeywords}
                                onChange={handleInputChange}
                                placeholder="Enter meta keywords (comma separated)"
                                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-medium text-gray-700">
                                    Meta Description
                                </label>
                                <span className={`text-[10px] font-bold ${formData.metaDescription.length > 150 ? 'text-orange-500' : 'text-gray-400'}`}>
                                    {formData.metaDescription.length}/155
                                </span>
                            </div>
                            <textarea
                                name="metaDescription"
                                value={formData.metaDescription}
                                onChange={handleInputChange}
                                placeholder="Enter meta description"
                                rows={3}
                                maxLength={155}
                                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
                            />
                        </div>

                        {/* Open Graph Tags Editor */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-xs font-bold text-gray-700">
                                Open Graph Tags (HTML/Text) <span className="text-red-500">*</span>
                            </label>
                            <div className="border-2 border-gray-200">
                                <div
                                    ref={ogEditorRef}
                                    contentEditable
                                    onInput={() => handleEditorInput('openGraphTags', ogEditorRef)}
                                    onPaste={handlePaste}
                                    className="min-h-[150px] p-3 bg-gray-50 focus:outline-none font-mono text-xs shadow-inner"
                                    style={{ whiteSpace: "pre-wrap" }}
                                ></div>
                            </div>
                        </div>

                        {/* Schema Markup Editor */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-xs font-bold text-gray-700">
                                Schema Markup (JSON-LD) <span className="text-red-500">*</span>
                            </label>
                            <div className="border-2 border-gray-200">
                                <div
                                    ref={schemaEditorRef}
                                    contentEditable
                                    onInput={() => handleEditorInput('schemaMarkup', schemaEditorRef)}
                                    onPaste={handlePaste}
                                    className="min-h-[150px] p-3 bg-gray-50 focus:outline-none font-mono text-xs shadow-inner"
                                    style={{ whiteSpace: "pre-wrap" }}
                                ></div>
                            </div>
                        </div>

                        {/* Canonical Tag Editor */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-xs font-bold text-gray-700">
                                Canonical Tag <span className="text-red-500">*</span>
                            </label>
                            <div className="border-2 border-gray-200">
                                <div
                                    ref={canonicalEditorRef}
                                    contentEditable
                                    onInput={() => handleEditorInput('canonicalTag', canonicalEditorRef)}
                                    onPaste={handlePaste}
                                    className="min-h-[100px] p-3 bg-gray-50 focus:outline-none font-mono text-xs shadow-inner"
                                    style={{ whiteSpace: "pre-wrap" }}
                                    placeholder="Enter canonical URL or full tag..."
                                ></div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                OG Image
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded p-2 text-center relative hover:bg-gray-50 transition-colors min-h-[100px] flex items-center justify-center">
                                <input
                                    type="file"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    accept="image/*"
                                />
                                {formData.ogImagePreview ? (
                                    <div className="relative w-full">
                                        <img src={formData.ogImagePreview} alt="OG Preview" className="h-24 w-full object-cover rounded shadow-sm" />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg z-20 hover:bg-red-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-2">
                                        <Upload className="w-6 h-6 text-gray-300 mx-auto" />
                                        <span className="text-[10px] text-gray-400 block mt-1 uppercase font-bold tracking-tighter">Upload OG Image</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="isActive"
                                value={formData.isActive}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
                            >
                                <option value={true}>Active</option>
                                <option value={false}>Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6">
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="px-6 py-3 bg-[#6b21a8] text-white font-bold transition-all shadow-lg hover:shadow-xl hover:bg-[#581c87] flex items-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>{isEditMode ? 'Updating...' : 'Saving...'}</span>
                                </>
                            ) : (
                                <>
                                    {isEditMode ? <Pencil className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                    <span>{isEditMode ? 'Update SEO Data' : 'Save SEO Data'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddSeo;
