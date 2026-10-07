// <input type="datetime-local"> gives a wall-clock string like "2026-10-07T15:00" with no timezone.
// Sent as-is, a server running in UTC reads it as 15:00 UTC, which then shows 5:30 hours late
// for IST users (3:00 PM becomes 8:30 PM). Convert it to a real instant (ISO with Z) before saving.
export const toIsoDateTime = (value) => {
  if (!value) return value;
  const text = String(value);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(text) || /(Z|[+-]\d{2}:?\d{2})$/.test(text)) return value;
  const d = new Date(text); // no zone in the string -> read as the user's local time
  return isNaN(d) ? value : d.toISOString();
};
