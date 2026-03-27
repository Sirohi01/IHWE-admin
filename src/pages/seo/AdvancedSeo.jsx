import { useState, useEffect, useRef } from 'react';
import { Save, FileCode, Upload, X, Trash2, FileText, Globe } from 'lucide-react';
import Swal from 'sweetalert2';
import api from "../../lib/api";
import PageHeader from '../../components/PageHeader';

const AdvancedSeo = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [scripts, setScripts] = useState({
        headerScripts: '',
        footerScripts: ''
    });
    const [seoFiles, setSeoFiles] = useState([]);
    const [uploadingFile, setUploadingFile] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('/api/seo-settings/advanced');
            if (response.data.success) {
                const { headerScripts, footerScripts, seoFiles } = response.data.data;
                setScripts({ headerScripts, footerScripts });
                setSeoFiles(seoFiles || []);
            }
        } catch (error) {
            console.error("Error fetching SEO settings:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setScripts(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveScripts = async () => {
        try {
            setIsLoading(true);
            const response = await api.put('/api/seo-settings/scripts', scripts);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Saved!',
                    text: 'Global scripts updated successfully',
                    confirmButtonColor: '#134698',
                    timer: 2000
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to update scripts',
                confirmButtonColor: '#134698'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const ext = file.name.split('.').pop().toLowerCase();
        if (!['xml', 'html', 'txt'].includes(ext)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid File',
                text: 'Only .xml, .html, and .txt files are allowed',
                confirmButtonColor: '#134698'
            });
            return;
        }

        try {
            setUploadingFile(true);
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/api/seo-settings/upload-file', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setSeoFiles(response.data.data);
                Swal.fire({
                    icon: 'success',
                    title: 'Uploaded!',
                    text: 'File uploaded successfully',
                    confirmButtonColor: '#134698',
                    timer: 2000
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'File upload failed',
                confirmButtonColor: '#134698'
            });
        } finally {
            setUploadingFile(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleDeleteFile = async (fileId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This file will be permanently deleted.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await api.delete(`/api/seo-settings/file/${fileId}`);
                if (response.data.success) {
                    setSeoFiles(response.data.data);
                    Swal.fire('Deleted!', 'File has been deleted.', 'success');
                }
            } catch (error) {
                Swal.fire('Error!', 'Failed to delete file.', 'error');
            }
        }
    };

    // EditorToolbar - REMOVED

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <div className="w-full">
                <PageHeader
                    title="ADVANCED SEO SETTINGS"
                    description="Manage global scripts and static SEO files (Sitemap, Robots, etc.)"
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT: SCRIPT EDITORS */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border-2 border-gray-200 p-6 shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-50">
                                    <FileCode className="w-4 h-4 text-purple-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Global Script Configuration
                                </h2>
                            </div>

                            {/* Header Scripts */}
                            <div className="space-y-2 mb-6">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-tight">
                                    Header Scripts (Inside &lt;head&gt;)
                                </label>
                                <p className="text-[10px] text-gray-400 mb-2 italic">Paste Google Analytics, GTM, or Pixel codes here</p>
                                <textarea
                                    name="headerScripts"
                                    value={scripts.headerScripts}
                                    onChange={handleInputChange}
                                    className="w-full min-h-[200px] p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-purple-500 border-2 border-gray-200 shadow-inner overflow-auto rounded"
                                    placeholder="<!-- Paste <script> tags here -->"
                                    spellCheck="false"
                                />
                            </div>

                            {/* Footer Scripts */}
                            <div className="space-y-2 mb-6">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-tight">
                                    Footer Scripts (Before &lt;/body&gt;)
                                </label>
                                <p className="text-[10px] text-gray-400 mb-2 italic">Scripts that should load after page content</p>
                                <textarea
                                    name="footerScripts"
                                    value={scripts.footerScripts}
                                    onChange={handleInputChange}
                                    className="w-full min-h-[200px] p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-purple-500 border-2 border-gray-200 shadow-inner overflow-auto rounded"
                                    placeholder="<!-- Paste <script> tags here -->"
                                    spellCheck="false"
                                />
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <button
                                    onClick={handleSaveScripts}
                                    disabled={isLoading}
                                    className="px-8 py-3 bg-[#6b21a8] text-white font-bold transition-all shadow-lg hover:shadow-xl hover:bg-[#581c87] flex items-center gap-2 uppercase tracking-wider text-xs disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    <span>Save Scripts</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: FILE UPLOADS */}
                    <div className="space-y-6">
                        <div className="bg-white border-2 border-gray-200 p-6 shadow-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50">
                                    <Upload className="w-4 h-4 text-blue-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    SEO Files
                                </h2>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-tighter">
                                    Upload Static Files (.xml, .html, .txt)
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center relative hover:bg-gray-50 transition-all group">
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        accept=".xml,.html,.txt"
                                    />
                                    <div className="space-y-2">
                                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                            <Upload className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div className="text-xs font-bold text-gray-600">Click to upload</div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Sitemap, Robots, Verification</p>
                                    </div>
                                    {uploadingFile && (
                                        <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center rounded-xl">
                                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3 mt-8">
                                <h3 className="text-[11px] font-bold text-[#134698] uppercase tracking-[0.15em] border-b pb-2">Uploaded Files</h3>
                                {seoFiles.length === 0 ? (
                                    <div className="py-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                        <Globe className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">No files uploaded yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {seoFiles.map((file) => (
                                            <div key={file._id} className="flex items-center justify-between p-3 bg-white border-2 border-gray-100 hover:border-blue-200 transition-colors shadow-sm rounded-lg group">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50">
                                                        <FileText className="w-4 h-4 text-[#134698]" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-[11px] font-bold text-gray-800 truncate">{file.originalName}</p>
                                                        <p className="text-[9px] text-[#DE802B] uppercase font-bold tracking-tighter">Serving at root</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteFile(file._id)}
                                                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
                                <p className="text-[10px] font-bold text-orange-800 uppercase mb-1">Notice</p>
                                <p className="text-[10px] text-orange-700 leading-relaxed font-medium">
                                    Files are served directly from the root of your domain.
                                    (e.g., yourdomain.com/sitemap.xml)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedSeo;
