import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  RefreshCw,
  ScanLine,
  Search,
  Send,
} from "lucide-react";
import BaseLeadPage from "../layout/BaseLeadPage";
import api from "../lib/api";

const statusStyle = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  disputed: "border-rose-200 bg-rose-50 text-rose-700",
};

const statusLabel = status =>
  status === "disputed" ? "Issue reported" : status || "Pending";

const formatTime = value => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function StatCard({ icon, value, label, detail, colorClass, backgroundClass }) {
  return (
    <div className={`border border-slate-200 bg-gradient-to-br from-white ${backgroundClass} p-4 rounded-2xl shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px]`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <span className="block text-xl font-extrabold leading-none text-slate-900">{value}</span>
          <span className="block mt-1 text-[9px] font-extrabold leading-tight text-slate-700">{label}</span>
        </div>
      </div>
      <div className="text-center text-[10px] font-bold text-slate-500">{detail}</div>
    </div>
  );
}

export default function PassConfirmationReport() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("all");
  const [passType, setPassType] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/attendance/confirmation-report");
      setRows(response.data?.data || []);
    } catch (requestError) {
      setRows([]);
      setError(requestError?.response?.data?.message || requestError?.message || "Could not load confirmation report.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const passTypes = useMemo(
    () => [...new Set(rows.map(row => row.passType).filter(Boolean))].sort(),
    [rows]
  );

  const counts = useMemo(() => ({
    total: rows.length,
    pending: rows.filter(row => row.acknowledgementStatus === "pending").length,
    confirmed: rows.filter(row => row.acknowledgementStatus === "confirmed").length,
    disputed: rows.filter(row => row.acknowledgementStatus === "disputed").length,
    overdue: rows.filter(row => row.acknowledgementStatus === "pending" && row.overdue).length,
  }), [rows]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(row => {
      const matchesStatus = status === "all" || row.acknowledgementStatus === status;
      const matchesPass = passType === "all" || row.passType === passType;
      const searchable = [
        row.company,
        row.name,
        row.registrationId,
        row.markedByName,
        row.gate,
        row.passType,
      ].filter(Boolean).join(" ").toLowerCase();
      return matchesStatus && matchesPass && (!term || searchable.includes(term));
    });
  }, [passType, rows, search, status]);

  useEffect(() => {
    setPage(1);
  }, [limit, passType, search, status]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / limit));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedRows = useMemo(
    () => filteredRows.slice((page - 1) * limit, page * limit),
    [filteredRows, limit, page]
  );

  const allVisibleSelected = paginatedRows.length > 0
    && paginatedRows.every(row => selected.includes(row.rowId));

  const toggleAll = event => {
    const ids = paginatedRows.map(row => row.rowId);
    setSelected(current => event.target.checked
      ? [...new Set([...current, ...ids])]
      : current.filter(id => !ids.includes(id)));
  };

  const toggleRow = rowId => {
    setSelected(current => current.includes(rowId)
      ? current.filter(id => id !== rowId)
      : [...current, rowId]);
  };

  const remind = async row => {
    try {
      await api.post(`/api/attendance/confirmation-report/${row.rowId}/remind`);
      await load();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Could not send reminder.");
    }
  };

  const manualConfirm = async row => {
    const reason = window.prompt("Manual confirmation reason");
    if (!reason?.trim()) return;
    try {
      await api.post(`/api/attendance/confirmation-report/${row.rowId}/manual-confirm`, { reason: reason.trim() });
      await load();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Could not confirm this activity.");
    }
  };

  const viewDetails = row => {
    window.alert([
      `${row.passType || "Pass"} activity`,
      `Company: ${row.company || "-"}`,
      `Holder: ${row.name || "-"}`,
      `Registration: ${row.registrationId || "-"}`,
      `Quantity: ${row.deliveredQuantity || 1}`,
      `Staff: ${row.markedByName || "-"}`,
      `Gate: ${row.gate || "Not specified"}`,
      `Scanned: ${formatTime(row.markedAt)}`,
      `Status: ${statusLabel(row.acknowledgementStatus)}`,
      `Accepted: ${formatTime(row.acknowledgedAt)}`,
      row.acknowledgementNote ? `Note: ${row.acknowledgementNote}` : "",
    ].filter(Boolean).join("\n"));
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setPassType("all");
    setPage(1);
  };

  const statCards = (
    <>
      <StatCard icon={<ScanLine size={20} />} value={counts.total} label="TOTAL SCANS" detail="All pass activities" colorClass="bg-blue-100 text-blue-600" backgroundClass="to-blue-50" />
      <StatCard icon={<Clock3 size={20} />} value={counts.pending} label="AWAITING EXHIBITOR" detail="Confirmation pending" colorClass="bg-amber-100 text-amber-600" backgroundClass="to-amber-50" />
      <StatCard icon={<CheckCircle2 size={20} />} value={counts.confirmed} label="CONFIRMED" detail="Accepted by exhibitor" colorClass="bg-emerald-100 text-emerald-600" backgroundClass="to-emerald-50" />
      <StatCard icon={<AlertCircle size={20} />} value={counts.disputed} label="ISSUES REPORTED" detail="Requires attention" colorClass="bg-rose-100 text-rose-600" backgroundClass="to-rose-50" />
      <StatCard icon={<Clock3 size={20} />} value={counts.overdue} label="OVERDUE" detail="Pending beyond limit" colorClass="bg-violet-100 text-violet-600" backgroundClass="to-violet-50" />
    </>
  );

  const filters = (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search company, holder, staff..."
          className="w-64 pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
        />
      </div>
      <select value={status} onChange={event => setStatus(event.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:border-emerald-500">
        <option value="all">All Status</option>
        <option value="pending">Awaiting Exhibitor</option>
        <option value="confirmed">Confirmed</option>
        <option value="disputed">Issue Reported</option>
      </select>
      <select value={passType} onChange={event => setPassType(event.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:border-emerald-500 capitalize">
        <option value="all">All Pass Types</option>
        {passTypes.map(item => <option key={item} value={item}>{item}</option>)}
      </select>
    </>
  );

  const tableHeaders = (
    <>
      <th className="px-2 py-2 font-medium">Pass / Company</th>
      <th className="px-2 py-2 font-medium text-center">Quantity</th>
      <th className="px-2 py-2 font-medium">Staff</th>
      <th className="px-2 py-2 font-medium">Gate</th>
      <th className="px-2 py-2 font-medium">Scanned</th>
      <th className="px-2 py-2 font-medium text-center">Status</th>
      <th className="px-2 py-2 font-medium">Accepted</th>
      <th className="px-2 py-2 font-medium text-center">Actions</th>
    </>
  );

  const tableBody = loading ? (
    [...Array(8)].map((_, index) => (
      <tr key={index} className="animate-pulse border-b border-slate-100">
        <td className="px-2 py-3 text-center"><div className="w-3 h-3 bg-slate-200 rounded-sm mx-auto" /></td>
        {[120, 40, 90, 70, 110, 80, 110, 160].map((width, cell) => (
          <td key={cell} className="px-2 py-3"><div className="h-3 bg-slate-200 rounded mx-auto" style={{ width }} /></td>
        ))}
      </tr>
    ))
  ) : paginatedRows.length ? paginatedRows.map(row => (
    <tr key={row.rowId} className="border-b border-slate-100 bg-white hover:bg-slate-50/80">
      <td className="px-2 py-3 text-center">
        <input type="checkbox" className="w-3 h-3 accent-blue-500 cursor-pointer" checked={selected.includes(row.rowId)} onChange={() => toggleRow(row.rowId)} />
      </td>
      <td className="px-2 py-3">
        <div className="font-bold capitalize text-[#093C5D]">{row.passType || "Pass"}</div>
        <div className="mt-1 max-w-[210px] truncate text-[9px] font-semibold text-slate-600">{row.company || row.name || row.registrationId || "-"}</div>
        {row.name && row.company && <div className="text-[9px] text-slate-400">{row.name}</div>}
      </td>
      <td className="px-2 py-3 text-center font-extrabold text-[#016B61]">{row.deliveredQuantity || 1}</td>
      <td className="px-2 py-3 font-bold text-[#15173D]">{row.markedByName || "-"}</td>
      <td className="px-2 py-3 text-slate-600">{row.gate || "Not specified"}</td>
      <td className="px-2 py-3 whitespace-nowrap font-semibold text-slate-700">
        {formatTime(row.markedAt)}
        {row.overdue && <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-rose-600"><Clock3 size={10} /> Overdue</div>}
      </td>
      <td className="px-2 py-3 text-center">
        <span className={`inline-flex rounded-full border px-2 py-1 text-[9px] font-extrabold capitalize ${statusStyle[row.acknowledgementStatus] || statusStyle.pending}`}>
          {statusLabel(row.acknowledgementStatus)}
        </span>
        {row.acknowledgementNote && <div className="mt-1 max-w-[150px] truncate text-[9px] text-slate-500">{row.acknowledgementNote}</div>}
      </td>
      <td className="px-2 py-3 whitespace-nowrap text-slate-600">{formatTime(row.acknowledgedAt)}</td>
      <td className="px-2 py-3">
        <div className="flex items-center justify-center gap-1">
          <button onClick={() => viewDetails(row)} className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100" title="View details"><Eye size={13} /></button>
          {row.acknowledgementStatus === "pending" && (
            <>
              <button onClick={() => remind(row)} className="p-1.5 rounded border border-blue-200 text-blue-600 hover:bg-blue-50" title="Send reminder"><Send size={13} /></button>
              <button onClick={() => manualConfirm(row)} className="p-1.5 rounded border border-emerald-200 text-emerald-600 hover:bg-emerald-50" title="Manual confirm"><CheckCircle2 size={13} /></button>
            </>
          )}
        </div>
      </td>
    </tr>
  )) : (
    <tr>
      <td colSpan={9} className="px-2 py-12 text-center font-medium text-slate-500">
        {error || "No confirmation records found."}
      </td>
    </tr>
  );

  const start = filteredRows.length ? (page - 1) * limit + 1 : 0;
  const end = Math.min(page * limit, filteredRows.length);
  const pagination = (
    <>
      <span>Showing {start}-{end} of {filteredRows.length}</span>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(1)} disabled={page === 1} className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 disabled:opacity-40"><ChevronFirst size={13} /></button>
        <button onClick={() => setPage(value => Math.max(1, value - 1))} disabled={page === 1} className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 disabled:opacity-40"><ChevronLeft size={13} /></button>
        {Array.from({ length: totalPages }, (_, index) => index + 1)
          .filter(number => number === 1 || number === totalPages || Math.abs(number - page) <= 1)
          .map((number, index, displayed) => (
            <span key={number} className="flex items-center gap-1">
              {index > 0 && number - displayed[index - 1] > 1 && <span className="px-1">...</span>}
              <button onClick={() => setPage(number)} className={`w-7 h-7 rounded border font-bold ${page === number ? "border-[#016B61] bg-[#016B61] text-white" : "border-slate-200 bg-white"}`}>{number}</button>
            </span>
          ))}
        <button onClick={() => setPage(value => Math.min(totalPages, value + 1))} disabled={page === totalPages} className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 disabled:opacity-40"><ChevronRight size={13} /></button>
        <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 disabled:opacity-40"><ChevronLast size={13} /></button>
      </div>
      <div className="flex items-center gap-2">
        <span>Rows</span>
        <select value={limit} onChange={event => setLimit(Number(event.target.value))} className="rounded border border-slate-200 bg-white px-2 py-1">
          {[10, 20, 50].map(value => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>
    </>
  );

  return (
    <>
      {error && rows.length > 0 && (
        <div className="mx-8 mt-4 border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</div>
      )}
      <BaseLeadPage
        title="Pass Confirmation Report"
        subtitle="Staff scans, exhibitor acknowledgements and issue tracking"
        badgeCount={filteredRows.length}
        cardsInRow={5}
        headerActions={(
          <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50" title="Refresh report">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        )}
        statCards={statCards}
        filterBar={filters}
        tableHeaders={tableHeaders}
        tableBody={tableBody}
        pagination={pagination}
        onReset={resetFilters}
        isAllSelected={allVisibleSelected}
        onSelectAll={toggleAll}
      />
    </>
  );
}
