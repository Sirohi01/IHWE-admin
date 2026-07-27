import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CalendarX2 } from "lucide-react";
import { fetchEvents } from "../features/crmEvent/crmEventSlice";
import EventContext from "../context/EventContextObject";

// Pins every `useEventContext()` consumer inside `children` to the CrmEvent
// named by the `:eventId` route param (Event Configuration registry —
// /ihweClientData2026/AddEvent) instead of the globally-selected Navbar
// event. This lets the same list pages (New Leads, Hot Leads, ...) be reused
// for ANY event the admin creates — the sidebar builds one dropdown per
// CrmEvent, each pointing at /crm-event/:eventId/... routes wrapped in this.
const CrmEventScopedRoute = ({ children }) => {
  const { eventId } = useParams();
  const dispatch = useDispatch();
  const { events, loading } = useSelector((state) => state.crmEvents || {});

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const matchedEvent = (events || []).find((e) => e._id === eventId) || null;

  if (loading && (!events || events.length === 0)) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center text-slate-400 text-sm">
        Loading event...
      </div>
    );
  }

  if (!matchedEvent) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
        <CalendarX2 className="w-10 h-10 text-slate-300" />
        <p className="text-slate-600 font-semibold">This event couldn't be found.</p>
        <p className="text-slate-400 text-sm max-w-sm">
          It may have been deleted from Event Configuration. Pick another event from the sidebar.
        </p>
        <Link
          to="/ihweClientData2026/AddEvent"
          className="mt-2 px-4 py-2 bg-[#23471d] hover:bg-[#1a3516] text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
        >
          Go to Event Configuration
        </Link>
      </div>
    );
  }

  return (
    <EventContext.Provider
      value={{
        events,
        currentEventId: matchedEvent._id,
        setCurrentEventId: () => {}, // pinned — switching happens via the sidebar, not this scope
        currentEvent: matchedEvent,
        loading: false,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export default CrmEventScopedRoute;
