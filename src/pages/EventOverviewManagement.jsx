import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import {
    Type,
    Save,
    Plus,
    LayoutGrid,
    Heading,
    Quote,
    HeartPulse,
    Sprout,
    User,
    MonitorDot,
    Plane,
    Leaf,
    Stethoscope,
    Activity,
    Apple,
    MapPin,
    Hospital,
    ShieldPlus,
    Microscope,
    Trees
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import RichTextEditor from '../components/RichTextEditor';

// List of available icons for sectors
const AVAILABLE_ICONS = [
    { name: 'HeartPulse', icon: HeartPulse },
    { name: 'Sprout', icon: Sprout },
    { name: 'User', icon: User },
    { name: 'MonitorDot', icon: MonitorDot },
    { name: 'Plane', icon: Plane },
    { name: 'Leaf', icon: Leaf },
    { name: 'Stethoscope', icon: Stethoscope },
    { name: 'Activity', icon: Activity },
    { name: 'Apple', icon: Apple },
    { name: 'MapPin', icon: MapPin },
    { name: 'Hospital', icon: Hospital },
    { name: 'ShieldPlus', icon: ShieldPlus },
    { name: 'Microscope', icon: Microscope },
    { name: 'Trees', icon: Trees },
];

const EventOverviewManagement = () => {
    const [data, setData] = useState({
        subtitle: 'Event Overview',
        title: 'A Global Platform Connecting Healthcare Wellness & Business Opportunities',
        descriptionHtml: '',
        keySectorsTitle: 'Key Sectors',
        sectors: [
            { label: "Healthcare & Medical Industry", iconName: "HeartPulse", color: "#3b82f6" },
            { label: "AYUSH & Traditional Medicine", iconName: "Sprout", color: "#22c55e" },
            { label: "Wellness, Fitness & Lifestyle", iconName: "User", color: "#f59e0b" },
            { label: "Digital Health, AI & Medical Technology", iconName: "MonitorDot", color: "#8b5cf6" },
            { label: "Medical Tourism in India", iconName: "Plane", color: "#06b6d4" },
            { label: "Nutrition, Organic & Sustainable Living", iconName: "Leaf", color: "#10b981" }
        ]
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/event-overview');
            if (response.data.success && response.data.data) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const handleSectorChange = (index, field, value) => {
        const newSectors = [...data.sectors];
        newSectors[index] = { ...newSectors[index], [field]: value };
        setData(prev => ({ ...prev, sectors: newSectors }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const response = await api.post('/api/event-overview/update', data);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Event Overview content updated successfully',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to update content', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const getIconComponent = (iconName) => {
        const found = AVAILABLE_ICONS.find(item => item.name === iconName);
        return found ? found.icon : HeartPulse;
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-poppins text-[#1a2e1a]">
            <PageHeader
                title="EVENT OVERVIEW MANAGEMENT"
                description="Manage the Event Overview and Key Sectors section of your About page"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                {/* Left Side: Text Inputs */}
                <div className="space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#23471d]">
                            <Type className="w-5 h-5 text-[#d26019]" /> General Content
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Subtitle</label>
                                <input
                                    type="text"
                                    value={data.subtitle}
                                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                    placeholder="e.g. EVENT OVERVIEW"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Main Heading</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                    placeholder="e.g. A Global Platform Connecting Healthcare..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Description</label>
                                <div className="border-2 border-gray-200 rounded overflow-hidden">
                                     <RichTextEditor
                                        value={data.descriptionHtml}
                                        onChange={(val) => handleInputChange('descriptionHtml', val)}
                                        placeholder="Start writing description here..."
                                        minHeight="250px"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#23471d]">
                            <LayoutGrid className="w-5 h-5 text-[#d26019]" /> Key Sectors Heading
                        </h2>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Section Title</label>
                            <input
                                type="text"
                                value={data.keySectorsTitle}
                                onChange={(e) => handleInputChange('keySectorsTitle', e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                placeholder="e.g. KEY SECTORS"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Side: Sectors Grid */}
                <div className="space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#23471d]">
                            <Plus className="w-5 h-5 text-[#d26019]" /> Key Sectors (6 Slots)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.sectors.map((sector, idx) => {
                                const Icon = getIconComponent(sector.iconName);
                                return (
                                    <div key={idx} className="border-2 border-gray-100 p-4 rounded-lg bg-gray-50/30 space-y-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Sector Slot 0{idx + 1}</span>
                                            <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-[#d26019]">
                                                <Icon size={18} />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-tighter">Sector Label</label>
                                            <input
                                                type="text"
                                                value={sector.label}
                                                onChange={(e) => handleSectorChange(idx, 'label', e.target.value)}
                                                className="w-full px-3 py-2 border-2 border-gray-300 rounded text-xs focus:border-[#23471d] outline-none bg-white"
                                                placeholder="e.g. Healthcare & Medical"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-tighter">Icon Selector</label>
                                            <select
                                                value={sector.iconName}
                                                onChange={(e) => handleSectorChange(idx, 'iconName', e.target.value)}
                                                className="w-full px-3 py-2 border-2 border-gray-300 rounded text-xs focus:border-[#23471d] outline-none bg-white"
                                            >
                                                {AVAILABLE_ICONS.map(icon => (
                                                    <option key={icon.name} value={icon.name}>{icon.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-tighter">Icon Color (Hex)</label>
                                            <input
                                                type="color"
                                                value={sector.color}
                                                onChange={(e) => handleSectorChange(idx, 'color', e.target.value)}
                                                className="w-full h-8 px-1 py-1 border-2 border-gray-300 rounded focus:border-[#23471d] outline-none bg-white cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="w-full py-4 bg-[#23471d] text-white font-black hover:bg-[#1a3615] transition-all flex items-center justify-center gap-3 rounded shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em]"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save className="w-6 h-6" /> Save Event Overview
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventOverviewManagement;
