import LastConversationFilter from "./LastConversationFilter";

const inputCls = "w-[110px] shrink-0 py-1 px-1.5 bg-white border border-slate-200 rounded text-[9px] font-medium text-slate-800 focus:outline-none focus:border-emerald-500";

// Column filters are shown in the page's filter bar (next to the global filters) by BaseLeadPage.
// ColFilterCell with no children renders nothing (column without a filter).
export const ColFilterCell = ({ children }) => <>{children}</>;

export const ColFilterSelect = ({ value, onChange, options, placeholder = "All" }) => (
  <ColFilterCell>
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} cursor-pointer`}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  </ColFilterCell>
);

export const ColFilterText = ({ value, onChange, placeholder = "Filter..." }) => (
  <ColFilterCell>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
  </ColFilterCell>
);

// `label` is optional — only needed when a table has more than one date filter.
export const ColFilterDate = ({ value, onChange, label }) => (
  <ColFilterCell>
    <label className="flex items-center gap-1 shrink-0 text-[9px] font-semibold text-slate-600 whitespace-nowrap">
      {label}
      <LastConversationFilter value={value} onChange={onChange} className={inputCls} />
    </label>
  </ColFilterCell>
);
