import { useState } from 'react';
import {
    ArrowRight,
    Building2,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronDown,
    ClipboardCheck,
    ClipboardList,
    Clock3,
    Headphones,
    Hotel,
    Lightbulb,
    Mail,
    MapPin,
    Megaphone,
    MessageCircle,
    Package,
    Phone,
    Plane,
    Save,
    ShieldCheck,
    Store,
    Truck,
    UserRound,
    WalletCards,
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
const cx = (...classes) => classes.filter(Boolean).join(' ');

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



function InfoField({ label, value, required, type = 'text', options = [], onChange, className = '' }) {
    const fieldClass = cx(
        'flex min-w-0 flex-col gap-[7px]',
        '[@media(max-height:1100px)_and_(min-width:1181px)]:gap-[5px]',
        className
    );

    const controlClass = cx(
        'pms-control flex h-[33px] w-full min-w-0 items-center rounded-[5px] border border-[#d8e1ec]',
        'bg-white px-[11px] text-[#061743] shadow-[inset_0_1px_1px_rgba(6,23,67,0.01)]',
        'font-[inherit] !text-[10px] leading-[1.2] font-semibold outline-none',
        'focus:border-[#087536] focus:shadow-[0_0_0_3px_rgba(8,117,54,0.09)]',
        '[@media(max-height:1100px)_and_(min-width:1181px)]:h-[29px]',
        'max-[820px]:h-[40px] max-[820px]:!text-[12px]'
    );

    return (
        <label className={fieldClass}>
            <span
                className={cx(
                    'min-w-0 whitespace-nowrap text-[10px] leading-none font-semibold text-[#061743]',
                    '[@media(max-width:1365px)_and_(min-width:1181px)]:text-[9px]',
                    'max-[820px]:text-[12px]'
                )}
            >
                {label}
                {required && <b className="ml-[3px] text-[10px] font-extrabold text-[#e62f28]">*</b>}
            </span>

            <div
                className={cx(
                    'relative h-[33px] min-w-0',
                    '[@media(max-height:1100px)_and_(min-width:1181px)]:h-[29px]',
                    'max-[820px]:h-[40px]'
                )}
            >
                {type === 'select' ? (
                    <>
                        <select
                            className={cx(controlClass, 'cursor-pointer appearance-none pr-7')}
                            value={value ?? ''}
                            onChange={(event) => onChange?.(event.target.value)}
                        >
                            {options.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <ChevronDown
                            className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 text-[#061743]"
                            size={13}
                            strokeWidth={1.8}
                        />
                    </>
                ) : (
                    <input
                        className={cx(controlClass, '[text-overflow:ellipsis]')}
                        value={value ?? ''}
                        onChange={(event) => onChange?.(event.target.value)}
                        title={String(value ?? '')}
                    />
                )}
            </div>
        </label>
    );
}

function Section({ icon, letter, title, note, children, className = '' }) {
    return (
        <section
            className={cx(
                'min-h-0 min-w-0 overflow-hidden rounded-[9px] border border-[#dbe4ef] bg-white',
                'p-[13px_15px_14px] shadow-[0_2px_8px_rgba(9,32,74,0.025)]',
                '[@media(max-height:1100px)_and_(min-width:1181px)]:p-[9px_13px_10px]',
                'max-[1180px]:[min-height:auto]',
                'max-[820px]:p-[15px_18px_18px]',
                className
            )}
        >
            <div
                className={cx(
                    'mb-3 flex h-6 items-center gap-[9px] text-[#087536]',
                    '[@media(max-height:1100px)_and_(min-width:1181px)]:mb-2',
                    '[@media(max-height:1100px)_and_(min-width:1181px)]:h-[22px]',
                    'max-[820px]:mb-4 max-[820px]:h-auto'
                )}
            >
                <span
                    className={cx(
                        'grid h-[25px] w-[25px] flex-none place-items-center rounded-[5px] border border-[#d9eee2]',
                        'bg-[#eff9f3] text-[#087536]',
                        '[@media(max-height:1100px)_and_(min-width:1181px)]:h-[23px]',
                        '[@media(max-height:1100px)_and_(min-width:1181px)]:w-[23px]',
                        'max-[820px]:h-[30px] max-[820px]:w-[30px]'
                    )}
                >
                    {icon}
                </span>
                <strong
                    className={cx(
                        'whitespace-nowrap text-[13px] leading-none font-extrabold text-[#087536]',
                        '[@media(max-height:1100px)_and_(min-width:1181px)]:text-[12px]',
                        'max-[820px]:text-[15px]'
                    )}
                >
                    {letter}. {title}
                </strong>
                {note && (
                    <small className="-ml-[3px] whitespace-nowrap text-[9px] leading-none font-medium text-[#31446c] max-[820px]:text-[11px]">
                        {note}
                    </small>
                )}
            </div>
            {children}
        </section>
    );
}

function Step({ number, label, active }) {
    return (
        <div
            className={cx(
                'relative z-[1] flex flex-col items-center gap-[9px] text-[#061743]',
                '[@media(max-height:1100px)_and_(min-width:1181px)]:gap-1.5',
                'max-[820px]:gap-2'
            )}
        >
            <span
                className={cx(
                    'grid h-7 w-7 place-items-center rounded-full border-[3px] border-white bg-[#e7ebf3]',
                    'text-[11px] leading-none font-extrabold text-[#061743]',
                    'shadow-[0_0_0_1px_rgba(219,228,239,0.15)]',
                    '[@media(max-height:1100px)_and_(min-width:1181px)]:h-[26px]',
                    '[@media(max-height:1100px)_and_(min-width:1181px)]:w-[26px]',
                    'max-[820px]:h-9 max-[820px]:w-9 max-[820px]:text-[14px]',
                    active && '!bg-[#087536] !text-white !shadow-[0_4px_10px_rgba(8,117,54,0.18)]'
                )}
            >
                {number}
            </span>
            <small
                className={cx(
                    'whitespace-nowrap text-[10px] leading-none font-semibold text-[#061743]',
                    '[@media(max-height:1100px)_and_(min-width:1181px)]:text-[9px]',
                    'max-[820px]:text-[12px]',
                    active && '!font-bold !text-[#087536]'
                )}
            >
                {label}
            </small>
        </div>
    );
}

function SummaryRow({ label, value, checked = true, navy = false }) {
    return (
        <div className="grid h-[35px] grid-cols-[minmax(0,1fr)_auto_14px] items-center gap-[7px] border-b border-[#e9eef4] last:border-b-0 [@media(max-height:1100px)_and_(min-width:1181px)]:h-[30px] max-[820px]:h-[42px] max-[820px]:gap-3">
            <span className="min-w-0 whitespace-nowrap text-[10px] leading-none font-bold text-[#061743] [@media(max-width:1365px)_and_(min-width:1181px)]:text-[9px] max-[820px]:text-[12px]">
                {label}
            </span>
            <strong
                className={cx(
                    'min-w-0 max-w-[112px] overflow-hidden text-ellipsis whitespace-nowrap',
                    'text-[10px] leading-none font-medium text-[#087536]',
                    '[@media(max-width:1365px)_and_(min-width:1181px)]:text-[9px]',
                    'max-[820px]:text-[12px]',
                    navy && '!font-medium !text-[#061743]'
                )}
            >
                {value}
            </strong>
            {checked ? (
                <CheckCircle2 className="fill-[#087536] text-white" size={13} strokeWidth={2.4} />
            ) : (
                <i />
            )}
        </div>
    );
}

function ExpenseCard({ icon, title, note, selected, onClick }) {
    return (
        <button
            type="button"
            className={cx(
                'relative flex h-[88px] min-w-0 cursor-pointer flex-col items-center justify-center gap-[5px]',
                'rounded-lg border border-[#dce4ed] bg-white px-2 pt-[13px] pb-2 text-[#087536]',
                'font-[inherit] transition-[border-color,transform] duration-[180ms] ease-[ease]',
                'hover:-translate-y-px hover:border-[#a9d4ba]',
                '[@media(max-height:1100px)_and_(min-width:1181px)]:h-[78px]',
                '[@media(max-height:1100px)_and_(min-width:1181px)]:gap-1',
                '[@media(max-height:1100px)_and_(min-width:1181px)]:pt-[10px]',
                'max-[820px]:h-[100px] max-[820px]:gap-2 max-[820px]:pt-4',
                selected && '!border-[#8dc7a3] !bg-[#f3fbf6]'
            )}
            onClick={onClick}
        >
            <span
                className={cx(
                    'absolute top-[9px] left-[10px] grid h-[15px] w-[15px] place-items-center',
                    'rounded-[3px] border border-[#b7c4d4] bg-white text-white',
                    '[@media(max-height:1100px)_and_(min-width:1181px)]:top-[7px]',
                    '[@media(max-height:1100px)_and_(min-width:1181px)]:left-2',
                    '[@media(max-height:1100px)_and_(min-width:1181px)]:h-[14px]',
                    '[@media(max-height:1100px)_and_(min-width:1181px)]:w-[14px]',
                    'max-[820px]:h-[18px] max-[820px]:w-[18px] max-[820px]:top-3 max-[820px]:left-3',
                    selected && '!border-[#087536] !bg-[#087536]'
                )}
            >
                {selected && <Check size={11} strokeWidth={3} />}
            </span>
            <span className="grid h-[29px] place-items-center text-[#087536] [@media(max-height:1100px)_and_(min-width:1181px)]:h-[25px] max-[820px]:h-[34px]">
                {icon}
            </span>
            <strong className="whitespace-nowrap text-[10px] leading-none font-bold text-[#050f2f] max-[820px]:text-[12px]">
                {title}
            </strong>
            {note && (
                <small className="-mt-px text-[8px] leading-none font-medium text-[#1e3974] max-[820px]:text-[10px]">
                    {note}
                </small>
            )}
        </button>
    );
}

export default function MSMEPMSApplication({ data, onSaveDraft, onContinue, saving }) {
    const initialCompanyName = fieldValue(
        data,
        ['companyName', 'exhibitorName', 'organizationName'],
        ''
    );

    const stallNo = fieldValue(
        data,
        ['event.stallNumber', 'participation.stallFor', 'participation.stall.stallNumber', 'participation.stallNumber', 'stallFor', 'participation.stallNo', 'stallNo'],
        ''
    );

    const hallNo = fieldValue(
        data,
        ['event.hallNumber', 'participation.stall.hallNo', 'participation.hallNo', 'hallNo'],
        'Hall 8, 9 & 10'
    );

    const stallSize = fieldValue(
        data,
        ['event.stallSize', 'participation.stallSize', 'participation.stall.area', 'participation.area', 'stallSize'],
        ''
    );

    const contactName = data?.contactName || [data?.contact1?.firstName, data?.contact1?.lastName]
        .filter(Boolean)
        .join(' ');

    const [form, setForm] = useState(() => ({
        companyName: initialCompanyName,
        udyamRegNo: safe(data?.msme?.udyamRegNo, ''),
        gstNumber: safe(data?.gstNo || data?.gstNumber, ''),
        panNumber: safe(data?.panNo || data?.panNumber, ''),
        organizationType: safe(data?.organizationType, ''),
        yearOfEstablishment: safe(data?.yearOfEstablishment, ''),
        msmeCategory: safe(data?.msme?.msmeCategory, ''),
        contactName,
        designation: safe(data?.designation || data?.contact1?.designation, ''),
        mobileNumber: safe(data?.mobileNumber || data?.contact1?.mobile, ''),
        alternateNumber: safe(data?.alternateNumber || data?.contact1?.alternateNo, ''),
        addressLine1: safe(data?.addressLine1 || data?.address, ''),
        addressLine2: safe(data?.addressLine2, ''),
        country: safe(data?.country, ''),
        state: safe(data?.state, ''),
        city: safe(data?.city, ''),
        pincode: safe(data?.pincode, ''),
        eventName: safe(data?.event?.name || data?.eventName, ''),
        stallNo,
        hallNo,
        stallSize,
        participationType: safe(data?.event?.participationType || data?.participationType, ''),
        bookingStatus: safe(data?.event?.bookingStatus || data?.bookingStatus, ''),
        paymentStatus: safe(data?.event?.paymentStatus || data?.paymentStatus, ''),
    }));
    const [selectedExpenses, setSelectedExpenses] = useState(() => {
        const saved = Array.isArray(data?.selectedExpenses) ? data.selectedExpenses : [];
        return [...new Set(['Stall Charges', ...saved])];
    });

    const setField = (name, value) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const toggleExpense = (title) => {
        if (title === 'Stall Charges') return;
        setSelectedExpenses(prev => (
            prev.includes(title)
                ? prev.filter(item => item !== title)
                : [...prev, title]
        ));
    };

    const companyName = form.companyName;

    const companyFields = [
        { name: 'companyName', label: 'Company Name', required: true },
        { name: 'udyamRegNo', label: 'Udyam Registration Number', required: true },
        { name: 'gstNumber', label: 'GST Number', required: true },
        { name: 'panNumber', label: 'PAN Number', required: true },
        { name: 'organizationType', label: 'Type of Organization', required: true, type: 'select', options: ['Private Limited Company', 'Proprietorship', 'Partnership', 'LLP', 'Public Limited Company', 'Trust', 'Society'] },
        { name: 'yearOfEstablishment', label: 'Year of Establishment', required: true, type: 'select', options: Array.from({ length: 77 }, (_, index) => String(2026 - index)) },
    ];

    const personFields = [
        { name: 'contactName', label: 'Contact Person Name', required: true },
        { name: 'designation', label: 'Designation', required: true },
        { name: 'mobileNumber', label: 'Mobile Number', required: true },
        { name: 'alternateNumber', label: 'Alternative Contact Number', required: false },
    ];

    const addressFields = [
        { name: 'addressLine1', label: 'Address Line 1', required: true },
        { name: 'addressLine2', label: 'Address Line 2', required: false },
        { name: 'country', label: 'Country', required: true, type: 'select', options: ['India', 'Afghanistan', 'Bangladesh', 'Bhutan', 'Nepal', 'Sri Lanka', 'United Arab Emirates', 'United States'] },
        { name: 'state', label: 'State', required: true, type: 'select', options: ['Uttar Pradesh', 'Delhi', 'Haryana', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Punjab', 'Karnataka', 'Tamil Nadu', 'West Bengal'] },
        { name: 'city', label: 'City', required: true },
        { name: 'pincode', label: 'Pincode', required: true },
    ];

    const coordinatorImage = data?.pmsCoordinator?.photo || '';

    const greenFieldClass = cx(
        '[&_.pms-control]:w-fit [&_.pms-control]:min-w-[78px]',
        '[&_.pms-control]:border-[#d0e9da] [&_.pms-control]:bg-[#f2faf5]',
        '[&_.pms-control]:font-bold [&_.pms-control]:text-[#087536]'
    );
const navigate = useNavigate();
    return (
       <div className={"box-border w-full h-[calc(100dvh-58px)] min-h-0 bg-white px-6 pt-5 pb-[18px] text-[#061743] [font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe_UI,sans-serif] antialiased [text-rendering:geometricPrecision] [&_*]:box-border [@media(max-height:1100px)_and_(min-width:1181px)]:px-5 [@media(max-height:1100px)_and_(min-width:1181px)]:pt-[13px] [@media(max-height:1100px)_and_(min-width:1181px)]:pb-[10px] [@media(max-width:1365px)_and_(min-width:1181px)]:px-[18px] max-[1180px]:h-auto max-[1180px]:min-h-[calc(100dvh-58px)] max-[1180px]:overflow-auto max-[1180px]:p-[18px] max-[820px]:px-4 max-[820px]:pt-4 max-[820px]:pb-6"}>
            <header className={"flex h-[61px] items-start justify-between gap-[22px] [@media(max-height:1100px)_and_(min-width:1181px)]:h-[52px] max-[1180px]:mb-[18px] max-[1180px]:h-auto max-[820px]:block max-[820px]:mb-6"}>
                <div className={"pt-0.5 [@media(max-height:1100px)_and_(min-width:1181px)]:pt-0 max-[820px]:pt-0"}>
                    <h1 className={"m-0 text-[24px] leading-[1.08] font-semibold tracking-[-0.35px] text-[#061743] [@media(max-height:1100px)_and_(min-width:1181px)]:text-[21px] max-[820px]:text-[20px]"}>MSME PMS Application Form</h1>
                    <p className={"mt-[7px] mb-0 text-[14px] leading-[1.2] font-bold text-[#061743] [@media(max-height:1100px)_and_(min-width:1181px)]:mt-[5px] [@media(max-height:1100px)_and_(min-width:1181px)]:text-[12px] max-[820px]:text-[13px]"}>
                        <b className={"font-extrabold text-[#087536]"}>Step 1 of 5</b> - Applicant &amp; MSME Details
                    </p>
                </div>

                <div className={"grid grid-cols-[181px_93px_126px] gap-[14px] [@media(max-height:1100px)_and_(min-width:1181px)]:grid-cols-[174px_92px_118px] [@media(max-height:1100px)_and_(min-width:1181px)]:gap-[10px] max-[820px]:mt-4 max-[820px]:grid-cols-1 max-[820px]:gap-3"}>
                    <div className={"h-[55px] rounded-[7px] border border-[#dbe4ef] bg-white px-4 pt-[10px] pb-2 shadow-[0_1px_2px_rgba(5,23,67,0.02)] [@media(max-height:1100px)_and_(min-width:1181px)]:h-[49px] [@media(max-height:1100px)_and_(min-width:1181px)]:px-[13px] [@media(max-height:1100px)_and_(min-width:1181px)]:pt-2 [@media(max-height:1100px)_and_(min-width:1181px)]:pb-[7px] max-[820px]:h-[60px] max-[820px]:pt-3 max-[820px]:pb-2.5 max-[820px]:px-4"}>
                        <span className={"block text-[10px] leading-none font-medium text-[#31436b] max-[820px]:text-[11px]"}>Application ID</span>
                        <strong className={"mt-[7px] block whitespace-nowrap text-[12px] leading-none font-extrabold text-[#061743] [@media(max-height:1100px)_and_(min-width:1181px)]:mt-1.5 max-[820px]:mt-2 max-[820px]:text-[14px]"}>{safe(data?.applicationId)}</strong>
                    </div>
                    <div className={"h-[55px] rounded-[7px] border border-[#dbe4ef] bg-white px-4 pt-[10px] pb-2 shadow-[0_1px_2px_rgba(5,23,67,0.02)] [@media(max-height:1100px)_and_(min-width:1181px)]:h-[49px] [@media(max-height:1100px)_and_(min-width:1181px)]:px-[13px] [@media(max-height:1100px)_and_(min-width:1181px)]:pt-2 [@media(max-height:1100px)_and_(min-width:1181px)]:pb-[7px] max-[820px]:h-[60px] max-[820px]:pt-3 max-[820px]:pb-2.5 max-[820px]:px-4"}>
                        <span className={"block text-[10px] leading-none font-medium text-[#31436b] max-[820px]:text-[11px]"}>Status</span>
                        <strong className={cx("mt-[7px] block whitespace-nowrap text-[12px] leading-none font-extrabold text-[#061743] [@media(max-height:1100px)_and_(min-width:1181px)]:mt-1.5 max-[820px]:mt-2 max-[820px]:text-[14px]", '!text-[#f25a1d]')}>{safe(data?.status)}</strong>
                    </div>
                    <div className={"h-[55px] rounded-[7px] border border-[#dbe4ef] bg-white px-4 pt-[10px] pb-2 shadow-[0_1px_2px_rgba(5,23,67,0.02)] [@media(max-height:1100px)_and_(min-width:1181px)]:h-[49px] [@media(max-height:1100px)_and_(min-width:1181px)]:px-[13px] [@media(max-height:1100px)_and_(min-width:1181px)]:pt-2 [@media(max-height:1100px)_and_(min-width:1181px)]:pb-[7px] max-[820px]:h-[60px] max-[820px]:pt-3 max-[820px]:pb-2.5 max-[820px]:px-4"}>
                        <span className={"block text-[10px] leading-none font-medium text-[#31436b] max-[820px]:text-[11px]"}>Progress</span>
                        <strong className={cx("mt-[7px] block whitespace-nowrap text-[12px] leading-none font-extrabold text-[#061743] [@media(max-height:1100px)_and_(min-width:1181px)]:mt-1.5 max-[820px]:mt-2 max-[820px]:text-[14px]", '!text-[#087536]')}>20%</strong>
                    </div>
                </div>
            </header>

            <div className={"grid h-[calc(100%-61px)] min-h-0 grid-cols-[minmax(0,1fr)_278px] gap-[22px] [@media(max-height:1100px)_and_(min-width:1181px)]:h-[calc(100%-52px)] [@media(max-height:1100px)_and_(min-width:1181px)]:gap-4 [@media(max-width:1365px)_and_(min-width:1181px)]:grid-cols-[minmax(0,1fr)_260px] [@media(max-width:1365px)_and_(min-width:1181px)]:gap-4 max-[1180px]:h-auto max-[1180px]:grid-cols-1 max-[1180px]:overflow-visible max-[820px]:gap-5"}>
                <div className={"grid min-h-0 min-w-0 grid-rows-[58px_minmax(0,1fr)] gap-3 [@media(max-height:1100px)_and_(min-width:1181px)]:grid-rows-[50px_minmax(0,1fr)] [@media(max-height:1100px)_and_(min-width:1181px)]:gap-2 max-[1180px]:h-auto max-[1180px]:grid-rows-[auto_auto] max-[1180px]:overflow-visible max-[820px]:gap-4"}>
                    <div className={"relative grid min-w-0 grid-cols-5 items-start pt-0 before:absolute before:left-[5px] before:right-[5px] before:top-4 before:h-0.5 before:rounded-full before:bg-[#dce3ed] before:content-[''] after:absolute after:left-[5px] after:top-4 after:h-0.5 after:w-[calc(20%-1px)] after:rounded-full after:bg-[#087536] after:content-[''] [@media(max-height:1100px)_and_(min-width:1181px)]:before:top-[14px] [@media(max-height:1100px)_and_(min-width:1181px)]:after:top-[14px] max-[1180px]:h-[60px] max-[820px]:h-[70px] max-[820px]:grid-cols-[repeat(5,140px)] max-[820px]:overflow-x-auto max-[820px]:gap-2 max-[820px]:pb-2 max-[820px]:before:top-[18px] max-[820px]:after:top-[18px] max-[480px]:grid-cols-[repeat(5,120px)] max-[480px]:gap-1"}>
                        <Step number="1" label="Applicant Details" active />
                        <Step number="2" label="Business Details" />
                        <Step number="3" label="Documents" />
                        <Step number="4" label="Review" />
                        <Step number="5" label="Submit" />
                    </div>

                    <main className={"grid min-h-0 min-w-0 grid-rows-[188px_186px_128px_164px_52px] gap-3 overflow-hidden [@media(max-height:1100px)_and_(min-width:1181px)]:grid-rows-[164px_160px_108px_132px_46px] [@media(max-height:1100px)_and_(min-width:1181px)]:gap-2 max-[1180px]:h-auto max-[1180px]:grid-rows-none max-[1180px]:overflow-visible max-[820px]:gap-4"}>
                        <Section
                            letter="A"
                            title="Company / Organization Details"
                            icon={<Building2 size={17} strokeWidth={1.8} />}
                        >
                            <div className={cx("grid min-w-0", "grid-cols-[1.14fr_1.09fr_1.1fr_0.99fr] gap-[30px] [@media(max-height:1100px)_and_(min-width:1181px)]:gap-[18px] [@media(max-width:1365px)_and_(min-width:1181px)]:gap-4 max-[1024px]:grid-cols-2 max-[1024px]:gap-4 max-[820px]:grid-cols-1 max-[820px]:gap-3")}>
                                {companyFields.slice(0, 4).map(field => (
                                    <InfoField
                                        key={field.name}
                                        label={field.label}
                                        value={form[field.name]}
                                        required={field.required}
                                        type={field.type}
                                        options={field.options}
                                        onChange={(value) => setField(field.name, value)}
                                    />
                                ))}
                            </div>

                            <div className={cx("grid min-w-0", "mt-[15px] grid-cols-[1.08fr_1.01fr_1.39fr] gap-[30px] [@media(max-height:1100px)_and_(min-width:1181px)]:mt-[9px] [@media(max-height:1100px)_and_(min-width:1181px)]:gap-[18px] [@media(max-width:1365px)_and_(min-width:1181px)]:gap-4 max-[1024px]:grid-cols-2 max-[1024px]:gap-4 max-[820px]:mt-4 max-[820px]:grid-cols-1 max-[820px]:gap-3")}>
                                {companyFields.slice(4).map(field => (
                                    <InfoField
                                        key={field.name}
                                        label={field.label}
                                        value={form[field.name]}
                                        required={field.required}
                                        type={field.type}
                                        options={field.options}
                                        onChange={(value) => setField(field.name, value)}
                                    />
                                ))}

                                <div className="flex min-w-0 flex-col gap-[7px] [@media(max-height:1100px)_and_(min-width:1181px)]:gap-[5px] max-[820px]:gap-2">
                                    <span className="min-w-0 whitespace-nowrap text-[10px] leading-none font-semibold text-[#061743] [@media(max-width:1365px)_and_(min-width:1181px)]:text-[9px] max-[820px]:text-[12px]">
                                        MSME Category <b className="ml-[3px] text-[10px] font-extrabold text-[#e62f28]">*</b>
                                    </span>
                                    <div className="flex h-[33px] items-center gap-[31px] [@media(max-height:1100px)_and_(min-width:1181px)]:h-[29px] max-[820px]:h-[40px] max-[820px]:gap-6 max-[480px]:gap-4">
                                        {['Micro', 'Small', 'Medium'].map(category => (
                                            <label
                                                key={category}
                                                className="relative flex cursor-pointer items-center gap-[7px] text-[10.5px] leading-none font-medium text-[#061743] max-[820px]:text-[13px]"
                                            >
                                                <input
                                                    className="pointer-events-none absolute opacity-0"
                                                    type="radio"
                                                    name="msmeCategory"
                                                    value={category}
                                                    checked={form.msmeCategory === category}
                                                    onChange={(event) => setField('msmeCategory', event.target.value)}
                                                />
                                                <i
                                                    className={cx(
                                                        'inline-block h-[13px] w-[13px] rounded-full border-[1.4px] border-[#8090ad] bg-white',
                                                        'max-[820px]:h-[16px] max-[820px]:w-[16px]',
                                                        form.msmeCategory === category && '!border-4 !border-[#087536]'
                                                    )}
                                                />
                                                {category}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Section>

                        <div className={"grid min-h-0 min-w-0 grid-cols-[0.91fr_1.04fr] gap-5 max-[1180px]:grid-cols-1 max-[820px]:gap-4"}>
                            <Section
                                letter="B"
                                title="Authorized Person Details"
                                icon={<UserRound size={17} strokeWidth={1.8} />}
                            >
                                <div className={cx("grid min-w-0", "grid-cols-[1.23fr_0.9fr_1.07fr] gap-5 [@media(max-height:1100px)_and_(min-width:1181px)]:gap-[14px] max-[1024px]:grid-cols-2 max-[1024px]:gap-4 max-[820px]:grid-cols-1 max-[820px]:gap-3")}>
                                    {personFields.slice(0, 3).map(field => (
                                        <InfoField
                                            key={field.name}
                                            label={field.label}
                                            value={form[field.name]}
                                            required={field.required}
                                            onChange={(value) => setField(field.name, value)}
                                        />
                                    ))}
                                </div>

                                <InfoField
                                    label={personFields[3].label}
                                    value={form[personFields[3].name]}
                                    required={personFields[3].required}
                                    className="mt-[15px] w-[43%] [@media(max-height:1100px)_and_(min-width:1181px)]:mt-[9px] max-[820px]:mt-3 max-[820px]:w-full"
                                    onChange={(value) => setField(personFields[3].name, value)}
                                />
                            </Section>

                            <Section
                                letter="C"
                                title="Registered Address"
                                icon={<MapPin size={17} strokeWidth={1.8} />}
                                className="max-[1180px]:mt-4 max-[820px]:mt-4"
                            >
                                <div className={cx("grid min-w-0", "grid-cols-[1.08fr_1fr] gap-6 [@media(max-height:1100px)_and_(min-width:1181px)]:gap-[18px] max-[820px]:grid-cols-1 max-[820px]:gap-3")}>
                                    {addressFields.slice(0, 2).map(field => (
                                        <InfoField
                                            key={field.name}
                                            label={field.label}
                                            value={form[field.name]}
                                            required={field.required}
                                            onChange={(value) => setField(field.name, value)}
                                        />
                                    ))}
                                </div>

                                <div className={cx("grid min-w-0", "mt-[15px] grid-cols-[1.12fr_1.17fr_1.03fr_0.92fr] gap-[19px] [@media(max-height:1100px)_and_(min-width:1181px)]:mt-[9px] [@media(max-height:1100px)_and_(min-width:1181px)]:gap-[14px] max-[1024px]:grid-cols-2 max-[1024px]:gap-4 max-[820px]:mt-4 max-[820px]:grid-cols-1 max-[820px]:gap-3")}>
                                    {addressFields.slice(2).map(field => (
                                        <InfoField
                                            key={field.name}
                                            label={field.label}
                                            value={form[field.name]}
                                            required={field.required}
                                            type={field.type}
                                            options={field.options}
                                            onChange={(value) => setField(field.name, value)}
                                        />
                                    ))}
                                </div>
                            </Section>
                        </div>

                        <Section
                            letter="D"
                            title="Event Participation Details"
                            note="(Auto-fetched from IHWE)"
                            icon={<CalendarDays size={17} strokeWidth={1.8} />}
                            className="[&>div:first-child]:mb-[11px] [@media(max-height:1100px)_and_(min-width:1181px)]:[&>div:first-child]:mb-2"
                        >
                            <div className={cx("grid min-w-0", "grid-cols-[1.78fr_0.91fr_0.95fr_0.9fr_1.08fr_1.03fr_1.03fr] gap-[26px] [@media(max-height:1100px)_and_(min-width:1181px)]:gap-[18px] [@media(max-width:1365px)_and_(min-width:1181px)]:gap-4 max-[1024px]:grid-cols-3 max-[1024px]:gap-4 max-[820px]:grid-cols-1 max-[820px]:gap-3")}>
                                <InfoField
                                    label="Event Name"
                                    value={form.eventName}
                                    onChange={(value) => setField('eventName', value)}
                                />
                                <InfoField label="Stall Number" value={form.stallNo} onChange={(value) => setField('stallNo', value)} />
                                <InfoField label="Hall Number" value={form.hallNo} onChange={(value) => setField('hallNo', value)} />
                                <InfoField label="Stall Size" value={form.stallSize} onChange={(value) => setField('stallSize', value)} />
                                <InfoField
                                    label="Participation Type"
                                    value={form.participationType}
                                    type="select"
                                    options={['Shell Space', 'Bare Space', 'Sponsorship', 'Table Space']}
                                    onChange={(value) => setField('participationType', value)}
                                />
                                <InfoField
                                    label="Booking Status"
                                    value={form.bookingStatus}
                                    type="select"
                                    options={['Confirmed', 'Pending', 'Cancelled']}
                                    className={greenFieldClass}
                                    onChange={(value) => setField('bookingStatus', value)}
                                />
                                <InfoField
                                    label="Payment Status"
                                    value={form.paymentStatus}
                                    type="select"
                                    options={['Fully Paid', 'Partially Paid', 'Pending']}
                                    className={greenFieldClass}
                                    onChange={(value) => setField('paymentStatus', value)}
                                />
                            </div>
                        </Section>

                        <Section
                            letter="E"
                            title="Expense Categories"
                            note="(Select all that apply)"
                            icon={<ClipboardList size={17} strokeWidth={1.8} />}
                            className="[&>div:first-child]:mb-[13px] [@media(max-height:1100px)_and_(min-width:1181px)]:[&>div:first-child]:mb-2"
                        >
                            <div className={"grid grid-cols-6 gap-[22px] [@media(max-height:1100px)_and_(min-width:1181px)]:gap-[14px] [@media(max-width:1365px)_and_(min-width:1181px)]:gap-3 max-[1024px]:grid-cols-3 max-[1024px]:gap-4 max-[820px]:grid-cols-2 max-[820px]:gap-3 max-[480px]:grid-cols-1"}>
                                <ExpenseCard
                                    icon={<Store size={25} strokeWidth={1.7} />}
                                    title="Stall Charges"
                                    note="(Mandatory)"
                                    selected={selectedExpenses.includes('Stall Charges')}
                                    onClick={() => toggleExpense('Stall Charges')}
                                />
                                <ExpenseCard icon={<Hotel size={25} strokeWidth={1.7} />} title="Hotel Stay" selected={selectedExpenses.includes('Hotel Stay')} onClick={() => toggleExpense('Hotel Stay')} />
                                <ExpenseCard icon={<Plane size={25} strokeWidth={1.7} />} title="Travel" selected={selectedExpenses.includes('Travel')} onClick={() => toggleExpense('Travel')} />
                                <ExpenseCard icon={<Truck size={25} strokeWidth={1.7} />} title="Courier" selected={selectedExpenses.includes('Courier')} onClick={() => toggleExpense('Courier')} />
                                <ExpenseCard icon={<Megaphone size={25} strokeWidth={1.7} />} title="Marketing Material" selected={selectedExpenses.includes('Marketing Material')} onClick={() => toggleExpense('Marketing Material')} />
                                <ExpenseCard icon={<Package size={25} strokeWidth={1.7} />} title="Logistics / Others" selected={selectedExpenses.includes('Logistics / Others')} onClick={() => toggleExpense('Logistics / Others')} />
                            </div>
                        </Section>

                        <footer className={"grid h-[52px] min-w-0 grid-cols-[141px_minmax(0,1fr)_180px] items-center gap-[14px] rounded-lg border border-[#dbe4ef] bg-white p-[7px_8px] [@media(max-height:1100px)_and_(min-width:1181px)]:h-[46px] [@media(max-height:1100px)_and_(min-width:1181px)]:p-[5px_7px] max-[1180px]:[min-height:auto] max-[820px]:h-auto max-[820px]:grid-cols-1 max-[820px]:gap-3 max-[820px]:p-4"}>
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => onSaveDraft?.(form, selectedExpenses)}
                                className={cx("flex h-[35px] cursor-pointer items-center justify-center gap-[9px] rounded-[5px] font-[inherit] text-[10px] leading-none font-bold [@media(max-height:1100px)_and_(min-width:1181px)]:h-8 max-[820px]:h-[44px] max-[820px]:text-[13px]", 'border border-[#d5deea] bg-white text-[#061743]')}
                            >
                                <Save size={15} strokeWidth={2} />
                                Save Draft
                            </button>

                            <span className="flex min-w-0 items-center justify-self-center gap-2 whitespace-nowrap text-[9px] leading-none font-medium text-[#26385f] max-[820px]:whitespace-normal max-[820px]:text-center max-[820px]:text-[11px]">
                                <ShieldCheck className="flex-none text-[#087536]" size={14} strokeWidth={2.2} />
                                Your information is secure and will only be used for PMS scheme processing.
                            </span>

                            <button
                                type="button"
                                className={cx(
                                    "flex h-[35px] cursor-pointer items-center justify-center gap-[9px] rounded-[5px] font-[inherit] text-[10px] leading-none font-bold [@media(max-height:1100px)_and_(min-width:1181px)]:h-8 max-[820px]:h-[44px] max-[820px]:text-[13px]",
                                    'relative border-0 bg-[linear-gradient(90deg,#0b7137_0%,#087536_100%)] text-white',
                                    'shadow-[0_4px_9px_rgba(8,117,54,0.18)]'
                                )}
                                disabled={saving}
                                onClick={() => onContinue?.(form, selectedExpenses)}
                            >
                                Save &amp; Continue
                                <ArrowRight className="absolute right-[13px] m-0" size={18} strokeWidth={2} />
                            </button>
                        </footer>
                    </main>
                </div>

                <aside className={"grid min-h-0 min-w-0 grid-rows-[238px_190px_270px_70px] gap-[14px] overflow-hidden [@media(max-height:1100px)_and_(min-width:1181px)]:grid-rows-[210px_168px_232px_60px] [@media(max-height:1100px)_and_(min-width:1181px)]:gap-2 max-[1180px]:h-auto max-[1180px]:grid-cols-2 max-[1180px]:grid-rows-none max-[1180px]:overflow-visible max-[1180px]:gap-4 max-[820px]:grid-cols-1 max-[820px]:gap-5"}>
                    <section
                        className={cx(
                            'min-w-0 overflow-hidden rounded-[9px] border border-[#dbe4ef] bg-white p-[15px]',
                            '[@media(max-height:1100px)_and_(min-width:1181px)]:p-[11px_13px]',
                            'max-[820px]:p-[18px]'
                        )}
                    >
                        <h2 className="mb-3 flex items-center gap-[9px] text-[13px] leading-none font-extrabold text-[#087536] [@media(max-height:1100px)_and_(min-width:1181px)]:mb-[7px] max-[820px]:mb-4 max-[820px]:text-[15px]">
                            <span className="grid h-[25px] w-[25px] flex-none place-items-center rounded-[5px] border border-[#d9eee2] bg-[#eff9f3] text-[#087536] [@media(max-height:1100px)_and_(min-width:1181px)]:h-[23px] [@media(max-height:1100px)_and_(min-width:1181px)]:w-[23px] max-[820px]:h-[30px] max-[820px]:w-[30px]">
                                <ClipboardCheck size={18} strokeWidth={1.8} />
                            </span>
                            Application Summary
                        </h2>
                        <SummaryRow label="Company Name" value={companyName} checked={false} navy />
                        <SummaryRow label="Udyam Registration" value={data?.msme?.udyamRegNo ? safe(data?.verificationStatus || 'Submitted') : 'Pending'} />
                        <SummaryRow label="GST Number" value={data?.gstNo ? safe(data?.kycStatus || 'Submitted') : 'Pending'} />
                        <SummaryRow label="IHWE Booking" value={safe(form.bookingStatus)} />
                        <SummaryRow label="Payment Status" value={safe(form.paymentStatus)} />
                    </section>

                    <section
                        className={cx(
                            'min-w-0 overflow-hidden rounded-[9px] border border-[#dbe4ef]',
                            'bg-[linear-gradient(135deg,#ffffff_0%,#f8fcfa_100%)] p-[15px]',
                            '[@media(max-height:1100px)_and_(min-width:1181px)]:p-[11px_13px]',
                            'max-[820px]:p-[18px]'
                        )}
                    >
                        <h2 className="mb-[19px] flex items-center gap-[9px] whitespace-nowrap text-[13px] leading-none font-extrabold text-[#087536] [@media(max-height:1100px)_and_(min-width:1181px)]:mb-3 max-[820px]:mb-4 max-[820px]:text-[15px]">
                            Estimated Reimbursement
                            <small className="-ml-[5px] text-[8px] font-medium text-[#31446c] max-[820px]:text-[10px]">(Indicative)</small>
                        </h2>
                        <strong className="block text-[28px] leading-none font-extrabold tracking-[0.3px] text-[#087536] [@media(max-height:1100px)_and_(min-width:1181px)]:text-[25px] max-[820px]:text-[32px]">
                            {data?.claim?.eligibleAmount != null ? `₹ ${Number(data.claim.eligibleAmount).toLocaleString('en-IN')}` : '—'}
                        </strong>
                        <p className="mt-3 mb-[14px] text-[9.5px] leading-[1.55] font-medium text-[#31446c] [@media(max-height:1100px)_and_(min-width:1181px)]:mt-2 [@media(max-height:1100px)_and_(min-width:1181px)]:mb-[10px] [@media(max-height:1100px)_and_(min-width:1181px)]:leading-[1.35] max-[820px]:text-[11px]">
                            Maximum benefit subject to scheme rules and authority approval.
                        </p>
                        <button
                            type="button"
                            className="flex h-9 w-full cursor-pointer items-center justify-center gap-[9px] rounded-[5px] border border-[#bac8da] bg-white font-[inherit] text-[10px] leading-none font-bold text-[#061743] [@media(max-height:1100px)_and_(min-width:1181px)]:h-[31px] max-[820px]:h-[44px] max-[820px]:text-[13px]"
                        >
                            <WalletCards size={16} strokeWidth={1.9} />
                            View Claim Calculation
                        </button>
                    </section>

                    <section
                        className={cx(
                            'min-w-0 overflow-hidden rounded-[9px] border border-[#dbe4ef] bg-white p-[15px]',
                            '[@media(max-height:1100px)_and_(min-width:1181px)]:p-[11px_13px]',
                            'max-[820px]:p-[18px]'
                        )}
                    >
                        <h2 className="mb-[13px] flex items-center gap-[9px] text-[13px] leading-none font-extrabold text-[#5924c6] [@media(max-height:1100px)_and_(min-width:1181px)]:mb-2 max-[820px]:mb-4 max-[820px]:text-[15px]">
                            <Headphones size={19} strokeWidth={1.8} /> Relationship Manager
                        </h2>

                        <div className="mb-[10px] flex items-center gap-3 [@media(max-height:1100px)_and_(min-width:1181px)]:mb-1.5 max-[820px]:mb-3">
                            <div className="relative grid h-12 w-12 flex-none place-items-center overflow-hidden rounded-full bg-[#eef2f7] text-[12px] font-extrabold text-[#061743] [@media(max-height:1100px)_and_(min-width:1181px)]:h-[42px] [@media(max-height:1100px)_and_(min-width:1181px)]:w-[42px] max-[820px]:h-14 max-[820px]:w-14 max-[820px]:text-[15px]">
                                <span>{data?.pmsCoordinator?.initials || '—'}</span>
                                {coordinatorImage && <img
                                    className="absolute inset-0 h-full w-full object-cover"
                                    src={coordinatorImage}
                                    alt={safe(data?.pmsCoordinator?.name, 'PMS Coordinator')}
                                    onError={(event) => { event.currentTarget.style.display = 'none'; }}
                                />}
                            </div>
                            <div>
                                <strong className="block text-[12px] leading-none font-extrabold text-[#061743] max-[820px]:text-[14px]">{safe(data?.pmsCoordinator?.name)}</strong>
                                <span className="mt-[7px] block text-[9px] leading-none font-medium text-[#31446c] max-[820px]:mt-2 max-[820px]:text-[11px]">{safe(data?.pmsCoordinator?.designation)}</span>
                            </div>
                        </div>

                        <a
                            className="mt-[5px] flex h-[31px] w-full min-w-0 items-center gap-[10px] rounded-[5px] border border-[#e0e7f0] bg-white px-[9px] text-[9.5px] leading-none font-bold text-[#061743] no-underline [@media(max-height:1100px)_and_(min-width:1181px)]:mt-1 [@media(max-height:1100px)_and_(min-width:1181px)]:h-[27px] max-[820px]:h-[40px] max-[820px]:text-[12px] max-[820px]:gap-3 max-[820px]:px-3"
                            href={data?.pmsCoordinator?.phone ? `tel:${data.pmsCoordinator.phone}` : undefined}
                        >
                            <Phone className="flex-none text-[#5924c6]" size={15} strokeWidth={1.9} />
                            <span>{safe(data?.pmsCoordinator?.phone)}</span>
                        </a>
                        <a
                            className="mt-[5px] flex h-[31px] w-full min-w-0 items-center gap-[10px] rounded-[5px] border border-[#e0e7f0] bg-white px-[9px] text-[9.5px] leading-none font-bold text-[#061743] no-underline [@media(max-height:1100px)_and_(min-width:1181px)]:mt-1 [@media(max-height:1100px)_and_(min-width:1181px)]:h-[27px] max-[820px]:h-[40px] max-[820px]:text-[12px] max-[820px]:gap-3 max-[820px]:px-3"
                            href={data?.pmsCoordinator?.whatsapp ? `https://wa.me/${String(data.pmsCoordinator.whatsapp).replace(/\D/g, '')}` : undefined}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <MessageCircle className="flex-none text-[#089a50]" size={15} strokeWidth={1.9} />
                            <span>WhatsApp Support</span>
                        </a>
                        <a
                            className="mt-[5px] flex h-[31px] w-full min-w-0 items-center gap-[10px] rounded-[5px] border border-[#e0e7f0] bg-white px-[9px] text-[9.5px] leading-none font-bold text-[#061743] no-underline [@media(max-height:1100px)_and_(min-width:1181px)]:mt-1 [@media(max-height:1100px)_and_(min-width:1181px)]:h-[27px] max-[820px]:h-[40px] max-[820px]:text-[12px] max-[820px]:gap-3 max-[820px]:px-3"
                            href={data?.pmsCoordinator?.email ? `mailto:${data.pmsCoordinator.email}` : undefined}
                        >
                            <Mail className="flex-none text-[#5924c6]" size={15} strokeWidth={1.9} />
                            <span>{safe(data?.pmsCoordinator?.email)}</span>
                        </a>

                        <div className="mt-[5px] flex h-[42px] w-full min-w-0 items-start gap-[10px] rounded-[5px] border border-[#e0e7f0] bg-white px-[9px] pt-[7px] text-[9.5px] leading-none font-bold text-[#061743] [@media(max-height:1100px)_and_(min-width:1181px)]:mt-1 [@media(max-height:1100px)_and_(min-width:1181px)]:h-9 [@media(max-height:1100px)_and_(min-width:1181px)]:pt-[5px] max-[820px]:h-[52px] max-[820px]:pt-2.5 max-[820px]:px-3 max-[820px]:gap-3">
                            <Clock3 className="flex-none text-[#5924c6]" size={15} strokeWidth={1.9} />
                            <div className="min-w-0">
                                <b className="block text-[9px] leading-none font-extrabold text-[#061743] max-[820px]:text-[11px]">Support Hours</b>
                                <span className="mt-[5px] block whitespace-nowrap text-[8px] leading-none font-medium text-[#31446c] max-[820px]:mt-1.5 max-[820px]:text-[10px]">Mon - Sat | 09:00 AM - 07:00 PM (IST)</span>
                            </div>
                        </div>
                    </section>

                    <section className="flex min-w-0 items-center gap-3 overflow-hidden rounded-[9px] border border-[#f1d9ad] bg-[#fffaf1] px-[14px] py-[11px] text-[#f28c00] [@media(max-height:1100px)_and_(min-width:1181px)]:px-3 [@media(max-height:1100px)_and_(min-width:1181px)]:py-2 max-[820px]:px-4 max-[820px]:py-3.5 max-[820px]:gap-4">
                        <Lightbulb className="flex-none" size={24} strokeWidth={1.7} />
                        <div>
                            <strong className="block text-[10px] leading-none font-bold text-[#f07800] max-[820px]:text-[13px]">Need Assistance?</strong>
                            <p className="mt-1.5 mb-0 text-[9px] leading-[1.35] font-medium text-[#31446c] max-[820px]:mt-2 max-[820px]:text-[11px]">
                                Our team will help you at every step of your PMS application.
                            </p>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}