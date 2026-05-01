import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import {
    Save,
    Type,
    Target,
    Milestone,
    Palette,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import PageHeader from '../components/PageHeader';
import RichTextEditor from '../components/RichTextEditor';

const AVAILABLE_ICONS = [
    'Target', 'Milestone', 'Award', 'Globe', 'Users', 'Zap',
    'Heart', 'Shield', 'Smile', 'Sun', 'Star', 'Compass',
    'Activity', 'Apple', 'Stethoscope', 'GraduationCap'
];

const VisionMission = () => {
    const [data, setData] = useState({
        mission: {
            title: 'Our Mission',
            icon: 'Target',
            description: '"To create awareness about preventive healthcare, encourage the adoption of holistic wellness practices, and connect stakeholders from AYUSH, modern medicine, nutrition, and wellness technologies."',
            highlightText: 'AYUSH'
        },
        vision: {
            title: 'Our Vision',
            icon: 'Milestone',
            description: '"To empower every individual with the knowledge of preventive healthcare and the tools for a sustainable, healthy future — bridging traditional wisdom with modern innovation globally."',
            highlightText: 'sustainable, healthy future'
        },
        backgroundColor: '#23471d'
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/vision-mission');
            if (response.data.success && response.data.data) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMissionChange = (field, value) => {
        setData(prev => ({
            ...prev,
            mission: { ...prev.mission, [field]: value }
        }));
    };

    const handleVisionChange = (field, value) => {
        setData(prev => ({
            ...prev,
            vision: { ...prev.vision, [field]: value }
        }));
    };

    const handleInputChange = (field, value) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const response = await api.post('/api/vision-mission/update', data);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Vision & Mission updated successfully',
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

    const IconDropdown = ({ value, onChange }) => {
        return (
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm appearance-none bg-white"
                >
                    {AVAILABLE_ICONS.map(iconName => (
                        <option key={iconName} value={iconName}>{iconName}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {(() => {
                        const Icon = LucideIcons[value] || LucideIcons.HelpCircle;
                        return <Icon size={18} className="text-[#d26019]" />;
                    })()}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="relative w-full h-64 overflow-hidden rounded mt-8">
                {/* Background Image */}
                <img
                    src="/home.png"
                    alt="banner"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />

                {/* Halka dark overlay */}
                <div className="absolute inset-0 bg-black/40 z-[1]" />

                {/* Dot grid */}
                <div className="absolute inset-0 opacity-[0.05] z-[2]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '28px 28px'
                    }}
                />

                {/* Orange left accent bar */}
                <div className="absolute left-0 top-6 bottom-6 w-1 rounded-full bg-gradient-to-b from-[#d26019]/0 via-[#d26019] to-[#d26019]/0 z-[2]" />

                {/* Content */}
                <div className="relative z-10 h-full flex items-center justify-between px-10">

                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#d26019] animate-pulse" />
                            <p className="text-sm font-bold text-slate-200 uppercase tracking-[0.20em]">
                                Admin Panel · System · CMS
                            </p>
                        </div>
                        <h1 className="text-3xl font-semibold text-white leading-tight tracking-tight mb-1">
                            OUR VISION & MISSION MANAGEMENT
                        </h1>
                        <p className="text-lg font-medium text-slate-200">
                            Manage the vision and mission statements of your organization
                        </p>
                    </div>

                    <div className="hidden md:flex flex-col items-end gap-3">
                        {/* Online badge */}
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">System Online</span>
                        </div>

                        {/* Date */}
                        <div className="px-4 py-2 rounded-xl bg-[#d26019]/20 border border-[#d26019]/20">
                            <p className="text-[10px] font-black text-[#d26019] uppercase tracking-widest">
                                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            <div className="bg-white shadow-md p-6 min-h-screen font-poppins text-gray-800">
                {/* <PageHeader
                title="OUR VISION & MISSION MANAGEMENT"
                description="Manage the mission and vision statements of your organization"
            /> */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">

                    {/* MISSION SECTION */}
                    <div className="space-y-6">
                        <div className="bg-white border-2 border-gray-200 p-6 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#23471d]/5 rounded-bl-full flex items-start justify-end p-2">
                                <Target size={20} className="text-[#23471d]/20" />
                            </div>

                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#23471d]">
                                <Type className="w-5 h-5 text-[#d26019]" /> Our Mission
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-tight">Mission Title</label>
                                    <input
                                        type="text"
                                        value={data.mission.title}
                                        onChange={(e) => handleMissionChange('title', e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm font-semibold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-tight">Select Icon</label>
                                    <IconDropdown
                                        value={data.mission.icon}
                                        onChange={(val) => handleMissionChange('icon', val)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-tight">Mission Description</label>
                                    <div className="border-2 border-gray-200 rounded overflow-hidden">
                                        <RichTextEditor
                                            key="mission-desc"
                                            value={data.mission.description}
                                            onChange={(val) => handleMissionChange('description', val)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-tight text-[#d26019]">Highlight Text (Orange)</label>
                                    <input
                                        type="text"
                                        value={data.mission.highlightText}
                                        onChange={(e) => handleMissionChange('highlightText', e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-[#d26019] focus:border-[#23471d] outline-none shadow-sm"
                                        placeholder="Word(s) to highlight in orange..."
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1 italic">* This word will appear in orange color across the website</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* VISION SECTION */}
                    <div className="space-y-6">
                        <div className="bg-white border-2 border-gray-200 p-6 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#23471d]/5 rounded-bl-full flex items-start justify-end p-2">
                                <Milestone size={20} className="text-[#23471d]/20" />
                            </div>

                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#23471d]">
                                <Type className="w-5 h-5 text-[#d26019]" /> Our Vision
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-tight">Vision Title</label>
                                    <input
                                        type="text"
                                        value={data.vision.title}
                                        onChange={(e) => handleVisionChange('title', e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm font-semibold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-tight">Select Icon</label>
                                    <IconDropdown
                                        value={data.vision.icon}
                                        onChange={(val) => handleVisionChange('icon', val)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-tight">Vision Description</label>
                                    <div className="border-2 border-gray-200 rounded overflow-hidden">
                                        <RichTextEditor
                                            key="vision-desc"
                                            value={data.vision.description}
                                            onChange={(val) => handleVisionChange('description', val)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-tight text-[#d26019]">Highlight Text (Orange)</label>
                                    <input
                                        type="text"
                                        value={data.vision.highlightText}
                                        onChange={(e) => handleVisionChange('highlightText', e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-[#d26019] focus:border-[#23471d] outline-none shadow-sm"
                                        placeholder="Word(s) to highlight in orange..."
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1 italic">* This word will appear in orange color across the website</p>
                                </div>
                            </div>
                        </div>

                        {/* SETTINGS CARD */}
                        <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#23471d]">
                                <Palette className="w-5 h-5 text-[#d26019]" /> Appearance Settings
                            </h2>

                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-tight">Background Color</label>
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 rounded shadow-inner border border-gray-200"
                                            style={{ backgroundColor: data.backgroundColor }}
                                        ></div>
                                        <input
                                            type="color"
                                            value={data.backgroundColor}
                                            onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                                            className="w-12 h-12 border-none p-0 bg-transparent cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={data.backgroundColor}
                                            onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                                            className="flex-1 px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm font-mono uppercase text-sm"
                                            placeholder="#23471d"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="w-full py-4 bg-[#23471d] text-white font-black hover:bg-[#1a3615] transition-all flex items-center justify-center gap-3 rounded shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em]"
                                >
                                    {isLoading ? (
                                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Save className="w-6 h-6" /> Save All Settings
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VisionMission;
