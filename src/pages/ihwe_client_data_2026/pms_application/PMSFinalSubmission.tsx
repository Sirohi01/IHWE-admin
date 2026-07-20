import type { ReactNode } from 'react';
import { useState } from 'react';
import {
    ArrowLeft,
    Award,
    Check,
    CheckCircle2,
    ClipboardList,
    FileEdit,
    FileText,
    HelpCircle,
    IndianRupee,
    Landmark,
    Lightbulb,
    Mail,
    Phone,
    Save,
    Send,
    ShieldAlert,
    UserCheck,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { useNavigate } from "react-router-dom";
const safe = (value, fallback = '—') => {
    if (value === null || value === undefined || value === '') return fallback;
    return value;
};

const STEPS = [
    { id: 1, label: 'Applicant Details', status: 'done' },
    { id: 2, label: 'Bank Details', status: 'done' },
    { id: 3, label: 'Documents Upload', status: 'done' },
    { id: 4, label: 'Review', status: 'done' },
    { id: 5, label: 'Submit', status: 'active' },
];

const CHECKLIST = [
    { icon: ClipboardList, title: 'Applicant & MSME Details' },
    { icon: Landmark, title: 'Bank Details' },
    { icon: FileText, title: 'Documents Upload' },
    { icon: FileEdit, title: 'Review & Confirmation' },
];

const DECLARATIONS = [
    'I hereby declare that all the information provided in this application is true, complete and correct to the best of my knowledge.',
    'I understand that any false information or misleading documents may lead to rejection of application and legal action.',
    'I have read and understood the PMS Scheme guidelines and terms & conditions.',
    'I agree to abide by the decisions of the concerned authorities regarding reimbursement.',
];

const NEXT_STEPS = [
    { icon: ClipboardList, title: 'Application Submitted', desc: 'You will recieve a confirmation with Application ID.' },
    { icon: UserCheck, title: 'Under Verification', desc: 'Our team will verify your details and documents.' },
    { icon: HelpCircle, title: 'Query (If Any)', desc: 'You will be notified if any additional information is required.' },
    { icon: Award, title: 'Approval', desc: 'Once approved, you will receive an approval letter.' },
    { icon: IndianRupee, title: 'Reimbursement', desc: 'Eligible amount will be released to your bank account' },
];

type ConfettiPiece = {
    top: number;
    side: 'left' | 'right';
    offset: number;
    drift: number;
    rotate: number;
    width: number;
    height: number;
    color: string;
    delay: number;
};

const CONFETTI_PIECES: ConfettiPiece[] = [
    // LEFT side
    { top: 4, side: 'left', offset: 4, drift: -6, rotate: 45, width: 10, height: 5, color: '#4c9aab', delay: 0 },
    { top: 10, side: 'left', offset: 12, drift: 8, rotate: -45, width: 12, height: 5, color: '#f59e0b', delay: 150 },
    { top: 6, side: 'left', offset: 20, drift: -5, rotate: 70, width: 10, height: 6, color: '#ef4444', delay: 0 },
    { top: 16, side: 'left', offset: 6, drift: 7, rotate: 30, width: 8, height: 8, color: '#22c55e', delay: 150 },
    { top: 2, side: 'left', offset: 28, drift: -8, rotate: -30, width: 10, height: 5, color: '#8b5cf6', delay: 0 },
    { top: 20, side: 'left', offset: 18, drift: 6, rotate: 60, width: 12, height: 6, color: '#4c9aab', delay: 150 },
    { top: 8, side: 'left', offset: 34, drift: -7, rotate: -60, width: 10, height: 5, color: '#f97316', delay: 0 },
    { top: 24, side: 'left', offset: 10, drift: 5, rotate: 45, width: 8, height: 8, color: '#ec4899', delay: 150 },
    { top: 14, side: 'left', offset: 26, drift: -6, rotate: -45, width: 10, height: 5, color: '#f59e0b', delay: 0 },
    { top: 28, side: 'left', offset: 32, drift: 8, rotate: 20, width: 10, height: 6, color: '#ef4444', delay: 150 },

    // RIGHT side (same delay as corresponding left index → both sides stay in sync)
    { top: 4, side: 'right', offset: 4, drift: 6, rotate: -45, width: 10, height: 5, color: '#f59e0b', delay: 0 },
    { top: 10, side: 'right', offset: 12, drift: -8, rotate: 45, width: 8, height: 8, color: '#f97316', delay: 150 },
    { top: 6, side: 'right', offset: 20, drift: 5, rotate: -70, width: 10, height: 5, color: '#ec4899', delay: 0 },
    { top: 16, side: 'right', offset: 6, drift: -7, rotate: -30, width: 8, height: 8, color: '#22c55e', delay: 150 },
    { top: 2, side: 'right', offset: 28, drift: 8, rotate: 30, width: 10, height: 5, color: '#8b5cf6', delay: 0 },
    { top: 20, side: 'right', offset: 18, drift: -6, rotate: -60, width: 12, height: 6, color: '#4c9aab', delay: 150 },
    { top: 8, side: 'right', offset: 34, drift: 7, rotate: 60, width: 10, height: 5, color: '#f97316', delay: 0 },
    { top: 24, side: 'right', offset: 10, drift: -5, rotate: -45, width: 8, height: 8, color: '#ec4899', delay: 150 },
    { top: 14, side: 'right', offset: 26, drift: 6, rotate: 45, width: 10, height: 5, color: '#f59e0b', delay: 0 },
    { top: 28, side: 'right', offset: 32, drift: -8, rotate: -20, width: 10, height: 6, color: '#ef4444', delay: 150 },
];
function ConfettiDots() {
    return (
        <div
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
            aria-hidden="true"
        >
            <style>{`
  @keyframes pmsConfettiDrop {
    0% {
        transform: translate(0, -10px) rotate(0deg) scale(0.7);
        opacity: 0;
    }

    10% {
        opacity: 1;
    }

    85% {
        opacity: 1;
    }

    100% {
        transform: translate(var(--drift), 300px) rotate(var(--r2)) scale(0.85);
        opacity: 0;
    }
}

                @media (prefers-reduced-motion: reduce) {
                    .pms-confetti-piece {
                        animation: none !important;
                        opacity: 0 !important;
                    }
                }
            `}</style>

            {CONFETTI_PIECES.map((piece, index) => (
                <span
                    key={index}
                    className="pms-confetti-piece absolute"
                    style={{
                        top: `${piece.top}%`,
                        [piece.side]: `${piece.offset}%`,

                        // @ts-ignore
                        '--drift': `${piece.drift}px`,
                        '--r2': `${piece.rotate + 90}deg`,
                        '--r3': `${piece.rotate + 270}deg`,

                        width: piece.width,
                        height: piece.height,
                        backgroundColor: piece.color,
                        borderRadius: 1,

            animation: `pmsConfettiDrop 2.8s linear ${(index % 10) * 180}ms 1 both`,
                    }}
                />
            ))}
        </div>
    );
}
function Panel({ icon, title, headerRight, className = '', children, noRounded = false }: { icon?: ReactNode; title?: string; headerRight?: ReactNode; className?: string; children?: ReactNode; noRounded?: boolean }) {
    return (
        <section className={`min-w-0 overflow-hidden {!noRounded &&'rounded-xl'} border border-[#dbe4ef] bg-white px-3 py-1.5 shadow-[0_2px_8px_rgba(9,32,74,0.025)] ${className}`}>
            {title && (
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[#061743]">
                        {icon && <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#d9eee2] bg-[#eff9f3] text-[#087536]">
                            {icon}
                        </span>}
                        <strong className="whitespace-nowrap text-[13px] font-bold text-[#087536]">{title}</strong>
                    </div>
                    {headerRight}
                </div>
            )}
            {children}
        </section>
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
                {isDone ? <Check size={10} strokeWidth={3} /> : step.id}
            </span>
            <small className={`${isDone ? 'text-[#087536]' : 'text-[#8090ad]'} whitespace-nowrap text-[9px] font-semibold`}>{step.label}</small>
            <small className={`text-[9px] font-semibold ${isActive ? 'text-[#f25a1d]' : isDone ? 'text-[#087536]' : 'text-[#8090ad]'}`}>
                {isDone ? 'Completed' : isActive ? 'In Progress' : 'Pending'}
            </small>
        </div>
    );
}

function ChecklistRow({ item }) {
    const Icon = item.icon;
    return (
        <div className="flex items-center gap-2 rounded-lg border border-[#e9eef4] px-2 py-1.5">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-emerald-50 text-[#087536]">
                <Icon size={14} strokeWidth={1.9} />
            </span>
            <strong className="flex-1 text-[9.5px] font-semibold text-[#061743]">{item.title}</strong>
            <span className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-semibold text-[#087536]">
                <div className='w-[15px] h-[15px] p-1 flex items-center justify-center bg-[#087536] rounded-full'>

                    <Check size={10} strokeWidth={2.4} className='text-white' />
                </div>
                Completed
            </span>
        </div>
    );
}

function NextStepArrow() {
    return (
        <div className="flex h-10 w-6 shrink-0 items-center justify-center sm:w-8">
            <svg width="24" height="10" viewBox="0 0 24 10" fill="none">
                <path d="M0 5H21M21 5L16 1M21 5L16 9" stroke="#bfe7cd" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );
}

function NextStepNode({ step }) {
    const Icon = step.icon;
    return (
        <div className="flex w-[104px] shrink-0 flex-col items-center gap-1 text-center sm:w-[130px]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-[#d9eee2] text-[#087536]">
                <Icon size={22} strokeWidth={1.8} />
            </span>
            <strong className="whitespace-nowrap text-[9.5px] font-semibold text-[#087536]">{step.title}</strong>
            <span className="text-[8.5px] font-semibold leading-snug text-text-[#31446c]">{step.desc}</span>
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

export default function PMSFinalSubmission({ data, onBack, onSaveDraft, onSubmit, onDeclarationChange, saving }) {
    const [agreed, setAgreed] = useState<boolean>(data?.declarationAgreed !== false);

    const companyName = safe(data?.exhibitorName || data?.companyName);
    const msmeCategory = safe(data?.msme?.msmeCategory);
    const udyamNumber = safe(data?.msme?.udyamRegNo);
    const gstNumber = safe(data?.gstNo || data?.gstNumber);
    const applicationId = safe(data?.applicationId);
    const progressPercent: number = Number(safe(data?.progressPercent, 100)) || 100;

    const activeIndex = STEPS.findIndex(step => step.status === 'active');
    const progressWidth = `${Math.min(100, ((activeIndex + 0.5) / (STEPS.length - 1)) * 100)}%`;

    const toggleAgree = () => {
        const next = !agreed;
        setAgreed(next);
        onDeclarationChange?.(next);
    };
    const navigate = useNavigate()
    return (
        <div className="w-full min-h-[calc(100dvh-58px)] bg-white p-3 px-3 lg:px-6 pt-2 pb-3 font-sans text-[#061743] antialiased">
            <header className="mb-1 flex flex-wrap items-start justify-between gap-3  xl:pr-[300px]">
                <div>
                    <h1 className="m-0 text-[21px] font-semibold tracking-[-0.35px] text-[#061743] leading-[22.68px]">MSME PMS Application</h1>
                    <p className="text-[13px] font-semibold text-[#061743]">
                        <b className="font-semibold text-[#087536]">Step 5 of 5</b> — Final Submission
                    </p>
                </div>

                <div className="flex gap-2">
                    <div className="h-[55px] w-fit rounded-lg border border-[#dbe4ef] bg-blue-50 px-3 pb-2 pt-2 shadow-sm">
                        <span className="block text-[10px] font-medium text-[#31436b]">Application ID</span>
                        <strong className="mt-1 block whitespace-nowrap text-xs font-semibold text-[#061743]">{applicationId}</strong>
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
                            <span className="block h-full rounded-full bg-[#087536]" style={{ width: progressWidth }} />
                        </div>
                        {STEPS.map(step => <StepNode key={step.id} step={step} />)}
                    </div>

                    <main className="flex flex-col gap-2">
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.1fr]">
                            <section className="relative flex flex-col items-center justify-center overflow-hidden border border-[#dbe4ef] bg-[#eef9f2]  px-3 text-center py-4">

                                {/* Full width confetti area */}
                                <ConfettiDots />

                                <div className="relative z-10">
                                    <span className="grid h-16 w-16 place-items-center rounded-full bg-[#087536] border-[6px] border-emerald-100">
                                        <Check size={30} strokeWidth={2.4} className="text-white" />
                                    </span>
                                </div>

                                <h3 className="relative z-10 mt-2 text-base font-semibold text-[#087536]">
                                    You are almost there!
                                </h3>

                                <p className="relative z-10 mt-1 max-w-[300px] text-xs font-semibold leading-[1.6] text-[#1e4197]">
                                    Please review the declaration and submit your application for verification.
                                </p>
                            </section>

                            <Panel title="Submission Checklist" noRounded={true} className='md:pl-8 py-2'>
                                <div className="flex flex-col gap-1.5">
                                    {CHECKLIST.map((item) => (
                                        <ChecklistRow key={item.title} item={item} />
                                    ))}
                                </div>
                            </Panel>
                        </div>

                        <div className="flex flex-col items-start md:flex-row min-w-0 overflow-hidden rounded-xl border border-[#dbe4ef] bg-white px-3 py-1.5 shadow-[0_2px_8px_rgba(9,32,74,0.025)]">
                            <div className="mb-1.5 flex min-w-[200px] flex-wrap items-start justify-between gap-2 md:mb-0">
                                <div className="flex items-start gap-2 text-[#061743]">
                                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#d9eee2] bg-[#eff9f3] text-[#087536]">
                                        <FileText size={24} strokeWidth={1.9} />
                                    </span>

                                    <strong className="whitespace-nowrap text-[13px] font-bold text-[#087536]">
                                        Declaration
                                    </strong>
                                </div>
                            </div>

                            <div className="self-start">
                                <ul className="space-y-1">
                                    {DECLARATIONS.map((point) => (
                                        <li
                                            key={point}
                                            className="flex items-start gap-1.5 text-[9.5px] font-medium text-[#31446c] leading-6"
                                        >
                                            <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#5a6c92]" />
                                            {point}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    type="button"
                                    onClick={toggleAgree}
                                    className="mt-4 flex items-center gap-2 text-[9.5px] font-semibold text-[#061743]"
                                >
                                    <span
                                        className={`grid h-4 w-4 shrink-0 place-items-center rounded ${agreed
                                            ? "bg-[#087536]"
                                            : "border border-[#c2cbdb] bg-white"
                                            }`}
                                    >
                                        {agreed && (
                                            <Check size={12} strokeWidth={3} className="text-white" />
                                        )}
                                    </span>

                                    I agree to the above declaration.
                                </button>
                            </div>
                        </div>
                        <Panel title="What happens next?">
                            <div className="overflow-x-auto pb-0.5 pt-2">
                                <div className="flex min-w-[620px] items-start justify-between">
                                    {NEXT_STEPS.map((step, index) => (
                                        <div key={step.title} className="flex items-start">
                                            {index !== 0 && <NextStepArrow />}
                                            <NextStepNode step={step} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Panel>

                        <footer className="grid grid-cols-1 items-center gap-2 rounded-lg border border-[#dbe4ef] bg-white p-1.5 sm:grid-cols-[120px_minmax(0,1fr)_190px]">
                            <button
                                type="button"
                                onClick={() => onBack?.()}
                                className="flex h-7 items-center justify-center gap-2 rounded-md border border-[#d5deea] bg-white text-[10px] font-semibold text-[#061743]"
                            >
                                <ArrowLeft size={15} strokeWidth={2} />
                                Back
                            </button>

                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => onSaveDraft?.(agreed)}
                                className="mx-auto flex h-7 w-fit items-center justify-center gap-2 rounded-md border border-[#d5deea] bg-white px-4 text-[10px] font-semibold text-[#061743]"
                            >
                                <Save size={15} strokeWidth={2} />
                                Save Draft
                            </button>

                            <button
                                type="button"
                                disabled={!agreed || saving || Boolean(data?.submittedAt)}
                                onClick={() => onSubmit?.(agreed)}
                                className={`flex h-7 items-center justify-center gap-2 rounded-md text-[10px] font-semibold text-white shadow-[0_4px_9px_rgba(8,117,54,0.18)] ${agreed ? 'bg-gradient-to-r from-[#0b7137] to-[#087536]' : 'cursor-not-allowed bg-[#a9c9b6]'
                                    }`}
                            >
                                {data?.submittedAt ? 'Application Submitted' : saving ? 'Submitting...' : 'Submit Application'}
                                <Send size={14} strokeWidth={2} />
                            </button>
                        </footer>
                    </main>
                </div>

                <aside className="flex min-w-0 flex-col gap-2">
                    <Panel title="Application Summary" icon={<FileText size={14} strokeWidth={1.9} />}>
                        <SummaryRow label="Company Name" value={companyName} />
                        <SummaryRow label="MSME Category" value={msmeCategory} />
                        <SummaryRow label="Udyam Number" value={udyamNumber} />
                        <SummaryRow label="GST Number" value={gstNumber} />
                        <SummaryRow label="Booking Status" value={safe(data?.event?.bookingStatus || data?.bookingStatus)} />
                        <SummaryRow label="Payment Status" value={safe(data?.event?.paymentStatus || data?.paymentStatus)} />
                    </Panel>

                    <section className="min-w-0 overflow-hidden rounded-xl border border-[#dbe4ef] bg-white px-3 py-1.5">
                        <h2 className="mb-1.5 text-[13px] font-semibold text-[#061743]">Application Progress</h2>
                        <div className="flex items-center gap-2">
                            <ProgressRing percent={progressPercent} />
                            <div>
                                <strong className="block text-[13px] font-semibold text-[#061743]">Step 5 of 5</strong>
                                <p className="mt-0.5 text-[9px] font-medium text-[#31446c]">Final Submission</p>
                            </div>
                        </div>
                    </section>

                    <section className="min-w-0 overflow-hidden rounded-xl border border-[#dbe4ef] bg-white px-3 py-1.5">
                        <h2 className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-[#5924c6]">
                            <HelpCircle size={16} strokeWidth={1.9} />
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

                        <div className="mt-1.5 flex items-center gap-2.5 rounded-md bg-[#f5f1fd] px-2 py-1 text-[9px] font-semibold text-[#5924c6]">
                            <ShieldAlert size={15} strokeWidth={2} className="shrink-0" />
                            <span className='text-[#061743]'>

                                Support Hours:<br /> Mon - Sat | 09:00 AM - 07:00 PM (IST)
                            </span>
                        </div>
                    </section>

                    <section className="min-w-0 overflow-hidden rounded-xl border border-[#f1d9ad] bg-[#fffaf1] px-3 py-1.5">
                        <h2 className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-[#f28c00]">
                            <Lightbulb size={18} strokeWidth={1.9} />
                            Important Note
                        </h2>
                        <p className="text-[9.5px] font-medium leading-relaxed text-[#31446c]">
                            After submission, you will not be able to edit your application. Please ensure all details and documents are correct.
                        </p>
                    </section>
                </aside>
            </div>
        </div>
    );
}
