import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import { SERVER_URL } from "../lib/api";
import {
    Type, Save, Plus, Trash2, Edit,
    ShieldCheck, Activity, Box, Monitor, Microscope, Leaf, Plane, Beaker,
    Star, Heart, Globe, Zap, Award, Package, MapPin, Users, Sun, BookOpen, Stethoscope, HelpCircle,
    Image as ImageIcon, CheckCircle2
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const TargetAudience = () => {
    const [data, setData] = useState({
        subheading: 'Target Audience',
        heading: 'Who Should Attend?',
        highlightText: 'Attend?',
        image: '/images/who2.png',
        imageAlt: 'Expo Attendees',
        groups: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [newGroup, setNewGroup] = useState('');
    const [editingGroup, setEditingGroup] = useState(null);
    const [groupInput, setGroupInput] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/who-should-attend');
            if (response.data.success) {
                setData(response.data.data);
                setPreviewUrl(response.data.data.image.startsWith('http') ? response.data.data.image : `${SERVER_URL}${response.data.data.image}`);
            }
        } catch (error) {
            console.error('Error fetching:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleHeadingSave = async () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('subheading', data.subheading);
        formData.append('heading', data.heading);
        formData.append('highlightText', data.highlightText);
        formData.append('imageAlt', data.imageAlt);
        if (selectedFile) {
            formData.append('image', selectedFile);
        }

        try {
            const response = await api.post('/api/who-should-attend/headings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: 'Details Saved!', timer: 1500, showConfirmButton: false });
                fetchData();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to save details', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddGroup = async () => {
        if (!newGroup.trim()) return;
        setIsLoading(true);
        try {
            const response = await api.post('/api/who-should-attend/groups', { group: newGroup });
            if (response.data.success) {
                setNewGroup('');
                fetchData();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to add group', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateGroup = async (index) => {
        if (!groupInput.trim()) return;
        setIsLoading(true);
        try {
            const response = await api.put(`/api/who-should-attend/groups/${index}`, { group: groupInput });
            if (response.data.success) {
                setEditingGroup(null);
                setGroupInput('');
                fetchData();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to update group', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteGroup = async (index) => {
        const result = await Swal.fire({
            title: 'Delete Group?',
            text: "This group will be removed from the list.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });
        if (!result.isConfirmed) return;
        setIsLoading(true);
        try {
            await api.delete(`/api/who-should-attend/groups/${index}`);
            fetchData();
        } catch (error) {
            Swal.fire('Error', 'Failed to delete group', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (index, val) => {
        setEditingGroup(index);
        setGroupInput(val);
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-poppins">
            <PageHeader
                title="TARGET AUDIENCE MANAGEMENT"
                description="Manage 'Who Should Attend' section headings, image, and groups"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* LEFT: Headings + Image Form */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Section Headings */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
                            <Type className="w-5 h-5 text-[#d26019]" /> Section Details
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Subheading</label>
                                <input
                                    type="text"
                                    value={data.subheading}
                                    onChange={(e) => setData({ ...data, subheading: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Main Heading</label>
                                <input
                                    type="text"
                                    value={data.heading}
                                    onChange={(e) => setData({ ...data, heading: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight text-[#23471d]">Highlight Text (Green)</label>
                                <input
                                    type="text"
                                    value={data.highlightText}
                                    onChange={(e) => setData({ ...data, highlightText: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-[#23471d] focus:border-[#23471d] outline-none shadow-sm"
                                    placeholder="Text to highlight in green..."
                                />
                            </div>
                            
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Section Image</label>
                                <div className="mt-1 flex flex-col items-center gap-4">
                                    {previewUrl && (
                                        <div className="w-full h-40 border-2 border-dashed border-gray-200 relative group overflow-hidden">
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <p className="text-white text-xs font-bold">Change Image</p>
                                            </div>
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                accept="image/*"
                                            />
                                        </div>
                                    )}
                                    <div className="w-full">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image Alt Text</label>
                                        <input
                                            type="text"
                                            value={data.imageAlt}
                                            onChange={(e) => setData({ ...data, imageAlt: e.target.value })}
                                            className="w-full px-3 py-1.5 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs"
                                            placeholder="Alt text for SEO..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleHeadingSave}
                                disabled={isLoading}
                                className="w-full py-2 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-colors flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save Details
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Group Management */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-[#23471d] px-6 py-4 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2 uppercase tracking-widest text-xs">
                                <Users className="w-4 h-4 text-[#d26019]" /> Audience Groups
                            </h2>
                            <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest">
                                {data.groups?.length || 0} GROUPS
                            </span>
                        </div>
                        
                        <div className="p-6">
                            {/* Add Tool */}
                            <div className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    value={newGroup}
                                    onChange={(e) => setNewGroup(e.target.value)}
                                    placeholder="Add new audience group..."
                                    className="flex-1 px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none"
                                />
                                <button
                                    onClick={handleAddGroup}
                                    className="px-6 py-2 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </div>

                            <div className="space-y-3">
                                {!data.groups?.length ? (
                                    <p className="text-center py-10 text-gray-400 italic">No audience groups added.</p>
                                ) : data.groups.map((group, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 border border-gray-100 hover:border-[#23471d]/20 hover:bg-gray-50/50 transition-all group">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[#23471d] font-bold text-xs ring-1 ring-gray-200 group-hover:bg-[#23471d] group-hover:text-white transition-all">
                                            {idx + 1}
                                        </div>

                                        {editingGroup === idx ? (
                                            <div className="flex-1 flex gap-2">
                                                <input
                                                    type="text"
                                                    value={groupInput}
                                                    onChange={(e) => setGroupInput(e.target.value)}
                                                    className="flex-1 px-3 py-1 border-2 border-[#23471d] outline-none text-sm"
                                                    autoFocus
                                                />
                                                <button onClick={() => handleUpdateGroup(idx)} className="p-2 text-green-600 hover:bg-green-50"><Save size={16} /></button>
                                                <button onClick={() => setEditingGroup(null)} className="p-2 text-gray-400 hover:bg-gray-50"><Plus className="rotate-45" size={16} /></button>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="flex-1 text-sm font-semibold text-gray-700">{group}</span>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => startEdit(idx, group)} className="p-2 text-blue-500 hover:bg-blue-50" title="Edit"><Edit size={14} /></button>
                                                    <button onClick={() => handleDeleteGroup(idx)} className="p-2 text-red-500 hover:bg-red-50" title="Delete"><Trash2 size={14} /></button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TargetAudience;
