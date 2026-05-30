import React, { useState, useEffect } from 'react';
import { logisticPartnerApi, SERVER_URL } from '../lib/api';
import { Save, Plus, Trash2, Image as ImageIcon, Loader, Layout, Target, Zap, Package, Globe } from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';

const LogisticPartnerManage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('hero');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await logisticPartnerApi.get();
            if (res) setData(res);
        } catch (error) {
            toast.error('Failed to load logistics partner data');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await logisticPartnerApi.save(data);
            toast.success('Logistics Partner data saved successfully!');
        } catch (error) {
            toast.error('Failed to save data');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            toast.loading('Uploading image...', { id: 'upload' });
            const res = await logisticPartnerApi.uploadImage(formData);
            if (res.success) {
                setData({
                    ...data,
                    hero: { ...data.hero, bgImage: res.url }
                });
                toast.success('Image uploaded successfully!', { id: 'upload' });
            }
        } catch (error) {
            toast.error('Upload failed', { id: 'upload' });
        }
    };

    const formatUrl = (url) => {
        if (!url) return '';
        const normalizedUrl = url.replace(/\\/g, "/");
        if (normalizedUrl.startsWith('http')) return normalizedUrl;
        const clean = normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`;
        return `${SERVER_URL}${clean}`;
    };

    if (loading) return (
        <div className="py-20 text-center text-slate-400 font-semibold flex items-center justify-center gap-2">
            <Loader className="animate-spin text-slate-400 w-5 h-5" /> Syncing with database...
        </div>
    );
    if (!data) return <div className="p-10 text-center text-red-500">No data found</div>;

    const TabButton = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-2.5 font-bold uppercase tracking-widest text-xs transition-all ${
                activeTab === id 
                    ? 'bg-[#23471d] text-white' 
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
        >
            <Icon size={16} /> {label}
        </button>
    );

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-poppins">
            <div className="flex justify-between items-start">
                <PageHeader 
                    title="LOGISTICS PARTNER MANAGE" 
                    description="Dynamically manage the layout and data for the Logistic Partner page." 
                />
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-6 py-3 bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#23471d] transition-all rounded disabled:opacity-50 mt-2"
                >
                    {saving ? <Loader className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex flex-wrap gap-4 mt-6 border-b-2 border-slate-100 pb-3">
                <TabButton id="hero" icon={Layout} label="Hero Section" />
                <TabButton id="stats" icon={Target} label="Event Stats" />
                <TabButton id="benefits" icon={Zap} label="Benefits matrix" />
                <TabButton id="packages" icon={Package} label="Sponsor Packages" />
                <TabButton id="footer" icon={Globe} label="Footer Banner" />
            </div>

            <div className="mt-6">
                {/* HERO TAB */}
                {activeTab === 'hero' && (
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="w-full lg:w-2/3 space-y-4">
                            <div className="bg-white border-2 border-slate-100 p-6 shadow-md rounded-lg">
                                <h2 className="text-sm font-black uppercase text-slate-900 border-b pb-3 mb-4 flex items-center gap-1.5">
                                    <Layout size={16} className="text-[#d26019]" /> Hero Banner Configuration
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-full">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Background Image</label>
                                        <div className="flex gap-4 items-center">
                                            <div className="w-48 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                {data.hero.bgImage ? (
                                                    <img src={formatUrl(data.hero.bgImage)} className="w-full h-full object-cover" alt="bg" />
                                                ) : (
                                                    <ImageIcon className="text-slate-300 w-8 h-8" />
                                                )}
                                            </div>
                                            <div className="flex-1 relative">
                                                <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer" />
                                                <p className="text-[10px] text-slate-400 mt-2">Recommended: 1200x500px or larger. Auto-compressed.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Main Title</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-slate-200 focus:border-[#23471d] outline-none text-xs font-semibold"
                                            value={data.hero.title}
                                            onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Why Partner Box Title</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-slate-200 focus:border-[#23471d] outline-none text-xs font-semibold"
                                            value={data.hero.whyPartnerTitle}
                                            onChange={(e) => setData({ ...data, hero: { ...data.hero, whyPartnerTitle: e.target.value } })}
                                        />
                                    </div>
                                    <div className="col-span-full">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sub Title (Hook)</label>
                                        <textarea
                                            rows={2}
                                            className="w-full px-3 py-2 border border-slate-200 focus:border-[#23471d] outline-none text-xs font-semibold resize-none"
                                            value={data.hero.subTitle}
                                            onChange={(e) => setData({ ...data, hero: { ...data.hero, subTitle: e.target.value } })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="w-full lg:w-1/3 space-y-4">
                            <div className="bg-white border-2 border-slate-100 p-6 shadow-md rounded-lg">
                                <h2 className="text-sm font-black uppercase text-slate-900 border-b pb-3 mb-4 flex items-center gap-1.5">
                                    <Target size={16} className="text-[#d26019]" /> Why Partner Points
                                </h2>
                                <div className="space-y-3">
                                    {data.hero.whyPartnerPoints.map((pt, i) => (
                                        <div key={i} className="flex gap-2 p-2 bg-slate-50 border border-slate-100 rounded">
                                            <input
                                                type="text"
                                                className="w-20 px-2 py-1.5 border border-slate-200 focus:border-[#23471d] outline-none text-[10px] font-bold"
                                                value={pt.icon}
                                                onChange={(e) => {
                                                    const pts = [...data.hero.whyPartnerPoints];
                                                    pts[i].icon = e.target.value;
                                                    setData({ ...data, hero: { ...data.hero, whyPartnerPoints: pts } });
                                                }}
                                                placeholder="Icon"
                                            />
                                            <input
                                                type="text"
                                                className="flex-1 px-2 py-1.5 border border-slate-200 focus:border-[#23471d] outline-none text-xs font-medium"
                                                value={pt.text}
                                                onChange={(e) => {
                                                    const pts = [...data.hero.whyPartnerPoints];
                                                    pts[i].text = e.target.value;
                                                    setData({ ...data, hero: { ...data.hero, whyPartnerPoints: pts } });
                                                }}
                                                placeholder="Point text"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STATS TAB */}
                {activeTab === 'stats' && (
                    <div className="bg-white border-2 border-slate-100 p-6 shadow-md rounded-lg max-w-4xl">
                        <h2 className="text-sm font-black uppercase text-slate-900 border-b pb-3 mb-4 flex items-center gap-1.5">
                            <Target size={16} className="text-[#d26019]" /> Manage Quick Stats Array
                        </h2>
                        <div className="space-y-3">
                            {data.stats.map((st, i) => (
                                <div key={i} className="grid grid-cols-4 gap-3 p-3 border border-slate-100 rounded bg-slate-50 items-center">
                                    <input 
                                        type="text" 
                                        className="px-3 py-2 border border-slate-200 outline-none text-xs font-black text-slate-800 uppercase" 
                                        value={st.value} 
                                        onChange={(e) => {
                                            const stt = [...data.stats]; stt[i].value = e.target.value; setData({ ...data, stats: stt });
                                        }} 
                                        placeholder="Value (e.g. 8,000+)" 
                                    />
                                    <input 
                                        type="text" 
                                        className="px-3 py-2 border border-slate-200 outline-none text-xs font-semibold" 
                                        value={st.label} 
                                        onChange={(e) => {
                                            const stt = [...data.stats]; stt[i].label = e.target.value; setData({ ...data, stats: stt });
                                        }} 
                                        placeholder="Label (multiline via \n)" 
                                    />
                                    <input 
                                        type="text" 
                                        className="px-3 py-2 border border-slate-200 outline-none text-xs font-semibold" 
                                        value={st.icon} 
                                        onChange={(e) => {
                                            const stt = [...data.stats]; stt[i].icon = e.target.value; setData({ ...data, stats: stt });
                                        }} 
                                        placeholder="Lucide Icon" 
                                    />
                                    <div className="flex gap-2 items-center">
                                        <input 
                                            type="color" 
                                            className="w-10 h-8 border border-slate-200 rounded cursor-pointer p-0.5 bg-white" 
                                            value={st.color} 
                                            onChange={(e) => {
                                                const stt = [...data.stats]; stt[i].color = e.target.value; setData({ ...data, stats: stt });
                                            }} 
                                        />
                                        <span className="text-[10px] text-slate-500 font-mono uppercase">{st.color}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* BENEFITS TAB */}
                {activeTab === 'benefits' && (
                    <div className="flex flex-col xl:flex-row gap-6">
                        <div className="w-full xl:w-1/2 space-y-4">
                            <div className="bg-white border-2 border-slate-100 p-6 shadow-md rounded-lg">
                                <h2 className="text-sm font-black uppercase text-slate-900 border-b pb-3 mb-4 flex items-center gap-1.5">
                                    <Zap size={16} className="text-[#d26019]" /> Main Benefits 
                                </h2>
                                <div className="space-y-3">
                                    {data.benefits.main.map((mb, i) => (
                                        <div key={i} className="flex gap-3 p-3 border border-slate-100 rounded bg-slate-50">
                                            <input type="color" className="w-8 h-8 border border-slate-200 rounded cursor-pointer p-0 bg-white flex-shrink-0 mt-1" value={mb.color} onChange={(e) => {
                                                const arr = [...data.benefits.main]; arr[i].color = e.target.value; setData({ ...data, benefits: { ...data.benefits, main: arr } });
                                            }} />
                                            <div className="flex-1 space-y-2">
                                                <div className="flex gap-2">
                                                    <input type="text" className="w-24 px-2 py-1 border border-slate-200 outline-none text-[10px] font-bold" value={mb.icon} onChange={(e) => {
                                                        const arr = [...data.benefits.main]; arr[i].icon = e.target.value; setData({ ...data, benefits: { ...data.benefits, main: arr } });
                                                    }} placeholder="Icon" />
                                                    <input type="text" className="flex-1 px-2 py-1 border border-slate-200 outline-none text-xs font-black uppercase tracking-tight" value={mb.title} onChange={(e) => {
                                                        const arr = [...data.benefits.main]; arr[i].title = e.target.value; setData({ ...data, benefits: { ...data.benefits, main: arr } });
                                                    }} placeholder="Title" />
                                                </div>
                                                <input type="text" className="w-full px-2 py-1.5 border border-slate-200 outline-none text-xs font-medium" value={mb.text} onChange={(e) => {
                                                    const arr = [...data.benefits.main]; arr[i].text = e.target.value; setData({ ...data, benefits: { ...data.benefits, main: arr } });
                                                }} placeholder="Description" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="w-full xl:w-1/2 space-y-4">
                            <div className="bg-white border-2 border-slate-100 p-6 shadow-md rounded-lg">
                                <h2 className="text-sm font-black uppercase text-slate-900 border-b pb-3 mb-4 flex items-center gap-1.5">
                                    <Plus size={16} className="text-[#d26019]" /> Additional Advantages List
                                </h2>
                                <div className="mb-4">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Section Title</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-slate-200 focus:border-[#23471d] outline-none text-xs font-black uppercase tracking-widest" 
                                        value={data.benefits.additionalTitle} 
                                        onChange={(e) => { setData({ ...data, benefits: { ...data.benefits, additionalTitle: e.target.value } }); }} 
                                        placeholder="ADDITIONAL ADVANTAGES" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    {data.benefits.additional.map((adv, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input type="text" className="w-24 px-2 py-1.5 border border-slate-200 outline-none text-[10px] font-bold" value={adv.icon} onChange={(e) => {
                                                const arr = [...data.benefits.additional]; arr[i].icon = e.target.value; setData({ ...data, benefits: { ...data.benefits, additional: arr } });
                                            }} placeholder="Icon" />
                                            <input type="text" className="flex-1 px-3 py-1.5 border border-slate-200 outline-none text-xs font-medium" value={adv.text} onChange={(e) => {
                                                const arr = [...data.benefits.additional]; arr[i].text = e.target.value; setData({ ...data, benefits: { ...data.benefits, additional: arr } });
                                            }} placeholder="Text" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PACKAGES TAB */}
                {activeTab === 'packages' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {data.packages.map((pkg, i) => (
                            <div key={i} className="bg-white border-2 border-slate-100 shadow-md rounded-lg p-5 flex flex-col">
                                <h2 className="text-sm font-black uppercase text-slate-900 border-b pb-3 mb-4 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5"><Package size={16} className="text-[#d26019]" /> Package {i + 1}</span>
                                    <input type="color" className="w-6 h-6 border-0 rounded cursor-pointer p-0" value={pkg.color} onChange={(e) => {
                                        const pkgs = [...data.packages]; pkgs[i].color = e.target.value; setData({ ...data, packages: pkgs });
                                    }} />
                                </h2>
                                <div className="space-y-3 flex-1">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Package Name</label>
                                        <input type="text" className="w-full px-3 py-1.5 border border-slate-200 outline-none text-xs font-black uppercase text-[#0B2C66]" value={pkg.name} onChange={(e) => {
                                            const pkgs = [...data.packages]; pkgs[i].name = e.target.value; setData({ ...data, packages: pkgs });
                                        }} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Price (excl. GST)</label>
                                        <input type="text" className="w-full px-3 py-1.5 border border-slate-200 outline-none text-xs font-black text-slate-900" value={pkg.price} onChange={(e) => {
                                            const pkgs = [...data.packages]; pkgs[i].price = e.target.value; setData({ ...data, packages: pkgs });
                                        }} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Lucide Icon</label>
                                        <input type="text" className="w-full px-3 py-1.5 border border-slate-200 outline-none text-xs font-semibold" value={pkg.icon} onChange={(e) => {
                                            const pkgs = [...data.packages]; pkgs[i].icon = e.target.value; setData({ ...data, packages: pkgs });
                                        }} />
                                    </div>
                                    <div className="pt-2 border-t mt-3">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Included Features</label>
                                        <div className="space-y-1.5 mb-3">
                                            {pkg.features.map((feat, fi) => (
                                                <div key={fi} className="flex gap-1.5">
                                                    <input type="text" className="flex-1 px-2 py-1 border border-slate-200 outline-none text-[11px] font-medium" value={feat} onChange={(e) => {
                                                        const pkgs = [...data.packages]; pkgs[i].features[fi] = e.target.value; setData({ ...data, packages: pkgs });
                                                    }} />
                                                    <button onClick={() => {
                                                        const pkgs = [...data.packages]; pkgs[i].features.splice(fi, 1); setData({ ...data, packages: pkgs });
                                                    }} className="px-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"><Trash2 size={12} /></button>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => {
                                            const pkgs = [...data.packages]; pkgs[i].features.push('New Feature'); setData({ ...data, packages: pkgs });
                                        }} className="w-full py-1.5 border border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400 text-[10px] font-bold uppercase rounded flex items-center justify-center gap-1">
                                            <Plus size={12} /> Add Feature line
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* FOOTER TAB */}
                {activeTab === 'footer' && (
                    <div className="bg-white border-2 border-slate-100 p-6 shadow-md rounded-lg max-w-3xl">
                        <h2 className="text-sm font-black uppercase text-slate-900 border-b pb-3 mb-4 flex items-center gap-1.5">
                            <Globe size={16} className="text-[#d26019]" /> Bottom Call-to-Action Banner
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="col-span-full">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Success Title</label>
                                <input type="text" className="w-full px-3 py-2 border border-slate-200 focus:border-[#23471d] outline-none text-xs font-black uppercase tracking-tight" value={data.footer.successTitle} onChange={(e) => setData({ ...data, footer: { ...data.footer, successTitle: e.target.value } })} />
                            </div>
                            <div className="col-span-full">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Success Subtitle</label>
                                <input type="text" className="w-full px-3 py-2 border border-slate-200 focus:border-[#23471d] outline-none text-xs font-semibold" value={data.footer.successSub} onChange={(e) => setData({ ...data, footer: { ...data.footer, successSub: e.target.value } })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Contact Email</label>
                                <input type="email" className="w-full px-3 py-2 border border-slate-200 focus:border-[#23471d] outline-none text-xs font-medium" value={data.footer.email} onChange={(e) => setData({ ...data, footer: { ...data.footer, email: e.target.value } })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Contact Phone</label>
                                <input type="text" className="w-full px-3 py-2 border border-slate-200 focus:border-[#23471d] outline-none text-xs font-medium" value={data.footer.phone} onChange={(e) => setData({ ...data, footer: { ...data.footer, phone: e.target.value } })} />
                            </div>
                            <div className="col-span-full">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Website URL</label>
                                <input type="text" className="w-full px-3 py-2 border border-slate-200 focus:border-[#23471d] outline-none text-xs font-medium" value={data.footer.website} onChange={(e) => setData({ ...data, footer: { ...data.footer, website: e.target.value } })} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogisticPartnerManage;
