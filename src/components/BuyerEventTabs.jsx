import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents } from '../features/crmEvent/crmEventSlice';
import { shortEventLabel } from '../lib/visitorEventScope';

// Active CrmEvents, newest first — shared by the buyer pages that offer an event choice.
export const useActiveEvents = () => {
    const dispatch = useDispatch();
    const crmEvents = useSelector((state) => state.crmEvents?.events);

    useEffect(() => {
        dispatch(fetchEvents());
    }, [dispatch]);

    return (crmEvents || [])
        .filter((ev) => ev.event_name || ev.event_fullName)
        .filter((ev) => !ev.event_status || String(ev.event_status).toLowerCase() === 'active')
        .slice()
        .sort((a, b) => new Date(b.event_fromDate || 0) - new Date(a.event_fromDate || 0));
};

// Tab bar for picking an event. `eventId` '' = the default (all-events) entry.
const BuyerEventTabs = ({ eventId, onChange }) => {
    const events = useActiveEvents();
    const tabs = [{ _id: '', label: 'Default (All Events)' }, ...events.map((ev) => ({ _id: ev._id, label: shortEventLabel(ev) }))];

    return (
        <div className="px-6 pt-3 flex flex-wrap items-center gap-2 bg-white border-b border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">Event</span>
            {tabs.map((t) => (
                <button
                    key={t._id || 'default'}
                    onClick={() => onChange(t._id)}
                    className={`mb-3 px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider border transition-colors ${eventId === t._id ? 'bg-[#23471d] text-white border-[#23471d]' : 'bg-white text-slate-600 border-slate-300 hover:border-[#23471d]'}`}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );
};

// Event picker for the "add buyer" forms. `locked` pins it (event-scoped routes).
export const BuyerEventSelect = ({
    eventId,
    onChange,
    locked = false,
    defaultLabel = 'Default (IHWE 2026)',
    hint = 'Buyer is registered under this event and uses its form config.',
}) => {
    const events = useActiveEvents();

    return (
        <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-slate-200">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Event</label>
            <select
                value={eventId}
                disabled={locked}
                onChange={(e) => onChange(e.target.value)}
                className="min-w-[220px] rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-[#23471d] focus:outline-none disabled:bg-slate-50"
            >
                <option value="">{defaultLabel}</option>
                {events.map((ev) => (
                    <option key={ev._id} value={ev._id}>{shortEventLabel(ev)}</option>
                ))}
            </select>
            <span className="text-[10px] text-slate-400">{hint}</span>
        </div>
    );
};

export default BuyerEventTabs;
