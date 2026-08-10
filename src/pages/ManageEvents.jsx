import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import { Plus, Trash2, Edit, Calendar, MapPin, Percent, Activity, User, Clock, Eye, X, ChevronDown, Upload } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { getCurrentUserName } from '../utils/currentUser';

const DEFAULT_PAYMENT_PLANS = [
    { id: 'full', label: 'Full Payment', percentage: 100, isDefault: true, dueDate: null, dueDaysBeforeEvent: 0, discountPercent: 5, discountDaysBeforeEvent: 30, planConfigVersion: 2 },
    { id: 'advance', label: 'Booking Advance', percentage: 35, isDefault: false, dueDate: null, dueDaysBeforeEvent: 0, planConfigVersion: 2 },
    { id: 'running', label: 'Running Payment', percentage: 35, isDefault: false, dueDate: null, dueDaysBeforeEvent: 45, planConfigVersion: 2 },
    { id: 'final', label: 'Final Payment', percentage: 30, isDefault: false, dueDate: null, dueDaysBeforeEvent: 30, planConfigVersion: 2 }
];

const DEFAULT_EARLY_BIRD_NOTE = 'Note: Early Bird bookings are not eligible for the additional 5% Full Payment Discount.';
const NUMBER_INPUT_CLASS = '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

const EMPTY_EVENT = {
    name: '',
    startDate: '',
    endDate: '',
    location: '',
    status: 'active',
    ticketsStatus: 'Few Remaining',
    speakersCount: '100+',
    description: '',
    paymentFilterName: '',
    contactPhone: '',
    order: 1,
    earlyBirdDiscountActive: true,
    earlyBirdDiscountPercent: 10,
    earlyBirdValidityDays: 60,
    earlyBirdExclusionNote: DEFAULT_EARLY_BIRD_NOTE,
    paymentPlans: DEFAULT_PAYMENT_PLANS,
    paymentRemindersActive: true,
    paymentReminderDays: [7, 3, 0],
    paymentReminderConfigVersion: 2,
    generalReminderDays: 7,
    installmentReminderDays: 7
};

const limitWords = (value = '', maxWords = 50) => {
    const words = String(value).trim().split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) return words.join(' ');
    return `${words.slice(0, maxWords).join(' ')}...`;
};

const normalizeReminderDays = (days, configVersion = 0) => {
    const source = Array.isArray(days) && days.length ? days : EMPTY_EVENT.paymentReminderDays;
    if (Number(configVersion || 0) < 2 && source[0] === 7 && source[1] === 5 && source[2] === 3) {
        return EMPTY_EVENT.paymentReminderDays;
    }
    return [0, 1, 2].map((idx) => {
        if (source[idx] === '') return '';
        const value = Number(source[idx]);
        return Number.isFinite(value) ? value : EMPTY_EVENT.paymentReminderDays[idx];
    });
};

const legacyPlanLabels = {
    phase1: 'Booking Advance',
    phase2: 'Running Payment',
    phase3: 'Final Payment'
};

const planIdAliases = {
    phase1: 'advance',
    phase2: 'running',
    phase3: 'final'
};

const legacyPlanDefaults = {
    full: { labels: ['Full Payment (100%)'], percentages: [100], dueDays: [30] },
    advance: { labels: ['Advance Payment'], percentages: [25], dueDays: [7] },
    running: { labels: ['Running Payment'], percentages: [50], dueDays: [5] },
    final: { labels: ['Final Payment'], percentages: [75, 7], dueDays: [3] }
};

const normalizePaymentPlans = (plans) => {
    const source = Array.isArray(plans) && plans.length ? plans : [];
    return DEFAULT_PAYMENT_PLANS.map((defaultPlan) => {
        const sourcePlan = source.find((plan) => (planIdAliases[plan?.id] || plan?.id) === defaultPlan.id) || {};
        const plan = { ...sourcePlan, id: defaultPlan.id };
        const legacyLabel = legacyPlanLabels[sourcePlan?.id] || null;
        const oldPhaseLabel = /^phase\s*\d/i.test(String(plan?.label || ''));
        const dueDaysBeforeEvent = plan?.dueDaysBeforeEvent === '' ? '' : Number(plan?.dueDaysBeforeEvent);
        const discountPercent = plan?.discountPercent === '' ? '' : Number(plan?.discountPercent);
        const discountDaysBeforeEvent = plan?.discountDaysBeforeEvent === '' ? '' : Number(plan?.discountDaysBeforeEvent);
        const legacyDefaults = legacyPlanDefaults[defaultPlan.id] || {};
        const isLegacyLabel = legacyDefaults.labels?.includes(plan?.label);
        const isCurrentConfig = Number(plan?.planConfigVersion || 0) >= 2;
        const percentage = plan?.percentage === '' ? '' : Number(plan?.percentage);
        const shouldUseDefaultPercentage = !Number.isFinite(percentage) || (!isCurrentConfig && legacyDefaults.percentages?.includes(percentage));
        const shouldUseDefaultDueDays = !Number.isFinite(dueDaysBeforeEvent) || (!isCurrentConfig && legacyDefaults.dueDays?.includes(dueDaysBeforeEvent));
        return {
            ...defaultPlan,
            ...plan,
            dueDate: null,
            label: (legacyLabel || oldPhaseLabel || isLegacyLabel) && !isCurrentConfig ? defaultPlan.label : (plan?.label || defaultPlan.label || 'Payment Step'),
            percentage: percentage === '' ? '' : (shouldUseDefaultPercentage ? defaultPlan.percentage : percentage),
            dueDaysBeforeEvent: dueDaysBeforeEvent === '' ? '' : (shouldUseDefaultDueDays ? defaultPlan.dueDaysBeforeEvent : dueDaysBeforeEvent),
            discountPercent: discountPercent === '' ? '' : (Number.isFinite(discountPercent) && discountPercent >= 0 ? discountPercent : (defaultPlan.discountPercent ?? 0)),
            discountDaysBeforeEvent: discountDaysBeforeEvent === '' ? '' : (Number.isFinite(discountDaysBeforeEvent) && discountDaysBeforeEvent >= 0 ? discountDaysBeforeEvent : (defaultPlan.discountDaysBeforeEvent ?? 30))
        };
    });
};

const getEventPlan = (event, planId) => (
    normalizePaymentPlans(event?.paymentPlans).find((plan) => plan.id === planId) || {}
);

const formatLogTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getActionBadgeClass = (action = '') => {
    if (action === 'Created') return 'bg-green-50 text-green-700 border-green-200';
    if (action === 'Updated') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action === 'Deleted') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
};

const splitLogDetails = (details) => String(details || '—')
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);

const getLogUserName = (user) => {
    const value = String(user || '').trim();
    if (!value || value.toLowerCase() === 'system') return getCurrentUserName('Admin');
    return value;
};

const formatEventDisplayDate = (value) => (
    value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
);

const formatVenueParts = (location = '') => {
    const parts = String(location || '').split(',').map((part) => part.trim()).filter(Boolean);
    if (parts.length < 4) return { address: location || 'TBA', cityLine: '' };

    const country = parts[parts.length - 1];
    const state = parts[parts.length - 2];
    const cityPin = parts[parts.length - 3];
    const address = parts.slice(0, -3).join(', ');

    return {
        address: address || location || 'TBA',
        cityLine: [cityPin, state, country].filter(Boolean).join(', ')
    };
};

const ManageEvents = () => {
    const [events, setEvents] = useState([]);
    const [eventActivityLogs, setEventActivityLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [eventForm, setEventForm] = useState({ ...EMPTY_EVENT });
    const [bookingFormFile, setBookingFormFile] = useState(null);
    const [bookingFormInputKey, setBookingFormInputKey] = useState(0);
    const [isEditing, setIsEditing] = useState(null);
    const [viewEvent, setViewEvent] = useState(null);
    const [openConfigSections, setOpenConfigSections] = useState({
        earlyBird: false,
        fullPayment: false,
        installment: false,
        reminders: false,
        bookingForm: false
    });

    const getUserInfo = () => {
        const userStr = sessionStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : {};
        const userId = sessionStorage.getItem("user_id") || user._id;
        const userName = getCurrentUserName("Admin");
        return { userId, userName };
    };

    const getPlan = (planId) => normalizePaymentPlans(eventForm.paymentPlans).find((plan) => plan.id === planId) || {};

    const toggleConfigSection = (section) => {
        setOpenConfigSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const updatePlan = (planId, patch) => {
        const nextPlans = normalizePaymentPlans(eventForm.paymentPlans).map((plan) => (
            plan.id === planId ? { ...plan, ...patch, planConfigVersion: 2 } : plan
        ));
        setEventForm({ ...eventForm, paymentPlans: nextPlans });
    };

    const getInstallmentTotal = (plans = eventForm.paymentPlans) => {
        return normalizePaymentPlans(plans)
            .filter((plan) => ['advance', 'running', 'final'].includes(plan.id))
            .reduce((total, plan) => total + (Number(plan.percentage) || 0), 0);
    };

    const updateInstallmentPercentage = (planId, rawValue) => {
        if (rawValue === '') {
            updatePlan(planId, { percentage: '' });
            return;
        }

        const percentage = Number(rawValue);
        if (!Number.isFinite(percentage)) return;

        const nextPlans = normalizePaymentPlans(eventForm.paymentPlans).map((plan) => (
            plan.id === planId ? { ...plan, percentage, planConfigVersion: 2 } : plan
        ));
        const nextTotal = getInstallmentTotal(nextPlans);
        if (nextTotal > 100) {
            const otherPlans = normalizePaymentPlans(eventForm.paymentPlans)
                .filter((plan) => ['advance', 'running', 'final'].includes(plan.id) && plan.id !== planId);
            const otherTotal = otherPlans.reduce((total, plan) => total + (Number(plan.percentage) || 0), 0);
            const otherBreakdown = otherPlans
                .map((plan) => `${Number(plan.percentage) || 0}% ${plan.label || 'Payment Step'}`)
                .join(' + ');
            const availablePercent = Math.max(0, 100 - otherTotal);
            Swal.fire({
                icon: 'warning',
                title: 'Installment Limit Exceeded',
                html: `<div style="max-width:325px; width:100%; margin-left:4px; text-align:left; line-height:1.55;"><strong>${otherTotal}%</strong> of the total payment has already been allocated (<strong>${otherBreakdown}</strong>), leaving <strong>${availablePercent}% available</strong>. This installment can therefore be set to a maximum of <strong>${availablePercent}%</strong>, as the total payment allocation cannot exceed <strong>100%</strong>.</div>`,
                width: 344,
                confirmButtonColor: '#23471d'
            });
            return;
        }

        setEventForm({ ...eventForm, paymentPlans: nextPlans });
    };

    const startEditEvent = (event) => {
        if (!event?._id) return;
        setIsEditing(event._id);
        const { _id, __v, createdAt, updatedAt, ...cleanEvent } = event;
        setEventForm({
            ...cleanEvent,
            location: cleanEvent.location || cleanEvent.venue || '',
            earlyBirdDiscountActive: cleanEvent.earlyBirdDiscountActive ?? true,
            earlyBirdDiscountPercent: cleanEvent.earlyBirdDiscountPercent ?? 10,
            earlyBirdValidityDays: cleanEvent.earlyBirdValidityDays ?? 60,
            earlyBirdExclusionNote: cleanEvent.earlyBirdExclusionNote || DEFAULT_EARLY_BIRD_NOTE,
            paymentPlans: normalizePaymentPlans(cleanEvent.paymentPlans),
            paymentRemindersActive: cleanEvent.paymentRemindersActive ?? true,
            paymentReminderDays: normalizeReminderDays(cleanEvent.paymentReminderDays, cleanEvent.paymentReminderConfigVersion),
            paymentReminderConfigVersion: cleanEvent.paymentReminderConfigVersion || 2
        });
        setViewEvent(null);
        setBookingFormFile(null);
        setBookingFormInputKey((prev) => prev + 1);
    };

    useEffect(() => {
        fetchEvents();
        fetchEventActivityLogs();
    }, []);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/events');
            if (response.data.success) {
                setEvents(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEventActivityLogs = async () => {
        setLogsLoading(true);
        try {
            const response = await api.get('/api/activity-logs', {
                params: {
                    page: 1,
                    limit: 25,
                    module: 'Event Schedule'
                }
            });
            if (response.data.success) {
                setEventActivityLogs(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching event activity logs:', error);
        } finally {
            setLogsLoading(false);
        }
    };

    const getEventLogDetails = (log) => {
        const details = String(log?.details || '').trim();
        const idMatch = details.match(/[a-f0-9]{24}/i);
        const matchedEvent = idMatch ? events.find((event) => String(event._id) === idMatch[0]) : null;
        const eventName = matchedEvent?.name;

        if (details.startsWith('Added new event')) {
            const cleanName = details.replace(/^Added new event:?\s*/i, '').trim();
            return cleanName && cleanName !== 'undefined'
                ? `Created event: ${cleanName}`
                : 'Created event';
        }
        if (details.startsWith('Updated event')) {
            const cleanName = details.replace(/^Updated event:?\s*/i, '').replace(/^ID:\s*/i, '').trim();
            return eventName
                ? `Updated event: ${eventName}`
                : cleanName && !/^[a-f0-9]{24}$/i.test(cleanName)
                    ? `Updated event: ${cleanName}`
                    : 'Updated event';
        }
        if (details.startsWith('Deleted event')) {
            const cleanName = details.replace(/^Deleted event(?: ID)?:?\s*/i, '').trim();
            return eventName
                ? `Deleted event: ${eventName}`
                : cleanName && !/^[a-f0-9]{24}$/i.test(cleanName)
                    ? `Deleted event: ${cleanName}`
                    : 'Deleted event';
        }
        return details || '—';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (getInstallmentTotal() > 100) {
            Swal.fire({
                icon: 'warning',
                title: 'Installment total cannot exceed 100%',
                text: 'Keep Advance, Running and Final Payment total at 100% or less.',
                confirmButtonColor: '#23471d'
            });
            return;
        }
        setIsLoading(true);
        try {
            const { userName } = getUserInfo();
            const payload = {
                ...eventForm,
                paymentPlans: normalizePaymentPlans(eventForm.paymentPlans),
                paymentReminderDays: normalizeReminderDays(eventForm.paymentReminderDays, eventForm.paymentReminderConfigVersion),
                paymentReminderConfigVersion: 2,
                generalReminderDays: normalizeReminderDays(eventForm.paymentReminderDays, eventForm.paymentReminderConfigVersion)[0],
                installmentReminderDays: normalizeReminderDays(eventForm.paymentReminderDays, eventForm.paymentReminderConfigVersion)[0],
                userName,
                [isEditing ? 'updated_by' : 'added_by']: userName,
                showInPaymentsFilter: Boolean(String(eventForm.paymentFilterName || '').trim())
            };
            const requestBody = bookingFormFile
                ? Object.entries(payload).reduce((formData, [key, value]) => {
                    if (value === undefined || value === null) return formData;
                    formData.append(key, Array.isArray(value) || typeof value === 'object' ? JSON.stringify(value) : value);
                    return formData;
                }, new FormData())
                : payload;

            if (bookingFormFile) requestBody.append('bookingForm', bookingFormFile);

            let response;
            if (isEditing) {
                response = await api.put(`/api/events/${isEditing}`, requestBody, bookingFormFile ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
            } else {
                response = await api.post('/api/events', requestBody, bookingFormFile ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: isEditing ? 'Event Updated!' : 'Event Created!',
                    timer: 1500,
                    showConfirmButton: false
                });
                setEventForm({ ...EMPTY_EVENT });
                setBookingFormFile(null);
                setBookingFormInputKey((prev) => prev + 1);
                setIsEditing(null);
                fetchEvents();
                setTimeout(fetchEventActivityLogs, 300);
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to save event', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Event?',
            text: "This may affect linked stalls and bookings.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });

        if (!result.isConfirmed) return;

        try {
            const { userName } = getUserInfo();
            const response = await api.delete(`/api/events/${id}`, { data: { userName, updated_by: userName } });
            if (response.data.success) {
                Swal.fire('Deleted!', 'Event has been deleted.', 'success');
                fetchEvents();
                setTimeout(fetchEventActivityLogs, 300);
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to delete event', 'error');
        }
    };

    return (
        <div className="p-6 bg-white min-h-screen font-inter">
            <PageHeader title="EVENT MANAGEMENT" description="Create and manage exhibition events" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* FORM COLUMN */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow-md border-2 border-gray-200 rounded-[2px] overflow-hidden">
                        <div className={`px-6 py-4 flex items-center gap-3 text-white ${isEditing ? 'bg-amber-500' : 'bg-[#23471d]'}`}>
                            {isEditing ? <Edit size={18} /> : <Plus size={18} />}
                            <h2 className="text-sm font-bold uppercase tracking-tight">{isEditing ? 'Edit Event' : 'Create Event'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="col-span-1">
                                    <label className="block text-[11px] font-black text-black mb-1 uppercase tracking-tight">Sequence / Order</label>
                                    <input type="number" value={eventForm.order} onChange={(e) => setEventForm({ ...eventForm, order: e.target.value })} className={`w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px] ${NUMBER_INPUT_CLASS}`} placeholder="e.g. 1" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[11px] font-black text-black mb-1 uppercase tracking-tight">Status</label>
                                    <select value={eventForm.status} onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px]">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="block text-[11px] font-medium text-black mb-1 uppercase tracking-tight">Event Name *</label>
                                <input type="text" required value={eventForm.name} onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px]" placeholder="e.g. IHWE 2026" />
                            </div>
                            <div className="mb-3">
                                <label className="block text-[11px] font-medium text-black mb-1 uppercase tracking-tight">Short Name</label>
                                <input type="text" value={eventForm.paymentFilterName || ''} onChange={(e) => setEventForm({ ...eventForm, paymentFilterName: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px]" placeholder="e.g. IHWE" />
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="block text-[11px] font-medium text-black mb-1 uppercase tracking-tight">Start Date *</label>
                                    <input type="date" required value={eventForm.startDate ? new Date(eventForm.startDate).toISOString().split('T')[0] : ''} onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px]" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-black mb-1 uppercase tracking-tight">End Date *</label>
                                    <input type="date" required value={eventForm.endDate ? new Date(eventForm.endDate).toISOString().split('T')[0] : ''} onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px]" />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="block text-[11px] font-medium text-black mb-1 uppercase tracking-tight">Location / Venue</label>
                                <input type="text" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px]" placeholder="Pragati Maidan, New Delhi" />
                            </div>
                            <div className="mb-3">
                                <label className="block text-[11px] font-medium text-black mb-1 uppercase tracking-tight">Support Contact Number</label>
                                <input type="text" value={eventForm.contactPhone} onChange={(e) => setEventForm({ ...eventForm, contactPhone: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px]" placeholder="e.g. +91 98102XXXXX" />
                            </div>
                            <div className="mb-3">
                                <label className="block text-[11px] font-medium text-black mb-1 uppercase tracking-tight">Event Description</label>
                                <textarea rows={3} value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px]" placeholder="Briefly describe the event..." />
                            </div>
                            
                            <div className="pt-4 border-t-2 border-gray-100 space-y-3">
                                <div className="border border-green-200 rounded-[2px] overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => toggleConfigSection('earlyBird')}
                                        className="w-full flex items-center justify-between gap-3 px-3 py-2 bg-green-50 text-left"
                                    >
                                        <span className="text-[11px] font-black text-black uppercase tracking-tight flex items-center gap-2">
                                            <Percent size={14} className="text-[#23471d]" /> Early Bird Discount
                                        </span>
                                        <span className="flex items-center gap-2">
                                        <label onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={eventForm.earlyBirdDiscountActive !== false}
                                                onChange={(e) => setEventForm({ ...eventForm, earlyBirdDiscountActive: e.target.checked })}
                                                className="h-3.5 w-3.5 accent-[#23471d]"
                                            />
                                            {eventForm.earlyBirdDiscountActive !== false ? 'Active' : 'Inactive'}
                                        </label>
                                        <ChevronDown size={14} className={`text-gray-500 transition-transform ${openConfigSections.earlyBird ? 'rotate-180' : ''}`} />
                                        </span>
                                    </button>
                                    {openConfigSections.earlyBird && (
                                    <div className="grid grid-cols-2 gap-2 bg-white border-t border-green-200 p-3">
                                        <div>
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-0.5">Discount %</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={eventForm.earlyBirdDiscountPercent ?? 10}
                                                onChange={(e) => setEventForm({ ...eventForm, earlyBirdDiscountPercent: e.target.value === '' ? '' : Number(e.target.value) })}
                                                className={`w-full px-2 py-1.5 border border-gray-300 text-[10px] font-black outline-none focus:border-[#23471d] rounded-[2px] ${NUMBER_INPUT_CLASS}`}
                                            />
                                            <p className="text-[9px] text-gray-500 mt-1 leading-tight">Basic Price par discount.</p>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-0.5">Validity Days Before Event</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={eventForm.earlyBirdValidityDays ?? 60}
                                                onChange={(e) => setEventForm({ ...eventForm, earlyBirdValidityDays: e.target.value === '' ? '' : Number(e.target.value) })}
                                                className={`w-full px-2 py-1.5 border border-gray-300 text-[10px] font-black outline-none focus:border-[#23471d] rounded-[2px] ${NUMBER_INPUT_CLASS}`}
                                            />
                                            <p className="text-[9px] text-gray-500 mt-1 leading-tight">Event date se itne din pehle confirmed booking.</p>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-0.5">Note</label>
                                            <input
                                                type="text"
                                                value={eventForm.earlyBirdExclusionNote || DEFAULT_EARLY_BIRD_NOTE}
                                                onChange={(e) => setEventForm({ ...eventForm, earlyBirdExclusionNote: e.target.value })}
                                                className="w-full px-2 py-1.5 border border-gray-300 text-[10px] font-semibold outline-none focus:border-[#23471d] rounded-[2px]"
                                            />
                                        </div>
                                    </div>
                                    )}
                                </div>

                                <div className="border border-green-200 rounded-[2px] overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => toggleConfigSection('fullPayment')}
                                        className="w-full flex items-center justify-between gap-3 px-3 py-2 bg-green-50 text-left"
                                    >
                                        <span className="text-[11px] font-black text-black uppercase tracking-tight flex items-center gap-2">
                                            <Percent size={14} className="text-[#23471d]" /> Full Payment Plan
                                        </span>
                                        <ChevronDown size={14} className={`text-gray-500 transition-transform ${openConfigSections.fullPayment ? 'rotate-180' : ''}`} />
                                    </button>
                                    {openConfigSections.fullPayment && (
                                    <div className="grid grid-cols-3 gap-2 bg-white border-t border-green-200 p-3">
                                        <div>
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-0.5">Plan Label</label>
                                            <input
                                                type="text"
                                                value={getPlan('full').label || 'Full Payment'}
                                                onChange={(e) => updatePlan('full', { label: e.target.value })}
                                                className="w-full px-2 py-1.5 border border-gray-300 text-[10px] font-bold uppercase outline-none focus:border-[#23471d] rounded-[2px]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-0.5">% of Total</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={getPlan('full').percentage ?? 100}
                                                onChange={(e) => updatePlan('full', { percentage: e.target.value === '' ? '' : Number(e.target.value) })}
                                                className={`w-full px-2 py-1.5 border border-gray-300 text-[10px] font-black outline-none focus:border-[#23471d] rounded-[2px] ${NUMBER_INPUT_CLASS}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-0.5">Discount %</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={getPlan('full').discountPercent ?? 5}
                                                onChange={(e) => updatePlan('full', { discountPercent: e.target.value === '' ? '' : Number(e.target.value) })}
                                                className={`w-full px-2 py-1.5 border border-gray-300 text-[10px] font-black outline-none focus:border-[#23471d] rounded-[2px] ${NUMBER_INPUT_CLASS}`}
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-0.5">Validity Days Before Event</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={getPlan('full').discountDaysBeforeEvent ?? 30}
                                                onChange={(e) => updatePlan('full', { discountDaysBeforeEvent: e.target.value === '' ? '' : Number(e.target.value) })}
                                                className={`w-full px-2 py-1.5 border border-gray-300 text-[10px] font-black outline-none focus:border-[#23471d] rounded-[2px] ${NUMBER_INPUT_CLASS}`}
                                            />
                                        </div>
                                    </div>
                                    )}
                                </div>

                                <div className="border border-green-200 rounded-[2px] overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => toggleConfigSection('installment')}
                                        className="w-full flex items-center justify-between gap-3 px-3 py-2 bg-green-50 text-left"
                                    >
                                        <span className="text-[11px] font-black text-black uppercase tracking-tight flex items-center gap-2">
                                            <Percent size={14} className="text-[#23471d]" /> Installment Payment Plan
                                        </span>
                                        <ChevronDown size={14} className={`text-gray-500 transition-transform ${openConfigSections.installment ? 'rotate-180' : ''}`} />
                                    </button>
                                    {openConfigSections.installment && (
                                    <div className="border-t border-green-200 p-3">
                                    <div className="space-y-2">
                                        {['advance', 'running', 'final'].map((planId) => {
                                            const plan = getPlan(planId);
                                            return (
                                                <div key={planId} className="grid grid-cols-12 gap-2 bg-white border border-gray-200 rounded-[2px] p-2.5">
                                                    <div className="col-span-6">
                                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-0.5">Plan Label</label>
                                                        <input
                                                            type="text"
                                                            value={plan.label || ''}
                                                            onChange={(e) => updatePlan(planId, { label: e.target.value })}
                                                            className="w-full px-2 py-1.5 border border-gray-300 text-[10px] font-bold uppercase outline-none focus:border-[#23471d] rounded-[2px]"
                                                        />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-0.5">% of Total</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="100"
                                                            value={plan.percentage ?? 0}
                                                            onChange={(e) => updateInstallmentPercentage(planId, e.target.value)}
                                                            className={`w-full px-2 py-1.5 border border-gray-300 text-[10px] font-black outline-none focus:border-[#23471d] rounded-[2px] ${NUMBER_INPUT_CLASS}`}
                                                        />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-0.5">Days Before</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={plan.dueDaysBeforeEvent ?? 0}
                                                            onChange={(e) => updatePlan(planId, { dueDaysBeforeEvent: e.target.value === '' ? '' : Number(e.target.value), dueDate: null })}
                                                            className={`w-full px-2 py-1.5 border border-gray-300 text-[10px] font-black outline-none focus:border-[#23471d] rounded-[2px] ${NUMBER_INPUT_CLASS}`}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    </div>
                                    )}
                                </div>

                                <div className="border border-green-200 rounded-[2px] overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => toggleConfigSection('reminders')}
                                        className="w-full flex items-center justify-between gap-3 px-3 py-2 bg-green-50 text-left"
                                    >
                                        <span className="text-[11px] font-black text-black uppercase tracking-tight flex items-center gap-2">
                                            <Calendar size={14} className="text-blue-600" /> Automated Payment Reminders
                                        </span>
                                        <span className="flex items-center gap-2">
                                        <label onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={eventForm.paymentRemindersActive !== false}
                                                onChange={(e) => setEventForm({ ...eventForm, paymentRemindersActive: e.target.checked })}
                                                className="h-3.5 w-3.5 accent-blue-600"
                                            />
                                            {eventForm.paymentRemindersActive !== false ? 'Active' : 'Inactive'}
                                        </label>
                                        <ChevronDown size={14} className={`text-gray-500 transition-transform ${openConfigSections.reminders ? 'rotate-180' : ''}`} />
                                        </span>
                                    </button>
                                    {openConfigSections.reminders && (
                                    <div className={`grid grid-cols-3 gap-3 bg-white p-3 border-t border-green-200 ${eventForm.paymentRemindersActive === false ? 'opacity-60' : ''}`}>
                                        {normalizeReminderDays(eventForm.paymentReminderDays, eventForm.paymentReminderConfigVersion).map((day, reminderIdx) => (
                                            <div key={reminderIdx}>
                                                <label className="block text-[10px] font-bold text-gray-700 mb-1 tracking-tight">
                                                    {reminderIdx === 0 ? '1st Reminder' : reminderIdx === 1 ? '2nd Reminder' : 'Final Reminder'}
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={day}
                                                    disabled={eventForm.paymentRemindersActive === false}
                                                    onChange={(e) => {
                                                        const nextDays = normalizeReminderDays(eventForm.paymentReminderDays, eventForm.paymentReminderConfigVersion);
                                                        nextDays[reminderIdx] = e.target.value === '' ? '' : Number(e.target.value);
                                                        setEventForm({ ...eventForm, paymentReminderDays: nextDays, paymentReminderConfigVersion: 2, generalReminderDays: nextDays[0], installmentReminderDays: nextDays[0] });
                                                    }}
                                                    className={`w-full px-3 py-1.5 border border-gray-200 focus:border-blue-400 outline-none shadow-sm text-xs font-bold rounded-[2px] ${NUMBER_INPUT_CLASS}`}
                                                />
                                                <p className="text-[9px] text-gray-500 mt-1 leading-tight">
                                                    {Number(day) <= 0 ? 'Due date ke din reminder jayega.' : 'Payment due date se pehle reminder jayega.'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    )}
                                </div>

                                <div className="border border-green-200 rounded-[2px] overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => toggleConfigSection('bookingForm')}
                                        className="w-full flex items-center justify-between gap-3 px-3 py-2 bg-green-50 text-left"
                                    >
                                        <span className="text-[11px] font-black text-black uppercase tracking-tight flex items-center gap-2">
                                            <Upload size={14} className="text-[#23471d]" /> Booking Form Upload
                                        </span>
                                        <ChevronDown size={14} className={`text-gray-500 transition-transform ${openConfigSections.bookingForm ? 'rotate-180' : ''}`} />
                                    </button>
                                    {openConfigSections.bookingForm && (
                                    <div className="bg-white p-3 border-t border-green-200">
                                        <input
                                            key={bookingFormInputKey}
                                            type="file"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            onChange={(e) => setBookingFormFile(e.target.files?.[0] || null)}
                                            className="w-full px-3 py-2 border border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold rounded-[2px] file:mr-3 file:border-0 file:bg-[#23471d] file:px-3 file:py-1.5 file:text-[10px] file:font-black file:uppercase file:text-white"
                                        />
                                        {(bookingFormFile || eventForm.bookingFormUrl) && (
                                            <p className="mt-2 text-[10px] font-semibold text-gray-600 truncate">
                                                {bookingFormFile ? bookingFormFile.name : eventForm.bookingFormOriginalName || eventForm.bookingFormUrl}
                                            </p>
                                        )}
                                    </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t-2 border-gray-100 flex justify-end gap-2">
                                {isEditing && <button type="button" onClick={() => { setIsEditing(null); setEventForm({ ...EMPTY_EVENT }); setBookingFormFile(null); setBookingFormInputKey((prev) => prev + 1); }} className="px-6 py-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all rounded-[2px]">Cancel</button>}
                                <button type="submit" disabled={isLoading} className="px-8 py-2 bg-[#23471d] hover:bg-[#1a3516] text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-[2px] shadow-sm">
                                    {isLoading ? 'Processing...' : (isEditing ? 'Update Event' : 'Create Event')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* TABLE COLUMN */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm">
                        <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2 uppercase tracking-tight">
                                <Calendar className="w-4 h-4" /> Events Registry
                            </h2>
                            <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 uppercase tracking-wider shadow-sm">
                                {events.length} EVENTS
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm font-inter">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50/50">
                                        <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-center w-16 tracking-tight">Seq.</th>
                                        <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-left tracking-tight">Event Details</th>
                                        <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-left tracking-tight">Venue / Dates</th>
                                        <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-center tracking-tight">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoading ? (
                                        <tr><td colSpan={4} className="py-12 text-center text-black font-medium uppercase tracking-widest text-[10px] italic">Loading events...</td></tr>
                                    ) : events.length === 0 ? (
                                        <tr><td colSpan={4} className="py-12 text-center text-black font-medium uppercase tracking-widest text-[10px] italic">No events found</td></tr>
                                    ) : events.map((event, index) => (
                                        <tr key={event._id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 align-top">
                                            <td className="py-4 px-4 text-black font-black text-center text-xs bg-slate-50 border-r border-slate-100">{event.order !== undefined ? event.order : index + 1}</td>
                                            <td className="py-4 px-4 min-w-[220px]">
                                                <p className="font-semibold text-red-600 text-sm uppercase tracking-tight leading-none mb-1.5 cursor-pointer hover:underline">
                                                    {event.name}
                                                </p>
                                                <p className="text-[10px] text-black font-bold uppercase tracking-tight">Short Name: <span className="text-[#23471d]">{event.paymentFilterName || '—'}</span></p>
                                                <p className={`mt-1 inline-flex px-2 py-0.5 text-[9px] font-black uppercase rounded-[2px] ${event.status === 'active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                                    {event.status || 'active'}
                                                </p>
                                            </td>
                                            <td className="py-4 px-4 min-w-[230px]">
                                                <div className="text-[10px] text-black font-medium uppercase tracking-tight flex items-start gap-1 mb-2 opacity-70 leading-snug">
                                                    <MapPin size={10} className="mt-0.5 shrink-0" />
                                                    <div>
                                                        <div>{formatVenueParts(event.location).address}</div>
                                                        {formatVenueParts(event.location).cityLine && (
                                                            <div>{formatVenueParts(event.location).cityLine}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="inline-flex items-center gap-1.5 text-left whitespace-nowrap ml-4">
                                                    <span className="text-black font-semibold text-xs uppercase tracking-tight">
                                                        {event.startDate ? new Date(event.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                    </span>
                                                    <span className="text-[10px] font-black text-black uppercase tracking-tight opacity-40">TO</span>
                                                    <span className="text-black font-semibold text-xs uppercase tracking-tight">
                                                        {event.endDate ? new Date(event.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => setViewEvent(event)}
                                                        className="text-slate-700 hover:bg-slate-50 p-1.5 transition-all rounded-[2px] border border-slate-200 bg-slate-50/40"
                                                        title="View"
                                                        type="button"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    {/*
                                                    <button
                                                        onClick={() => {
                                                            setIsEditing(event._id);
                                                            const { _id, __v, createdAt, updatedAt, ...cleanEvent } = event;
                                                            setEventForm({
                                                                ...cleanEvent,
                                                                location: cleanEvent.location || cleanEvent.venue || '',
                                                                paymentPlans: normalizePaymentPlans(cleanEvent.paymentPlans),
                                                                paymentReminderDays: normalizeReminderDays(cleanEvent.paymentReminderDays, cleanEvent.paymentReminderConfigVersion),
                                                                paymentReminderConfigVersion: cleanEvent.paymentReminderConfigVersion || 2
                                                            });
                                                        }}
                                                        className="text-blue-600 hover:bg-blue-50 p-1.5 transition-all rounded-[2px] border border-blue-100 bg-blue-50/30"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    */}
                                                    <button
                                                        onClick={() => handleDelete(event._id)}
                                                        className="text-red-600 hover:bg-red-50 p-1.5 transition-all rounded-[2px] border border-red-100 bg-red-50/30"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-white px-5 py-3 border-t border-gray-200 flex justify-between items-center bg-gray-50/30">
                            <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Exhibition Schedule Control</div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                Total Registry: <span className="text-red-600">{events.length}</span> Events Managed
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-white border-2 border-gray-200 shadow-sm">
                        <div className="bg-slate-900 px-5 py-3 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2 uppercase tracking-tight">
                                <Activity className="w-4 h-4" /> Event Activity Logs
                            </h2>
                            <span className="bg-white/10 text-white text-[10px] font-black px-3 py-1 uppercase tracking-wider border border-white/15">
                                {eventActivityLogs.length} Recent
                            </span>
                        </div>
                        <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100">
                            {logsLoading ? (
                                <div className="py-10 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    Loading activity logs...
                                </div>
                            ) : eventActivityLogs.length === 0 ? (
                                <div className="py-10 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    No event activity logged yet
                                </div>
                            ) : (
                                eventActivityLogs.map((log) => (
                                    <div key={log._id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                    <span className={`inline-flex items-center px-2 py-0.5 border rounded-[2px] text-[9px] font-black uppercase tracking-wider ${getActionBadgeClass(log.action)}`}>
                                                        Action: {log.action || 'Activity'}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                                                        <User size={11} /> By: {getLogUserName(log.user)}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-[#23471d] uppercase tracking-tight">
                                                        Section: {log.module || 'Event Schedule'}
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    {splitLogDetails(getEventLogDetails(log)).map((part, detailIdx) => (
                                                        <p key={detailIdx} className="text-[12px] font-semibold text-slate-800 leading-snug">
                                                            {detailIdx === 0 ? 'Details: ' : ''}{part}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 whitespace-nowrap shrink-0">
                                                <Clock size={11} /> When: {formatLogTime(log.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {viewEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-2xl bg-white border-2 border-gray-200 shadow-2xl rounded-[2px] overflow-hidden">
                        <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                            <h3 className="text-white text-sm font-black uppercase tracking-tight">{viewEvent.name}</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => startEditEvent(viewEvent)}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black uppercase tracking-tight text-white/90 hover:text-white hover:bg-white/10 rounded-[2px] border border-white/20"
                                    title="Edit"
                                >
                                    <Edit size={13} /> Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewEvent(null)}
                                    className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-[2px]"
                                    title="Close"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Venue / Dates</p>
                                <div className="grid grid-cols-[18px_1fr] gap-2">
                                    <MapPin size={13} className="mt-0.5 text-[#23471d]" />
                                    <div>
                                        <div className="text-[12px] font-bold text-slate-800 uppercase leading-snug">
                                            <div>{formatVenueParts(viewEvent.location).address}</div>
                                            {formatVenueParts(viewEvent.location).cityLine && (
                                                <div>{formatVenueParts(viewEvent.location).cityLine}</div>
                                            )}
                                        </div>
                                        <div className="mt-2 text-[12px] font-black text-black uppercase leading-5">
                                            
                                            <span>{formatEventDisplayDate(viewEvent.startDate)} <span className="text-[10px] opacity-50">TO</span> <span>{formatEventDisplayDate(viewEvent.endDate)}</span></span>
                                    
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Description</p>
                                <p className="text-[12px] font-semibold text-slate-800 leading-relaxed whitespace-pre-wrap">
                                    {viewEvent.description || '—'}
                                </p>
                            </div>
                            <div>
                                <div className="flex items-center justify-between gap-3 mb-2">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Early Bird Discount</p>
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] border ${viewEvent.earlyBirdDiscountActive === false ? 'text-red-700 bg-red-50 border-red-100' : 'text-[#23471d] bg-green-50 border-green-100'}`}>
                                        {viewEvent.earlyBirdDiscountActive === false ? 'Inactive' : 'Active'}
                                    </span>
                                </div>
                                <div className="border border-slate-200 rounded-[2px] p-3 bg-slate-50 space-y-2">
                                    {viewEvent.earlyBirdDiscountActive === false ? (
                                        <p className="text-[10px] font-semibold text-slate-700 leading-tight">Early Bird Discount inactive hai.</p>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <div className="border border-slate-200 rounded-[2px] p-2 bg-white">
                                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{Number(viewEvent.earlyBirdDiscountPercent ?? 10)}% Discount on Basic Price</p>
                                                    <p className="text-[10px] font-semibold text-slate-700 leading-tight mt-1">Applicable on both Full Payment & Installment Plans.</p>
                                                </div>
                                                <div className="border border-slate-200 rounded-[2px] p-2 bg-white">
                                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Validity</p>
                                                    <p className="text-[10px] font-semibold text-slate-700 leading-tight mt-1">Available for bookings confirmed {Number(viewEvent.earlyBirdValidityDays ?? 60)} days or more before the event date.</p>
                                                </div>
                                            </div>
                                            <p className="text-[10px] font-semibold text-slate-700 leading-tight">
                                                {viewEvent.earlyBirdExclusionNote || DEFAULT_EARLY_BIRD_NOTE}
                                            </p>
                                            <p className="text-[10px] font-semibold text-slate-600 italic leading-tight">Taxes and other applicable charges will be extra.</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Full Payment Plan</p>
                                <div className="border border-slate-200 rounded-[2px] p-3 bg-slate-50 space-y-2">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-tight">{getEventPlan(viewEvent, 'full').label || 'Full Payment'}</p>
                                            <p className="text-[10px] font-semibold text-slate-700 leading-tight mt-1">Payable at the time of booking.</p>
                                        </div>
                                        <span className="shrink-0 text-[10px] font-black text-[#23471d] bg-white border border-[#23471d]/20 px-1.5 py-0.5 rounded-[2px] leading-tight">
                                            {Number(getEventPlan(viewEvent, 'full').percentage ?? 100)}%
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div className="border border-slate-200 rounded-[2px] p-2 bg-white">
                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{Number(getEventPlan(viewEvent, 'full').discountPercent ?? 5)}% Discount</p>
                                            <p className="text-[10px] font-semibold text-slate-700 leading-tight mt-1">Applicable on the Basic Price for full payment.</p>
                                        </div>
                                        <div className="border border-slate-200 rounded-[2px] p-2 bg-white">
                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Validity</p>
                                            <p className="text-[10px] font-semibold text-slate-700 leading-tight mt-1">Available only up to {Number(getEventPlan(viewEvent, 'full').discountDaysBeforeEvent ?? 30)} days before the event date.</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-semibold text-slate-600 italic leading-tight">Taxes and other applicable charges will be extra.</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Installment Payment Plan</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {normalizePaymentPlans(viewEvent.paymentPlans).filter((plan) => plan.id !== 'full').map((plan, idx) => (
                                        <div key={plan.id || idx} className="border border-slate-200 rounded-[2px] p-2.5 bg-slate-50">
                                            <div className="flex items-start justify-between gap-1.5 mb-1">
                                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-tight whitespace-nowrap">
                                                    {plan.label || `Payment Step ${idx + 1}`}
                                                </p>
                                                <span className="shrink-0 text-[10px] font-black text-[#23471d] bg-white border border-[#23471d]/20 px-1.5 py-0.5 rounded-[2px] leading-tight">
                                                    {Number(plan.percentage || 0)}%
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-semibold text-slate-700 leading-tight">
                                                {Number(plan.dueDaysBeforeEvent || 0) <= 0
                                                    ? 'Payable at the time of booking.'
                                                    : `Payable ${Number(plan.dueDaysBeforeEvent || 0)} days before the event.`}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-2 border border-slate-200 rounded-[2px] p-2.5 bg-white">
                                    <div className="flex items-center justify-between gap-3 mb-1.5">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                                            Automated Payment Reminders
                                        </p>
                                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] border ${viewEvent.paymentRemindersActive === false ? 'text-red-700 bg-red-50 border-red-100' : 'text-blue-700 bg-blue-50 border-blue-100'}`}>
                                            {viewEvent.paymentRemindersActive === false ? 'Inactive' : 'Active'}
                                        </span>
                                    </div>
                                    {viewEvent.paymentRemindersActive === false ? (
                                        <p className="text-[10px] font-semibold text-slate-700 leading-tight">Payment reminders inactive hai.</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {normalizeReminderDays(viewEvent.paymentReminderDays, viewEvent.paymentReminderConfigVersion).map((days, idx) => (
                                                <div key={`payment-reminder-${idx}`} className="flex items-center justify-between gap-3 text-[10px] leading-tight">
                                                    <span className="font-black text-slate-800 uppercase tracking-tight whitespace-nowrap">
                                                        {idx === 0 ? '1st Reminder' : idx === 1 ? '2nd Reminder' : 'Final Reminder'}
                                                    </span>
                                                    <span className="font-semibold text-slate-700 text-right">
                                                        {Number(days) <= 0 ? 'On the due date' : `${days} days before due date`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 border border-slate-200 rounded-[2px] p-2 bg-slate-50">
                                    <p className="text-[11px] font-bold text-slate-800 leading-tight">
                                        Timely payment is required to keep the booking confirmed.
                                    </p>
                                </div>
                            </div>

                          
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageEvents;
