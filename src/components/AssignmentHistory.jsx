import { useEventContext } from "../context/EventContext";
import { toTitleCase } from "../utils/toTitleCase";

const fmt = (d) => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date(d));

// Who a lead was assigned to, for which event, when and by whom (newest first).
export default function AssignmentHistory({ history }) {
  const { events } = useEventContext();
  const rows = (Array.isArray(history) ? history : [])
    .filter((h) => h?.assignedAt)
    .sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt));
  if (rows.length === 0) return null;
  const eventName = (id) => (id ? events.find((e) => e._id === String(id))?.event_name || "Event" : "All events");
  return (
    <div className="mt-3">
      <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Assignment History</label>
      <div className="border border-slate-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
        <table className="w-full text-[10px]">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-2 py-1 text-left font-semibold">Assigned To</th>
              <th className="px-2 py-1 text-left font-semibold">Event</th>
              <th className="px-2 py-1 text-left font-semibold">Date</th>
              <th className="px-2 py-1 text-left font-semibold">By</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((h, i) => (
              <tr key={h._id || i} className="border-t border-slate-100 text-slate-800">
                <td className="px-2 py-1 font-bold">{h.forwardTo ? toTitleCase(h.forwardTo) : <span className="text-slate-400 font-medium">Unassigned</span>}</td>
                <td className="px-2 py-1">{eventName(h.eventId)}</td>
                <td className="px-2 py-1 whitespace-nowrap">{fmt(h.assignedAt)}</td>
                <td className="px-2 py-1">{h.assignedBy ? toTitleCase(h.assignedBy) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
