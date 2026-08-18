import { Fragment } from 'react';
import { Check, FileCheck2, IndianRupee, RefreshCw } from 'lucide-react';
import { PMS_STAGE_LABELS_FALLBACK } from './msmePmsUtils';

const STAGE_ICONS = [FileCheck2, RefreshCw, IndianRupee];

export function StageStepper({ stage, labels }) {
    const stages = Array.isArray(labels) && labels.length === 3 ? labels : PMS_STAGE_LABELS_FALLBACK;
    const current = Math.min(Math.max(Number(stage) || 1, 1), 3);
    return (
        <div className="flex items-start justify-between gap-1 overflow-x-auto">
            {stages.map((label, i) => {
                const num = i + 1;
                const done = num < current;
                const active = num === current;
                const StageIcon = STAGE_ICONS[i] || FileCheck2;
                return (
                    <Fragment key={label}>
                        <div className="flex flex-col items-center text-center shrink-0 px-1">
                            <div className="relative">
                                <div
                                    className={`w-12 h-12 rounded-full grid place-items-center border-2 ${done
                                        ? 'bg-emerald-600 border-emerald-600 text-white'
                                        : active
                                            ? 'bg-orange-500 border-orange-500 text-white'
                                            : 'bg-white border-slate-200 text-slate-400'
                                        }`}
                                >
                                    {done ? <Check size={18} /> : <StageIcon size={17} />}
                                </div>
                                <span className={`absolute -bottom-1 -right-1 grid h-[18px] w-[18px] place-items-center rounded-full text-[9px] font-bold border-2 border-white ${done ? 'bg-emerald-700 text-white' : active ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                    {num}
                                </span>
                            </div>
                            <span className="mt-1.5 text-[10px] font-bold text-slate-700 whitespace-nowrap">{label}</span>
                            <span className={`text-[9.5px] font-semibold ${done ? 'text-emerald-600' : active ? 'text-orange-500' : 'text-slate-400'}`}>
                                {done ? 'Completed' : active ? 'Current Stage' : num === current + 1 ? 'Next Stage' : num === stages.length ? 'Final Stage' : 'Pending'}
                            </span>
                        </div>
                        {num < stages.length && <div className={`flex-1 h-[2px] mt-6 min-w-[16px] ${num < current ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
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

export function InlineField({ label, value, children }) {
    return (
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 py-1 last:border-b-0">
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
