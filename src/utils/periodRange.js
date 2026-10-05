// Mirrors ihwe/utils/periodRange.js — resolves a dashboard "Duration" value to [start, end).
export const getPeriodRange = (period, now = new Date()) => {
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const mondayOffset = (now.getDay() || 7) - 1;
  const quarterStart = Math.floor(m / 3) * 3;

  switch (period) {
    case "today":
      return { start: new Date(y, m, d), end: new Date(y, m, d + 1) };
    case "yesterday":
      return { start: new Date(y, m, d - 1), end: new Date(y, m, d) };
    case "this_week":
      return { start: new Date(y, m, d - mondayOffset), end: new Date(y, m, d - mondayOffset + 7) };
    case "last_week":
      return { start: new Date(y, m, d - mondayOffset - 7), end: new Date(y, m, d - mondayOffset) };
    case "last_month":
    case "previous_month":
      return { start: new Date(y, m - 1, 1), end: new Date(y, m, 1) };
    case "this_quarter":
      return { start: new Date(y, quarterStart, 1), end: new Date(y, quarterStart + 3, 1) };
    case "last_quarter":
      return { start: new Date(y, quarterStart - 3, 1), end: new Date(y, quarterStart, 1) };
    case "this_year":
      return { start: new Date(y, 0, 1), end: new Date(y + 1, 0, 1) };
    default:
      return { start: new Date(y, m, 1), end: new Date(y, m + 1, 1) };
  }
};
