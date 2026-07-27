import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Banknote, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3,
    Eye, FileCheck2, Filter, IndianRupee, Loader2, MoreVertical, Plus,
    RefreshCw, Search, WalletCards, XCircle,
} from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const money = (value) => `₹ ${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
}).format(Number(value) || 0)}`;

const dateText = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? '-'
        : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
};

const STATUS_CLASS = {
    Reimbursed: 'bg-emerald-50 text-emerald-700',
    Approved: 'bg-amber-50 text-amber-700',
    'Pending Approval': 'bg-rose-50 text-rose-700',
    Rejected: 'bg-red-50 text-red-700',
    Draft: 'bg-slate-100 text-slate-600',
};

const StatCard = ({ icon, label, value, note, iconClass }) => (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-2 min-w-0">
        <div className="flex items-start gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconClass}`}>{icon}</div>
            <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-600 truncate">{label}</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5 whitespace-nowrap">{value}</div>
                <div className="text-[11px] font-medium text-slate-400 mt-0.5">{note}</div>
            </div>
        </div>
    </div>
);

const ImprestView = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');
    const [status, setStatus] = useState('');
    const [department, setDepartment] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/imprest');
            setRequests(response.data?.data || []);
            setSummary(response.data?.summary || {});
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load imprest requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
        api.get('/api/departments')
            .then((response) => {
                const rows = response.data?.data || [];
                setDepartmentOptions(rows.filter((item) => !item.status || item.status === 'Active'));
            })
            .catch(() => setDepartmentOptions([]));
    }, []);

    const departments = useMemo(() => {
        const names = [
            ...departmentOptions.map((item) => item.name),
            ...requests.map((item) => item.department),
        ].filter(Boolean);
        return [...new Set(names)];
    }, [departmentOptions, requests]);

    const filtered = requests.filter((item) => {
        if (activeTab !== 'All' && item.status !== activeTab) return false;
        if (type && item.requestType !== type) return false;
        if (status && item.status !== status) return false;
        if (department && item.department !== department) return false;
        if (!search) return true;
        const query = search.toLowerCase();
        return [item.requestNo, item.purpose, item.employeeName, item.employeeId]
            .some((value) => String(value || '').toLowerCase().includes(query));
    });

    const handleUpdateStatus = async (id, currentAmount, isApprove) => {
        if (isApprove) {
            const { value: formValues } = await Swal.fire({
                title: 'Approve Request',
                html: `
                    <div class="text-left mb-2 text-sm font-semibold text-slate-700">Approved Amount</div>
                    <input id="swal-amount" type="number" class="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 mb-4" value="${currentAmount || ''}" placeholder="Enter approved amount" />
                    
                    <div class="text-left mb-2 text-sm font-semibold text-slate-700">Remarks (Optional)</div>
                    <textarea id="swal-remarks" class="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px]" placeholder="Enter remarks..."></textarea>
                `,
                showCancelButton: true,
                confirmButtonText: 'Approve',
                confirmButtonColor: '#059669',
                cancelButtonColor: '#64748b',
                focusConfirm: false,
                preConfirm: () => {
                    const amount = document.getElementById('swal-amount').value;
                    const remarks = document.getElementById('swal-remarks').value;
                    if (!amount || amount <= 0) {
                        Swal.showValidationMessage('Please enter a valid approved amount');
                        return false;
                    }
                    return { approvedAmount: amount, approverRemarks: remarks };
                }
            });

            if (formValues) {
                try {
                    await api.patch(`/api/imprest/${id}/status`, {
                        status: 'Approved',
                        approvedAmount: formValues.approvedAmount,
                        approverRemarks: formValues.approverRemarks
                    });
                    toast.success('Request approved successfully');
                    loadRequests();
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to approve request');
                }
            }
        } else {
            const { value: remarks } = await Swal.fire({
                title: 'Reject Request',
                input: 'textarea',
                inputLabel: 'Reason for Rejection',
                inputPlaceholder: 'Enter reason here...',
                showCancelButton: true,
                confirmButtonText: 'Reject',
                confirmButtonColor: '#e11d48',
                cancelButtonColor: '#64748b',
                inputValidator: (value) => {
                    if (!value) {
                        return 'You need to write a reason for rejection!';
                    }
                }
            });

            if (remarks) {
                try {
                    await api.patch(`/api/imprest/${id}/status`, {
                        status: 'Rejected',
                        approverRemarks: remarks
                    });
                    toast.success('Request rejected successfully');
                    loadRequests();
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to reject request');
                }
            }
        }
    };


    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const firstIndex = (currentPage - 1) * itemsPerPage;
    const visibleRows = filtered.slice(firstIndex, firstIndex + itemsPerPage);
    const countByStatus = (value) => requests.filter((item) => item.status === value).length;
    const openingBalance = Math.max(
        0,
        Number(summary.totalReimbursed || 0) + Number(summary.totalPending || 0),
    );
    // Money already approved/disbursed to employees that hasn't been reimbursed/settled yet —
    // NOT the same as "Total Pending" (requests still awaiting approval).
    const balanceInHand = Math.max(0, Number(summary.totalApproved || 0) - Number(summary.totalReimbursed || 0));

    const resetFilters = () => {
        setSearch('');
        setType('');
        setStatus('');
        setDepartment('');
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-2 font-sans text-slate-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Imprest (Petty Cash) / Reimbursement</h1>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                        <span>Accounts</span><ChevronRight className="w-3 h-3" />
                        <span className="text-blue-600 font-bold">Imprest Reimbursement</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700">
                        <CalendarDays className="w-4 h-4 text-slate-500" /> This Month
                    </button>
                    <button onClick={resetFilters} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-blue-600">
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                    <button onClick={() => navigate('/accounts/imprest/create')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm">
                        <Plus className="w-4 h-4" /> New Imprest Request
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-2">
                <main className="w-full lg:w-[82%] space-y-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-1.5">
                        <StatCard icon={<FileCheck2 className="w-4 h-4" />} iconClass="bg-blue-50 text-blue-600" label="Total Requests" value={requests.length} note="All Time" />
                        <StatCard icon={<IndianRupee className="w-4 h-4" />} iconClass="bg-emerald-50 text-emerald-600" label="Total Amount Requested" value={money(summary.totalRequested)} note="All Time" />
                        <StatCard icon={<CheckCircle2 className="w-4 h-4" />} iconClass="bg-amber-50 text-amber-600" label="Total Approved" value={money(summary.totalApproved)} note="All Time" />
                        <StatCard icon={<WalletCards className="w-4 h-4" />} iconClass="bg-purple-50 text-purple-600" label="Total Reimbursed" value={money(summary.totalReimbursed)} note="All Time" />
                        <StatCard icon={<Clock3 className="w-4 h-4" />} iconClass="bg-rose-50 text-rose-600" label="Total Pending" value={money(summary.totalPending)} note="All Time" />
                        <StatCard icon={<Clock3 className="w-4 h-4" />} iconClass="bg-cyan-50 text-cyan-600" label="Average Settlement Time" value={`${summary.averageSettlementDays || 0} Days`} note="All Time" />
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-2 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search request no., purpose, employee..." className="w-[250px] pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-[11px] outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <select value={type} onChange={(e) => { setType(e.target.value); setCurrentPage(1); }} className="px-3 py-1.5 border border-slate-300 rounded-md bg-white text-[11px] font-medium">
                                <option value="">Request Type</option>
                                <option>Advance Request</option><option>Expense Claim</option><option>Reimbursement</option>
                            </select>
                            <select value={status} onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }} className="px-3 py-1.5 border border-slate-300 rounded-md bg-white text-[11px] font-medium">
                                <option value="">Status</option>
                                {['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Reimbursed'].map((item) => <option key={item}>{item}</option>)}
                            </select>
                            <select value={department} onChange={(e) => { setDepartment(e.target.value); setCurrentPage(1); }} className="px-3 py-1.5 border border-slate-300 rounded-md bg-white text-[11px] font-medium">
                                <option value="">Department</option>
                                {departments.map((item) => <option key={item}>{item}</option>)}
                            </select>
                            <button onClick={resetFilters} className="ml-auto flex items-center gap-1 text-[11px] font-bold text-blue-600 px-2">
                                <RefreshCw className="w-3 h-3" /> Clear All
                            </button>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-2 flex-wrap">
                            {[
                                ['All', 'All Requests', requests.length],
                                ['Pending Approval', 'Pending Approval', countByStatus('Pending Approval')],
                                ['Approved', 'Approved', countByStatus('Approved')],
                                ['Reimbursed', 'Reimbursed', countByStatus('Reimbursed')],
                                ['Rejected', 'Rejected', countByStatus('Rejected')],
                            ].map(([key, label, count]) => (
                                <button key={key} onClick={() => { setActiveTab(key); setCurrentPage(1); }} className={`px-3 py-1.5 rounded-md text-[10px] font-bold border ${activeTab === key ? 'bg-blue-50 text-blue-700 border-blue-400' : 'bg-white text-slate-600 border-slate-200'}`}>
                                    {label} <span className="ml-1 text-slate-400">{count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-wider text-slate-600 border-b border-slate-200">
                                    {['Request No.', 'Employee', 'Department', 'Purpose', 'Request Date', 'Amount', 'Approved Amount', 'Status', 'Action'].map((head) => (
                                        <th key={head} className={`px-2 py-3 font-bold ${['Amount', 'Approved Amount'].includes(head) ? 'text-right' : ''}`}>{head}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="text-[12px]">
                                {loading ? (
                                    <tr><td colSpan="9" className="py-12 text-center text-slate-500"><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Loading requests...</td></tr>
                                ) : visibleRows.length === 0 ? (
                                    <tr><td colSpan="9" className="py-12 text-center text-slate-500">No imprest requests found.</td></tr>
                                ) : visibleRows.map((item) => (
                                    <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50/60">
                                        <td className="px-2 py-2.5 font-bold text-blue-600">{item.requestNo}</td>
                                        <td className="px-2 py-2.5"><div className="font-bold text-slate-800">{item.employeeName}</div></td>
                                        <td className="px-2 py-2.5 font-medium text-slate-600">{item.department}</td>
                                        <td className="px-2 py-2.5 font-medium text-slate-700 max-w-[220px] truncate">{item.purpose}</td>
                                        <td className="px-2 py-2.5 font-semibold text-slate-600 whitespace-nowrap">{dateText(item.requestDate)}</td>
                                        <td className="px-2 py-2.5 font-bold text-slate-800 text-right whitespace-nowrap">{money(item.requestedAmount)}</td>
                                        <td className="px-2 py-2.5 font-bold text-slate-700 text-right whitespace-nowrap">{item.approvedAmount ? money(item.approvedAmount) : '-'}</td>
                                        <td className="px-2 py-2.5"><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_CLASS[item.status] || STATUS_CLASS.Draft}`}>{item.status}</span></td>
                                        <td className="px-2 py-2.5">
                                            <div className="flex items-center gap-1.5">
                                                <button className="w-7 h-7 flex items-center justify-center border border-blue-100 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors" title="View request"><Eye className="w-4 h-4" /></button>
                                                {item.status === 'Pending Approval' && (
                                                    <>
                                                        <button onClick={() => handleUpdateStatus(item._id, item.requestedAmount, true)} className="w-7 h-7 flex items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition-colors" title="Approve Request">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleUpdateStatus(item._id, null, false)} className="w-7 h-7 flex items-center justify-center border border-rose-200 bg-rose-50 text-rose-600 rounded hover:bg-rose-100 transition-colors" title="Reject Request">
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button className="w-7 h-7 flex items-center justify-center border border-slate-200 text-slate-500 rounded hover:bg-slate-50 transition-colors" title="More actions"><MoreVertical className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex items-center justify-between gap-3 p-3 border-t border-slate-200 text-[10px] text-slate-500">
                            <span>Showing {filtered.length ? firstIndex + 1 : 0} to {Math.min(firstIndex + itemsPerPage, filtered.length)} of {filtered.length} entries</span>
                            <div className="flex items-center gap-1">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="w-7 h-7 border border-slate-300 rounded flex items-center justify-center disabled:opacity-40"><ChevronLeft className="w-3.5 h-3.5" /></button>
                                {Array.from({ length: Math.max(1, totalPages) }, (_, index) => index + 1).slice(0, 5).map((page) => <button key={page} onClick={() => setCurrentPage(page)} className={`w-7 h-7 rounded font-bold ${page === currentPage ? 'bg-blue-600 text-white' : 'border border-slate-300 text-slate-600'}`}>{page}</button>)}
                                <button disabled={!totalPages || currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="w-7 h-7 border border-slate-300 rounded flex items-center justify-center disabled:opacity-40"><ChevronRight className="w-3.5 h-3.5" /></button>
                            </div>
                            <label className="flex items-center gap-2">Rows per page
                                <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="border border-slate-300 rounded px-2 py-1 bg-white"><option value="10">10</option><option value="20">20</option><option value="50">50</option></select>
                            </label>
                        </div>
                    </div>
                </main>

                <aside className="w-full lg:w-[18%] flex flex-col gap-2">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-3">
                        <h2 className="text-sm font-semibold text-slate-800 mb-3">Imprest Summary</h2>
                        <div className="space-y-3">
                            {[
                                ['Opening Balance', openingBalance, 'text-blue-600'],
                                ['Total Disbursed', summary.totalApproved, 'text-amber-600'],
                                ['Total Reimbursed', summary.totalReimbursed, 'text-emerald-600'],
                                ['Balance in Hand', balanceInHand, 'text-purple-600'],
                            ].map(([label, value, color]) => <div key={label} className="flex justify-between gap-2"><span className="text-[11px] font-semibold text-slate-500">{label}</span><span className={`text-[11px] font-bold ${color}`}>{money(value)}</span></div>)}
                        </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-3">
                        <h2 className="text-sm font-semibold text-slate-800 mb-3">Quick Actions</h2>
                        <button onClick={() => navigate('/accounts/imprest/create')} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 text-left">
                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded flex items-center justify-center shrink-0"><Plus className="w-4 h-4" /></div>
                            <div><div className="text-[12px] font-bold text-slate-700">New Request</div><div className="text-[10px] text-slate-400">Raise a new request</div></div>
                        </button>
                        <button onClick={loadRequests} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-left">
                            <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded flex items-center justify-center shrink-0"><RefreshCw className="w-4 h-4" /></div>
                            <div><div className="text-[12px] font-bold text-slate-700">Refresh Data</div><div className="text-[10px] text-slate-400">Load latest records</div></div>
                        </button>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-3">
                        <h2 className="text-sm font-semibold text-slate-800 mb-2">Requests by Status</h2>
                        <div className="space-y-2">
                            {[['Reimbursed', summary.reimbursedCount, 'bg-emerald-500'], ['Approved', summary.approvedCount, 'bg-amber-500'], ['Pending', summary.pendingCount, 'bg-rose-500'], ['Rejected', summary.rejectedCount, 'bg-red-500']].map(([label, count, color]) => (
                                <div key={label} className="flex items-center justify-between text-[11px]"><span className="flex items-center gap-2 text-slate-600 font-semibold"><span className={`w-2 h-2 rounded-full ${color}`} />{label}</span><span className="font-bold text-slate-800">{count || 0}</span></div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default ImprestView;
