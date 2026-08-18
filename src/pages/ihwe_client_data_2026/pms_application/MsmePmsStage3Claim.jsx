import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    AlertTriangle,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    Eye,
    FileText,
    IndianRupee,
    Landmark,
    MessageSquare,
    Receipt,
    ShieldCheck,
    X,
} from 'lucide-react';
import { Card, ContactDetailsCard, Field, RelationshipManagerCard } from './msmePmsShared';
import { fmtDate, fmtDateTime, safe } from './msmePmsUtils';

const CLAIM_PORTAL_STATUS_OPTIONS = ['Under Scrutiny', 'Under Review', 'Query Raised', 'Approved', 'Rejected'];
const SANCTION_STATUS_OPTIONS = ['Pending', 'Sanctioned', 'Rejected'];
const REIMBURSEMENT_STATUS_OPTIONS = ['Pending', 'Processed', 'Received'];

const STATUS_TONE = {
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Sanctioned: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Received: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Processed: 'bg-blue-50 text-blue-700 border-blue-200',
    'Under Review': 'bg-orange-50 text-orange-700 border-orange-200',
    'Under Scrutiny': 'bg-orange-50 text-orange-700 border-orange-200',
    'Query Raised': 'bg-amber-50 text-amber-700 border-amber-200',
    Rejected: 'bg-red-50 text-red-700 border-red-200',
    Pending: 'bg-slate-100 text-slate-500 border-slate-200',
};
const statusTone = (s) => STATUS_TONE[s] || 'bg-slate-100 text-slate-500 border-slate-200';

const fieldInputClass = 'mt-0.5 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-[11.5px] font-bold text-slate-800';
const fieldLabelClass = 'text-[10px] font-semibold text-slate-400 uppercase tracking-wide';

export default function MsmePmsStage3Claim({ data, handlers }) {
    const [showQueryModal, setShowQueryModal] = useState(false);

    const contact = data?.contactDetails || {};
    const portal = data?.msmePortal || {};
    const claim = data?.claimSubmission || {};
    const sanction = data?.sanction || {};
    const reimbursement = data?.reimbursement || {};
    const statusHistory = Array.isArray(data?.statusHistory)
        ? [...data.statusHistory].sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt))
        : [];
    const documents = (Array.isArray(data?.documents) ? data.documents : []).filter((d) => d.path);
    const claimDocLabel = new Map((data?.pmsClaimDocuments || []).map((d) => [d.type, d.label]));
    const rm = data?.pmsCoordinator;
    const actionRequired = data?.actionRequired;
    const hasOpenAction = actionRequired && actionRequired.resolved === false;
    const claimSubmitted = !!(claim.claimNo && claim.submittedOn);

    return (
        <div className="flex flex-col gap-2">
            {/* ROW 1: PROFILE + SUMMARY */}
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-2">
                <Card icon={Building2} title="Client (Exhibitor) Profile" tone="blue">
                    <div className="flex items-start gap-3">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                            <Building2 size={22} />
                        </span>
                        <div className="min-w-0 flex-1">
                            <strong className="block text-[13px] font-bold text-slate-800">{safe(data?.companyName || data?.exhibitorName)}</strong>
                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-5 gap-x-4 gap-y-2">
                                <Field label="Stall No." value={safe(data?.event?.stallNumber)} />
                                <Field label="Stall Size" value={data?.event?.stallSize ? `${data.event.stallSize} Sq. Mtr.` : '—'} />
                                <Field label="Applicant Category" value={safe(data?.category)} />
                                <Field label="Total Invoice Value" value={data?.invoiceValue ? `₹${Number(data.invoiceValue).toLocaleString('en-IN')}` : '—'} />
                                <Field label="Event Name" value={safe(data?.event?.name)} />
                            </div>
                        </div>
                    </div>
                    {data?.exhibitorId && (
                        <Link to={`/client-overview/${data.exhibitorId}?source=exhibitor`} className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-[10.5px] font-semibold text-slate-600 hover:bg-slate-50">
                            View Exhibitor Profile ↗
                        </Link>
                    )}
                </Card>

                <Card icon={Landmark} title="MSME Application Summary" tone="blue">
                    <div className="grid grid-cols-2 grid-rows-2 grid-flow-col gap-2.5">
                        <Field label="MSME Application No." value={safe(portal.applicationNo)} />
                        <Field label="Portal Status" children={
                            portal.currentStatus ? <span className={`inline-block mt-0.5 rounded-full text-[10px] font-bold px-2 py-0.5 border ${statusTone(portal.currentStatus)}`}>{portal.currentStatus}</span> : undefined
                        } />
                        <Field label="Submitted On" value={fmtDateTime(portal.submittedOn)} />
                        <Field label="Submitted By" value={portal.submittedBy ? `${portal.submittedBy}${portal.submittedByRole ? ` (${portal.submittedByRole})` : ''}` : '—'} />
                    </div>
                    {portal.lastStatusChecked && <p className="text-[9px] text-slate-400 mt-2">Last Status Checked On: {fmtDateTime(portal.lastStatusChecked)}</p>}
                </Card>
            </div>

            <strong className="text-[12.5px] font-bold text-slate-700 mt-1">Claim &amp; Reimbursement Status</strong>

            {/* MAIN (4 status cards + status history/documents) | SIDEBAR — sidebar spans both rows */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-2 items-start">
            <div className="flex flex-col gap-2">

            {/* ROW 2: 4 STATUS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 items-stretch">
                <Card icon={FileText} title="1. Claim Submission on MSME Portal" tone="blue">
                    <div className="space-y-1.5">
                        <div>
                            <label className={fieldLabelClass}>Claim No.</label>
                            <input
                                key={`claimno-${claim.claimNo || ''}`}
                                defaultValue={claim.claimNo || ''}
                                placeholder="e.g. CLM/2026/006541"
                                onBlur={(e) => { if (e.target.value !== (claim.claimNo || '')) handlers.onSaveClaimSubmission({ claimNo: e.target.value }); }}
                                className={fieldInputClass}
                            />
                        </div>
                        <div>
                            <label className={fieldLabelClass}>Claim Submitted On</label>
                            <input
                                type="date"
                                key={`claimsubmittedon-${claim.submittedOn || ''}`}
                                defaultValue={claim.submittedOn ? String(claim.submittedOn).slice(0, 10) : ''}
                                onBlur={(e) => { if (e.target.value) handlers.onSaveClaimSubmission({ submittedOn: e.target.value }); }}
                                className={fieldInputClass}
                            />
                        </div>
                        <div>
                            <label className={fieldLabelClass}>Submitted By</label>
                            <input
                                key={`claimsubmittedby-${claim.submittedBy || ''}`}
                                defaultValue={claim.submittedBy || ''}
                                placeholder="e.g. Anil Mehta"
                                onBlur={(e) => { if (e.target.value !== (claim.submittedBy || '')) handlers.onSaveClaimSubmission({ submittedBy: e.target.value }); }}
                                className={fieldInputClass}
                            />
                        </div>
                    </div>
                    <div className={`mt-2 rounded-md px-2.5 py-1.5 text-[10px] font-bold text-center ${claimSubmitted ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {claimSubmitted ? 'Status: Submitted Successfully' : 'Status: Not Submitted Yet'}
                    </div>
                </Card>

                <Card icon={ShieldCheck} title="2. MSME Portal Claim Status" tone="orange">
                    <div className="space-y-1.5">
                        <div>
                            <label className={fieldLabelClass}>Current Status</label>
                            <select
                                key={`claimstatus-${claim.portalStatus || ''}`}
                                defaultValue={claim.portalStatus || ''}
                                onChange={(e) => handlers.onSaveClaimSubmission({ portalStatus: e.target.value })}
                                className="mt-0.5 w-full rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-[10.5px] font-bold text-orange-600"
                            >
                                <option value="">— Not set —</option>
                                {CLAIM_PORTAL_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={fieldLabelClass}>Last Updated On</label>
                            <input readOnly value={fmtDateTime(claim.lastStatusChecked)} className="mt-0.5 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-500" />
                        </div>
                        <div>
                            <label className={fieldLabelClass}>Next Review / Expected Update</label>
                            <input
                                type="date"
                                key={`nextreview-${claim.nextReviewOn || ''}`}
                                defaultValue={claim.nextReviewOn ? String(claim.nextReviewOn).slice(0, 10) : ''}
                                onBlur={(e) => { if (e.target.value) handlers.onSaveClaimSubmission({ nextReviewOn: e.target.value }); }}
                                className={fieldInputClass}
                            />
                        </div>
                        <div>
                            <label className={fieldLabelClass}>Remarks / Query from MSME</label>
                            <textarea
                                key={`claimremarks-${claim.remarks || ''}`}
                                defaultValue={claim.remarks || ''}
                                rows={2}
                                placeholder="None"
                                onBlur={(e) => { if (e.target.value !== (claim.remarks || '')) handlers.onSaveClaimSubmission({ remarks: e.target.value }); }}
                                className="mt-0.5 w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700"
                            />
                        </div>
                    </div>
                </Card>

                <Card icon={Receipt} title="3. Sanction Status" tone="violet">
                    <div className="space-y-1.5">
                        <div>
                            <label className={fieldLabelClass}>Sanction Status</label>
                            <select
                                key={`sanctionstatus-${sanction.status || ''}`}
                                defaultValue={sanction.status || 'Pending'}
                                onChange={(e) => handlers.onSaveSanction({ status: e.target.value })}
                                className={`mt-0.5 w-full rounded-md border px-2 py-1 text-[10.5px] font-bold ${statusTone(sanction.status || 'Pending')}`}
                            >
                                {SANCTION_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={fieldLabelClass}>Sanction Order No.</label>
                            <input
                                key={`orderno-${sanction.orderNo || ''}`}
                                defaultValue={sanction.orderNo || ''}
                                placeholder="—"
                                onBlur={(e) => { if (e.target.value !== (sanction.orderNo || '')) handlers.onSaveSanction({ orderNo: e.target.value }); }}
                                className={fieldInputClass}
                            />
                        </div>
                        <div>
                            <label className={fieldLabelClass}>Sanction Date</label>
                            <input
                                type="date"
                                key={`orderdate-${sanction.orderDate || ''}`}
                                defaultValue={sanction.orderDate ? String(sanction.orderDate).slice(0, 10) : ''}
                                onBlur={(e) => { if (e.target.value) handlers.onSaveSanction({ orderDate: e.target.value }); }}
                                className={fieldInputClass}
                            />
                        </div>
                        <div>
                            <label className={fieldLabelClass}>Sanctioned Amount</label>
                            <input
                                type="number"
                                key={`sanctionedamt-${sanction.sanctionedAmount ?? ''}`}
                                defaultValue={sanction.sanctionedAmount ?? ''}
                                placeholder="—"
                                onBlur={(e) => {
                                    const v = e.target.value === '' ? null : Number(e.target.value);
                                    if (v !== (sanction.sanctionedAmount ?? null)) handlers.onSaveSanction({ sanctionedAmount: v });
                                }}
                                className={fieldInputClass}
                            />
                        </div>
                    </div>
                </Card>

                <Card icon={IndianRupee} title="4. Reimbursement Status" tone="emerald">
                    <div className="space-y-1.5">
                        <div>
                            <label className={fieldLabelClass}>Reimbursement Status</label>
                            <select
                                key={`reimbstatus-${reimbursement.status || ''}`}
                                defaultValue={reimbursement.status || 'Pending'}
                                onChange={(e) => handlers.onSaveReimbursement({ status: e.target.value })}
                                className={`mt-0.5 w-full rounded-md border px-2 py-1 text-[10.5px] font-bold ${statusTone(reimbursement.status || 'Pending')}`}
                            >
                                {REIMBURSEMENT_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={fieldLabelClass}>PFMS Transaction ID</label>
                            <input
                                key={`pfms-${reimbursement.pfmsTransactionId || ''}`}
                                defaultValue={reimbursement.pfmsTransactionId || ''}
                                placeholder="—"
                                onBlur={(e) => { if (e.target.value !== (reimbursement.pfmsTransactionId || '')) handlers.onSaveReimbursement({ pfmsTransactionId: e.target.value }); }}
                                className={fieldInputClass}
                            />
                        </div>
                        <div>
                            <label className={fieldLabelClass}>Payment Date</label>
                            <input
                                type="date"
                                key={`paymentdate-${reimbursement.paymentDate || ''}`}
                                defaultValue={reimbursement.paymentDate ? String(reimbursement.paymentDate).slice(0, 10) : ''}
                                onBlur={(e) => { if (e.target.value) handlers.onSaveReimbursement({ paymentDate: e.target.value }); }}
                                className={fieldInputClass}
                            />
                        </div>
                        <div>
                            <label className={fieldLabelClass}>Amount Received</label>
                            <input
                                type="number"
                                key={`amtreceived-${reimbursement.amountReceived ?? ''}`}
                                defaultValue={reimbursement.amountReceived ?? ''}
                                placeholder="—"
                                onBlur={(e) => {
                                    const v = e.target.value === '' ? null : Number(e.target.value);
                                    if (v !== (reimbursement.amountReceived ?? null)) handlers.onSaveReimbursement({ amountReceived: v });
                                }}
                                className={fieldInputClass}
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* ROW 3: STATUS HISTORY + DOCUMENTS */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-2 items-start">
                <Card icon={Clock} title="Status History (from MSME Portal)" tone="blue">
                    {statusHistory.length === 0 ? (
                        <p className="text-[10.5px] text-slate-400 py-3 text-center">No status history yet.</p>
                    ) : (
                        <ol className="relative max-h-[230px] overflow-y-auto border-l-2 border-slate-100 pl-3 space-y-3 pr-1">
                            {statusHistory.map((h, i) => (
                                <li key={i} className="relative">
                                    <span className={`absolute -left-[19px] top-0.5 h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                    <span className="text-[9px] font-semibold text-slate-400">{fmtDateTime(h.changedAt)}</span>
                                    {h.status && <span className={`ml-1.5 rounded-full text-[8.5px] font-bold px-1.5 py-0.5 border ${statusTone(h.status)}`}>{h.status}</span>}
                                    {h.note && <p className="text-[10px] text-slate-600 mt-0.5">{h.note}</p>}
                                </li>
                            ))}
                        </ol>
                    )}
                </Card>

                <Card icon={FileText} title="Documents Submitted on MSME Portal" tone="blue">
                    <p className="text-[10px] text-slate-500 -mt-1 mb-2">Same documents uploaded on MSME portal, for record &amp; verification.</p>
                    {documents.length === 0 ? (
                        <p className="text-[10.5px] text-slate-400 py-3 text-center">No documents uploaded yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[9px] font-bold uppercase text-slate-400 border-b border-slate-100">
                                        <th className="py-1.5 px-1">S. No.</th>
                                        <th className="py-1.5 px-1">Document Type</th>
                                        <th className="py-1.5 px-1">File Name</th>
                                        <th className="py-1.5 px-1">Uploaded on Portal</th>
                                        <th className="py-1.5 px-1">Uploaded By</th>
                                        <th className="py-1.5 px-1">Status (Portal)</th>
                                        <th className="py-1.5 px-1 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc, i) => (
                                        <tr key={doc._id} className="border-b border-slate-50 text-[10.5px]">
                                            <td className="py-1.5 px-1 text-slate-500">{i + 1}</td>
                                            <td className="py-1.5 px-1 font-semibold text-slate-700">{claimDocLabel.get(doc.documentType) || doc.documentType}</td>
                                            <td className="py-1.5 px-1 text-slate-600">{doc.filename}</td>
                                            <td className="py-1.5 px-1 text-slate-500">{fmtDateTime(doc.uploadedOnPortal)}</td>
                                            <td className="py-1.5 px-1 text-slate-500">{safe(doc.uploadedBy)}</td>
                                            <td className="py-1.5 px-1">
                                                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${doc.portalStatus === 'Accepted' ? 'bg-emerald-50 text-emerald-700' : doc.portalStatus === 'Rejected' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {safe(doc.portalStatus, 'Pending')}
                                                </span>
                                            </td>
                                            <td className="py-1.5 px-1 text-right">
                                                <a href={doc.path} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-slate-400 hover:text-blue-600"><Eye size={13} /></a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <button type="button" onClick={() => handlers.onSaveStage(1)} className="mt-2 flex items-center justify-center gap-1.5 w-full rounded-md border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50">
                        View All Documents on Portal
                    </button>
                </Card>
            </div>

            </div>

            <div className="flex flex-col gap-2">
                <ContactDetailsCard contact={contact} saving={handlers.savingContact} onSave={handlers.onSaveContact} />

                {hasOpenAction ? (
                    <Card icon={AlertTriangle} title="Action Required" tone="red">
                        <p className="text-[10.5px] text-slate-600">{actionRequired.message}</p>
                        {actionRequired.dueDate && <p className="mt-1.5 text-[10px] text-red-600 font-semibold flex items-center gap-1"><Calendar size={11} /> Due Date: {fmtDate(actionRequired.dueDate)}</p>}
                        <button type="button" onClick={() => setShowQueryModal(true)} className="mt-2.5 flex items-center justify-center gap-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[10.5px] font-semibold text-slate-600 hover:bg-slate-50">
                            <MessageSquare size={13} /> View Query / Communication
                        </button>
                    </Card>
                ) : (
                    <Card icon={CheckCircle2} title="Action Required" tone="emerald">
                        <p className="text-[10.5px] text-slate-500">Nothing pending right now.</p>
                    </Card>
                )}

                <RelationshipManagerCard rm={rm} />
            </div>
            </div>

            {showQueryModal && actionRequired && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-xl">
                        <div className="mb-2 flex items-center justify-between">
                            <strong className="text-[12px] font-bold text-slate-800">Query / Communication</strong>
                            <button type="button" onClick={() => setShowQueryModal(false)}><X size={16} className="text-slate-400" /></button>
                        </div>
                        <p className="text-[11px] text-slate-600">{actionRequired.message}</p>
                        {actionRequired.dueDate && <p className="mt-1.5 text-[10px] text-red-600 font-semibold">Due Date: {fmtDate(actionRequired.dueDate)}</p>}
                        <button type="button" disabled={handlers.savingAction} onClick={async () => { await handlers.onResolveAction(); setShowQueryModal(false); }} className="mt-3 w-full rounded-md bg-emerald-600 px-3 py-1.5 text-[10.5px] font-semibold text-white disabled:opacity-50">Mark as Resolved</button>
                    </div>
                </div>
            )}
        </div>
    );
}
