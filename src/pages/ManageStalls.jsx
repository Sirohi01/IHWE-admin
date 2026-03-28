import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import {
    Layout, Plus, Trash2, Edit,
    Maximize, Hash, Ruler, CreditCard,
    CheckCircle2, XCircle, Info, Filter,
    Search, Download
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Table from '../components/table/Table';

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

    useEffect(() => {
        fetchStalls();
        fetchEvents();
    }, []);

    const fetchStalls = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/stalls');
            if (response.data.success) {
                setStalls(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stalls:', error);
            Swal.fire('Error', 'Failed to fetch stalls', 'error');
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

    // Auto calculate area when length or width changes
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
                Swal.fire({
                    icon: 'success',
                    title: isEditing ? 'Stall Updated!' : 'Stall Added!',
                    timer: 1500,
                    showConfirmButton: false
                });
                resetForm();
                fetchStalls();
            }
        } catch (error) {
            console.error('Error saving stall:', error);
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
            width: stall.width || '',
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

    const columns = [
        {
            key: "stallNumber",
            label: "STALL NO.",
            render: (row) => (
                <div className="space-y-0.5">
                    <div className="font-black text-[#23471d] text-lg">{row.stallNumber}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">{row.eventId?.name || 'No Event'}</div>
                </div>
            )
        },
        {
            key: "details",
            label: "SPECIFICATIONS",
            render: (row) => (
                <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-medium tracking-tight">
                        <span className="font-bold text-[#d26019]">{row.length}m x {row.width}m</span> | {row.area} sqm.
                    </p>
                    <p className="text-[10px] uppercase font-black text-blue-600 tracking-wider">PL: {row.plScheme}</p>
                </div>
            )
        },
        {
            key: "pricing",
            label: "ADJUSTMENTS",
            render: (row) => {
                return (
                    <div className="space-y-1">
                         <div className="flex items-center gap-1.5 flex-wrap">
                            {row.incrementPercentage > 0 && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-md font-black">INC: +{row.incrementPercentage}%</span>}
                            {row.discountPercentage > 0 && <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-md font-black">DISC: -{row.discountPercentage}%</span>}
                            {!row.incrementPercentage && !row.discountPercentage && <span className="text-[10px] text-slate-400 font-bold italic">Standard Rate</span>}
                        </div>
                    </div>
                );
            }
        },
        {
            key: "status",
            label: "STATUS",
            render: (row) => (
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${
                    row.status === 'available' ? 'bg-green-100 text-green-700 border border-green-200' :
                    row.status === 'booked' ? 'bg-red-100 text-red-700 border border-red-200' :
                    'bg-amber-100 text-amber-700 border border-amber-200'
                }`}>
                    {row.status === 'available' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {row.status}
                </div>
            )
        },
        {
            key: "actions",
            label: "ACTIONS",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => startEdit(row)} 
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100 shadow-sm"
                    >
                        <Edit size={16} />
                    </button>
                    <button 
                        onClick={() => handleDelete(row._id)} 
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-100 shadow-sm"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    const filteredStalls = stalls.filter(s => 
        s.stallNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.eventId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-slate-50 min-h-screen font-inter">
            <PageHeader
                title="STALL INVENTORY MANAGEMENT"
                description="Create and manage exhibition stalls, sizes, and events"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* FORM SECTION */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className={`px-6 py-4 flex items-center gap-3 border-b border-slate-100 ${isEditing ? 'bg-amber-50' : 'bg-[#23471d]'}`}>
                            <div className={`p-2 rounded-xl ${isEditing ? 'bg-amber-100 text-amber-600' : 'bg-white/10 text-white'}`}>
                                {isEditing ? <Edit size={20} /> : <Plus size={20} />}
                            </div>
                            <div>
                                <h2 className={`text-lg font-bold tracking-tight ${isEditing ? 'text-amber-800' : 'text-white'}`}>
                                    {isEditing ? 'Edit Stall Details' : 'Add New Stall'}
                                </h2>
                                <p className={`text-[10px] uppercase font-bold tracking-widest ${isEditing ? 'text-amber-600/70' : 'text-white/60'}`}>Stall Master Creation</p>
                            </div>
                        </div>

                        <form onSubmit={handleStallSubmit} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Linked Exhibition Event *</label>
                                <select 
                                    required 
                                    value={stallForm.eventId} 
                                    onChange={(e) => setStallForm({...stallForm, eventId: e.target.value})} 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#23471d]/20 outline-none font-bold"
                                >
                                    <option value="">Select Event</option>
                                    {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Stall Number *</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        required
                                        value={stallForm.stallNumber}
                                        onChange={(e) => setStallForm({...stallForm, stallNumber: e.target.value})}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#23471d]/20 focus:border-[#23471d] outline-none transition-all font-bold text-slate-800"
                                        placeholder="e.g. A-101"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">PL Scheme *</label>
                                <select
                                    value={stallForm.plScheme}
                                    onChange={(e) => setStallForm({...stallForm, plScheme: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm"
                                >
                                    <option value="One Side Open">One Side Open</option>
                                    <option value="Two Side Open">Two Side Open</option>
                                    <option value="Three Side Open">Three Side Open</option>
                                    <option value="Four Side Open">Four Side Open</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Length (m) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={stallForm.length}
                                        onChange={(e) => setStallForm({...stallForm, length: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                                        placeholder="3"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Width (m) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={stallForm.width}
                                        onChange={(e) => setStallForm({...stallForm, width: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                                        placeholder="3"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Total Calculated Area (Sq m)</label>
                                <div className="relative">
                                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-[#23471d]" size={16} />
                                    <input
                                        type="number"
                                        readOnly
                                        value={stallForm.area}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-black text-[#23471d]"
                                    />
                                    <p className="text-[9px] text-slate-400 mt-1 pl-1 italic">* Calculated automatically from Length x Width</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-[#d26019] uppercase tracking-widest px-1">Increment %</label>
                                    <input
                                        type="number"
                                        value={stallForm.incrementPercentage}
                                        onChange={(e) => setStallForm({...stallForm, incrementPercentage: e.target.value})}
                                        className="w-full px-4 py-2 bg-red-50 border border-red-100 rounded-xl text-red-700 font-bold"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-green-600 uppercase tracking-widest px-1">Discount %</label>
                                    <input
                                        type="number"
                                        value={stallForm.discountPercentage}
                                        onChange={(e) => setStallForm({...stallForm, discountPercentage: e.target.value})}
                                        className="w-full px-4 py-2 bg-green-50 border border-green-100 rounded-xl text-green-700 font-bold"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                                        isEditing 
                                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200' 
                                        : 'bg-[#23471d] hover:bg-[#1a3516] text-white shadow-[#23471d]/20'
                                    }`}
                                >
                                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (isEditing ? 'Update Stall' : 'Create Stall')}
                                </button>
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all border border-slate-200"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Summary Info Card */}
                    <div className="bg-gradient-to-br from-[#23471d] to-[#1a3516] p-6 rounded-3xl text-white shadow-xl shadow-[#23471d]/20">
                        <div className="flex items-center gap-3 mb-4">
                            <Info size={20} className="text-white/80" />
                            <h3 className="font-bold tracking-tight">Inventory Tips</h3>
                        </div>
                        <ul className="space-y-3 text-xs font-medium text-white/80">
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#d26019] mt-1 shrink-0"></div>
                                Keep Stall numbers unique to avoid booking conflicts.
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#d26019] mt-1 shrink-0"></div>
                                Area and Rate are used to calculate total booking amount.
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#d26019] mt-1 shrink-0"></div>
                                Status will auto-change to "Booked" once an exhibitor pays.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* TABLE SECTION */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                                    <Filter size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Active Inventory</h2>
                            </div>
                            <div className="flex gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold" size={16} />
                                    <input 
                                        type="text"
                                        placeholder="Search stall..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#23471d]/10 focus:border-[#23471d] outline-none transition-all text-sm font-bold"
                                    />
                                </div>
                                <button className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors border border-slate-200">
                                    <Download size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <Table 
                                columns={columns}
                                data={filteredStalls}
                            />
                            {!isLoading && filteredStalls.length === 0 && (
                                <div className="p-20 text-center space-y-3">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                        <Search size={32} />
                                    </div>
                                    <p className="text-slate-400 font-bold tracking-tight">No stalls found matching your search.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageStalls;
