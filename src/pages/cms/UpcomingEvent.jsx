import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../lib/api";
import { Plus, Trash2, Edit, Save, Package } from 'lucide-react';
import PageHeader from "../../components/PageHeader";

const EMPTY_FORM = {
    dateString: '',
    fullDate: '',
    time: '',
    title: '',
    location: '',
    colorClass: 'text-blue-700 bg-blue-50',
    order: 0
};

const COLOR_OPTIONS = [
    { label: 'Blue', value: 'text-blue-700 bg-blue-50' },
    { label: 'Green', value: 'text-green-700 bg-green-50' },
    { label: 'Purple', value: 'text-purple-700 bg-purple-50' },
    { label: 'Rose (Red)', value: 'text-rose-700 bg-rose-50' },
    { label: 'Amber (Orange)', value: 'text-amber-700 bg-amber-50' },
    { label: 'Indigo', value: 'text-indigo-700 bg-indigo-50' },
    { label: 'Teal', value: 'text-teal-700 bg-teal-50' },
    { label: 'Cyan', value: 'text-cyan-700 bg-cyan-50' },
    { label: 'Fuchsia', value: 'text-fuchsia-700 bg-fuchsia-50' },
    { label: 'Slate (Gray)', value: 'text-slate-700 bg-slate-50' },
];

const UpcomingEvent = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/upcoming-events');
            if (response.data.success) {
                setEvents(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = async () => {
        if (!form.dateString || !form.fullDate || !form.title || !form.location) {
            Swal.fire('Warning', 'Date, Full Date, Title, and Location are required', 'warning');
            return;
        }
        setIsLoading(true);
        try {
            const payload = { ...form };

            let response;
            if (editingId) {
                response = await api.put(`/api/upcoming-events/${editingId}`, payload);
            } else {
                response = await api.post('/api/upcoming-events', payload);
            }

            if (response.data.success) {
                Swal.fire({ icon: 'success', title: editingId ? 'Event Updated!' : 'Event Added!', timer: 1500, showConfirmButton: false });
                resetForm();
                fetchData();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to save event', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (event) => {
        setForm({
            dateString: event.dateString,
            fullDate: event.fullDate,
            time: event.time || '',
            title: event.title,
            location: event.location,
            colorClass: event.colorClass || 'text-blue-700 bg-blue-50',
            order: event.order || 0
        });
        setEditingId(event._id);
    };

    const handleDelete = async (eventId) => {
        const result = await Swal.fire({
            title: 'Delete Event?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });
        if (!result.isConfirmed) return;
        setIsLoading(true);
        try {
            await api.delete(`/api/upcoming-events/${eventId}`);
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
            fetchData();
        } catch (error) {
            Swal.fire('Error', 'Failed to delete', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setForm({ ...EMPTY_FORM });
        setEditingId(null);
    };

    return (
        <div className="bg-white shadow-md  p-6 min-h-screen">
            <PageHeader
                title="UPCOMING EVENTS"
                description="Manage upcoming events for Exhibitor Dashboard"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                <div className="lg:col-span-1 space-y-6">
                    {/* Form */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
                            {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {editingId ? 'Edit Event' : 'Add New Event'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-tight">Short Date (e.g., 19 AUG)</label>
                                <input
                                    type="text"
                                    value={form.dateString}
                                    onChange={(e) => setForm({ ...form, dateString: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs shadow-sm bg-white"
                                    placeholder="19 AUG"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-tight">Full Date (e.g., 19 August 2026)</label>
                                <input
                                    type="text"
                                    value={form.fullDate}
                                    onChange={(e) => setForm({ ...form, fullDate: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs shadow-sm bg-white"
                                    placeholder="19 August 2026"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-tight">Time (Optional)</label>
                                <input
                                    type="text"
                                    value={form.time}
                                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs shadow-sm bg-white"
                                    placeholder="10:00 AM"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-tight">Event Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs shadow-sm bg-white"
                                    placeholder="Stall Setup Begins"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-tight">Location</label>
                                <input
                                    type="text"
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs shadow-sm bg-white"
                                    placeholder="Pragati Maidan, New Delhi"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-tight">Badge Color</label>
                                <select
                                    value={form.colorClass}
                                    onChange={(e) => setForm({ ...form, colorClass: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs shadow-sm bg-white"
                                >
                                    {COLOR_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-tight">Sort Order</label>
                                <input
                                    type="number"
                                    value={form.order}
                                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs shadow-sm bg-white"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleFormSubmit}
                                    disabled={isLoading}
                                    className={`flex-1 py-2.5 text-white font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${editingId ? 'bg-[#23471d] hover:bg-green-800' : 'bg-[#d26019] hover:bg-orange-700'}`}
                                >
                                    {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        : <>{editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {editingId ? 'Save' : 'Add Event'}</>}
                                </button>
                                {editingId && (
                                    <button onClick={resetForm} className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm">
                        <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2">
                                <Package className="w-4 h-4" /> Events List
                            </h2>
                            <span className="bg-[#d26019] text-white text-xs font-black px-3 py-1 uppercase tracking-wider">
                                {events?.length || 0} EVENTS
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-10">ORD</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">DATE</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">EVENT DETAILS</th>
                                        <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase">COLOR</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!events?.length ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-12 text-gray-400">
                                                No upcoming events found.
                                            </td>
                                        </tr>
                                    ) : events.map((event) => {
                                        const colorLabel = COLOR_OPTIONS.find(c => c.value === event.colorClass)?.label || 'Custom';
                                        return (
                                            <tr key={event._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4 text-gray-500 font-bold">{event.order}</td>
                                                <td className="py-3 px-4">
                                                    <p className="font-bold text-gray-800 text-sm whitespace-nowrap">{event.dateString}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="font-bold text-[#1a3a7c] text-sm">{event.title}</p>
                                                    <p className="text-xs text-gray-500">{event.location}</p>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${event.colorClass}`}>
                                                        {colorLabel}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => handleEdit(event)} className="text-blue-500 hover:text-blue-700 p-1 transition-colors">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button onClick={() => handleDelete(event._id)} className="text-red-500 hover:text-red-700 p-1 transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpcomingEvent;
