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
import api from "../../lib/api";
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
        packages: [],
        stateCodes: []
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

    const addItem = async (field) => {
        const { value: newItem } = await Swal.fire({
            title: `Add New Option`,
            input: 'text',
            inputPlaceholder: `Enter value for ${field}`,
            showCancelButton: true,
            confirmButtonColor: '#23471d',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Add Option',
            inputValidator: (value) => {
                if (!value || !value.trim()) {
                    return 'Please enter a value!';
                }
            }
        });

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
                benefits: ['New Benefit'],
                hsnSacCode: '998596',
                gstPercentage: 18
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
        <div className="bg-white border border-slate-200 rounded shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white rounded shadow-sm">
                        <Icon className="w-4 h-4 text-[#23471d]" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight">{title}</h3>
                    </div>
                </div>
                <button
                    onClick={() => addItem(field)}
                    className="p-1 hover:bg-[#23471d] hover:text-white rounded transition-colors text-slate-400"
                    title="Add Option"
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>
            <div className="p-2 flex-1 overflow-y-auto max-h-[250px] custom-scrollbar">
                <div className="space-y-1">
                    {config[field].map((item, index) => (
                        <div key={index} className="flex items-center gap-2 group p-1.5 hover:bg-slate-50 rounded transition-colors border border-transparent hover:border-slate-100">
                            <span className="text-[9px] font-bold text-slate-300 w-3">{index + 1}</span>
                            <input
                                value={item}
                                onChange={(e) => {
                                    const newList = [...config[field]];
                                    newList[index] = e.target.value;
                                    setConfig(prev => ({ ...prev, [field]: newList }));
                                }}
                                className="flex-1 text-[11px] font-semibold text-slate-600 bg-transparent border-none focus:ring-0 p-0"
                            />
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => moveItem(field, index, -1)} disabled={index === 0} className="p-1 text-slate-400 hover:text-[#23471d] disabled:opacity-0"><ChevronUp size={12} /></button>
                                <button onClick={() => moveItem(field, index, 1)} disabled={index === config[field].length - 1} className="p-1 text-slate-400 hover:text-[#23471d] disabled:opacity-0"><ChevronDown size={12} /></button>
                                <button onClick={() => removeItem(field, index)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                            </div>
                        </div>
                    ))}
                    {config[field].length === 0 && (
                        <p className="text-[10px] text-slate-400 italic text-center py-4 uppercase font-bold tracking-widest">No options added</p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-[#f8fafc] min-h-[calc(100vh-60px)] font-inter pb-10">
            <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-50 shadow-sm">
                <div>
                    <h1 className="text-lg font-bold text-slate-800 uppercase tracking-tight">International Buyer Config</h1>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">Manage Form Options & Packages for INTL Buyers</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#23471d] hover:bg-[#1a3516] text-white px-5 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Configuration
                </button>
            </div>

            <div className="max-w-[1400px] mx-auto p-4">
                <div className="flex gap-4 mb-4 border-b border-slate-200 pb-px font-inter">
                    <button
                        onClick={() => setActiveTab('dropdowns')}
                        className={`pb-2 px-1 text-[11px] font-bold uppercase tracking-widest transition-all relative ${activeTab === 'dropdowns' ? 'text-[#23471d]' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Form Dropdowns
                        {activeTab === 'dropdowns' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#23471d]" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('packages')}
                        className={`pb-2 px-1 text-[11px] font-bold uppercase tracking-widest transition-all relative ${activeTab === 'packages' ? 'text-[#23471d]' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Registration Packages
                        {activeTab === 'packages' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#23471d]" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('states')}
                        className={`pb-2 px-1 text-[11px] font-bold uppercase tracking-widest transition-all relative ${activeTab === 'states' ? 'text-[#23471d]' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        State Codes Mapping
                        {activeTab === 'states' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#23471d]" />}
                    </button>
                </div>

                {activeTab === 'dropdowns' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fadeIn">
                        <ArrayEditor title="Business Types" field="companyTypes" icon={Layout} />
                        <ArrayEditor title="Turnover Ranges" field="annualTurnoverRanges" icon={CheckCircle} />
                        <ArrayEditor title="Global Regions" field="regions" icon={Globe} />
                        <ArrayEditor title="Supplier Types" field="supplierTypes" icon={ListFilter} />
                        <ArrayEditor title="Purchase Timelines" field="purchaseTimelines" icon={ChevronRight} />
                        <ArrayEditor title="Decision Roles" field="roles" icon={Settings} />
                        <ArrayEditor title="Secondary Categories" field="secondaryProductCategories" icon={Package} />
                        <ArrayEditor title="Buying Frequencies" field="buyingFrequencies" icon={Clock} />
                        <ArrayEditor title="Annual Purchase Value" field="annualPurchaseValueRanges" icon={Briefcase} />
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
                ) : activeTab === 'states' ? (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 uppercase">State Codes Mapping</h2>
                                <p className="text-xs text-slate-400">Map state names to their official GST state codes</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setConfig(prev => ({
                                        ...prev,
                                        stateCodes: [...(prev.stateCodes || []), { name: '', code: '' }]
                                    }));
                                }}
                                className="bg-[#23471d]/10 text-[#23471d] hover:bg-[#23471d] hover:text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border border-[#23471d]/20 flex items-center gap-2"
                            >
                                <Plus className="w-3 h-3" /> Add State Mapping
                            </button>
                        </div>
                        
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">State Name</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">State Code</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 w-20">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(config.stateCodes || []).map((sc, index) => (
                                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-3">
                                                <input 
                                                    value={sc.name} 
                                                    onChange={(e) => {
                                                        const newCodes = [...config.stateCodes];
                                                        newCodes[index].name = e.target.value;
                                                        setConfig(prev => ({ ...prev, stateCodes: newCodes }));
                                                    }}
                                                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-xs font-semibold text-slate-600"
                                                    placeholder="e.g. Maharashtra"
                                                />
                                            </td>
                                            <td className="px-6 py-3">
                                                <input 
                                                    value={sc.code} 
                                                    onChange={(e) => {
                                                        const newCodes = [...config.stateCodes];
                                                        newCodes[index].code = e.target.value;
                                                        setConfig(prev => ({ ...prev, stateCodes: newCodes }));
                                                    }}
                                                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-xs font-semibold text-slate-600"
                                                    placeholder="e.g. 27"
                                                />
                                            </td>
                                            <td className="px-6 py-3">
                                                <button 
                                                    onClick={() => {
                                                        const newCodes = config.stateCodes.filter((_, i) => i !== index);
                                                        setConfig(prev => ({ ...prev, stateCodes: newCodes }));
                                                    }}
                                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(config.stateCodes || []).length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-10 text-center text-xs text-slate-400 italic">
                                                No state mappings added yet. Click "Add State Mapping" to begin.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h2 className="text-sm font-bold text-slate-800 uppercase">Registration Packages</h2>
                                <p className="text-[10px] text-slate-500">Define pricing and benefits for international buyers</p>
                            </div>
                            <button
                                onClick={addPackage}
                                className="bg-[#23471d] text-white hover:bg-[#1a3516] px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center gap-1.5"
                            >
                                <Plus className="w-3 h-3" /> Add Package
                            </button>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {config.packages.map((pkg, pIndex) => (
                                <div key={pIndex} className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
                                    <div className="p-4 bg-[#23471d] text-white flex justify-between items-start">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    value={pkg.name}
                                                    onChange={(e) => updatePackage(pIndex, 'name', e.target.value)}
                                                    className="bg-transparent border-none focus:ring-0 p-0 text-base font-bold w-full placeholder:text-white/50"
                                                    placeholder="Package Name"
                                                />
                                                <select
                                                    value={pkg.category}
                                                    onChange={(e) => updatePackage(pIndex, 'category', e.target.value)}
                                                    className="bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest outline-none"
                                                >
                                                    <option value="Pass" className="text-slate-800">Pass</option>
                                                    <option value="Membership" className="text-slate-800">Membership</option>
                                                </select>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <span className="text-lg font-black italic">$</span>
                                                <input
                                                    type="number"
                                                    value={pkg.price}
                                                    onChange={(e) => updatePackage(pIndex, 'price', parseInt(e.target.value))}
                                                    className="bg-transparent border-none focus:ring-0 p-0 text-xl font-black w-24 placeholder:text-white/50"
                                                />
                                                <select
                                                    value={pkg.color}
                                                    onChange={(e) => updatePackage(pIndex, 'color', e.target.value)}
                                                    className="bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest outline-none ml-auto"
                                                >
                                                    <option value="blue" className="text-slate-800">Blue Theme</option>
                                                    <option value="yellow" className="text-slate-800">Yellow Theme</option>
                                                    <option value="green" className="text-slate-800">Green Theme</option>
                                                    <option value="red" className="text-slate-800">Red Theme</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button onClick={() => removePackage(pIndex)} className="p-1.5 hover:bg-white/20 rounded text-white/60 hover:text-white transition-colors ml-3"><Trash2 size={14} /></button>
                                    </div>

                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 flex-1">
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-0.5">Tagline</label>
                                                <input
                                                    value={pkg.tagline || ''}
                                                    onChange={(e) => updatePackage(pIndex, 'tagline', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-[11px] font-semibold text-slate-600 focus:ring-1 focus:ring-[#23471d] outline-none"
                                                    placeholder="e.g. For Serious Buyers"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-0.5">Description</label>
                                                <textarea
                                                    value={pkg.description || ''}
                                                    onChange={(e) => updatePackage(pIndex, 'description', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-[11px] font-medium text-slate-600 focus:ring-1 focus:ring-[#23471d] outline-none min-h-[60px]"
                                                    placeholder="Brief package description..."
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-0.5">Why Choose This?</label>
                                                <textarea
                                                    value={pkg.whyChoose || ''}
                                                    onChange={(e) => updatePackage(pIndex, 'whyChoose', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-[11px] font-medium text-slate-600 focus:ring-1 focus:ring-[#23471d] outline-none min-h-[50px]"
                                                    placeholder="Reason to select this package..."
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-0.5">Badge</label>
                                                    <input
                                                        value={pkg.badge || ''}
                                                        onChange={(e) => updatePackage(pIndex, 'badge', e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-[11px] font-semibold text-slate-600 focus:ring-1 focus:ring-[#23471d] outline-none"
                                                        placeholder="e.g. Recommended"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-0.5">CTA Text</label>
                                                    <input
                                                        value={pkg.cta || ''}
                                                        onChange={(e) => updatePackage(pIndex, 'cta', e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-[11px] font-semibold text-slate-600 focus:ring-1 focus:ring-[#23471d] outline-none"
                                                        placeholder="e.g. Register Now"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-0.5">HSN/SAC Code</label>
                                                    <input 
                                                        value={pkg.hsnSacCode || ''} 
                                                        onChange={(e) => updatePackage(pIndex, 'hsnSacCode', e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-[11px] font-semibold text-slate-600 focus:ring-1 focus:ring-[#23471d] outline-none"
                                                        placeholder="e.g. 998596"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-0.5">GST %</label>
                                                    <input 
                                                        type="number"
                                                        value={pkg.gstPercentage || 0} 
                                                        onChange={(e) => updatePackage(pIndex, 'gstPercentage', parseInt(e.target.value))}
                                                        className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-[11px] font-semibold text-slate-600 focus:ring-1 focus:ring-[#23471d] outline-none"
                                                        placeholder="e.g. 18"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2 border-b border-slate-200 pb-1.5">
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
                                                            className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-[10px] font-medium text-slate-600 resize-none min-h-[30px]"
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
