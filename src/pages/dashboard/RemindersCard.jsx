export default function RemindersCard({ userLeads }) {
  const upcoming = userLeads.filter(c => c.reminder && new Date(c.reminder) > new Date()).slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm lg:col-span-3 flex flex-col justify-start">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Reminders</h3>
        <span className="text-[10px] text-slate-400 font-bold uppercase">To-Do</span>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto" style={{ maxHeight: '140px' }}>
        {upcoming.length > 0 ? (
          upcoming.map((item, i) => (
            <div key={i} className="flex gap-2.5 text-xs">
              <input type="checkbox" className="accent-[#08775e] mt-0.5" />
              <div>
                <p className="font-bold text-slate-800 leading-tight">Follow up with {item.companyName}</p>
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
                <p className="font-bold text-slate-500 line-through leading-tight">All daily followups complete</p>
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wide block mt-0.5">Completed</span>
              </div>
            </div>
            <div className="flex gap-2.5 text-xs">
              <input type="checkbox" className="accent-[#08775e] mt-0.5" />
              <div>
                <p className="font-bold text-slate-800 leading-tight">Update monthly performance report</p>
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
