import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    CheckCircle2,
    ChevronRight,
    Clock,
    Download,
    ExternalLink,
    HelpCircle,
    Info,
    Phone,
    Rocket,
    X,
} from 'lucide-react';
import { StageStepper } from './msmePmsShared';
import { safe } from './msmePmsUtils';
import MsmePmsStage1Overview from './MsmePmsStage1Overview';
import MsmePmsStage2Documents from './MsmePmsStage2Documents';
import MsmePmsStage3Claim from './MsmePmsStage3Claim';

const QUICK_ACTIONS = [
    { key: 'guidelines', label: 'Download PMS Guidelines', icon: Download },
    { key: 'checklist', label: 'Download PMS Checklist', icon: Download },
    { key: 'howItWorks', label: 'How It Works?', icon: HelpCircle },
    { key: 'schemeDetails', label: 'View PMS Scheme Details', icon: Info },
    { key: 'support', label: 'Contact PMS Support', icon: Phone },
];

export default function MsmePmsTracking({ data, handlers }) {
    const navigate = useNavigate();
    const [showHowItWorks, setShowHowItWorks] = useState(false);
    const companyName = safe(data?.companyName || data?.exhibitorName);
    const stage = Number(data?.pmsStage) || 1;
    const stageLabels = data?.pmsStageLabels;
    const title = stage === 2
        ? 'MSME PMS Application – Claim Documents'
        : stage === 3
            ? 'MSME PMS Application – Claim & Reimbursement'
            : 'MSME PMS Application & Submission';
    const subtitle = stage === 2
        ? 'Upload and manage documents required for PMS claim and reimbursement.'
        : stage === 3
            ? 'Track claim submission, sanction and reimbursement status on MSME portal.'
            : 'Apply on MSME portal and upload required documents to avail PMS reimbursement.';

    const downloadChecklist = () => {
        const claimDocs = Array.isArray(data?.pmsClaimDocuments) ? data.pmsClaimDocuments : [];
        const lines = [
            'MSME PMS Claim — Document Checklist',
            `Company: ${companyName}`,
            `Application ID: ${safe(data?.applicationId)}`,
            '',
            ...claimDocs.map((d, i) => `${i + 1}. ${d.label}`),
        ];
        const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MSME-PMS-Document-Checklist-${data?.applicationId || 'claim'}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const handleQuickAction = (key) => {
        if (key === 'checklist') return downloadChecklist();
        if (key === 'howItWorks') return setShowHowItWorks(true);
        if (key === 'support') return window.open('mailto:pms.support@ihwe.in');
        if (key === 'guidelines' || key === 'schemeDetails') return window.open('/msme-pms-scheme', '_blank');
    };

    return (
        <div className="w-full bg-[#f5f7fb] pt-1.5 px-3 pb-3 font-sans text-slate-800 antialiased">
            {/* BREADCRUMB */}
            <div className="mb-2 flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-400">
                <span>Exhibitor Management</span>
                <ChevronRight size={12} />
                {data?.exhibitorId ? (
                    <Link to={`/client-overview/${data.exhibitorId}?source=exhibitor`} className="hover:text-blue-600">Exhibitor Profile</Link>
                ) : <span>Exhibitor Profile</span>}
                <ChevronRight size={12} />
                <span>{companyName}</span>
                <ChevronRight size={12} />
                <span className="text-slate-600">MSME PMS Application</span>
            </div>

            {/* HEADER + STEPPER */}
            <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-[18px] font-bold text-slate-800 flex items-center gap-1.5">
                        {title} <CheckCircle2 size={16} className="text-emerald-500" />
                    </h1>
                    <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
                </div>
                <StageStepper stage={stage} labels={stageLabels} />
            </div>

            {/* STAGE CONTENT */}
            {stage === 1 && <MsmePmsStage1Overview data={data} handlers={handlers} />}
            {stage === 2 && <MsmePmsStage2Documents data={data} handlers={handlers} />}
            {stage === 3 && <MsmePmsStage3Claim data={data} handlers={handlers} />}

            {/* STAGE NAVIGATION */}
            <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5">
                <button type="button" onClick={() => handlers.onSaveStage(Math.max(1, stage - 1))} disabled={stage <= 1} className="text-[10.5px] font-semibold text-slate-400 disabled:opacity-30 hover:text-slate-600">← Back</button>
                {stage < 3 ? (
                    <button type="button" onClick={() => handlers.onSaveStage(stage + 1)} className="flex items-center gap-1 rounded-md bg-[#0D530E] px-3.5 py-1.5 text-[10.5px] font-bold text-white hover:bg-[#093a0a]">
                        Save &amp; Next <ChevronRight size={12} />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={async () => {
                            await handlers.onSaveStage(3);
                            navigate(`/client-overview/${data?.exhibitorId}?source=exhibitor`);
                        }}
                        className="rounded-md bg-[#0D530E] px-3.5 py-1.5 text-[10.5px] font-bold text-white hover:bg-[#093a0a]"
                    >
                        Save
                    </button>
                )}
            </div>

            {/* QUICK ACTIONS */}
            <div className="mt-2 rounded-xl border border-slate-200 bg-white p-2.5 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-500 pl-1">
                    <Rocket size={13} /> Quick Actions
                </span>
                <div className="flex flex-wrap gap-2 ml-auto">
                    {QUICK_ACTIONS.map((qa) => (
                        <button key={qa.key} type="button" onClick={() => handleQuickAction(qa.key)} className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">
                            <qa.icon size={12} /> {qa.label}
                        </button>
                    ))}
                </div>
            </div>

            {showHowItWorks && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl">
                        <div className="mb-3 flex items-center justify-between">
                            <strong className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5"><HelpCircle size={15} className="text-blue-600" /> How MSME PMS Application Works</strong>
                            <button type="button" onClick={() => setShowHowItWorks(false)}><X size={16} className="text-slate-400" /></button>
                        </div>
                        <ol className="space-y-2.5 text-[11px] text-slate-600">
                            <li className="flex gap-2"><span className="font-bold text-emerald-600">1.</span> <span><b>{(stageLabels || [])[0] || 'Application & Submission'}</b> — apply on the MSME portal, confirm exhibitor/contact details, review AI eligibility screening and Udyam certificate details.</span></li>
                            <li className="flex gap-2"><span className="font-bold text-orange-500">2.</span> <span><b>{(stageLabels || [])[1] || 'Claim Documents'}</b> — upload all documents required for the PMS claim (claim form, invoices, bank proof, etc.).</span></li>
                            <li className="flex gap-2"><span className="font-bold text-slate-400">3.</span> <span><b>{(stageLabels || [])[2] || 'Claim & Reimbursement'}</b> — track the claim through to reimbursement via MSME Portal Submission Details.</span></li>
                        </ol>
                        <button type="button" onClick={() => setShowHowItWorks(false)} className="mt-4 w-full rounded-md bg-blue-600 px-3 py-1.5 text-[10.5px] font-semibold text-white">Got it</button>
                    </div>
                </div>
            )}

            <div className="mt-2 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3">
                <Clock size={15} className="shrink-0 mt-0.5 text-blue-500" />
                <p className="text-[10.5px] text-blue-800 flex items-center gap-1">
                    Reimbursement under PMS Scheme is subject to verification of claim documents, actual participation and compliance with scheme guidelines.
                    <ExternalLink size={11} />
                </p>
            </div>
        </div>
    );
}
