import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api, { SERVER_URL } from "../lib/api";
import { Save, Plus, Trash2, Shield, Calendar, Users, Star, Gift } from "lucide-react";
import PageHeader from "../components/PageHeader";

const HotelStayPartnerManage = () => {
    const [activeTab, setActiveTab] = useState("hero");
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        hero: {
            title: "", subtitle: "", slogan: "", badgeText: "", partnerTitle: "", hotelPartnerLabel: "", hotelPartnerDesc: "", whyPartnerTitle: "", whyPartnerItems: []
        },
        stats: [],
        benefits: {
            companyCard: { title: "", items: [] },
            ihweCard: { title: "", items: [] },
            perksCard: { title: "", items: [] }
        },
        packages: {
            title: "", items: [], notes: []
        },
        footer: {
            footerTitle: "", footerSubtitle: "", footerItalicText: "", footerGrowTitle: "", email: "", phone: "", perks: []
        }
    });

    const [heroImage, setHeroImage] = useState(null);
    const [footerImage, setFooterImage] = useState(null);
    const [heroImagePreview, setHeroImagePreview] = useState("");
    const [footerImagePreview, setFooterImagePreview] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get(`/api/hotel-stay-partner?t=${new Date().getTime()}`);
            if (response.data.success && response.data.data) {
                const data = JSON.parse(JSON.stringify(response.data.data));
                setFormData({
                    hero: data.hero || { title: "", subtitle: "", slogan: "", badgeText: "", partnerTitle: "", hotelPartnerLabel: "", hotelPartnerDesc: "", whyPartnerTitle: "", whyPartnerItems: [] },
                    stats: data.stats || [],
                    benefits: {
                        companyCard: {
                            title: data.benefits?.companyCard?.title || "What's in it for your company?",
                            items: data.benefits?.companyCard?.items || []
                        },
                        ihweCard: {
                            title: data.benefits?.ihweCard?.title || "What's in it for IHWE 2026?",
                            items: data.benefits?.ihweCard?.items || []
                        },
                        perksCard: {
                            title: data.benefits?.perksCard?.title || "Partner Perks",
                            items: data.benefits?.perksCard?.items || []
                        }
                    },
                    packages: {
                        title: data.packages?.title || "PARTNERSHIP PACKAGES & INVESTMENT",
                        items: data.packages?.items || [],
                        notes: data.packages?.notes || []
                    },
                    footer: data.footer || { footerTitle: "", footerSubtitle: "", footerItalicText: "", footerGrowTitle: "", email: "", phone: "", perks: [] }
                });

                if (data.hero?.image) {
                    setHeroImagePreview(data.hero.image.startsWith('/uploads') ? `${SERVER_URL}${data.hero.image}` : data.hero.image);
                }
                if (data.footer?.image) {
                    setFooterImagePreview(data.footer.image.startsWith('/uploads') ? `${SERVER_URL}${data.footer.image}` : data.footer.image);
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            Swal.fire("Error", "Failed to load hotel stay partner data", "error");
        }
    };

    const handleTextChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleNestedTextChange = (section, subSection, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subSection]: {
                    ...prev[section][subSection],
                    [field]: value
                }
            }
        }));
    };

    const handleArrayChange = (section, arrayName, index, field, value) => {
        const newArray = [...formData[section][arrayName]];
        newArray[index] = { ...newArray[index], [field]: value };
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [arrayName]: newArray
            }
        }));
    };

    const handleNestedArrayChange = (section, subSection, arrayName, index, field, value) => {
        const newArray = [...formData[section][subSection][arrayName]];
        newArray[index] = { ...newArray[index], [field]: value };
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subSection]: {
                    ...prev[section][subSection],
                    [arrayName]: newArray
                }
            }
        }));
    };

    const handleImageChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'hero') {
                setHeroImage(file);
                setHeroImagePreview(URL.createObjectURL(file));
            } else {
                setFooterImage(file);
                setFooterImagePreview(URL.createObjectURL(file));
            }
        }
    };

    const uploadImage = async (file, type) => {
        const imageFormData = new FormData();
        imageFormData.append("image", file);
        imageFormData.append("type", type);
        try {
            await api.post("/api/hotel-stay-partner/upload", imageFormData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
        } catch (error) {
            throw new Error(`Failed to upload ${type} image`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.put("/api/hotel-stay-partner", formData);
            if (heroImage) await uploadImage(heroImage, 'hero');
            if (footerImage) await uploadImage(footerImage, 'footer');
            Swal.fire("Success", "Hotel Stay Partner content updated successfully", "success");
            fetchData();
        } catch (error) {
            Swal.fire("Error", "Failed to update content", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-sm shadow-sm rounded";
    const labelClass = "block text-xs font-semibold text-gray-700 mb-1 uppercase";

    // Array management helpers
    const addArrayItem = (section, arrayName, defaultObj) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [arrayName]: [...prev[section][arrayName], defaultObj]
            }
        }));
    };

    const removeArrayItem = (section, arrayName, index) => {
        const newArray = [...formData[section][arrayName]];
        newArray.splice(index, 1);
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [arrayName]: newArray
            }
        }));
    };

    const addNestedArrayItem = (section, subSection, arrayName, defaultObj) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subSection]: {
                    ...prev[section][subSection],
                    [arrayName]: [...prev[section][subSection][arrayName], defaultObj]
                }
            }
        }));
    };

    const removeNestedArrayItem = (section, subSection, arrayName, index) => {
        const newArray = [...formData[section][subSection][arrayName]];
        newArray.splice(index, 1);
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subSection]: {
                    ...prev[section][subSection],
                    [arrayName]: newArray
                }
            }
        }));
    };

    return (
        <div className="bg-gray-50 min-h-screen p-6 mt-8">
            <div className="flex justify-between items-center mb-6">
                <PageHeader title="HOTEL STAY PARTNER EDITOR" description="Manage all sections of the Hotel Stay Partner page using tabs." />
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

                <form onSubmit={handleSubmit} className="p-6">
                    {/* 1. Hero Section */}
                    {activeTab === 'hero' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Hero Section Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>Hero Title</label>
                                    <textarea value={formData.hero.title} onChange={e => handleTextChange('hero', 'title', e.target.value)} className={inputClass} rows={3} />
                                </div>
                                <div>
                                    <label className={labelClass}>Subtitle</label>
                                    <input type="text" value={formData.hero.subtitle} onChange={e => handleTextChange('hero', 'subtitle', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Slogan</label>
                                    <textarea value={formData.hero.slogan} onChange={e => handleTextChange('hero', 'slogan', e.target.value)} className={inputClass} rows={3} />
                                </div>
                                <div>
                                    <label className={labelClass}>Partner Title</label>
                                    <input type="text" value={formData.hero.partnerTitle} onChange={e => handleTextChange('hero', 'partnerTitle', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Hotel Partner Label</label>
                                    <input type="text" value={formData.hero.hotelPartnerLabel} onChange={e => handleTextChange('hero', 'hotelPartnerLabel', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Hotel Partner Description</label>
                                    <textarea value={formData.hero.hotelPartnerDesc} onChange={e => handleTextChange('hero', 'hotelPartnerDesc', e.target.value)} className={inputClass} rows={3} />
                                </div>
                                <div>
                                    <label className={labelClass}>Why Partner Title</label>
                                    <textarea value={formData.hero.whyPartnerTitle} onChange={e => handleTextChange('hero', 'whyPartnerTitle', e.target.value)} className={inputClass} rows={2} />
                                </div>
                                <div>
                                    <label className={labelClass}>Official Hotel Partner Badge Text (Use Enter key for lines)</label>
                                    <textarea value={formData.hero.badgeText} onChange={e => handleTextChange('hero', 'badgeText', e.target.value)} className={inputClass} rows={3} />
                                </div>

                                <div className="md:col-span-2 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <label className={labelClass}>Background Image</label>
                                    <input type="file" accept="image/*" onChange={e => handleImageChange(e, 'hero')} className="mb-4 text-sm" />
                                    {heroImagePreview && <img src={heroImagePreview} alt="Hero Preview" className="h-40 object-cover rounded border border-gray-300" />}
                                </div>
                            </div>

                            <div className="mt-8 border-t pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-md font-bold text-gray-800">Why Partner Items</h3>
                                    <button type="button" onClick={() => addArrayItem('hero', 'whyPartnerItems', { text: '', icon: 'Check' })} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs flex items-center gap-1.5 font-bold transition-colors shadow-sm"><Plus className="w-4 h-4" /> Add Item</button>
                                </div>
                                <div className="space-y-3">
                                    {formData.hero.whyPartnerItems.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 bg-gray-50 p-3 rounded border border-gray-200 items-center">
                                            <input type="text" placeholder="Item Text" value={item.text} onChange={e => handleArrayChange('hero', 'whyPartnerItems', idx, 'text', e.target.value)} className={`${inputClass} flex-1`} />
                                            <input type="text" placeholder="Icon Name" value={item.icon} onChange={e => handleArrayChange('hero', 'whyPartnerItems', idx, 'icon', e.target.value)} className={`${inputClass} w-32`} />
                                            <button type="button" onClick={() => removeArrayItem('hero', 'whyPartnerItems', idx)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4.5 h-4.5" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. Stats Section */}
                    {activeTab === 'stats' && (
                        <div className="space-y-6">
                            <div className="pb-2 border-b flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-800">Stats Cards Configuration</h3>
                                <button type="button" onClick={() => addArrayItem('stats', null, { value: '', label: '', icon: 'Star' })} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs flex items-center gap-1.5 font-bold transition-colors shadow-sm"><Plus className="w-4 h-4" /> Add Stat Card</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {formData.stats.map((stat, idx) => (
                                    <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
                                        <button type="button" onClick={() => removeArrayItem('stats', null, idx)} className="absolute top-2 right-2 text-red-500 hover:bg-red-100 rounded p-1"><Trash2 className="w-4 h-4" /></button>
                                        <div className="space-y-3">
                                            <div>
                                                <label className={labelClass}>Value</label>
                                                <input type="text" value={stat.value} onChange={e => {
                                                    const ns = [...formData.stats];
                                                    ns[idx].value = e.target.value;
                                                    setFormData(p => ({ ...p, stats: ns }));
                                                }} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Label</label>
                                                <textarea value={stat.label} onChange={e => {
                                                    const ns = [...formData.stats];
                                                    ns[idx].label = e.target.value;
                                                    setFormData(p => ({ ...p, stats: ns }));
                                                }} className={inputClass} rows={2} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Icon Name (Lucide)</label>
                                                <input type="text" value={stat.icon} onChange={e => {
                                                    const ns = [...formData.stats];
                                                    ns[idx].icon = e.target.value;
                                                    setFormData(p => ({ ...p, stats: ns }));
                                                }} className={inputClass} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 3. Benefits Section */}
                    {activeTab === 'benefits' && (
                        <div className="space-y-8">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Benefits Sections Configuration</h3>
                            {['companyCard', 'ihweCard', 'perksCard'].map((cardType) => (
                                <div key={cardType} className="border border-gray-200 p-5 rounded-lg bg-gray-50">
                                    <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <label className={labelClass}>
                                                {cardType === 'companyCard' ? "What's in it for your company?" : cardType === 'ihweCard' ? "What's in it for IHWE 2026?" : "Partner Perks"} Card Title
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.benefits[cardType].title}
                                                onChange={e => handleNestedTextChange('benefits', cardType, 'title', e.target.value)}
                                                className={inputClass}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => addNestedArrayItem('benefits', cardType, 'items', cardType === 'perksCard' ? { label: '', icon: 'Star' } : { text: '', icon: 'Star' })}
                                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs whitespace-nowrap h-10 mt-5 flex items-center gap-1.5 font-bold transition-colors shadow-sm"
                                        >
                                            <Plus className="w-4 h-4" /> Add Benefit Item
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {formData.benefits[cardType].items.map((item, idx) => (
                                            <div key={idx} className="flex gap-3 bg-white p-3 rounded border border-gray-200 items-center">
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Benefit Text</label>
                                                    <input
                                                        type="text"
                                                        placeholder={cardType === 'perksCard' ? "Perk Label" : "Benefit Item Text"}
                                                        value={cardType === 'perksCard' ? (item.label || '') : (item.text || '')}
                                                        onChange={e => handleNestedArrayChange('benefits', cardType, 'items', idx, cardType === 'perksCard' ? 'label' : 'text', e.target.value)}
                                                        className={inputClass}
                                                    />
                                                </div>
                                                <div className="w-40">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Lucide Icon</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Icon Name"
                                                        value={item.icon || ''}
                                                        onChange={e => handleNestedArrayChange('benefits', cardType, 'items', idx, 'icon', e.target.value)}
                                                        className={inputClass}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeNestedArrayItem('benefits', cardType, 'items', idx)}
                                                    className="text-red-500 hover:bg-red-50 rounded p-2 mt-4 self-center"
                                                    title="Delete item"
                                                >
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 4. Packages Section */}
                    {activeTab === 'packages' && (
                        <div className="space-y-6">
                            <div className="pb-2 border-b flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-800">Partnership Packages Configuration</h3>
                                <button
                                    type="button"
                                    onClick={() => addArrayItem('packages', 'items', { name: '', price: '', icon: 'Star', color: '#050A1A', titleColor: '#ffffff' })}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs flex items-center gap-1.5 font-bold transition-colors shadow-sm"
                                >
                                    <Plus className="w-4 h-4" /> Add Package
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className={labelClass}>Section Title</label>
                                    <input
                                        type="text"
                                        value={formData.packages.title}
                                        onChange={e => handleTextChange('packages', 'title', e.target.value)}
                                        className={inputClass}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {formData.packages.items.map((pkg, idx) => (
                                        <div key={idx} className="p-5 border border-gray-200 rounded-lg bg-gray-50 relative">
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem('packages', 'items', idx)}
                                                className="absolute top-3 right-3 text-red-500 hover:bg-red-100 rounded p-1"
                                                title="Delete package"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className={labelClass}>Package Name</label>
                                                    <input
                                                        type="text"
                                                        value={pkg.name}
                                                        onChange={e => handleArrayChange('packages', 'items', idx, 'name', e.target.value)}
                                                        className={inputClass}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Price / Value</label>
                                                    <input
                                                        type="text"
                                                        value={pkg.price}
                                                        onChange={e => handleArrayChange('packages', 'items', idx, 'price', e.target.value)}
                                                        className={inputClass}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Icon Name (Lucide)</label>
                                                    <input
                                                        type="text"
                                                        value={pkg.icon}
                                                        onChange={e => handleArrayChange('packages', 'items', idx, 'icon', e.target.value)}
                                                        className={inputClass}
                                                    />
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <label className={labelClass}>BG Color</label>
                                                        <input
                                                            type="color"
                                                            value={pkg.color}
                                                            onChange={e => handleArrayChange('packages', 'items', idx, 'color', e.target.value)}
                                                            className="w-full h-8 cursor-pointer rounded border border-gray-300 bg-white"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className={labelClass}>Title Color</label>
                                                        <input
                                                            type="color"
                                                            value={pkg.titleColor}
                                                            onChange={e => handleArrayChange('packages', 'items', idx, 'titleColor', e.target.value)}
                                                            className="w-full h-8 cursor-pointer rounded border border-gray-300 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 border-t pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-md font-bold text-gray-800">Package Notes / Footnotes</h3>
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem('packages', 'notes', { text: '', id: `note-${Date.now()}` })}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs flex items-center gap-1.5 font-bold transition-colors shadow-sm"
                                    >
                                        <Plus className="w-4 h-4" /> Add Note
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.packages.notes.map((note, idx) => (
                                        <div key={idx} className="flex gap-3 bg-gray-50 p-3 rounded border border-gray-200 items-center">
                                            <input
                                                type="text"
                                                placeholder="Note/Footnote Text"
                                                value={note.text}
                                                onChange={e => handleArrayChange('packages', 'notes', idx, 'text', e.target.value)}
                                                className={`${inputClass} flex-1`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem('packages', 'notes', idx)}
                                                className="text-red-500 hover:bg-red-100 rounded p-2"
                                                title="Delete Note"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 5. Footer Section */}
                    {activeTab === 'footer' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Footer Section Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>Footer Title</label>
                                    <input type="text" value={formData.footer.footerTitle} onChange={e => handleTextChange('footer', 'footerTitle', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Footer Subtitle</label>
                                    <input type="text" value={formData.footer.footerSubtitle} onChange={e => handleTextChange('footer', 'footerSubtitle', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Footer Italic Text</label>
                                    <input type="text" value={formData.footer.footerItalicText} onChange={e => handleTextChange('footer', 'footerItalicText', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>CTA Title</label>
                                    <input type="text" value={formData.footer.footerGrowTitle} onChange={e => handleTextChange('footer', 'footerGrowTitle', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Contact Email</label>
                                    <input type="text" value={formData.footer.email} onChange={e => handleTextChange('footer', 'email', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Contact Phone</label>
                                    <input type="text" value={formData.footer.phone} onChange={e => handleTextChange('footer', 'phone', e.target.value)} className={inputClass} />
                                </div>

                                <div className="md:col-span-2 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <label className={labelClass}>Footer Badge Image</label>
                                    <input type="file" accept="image/*" onChange={e => handleImageChange(e, 'footer')} className="mb-4 text-sm" />
                                    {footerImagePreview && <img src={footerImagePreview} alt="Footer Preview" className="h-24 object-contain bg-[#103D1A] p-2 rounded border border-gray-300" />}
                                </div>
                            </div>

                            <div className="mt-8 border-t pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-md font-bold text-gray-800">Footer Perks List</h3>
                                    <button type="button" onClick={() => addArrayItem('footer', 'perks', { label: '', icon: 'Star' })} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs flex items-center gap-1.5 font-bold transition-colors shadow-sm"><Plus className="w-4 h-4" /> Add Perk</button>
                                </div>
                                <div className="space-y-3">
                                    {formData.footer.perks.map((perk, idx) => (
                                        <div key={idx} className="flex gap-3 bg-gray-50 p-3 rounded border border-gray-200 items-center">
                                            <input type="text" placeholder="Perk Label" value={perk.label} onChange={e => handleArrayChange('footer', 'perks', idx, 'label', e.target.value)} className={`${inputClass} flex-1`} />
                                            <input type="text" placeholder="Icon Name" value={perk.icon} onChange={e => handleArrayChange('footer', 'perks', idx, 'icon', e.target.value)} className={`${inputClass} w-32`} />
                                            <button type="button" onClick={() => removeArrayItem('footer', 'perks', idx)} className="text-red-500 hover:bg-red-50 rounded p-2"><Trash2 className="w-4.5 h-4.5" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save Changes Button Footer inside active tab form container */}
                    <div className="mt-8 pt-6 border-t flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-3 bg-[#134698] hover:bg-blue-800 text-white font-bold rounded shadow-md transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
                        >
                            {isLoading ? (
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

export default HotelStayPartnerManage;
