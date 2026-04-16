import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import { 
    Type, Save, Image as ImageIcon, Plus, Trash2, Edit2, 
    Rocket, Sparkles, Briefcase, Users, Award, MapPin, 
    Link as LinkIcon, Info, Globe, ShieldCheck, Activity, Box, Monitor, Microscope, Plane, Beaker, Zap, Stethoscope, Sun, BookOpen, GraduationCap, Handshake, Milestone, Apple, Building2, UserCheck,
    ArrowRight
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

const WhyExhibitManage = () => {
    const [data, setData] = useState({
        subheading: 'Empower Your Business',
        heading: 'Drive Growth & Innovation',
        highlightText: 'Growth & Innovation',
        shortDescription: '',
        benefits: [],
        ctaTitle: 'Ready to Scale Your Brand?',
        ctaHighlightText: 'Scale Your Brand?',
        ctaDescription: 'Secure your premium space today and connect with thousands of decision-makers in the healthcare and wellness sector.',
        ctaButton1Name: 'Book Your Stand Now',
        ctaButton1Link: '/book-a-stall',
        ctaButton2Name: 'Register as Visitor',
        ctaButton2Link: '/visitor-registration',
        ctaImage: '',
        ctaImageAlt: 'Success at IHWE'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [formData, setFormData] = useState({
        title: '', description: '', icon: 'Rocket', buttonName: 'Learn More', 
        buttonLink: '#', accent: '#23471d', imageAlt: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    
    // CTA Specific
    const [ctaFile, setCtaFile] = useState(null);
    const [ctaPreview, setCtaPreview] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/why-exhibit-manage');
            if (response.data.success) {
                setData(response.data.data);
                if (response.data.data.ctaImage) {
                    setCtaPreview(`${SERVER_URL}${response.data.data.ctaImage}`);
                }
            }
        } catch (error) { console.error('Error:', error); }
        finally { setIsLoading(false); }
    };

    const handleSaveHeadings = async () => {
        setIsLoading(true);
        try {
            const response = await api.post('/api/why-exhibit-manage/headings', {
                subheading: data.subheading,
                heading: data.heading,
                highlightText: data.highlightText,
                shortDescription: data.shortDescription
            });
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: 'Headings Saved', timer: 1500, showConfirmButton: false });
            }
        } catch (error) { Swal.fire('Error', 'Failed to save headings', 'error'); }
        finally { setIsLoading(false); }
    };

    const handleSaveCTA = async () => {
        setIsLoading(true);
        const fData = new FormData();
        fData.append('ctaTitle', data.ctaTitle);
        fData.append('ctaHighlightText', data.ctaHighlightText);
        fData.append('ctaDescription', data.ctaDescription);
        fData.append('ctaButton1Name', data.ctaButton1Name);
        fData.append('ctaButton1Link', data.ctaButton1Link);
        fData.append('ctaButton2Name', data.ctaButton2Name);
        fData.append('ctaButton2Link', data.ctaButton2Link);
        fData.append('ctaImageAlt', data.ctaImageAlt);
        if (ctaFile) fData.append('ctaImage', ctaFile);

        try {
            const response = await api.post('/api/why-exhibit-manage/cta', fData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: 'CTA Section Saved', timer: 1500, showConfirmButton: false });
                setData(response.data.data);
                if (response.data.data.ctaImage) setCtaPreview(`${SERVER_URL}${response.data.data.ctaImage}`);
            }
        } catch (error) { Swal.fire('Error', 'Failed to save CTA section', 'error'); }
        finally { setIsLoading(false); }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
    };

    const handleCtaFileChange = (e) => {
        const file = e.target.files[0];
        if (file) { setCtaFile(file); setCtaPreview(URL.createObjectURL(file)); }
    };

    const handleAddOrUpdateCard = async () => {
        if (!formData.title || !formData.description) {
            return Swal.fire('Error', 'Please fill title and description', 'warning');
        }
        setIsLoading(true);
        const fData = new FormData();
        Object.keys(formData).forEach(key => fData.append(key, formData[key]));
        if (selectedFile) fData.append('image', selectedFile);

        try {
            const url = isEditing 
                ? `/api/why-exhibit-manage/benefits/${isEditing}` 
                : '/api/why-exhibit-manage/benefits';
            const method = isEditing ? 'put' : 'post';
            const response = await api[method](url, fData, { headers: { 'Content-Type': 'multipart/form-data' } });
            
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: isEditing ? 'Updated' : 'Added', timer: 1500, showConfirmButton: false });
                setData(response.data.data);
                resetForm();
            }
        } catch (error) { Swal.fire('Error', 'Action failed', 'error'); }
        finally { setIsLoading(false); }
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', icon: 'Rocket', buttonName: 'Learn More', buttonLink: '#', accent: '#23471d', imageAlt: '' });
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsEditing(null);
    };

    const editCard = (card) => {
        setIsEditing(card._id);
        setFormData({ ...card });
        if (card.image) setPreviewUrl(`${SERVER_URL}${card.image}`);
        else setPreviewUrl(null);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const deleteCard = async (id) => {
        const result = await Swal.fire({ title: 'Are you sure?', text: 'Card will be removed', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Yes, delete it!' });
        if (result.isConfirmed) {
            try {
                const response = await api.delete(`/api/why-exhibit-manage/benefits/${id}`);
                if (response.data.success) setData(response.data.data);
            } catch (error) { Swal.fire('Error', 'Delete failed', 'error'); }
        }
    };

    const renderIcon = (name) => {
        const item = iconList.find(i => i.name === name);
        if (item) { const IconComp = item.icon; return <IconComp size={18} />; }
        return <Rocket size={18} />;
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-poppins">
            <PageHeader title="WHY EXHIBIT MANAGEMENT" description="Manage section headings and benefit cards for the exhibition" />

            <div className="flex flex-col lg:flex-row gap-6 mt-6">
                {/* HEADINGS SECTION */}
                <div className="w-full lg:w-1/3 space-y-6">
                    <div className="bg-white border-2 border-slate-100 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
                            <Type className="w-5 h-5 text-[#d26019]" /> Section Headings
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Heading</label>
                                <input type="text" value={data.subheading} onChange={(e) => setData({ ...data, subheading: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 focus:border-[#23471d] outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Main Title</label>
                                <input type="text" value={data.heading} onChange={(e) => setData({ ...data, heading: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 focus:border-[#23471d] outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#d26019] uppercase mb-1">Highlight Text (Orange)</label>
                                <input type="text" value={data.highlightText} onChange={(e) => setData({ ...data, highlightText: e.target.value })} className="w-full px-4 py-2 border-2 border-[#d26019]/30 focus:border-[#23471d] outline-none font-semibold text-[#d26019]" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Short Description</label>
                                <textarea value={data.shortDescription} onChange={(e) => setData({ ...data, shortDescription: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 focus:border-[#23471d] outline-none h-32 resize-none text-sm" placeholder="Enter short intro text..." />
                            </div>
                            <button onClick={handleSaveHeadings} className="w-full py-3 bg-[#23471d] text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-black transition-all">
                                <Save size={16} /> Save Headings
                            </button>
                        </div>
                    </div>

                    {/* CTA SECTION SETTINGS */}
                    <div className="bg-white border-2 border-slate-100 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
                            <Zap className="w-5 h-5 text-[#23471d]" /> CTA Section (Parallax)
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parallax Background Image</label>
                                <div className="relative h-24 w-full border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden group">
                                    {ctaPreview ? <img src={ctaPreview} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" size={24} />}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Plus className="text-white" /></div>
                                    <input type="file" onChange={handleCtaFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CTA Title</label>
                                <input type="text" value={data.ctaTitle} onChange={(e) => setData({ ...data, ctaTitle: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 focus:border-[#23471d] outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#d26019] uppercase mb-1">Highlight Word (Orange)</label>
                                <input type="text" value={data.ctaHighlightText} onChange={(e) => setData({ ...data, ctaHighlightText: e.target.value })} className="w-full px-4 py-2 border-2 border-[#d26019]/30 focus:border-[#23471d] outline-none font-semibold text-[#d26019]" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Card Alt Text</label>
                                <input type="text" value={data.ctaImageAlt} onChange={(e) => setData({ ...data, ctaImageAlt: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 focus:border-[#23471d] outline-none text-xs" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CTA Description</label>
                                <textarea value={data.ctaDescription} onChange={(e) => setData({ ...data, ctaDescription: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 focus:border-[#23471d] outline-none h-20 resize-none text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Btn 1 Text</label>
                                    <input type="text" value={data.ctaButton1Name} onChange={(e) => setData({ ...data, ctaButton1Name: e.target.value })} className="w-full px-3 py-1.5 border-2 border-slate-200 outline-none text-xs" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Btn 1 Link</label>
                                    <input type="text" value={data.ctaButton1Link} onChange={(e) => setData({ ...data, ctaButton1Link: e.target.value })} className="w-full px-3 py-1.5 border-2 border-slate-200 outline-none text-xs" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Btn 2 Text</label>
                                    <input type="text" value={data.ctaButton2Name} onChange={(e) => setData({ ...data, ctaButton2Name: e.target.value })} className="w-full px-3 py-1.5 border-2 border-slate-200 outline-none text-xs" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Btn 2 Link</label>
                                    <input type="text" value={data.ctaButton2Link} onChange={(e) => setData({ ...data, ctaButton2Link: e.target.value })} className="w-full px-3 py-1.5 border-2 border-slate-200 outline-none text-xs" />
                                </div>
                            </div>
                            <button onClick={handleSaveCTA} className="w-full py-3 bg-slate-900 text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#d26019] transition-all">
                                <Save size={16} /> Save CTA Section
                            </button>
                        </div>
                    </div>
                </div>

                {/* CARDS LIST SECTION */}
                <div className="w-full lg:w-2/3">
                    <div className="bg-white border-2 border-slate-100 shadow-sm overflow-hidden">
                        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-white font-bold flex items-center gap-2 uppercase tracking-widest text-sm">
                                <Box size={18} className="text-[#d26019]" /> Benefit Cards List
                            </h2>
                            <span className="bg-[#d26019] text-white text-[10px] px-2 py-1 font-bold">{data.benefits.length} CARDS</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b-2 border-slate-100">
                                    <tr className="text-left">
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">No.</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">Image</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">Title</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">Icon</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">Accent</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase text-center">LAST UPDATED BY</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase text-center">Actions</th>

                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.benefits.map((card, idx) => (
                                        <tr key={card._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold text-[#23471d]">{idx + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="w-20 h-12 bg-slate-100 rounded overflow-hidden shadow-sm">
                                                    {card.image && <img src={`${SERVER_URL}${card.image}`} alt={card.title} className="w-full h-full object-cover" />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-bold text-slate-900">{card.title}</p>
                                                <p className="text-[10px] text-slate-500 line-clamp-1">{card.description}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-[#23471d]">
                                                    {renderIcon(card.icon)} <span className="text-[10px] font-semibold">{card.icon}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: card.accent }} />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col gap-1 items-center">
                                                    <span className="font-bold text-red-600 underline underline-offset-2 uppercase text-[10px]">
                                                        {card.updatedBy || 'System'}
                                                    </span>
                                                    <span className="text-[9px] text-gray-500 font-bold whitespace-nowrap text-center">
                                                        {card.updatedAt ? new Date(card.updatedAt).toLocaleString('en-GB', { 
                                                            day: '2-digit', month: 'short', year: 'numeric', 
                                                            hour: '2-digit', minute: '2-digit', hour12: true 
                                                        }) : 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">

                                                    <button onClick={() => editCard(card)} className="p-2 border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button onClick={() => deleteCard(card._id)} className="p-2 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {data.benefits.length === 0 && (
                                        <tr><td colSpan="6" className="px-6 py-20 text-center text-slate-400 italic text-sm">No cards found. Add one below.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ADD/EDIT FORM */}
                    <div className="mt-8 bg-white border-2 border-slate-100 shadow-lg p-6">
                        <div className="flex items-center gap-2 mb-6 border-b pb-4">
                            <Plus size={20} className="text-[#d26019]" />
                            <h2 className="text-lg font-black uppercase tracking-tighter text-slate-900">
                                {isEditing ? 'Update Existing Card' : 'Add New Benefit Card'}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Card Title</label>
                                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 focus:border-[#23471d] outline-none text-sm" placeholder="e.g. Launch New Products" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Icon Badge</label>
                                        <select value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 focus:border-[#23471d] outline-none text-sm cursor-pointer">
                                            {iconList.map(item => <option key={item.name} value={item.name}>{item.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Benefit Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 focus:border-[#23471d] outline-none h-24 resize-none text-sm" placeholder="Explain the benefit..." />
                                </div>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-2"><ArrowRight size={12} /> Button Text</label>
                                        <input type="text" value={formData.buttonName} onChange={(e) => setFormData({ ...formData, buttonName: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 focus:border-[#23471d] outline-none text-sm" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-2"><LinkIcon size={12} /> Button Link</label>
                                        <input type="text" value={formData.buttonLink} onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 focus:border-[#23471d] outline-none text-sm" placeholder="/contact" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Card Image</label>
                                    <div className="relative h-32 w-full border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden group">
                                        {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" size={32} />}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Plus className="text-white" /></div>
                                        <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bottom Accent Color</label>
                                    <div className="flex gap-2">
                                        {['#23471d', '#d26019', '#1a3a14', '#f1c40f', '#2980b9'].map(c => (
                                            <button key={c} onClick={() => setFormData({ ...formData, accent: c })} className={`w-8 h-8 ${formData.accent === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`} style={{ backgroundColor: c }} />
                                        ))}
                                        <input type="color" value={formData.accent} onChange={(e) => setFormData({ ...formData, accent: e.target.value })} className="w-8 h-8 p-0 border-0 cursor-pointer bg-transparent" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Image Alt Text</label>
                                    <input type="text" value={formData.imageAlt} onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 focus:border-[#23471d] outline-none text-xs" placeholder="SEO alt text..." />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-4">
                            <button onClick={handleAddOrUpdateCard} className="flex-1 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black transition-all">
                                {isEditing ? <><Edit2 size={16} /> Update Card</> : <><Plus size={16} /> Add Benefit Card</>}
                            </button>
                            {isEditing && (
                                <button onClick={resetForm} className="px-6 py-4 bg-slate-200 text-slate-700 font-bold uppercase tracking-widest text-xs hover:bg-slate-300 transition-all text-[11px]">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhyExhibitManage;
