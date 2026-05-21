import React, { useState, useEffect } from 'react';
import { hospitalityPartnerApi, SERVER_URL } from '../lib/api';
import { Save, Plus, Trash2, Layout, Target, Zap, Package, Globe, Shield, Calendar, Users, Star, Gift } from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';

const HospitalityPartnerManage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('hero');
    const [heroImagePreview, setHeroImagePreview] = useState("");
    const [footerImagePreview, setFooterImagePreview] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await hospitalityPartnerApi.get();
            if (res) {
                setData(res);
                if (res.hero?.topImage) {
                    setHeroImagePreview(formatUrl(res.hero.topImage));
                }
                if (res.footer?.bottomImage) {
                    setFooterImagePreview(formatUrl(res.footer.bottomImage));
                }
            }
        } catch (error) {
            toast.error('Failed to load Hospitality Partner data');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            await hospitalityPartnerApi.save(data);
            toast.success('Hospitality Partner data saved successfully!');
        } catch (error) {
            toast.error('Failed to save data');
        } finally {
            setSaving(false);
        }
    };

    const handleTopImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        const toastId = toast.loading('Uploading top image...');
        try {
            const res = await hospitalityPartnerApi.uploadImage(formData);
            if (res.success) {
                setData(prev => ({
                    ...prev,
                    hero: { ...prev.hero, topImage: res.url }
                }));
                setHeroImagePreview(formatUrl(res.url));
                toast.update(toastId, { render: 'Top image uploaded successfully!', type: "success", isLoading: false, autoClose: 3000 });
            } else {
                toast.update(toastId, { render: 'Upload failed', type: "error", isLoading: false, autoClose: 3000 });
            }
        } catch (error) {
            toast.update(toastId, { render: 'Upload failed', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const handleFooterImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        const toastId = toast.loading('Uploading footer image...');
        try {
            const res = await hospitalityPartnerApi.uploadImage(formData);
            if (res.success) {
                setData(prev => ({
                    ...prev,
                    footer: { ...prev.footer, bottomImage: res.url }
                }));
                setFooterImagePreview(formatUrl(res.url));
                toast.update(toastId, { render: 'Footer image uploaded successfully!', type: "success", isLoading: false, autoClose: 3000 });
            } else {
                toast.update(toastId, { render: 'Upload failed', type: "error", isLoading: false, autoClose: 3000 });
            }
        } catch (error) {
            toast.update(toastId, { render: 'Upload failed', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const formatUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const normalized = url.replace(/\\/g, '/');
        if (normalized.startsWith('/uploads') || normalized.startsWith('uploads/')) {
            const clean = normalized.startsWith('/') ? normalized : `/${normalized}`;
            return `${SERVER_URL}${clean}`;
        }
        if (normalized.startsWith('/')) {
            return `${SERVER_URL}${normalized}`;
        }
        return normalized;
    };

    const inputClass = "w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-sm shadow-sm rounded";
    const labelClass = "block text-xs font-semibold text-gray-700 mb-1 uppercase";

    if (loading) return (
        <div className="py-20 text-center text-slate-400 font-semibold flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> Syncing with database...
        </div>
    );
    if (!data) return <div className="p-10 text-center text-red-500">No data found</div>;

    return (
        <div className="bg-gray-50 min-h-screen p-6 mt-8 font-poppins">
            <div className="flex justify-between items-center mb-6">
                <PageHeader
                    title="HOSPITALITY PARTNER MANAGE"
                    description="Manage the Hospitality Partner page content using tabs."
                />
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-[#4E9F3D] hover:bg-green-700 text-white font-bold rounded shadow transition-colors flex items-center gap-2 text-sm"
                >
                    Refresh Data from DB
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                {/* Tabs Header */}
                <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
                    {[
                        { id: 'hero', label: 'Hero Section', icon: <Shield className="w-4 h-4" /> },
                        { id: 'why', label: 'Why Partner', icon: <Target className="w-4 h-4" /> },
                        { id: 'stats', label: 'Stats Section', icon: <Calendar className="w-4 h-4" /> },
                        { id: 'benefits', label: 'Benefits Section', icon: <Users className="w-4 h-4" /> },
                        { id: 'packages', label: 'Packages Section', icon: <Star className="w-4 h-4" /> },
                        { id: 'footer', label: 'Footer Section', icon: <Gift className="w-4 h-4" /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap border-b-2 ${activeTab === tab.id ? 'bg-white border-[#134698] text-[#134698]' : 'border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSave} className="p-6">
                    {/* Hero Tab */}
                    {activeTab === 'hero' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-6">Logo & Tagline Row (Top Left)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="col-span-full md:col-span-1">
                                    <label className={labelClass}>Logo Title (Use Enter for new lines, line 2 is green)</label>
                                    <textarea rows={3} value={data.hero.logoTitle || "International\nHealth & Wellness\nExpo 2026"} onChange={(e) => setData({ ...data, hero: { ...data.hero, logoTitle: e.target.value } })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Logo Badge</label>
                                    <input type="text" value={data.hero.logoBadge || "Global Edition"} onChange={(e) => setData({ ...data, hero: { ...data.hero, logoBadge: e.target.value } })} className={inputClass} />
                                </div>
                                <div className="col-span-full">
                                    <label className={labelClass}>Right Text (Use Enter for new lines)</label>
                                    <textarea rows={3} value={data.hero.logoRightText || "Collaborate.\nConnect.\nGrow Together."} onChange={(e) => setData({ ...data, hero: { ...data.hero, logoRightText: e.target.value } })} className={inputClass} />
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Main Hero Content</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-full md:col-span-1">
                                    <label className={labelClass}>Tagline</label>
                                    <input type="text" value={data.hero.tagline} onChange={(e) => setData({ ...data, hero: { ...data.hero, tagline: e.target.value } })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Title</label>
                                    <input type="text" value={data.hero.title} onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Title Highlight</label>
                                    <input type="text" value={data.hero.titleHighlight} onChange={(e) => setData({ ...data, hero: { ...data.hero, titleHighlight: e.target.value } })} className={inputClass} />
                                </div>
                                <div className="col-span-full">
                                    <label className={labelClass}>Subtitle</label>
                                    <input type="text" value={data.hero.subtitle} onChange={(e) => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })} className={inputClass} />
                                </div>
                                <div className="col-span-full">
                                    <label className={labelClass}>Description</label>
                                    <textarea rows={3} value={data.hero.description} onChange={(e) => setData({ ...data, hero: { ...data.hero, description: e.target.value } })} className={inputClass} />
                                </div>
                                <div className="col-span-full p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <label className={labelClass}>Hero Top Image</label>
                                    <input type="file" accept="image/*" onChange={handleTopImageUpload} className="mb-4 text-sm w-full" />
                                    {heroImagePreview && <img src={heroImagePreview} alt="hero" className="h-40 object-cover rounded border border-gray-300" />}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Why Partner Tab */}
                    {activeTab === 'why' && (
                        <div className="space-y-6">
                            <div className="pb-2 border-b flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-800">Why Partner Points</h3>
                                <button type="button" onClick={() => setData({ ...data, whyPartner: [...data.whyPartner, { text: '' }] })} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs flex items-center gap-1.5 font-bold transition-colors shadow-sm"><Plus className="w-4 h-4" /> Add Point</button>
                            </div>
                            <div className="space-y-3">
                                {data.whyPartner.map((item, i) => (
                                    <div key={i} className="flex gap-3 bg-gray-50 p-3 rounded border border-gray-200 items-center">
                                        <input
                                            type="text"
                                            value={item.text}
                                            onChange={(e) => {
                                                const arr = [...data.whyPartner]; arr[i].text = e.target.value; setData({ ...data, whyPartner: arr });
                                            }}
                                            placeholder="Why partner text"
                                            className={`${inputClass} flex-1`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const arr = [...data.whyPartner]; arr.splice(i, 1); setData({ ...data, whyPartner: arr });
                                            }}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 className="w-4.5 h-4.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stats Tab */}
                    {activeTab === 'stats' && (
                        <div className="space-y-6">
                            <div className="pb-2 border-b flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-800">Stats Configuration</h3>
                                <button type="button" onClick={() => setData({ ...data, stats: [...data.stats, { val: '', label: '', icon: '', color: '#000000' }] })} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs flex items-center gap-1.5 font-bold transition-colors shadow-sm"><Plus className="w-4 h-4" /> Add Stat</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {data.stats.map((item, i) => (
                                    <div key={i} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
                                        <button type="button" onClick={() => {
                                            const arr = [...data.stats]; arr.splice(i, 1); setData({ ...data, stats: arr });
                                        }} className="absolute top-2 right-2 text-red-500 hover:bg-red-100 rounded p-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="space-y-3">
                                            <div>
                                                <label className={labelClass}>Color</label>
                                                <input type="color" value={item.color} onChange={(e) => {
                                                    const arr = [...data.stats]; arr[i].color = e.target.value; setData({ ...data, stats: arr });
                                                }} className="w-full h-8 cursor-pointer rounded border border-gray-300 bg-white" />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Value</label>
                                                <input type="text" value={item.val} onChange={(e) => {
                                                    const arr = [...data.stats]; arr[i].val = e.target.value; setData({ ...data, stats: arr });
                                                }} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Label</label>
                                                <textarea value={item.label} onChange={(e) => {
                                                    const arr = [...data.stats]; arr[i].label = e.target.value; setData({ ...data, stats: arr });
                                                }} className={inputClass} rows={2} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Benefits Tab */}
                    {activeTab === 'benefits' && (
                        <div className="space-y-6">
                            <div className="pb-2 border-b flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-800">Benefits Configuration</h3>
                                <button type="button" onClick={() => setData({ ...data, benefits: [...data.benefits, { title: '', desc: '', icon: '', color: '#000000' }] })} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs flex items-center gap-1.5 font-bold transition-colors shadow-sm"><Plus className="w-4 h-4" /> Add Benefit</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {data.benefits.map((item, i) => (
                                    <div key={i} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
                                        <button type="button" onClick={() => {
                                            const arr = [...data.benefits]; arr.splice(i, 1); setData({ ...data, benefits: arr });
                                        }} className="absolute top-2 right-2 text-red-500 hover:bg-red-100 rounded p-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="space-y-3">
                                            <div>
                                                <label className={labelClass}>Color</label>
                                                <input type="color" value={item.color} onChange={(e) => {
                                                    const arr = [...data.benefits]; arr[i].color = e.target.value; setData({ ...data, benefits: arr });
                                                }} className="w-full h-8 cursor-pointer rounded border border-gray-300 bg-white" />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Icon String</label>
                                                <input type="text" value={item.icon || ''} onChange={(e) => {
                                                    const arr = [...data.benefits]; arr[i].icon = e.target.value; setData({ ...data, benefits: arr });
                                                }} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Title</label>
                                                <input type="text" value={item.title} onChange={(e) => {
                                                    const arr = [...data.benefits]; arr[i].title = e.target.value; setData({ ...data, benefits: arr });
                                                }} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Description</label>
                                                <textarea value={item.desc} onChange={(e) => {
                                                    const arr = [...data.benefits]; arr[i].desc = e.target.value; setData({ ...data, benefits: arr });
                                                }} className={inputClass} rows={3} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Packages Tab */}
                    {activeTab === 'packages' && (
                        <div className="space-y-6">
                            <div className="pb-2 border-b flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-800">Partnership Packages</h3>
                                <button type="button" onClick={() => setData({ ...data, packages: [...data.packages, { name: '', price: '', color: '#000000', bg: '#ffffff', benefits: [] }] })} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs flex items-center gap-1.5 font-bold transition-colors shadow-sm"><Plus className="w-4 h-4" /> Add Package</button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {data.packages.map((pkg, i) => (
                                    <div key={i} className="p-5 border border-gray-200 rounded-lg bg-gray-50 relative">
                                        <button type="button" onClick={() => {
                                            const arr = [...data.packages]; arr.splice(i, 1); setData({ ...data, packages: arr });
                                        }} className="absolute top-3 right-3 text-red-500 hover:bg-red-100 rounded p-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <h4 className="font-bold text-sm mb-4 border-b pb-2">Package {i + 1}</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className={labelClass}>Package Name</label>
                                                <input type="text" value={pkg.name} onChange={(e) => {
                                                    const arr = [...data.packages]; arr[i].name = e.target.value; setData({ ...data, packages: arr });
                                                }} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Price</label>
                                                <input type="text" value={pkg.price} onChange={(e) => {
                                                    const arr = [...data.packages]; arr[i].price = e.target.value; setData({ ...data, packages: arr });
                                                }} className={inputClass} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className={labelClass}>Color</label>
                                                    <input type="color" value={pkg.color} onChange={(e) => {
                                                        const arr = [...data.packages]; arr[i].color = e.target.value; setData({ ...data, packages: arr });
                                                    }} className="w-full h-8 cursor-pointer rounded border border-gray-300 bg-white" />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>BG Color</label>
                                                    <input type="color" value={pkg.bg || '#ffffff'} onChange={(e) => {
                                                        const arr = [...data.packages]; arr[i].bg = e.target.value; setData({ ...data, packages: arr });
                                                    }} className="w-full h-8 cursor-pointer rounded border border-gray-300 bg-white" />
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className={labelClass}>Package Benefits</label>
                                                    <button type="button" onClick={() => {
                                                        const arr = [...data.packages]; arr[i].benefits = arr[i].benefits || []; arr[i].benefits.push('New benefit'); setData({ ...data, packages: arr });
                                                    }} className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] flex items-center gap-1 font-bold transition-colors">
                                                        <Plus className="w-3 h-3" /> Add Benefit
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {(pkg.benefits || []).map((line, li) => (
                                                        <div key={li} className="flex gap-2 items-center">
                                                            <input type="text" value={line} onChange={(e) => {
                                                                const arr = [...data.packages]; arr[i].benefits[li] = e.target.value; setData({ ...data, packages: arr });
                                                            }} className={`${inputClass} py-1.5`} />
                                                            <button type="button" onClick={() => {
                                                                const arr = [...data.packages]; arr[i].benefits.splice(li, 1); setData({ ...data, packages: arr });
                                                            }} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer Tab */}
                    {activeTab === 'footer' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Footer Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-full">
                                    <label className={labelClass}>Headline</label>
                                    <input type="text" value={data.footer.headline} onChange={(e) => setData({ ...data, footer: { ...data.footer, headline: e.target.value } })} className={inputClass} />
                                </div>
                                <div className="col-span-full">
                                    <label className={labelClass}>Subtext</label>
                                    <input type="text" value={data.footer.subtext} onChange={(e) => setData({ ...data, footer: { ...data.footer, subtext: e.target.value } })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Email</label>
                                    <input type="email" value={data.footer.email} onChange={(e) => setData({ ...data, footer: { ...data.footer, email: e.target.value } })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Phone</label>
                                    <input type="text" value={data.footer.phone} onChange={(e) => setData({ ...data, footer: { ...data.footer, phone: e.target.value } })} className={inputClass} />
                                </div>
                                <div className="col-span-full">
                                    <label className={labelClass}>Website</label>
                                    <input type="text" value={data.footer.website} onChange={(e) => setData({ ...data, footer: { ...data.footer, website: e.target.value } })} className={inputClass} />
                                </div>
                                <div className="col-span-full">
                                    <label className={labelClass}>Registration Link</label>
                                    <input type="text" value={data.footer.registerLink} onChange={(e) => setData({ ...data, footer: { ...data.footer, registerLink: e.target.value } })} className={inputClass} />
                                </div>
                                <div className="col-span-full p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <label className={labelClass}>Footer Bottom Image</label>
                                    <input type="file" accept="image/*" onChange={handleFooterImageUpload} className="mb-4 text-sm w-full" />
                                    {footerImagePreview && <img src={footerImagePreview} alt="footer" className="h-40 object-cover rounded border border-gray-300" />}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save Changes Button Footer inside active tab form container */}
                    <div className="mt-8 pt-6 border-t flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3 bg-[#134698] hover:bg-blue-800 text-white font-bold rounded shadow-md transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            SAVE CHANGES
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HospitalityPartnerManage;
