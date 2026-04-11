import { useState, useEffect } from 'react';
import { Save, FileText, Globe, Pencil } from 'lucide-react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import PageHeader from '../components/PageHeader';

const NativeEditor = ({ value, onChange }) => {
    const handleCommand = (e, cmd, arg = null) => {
        e.preventDefault();
        document.execCommand(cmd, false, arg);
    };

    return (
        <div className="border-2 border-gray-200 overflow-hidden bg-white">
            <div className="flex bg-gray-50 p-2 gap-1 border-b-2 border-gray-200 flex-wrap">
                <button type="button" onMouseDown={(e) => handleCommand(e, 'bold')} className="px-3 py-1 font-bold bg-white border-2 border-gray-300 hover:bg-gray-100 rounded text-xs shadow-sm" title="Bold">B</button>
                <button type="button" onMouseDown={(e) => handleCommand(e, 'italic')} className="px-3 py-1 italic bg-white border-2 border-gray-300 hover:bg-gray-100 rounded text-xs shadow-sm" title="Italic">I</button>
                <button type="button" onMouseDown={(e) => handleCommand(e, 'underline')} className="px-3 py-1 underline bg-white border-2 border-gray-300 hover:bg-gray-100 rounded text-xs shadow-sm" title="Underline">U</button>
                <div className="w-px bg-gray-300 mx-1 self-center h-4"></div>
                <button type="button" onMouseDown={(e) => handleCommand(e, 'justifyLeft')} className="px-3 py-1 bg-white border-2 border-gray-300 hover:bg-gray-100 rounded text-xs shadow-sm" title="Align Left">≡</button>
                <button type="button" onMouseDown={(e) => handleCommand(e, 'justifyCenter')} className="px-3 py-1 bg-white border-2 border-gray-300 hover:bg-gray-100 rounded text-xs shadow-sm" title="Align Center">≡</button>
                <div className="w-px bg-gray-300 mx-1 self-center h-4"></div>
                <button type="button" onMouseDown={(e) => handleCommand(e, 'insertUnorderedList')} className="px-3 py-1 font-bold bg-white border-2 border-gray-300 hover:bg-gray-100 rounded text-xs shadow-sm" title="Bullet List">• List</button>
                <button type="button" onMouseDown={(e) => handleCommand(e, 'insertOrderedList')} className="px-3 py-1 font-bold bg-white border-2 border-gray-300 hover:bg-gray-100 rounded text-xs shadow-sm" title="Numbered List">1. List</button>
                <div className="w-px bg-gray-300 mx-1 self-center h-4"></div>
                <button type="button" onMouseDown={(e) => handleCommand(e, 'formatBlock', 'H2')} className="px-3 py-1 font-bold bg-white border-2 border-gray-300 hover:bg-gray-100 rounded text-xs shadow-sm" title="Heading">H2</button>
                <button type="button" onMouseDown={(e) => handleCommand(e, 'formatBlock', 'H3')} className="px-3 py-1 font-bold bg-white border-2 border-gray-300 hover:bg-gray-100 rounded text-xs shadow-sm" title="Sub Heading">H3</button>
                <button type="button" onMouseDown={(e) => handleCommand(e, 'formatBlock', 'P')} className="px-3 py-1 bg-white border-2 border-gray-300 hover:bg-gray-100 rounded text-xs shadow-sm" title="Paragraph">Text</button>
            </div>
            <div 
                className="p-4 outline-none min-h-[400px] text-xs text-gray-700 leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 bg-gray-50/50" 
                contentEditable 
                dangerouslySetInnerHTML={{__html: value}}
                onBlur={(e) => onChange(e.currentTarget.innerHTML)} 
                placeholder="Enter policy content here..."
            />
        </div>
    );
};

const PolicyManager = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const policies = [
        { label: "Privacy Policy", value: "privacy-policy" },
        { label: "Terms of Service", value: "terms-of-service" }
    ];

    // Fetch existing policy when page changes
    useEffect(() => {
        if (page) {
            fetchPolicy(page);
        } else {
            setTitle("");
            setContent("");
        }
    }, [page]);

    const fetchPolicy = async (pageName) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/api/policies/${pageName}`);
            if (response.data.success) {
                setTitle(response.data.data.title || "");
                setContent(response.data.data.content || "");
            } else {
                setTitle("");
                setContent("");
            }
        } catch (error) {
            console.error("Error fetching policy:", error);
            // If 404, just reset the form for a new entry
            setTitle("");
            setContent("");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!page || !title || !content) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Info',
                text: 'Please fill all fields before saving',
                confirmButtonColor: '#23471d'
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/api/policies', {
                page,
                title,
                content
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Saved!',
                    text: 'Policy updated successfully',
                    confirmButtonColor: '#23471d',
                    timer: 2000
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update policy',
                confirmButtonColor: '#23471d'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-inter">
            <div className="w-full">
                <PageHeader 
                    title="POLICY MANAGER" 
                    description="Manage website legal policies like Privacy Policy and Terms of Service" 
                />

                <div className="bg-white border-2 border-gray-200 p-6 mb-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50">
                            <Globe className="w-4 h-4 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 uppercase tracking-tight">Legal Information</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Select Page Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-700 uppercase">
                                    Select Page <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={page}
                                    onChange={(e) => setPage(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
                                >
                                    <option value="">-- Select a Policy Page --</option>
                                    {policies.map((p) => (
                                        <option key={p.value} value={p.value}>
                                            {p.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-700 uppercase">
                                    Text Heading <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. IHWE Privacy Policy"
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Editor Section */}
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-700 uppercase">
                                Policy Content <span className="text-red-500">*</span>
                            </label>
                            <NativeEditor value={content} onChange={setContent} />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleSave}
                                disabled={isLoading || !page}
                                className="px-6 py-3 bg-[#6b21a8] text-white font-bold transition-all shadow-lg hover:shadow-xl hover:bg-[#581c87] flex items-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Save Policy Data</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyManager;
