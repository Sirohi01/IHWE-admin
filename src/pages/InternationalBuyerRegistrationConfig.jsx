import { useState, useEffect } from 'react';
import { 
    Save, 
    Plus, 
    Trash2, 
    ChevronRight,
    ChevronUp,
    ChevronDown,
    Layout, 
    Package, 
    ListFilter, 
    Settings, 
    Loader2, 
    CheckCircle, 
    AlertCircle,
    Globe,
    Clock,
    Briefcase,
    Target,
    Award,
    Tags,
    Users
} from 'lucide-react';
import api from '../lib/api';
import Swal from 'sweetalert2';

const InternationalBuyerRegistrationConfig = () => {
    const [config, setConfig] = useState({
        companyTypes: [],
        annualTurnoverRanges: [],
        regions: [],
        supplierTypes: [],
        purchaseTimelines: [],
        roles: [],
        secondaryProductCategories: [],
        buyingFrequencies: [],
        annualPurchaseValueRanges: [],
        primaryProductInterests: [],
        budgetRanges: [],
        companySizes: [],
        certificationOptions: [],
        businessModelOptions: [],
        meetingCategoryOptions: [],
        meetingDayOptions: [],
        exhibitorTypeOptions: [],
        meetingObjectiveOptions: [],
        preferredBusinessTypeOptions: [],
        packages: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('dropdowns');

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/api/international-buyer/config');
            if (res.data.success) {
                // Ensure all expected fields exist in the state
                const fetchedData = res.data.data;
                setConfig(prev => ({
                    ...prev,
                    ...fetchedData
                }));
            }
        } catch (error) {
            console.error('Error fetching config:', error);
            Swal.fire({
                icon: 'error',
                title: 'Data Fetch Error',
                text: 'Could not load international buyer configuration settings.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await api.put('/api/international-buyer/config', config);
            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Saved Successfully',
                    text: 'International configuration has been updated.',
                    confirmButtonColor: '#23471d'
                });
            }
        } catch (error) {
            console.error('Error saving config:', error);
            Swal.fire({
                icon: 'error',
                title: 'Save Error',
                text: 'Failed to update international configuration.'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const addItem = (field) => {
        const newItem = prompt(`Enter new value for ${field}:`);
        if (newItem && newItem.trim()) {
            setConfig(prev => ({
                ...prev,
                [field]: [...(prev[field] || []), newItem.trim()]
            }));
        }
    };

    const removeItem = (field, index) => {
        setConfig(prev => ({
            ...prev,
            [field]: (prev[field] || []).filter((_, i) => i !== index)
        }));
    };

    const moveItem = (field, index, direction) => {
        const newList = [...(config[field] || [])];
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < newList.length) {
            [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
            setConfig(prev => ({ ...prev, [field]: newList }));
        }
    };

    const addPackage = () => {
        setConfig(prev => ({
            ...prev,
            packages: [...(prev.packages || []), { 
                name: 'New Package', 
                price: 0, 
                category: 'Pass',
                tagline: '',
                description: '',
                whyChoose: '',
                badge: '',
                cta: 'Select',
                color: 'blue',
                benefits: ['New Benefit'] 
            }]
        }));
    };

    const removePackage = (index) => {
        setConfig(prev => ({
            ...prev,
            packages: prev.packages.filter((_, i) => i !== index)
        }));
    };

    const updatePackage = (index, field, value) => {
        const newPackages = [...config.packages];
        newPackages[index] = { ...newPackages[index], [field]: value };
        setConfig(prev => ({ ...prev, packages: newPackages }));
    };

    const addBenefit = (pkgIndex) => {
        const newPackages = [...config.packages];
        newPackages[pkgIndex] = {
            ...newPackages[pkgIndex],
            benefits: [...(newPackages[pkgIndex].benefits || []), 'New Benefit']
        };
        setConfig(prev => ({ ...prev, packages: newPackages }));
    };

    const updateBenefit = (pkgIndex, benefitIndex, value) => {
        const newPackages = [...config.packages];
        const newBenefits = [...(newPackages[pkgIndex].benefits || [])];
        newBenefits[benefitIndex] = value;
        newPackages[pkgIndex] = {
            ...newPackages[pkgIndex],
            benefits: newBenefits
        };
        setConfig(prev => ({ ...prev, packages: newPackages }));
    };

    const removeBenefit = (pkgIndex, benefitIndex) => {
        const newPackages = [...config.packages];
        newPackages[pkgIndex] = {
            ...newPackages[pkgIndex],
            benefits: (newPackages[pkgIndex].benefits || []).filter((_, i) => i !== benefitIndex)
        };
        setConfig(prev => ({ ...prev, packages: newPackages }));
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#23471d]" />
            </div>
        );
    }

    const ArrayEditor = ({ title, field, icon: Icon }) => (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Icon className="w-5 h-5 text-[#23471d]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{title}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">Dropdown Options</p>
                    </div>
                </div>
                <button 
                    onClick={() => addItem(field)}
                    className="p-1.5 hover:bg-[#23471d] hover:text-white rounded-md transition-colors text-slate-400"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
            <div className="p-5">
                <div className="space-y-1">
                    {config[field].map((item, index) => (
                        <div key={index} className="flex items-center gap-2 group p-2 hover:bg-slate-50 rounded-md transition-colors border border-transparent hover:border-slate-100">
                            <span className="text-[10px] font-bold text-slate-300 w-4">{(index + 1).toString().padStart(2, '0')}</span>
                            <input 
                                value={item} 
                                onChange={(e) => {
                                    const newList = [...config[field]];
                                    newList[index] = e.target.value;
                                    setConfig(prev => ({ ...prev, [field]: newList }));
                                }}
                                className="flex-1 text-xs font-semibold text-slate-600 bg-transparent border-none focus:ring-0 p-0"
                            />
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => moveItem(field, index, -1)} disabled={index === 0} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-0"><ChevronUp size={12} /></button>
                                <button onClick={() => moveItem(field, index, 1)} disabled={index === config[field].length - 1} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-0"><ChevronDown size={12} /></button>
                                <button onClick={() => removeItem(field, index)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                            </div>
                        </div>
                    ))}
                    {config[field].length === 0 && (
                        <p className="text-[11px] text-slate-400 italic text-center py-4 uppercase font-bold tracking-widest">No options added</p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white min-h-screen font-inter pb-20">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-50 shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 uppercase tracking-tight">International Buyer Config</h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-0.5">Manage Form Options & Packages for INTL Buyers</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#23471d] hover:bg-[#1a3516] text-white px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Configuration
                </button>
            </div>

            <div className="max-w-[1400px] mx-auto p-8">
                <div className="flex gap-4 mb-10 border-b border-slate-100 pb-px font-inter">
                    <button 
                        onClick={() => setActiveTab('dropdowns')}
                        className={`pb-4 px-2 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'dropdowns' ? 'text-[#23471d]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Form Dropdowns
                        {activeTab === 'dropdowns' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#23471d]" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab('packages')}
                        className={`pb-4 px-2 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'packages' ? 'text-[#23471d]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Registration Packages
                        {activeTab === 'packages' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#23471d]" />}
                    </button>
                </div>

                {activeTab === 'dropdowns' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
                        <ArrayEditor title="Business Types" field="companyTypes" icon={Layout} />
                        <ArrayEditor title="Turnover Ranges" field="annualTurnoverRanges" icon={CheckCircle} />
                        <ArrayEditor title="Global Regions" field="regions" icon={Globe} />
                        <ArrayEditor title="Supplier Types" field="supplierTypes" icon={ListFilter} />
                        <ArrayEditor title="Purchase Timelines" field="purchaseTimelines" icon={ChevronRight} />
                        <ArrayEditor title="Decision Roles" field="roles" icon={Settings} />
                        <ArrayEditor title="Secondary Categories" field="secondaryProductCategories" icon={Package} />
                        <ArrayEditor title="Buying Frequencies" field="buyingFrequencies" icon={Clock} />
                        <ArrayEditor title="Annual Purchase Value Ranges" field="annualPurchaseValueRanges" icon={Briefcase} />
                        <ArrayEditor title="Primary Product Interests" field="primaryProductInterests" icon={Target} />
                        <ArrayEditor title="Budget Ranges" field="budgetRanges" icon={Tags} />
                        <ArrayEditor title="Company Size Options" field="companySizes" icon={Users} />
                        <ArrayEditor title="Certification Options" field="certificationOptions" icon={Award} />
                        <ArrayEditor title="Business Models" field="businessModelOptions" icon={Briefcase} />
                        <ArrayEditor title="Meeting Categories" field="meetingCategoryOptions" icon={Target} />
                        <ArrayEditor title="Exhibitor Types" field="exhibitorTypeOptions" icon={Package} />
                        <ArrayEditor title="Meeting Objectives" field="meetingObjectiveOptions" icon={Briefcase} />
                        <ArrayEditor title="Preferred Business Types" field="preferredBusinessTypeOptions" icon={Briefcase} />
                        <ArrayEditor title="Meeting Day Options" field="meetingDayOptions" icon={Clock} />
                    </div>
                ) : (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 uppercase">Registration Packages</h2>
                                <p className="text-xs text-slate-400">Define pricing and benefits for international buyers</p>
                            </div>
                            <button 
                                onClick={addPackage}
                                className="bg-[#23471d]/10 text-[#23471d] hover:bg-[#23471d] hover:text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border border-[#23471d]/20 flex items-center gap-2"
                            >
                                <Plus className="w-3 h-3" /> Add Package
                            </button>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {config.packages.map((pkg, pIndex) => (
                                <div key={pIndex} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col">
                                    <div className="p-6 bg-[#23471d] text-white flex justify-between items-start">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <input 
                                                    value={pkg.name} 
                                                    onChange={(e) => updatePackage(pIndex, 'name', e.target.value)}
                                                    className="bg-transparent border-none focus:ring-0 p-0 text-lg font-bold w-full placeholder:text-white/50"
                                                    placeholder="Package Name"
                                                />
                                                <select 
                                                    value={pkg.category} 
                                                    onChange={(e) => updatePackage(pIndex, 'category', e.target.value)}
                                                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-widest outline-none"
                                                >
                                                    <option value="Pass" className="text-slate-800">Pass</option>
                                                    <option value="Membership" className="text-slate-800">Membership</option>
                                                </select>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-black italic">₹</span>
                                                <input 
                                                    type="number"
                                                    value={pkg.price} 
                                                    onChange={(e) => updatePackage(pIndex, 'price', parseInt(e.target.value))}
                                                    className="bg-transparent border-none focus:ring-0 p-0 text-3xl font-black w-32 placeholder:text-white/50"
                                                />
                                                <select 
                                                    value={pkg.color} 
                                                    onChange={(e) => updatePackage(pIndex, 'color', e.target.value)}
                                                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-widest outline-none ml-auto"
                                                >
                                                    <option value="blue" className="text-slate-800">Blue Theme</option>
                                                    <option value="yellow" className="text-slate-800">Yellow Theme</option>
                                                    <option value="green" className="text-slate-800">Green Theme</option>
                                                    <option value="red" className="text-slate-800">Red Theme</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button onClick={() => removePackage(pIndex)} className="p-2 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-colors ml-4"><Trash2 size={16} /></button>
                                    </div>
                                    
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/30 flex-1">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Tagline</label>
                                                <input 
                                                    value={pkg.tagline || ''} 
                                                    onChange={(e) => updatePackage(pIndex, 'tagline', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs font-semibold text-slate-600 focus:ring-1 focus:ring-[#23471d] outline-none"
                                                    placeholder="e.g. For Serious Buyers"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Description</label>
                                                <textarea 
                                                    value={pkg.description || ''} 
                                                    onChange={(e) => updatePackage(pIndex, 'description', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs font-medium text-slate-600 focus:ring-1 focus:ring-[#23471d] outline-none min-h-[80px]"
                                                    placeholder="Brief package description..."
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Why Choose This?</label>
                                                <textarea 
                                                    value={pkg.whyChoose || ''} 
                                                    onChange={(e) => updatePackage(pIndex, 'whyChoose', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs font-medium text-slate-600 focus:ring-1 focus:ring-[#23471d] outline-none min-h-[60px]"
                                                    placeholder="Reason to select this package..."
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Badge</label>
                                                    <input 
                                                        value={pkg.badge || ''} 
                                                        onChange={(e) => updatePackage(pIndex, 'badge', e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs font-semibold text-slate-600 focus:ring-1 focus:ring-[#23471d] outline-none"
                                                        placeholder="e.g. Recommended"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">CTA Text</label>
                                                    <input 
                                                        value={pkg.cta || ''} 
                                                        onChange={(e) => updatePackage(pIndex, 'cta', e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs font-semibold text-slate-600 focus:ring-1 focus:ring-[#23471d] outline-none"
                                                        placeholder="e.g. Register Now"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-2">
                                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#23471d]">Package Benefits</h4>
                                                <button onClick={() => addBenefit(pIndex)} className="text-[#23471d] hover:text-[#1a3516] flex items-center gap-1 text-[10px] font-bold">
                                                    <Plus size={12} /> ADD
                                                </button>
                                            </div>
                                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                {pkg.benefits.map((benefit, bIndex) => (
                                                    <div key={bIndex} className="flex items-start gap-2 group/benefit bg-white p-2 rounded border border-slate-100 shadow-sm">
                                                        <CheckCircle size={14} className="text-emerald-500 mt-1 shrink-0" />
                                                        <textarea 
                                                            value={benefit}
                                                            onChange={(e) => updateBenefit(pIndex, bIndex, e.target.value)}
                                                            className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-[11px] font-medium text-slate-600 resize-none min-h-[40px]"
                                                        />
                                                        <button onClick={() => removeBenefit(pIndex, bIndex)} className="opacity-0 group-benefit-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={12} /></button>
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
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default InternationalBuyerRegistrationConfig;
