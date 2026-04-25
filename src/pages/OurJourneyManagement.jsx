import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import {
    Activity,
    Save,
    Plus,
    Trash2,
    Calendar,
    Target,
    Award,
    Type,
    ArrowRight
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const OurJourneyManagement = () => {
    const [data, setData] = useState({
        subtitle: 'OUR JOURNEY & FLAGSHIP EVENTS',
        mainTitle: 'A Legacy of Growth & Innovation',
        mainDescription: 'With a proven legacy of delivering result-oriented exhibitions, we forge lasting business relationships and accelerate industry growth.',
        journeyHeading: 'OUR JOURNEY: A LEGACY OF GROWTH',
        journeyItems: [],
        sectorsHeading: 'DRIVING INNOVATION ACROSS CORE SECTORS',
        sectorsItems: [],
        eventsHeading: 'FLAGSHIP EVENTS: A PROVEN TRACK RECORD',
        eventsDescription: "NGWPL's flagship events consistently deliver exceptional value and foster vibrant communities, creating significant market opportunities.",
        eventsList: []
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/our-journey');
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

    // JOURNEY HELPERS
    const addJourney = () => {
        setData(prev => ({ 
            ...prev, 
            journeyItems: [...prev.journeyItems, { year: '', text: '' }] 
        }));
    };
    const updateJourney = (idx, field, val) => {
        const items = [...data.journeyItems];
        items[idx][field] = val;
        setData(prev => ({ ...prev, journeyItems: items }));
    };
    const removeJourney = (idx) => {
        const items = [...data.journeyItems];
        items.splice(idx, 1);
        setData(prev => ({ ...prev, journeyItems: items }));
    };

    // SECTOR HELPERS
    const addSector = () => {
        setData(prev => ({ 
            ...prev, 
            sectorsItems: [...prev.sectorsItems, { label: '', text: '' }] 
        }));
    };
    const updateSector = (idx, field, val) => {
        const items = [...data.sectorsItems];
        items[idx][field] = val;
        setData(prev => ({ ...prev, sectorsItems: items }));
    };
    const removeSector = (idx) => {
        const items = [...data.sectorsItems];
        items.splice(idx, 1);
        setData(prev => ({ ...prev, sectorsItems: items }));
    };

    // EVENT HELPERS
    const addEvent = () => {
        setData(prev => ({ 
            ...prev, 
            eventsList: [...prev.eventsList, ''] 
        }));
    };
    const updateEvent = (idx, val) => {
        const list = [...data.eventsList];
        list[idx] = val;
        setData(prev => ({ ...prev, eventsList: list }));
    };
    const removeEvent = (idx) => {
        const list = [...data.eventsList];
        list.splice(idx, 1);
        setData(prev => ({ ...prev, eventsList: list }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const response = await api.post('/api/our-journey/update', data);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Journey & Events content updated successfully',
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

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-poppins text-[#1a2e1a]">
            <PageHeader
                title="OUR JOURNEY & FLAGSHIP EVENTS"
                description="Manage the journey timeline, core sectors, and flagship events lists"
            />

            <div className="space-y-8 mt-6">
                
                {/* 1. TOP HEADER SECTION */}
                <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#23471d]">
                        <Type className="w-5 h-5 text-[#d26019]" /> Main Section Header
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Subtitle</label>
                                <input
                                    type="text"
                                    value={data.subtitle}
                                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Main Heading</label>
                                <input
                                    type="text"
                                    value={data.mainTitle}
                                    onChange={(e) => handleInputChange('mainTitle', e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm font-bold"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Sub-Description (Hero Text)</label>
                            <textarea
                                value={data.mainDescription}
                                onChange={(e) => handleInputChange('mainDescription', e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm h-[115px]"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. THREE CARDS GRID */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* SECTION 1: JOURNEY */}
                    <div className="bg-[#FFFDF1] border-2 border-gray-200 p-6 shadow-sm rounded-lg flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-md font-bold flex items-center gap-2 text-[#23471d]">
                                <Calendar className="w-5 h-5 text-[#d26019]" /> 1. Journey Card
                            </h2>
                            <button onClick={addJourney} className="px-3 py-1 bg-[#23471d] text-white text-[10px] font-black rounded hover:bg-[#1a3615] uppercase tracking-widest">+ Add</button>
                        </div>
                        
                        <div className="mb-4">
                             <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase italic">Card Heading</label>
                             <input
                                 type="text"
                                 value={data.journeyHeading}
                                 onChange={(e) => handleInputChange('journeyHeading', e.target.value)}
                                 className="w-full px-3 py-1.5 border border-gray-300 focus:border-[#23471d] outline-none text-xs font-bold"
                             />
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                            {data.journeyItems.map((item, idx) => (
                                <div key={idx} className="p-3 bg-white border border-gray-200 rounded-md relative group">
                                    <button onClick={() => removeJourney(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Year (e.g. 2016)"
                                            value={item.year}
                                            onChange={(e) => updateJourney(idx, 'year', e.target.value)}
                                            className="w-full text-xs font-black text-[#d26019] outline-none border-b border-dashed border-gray-200 focus:border-[#d26019] pb-1 bg-transparent"
                                        />
                                        <textarea
                                            placeholder="Description..."
                                            value={item.text}
                                            onChange={(e) => updateJourney(idx, 'text', e.target.value)}
                                            className="w-full text-[11px] text-gray-600 outline-none h-16 resize-none bg-transparent"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 2: SECTORS */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-md font-bold flex items-center gap-2 text-[#23471d]">
                                <Target className="w-5 h-5 text-[#d26019]" /> 2. Core Sectors
                            </h2>
                            <button onClick={addSector} className="px-3 py-1 bg-[#23471d] text-white text-[10px] font-black rounded hover:bg-[#1a3615] uppercase tracking-widest">+ Add</button>
                        </div>
                        
                        <div className="mb-4">
                             <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase italic">Card Heading</label>
                             <input
                                 type="text"
                                 value={data.sectorsHeading}
                                 onChange={(e) => handleInputChange('sectorsHeading', e.target.value)}
                                 className="w-full px-3 py-1.5 border border-gray-300 focus:border-[#23471d] outline-none text-xs font-bold"
                             />
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                            {data.sectorsItems.map((item, idx) => (
                                <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-md relative group">
                                    <button onClick={() => removeSector(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Label (e.g. Digital Health)"
                                            value={item.label}
                                            onChange={(e) => updateSector(idx, 'label', e.target.value)}
                                            className="w-full text-xs font-bold text-[#23471d] outline-none border-b border-dashed border-gray-200 focus:border-[#23471d] pb-1 bg-transparent"
                                        />
                                        <textarea
                                            placeholder="Description text..."
                                            value={item.text}
                                            onChange={(e) => updateSector(idx, 'text', e.target.value)}
                                            className="w-full text-[11px] text-gray-500 outline-none h-16 resize-none bg-transparent"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 3: FLAGSHIP EVENTS */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-md font-bold flex items-center gap-2 text-[#23471d]">
                                <Award className="w-5 h-5 text-[#d26019]" /> 3. Flagship Events
                            </h2>
                            <button onClick={addEvent} className="px-3 py-1 bg-[#23471d] text-white text-[10px] font-black rounded hover:bg-[#1a3615] uppercase tracking-widest">+ Add</button>
                        </div>
                        
                        <div className="space-y-4 mb-4 bg-[#FFFDF1]/50 p-2 rounded border border-gray-100">
                             <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase italic">Card Heading</label>
                                <input
                                    type="text"
                                    value={data.eventsHeading}
                                    onChange={(e) => handleInputChange('eventsHeading', e.target.value)}
                                    className="w-full px-3 py-1.5 border border-gray-300 focus:border-[#23471d] outline-none text-xs font-bold"
                                />
                             </div>
                             <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase italic">Card Description</label>
                                <textarea
                                    value={data.eventsDescription}
                                    onChange={(e) => handleInputChange('eventsDescription', e.target.value)}
                                    className="w-full px-3 py-1.5 border border-gray-300 focus:border-[#23471d] outline-none text-[10px] h-14 resize-none"
                                />
                             </div>
                        </div>

                        <div className="space-y-2 flex-1 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                             <label className="block text-[10px] font-black text-[#d26019] mb-1 uppercase">Event List</label>
                            {data.eventsList.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 group">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#d26019] shrink-0" />
                                    <input
                                        type="text"
                                        placeholder={`Event ${idx+1}...`}
                                        value={item}
                                        onChange={(e) => updateEvent(idx, e.target.value)}
                                        className="flex-1 text-[12px] text-gray-700 outline-none border-b border-transparent focus:border-gray-200 py-1"
                                    />
                                    <button onClick={() => removeEvent(idx)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* SAVE BUTTON */}
                <div className="pt-4 max-w-sm mx-auto">
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-full py-4 bg-[#23471d] text-white font-black hover:bg-[#1a3615] transition-all flex items-center justify-center gap-3 rounded shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em]"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Save className="w-6 h-6" /> Update Journey & Events
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default OurJourneyManagement;
