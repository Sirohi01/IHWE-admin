import { Link, useNavigate } from "react-router-dom";

// Phone icon SVG
const PhoneIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

// WhatsApp icon SVG
const WhatsAppIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

// Calendar icon SVG
const CalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default function FollowupsTable({ followupsList }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-2.5 shadow-sm lg:col-span-6 col-span-1">
      {/* Header */}
      <div className="flex justify-between items-center mb-2 flex-shrink-0">
        <h3 className="text-base font-bold text-slate-800">Today's Follow-ups</h3>
        <Link to="/ihweClientData2026/warmClientList" className="text-sm font-semibold text-blue-500 hover:underline">
          View All
        </Link>
      </div>

      <div className="overflow-x-auto -mx-1 px-1">
        <div className="overflow-y-auto pr-1" style={{ maxHeight: '140px', scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-slate-100">
                <th className="pb-1.5 text-[12px] font-semibold text-slate-500">Client Name</th>
                <th className="pb-1.5 text-[12px] font-semibold text-slate-500">Company</th>
                <th className="pb-1.5 text-[12px] font-semibold text-slate-500">Time</th>
                <th className="pb-1.5 text-[12px] font-semibold text-slate-500">Priority</th>
                <th className="pb-1.5 text-[12px] font-semibold text-slate-500">Last Conversation</th>
                <th className="pb-1.5 text-[12px] font-semibold text-slate-500 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {followupsList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-slate-400 italic text-sm">
                    No scheduled follow-ups for today
                  </td>
                </tr>
              ) : (
                followupsList.map((item, i) => (
                  <tr
                    key={i}
                    onClick={() => navigate(`/client-overview/${item.id}`)}
                    className="border-b border-slate-50 hover:bg-slate-50/60 transition cursor-pointer"
                  >
                    {/* Client Name */}
                    <td className="py-1.5 pr-3">
                      <span className="text-[13px] font-semibold text-slate-500">{item.name}</span>
                    </td>

                    {/* Company */}
                    <td className="py-1.5 pr-3">
                      <span className="text-[13px] text-slate-500">{item.company}</span>
                    </td>

                    {/* Time */}
                    <td className="py-1.5 pr-3">
                      <span className="text-[13px] text-slate-700">{item.time}</span>
                    </td>

                    {/* Priority badge */}
                    <td className="py-1.5 pr-3">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${item.priorityColor}`}>
                        {item.priority}
                      </span>
                    </td>

                    {/* Last Conversation */}
                    <td className="py-1.5 pr-3">
                      <p className="text-[12px] text-slate-700 leading-snug">{item.lastConv}</p>
                      {item.convTime && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.convTime}</p>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-1.5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Call */}
                        <a
                          href={`tel:${item.phone}`}
                          className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition"
                          title="Call"
                        >
                          <PhoneIcon />
                        </a>
                        {/* WhatsApp */}
                        <a
                          href={`https://wa.me/${item.phone?.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition"
                          title="WhatsApp"
                        >
                          <WhatsAppIcon />
                        </a>
                        {/* Calendar / Reminder */}
                        <button
                          onClick={() => navigate(`/client-overview/${item.id}`)}
                          className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition"
                          title="View"
                        >
                          <CalIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

