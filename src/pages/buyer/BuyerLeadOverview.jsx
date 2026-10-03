import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Building2, Calendar, ChevronRight, CreditCard, Globe, History, Mail, MapPin, Package, Phone,
    Receipt, Send, UserCircle, Users,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import Swal from 'sweetalert2';
import api from '../../lib/api';
import { useScopedEvent } from '../../lib/visitorEventScope';
import BuyerAccountsPanel from '../../components/BuyerAccountsPanel';

const EDITABLE_STATUSES = ['New Lead', 'Follow-Up', 'Proposal Sent', 'Hot Lead', 'Lost'];
const STATUS_STYLE = {
    'New Lead': 'bg-blue-50 text-blue-700 border-blue-200',
    'Follow-Up': 'bg-amber-50 text-amber-700 border-amber-200',
    'Proposal Sent': 'bg-purple-50 text-purple-700 border-purple-200',
    'Hot Lead': 'bg-orange-50 text-orange-700 border-orange-200',
    Lost: 'bg-red-50 text-red-600 border-red-200',
    Converted: 'bg-green-100 text-green-800 border-green-300',
};
const CARD_SHADOW = { boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' };
const fieldCls = 'w-full h-[32px] rounded border border-slate-200 bg-white px-2 outline-none text-[11px] font-semibold text-[#0A2947] focus:border-emerald-500';

const formatDateTime = (value) =>
    value
        ? new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
        : 'N/A';

const toInputDateTime = (value) => {
    if (!value) return '';
    const d = new Date(value);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const InfoCard = ({ icon: Icon, tint, label, value }) => (
    <div className="bg-white rounded-lg p-2 flex items-center gap-2.5 min-w-0" style={CARD_SHADOW}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tint}`}>
            <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-slate-900 text-[9px] font-semibold whitespace-nowrap uppercase tracking-wider">{label}</p>
            <h3 className="font-bold text-[10px] mt-0.5 truncate text-[#15173D]">{value || '-'}</h3>
        </div>
    </div>
);

const BuyerLeadOverview = () => {
    const { kind, id } = useParams();
    const navigate = useNavigate();
    const routeEvent = useScopedEvent();

    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState({ status: '', assignedTo: '', followUpDate: '', remark: '' });

    const listPath = routeEvent ? `/buyer-event/${routeEvent._id}/leads/all-leads` : '/buyer-leads/all-leads';

    const load = async () => {
        try {
            const res = await api.get(`/api/buyer-leads/${kind}/${id}`);
            if (res.data.success) {
                const data = res.data.data;
                setLead(data);
                setForm({
                    status: data.status === 'Converted' ? '' : data.status,
                    assignedTo: data.assignedTo || '',
                    followUpDate: toInputDateTime(data.followUpDate),
                    remark: '',
                });
            }
        } catch (error) {
            console.error('Error loading buyer lead:', error);
            setLead(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [kind, id]);

    useEffect(() => {
        api.get('/api/admin/all')
            .then((res) => res.data.success && setUsers(res.data.data || []))
            .catch(() => {});
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.put(`/api/buyer-leads/${kind}/${id}`, {
                ...(form.status ? { leadStatus: form.status } : {}),
                assignedTo: form.assignedTo,
                followUpDate: form.followUpDate ? new Date(form.followUpDate).toISOString() : '',
                remark: form.remark.trim(),
            });
            Swal.fire({ icon: 'success', title: 'Lead updated', timer: 1200, showConfirmButton: false });
            await load();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to update lead', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="w-8 h-8 border-[3px] border-gray-200 border-t-[#23471d] rounded-full animate-spin" />
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center">
                <p className="text-slate-600 font-semibold">This buyer couldn't be found.</p>
                <button onClick={() => navigate(listPath)} className="px-4 py-2 bg-[#23471d] text-white text-xs font-bold uppercase rounded-sm">
                    Back to Buyer Leads
                </button>
            </div>
        );
    }

    const converted = lead.status === 'Converted';
    const phone = (lead.mobileNumber || '').replace(/[^\d+]/g, '');
    const whatsappNumber = phone.replace(/^\+/, '');
    const address = [lead.address, [lead.city, lead.pinCode ? `- ${lead.pinCode}` : ''].filter(Boolean).join(' '), lead.state, lead.country]
        .filter(Boolean).join(', ');

    const actions = [
        { icon: FaWhatsapp, title: 'WhatsApp Chat', color: 'text-green-500', onClick: () => window.open(`https://wa.me/${whatsappNumber}`, '_blank'), disabled: !whatsappNumber },
        { icon: Mail, title: 'Email', color: 'text-blue-600', onClick: () => { window.location.href = `mailto:${lead.email}`; }, disabled: !lead.email },
        { icon: Phone, title: 'Call', color: 'text-teal-600', onClick: () => { window.location.href = `tel:${phone}`; }, disabled: !phone },
        ...(lead.kind === 'domestic' && !lead.isLead
            ? [{ icon: Receipt, title: 'Registration Details', color: 'text-purple-600', onClick: () => navigate(`/buyer-registration/${lead._id}`), disabled: false }]
            : []),
    ];

    return (
        <div className="bg-[#f5f7fb] px-6 py-4" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
            {/* TOP HEADER */}
            <div className="flex items-center justify-between mb-1">
                <div>
                    <h1 className="text-[16px] font-bold text-slate-800">BUYER LEAD PROFILE</h1>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                        <span>Buyer Leads</span>
                        <ChevronRight size={12} />
                        <span>Buyer Lead Profile</span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                    <button onClick={() => navigate(listPath)} className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] shadow-sm">
                        All Buyer Leads
                    </button>
                    {whatsappNumber && (
                        <button onClick={() => window.open(`https://wa.me/${whatsappNumber}`, '_blank')} className="px-2.5 py-1.5 bg-[#0D530E] text-white rounded-md text-[10px] font-bold hover:bg-[#093a0a] shadow-sm flex items-center gap-1">
                            <FaWhatsapp size={12} /> Send WhatsApp
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 min-[1300px]:grid-cols-[1fr_360px] gap-1.5 items-stretch">
                {/* LEFT */}
                <div className="space-y-1 min-w-0">
                    {/* PROFILE CARD */}
                    <div className="bg-white rounded-lg p-2.5 overflow-hidden" style={CARD_SHADOW}>
                        <div className="flex flex-wrap gap-4 items-start p-1">
                            <div className="border border-gray-300 rounded-2xl p-1 flex items-center justify-center min-h-[110px] min-w-[130px] flex-shrink-0 bg-white">
                                <div className="text-center w-[120px]">
                                    <Building2 className="text-gray-300 mx-auto" size={36} />
                                    <p className="text-[10px] font-bold text-gray-500 mt-1">{lead.kind === 'international' ? 'International Buyer' : 'Domestic Buyer'}</p>
                                </div>
                            </div>

                            <div className="flex-1 min-w-[200px]">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-[16px] font-semibold text-[#093C5D]">{lead.companyName}</h2>
                                    <span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[lead.status] || ''}`}>{lead.status}</span>
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[#0D530E] text-[10px] font-bold">
                                    <span>{lead.eventName || 'No Event'}</span>
                                    <span style={{ color: '#4B1426' }}>
                                        {lead.isLead ? `Buyer Lead From ${lead.source}` : `Registered Buyer${lead.registrationId ? ` | ${lead.registrationId}` : ''}`}
                                    </span>
                                </div>

                                <div className="mt-2 space-y-1.5">
                                    <div className="flex items-center gap-2 text-[11px]">
                                        <UserCircle className="text-emerald-600 flex-shrink-0" size={14} />
                                        <span className="font-semibold text-black">{lead.contactPerson || lead.companyName}</span>
                                        {lead.designation && (
                                            <>
                                                <span className="text-slate-400 font-bold">/</span>
                                                <span className="font-semibold text-[#5E0006]">{lead.designation}</span>
                                            </>
                                        )}
                                        {lead.mobileNumber && <span className="text-slate-400 font-bold">-</span>}
                                        <a href={`tel:${phone}`} className="text-[#093C5D] hover:underline font-bold">{lead.mobileNumber || '-'}</a>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px]">
                                        <Mail className="text-purple-600 flex-shrink-0" size={14} />
                                        <a href={`mailto:${lead.email}`} className="text-[#443199] hover:underline font-semibold">{lead.email || '-'}</a>
                                    </div>
                                    {lead.website && (
                                        <div className="flex items-center gap-2 text-[11px]">
                                            <Globe className="text-blue-600 flex-shrink-0" size={14} />
                                            <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-700 font-bold">
                                                {lead.website}
                                            </a>
                                        </div>
                                    )}
                                    {address && (
                                        <div className="flex items-start gap-2 text-[11px]">
                                            <MapPin className="text-rose-600 flex-shrink-0 mt-0.5" size={14} />
                                            <span className="font-semibold text-[#0A2947] break-words">{address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-l-[3px] border-emerald-500 pl-2.5 text-[#15173D] leading-[1.4] text-[10px] font-medium w-[260px] flex-shrink-0">
                                <p className="text-[11px] font-semibold text-[#0f172a] tracking-tight mb-1">Buying Interest</p>
                                <p className="break-words font-semibold text-slate-500">
                                    {lead.productInterest || <span className="text-[10px] leading-4">No product interest captured yet.</span>}
                                </p>
                                {lead.remarks && <p className="mt-1.5 break-words font-semibold text-slate-400">{lead.remarks}</p>}
                            </div>
                        </div>
                    </div>

                    {/* INFO CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-1.5">
                        <InfoCard icon={Package} tint="bg-green-50 text-green-600" label="Product Interest" value={lead.productInterest} />
                        <InfoCard icon={Calendar} tint="bg-blue-50 text-blue-600" label="Lead Generation Date" value={formatDateTime(lead.createdAt)} />
                        <InfoCard icon={Users} tint="bg-orange-50 text-orange-600" label="Assigned To" value={lead.assignedTo} />
                        <InfoCard
                            icon={CreditCard}
                            tint={converted ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}
                            label="Payment"
                            value={converted ? 'Completed — Converted' : lead.isLead ? 'Not registered yet' : `Registered · ${lead.paymentStatus}`}
                        />
                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="bg-white rounded-lg p-2.5" style={CARD_SHADOW}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-1.5">
                            {actions.map((item) => (
                                <div
                                    key={item.title}
                                    onClick={!item.disabled ? item.onClick : undefined}
                                    className={`h-[40px] rounded-lg border px-3 flex items-center gap-3 transition-all ${item.disabled ? 'border-slate-200 bg-slate-50 opacity-70 cursor-not-allowed' : 'border-slate-200 cursor-pointer hover:shadow-sm hover:bg-slate-50'}`}
                                >
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100">
                                        <item.icon size={16} className={item.color} />
                                    </div>
                                    <span className="text-[10px] font-bold text-[#15173D]">{item.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* LEAD STATUS UPDATES */}
                    <div className="bg-white rounded-lg p-2.5" style={CARD_SHADOW}>
                        <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-3 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
                            <h2 className="text-[12px] font-semibold text-[#15173D] tracking-tight uppercase">Lead Status Updates</h2>
                        </div>

                        {converted && (
                            <p className="mx-1 mb-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-[11px] font-semibold text-green-800">
                                Payment is completed, so this buyer is Converted. Status can no longer be changed, but you can still add follow-ups and remarks.
                            </p>
                        )}

                        <form onSubmit={handleUpdate} className="px-1 pb-1">
                            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 items-end">
                                <div>
                                    <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Status Update</label>
                                    <select
                                        value={form.status}
                                        disabled={converted}
                                        onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                                        className={`${fieldCls} ${converted ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                                    >
                                        {converted && <option value="">Converted</option>}
                                        {EDITABLE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Forward To</label>
                                    <select
                                        value={form.assignedTo}
                                        onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))}
                                        className={fieldCls}
                                    >
                                        <option value="">Select Assigned To</option>
                                        {form.assignedTo && !users.some((u) => u.username === form.assignedTo) && (
                                            <option value={form.assignedTo}>{form.assignedTo}</option>
                                        )}
                                        {users.map((u) => <option key={u._id || u.username} value={u.username}>{u.fullName || u.username}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Follow Up Date</label>
                                    <input
                                        type="datetime-local"
                                        value={form.followUpDate}
                                        onChange={(e) => setForm((p) => ({ ...p, followUpDate: e.target.value }))}
                                        className={fieldCls}
                                    />
                                </div>
                                <div className="col-span-2 xl:col-span-4 flex items-center gap-3">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Remark</label>
                                        <textarea
                                            value={form.remark}
                                            onChange={(e) => setForm((p) => ({ ...p, remark: e.target.value }))}
                                            className="w-full h-[36px] rounded border border-slate-200 p-2 outline-none resize-none text-[11px] font-semibold text-[#0A2947] focus:border-emerald-500"
                                            placeholder="Write your remark here..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="h-[36px] px-5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 text-[11px] flex-shrink-0 shadow-sm disabled:opacity-60"
                                    >
                                        {isSaving ? 'Saving...' : 'Update Status'}
                                        <Send size={14} />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* ACCOUNT — PI / Invoice / Payment Received */}
                    <BuyerAccountsPanel lead={lead} onChanged={load} />
                </div>

                {/* RIGHT — ACTIVITY HISTORY */}
                <div className="bg-white rounded-lg flex flex-col min-h-[320px]" style={CARD_SHADOW}>
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
                        <History size={14} className="text-slate-600" />
                        <h2 className="text-[12px] font-semibold text-[#15173D] tracking-tight uppercase">Lead History</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[560px]">
                        {lead.activity.length === 0 ? (
                            <p className="text-[10px] font-semibold text-slate-400 italic">No updates yet. Use Lead Status Updates to log the first one.</p>
                        ) : (
                            lead.activity.map((a, i) => (
                                <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                                    <div className="flex items-center justify-between gap-2">
                                        {a.status ? (
                                            <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${STATUS_STYLE[a.status] || ''}`}>{a.status}</span>
                                        ) : <span />}
                                        <span className="text-[9px] text-slate-400 font-semibold">{formatDateTime(a.at)}</span>
                                    </div>
                                    {a.remark && <p className="mt-1 text-[11px] font-semibold text-[#0A2947] break-words">{a.remark}</p>}
                                    <div className="mt-1 text-[9px] text-slate-500 font-semibold space-x-2">
                                        {a.assignedTo && <span>Assigned: {a.assignedTo}</span>}
                                        {a.followUpDate && <span>Follow-up: {formatDateTime(a.followUpDate)}</span>}
                                        {a.by && <span>By {a.by}</span>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyerLeadOverview;
