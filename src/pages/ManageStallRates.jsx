import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import { Plus, Trash2, Edit, CreditCard, Filter, PlusCircle, Layout } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Table from '../components/table/Table';

const EMPTY_RATE = {
    eventId: '',
    currency: 'INR',
    stallType: 'Shell Space',
    ratePerSqm: 11700
};

const ManageStallRates = () => {
    const [rates, setRates] = useState([]);
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [rateForm, setRateForm] = useState({ ...EMPTY_RATE });
    const [isEditing, setIsEditing] = useState(null);

    useEffect(() => {
        fetchRates();
        fetchEvents();
    }, []);

    const fetchRates = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/stall-rates');
            if (response.data.success) {
                setRates(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching rates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await api.get('/api/events');
            if (response.data.success) {
                setEvents(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rateForm.eventId) {
            Swal.fire('Warning', 'Please select an event', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            let response;
            if (isEditing) {
                response = await api.put(`/api/stall-rates/${isEditing}`, rateForm);
            } else {
                response = await api.post('/api/stall-rates', rateForm);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: isEditing ? 'Rate Updated!' : 'Rate Added!',
                    timer: 1500,
                    showConfirmButton: false
                });
                setRateForm({ ...EMPTY_RATE });
                setIsEditing(null);
                fetchRates();
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to save rate', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Rate?',
            text: "This will affect new bookings' calculations.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await api.delete(`/api/stall-rates/${id}`);
            if (response.data.success) {
                Swal.fire('Deleted!', 'Rate has been deleted.', 'success');
                fetchRates();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to delete rate', 'error');
        }
    };

    const columns = [
        {
            key: "event",
            label: "EVENT",
            render: (row) => <div className="font-bold text-slate-800">{row.eventId?.name || 'N/A'}</div>
        },
        {
            key: "stallType",
            label: "STALL TYPE",
            render: (row) => <div className="text-sm font-medium text-slate-700">{row.stallType}</div>
        },
        {
            key: "rate",
            label: "RATE PER SQM",
            render: (row) => <div className="font-black text-[#23471d]">{row.currency} {row.ratePerSqm.toLocaleString()}</div>
        },
        {
            key: "actions",
            label: "ACTIONS",
            render: (row) => (
                <div className="flex gap-2">
                    <button onClick={() => { setIsEditing(row._id); setRateForm({
                        eventId: row.eventId?._id || '',
                        currency: row.currency,
                        stallType: row.stallType,
                        ratePerSqm: row.ratePerSqm
                    }); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(row._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={14} /></button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 bg-slate-50 min-h-screen font-inter">
            <PageHeader title="STALL PRICING MASTER" description="Set pricing per event, currency, and stall type" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className={`px-6 py-4 flex items-center gap-3 border-b text-white ${isEditing ? 'bg-amber-500' : 'bg-[#23471d]'}`}>
                            {isEditing ? <Edit size={20} /> : <PlusCircle size={20} />}
                            <h2 className="text-lg font-bold">{isEditing ? 'Edit Rate Detail' : 'Add New Rate'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Exhibition Event *</label>
                                <select required value={rateForm.eventId} onChange={(e) => setRateForm({...rateForm, eventId: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#23471d]/20 outline-none font-bold">
                                    <option value="">Select Event</option>
                                    {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase">Currency *</label>
                                    <select value={rateForm.currency} onChange={(e) => setRateForm({...rateForm, currency: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase">Stall Type *</label>
                                    <select value={rateForm.stallType} onChange={(e) => setRateForm({...rateForm, stallType: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                                        <option value="Shell Space">Shell Space</option>
                                        <option value="Raw Space">Raw Space</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Rate Per Sq m *</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input type="number" required value={rateForm.ratePerSqm} onChange={(e) => setRateForm({...rateForm, ratePerSqm: e.target.value})} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                                </div>
                            </div>
                            
                            <button type="submit" disabled={isLoading} className="w-full py-3 bg-[#23471d] text-white rounded-xl font-bold hover:bg-[#1a3516] transition-all shadow-lg shadow-[#23471d]/20">
                                {isLoading ? 'Saving...' : (isEditing ? 'Update Rate' : 'Save Rate Detail')}
                            </button>
                            {isEditing && <button type="button" onClick={() => { setIsEditing(null); setRateForm({...EMPTY_RATE}); }} className="w-full py-2 text-slate-500 font-bold">Cancel</button>}
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        <Table columns={columns} data={rates} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageStallRates;
