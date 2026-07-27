import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Trash2, Plus, Save, FileText, Calendar, GripVertical, CheckCircle2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { API_URL } from '../lib/api';

const IconPreview = ({ iconName }) => {
    const IconComponent = Icons[iconName] || Icons.CircleDashed;
    return <IconComponent size={20} className="text-slate-500" />;
};

const PosterPresentationManage = () => {
    const [data, setData] = useState({
        guidelines: [],
        topics: [],
        importantNotes: [],
        timeline: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(`${API_URL}/poster-presentation`);
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching poster presentation data:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
            const res = await axios.put(`${API_URL}/poster-presentation`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('Poster presentation data saved successfully!');
            }
        } catch (error) {
            console.error('Error saving data:', error);
            toast.error('Failed to save data');
        }
    };

    // Arrays handlers
    const addStringItem = (field) => {
        setData({ ...data, [field]: [...data[field], ''] });
    };

    const updateStringItem = (field, index, value) => {
        const newData = [...data[field]];
        newData[index] = value;
        setData({ ...data, [field]: newData });
    };

    const removeStringItem = (field, index) => {
        const newData = data[field].filter((_, i) => i !== index);
        setData({ ...data, [field]: newData });
    };

    // Topic handlers
    const addTopic = () => {
        setData({ ...data, topics: [...data.topics, { icon: 'Lightbulb', title: '' }] });
    };

    const updateTopic = (index, field, value) => {
        const newTopics = [...data.topics];
        newTopics[index][field] = value;
        setData({ ...data, topics: newTopics });
    };

    const removeTopic = (index) => {
        const newTopics = data.topics.filter((_, i) => i !== index);
        setData({ ...data, topics: newTopics });
    };

    // Timeline handlers
    const addTimeline = () => {
        setData({ ...data, timeline: [...data.timeline, { title: '', date: '', icon: 'Calendar' }] });
    };

    const updateTimeline = (index, field, value) => {
        const newTimeline = [...data.timeline];
        newTimeline[index][field] = value;
        setData({ ...data, timeline: newTimeline });
    };

    const removeTimeline = (index) => {
        const newTimeline = data.timeline.filter((_, i) => i !== index);
        setData({ ...data, timeline: newTimeline });
    };


    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-6 w-full bg-slate-50 min-h-screen">
            <div className="space-y-4 pr-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-800">Manage Poster Presentation</h1>
                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                        <Save size={18} /> Save Changes
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Guidelines Section */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <FileText className="text-blue-600" size={20} />
                                    Submission Guidelines
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Rules and guidelines for poster submission.</p>
                            </div>
                            <button onClick={() => addStringItem('guidelines')} className="text-sm flex items-center gap-1.5 text-blue-600 font-medium px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                <Plus size={16} /> Add Guideline
                            </button>
                        </div>
                        <div className="space-y-3">
                            {data.guidelines.map((item, index) => (
                                <div key={index} className="flex gap-3 items-start group">
                                    <div className="mt-2.5 text-slate-400 cursor-grab"><GripVertical size={16} /></div>
                                    <div className="flex-1 bg-slate-50 p-2 rounded-lg border border-slate-100 focus-within:border-blue-300 focus-within:bg-white transition-all flex items-center gap-3">
                                        <div className="bg-green-100 p-1.5 rounded-full"><CheckCircle2 size={16} className="text-green-600" /></div>
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => updateStringItem('guidelines', index, e.target.value)}
                                            className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 text-sm py-1"
                                            placeholder="Enter guideline..."
                                        />
                                    </div>
                                    <button onClick={() => removeStringItem('guidelines', index)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            {data.guidelines.length === 0 && (
                                <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">No guidelines added yet.</div>
                            )}
                        </div>
                    </div>

                    {/* Important Notes Section */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <CheckCircle2 className="text-green-600" size={20} />
                                    Important Notes
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Key information for participants.</p>
                            </div>
                            <button onClick={() => addStringItem('importantNotes')} className="text-sm flex items-center gap-1.5 text-blue-600 font-medium px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                <Plus size={16} /> Add Note
                            </button>
                        </div>
                        <div className="space-y-3">
                            {data.importantNotes.map((item, index) => (
                                <div key={index} className="flex gap-3 items-start group">
                                    <div className="mt-2.5 text-slate-400 cursor-grab"><GripVertical size={16} /></div>
                                    <div className="flex-1 bg-slate-50 p-2 rounded-lg border border-slate-100 focus-within:border-blue-300 focus-within:bg-white transition-all flex items-center gap-3">
                                        <div className="bg-amber-100 p-1.5 rounded-full"><Icons.AlertCircle size={16} className="text-amber-600" /></div>
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => updateStringItem('importantNotes', index, e.target.value)}
                                            className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 text-sm py-1"
                                            placeholder="Enter important note..."
                                        />
                                    </div>
                                    <button onClick={() => removeStringItem('importantNotes', index)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            {data.importantNotes.length === 0 && (
                                <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">No notes added yet.</div>
                            )}
                        </div>
                    </div>

                    {/* Topics Section */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Icons.Lightbulb className="text-amber-500" size={20} />
                                    Presentation Topics
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Define categories for poster submissions.</p>
                            </div>
                            <button onClick={addTopic} className="text-sm flex items-center gap-1.5 text-blue-600 font-medium px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                <Plus size={16} /> Add Topic
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.topics.map((item, index) => (
                                <div key={index} className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100 focus-within:border-blue-300 focus-within:bg-white transition-all">
                                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm flex-shrink-0">
                                        <IconPreview iconName={item.icon} />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => updateTopic(index, 'title', e.target.value)}
                                            className="w-full bg-transparent border-none focus:outline-none text-slate-700 font-medium text-sm"
                                            placeholder="Topic Title (e.g. Healthcare Tech)"
                                        />
                                        <input
                                            type="text"
                                            value={item.icon}
                                            onChange={(e) => updateTopic(index, 'icon', e.target.value)}
                                            className="w-full bg-transparent border-none focus:outline-none text-slate-500 text-xs"
                                            placeholder="Lucide Icon Name (e.g. Lightbulb)"
                                        />
                                    </div>
                                    <button onClick={() => removeTopic(index)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {data.topics.length === 0 && (
                            <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl mt-4">No topics added yet.</div>
                        )}
                    </div>

                    {/* Timeline Section */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Calendar className="text-purple-600" size={20} />
                                    Timeline Events
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Manage important dates and deadlines.</p>
                            </div>
                            <button onClick={addTimeline} className="text-sm flex items-center gap-1.5 text-blue-600 font-medium px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                <Plus size={16} /> Add Event
                            </button>
                        </div>
                        <div className="space-y-4">
                            {data.timeline.map((item, index) => (
                                <div key={index} className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-100 relative group transition-all hover:shadow-md hover:border-blue-200">
                                    <div className="bg-white p-3 rounded-full border border-slate-200 shadow-sm flex-shrink-0 z-10">
                                        <IconPreview iconName={item.icon} />
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="sm:col-span-1">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Date / Range</label>
                                            <input
                                                type="text"
                                                value={item.date}
                                                onChange={(e) => updateTimeline(index, 'date', e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                                placeholder="e.g. 01 May - 30 June"
                                            />
                                        </div>
                                        <div className="sm:col-span-1">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Title</label>
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) => updateTimeline(index, 'title', e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                                placeholder="e.g. Abstract Submission"
                                            />
                                        </div>
                                        <div className="sm:col-span-1">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Lucide Icon</label>
                                            <input
                                                type="text"
                                                value={item.icon}
                                                onChange={(e) => updateTimeline(index, 'icon', e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono"
                                                placeholder="e.g. Calendar"
                                            />
                                        </div>
                                    </div>
                                    <button onClick={() => removeTimeline(index)} className="p-2.5 text-slate-400 hover:text-white hover:bg-red-500 rounded-lg transition-colors shadow-sm bg-white border border-slate-200 absolute -right-3 -top-3 opacity-0 group-hover:opacity-100">
                                        <Trash2 size={16} />
                                    </button>
                                    {index !== data.timeline.length - 1 && (
                                        <div className="absolute left-9 top-14 bottom-[-1rem] w-[2px] bg-slate-200 -z-10"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {data.timeline.length === 0 && (
                            <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl mt-4">No events added yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PosterPresentationManage;
