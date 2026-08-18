import { Fragment, useState } from 'react';
import { Award, Check, FileEdit, Mail, Phone, User, X } from 'lucide-react';
import { PMS_STAGE_LABELS_FALLBACK, resolveImageUrl, safe, toSentenceCase } from './msmePmsUtils';

export function StageStepper({ stage, labels }) {
    const stages = Array.isArray(labels) && labels.length === 3 ? labels : PMS_STAGE_LABELS_FALLBACK;
    const current = Math.min(Math.max(Number(stage) || 1, 1), 3);
    return (
        <div className="flex items-center justify-between gap-1 overflow-x-auto">
            {stages.map((label, i) => {
                const num = i + 1;
                const done = num < current;
                const active = num === current;
                return (
                    <Fragment key={label}>
                        <div className="flex flex-col items-center text-center shrink-0 px-1">
                            <div
                                className={`w-9 h-9 rounded-full grid place-items-center border-2 text-[13px] font-bold ${done
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : active
                                        ? 'bg-[#0D530E] border-[#0D530E] text-white'
                                        : 'bg-white border-slate-200 text-slate-400'
                                    }`}
                            >
                                {done ? <Check size={16} /> : num}
                            </div>
                            <span className="mt-1 text-[10px] font-bold text-slate-700 whitespace-nowrap">{label}</span>
                            <span className={`text-[9.5px] font-semibold ${done ? 'text-emerald-600' : active ? 'text-[#0D530E]' : 'text-slate-400'}`}>
                                {done ? 'Completed' : active ? 'Current Stage' : num === current + 1 ? 'Next Stage' : num === stages.length ? 'Final Stage' : 'Pending'}
                            </span>
                        </div>
                        {num < stages.length && <div className={`flex-1 h-[2px] mt-[18px] min-w-[16px] ${num < current ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                    </Fragment>
                );
            })}
        </div>
    );
}

export function Field({ label, value, children }) {
    return (
        <div>
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
            {children || <strong className="block text-[12.5px] font-bold text-slate-800 mt-0.5">{value}</strong>}
        </div>
    );
}

export function InlineField({ label, value, children, className = 'py-1' }) {
    return (
        <div className={`flex items-center justify-between gap-2 border-b border-slate-100 last:border-b-0 ${className}`}>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide shrink-0">{label}</span>
            {children || <strong className="text-[11.5px] font-bold text-slate-800 text-right">{value}</strong>}
        </div>
    );
}

export function Card({ icon: Icon, title, tone = 'blue', action, children, className = '' }) {
    const toneMap = {
        emerald: { bg: 'bg-[#eff9f3]', text: 'text-[#087536]', border: 'border-l-emerald-500' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-l-orange-500' },
        red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-l-red-500' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-l-blue-500' },
        violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-l-violet-500' },
        teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-l-teal-500' },
    };
    const c = toneMap[tone] || toneMap.blue;
    return (
        <section className={`min-w-0 rounded-xl border border-slate-200 border-l-4 ${c.border} ${c.bg} p-2.5 ${className}`}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    {Icon && (
                        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white ${c.text}`}>
                            <Icon size={15} strokeWidth={2} />
                        </span>
                    )}
                    <strong className={`text-[12.5px] font-bold ${c.text}`}>{title}</strong>
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

export function ContactDetailsCard({ contact, saving, onSave }) {
    const [showModal, setShowModal] = useState(false);
    const c = contact || {};
    return (
        <>
            <Card icon={User} title="Client (Exhibitor) Contact Details" tone="blue" action={
                <button type="button" onClick={() => setShowModal(true)} className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:underline">
                    <FileEdit size={11} /> Edit
                </button>
            }>
                <div>
                    <InlineField className="py-0.5" label="Contact Person" value={safe(c.contactPerson)} />
                    <InlineField className="py-0.5" label="Designation" value={safe(c.designation)} />
                    <InlineField className="py-0.5" label="Mobile Number" value={safe(c.mobileNumber)} children={c.mobileNumber ? <a href={`tel:${c.mobileNumber}`} className="flex items-center gap-1 text-[11.5px] font-bold text-slate-800 hover:text-blue-600"><Phone size={11} />{c.mobileNumber}</a> : undefined} />
                    <InlineField className="py-0.5" label="Email ID" value={safe(c.emailId)} children={c.emailId ? <a href={`mailto:${c.emailId}`} className="flex items-center gap-1 text-[11.5px] font-bold text-slate-800 hover:text-blue-600"><Mail size={11} />{c.emailId}</a> : undefined} />
                    <InlineField className="py-0.5" label="Office Landline" value={safe(c.landlineNo)} />
                    <InlineField className="py-0.5 items-start" label="Company Address" children={
                        c.address ? (
                            <strong className="text-[11.5px] font-bold text-slate-800 text-right whitespace-pre-line">{toSentenceCase(c.address)}</strong>
                        ) : <strong className="text-[11.5px] font-bold text-slate-800 text-right">—</strong>
                    } />
                </div>
            </Card>
            {showModal && (
                <ContactDetailsModal initial={c} saving={saving} onClose={() => setShowModal(false)} onSave={async (v) => { await onSave(v); setShowModal(false); }} />
            )}
        </>
    );
}

export function ContactDetailsModal({ initial, saving, onClose, onSave }) {
    const [values, setValues] = useState({
        contactPerson: initial?.contactPerson || '',
        designation: initial?.designation || '',
        mobileNumber: initial?.mobileNumber || '',
        emailId: initial?.emailId || '',
        landlineNo: initial?.landlineNo || '',
        address: initial?.address || '',
    });
    const set = (k, v) => setValues((prev) => ({ ...prev, [k]: v }));
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="mb-3 flex items-center justify-between">
                    <strong className="text-[13px] font-bold text-slate-800">Edit Contact Details</strong>
                    <button type="button" onClick={onClose}><X size={16} className="text-slate-400" /></button>
                </div>
                <div className="space-y-2.5">
                    {[
                        ['contactPerson', 'Contact Person'], ['designation', 'Designation'], ['mobileNumber', 'Mobile Number'],
                        ['emailId', 'Email ID'], ['landlineNo', 'Office Landline'],
                    ].map(([key, label]) => (
                        <div key={key}>
                            <label className="text-[10px] font-semibold text-slate-500">{label}</label>
                            <input value={values[key]} onChange={(e) => set(key, e.target.value)} className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-[11px]" />
                        </div>
                    ))}
                    <div>
                        <label className="text-[10px] font-semibold text-slate-500">Company Address</label>
                        <textarea value={values.address} onChange={(e) => set('address', e.target.value)} rows={2} className="mt-1 w-full resize-none rounded-md border border-slate-200 px-2 py-1.5 text-[11px]" />
                    </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-3 py-1.5 text-[10.5px] font-semibold text-slate-600">Cancel</button>
                    <button type="button" disabled={saving} onClick={() => onSave(values)} className="rounded-md bg-blue-600 px-3 py-1.5 text-[10.5px] font-semibold text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                </div>
            </div>
        </div>
    );
}

export function RelationshipManagerCard({ rm }) {
    if (!rm) return null;
    const rmPhotoUrl = resolveImageUrl(rm.photo);
    return (
        <Card icon={Award} title="Relationship Manager (Organiser)" tone="orange">
            <div className="flex items-center gap-2">
                {rmPhotoUrl ? <img src={rmPhotoUrl} alt={rm.name} className="h-10 w-10 rounded-full object-cover" /> : (
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold">{rm.initials || <User size={16} />}</span>
                )}
                <div>
                    <strong className="block text-[12px] font-bold text-slate-800">{rm.name}</strong>
                    <span className="text-[9.5px] text-slate-500">{rm.designation}</span>
                </div>
            </div>
            <div className="mt-2 space-y-1">
                {rm.phone && <a href={`tel:${rm.phone}`} className="flex items-center gap-1.5 text-[10px] text-slate-600 hover:text-blue-600"><Phone size={11} /> {rm.phone}</a>}
                {rm.email && <a href={`mailto:${rm.email}`} className="flex items-center gap-1.5 text-[10px] text-slate-600 hover:text-blue-600"><Mail size={11} /> {rm.email}</a>}
            </div>
        </Card>
    );
}
