import { ReactNode, useState } from 'react';
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    Download,
    Eye,
    FileCheck2,
    FileText,
    Headphones,
    Hourglass,
    Info,
    Lightbulb,
    Loader2,
    Mail,
    MessageCircle,
    Phone,
    Save,
    ShieldCheck,
    UploadCloud,
    User,
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { FaWhatsapp } from 'react-icons/fa6';

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
    { number: 3, label: 'Documents Upload', status: 'active' },
    { number: 4, label: 'Review', status: 'pending' },
    { number: 5, label: 'Submit', status: 'pending' },
];

const REQUIRED_DOCUMENTS = [
    { id: 'udyam', name: 'Udyam Registration Certificate', required: true, description: 'Valid Udyam Registration Certificate', file: 'udyam_cert.pdf', size: '245 KB', status: 'Uploaded' },
    { id: 'gst', name: 'GST Certificate', required: true, description: 'GST Registration Certificate', file: 'gst_certificate.pdf', size: '312 KB', status: 'Uploaded' },
    { id: 'pan', name: 'PAN Card', required: true, description: 'Permanent Account Number (PAN)', file: 'pan_card.pdf', size: '128 KB', status: 'Uploaded' },
    { id: 'aadhaar', name: 'Aadhaar Card', required: true, description: 'Aadhaar Card of Authorized Signatory', file: 'aadhar_card.pdf', size: '256 KB', status: 'Uploaded' },
    { id: 'cheque', name: 'Cancelled Cheque', required: true, description: 'Cancelled Cheque of the Account', file: 'cancelled_cheque.pdf', size: '198 KB', status: 'Uploaded' },
    { id: 'statement', name: 'Bank Statement (Last 6 Months)', required: true, description: 'Bank Statement (Last 6 Months)', file: 'bank_statement.pdf', size: '842 KB', status: 'Uploaded' },
    { id: 'hotelInvoice', name: 'Hotel Invoice(s)', required: true, description: 'Hotel stay invoice with GST details', file: null, size: null, status: 'Pending' },
    { id: 'hotelPayment', name: 'Hotel Payment Proof', required: true, description: 'Payment proof for hotel stay', file: null, size: null, status: 'Pending' },
    { id: 'travelExpense', name: 'Travel Expense Proof', required: true, description: 'Air / Train tickets / Boarding pass', file: null, size: null, status: 'Pending' },
    { id: 'travelInvoice', name: 'Travel Invoice', required: true, description: 'Travel invoice with GST details', file: null, size: null, status: 'Pending' },
    { id: 'courier', name: 'Courier / Logistics Invoice', required: true, description: 'Courier or logistics invoice', file: null, size: null, status: 'Pending' },
    { id: 'marketing', name: 'Marketing / Printing Invoice', required: true, description: 'Marketing, branding or printing invoice', file: null, size: null, status: 'Pending' },
];

const AUTO_DOCUMENTS = [
    { title: 'Tax Invoice' },
    { title: 'Payment Receipt' },
    { title: 'Stall Confirmation Letter' },
    { title: 'Participation Certificate' },
    { title: 'Event Confirmation Letter' },
    { title: 'Organizer Declaration' },
];



interface SectionProps {
    icon: ReactNode;
    letter: string;
    title: string;
    note?: string;
    description?: string;
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
                    {note && <small className="-ml-1 whitespace-nowrap text-[9px] font-medium self-center mt-0.5 text-[#5a6c92]">{note}</small>}
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
                className={`grid h-[26px] w-[26px] place-items-center rounded-full border-[3px] border-white text-[9px] font-semibold ${isDone || isActive
                        ? 'bg-[#087536] text-white shadow-[0_4px_10px_rgba(8,117,54,0.18)]'
                        : 'bg-[#e7ebf3] text-[#061743] shadow-[0_0_0_1px_rgba(219,228,239,0.15)]'
                    }`}
            >
                {isDone ? <Check size={10} strokeWidth={3} /> : step.number}
            </span>
            <small className={`${isDone ? 'text-[#087536]' : 'text-[#8090ad]'} whitespace-nowrap text-[9px] font-semibold`}>{step.label}</small>
            <small
                className={`text-[9px] font-semibold ${isActive ? 'text-[#f25a1d]' : isDone ? 'text-[#087536]' : 'text-[#8090ad]'
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

function StatusBadge({ status }) {
    const isUploaded = status === 'Uploaded';
    return (
        <span className={`inline-flex w-[72px] items-center justify-center gap-1 whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-semibold border ${isUploaded
                ? 'text-[#087536] bg-[#eafbf1] border-[#b7ecd0]'
                : 'text-[#e07a12] bg-[#fef6ec] border-[#fbdfb0]'
            }`}>
            {isUploaded ? (
                <span className="grid h-3 w-3 place-items-center rounded-full bg-[#087536] text-white">
                    <Check size={7} strokeWidth={3} />
                </span>
            ) : (
                <Hourglass size={12} strokeWidth={2.2} className="text-[#e07a12]" />
            )}
            {status}
        </span>
    );
}

function DocumentRow({ index, doc, onUpload, onDelete, uploadingId }) {
    const isUploaded = doc.status === 'Uploaded';
    const isUploading = uploadingId === doc.id;
    const isBlocked = uploadingId !== null && uploadingId !== doc.id;

    return (
        <tr className="border-b border-[#e9eef4] last:border-b-0">
            <td className="whitespace-nowrap p-1.5 text-[9.5px] font-semibold text-[#6b7ea3]">{index + 1}</td>
            <td className="min-w-[150px] p-1.5 text-[9.5px] font-semibold text-[#061743]">
                <span className="inline-flex items-center gap-1.5">
                    <FileText size={12} strokeWidth={2} className="shrink-0 text-[#6b82ac]" />
                    {doc.name}
                    {doc.required && <b className="text-[#e62f28]">*</b>}
                </span>
            </td>
            <td className="min-w-[150px] p-1.5 text-[9.5px] font-medium text-[#5a6c92]">{doc.description}</td>
            <td className="whitespace-nowrap p-1.5">
                {isUploading ? (
                    <span className="inline-flex w-[72px] items-center justify-center gap-1 whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-semibold border text-[#2a6bd6] bg-[#eef4fd] border-[#bcd6f7]">
                        <Loader2 size={10} strokeWidth={2.5} className="animate-spin" />
                        Uploading
                    </span>
                ) : (
                    <StatusBadge status={doc.status} />
                )}
            </td>
            <td className="min-w-[130px] p-1.5 text-[9.5px] font-semibold">
                {isUploaded ? (
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <a href="#" onClick={(event) => event.preventDefault()} className="font-semibold text-[#2a6bd6] hover:underline">{doc.file}</a>
                    </span>
                ) : (
                    <span className="text-[#8090ad]">–</span>
                )}
            </td>
            <td className="min-w-[130px] p-1.5 text-[9.5px] font-semibold">
                {isUploaded ? (
                    <div className='flex items-center gap-4 whitespace-nowrap'>
                        <span className="">({doc.size})</span>
                        <button
                            type="button"
                            onClick={() => doc.url && window.open(doc.url, '_blank', 'noopener,noreferrer')}
                            disabled={!doc.url}
                            className="disabled:opacity-40"
                            title="View document"
                        >
                            <Eye size={16} strokeWidth={2} className="shrink-0" />
                        </button>
                    </div>
                ) : ''}
            </td>
            <td className="whitespace-nowrap p-1.5 text-right">
                {isUploaded ? (
                    <button
                        type="button"
                        onClick={() => onDelete(doc.id)}
                        disabled={isBlocked || isUploading}
                        className="h-[20px] w-[64px] rounded-md border border-red-200 text-center text-[9px] font-semibold text-red-600 disabled:opacity-40"
                    >
                        Remove
                    </button>
                ) : (
                    <label className={`inline-flex h-[20px] w-[64px] items-center justify-center rounded-md border border-[#5924c6] text-center text-[9px] font-semibold text-[#5924c6] ${isBlocked || isUploading ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}>
                        {isUploading ? <Loader2 size={12} strokeWidth={2.5} className="animate-spin" /> : 'Upload'}
                        <input
                            type="file"
                            accept="application/pdf,image/jpeg,image/png"
                            className="hidden"
                            disabled={isBlocked || isUploading}
                            onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(doc.id, file); event.target.value = ''; }}
                        />
                    </label>
                )}
            </td>
        </tr>
    );
}

function AutoDocCard({ title }) {
    return (
        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-[#e9eef4] bg-[#fbfcfe] p-1.5">
            <span className=" text-[#087536]">
                <FileText size={25} strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
                <strong className="block text-[9px] font-semibold text-[#061743]">{title}</strong>
                <a href="#" onClick={(event) => event.preventDefault()} className="mt-0.5 inline-flex items-center gap-1 text-[9px] font-semibold  hover:underline">
                    View / Download
                    <Download size={10} strokeWidth={2.2} className='text-[#087536]' />
                </a>
            </div>
        </div>
    );
}

function InfoBanner({ children }) {
    return (
        <div className="mt-1.5 flex items-center gap-2 rounded-md border border-[#d8e1ec] bg-[#f6f9fc] px-3 py-1.5 text-[9.5px] font-medium text-blue-600">
            <Info size={14} strokeWidth={2.2} className="shrink-0 text-blue-600" />
            {children}
        </div>
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

export default function MSMEPMSDocumentsUpload({ data, onBack, onContinue, onUpload, onDelete, saving }) {
    const companyName = fieldValue(data, ['exhibitorName', 'companyName', 'organizationName'], '—');
    const msmeCategory = safe(data?.msme?.msmeCategory);
    const udyamNumber = safe(data?.msme?.udyamRegNo);
    const gstNumber = safe(data?.gstNo || data?.gstNumber);

    const selectedExpenses = new Set(data?.selectedExpenses || ['Stall Charges']);
    const requiredForApplication = (doc) => {
        if (['udyam', 'gst', 'pan', 'aadhaar', 'cheque', 'statement'].includes(doc.id)) return true;
        if (['hotelInvoice', 'hotelPayment'].includes(doc.id)) return selectedExpenses.has('Hotel Stay');
        if (['travelExpense', 'travelInvoice'].includes(doc.id)) return selectedExpenses.has('Travel');
        if (doc.id === 'courier') return selectedExpenses.has('Courier');
        if (doc.id === 'marketing') return selectedExpenses.has('Marketing Material');
        return false;
    };
    const documentDefinitions = REQUIRED_DOCUMENTS.map(doc => ({ ...doc, required: requiredForApplication(doc) }));
    const [documents, setDocuments] = useState(() => documentDefinitions.map(doc => {
        const uploaded = data?.documents?.find(item => item.documentType === doc.id);
        return uploaded ? { ...doc, status: 'Uploaded', file: uploaded.filename, size: uploaded.size ? `${Math.round(uploaded.size / 1024)} KB` : '', url: uploaded.url || null } : { ...doc, file: null, size: null, status: 'Pending', url: null };
    }));

    const [uploadingId, setUploadingId] = useState(null);

    const uploadedCount = documents.filter(doc => doc.status === 'Uploaded').length;
    const totalCount = documents.length;
    const pendingCount = totalCount - uploadedCount;
    const percentComplete = Math.round((uploadedCount / totalCount) * 100);
    const allUploaded = pendingCount === 0;
  const navigate = useNavigate();

    const handleUpload = async (id, file) => {
        setUploadingId(id);
        try {
            const result = await onUpload?.(id, file);
            setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, status: 'Uploaded', file: file.name, size: `${Math.round(file.size / 1024)} KB`, url: result?.url || doc.url } : doc));
        } finally {
            setUploadingId(null);
        }
    };

    const handleDelete = async (id) => {
        await onDelete?.(id);
        setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, status: 'Pending', file: null, size: null, url: null } : doc));
    };

    return (
        <div className="w-full min-h-[calc(100dvh-58px)] bg-white p-3 px-3 lg:px-6 pt-2 pb-3 font-sans text-[#061743] antialiased">
            <header className="mb-1 flex flex-wrap items-start justify-between gap-3 xl:pr-[300px]">
                <div>
                    <h1 className="m-0 text-[21px] font-semibold tracking-[-0.35px] text-[#061743] leading-[22.68px]">MSME PMS Application</h1>
                    <p className="text-[13px] font-semibold text-[#061743]">
                        <b className="font-semibold text-[#087536]">Step 3 of 5</b> — Documents Upload
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
                        <strong className="mt-1 block whitespace-nowrap text-xs font-semibold text-[#f25a1d]">{safe(data?.status, 'Draft')}</strong>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 items-start gap-2 xl:grid-cols-[minmax(0,1fr)_278px]">
                <div className="flex min-w-0 flex-col gap-2">
                    <div className="relative grid grid-cols-5 items-start pt-0.5">
                        <div className="absolute left-[5px] right-[5px] top-[18px] z-0 h-0.5 rounded-full bg-[#dce3ed]">
                            <span className="block h-full w-3/5 rounded-full bg-[#087536]" />
                        </div>
                        {STEPS.map(step => <StepNode key={step.number} step={step} />)}
                    </div>

                    <main className="flex flex-col gap-2">
                        <Section
                            letter="A"
                            title="Upload Required Documents"
                            icon={<User size={17} strokeWidth={1.8} />}
                            headerRight={
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="whitespace-nowrap text-[9px] font-semibold leading-tight text-[#263d70]">
                                            Documents Completed
                                        </span>

                                        <div className="flex items-baseline gap-1">
                                            <b className="text-[20px] font-semibold leading-none text-[#087536]">
                                                {uploadedCount} / {totalCount}
                                            </b>

                                            <span className="text-[9px] font-medium text-[#8090ad]">
                                                ({percentComplete}% Complete)
                                            </span>
                                        </div>
                                    </div>

                                    <span className="h-1.5 w-40 overflow-hidden rounded-full bg-[#e1e5ed]">
                                        <span
                                            className="block h-full rounded-full bg-[#087536] transition-[width] duration-300"
                                            style={{ width: `${percentComplete}%` }}
                                        />
                                    </span>
                                </div>
                            }
                        >
                            <p className="mb-1.5 text-[9.5px] font-medium text-[#5a6c92]">Please upload clear and valid documents to proceed with verification.</p>

                            <div className="overflow-x-auto rounded-lg border border-[#e9eef4]">
                                <table className="w-full min-w-[720px] border-collapse">
                                    <thead>
                                        <tr className="bg-[#f6f9fc]">
                                            <th className="whitespace-nowrap px-1.5 py-1 text-left text-[9.5px] font-semibold text-[#061743]">#</th>
                                            <th className="whitespace-nowrap px-1.5 py-1 text-left text-[9.5px] font-semibold text-[#061743]">Document Name</th>
                                            <th className="whitespace-nowrap px-1.5 py-1 text-left text-[9.5px] font-semibold text-[#061743]">Description</th>
                                            <th className="whitespace-nowrap px-1.5 py-1 text-left text-[9.5px] font-semibold text-[#061743]">Status</th>
                                            <th className="whitespace-nowrap px-1.5 py-1 text-left text-[9.5px] font-semibold text-[#061743]">File / Preview</th>
                                            <th className="whitespace-nowrap px-1.5 py-1 text-left text-[9.5px] font-semibold text-[#061743]"></th>
                                            <th className="whitespace-nowrap px-1.5 py-1 text-right text-[9.5px] font-semibold text-[#061743]">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {documents.map((doc, index) => (
                                            <DocumentRow key={doc.id} index={index} doc={doc} onUpload={handleUpload} onDelete={handleDelete} uploadingId={uploadingId} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <InfoBanner>All documents must be clear, readable and in PDF / JPG / PNG format. Maximum file size allowed: 10MB per file.</InfoBanner>
                        </Section>

                        <Section letter="B" title="IHWE Auto-Generated Documents" note="(No upload required)" icon={<FileCheck2 size={17} strokeWidth={1.8} />}>
                            <p className="mb-1 text-[9.5px] font-medium text-[#5a6c92]">These documents are automatically generated by IHWE and will be used for your PMS application.</p>

                            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-6">
                                {AUTO_DOCUMENTS.map(doc => (
                                    <AutoDocCard key={doc.title} title={doc.title} />
                                ))}
                            </div>
                        </Section>

                        <footer className="grid grid-cols-1 items-center gap-2 rounded-lg border border-[#dbe4ef] bg-white p-1.5 sm:grid-cols-[120px_minmax(0,1fr)_190px]">
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => navigate("/exhibitor-dashboard/msme/bank-details")}
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
                                onClick={() => onContinue?.()}
                                disabled={saving || !documentDefinitions.filter(doc => doc.required).every(required => documents.some(doc => doc.id === required.id && doc.status === 'Uploaded'))}
                                className={`flex h-7 items-center justify-center gap-2 rounded-md text-[10px] font-semibold text-white shadow-[0_4px_9px_rgba(8,117,54,0.18)] ${documentDefinitions.filter(doc => doc.required).every(required => documents.some(doc => doc.id === required.id && doc.status === 'Uploaded')) ? 'bg-gradient-to-r from-[#0b7137] to-[#087536]' : 'cursor-not-allowed bg-gradient-to-r from-[#0b7137]/50 to-[#087536]/50'
                                    }`}
                            >
                                Save &amp; Continue
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
                        <h2 className="mb-1.5 text-[13px] font-semibold text-[#061743]">Upload Progress</h2>
                        <div className="flex items-center gap-2">
                            <ProgressRing percent={percentComplete} />
                            <div>
                                <strong className="block text-[13px] font-semibold text-[#061743]">{uploadedCount} of {totalCount}</strong>
                                <p className="mt-0.5 text-[9px] font-medium text-[#31446c]">Documents Uploaded</p>
                                <p className="mt-1 text-[9px] font-semibold text-[#e07a12]">{pendingCount} Pending</p>
                            </div>
                        </div>
                        <a href="#" onClick={(event) => event.preventDefault()} className="mt-1.5 flex items-center gap-1 border-t border-[#e9eef4] pt-1.5 text-[9.5px] font-semibold text-[#2a6bd6] hover:underline">
                            View Document Checklist
                            <ArrowRight size={12} strokeWidth={2.4} />
                        </a>
                    </section>

                    <section className="min-w-0 overflow-hidden rounded-xl border border-[#dbe4ef] bg-white px-3 py-1.5">
                        <h2 className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-[#5924c6]">
                            <Headphones size={19} strokeWidth={1.8} />
                            Relationship Manager
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
                            <li>Please upload all mandatory documents.</li>
                            <li>Incomplete applications may be rejected.</li>
                            <li>Ensure GST details are clearly visible.</li>
                            <li>Reimbursement is subject to verification.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </div>
    );
}