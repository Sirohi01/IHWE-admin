import { useState } from 'react';
import {
    Award,
    Ban,
    Building2,
    CheckCircle2,
    FileEdit,
    FileText,
    Landmark,
} from 'lucide-react';

const safe = (value, fallback) => {
    if (fallback === undefined) fallback = '—';
    if (value === null || value === undefined || value === '') return fallback;
    return value;
};

const badgeStyles = {
    approved: { bg: 'bg-[#eff9f3]', text: 'text-[#087536]', border: 'border-[#d9eee2]' },
    disapproved: { bg: 'bg-[#fdeeee]', text: 'text-[#c62828]', border: 'border-[#f4d3d3]' },
    rejected: { bg: 'bg-[#fdeeee]', text: 'text-[#c62828]', border: 'border-[#f4d3d3]' },
    submitted: { bg: 'bg-blue-50', text: 'text-[#1e4197]', border: 'border-blue-100' },
    default: { bg: 'bg-orange-50', text: 'text-[#f25a1d]', border: 'border-orange-100' },
};

function StatusBadge(props) {
    var statusKey = String(props.status || '').toLowerCase();
    var style = badgeStyles[statusKey] || badgeStyles.default;
    var badgeClass = 'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ' + style.bg + ' ' + style.text + ' ' + style.border;
    return (
        <span className={badgeClass}>
            {safe(props.status, 'Pending Review')}
        </span>
    );
}

function Field(props) {
    return (
        <div className="flex items-center justify-between gap-2 border-b border-[#e9eef4] py-1 last:border-b-0">
            <span className="text-[9.5px] font-semibold text-[#31446c]">{props.label}</span>
            <strong className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap text-right text-[9.5px] font-semibold text-[#061743]">
                {safe(props.value)}
            </strong>
        </div>
    );
}

function Block(props) {
    var Icon = props.icon;
    return (
        <section className="min-w-0 overflow-hidden rounded-xl border border-[#dbe4ef] bg-white px-3 py-1.5 shadow-[0_2px_8px_rgba(9,32,74,0.025)]">
            <div className="mb-1.5 flex items-center gap-2 text-[#061743]">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#d9eee2] bg-[#eff9f3] text-[#087536]">
                    <Icon size={14} strokeWidth={1.9} />
                </span>
                <strong className="whitespace-nowrap text-[13px] font-bold text-[#087536]">{props.title}</strong>
            </div>
            {props.children}
        </section>
    );
}

export default function ClientOverview2({ data, onEdit, onApprove, onDisapprove, processing }) {
    const [showReasonBox, setShowReasonBox] = useState(false);
    const [reason, setReason] = useState('');

    const companyName = safe(data && (data.exhibitorName || data.companyName));
    const applicationId = safe(data && data.applicationId);
    const msmeCategory = safe(data && data.msme && data.msme.msmeCategory);
    const udyamNumber = safe(data && data.msme && data.msme.udyamRegNo);
    const gstNumber = safe(data && (data.gstNo || data.gstNumber));
    const bankName = safe(data && data.bank && data.bank.bankName);
    const accountNo = safe(data && data.bank && data.bank.accountNo);
    const ifsc = safe(data && data.bank && data.bank.ifsc);
    const bookingStatus = safe(data && (data.event ? data.event.bookingStatus : data.bookingStatus));
    const paymentStatus = safe(data && (data.event ? data.event.paymentStatus : data.paymentStatus));
    const declarationAgreed = data && data.declarationAgreed ? 'Yes' : 'No';
    const submittedAt = data && data.submittedAt ? new Date(data.submittedAt).toLocaleString() : undefined;
    const documents = (data && Array.isArray(data.documents)) ? data.documents : [];
    const status = data && data.status;

    const isDecided = status === 'Approved' || status === 'Disapproved' || status === 'Rejected';

    const confirmDisapprove = () => {
        if (onDisapprove) onDisapprove(reason);
        setShowReasonBox(false);
        setReason('');
    };

    return (
        <div className="w-full bg-white p-3 font-sans text-[#061743] antialiased">
            <header className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#dbe4ef] bg-white px-3 py-2 shadow-[0_2px_8px_rgba(9,32,74,0.025)]">
                <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#eff9f3] text-[#087536]">
                        <Building2 size={18} strokeWidth={1.9} />
                    </span>
                    <div>
                        <strong className="block text-[13px] font-bold text-[#061743]">{companyName}</strong>
                        <span className="text-[9.5px] font-semibold text-[#6b7ea3]">App ID: {applicationId}</span>
                    </div>
                </div>
                <StatusBadge status={status} />
            </header>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                <Block icon={FileText} title="Applicant & MSME">
                    <Field label="Company Name" value={companyName} />
                    <Field label="MSME Category" value={msmeCategory} />
                    <Field label="Udyam Number" value={udyamNumber} />
                    <Field label="GST Number" value={gstNumber} />
                    <Field label="PAN Number" value={safe(data?.panNo || data?.panNumber)} />
                    <Field label="Organization Type" value={safe(data?.organizationType)} />
                    <Field label="Year of Establishment" value={safe(data?.yearOfEstablishment)} />
                </Block>

                <Block icon={FileText} title="Authorized Person">
                    <Field label="Name" value={safe(data?.contactName || (data?.contact1?.firstName ? `${data.contact1.firstName} ${data.contact1.lastName || ''}` : null))} />
                    <Field label="Designation" value={safe(data?.designation || data?.contact1?.designation)} />
                    <Field label="Mobile Number" value={safe(data?.mobileNumber || data?.contact1?.mobile)} />
                    <Field label="Alternate Number" value={safe(data?.alternateNumber || data?.contact1?.alternateNo)} />
                </Block>

                <Block icon={Building2} title="Registered Address">
                    <Field label="Address Line 1" value={safe(data?.addressLine1 || data?.address)} />
                    <Field label="Address Line 2" value={safe(data?.addressLine2)} />
                    <Field label="City" value={safe(data?.city)} />
                    <Field label="State" value={safe(data?.state)} />
                    <Field label="Country" value={safe(data?.country)} />
                    <Field label="Pincode" value={safe(data?.pincode)} />
                </Block>

                <Block icon={Landmark} title="Event Participation">
                    <Field label="Event Name" value={safe(data?.event?.name || data?.eventName)} />
                    <Field label="Stall Number" value={safe(data?.event?.stallNumber || data?.participation?.stallFor || data?.participation?.stall?.stallNumber || data?.participation?.stallNumber || data?.stallFor || data?.participation?.stallNo || data?.stallNo)} />
                    <Field label="Hall Number" value={safe(data?.event?.hallNumber || data?.participation?.stall?.hallNo || data?.participation?.hallNo || data?.hallNo, 'Hall 8, 9 & 10')} />
                    <Field label="Stall Size" value={safe(data?.event?.stallSize || data?.participation?.stallSize || data?.participation?.stall?.area || data?.participation?.area || data?.stallSize)} />
                    <Field label="Participation Type" value={safe(data?.event?.participationType || data?.participationType)} />
                    <Field label="Selected Expenses" value={safe(data?.selectedExpenses && Array.isArray(data.selectedExpenses) ? data.selectedExpenses.join(', ') : null)} />
                </Block>

                <Block icon={Landmark} title="Bank Details">
                    <Field label="Bank Name" value={bankName} />
                    <Field label="Account No." value={accountNo} />
                    <Field label="IFSC Code" value={ifsc} />
                </Block>

                <Block icon={CheckCircle2} title="Application Status">
                    <Field label="Booking Status" value={bookingStatus} />
                    <Field label="Payment Status" value={paymentStatus} />
                    <Field label="Declaration Agreed" value={declarationAgreed} />
                    <Field label="Submitted At" value={submittedAt} />
                </Block>
            </div>

            {documents.length > 0 ? (
                <Block icon={FileText} title="Uploaded Documents">
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {documents.map(function (doc, i) {
                            var docName = doc && doc.name ? doc.name : 'Document ' + (i + 1);
                            var docUrl = doc && doc.url ? doc.url : undefined;
                            return (
                                <a key={i} href={docUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-md border border-[#e0e7f0] bg-[#f7f9fc] px-2 py-1 text-[9.5px] font-semibold text-[#061743] no-underline">
                                    <FileText size={12} strokeWidth={1.9} className="text-[#087536]" />
                                    <span>{docName}</span>
                                </a>
                            );
                        })}
                    </div>
                </Block>
            ) : null}

            {showReasonBox ? (
                <div className="mt-2 rounded-xl border border-[#f4d3d3] bg-[#fdeeee] px-3 py-2">
                    <label className="mb-1 block text-[9.5px] font-semibold text-[#c62828]">
                        Reason for disapproval
                    </label>
                    <textarea
                        value={reason}
                        onChange={function (e) { setReason(e.target.value); }}
                        rows={2}
                        placeholder="Explain why this application is being disapproved..."
                        className="w-full resize-none rounded-md border border-[#f4d3d3] bg-white px-2 py-1.5 text-[10px] text-[#061743] outline-none"
                    />
                    <div className="mt-1.5 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={function () { setShowReasonBox(false); setReason(''); }}
                            className="rounded-md border border-[#e0e7f0] bg-white px-2.5 py-1 text-[9.5px] font-semibold text-[#061743]"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={!reason.trim() || processing}
                            onClick={confirmDisapprove}
                            className="rounded-md bg-[#c62828] px-2.5 py-1 text-[9.5px] font-semibold text-white disabled:opacity-50"
                        >
                            Confirm Disapproval
                        </button>
                    </div>
                </div>
            ) : null}

            <footer className="mt-2 grid grid-cols-1 gap-2 rounded-xl border border-[#dbe4ef] bg-white p-1.5 sm:grid-cols-3">
                <button
                    type="button"
                    onClick={function () { if (onEdit) onEdit(data); }}
                    className="flex h-8 items-center justify-center gap-2 rounded-md border border-[#d5deea] bg-white text-[10.5px] font-semibold text-[#061743]"
                >
                    <FileEdit size={14} strokeWidth={2} />
                    Edit Application
                </button>

                <button
                    type="button"
                    disabled={isDecided || processing}
                    onClick={function () { setShowReasonBox(true); }}
                    className="flex h-8 items-center justify-center gap-2 rounded-md border border-[#f4d3d3] bg-[#fdeeee] text-[10.5px] font-semibold text-[#c62828] disabled:opacity-50"
                >
                    <Ban size={14} strokeWidth={2} />
                    Disapprove
                </button>

                <button
                    type="button"
                    disabled={isDecided || processing}
                    onClick={function () { if (onApprove) onApprove(); }}
                    className="flex h-8 items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#0b7137] to-[#087536] text-[10.5px] font-semibold text-white shadow-[0_4px_9px_rgba(8,117,54,0.18)] disabled:opacity-50"
                >
                    <Award size={14} strokeWidth={2} />
                    {processing ? 'Processing...' : 'Approve Application'}
                </button>
            </footer>
        </div>
    );
}