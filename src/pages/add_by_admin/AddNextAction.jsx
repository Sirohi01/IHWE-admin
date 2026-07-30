import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileWarning,
  House,
  Info,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Tags,
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
  "Visitor Lead",
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

const normalizeApplicableOption = (option) =>
  option === "General Lead" ? "Visitor Lead" : option;

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

  if (Array.isArray(value)) {
    return value.filter(Boolean).map(normalizeApplicableOption);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .map(normalizeApplicableOption)
      .filter(Boolean);
  }

  return ["Exhibitor Lead", "Buyer Lead", "Sponsor Lead", "Visitor Lead"];
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

const getDisplayOrder = (item) =>
  Number.isFinite(Number(item?.display_order)) ? Number(item.display_order) : "—";

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

const SummaryCard = ({ icon, iconClass, iconWrapClass, label, value, note }) => (
  <div className="flex min-w-0 items-center gap-3 rounded-lg border border-[#e4e8ef] bg-white px-3 py-2.5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconWrapClass}`}
    >
      {React.createElement(icon, {
        className: `h-5 w-5 ${iconClass}`,
        strokeWidth: 2,
      })}
    </div>

    <div className="min-w-0">
      <p className="truncate text-[11px] font-medium text-[#70809a]">{label}</p>
      <p className="mt-0.5 truncate text-[20px] font-semibold leading-none text-[#172842]">
        {value}
      </p>
      <p className="mt-2 truncate text-[11px] text-[#697991]">{note}</p>
    </div>
  </div>
);

const AddNextAction = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const nextActionState = useSelector((state) => state.nextActions) || {};
  const rawNextActions = nextActionState.nextActions;
  const nextActions = useMemo(
    () => (Array.isArray(rawNextActions) ? rawNextActions.filter(Boolean) : []),
    [rawNextActions],
  );
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
        const orderA = Number.isFinite(Number(a?.display_order))
          ? Number(a.display_order)
          : 9999;
        const orderB = Number.isFinite(Number(b?.display_order))
          ? Number(b.display_order)
          : 9999;
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

  const summary = useMemo(() => {
    const active = nextActions.filter(
      (item) => getActionStatus(item) === "active"
    ).length;
    const inactive = nextActions.length - active;
    const latestItem = [...nextActions]
      .filter((item) => {
        const date = new Date(getUpdatedAt(item));
        return !Number.isNaN(date.getTime());
      })
      .sort(
        (a, b) =>
          new Date(getUpdatedAt(b)).getTime() -
          new Date(getUpdatedAt(a)).getTime()
      )[0];

    return {
      total: nextActions.length,
      active,
      inactive,
      latestDate: latestItem ? formatDate(getUpdatedAt(latestItem)) : "—",
      latestBy: latestItem ? getUpdatedBy(latestItem) : "No update yet",
      actionTypes: new Set(nextActions.map(getActionType)).size,
    };
  }, [nextActions]);

  const resetForm = () => {
    setIsEditing(null);
    setFormData(initialForm);
    setIsModalOpen(false);
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
      applicable_for: formData.applicable_for.map(normalizeApplicableOption),
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
    <section className="h-[calc(100dvh-20px)] overflow-hidden bg-[#fbfcfe] p-5 font-sans text-[#263754]">
      <div className="grid h-full min-h-0 grid-rows-[auto_auto_auto_minmax(0,1fr)] gap-3">
        {/* Header */}
        <header className="grid grid-cols-[minmax(320px,0.9fr)_minmax(500px,1.1fr)] gap-5">
          <div className="min-w-0 pt-0.5">
            <nav className="flex items-center gap-2 text-[11px] font-medium text-[#6c7a91]">
              <House className="h-3 w-3 text-[#8aa1af]" fill="currentColor" />
              <span>Home</span>
              <ChevronRight className="h-3.5 w-3.5 text-[#a7b2c2]" />
              <span>System Configuration</span>
              <ChevronRight className="h-3.5 w-3.5 text-[#a7b2c2]" />
              <span className="font-semibold text-[#19843c]">Add Next Action</span>
            </nav>

            <h1 className="mt-4 text-[23px] font-semibold leading-none tracking-[-0.02em] text-[#14253f]">
              Next Action Management
            </h1>
            <p className="mt-3 text-[12px] text-[#64758f]">
              Manage next actions used in CRM follow-up activities.
            </p>
          </div>

          <div className="grid min-h-[92px] grid-cols-[minmax(0,1fr)_250px] overflow-hidden rounded-lg border border-[#e2e7ee] bg-white shadow-[0_1px_4px_rgba(15,23,42,0.04)]">
            <div className="flex min-w-0 items-start gap-3 px-4 py-4">
              <Info className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#3577d4]" />
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[#263754]">
                  About Next Action
                </p>
                <p className="mt-2 max-w-[520px] text-[11px] leading-5 text-[#63738c]">
                  Next actions help your team plan follow-ups and move leads
                  through the CRM workflow.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center border-l border-[#e7ebf0] px-4">
              <button
                type="button"
                onClick={() => navigate("/ihweClientData2026/AddNextAction/add")}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#08752f] px-4 text-[13px] font-semibold text-white shadow-[0_2px_5px_rgba(8,117,47,0.22)] transition hover:bg-[#066326]"
              >
                <Plus className="h-4 w-4" strokeWidth={2.2} />
                Add New Next Action
              </button>
            </div>
          </div>
        </header>

        {/* Summary cards */}
        <div className="grid grid-cols-5 gap-3">
          <SummaryCard
            icon={Tags}
            iconClass="text-sky-500"
            iconWrapClass="bg-sky-50"
            label="Total Actions"
            value={summary.total}
            note="All next actions"
          />
          <SummaryCard
            icon={CheckCircle2}
            iconClass="text-emerald-600"
            iconWrapClass="bg-emerald-50"
            label="Active Actions"
            value={summary.active}
            note="Currently in use"
          />
          <SummaryCard
            icon={FileWarning}
            iconClass="text-amber-500"
            iconWrapClass="bg-amber-50"
            label="Inactive Actions"
            value={summary.inactive}
            note="Not in use"
          />
          <SummaryCard
            icon={CalendarDays}
            iconClass="text-violet-600"
            iconWrapClass="bg-violet-50"
            label="Last Updated"
            value={summary.latestDate}
            note={`By ${summary.latestBy}`}
          />
          <SummaryCard
            icon={ShieldCheck}
            iconClass="text-blue-600"
            iconWrapClass="bg-blue-50"
            label="Action Types"
            value={summary.actionTypes}
            note="Configured types"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-[minmax(250px,1.15fr)_minmax(190px,0.75fr)_minmax(190px,0.75fr)_minmax(190px,0.75fr)_auto] items-end gap-4 px-1">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a4afbf]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by action name or code..."
              className="h-10 w-full rounded-md border border-[#dce2e9] bg-white pl-10 pr-3 text-[12px] text-[#263754] outline-none transition placeholder:text-[#9ca8ba] focus:border-[#4e8c66] focus:ring-2 focus:ring-[#4e8c66]/10"
            />
          </div>

          <label className="relative block">
            <span className="absolute -top-2 left-2 z-10 bg-[#fbfcfe] px-1 text-[10px] font-medium text-[#748399]">
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full appearance-none rounded-md border border-[#dce2e9] bg-white px-3 pr-9 text-[12px] font-medium text-[#31415a] outline-none focus:border-[#4e8c66]"
            >
              <option value="All">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#65768e]" />
          </label>

          <label className="relative block">
            <span className="absolute -top-2 left-2 z-10 bg-[#fbfcfe] px-1 text-[10px] font-medium text-[#748399]">
              Action Type
            </span>
            <select
              value={actionTypeFilter}
              onChange={(event) => {
                setActionTypeFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full appearance-none rounded-md border border-[#dce2e9] bg-white px-3 pr-9 text-[12px] font-medium text-[#31415a] outline-none focus:border-[#4e8c66]"
            >
              <option value="All">All</option>
              {ACTION_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#65768e]" />
          </label>

          <label className="relative block">
            <span className="absolute -top-2 left-2 z-10 bg-[#fbfcfe] px-1 text-[10px] font-medium text-[#748399]">
              Applicable For
            </span>
            <select
              value={applicableFilter}
              onChange={(event) => {
                setApplicableFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full appearance-none rounded-md border border-[#dce2e9] bg-white px-3 pr-9 text-[12px] font-medium text-[#31415a] outline-none focus:border-[#4e8c66]"
            >
              <option value="All">All</option>
              {APPLICABLE_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#65768e]" />
          </label>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#d8dee7] bg-white px-4 text-[12px] font-semibold text-[#34435a] transition hover:bg-[#f5f7fa]"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Filters
          </button>
        </div>

        {/* Table */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-[#e0e5eb] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
          <div className="min-h-0 flex-1 overflow-hidden">
            <table className="w-full table-fixed border-collapse text-left">
              <colgroup>
                <col className="w-[4%]" />
                <col className="w-[13%]" />
                <col className="w-[9%]" />
                <col className="w-[10%]" />
                <col className="w-[8%]" />
                <col className="w-[14%]" />
                <col className="w-[8%]" />
                <col className="w-[13%]" />
                <col className="w-[12%]" />
                <col className="w-[9%]" />
              </colgroup>

              <thead>
                <tr className="h-11 border-b border-[#dfe5eb] bg-[#f7f9fb] text-[11px] font-semibold text-[#53637b]">
                  <th className="px-4">Order</th>
                  <th className="px-3">Action Name</th>
                  <th className="px-3">Code</th>
                  <th className="px-3">Action Type</th>
                  <th className="px-3">Status</th>
                  <th className="px-3">Applicable For</th>
                  <th className="px-3 text-center">Follow-up</th>
                  <th className="px-3">Updated On</th>
                  <th className="px-3">Updated By</th>
                  <th className="px-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="text-[11.5px] text-[#34445d]">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="h-[180px] text-center">
                      <div className="flex h-full flex-col items-center justify-center gap-3 text-[#728099]">
                        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#08752f]/20 border-t-[#08752f]" />
                        <span className="text-[12px] font-medium">
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
                        className="h-11 border-b border-[#e7ebef] transition last:border-b-0 hover:bg-[#fbfcfd]"
                      >
                        <td className="px-4 font-semibold text-[#52627a]">
                          {getDisplayOrder(item)}
                        </td>

                        <td className="px-3">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span
                              className={`h-2.5 w-2.5 shrink-0 rounded-full ${status === "active" ? "bg-[#0b8a3d]" : "bg-[#cbd5e1]"}`}
                            />
                            <span className="truncate font-semibold text-[#263754]">
                              {item?.name || "Untitled Action"}
                            </span>
                          </div>
                        </td>

                        <td className="truncate px-3 font-medium text-[#53637a]">
                          {getActionCode(item)}
                        </td>

                        <td className="px-3">
                          <span
                            className={`inline-flex max-w-full truncate rounded-full px-2.5 py-1 text-[10px] font-semibold ${ACTION_TYPE_STYLES[actionType] ||
                              "bg-[#eaf2ff] text-[#3f78c7]"
                              }`}
                          >
                            {actionType}
                          </span>
                        </td>

                        <td className="px-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${status === "active"
                                ? "bg-[#eaf8ef] text-[#2d9b58]"
                                : "bg-[#f1f4f8] text-[#6b798f]"
                              }`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-3">
                          <ApplicableIcons values={applicableFor} />
                        </td>

                        <td className="px-3 text-center font-semibold text-[#52627a]">
                          {getFollowUpDays(item)}
                        </td>

                        <td className="px-3">
                          <div className="flex flex-col text-[10.5px] font-medium leading-[1.35] text-[#53637a]">
                            <span>{formatDate(updatedAt)}</span>
                            <span>{formatTime(updatedAt)}</span>
                          </div>
                        </td>

                        <td className="truncate px-3 font-medium text-[#53637a]">
                          {getUpdatedBy(item)}
                        </td>

                        <td className="px-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/ihweClientData2026/AddNextAction/edit/${item?._id}`)}
                              className="flex h-7 w-7 items-center justify-center rounded bg-[#edf6ff] text-[#4c9be8] transition hover:bg-[#dbeeff]"
                              title="Edit action"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item?._id)}
                              className="flex h-7 w-7 items-center justify-center rounded bg-[#fff1f1] text-[#ec5d63] transition hover:bg-[#ffe1e1]"
                              title="Delete action"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="h-[180px] text-center">
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-[#7b899b]">
                        <Info className="h-7 w-7 text-[#a4afbd]" />
                        <p className="text-[12px] font-medium">
                          No next actions found
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="flex h-[54px] shrink-0 items-center justify-between border-t border-[#e0e5eb] px-4">
            <div className="flex items-center gap-6 text-[11px] text-[#53637a]">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#eaf8ef] px-2.5 py-1 font-semibold text-[#2d9b58]">
                  Active
                </span>
                <span>Currently in use</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#eaf2ff] px-2.5 py-1 font-semibold text-[#3f78c7]">
                  Type
                </span>
                <span>Action category</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[#53637a]">
              <span className="font-medium">Show</span>

              <label className="relative">
                <select
                  value={itemsPerPage}
                  onChange={(event) => {
                    setItemsPerPage(Number(event.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-9 w-[74px] appearance-none rounded-md border border-[#dce2e9] bg-white pl-3 pr-8 font-semibold text-[#34435a] outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#67768d]" />
              </label>

              <span className="font-semibold text-[#40516a]">
                of {filtered.length}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e0e5eb] bg-white text-[#98a4b5] transition hover:bg-[#f5f7fa] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {visiblePageNumbers.map((pageNumber, index) => {
                if (String(pageNumber).trim() === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="flex h-8 min-w-8 items-center justify-center px-2 text-[11px] font-semibold text-[#6b798f]"
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    type="button"
                    key={`${pageNumber}-${index}`}
                    onClick={() => setCurrentPage(Number(pageNumber))}
                    className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[11px] font-semibold transition ${currentPage === Number(pageNumber)
                        ? "bg-[#08752f] text-white shadow-[0_1px_3px_rgba(8,117,47,0.2)]"
                        : "border border-[#e7ebef] bg-white text-[#6b798f] hover:bg-[#f5f7fa]"
                      }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e0e5eb] bg-white text-[#98a4b5] transition hover:bg-[#f5f7fa] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </div>
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

const modalInputClass =
  "h-10 w-full rounded-[6px] border border-[#d8dfe8] bg-white px-3 text-[12px] font-semibold text-[#263754] outline-none transition placeholder:text-[#a0abb9] focus:border-[#3f78d0] focus:ring-2 focus:ring-[#3f78d0]/10";

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
