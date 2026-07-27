import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Filter,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import {
  fetchNextActions,
  createNextAction,
  updateNextAction,
  deleteNextAction,
} from "../../features/add_by_admin/nextAction/nextActionSlice";

const DEFAULT_ITEMS_PER_PAGE = 10;

const ACTION_TYPES = [
  "Call",
  "Email",
  "Proposal",
  "Meeting",
  "Follow Up",
  "Visit",
  "Quotation",
  "Document",
];

const APPLICABLE_OPTIONS = [
  "Exhibitor Lead",
  "Buyer Lead",
  "Sponsor Lead",
  "General Lead",
];

const ACTION_TYPE_STYLES = {
  Call: "bg-blue-50 text-blue-600",
  Email: "bg-emerald-50 text-emerald-600",
  Proposal: "bg-orange-50 text-orange-600",
  Meeting: "bg-violet-50 text-violet-600",
  "Follow Up": "bg-cyan-50 text-cyan-700",
  Visit: "bg-amber-50 text-amber-700",
  Quotation: "bg-pink-50 text-pink-600",
  Document: "bg-sky-50 text-sky-600",
};

const normaliseText = (value) => String(value ?? "").trim();

const getActionStatus = (item) =>
  normaliseText(item?.status || "inactive").toLowerCase() === "active"
    ? "active"
    : "inactive";

const getActionCode = (item) =>
  normaliseText(
    item?.action_code ||
    item?.code ||
    item?.next_action_code ||
    item?.short_code
  ) ||
  normaliseText(item?.name)
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 12) ||
  "—";

const getActionType = (item) =>
  normaliseText(
    item?.action_type ||
    item?.type ||
    item?.next_action_type ||
    item?.category
  ) || "Follow Up";

const getApplicableFor = (item) => {
  const value =
    item?.applicable_for ||
    item?.applicableFor ||
    item?.lead_types ||
    item?.leadTypes;

  if (Array.isArray(value)) return value.filter(Boolean);

  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return ["Exhibitor Lead", "Buyer Lead", "Sponsor Lead", "General Lead"];
};

const getFollowUpDays = (item) => {
  const value =
    item?.follow_up_days ??
    item?.followUpDays ??
    item?.days ??
    item?.followup_days ??
    1;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const getUpdatedBy = (item) =>
  normaliseText(
    item?.updated_by?.name ||
    item?.updated_by ||
    item?.updatedBy ||
    item?.created_by?.name ||
    item?.created_by
  ) || "Admin";

const getUpdatedAt = (item) =>
  item?.updatedAt ||
  item?.updated_at ||
  item?.createdAt ||
  item?.created_at ||
  null;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

const initialForm = {
  name: "",
  action_code: "",
  action_type: "Call",
  status: "active",
  follow_up_days: 1,
  applicable_for: ["Exhibitor Lead", "Buyer Lead"],
};

const AddNextAction = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const nextActionState = useSelector((state) => state.nextActions) || {};
  const nextActions = Array.isArray(nextActionState.nextActions)
    ? nextActionState.nextActions.filter(Boolean)
    : [];
  const isLoading = Boolean(nextActionState.loading);

  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [actionTypeFilter, setActionTypeFilter] = useState("All");
  const [applicableFilter, setApplicableFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

  useEffect(() => {
    dispatch(fetchNextActions());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filtered = useMemo(() => {
    const query = debouncedSearch.toLowerCase();

    return [...nextActions]
      .filter((item) => {
        const name = normaliseText(item?.name).toLowerCase();
        const code = getActionCode(item).toLowerCase();
        const status = getActionStatus(item);
        const actionType = getActionType(item);
        const applicableFor = getApplicableFor(item);

        const matchesSearch =
          !query || name.includes(query) || code.includes(query);

        const matchesStatus =
          statusFilter === "All" || status === statusFilter;

        const matchesActionType =
          actionTypeFilter === "All" || actionType === actionTypeFilter;

        const matchesApplicable =
          applicableFilter === "All" ||
          applicableFor.includes(applicableFilter);

        return (
          matchesSearch &&
          matchesStatus &&
          matchesActionType &&
          matchesApplicable
        );
      })
      .sort((a, b) => {
        const orderA = Number(a?.display_order) || 0;
        const orderB = Number(b?.display_order) || 0;
        if (orderA !== orderB) return orderA - orderB;
        return normaliseText(a?.name).localeCompare(normaliseText(b?.name));
      });
  }, [
    nextActions,
    debouncedSearch,
    statusFilter,
    actionTypeFilter,
    applicableFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / itemsPerPage)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const firstItemIndex = (currentPage - 1) * itemsPerPage;

  const paginated = filtered.slice(
    firstItemIndex,
    firstItemIndex + itemsPerPage
  );

  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) return [1, 2, 3, "...", totalPages];

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "... ",
      totalPages,
    ];
  }, [currentPage, totalPages]);

  const resetForm = () => {
    setIsEditing(null);
    setFormData(initialForm);
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    setIsEditing(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const startEdit = (id) => {
    const item = nextActions.find((action) => action?._id === id);
    if (!item) return;

    setIsEditing(id);
    setFormData({
      name: normaliseText(item?.name),
      action_code: getActionCode(item) === "—" ? "" : getActionCode(item),
      action_type: getActionType(item),
      status: getActionStatus(item),
      follow_up_days: getFollowUpDays(item),
      applicable_for: getApplicableFor(item),
    });
    setIsModalOpen(true);
  };

  const handleApplicableChange = (option) => {
    setFormData((previous) => {
      const checked = previous.applicable_for.includes(option);

      return {
        ...previous,
        applicable_for: checked
          ? previous.applicable_for.filter((item) => item !== option)
          : [...previous.applicable_for, option],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please enter an action name.",
        confirmButtonColor: "#075fd7",
      });
    }

    if (!formData.action_code.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please enter an action code.",
        confirmButtonColor: "#075fd7",
      });
    }

    if (formData.applicable_for.length === 0) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please select at least one Applicable For option.",
        confirmButtonColor: "#075fd7",
      });
    }

    const duplicate = nextActions.find(
      (item) =>
        normaliseText(item?.name).toLowerCase() ===
        trimmedName.toLowerCase() && item?._id !== isEditing
    );

    if (duplicate) {
      return Swal.fire({
        icon: "warning",
        title: "Duplicate",
        text: "This Next Action already exists.",
        confirmButtonColor: "#075fd7",
      });
    }

    let adminInfo = {};

    try {
      adminInfo = JSON.parse(
        localStorage.getItem("adminInfo") ||
        sessionStorage.getItem("adminInfo") ||
        "{}"
      );
    } catch {
      adminInfo = {};
    }

    const userName =
      adminInfo.fullName ||
      adminInfo.name ||
      adminInfo.username ||
      "Admin";

    const payload = {
      name: trimmedName,
      action_code: formData.action_code.trim().toUpperCase(),
      action_type: formData.action_type,
      status: formData.status,
      follow_up_days: Number(formData.follow_up_days) || 1,
      applicable_for: formData.applicable_for,
      updated_by: userName,
    };

    try {
      setIsSaving(true);

      if (isEditing) {
        await dispatch(
          updateNextAction({
            id: isEditing,
            data: payload,
          })
        ).unwrap();
      } else {
        await dispatch(createNextAction(payload)).unwrap();
      }

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: isEditing
          ? "Next Action updated successfully."
          : "Next Action added successfully.",
        timer: 1400,
        showConfirmButton: false,
      });

      resetForm();
      dispatch(fetchNextActions());
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Operation Failed",
        text: error?.message || "Please try again.",
        confirmButtonColor: "#075fd7",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const item = nextActions.find((action) => action?._id === id);

    const result = await Swal.fire({
      title: "Delete Next Action?",
      text: `Delete "${item?.name || "this action"}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      await dispatch(deleteNextAction(id)).unwrap();

      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Next Action has been deleted.",
        timer: 1200,
        showConfirmButton: false,
      });

      dispatch(fetchNextActions());
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error?.message || "Unable to delete this action.",
        confirmButtonColor: "#075fd7",
      });
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setStatusFilter("All");
    setActionTypeFilter("All");
    setApplicableFilter("All");
    setCurrentPage(1);
  };

  return (
    <section
      className="box-border h-[calc(100dvh-72px)] min-h-0 overflow-hidden bg-[#f7f9fc] px-[clamp(18px,2.35vw,36px)] py-[clamp(12px,1.6vh,20px)] font-sans text-[#172750]"
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div className="grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-[clamp(10px,1.25vh,16px)]">
        {/* Header */}
        <header className="flex items-start justify-between gap-5 px-3">
          <div className="min-w-0">
            <h1 className="text-[clamp(22px,1.7vw,28px)] font-extrabold leading-tight tracking-[-.025em] text-[#0d1c4d]">
              Next Action
            </h1>
            <p className="mt-1 text-[clamp(10px,.82vw,13px)] font-medium text-[#65708a]">
              Manage all next actions for follow-up activities and task management.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/ihweClientData2026/AddNextAction/add")}
            className="inline-flex h-[clamp(40px,4.6vh,48px)] shrink-0 items-center justify-center gap-2 rounded-[7px] bg-[#075fd7] px-[clamp(18px,1.8vw,26px)] text-[clamp(11px,.86vw,13px)] font-extrabold text-white shadow-[0_7px_16px_rgba(7,95,215,.2)] transition hover:bg-[#064fbb] active:scale-[.98]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} />
            Add New Next Action
          </button>
        </header>

        {/* Filters */}
        <section className="grid shrink-0 grid-cols-[minmax(250px,1.35fr)_minmax(165px,.9fr)_minmax(180px,1fr)_minmax(180px,1fr)_78px_102px] items-end gap-[clamp(10px,1.2vw,18px)] rounded-[9px] border border-[#e2e6ed] bg-white px-[clamp(16px,1.7vw,25px)] py-[clamp(15px,1.8vh,21px)] shadow-[0_4px_16px_rgba(15,23,42,.04)]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d7c98]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by action name or code..."
              className={filterInputClass}
            />
          </div>

          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
            options={[
              { value: "All", label: "All" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />

          <FilterSelect
            label="Action Type"
            value={actionTypeFilter}
            onChange={(value) => {
              setActionTypeFilter(value);
              setCurrentPage(1);
            }}
            options={[
              { value: "All", label: "All" },
              ...ACTION_TYPES.map((item) => ({
                value: item,
                label: item,
              })),
            ]}
          />

          <FilterSelect
            label="Applicable For"
            value={applicableFilter}
            onChange={(value) => {
              setApplicableFilter(value);
              setCurrentPage(1);
            }}
            options={[
              { value: "All", label: "All" },
              ...APPLICABLE_OPTIONS.map((item) => ({
                value: item,
                label: item,
              })),
            ]}
          />

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-[46px] items-center justify-center rounded-[7px] border border-[#d8dde6] bg-white px-4 text-[clamp(10px,.78vw,12px)] font-extrabold text-[#172750] transition hover:bg-[#f7f8fa]"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            className="inline-flex h-[46px] items-center justify-center gap-2 rounded-[7px] bg-[#e9f0ff] px-4 text-[clamp(10px,.78vw,12px)] font-extrabold text-[#2365d8] transition hover:bg-[#dce8ff]"
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </section>

        {/* Table */}
        <main className="flex min-h-0 flex-col overflow-hidden rounded-[9px] border border-[#dfe4eb] bg-white shadow-[0_4px_16px_rgba(15,23,42,.04)]">
          <div className="min-h-0 flex-1 overflow-hidden">
            <table className="w-full table-fixed border-collapse text-left">
              <colgroup>
                <col className="w-[6.5%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[7.5%]" />
                <col className="w-[15%]" />
                <col className="w-[8%]" />
                <col className="w-[12%]" />
                <col className="w-[11%]" />
                <col className="w-[8%]" />
              </colgroup>

              <thead>
                <tr className="h-[48px] border-b border-[#dfe4eb] bg-[#f7f9fb] text-[clamp(8px,.63vw,10px)] font-extrabold uppercase tracking-[.02em] text-[#31415f]">
                  <th className="px-[clamp(10px,1.1vw,18px)]">S.No.</th>
                  <th className="px-[clamp(10px,1.1vw,18px)]">Action Name</th>
                  <th className="px-[clamp(10px,1.1vw,18px)]">Action Code</th>
                  <th className="px-[clamp(10px,1.1vw,18px)]">Action Type</th>
                  <th className="px-[clamp(10px,1.1vw,18px)]">Status</th>
                  <th className="px-[clamp(10px,1.1vw,18px)]">Applicable For</th>
                  <th className="px-[clamp(10px,1.1vw,18px)] text-center">
                    Follow-up Days
                  </th>
                  <th className="px-[clamp(10px,1.1vw,18px)]">Updated By</th>
                  <th className="px-[clamp(10px,1.1vw,18px)]">Updated At</th>
                  <th className="px-[clamp(10px,1.1vw,18px)] text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e7ebef] text-[clamp(10px,.74vw,12px)] text-[#243453]">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="h-[220px] text-center">
                      <div className="flex h-full flex-col items-center justify-center gap-3 text-[#728099]">
                        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#075fd7]/20 border-t-[#075fd7]" />
                        <span className="text-[12px] font-semibold">
                          Loading next actions...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : paginated.length > 0 ? (
                  paginated.map((item, index) => {
                    const status = getActionStatus(item);
                    const actionType = getActionType(item);
                    const applicableFor = getApplicableFor(item);
                    const updatedAt = getUpdatedAt(item);

                    return (
                      <tr
                        key={item?._id || `${item?.name}-${index}`}
                        className="h-[clamp(46px,5.35vh,58px)] bg-white transition hover:bg-blue-50/25"
                      >
                        <td className="px-[clamp(10px,1.1vw,18px)] font-bold text-[#18356c]">
                          {firstItemIndex + index + 1}
                        </td>

                        <td className="truncate px-[clamp(10px,1.1vw,18px)] font-extrabold text-[#172750]">
                          {item?.name || "Untitled Action"}
                        </td>

                        <td className="truncate px-[clamp(10px,1.1vw,18px)] font-bold text-[#243d72]">
                          {getActionCode(item)}
                        </td>

                        <td className="px-[clamp(10px,1.1vw,18px)]">
                          <span
                            className={`inline-flex max-w-full truncate rounded-[5px] px-3 py-1.5 text-[clamp(9px,.68vw,11px)] font-extrabold ${ACTION_TYPE_STYLES[actionType] ||
                              "bg-slate-100 text-slate-600"
                              }`}
                          >
                            {actionType}
                          </span>
                        </td>

                        <td className="px-[clamp(10px,1.1vw,18px)]">
                          <span
                            className={`inline-flex rounded-[5px] px-2.5 py-1.5 text-[clamp(9px,.68vw,11px)] font-extrabold capitalize ${status === "active"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-600"
                              }`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-[clamp(10px,1.1vw,18px)]">
                          <ApplicableIcons values={applicableFor} />
                        </td>

                        <td className="px-[clamp(10px,1.1vw,18px)] text-center font-bold text-[#253b68]">
                          {getFollowUpDays(item)}
                        </td>

                        <td className="truncate px-[clamp(10px,1.1vw,18px)] font-semibold text-[#344664]">
                          {getUpdatedBy(item)}
                        </td>

                        <td className="px-[clamp(10px,1.1vw,18px)]">
                          <div className="flex flex-col text-[clamp(9px,.67vw,11px)] font-semibold leading-[1.35] text-[#344664]">
                            <span>{formatDate(updatedAt)}</span>
                            <span>{formatTime(updatedAt)}</span>
                          </div>
                        </td>

                        <td className="px-[clamp(10px,1.1vw,18px)]">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/ihweClientData2026/AddNextAction/edit/${item?._id}`)}
                              className="grid h-8 w-8 place-items-center rounded-[6px] border border-blue-100 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                              title="Edit action"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item?._id)}
                              className="grid h-8 w-8 place-items-center rounded-[6px] border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100"
                              title="Delete action"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="h-[220px] text-center">
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-[#758299]">
                        <Search className="h-7 w-7 text-[#a5afbd]" />
                        <p className="text-[12px] font-semibold">
                          No next actions found.
                        </p>
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="text-[11px] font-extrabold text-[#075fd7] hover:underline"
                        >
                          Clear filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  paginated.length > 0 &&
                  Array.from({
                    length: Math.max(
                      0,
                      Math.min(8, itemsPerPage) - paginated.length
                    ),
                  }).map((_, index) => (
                    <tr
                      key={`empty-row-${index}`}
                      className="h-[clamp(46px,5.35vh,58px)]"
                    >
                      <td colSpan={10} />
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <footer className="flex h-[54px] shrink-0 items-center justify-between border-t border-[#e0e5eb] px-[clamp(14px,1.4vw,22px)]">
            <p className="text-[clamp(9px,.68vw,11px)] font-semibold text-[#68758c]">
              Showing{" "}
              <span className="font-extrabold text-[#263d6e]">
                {filtered.length ? firstItemIndex + 1 : 0}
              </span>{" "}
              to{" "}
              <span className="font-extrabold text-[#263d6e]">
                {Math.min(firstItemIndex + itemsPerPage, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-extrabold text-[#263d6e]">
                {filtered.length}
              </span>{" "}
              entries
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.max(1, page - 1))
                }
                disabled={currentPage === 1}
                className={paginationArrowClass}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {visiblePageNumbers.map((page, index) => {
                if (String(page).trim() === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="grid h-8 min-w-8 place-items-center text-[12px] font-extrabold text-[#647189]"
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    type="button"
                    key={`${page}-${index}`}
                    onClick={() => setCurrentPage(Number(page))}
                    className={`grid h-8 min-w-8 place-items-center rounded-[6px] px-2 text-[11px] font-extrabold transition ${currentPage === page
                        ? "bg-[#e8f0ff] text-[#1e5fd3] ring-1 ring-[#c9d9fa]"
                        : "border border-[#e0e5eb] bg-white text-[#4f5f79] hover:bg-[#f6f8fb]"
                      }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
                disabled={currentPage === totalPages}
                className={paginationArrowClass}
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <label className="relative ml-6">
                <select
                  value={itemsPerPage}
                  onChange={(event) => {
                    setItemsPerPage(Number(event.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-9 w-[116px] appearance-none rounded-[6px] border border-[#dce2e9] bg-white pl-4 pr-9 text-[11px] font-bold text-[#44546d] outline-none"
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6c7990]" />
              </label>
            </div>
          </footer>
        </main>

        {/* Page Footer */}
        <footer className="flex items-center gap-2 px-1 text-[clamp(9px,.7vw,11px)] font-semibold text-[#7d869c]">
          <span>© 2026 International Health &amp; Wellness Expo</span>
          <span>|</span>
          <span>Namo Gange Wellness Pvt. Ltd.</span>
          <span>|</span>
          <span>All Rights Reserved.</span>
        </footer>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
          <div className="relative w-full max-w-[620px] rounded-[12px] border border-[#e1e6ec] bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={resetForm}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-[#8591a4] transition hover:bg-[#f2f4f7]"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#075fd7]">
                Next Action Management
              </p>
              <h2 className="mt-1 text-[20px] font-extrabold text-[#112a68]">
                {isEditing ? "Edit Next Action" : "Add New Next Action"}
              </h2>
              <p className="mt-1 text-[11px] font-medium text-[#748198]">
                Enter the next-action details below.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <ModalField label="Action Name" required>
                  <input
                    autoFocus
                    type="text"
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    placeholder="e.g. Follow Up Call"
                    className={modalInputClass}
                  />
                </ModalField>

                <ModalField label="Action Code" required>
                  <input
                    type="text"
                    maxLength={15}
                    value={formData.action_code}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        action_code: event.target.value
                          .replace(/\s+/g, "")
                          .toUpperCase(),
                      }))
                    }
                    placeholder="e.g. FOLLOWUP"
                    className={modalInputClass}
                  />
                </ModalField>

                <ModalField label="Action Type" required>
                  <select
                    value={formData.action_type}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        action_type: event.target.value,
                      }))
                    }
                    className={modalInputClass}
                  >
                    {ACTION_TYPES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </ModalField>

                <ModalField label="Follow-up Days" required>
                  <input
                    type="number"
                    min="1"
                    value={formData.follow_up_days}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        follow_up_days: Number(event.target.value) || 1,
                      }))
                    }
                    className={modalInputClass}
                  />
                </ModalField>

                <div className="col-span-2">
                  <ModalField label="Status" required>
                    <div className="grid grid-cols-2 gap-3">
                      {["active", "inactive"].map((status) => (
                        <label
                          key={status}
                          className={`flex h-10 cursor-pointer items-center gap-2 rounded-[6px] border px-3 text-[12px] font-bold capitalize transition ${formData.status === status
                              ? "border-[#2e8050] bg-[#eff8f2] text-[#176f39]"
                              : "border-[#dfe4ea] bg-white text-[#65748a]"
                            }`}
                        >
                          <input
                            type="radio"
                            name="status"
                            value={status}
                            checked={formData.status === status}
                            onChange={(event) =>
                              setFormData((previous) => ({
                                ...previous,
                                status: event.target.value,
                              }))
                            }
                            className="accent-[#08752f]"
                          />
                          {status}
                        </label>
                      ))}
                    </div>
                  </ModalField>
                </div>

                <div className="col-span-2">
                  <ModalField label="Applicable For" required>
                    <div className="flex flex-wrap gap-x-5 gap-y-3 rounded-[7px] border border-[#dfe4ea] px-3 py-3">
                      {APPLICABLE_OPTIONS.map((option) => (
                        <label
                          key={option}
                          className="flex cursor-pointer items-center gap-2 text-[11px] font-bold text-[#34445f]"
                        >
                          <input
                            type="checkbox"
                            checked={formData.applicable_for.includes(option)}
                            onChange={() => handleApplicableChange(option)}
                            className="h-4 w-4 accent-[#075fd7]"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </ModalField>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="h-10 flex-1 rounded-[6px] border border-[#d7dee7] bg-white text-[12px] font-extrabold text-[#53637a] transition hover:bg-[#f5f7fa]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-[6px] bg-[#075fd7] text-[12px] font-extrabold text-white transition hover:bg-[#064fbb] disabled:cursor-not-allowed disabled:opacity-65"
                >
                  {isSaving ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isEditing ? "Update Action" : "Save Action"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

const filterInputClass =
  "h-[46px] w-full rounded-[7px] border border-[#d7dde6] bg-white pl-10 pr-4 text-[clamp(10px,.78vw,12px)] font-semibold text-[#263754] outline-none transition placeholder:text-[#98a4b5] focus:border-[#4d80da] focus:ring-2 focus:ring-[#4d80da]/10";

const modalInputClass =
  "h-10 w-full rounded-[6px] border border-[#d8dfe8] bg-white px-3 text-[12px] font-semibold text-[#263754] outline-none transition placeholder:text-[#a0abb9] focus:border-[#3f78d0] focus:ring-2 focus:ring-[#3f78d0]/10";

const paginationArrowClass =
  "grid h-8 w-8 place-items-center rounded-[6px] border border-[#e0e5eb] bg-white text-[#8794a8] transition hover:bg-[#f5f7fa] disabled:cursor-not-allowed disabled:opacity-45";

const FilterSelect = ({ label, value, onChange, options }) => (
  <label className="relative block min-w-0">
    <span className="mb-2 block text-[clamp(9px,.72vw,11px)] font-extrabold text-[#293b68]">
      {label}
    </span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-[46px] w-full appearance-none rounded-[7px] border border-[#d7dde6] bg-white px-4 pr-10 text-[clamp(10px,.78vw,12px)] font-bold text-[#243656] outline-none transition focus:border-[#4d80da] focus:ring-2 focus:ring-[#4d80da]/10"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute bottom-[15px] right-3 h-4 w-4 text-[#60708b]" />
  </label>
);

const ModalField = ({ label, required, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-[11px] font-extrabold text-[#44546d]">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </span>
    {children}
  </label>
);

const ApplicableIcons = ({ values }) => {
  const items = values.slice(0, 3);
  const remaining = Math.max(0, values.length - items.length);

  const iconFor = (value) => {
    if (value === "Exhibitor Lead") {
      return {
        Icon: UserRound,
        wrap: "bg-violet-50 text-violet-600",
      };
    }

    if (value === "Buyer Lead") {
      return {
        Icon: UsersRound,
        wrap: "bg-blue-50 text-blue-600",
      };
    }

    if (value === "Sponsor Lead") {
      return {
        Icon: ShieldCheck,
        wrap: "bg-orange-50 text-orange-500",
      };
    }

    return {
      Icon: UserRound,
      wrap: "bg-cyan-50 text-cyan-600",
    };
  };

  return (
    <div className="flex items-center gap-2">
      {items.map((value) => {
        const { Icon, wrap } = iconFor(value);

        return (
          <span
            key={value}
            className={`grid h-8 w-8 place-items-center rounded-[7px] ${wrap}`}
            title={value}
          >
            <Icon className="h-4 w-4" strokeWidth={2.1} />
          </span>
        );
      })}

      {remaining > 0 && (
        <span className="grid h-8 min-w-8 place-items-center rounded-[7px] bg-slate-100 px-2 text-[10px] font-extrabold text-[#526178]">
          +{remaining}
        </span>
      )}
    </div>
  );
};

export default AddNextAction;