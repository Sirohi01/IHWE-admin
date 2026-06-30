import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  RefreshCw,
  Search,
  TicketCheck,
  Tickets,
  XCircle,
} from "lucide-react";
import api from "../lib/api";

const PASS_LABELS = {
  exhibitor: "Exhibitor Pass",
  vehicle: "Vehicle Pass",
  service: "Service Pass",
  visitor: "Visitor Pass",
  lunch: "Lunch",
  dinner: "Dinner",
  water: "Water Bottle",
};

const STATUS_STYLES = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const getDetails = (item) => {
  if (item.passType === "vehicle") {
    return (item.vehicles || [])
      .map((vehicle) => `${vehicle.vehicleNumber || "Number pending"} · ${vehicle.vehicleType || "Vehicle"}`)
      .join(", ");
  }

  const people = (item.personnel || [])
    .map((person) => `${person.name || "Unnamed"}${person.designation ? ` · ${person.designation}` : ""}`)
    .join(", ");

  return people || `${item.quantity || 0} ${PASS_LABELS[item.passType] || item.passType} requested`;
};

const getParticipationLabel = (participation) => {
  if (!participation || typeof participation !== "object") {
    return participation || "Exhibitor";
  }

  const rawStallNumber = participation.stallFor || participation.stallNo || "";
  const isDatabaseId = /^[a-f\d]{24}$/i.test(String(rawStallNumber));
  const stallName = rawStallNumber && !isDatabaseId
    ? `Stall ${rawStallNumber}`
    : participation.stallType || participation.stallCategory || "Exhibitor";
  const stallSize = participation.stallSize ? `${participation.stallSize} sqm` : "";

  return [stallName, stallSize].filter(Boolean).join(" · ");
};

export default function MobilePassRequests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/exhibitor-pass-requests/admin/all");
      setItems(res.data.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load pass requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter, limit]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    setError("");
    try {
      const res = await api.put(`/api/exhibitor-pass-requests/admin/${id}/status`, { status });
      setItems((current) => current.map((item) => (item._id === id ? res.data.data : item)));
    } catch (requestError) {
      setError(requestError.response?.data?.message || `Unable to ${status} this request.`);
    } finally {
      setUpdatingId("");
    }
  };

  const stats = useMemo(() => ({
    total: items.length,
    pending: items.filter((item) => item.status === "pending").length,
    approved: items.filter((item) => item.status === "approved").length,
    paid: items.filter((item) => item.paymentStatus === "paid").length,
  }), [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const exhibitor = item.exhibitorId || {};
      const searchable = [
        exhibitor.exhibitorName,
        exhibitor.registrationId,
        getParticipationLabel(exhibitor.participation),
        item.passType,
        getDetails(item),
      ].filter(Boolean).join(" ").toLowerCase();

      return (!query || searchable.includes(query))
        && (statusFilter === "all" || item.status === statusFilter)
        && (typeFilter === "all" || item.passType === typeFilter);
    });
  }, [items, search, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / limit));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * limit;
  const visibleItems = filteredItems.slice(pageStart, pageStart + limit);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
    const pages = [1];
    if (safePage > 3) pages.push("start-gap");
    for (let number = Math.max(2, safePage - 1); number <= Math.min(totalPages - 1, safePage + 1); number += 1) {
      pages.push(number);
    }
    if (safePage < totalPages - 2) pages.push("end-gap");
    pages.push(totalPages);
    return pages;
  }, [safePage, totalPages]);

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#016B61] text-white">
              <Tickets size={17} />
            </div>
            <h1 className="text-xl font-black text-[#15173D]">Mobile Pass Requests</h1>
            <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-[#016B61]">
              {stats.total}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Review exhibitor requests and track approval and payment status.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[
          { label: "Total Requests", value: stats.total, icon: Tickets, tone: "text-[#15173D] bg-indigo-50" },
          { label: "Pending Review", value: stats.pending, icon: Clock3, tone: "text-amber-700 bg-amber-50" },
          { label: "Approved", value: stats.approved, icon: TicketCheck, tone: "text-emerald-700 bg-emerald-50" },
          { label: "Paid Requests", value: stats.paid, icon: CircleDollarSign, tone: "text-blue-700 bg-blue-50" },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}><Icon size={16} /></div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
              <p className="text-lg font-black leading-tight text-[#15173D]">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 p-3 md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search exhibitor, registration or details..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-medium outline-none transition focus:border-[#016B61] focus:bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 outline-none"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 outline-none"
          >
            <option value="all">All pass types</option>
            {Object.entries(PASS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          {(search || statusFilter !== "all" || typeFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setTypeFilter("all");
              }}
              className="h-9 px-2 text-xs font-bold text-rose-600"
            >
              Clear
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-[#f8fafc]">
                {["Exhibitor", "Request", "Qty", "Person / Vehicle Details", "Payment", "Requested On", "Status", "Actions"].map((heading) => (
                  <th key={heading} className={`px-3 py-2.5 text-[10px] font-black uppercase text-slate-500 ${heading === "Actions" ? "text-right" : ""}`}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-14 text-center text-xs font-semibold text-slate-400">Loading pass requests...</td></tr>
              ) : visibleItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <Tickets className="mx-auto mb-2 text-slate-300" size={28} />
                    <p className="text-sm font-bold text-slate-600">No pass requests found</p>
                    <p className="text-xs text-slate-400">Try changing the current search or filters.</p>
                  </td>
                </tr>
              ) : visibleItems.map((item) => (
                <tr key={item._id} className="transition hover:bg-slate-50/70">
                  <td className="px-3 py-3">
                    <p className="max-w-[190px] truncate text-[12px] font-normal text-slate-800">{item.exhibitorId?.exhibitorName || "Unknown Exhibitor"}</p>
                    <p className="mt-0.5 text-[10px] font-semibold text-slate-400">{item.exhibitorId?.registrationId || "No registration ID"}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-[10px] font-bold text-slate-700">{PASS_LABELS[item.passType] || item.passType}</p>
                    <p className="mt-0.5 text-[10px] capitalize text-slate-400">
                      {getParticipationLabel(item.exhibitorId?.participation)}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex min-w-7 justify-center rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-[#15173D]">{item.quantity}</span>
                  </td>
                  <td className="max-w-[280px] px-3 py-3">
                    <p className="line-clamp-2 text-[11px] font-medium leading-4 text-slate-600" title={getDetails(item)}>{getDetails(item)}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-[11px] font-medium capitalize text-slate-700">{item.paymentStatus || "free"}</p>
                    <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                      {Number(item.totalAmount || 0) > 0 ? `₹${Number(item.totalAmount).toLocaleString("en-IN")}` : "No charge"}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-[10px] font-medium text-slate-500">{formatDate(item.createdAt)}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-md border px-2 py-1 text-[9px] font-black uppercase ${STATUS_STYLES[item.status] || STATUS_STYLES.pending}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {item.status === "pending" ? (
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          disabled={updatingId === item._id}
                          onClick={() => updateStatus(item._id, "approved")}
                          title="Approve request"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                        >
                          <CheckCircle2 size={15} />
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === item._id}
                          onClick={() => updateStatus(item._id, "rejected")}
                          title="Reject request"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                        >
                          <XCircle size={15} />
                        </button>
                      </div>
                    ) : (
                      <p className="text-right text-[10px] font-bold text-slate-400">Reviewed</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-3 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
            <span>Showing</span>
            <span className="rounded-md border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 font-black text-[#016B61]">
              {filteredItems.length === 0 ? 0 : pageStart + 1}-{Math.min(pageStart + limit, filteredItems.length)}
            </span>
            <span>of</span>
            <span className="font-black text-[#15173D]">{filteredItems.length}</span>
            <span>requests</span>
          </div>

          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setPage(1)} disabled={safePage === 1} className="h-7 min-w-7 rounded-lg border border-slate-200 px-1.5 text-[10px] font-bold text-slate-600 disabled:opacity-30">First</button>
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={safePage === 1} className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30"><ChevronLeft size={13} /></button>
            {pageNumbers.map((number) => typeof number === "string" ? (
              <span key={number} className="flex h-7 w-7 items-center justify-center text-xs text-slate-400">...</span>
            ) : (
              <button
                type="button"
                key={number}
                onClick={() => setPage(number)}
                className={`h-7 w-7 rounded-lg border text-[11px] font-black ${number === safePage ? "border-[#016B61] bg-[#016B61] text-white shadow-sm" : "border-slate-200 bg-white text-[#15173D]"}`}
              >
                {number}
              </button>
            ))}
            <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={safePage === totalPages} className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30"><ChevronRight size={13} /></button>
            <button type="button" onClick={() => setPage(totalPages)} disabled={safePage === totalPages} className="h-7 min-w-7 rounded-lg border border-slate-200 px-1.5 text-[10px] font-bold text-slate-600 disabled:opacity-30">Last</button>
          </div>

          <label className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
            Rows:
            <select value={limit} onChange={(event) => setLimit(Number(event.target.value))} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-[#15173D] outline-none">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
