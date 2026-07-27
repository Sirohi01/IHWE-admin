import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    ChevronDown,
    FileText,
    Headphones,
    Info,
    Landmark,
    Lightbulb,
    Mail,
    MessageCircle,
    Phone,
    Receipt,
    Save,
    ShieldCheck,
    Upload,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
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
    { number: 2, label: 'Bank Details', status: 'active' },
    { number: 3, label: 'Documents Upload', status: 'pending' },
    { number: 4, label: 'Review', status: 'pending' },
    { number: 5, label: 'Submit', status: 'pending' },
];

function InfoField({ label, value, required, type = 'text', options = [], onChange, className = '' }) {
    return (
        <label className={`flex min-w-0 flex-col gap-1 ${className}`}>
            <span className="whitespace-nowrap text-[10px] font-semibold text-[#061743]">
                {label}
                {required && <b className="ml-0.5 text-[10px] font-semibold text-[#e62f28]">*</b>}
            </span>

            <div className="relative h-[33px] min-w-0">
                {type === 'select' ? (
                    <>
                        <select
                            className="h-[30px] w-full min-w-0 appearance-none rounded-md border border-[#d8e1ec] bg-white px-2.5 pr-7 text-[10px] font-semibold text-[#061743] shadow-[inset_0_1px_1px_rgba(6,23,67,0.01)] outline-none focus:border-[#087536] focus:ring-[3px] focus:ring-[#087536]/10"
                            value={value ?? ''}
                            onChange={(event) => onChange?.(event.target.value)}
                        >
                            {options.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#061743]" size={13} strokeWidth={1.8} />
                    </>
                ) : (
                    <input
                        className="h-[30px] w-full min-w-0 rounded-md border border-[#d8e1ec] bg-white px-2.5 text-[10px] font-semibold text-[#061743] shadow-[inset_0_1px_1px_rgba(6,23,67,0.01)] outline-none focus:border-[#087536] focus:ring-[3px] focus:ring-[#087536]/10"
                        value={value ?? ''}
                        onChange={(event) => onChange?.(event.target.value)}
                        title={String(value ?? '')}
                    />
                )}
            </div>
        </label>
    );
}

function Section({ icon, letter, title, note, children, className = '', titleColor = '#087536' }) {
    return (
        <section className={`min-w-0 overflow-hidden rounded-xl border border-[#dbe4ef] bg-white px-3 py-1.5 shadow-[0_2px_8px_rgba(9,32,74,0.025)] ${className}`}>
            <div className="mb-1.5 flex items-center gap-2" style={{ color: titleColor }}>
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#d9eee2] bg-[#eff9f3]" style={{ color: titleColor }}>
                    {icon}
                </span>
                <strong className="whitespace-nowrap text-[13px] font-semibold" style={{ color: titleColor }}>{letter}. {title}</strong>
                {note && <small className="-ml-1 whitespace-nowrap text-[9px] font-medium  self-center mt-0.5 text-blue-600">{note}</small>}
            </div>
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
            <small className={`${isDone ? 'text-[#087536]' : 'text-[#8090ad]'} whitespace-nowrap text-[9px] font-semibold text-[#061743]`}>{step.label}</small>
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

function VerifyRow({ label, verified }) {
    return (
        <div className="flex items-center justify-between gap-2.5 border-b border-[#e9eef4] py-1 text-[10.5px] font-semibold first:pt-0.5">
            <span>{label}</span>
            <span className={`inline-flex items-center gap-1 whitespace-nowrap text-[10px] font-semibold ${verified ? 'text-[#087536]' : 'text-amber-600'}`}>
                <div className={`w-3 h-3 text-white rounded-full flex items-center justify-center font-semibold ${verified ? 'bg-[#087536]' : 'bg-amber-500'}`}>

                    <Check size={10} strokeWidth={2.4} />
                </div>
                {verified ? 'Verified' : 'Pending'}
            </span>
        </div>
    );
}

function PaymentRow({ label, value, badge }) {
    return (
        <div className="flex items-center justify-between gap-2.5 border-b border-[#e9eef4] py-1 text-[10px] last:border-b-0">
            <span className="font-semibold text-[#31446c]">{label}</span>
            {badge ? (
                <strong className="rounded bg-[#eff9f3] px-2 py-1 text-[9px] font-semibold text-[#087536]">{value}</strong>
            ) : (
                <strong className="text-right font-semibold text-[#061743]">{value}</strong>
            )}
        </div>
    );
}


function UploadCard({ title, required, hint, status, onFileSelect }) {
    const isPending = status === 'Pending';
    const fileInputRef = useRef(null);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file && onFileSelect) {
            onFileSelect(file);
        }
    };

    return (
        <div className="flex min-w-0 flex-col gap-1.5 rounded-lg border border-[#e9eef4] bg-[#fbfcfe] p-2">
            <div>
                <strong className="block text-[9px] font-semibold text-[#061743]">
                    {title}
                    {required && <b className="ml-0.5 text-[#e62f28]">*</b>}
                </strong>
                <small className="mt-0.5 block text-[8.5px] font-medium text-[#5a6c92]">{hint}</small>
            </div>

            <div className="flex flex-col items-center gap-1 rounded-md border-[1.5px] border-dashed border-[#c7d3e3] bg-white px-2 py-1.5 text-center">
                <span className="grid place-items-center text-[#6b7ea3]">
                    <Upload size={18} strokeWidth={1.8} />
                </span>
                <p className="text-[9px] font-medium leading-[1.3] text-[#6b7ea3]">Drag &amp; drop file here<br />or</p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={handleButtonClick}
                    className="rounded-md border border-[#cfe4d8] bg-[#eff9f3] px-3 py-1 text-[9px] font-semibold text-[#087536]"
                >
                    Upload File
                </button>
            </div>

            <span className={`text-[9px] font-semibold ${isPending ? 'text-[#e62f28]' : 'text-blue-600'}`}>
                Status: {status}
            </span>
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

export default function MSMEPMSBankDetails({ data, onBack, onContinue, onSaveDraft, onUpload, saving }) {
     const navigate = useNavigate();
    const companyName = fieldValue(data, ['exhibitorName', 'companyName', 'organizationName'], '—');
    const msmeCategory = safe(data?.msme?.msmeCategory);
    const udyamNumber = safe(data?.msme?.udyamRegNo);
    const gstNumber = safe(data?.gstNo || data?.gstNumber);

    const [form, setForm] = useState(() => ({
        accountHolderName: safe(data?.bank?.accountHolderName, ''),
        bankName: safe(data?.bank?.bankName, ''),
        branchName: safe(data?.bank?.branchName, ''),
        accountNumber: safe(data?.bank?.accountNumber, ''),
        confirmAccountNumber: safe(data?.bank?.accountNumber, ''),
        ifscCode: safe(data?.bank?.ifscCode, ''),
        micrCode: safe(data?.bank?.micrCode, ''),
        accountType: safe(data?.bank?.accountType, ''),
    }));
    const setField = (name, value) => setForm(prev => ({ ...prev, [name]: value }));
    const normalized = value => String(value || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
    const accountHolderMatches = Boolean(form.accountHolderName && companyName !== '—' && normalized(form.accountHolderName) === normalized(companyName));
    const gstVerified = Boolean(gstNumber !== '—' && ['approved', 'verified'].includes(String(data?.kycStatus || data?.verificationStatus || '').toLowerCase()));
    const udyamVerified = Boolean(udyamNumber !== '—' && String(data?.verificationStatus || '').toLowerCase() === 'verified');
    const formatDate = value => value ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : '—';

    const bankTopFields = [
        { name: 'accountHolderName', label: 'Account Holder Name', required: true },
        { name: 'bankName', label: 'Bank Name', required: true },
        { name: 'branchName', label: 'Branch Name', required: true },
        { name: 'accountNumber', label: 'Account Number', required: true },
    ];

    const bankBottomFields = [
        { name: 'confirmAccountNumber', label: 'Confirm Account Number', required: true },
        { name: 'ifscCode', label: 'IFSC Code', required: true },
        { name: 'micrCode', label: 'MICR Code (Optional)', required: false },
    ];

    const documents = [
        { documentType: 'cheque', title: 'Cancelled Cheque', required: true, hint: 'Upload clear image / PDF' },
        { documentType: 'statement', title: 'Bank Statement (Last 6 Months)', required: true, hint: 'Upload PDF only' },
        { documentType: 'passbook', title: 'Bank Passbook First Page', required: false, hint: <>(Optional) <br /> Upload clear image / PDF</> },
    ].map(doc => ({ ...doc, status: data?.documents?.some(item => item.documentType === doc.documentType) ? 'Uploaded' : (doc.required ? 'Pending' : 'Optional'), onFileSelect: file => onUpload?.(doc.documentType, file) }));

    const claimColumns = [
        { label: 'Stall Charges', amount: data?.claim?.stallCharges != null ? Number(data.claim.stallCharges).toLocaleString('en-IN') : '—' },
        { label: 'Hotel Stay', amount: data?.claim?.hotelStay != null ? Number(data.claim.hotelStay).toLocaleString('en-IN') : '—' },
        { label: 'Travel', amount: data?.claim?.travel != null ? Number(data.claim.travel).toLocaleString('en-IN') : '—' },
        { label: 'Courier', amount: data?.claim?.courier != null ? Number(data.claim.courier).toLocaleString('en-IN') : '—' },
        { label: 'Marketing', amount: data?.claim?.marketing != null ? Number(data.claim.marketing).toLocaleString('en-IN') : '—' },
        {
            label: 'Total Claimed',
            amount: data?.claim?.totalClaimed != null ? Number(data.claim.totalClaimed).toLocaleString('en-IN') : '—',
            highlight: true,
            amountHighlight: true,
        },
    ];

    return (
        <div className="w-full min-h-[calc(100dvh-58px)] bg-white p-3 pt-2 pb-3 px-3 lg:px-6 font-sans text-[#061743] antialiased">
            <header className="mb-1 flex flex-wrap items-start justify-between gap-3 xl:pr-[300px]">
                <div>
                    <h1 className="m-0 text-[21px] font-semibold tracking-[-0.35px] text-[#061743] leading-[22.68px]">MSME PMS Application</h1>
                    <p className="text-[13px] font-semibold text-[#061743]">
                        <b className="font-semibold text-[#087536]">Step 2 of 5</b> — Bank Details &amp; Reimbursement Account
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
                            <span className="block h-full w-2/5 rounded-full bg-[#087536]" />
                        </div>
                        {STEPS.map(step => <StepNode key={step.number} step={step} />)}
                    </div>

                    <main className="flex flex-col gap-2">
                        <div className="grid grid-cols-1 items-stretch gap-2 lg:grid-cols-[1.55fr_1fr]">
                            <Section letter="A" title="Reimbursement Bank Details" icon={<Landmark size={17} strokeWidth={1.8} />}>
                                <p className="mb-1.5 text-[11px] font-semibold text-[#061743]">Bank Account Information</p>

                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {bankTopFields.map(field => (
                                        <InfoField key={field.name} label={field.label} value={form[field.name]} required={field.required} type={field.type} options={field.options} onChange={(value) => setField(field.name, value)} />
                                    ))}
                                </div>

                                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {bankBottomFields.map(field => (
                                        <InfoField key={field.name} label={field.label} value={form[field.name]} required={field.required} onChange={(value) => setField(field.name, value)} />
                                    ))}

                                    <div className="flex min-w-0 flex-col gap-1">
                                        <span className="text-[10px] font-semibold text-[#061743]">Account Type <b className="ml-0.5 text-[10px] font-semibold text-[#e62f28]">*</b></span>
                                        <div className="flex h-[33px] flex-col justify-center gap-1">
                                            {['Current Account', 'Savings Account'].map(type => (
                                                <label
                                                    key={type}
                                                    className="relative flex cursor-pointer select-none items-center gap-1.5 text-[10.5px] font-medium text-[#061743]"
                                                    onClick={() => setField('accountType', type)}
                                                    onKeyDown={(event) => {
                                                        if (event.key === 'Enter' || event.key === ' ') {
                                                            event.preventDefault();
                                                            setField('accountType', type);
                                                        }
                                                    }}
                                                    role="radio"
                                                    aria-checked={form.accountType === type}
                                                    tabIndex={0}
                                                >
                                                    <input type="radio" name="accountType" value={type} checked={form.accountType === type} onChange={() => setField('accountType', type)} className="pointer-events-none absolute h-px w-px opacity-0" />
                                                    <span className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border bg-white ${form.accountType === type ? 'border-[#087536]' : 'border-[#8090ad]'}`}>
                                                        {form.accountType === type && <span className="h-2 w-2 rounded-full bg-[#087536]" />}
                                                    </span>
                                                    {type}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Section>

                            <Section letter="B" title="Payment Verification" icon={<ShieldCheck size={17} strokeWidth={1.8} />}>
                                <VerifyRow label="Bank Account Holder Name Match" verified={accountHolderMatches} />
                                <VerifyRow label="GST Registration Verification" verified={gstVerified} />
                                <VerifyRow label="Udyam Registration Verification" verified={udyamVerified} />

                                <div className="mt-1.5 flex items-center gap-2 rounded-md border border-[#cdeadb] bg-[#f1fbf5] p-2 text-[#087536]">
                                    <CheckCircle2 size={24} strokeWidth={2.2} className="mt-0.5 shrink-0" />
                                    <div>
                                        <strong className="block text-[10.5px] font-semibold">{accountHolderMatches && gstVerified && udyamVerified ? 'All available details are verified.' : 'Some verifications are pending.'}</strong>
                                        <p className="text-[9.5px] font-medium text-[#2f5f47]">Verification is based on your saved exhibitor records.</p>
                                    </div>
                                </div>
                            </Section>
                        </div>

                        <div className="grid grid-cols-1 items-stretch gap-2 lg:grid-cols-[1.55fr_1fr]">
                            <Section letter="C" title="Mandatory Bank Documents" icon={<FileText size={17} strokeWidth={1.8} />} titleColor="#5924c6">
                                <p className="mb-1.5 text-[11px] font-semibold text-[#061743]">Please upload the following bank documents.</p>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                    {documents.map(doc => <UploadCard key={doc.title} {...doc} />)}
                                </div>

                                <InfoBanner>Ensure that the account number and IFSC code are clearly visible in the uploaded documents.</InfoBanner>
                            </Section>

                            <Section letter="D" title="IHWE Payment Details" note="(Auto Filled)" icon={<Receipt size={17} strokeWidth={1.8} />} titleColor="#5924c6">
                                <PaymentRow label="Event" value={safe(data?.event?.name || data?.eventName)} />
                                <PaymentRow label="Stall No." value={safe(data?.event?.stallNumber || data?.stallNo)} />
                                <PaymentRow label="Hall" value={safe(data?.event?.hallNumber || data?.hallNo)} />
                                <PaymentRow label="Stall Size" value={safe(data?.event?.stallSize || data?.stallSize)} />
                                <PaymentRow label="Invoice Value" value={data?.payment?.invoiceValue != null ? `₹ ${Number(data.payment.invoiceValue).toLocaleString('en-IN')}` : '—'} />
                                <PaymentRow label="Amount Paid" value={data?.payment?.amountPaid != null ? `₹ ${Number(data.payment.amountPaid).toLocaleString('en-IN')}` : '—'} />
                                <PaymentRow label="Payment Status" value={safe(data?.event?.paymentStatus || data?.paymentStatus)} badge />
                                <PaymentRow label="Payment Date" value={formatDate(data?.payment?.paymentDate)} />
                            </Section>
                        </div>

                        <Section letter="E" title="Reimbursement Claim Calculation" note="(Indicative)" icon={<Landmark size={17} strokeWidth={1.8} />}>
                            <div className="flex flex-col items-stretch gap-2 sm:flex-row rounded-lg">
                                <table className="w-full min-w-0 flex-1 border-collapse rounded-lg">
                                    <thead>
                                        <tr>
                                            <th className="whitespace-nowrap border border-[#e9eef4] bg-[#f6f9fc] p-1.5 text-left text-[9.5px] font-semibold text-[#061743]">
                                                Particular
                                            </th>

                                            {claimColumns.map(col => (
                                                <th
                                                    key={col.label}
                                                    className={`whitespace-nowrap border border-[#e9eef4] bg-[#f6f9fc] p-1.5 text-left text-[9.5px] font-semibold text-[#061743]`}
                                                >
                                                    {col.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <tr>
                                            <td className="whitespace-nowrap border border-[#e9eef4] p-1.5 text-[9.5px] font-semibold text-[#061743]">
                                                Amount (₹)
                                            </td>

                                            {claimColumns.map(col => (
                                                <td
                                                    key={col.label}
                                                    className={`whitespace-nowrap border border-[#e9eef4] p-1.5 ${col.amountHighlight
                                                            ? 'font-semibold text-sm text-[#087536]'
                                                            : 'text-[9.5px] font-semibold text-[#061743]'
                                                        }`}
                                                >
                                                    {col.amount}
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>

                                <div className="flex flex-col items-center justify-center gap-1 rounded-md border border-[#cdeadb] bg-[#f1fbf5] p-1.5 text-center sm:w-[168px] sm:flex-none">
                                    <span className="text-[9px] font-semibold text-[#2f5f47]">Indicative Eligible Claim</span>
                                    <strong className="text-lg font-semibold text-[#087536]">{data?.claim?.eligibleAmount != null ? `₹${Number(data.claim.eligibleAmount).toLocaleString('en-IN')}` : '—'}</strong>
                                </div>
                            </div>

                            <InfoBanner>* Maximum benefit is subject to scheme rules, eligibility and final approval by the concerned authority.</InfoBanner>
                        </Section>

                        <footer className="grid grid-cols-1 items-center gap-2 rounded-lg border border-[#dbe4ef] bg-white p-1.5 sm:grid-cols-[120px_minmax(0,1fr)_190px]">
                            <button
                                type="button"
                                onClick={() => onBack ? onBack() : navigate("/exhibitor-dashboard/msme/application")}
                                className="flex h-7 items-center justify-center gap-2 rounded-md border border-[#d5deea] bg-white text-[10px] font-semibold text-[#061743]"
                            >
                                <ArrowLeft size={15} strokeWidth={2} />
                                Back
                            </button>

                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => onSaveDraft?.(form)}
                                className="mx-auto flex h-7 w-fit items-center justify-center gap-2 rounded-md border border-[#d5deea] bg-white px-4 text-[10px] font-semibold text-[#061743]"
                            >
                                <Save size={15} strokeWidth={2} />
                                Save Draft
                            </button>

                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => onContinue?.(form)}
                                
                                className="flex h-7 items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#0b7137] to-[#087536] text-[10px] font-semibold text-white shadow-[0_4px_9px_rgba(8,117,54,0.18)]"
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
                        <SummaryRow label="IHWE Booking" value={safe(data?.event?.bookingStatus || data?.bookingStatus)} />
                        <SummaryRow label="Payment Status" value={safe(data?.event?.paymentStatus || data?.paymentStatus)} />

                        <div className="mt-1.5 flex items-center gap-3 border-t border-[#e9eef4] pt-2">
                            <ProgressRing percent={40} />
                            <div>
                                <strong className="block text-[10.5px] font-semibold text-[#061743]">Application Progress</strong>
                                <p className="mt-0.5 text-[9px] font-medium text-[#31446c]">Keep going! You're doing great.</p>
                            </div>
                        </div>
                    </section>

                    <section className="min-w-0 overflow-hidden rounded-xl border border-[#dbe4ef] bg-white px-3 py-1.5">
                        <h2 className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-[#5924c6]">
                            <Headphones size={19} strokeWidth={1.8} />
                            Contact Person 1
                        </h2>

                        <div className="mb-1.5 flex items-center gap-3">
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
                            <span>WhatsApp Chat</span>
                        </a>
                        <a href={data?.pmsCoordinator?.email ? `mailto:${data.pmsCoordinator.email}` : undefined} className="mt-1 flex h-[31px] min-w-0 items-center gap-2.5 rounded-md border border-[#e0e7f0] bg-white px-2.5 text-[9.5px] font-semibold text-[#061743] no-underline">
                            <Mail size={15} strokeWidth={1.9} className="shrink-0 text-[#5924c6]" />
                            <span>{safe(data?.pmsCoordinator?.email)}</span>
                        </a>

                        <button type="button" className="mt-1.5 h-[34px] w-full rounded-md border border-[#5924c6] bg-white text-[10px] font-semibold text-[#5924c6]">
                            Send Email
                        </button>
                    </section>

                    <section className="min-w-0 overflow-hidden rounded-xl border border-[#f1d9ad] bg-[#fffaf1] px-3 py-1.5">
                        <h2 className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-[#f28c00]">
                            <Lightbulb size={18} strokeWidth={1.9} />
                            Important Note
                        </h2>
                        <ul className="list-disc space-y-0.5 pl-4 text-[9.5px] font-medium leading-relaxed text-[#31446c]">
                            <li>Bank account must belong to the applicant company.</li>
                            <li>Name mismatch may delay reimbursement.</li>
                            <li>All documents must be clear and readable.</li>
                            <li>Reimbursement is subject to scheme guidelines.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </div>
    );
}
