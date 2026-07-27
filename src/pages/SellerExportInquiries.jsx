import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import Swal from 'sweetalert2';
import { Search, RefreshCw, Filter, Globe, Package, Award } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const STATUS_OPTIONS = [
    { value: 'all',       label: 'All Status' },
    { value: 'pending',   label: 'Pending' },
    { value: 'reviewed',  label: 'Reviewed' },
    { value: 'contacted', label: 'Contacted' },
];

const STATUS_STYLE = {
    pending:   'bg-amber-50 text-amber-700 border-amber-200',
    reviewed:  'bg-blue-50 text-blue-700 border-blue-200',
    contacted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const EXP_STYLE = {
    beginner:     'bg-slate-50 text-slate-600 border-slate-200',
    intermediate: 'bg-orange-50 text-orange-600 border-orange-200',
    expert:       'bg-purple-50 text-purple-700 border-purple-200',
};

const PAGE_SIZE = 15;

export default function SellerExportInquiries() {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchInquiries = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (searchTerm) params.append('search', searchTerm);
            const res = await api.get(`/api/seller-portal/admin/export-inquiries?${params}`);
            if (res.data.success) setInquiries(res.data.data || []);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, searchTerm]);

    useEffect(() => { fetchInquiries(); }, [fetchInquiries]);
    useEffect(() => { setCurrentPage(1); }, [statusFilter, searchTerm]);

    const handleStatusUpdate = async (id, currentStatus) => {
        const { value: newStatus } = await Swal.fire({
            title: 'Update Status',
            input: 'select',
            inputOptions: { pending: 'Pending', reviewed: 'Reviewed', contacted: 'Contacted' },
            inputValue: currentStatus,
            showCancelButton: true,
            confirmButtonColor: '#23471d',
            confirmButtonText: 'Update',
        });
        if (!newStatus) return;

        const { value: adminNote } = await Swal.fire({
            title: 'Admin Note (Optional)',
            input: 'textarea',
            inputPlaceholder: 'Add a note for this inquiry...',
            showCancelButton: true,
            confirmButtonColor: '#23471d',
            confirmButtonText: 'Save',
        });

        try {
            await api.patch(`/api/seller-portal/admin/export-inquiries/${id}/status`, {
                status: newStatus,
                adminNote: adminNote || ''
            });
            Swal.fire({ icon: 'success', title: 'Updated!', timer: 1200, showConfirmButton: false });
            fetchInquiries();
        } catch {
            Swal.fire('Error', 'Failed to update status', 'error');
        }
    };

    const totalPages = Math.ceil(inquiries.length / PAGE_SIZE);
    const paginated = inquiries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <div className="p-6 bg-white min-h-screen font-inter">
            <PageHeader
                title="Seller Export Inquiries"
                description="Manage product export inquiries submitted by sellers through the portal"
            />

            <div className="mt-6 space-y-4">
                {/* Search + Filter */}
                <div className="bg-white border-2 border-gray-200 rounded-[2px] px-4 py-3 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search by company, brand, reg ID..."
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
                    <button onClick={fetchInquiries}
                        className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 text-xs font-black uppercase rounded-[2px] hover:bg-gray-50 transition-all">
                        <RefreshCw size={12} /> Refresh
                    </button>
                    <span className="ml-auto text-[10px] font-black text-gray-400 uppercase">
                        {inquiries.length} records
                    </span>
                </div>

                {/* Table */}
                <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                        <h2 className="text-white font-bold text-sm uppercase tracking-tight flex items-center gap-2">
                            <Globe size={14} /> Export Inquiries
                        </h2>
                        <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 uppercase tracking-wider">
                            {inquiries.length} RECORDS
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm" style={{ minWidth: '1000px' }}>
                            <thead>
                                <tr className="border-b-2 border-gray-200 bg-gray-50">
                                    <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase text-center w-10">#</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase text-left">Exhibitor</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase text-left">Brand & Contact</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase text-left">Product Categories</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase text-left">Target Regions</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase text-left">Experience</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase text-left">Certifications</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase text-center">Status</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase text-left">Date</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={10} className="py-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest italic">Loading...</td></tr>
                                ) : paginated.length === 0 ? (
                                    <tr><td colSpan={10} className="py-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest italic">No inquiries found</td></tr>
                                ) : paginated.map((inq, i) => (
                                    <tr key={inq._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 text-gray-400 font-bold text-center text-xs">
                                            {(currentPage - 1) * PAGE_SIZE + i + 1}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm font-black text-red-600 uppercase leading-none">
                                                {inq.exhibitor?.name || '—'}
                                            </p>
                                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                                                {inq.exhibitor?.registrationId || '—'}
                                            </p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-xs font-black text-gray-800 uppercase">{inq.brandName}</p>
                                            <p className="text-[10px] text-gray-500 mt-0.5">{inq.contactPerson}</p>
                                            <p className="text-[10px] text-gray-400">{inq.email}</p>
                                            <p className="text-[10px] text-gray-400">{inq.phone}</p>
                                        </td>
                                        <td className="py-3 px-4 max-w-[160px]">
                                            <div className="flex flex-wrap gap-1">
                                                {(inq.productCategories || []).map((c, j) => (
                                                    <span key={j} className="text-[8px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded uppercase">{c}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 max-w-[160px]">
                                            <div className="flex flex-wrap gap-1">
                                                {(inq.targetCountries || []).map((c, j) => (
                                                    <span key={j} className="text-[8px] font-black px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded uppercase">{c}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {inq.exportExperience && (
                                                <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase ${EXP_STYLE[inq.exportExperience] || EXP_STYLE.beginner}`}>
                                                    {inq.exportExperience}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 max-w-[140px]">
                                            <div className="flex flex-wrap gap-1">
                                                {(inq.certifications || []).map((c, j) => (
                                                    <span key={j} className="text-[8px] font-black px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded uppercase">{c}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${STATUS_STYLE[inq.status] || STATUS_STYLE.pending}`}>
                                                {inq.status || 'pending'}
                                            </span>
                                            {inq.adminNote && (
                                                <p className="text-[9px] text-blue-600 font-bold mt-1 italic max-w-[100px] truncate">{inq.adminNote}</p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <span className="text-xs text-gray-500 font-bold">
                                                {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString('en-IN', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                }) : '—'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <button
                                                onClick={() => handleStatusUpdate(inq._id, inq.status || 'pending')}
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
                            Showing <span className="text-red-600">{inquiries.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(currentPage * PAGE_SIZE, inquiries.length)}</span> of <span className="text-red-600">{inquiries.length}</span>
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
