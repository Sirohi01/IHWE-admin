import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import {
    Layout, Plus, Trash2, Edit,
    Ruler, Hash, CheckCircle2, XCircle,
    Info, Search, Download, Filter
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useDispatch } from 'react-redux';
import { createActivityLogThunk } from '../features/activityLog/activityLogSlice';

const EMPTY_STALL = {
    eventId: '',
    stallNumber: '',
    length: '',
    width: '',
    area: '',
    plScheme: 'One Side Open',
    incrementPercentage: 0,
    discountPercentage: 0,
};

const ManageStalls = () => {
    const [stalls, setStalls] = useState([]);
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [stallForm, setStallForm] = useState({ ...EMPTY_STALL });
    const [isEditing, setIsEditing] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const dispatch = useDispatch();

    const getUserInfo = () => {
        const userStr = sessionStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : {};
        const userId = sessionStorage.getItem("user_id") || user._id;
        const userName = user.name || "User";
        return { userId, userName };
    };

    useEffect(() => {
        fetchStalls();
        fetchEvents();
    }, []);

    const fetchStalls = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/stalls');
            if (response.data.success) setStalls(response.data.data);
        } catch (error) {
            Swal.fire('Error', 'Failed to fetch stalls', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await api.get('/api/events');
            if (response.data.success) setEvents(response.data.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    // Auto-calculate area
    useEffect(() => {
        if (stallForm.length && stallForm.width) {
            const area = parseFloat(stallForm.length) * parseFloat(stallForm.width);
            setStallForm(prev => ({ ...prev, area: area.toString() }));
        }
    }, [stallForm.length, stallForm.width]);

    const handleStallSubmit = async (e) => {
        e.preventDefault();
        if (!stallForm.stallNumber || !stallForm.area || !stallForm.eventId) {
            Swal.fire('Warning', 'Please fill all required fields (Event, Stall No, Area)', 'warning');
            return;
        }
        setIsLoading(true);
        try {
            let response;
            if (isEditing) {
                response = await api.put(`/api/stalls/${isEditing}`, stallForm);
            } else {
                response = await api.post('/api/stalls', stallForm);
            }
            if (response.data.success) {
                const { userId, userName } = getUserInfo();
                const eventName = events.find(e => e._id === stallForm.eventId)?.name || "Event";
                if (userId) {
                    dispatch(createActivityLogThunk({
                        user_id: userId,
                        message: `Stalls: ${isEditing ? 'Updated' : 'Created'} Stall ${stallForm.stallNumber} in ${eventName} by ${userName}`,
                        section: "Stalls",
                        data: {
                            action: isEditing ? "UPDATE" : "CREATE",
                            stall_id: isEditing || response.data.data?._id,
                            stall_number: stallForm.stallNumber,
                            event_name: eventName,
                            details: stallForm
                        }
                    }));
                }

                Swal.fire({ icon: 'success', title: isEditing ? 'Stall Updated!' : 'Stall Added!', timer: 1500, showConfirmButton: false });
                resetForm();
                fetchStalls();
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to save stall', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Stall?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });
        if (!result.isConfirmed) return;
        setIsLoading(true);
        try {
            const response = await api.delete(`/api/stalls/${id}`);
            if (response.data.success) {
                const stallToDelete = stalls.find(s => s._id === id);
                const eventName = stallToDelete?.eventId?.name || "Event";
                const { userId, userName } = getUserInfo();
                if (userId) {
                    dispatch(createActivityLogThunk({
                        user_id: userId,
                        message: `Stalls: Deleted Stall ${stallToDelete?.stallNumber} (${eventName}) by ${userName}`,
                        section: "Stalls",
                        data: {
                            action: "DELETE",
                            stall_id: id,
                            stall_number: stallToDelete?.stallNumber,
                            event_name: eventName
                        }
                    }));
                }
                Swal.fire('Deleted!', 'Stall has been deleted.', 'success');
                fetchStalls();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to delete stall', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (stall) => {
        setIsEditing(stall._id);
        setStallForm({
            eventId: stall.eventId?._id || '',
            stallNumber: stall.stallNumber,
            length: stall.length || '',
            area: stall.area,
            plScheme: stall.plScheme || 'One Side Open',
            incrementPercentage: stall.incrementPercentage || 0,
            discountPercentage: stall.discountPercentage || 0,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditing(null);
        setStallForm({ ...EMPTY_STALL });
    };

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const filteredStalls = stalls.filter(s =>
        s.stallNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.eventId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStalls.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStalls.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const inputCls = "w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px] appearance-none bg-white uppercase";
    const labelCls = "block text-[11px] font-medium text-black mb-1 uppercase tracking-tight";

    return (
        <div className="bg-white shadow-md p-6 min-h-screen font-inter uppercase">
            <PageHeader
                title="STALL INVENTORY MANAGEMENT"
                description="Create and manage exhibition stalls, sizes, and events"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* LEFT: Form Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border-2 border-gray-200 shadow-sm">
                        {/* Form Header */}
                        <div className={`px-6 py-4 flex items-center gap-3 text-white ${isEditing ? 'bg-amber-500' : 'bg-[#23471d]'}`}>
                            <div className="p-2 bg-white/10 text-white">
                                {isEditing ? <Edit size={20} /> : <Plus size={20} />}
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-white tracking-tight uppercase">
                                    {isEditing ? 'Edit Stall Details' : 'Add New Stall'}
                                </h2>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-white/50">Stall Master Creation</p>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <form onSubmit={handleStallSubmit}>
                                {/* Event */}
                                <div className="mb-4">
                                    <label className={labelCls}>Linked Exhibition Event *</label>
                                    <select
                                        required
                                        value={stallForm.eventId}
                                        onChange={(e) => setStallForm({ ...stallForm, eventId: e.target.value })}
                                        className={inputCls}
                                    >
                                        <option value="">Select Event</option>
                                        {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                                    </select>
                                </div>

                                {/* Stall Number */}
                                <div className="mb-4">
                                    <label className={labelCls}>Stall Number *</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            required
                                            value={stallForm.stallNumber}
                                            onChange={(e) => setStallForm({ ...stallForm, stallNumber: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px] uppercase"
                                            placeholder="e.g. A-101"
                                        />
                                    </div>
                                </div>

                                {/* PL Scheme */}
                                <div className="mb-4">
                                    <label className={labelCls}>PL Scheme *</label>
                                    <select
                                        value={stallForm.plScheme}
                                        onChange={(e) => setStallForm({ ...stallForm, plScheme: e.target.value })}
                                        className={inputCls}
                                    >
                                        <option value="One Side Open">One Side Open</option>
                                        <option value="Two Side Open">Two Side Open</option>
                                        <option value="Three Side Open">Three Side Open</option>
                                        <option value="Four Side Open">Four Side Open</option>
                                    </select>
                                </div>

                                {/* Length / Width */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className={labelCls}>Length (M) *</label>
                                        <input
                                            type="number"
                                            required
                                            value={stallForm.length}
                                            onChange={(e) => setStallForm({ ...stallForm, length: e.target.value })}
                                            className={inputCls}
                                            placeholder="3"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Width (M) *</label>
                                        <input
                                            type="number"
                                            required
                                            value={stallForm.width}
                                            onChange={(e) => setStallForm({ ...stallForm, width: e.target.value })}
                                            className={inputCls}
                                            placeholder="3"
                                        />
                                    </div>
                                </div>

                                {/* Auto Area */}
                                <div className="mb-4">
                                    <label className={labelCls}>Total Calculated Area (Sq M)</label>
                                    <div className="relative">
                                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-[#23471d]" size={16} />
                                        <input
                                            type="number"
                                            readOnly
                                            value={stallForm.area}
                                            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 bg-gray-50 outline-none text-xs font-bold text-[#23471d] rounded-[2px]"
                                        />
                                        <p className="text-[9px] text-black font-medium mt-1 opacity-50 italic capitalize">* Calculated automatically from Length x Width</p>
                                    </div>
                                </div>

                                {/* Increment / Discount */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-[11px] font-medium text-black uppercase mb-1 tracking-tight">Increment %</label>
                                        <input
                                            type="number"
                                            value={stallForm.incrementPercentage}
                                            onChange={(e) => setStallForm({ ...stallForm, incrementPercentage: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-red-50 focus:border-red-500 outline-none text-red-700 font-bold text-xs rounded-[2px] bg-red-50/30"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-medium text-black uppercase mb-1 tracking-tight">Discount %</label>
                                        <input
                                            type="number"
                                            value={stallForm.discountPercentage}
                                            onChange={(e) => setStallForm({ ...stallForm, discountPercentage: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-green-50 focus:border-green-600 outline-none text-green-700 font-bold text-xs rounded-[2px] bg-green-50/30"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 py-3 bg-[#23471d] text-white text-[11px] font-bold hover:bg-[#1a3615] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 uppercase rounded-[2px]"
                                    >
                                        {isLoading
                                            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            : isEditing ? <><Edit className="w-4 h-4" /> Update Stall</> : <><Plus className="w-4 h-4" /> Create Stall</>
                                        }
                                    </button>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-5 py-3 border-2 border-gray-200 text-black font-medium hover:bg-gray-50 transition-colors text-[11px] uppercase rounded-[2px]"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Stall Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm">
                        <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2 uppercase tracking-tight">
                                <Layout className="w-4 h-4" /> Active Inventory
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={12} />
                                    <input
                                        type="text"
                                        placeholder="Search stall..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 pr-4 py-1.5 bg-white/10 border border-white/20 text-white placeholder:text-white/50 outline-none text-[10px] font-bold focus:bg-white/20 transition-all uppercase tracking-widest"
                                    />
                                </div>
                                <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 uppercase tracking-wider shadow-sm">
                                    {filteredStalls.length} STALLS
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm font-inter">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50/50">
                                        <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-center w-16 tracking-tight">No.</th>
                                        <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-left tracking-tight">Stall Detail</th>
                                        <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-left tracking-tight">Specifications</th>
                                        <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-center tracking-tight">Status</th>
                                        <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-center tracking-tight">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoading ? (
                                        <tr><td colSpan={5} className="py-12 text-center text-black font-medium uppercase tracking-widest text-[10px] italic">Loading inventory...</td></tr>
                                    ) : currentItems.length === 0 ? (
                                        <tr><td colSpan={5} className="py-12 text-center text-black font-medium uppercase tracking-widest text-[10px] italic">No stalls found matching criteria</td></tr>
                                    ) : currentItems.map((stall, index) => (
                                        <tr key={stall._id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                                            <td className="py-4 px-4 text-black font-medium text-center text-xs">{indexOfFirstItem + index + 1}</td>
                                            <td className="py-4 px-4 min-w-[180px]">
                                                <p className="font-semibold text-red-600 text-sm uppercase tracking-tight leading-none mb-1.5">
                                                    {stall.stallNumber}
                                                </p>
                                                <p className="text-[10px] text-black font-medium uppercase tracking-widest opacity-60">
                                                    {stall.eventId?.name || 'No Event Assigned'}
                                                </p>
                                            </td>
                                            <td className="py-4 px-4 min-w-[200px]">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-black font-semibold text-xs uppercase tracking-tight">
                                                        {stall.length}M X {stall.width}M | <span className="text-red-500 font-bold">{stall.area} SQM</span>
                                                    </span>
                                                    <span className="text-[10px] font-medium text-black uppercase tracking-tight opacity-40">
                                                        PL: {stall.plScheme}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={`inline-block px-3 py-1 rounded-[2px] text-[9px] font-bold uppercase tracking-widest shadow-sm ${
                                                    stall.status === 'available' ? 'bg-green-500 text-white' :
                                                    stall.status === 'booked' ? 'bg-red-500 text-white' :
                                                    'bg-amber-500 text-white'
                                                }`}>
                                                    {stall.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button 
                                                        onClick={() => startEdit(stall)} 
                                                        className="text-blue-600 hover:bg-blue-50 p-1.5 transition-all rounded-[2px] border border-blue-100 bg-blue-50/30" 
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(stall._id)} 
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

                        {/* Pagination Section */}
                        <div className="bg-white px-5 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center bg-gray-50/30 gap-4">
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                PAGE <span className="text-[#23471d]">{currentPage}</span> OF <span className="text-[#23471d]">{totalPages || 1}</span>
                                <span className="mx-2 text-gray-300">|</span>
                                SHOWING <span className="text-red-600">{currentItems.length}</span> OF <span className="text-red-600">{filteredStalls.length}</span> RECORDS
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 border border-gray-200 bg-white text-[10px] font-black uppercase hover:bg-gray-100 disabled:opacity-50 transition-all rounded-[2px]"
                                >
                                    PREV
                                </button>
                                
                                {[...Array(totalPages)].map((_, i) => {
                                    const pageNum = i + 1;
                                    // Show first, last, and pages around current
                                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-3 py-1.5 border text-[10px] font-black transition-all rounded-[2px] ${
                                                    currentPage === pageNum 
                                                    ? 'bg-[#23471d] border-[#23471d] text-white shadow-md scale-110' 
                                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    }
                                    if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                        return <span key={pageNum} className="px-1 text-gray-400 font-bold">...</span>;
                                    }
                                    return null;
                                })}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="px-3 py-1.5 border border-gray-200 bg-white text-[10px] font-black uppercase hover:bg-gray-100 disabled:opacity-50 transition-all rounded-[2px]"
                                >
                                    NEXT
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageStalls;
