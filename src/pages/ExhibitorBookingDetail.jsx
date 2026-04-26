import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Building2, User, CreditCard, Layers,
    FileText, Info, Receipt, ExternalLink, Pencil, Save, X,
    MapPin, Phone, Mail, Globe, Briefcase, Tag, Calendar,
    CheckCircle2, Users, Award, History, Package, Plus, Trash2, ShoppingCart, Gift, RefreshCw, Upload, FolderPlus, Download, Image as ImageIcon, Send, MessageSquare
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

const DEFAULT_PLACEHOLDER = "https://placehold.co/400x400?text=No+Document";

const fixUrl = (url) => {
    if (!url || url === 'undefined' || url === 'null') return null;
    if (typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('blob:')) {
        return trimmed;
    }
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${SERVER_URL}${cleanPath}`;
};

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
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'contacts', label: 'Contacts', icon: User },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'msme', label: 'MSME', icon: Award },
    { id: 'accessories', label: 'Accessories', icon: Package },
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
        natureOfBusiness: reg.natureOfBusiness || '',
    });

    // Update form when reg changes (critical for live sync)
    useEffect(() => {
        setForm({
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
            natureOfBusiness: reg.natureOfBusiness || '',
        });
    }, [reg]);

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
                    <EditField label="Nature of Business" value={form.natureOfBusiness} onChange={v => inp('natureOfBusiness', v)} editing={editing} />
                </div>
                {reg.companyLogoUrl && (
                    <div className="px-4 py-3 border-t border-gray-100 bg-slate-50/50 flex items-center gap-3">
                        <div className="w-12 h-12 bg-white border border-gray-200 rounded-sm overflow-hidden flex items-center justify-center">
                            <img src={fixUrl(reg.companyLogoUrl)} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Company Logo</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Uploaded & Saved</p>
                        </div>
                    </div>
                )}
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

            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <SH title="Contact Persons" icon={Users} />
                <div className="grid grid-cols-1 md:grid-cols-2 border-l border-t border-gray-100">
                    <div className="p-4 border-r border-b border-gray-100 bg-slate-50/30">
                        <p className="text-[10px] font-black text-[#23471d] uppercase tracking-widest mb-3 border-b pb-1">Primary Contact</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Name</p>
                                <p className="text-[12px] font-bold text-gray-800">{reg.contact1?.title} {reg.contact1?.firstName} {reg.contact1?.lastName}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Designation</p>
                                <p className="text-[12px] font-bold text-gray-800">{reg.contact1?.designation || '—'}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Mobile</p>
                                <p className="text-[12px] font-bold text-gray-800">{reg.contact1?.mobile}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Email</p>
                                <p className="text-[12px] font-bold text-gray-800">{reg.contact1?.email}</p>
                            </div>
                        </div>
                    </div>
                    {reg.contact2?.firstName || reg.contact2?.email ? (
                        <div className="p-4 border-r border-b border-gray-100 italic bg-amber-50/10">
                            <p className="text-[10px] font-black text-[#d26019] uppercase tracking-widest mb-3 border-b pb-1">Secondary Contact</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Name</p>
                                    <p className="text-[12px] font-bold text-gray-800">{reg.contact2?.title} {reg.contact2?.firstName} {reg.contact2?.lastName}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Designation</p>
                                    <p className="text-[12px] font-bold text-gray-800">{reg.contact2?.designation || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Mobile</p>
                                    <p className="text-[12px] font-bold text-gray-800">{reg.contact2?.mobile || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Email</p>
                                    <p className="text-[12px] font-bold text-gray-800">{reg.contact2?.email || '—'}</p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

        </div>
    );
}

function KycDocsGrid({ reg, id, onRefresh }) {
    const DOC_FIELDS = [
        { label: 'Company Logo', field: 'companyLogoUrl' },
        { label: 'PAN Card', field: 'panCardFrontUrl' },
        { label: 'Aadhaar Front', field: 'aadhaarCardFrontUrl' },
        { label: 'Aadhaar Back', field: 'aadhaarCardBackUrl' },
        { label: 'GST Certificate', field: 'gstCertificateUrl' },
        { label: 'Cancelled Cheque', field: 'cancelledChequeUrl' },
        { label: 'Rep. Photo', field: 'representativePhotoUrl' },
    ];

    return (
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {DOC_FIELDS.map(({ label, field }) => (
                <KycDocCard key={field} label={label} field={field} regId={id} currentUrl={reg[field]} onRefresh={onRefresh} />
            ))}
        </div>
    );
}

function KycDocCard({ label, field, regId, currentUrl, onRefresh }) {
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const fileRef = React.useRef(null);

    const resolvedUrl = fixUrl(currentUrl);
    const isPdf = currentUrl?.toLowerCase().includes('.pdf');

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const multerFieldMap = {
                companyLogoUrl: 'companyLogo',
                panCardFrontUrl: 'panCardFront',
                aadhaarCardFrontUrl: 'aadhaarCardFront',
                aadhaarCardBackUrl: 'aadhaarCardBack',
                gstCertificateUrl: 'gstCertificate',
                cancelledChequeUrl: 'cancelledCheque',
                representativePhotoUrl: 'representativePhoto'
            };

            const fd = new FormData();
            fd.append(multerFieldMap[field] || field, file);
            fd.append('field', field);
            const res = await api.put(`/api/exhibitor-registration/${regId}/kyc-doc`, fd);
            if (res.data.success) {
                onRefresh();
            } else {
                Swal.fire('Error', res.data.message || 'Upload failed', 'error');
            }
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || err.message, 'error');
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const handleDelete = async () => {
        const confirm = await Swal.fire({
            title: `Delete ${label}?`,
            text: 'This will remove this document from this registration only.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete',
        });
        if (!confirm.isConfirmed) return;
        setDeleting(true);
        try {
            const res = await api.delete(`/api/exhibitor-registration/${regId}/kyc-doc/${field}`);
            if (res.data.success) onRefresh();
            else Swal.fire('Error', res.data.message || 'Delete failed', 'error');
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || err.message, 'error');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="flex flex-col border border-gray-100 rounded overflow-hidden bg-white shadow-sm">
            {/* Label */}
            <div className="px-2 py-1.5 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">{label}</span>
                {currentUrl && (
                    <a href={resolvedUrl} target="_blank" rel="noopener noreferrer" className="text-[#23471d] hover:text-[#d26019]">
                        <ExternalLink size={10} />
                    </a>
                )}
            </div>

            {/* Image preview */}
            <div className="aspect-square bg-slate-100 flex items-center justify-center relative overflow-hidden">
                {isPdf ? (
                    <div className="flex flex-col items-center gap-1">
                        <FileText size={28} className="text-[#23471d]" />
                        <span className="text-[8px] font-bold text-gray-400 uppercase">PDF</span>
                    </div>
                ) : currentUrl ? (
                    <img
                        src={`${resolvedUrl}${resolvedUrl.includes('?') ? '&' : '?'}v=${new Date().getTime()}`}
                        alt={label}
                        className="w-full h-full object-cover"
                    />
                ) : null}
                {uploading && (

                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-[#23471d] border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex border-t border-gray-100">
                <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[9px] font-black text-[#23471d] uppercase hover:bg-emerald-50 transition-colors disabled:opacity-50"
                >
                    <Upload size={10} /> {uploading ? '...' : currentUrl ? 'Change' : 'Upload'}
                </button>
                {currentUrl && (
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center justify-center px-2 py-1.5 text-[9px] font-black text-red-500 uppercase hover:bg-red-50 transition-colors border-l border-gray-100 disabled:opacity-50"
                    >
                        <Trash2 size={10} />
                    </button>
                )}
            </div>
            <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf" onChange={handleUpload} />
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

    // Update form when reg changes (critical for live sync)
    useEffect(() => {
        setForm({
            contact1: { ...(reg.contact1 || {}) },
            contact2: { ...(reg.contact2 || {}) },
        });
    }, [reg]);

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
                    {['title', 'firstName', 'lastName', 'designation', 'email', 'mobile', 'alternateNo'].map(k => (
                        <EditField key={k} label={k.replace(/([A-Z])/g, ' $1').trim()} value={editing ? form.contact1[k] : reg.contact1?.[k]} onChange={v => inp1(k, v)} editing={editing} />
                    ))}
                </div>
            </div>
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <SH title="Secondary Contact Person" icon={Users} />
                <div className="grid grid-cols-2 md:grid-cols-4 border-l border-t border-gray-100">
                    {['title', 'firstName', 'lastName', 'designation', 'email', 'mobile', 'alternateNo'].map(k => (
                        <EditField key={k} label={k.replace(/([A-Z])/g, ' $1').trim()} value={editing ? form.contact2[k] : reg.contact2?.[k]} onChange={v => inp2(k, v)} editing={editing} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function PaymentTab({ reg, fmt, id, onRefresh }) {
    const fb = reg.financeBreakdown || {};
    const [penaltyAmount, setPenaltyAmount] = useState('');
    const [penaltyReason, setPenaltyReason] = useState('');
    const [showPenaltyHistory, setShowPenaltyHistory] = useState(false);
    const [showManualPayment, setShowManualPayment] = useState(false);
    const [manualPayment, setManualPayment] = useState({
        amount: '', method: 'Cash', transactionId: '', notes: '',
        paidAt: new Date().toISOString().split('T')[0]
    });
    const [paymentDueDate, setPaymentDueDate] = useState(
        reg.paymentDueDate ? new Date(reg.paymentDueDate).toISOString().split('T')[0] : ''
    );
    const [saving, setSaving] = useState(false);

    const handleAddManualPayment = async () => {
        if (!manualPayment.amount || Number(manualPayment.amount) <= 0) {
            Swal.fire('Error', 'Please enter a valid amount', 'error'); return;
        }
        setSaving(true);
        try {
            const res = await api.post(`/api/payment/manual/${id}`, {
                amount: Number(manualPayment.amount),
                method: manualPayment.method,
                transactionId: manualPayment.transactionId,
                notes: manualPayment.notes,
                paidAt: manualPayment.paidAt
            });
            if (res.data.success) {
                Swal.fire({ icon: 'success', title: 'Payment Recorded!', timer: 1500, showConfirmButton: false });
                setShowManualPayment(false);
                setManualPayment({ amount: '', method: 'Cash', transactionId: '', notes: '', paidAt: new Date().toISOString().split('T')[0] });
                onRefresh();
            }
        } catch (e) { Swal.fire('Error', e.response?.data?.message || 'Failed to record payment', 'error'); }
        finally { setSaving(false); }
    };

    const daysOverdue = reg.paymentDueDate
        ? Math.max(0, Math.floor((new Date() - new Date(reg.paymentDueDate)) / (1000 * 60 * 60 * 24)))
        : 0;

    const handleAddPenalty = async () => {
        if (penaltyAmount <= 0) {
            Swal.fire('Error', 'Please enter a valid penalty amount', 'error');
            return;
        }
        if (!penaltyReason.trim()) {
            Swal.fire('Error', 'Please enter a reason for the penalty', 'error');
            return;
        }

        setSaving(true);
        try {
            const res = await api.post(`/api/penalty/add/${id}`, {
                amount: penaltyAmount,
                reason: penaltyReason
            });
            if (res.data.success) {
                Swal.fire({ icon: 'success', title: 'Penalty Added', timer: 1500, showConfirmButton: false });
                onRefresh();
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to add penalty', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleRemovePenalty = async () => {
        const result = await Swal.fire({
            title: 'Remove Penalty?',
            text: 'This will remove the penalty amount from this booking.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Yes, remove it!'
        });

        if (!result.isConfirmed) return;

        setSaving(true);
        try {
            const res = await api.delete(`/api/penalty/remove/${id}`);
            if (res.data.success) {
                setPenaltyAmount(0);
                setPenaltyReason('');
                Swal.fire({ icon: 'success', title: 'Penalty Removed', timer: 1500, showConfirmButton: false });
                onRefresh();
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to remove penalty', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateDueDate = async () => {
        if (!paymentDueDate) {
            Swal.fire('Error', 'Please select a due date', 'error');
            return;
        }

        setSaving(true);
        try {
            const res = await api.put(`/api/payment-delay/due-date/${id}`, { dueDate: paymentDueDate });
            if (res.data.success) {
                Swal.fire({ icon: 'success', title: 'Due Date Updated', timer: 1500, showConfirmButton: false });
                onRefresh();
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to update due date', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSendWarning = async (type) => {
        const result = await Swal.fire({
            title: `Send ${type === 'both' ? 'Email & WhatsApp' : type.toUpperCase()} Warning?`,
            text: 'This will send a payment reminder to the exhibitor.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            confirmButtonText: 'Yes, send it!'
        });

        if (!result.isConfirmed) return;

        try {
            const res = await api.post(`/api/payment-delay/send-warning/${id}`, { type });
            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Warning Sent!',
                    html: `
                        <p>Email: ${res.data.data.emailSent ? '✅ Sent' : '❌ Failed'}</p>
                        <p>WhatsApp: ${res.data.data.whatsappSent ? '✅ Sent' : '❌ Failed'}</p>
                    `,
                    timer: 2000
                });
                onRefresh();
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to send warning', 'error');
        }
    };

    return (
        <div className="space-y-4">
            {/* ── Financial Summary ── */}
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <SH title="Financial Summary & Deductions" icon={CreditCard} />
                <div className="grid grid-cols-2 md:grid-cols-4 border-l border-t border-gray-100">
                    <Field label="Gross Stall Cost" value={fmt(fb.grossAmount || reg.participation?.amount)} />
                    <Field label="Plan Discount" value={fb.discountPercent ? `${fb.discountPercent}% (${fmt(fb.discountAmount)})` : '0%'} />
                    <Field label="Net Subtotal (Taxable)" value={fmt(fb.subtotal || reg.participation?.amount)} />
                    <Field label="GST Collected (18%)" value={fmt(fb.gstAmount || ((reg.participation?.total || 0) - (fb.subtotal || 0)))} />
                    <Field label="Total Contract (incl. GST)" value={fmt(reg.participation?.total)} />
                    <Field label="TDS Selection" value={reg.chosenTdsPercent ? `${reg.chosenTdsPercent}%` : '0%'} />
                    <Field label="TDS Deducted (Less)" value={fb.tdsAmount ? `- ${fmt(fb.tdsAmount)}` : 'INR 0'} />
                    <div className="p-3 border-r border-b border-gray-100 bg-emerald-50/30">
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-wider mb-1">Total Net Payable</p>
                        <p className="text-[14px] font-black text-emerald-800">{fmt(fb.netPayable || reg.participation?.total)}</p>
                    </div>
                    <Field label="Amount Paid (To Date)" value={fmt(reg.amountPaid)} />
                    <div className="p-3 border-r border-b border-gray-100 bg-rose-50/30">
                        <p className="text-[9px] font-black text-rose-600 uppercase tracking-wider mb-1">Balance Outstanding</p>
                        <p className="text-[14px] font-black text-rose-800">{fmt(reg.balanceAmount)}</p>
                    </div>
                    <Field label="Current Status" value={reg.status?.toUpperCase()} />
                    <Field label="Payment Plan" value={reg.paymentPlanLabel || reg.paymentPlanType || 'N/A'} />
                </div>
                {(reg.penaltyAmount > 0 || reg.totalPayable > 0) && (
                    <div className="grid grid-cols-3 border-t border-gray-100">
                        <div className="p-3 border-r border-gray-100 bg-gray-50/50">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">Balance Amount</p>
                            <p className="text-[13px] font-black text-gray-800">{fmt(reg.balanceAmount)}</p>
                        </div>
                        <div className="p-3 border-r border-gray-100 bg-red-50/30">
                            <p className="text-[9px] font-black text-red-500 uppercase tracking-wider mb-1">Penalty</p>
                            <p className="text-[13px] font-black text-red-700">{fmt(reg.penaltyAmount || 0)}</p>
                        </div>
                        <div className="p-3 bg-amber-50/30">
                            <p className="text-[9px] font-black text-amber-600 uppercase tracking-wider mb-1">Total Payable</p>
                            <p className="text-[14px] font-black text-amber-800">{fmt(reg.totalPayable || reg.balanceAmount)}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Installment Breakdown ── */}
            {reg.installments?.length > 0 && (
                <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                    <SH title="Installment Breakdown" icon={CreditCard} />
                    <div className="divide-y divide-gray-100">
                        {reg.installments.map((inst, i) => {
                            const isPaid = inst.status === 'paid';
                            const isOverdue = inst.dueDate && new Date(inst.dueDate) < new Date() && !isPaid;
                            const paidPct = inst.dueAmount > 0 ? Math.round((inst.paidAmount || 0) / inst.dueAmount * 100) : 0;
                            return (
                                <div key={i} className={`p-4 flex items-center justify-between gap-4 ${isOverdue ? 'bg-red-50/30' : ''}`}>
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${isPaid ? 'bg-emerald-100 text-emerald-700' : isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {isPaid ? '✓' : `${inst.percentage}%`}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-black text-gray-800">{inst.label}</p>
                                            <p className="text-[10px] text-gray-500">
                                                Due: {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString('en-IN') : 'Not set'}
                                                {isOverdue && <span className="ml-2 text-red-600 font-bold">OVERDUE</span>}
                                            </p>
                                            {inst.paidAmount > 0 && inst.paidAmount < inst.dueAmount && (
                                                <div className="mt-1">
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                        <div className="bg-[#23471d] h-1.5 rounded-full" style={{ width: `${paidPct}%` }} />
                                                    </div>
                                                    <p className="text-[9px] text-gray-500 mt-0.5">{paidPct}% paid ({fmt(inst.paidAmount)} of {fmt(inst.dueAmount)})</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-gray-800">{fmt(inst.dueAmount)}</p>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${isPaid ? 'bg-emerald-100 text-emerald-700' : isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {inst.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Manual Payment Entry ── */}
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <SH title="Add Manual Payment" icon={Plus} actions={
                    <button onClick={() => setShowManualPayment(p => !p)} className="flex items-center gap-1 px-3 py-1 bg-white/20 text-white text-[10px] font-bold uppercase rounded-[2px] hover:bg-white/30">
                        {showManualPayment ? <X size={11} /> : <Plus size={11} />} {showManualPayment ? 'Cancel' : 'Add Payment'}
                    </button>
                } />
                {showManualPayment && (
                    <div className="p-4 space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">Amount (₹) *</label>
                                <input type="number" value={manualPayment.amount} onChange={e => setManualPayment(p => ({ ...p, amount: e.target.value }))}
                                    placeholder="e.g. 50000" className="w-full h-9 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#23471d]" />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">Payment Method *</label>
                                <select value={manualPayment.method} onChange={e => setManualPayment(p => ({ ...p, method: e.target.value }))}
                                    className="w-full h-9 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#23471d]">
                                    {['Cash', 'Cheque', 'Bank Transfer', 'UPI', 'DD', 'NEFT', 'RTGS', 'Other'].map(m => <option key={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">Payment Date *</label>
                                <input type="date" value={manualPayment.paidAt} onChange={e => setManualPayment(p => ({ ...p, paidAt: e.target.value }))}
                                    className="w-full h-9 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#23471d]" />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">Transaction / Cheque ID</label>
                                <input type="text" value={manualPayment.transactionId} onChange={e => setManualPayment(p => ({ ...p, transactionId: e.target.value }))}
                                    placeholder="TXN ID / Cheque No." className="w-full h-9 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#23471d]" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">Notes</label>
                                <input type="text" value={manualPayment.notes} onChange={e => setManualPayment(p => ({ ...p, notes: e.target.value }))}
                                    placeholder="Optional notes..." className="w-full h-9 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#23471d]" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                            <button onClick={handleAddManualPayment} disabled={saving}
                                className="flex items-center gap-2 px-5 py-2 bg-[#23471d] text-white text-xs font-bold uppercase rounded hover:bg-[#1a3516] disabled:opacity-50">
                                <Plus size={14} /> {saving ? 'Saving...' : 'Record Payment'}
                            </button>
                            <p className="text-[10px] text-gray-400">Updates amountPaid, balanceAmount and sends receipt email.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Penalty Management ── */}
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <SH title="Penalty Management" icon={CreditCard} actions={
                    reg.penaltyHistory?.length > 0 && (
                        <button onClick={() => setShowPenaltyHistory(p => !p)} className="flex items-center gap-1 px-3 py-1 bg-white/20 text-white text-[10px] font-bold uppercase rounded-[2px] hover:bg-white/30">
                            History ({reg.penaltyHistory.length})
                        </button>
                    )
                } />
                <div className="p-4 space-y-3">
                    {reg.penaltyAmount > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-red-800">Current Penalty: {fmt(reg.penaltyAmount)}</p>
                                {reg.penaltyReason && <p className="text-[10px] text-red-600 mt-0.5">Reason: {reg.penaltyReason}</p>}
                                {reg.penaltyAddedBy && <p className="text-[10px] text-red-500 mt-0.5">Added by: {reg.penaltyAddedBy}</p>}
                            </div>
                            <button onClick={handleRemovePenalty} disabled={saving}
                                className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-bold uppercase rounded hover:bg-red-600 disabled:opacity-50">
                                Remove
                            </button>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input type="number" value={penaltyAmount} onChange={e => setPenaltyAmount(e.target.value)}
                            placeholder="Penalty amount (₹)" className="h-9 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#23471d]" />
                        <input type="text" value={penaltyReason} onChange={e => setPenaltyReason(e.target.value)}
                            placeholder="Reason for penalty" className="h-9 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#23471d]" />
                        <button onClick={handleAddPenalty} disabled={saving}
                            className="h-9 bg-[#23471d] text-white text-xs font-bold uppercase rounded hover:bg-[#1a3516] disabled:opacity-50">
                            {saving ? 'Saving...' : 'Add Penalty'}
                        </button>
                    </div>
                    {showPenaltyHistory && reg.penaltyHistory?.length > 0 && (
                        <div className="mt-2 border border-gray-100 rounded overflow-hidden">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50">
                                    <tr>{['Amount', 'Reason', 'Added By', 'Date', 'Removed'].map(h => <th key={h} className="px-3 py-2 text-[9px] font-black text-gray-500 uppercase text-left">{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {reg.penaltyHistory.map((ph, i) => (
                                        <tr key={i} className={ph.removedAt ? 'opacity-50' : ''}>
                                            <td className="px-3 py-2 font-bold text-red-700">{fmt(ph.amount)}</td>
                                            <td className="px-3 py-2 text-gray-600">{ph.reason}</td>
                                            <td className="px-3 py-2 text-gray-500">{ph.addedBy}</td>
                                            <td className="px-3 py-2 text-gray-500">{ph.addedAt ? new Date(ph.addedAt).toLocaleDateString('en-IN') : '—'}</td>
                                            <td className="px-3 py-2 text-gray-500">{ph.removedAt ? new Date(ph.removedAt).toLocaleDateString('en-IN') : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Due Date & Warnings ── */}
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <SH title="Payment Due Date & Reminders" icon={Calendar} />
                <div className="p-4 space-y-3">
                    {daysOverdue > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2">
                            <span className="text-red-600 font-black text-sm">⚠️</span>
                            <p className="text-xs font-black text-red-800">Payment overdue by {daysOverdue} days!</p>
                            {reg.warningCount > 0 && <span className="ml-auto text-[10px] text-red-500">{reg.warningCount} warning(s) sent</span>}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <input type="date" value={paymentDueDate} onChange={e => setPaymentDueDate(e.target.value)}
                            className="flex-1 h-9 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#23471d]" />
                        <button onClick={handleUpdateDueDate} disabled={saving}
                            className="h-9 px-4 bg-blue-500 text-white text-xs font-bold uppercase rounded hover:bg-blue-600 disabled:opacity-50">
                            Set Due Date
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                        <button onClick={() => handleSendWarning('email')} className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded hover:bg-blue-100">
                            <Mail size={12} /> Email Warning
                        </button>
                        <button onClick={() => handleSendWarning('whatsapp')} className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded hover:bg-green-100">
                            <MessageSquare size={12} /> WhatsApp Warning
                        </button>
                        <button onClick={() => handleSendWarning('both')} className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase rounded hover:bg-amber-100">
                            <Send size={12} /> Send Both
                        </button>
                    </div>
                    {reg.warningHistory?.length > 0 && (
                        <details className="mt-1">
                            <summary className="text-[10px] font-black text-gray-500 uppercase cursor-pointer hover:text-gray-700">
                                Warning History ({reg.warningHistory.length})
                            </summary>
                            <div className="mt-2 space-y-1">
                                {reg.warningHistory.slice(-5).reverse().map((w, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[10px] text-gray-500 py-1 border-b border-gray-50">
                                        <span className="font-bold text-gray-700">{new Date(w.sentAt).toLocaleDateString('en-IN')}</span>
                                        <span className="uppercase bg-gray-100 px-1.5 py-0.5 rounded">{w.type}</span>
                                        <span>{w.daysOverdue} days overdue</span>
                                        <span className="ml-auto text-gray-400">by {w.sentBy}</span>
                                    </div>
                                ))}
                            </div>
                        </details>
                    )}
                </div>
            </div>

            {/* ── Payment History ── */}
            {reg.paymentHistory?.length > 0 && (
                <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                    <SH title="Transaction Audit History" icon={History} />
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-100 border-b border-gray-200">
                                    {['#', 'Type', 'Amount', 'Method', 'Txn ID', 'Date', 'Notes'].map(h => (
                                        <th key={h} className="py-2.5 px-4 text-[9px] font-black text-slate-500 uppercase text-left">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reg.paymentHistory.map((h, i) => {
                                    const rawType = (h.paymentType || 'payment').toLowerCase();
                                    const isManual = h.paymentMode === 'manual' || ['cash','cheque','bank transfer','upi','dd','neft','rtgs'].includes((h.method||'').toLowerCase());
                                    const isInstallment = rawType.includes('installment') || rawType.includes('advance') || rawType.includes('phase');
                                    const badgeClass = isManual ? 'bg-purple-100 text-purple-800' : isInstallment ? 'bg-cyan-100 text-cyan-800' : 'bg-emerald-100 text-emerald-800';
                                    return (
                                        <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3 px-4 text-xs text-gray-400 font-bold">#{i + 1}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${badgeClass}`}>
                                                    {isManual ? 'MANUAL' : isInstallment ? 'INSTALLMENT' : rawType.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-[13px] font-black text-slate-800">{fmt(h.amount)}</td>
                                            <td className="py-3 px-4 text-xs font-bold text-slate-600 uppercase">{h.method || h.paymentMode || 'Online'}</td>
                                            <td className="py-3 px-4 text-xs text-slate-500 font-mono">{h.transactionId || h.razorpayPaymentId || '—'}</td>
                                            <td className="py-3 px-4 text-xs font-bold text-slate-500">
                                                {h.paidAt ? new Date(h.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                            </td>
                                            <td className="py-3 px-4 text-xs text-slate-400">{h.notes || '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
function DocumentsTab({ reg }) {
    const registrationDocs = [
        { label: 'Registration Form (PDF)', url: fixUrl(reg.registrationPdfUrl), color: 'bg-[#23471d]' },
        { label: 'Payment Receipt (PDF)', url: fixUrl(reg.receiptPdfUrl), color: 'bg-[#d26019]' },
        { label: 'Uploaded Invoice / Receipt', url: fixUrl(reg.receiptUrl), color: 'bg-slate-700' },
    ].filter(d => d.url);

    const kycDocs = [
        { label: 'Company Logo', url: fixUrl(reg.companyLogoUrl || reg.companyLogo) },
        { label: 'PAN Card (Front)', url: fixUrl(reg.panCardFrontUrl || reg.panFrontUrl || reg.panCardFront || reg.panFront) },
        { label: 'PAN Card (Back)', url: fixUrl(reg.panCardBackUrl || reg.panBackUrl || reg.panCardBack || reg.panBack) },
        { label: 'Aadhaar Card (Front)', url: fixUrl(reg.aadhaarCardFrontUrl || reg.aadhaarFrontUrl || reg.aadhaarCardFront || reg.aadhaarFront) },
        { label: 'Aadhaar Card (Back)', url: fixUrl(reg.aadhaarCardBackUrl || reg.aadhaarBackUrl || reg.aadhaarCardBack || reg.aadhaarBack) },
        { label: 'GST Certificate', url: fixUrl(reg.gstCertificateUrl || reg.gstCertUrl || reg.gstCertificate || reg.gstCert) },
        { label: 'Cancelled Cheque', url: fixUrl(reg.cancelledChequeUrl || reg.chequeUrl || reg.cancelledCheque || reg.cheque) },
        { label: 'Representative Photo', url: fixUrl(reg.representativePhotoUrl || reg.photoUrl || reg.representativePhoto || reg.photo) },
    ].filter(d => d.url);

    return (
        <div className="space-y-4">
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <SH title="Registration & Payment Documents" icon={FileText} />
                <div className="p-5">
                    {registrationDocs.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {registrationDocs.map((d, i) => (
                                <a key={i} href={d.url} target="_blank" rel="noopener noreferrer"
                                    className={`flex items-center gap-2 px-4 py-2 text-white text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-90 ${d.color}`}>
                                    <ExternalLink size={12} /> {d.label}
                                </a>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest text-center py-4">No registration documents available</p>
                    )}
                </div>
            </div>

            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <SH title="Business & KYC Documentation (Admin Management)" icon={Layers} />
                <KycDocsGrid reg={reg} id={reg._id} onRefresh={() => window.location.reload()} />
            </div>

            <SpecialDocsSection reg={reg} id={reg._id} onRefresh={() => window.location.reload()} />
        </div>
    );
}

function SpecialDocsSection({ reg, id, onRefresh }) {
    const [label, setLabel] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const isImage = (url) => url?.match(/\.(jpg|jpeg|png|webp|gif|avif)$/i) || url?.includes('res.cloudinary.com/image/upload');

    const handleDownload = async (url, label) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${label.replace(/\s+/g, '_')}_${Date.now()}.${blob.type.split('/')[1] || 'bin'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            Swal.fire({ icon: 'success', title: 'Download Started', timer: 1000, showConfirmButton: false });
        } catch {
            window.open(url, '_blank');
        }
    };

    const handleUpload = async () => {
        if (!label || !file) return Swal.fire('Error', 'Label and File both are required', 'error');
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('label', label);
            fd.append('file', file);
            const res = await api.post(`/api/exhibitor-registration/${id}/special-docs`, fd);
            if (res.data.success) {
                Swal.fire({ icon: 'success', title: 'Document Added', timer: 1500, showConfirmButton: false });
                setLabel('');
                setFile(null);
                onRefresh();
            }
        } catch { Swal.fire('Error', 'Upload failed', 'error'); }
        finally { setUploading(false); }
    };

    const handleDelete = async (docId) => {
        const r = await Swal.fire({ title: 'Delete Special Doc?', icon: 'warning', showCancelButton: true });
        if (!r.isConfirmed) return;
        try {
            await api.delete(`/api/exhibitor-registration/${id}/special-docs/${docId}`);
            onRefresh();
        } catch { Swal.fire('Error', 'Delete failed', 'error'); }
    };

    return (
        <div className="bg-white border border-gray-100 shadow-sm overflow-hidden mt-4">
            <SH title="Additional / Special Documents" icon={FolderPlus} />
            <div className="p-4">
                {/* Upload Section */}
                <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-slate-50 border border-slate-100 rounded">
                    <input className="flex-1 min-w-[150px] h-7 px-2 border border-slate-300 rounded-[1px] text-[10px] font-medium outline-none focus:border-[#23471d]"
                        value={label} onChange={e => setLabel(e.target.value)} placeholder="Doc Title" />

                    <input type="file" accept="image/*,.pdf" className="text-[9px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-bold file:bg-[#23471d] file:text-white cursor-pointer"
                        onChange={e => setFile(e.target.files[0])} />

                    <button onClick={handleUpload} disabled={uploading}
                        className="h-7 px-4 bg-[#23471d] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#1a3516] disabled:opacity-50 rounded-[1px]">
                        {uploading ? 'Wait...' : 'Add Doc'}
                    </button>
                </div>

                {/* List Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {reg.specialDocuments?.length > 0 ? (
                        reg.specialDocuments.map((doc) => (
                            <div key={doc._id} className="flex items-center justify-between p-2.5 border border-gray-100 bg-white rounded-[2px] shadow-sm hover:border-[#23471d]/30 transition-all group">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="w-7 h-7 rounded bg-amber-50 flex items-center justify-center flex-shrink-0">
                                        <FileText size={14} className={isImage(doc.url) ? "text-emerald-600" : "text-rose-500"} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] font-bold text-gray-800 truncate">{doc.label}</p>
                                        <p className="text-[7px] text-gray-400 font-black uppercase tracking-tighter">{isImage(doc.url) ? 'Image' : 'PDF File'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleDownload(fixUrl(doc.url), doc.label)}
                                        className="p-1 text-slate-600 hover:bg-slate-100 rounded transition-colors" title="Force Download">
                                        <Download size={11} />
                                    </button>
                                    <button onClick={() => handleDelete(doc._id)}
                                        className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors opacity-0 group-hover:opacity-100" title="Delete">
                                        <Trash2 size={11} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-6 text-center bg-slate-50/50 border border-dashed border-slate-200">
                            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest italic">No extra records found</p>
                        </div>
                    )}
                </div>
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
        if (!form.udyamRegNo) { Swal.fire('Error', 'udyam Reg. No. is required', 'error'); return; }
        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (v != null && k !== 'udyamCertificateUrl') fd.append(k, v); });
            if (certFile) fd.append('udyamCertificate', certFile);
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

    const certUrl = reg.msme?.udyamCertificateUrl
        ? (reg.msme.udyamCertificateUrl.startsWith('http') ? reg.msme.udyamCertificateUrl : `${SERVER_URL}${reg.msme.udyamCertificateUrl}`)
        : null;

    const iCls = "w-full h-8 px-3 border border-slate-300 rounded-[2px] text-xs font-medium outline-none focus:border-[#23471d]";
    const lCls = "text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block";

    return (
        <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
            <SH title="MSME / udyam Details" icon={Award} actions={
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
                        <Pencil size={11} /> {reg.msme?.udyamRegNo ? 'Edit' : 'Add MSME'}
                    </button>
                )
            } />

            {editing ? (
                <div className="p-5 space-y-4">
                    <p className="text-[10px] font-black text-[#23471d] uppercase tracking-wider pb-1 border-b border-slate-100">udyam Registration</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: 'udyam Reg. No. *', key: 'udyamRegNo', placeholder: 'UDYAM-XX-00-0000000' },
                            { label: 'Mobile No.', key: 'udyamMobileNo', placeholder: '10-digit' },
                            { label: 'Email ID', key: 'udyamEmailId', placeholder: 'email@example.com' },
                            { label: 'Contact Person', key: 'udyamContactPerson', placeholder: 'Name' },
                            { label: 'Designation', key: 'udyamDesignation', placeholder: 'Designation' },
                            { label: 'Issue Date', key: 'udyamIssueDate', type: 'date' },
                        ].map(f => (
                            <div key={f.key}>
                                <label className={lCls}>{f.label}</label>
                                <input type={f.type || 'text'}
                                    value={f.key === 'udyamIssueDate' && form[f.key] ? form[f.key].split('T')[0] : (form[f.key] || '')}
                                    onChange={e => inp(f.key, e.target.value)}
                                    placeholder={f.placeholder} className={iCls} />
                            </div>
                        ))}
                        <div className="md:col-span-2">
                            <label className={lCls}>udyam Address</label>
                            <input value={form.udyamAddress || ''} onChange={e => inp('udyamAddress', e.target.value)} className={iCls} />
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
            ) : reg.msme?.udyamRegNo ? (
                <div>
                    <Grid4 items={[
                        { label: 'udyam Reg. No.', value: reg.msme.udyamRegNo },
                        { label: 'MSME Category', value: reg.msme.msmeCategory },
                        { label: 'Issue Date', value: reg.msme.udyamIssueDate ? new Date(reg.msme.udyamIssueDate).toLocaleDateString('en-IN') : null },
                        { label: 'Contact Person', value: reg.msme.udyamContactPerson },
                        { label: 'Designation', value: reg.msme.udyamDesignation },
                        { label: 'Mobile No.', value: reg.msme.udyamMobileNo },
                        { label: 'Email ID', value: reg.msme.udyamEmailId },
                        { label: 'Address', value: reg.msme.udyamAddress },
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

// ─── Accessories Tab ─────────────────────────────────────────────────────────

function AccessoriesTab({ reg, id }) {
    const [catalog, setCatalog] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loadingCatalog, setLoadingCatalog] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [paymentMode, setPaymentMode] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadCatalog = () => {
        setLoadingCatalog(true);
        api.get('/api/stall-accessories/accessories')
            .then(res => setCatalog(res.data.data || []))
            .finally(() => setLoadingCatalog(false));
    };

    const loadOrders = () => {
        setLoadingOrders(true);
        api.get(`/api/stall-accessories/orders?exhibitorId=${id}`)
            .then(res => setOrders(res.data.data || []))
            .finally(() => setLoadingOrders(false));
    };

    useEffect(() => { loadCatalog(); loadOrders(); }, [id]);

    const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    const toggleItem = (item) => {
        setSelectedItems(prev => {
            const exists = prev.find(i => i.accessoryId === item._id);
            if (exists) return prev.filter(i => i.accessoryId !== item._id);
            return [...prev, {
                accessoryId: item._id,
                name: item.name,
                type: item.type,
                qty: item.includedQty || 1,
                unitPrice: item.price || 0,
                gstPercent: item.type === 'complimentary' ? 0 : (item.gstPercent || 18),
            }];
        });
    };

    const updateQty = (accessoryId, qty) => {
        setSelectedItems(prev => prev.map(i => i.accessoryId === accessoryId ? { ...i, qty: Math.max(1, parseInt(qty) || 1) } : i));
    };

    const calcTotal = () => {
        return selectedItems.reduce((sum, item) => {
            if (item.type === 'complimentary') return sum;
            const base = item.unitPrice * item.qty;
            const gst = (base * item.gstPercent) / 100;
            return sum + base + gst;
        }, 0);
    };

    const handleSubmitOrder = async () => {
        if (selectedItems.length === 0) return Swal.fire('Error', 'Select at least one item', 'error');
        setSubmitting(true);
        try {
            await api.post('/api/stall-accessories/orders', {
                exhibitorRegistrationId: id,
                items: selectedItems,
                paymentMode,
                transactionId,
                notes,
                processedBy: 'Admin',
            });
            Swal.fire({ icon: 'success', title: 'Order Created', text: 'Receipt & email sent to exhibitor', timer: 2000, showConfirmButton: false });
            setShowOrderForm(false);
            setSelectedItems([]);
            setPaymentMode('');
            setTransactionId('');
            setNotes('');
            loadOrders();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to create order', 'error');
        }
        setSubmitting(false);
    };

    const handleDeleteOrder = async (orderId) => {
        const r = await Swal.fire({ title: 'Delete Order?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626' });
        if (!r.isConfirmed) return;
        await api.delete(`/api/stall-accessories/orders/${orderId}`);
        loadOrders();
    };

    const iCls = "w-full h-8 px-3 border border-slate-300 rounded-[2px] text-xs font-medium outline-none focus:border-[#23471d]";
    const lCls = "text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block";

    const complimentaryItems = catalog.filter(i => i.type === 'complimentary' && i.isActive);
    const purchasableItems = catalog.filter(i => i.type === 'purchasable' && i.isActive);

    return (
        <div className="space-y-4">
            {/* Complimentary Items */}
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <SH title="Complimentary Items (Included Free)" icon={Gift} />
                {loadingCatalog ? (
                    <div className="p-6 text-center"><div className="w-6 h-6 border-2 border-[#23471d] border-t-transparent rounded-full animate-spin mx-auto" /></div>
                ) : complimentaryItems.length === 0 ? (
                    <div className="p-6 text-center text-[11px] text-slate-400 font-bold uppercase tracking-widest">No complimentary items configured</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 border-l border-t border-gray-100">
                        {complimentaryItems.map(item => (
                            <div key={item._id} className="p-3 border-r border-b border-gray-100">
                                <div className="flex items-start gap-2">
                                    <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                        <Gift size={10} className="text-emerald-600" />
                                    </span>
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-800">{item.name}</p>
                                        {item.description && <p className="text-[10px] text-gray-400 mt-0.5">{item.description}</p>}
                                        {(item.length || item.width || item.height) && (
                                            <p className="text-[10px] text-gray-400">{[item.length, item.width, item.height].filter(Boolean).join(' × ')}</p>
                                        )}
                                        <p className="text-[10px] font-black text-emerald-600 mt-1">Qty: {item.includedQty} {item.unit}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Purchasable Items Catalog */}
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <SH title="Purchasable Extras Catalog" icon={ShoppingCart} actions={
                    <button onClick={() => setShowOrderForm(true)}
                        className="flex items-center gap-1 px-3 py-1 bg-[#d26019] text-white text-[10px] font-bold uppercase rounded-[2px] hover:bg-[#b8521a]">
                        <Plus size={11} /> Create Order
                    </button>
                } />
                {loadingCatalog ? (
                    <div className="p-6 text-center"><div className="w-6 h-6 border-2 border-[#23471d] border-t-transparent rounded-full animate-spin mx-auto" /></div>
                ) : purchasableItems.length === 0 ? (
                    <div className="p-6 text-center text-[11px] text-slate-400 font-bold uppercase tracking-widest">No purchasable items configured</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    {['Item', 'Category', 'Dimensions', 'Price', 'GST', 'Total/Unit'].map(h => (
                                        <th key={h} className="py-2 px-4 text-[10px] font-black text-gray-500 uppercase text-left">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {purchasableItems.map((item, i) => {
                                    const gstAmt = (item.price * (item.gstPercent || 18)) / 100;
                                    return (
                                        <tr key={item._id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                                            <td className="py-2 px-4">
                                                <p className="text-xs font-bold text-gray-800">{item.name}</p>
                                                {item.description && <p className="text-[10px] text-gray-400">{item.description}</p>}
                                            </td>
                                            <td className="py-2 px-4 text-xs text-gray-600">{item.category || '—'}</td>
                                            <td className="py-2 px-4 text-xs text-gray-600">{[item.length, item.width, item.height].filter(Boolean).join(' × ') || '—'}</td>
                                            <td className="py-2 px-4 text-xs font-bold text-gray-800">{fmt(item.price)}</td>
                                            <td className="py-2 px-4 text-xs text-gray-600">{item.gstPercent}% ({fmt(gstAmt)})</td>
                                            <td className="py-2 px-4 text-xs font-black text-[#23471d]">{fmt(item.price + gstAmt)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Orders History */}
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <SH title="Purchase Orders History" icon={History} />
                {loadingOrders ? (
                    <div className="p-6 text-center"><div className="w-6 h-6 border-2 border-[#23471d] border-t-transparent rounded-full animate-spin mx-auto" /></div>
                ) : orders.length === 0 ? (
                    <div className="p-8 text-center">
                        <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">No orders yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    {['Order No', 'Items', 'Total', 'Status', 'Txn ID', 'Date', 'Receipt', ''].map(h => (
                                        <th key={h} className="py-2 px-4 text-[10px] font-black text-gray-500 uppercase text-left">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((order, i) => (
                                    <tr key={order._id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                                        <td className="py-2 px-4 text-xs font-bold text-[#23471d] font-mono">{order.orderNo}</td>
                                        <td className="py-2 px-4">
                                            {order.items.map((item, j) => (
                                                <p key={j} className="text-[10px] text-gray-600">{item.qty}× {item.name}</p>
                                            ))}
                                        </td>
                                        <td className="py-2 px-4 text-xs font-black text-gray-800">
                                            {order.paymentStatus === 'complimentary' ? <span className="text-emerald-600">Free</span> : fmt(order.grandTotal)}
                                        </td>
                                        <td className="py-2 px-4">
                                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full border ${order.paymentStatus === 'paid' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                order.paymentStatus === 'complimentary' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>{order.paymentStatus}</span>
                                        </td>
                                        <td className="py-2 px-4 text-xs text-gray-600 font-mono">{order.transactionId || '—'}</td>
                                        <td className="py-2 px-4 text-xs text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="py-2 px-4">
                                            {order.receiptUrl ? (
                                                <a href={order.receiptUrl} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-[10px] font-bold text-[#23471d] hover:underline">
                                                    <ExternalLink size={11} /> PDF
                                                </a>
                                            ) : <span className="text-[10px] text-gray-400">—</span>}
                                        </td>
                                        <td className="py-2 px-4">
                                            <button onClick={() => handleDeleteOrder(order._id)} className="p-1 text-red-400 hover:text-red-600">
                                                <Trash2 size={12} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Order Modal */}
            {showOrderForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between px-5 py-3 bg-[#23471d]">
                            <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Create Accessory Order</h3>
                            <button onClick={() => { setShowOrderForm(false); setSelectedItems([]); }} className="text-white/70 hover:text-white"><X size={16} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Select Items — only purchasable */}
                            <p className="text-[10px] font-black text-[#23471d] uppercase tracking-wider border-b border-slate-100 pb-1">Select Purchasable Items</p>

                            {purchasableItems.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-[#d26019] uppercase mb-2">Purchasable (Paid)</p>
                                    <div className="space-y-2">
                                        {purchasableItems.map(item => {
                                            const sel = selectedItems.find(i => i.accessoryId === item._id);
                                            const gstAmt = (item.price * (item.gstPercent || 18)) / 100;
                                            return (
                                                <div key={item._id} className={`flex items-center gap-3 p-2.5 border rounded-[2px] cursor-pointer ${sel ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
                                                    onClick={() => toggleItem(item)}>
                                                    <input type="checkbox" checked={!!sel} readOnly className="accent-orange-500" />
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-gray-800">{item.name}</p>
                                                        {item.description && <p className="text-[10px] text-gray-400">{item.description}</p>}
                                                        {(item.length || item.width) && <p className="text-[10px] text-gray-400">{[item.length, item.width, item.height].filter(Boolean).join(' × ')}</p>}
                                                    </div>
                                                    {sel && (
                                                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                            <label className="text-[10px] text-gray-500">Qty:</label>
                                                            <input type="number" value={sel.qty} onChange={e => updateQty(item._id, e.target.value)}
                                                                className="w-16 h-7 px-2 border border-slate-300 rounded-[2px] text-xs text-center" min={1} />
                                                        </div>
                                                    )}
                                                    <span className="text-[10px] font-black text-[#d26019]">{fmt(item.price + gstAmt)}/unit</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Order Total */}
                            {selectedItems.length > 0 && (
                                <div className="bg-slate-50 border border-slate-200 p-3 rounded-[2px]">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black text-gray-600 uppercase">Order Total (incl. GST)</span>
                                        <span className="text-sm font-black text-[#23471d]">{fmt(calcTotal())}</span>
                                    </div>
                                </div>
                            )}

                            {/* Payment Details (only if paid items selected) */}
                            {selectedItems.some(i => i.type === 'purchasable') && (
                                <>
                                    <p className="text-[10px] font-black text-[#23471d] uppercase tracking-wider border-b border-slate-100 pb-1">Payment Details</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={lCls}>Payment Mode</label>
                                            <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className={iCls}>
                                                <option value="">Select...</option>
                                                {['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Online'].map(m => <option key={m}>{m}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={lCls}>Transaction ID</label>
                                            <input value={transactionId} onChange={e => setTransactionId(e.target.value)} className={iCls} placeholder="Txn / Ref No." />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className={lCls}>Notes (optional)</label>
                                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-[2px] text-xs font-medium outline-none focus:border-[#23471d] resize-none"
                                    rows={2} placeholder="Any additional notes..." />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => { setShowOrderForm(false); setSelectedItems([]); }}
                                    className="px-4 py-2 border border-gray-300 text-gray-600 text-[11px] font-bold uppercase hover:bg-gray-50">Cancel</button>
                                <button onClick={handleSubmitOrder} disabled={submitting || selectedItems.length === 0}
                                    className="flex items-center gap-2 px-5 py-2 bg-[#d26019] text-white text-[11px] font-black uppercase disabled:opacity-60 hover:bg-[#b8521a]">
                                    <ShoppingCart size={12} /> {submitting ? 'Processing...' : 'Create Order & Send Receipt'}
                                </button>
                            </div>
                        </div>
                    </div>
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
                            className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all rounded-sm ${active ? 'bg-[#23471d] text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                                }`}>
                            <Icon size={13} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            {reg && activeTab === 'overview' && <OverviewTab reg={reg} fmt={fmt} id={id} onRefresh={fetchReg} />}
            {reg && activeTab === 'contacts' && <ContactsTab reg={reg} id={id} onRefresh={fetchReg} />}
            {reg && activeTab === 'payment' && <PaymentTab reg={reg} fmt={fmt} id={id} onRefresh={fetchReg} />}
            {reg && activeTab === 'documents' && <DocumentsTab reg={reg} />}
            {reg && activeTab === 'msme' && <MSMETab reg={reg} id={id} onRefresh={fetchReg} />}
            {reg && activeTab === 'accessories' && <AccessoriesTab reg={reg} id={id} />}
        </div>
    );
}
