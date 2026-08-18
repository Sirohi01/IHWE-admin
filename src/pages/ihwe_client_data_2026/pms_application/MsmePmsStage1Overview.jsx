import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    AlertTriangle,
    Building2,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    Download,
    Eye,
    FileEdit,
    FileText,
    Landmark,
    Loader2,
    MessageSquare,
    RefreshCw,
    ShieldAlert,
    ShieldCheck,
    Upload,
    X,
} from 'lucide-react';
import { Card, ContactDetailsCard, Field, InlineField, RelationshipManagerCard } from './msmePmsShared';
import { fmtDate, fmtDateTime, safe } from './msmePmsUtils';

const RISK_TONE = { Low: 'text-emerald-600', Medium: 'text-amber-600', High: 'text-red-600' };

export default function MsmePmsStage1Overview({ data, handlers }) {
    const [showUdyamModal, setShowUdyamModal] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [showQueryModal, setShowQueryModal] = useState(false);
    const [showRaiseModal, setShowRaiseModal] = useState(false);
    const [ackUploading, setAckUploading] = useState(false);

    const contact = data?.contactDetails || {};
    const udyam = data?.udyamDetails || {};
    const screening = data?.aiScreening || {};
    const portal = data?.msmePortal || {};
    const otp = data?.portalOtpContact || {};
    const rm = data?.pmsCoordinator;
    const documents = (Array.isArray(data?.documents) ? data.documents : []).filter((d) => d.path);
    const claimDocLabel = new Map((data?.pmsClaimDocuments || []).map((d) => [d.type, d.label]));
    const actionRequired = data?.actionRequired;
    const hasOpenAction = actionRequired && actionRequired.resolved === false;
    const overallEligible = screening.recommendation === 'PROCEED_WITH_PMS_APPLICATION';
    const udyamDoc = documents.find((d) => d.documentType === 'udyam');
    // Admin-entered udyamDetails wins when set; otherwise fall back to
    // whatever the AI already read straight off the uploaded certificate at
    // upload time (see MSME_EXTRACT_FIELDS.udyam), so this card is populated
    // automatically rather than needing manual re-entry of the same data.
    const udyamExtracted = udyamDoc?.extractedDetails || {};

    return (
        <div className="flex flex-col gap-2">
            {/* ROW 1: PROFILE + CONTACT */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-2">
                <Card icon={Building2} title="Client (Exhibitor) Profile" tone="blue">
                    <div className="flex items-start gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                            <Building2 size={20} />
                        </span>
                        <div className="min-w-0">
                            <strong className="block text-[13.5px] font-bold text-slate-800">{safe(data?.companyName || data?.exhibitorName)}</strong>
                            <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-5 gap-x-4 gap-y-1.5">
                                <Field label="Stall No." value={safe(data?.event?.stallNumber)} />
                                <Field label="Stall Size" value={data?.event?.stallSize ? `${data.event.stallSize} Sq. Mtr.` : '—'} />
                                <Field label="Applicant Category" value={safe(data?.category)} />
                                <Field label="Total Invoice Value (Excl. Taxes)" value={data?.invoiceValue ? `₹${Number(data.invoiceValue).toLocaleString('en-IN')}` : '—'} />
                                <Field label="Event Name" value={safe(data?.event?.name)} />
                            </div>
                        </div>
                    </div>
                    {data?.exhibitorId && (
                        <Link to={`/client-overview/${data.exhibitorId}?source=exhibitor`} className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">
                            View Complete Exhibitor Profile ↗
                        </Link>
                    )}
                </Card>

                <ContactDetailsCard contact={contact} saving={handlers.savingContact} onSave={handlers.onSaveContact} />
            </div>

            {/* ROW 2: AI SCREENING + UDYAM + PORTAL + RM/OTP */}
            <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr_1fr_1fr] gap-2 items-stretch">
                <Card icon={ShieldCheck} title="AI Screening (Detailed) – Recommendation" tone="emerald" action={
                    screening.screenedAt && (
                        <span className={`rounded-full text-[9.5px] font-bold px-2.5 py-0.5 whitespace-nowrap ${overallEligible ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {overallEligible ? 'ELIGIBLE / RECOMMENDED' : screening.recommendation === 'NOT_RECOMMENDED' ? 'NOT ELIGIBLE' : 'REVIEW NEEDED'}
                        </span>
                    )
                }>
                    {!screening.screenedAt ? (
                        <div className="py-3 text-center">
                            <p className="text-[11px] text-slate-500 mb-2">{udyamDoc ? 'Run AI screening against the uploaded Udyam certificate to get a PMS eligibility recommendation.' : 'Upload the Udyam Registration Certificate (Stage 2) before running AI screening.'}</p>
                            <button
                                type="button"
                                disabled={!udyamDoc || handlers.runningScreening}
                                onClick={handlers.onRunAiScreening}
                                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-[10.5px] font-bold text-white disabled:opacity-40"
                            >
                                {handlers.runningScreening ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                                {handlers.runningScreening ? 'Running...' : 'Run AI Screening'}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-[10.5px]"><span className="flex items-center gap-1 text-slate-500 font-semibold"><Check size={11} className="text-emerald-600" />PMS Eligibility</span><strong className="font-bold text-slate-800">{overallEligible ? 'Eligible' : 'Not Eligible'}</strong></div>
                                    <div className="flex items-center justify-between text-[10.5px]"><span className="flex items-center gap-1 text-slate-500 font-semibold"><Check size={11} className="text-emerald-600" />IHWE Category Match</span><strong className="font-bold text-slate-800">{screening.categoryMatch === true ? 'Strong Match' : screening.categoryMatch === false ? 'No Match' : 'Unclear'}</strong></div>
                                    <div className="flex items-center justify-between text-[10.5px]"><span className="flex items-center gap-1 text-slate-500 font-semibold"><Check size={11} className="text-emerald-600" />Best Matching Category</span><strong className="font-bold text-slate-800 text-right">{safe(screening.bestMatchingCategory)}</strong></div>
                                    <div className="flex items-center justify-between text-[10.5px]"><span className="flex items-center gap-1 text-slate-500 font-semibold"><Check size={11} className="text-emerald-600" />NIC Match</span><strong className="font-bold text-slate-800">{safe(screening.nicCodeMatch)}</strong></div>
                                    <div className="flex items-center justify-between text-[10.5px]"><span className="flex items-center gap-1 text-slate-500 font-semibold"><ShieldAlert size={11} className="text-amber-500" />Risk Level</span><strong className={`font-bold ${RISK_TONE[screening.riskLevel] || 'text-slate-800'}`}>{safe(screening.riskLevel)}</strong></div>
                                </div>
                                <div className="rounded-lg bg-slate-50 p-2.5">
                                    <strong className="text-[10.5px] font-bold text-slate-700">AI Recommendation Summary</strong>
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        {screening.categoryMatch ? 'Based on Udyam category, NIC activities and exhibited product category, this exhibitor is aligned with the PMS scheme.' : 'Review the certificate and declared activities against the PMS scheme category before proceeding.'}
                                    </p>
                                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                                        <span className="rounded-md bg-emerald-100 text-emerald-700 text-[9px] font-bold text-center py-1">{overallEligible ? 'ELIGIBLE' : 'REVIEW'}</span>
                                        <span className="rounded-md bg-emerald-100 text-emerald-700 text-[9px] font-bold text-center py-1">{screening.categoryMatch ? 'STRONG MATCH' : 'CHECK MATCH'}</span>
                                        <span className="rounded-md bg-emerald-100 text-emerald-700 text-[9px] font-bold text-center py-1 truncate">{safe(screening.nicCodeMatch, 'NIC N/A')}</span>
                                        <span className="rounded-md bg-emerald-100 text-emerald-700 text-[9px] font-bold text-center py-1">{safe(screening.riskLevel, 'N/A')}</span>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={handlers.runningScreening}
                                        onClick={handlers.onRunAiScreening}
                                        className="mt-2 flex items-center justify-center gap-1.5 w-full rounded-md border border-emerald-200 bg-white px-3 py-1.5 text-[10px] font-bold text-emerald-700 disabled:opacity-40"
                                    >
                                        {handlers.runningScreening ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                                        {handlers.runningScreening ? 'Refreshing...' : 'Refresh AI Screening'}
                                    </button>
                                </div>
                            </div>
                            {screening.comments?.length > 0 && (
                                <ul className="mt-1 space-y-1 rounded-lg bg-slate-50 px-2.5 py-1.5">
                                    {screening.comments.map((c, i) => (
                                        <li key={i} className="flex items-start gap-1 text-[9.5px] text-slate-600"><Check size={10} className="text-emerald-600 shrink-0 mt-0.5" />{c}</li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}
                </Card>

                <Card icon={ShieldCheck} title="Udyam Registration Details" tone="violet" action={
                    <button type="button" onClick={() => setShowUdyamModal(true)} className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:underline"><FileEdit size={11} /> Edit</button>
                }>
                    <div>
                        <InlineField label="Udyam Registration No." value={safe(data?.udyamNumber || data?.applicantDetails?.udyamRegNo || udyamExtracted['Udyam Registration Number'])} />
                        <InlineField label="Registration Type" value={safe(udyam.registrationType || udyamExtracted['Registration Type'])} />
                        <InlineField label="Enterprise Type" value={safe(udyam.enterpriseType || udyamExtracted['Type of Enterprise (Micro/Small/Medium)'] || data?.category)} />
                        <InlineField label="Major Activity" value={safe(udyam.majorActivity || udyamExtracted['Major Activity (Manufacturing/Service/Trading)'])} />
                        <InlineField label="Social Category" value={safe(udyam.socialCategory || udyamExtracted['Social Category'])} />
                        <InlineField label="Constitution" value={safe(udyam.constitution || udyamExtracted['Constitution / Organisation Type'])} />
                        <InlineField label="Date of Incorporation" value={udyam.dateOfIncorporation ? fmtDate(udyam.dateOfIncorporation) : safe(udyamExtracted['Date of Incorporation / Commencement'])} />
                    </div>
                    {udyamDoc?.path && (
                        <a href={udyamDoc.path} target="_blank" rel="noreferrer" className="mt-2 flex items-center justify-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-[10.5px] font-semibold text-slate-600 hover:bg-slate-50">
                            <Download size={12} /> View / Download Udyam Certificate
                        </a>
                    )}
                </Card>

                <Card icon={Landmark} title="MSME Portal Submission Details" tone="blue">
                    <div className="space-y-1.5">
                        <div>
                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">MSME Application No.</label>
                            <input
                                key={`appno-${portal.applicationNo || ''}`}
                                defaultValue={portal.applicationNo || ''}
                                placeholder="e.g. PMS/2026/007282"
                                onBlur={(e) => { if (e.target.value !== (portal.applicationNo || '')) handlers.onSavePortal({ applicationNo: e.target.value }); }}
                                className="mt-0.5 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-[11.5px] font-bold text-slate-800"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Submitted On</label>
                                <input
                                    type="date"
                                    key={`submittedon-${portal.submittedOn || ''}`}
                                    defaultValue={portal.submittedOn ? String(portal.submittedOn).slice(0, 10) : ''}
                                    onBlur={(e) => { if (e.target.value) handlers.onSavePortal({ submittedOn: e.target.value }); }}
                                    className="mt-0.5 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-[11.5px] font-bold text-slate-800"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Submitted By</label>
                                <input
                                    key={`submittedby-${portal.submittedBy || ''}`}
                                    defaultValue={portal.submittedBy || ''}
                                    placeholder="e.g. Anil Mehta"
                                    onBlur={(e) => { if (e.target.value !== (portal.submittedBy || '')) handlers.onSavePortal({ submittedBy: e.target.value }); }}
                                    className="mt-0.5 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-[11.5px] font-bold text-slate-800"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Last Status Checked</label>
                                <input
                                    readOnly
                                    value={fmtDateTime(portal.lastStatusChecked)}
                                    className="mt-0.5 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">MSME Portal Status</label>
                                <select
                                    key={`status-${portal.currentStatus || ''}`}
                                    defaultValue={portal.currentStatus || ''}
                                    onChange={(e) => handlers.onSavePortal({ currentStatus: e.target.value })}
                                    className="mt-0.5 w-full rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-[10.5px] font-bold text-orange-600"
                                >
                                    <option value="">— Not set —</option>
                                    <option value="Under Scrutiny">Under Scrutiny</option>
                                    <option value="Under Review">Under Review</option>
                                    <option value="Query Raised">Query Raised</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Remarks / Query from MSME Portal</label>
                            <textarea
                                key={`remarks-${portal.remarks || ''}`}
                                defaultValue={portal.remarks || ''}
                                rows={2}
                                placeholder="None"
                                onBlur={(e) => { if (e.target.value !== (portal.remarks || '')) handlers.onSavePortal({ remarks: e.target.value }); }}
                                className="mt-0.5 w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700"
                            />
                        </div>
                    </div>
                    {portal.acknowledgementFile ? (
                        <a href={portal.acknowledgementFile} target="_blank" rel="noreferrer" className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:underline">
                            <FileText size={11} /> {safe(portal.acknowledgementFileName, 'Acknowledgement.pdf')}
                            {portal.acknowledgementFileSize > 0 && <span className="text-slate-400 font-normal">({Math.round(portal.acknowledgementFileSize / 1024)} KB)</span>}
                        </a>
                    ) : (
                        <label className={`mt-1.5 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-bold cursor-pointer ${ackUploading ? 'opacity-50 bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                            {ackUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                            {ackUploading ? 'Uploading...' : 'Upload Acknowledgement'}
                            <input type="file" accept="application/pdf,image/jpeg,image/png" className="hidden" disabled={ackUploading} onChange={async (e) => {
                                const file = e.target.files?.[0];
                                e.target.value = '';
                                if (!file) return;
                                setAckUploading(true);
                                try { await handlers.onUploadAcknowledgement(file); } finally { setAckUploading(false); }
                            }} />
                        </label>
                    )}
                </Card>

                <div className="flex flex-col gap-2">
                    <RelationshipManagerCard rm={rm} />

                    <Card icon={ShieldCheck} title="MSME Portal Login (OTP Contact)" tone="teal" action={
                        <button type="button" onClick={() => setShowOtpModal(true)} className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:underline"><FileEdit size={11} /> Edit</button>
                    }>
                        <p className="text-[9.5px] text-slate-500 mb-1.5">OTP is sent on the below mobile number and email ID registered on MSME portal.</p>
                        <Field label="Contact Person (Portal)" value={safe(otp.contactPerson || udyamExtracted['Contact Person Name'])} />
                        <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-slate-500">Mobile Number (OTP)</span>
                            <span className="flex items-center gap-1 text-[10.5px] font-bold text-slate-800">
                                {safe(otp.mobile || udyamExtracted['Mobile Number'])} {otp.mobileVerified && <span className="rounded-full bg-emerald-50 text-emerald-600 text-[8.5px] font-bold px-1.5 py-0.5">Verified</span>}
                            </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-slate-500">Email ID (OTP)</span>
                            <span className="flex items-center gap-1 text-[10.5px] font-bold text-slate-800">
                                {safe(otp.email || udyamExtracted['Email ID'])} {otp.emailVerified && <span className="rounded-full bg-emerald-50 text-emerald-600 text-[8.5px] font-bold px-1.5 py-0.5">Verified</span>}
                            </span>
                        </div>
                    </Card>
                </div>
            </div>

            {/* DOCUMENTS TABLE + ACTION REQUIRED */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-2 items-start">
            <Card icon={FileText} title="Documents Uploaded on MSME Portal & in CRM" tone="blue" action={
                <button type="button" onClick={handlers.onGoToStage2} className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 text-[9.5px] font-bold text-slate-600 hover:bg-slate-50">
                    <Upload size={11} /> Upload New Document
                </button>
            }>
                <p className="text-[10px] text-slate-500 -mt-1 mb-2">Upload the same documents that are uploaded on MSME portal for record &amp; verification.</p>
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
                                    <th className="py-1.5 px-1">Uploaded in CRM</th>
                                    <th className="py-1.5 px-1">Uploaded By</th>
                                    <th className="py-1.5 px-1">Portal Status</th>
                                    <th className="py-1.5 px-1">CRM Status</th>
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
                                        <td className="py-1.5 px-1 text-slate-500">{fmtDateTime(doc.uploadedAt)}</td>
                                        <td className="py-1.5 px-1 text-slate-500">{safe(doc.uploadedBy)}</td>
                                        <td className="py-1.5 px-1">
                                            <select value={doc.portalStatus || ''} onChange={(e) => handlers.onSetDocumentStatus(doc._id, { portalStatus: e.target.value })} className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${doc.portalStatus === 'Accepted' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : doc.portalStatus === 'Rejected' ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                                                <option value="">—</option>
                                                <option value="Accepted">Accepted</option>
                                                <option value="Pending">Pending</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </td>
                                        <td className="py-1.5 px-1">
                                            <select value={doc.status || 'Submitted'} onChange={(e) => handlers.onSetDocumentStatus(doc._id, { status: e.target.value })} className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${doc.status === 'Verified' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : doc.status === 'Rejected' ? 'border-red-200 bg-red-50 text-red-700' : 'border-blue-100 bg-blue-50 text-blue-700'}`}>
                                                <option value="Submitted">Submitted</option>
                                                <option value="Verified">Verified</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
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
            </Card>

            {hasOpenAction ? (
                <Card icon={AlertTriangle} title="Action Required" tone="red">
                    <p className="text-[10.5px] text-slate-600">{actionRequired.message}</p>
                    {actionRequired.dueDate && <p className="mt-1.5 text-[10px] text-red-600 font-semibold flex items-center gap-1"><Calendar size={11} /> Due Date: {fmtDate(actionRequired.dueDate)}</p>}
                    <div className="mt-2.5 flex flex-col gap-1.5">
                        <button type="button" onClick={handlers.onGoToStage2} className="flex items-center justify-center gap-1.5 rounded-md bg-orange-500 px-3 py-1.5 text-[10.5px] font-bold text-white hover:bg-orange-600">
                            <Upload size={13} /> Upload Document
                        </button>
                        <button type="button" onClick={() => setShowQueryModal(true)} className="flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[10.5px] font-semibold text-slate-600 hover:bg-slate-50">
                            <MessageSquare size={13} /> View Query / Communication
                        </button>
                    </div>
                </Card>
            ) : (
                <Card icon={CheckCircle2} title="Action Required" tone="emerald">
                    <p className="text-[10.5px] text-slate-500">Nothing pending right now.</p>
                    <button type="button" onClick={() => setShowRaiseModal(true)} className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[10.5px] font-semibold text-slate-600 hover:bg-slate-50">
                        Raise a Query
                    </button>
                </Card>
            )}
            </div>

            {showUdyamModal && (
                <UdyamDetailsModal initial={udyam} saving={handlers.savingUdyam} onClose={() => setShowUdyamModal(false)} onSave={async (v) => { await handlers.onSaveUdyamDetails(v); setShowUdyamModal(false); }} />
            )}
            {showOtpModal && (
                <OtpContactModal initial={otp} saving={handlers.savingOtp} onClose={() => setShowOtpModal(false)} onSave={async (v) => { await handlers.onSavePortalOtpContact(v); setShowOtpModal(false); }} />
            )}
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
            {showRaiseModal && (
                <RaiseActionModal saving={handlers.savingAction} onClose={() => setShowRaiseModal(false)} onSave={async (v) => { await handlers.onRaiseAction(v); setShowRaiseModal(false); }} />
            )}
        </div>
    );
}

function UdyamDetailsModal({ initial, saving, onClose, onSave }) {
    const [values, setValues] = useState({
        registrationType: initial?.registrationType || '',
        enterpriseType: initial?.enterpriseType || '',
        majorActivity: initial?.majorActivity || '',
        socialCategory: initial?.socialCategory || '',
        constitution: initial?.constitution || '',
        dateOfIncorporation: initial?.dateOfIncorporation ? String(initial.dateOfIncorporation).slice(0, 10) : '',
    });
    const set = (k, v) => setValues((prev) => ({ ...prev, [k]: v }));
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="mb-3 flex items-center justify-between">
                    <strong className="text-[13px] font-bold text-slate-800">Edit Udyam Registration Details</strong>
                    <button type="button" onClick={onClose}><X size={16} className="text-slate-400" /></button>
                </div>
                <div className="space-y-2.5">
                    {[
                        ['registrationType', 'Registration Type'], ['enterpriseType', 'Enterprise Type (Micro/Small/Medium)'],
                        ['majorActivity', 'Major Activity'], ['socialCategory', 'Social Category'], ['constitution', 'Constitution'],
                    ].map(([key, label]) => (
                        <div key={key}>
                            <label className="text-[10px] font-semibold text-slate-500">{label}</label>
                            <input value={values[key]} onChange={(e) => set(key, e.target.value)} className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-[11px]" />
                        </div>
                    ))}
                    <div>
                        <label className="text-[10px] font-semibold text-slate-500">Date of Incorporation</label>
                        <input type="date" value={values.dateOfIncorporation} onChange={(e) => set('dateOfIncorporation', e.target.value)} className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-[11px]" />
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

function OtpContactModal({ initial, saving, onClose, onSave }) {
    const [values, setValues] = useState({
        contactPerson: initial?.contactPerson || '',
        mobile: initial?.mobile || '',
        mobileVerified: initial?.mobileVerified || false,
        email: initial?.email || '',
        emailVerified: initial?.emailVerified || false,
    });
    const set = (k, v) => setValues((prev) => ({ ...prev, [k]: v }));
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-xl">
                <div className="mb-3 flex items-center justify-between">
                    <strong className="text-[13px] font-bold text-slate-800">Edit Portal OTP Contact</strong>
                    <button type="button" onClick={onClose}><X size={16} className="text-slate-400" /></button>
                </div>
                <div className="space-y-2.5">
                    <div>
                        <label className="text-[10px] font-semibold text-slate-500">Contact Person (Portal)</label>
                        <input value={values.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-[11px]" />
                    </div>
                    <div className="flex gap-2 items-end">
                        <div className="flex-1">
                            <label className="text-[10px] font-semibold text-slate-500">Mobile Number (OTP)</label>
                            <input value={values.mobile} onChange={(e) => set('mobile', e.target.value)} className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-[11px]" />
                        </div>
                        <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 pb-2"><input type="checkbox" checked={values.mobileVerified} onChange={(e) => set('mobileVerified', e.target.checked)} /> Verified</label>
                    </div>
                    <div className="flex gap-2 items-end">
                        <div className="flex-1">
                            <label className="text-[10px] font-semibold text-slate-500">Email ID (OTP)</label>
                            <input value={values.email} onChange={(e) => set('email', e.target.value)} className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-[11px]" />
                        </div>
                        <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 pb-2"><input type="checkbox" checked={values.emailVerified} onChange={(e) => set('emailVerified', e.target.checked)} /> Verified</label>
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

function RaiseActionModal({ saving, onClose, onSave }) {
    const [message, setMessage] = useState('');
    const [dueDate, setDueDate] = useState('');
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-xl">
                <div className="mb-3 flex items-center justify-between">
                    <strong className="text-[12.5px] font-bold text-slate-800">Raise a Query</strong>
                    <button type="button" onClick={onClose}><X size={16} className="text-slate-400" /></button>
                </div>
                <label className="text-[10px] font-semibold text-slate-500">Message to exhibitor</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="e.g. MSME has requested an additional payment document." className="mt-1 w-full resize-none rounded-md border border-slate-200 px-2 py-1.5 text-[11px]" />
                <label className="mt-2.5 block text-[10px] font-semibold text-slate-500">Due Date (optional)</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-[11px]" />
                <div className="mt-4 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-3 py-1.5 text-[10.5px] font-semibold text-slate-600">Cancel</button>
                    <button type="button" disabled={saving || !message.trim()} onClick={() => onSave({ message: message.trim(), dueDate })} className="rounded-md bg-orange-500 px-3 py-1.5 text-[10.5px] font-semibold text-white disabled:opacity-50">{saving ? 'Sending...' : 'Send'}</button>
                </div>
            </div>
        </div>
    );
}
