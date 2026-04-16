import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import { Plus, Trash2, Edit, Calendar, MapPin, Percent, Info, Search } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { createActivityLogThunk } from '../features/activityLog/activityLogSlice';
import PageHeader from '../components/PageHeader';

const EMPTY_EVENT = {
    name: '',
    startDate: '',
    endDate: '',
    location: '',
    onlineAdvancePercentage: 50,
    manualAdvancePercentage: 50,
    status: 'active',
    ticketsStatus: 'Few Remaining',
    speakersCount: '100+',
    description: '',
    contactPhone: '',
    order: 1
};

const ManageEvents = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [eventForm, setEventForm] = useState({ ...EMPTY_EVENT });
    const [isEditing, setIsEditing] = useState(null);
    const dispatch = useDispatch();

    const getUserInfo = () => {
        const userStr = sessionStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : {};
        const userId = sessionStorage.getItem("user_id") || user._id;
        const userName = user.name || "User";
        return { userId, userName };
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/events');
            if (response.data.success) {
                setEvents(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let response;
            if (isEditing) {
                response = await api.put(`/api/events/${isEditing}`, eventForm);
            } else {
                response = await api.post('/api/events', eventForm);
            }

            if (response.data.success) {
                const { userId, userName } = getUserInfo();
                if (userId) {
                    dispatch(createActivityLogThunk({
                        user_id: userId,
                        message: `Event: ${isEditing ? 'Updated' : 'Created'} event '${eventForm.name}' by ${userName}`,
                        section: "Event Schedule",
                        data: {
                            action: isEditing ? "UPDATE" : "CREATE",
                            event_id: isEditing || response.data.data?._id,
                            event_name: eventForm.name,
                            details: eventForm
                        }
                    }));
                }

                Swal.fire({
                    icon: 'success',
                    title: isEditing ? 'Event Updated!' : 'Event Created!',
                    timer: 1500,
                    showConfirmButton: false
                });
                setEventForm({ ...EMPTY_EVENT });
                setIsEditing(null);
                fetchEvents();
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to save event', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Event?',
            text: "This may affect linked stalls and bookings.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await api.delete(`/api/events/${id}`);
            if (response.data.success) {
                const eventToDelete = events.find(e => e._id === id);
                const { userId, userName } = getUserInfo();
                if (userId) {
                    dispatch(createActivityLogThunk({
                        user_id: userId,
                        message: `Event: Deleted event '${eventToDelete?.name || id}' by ${userName}`,
                        section: "Event Schedule",
                        data: {
                            action: "DELETE",
                            event_id: id,
                            event_name: eventToDelete?.name
                        }
                    }));
                }

                Swal.fire('Deleted!', 'Event has been deleted.', 'success');
                fetchEvents();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to delete event', 'error');
        }
    };

    return (
        <div className="p-6 bg-white min-h-screen font-inter">
            <PageHeader title="EVENT MANAGEMENT" description="Create and manage exhibition events" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* FORM COLUMN */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow-md border-2 border-gray-200 rounded-[2px] overflow-hidden">
                        <div className={`px-6 py-4 flex items-center gap-3 text-white ${isEditing ? 'bg-amber-500' : 'bg-[#23471d]'}`}>
                            {isEditing ? <Edit size={18} /> : <Plus size={18} />}
                            <h2 className="text-sm font-bold uppercase tracking-tight">{isEditing ? 'Edit Event' : 'Create Event'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                             <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="col-span-1">
                                    <label className="block text-[11px] font-black text-black mb-1 uppercase tracking-tight">Sequence / Order</label>
                                    <input type="number" value={eventForm.order} onChange={(e) => setEventForm({...eventForm, order: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px]" placeholder="e.g. 1" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[11px] font-black text-black mb-1 uppercase tracking-tight">Status</label>
                                    <select value={eventForm.status} onChange={(e) => setEventForm({...eventForm, status: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px]">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                             </div>
                             <div className="mb-3">
                                 <label className="block text-[11px] font-medium text-black mb-1 uppercase tracking-tight">Event Name *</label>
                                 <input type="text" required value={eventForm.name} onChange={(e) => setEventForm({...eventForm, name: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px]" placeholder="e.g. IHWE 2026" />
                             </div>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="block text-[11px] font-medium text-black mb-1 uppercase tracking-tight">Start Date *</label>
                                    <input type="date" required value={eventForm.startDate ? new Date(eventForm.startDate).toISOString().split('T')[0] : ''} onChange={(e) => setEventForm({...eventForm, startDate: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px]" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-black mb-1 uppercase tracking-tight">End Date *</label>
                                    <input type="date" required value={eventForm.endDate ? new Date(eventForm.endDate).toISOString().split('T')[0] : ''} onChange={(e) => setEventForm({...eventForm, endDate: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px]" />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="block text-[11px] font-medium text-black mb-1 uppercase tracking-tight">Location / Venue</label>
                                <input type="text" value={eventForm.location} onChange={(e) => setEventForm({...eventForm, location: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px]" placeholder="Pragati Maidan, New Delhi" />
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="block text-[11px] font-medium text-black mb-1 uppercase tracking-tight">Online Advance % *</label>
                                    <input type="number" required min="1" max="100" value={eventForm.onlineAdvancePercentage} onChange={(e) => setEventForm({...eventForm, onlineAdvancePercentage: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px]" placeholder="50" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-black mb-1 uppercase tracking-tight">Manual Advance % *</label>
                                    <input type="number" required min="1" max="100" value={eventForm.manualAdvancePercentage} onChange={(e) => setEventForm({...eventForm, manualAdvancePercentage: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px]" placeholder="50" />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="block text-[11px] font-medium text-black mb-1 uppercase tracking-tight">Support Contact Number</label>
                                <input type="text" value={eventForm.contactPhone} onChange={(e) => setEventForm({...eventForm, contactPhone: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px]" placeholder="e.g. +91 98102XXXXX" />
                            </div>
                            <div className="mb-3">
                                <label className="block text-[11px] font-medium text-black mb-1 uppercase tracking-tight">Event Description</label>
                                <textarea rows={3} value={eventForm.description} onChange={(e) => setEventForm({...eventForm, description: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px]" placeholder="Briefly describe the event..." />
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="block text-[11px] font-medium text-black mb-1 uppercase tracking-tight">Tickets Highlight</label>
                                    <input type="text" value={eventForm.ticketsStatus} onChange={(e) => setEventForm({...eventForm, ticketsStatus: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px]" placeholder="Few Remaining" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-black mb-1 uppercase tracking-tight">Speakers Highlight</label>
                                    <input type="text" value={eventForm.speakersCount} onChange={(e) => setEventForm({...eventForm, speakersCount: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px]" placeholder="100+ Speakers" />
                                </div>
                            </div>
                            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                                {isEditing && <button type="button" onClick={() => { setIsEditing(null); setEventForm({...EMPTY_EVENT}); }} className="px-6 py-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all rounded-[2px]">Cancel</button>}
                                <button type="submit" disabled={isLoading} className="px-8 py-2 bg-[#23471d] hover:bg-[#1a3516] text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-[2px] shadow-sm">
                                    {isLoading ? 'Processing...' : (isEditing ? 'Update Event' : 'Create Event')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* TABLE COLUMN */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm">
                        <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2 uppercase tracking-tight">
                                <Calendar className="w-4 h-4" /> Events Registry
                            </h2>
                            <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 uppercase tracking-wider shadow-sm">
                                {events.length} EVENTS
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm font-inter">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50/50">
                                        <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-center w-16 tracking-tight">Seq.</th>
                                        <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-left tracking-tight">Event Name</th>
                                        <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-center tracking-tight">Duration / Dates</th>
                                        <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-center tracking-tight">Advance %</th>
                                        <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-center tracking-tight">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoading ? (
                                        <tr><td colSpan={5} className="py-12 text-center text-black font-medium uppercase tracking-widest text-[10px] italic">Loading events...</td></tr>
                                    ) : events.length === 0 ? (
                                        <tr><td colSpan={5} className="py-12 text-center text-black font-medium uppercase tracking-widest text-[10px] italic">No events found</td></tr>
                                    ) : events.map((event, index) => (
                                        <tr key={event._id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                                            <td className="py-4 px-4 text-black font-black text-center text-xs bg-slate-50 border-r border-slate-100">{event.order !== undefined ? event.order : index + 1}</td>
                                            <td className="py-4 px-4 min-w-[200px]">
                                                <p className="font-semibold text-red-600 text-sm uppercase tracking-tight leading-none mb-1.5 cursor-pointer hover:underline">
                                                    {event.name}
                                                </p>
                                                <p className="text-[10px] text-black font-medium uppercase tracking-widest flex items-center gap-1 opacity-60">
                                                    <MapPin size={10} /> {event.location || 'TBA'}
                                                </p>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-black font-semibold text-xs uppercase tracking-tight">
                                                        {new Date(event.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-black uppercase tracking-tight opacity-40">
                                                        TO {new Date(event.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Online: <span className="text-[#23471d]">{event.onlineAdvancePercentage ?? 50}%</span></span>
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Manual: <span className="text-[#d26019]">{event.manualAdvancePercentage ?? 50}%</span></span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button 
                                                        onClick={() => { 
                                                            setIsEditing(event._id); 
                                                            setEventForm({
                                                                ...event,
                                                                location: event.location || event.venue || ''
                                                            }); 
                                                        }} 
                                                        className="text-blue-600 hover:bg-blue-50 p-1.5 transition-all rounded-[2px] border border-blue-100 bg-blue-50/30" 
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(event._id)} 
                                                        className="text-red-600 hover:bg-red-50 p-1.5 transition-all rounded-[2px] border border-red-100 bg-red-50/30" 
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-white px-5 py-3 border-t border-gray-200 flex justify-between items-center bg-gray-50/30">
                            <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Exhibition Schedule Control</div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                Total Registry: <span className="text-red-600">{events.length}</span> Events Managed
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageEvents;
