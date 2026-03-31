import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import { Plus, Trash2, Edit, Calendar, MapPin, Percent, Info, Search } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Table from '../components/table/Table';

const EMPTY_EVENT = {
    name: '',
    startDate: '',
    endDate: '',
    venue: '',
    advancePaymentPercentage: 50,
    status: 'active'
};

const ManageEvents = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [eventForm, setEventForm] = useState({ ...EMPTY_EVENT });
    const [isEditing, setIsEditing] = useState(null);

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
                Swal.fire('Deleted!', 'Event has been deleted.', 'success');
                fetchEvents();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to delete event', 'error');
        }
    };

    const columns = [
        {
            key: "name",
            label: "EVENT NAME",
            render: (row) => <div className="font-bold text-[#23471d]">{row.name}</div>
        },
        {
            key: "dates",
            label: "DATES",
            render: (row) => (
                <div className="text-xs font-medium text-slate-600">
                    {new Date(row.startDate).toLocaleDateString()} - {new Date(row.endDate).toLocaleDateString()}
                </div>
            )
        },
        {
            key: "venue",
            label: "VENUE",
            render: (row) => <div className="text-xs font-medium text-slate-500">{row.venue}</div>
        },
        {
            key: "advance",
            label: "ADVANCE %",
            render: (row) => <div className="font-black text-[#d26019]">{row.advancePaymentPercentage}%</div>
        },
        {
            key: "actions",
            label: "ACTIONS",
            render: (row) => (
                <div className="flex gap-2">
                    <button onClick={() => { setIsEditing(row._id); setEventForm(row); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(row._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={14} /></button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 bg-slate-50 min-h-screen font-inter">
            <PageHeader title="EVENT MANAGEMENT" description="Create and manage exhibition events" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className={`px-6 py-4 flex items-center gap-3 border-b text-white ${isEditing ? 'bg-amber-500' : 'bg-[#23471d]'}`}>
                            {isEditing ? <Edit size={20} /> : <Plus size={20} />}
                            <h2 className="text-lg font-bold">{isEditing ? 'Edit Event' : 'Create Event'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Event Name *</label>
                                <input type="text" required value={eventForm.name} onChange={(e) => setEventForm({...eventForm, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="e.g. IHWE 2026" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase">Start Date *</label>
                                    <input type="date" required value={eventForm.startDate ? new Date(eventForm.startDate).toISOString().split('T')[0] : ''} onChange={(e) => setEventForm({...eventForm, startDate: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase">End Date *</label>
                                    <input type="date" required value={eventForm.endDate ? new Date(eventForm.endDate).toISOString().split('T')[0] : ''} onChange={(e) => setEventForm({...eventForm, endDate: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Venue</label>
                                <input type="text" value={eventForm.venue} onChange={(e) => setEventForm({...eventForm, venue: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Yashobhoomi, New Delhi" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Advance Payment % *</label>
                                <input type="number" required value={eventForm.advancePaymentPercentage} onChange={(e) => setEventForm({...eventForm, advancePaymentPercentage: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="50" />
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full py-3 bg-[#23471d] text-white rounded-xl font-bold hover:bg-[#1a3516] transition-all">
                                {isLoading ? 'Processing...' : (isEditing ? 'Update Event' : 'Create Event')}
                            </button>
                            {isEditing && <button type="button" onClick={() => { setIsEditing(null); setEventForm({...EMPTY_EVENT}); }} className="w-full py-2 text-slate-500 font-bold">Cancel</button>}
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        <Table columns={columns} data={events} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageEvents;
