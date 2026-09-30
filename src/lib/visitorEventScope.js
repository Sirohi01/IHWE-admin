import { useContext, useEffect, useMemo, useState } from "react";
import api from "./api";
import EventContext from "../context/EventContextObject";

const norm = (v) => String(v ?? "").trim().toLowerCase();

// Names a visitor record can carry for its event. Visitors store the event
// label as a free-text string, in `eventName` and/or `registrationFor`.
const eventNames = (event) =>
  [event?.event_name, event?.event_fullName].map(norm).filter(Boolean);

export const visitorBelongsToEvent = (visitor, event) => {
  if (!event) return true;
  const names = eventNames(event);
  return [visitor?.eventName, visitor?.registrationFor]
    .map(norm)
    .some((n) => n && names.includes(n));
};

// Visitor reviews store the CrmEvent _id (falling back to a name) in `visitor_event`.
export const reviewBelongsToEvent = (review, event) => {
  if (!event) return true;
  const ref = norm(review?.visitor_event);
  return ref === norm(event._id) || eventNames(event).includes(ref);
};

// The CrmEvent pinned by <CrmEventScopedRoute>, or null on the un-scoped routes.
export const useScopedEvent = () => useContext(EventContext)?.currentEvent || null;

// Filters a visitor list down to the scoped event. Outside an event scope the
// list is returned untouched, so the legacy all-events routes keep working.
export const useEventScopedVisitors = (visitors) => {
  const event = useScopedEvent();
  return useMemo(
    () => (event ? (visitors || []).filter((v) => visitorBelongsToEvent(v, event)) : visitors || []),
    [visitors, event],
  );
};

// Display-only short name for an event ("Organic Expo 2026" -> "BOE 2026",
// "IHWE Expo 2026" -> "IHWE 2026"). Never used for matching, so stored
// visitor `eventName` values keep lining up with the CrmEvent records.
export const shortEventLabel = (event) =>
  String(event?.event_fullName || event?.event_name || "")
    .replace(/organic\s+expo/gi, "BOE")
    .replace(/ihwe\s+expo/gi, "IHWE");

// Name of the "Registration & Stall Event" (Event model) linked to the scoped
// CrmEvent via `registrationEventId`; falls back to the CrmEvent's own name
// when there is no link or it can't be loaded. Null outside an event scope.
export const useRegistrationEventName = () => {
  const event = useScopedEvent();
  const link = event?.registrationEventId;
  const linkId = link?._id || link || null;
  const populatedName = link?.name || "";
  const [fetched, setFetched] = useState({ id: null, name: "" });

  useEffect(() => {
    if (!linkId || populatedName) return;
    let cancelled = false;
    api
      .get(`/api/events/${linkId}`)
      .then((res) => {
        if (!cancelled) setFetched({ id: linkId, name: res.data?.data?.name || "" });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [linkId, populatedName]);

  if (!event) return null;
  return (
    populatedName ||
    (fetched.id === linkId ? fetched.name : "") ||
    event.event_fullName ||
    event.event_name
  );
};
