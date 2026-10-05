import { toTitleCase } from "../utils/toTitleCase";

const TYPE_LABELS = {
  status: "Status Update",
  whatsapp: "WhatsApp",
  call: "Call",
  email: "Email",
  email_reply: "Email Reply",
  log: "Note",
};

// "Rohit · Call" — who handled the lead's last conversation, and how.
export default function LastConversationBy({ row }) {
  const lc = row?.lastConversation;
  const by = lc?.by || row?.updated_by || "";
  if (!by && !lc) return <span className="text-[9px] font-bold mt-0.5 text-slate-400">No conversation yet</span>;
  return (
    <span className="text-[9px] font-bold mt-0.5 whitespace-nowrap" style={{ color: "#0D530E" }}>
      {by ? toTitleCase(by) : "Unknown"}
      {lc?.type && <span className="text-slate-500 font-semibold"> · {TYPE_LABELS[lc.type] || toTitleCase(lc.type)}</span>}
    </span>
  );
}
