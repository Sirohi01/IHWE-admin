import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import { Plus, Trash2, Edit, CreditCard, Filter, PlusCircle, Layout } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useDispatch } from 'react-redux';
import { createActivityLogThunk } from '../features/activityLog/activityLogSlice';

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
    const dispatch = useDispatch();

    const getUserInfo = () => {
        const userStr = sessionStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : {};
        const userId = sessionStorage.getItem("user_id") || user._id;
        const userName = user.name || "User";
        return { userId, userName };
    };

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
                const { userId, userName } = getUserInfo();
                const eventName = events.find(e => e._id === rateForm.eventId)?.name || "Event";
                if (userId) {
                    dispatch(createActivityLogThunk({
                        user_id: userId,
                        message: `Stall Rates: ${isEditing ? 'Updated' : 'Created'} rate for '${rateForm.stallType}' (${rateForm.currency}) in ${eventName} by ${userName}`,
                        section: "Stall Rates",
                        data: {
                            action: isEditing ? "UPDATE" : "CREATE",
                            rate_id: isEditing || response.data.data?._id,
                            stall_type: rateForm.stallType,
                            currency: rateForm.currency,
                            rate: rateForm.ratePerSqm,
                            event_name: eventName
                        }
                    }));
                }

                Swal.fire({
                    icon: 'success',
                    title: isEditing ? 'Rate Updated!' : 'Rate Saved!',
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
                const rateToDelete = rates.find(r => r._id === id);
                const eventName = rateToDelete?.eventId?.name || "Event";
                const { userId, userName } = getUserInfo();
                if (userId) {
                    dispatch(createActivityLogThunk({
                        user_id: userId,
                        message: `Stall Rates: Deleted rate for '${rateToDelete?.stallType}' in ${eventName} by ${userName}`,
                        section: "Stall Rates",
                        data: {
                            action: "DELETE",
                            rate_id: id,
                            stall_type: rateToDelete?.stallType,
                            event_name: eventName
                        }
                    }));
                }
                Swal.fire('Deleted!', 'Rate entry has been deleted.', 'success');
                fetchRates();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to delete rate', 'error');
        }
    };

    return (
        <div className="p-6 bg-white min-h-screen font-inter uppercase">
            <PageHeader title="STALL PRICING MASTER" description="Set pricing per event, currency, and stall type" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* FORM COLUMN */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow-md border-2 border-gray-200 rounded-[2px] overflow-hidden">
                        <div className={`px-6 py-4 flex items-center gap-3 text-white ${isEditing ? 'bg-amber-500' : 'bg-[#23471d]'}`}>
                            {isEditing ? <Edit size={18} /> : <PlusCircle size={18} />}
                            <h2 className="text-sm font-bold uppercase tracking-tight">{isEditing ? 'Edit Rate Detail' : 'Add New Rate'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="mb-3">
                                <label className="block text-[11px] font-medium text-black mb-1 uppercase tracking-tight">Exhibition Event *</label>
                                <select required value={rateForm.eventId} onChange={(e) => setRateForm({...rateForm, eventId: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px] appearance-none bg-white">
                                    <option value="">Select Event</option>
                                    {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="block text-[11px] font-medium text-black mb-1 uppercase tracking-tight">Currency *</label>
                                    <select value={rateForm.currency} onChange={(e) => setRateForm({...rateForm, currency: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px] appearance-none bg-white">
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-black mb-1 uppercase tracking-tight">Stall Type *</label>
                                    <select value={rateForm.stallType} onChange={(e) => setRateForm({...rateForm, stallType: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px] appearance-none bg-white">
                                        <option value="Shell Space">Shell Space</option>
                                        <option value="Raw Space">Raw Space</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="block text-[11px] font-medium text-black mb-1 uppercase tracking-tight">Rate Per Sq m *</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input type="number" required value={rateForm.ratePerSqm} onChange={(e) => setRateForm({...rateForm, ratePerSqm: e.target.value})} className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px]" />
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                                {isEditing && <button type="button" onClick={() => { setIsEditing(null); setRateForm({...EMPTY_RATE}); }} className="px-6 py-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all rounded-[2px]">Cancel</button>}
                                <button type="submit" disabled={isLoading} className="px-8 py-2 bg-[#23471d] hover:bg-[#1a3516] text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-[2px] shadow-sm">
                                    {isLoading ? 'Saving...' : (isEditing ? 'Update Rate' : 'Save Rate Detail')}
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
                                <PlusCircle className="w-4 h-4" /> Pricing Registry
                            </h2>
                            <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 uppercase tracking-wider shadow-sm">
                                {rates.length} RATE ENTRIES
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm font-inter">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50/50">
                                        <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-center w-16 tracking-tight">No.</th>
                                        <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-left tracking-tight">Event / Type</th>
                                        <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-center tracking-tight">Pricing Rate</th>
                                        <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-center tracking-tight">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoading ? (
                                        <tr><td colSpan={4} className="py-12 text-center text-black font-medium uppercase tracking-widest text-[10px] italic">Loading rates...</td></tr>
                                    ) : rates.length === 0 ? (
                                        <tr><td colSpan={4} className="py-12 text-center text-black font-medium uppercase tracking-widest text-[10px] italic">No rates found</td></tr>
                                    ) : rates.map((rate, index) => (
                                        <tr key={rate._id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                                            <td className="py-4 px-4 text-black font-medium text-center text-xs">{index + 1}</td>
                                            <td className="py-4 px-4 min-w-[200px]">
                                                <p className="font-semibold text-red-600 text-sm uppercase tracking-tight leading-none mb-1.5 cursor-pointer hover:underline">
                                                    {rate.eventId?.name || 'N/A'}
                                                </p>
                                                <p className="text-[10px] text-black font-medium uppercase tracking-widest opacity-60">
                                                    STALL TYPE: <span className="text-black font-bold">{rate.stallType}</span>
                                                </p>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-black font-semibold text-xs uppercase tracking-tight">
                                                        {rate.currency} {rate.ratePerSqm?.toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-black uppercase tracking-tight opacity-40">
                                                        PER SQUARE METRE
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button 
                                                        onClick={() => { setIsEditing(rate._id); setRateForm({ eventId: rate.eventId?._id || '', currency: rate.currency, stallType: rate.stallType, ratePerSqm: rate.ratePerSqm }); }} 
                                                        className="text-blue-600 hover:bg-blue-50 p-1.5 transition-all rounded-[2px] border border-blue-200 bg-blue-50/30" 
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(rate._id)} 
                                                        className="text-red-600 hover:bg-red-50 p-1.5 transition-all rounded-[2px] border border-red-200 bg-red-50/30" 
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
                            <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Financial Pricing Master</div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                Total: <span className="text-red-600">{rates.length}</span> Active Rate Entries
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageStallRates;
