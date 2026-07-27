import { useState } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    Check,
    CheckCircle2,
    Edit3,
    FileCheck2,
    FileText,
    Headphones,
    Hourglass,
    IndianRupee,
    Info,
    Landmark,
    Lightbulb,
    Mail,
    Phone,
    Save,
    ShieldCheck,
    User,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import type { ReactNode } from 'react';
import { useNavigate } from "react-router-dom";
const safe = (value, fallback = '—') => {
    if (value === null || value === undefined || value === '') return fallback;
    return value;
};

const fieldValue = (data, paths, fallback) => {
    for (const path of paths) {
        const value = path.split('.').reduce((obj, key) => obj?.[key], data);
        if (value !== null && value !== undefined && value !== '') return value;
    }
    return fallback;
};

const STEPS = [
    { number: 1, label: 'Applicant Details', status: 'done' },
    { number: 2, label: 'Bank Details', status: 'done' },
    { number: 3, label: 'Documents Upload', status: 'done' },
    { number: 4, label: 'Review', status: 'active' },
    { number: 5, label: 'Submit', status: 'pending' },
];

const UPLOADED_DOCUMENTS = [
    { id: 'udyam', name: 'Udyam Registration Certificate' },
    { id: 'gst', name: 'GST Certificate' },
    { id: 'pan', name: 'PAN Card' },
    { id: 'aadhaar', name: 'Aadhaar Card' },
    { id: 'cheque', name: 'Cancelled Cheque' },
    { id: 'statement', name: 'Bank Statement (Last 6 Months)' },
    { id: 'hotelInvoice', name: 'Hotel Invoice(s)' },
    { id: 'hotelPayment', name: 'Hotel Payment Proof' },
    { id: 'travelExpense', name: 'Travel Expense Proof' },
    { id: 'travelInvoice', name: 'Travel Invoice' },
    { id: 'courier', name: 'Courier / Logistics Invoice' },
    { id: 'marketing', name: 'Marketing / Printing Invoice' },
];

const CLAIM_ITEMS = [
    { id: 'stallCharges', label: 'Stall Charges' },
    { id: 'hotelStay', label: 'Hotel Stay' },
    { id: 'travel', label: 'Travel' },
    { id: 'courier', label: 'Courier' },
    { id: 'marketing', label: 'Marketing' },
];

interface SectionProps {
    icon: ReactNode;
    letter: string;
    title: string;
    note?: string;
    description?: ReactNode;
    headerRight?: ReactNode;
    className?: string;
    children?: ReactNode;
}

function Section({ icon, letter, title, note, description, headerRight, className = '', children }: SectionProps) {
    return (
        <section className={`min-w-0 overflow-hidden rounded-xl border border-[#dbe4ef] bg-white px-3 py-1.5 shadow-[0_2px_8px_rgba(9,32,74,0.025)] ${className}`}>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[#087536]">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#d9eee2] bg-[#eff9f3] text-[#087536]">
                        {icon}
                    </span>
                    <strong className="whitespace-nowrap text-[13px] font-semibold text-[#087536]">{letter}. {title}</strong>
                    {note && <small className="-ml-1 whitespace-nowrap text-[9px] font-medium self-center mt-0.5 text-[#4a75e4]">{note}</small>}
                </div>
                {headerRight}
            </div>
            {description && (
                <p className="mb-1.5 text-[9.5px] font-medium text-[#5a6c92]">{description}</p>
            )}
            {children}
        </section>
    );
}

function StepNode({ step }) {
    const isDone = step.status === 'done';
    const isActive = step.status === 'active';

    return (
        <div className="relative z-10 flex flex-col items-center gap-1">
            <span
                className={`grid h-[26px] w-[26px] place-items-center rounded-full border-[3px] border-white text-[9px] font-semibold ${
                    isDone || isActive
                        ? 'bg-[#087536] text-white shadow-[0_4px_10px_rgba(8,117,54,0.18)]'
                        : 'bg-[#e7ebf3] text-[#061743] shadow-[0_0_0_1px_rgba(219,228,239,0.15)]'
                }`}
            >
                {isDone ? <Check size={10} strokeWidth={3} /> : step.number}
            </span>
            <small className={`${isDone ? 'text-[#087536]' : 'text-[#8090ad]'} whitespace-nowrap text-[9px] font-semibold`}>{step.label}</small>
            <small
                className={`text-[9px] font-semibold ${
                    isActive ? 'text-[#f25a1d]' : isDone ? 'text-[#087536]' : 'text-[#8090ad]'
                }`}
            >
                {isDone ? 'Completed' : isActive ? 'In Progress' : 'Pending'}
            </small>
        </div>
    );
}

function SummaryRow({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-2 border-b border-[#e9eef4] py-1 last:border-b-0">
            <span className="text-[9.5px] font-semibold text-[#31446c]">{label}</span>
            <strong className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap text-right text-[9.5px] font-semibold text-[#061743]">{value}</strong>
        </div>
    );
}

function EditButton({ onClick }: { onClick?: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex h-6 shrink-0 items-center gap-1 rounded-md border border-[#d5deea] bg-white px-2 text-[9px] font-semibold text-[#061743]"
        >
            <Edit3 size={11} strokeWidth={2.1} />
            Edit
        </button>
    );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="flex items-start gap-1 py-[3px] text-[9px]">
            <span className="w-[132px] shrink-0 font-medium text-[#5a6c92]">{label}</span>
            <span className="font-medium text-[#5a6c92]">:</span>
            <strong className="min-w-0 break-words font-semibold text-[#061743]">{value}</strong>
        </div>
    );
}

function DetailRowVerified({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="flex items-center gap-1 py-[3px] text-[9.5px]">
            <span className="w-[132px] shrink-0 font-medium text-[#5a6c92]">{label}</span>
            <span className="font-medium text-[#5a6c92]">:</span>
            <strong className="font-semibold text-[#087536]">{value}</strong>
            <CheckCircle2 size={12} strokeWidth={2.2} className="text-[#087536]" />
        </div>
    );
}

function StatusChip({ status }) {
    const isUploaded = status === 'Uploaded';
    return (
        <span className={`inline-flex items-center justify-center text-center gap-1 w-16 whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-semibold border ${
            isUploaded
                ? 'text-[#087536] bg-[#eafbf1] border-[#b7ecd0]'
                : 'text-[#e07a12] bg-[#fef6ec] border-[#fbdfb0]'
        }`}>
            {isUploaded ? (
              ''
            ) : (
                <Hourglass size={11} strokeWidth={2.2} className="text-[#e07a12]" />
            )}
            {status}
        </span>
    );
}

function DocumentCard({ doc }) {
    const isUploaded = doc.status === 'Uploaded'
    return (
        <div className="flex min-w-0 flex-col gap-2 rounded-lg border border-[#e9eef4] bg-[#fbfcfe] p-1.5">
            <div className="flex items-start gap-1.5">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#e0e7f0] bg-white text-[#6b82ac]">
                    <FileText size={13} strokeWidth={2} color={isUploaded?"#087536":"#e07a12"}  />
                </span>
                <div className="min-w-0">
                    <strong className="block text-[9px] font-semibold leading-snug text-[#061743]">{doc.name}</strong>
                    <span className="mt-0.5 block truncate text-[9px] font-medium text-[#8090ad]">{doc.file}</span>
                </div>
            </div>
            <div className="flex justify-end">
                <StatusChip status={doc.status} />
            </div>
        </div>
    );
}

function FieldColumn({ label, value, valueNode }: { label: string; value?: ReactNode; valueNode?: ReactNode }) {
    return (
        <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[9px] font-semibold text-[#5a6c92] ">{label}</span>
            {valueNode ?? <strong className="text-[9.5px] font-semibold text-[#061743] max-w-[120px]">{value}</strong>}
        </div>
    );
}

function StatusPill({ label }: { label: string }) {
    return (
        <span className="inline-flex w-fit items-center justify-center rounded px-1.5 py-0.5 text-[9px] font-semibold text-[#087536] bg-[#eafbf1] border border-[#b7ecd0]">
            {label}
        </span>
    );
}

function ProgressRing({ percent }) {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r={radius} className="fill-none stroke-[#e7ebf3]" strokeWidth={6} />
            <circle
                cx="36" cy="36" r={radius}
                className="fill-none stroke-[#087536] transition-[stroke-dashoffset] duration-300"
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 36 36)"
            />
            <text x="36" y="34" textAnchor="middle" className="fill-[#087536] text-[13px] font-semibold">{percent}%</text>
            <text x="36" y="46" textAnchor="middle" className="fill-[#6b7ea3] text-[6px] font-semibold uppercase">Completed</text>
        </svg>
    );
}

export default function MSMEPMSReviewConfirmation({ data, onBack, onContinue, saving }) {
      const navigate = useNavigate();
    const companyName = fieldValue(data, ['exhibitorName', 'companyName', 'organizationName'], '—');
    const msmeCategory = safe(data?.msme?.msmeCategory);
    const udyamNumber = safe(data?.msme?.udyamRegNo);
    const gstNumber = safe(data?.gstNo || data?.gstNumber);
    const panNumber = safe(data?.panNo || data?.panNumber);

    const [documents] = useState(() => UPLOADED_DOCUMENTS.map(doc => {
        const uploaded = data?.documents?.find(item => item.documentType === doc.id);
        return uploaded ? { ...doc, file: uploaded.filename, status: 'Uploaded' } : { ...doc, file: null, status: 'Pending' };
    }));
    const uploadedCount = documents.filter(doc => doc.status === 'Uploaded').length;
    const totalCount = documents.length;

    const activeIndex = STEPS.findIndex(step => step.status === 'active');
    const progressWidth = `${((activeIndex + 0.5) / (STEPS.length - 1)) * 100}%`;

    const totalClaimed = data?.claim?.totalClaimed;

    return (
        <div className="w-full min-h-[calc(100dvh-58px)] bg-white p-3 px-3 lg:px-6 pt-2 pb-3 font-sans text-[#061743] antialiased">
            <header className="mb-1 flex flex-wrap items-start justify-between gap-3  xl:pr-[300px]">
                <div>
                    <h1 className="m-0 text-[21px] font-semibold tracking-[-0.35px] text-[#061743] leading-[22.68px]">MSME PMS Application</h1>
                    <p className="text-[13px] font-semibold text-[#061743]">
                        <b className="font-semibold text-[#087536]">Step 4 of 5</b> — Review &amp; Confirmation
                    </p>
                </div>

                <div className="flex gap-2">
                    <div className="h-[55px] w-fit rounded-lg border border-[#dbe4ef] bg-blue-50 px-3 pb-2 pt-2 shadow-sm">
                        <span className="block text-[10px] font-medium text-[#31436b]">Application ID</span>
                        <strong className="mt-1 block whitespace-nowrap text-xs font-semibold text-[#061743]">
                            {safe(data?.applicationId)}
                        </strong>
                    </div>
                    <div className="h-[55px] w-fit rounded-lg border border-orange-100 bg-orange-50 px-3 pb-2 pt-2 shadow-sm pr-5">
                        <span className="block text-[10px] font-medium text-[#31436b]">Status</span>
                        <strong className="mt-1 block whitespace-nowrap text-xs font-semibold text-[#f25a1d]">{safe(data?.status)}</strong>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 items-start gap-2 xl:grid-cols-[minmax(0,1fr)_278px]">
                <div className="flex min-w-0 flex-col gap-2">
                    <div className="relative grid grid-cols-5 items-start pt-0.5">
                        <div className="absolute left-[5px] right-[5px] top-[18px] z-0 h-0.5 rounded-full bg-[#dce3ed]">
                            <span className="block h-full rounded-full bg-[#087536]" style={{ width: progressWidth }} />
                        </div>
                        {STEPS.map(step => <StepNode key={step.number} step={step} />)}
                    </div>

                    <main className="flex flex-col gap-2">
                        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                            <Section
                                letter="1"
                                title="Applicant &amp; MSME Details"
                                icon={<User size={17} strokeWidth={1.8} />}
                                headerRight={<EditButton />}
                            >
                                <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
                                    <div>
                                        <DetailRow label="Company Name" value={companyName} />
                                        <DetailRow label="Udyam Registration Number" value={udyamNumber} />
                                        <DetailRow label="MSME Category" value={msmeCategory} />
                                        <DetailRow label="GST Number" value={gstNumber} />
                                        <DetailRow label="PAN Number" value={panNumber} />
                                    </div>
                                    <div>
                                        <DetailRow label="Type of Organization" value={safe(data?.organizationType || data?.orgType)} />
                                        <DetailRow label="Year of Establishment" value={safe(data?.yearOfEstablishment)} />
                                        <DetailRow label="Contact Person" value={safe(data?.contactName || data?.contactPerson)} />
                                        <DetailRow label="Designation" value={safe(data?.designation)} />
                                        <DetailRow label="Mobile Number" value={safe(data?.mobileNumber)} />
                                        <DetailRow label="Email ID" value={safe(data?.emailId || data?.email)} />
                                    </div>
                                </div>
                            </Section>

                            <Section
                                letter="2"
                                title="Bank Details"
                                icon={<Landmark size={17} strokeWidth={1.8} />}
                                headerRight={<EditButton />}
                            >
                                <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
                                    <div>
                                        <DetailRow label="Account Holder Name" value={safe(data?.bank?.accountHolder, companyName)} />
                                        <DetailRow label="Bank Name" value={safe(data?.bank?.bankName)} />
                                        <DetailRow label="Branch" value={safe(data?.bank?.branch)} />
                                        <DetailRow label="Account Number" value={safe(data?.bank?.accountNumber)} />
                                    </div>
                                    <div>
                                        <DetailRow label="IFSC Code" value={safe(data?.bank?.ifsc)} />
                                        <DetailRow label="Account Type" value={safe(data?.bank?.accountType)} />
                                        <DetailRowVerified label="Cancelled Cheque" value="Uploaded" />
                                        <DetailRowVerified label="Bank Statement (Last 6 Months)" value="Uploaded" />
                                    </div>
                                </div>
                            </Section>
                        </div>

                        <Section
                            letter="3"
                            title="Uploaded Documents"
                            icon={<FileCheck2 size={17} strokeWidth={1.8} />}
                            headerRight={<EditButton />}
                            description={<>Documents Completed: <b className="font-semibold text-[#061743]">{uploadedCount} of {totalCount}</b></>}
                        >
                            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
                                {documents.map(doc => (
                                    <DocumentCard key={doc.id} doc={doc} />
                                ))}
                            </div>
                            <a href="#" onClick={(event) => event.preventDefault()} className="mt-1.5 inline-flex items-center gap-1 text-[9.5px] font-semibold text-[#2a6bd6] hover:underline">
                                View All Documents Checklist
                                <ArrowRight size={12} strokeWidth={2.4} />
                            </a>
                        </Section>

                        <Section
                            letter="4"
                            title="Event Participation Details"
                            note="(Auto filled)"
                            icon={<Calendar size={17} strokeWidth={1.8} />}
                        >
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                                <FieldColumn label="Event Name" value={safe(data?.event?.name || data?.eventName)} />
                                <FieldColumn label="Stall Number" value={safe(data?.event?.stallNumber || data?.stallNo)} />
                                <FieldColumn label="Hall Number" value={safe(data?.event?.hallNumber || data?.hallNo)} />
                                <FieldColumn label="Stall Size" value={safe(data?.event?.stallSize || data?.stallSize)} />
                                <FieldColumn label="Participation Type" value={safe(data?.event?.participationType || data?.participationType)} />
                                <FieldColumn label="Booking Status" valueNode={<StatusPill label={safe(data?.event?.bookingStatus || data?.bookingStatus)} />} />
                                <FieldColumn label="Payment Status" valueNode={<StatusPill label={safe(data?.event?.paymentStatus || data?.paymentStatus)} />} />
                            </div>
                        </Section>

                        <Section
                            letter="5"
                            title="Claim Summary"
                            icon={<IndianRupee size={17} strokeWidth={1.8} />}
                        >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <div className="grid flex-1 grid-cols-3 gap-3 sm:grid-cols-6">
                                    {CLAIM_ITEMS.map(item => (
                                        <FieldColumn key={item.id} label={item.label} value={data?.claim?.[item.id] != null ? `₹${Number(data.claim[item.id]).toLocaleString('en-IN')}` : '—'} />
                                    ))}
                                    <FieldColumn label="Total Claimed" value={totalClaimed != null ? `₹${Number(totalClaimed).toLocaleString('en-IN')}` : '—'} />
                                </div>
                                <div className="flex w-full shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-[#b7ecd0] bg-[#eafbf1] px-4 py-1.5 sm:w-[190px]">
                                    <span className="text-[9px] font-semibold text-[#087536]">Indicative Eligible Claim</span>
                                    <strong className="text-[15px] font-semibold text-[#087536]">{data?.claim?.eligibleAmount != null ? `₹${Number(data.claim.eligibleAmount).toLocaleString('en-IN')}` : '—'}</strong>
                                </div>
                            </div>
                            <div className="mt-1.5 flex items-start gap-1.5 text-[9px] font-medium text-[#5a6c92]">
                                <Info size={12} strokeWidth={2.2} className="mt-[1px] shrink-0 text-blue-500" />
                                *Maximum benefit is subject to scheme rules, eligibility and final approval by the concerned authority.
                            </div>
                        </Section>

                        <footer className="grid grid-cols-1 items-center gap-2 rounded-lg border border-[#dbe4ef] bg-white p-1.5 sm:grid-cols-[120px_minmax(0,1fr)_190px]">
                            <button
                                type="button"
                                onClick={() => onBack ? onBack() : navigate('/exhibitor-dashboard/msme/documents-upload')}
                                className="flex h-7 items-center justify-center gap-2 rounded-md border border-[#d5deea] bg-white text-[10px] font-semibold text-[#061743]"
                            >
                                <ArrowLeft size={15} strokeWidth={2} />
                                Back
                            </button>

                            <button
                                type="button"
                                className="mx-auto flex h-7 w-fit items-center justify-center gap-2 rounded-md border border-[#d5deea] bg-white px-4 text-[10px] font-semibold text-[#061743]"
                            >
                                <Save size={15} strokeWidth={2} />
                                Save Draft
                            </button>

                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => onContinue?.()}
                                className="flex h-7 items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#0b7137] to-[#087536] text-[10px] font-semibold text-white shadow-[0_4px_9px_rgba(8,117,54,0.18)]"
                            >
                                Continue to Submit
                                <ArrowRight size={18} strokeWidth={2} />
                            </button>
                        </footer>
                    </main>
                </div>

                <aside className="flex min-w-0 flex-col gap-2">
                    <section className="min-w-0 overflow-hidden rounded-xl border border-[#dbe4ef] bg-white px-3 py-1.5">
                        <h2 className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-[#087536]">
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#d9eee2] bg-[#eff9f3] text-[#087536]">
                                <ShieldCheck size={18} strokeWidth={1.8} />
                            </span>
                            Application Summary
                        </h2>
                        <SummaryRow label="Company Name" value={companyName} />
                        <SummaryRow label="MSME Category" value={msmeCategory} />
                        <SummaryRow label="Udyam Number" value={udyamNumber} />
                        <SummaryRow label="GST Number" value={gstNumber} />
                        <SummaryRow label="Booking Status" value={safe(data?.event?.bookingStatus || data?.bookingStatus)} />
                        <SummaryRow label="Payment Status" value={safe(data?.event?.paymentStatus || data?.paymentStatus)} />
                    </section>

                    <section className="min-w-0 overflow-hidden rounded-xl border border-[#dbe4ef] bg-white px-3 py-1.5">
                        <h2 className="mb-1.5 text-[13px] font-semibold text-[#061743]">Application Progress</h2>
                        <div className="flex items-center gap-2">
                            <ProgressRing percent={60} />
                            <div>
                                <strong className="block text-[13px] font-semibold text-[#061743]">Step 4 of 5</strong>
                                <p className="mt-0.5 text-[9px] font-medium text-[#31446c]">Review &amp; Confirmation</p>
                            </div>
                        </div>
                    </section>

                    <section className="min-w-0 overflow-hidden rounded-xl border border-[#dbe4ef] bg-white px-3 py-1.5">
                        <h2 className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-[#5924c6]">
                            <Headphones size={19} strokeWidth={1.8} />
                            Contact Person 1
                        </h2>

                        <div className="mb-1.5 flex items-center gap-2">
                            <div className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-[#eef2f7] text-xs font-semibold text-[#061743]">
                                <span>RS</span>
                                <img
                                    src={data?.pmsCoordinator?.photo || undefined}
                                    alt={safe(data?.pmsCoordinator?.name, 'PMS Coordinator')}
                                    className="absolute inset-0 h-full w-full object-cover"
                                    onError={(event) => { event.currentTarget.style.display = 'none'; }}
                                />
                            </div>
                            <div>
                                <strong className="block text-xs font-semibold text-[#061743]">{safe(data?.pmsCoordinator?.name)}</strong>
                                <span className="mt-1 block text-[9px] font-medium text-[#31446c]">{safe(data?.pmsCoordinator?.designation)}</span>
                            </div>
                        </div>

                        <a href={data?.pmsCoordinator?.phone ? `tel:${data.pmsCoordinator.phone}` : undefined} className="mt-1 flex h-[31px] min-w-0 items-center gap-2.5 rounded-md border border-[#e0e7f0] bg-white px-2.5 text-[9.5px] font-semibold text-[#061743] no-underline">
                            <Phone size={15} strokeWidth={1.9} className="shrink-0 text-[#5924c6]" />
                            <span>{safe(data?.pmsCoordinator?.phone)}</span>
                        </a>
                        <a href={data?.pmsCoordinator?.whatsapp ? `https://wa.me/${String(data.pmsCoordinator.whatsapp).replace(/\D/g, '')}` : undefined} target="_blank" rel="noreferrer" className="mt-1 flex h-[31px] min-w-0 items-center gap-2.5 rounded-md border border-[#e0e7f0] bg-white px-2.5 text-[9.5px] font-semibold text-[#061743] no-underline">
                            <FaWhatsapp size={15} strokeWidth={1.9} className="shrink-0 text-[#089a50]" />
                            <span>WhatsApp Support</span>
                        </a>
                        <a href={data?.pmsCoordinator?.email ? `mailto:${data.pmsCoordinator.email}` : undefined} className="mt-1 flex h-[31px] min-w-0 items-center gap-2.5 rounded-md border border-[#e0e7f0] bg-white px-2.5 text-[9.5px] font-semibold text-[#061743] no-underline">
                            <Mail size={15} strokeWidth={1.9} className="shrink-0 text-[#5924c6]" />
                            <span>{safe(data?.pmsCoordinator?.email)}</span>
                        </a>
                    </section>

                    <section className="min-w-0 overflow-hidden rounded-xl border border-[#f1d9ad] bg-[#fffaf1] px-3 py-1.5">
                        <h2 className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-[#f28c00]">
                            <Lightbulb size={18} strokeWidth={1.9} />
                            Important Note
                        </h2>
                        <ul className="list-disc space-y-0.5 pl-4 text-[9.5px] font-medium leading-relaxed text-[#31446c]">
                            <li>Please review all details carefully before final submission.</li>
                            <li>Once submitted, you cannot edit the application.</li>
                            <li>Ensure all uploaded documents are clear and legible.</li>
                            <li>Reimbursement is subject to verification and scheme guidelines.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </div>
    );
}
