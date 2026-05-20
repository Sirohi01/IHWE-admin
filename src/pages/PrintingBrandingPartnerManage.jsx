import React, { useState, useEffect } from 'react';
import { printingBrandingPartnerApi, SERVER_URL } from '../lib/api';
import { Save, Plus, Trash2, Image as ImageIcon, Loader, Layout, Target, Zap, Package, Globe } from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';

const PrintingBrandingPartnerManage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('hero');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await printingBrandingPartnerApi.get();
            if (res) setData(res);
        } catch (error) {
            toast.error('Failed to load Printing & Branding Partner data');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await printingBrandingPartnerApi.save(data);
            toast.success('Printing & Branding Partner data saved successfully!');
        } catch (error) {
            toast.error('Failed to save data');
        } finally {
            setSaving(false);
        }
    };

    const handleHeroImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            toast.loading('Uploading image...', { id: 'upload' });
            const res = await printingBrandingPartnerApi.uploadImage(formData);
            if (res.success) {
                setData({
                    ...data,
                    hero: { ...data.hero, bgImage: res.url }
                });
                toast.success('Image uploaded successfully!', { id: 'upload' });
            } else {
                toast.error('Upload failed', { id: 'upload' });
            }
        } catch (error) {
            toast.error('Upload failed', { id: 'upload' });
        }
    };

    const handleWhyIconUpload = async (index, e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);

        try {
            toast.loading('Uploading icon...', { id: `upload-icon-${index}` });
            const res = await printingBrandingPartnerApi.uploadImage(formData);
            if (res.success) {
                const arr = [...data.whyPartner];
                arr[index].icon = res.url;
                setData({ ...data, whyPartner: arr });
                toast.success('Icon uploaded successfully!', { id: `upload-icon-${index}` });
            } else {
                toast.error('Icon upload failed', { id: `upload-icon-${index}` });
            }
        } catch (error) {
            toast.error('Icon upload failed', { id: `upload-icon-${index}` });
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

    if (loading) return (
        <div className="py-20 text-center text-slate-400 font-semibold flex items-center justify-center gap-2">
            <Loader className="animate-spin text-slate-400 w-5 h-5" /> Syncing with database...
        </div>
    );
    if (!data) return <div className="p-10 text-center text-red-500">No data found</div>;

    const TabButton = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-2.5 font-bold uppercase tracking-widest text-xs transition-all ${activeTab === id
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
                    title="PRINTING & BRANDING PARTNER MANAGE"
                    description="Manage the Printing & Branding Partner page content using the same theme as the logistics partner admin."
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

            <div className="flex flex-wrap gap-4 mt-6 border-b-2 border-slate-100 pb-3">
                <TabButton id="hero" icon={Layout} label="Hero Section" />
                <TabButton id="why" icon={Target} label="Why Partner" />
                <TabButton id="stats" icon={Target} label="Stats" />
                <TabButton id="benefits" icon={Zap} label="Benefits" />
                <TabButton id="advantages" icon={Package} label="Advantages" />
                <TabButton id="packages" icon={Package} label="Packages" />
                <TabButton id="footer" icon={Globe} label="Footer" />
            </div>

            <div className="mt-6">
                {activeTab === 'hero' && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <div className="xl:col-span-2 bg-white border-2 border-slate-100 p-6 shadow-md rounded-lg">
                            <h2 className="text-sm font-black uppercase text-slate-900 border-b pb-3 mb-4 flex items-center gap-1.5">
                                <Layout size={16} className="text-[#d26019]" /> Hero Banner Configuration
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-full">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Subtitle</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-slate-200 focus:border-[#23471d] outline-none text-xs font-semibold"
                                        value={data.hero.subtitle}
                                        onChange={(e) => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Title</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-slate-200 focus:border-[#23471d] outline-none text-xs font-semibold"
                                        value={data.hero.title}
                                        onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Short Description</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-slate-200 focus:border-[#23471d] outline-none text-xs font-semibold"
                                        value={data.hero.shortDescription}
                                        onChange={(e) => setData({ ...data, hero: { ...data.hero, shortDescription: e.target.value } })}
                                    />
                                </div>
                                <div className="col-span-full">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-3 py-2 border border-slate-200 focus:border-[#23471d] outline-none text-xs font-semibold resize-none"
                                        value={data.hero.description}
                                        onChange={(e) => setData({ ...data, hero: { ...data.hero, description: e.target.value } })}
                                    />
                                </div>
                                <div className="col-span-full">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Background Image Path</label>
                                    <div className="flex gap-4 items-center">
                                        <input
                                            type="text"
                                            className="flex-1 px-3 py-2 border border-slate-200 focus:border-[#23471d] outline-none text-xs font-semibold"
                                            value={data.hero.bgImage}
                                            onChange={(e) => setData({ ...data, hero: { ...data.hero, bgImage: e.target.value } })}
                                        />
                                        <div className="w-24 h-16 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
                                            {data.hero.bgImage ? <img src={formatUrl(data.hero.bgImage)} alt="hero" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300 w-6 h-6" />}
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleHeroImageUpload}
                                            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-2">Upload background image for the hero section. Recommended: 1200x500px or larger.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'why' && (
                    <div className="bg-white border-2 border-slate-100 p-6 shadow-md rounded-lg max-w-4xl">
                        <h2 className="text-sm font-black uppercase text-slate-900 border-b pb-3 mb-4 flex items-center gap-1.5">
                            <Target size={16} className="text-[#d26019]" /> Why Partner Points
                        </h2>
                        <div className="space-y-3">
                            {data.whyPartner.map((item, i) => (
                                <div key={i} className="grid grid-cols-12 gap-3 p-3 border border-slate-100 rounded bg-slate-50 items-center">
                                    <div className="col-span-4 flex flex-col gap-2">
                                        <input
                                            type="text"
                                            className="w-full px-2 py-1.5 border border-slate-200 focus:border-[#23471d] outline-none text-[10px] font-bold"
                                            value={item.icon || ''}
                                            onChange={(e) => {
                                                const arr = [...data.whyPartner]; arr[i].icon = e.target.value; setData({ ...data, whyPartner: arr });
                                            }}
                                            placeholder="Icon name or URL"
                                        />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleWhyIconUpload(i, e)}
                                            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        className="col-span-8 px-2 py-1.5 border border-slate-200 focus:border-[#23471d] outline-none text-xs font-medium"
                                        value={item.text}
                                        onChange={(e) => {
                                            const arr = [...data.whyPartner]; arr[i].text = e.target.value; setData({ ...data, whyPartner: arr });
                                        }}
                                        placeholder="Why partner text"
                                    />
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    setData({ ...data, whyPartner: [...data.whyPartner, { text: '', icon: '' }] });
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded text-slate-600 text-xs uppercase font-bold hover:bg-slate-50"
                            >
                                <Plus size={14} /> Add Point
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="bg-white border-2 border-slate-100 p-6 shadow-md rounded-lg max-w-5xl">
                        <h2 className="text-sm font-black uppercase text-slate-900 border-b pb-3 mb-4 flex items-center gap-1.5">
                            <Target size={16} className="text-[#d26019]" /> Stats
                        </h2>
                        <div className="space-y-3">
                            {data.stats.map((item, i) => (
                                <div key={i} className="grid grid-cols-12 gap-3 p-3 border border-slate-100 rounded bg-slate-50 items-center">
                                    <div className="col-span-2">
                                        <input
                                            type="color"
                                            className="w-full h-10 border border-slate-200 rounded cursor-pointer"
                                            value={item.color}
                                            onChange={(e) => {
                                                const arr = [...data.stats]; arr[i].color = e.target.value; setData({ ...data, stats: arr });
                                            }}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        className="col-span-2 px-2 py-1.5 border border-slate-200 outline-none text-[10px] font-black uppercase"
                                        value={item.title}
                                        onChange={(e) => {
                                            const arr = [...data.stats]; arr[i].title = e.target.value; setData({ ...data, stats: arr });
                                        }}
                                        placeholder="Title"
                                    />
                                    <input
                                        type="text"
                                        className="col-span-4 px-2 py-1.5 border border-slate-200 outline-none text-xs font-semibold"
                                        value={item.subtitle}
                                        onChange={(e) => {
                                            const arr = [...data.stats]; arr[i].subtitle = e.target.value; setData({ ...data, stats: arr });
                                        }}
                                        placeholder="Subtitle"
                                    />
                                    <button
                                        onClick={() => {
                                            const arr = [...data.stats]; arr.splice(i, 1); setData({ ...data, stats: arr });
                                        }}
                                        className="col-span-2 inline-flex items-center justify-center rounded bg-red-50 text-red-500 px-2 py-1 text-[10px] uppercase font-bold hover:bg-red-100"
                                    >
                                        <Trash2 size={14} /> Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => setData({ ...data, stats: [...data.stats, { title: '', subtitle: '', color: '#000000' }] })}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded text-slate-600 text-xs uppercase font-bold hover:bg-slate-50"
                            >
                                <Plus size={14} /> Add Stat
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'benefits' && (
                    <div className="bg-white border-2 border-slate-100 p-6 shadow-md rounded-lg max-w-5xl">
                        <h2 className="text-sm font-black uppercase text-slate-900 border-b pb-3 mb-4 flex items-center gap-1.5">
                            <Zap size={16} className="text-[#d26019]" /> Benefits
                        </h2>
                        <div className="space-y-3">
                            {data.benefits.map((item, i) => (
                                <div key={i} className="grid grid-cols-12 gap-3 p-3 border border-slate-100 rounded bg-slate-50 items-center">
                                    <div className="col-span-1">
                                        <input
                                            type="color"
                                            className="w-full h-10 border border-slate-200 rounded cursor-pointer"
                                            value={item.color}
                                            onChange={(e) => {
                                                const arr = [...data.benefits]; arr[i].color = e.target.value; setData({ ...data, benefits: arr });
                                            }}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        className="col-span-2 px-2 py-1.5 border border-slate-200 outline-none text-[10px] font-bold"
                                        value={item.icon || ''}
                                        onChange={(e) => {
                                            const arr = [...data.benefits]; arr[i].icon = e.target.value; setData({ ...data, benefits: arr });
                                        }}
                                        placeholder="Icon"
                                    />
                                    <input
                                        type="text"
                                        className="col-span-3 px-2 py-1.5 border border-slate-200 outline-none text-xs font-black uppercase"
                                        value={item.title}
                                        onChange={(e) => {
                                            const arr = [...data.benefits]; arr[i].title = e.target.value; setData({ ...data, benefits: arr });
                                        }}
                                        placeholder="Title"
                                    />
                                    <input
                                        type="text"
                                        className="col-span-5 px-2 py-1.5 border border-slate-200 outline-none text-xs font-medium"
                                        value={item.description}
                                        onChange={(e) => {
                                            const arr = [...data.benefits]; arr[i].description = e.target.value; setData({ ...data, benefits: arr });
                                        }}
                                        placeholder="Description"
                                    />
                                    <button
                                        onClick={() => {
                                            const arr = [...data.benefits]; arr.splice(i, 1); setData({ ...data, benefits: arr });
                                        }}
                                        className="col-span-1 inline-flex items-center justify-center rounded bg-red-50 text-red-500 px-2 py-1 text-[10px] uppercase font-bold hover:bg-red-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => setData({ ...data, benefits: [...data.benefits, { title: '', description: '', icon: '', color: '#000000' }] })}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded text-slate-600 text-xs uppercase font-bold hover:bg-slate-50"
                            >
                                <Plus size={14} /> Add Benefit
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'advantages' && (
                    <div className="bg-white border-2 border-slate-100 p-6 shadow-md rounded-lg max-w-4xl">
                        <h2 className="text-sm font-black uppercase text-slate-900 border-b pb-3 mb-4 flex items-center gap-1.5">
                            <Plus size={16} className="text-[#d26019]" /> Advantages
                        </h2>
                        <div className="space-y-3">
                            {data.advantages.map((item, i) => (
                                <div key={i} className="flex gap-3 p-3 border border-slate-100 rounded bg-slate-50 items-center">
                                    <input
                                        type="text"
                                        className="flex-1 px-3 py-1.5 border border-slate-200 outline-none text-xs font-medium"
                                        value={item.text}
                                        onChange={(e) => {
                                            const arr = [...data.advantages]; arr[i].text = e.target.value; setData({ ...data, advantages: arr });
                                        }}
                                        placeholder="Advantage text"
                                    />
                                    <button
                                        onClick={() => {
                                            const arr = [...data.advantages]; arr.splice(i, 1); setData({ ...data, advantages: arr });
                                        }}
                                        className="inline-flex items-center justify-center rounded bg-red-50 text-red-500 px-2 py-1 text-[10px] uppercase font-bold hover:bg-red-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => setData({ ...data, advantages: [...data.advantages, { text: '' }] })}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded text-slate-600 text-xs uppercase font-bold hover:bg-slate-50"
                            >
                                <Plus size={14} /> Add Advantage
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'packages' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {data.packages.map((pkg, i) => (
                            <div key={i} className="bg-white border-2 border-slate-100 shadow-md rounded-lg p-5 flex flex-col">
                                <h2 className="text-sm font-black uppercase text-slate-900 border-b pb-3 mb-4 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5"><Package size={16} className="text-[#d26019]" /> Package {i + 1}</span>
                                    <button
                                        onClick={() => {
                                            const arr = [...data.packages]; arr.splice(i, 1); setData({ ...data, packages: arr });
                                        }}
                                        className="text-red-500 hover:text-red-700 text-[10px] uppercase font-bold"
                                    >Remove</button>
                                </h2>
                                <div className="space-y-3 flex-1">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Title</label>
                                        <input type="text" className="w-full px-3 py-1.5 border border-slate-200 outline-none text-xs font-black uppercase" value={pkg.title} onChange={(e) => {
                                            const arr = [...data.packages]; arr[i].title = e.target.value; setData({ ...data, packages: arr });
                                        }} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Price</label>
                                        <input type="text" className="w-full px-3 py-1.5 border border-slate-200 outline-none text-xs font-black" value={pkg.price} onChange={(e) => {
                                            const arr = [...data.packages]; arr[i].price = e.target.value; setData({ ...data, packages: arr });
                                        }} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Color</label>
                                            <input type="color" className="w-full h-10 border border-slate-200 rounded cursor-pointer" value={pkg.color} onChange={(e) => {
                                                const arr = [...data.packages]; arr[i].color = e.target.value; setData({ ...data, packages: arr });
                                            }} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">BG Color</label>
                                            <input type="color" className="w-full h-10 border border-slate-200 rounded cursor-pointer" value={pkg.bg || '#ffffff'} onChange={(e) => {
                                                const arr = [...data.packages]; arr[i].bg = e.target.value; setData({ ...data, packages: arr });
                                            }} />
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t mt-3">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Included Lines</label>
                                        <div className="space-y-2 mb-3">
                                            {(pkg.list || []).map((line, li) => (
                                                <div key={li} className="flex gap-2 items-center">
                                                    <input type="text" className="flex-1 px-2 py-1 border border-slate-200 outline-none text-[11px] font-medium" value={line} onChange={(e) => {
                                                        const arr = [...data.packages]; arr[i].list[li] = e.target.value; setData({ ...data, packages: arr });
                                                    }} />
                                                    <button onClick={() => {
                                                        const arr = [...data.packages]; arr[i].list.splice(li, 1); setData({ ...data, packages: arr });
                                                    }} className="px-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"><Trash2 size={12} /></button>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => {
                                            const arr = [...data.packages]; arr[i].list = arr[i].list || [];
                                            arr[i].list.push('New line');
                                            setData({ ...data, packages: arr });
                                        }} className="w-full py-1.5 border border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400 text-[10px] font-bold uppercase rounded flex items-center justify-center gap-1">
                                            <Plus size={12} /> Add list line
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-6">
                            <button onClick={() => setData({ ...data, packages: [...data.packages, { title: '', price: '', color: '#000000', bg: '#ffffff', list: [] }] })} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded uppercase text-xs font-bold text-slate-600 hover:bg-slate-50">
                                <Plus size={14} /> Add Package
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'footer' && (
                    <div className="bg-white border-2 border-slate-100 p-6 shadow-md rounded-lg max-w-4xl">
                        <h2 className="text-sm font-black uppercase text-slate-900 border-b pb-3 mb-4 flex items-center gap-1.5">
                            <Globe size={16} className="text-[#d26019]" /> Footer Configuration
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
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Website</label>
                                <input type="text" className="w-full px-3 py-2 border border-slate-200 focus:border-[#23471d] outline-none text-xs font-medium" value={data.footer.website} onChange={(e) => setData({ ...data, footer: { ...data.footer, website: e.target.value } })} />
                            </div>
                            <div className="col-span-full">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Registration Link</label>
                                <input type="text" className="w-full px-3 py-2 border border-slate-200 focus:border-[#23471d] outline-none text-xs font-medium" value={data.footer.registerLink} onChange={(e) => setData({ ...data, footer: { ...data.footer, registerLink: e.target.value } })} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrintingBrandingPartnerManage;
