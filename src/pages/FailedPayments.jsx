import { useState, useEffect } from 'react';
import api from "../lib/api";
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Eye, Mail, Phone, Search, RefreshCw, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Swal from 'sweetalert2';

const PAGE_SIZE = 15;

const FailedPayments = () => {
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => { fetchFailed(); }, []);

    const fetchFailed = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/api/exhibitor-registration');
            if (res.data.success) {
                setRecords(res.data.data.filter(r => r.status === 'payment-failed'));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetryStatus = async (id) => {
        try {
            await api.put(`/api/exhibitor-registration/${id}`, { status: 'pending' });
            Swal.fire({ icon: 'success', title: 'Moved to Pending', timer: 1200, showConfirmButton: false });
            fetchFailed();
        } catch {
            Swal.fire('Error', 'Failed to update status', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete this record?',
            text: 'This failed payment entry will be permanently removed.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });
        if (!result.isConfirmed) return;
        try {
            await api.delete(`/api/exhibitor-registration/${id}`);
            Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
            fetchFailed();
        } catch {
            Swal.fire('Error', 'Failed to delete', 'error');
        }
    };

    const filtered = records.filter(r =>
        (r.exhibitorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.contact1?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.contact1?.mobile || '').includes(searchTerm) ||
        (r.eventId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const fmt = (r, n) => `${r.participation?.currency === 'USD' ? '$' : '₹'} ${Number(n || 0).toLocaleString('en-IN')}`;

    return (
        <div className="p-6 bg-white min-h-screen font-inter">
            <PageHeader
                title="FAILED PAYMENTS"
                description="Exhibitor registrations where online payment was attempted but failed"
            />

            {/* Stats Bar */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-[2px]">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Total Failed</p>
                    <p className="text-2xl font-black text-rose-700">{records.length}</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-[2px]">
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Total Lost Amount</p>
                    <p className="text-lg font-black text-amber-700">
                        ₹ {records.filter(r => r.participation?.currency !== 'USD').reduce((s, r) => s + (r.participation?.total || 0), 0).toLocaleString('en-IN')}
                    </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-[2px]">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Today's Failed</p>
                    <p className="text-2xl font-black text-slate-700">
                        {records.filter(r => new Date(r.createdAt).toDateString() === new Date().toDateString()).length}
                    </p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-[2px]">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Online Mode</p>
                    <p className="text-2xl font-black text-indigo-700">
                        {records.filter(r => r.paymentMode === 'online').length}
                    </p>
                </div>
            </div>

            {/* Search + Refresh */}
            <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, mobile, event..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 focus:border-rose-400 outline-none text-xs font-bold rounded-[2px]"
                    />
                </div>
                <button
                    onClick={fetchFailed}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-widest rounded-[2px] transition-all"
                >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
            </div>

            {/* Table */}
            <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-rose-700 px-5 py-3 flex items-center justify-between">
                    <h2 className="text-white font-bold flex items-center gap-2 uppercase tracking-tight text-sm">
                        <AlertTriangle className="w-4 h-4" /> Failed Payment Entries
                    </h2>
                    <span className="bg-white text-rose-700 text-[10px] font-black px-3 py-1 uppercase tracking-wider">
                        {filtered.length} RECORDS
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm font-inter">
                        <thead>
                            <tr className="border-b-2 border-gray-200 bg-gray-50">
                                <th className="py-3 px-4 text-[10px] font-black text-black uppercase tracking-tight text-center w-10">#</th>
                                <th className="py-3 px-4 text-[10px] font-black text-black uppercase tracking-tight text-left">Exhibitor</th>
                                <th className="py-3 px-4 text-[10px] font-black text-black uppercase tracking-tight text-left">Contact</th>
                                <th className="py-3 px-4 text-[10px] font-black text-black uppercase tracking-tight text-left">Stall</th>
                                <th className="py-3 px-4 text-[10px] font-black text-black uppercase tracking-tight text-center">Amount</th>
                                <th className="py-3 px-4 text-[10px] font-black text-black uppercase tracking-tight text-center">Date</th>
                                <th className="py-3 px-4 text-[10px] font-black text-black uppercase tracking-tight text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={7} className="py-12 text-center text-[11px] text-slate-400 font-bold uppercase tracking-widest">Loading...</td></tr>
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <AlertTriangle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No failed payment records found</p>
                                    </td>
                                </tr>
                            ) : paginated.map((row, idx) => (
                                <tr key={row._id} className="hover:bg-rose-50/30 transition-colors">
                                    <td className="py-3 px-4 text-center text-xs font-black text-slate-400">
                                        {(currentPage - 1) * PAGE_SIZE + idx + 1}
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="font-bold text-red-600 text-sm uppercase leading-none mb-1">{row.exhibitorName}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{row.eventId?.name || 'N/A'}</p>
                                        <p className="text-[9px] text-slate-500 font-medium mt-0.5">{row.registrationId || '—'}</p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold mb-1">
                                            <Mail className="w-3 h-3 text-slate-400" /> {row.contact1?.email || '—'}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                                            <Phone className="w-3 h-3 text-slate-400" /> {row.contact1?.mobile || '—'}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="text-xs font-bold text-[#d26019] uppercase">{row.participation?.stallFor || 'N/A'}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">{row.participation?.stallType} · {row.participation?.stallSize} sqm</p>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <p className="text-sm font-black text-slate-800">{fmt(row, row.participation?.total)}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                            {row.paymentType === 'advance' ? `Advance (${row.advancePercentage || 50}%)` : 'Full'}
                                        </p>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <p className="text-xs font-bold text-slate-600">
                                            {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                        </p>
                                        <p className="text-[9px] text-slate-400 font-medium">
                                            {row.createdAt ? new Date(row.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => navigate(`/exhibitor-booking/${row._id}`)}
                                                title="View Details"
                                                className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-[2px] transition-all"
                                            >
                                                <Eye className="w-4 h-4 text-slate-600" />
                                            </button>
                                            <button
                                                onClick={() => handleRetryStatus(row._id)}
                                                title="Move to Pending (Retry)"
                                                className="p-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-[2px] transition-all"
                                            >
                                                <RefreshCw className="w-4 h-4 text-amber-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(row._id)}
                                                title="Delete Record"
                                                className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-[2px] transition-all"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            Page {currentPage} of {totalPages} · {filtered.length} records
                        </span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-[10px] font-black border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 rounded-[2px] uppercase tracking-widest"
                            >
                                Prev
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-[10px] font-black border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 rounded-[2px] uppercase tracking-widest"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FailedPayments;
