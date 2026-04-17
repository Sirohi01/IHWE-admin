import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Building2, User, CreditCard, Layers,
    FileText, Info, Receipt, ExternalLink, Pencil, Save, X,
    MapPin, Phone, Mail, Globe, Briefcase, Tag, Calendar,
    CheckCircle2, Users, Award, History
} from 'lucide-react';
import api, { SERVER_URL } from "../lib/api";
import Swal from 'sweetalert2';

// ─── Shared UI ────────────────────────────────────────────────────────────────
const SH = ({ title, icon: Icon, actions }) => (
    <div className="flex items-center justify-between px-4 py-2.5 bg-[#23471d] border-b border-gray-200">
        <div className="flex items-center gap-2">
            {Icon && <Icon className="w-3.5 h-3.5 text-white" />}
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest">{title}</h3>
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
    </div>
);

const Field = ({ label, value }) => (
    <div className="p-3 border-r border-b border-gray-100">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-[12px] font-bold text-gray-800 break-words">
            {Array.isArray(value) ? (value.length ? value.join(', ') : '—') : (value || '—')}
        </p>
    </div>
);

const EditField = ({ label, value, onChange, type = 'text', editing }) => (
    <div className="p-3 border-r border-b border-gray-100">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        {editing
            ? <input type={type} value={value || ''} onChange={e => onChange(e.target.value)}
                className="w-full h-8 px-3 border border-slate-300 rounded-[2px] text-xs font-medium outline-none focus:border-[#23471d]" />
            : <p className="text-[12px] font-bold text-gray-800 break-words">{value || '—'}</p>
        }
    </div>
);

const Grid4 = ({ items }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 border-l border-t border-gray-100">
        {items.map((item, i) => <Field key={i} {...item} />)}
    </div>
);

const STATUS_STYLES = {
    paid: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'advance-paid': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    'payment-failed': 'bg-rose-100 text-rose-800 border-rose-300',
};

const TABS = [
    { id: 'overview',  label: 'Overview',        icon: Building2 },
    { id: 'contacts',  label: 'Contacts',         icon: User },
    { id: 'payment',   label: 'Payment',          icon: CreditCard },
    { id: 'documents', label: 'Documents',        icon: FileText },
    { id: 'msme',      label: 'MSME',             icon: Award },
];

// ─── Tab Components ───────────────────────────────────────────────────────────

function OverviewTab({ reg, fmt, id, onRefresh }) {
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        exhibitorName: reg.exhibitorName || '',
        typeOfBusiness: reg.typeOfBusiness || '',
        industrySector: reg.industrySector || '',
        fasciaName: reg.fasciaName || '',
        website: reg.website || '',
        gstNo: reg.gstNo || '',
        panNo: reg.panNo || '',
        landlineNo: reg.landlineNo || '',
        address: reg.address || '',
        city: reg.city || '',
        state: reg.state || '',
        country: reg.country || '',
        pincode: reg.pincode || '',
        referredBy: reg.referredBy || '',
        spokenWith: reg.spokenWith || '',
        primaryCategory: reg.primaryCategory || '',
        subCategory: reg.subCategory || '',
    });

    const inp = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.put(`/api/exhibitor-registration/${id}`, form);
            if (res.data.success) {
                Swal.fire({ icon: 'success', title: 'Updated', timer: 1200, showConfirmButton: false });
                setEditing(false);
                onRefresh();
            }
        } catch { Swal.fire('Error', 'Update failed', 'error'); }
        finally { setSaving(false); }
    };

    const editActions = editing ? (
        <>
            <button onClick={() => setEditing(false)} className="flex items-center gap-1 px-3 py-1 bg-white/20 text-white text-[10px] font-bold uppercase rounded-[2px] hover:bg-white/30"><X size={11} /> Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-3 py-1 bg-[#d26019] text-white text-[10px] font-bold uppercase rounded-[2px] disabled:opacity-60"><Save size={11} /> {saving ? 'Saving...' : 'Save'}</button>
        </>
    ) : (
        <button onClick={() => setEditing(true)} className="flex items-center gap-1 px-3 py-1 bg-white/20 text-white text-[10px] font-bold uppercase rounded-[2px] hover:bg-white/30"><Pencil size={11} /> Edit</button>
    );

    return (
        <div className="space-y-4">
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <SH title="Company & Business" icon={Building2} actions={editActions} />
                <div className="grid grid-cols-2 md:grid-cols-4 border-l border-t border-gray-100">
                    <EditField label="Company Name" value={form.exhibitorName} onChange={v => inp('exhibitorName', v)} editing={editing} />
                    <EditField label="Type of Business" value={form.typeOfBusiness} onChange={v => inp('typeOfBusiness', v)} editing={editing} />
                    <EditField label="Industry Sector" value={form.industrySector} onChange={v => inp('industrySector', v)} editing={editing} />
                    <EditField label="Fascia Name" value={form.fasciaName} onChange={v => inp('fasciaName', v)} editing={editing} />
                    <EditField label="Website" value={form.website} onChange={v => inp('website', v)} editing={editing} />
                    <EditField label="GST No." value={form.gstNo} onChange={v => inp('gstNo', v)} editing={editing} />
                    <EditField label="PAN No." value={form.panNo} onChange={v => inp('panNo', v)} editing={editing} />
                    <EditField label="Landline" value={form.landlineNo} onChange={v => inp('landlineNo', v)} editing={editing} />
                </div>
            </div>
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <SH title="Address" icon={MapPin} />
                <div className="grid grid-cols-2 md:grid-cols-4 border-l border-t border-gray-100">
                    <EditField label="Address" value={form.address} onChange={v => inp('address', v)} editing={editing} />
                    <EditField label="City" value={form.city} onChange={v => inp('city', v)} editing={editing} />
                    <EditField label="State" value={form.state} onChange={v => inp('state', v)} editing={editing} />
                    <EditField label="Country" value={form.country} onChange={v => inp('country', v)} editing={editing} />
                    <EditField label="Pincode" value={form.pincode} onChange={v => inp('pincode', v)} editing={editing} />
                </div>
            </div>
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <SH title="Stall & Event" icon={Layers} />
                <Grid4 items={[
                    { label: 'Event', value: reg.eventId?.name },
                    { label: 'Stall No.', value: reg.participation?.stallFor },
                    { label: 'Stall Type', value: reg.participation?.stallType },
                    { label: 'Stall Size', value: reg.participation?.stallSize ? `${reg.participation.stallSize} sqm` : null },
                    { label: 'Dimension', value: reg.participation?.dimension },
                    { label: 'Scheme', value: reg.participation?.stallScheme },
                    { label: 'Currency', value: reg.participation?.currency },
                    { label: 'Rate / sqm', value: reg.participation?.rate ? fmt(reg.participation.rate) : null },
                ]} />
            </div>
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <SH title="CRM & Attribution" icon={Info} />
                <div className="grid grid-cols-2 md:grid-cols-4 border-l border-t border-gray-100">
                    <Field label="Registration ID" value={reg.registrationId} />
                    <EditField label="Referred By" value={form.referredBy} onChange={v => inp('referredBy', v)} editing={editing} />
                    <EditField label="Spoken With" value={form.spokenWith} onChange={v => inp('spokenWith', v)} editing={editing} />
                    <Field label="Filled By" value={reg.filledBy} />
                    <EditField label="Primary Category" value={form.primaryCategory} onChange={v => inp('primaryCategory', v)} editing={editing} />
                    <EditField label="Sub Category" value={form.subCategory} onChange={v => inp('subCategory', v)} editing={editing} />
                    <Field label="Selected Sectors" value={reg.selectedSectors?.join(', ')} />
                    <Field label="Registered On" value={reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('en-IN') : null} />
                </div>
            </div>
        </div>
    );
}

function ContactsTab({ reg, id, onRefresh }) {
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        contact1: { ...(reg.contact1 || {}) },
        contact2: { ...(reg.contact2 || {}) },
    });

    const inp1 = (k, v) => setForm(p => ({ ...p, contact1: { ...p.contact1, [k]: v } }));
    const inp2 = (k, v) => setForm(p => ({ ...p, contact2: { ...p.contact2, [k]: v } }));

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.put(`/api/exhibitor-registration/${id}`, form);
            if (res.data.success) {
                Swal.fire({ icon: 'success', title: 'Contacts Updated', timer: 1200, showConfirmButton: false });
                setEditing(false);
                onRefresh();
            }
        } catch { Swal.fire('Error', 'Update failed', 'error'); }
        finally { setSaving(false); }
    };

    const editActions = editing ? (
        <>
            <button onClick={() => setEditing(false)} className="flex items-center gap-1 px-3 py-1 bg-white/20 text-white text-[10px] font-bold uppercase rounded-[2px] hover:bg-white/30"><X size={11} /> Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-3 py-1 bg-[#d26019] text-white text-[10px] font-bold uppercase rounded-[2px] disabled:opacity-60"><Save size={11} /> {saving ? 'Saving...' : 'Save'}</button>
        </>
    ) : (
        <button onClick={() => setEditing(true)} className="flex items-center gap-1 px-3 py-1 bg-white/20 text-white text-[10px] font-bold uppercase rounded-[2px] hover:bg-white/30"><Pencil size={11} /> Edit</button>
    );

    return (
        <div className="space-y-4">
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <SH title="Primary Contact Person" icon={User} actions={editActions} />
                <div className="grid grid-cols-2 md:grid-cols-4 border-l border-t border-gray-100">
                    {['title','firstName','lastName','designation','email','mobile','alternateNo'].map(k => (
                        <EditField key={k} label={k.replace(/([A-Z])/g,' $1').trim()} value={editing ? form.contact1[k] : reg.contact1?.[k]} onChange={v => inp1(k, v)} editing={editing} />
                    ))}
                </div>
            </div>
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <SH title="Secondary Contact Person" icon={Users} />
                <div className="grid grid-cols-2 md:grid-cols-4 border-l border-t border-gray-100">
                    {['title','firstName','lastName','designation','email','mobile','alternateNo'].map(k => (
                        <EditField key={k} label={k.replace(/([A-Z])/g,' $1').trim()} value={editing ? form.contact2[k] : reg.contact2?.[k]} onChange={v => inp2(k, v)} editing={editing} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function PaymentTab({ reg, fmt }) {
    return (
        <div className="space-y-4">
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <SH title="Financial Summary" icon={CreditCard} />
                <Grid4 items={[
                    { label: 'Base Amount', value: fmt(reg.participation?.amount) },
                    { label: 'GST (18%)', value: fmt((reg.participation?.total || 0) - (reg.participation?.amount || 0)) },
                    { label: 'Total Amount', value: fmt(reg.participation?.total) },
                    { label: 'Amount Paid', value: fmt(reg.amountPaid) },
                    { label: 'Balance Due', value: fmt(reg.balanceAmount) },
                    { label: 'Payment Mode', value: reg.paymentMode },
                    { label: 'Payment Type', value: reg.paymentType },
                    { label: 'Transaction ID', value: reg.manualPaymentDetails?.transactionId || reg.paymentId },
                ]} />
                {reg.paymentId && (
                    <div className="px-4 py-3 bg-indigo-50/40 border-t border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Razorpay Payment ID</p>
                        <p className="text-xs font-bold text-indigo-700 font-mono break-all">{reg.paymentId}</p>
                    </div>
                )}
            </div>

            {reg.paymentHistory?.length > 0 && (
                <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                    <SH title="Payment History" icon={History} />
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    {['#', 'Type', 'Amount', 'Mode / Method', 'Txn ID', 'Date'].map(h => (
                                        <th key={h} className="py-2 px-4 text-[10px] font-black text-gray-500 uppercase text-left">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reg.paymentHistory.map((h, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                                        <td className="py-2 px-4 text-xs text-gray-400 font-bold">{i + 1}</td>
                                        <td className="py-2 px-4 text-xs font-bold text-gray-700 capitalize">{h.paymentType || '—'}</td>
                                        <td className="py-2 px-4 text-xs font-black text-emerald-700">{fmt(h.amount)}</td>
                                        <td className="py-2 px-4 text-xs text-gray-600">{h.method || h.paymentMode || '—'}</td>
                                        <td className="py-2 px-4 text-xs text-gray-600 font-mono">{h.transactionId || h.razorpayPaymentId || '—'}</td>
                                        <td className="py-2 px-4 text-xs text-gray-500">
                                            {h.paidAt ? new Date(h.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function DocumentsTab({ reg }) {
    const fixUrl = (url) => {
        if (!url) return null;
        return url.startsWith('http') ? url : `${SERVER_URL}${url}`;
    };
    const docs = [
        { label: 'Registration Form (PDF)', url: fixUrl(reg.registrationPdfUrl), color: 'bg-[#23471d] hover:bg-[#1a3516]' },
        { label: 'Payment Receipt (PDF)', url: fixUrl(reg.receiptPdfUrl), color: 'bg-[#d26019] hover:bg-[#b8521a]' },
        { label: 'Uploaded Invoice', url: fixUrl(reg.receiptUrl), color: 'bg-slate-700 hover:bg-slate-800' },
    ].filter(d => d.url);

    return (
        <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
            <SH title="Documents & Downloads" icon={FileText} />
            <div className="p-5">
                {docs.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                        {docs.map((d, i) => (
                            <a key={i} href={d.url} target="_blank" rel="noopener noreferrer"
                                className={`flex items-center gap-2 px-4 py-2 text-white text-[10px] font-black uppercase tracking-widest transition-all ${d.color}`}>
                                <ExternalLink size={12} /> {d.label}
                            </a>
                        ))}
                    </div>
                ) : (
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">No documents available</p>
                )}
            </div>
        </div>
    );
}

function MSMETab({ reg, id, onRefresh }) {
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(reg.msme || {});
    const [certFile, setCertFile] = useState(null);

    const inp = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSave = async () => {
        if (!form.udhyamRegNo) { Swal.fire('Error', 'Udhyam Reg. No. is required', 'error'); return; }
        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (v != null && k !== 'udhyamCertificateUrl') fd.append(k, v); });
            if (certFile) fd.append('udhyamCertificate', certFile);
            const res = await api.put(`/api/exhibitor-registration/${id}/msme`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                Swal.fire({ icon: 'success', title: 'MSME Details Saved', timer: 1500, showConfirmButton: false });
                setEditing(false);
                setCertFile(null);
                onRefresh();
            }
        } catch { Swal.fire('Error', 'Failed to save MSME details', 'error'); }
        finally { setSaving(false); }
    };

    const certUrl = reg.msme?.udhyamCertificateUrl
        ? (reg.msme.udhyamCertificateUrl.startsWith('http') ? reg.msme.udhyamCertificateUrl : `${SERVER_URL}${reg.msme.udhyamCertificateUrl}`)
        : null;

    const iCls = "w-full h-8 px-3 border border-slate-300 rounded-[2px] text-xs font-medium outline-none focus:border-[#23471d]";
    const lCls = "text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block";

    return (
        <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
            <SH title="MSME / Udhyam Details" icon={Award} actions={
                editing ? (
                    <>
                        <button onClick={() => { setEditing(false); setForm(reg.msme || {}); }}
                            className="flex items-center gap-1 px-3 py-1 bg-white/20 text-white text-[10px] font-bold uppercase rounded-[2px] hover:bg-white/30">
                            <X size={11} /> Cancel
                        </button>
                        <button onClick={handleSave} disabled={saving}
                            className="flex items-center gap-1 px-3 py-1 bg-[#d26019] text-white text-[10px] font-bold uppercase rounded-[2px] hover:bg-[#b8521a] disabled:opacity-60">
                            <Save size={11} /> {saving ? 'Saving...' : 'Save'}
                        </button>
                    </>
                ) : (
                    <button onClick={() => setEditing(true)}
                        className="flex items-center gap-1 px-3 py-1 bg-white/20 text-white text-[10px] font-bold uppercase rounded-[2px] hover:bg-white/30">
                        <Pencil size={11} /> {reg.msme?.udhyamRegNo ? 'Edit' : 'Add MSME'}
                    </button>
                )
            } />

            {editing ? (
                <div className="p-5 space-y-4">
                    <p className="text-[10px] font-black text-[#23471d] uppercase tracking-wider pb-1 border-b border-slate-100">Udhyam Registration</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: 'Udhyam Reg. No. *', key: 'udhyamRegNo', placeholder: 'UDYAM-XX-00-0000000' },
                            { label: 'Mobile No.', key: 'udhyamMobileNo', placeholder: '10-digit' },
                            { label: 'Email ID', key: 'udhyamEmailId', placeholder: 'email@example.com' },
                            { label: 'Contact Person', key: 'udhyamContactPerson', placeholder: 'Name' },
                            { label: 'Designation', key: 'udhyamDesignation', placeholder: 'Designation' },
                            { label: 'Issue Date', key: 'udhyamIssueDate', type: 'date' },
                        ].map(f => (
                            <div key={f.key}>
                                <label className={lCls}>{f.label}</label>
                                <input type={f.type || 'text'}
                                    value={f.key === 'udhyamIssueDate' && form[f.key] ? form[f.key].split('T')[0] : (form[f.key] || '')}
                                    onChange={e => inp(f.key, e.target.value)}
                                    placeholder={f.placeholder} className={iCls} />
                            </div>
                        ))}
                        <div className="md:col-span-2">
                            <label className={lCls}>Udhyam Address</label>
                            <input value={form.udhyamAddress || ''} onChange={e => inp('udhyamAddress', e.target.value)} className={iCls} />
                        </div>
                        <div>
                            <label className={lCls}>Certificate (Image) {certUrl && <span className="text-green-600 normal-case">✓ uploaded</span>}</label>
                            <input type="file" accept="image/*" onChange={e => setCertFile(e.target.files?.[0] || null)}
                                className="w-full text-xs border border-slate-300 rounded-[2px] px-2 py-1.5 bg-white" />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-[#23471d] uppercase tracking-wider pb-1 border-b border-slate-100">DFO Details</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: 'DFO Location', key: 'dfoLocation' },
                            { label: 'DFO Email', key: 'dfoEmail' },
                            { label: 'DFO Mobile No.', key: 'dfoMobileNo' },
                        ].map(f => (
                            <div key={f.key}>
                                <label className={lCls}>{f.label}</label>
                                <input value={form[f.key] || ''} onChange={e => inp(f.key, e.target.value)} className={iCls} />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={lCls}>MSME Category</label>
                            <select value={form.msmeCategory || 'Manufacturer'} onChange={e => inp('msmeCategory', e.target.value)} className={iCls}>
                                {['Manufacturer', 'Service Provider', 'Trader', 'Others'].map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={lCls}>MSME Remark</label>
                            <input value={form.msmeRemark || ''} onChange={e => inp('msmeRemark', e.target.value)} className={iCls} />
                        </div>
                    </div>
                </div>
            ) : reg.msme?.udhyamRegNo ? (
                <div>
                    <Grid4 items={[
                        { label: 'Udhyam Reg. No.', value: reg.msme.udhyamRegNo },
                        { label: 'MSME Category', value: reg.msme.msmeCategory },
                        { label: 'Issue Date', value: reg.msme.udhyamIssueDate ? new Date(reg.msme.udhyamIssueDate).toLocaleDateString('en-IN') : null },
                        { label: 'Contact Person', value: reg.msme.udhyamContactPerson },
                        { label: 'Designation', value: reg.msme.udhyamDesignation },
                        { label: 'Mobile No.', value: reg.msme.udhyamMobileNo },
                        { label: 'Email ID', value: reg.msme.udhyamEmailId },
                        { label: 'Address', value: reg.msme.udhyamAddress },
                        { label: 'DFO Location', value: reg.msme.dfoLocation },
                        { label: 'DFO Email', value: reg.msme.dfoEmail },
                        { label: 'DFO Mobile', value: reg.msme.dfoMobileNo },
                        { label: 'Remark', value: reg.msme.msmeRemark },
                    ]} />
                    {certUrl && (
                        <div className="px-4 py-3 border-t border-gray-100 bg-slate-50">
                            <a href={certUrl} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#23471d] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#1a3516]">
                                <ExternalLink size={12} /> View Certificate
                            </a>
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-8 text-center">
                    <Award className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-3">No MSME details added yet</p>
                    <button onClick={() => setEditing(true)}
                        className="px-5 py-2 bg-[#23471d] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#1a3516]">
                        Add MSME Details
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ExhibitorBookingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [reg, setReg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const fetchReg = () => {
        setLoading(true);
        api.get(`/api/exhibitor-registration/${id}`)
            .then(res => { if (res.data.success) setReg(res.data.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchReg(); }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-10 h-10 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!reg) return (
        <div className="p-8 text-center">
            <p className="text-gray-500 font-bold mb-4">Booking not found</p>
            <button onClick={() => navigate('/exhibitor-bookings')} className="px-4 py-2 bg-[#23471d] text-white text-sm font-bold rounded-sm">Back</button>
        </div>
    );

    const cur = reg.participation?.currency === 'USD' ? '$' : '₹';
    const fmt = (n) => `${cur}${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

    return (
        <div className="p-6 min-h-screen bg-gray-50 font-inter">
            {/* Back + Title */}
            <div className="flex items-center gap-3 mb-4">
                <button onClick={() => navigate('/exhibitor-bookings')}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-[#23471d] text-sm font-medium transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="h-4 w-px bg-gray-300" />
                <h1 className="text-base font-black text-[#23471d] uppercase tracking-tight">{reg.exhibitorName}</h1>
                <span className={`ml-auto px-3 py-1 text-[10px] font-black uppercase border rounded-full ${STATUS_STYLES[reg.status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                    {reg.status}
                </span>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                {[
                    { label: 'Reg ID', value: reg.registrationId || '—', color: 'text-slate-700' },
                    { label: 'Stall No.', value: reg.participation?.stallFor || '—', color: 'text-[#d26019]' },
                    { label: 'Total', value: fmt(reg.participation?.total), color: 'text-[#23471d]' },
                    { label: 'Paid', value: fmt(reg.amountPaid), color: 'text-emerald-600' },
                    { label: 'Balance', value: fmt(reg.balanceAmount), color: reg.balanceAmount > 0 ? 'text-red-600' : 'text-emerald-600' },
                ].map((s, i) => (
                    <div key={i} className="bg-white border border-gray-200 px-4 py-3 rounded-sm shadow-sm">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-white border border-gray-200 p-1 rounded-sm shadow-sm overflow-x-auto">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all rounded-sm ${
                                active ? 'bg-[#23471d] text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                            }`}>
                            <Icon size={13} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview'  && <OverviewTab reg={reg} fmt={fmt} id={id} onRefresh={fetchReg} />}
            {activeTab === 'contacts'  && <ContactsTab reg={reg} id={id} onRefresh={fetchReg} />}
            {activeTab === 'payment'   && <PaymentTab reg={reg} fmt={fmt} />}
            {activeTab === 'documents' && <DocumentsTab reg={reg} />}
            {activeTab === 'msme'      && <MSMETab reg={reg} id={id} onRefresh={fetchReg} />}
        </div>
    );
}
