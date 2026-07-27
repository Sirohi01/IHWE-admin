import { useContext, useEffect, useState, useCallback } from "react";
import api from "../lib/api";
import EventContext from "./EventContextObject";

const STORAGE_KEY = "currentEventId";

// Global "which event am I working with" selection — persisted in sessionStorage
// so it survives reloads within the same browser session (same pattern as adminInfo/adminToken).
// Every list page (New Lead, Warm, Hot, Cold, Exhibitor List, Converted List, ...) should read
// currentEventId from here and pass it as a query param, instead of each page picking its own event.
export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [currentEventId, setCurrentEventIdState] = useState(() => sessionStorage.getItem(STORAGE_KEY) || "");
  const [loading, setLoading] = useState(true);

  const setCurrentEventId = useCallback((id) => {
    setCurrentEventIdState(id);
    if (id) sessionStorage.setItem(STORAGE_KEY, id);
    else sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.get("/api/events")
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
        setEvents(list);
        setCurrentEventIdState((prev) => {
          if (prev && list.some((e) => e._id === prev)) return prev;
          const fallback = (list.find((e) => e.status === "active") || list[0])?._id || "";
          if (fallback) sessionStorage.setItem(STORAGE_KEY, fallback);
          return fallback;
        });
      })
      .catch((err) => console.error("Error fetching events for EventContext:", err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const currentEvent = events.find((e) => e._id === currentEventId) || null;

  return (
    <EventContext.Provider value={{ events, currentEventId, setCurrentEventId, currentEvent, loading }}>
      {children}
    </EventContext.Provider>
  );
}

export const useEventContext = () => {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEventContext must be used within an EventProvider");
  return ctx;
};
