import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Search, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../lib/api';
import Pagination from '../../components/Pagination';
import { BuyerEventSelect, useActiveEvents } from '../../components/BuyerEventTabs';
import { buyerBelongsToEvent, useScopedEvent } from '../../lib/visitorEventScope';

// Same pipeline stages as the exhibitor CRM. `stage` is the route param.
const STAGES = {
    'new-leads': { title: 'New Buyer Leads', status: 'New Lead' },
    'follow-ups': { title: 'Buyer Follow-Ups', status: 'Follow-Up' },
    'proposal-sent': { title: 'Buyer Proposal Sent', status: 'Proposal Sent' },
    'hot-leads': { title: 'Hot Buyer Leads', status: 'Hot Lead' },
    'converted': { title: 'Converted Buyers', status: 'Converted' },
    'lost-leads': { title: 'Lost Buyer Leads', status: 'Lost' },
    'all-leads': { title: 'All Buyer Leads', status: null },
};
// Converted is never set by hand: a buyer becomes Converted when its payment is completed
// (website registration, admin registration, or a lead that registered and paid).
const STATUSES = ['New Lead', 'Follow-Up', 'Proposal Sent', 'Hot Lead', 'Lost', 'Converted'];
const EDITABLE_STATUSES = STATUSES.filter((s) => s !== 'Converted');
const SOURCES = ['Direct', 'Phone Call', 'WhatsApp', 'Email', 'Reference', 'Social Media', 'Other'];
const STATUS_STYLE = {
    'New Lead': 'bg-blue-50 text-blue-700 border-blue-200',
    'Follow-Up': 'bg-amber-50 text-amber-700 border-amber-200',
    'Proposal Sent': 'bg-purple-50 text-purple-700 border-purple-200',
    'Hot Lead': 'bg-orange-50 text-orange-700 border-orange-200',
    Converted: 'bg-green-100 text-green-800 border-green-300',
    Lost: 'bg-red-50 text-red-600 border-red-200',
};
const EMPTY_FORM = {
    buyerType: 'Domestic', companyName: '', contactPerson: '', designation: '', mobileNumber: '', email: '',
    country: '', state: '', city: '', productInterest: '', source: 'Direct', status: 'New Lead',
    followUpDate: '', assignedTo: '', remarks: '',
};
const eventLabelOf = (ev) => (ev ? ev.event_fullName || ev.event_name : '');
const inputCls = 'w-full rounded border border-slate-300 px-3 py-1.5 text-sm focus:border-[#23471d] focus:outline-none';

const BuyerLeads = () => {
    const { stage } = useParams();
    const stageInfo = STAGES[stage] || STAGES['all-leads'];
    const routeEvent = useScopedEvent();
    const events = useActiveEvents();
    const [pickedEventId, setPickedEventId] = useState('');
    const activeEvent = routeEvent || events.find((ev) => ev._id === pickedEventId) || null;
    const eventName = eventLabelOf(activeEvent);

    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);
    const itemsPerPage = 25;

    const fetchLeads = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/api/buyer-leads');
            if (res.data.success) setLeads(res.data.data);
        } catch (error) {
            console.error('Error fetching buyer leads:', error);
            Swal.fire('Error', 'Failed to load buyer leads', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    // Leads and registrations are one pool; the chosen event narrows it down.
    const eventLeads = useMemo(
        () => leads.filter((l) => buyerBelongsToEvent(l, activeEvent)),
        [leads, activeEvent],
    );

    const stageCounts = useMemo(
        () => Object.fromEntries(STATUSES.map((s) => [s, eventLeads.filter((l) => l.status === s).length])),
        [eventLeads],
    );

    const filtered = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        return eventLeads.filter((l) => {
            if (stageInfo.status && l.status !== stageInfo.status) return false;
            if (!q) return true;
            return [l.companyName, l.contactPerson, l.mobileNumber, l.email, l.country, l.city, l.productInterest, l.assignedTo, l.status]
                .some((v) => v && String(v).toLowerCase().includes(q));
        });
    }, [eventLeads, searchTerm, stageInfo]);

    useEffect(() => setCurrentPage(1), [searchTerm, eventName, stage]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageRows = filtered.slice(startIndex, startIndex + itemsPerPage);

    const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // New leads land in the stage page they were added from.
            const status = stageInfo.status && stageInfo.status !== 'Converted' ? stageInfo.status : form.status;
            const res = await api.post('/api/buyer-leads', { ...form, status, ...(eventName ? { eventName } : {}) });
            if (res.data.success) {
                setShowForm(false);
                setForm(EMPTY_FORM);
                fetchLeads();
                Swal.fire({ icon: 'success', title: 'Buyer lead added', timer: 1400, showConfirmButton: false });
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to add buyer lead', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatus = async (lead, status) => {
        try {
            await api.put(`/api/buyer-leads/${lead.kind}/${lead._id}`, { leadStatus: status });
            setLeads((prev) => prev.map((l) => (l._id === lead._id ? { ...l, status } : l)));
        } catch {
            Swal.fire('Error', 'Failed to update status', 'error');
        }
    };

    const handleDelete = async (lead) => {
        const result = await Swal.fire({
            title: 'Delete this lead?',
            text: `${lead.companyName} will be removed.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            confirmButtonText: 'Yes, delete it!',
        });
        if (!result.isConfirmed) return;
        try {
            await api.delete(`/api/buyer-leads/${lead.kind}/${lead._id}`);
            setLeads((prev) => prev.filter((l) => l._id !== lead._id));
        } catch {
            Swal.fire('Error', 'Failed to delete lead', 'error');
        }
    };

    const th = 'px-4 py-1.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-300';

    return (
        <div className="bg-white">
            <div className="flex justify-between items-center border-b border-gray-300 px-4 py-2">
                <div>
                    <h1 className="text-2xl font-semibold text-[#23471d] uppercase tracking-tight">{stageInfo.title}</h1>
                    <p className="text-gray-500 text-sm">Showing {filtered.length} leads{eventName ? ` · ${eventName}` : ' · all events'}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search leads..."
                            className="rounded border border-slate-300 py-1.5 pl-8 pr-3 text-sm focus:border-[#23471d] focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-1.5 bg-[#23471d] hover:bg-[#1a3516] text-white px-4 py-2 rounded-sm"
                    >
                        <Plus size={16} /> Add Buyer Lead
                    </button>
                </div>
            </div>

            <BuyerEventSelect
                eventId={activeEvent?._id || ''}
                onChange={setPickedEventId}
                locked={!!routeEvent}
                defaultLabel="All Events"
                hint="Leads are listed and added under this event."
            />

            <div className="mx-4 mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {STATUSES.map((s) => (
                    <div key={s} className={`rounded border px-3 py-2 ${STATUS_STYLE[s]} ${stageInfo.status === s ? 'ring-2 ring-[#23471d]' : ''}`}>
                        <div className="text-[10px] font-bold uppercase tracking-wider">{s}</div>
                        <div className="text-xl font-bold">{stageCounts[s]}</div>
                    </div>
                ))}
            </div>

            <div className="border border-gray-300 rounded-xl m-4 overflow-hidden overflow-x-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <div className="w-8 h-8 border-[3px] border-gray-200 border-t-[#23471d] rounded-full animate-spin" />
                        <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                ) : (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-300">
                                <th className={th}>S.No</th>
                                <th className={th}>Company</th>
                                <th className={th}>Contact</th>
                                <th className={th}>Event</th>
                                <th className={th}>Interest</th>
                                <th className={th}>Source</th>
                                <th className={th}>Status</th>
                                <th className={th}>Follow-Up</th>
                                <th className={th}>Assigned To</th>
                                <th className={th}>Date</th>
                                <th className="px-4 py-1.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageRows.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="text-center py-3 text-sm text-gray-400 border-t border-gray-200">
                                        {searchTerm ? `No results for "${searchTerm}"` : 'No buyer leads yet'}
                                    </td>
                                </tr>
                            ) : (
                                pageRows.map((lead, i) => (
                                    <tr key={lead._id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="px-4 py-1 text-sm text-gray-500 border-r border-gray-200 w-12">{startIndex + i + 1}</td>
                                        <td className="px-4 py-1 border-r border-gray-200 min-w-[150px]">
                                            <Link
                                                to={routeEvent ? `/buyer-event/${routeEvent._id}/lead/${lead.kind}/${lead._id}` : `/buyer-lead/${lead.kind}/${lead._id}`}
                                                className="text-sm font-semibold text-gray-800 hover:text-[#23471d] hover:underline"
                                            >
                                                {lead.companyName}
                                            </Link>
                                            <div className="text-xs text-gray-400">{lead.buyerType}{lead.country ? ` · ${lead.country}` : ''}</div>
                                        </td>
                                        <td className="px-4 py-1 border-r border-gray-200 text-sm">
                                            <div className="font-medium text-gray-700">{lead.contactPerson}</div>
                                            <div className="text-xs text-gray-500">{lead.mobileNumber}</div>
                                            {lead.email && <div className="text-xs text-gray-400">{lead.email}</div>}
                                        </td>
                                        <td className="px-4 py-1 border-r border-gray-200 text-xs text-gray-600">{lead.eventName}</td>
                                        <td className="px-4 py-1 border-r border-gray-200 text-sm text-gray-600">{lead.productInterest || '—'}</td>
                                        <td className="px-4 py-1 border-r border-gray-200 text-sm text-gray-600">{lead.source || '—'}</td>
                                        <td className="px-4 py-1 border-r border-gray-200">
                                            {lead.status === 'Converted' ? (
                                                <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE.Converted}`}>Converted</span>
                                            ) : (
                                                <select
                                                    value={lead.status}
                                                    onChange={(e) => handleStatus(lead, e.target.value)}
                                                    className={`rounded border px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[lead.status] || ''}`}
                                                >
                                                    {EDITABLE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            )}
                                            {!lead.isLead && lead.status !== 'Converted' && (
                                                <div className="text-[10px] text-gray-400 mt-0.5">Registered · payment {lead.paymentStatus}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-1 border-r border-gray-200 text-xs text-gray-600">
                                            {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString('en-GB') : '—'}
                                        </td>
                                        <td className="px-4 py-1 border-r border-gray-200 text-sm text-gray-600">{lead.assignedTo || '—'}</td>
                                        <td className="px-4 py-1 border-r border-gray-200 text-xs text-gray-500">
                                            {new Date(lead.createdAt).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="px-4 py-1">
                                            {lead.isLead && (
                                                <button onClick={() => handleDelete(lead)} className="p-1 text-gray-400 hover:text-red-500" title="Delete lead">
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                label="leads"
            />

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <form onSubmit={handleSave} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
                        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0">
                            <h3 className="font-bold text-slate-800">Add Buyer Lead{eventName ? ` — ${eventName}` : ''}</h3>
                            <button type="button" onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={16} /></button>
                        </div>
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className="text-xs font-semibold text-slate-600">Buyer Type
                                <select className={inputCls} value={form.buyerType} onChange={(e) => setField('buyerType', e.target.value)}>
                                    <option>Domestic</option><option>International</option>
                                </select>
                            </label>
                            <label className="text-xs font-semibold text-slate-600">Company Name *
                                <input required className={inputCls} value={form.companyName} onChange={(e) => setField('companyName', e.target.value)} />
                            </label>
                            <label className="text-xs font-semibold text-slate-600">Contact Person *
                                <input required className={inputCls} value={form.contactPerson} onChange={(e) => setField('contactPerson', e.target.value)} />
                            </label>
                            <label className="text-xs font-semibold text-slate-600">Designation
                                <input className={inputCls} value={form.designation} onChange={(e) => setField('designation', e.target.value)} />
                            </label>
                            <label className="text-xs font-semibold text-slate-600">Mobile Number *
                                <input required className={inputCls} value={form.mobileNumber} onChange={(e) => setField('mobileNumber', e.target.value)} />
                            </label>
                            <label className="text-xs font-semibold text-slate-600">Email
                                <input type="email" className={inputCls} value={form.email} onChange={(e) => setField('email', e.target.value)} />
                            </label>
                            <label className="text-xs font-semibold text-slate-600">Country
                                <input className={inputCls} value={form.country} onChange={(e) => setField('country', e.target.value)} />
                            </label>
                            <label className="text-xs font-semibold text-slate-600">State
                                <input className={inputCls} value={form.state} onChange={(e) => setField('state', e.target.value)} />
                            </label>
                            <label className="text-xs font-semibold text-slate-600">City
                                <input className={inputCls} value={form.city} onChange={(e) => setField('city', e.target.value)} />
                            </label>
                            <label className="text-xs font-semibold text-slate-600">Product Interest
                                <input className={inputCls} value={form.productInterest} onChange={(e) => setField('productInterest', e.target.value)} />
                            </label>
                            <label className="text-xs font-semibold text-slate-600">Source
                                <select className={inputCls} value={form.source} onChange={(e) => setField('source', e.target.value)}>
                                    {SOURCES.map((s) => <option key={s}>{s}</option>)}
                                </select>
                            </label>
                            <label className="text-xs font-semibold text-slate-600">Status
                                <select
                                    className={inputCls}
                                    value={stageInfo.status && stageInfo.status !== 'Converted' ? stageInfo.status : form.status}
                                    disabled={!!stageInfo.status && stageInfo.status !== 'Converted'}
                                    onChange={(e) => setField('status', e.target.value)}
                                >
                                    {EDITABLE_STATUSES.map((s) => <option key={s}>{s}</option>)}
                                </select>
                            </label>
                            <label className="text-xs font-semibold text-slate-600">Follow-Up Date
                                <input type="date" className={inputCls} value={form.followUpDate} onChange={(e) => setField('followUpDate', e.target.value)} />
                            </label>
                            <label className="text-xs font-semibold text-slate-600">Assigned To
                                <input className={inputCls} value={form.assignedTo} onChange={(e) => setField('assignedTo', e.target.value)} />
                            </label>
                            <label className="sm:col-span-2 text-xs font-semibold text-slate-600">Remarks
                                <textarea rows={3} className={inputCls} value={form.remarks} onChange={(e) => setField('remarks', e.target.value)} />
                            </label>
                        </div>
                        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded">Cancel</button>
                            <button type="submit" disabled={isSaving} className="px-4 py-2 text-xs font-bold text-white bg-[#23471d] rounded disabled:opacity-50">
                                {isSaving ? 'Saving...' : 'Save Lead'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default BuyerLeads;
