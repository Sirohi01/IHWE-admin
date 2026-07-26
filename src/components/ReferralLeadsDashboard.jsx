import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Plus, Users, Trophy, Bookmark, DollarSign, Clock, 
  Eye, MoreVertical, Info, Headphones, CheckCircle2, CircleDot, Edit2, Trash2, Tag, Building2, User, Phone, Mail
} from 'lucide-react';
import api from '../lib/api';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const ReferralLeadsDashboard = ({ title, description }) => {
    const [referrals, setReferrals] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [conversionFilter, setConversionFilter] = useState('All');
    const [sourceFilter, setSourceFilter] = useState('All');

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingReferral, setEditingReferral] = useState(null);

    useEffect(() => {
        fetchReferrals();
    }, []);

    const fetchReferrals = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/api/referrals');
            if (response.data.success) {
                setReferrals(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching referrals:", error);
            toast.error("Failed to load referrals");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Referral?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });
        if (!result.isConfirmed) return;

        try {
            setIsLoading(true);
            const response = await api.delete(`/api/referrals/${id}`);
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
                fetchReferrals();
            }
        } catch (error) {
            toast.error("Failed to delete referral");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (ref) => {
        setEditingReferral(ref);
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const response = await api.put(`/api/referrals/${editingReferral._id}`, editingReferral);
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: 'Updated!', timer: 1200, showConfirmButton: false });
                setIsEditModalOpen(false);
                fetchReferrals();
            }
        } catch (error) {
            toast.error("Failed to update referral");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredReferrals = referrals.filter(ref => {
        const term = searchTerm.toLowerCase();
        const matchSearch = 
            (ref.companyName?.toLowerCase().includes(term)) ||
            (ref.contactPerson?.toLowerCase().includes(term)) ||
            (ref.mobileNumber?.includes(term)) ||
            (ref.emailId?.toLowerCase().includes(term));
            
        const matchStatus = statusFilter === 'All' || ref.status === statusFilter;
        const matchConv = conversionFilter === 'All' || ref.conversionStatus === conversionFilter;
        const matchSource = sourceFilter === 'All' || ref.leadSource === sourceFilter;

        return matchSearch && matchStatus && matchConv && matchSource;
    });

    // Calculated Stats
    const totalLeads = referrals.length;
    const convertedLeads = referrals.filter(r => r.conversionStatus === 'Converted').length;
    const stallBookings = referrals.filter(r => r.conversionStatus === 'Stall Booked' || r.conversionStatus === 'Converted').length;
    const totalBonus = referrals.reduce((acc, curr) => acc + (curr.referralBonus || 0), 0);
    const pendingBonus = referrals.filter(r => r.conversionStatus !== 'Converted').reduce((acc, curr) => acc + (curr.referralBonus || 0), 0);
    const conversionRate = totalLeads ? ((convertedLeads / totalLeads) * 100).toFixed(2) : 0;
    const totalEstValue = referrals.reduce((acc, curr) => acc + (curr.estValue || 0), 0);

    const getStatusStyle = (status) => {
        const s = (status || "").toLowerCase();
        if (s.includes('active') || s.includes('new')) return "text-blue-600 bg-blue-50 border-blue-100";
        if (s.includes('contacted')) return "text-orange-600 bg-orange-50 border-orange-100";
        if (s.includes('discussion')) return "text-purple-600 bg-purple-50 border-purple-100";
        if (s.includes('proposal')) return "text-teal-600 bg-teal-50 border-teal-100";
        if (s.includes('converted') || s.includes('booked')) return "text-green-600 bg-green-50 border-green-100";
        if (s.includes('progress') || s.includes('inactive')) return "text-amber-600 bg-amber-50 border-amber-100";
        return "text-gray-600 bg-gray-50 border-gray-100";
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden bg-[#F8FAFC] flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all">
                        <Info size={16} className="text-gray-500" />
                        Referral Scheme Info
                    </button>
                    <button onClick={() => { setEditingReferral({}); setIsEditModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#175C34] hover:bg-[#124B29] text-white rounded-lg text-sm font-semibold shadow-sm transition-all">
                        <Plus size={16} />
                        Add New Referral Lead
                    </button>
                </div>
            </div>

            <div className="p-3 max-w-[1600px] w-full mx-auto flex flex-col flex-1 min-h-0">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3 shrink-0">
                    {/* Stat Card 1 */}
                    <div className="bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-green-500 opacity-80"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                <Users className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 leading-none uppercase tracking-wider mb-0.5">Total Leads Referred</p>
                                <h3 className="text-lg font-black text-gray-800 leading-none mt-1">{totalLeads}</h3>
                                <p className="text-[9px] font-semibold text-green-600 mt-1 leading-none cursor-pointer hover:underline">View all leads</p>
                            </div>
                        </div>
                    </div>
                    {/* Stat Card 2 */}
                    <div className="bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-orange-400 opacity-80"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                                <Trophy className="w-4 h-4 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 leading-none uppercase tracking-wider mb-0.5">Converted Leads</p>
                                <h3 className="text-lg font-black text-gray-800 leading-none mt-1">{convertedLeads}</h3>
                                <p className="text-[9px] font-bold text-gray-400 mt-1 leading-none">{conversionRate}% Conversion</p>
                            </div>
                        </div>
                    </div>
                    {/* Stat Card 3 */}
                    <div className="bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-80"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <Bookmark className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 leading-none uppercase tracking-wider mb-0.5">Stall Bookings</p>
                                <h3 className="text-lg font-black text-gray-800 leading-none mt-1">{stallBookings}</h3>
                                <p className="text-[9px] font-bold text-gray-400 mt-1 leading-none">{formatCurrency(totalEstValue)} Total Value</p>
                            </div>
                        </div>
                    </div>
                    {/* Stat Card 4 */}
                    <div className="bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 opacity-80"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                                <DollarSign className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 leading-none uppercase tracking-wider mb-0.5">Referral Bonus Earned</p>
                                <h3 className="text-lg font-black text-gray-800 leading-none mt-1">{formatCurrency(totalBonus)}</h3>
                                <p className="text-[9px] font-bold text-gray-400 mt-1 leading-none">10% of Net Bookings</p>
                            </div>
                        </div>
                    </div>
                    {/* Stat Card 5 */}
                    <div className="bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-teal-400 opacity-80"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                                <Clock className="w-4 h-4 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 leading-none uppercase tracking-wider mb-0.5">Pending Bonus</p>
                                <h3 className="text-lg font-black text-gray-800 leading-none mt-1">{formatCurrency(pendingBonus)}</h3>
                                <p className="text-[9px] font-bold text-gray-400 mt-1 leading-none">On Bookings in Progress</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Row */}
                <div className="bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm flex flex-nowrap items-end gap-3 mb-3 shrink-0 overflow-x-auto">
                    <div className="relative w-[300px] shrink-0">
                        <label className="text-[10px] font-semibold text-gray-600 block mb-1">Search Leads</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by company, name, email, mobile..."
                                className="w-full pl-3 pr-8 py-1.5 border border-gray-200 rounded-md text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-300"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2" />
                        </div>
                    </div>
                    
                    <div className="w-[110px] shrink-0">
                        <label className="text-[10px] font-semibold text-gray-600 block mb-1">Status</label>
                        <select className="w-full border border-gray-200 rounded-md py-1.5 px-2 text-xs font-medium text-gray-700 focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%234A5568%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:calc(100%-6px)_center] bg-[length:12px_12px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="All">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="w-[140px] shrink-0">
                        <label className="text-[10px] font-semibold text-gray-600 block mb-1">Conversion Status</label>
                        <select className="w-full border border-gray-200 rounded-md py-1.5 px-2 text-xs font-medium text-gray-700 focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%234A5568%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:calc(100%-6px)_center] bg-[length:12px_12px]" value={conversionFilter} onChange={(e) => setConversionFilter(e.target.value)}>
                            <option value="All">All</option>
                            <option value="Open">Open</option>
                            <option value="Contacted">Contacted</option>
                            <option value="In Discussion">In Discussion</option>
                            <option value="Proposal Sent">Proposal Sent</option>
                            <option value="Under Negotiation">Under Negotiation</option>
                            <option value="Stall Booked">Stall Booked</option>
                            <option value="Payment Pending">Payment Pending</option>
                            <option value="Converted">Converted</option>
                            <option value="Lost">Lost</option>
                        </select>
                    </div>

                    <div className="w-[130px] shrink-0">
                        <label className="text-[10px] font-semibold text-gray-600 block mb-1">Lead Source</label>
                        <select className="w-full border border-gray-200 rounded-md py-1.5 px-2 text-xs font-medium text-gray-700 focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%234A5568%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:calc(100%-6px)_center] bg-[length:12px_12px]" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                            <option value="All">All</option>
                            <option value="Personal Network">Personal Network</option>
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="Exhibitor Referral">Exhibitor Referral</option>
                            <option value="Event / Seminar">Event / Seminar</option>
                        </select>
                    </div>

                    <div className="w-[190px] shrink-0">
                        <label className="text-[10px] font-semibold text-gray-600 block mb-1">Date Range</label>
                        <div className="flex items-center gap-1.5 border border-gray-200 rounded-md py-1.5 px-2.5 text-[11px] font-medium text-gray-700 bg-white cursor-pointer h-[30px]">
                            <Clock size={13} className="text-gray-500 shrink-0" />
                            <span className="whitespace-nowrap">01 Jan 2026 - 31 Dec 2026</span>
                        </div>
                    </div>

                    <div className="flex-1 flex justify-end shrink-0 min-w-[70px]">
                        <button onClick={() => {
                            setSearchTerm(''); setStatusFilter('All'); setConversionFilter('All'); setSourceFilter('All');
                        }} className="px-4 h-[30px] border border-gray-200 rounded-md text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                            Reset
                        </button>
                    </div>
                </div>

                {/* Main Content Split */}
                <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
                    
                    {/* Left - Table Area */}
                    <div className="flex-grow flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-0">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <h2 className="text-base font-bold text-gray-800">Referral Leads List</h2>
                        </div>
                        <div className="overflow-y-auto overflow-x-auto flex-1">
                            <table className="w-full text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="py-2 px-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider w-10">#</th>
                                        <th className="py-2 px-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Company / Contact</th>
                                        <th className="py-2 px-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Mobile / Email</th>
                                        <th className="py-2 px-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Lead Source</th>
                                        <th className="py-2 px-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="py-2 px-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Conversion Status</th>
                                        <th className="py-2 px-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Est. Stall Size</th>
                                        <th className="py-2 px-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Est. Value</th>
                                        <th className="py-2 px-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Referral Bonus (10%)</th>
                                        <th className="py-2 px-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Referred On</th>
                                        <th className="py-3 px-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading && referrals.length === 0 ? (
                                        <tr><td colSpan={11} className="py-10 text-center"><div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                                    ) : filteredReferrals.length === 0 ? (
                                        <tr><td colSpan={11} className="py-10 text-center text-gray-500 font-medium">No referral leads found.</td></tr>
                                    ) : filteredReferrals.map((ref, i) => (
                                        <tr key={ref._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-2 px-4 text-xs font-bold text-gray-400">{i + 1}</td>
                                            <td className="py-2 px-4">
                                                <div className="font-bold text-gray-800 text-[13px] hover:text-green-700">
                                                    <Link to={`/client-overview/${ref._id}`}>{ref.companyName}</Link>
                                                </div>
                                                <div className="text-gray-500 text-[11px] mt-0.5">{ref.contactPerson}</div>
                                            </td>
                                            <td className="py-2 px-4">
                                                <div className="text-gray-800 text-xs font-semibold">{ref.mobileNumber}</div>
                                                <div className="text-gray-500 text-[11px]">{ref.emailId || '-'}</div>
                                            </td>
                                            <td className="py-2 px-4">
                                                <span className="text-gray-700 text-[11px] font-medium">{ref.leadSource || 'Personal Network'}</span>
                                            </td>
                                            <td className="py-2 px-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusStyle(ref.status)}`}>
                                                    {ref.status === 'active' ? 'New Lead' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-2 px-4">
                                                <span className="text-gray-700 text-xs font-medium">{ref.conversionStatus || 'Open'}</span>
                                            </td>
                                            <td className="py-2 px-4">
                                                <span className="text-gray-600 text-xs font-semibold">{ref.estStallSize || '18 sqm'}</span>
                                            </td>
                                            <td className="py-2 px-4">
                                                <span className="text-gray-800 text-xs font-bold">{formatCurrency(ref.estValue || 198000)}</span>
                                            </td>
                                            <td className="py-2 px-4">
                                                <span className="text-green-700 text-xs font-bold">{ref.referralBonus ? formatCurrency(ref.referralBonus) : '-'}</span>
                                            </td>
                                            <td className="py-2 px-4">
                                                <span className="text-gray-600 text-[11px]">{new Date(ref.createdAt).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}</span>
                                            </td>
                                            <td className="py-2 px-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button onClick={() => handleEditClick(ref)} className="p-1.5 text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 hover:text-blue-700 transition-colors shadow-sm" title="Edit">
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button onClick={() => handleDelete(ref._id)} className="p-1.5 text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 hover:text-red-700 transition-colors shadow-sm" title="Delete">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-500 font-medium shrink-0">
                            Showing 1 to {filteredReferrals.length} of {totalLeads} entries
                        </div>
                    </div>

                    {/* Right - Sidebar */}
                    <div className="w-full lg:w-[260px] flex flex-col gap-2 shrink-0">
                        {/* Referral Programme Box */}
                        <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
                            <div className="flex items-center gap-1.5 mb-2">
                                <Trophy className="text-green-700 w-4 h-4" />
                                <h3 className="font-bold text-gray-900 text-xs">Referral Programme</h3>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="flex flex-col items-center">
                                    <div className="text-2xl font-black text-green-700 leading-none tracking-tighter">10%</div>
                                    <span className="text-[7px] text-green-700 font-bold uppercase mt-1 bg-green-50 px-1.5 py-0.5 rounded-sm border border-green-200">Referral</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-[10px] mb-0.5">Referral Bonus</h4>
                                    <p className="text-[9px] text-gray-500 leading-tight">Earn 10% on every successful stall booking from your referred leads.</p>
                                </div>
                            </div>
                        </div>

                        {/* Lead Status Guide */}
                        <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm flex-1 flex flex-col min-h-0 justify-center">
                            <div className="flex items-center gap-1.5 mb-2 shrink-0">
                                <Info className="text-[#093C5D] w-4 h-4" />
                                <h3 className="font-bold text-gray-900 text-xs">Lead Status Guide</h3>
                            </div>
                            <div className="flex flex-col justify-between flex-1">
                                <div className="flex items-start gap-1.5">
                                    <CircleDot size={10} className="text-blue-600 mt-[2px] shrink-0" />
                                    <div>
                                        <h5 className="text-[10px] font-bold text-blue-600 leading-none">New Lead</h5>
                                        <p className="text-[8px] text-gray-500 mt-0.5 leading-none">Just added by you</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-1.5 mt-1.5">
                                    <CircleDot size={10} className="text-orange-500 mt-[2px] shrink-0" />
                                    <div>
                                        <h5 className="text-[10px] font-bold text-orange-500 leading-none">Contacted</h5>
                                        <p className="text-[8px] text-gray-500 mt-0.5 leading-none">Our team has contacted the lead</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-1.5 mt-1.5">
                                    <CircleDot size={10} className="text-purple-600 mt-[2px] shrink-0" />
                                    <div>
                                        <h5 className="text-[10px] font-bold text-purple-600 leading-none">In Discussion</h5>
                                        <p className="text-[8px] text-gray-500 mt-0.5 leading-none">Discussion is in progress</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-1.5 mt-1.5">
                                    <CircleDot size={10} className="text-teal-500 mt-[2px] shrink-0" />
                                    <div>
                                        <h5 className="text-[10px] font-bold text-teal-500 leading-none">Proposal Sent</h5>
                                        <p className="text-[8px] text-gray-500 mt-0.5 leading-none">Proposal / Quotation sent</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-1.5 mt-1.5">
                                    <CircleDot size={10} className="text-green-500 mt-[2px] shrink-0" />
                                    <div>
                                        <h5 className="text-[10px] font-bold text-green-500 leading-none">Converted</h5>
                                        <p className="text-[8px] text-gray-500 mt-0.5 leading-none">Stall booking successful</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-1.5 mt-1.5">
                                    <CircleDot size={10} className="text-amber-500 mt-[2px] shrink-0" />
                                    <div>
                                        <h5 className="text-[10px] font-bold text-amber-500 leading-none">Booking in Progress</h5>
                                        <p className="text-[8px] text-gray-500 mt-0.5 leading-none">Payment or documents pending</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-1.5 mt-1.5">
                                    <CircleDot size={10} className="text-red-500 mt-[2px] shrink-0" />
                                    <div>
                                        <h5 className="text-[10px] font-bold text-red-500 leading-none">Lost / Not Interested</h5>
                                        <p className="text-[8px] text-gray-500 mt-0.5 leading-none">Lead not converted</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Need Help Box */}
                        <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <Headphones className="text-[#093C5D] w-4 h-4" />
                                <h3 className="font-bold text-[#093C5D] text-xs">Need Help?</h3>
                            </div>
                            <p className="text-[9px] text-gray-500 mb-2 leading-tight">Our team is here to help you with your referrals.</p>
                            <button className="w-full py-1.5 bg-white border border-green-600 text-green-700 font-bold text-[10px] rounded hover:bg-green-50 transition-colors">
                                Contact CRM Team
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Summary Bar */}
                <div className="mt-2 shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm px-3 py-2 flex flex-wrap items-center justify-between gap-3 overflow-x-auto">
                    <div className="flex items-center gap-2 px-2">
                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                            <DollarSign className="text-purple-600 w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider leading-none mb-0.5">Total Leads Value</p>
                            <h4 className="text-sm font-black text-gray-800 leading-none">{formatCurrency(totalEstValue)}</h4>
                        </div>
                    </div>
                    
                    <div className="w-px h-10 bg-gray-200 hidden md:block"></div>
                    
                    <div className="flex items-center gap-2 px-2">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                            <CheckCircle2 className="text-green-600 w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider leading-none mb-0.5">Converted Leads Value</p>
                            <h4 className="text-sm font-black text-gray-800 leading-none">
                                {formatCurrency(referrals.filter(r => r.conversionStatus === 'Converted').reduce((a,c) => a + (c.estValue || 0), 0))}
                            </h4>
                        </div>
                    </div>

                    <div className="w-px h-10 bg-gray-200 hidden md:block"></div>

                    <div className="flex items-center gap-2 px-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <Trophy className="text-blue-600 w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider leading-none mb-0.5">Total Bonus Earned</p>
                            <h4 className="text-sm font-black text-gray-800 leading-none">{formatCurrency(totalBonus)}</h4>
                        </div>
                    </div>

                    <div className="w-px h-10 bg-gray-200 hidden md:block"></div>

                    <div className="flex items-center gap-2 px-2">
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                            <Clock className="text-orange-600 w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider leading-none mb-0.5">Pending Bonus</p>
                            <h4 className="text-sm font-black text-gray-800 leading-none">{formatCurrency(pendingBonus)}</h4>
                        </div>
                    </div>

                    <div className="w-px h-10 bg-gray-200 hidden xl:block"></div>

                    <div className="flex items-center gap-2 px-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <Bookmark className="text-gray-600 w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider leading-none mb-0.5">Total Payouts</p>
                            <h4 className="text-sm font-black text-gray-800 leading-none">{formatCurrency(totalBonus)}</h4>
                            <p className="text-[9px] text-gray-400 font-medium">Last Payout: 05 Jul 2026</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit/Add Modal */}
            {isEditModalOpen && editingReferral && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">{editingReferral._id ? 'Edit Referral Lead' : 'Add New Referral Lead'}</h3>
                        <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-x-5 gap-y-4">
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Company Name *</label>
                                <input type="text" className="w-full border border-gray-300 p-2.5 text-sm rounded-lg mt-1.5 focus:ring-2 focus:ring-green-500 focus:outline-none" value={editingReferral.companyName || ''} onChange={(e) => setEditingReferral({...editingReferral, companyName: e.target.value})} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Contact Person *</label>
                                <input type="text" className="w-full border border-gray-300 p-2.5 text-sm rounded-lg mt-1.5 focus:ring-2 focus:ring-green-500 focus:outline-none" value={editingReferral.contactPerson || ''} onChange={(e) => setEditingReferral({...editingReferral, contactPerson: e.target.value})} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Mobile Number *</label>
                                <input type="text" className="w-full border border-gray-300 p-2.5 text-sm rounded-lg mt-1.5 focus:ring-2 focus:ring-green-500 focus:outline-none" value={editingReferral.mobileNumber || ''} onChange={(e) => setEditingReferral({...editingReferral, mobileNumber: e.target.value})} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email ID</label>
                                <input type="email" className="w-full border border-gray-300 p-2.5 text-sm rounded-lg mt-1.5 focus:ring-2 focus:ring-green-500 focus:outline-none" value={editingReferral.emailId || ''} onChange={(e) => setEditingReferral({...editingReferral, emailId: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Lead Source</label>
                                <select className="w-full border border-gray-300 p-2.5 text-sm rounded-lg mt-1.5 focus:ring-2 focus:ring-green-500 focus:outline-none" value={editingReferral.leadSource || 'Personal Network'} onChange={(e) => setEditingReferral({...editingReferral, leadSource: e.target.value})}>
                                    <option value="Personal Network">Personal Network</option>
                                    <option value="WhatsApp">WhatsApp</option>
                                    <option value="Exhibitor Referral">Exhibitor Referral</option>
                                    <option value="Event / Seminar">Event / Seminar</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Status</label>
                                <select className="w-full border border-gray-300 p-2.5 text-sm rounded-lg mt-1.5 focus:ring-2 focus:ring-green-500 focus:outline-none" value={editingReferral.status || 'active'} onChange={(e) => setEditingReferral({...editingReferral, status: e.target.value})}>
                                    <option value="active">Active (New Lead)</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Conversion Status</label>
                                <select className="w-full border border-gray-300 p-2.5 text-sm rounded-lg mt-1.5 focus:ring-2 focus:ring-green-500 focus:outline-none" value={editingReferral.conversionStatus || 'Open'} onChange={(e) => setEditingReferral({...editingReferral, conversionStatus: e.target.value})}>
                                    <option value="Open">Open</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="In Discussion">In Discussion</option>
                                    <option value="Proposal Sent">Proposal Sent</option>
                                    <option value="Under Negotiation">Under Negotiation</option>
                                    <option value="Stall Booked">Stall Booked</option>
                                    <option value="Payment Pending">Payment Pending</option>
                                    <option value="Converted">Converted</option>
                                    <option value="Lost">Lost</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Est. Stall Size</label>
                                <input type="text" placeholder="e.g. 18 sqm" className="w-full border border-gray-300 p-2.5 text-sm rounded-lg mt-1.5 focus:ring-2 focus:ring-green-500 focus:outline-none" value={editingReferral.estStallSize || ''} onChange={(e) => setEditingReferral({...editingReferral, estStallSize: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Est. Value (₹)</label>
                                <input type="number" className="w-full border border-gray-300 p-2.5 text-sm rounded-lg mt-1.5 focus:ring-2 focus:ring-green-500 focus:outline-none" value={editingReferral.estValue || 0} onChange={(e) => setEditingReferral({...editingReferral, estValue: Number(e.target.value)})} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Referral Bonus (₹)</label>
                                <input type="number" className="w-full border border-gray-300 p-2.5 text-sm rounded-lg mt-1.5 focus:ring-2 focus:ring-green-500 focus:outline-none" value={editingReferral.referralBonus || 0} onChange={(e) => setEditingReferral({...editingReferral, referralBonus: Number(e.target.value)})} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Remarks</label>
                                <textarea className="w-full border border-gray-300 p-2.5 text-sm rounded-lg mt-1.5 focus:ring-2 focus:ring-green-500 focus:outline-none" rows="2" value={editingReferral.remarks || ''} onChange={(e) => setEditingReferral({...editingReferral, remarks: e.target.value})}></textarea>
                            </div>
                            <div className="col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-[#175C34] text-white text-sm font-bold rounded-lg hover:bg-[#124B29] transition-colors">Save Referral Lead</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReferralLeadsDashboard;
