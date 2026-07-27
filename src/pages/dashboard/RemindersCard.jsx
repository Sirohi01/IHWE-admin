export default function RemindersCard({ userLeads }) {
  const upcoming = userLeads.filter(c => c.reminder && new Date(c.reminder) > new Date()).slice(0, 3);

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-2 lg:col-span-3 col-span-1 flex flex-col justify-start" style={{ boxShadow: 'rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em', fontFamily: 'Inter, sans-serif' }}>
      <div className="flex justify-between items-center -mx-2 -mt-2 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Reminders</h3>
        <span className="text-[9px] font-bold uppercase text-emerald-600">To-Do</span>
      </div>

      <div className="space-y-1.5 flex-1 overflow-y-auto pr-1" style={{ maxHeight: '85px', scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
        {upcoming.length > 0 ? (
          upcoming.map((item, i) => (
            <div key={i} className="flex gap-2.5 text-xs">
              <input type="checkbox" className="accent-[#08775e] mt-0.5" />
              <div>
                <p className="font-bold text-[11px] text-slate-800 leading-tight">Follow up with {item.companyName}</p>
                <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wide block mt-0.5">
                  High Priority • {new Date(item.reminder).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2.5 text-xs">
              <input type="checkbox" defaultChecked className="accent-[#08775e] mt-0.5" />
              <div>
                <p className="font-bold text-[11px] text-slate-400 line-through leading-tight">All daily followups complete</p>
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wide block mt-0.5">Completed</span>
              </div>
            </div>
            <div className="flex gap-2.5 text-xs">
              <input type="checkbox" className="accent-[#08775e] mt-0.5" />
              <div>
                <p className="font-bold text-[11px] text-slate-800 leading-tight">Update monthly performance report</p>
                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wide block mt-0.5">
                  Medium Priority • Tomorrow
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

