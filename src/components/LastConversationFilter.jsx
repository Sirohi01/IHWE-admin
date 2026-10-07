// Date filter for the "Last Conversation" column on the lead tables.
// value is "" or a YYYY-MM-DD string.
export default function LastConversationFilter({ value, onChange, className }) {
  return (
    <input
      type="date"
      value={value}
      title="Last Conversation date"
      onChange={(e) => onChange(e.target.value)}
      className={className || "px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 shrink-0"}
    />
  );
}
