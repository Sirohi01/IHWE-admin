import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    AlertTriangle,
    Building2,
    Check,
    CheckCircle2,
    Clock,
    Eye,
    FileText,
    Info,
    Landmark,
    ListChecks,
    Loader2,
    MessageSquare,
    Upload,
    X,
    XCircle,
} from 'lucide-react';
import { Card, Field } from './msmePmsShared';
import { fmtDate, fmtDateTime, safe } from './msmePmsUtils';

const GUIDELINES = [
    'All documents must be clear, legible and valid.',
    'File format: PDF, JPG, PNG',
    'Max file size: 5 MB per document.',
    'Ensure documents are uploaded as per PMS guidelines.',
    'Incorrect documents may lead to delay in claim processing.',
];

function DonutChart({ uploaded, pending, notApplicable }) {
    const total = uploaded + pending + notApplicable || 1;
    const segments = [
        { value: uploaded, color: '#059669' },
        { value: pending, color: '#f59e0b' },
        { value: notApplicable, color: '#cbd5e1' },
    ];
    let offset = 0;
    const r = 30, c = 2 * Math.PI * r;
    return (
        <svg width="88" height="88" viewBox="0 0 88 88">
            {segments.map((seg, i) => {
                const frac = seg.value / total;
                const dash = frac * c;
                const circle = (
                    <circle
                        key={i}
                        cx="44" cy="44" r={r}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="12"
                        strokeDasharray={`${dash} ${c - dash}`}
                        strokeDashoffset={-offset}
                        transform="rotate(-90 44 44)"
                    />
                );
                offset += dash;
                return circle;
            })}
        </svg>
    );
}

export default function MsmePmsStage2Documents({ data, handlers }) {
    const [showQueryModal, setShowQueryModal] = useState(false);
    const [declineTarget, setDeclineTarget] = useState(null);
    const [declineRemark, setDeclineRemark] = useState('');
    const claimDocs = Array.isArray(data?.pmsClaimDocuments) && data.pmsClaimDocuments.length ? data.pmsClaimDocuments : [];
    const documents = Array.isArray(data?.documents) ? data.documents : [];
    const docByType = new Map(documents.map((d) => [d.documentType, d]));
    const portal = data?.msmePortal || {};
    const actionRequired = data?.actionRequired;
    const hasOpenAction = actionRequired && actionRequired.resolved === false;

    let uploadedCount = 0, notApplicableCount = 0;
    claimDocs.forEach((cd) => {
        const doc = docByType.get(cd.type);
        if (doc?.path) uploadedCount += 1;
        else if (doc?.notApplicable) notApplicableCount += 1;
    });
    const pendingCount = claimDocs.length - uploadedCount - notApplicableCount;

    return (
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                <Card icon={Building2} title="Selected Exhibitor" tone="blue">
                    <div className="flex items-start gap-3">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                            <Building2 size={22} />
                        </span>
                        <div className="min-w-0">
                            <strong className="block text-[13px] font-bold text-slate-800">{safe(data?.companyName || data?.exhibitorName)}</strong>
                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                                <Field label="Stall No." value={safe(data?.event?.stallNumber)} />
                                <Field label="Stall Size" value={data?.event?.stallSize ? `${data.event.stallSize} Sq. Mtr.` : '—'} />
                                <Field label="Applicant Category" value={safe(data?.category)} />
                                <Field label="Total Invoice Value" value={data?.invoiceValue ? `₹${Number(data.invoiceValue).toLocaleString('en-IN')}` : '—'} />
                            </div>
                        </div>
                    </div>
                    {data?.exhibitorId && (
                        <Link to={`/client-overview/${data.exhibitorId}?source=exhibitor`} className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-[10.5px] font-semibold text-slate-600 hover:bg-slate-50">
                            View Exhibitor Profile ↗
                        </Link>
                    )}
                </Card>

                <Card icon={Landmark} title="PMS Application Summary" tone="blue">
                    <div className="grid grid-cols-2 gap-2.5">
                        <Field label="MSME Application No." value={safe(portal.applicationNo)} />
                        <Field label="Submitted On" value={fmtDateTime(portal.submittedOn)} />
                        <Field label="Submitted By" value={portal.submittedBy ? `${portal.submittedBy}${portal.submittedByRole ? ` (${portal.submittedByRole})` : ''}` : '—'} />
                        <Field label="MSME Portal Status" children={
                            portal.currentStatus ? <span className="inline-block mt-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5">{portal.currentStatus}</span> : undefined
                        } />
                    </div>
                    {portal.lastStatusChecked && <p className="text-[9px] text-slate-400 mt-2">Last Status Checked On: {fmtDateTime(portal.lastStatusChecked)}</p>}
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-2 items-start">
                <Card icon={FileText} title="Documents Required for PMS Claim" tone="blue">
                    <p className="text-[10.5px] text-slate-500 -mt-1 mb-3">Upload all required documents as per PMS guidelines. Click on each card to upload or view document.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
                        {claimDocs.map((cd, i) => {
                            const doc = docByType.get(cd.type);
                            const uploaded = !!doc?.path;
                            const notApplicable = !!doc?.notApplicable && !uploaded;
                            const uploading = handlers.uploadingDocType === cd.type;
                            const needsReview = uploaded && doc.status !== 'Verified';
                            const settingStatus = handlers.settingDocStatusId === doc?._id;
                            return (
                                <div key={cd.type} className="rounded-lg border border-slate-200 p-2.5 flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="grid h-8 w-8 place-items-center rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold">{i + 1}</span>
                                        <span className={`rounded-full px-2 py-0.5 text-[8.5px] font-bold ${
                                            !uploaded ? (notApplicable ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-600')
                                                : doc.status === 'Rejected' ? 'bg-red-50 text-red-700'
                                                    : needsReview ? 'bg-blue-50 text-blue-700'
                                                        : 'bg-emerald-50 text-emerald-700'
                                        }`}>
                                            {!uploaded ? (notApplicable ? 'Not Applicable' : 'Pending')
                                                : doc.status === 'Rejected' ? 'Declined'
                                                    : needsReview ? 'Pending Review'
                                                        : 'Accepted'}
                                        </span>
                                    </div>
                                    <strong className="text-[10.5px] font-bold text-slate-700 leading-tight min-h-[28px]">{cd.label}</strong>
                                    {uploaded ? (
                                        <>
                                            <span className="text-[9px] text-slate-400">Uploaded on {fmtDateTime(doc.uploadedAt)}</span>
                                            {doc.uploadedBy && <span className="text-[9px] text-slate-400">Uploaded by {doc.uploadedBy}</span>}
                                            {doc.status === 'Rejected' && doc.reviewRemark && (
                                                <p className="rounded-md bg-red-50 px-1.5 py-1 text-[9px] text-red-600">Reason: {doc.reviewRemark}</p>
                                            )}
                                            <a href={doc.path} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[9.5px] font-semibold text-slate-600 hover:bg-slate-50">
                                                <Eye size={11} /> View
                                            </a>
                                            {needsReview ? (
                                                <div className="flex gap-1.5">
                                                    <button
                                                        type="button"
                                                        disabled={settingStatus}
                                                        onClick={() => handlers.onSetDocumentStatus(doc._id, { status: 'Verified' })}
                                                        className="flex flex-1 items-center justify-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[9.5px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                                                    >
                                                        {settingStatus ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Accept
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={settingStatus}
                                                        onClick={() => { setDeclineTarget({ documentId: doc._id, label: cd.label }); setDeclineRemark(''); }}
                                                        className="flex flex-1 items-center justify-center gap-1 rounded-md border border-red-200 px-2 py-1 text-[9.5px] font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        <XCircle size={11} /> Decline
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-1.5">
                                                    <label className={`flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1 text-[9.5px] font-bold cursor-pointer ${uploading ? 'opacity-50 bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                                                        {uploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                                                        {uploading ? 'Uploading...' : 'Replace'}
                                                        <input
                                                            type="file"
                                                            accept="application/pdf,image/jpeg,image/png"
                                                            className="hidden"
                                                            disabled={uploading}
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                e.target.value = '';
                                                                if (file) handlers.onUploadDocument(cd.type, file);
                                                            }}
                                                        />
                                                    </label>
                                                    <button
                                                        type="button"
                                                        disabled={uploading}
                                                        onClick={() => handlers.onDeleteDocument(cd.type)}
                                                        className="flex-1 rounded-md border border-red-200 px-2 py-1 text-[9.5px] font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : notApplicable ? (
                                        <span className="text-[9px] text-slate-400">Not applicable for this exhibitor.</span>
                                    ) : (
                                        <>
                                            <span className="text-[9px] text-slate-400">Not Uploaded</span>
                                            <label className={`mt-1 flex items-center justify-center gap-1 rounded-md px-2 py-1 text-[9.5px] font-bold cursor-pointer ${uploading ? 'opacity-50 bg-slate-100 text-slate-400' : 'bg-[#0D530E] text-white hover:bg-[#093a0a]'}`}>
                                                {uploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                                                {uploading ? 'Uploading...' : 'Upload Document'}
                                                <input
                                                    type="file"
                                                    accept="application/pdf,image/jpeg,image/png"
                                                    className="hidden"
                                                    disabled={uploading}
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        e.target.value = '';
                                                        if (file) handlers.onUploadDocument(cd.type, file);
                                                    }}
                                                />
                                            </label>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <div className="flex flex-col gap-2">
                    <Card icon={Info} title="Upload Guidelines" tone="blue">
                        <ul className="space-y-1.5">
                            {GUIDELINES.map((g, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-[10px] text-slate-600">
                                    <CheckCircle2 size={12} className="text-blue-500 shrink-0 mt-0.5" />
                                    {g}
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card icon={ListChecks} title="Document Status Overview" tone="blue">
                        <div className="flex items-center gap-3">
                            <DonutChart uploaded={uploadedCount} pending={Math.max(pendingCount, 0)} notApplicable={notApplicableCount} />
                            <div className="space-y-1 text-[10px] font-semibold">
                                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-600" /> Uploaded <strong className="ml-auto">{uploadedCount}</strong></div>
                                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Pending <strong className="ml-auto">{Math.max(pendingCount, 0)}</strong></div>
                                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" /> Not Applicable <strong className="ml-auto">{notApplicableCount}</strong></div>
                                <div className="pt-1 border-t border-slate-100">Total <strong>{claimDocs.length}</strong></div>
                            </div>
                        </div>
                    </Card>

                    {hasOpenAction ? (
                        <Card icon={AlertTriangle} title="Action Required" tone="orange">
                            <p className="text-[10.5px] text-slate-600">Please upload pending documents (marked above) to proceed further.</p>
                            <div className="mt-2.5 flex flex-col gap-1.5">
                                <button type="button" onClick={() => setShowQueryModal(true)} className="flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[10.5px] font-semibold text-slate-600 hover:bg-slate-50">
                                    <MessageSquare size={13} /> View Query / Communication
                                </button>
                            </div>
                        </Card>
                    ) : null}
                </div>
            </div>

            {declineTarget && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-xl">
                        <div className="mb-2 flex items-center justify-between">
                            <strong className="text-[12px] font-bold text-slate-800">Decline Document</strong>
                            <button type="button" onClick={() => setDeclineTarget(null)}><X size={16} className="text-slate-400" /></button>
                        </div>
                        <p className="text-[11px] text-slate-600">Reason for declining "{declineTarget.label}" — shown back to the exhibitor.</p>
                        <textarea
                            value={declineRemark}
                            onChange={(e) => setDeclineRemark(e.target.value)}
                            rows={3}
                            placeholder="e.g. Document is blurry, please re-upload a clearer copy."
                            className="mt-2 w-full resize-none rounded-md border border-slate-200 px-2 py-1.5 text-[11px]"
                        />
                        <div className="mt-3 flex justify-end gap-2">
                            <button type="button" onClick={() => setDeclineTarget(null)} className="rounded-md border border-slate-200 px-3 py-1.5 text-[10.5px] font-semibold text-slate-600">Cancel</button>
                            <button
                                type="button"
                                disabled={!declineRemark.trim() || handlers.settingDocStatusId === declineTarget.documentId}
                                onClick={async () => {
                                    await handlers.onSetDocumentStatus(declineTarget.documentId, { status: 'Rejected', remark: declineRemark.trim() });
                                    setDeclineTarget(null);
                                }}
                                className="rounded-md bg-red-600 px-3 py-1.5 text-[10.5px] font-semibold text-white disabled:opacity-50"
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showQueryModal && actionRequired && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-xl">
                        <div className="mb-2 flex items-center justify-between">
                            <strong className="text-[12px] font-bold text-slate-800">Query / Communication</strong>
                            <button type="button" onClick={() => setShowQueryModal(false)}><X size={16} className="text-slate-400" /></button>
                        </div>
                        <p className="text-[11px] text-slate-600">{actionRequired.message}</p>
                        {actionRequired.dueDate && <p className="mt-1.5 text-[10px] text-red-600 font-semibold flex items-center gap-1"><Clock size={11} /> Due Date: {fmtDate(actionRequired.dueDate)}</p>}
                        <button type="button" disabled={handlers.savingAction} onClick={async () => { await handlers.onResolveAction(); setShowQueryModal(false); }} className="mt-3 w-full rounded-md bg-emerald-600 px-3 py-1.5 text-[10.5px] font-semibold text-white disabled:opacity-50">Mark as Resolved</button>
                    </div>
                </div>
            )}
        </div>
    );
}
