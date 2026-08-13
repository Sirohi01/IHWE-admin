import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import {
    Layout, Plus, Trash2, Edit,
    Ruler, Hash, CheckCircle2, XCircle,
    Info, Search, Download, Filter, Box, AlertCircle, Map, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { useDispatch } from 'react-redux';
import { createActivityLogThunk } from '../features/activityLog/activityLogSlice';

const DEFAULT_PL_SCHEME_OPTIONS = ['One Side Open', 'Two Side Open', 'Three Side Open', 'Four Side Open'];

const EMPTY_STALL = {
    eventId: '',
    stallNumber: '',
    length: '',
    width: '',
    area: '',
    stallType: 'Shell Space',
    plScheme: 'One Side Open',
    plcCharges: 0,
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
    const [filterEventId, setFilterEventId] = useState('all');
    const [eventRates, setEventRates] = useState([]);
    const [allRates, setAllRates] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStalls, setSelectedStalls] = useState([]);
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
        fetchRates();
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

    const fetchRates = async () => {
        try {
            const response = await api.get('/api/stall-rates');
            if (response.data.success) setAllRates(response.data.data || []);
        } catch (error) {
            console.error('Error fetching stall rates:', error);
        }
    };

    // Auto-calculate area
    useEffect(() => {
        if (stallForm.length && stallForm.width) {
            const area = parseFloat(stallForm.length) * parseFloat(stallForm.width);
            setStallForm(prev => ({ ...prev, area: area.toString() }));
        }
    }, [stallForm.length, stallForm.width]);

    // Pull PL Scheme / PLC Charges options from the Stall Rates master for the selected event
    useEffect(() => {
        if (!stallForm.eventId) {
            setEventRates([]);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const response = await api.get(`/api/stall-rates/event/${stallForm.eventId}`);
                if (!cancelled && response.data.success) setEventRates(response.data.data || []);
            } catch (error) {
                if (!cancelled) setEventRates([]);
            }
        })();
        return () => { cancelled = true; };
    }, [stallForm.eventId]);

    const matchingEventRates = eventRates.filter(rate => rate.stallType === stallForm.stallType);

    const dynamicPlSchemeCharges = matchingEventRates.reduce((acc, rate) => {
        (rate.plSchemeCharges || []).forEach(row => {
            if (!acc.some(existing => existing.plScheme === row.plScheme)) {
                acc.push({ plScheme: row.plScheme });
            }
        });
        return acc;
    }, []);

    const plSchemeOptions = dynamicPlSchemeCharges.length
        ? dynamicPlSchemeCharges.map(row => row.plScheme)
        : DEFAULT_PL_SCHEME_OPTIONS;

    // Keep PL Scheme / PLC Charges in sync with the rates master: fall back to the first
    // available scheme if the current selection isn't offered for this event, and always
    // mirror the PLC Charges configured for whichever scheme ends up selected.
    useEffect(() => {
        const activeScheme = plSchemeOptions.includes(stallForm.plScheme) ? stallForm.plScheme : plSchemeOptions[0];
        const preferredRate = matchingEventRates.find(rate => rate.currency === 'INR') || matchingEventRates[0];
        const match = preferredRate?.plSchemeCharges?.find(row => row.plScheme === activeScheme);
        setStallForm(prev => ({ ...prev, plScheme: activeScheme, plcCharges: match?.plcCharges || 0 }));
    }, [stallForm.plScheme, stallForm.stallType, eventRates]);

    const getRatesForStall = (stall) => allRates.filter(rate =>
        String(rate.eventId?._id || rate.eventId) === String(stall.eventId?._id || stall.eventId) &&
        rate.stallType === (stall.stallType || 'Shell Space')
    );

    const getPlcCharge = (rate, plScheme) => Number(
        rate?.plSchemeCharges?.find(row => row.plScheme === plScheme)?.plcCharges || 0
    );

    const formatMoney = (currency, amount) => `${currency === 'INR' ? '₹' : '$'}${Number(amount || 0).toLocaleString()}`;

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
                setIsModalOpen(false);
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
            width: stall.width || '',
            stallType: stall.stallType || 'Shell Space',
            plScheme: stall.plScheme || 'One Side Open',
            plcCharges: stall.plcCharges || 0,
            incrementPercentage: stall.incrementPercentage || 0,
            discountPercentage: stall.discountPercentage || 0,
        });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        resetForm();
        setIsModalOpen(false);
    };

    const resetForm = () => {
        setIsEditing(null);
        setStallForm({ ...EMPTY_STALL });
    };

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const filteredStalls = stalls.filter(s => {
        const matchesSearch =
            s.stallNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.eventId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesEvent = filterEventId === 'all' || String(s.eventId?._id || s.eventId || '') === filterEventId;
        return matchesSearch && matchesEvent;
    }).sort((a, b) => {
        const weight = { 'available': 1, 'hold': 2, 'booked': 3 };
        const wA = weight[a.status?.toLowerCase()] || 4;
        const wB = weight[b.status?.toLowerCase()] || 4;
        return wA - wB;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStalls.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStalls.length / itemsPerPage);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = currentItems.map(s => s._id);
            setSelectedStalls([...new Set([...selectedStalls, ...allIds])]);
        } else {
            const currentIds = currentItems.map(s => s._id);
            setSelectedStalls(selectedStalls.filter(id => !currentIds.includes(id)));
        }
    };

    const handleSelectStall = (id) => {
        if (selectedStalls.includes(id)) {
            setSelectedStalls(selectedStalls.filter(item => item !== id));
        } else {
            setSelectedStalls([...selectedStalls, id]);
        }
    };

    const handleBulkDelete = async () => {
        const result = await Swal.fire({
            title: `Delete ${selectedStalls.length} Stalls?`,
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete all!'
        });
        if (!result.isConfirmed) return;
        setIsLoading(true);
        try {
            const response = await api.post('/api/stalls/bulk', { ids: selectedStalls });
            if (response.data.success) {
                Swal.fire('Deleted!', response.data.message, 'success');
                setSelectedStalls([]);
                fetchStalls();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to bulk delete stalls', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterEventId]);

    const inputCls = "w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px] appearance-none bg-white uppercase";
    const labelCls = "block text-[11px] font-medium text-black mb-1 uppercase tracking-tight";

    return (
        <div className="bg-white shadow-md p-6 min-h-screen font-inter uppercase ">
            <PageHeader
                title="STALL INVENTORY MANAGEMENT"
                description="Create and manage exhibition stalls, sizes, and events"
            />

            {/* Add New Stall Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <style>{`
                        body, html { overflow: hidden !important; }
                        #root, main, .overflow-y-auto { overflow: hidden !important; }
                    `}</style>
                    <div className="bg-white border-2 border-gray-200 shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                        {/* Form Header */}
                        <div className={`px-6 py-4 flex items-center justify-between gap-3 text-white sticky top-0 ${isEditing ? 'bg-amber-500' : 'bg-[#23471d]'}`}>
                            <div className="flex items-center gap-3">
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
                            <button type="button" onClick={closeModal} className="text-white/80 hover:text-white transition-colors">
                                <XCircle size={22} />
                            </button>
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

                                <div className="mb-4">
                                    <label className={labelCls}>Stall Type *</label>
                                    <select
                                        required
                                        value={stallForm.stallType}
                                        onChange={(e) => setStallForm({ ...stallForm, stallType: e.target.value })}
                                        className={inputCls}
                                    >
                                        <option value="Shell Space">Shell Space (Built-up)</option>
                                        <option value="Raw Space">Raw Space (Plot)</option>
                                    </select>
                                </div>

                                {/* PL Scheme / PLC Charges — sourced from the Stall Rates master */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className={labelCls}>PL Scheme *</label>
                                        <select
                                            value={stallForm.plScheme}
                                            onChange={(e) => setStallForm({ ...stallForm, plScheme: e.target.value })}
                                            className={inputCls}
                                        >
                                            {plSchemeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <div className="w-full px-3 py-2 border-2 border-gray-200 bg-gray-50 text-[10px] font-bold text-[#23471d] rounded-[2px]">
                                            PLC IS CURRENCY-SPECIFIC
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[9px] text-black font-medium -mt-2 mb-4 opacity-50 italic capitalize">* PL Scheme and INR/USD PLC charges are pulled from the matching Event + Stall Type rate</p>

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

                                {stallForm.eventId && (
                                    <div className="mb-4 border-2 border-slate-200 bg-slate-50 p-3">
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <p className="text-[10px] font-black text-[#23471d] tracking-wider">LIVE PRICING PREVIEW</p>
                                            <span className="text-[9px] font-bold text-slate-500">{stallForm.stallType}</span>
                                        </div>
                                        {matchingEventRates.length === 0 ? (
                                            <p className="text-[10px] font-bold text-red-600 normal-case">No rate configured for this event and stall type.</p>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {matchingEventRates.map(rate => {
                                                    const plc = getPlcCharge(rate, stallForm.plScheme);
                                                    const base = Number(stallForm.area || 0) * Number(rate.ratePerSqm || 0);
                                                    return (
                                                        <div key={rate._id} className="bg-white border border-slate-200 p-2.5">
                                                            <div className="flex justify-between text-[10px] font-black">
                                                                <span>{rate.currency}</span>
                                                                <span>{formatMoney(rate.currency, rate.ratePerSqm)}/SQM</span>
                                                            </div>
                                                            <div className="mt-1 space-y-0.5 text-[9px] font-bold text-slate-600 normal-case">
                                                                <div className="flex justify-between"><span>Base ({stallForm.area || 0} sqm)</span><span>{formatMoney(rate.currency, base)}</span></div>
                                                                <div className="flex justify-between"><span>PLC ({stallForm.plScheme})</span><span>{formatMoney(rate.currency, plc)}</span></div>
                                                                <div className="flex justify-between pt-1 border-t text-[#23471d] uppercase"><span>Estimated</span><span>{formatMoney(rate.currency, base + plc)}</span></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}


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
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-5 py-3 border-2 border-gray-200 text-black font-medium hover:bg-gray-50 transition-colors text-[11px] uppercase rounded-[2px]"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Stall Table — Full Width */}
            <div className="mt-6">
                <div className="bg-white border-2 border-gray-200 shadow-sm">
                    <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between flex-wrap gap-3">
                        <h2 className="text-white font-bold flex items-center gap-2 uppercase tracking-tight">
                            <Layout className="w-4 h-4" /> Active Inventory
                        </h2>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Filter className="w-3.5 h-3.5 text-white/70" />
                                <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest whitespace-nowrap">Event Filter:</label>
                                <select
                                    value={filterEventId}
                                    onChange={(e) => setFilterEventId(e.target.value)}
                                    className="px-3 py-1.5 border-2 border-white/20 focus:border-white outline-none text-[10px] font-bold rounded-[2px] appearance-none bg-white/10 text-white uppercase min-w-[160px]"
                                >
                                    <option value="all" className="text-black">All Events</option>
                                    {events.map(e => <option key={e._id} value={e._id} className="text-black">{e.name}</option>)}
                                </select>
                            </div>
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
                            {selectedStalls.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-wider shadow-sm hover:bg-red-700 transition-colors rounded-[2px]"
                                >
                                    <Trash2 size={14} /> Delete Selected ({selectedStalls.length})
                                </button>
                            )}
                            <button
                                onClick={openAddModal}
                                className="flex items-center gap-1.5 bg-white text-[#23471d] text-[10px] font-black px-3 py-1.5 uppercase tracking-wider shadow-sm hover:bg-gray-100 transition-colors rounded-[2px]"
                            >
                                <Plus size={14} /> Add New Stall
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto mt-6">
                        <table className="w-full text-sm font-inter">
                            <thead>
                                <tr className="border-b-2 border-gray-200 bg-gray-50/50">
                                    <th className="py-4 px-4 w-12 text-center">
                                        <input
                                            type="checkbox"
                                            className="w-3.5 h-3.5 accent-[#23471d] cursor-pointer"
                                            checked={currentItems.length > 0 && currentItems.every(s => selectedStalls.includes(s._id))}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="py-4 px-2 text-[11px] font-medium text-black uppercase text-left tracking-tight">Stall Detail</th>
                                    <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-left tracking-tight">Specifications</th>
                                    <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-left tracking-tight">Pricing</th>
                                    <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-center tracking-tight">Status</th>
                                    <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-center tracking-tight">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr><td colSpan={6} className="py-12 text-center text-black font-medium uppercase tracking-widest text-[10px] italic">Loading inventory...</td></tr>
                                ) : currentItems.length === 0 ? (
                                    <tr><td colSpan={6} className="py-12 text-center text-black font-medium uppercase tracking-widest text-[10px] italic">No stalls found matching criteria</td></tr>
                                ) : currentItems.map((stall, index) => (
                                    <tr className={`hover:bg-slate-50 transition-colors border-b border-slate-100 bg-white last:border-0 divide-x divide-slate-100 ${selectedStalls.includes(stall._id) ? 'bg-[#23471d]/5' : ''}`} key={stall._id}>
                                        <td className="py-1.5 px-4 text-center align-top">
                                            <input
                                                type="checkbox"
                                                className="w-3.5 h-3.5 accent-[#23471d] cursor-pointer mt-0.5"
                                                checked={selectedStalls.includes(stall._id)}
                                                onChange={() => handleSelectStall(stall._id)}
                                            />
                                        </td>
                                        <td className="py-1.5 px-3 min-w-[180px] align-top">
                                            <div className={`flex flex-col gap-0.5 ${stall.bookedBy ? 'pb-1 mb-1 border-b border-slate-100' : ''}`}>
                                                <span className="font-black text-[13px] text-[#093C5D] leading-tight">{stall.stallNumber}</span>
                                                <div className="flex flex-col items-start gap-1 mt-0.5">
                                                    <span className={`px-1 py-0 rounded font-black text-[9px] border w-fit ${stall.stallType === 'Raw Space' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                        {stall.stallType || 'Shell Space'}
                                                    </span>
                                                    <span className="px-1 py-0 rounded font-bold text-[9px] bg-slate-100 text-slate-600 border border-slate-200 w-fit">
                                                        {stall.eventId?.name || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                            {stall.bookedBy && (
                                                <div className="flex flex-col gap-0.5 pt-0.5">
                                                    <span className="text-[10px] font-bold text-[#15173D] uppercase truncate max-w-[200px]" title={stall.bookedBy.exhibitorName}>
                                                        👤 {stall.bookedBy.exhibitorName}
                                                    </span>
                                                    {stall.bookedBy.companyEmail && (
                                                        <span className="text-[9px] text-slate-900 lowercase truncate max-w-[200px]" title={stall.bookedBy.companyEmail}>
                                                            ✉️ {stall.bookedBy.companyEmail}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-1.5 px-4 min-w-[160px] align-top">
                                            <div className="flex flex-col items-start w-full">
                                                <span className="w-full text-[#15173D] font-black text-[11px] uppercase tracking-tight leading-tight border-b border-slate-100 pb-1 mb-1">
                                                    {stall.length}m × {stall.width}m
                                                </span>
                                                <span className="w-full font-bold text-[10px] text-slate-600 border-b border-slate-100 pb-1 mb-1">
                                                    Area: {stall.area} SQM
                                                </span>
                                                <span className="w-full font-bold text-[10px] text-slate-600">
                                                    PL: {stall.plScheme}
                                                    {stall.plcCharges > 0 && (
                                                        <span className="ml-1 text-[#23471d]">
                                                            (PLC: {Number(stall.plcCharges).toLocaleString()})
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-1.5 px-4 min-w-[180px] align-top">
                                            {(() => {
                                                const mappedRates = getRatesForStall(stall);
                                                if (!mappedRates.length) return <span className="text-[9px] font-bold text-red-600">PRICING NOT MAPPED</span>;
                                                return (
                                                    <div className="space-y-1">
                                                        {mappedRates.map(rate => {
                                                            const plc = getPlcCharge(rate, stall.plScheme);
                                                            const base = Number(stall.area || 0) * Number(rate.ratePerSqm || 0);
                                                            return (
                                                                <div key={rate._id} className="flex flex-col gap-0 text-[9px] font-bold border-b border-slate-100 pb-0.5 mb-0.5 last:border-0 last:pb-0 last:mb-0">
                                                                    <span className="text-[#093C5D] font-black">{rate.currency} {formatMoney(rate.currency, rate.ratePerSqm)}/SQM</span>
                                                                    <span className="text-slate-500 leading-none">PLC: {formatMoney(rate.currency, plc)}</span>
                                                                    <span className="text-[#23471d] leading-none mt-0.5">TOTAL: {formatMoney(rate.currency, base + plc)}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="py-1.5 px-4 text-center align-top">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${stall.status === 'available' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                stall.status === 'booked' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    'bg-orange-50 text-orange-700 border-orange-100'
                                                }`}>
                                                <span className={`w-1 h-1 rounded-full ${stall.status === 'available' ? 'bg-emerald-500' :
                                                    stall.status === 'booked' ? 'bg-red-500' :
                                                        'bg-orange-500'
                                                    }`}></span>
                                                {stall.status}
                                            </span>
                                        </td>
                                        <td className="py-1.5 px-4 align-top">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => startEdit(stall)}
                                                    className="text-blue-500 hover:bg-blue-100 p-1 transition-all rounded-md"
                                                    title="Edit"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(stall._id)}
                                                    className="text-red-500 hover:bg-red-100 p-1 transition-all rounded-md"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
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
                                            className={`px-3 py-1.5 border text-[10px] font-black transition-all rounded-[2px] ${currentPage === pageNum
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
    );
};


export default ManageStalls;
