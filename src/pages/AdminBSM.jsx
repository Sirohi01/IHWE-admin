import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
    Calendar, Users, Clock, MapPin, 
    MoreVertical, CheckCircle, XCircle, 
    Plus, Search, Filter, Trash2, Edit 
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminBSM = () => {
    const [meetings, setMeetings] = useState([]);
    const [buyers, setBuyers] = useState([]);
    const [exhibitors, setExhibitors] = useState([]);
    const [activeEvent, setActiveEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [formData, setFormData] = useState({
        buyerId: '',
        exhibitorId: '',
        date: '',
        timeSlot: '',
        location: '',
        adminNotes: ''
    });

    useEffect(() => {
        fetchData();
        fetchParticipants();
        fetchActiveEvent();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(`${API_BASE}/bsm/admin/all`);
            setMeetings(res.data.data);
            setLoading(false);
        } catch (err) {
            toast.error("Error fetching meetings");
        }
    };

    const fetchActiveEvent = async () => {
        try {
            const res = await axios.get(`${API_BASE}/events`);
            // Assuming the first active event is the target
            const active = res.data.data.find(e => e.status === 'active');
            if (active) setActiveEvent(active);
        } catch (err) {
            console.error("Error fetching active event");
        }
    };

    const getAvailableDates = () => {
        if (!activeEvent || !activeEvent.startDate || !activeEvent.endDate) return [];
        const dates = [];
        const current = new Date(activeEvent.startDate);
        const end = new Date(activeEvent.endDate);
        current.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        while (current <= end) {
            const y = current.getFullYear();
            const m = String(current.getMonth() + 1).padStart(2, '0');
            const d = String(current.getDate()).padStart(2, '0');
            dates.push(`${y}-${m}-${d}`);
            current.setDate(current.getDate() + 1);
        }
        return dates;
    };

    const fetchParticipants = async () => {
        try {
            const [bRes, eRes] = await Promise.all([
                axios.get(`${API_BASE}/bsm/buyers`),
                axios.get(`${API_BASE}/exhibitor-registration`)
            ]);
            setBuyers(bRes.data.data);
            setExhibitors(eRes.data.data);
        } catch (err) {
            toast.error("Error fetching participants");
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            const url = selectedMeeting 
                ? `${API_BASE}/bsm/admin/update/${selectedMeeting._id}`
                : `${API_BASE}/bsm/admin/create`;
            const method = selectedMeeting ? 'put' : 'post';
            
            const res = await axios[method](url, formData);
            if (res.data.success) {
                toast.success(selectedMeeting ? "Meeting Updated" : "Meeting Assigned Successfully");
                setShowAssignModal(false);
                setSelectedMeeting(null);
                setFormData({ buyerId: '', exhibitorId: '', date: '', timeSlot: '', location: '', adminNotes: '' });
                fetchData();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to process request");
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`${API_BASE}/bsm/admin/update/${id}`, { status });
            toast.success(`Meeting ${status}`);
            fetchData();
        } catch (err) {
            toast.error("Status update failed");
        }
    };

    const setApproval = async (id, side, approval) => {
        try {
            await axios.put(`${API_BASE}/bsm/admin/approval/${id}`, { side, approval });
            toast.success(`${side === 'exhibitor' ? 'Exhibitor' : 'Buyer'} approval set to ${approval}`);
            fetchData();
        } catch (err) {
            toast.error("Approval update failed");
        }
    };

    const slots = [
        "10:00 AM - 10:20 AM", "10:30 AM - 10:50 AM",
        "11:00 AM - 11:20 AM", "11:30 AM - 11:50 AM",
        "12:00 PM - 12:20 PM", "12:30 PM - 12:50 PM",
        "01:00 PM - 01:20 PM", "01:30 PM - 01:50 PM",
        "02:00 PM - 02:20 PM", "02:30 PM - 02:50 PM",
        "03:00 PM - 03:20 PM", "03:30 PM - 03:50 PM",
        "04:00 PM - 04:20 PM", "04:30 PM - 04:50 PM",
        "05:00 PM - 05:20 PM", "05:30 PM - 05:50 PM",
        "06:00 PM - 06:20 PM", "06:30 PM - 06:50 PM",
        "07:00 PM - 07:20 PM",
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Buyer Seller Meet (BSM) Portal</h1>
                    <p className="text-sm text-gray-500">Manage matchmaking and meeting schedules</p>
                </div>
                <button 
                    onClick={() => { setSelectedMeeting(null); setShowAssignModal(true); }}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus size={18} /> Assign New Meeting
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Meetings', val: meetings.length, icon: Calendar, color: 'blue' },
                    { label: 'Pending Requests', val: meetings.filter(m => m.status === 'Pending').length, icon: Clock, color: 'amber' },
                    { label: 'Buyers', val: buyers.length, icon: Users, color: 'green' },
                    { label: 'Exhibitors', val: exhibitors.length, icon: Users, color: 'purple' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 bg-${stat.color}-50 text-${stat.color}-600 rounded-lg`}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                                <p className="text-xl font-bold">{stat.val}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Participants</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Schedule</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Venue/Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Approvals</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {meetings.map((m) => (
                                <tr key={m._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-800">B: {m.buyerId?.companyName || 'Deleted Buyer'}</span>
                                            <span className="text-xs text-indigo-600 font-medium">E: {m.exhibitorId?.exhibitorName || 'Deleted Exhibitor'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-sm">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-gray-400" /> 
                                                {m.date ? new Date(m.date).toLocaleDateString() : <span className="text-amber-600 font-bold">Not Scheduled</span>}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={14} className="text-gray-400" /> 
                                                {m.timeSlot || <span className="text-slate-400 italic text-xs">Awaiting Slot</span>}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            {m.location && <span className="flex items-center gap-1 text-xs font-medium text-gray-600"><MapPin size={12}/> {m.location}</span>}
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                m.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                                m.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {m.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2 text-xs">
                                            {/* Exhibitor approval */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400 w-16">Exhibitor:</span>
                                                <span className={`font-bold ${m.exhibitorApproval === 'Approved' ? 'text-green-600' : m.exhibitorApproval === 'Rejected' ? 'text-red-500' : 'text-amber-500'}`}>
                                                    {m.exhibitorApproval || 'Pending'}
                                                </span>
                                                {m.exhibitorApproval !== 'Approved' && (
                                                    <button onClick={() => setApproval(m._id, 'exhibitor', 'Approved')} className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-bold hover:bg-green-200">✓</button>
                                                )}
                                                {m.exhibitorApproval !== 'Rejected' && (
                                                    <button onClick={() => setApproval(m._id, 'exhibitor', 'Rejected')} className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-bold hover:bg-red-200">✗</button>
                                                )}
                                            </div>
                                            {/* Buyer approval */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400 w-16">Buyer:</span>
                                                <span className={`font-bold ${m.buyerApproval === 'Approved' ? 'text-green-600' : m.buyerApproval === 'Rejected' ? 'text-red-500' : 'text-amber-500'}`}>
                                                    {m.buyerApproval || 'Pending'}
                                                </span>
                                                {m.buyerApproval !== 'Approved' && (
                                                    <button onClick={() => setApproval(m._id, 'buyer', 'Approved')} className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-bold hover:bg-green-200">✓</button>
                                                )}
                                                {m.buyerApproval !== 'Rejected' && (
                                                    <button onClick={() => setApproval(m._id, 'buyer', 'Rejected')} className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-bold hover:bg-red-200">✗</button>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => {
                                                    setSelectedMeeting(m);
                                                    setFormData({
                                                        buyerId: m.buyerId?._id,
                                                        exhibitorId: m.exhibitorId?._id,
                                                        date: m.date ? m.date.split('T')[0] : '',
                                                        timeSlot: m.timeSlot || '',
                                                        location: m.location || '',
                                                        adminNotes: m.adminNotes || ''
                                                    });
                                                    setShowAssignModal(true);
                                                }}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                <Edit size={18}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ASSIGN MODAL */}
            {showAssignModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="p-6 border-b flex justify-between items-center bg-indigo-50 rounded-t-2xl">
                            <h3 className="font-bold text-indigo-900">{selectedMeeting ? 'Update Meeting' : 'Assign New B2B Meeting'}</h3>
                            <button onClick={() => setShowAssignModal(false)}><XCircle className="text-indigo-400 hover:text-indigo-600" /></button>
                        </div>
                        <form onSubmit={handleAssign} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Buyer</label>
                                    <select 
                                        className="w-full border rounded-lg h-10 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        required value={formData.buyerId} onChange={e => setFormData({...formData, buyerId: e.target.value})}
                                    >
                                        <option value="">Select Buyer...</option>
                                        {buyers.map(b => <option key={b._id} value={b._id}>{b.companyName} ({b.fullName})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Exhibitor</label>
                                    <select 
                                        className="w-full border rounded-lg h-10 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        required value={formData.exhibitorId} onChange={e => setFormData({...formData, exhibitorId: e.target.value})}
                                    >
                                        <option value="">Select Exhibitor...</option>
                                        {exhibitors.map(ex => <option key={ex._id} value={ex._id}>{ex.exhibitorName}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Date</label>
                                    <select 
                                        className="w-full border rounded-lg h-10 px-3 text-sm focus:ring-2 focus:ring-indigo-500" 
                                        required 
                                        value={formData.date} 
                                        onChange={e => setFormData({...formData, date: e.target.value})}
                                    >
                                        <option value="">Select Date...</option>
                                        {getAvailableDates().map(d => (
                                            <option key={d} value={d}>
                                                {new Date(d + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Time Slot</label>
                                    <select className="w-full border rounded-lg h-10 px-3 text-sm" required value={formData.timeSlot} onChange={e => setFormData({...formData, timeSlot: e.target.value})}>
                                        <option value="">Select Slot...</option>
                                        {slots.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Meeting Venue / Table No.</label>
                                <input type="text" className="w-full border rounded-lg h-10 px-3 text-sm" placeholder="e.g. Table 12, VIP Lounge" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 py-2 rounded-lg border text-gray-500 font-bold text-sm">Cancel</button>
                                <button type="submit" className="flex-[2] py-2 rounded-lg bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition">
                                    {selectedMeeting ? 'Update Meeting' : 'Confirm Assignment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBSM;
