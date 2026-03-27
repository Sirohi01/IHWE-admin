import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import {
    Type,
    Save,
    Palette,
    BadgeHelp
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const MarqueeManage = () => {
    const [data, setData] = useState({
        text: 'Connecting Global Healthcare Innovators  •  Medical Technology  •  Wellness Solutions  •  Diagnostics  •  Pharma  •  Innovation  •  AI in Healthcare  •  ',
        bgColor: '#23471d'
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/marquee');
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching marquee data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const response = await api.post('/api/marquee', {
                text: data.text,
                bgColor: data.bgColor
            });
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Marquee updated successfully',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to update marquee', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-poppins">
            <PageHeader
                title="MARQUEE TEXT MANAGEMENT"
                description="Manage the sliding marquee text and its background color"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* Left Section: Settings and Guide */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#23471d]">
                            <Type className="w-5 h-5 text-[#d26019]" /> Marquee Settings
                        </h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Marquee Text Content</label>
                                <textarea
                                    value={data.text}
                                    onChange={(e) => setData({ ...data, text: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#23471d] outline-none h-40 text-gray-700 leading-relaxed bg-gray-50/50"
                                    placeholder="Enter marquee text here..."
                                />
                                <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1.5">
                                    <BadgeHelp size={12} className="text-[#d26019]" />
                                    Pro Tip: Use '  •  ' (dot separators) for better visibility.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-[#d26019]" /> Background Color
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={data.bgColor}
                                        onChange={(e) => setData({ ...data, bgColor: e.target.value })}
                                        className="w-12 h-10 cursor-pointer border-2 border-gray-100 rounded bg-white p-1"
                                    />
                                    <input
                                        type="text"
                                        value={data.bgColor}
                                        onChange={(e) => setData({ ...data, bgColor: e.target.value })}
                                        className="flex-1 px-4 py-2 border-2 border-gray-100 focus:border-[#23471d] outline-none font-mono text-sm uppercase bg-gray-50/50"
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="w-full py-3.5 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-all flex items-center justify-center gap-2 rounded shadow-md active:scale-95 disabled:opacity-50"
                                >
                                    <Save className="w-5 h-5" /> Save Configuration
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="p-5 bg-orange-50/30 border border-orange-100 rounded-lg text-sm text-gray-600">
                        <div className="flex items-center gap-2 mb-3">
                            <BadgeHelp size={18} className="text-[#d26019]" />
                            <p className="font-bold text-[#d26019] uppercase tracking-wide text-xs">Management Guide</p>
                        </div>
                        <ul className="space-y-2 text-[11px] font-medium text-gray-500 list-disc list-inside">
                            <li>The sliding text appears globally across the website.</li>
                            <li>A seamless infinite loop is automatically maintained.</li>
                            <li>Colors are applied instantly after saving settings.</li>
                            <li>Make sure to include space around the dot separators.</li>
                        </ul>
                    </div>
                </div>

                {/* Right Section: Live Preview */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-slate-50/50 border-2 border-dashed border-gray-200 p-8 rounded-xl min-h-[400px] flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Visual Experience Preview</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[8px] font-bold text-gray-400">SYNCED WITH DESKTOP VIEW</span>
                            </div>
                        </div>

                        <div className="flex-1 flex items-center justify-center">
                            <div className="w-full">
                                <div 
                                    className="py-5 overflow-hidden shadow-2xl border-4 border-white transform hover:scale-[1.02] transition-transform duration-500"
                                    style={{ backgroundColor: data.bgColor }}
                                >
                                    <div className="flex whitespace-nowrap">
                                        <div className="flex animate-[marquee_25s_linear_infinite]">
                                            <span className="text-white font-poppins font-medium text-base tracking-wider px-4">{data.text}</span>
                                            <span className="text-white font-poppins font-medium text-base tracking-wider px-4">{data.text}</span>
                                            <span className="text-white font-poppins font-medium text-base tracking-wider px-4">{data.text}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-center text-[10px] text-gray-400 mt-6 italic font-medium">
                                    Note: This represents the global marquee bar as it appears on your website.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
};

export default MarqueeManage;
