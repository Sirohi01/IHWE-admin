import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import { 
    Type, Save, Image as ImageIcon, Plus, Trash2, Edit2, 
    Rocket, Sparkles, Briefcase, Users, Award, MapPin, 
    Link as LinkIcon, Info, Globe, ShieldCheck, Activity, Box, Monitor, Microscope, Plane, Beaker, Zap, Stethoscope, Sun, BookOpen, GraduationCap, Handshake, Milestone, Apple, Building2, UserCheck,
    ArrowRight, CalendarCheck
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const iconList = [
    { name: 'Rocket', icon: Rocket }, { name: 'Sparkles', icon: Sparkles }, { name: 'Briefcase', icon: Briefcase },
    { name: 'Users', icon: Users }, { name: 'Award', icon: Award }, { name: 'MapPin', icon: MapPin },
    { name: 'Globe', icon: Globe }, { name: 'ShieldCheck', icon: ShieldCheck }, { name: 'Activity', icon: Activity },
    { name: 'Box', icon: Box }, { name: 'Monitor', icon: Monitor }, { name: 'Microscope', icon: Microscope },
    { name: 'Plane', icon: Plane }, { name: 'Beaker', icon: Beaker }, { name: 'Zap', icon: Zap },
    { name: 'Stethoscope', icon: Stethoscope }, { name: 'Sun', icon: Sun }, { name: 'BookOpen', icon: BookOpen },
    { name: 'GraduationCap', icon: GraduationCap }, { name: 'Handshake', icon: Handshake }, { name: 'Milestone', icon: Milestone },
    { name: 'Apple', icon: Apple }, { name: 'Building2', icon: Building2 }, { name: 'UserCheck', icon: UserCheck }
];

const ExhibitorProfileManage = () => {
    const [data, setData] = useState({
        subheading: '', heading: '',
        eventDate: '', eventDay: '', venueHall: '', venueCity: '',
        segments: [], productCategories: []
    });
    const [isLoading, setIsLoading] = useState(true);
    
    // Forms for adding/editing
    const [segmentForm, setSegmentForm] = useState({ title: '', accent: '#23471d' });
    const [categoryForm, setCategoryForm] = useState({ title: '' });

    // Editing states
    const [editingSegment, setEditingSegment] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/api/exhibitor-profile');
            if (res.data) setData(res.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            Swal.fire('Error', 'Failed to fetch data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveMeta = async () => {
        try {
            await api.put('/api/exhibitor-profile/meta', data);
            Swal.fire({ icon: 'success', title: 'Saved!', text: 'Headings and Show Info updated. okh!', timer: 1500, showConfirmButton: false });
        } catch (error) {
            Swal.fire('Error', 'Failed to save meta data', 'error');
        }
    };

    const handleAddSegment = async () => {
        if (!segmentForm.title) return Swal.fire('Warning', 'Pleasze enter segment title', 'warning');
        try {
            if (editingSegment) {
                await api.put(`/api/exhibitor-profile/segments/${editingSegment}`, segmentForm);
                setEditingSegment(null);
            } else {
                await api.post('/api/exhibitor-profile/segments', segmentForm);
            }
            setSegmentForm({ title: '', accent: '#23471d' });
            fetchData();
            Swal.fire({ icon: 'success', title: 'Saved!', text: `Segment ${editingSegment ? 'updated' : 'added'} successfully. okh!`, timer: 1500, showConfirmButton: false });
        } catch (error) {
            Swal.fire('Error', `Failed to ${editingSegment ? 'update' : 'add'} segment`, 'error');
        }
    };

    const handleEditSegment = (seg) => {
        setEditingSegment(seg._id);
        setSegmentForm({ title: seg.title, accent: seg.accent });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteSegment = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/api/exhibitor-profile/segments/${id}`);
                fetchData();
                Swal.fire('Deleted!', 'Segment has been deleted.', 'success');
            } catch (error) {
                Swal.fire('Error', 'Failed to delete segment', 'error');
            }
        }
    };

    const handleAddCategory = async () => {
        if (!categoryForm.title) return Swal.fire('Warning', 'Please enter category title', 'warning');
        try {
            if (editingCategory) {
                await api.put(`/api/exhibitor-profile/categories/${editingCategory}`, categoryForm);
                setEditingCategory(null);
            } else {
                await api.post('/api/exhibitor-profile/categories', categoryForm);
            }
            setCategoryForm({ title: '' });
            fetchData();
            Swal.fire({ icon: 'success', title: 'Saved!', text: `Category ${editingCategory ? 'updated' : 'added'} successfully. okh!`, timer: 1500, showConfirmButton: false });
        } catch (error) {
            Swal.fire('Error', `Failed to ${editingCategory ? 'update' : 'add'} category`, 'error');
        }
    };

    const handleEditCategory = (cat) => {
        setEditingCategory(cat._id);
        setCategoryForm({ title: cat.title });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteCategory = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/api/exhibitor-profile/categories/${id}`);
                fetchData();
                Swal.fire('Deleted!', 'Category has been deleted.', 'success');
            } catch (error) {
                Swal.fire('Error', 'Failed to delete category', 'error');
            }
        }
    };

    const renderIcon = (name) => {
        const item = iconList.find(i => i.name === name);
        if (item) { const IconComp = item.icon; return <IconComp size={18} />; }
        return <Activity size={18} />;
    };

    if (isLoading) return <div className="p-10 text-center font-bold text-slate-500">Loading Exhibitor Profile... okh!</div>;

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-poppins pb-20">
            <PageHeader title="EXHIBITOR PROFILE MANAGEMENT" description="Manage show information, exhibitor segments, and product categories" />

            <div className="flex flex-col xl:flex-row gap-6 mt-6">
                {/* LEFT COLUMN: META & FORMS */}
                <div className="w-full xl:w-1/3 space-y-6">
                    {/* SHOW INFORMATION */}
                    <div className="bg-white border-2 border-slate-100 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
                            <CalendarCheck className="w-5 h-5 text-[#23471d]" /> Show Information
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Event Date Range</label>
                                <input type="text" value={data.eventDate} onChange={(e) => setData({ ...data, eventDate: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 focus:border-[#23471d] outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Event Days</label>
                                <input type="text" value={data.eventDay} onChange={(e) => setData({ ...data, eventDay: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 focus:border-[#23471d] outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Venue City</label>
                                <input type="text" value={data.venueCity} onChange={(e) => setData({ ...data, venueCity: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 focus:border-[#23471d] outline-none text-sm" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Venue Hall</label>
                                <input type="text" value={data.venueHall} onChange={(e) => setData({ ...data, venueHall: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 focus:border-[#23471d] outline-none text-sm" />
                            </div>
                            <button onClick={handleSaveMeta} className="w-full py-3 col-span-2 bg-[#23471d] text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-black transition-all">
                                <Save size={16} /> Save Show Info
                            </button>
                        </div>
                    </div>

                    {/* ADD NEW SEGMENT - Renamed to Exhibitor Profile */}
                    <div className="bg-white border-2 border-slate-100 shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <div className="flex items-center gap-2">
                                <Rocket size={20} className="text-[#d26019]" />
                                <h2 className="text-lg font-black uppercase tracking-tighter text-slate-900">{editingSegment ? 'Edit' : 'Exhibitor'} Profile</h2>
                            </div>
                            {editingSegment && (
                                <button onClick={() => { setEditingSegment(null); setSegmentForm({ title: '', accent: '#23471d' }); }} className="text-xs font-bold text-red-500 uppercase hover:underline">Cancel</button>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                                <input type="text" value={segmentForm.title} onChange={(e) => setSegmentForm({ ...segmentForm, title: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 focus:border-[#23471d] outline-none text-sm" placeholder="e.g. Medical Devices" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Background Color (Accent)</label>
                                <div className="flex items-center gap-4">
                                    <input type="color" value={segmentForm.accent} onChange={(e) => setSegmentForm({ ...segmentForm, accent: e.target.value })} className="w-16 h-10 p-1 border-2 border-slate-200 cursor-pointer" />
                                    <input type="text" value={segmentForm.accent} onChange={(e) => setSegmentForm({ ...segmentForm, accent: e.target.value })} className="flex-1 px-4 py-2 border-2 border-slate-200 focus:border-[#23471d] outline-none text-sm font-mono" placeholder="#000000" />
                                </div>
                            </div>
                            <button onClick={handleAddSegment} className={`w-full py-3 ${editingSegment ? 'bg-blue-600' : 'bg-slate-900'} text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black transition-all`}>
                                {editingSegment ? <Save size={16} /> : <Plus size={16} />} 
                                {editingSegment ? 'Update Profile' : 'Add to Profile'}
                            </button>
                        </div>
                    </div>

                    {/* ADD NEW PRODUCT CATEGORY */}
                    <div className="bg-white border-2 border-slate-100 shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <div className="flex items-center gap-2">
                                <Box size={20} className="text-[#23471d]" />
                                <h2 className="text-lg font-black uppercase tracking-tighter text-slate-900">{editingCategory ? 'Edit' : 'Add'} Category</h2>
                            </div>
                            {editingCategory && (
                                <button onClick={() => { setEditingCategory(null); setCategoryForm({ title: '' }); }} className="text-xs font-bold text-red-500 uppercase hover:underline">Cancel</button>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category Title</label>
                                <input type="text" value={categoryForm.title} onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 focus:border-[#23471d] outline-none text-sm" placeholder="e.g. 3D Printers" />
                            </div>
                            <button onClick={handleAddCategory} className={`w-full py-3 ${editingCategory ? 'bg-blue-600' : 'bg-[#d26019]'} text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black transition-all`}>
                                {editingCategory ? <Save size={16} /> : <Plus size={16} />}
                                {editingCategory ? 'Update Category' : 'Add Category'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: TABLES */}
                <div className="w-full xl:w-2/3 space-y-8">
                    {/* SEGMENTS TABLE */}
                    <div className="bg-white border-2 border-slate-100 shadow-sm overflow-hidden">
                        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-white font-bold flex items-center gap-2 uppercase tracking-widest text-sm">
                                <Activity size={18} className="text-[#d26019]" /> Exhibitor Profile Segments
                            </h2>
                            <span className="bg-[#d26019] text-white text-[10px] px-2 py-1 font-bold">{data.segments.length} ITEMS</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b-2 border-slate-100">
                                    <tr className="text-left">
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">Title</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">BG Color</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {data.segments.map((seg) => (
                                        <tr key={seg._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-900 uppercase tracking-tight">{seg.title}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded border border-slate-200 shadow-sm" style={{ backgroundColor: seg.accent }} />
                                                    <span className="text-xs font-mono text-slate-500">{seg.accent}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-3">
                                                    <button onClick={() => handleEditSegment(seg)} className="text-blue-500 hover:scale-110 transition-transform"><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDeleteSegment(seg._id)} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* PRODUCT CATEGORIES TABLE */}
                    <div className="bg-white border-2 border-slate-100 shadow-sm overflow-hidden">
                        <div className="bg-[#23471d] px-6 py-4 flex justify-between items-center">
                            <h2 className="text-white font-bold flex items-center gap-2 uppercase tracking-widest text-sm">
                                <Box size={18} className="text-[#d26019]" /> Product Categories
                            </h2>
                            <span className="bg-[#d26019] text-white text-[10px] px-2 py-1 font-bold">{data.productCategories.length} CATEGORIES</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b-2 border-slate-100">
                                    <tr className="text-left">
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">Category Title</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {data.productCategories.map((cat) => (
                                        <tr key={cat._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-900 uppercase tracking-tight">{cat.title}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-3">
                                                    <button onClick={() => handleEditCategory(cat)} className="text-blue-500 hover:scale-110 transition-transform"><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDeleteCategory(cat._id)} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExhibitorProfileManage;
