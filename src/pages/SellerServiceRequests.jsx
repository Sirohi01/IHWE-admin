import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import Swal from 'sweetalert2';
import { Search, RefreshCw, Filter, CheckCircle2, Clock, XCircle, Truck, CalendarCheck, Package, Users, Handshake, LifeBuoy } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const SERVICE_TYPES = [
    { value: 'all',           label: 'All Requests' },
    { value: 'helpdesk',      label: 'Helpdesk & Support', icon: LifeBuoy },
    { value: 'logistics',     label: 'Logistics & Operations', icon: Truck },
    { value: 'conference',    label: 'Conference Participation', icon: CalendarCheck },
    { value: 'stall_booking', label: 'Stall Booking', icon: Package },
    { value: 'meeting',       label: 'Meeting Requests', icon: Handshake },
    { value: 'custom_space',  label: 'Custom Space', icon: Users },
    { value: 'sponsorship',   label: 'Sponsorship', icon: Users },
];

const STATUS_OPTIONS = [
    { value: 'all',       label: 'All Status' },
    { value: 'pending',   label: 'Pending' },
    { value: 'reviewed',  label: 'Reviewed' },
    { value: 'approved',  label: 'Approved' },
    { value: 'rejected',  label: 'Rejected' },
    { value: 'completed', label: 'Completed' },
];

const STATUS_STYLE = {
    pending:   'bg-amber-50 text-amber-700 border-amber-200',
    reviewed:  'bg-blue-50 text-blue-700 border-blue-200',
    approved:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected:  'bg-red-50 text-red-700 border-red-200',
    completed: 'bg-green-100 text-green-800 border-green-300',
};

const TYPE_STYLE = {
    helpdesk:      'bg-indigo-50 text-indigo-700 border-indigo-200',
    logistics:     'bg-orange-50 text-orange-700 border-orange-200',
    conference:    'bg-purple-50 text-purple-700 border-purple-200',
    stall_booking: 'bg-blue-50 text-blue-700 border-blue-200',
    meeting:       'bg-cyan-50 text-cyan-700 border-cyan-200',
    custom_space:  'bg-slate-50 text-slate-700 border-slate-200',
    sponsorship:   'bg-amber-50 text-amber-700 border-amber-200',
};

const PAGE_SIZE = 10;

export default function SellerServiceRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (typeFilter !== 'all') params.append('type', typeFilter);
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (searchTerm) params.append('search', searchTerm);

            const res = await api.get(`/api/seller-portal/admin/service-requests?${params}`);
            if (res.data.success) setRequests(res.data.data || []);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [typeFilter, statusFilter, searchTerm]);

    useEffect(() => { fetchRequests(); }, [fetchRequests]);
    useEffect(() => { setCurrentPage(1); }, [typeFilter, statusFilter, searchTerm]);

    const handleStatusUpdate = async (id, currentStatus) => {
        const { value: newStatus } = await Swal.fire({
            title: 'Update Status',
            input: 'select',
            inputOptions: {
                pending:   'Pending',
                reviewed:  'Reviewed',
                approved:  'Approved',
                rejected:  'Rejected',
                completed: 'Completed',
            },
            inputValue: currentStatus,
            showCancelButton: true,
            confirmButtonColor: '#23471d',
            confirmButtonText: 'Update',
        });

        if (!newStatus) return;

        const { value: adminNote } = await Swal.fire({
            title: 'Admin Note (Optional)',
            input: 'textarea',
            inputPlaceholder: 'Add a note for this status update...',
            showCancelButton: true,
            confirmButtonColor: '#23471d',
            confirmButtonText: 'Save',
        });

        try {
            await api.patch(`/api/seller-portal/admin/service-requests/${id}/status`, {
                status: newStatus,
                adminNote: adminNote || ''
            });
            Swal.fire({ icon: 'success', title: 'Updated!', timer: 1200, showConfirmButton: false });
            fetchRequests();
        } catch (err) {
            Swal.fire('Error', 'Failed to update status', 'error');
        }
    };

    // Pagination
    const totalPages = Math.ceil(requests.length / PAGE_SIZE);
    const paginated = requests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // Counts per type
    const counts = {};
    SERVICE_TYPES.forEach(t => {
        counts[t.value] = t.value === 'all'
            ? requests.length
            : requests.filter(r => r.serviceType === t.value).length;
    });

    return (
        <div className="p-6 bg-white min-h-screen font-inter">
            <PageHeader
                title="Seller Service Requests"
                description="Manage logistics, conference, stall booking, and other seller service requests"
            />

            <div className="mt-6 space-y-4">
                {/* Type Filter Tabs */}
                <div className="bg-white border-2 border-gray-200 rounded-[2px] px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider mr-1">Type:</span>
                        {SERVICE_TYPES.map(t => (
                            <button
                                key={t.value}
                                onClick={() => setTypeFilter(t.value)}
                                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-[2px] border-2 transition-all flex items-center gap-1.5 ${
                                    typeFilter === t.value
                                        ? 'bg-[#23471d] text-white border-[#23471d]'
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {t.label}
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                                    typeFilter === t.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {counts[t.value] || 0}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search + Status Filter */}
                <div className="bg-white border-2 border-gray-200 rounded-[2px] px-4 py-3 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search by company, service name, reg ID..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-[2px] text-xs font-medium outline-none focus:border-[#23471d]"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-[2px] text-xs font-bold outline-none focus:border-[#23471d]"
                        >
                            {STATUS_OPTIONS.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={fetchRequests}
                        className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 text-xs font-black uppercase rounded-[2px] hover:bg-gray-50 transition-all"
                    >
                        <RefreshCw size={12} /> Refresh
                    </button>
                    <span className="ml-auto text-[10px] font-black text-gray-400 uppercase">
                        {requests.length} records
                    </span>
                </div>

                {/* Table */}
                <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                        <h2 className="text-white font-bold text-sm uppercase tracking-tight">
                            {SERVICE_TYPES.find(t => t.value === typeFilter)?.label || 'All Service Requests'}
                        </h2>
                        <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 uppercase tracking-wider">
                            {requests.length} RECORDS
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm" style={{ minWidth: '900px' }}>
                            <thead>
                                <tr className="border-b-2 border-gray-200 bg-gray-50">
                                    <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase text-center w-10">#</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase text-left">Exhibitor</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase text-left">Service</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase text-left">Type</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase text-left">Details</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase text-center">Status</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase text-left">Date</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={8} className="py-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest italic">Loading...</td></tr>
                                ) : paginated.length === 0 ? (
                                    <tr><td colSpan={8} className="py-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest italic">No requests found</td></tr>
                                ) : paginated.map((req, i) => (
                                    <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 text-gray-400 font-bold text-center text-xs">
                                            {(currentPage - 1) * PAGE_SIZE + i + 1}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm font-black text-red-600 uppercase leading-none">
                                                {req.exhibitor?.name || '—'}
                                            </p>
                                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                                                {req.exhibitor?.registrationId || '—'}
                                            </p>
                                            {req.exhibitor?.email && (
                                                <p className="text-[10px] text-gray-400 mt-0.5">{req.exhibitor.email}</p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-xs font-black text-gray-800 uppercase">{req.serviceName}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-[2px] border ${TYPE_STYLE[req.serviceType] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                {req.serviceType?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 max-w-[200px]">
                                            {req.details && Object.keys(req.details).length > 0 ? (
                                                <div className="text-[10px] text-gray-600 space-y-0.5">
                                                    {Object.entries(req.details).slice(0, 3).map(([k, v]) => (
                                                        <div key={k} className="flex gap-1">
                                                            <span className="text-gray-400 font-bold capitalize shrink-0">{k.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                                            <span className="font-medium truncate">{String(v)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : <span className="text-gray-300 text-xs">—</span>}
                                            {req.adminNote && (
                                                <p className="text-[9px] text-blue-600 font-bold mt-1 italic">Note: {req.adminNote}</p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${STATUS_STYLE[req.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                {req.status || 'pending'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <span className="text-xs text-gray-500 font-bold">
                                                {req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-IN', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                }) : '—'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <button
                                                onClick={() => handleStatusUpdate(req._id, req.status || 'pending')}
                                                className="px-3 py-1.5 bg-[#23471d] text-white text-[9px] font-black uppercase rounded-[2px] hover:bg-[#1a3516] transition-all"
                                            >
                                                Update
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                            Showing <span className="text-red-600">{requests.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(currentPage * PAGE_SIZE, requests.length)}</span> of <span className="text-red-600">{requests.length}</span>
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1.5">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                    className="px-3 py-1.5 border border-gray-200 bg-white text-xs font-black disabled:opacity-30 hover:bg-gray-50 rounded-[2px]">
                                    Prev
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i} onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 text-[11px] font-black border rounded-[2px] transition-all ${
                                            currentPage === i + 1 ? 'bg-[#23471d] text-white border-[#23471d]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                                        }`}>
                                        {i + 1}
                                    </button>
                                ))}
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 border border-gray-200 bg-white text-xs font-black disabled:opacity-30 hover:bg-gray-50 rounded-[2px]">
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
