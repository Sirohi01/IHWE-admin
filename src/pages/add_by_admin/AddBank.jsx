import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Pencil,
  Eye,
  Plus,
  X,
  Search,
  RotateCcw,
  Star,
  MoreVertical,
  Landmark,
  QrCode,
  History,
  UploadCloud,
  Wallet,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchBanks,
  addBank,
  updateBank,
  deleteBank,
} from "../../features/add_by_admin/banks/bankSlice";
import Swal from "sweetalert2";
import { fetchActivityLogs } from "../../features/activityLog/activityLogSlice";
import { useEventContext } from "../../context/EventContext";
import { SERVER_URL } from "../../lib/api";

const PURPOSE_OPTIONS = [
  "Exhibitor Collection",
  "Delegate Collection",
  "Vendor Payments",
  "Sponsorship",
  "Other",
];

const ACCOUNT_TYPE_OPTIONS = ["Current Account", "Savings Account"];

const emptyForm = {
  accountDisplayName: "",
  accountname: "",
  bankname: "",
  accountno: "",
  confirmAccountno: "",
  ifsccode: "",
  accountType: "Current Account",
  bankbranch: "",
  branchAddress: "",
  swiftBic: "",
  micrCode: "",
  openingBalance: "",
  currency: "INR",
  upiEnabled: false,
  upiId: "",
  upiRegisteredName: "",
  qrCodeFile: null,
  qrCodePreview: "",
  paymentGatewayLink: "",
  purpose: ["Exhibitor Collection"],
  applicableEvent: "",
  isPrimary: false,
  showOnProformaInvoice: true,
  showOnTaxInvoice: true,
  showOnPaymentReceipt: true,
  allowShareWithClient: true,
  activeAccount: true,
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 border border-gray-300 bg-white text-base rounded-md cursor-pointer ${
          currentPage === 1
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-50"
        }`}
      >
        {"<<"}
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 border border-gray-300 bg-white text-base rounded-md cursor-pointer ${
          currentPage === 1
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-50"
        }`}
      >
        {"<"}
      </button>
      {start > 1 && <span className="px-2 text-gray-400 text-base">...</span>}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-2 border text-base rounded-md cursor-pointer ${
            p === currentPage
              ? "bg-blue-500 text-white border-blue-600"
              : "border-gray-300 bg-white hover:bg-gray-50"
          }`}
        >
          {p}
        </button>
      ))}
      {end < totalPages && (
        <span className="px-2 text-gray-400 text-base">...</span>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 border border-gray-300 bg-white text-base rounded-md cursor-pointer ${
          currentPage === totalPages
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-50"
        }`}
      >
        {">"}
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 border border-gray-300 bg-white text-base rounded-md cursor-pointer ${
          currentPage === totalPages
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-50"
        }`}
      >
        {">>"}
      </button>
    </div>
  );
};

const StatCard = ({ icon, iconBg, label, value, sub }) => (
  <div className="bg-white border border-gray-200 rounded-md p-4 flex items-start gap-3 shadow-sm">
    <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide truncate">{label}</p>
      <p className="text-xl font-bold text-slate-800 truncate">{value}</p>
      <p className="text-[11px] text-slate-400 truncate">{sub}</p>
    </div>
  </div>
);

const MultiSelectDropdown = ({ options, selected, onChange, placeholder, className }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toggleOption = (value) => {
    if (selected.includes(value)) onChange(selected.filter((v) => v !== value));
    else onChange([...selected, value]);
  };

  const label =
    selected.length === 0 ? placeholder : selected.length === 1 ? selected[0] : `${selected.length} selected`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${className} flex items-center justify-between gap-2`}
      >
        <span className={`truncate text-left ${selected.length === 0 ? "text-slate-400" : ""}`}>{label}</span>
        <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-[2px] shadow-lg max-h-56 overflow-y-auto">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2 px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggleOption(opt)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-[#23471d] focus:ring-[#23471d]"
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const qrSrc = (form) => {
  if (form.qrCodePreview) return form.qrCodePreview;
  return "";
};

// Legacy records may carry lowercase status values from an older form
const isActiveStatus = (status) => (status || "").toLowerCase() === "active";
const formatStatus = (status) => (isActiveStatus(status) ? "Active" : "Inactive");

const FIELD_LABELS = {
  accountDisplayName: "Account Name",
  accountname: "Account Holder Name",
  bankname: "Bank Name",
  accountno: "Account Number",
  ifsccode: "IFSC Code",
  accountType: "Account Type",
  bankbranch: "Branch Name",
  branchAddress: "Branch Address",
  swiftBic: "SWIFT / BIC",
  micrCode: "MICR Code",
  openingBalance: "Opening Balance",
  currency: "Currency",
  upiEnabled: "UPI Enabled",
  upiId: "UPI ID",
  upiRegisteredName: "UPI Registered Name",
  paymentGatewayLink: "Payment Gateway Link",
  purpose: "Purpose",
  applicableEventName: "Applicable Event",
  isPrimary: "Primary Account",
  showOnProformaInvoice: "Show on Proforma Invoice",
  showOnTaxInvoice: "Show on Tax Invoice",
  showOnPaymentReceipt: "Show on Payment Receipt",
  allowShareWithClient: "Allow Share with Client",
  status: "Status",
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPurpose = (purpose) => {
  if (Array.isArray(purpose)) return purpose.length ? purpose.join(", ") : "—";
  return purpose || "—";
};

const formatFieldValue = (value) => {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return formatPurpose(value);
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
};

// Only send/log fields that actually changed from the record being edited
const buildUpdateDiff = (payload, original) => {
  if (!original) return payload;
  const diff = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (key === "qrCodeFile") {
      if (value instanceof File) diff[key] = value;
      return;
    }
    if (original[key] !== value) diff[key] = value;
  });
  return diff;
};

// Human-readable field list from an activity-log entry's stored data
const describeLogFields = (fields) => {
  if (!fields || typeof fields !== "object") return [];
  return Object.entries(fields)
    .filter(([key]) => FIELD_LABELS[key])
    .map(([key, value]) => ({ label: FIELD_LABELS[key], value: formatFieldValue(value) }));
};

const describeLogChanges = (log) => describeLogFields(log?.data?.updated_fields);
const describeCreatedFields = (log) => describeLogFields(log?.data?.created_data);

const AddBank = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { events } = useEventContext();

  const [editingBank, setEditingBank] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const [historyBank, setHistoryBank] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [usageFilter, setUsageFilter] = useState("All");
  const [eventFilter, setEventFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fileInputRef = useRef(null);

  const {
    banks,
    loading: isLoading,
  } = useSelector((state) => state.banks) || {};

  const { data: activityLogs, loading: auditLoading } = useSelector(
    (state) => state.activityLog,
  ) || {};

  useEffect(() => {
    dispatch(fetchBanks());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleQrChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        title: "File too large",
        text: "QR code image must be under 2MB.",
        icon: "error",
        confirmButtonColor: "#23471d",
      });
      return;
    }
    setFormData((prev) => ({
      ...prev,
      qrCodeFile: file,
      qrCodePreview: URL.createObjectURL(file),
    }));
  };

  const removeQr = () => {
    setFormData((prev) => ({ ...prev, qrCodeFile: null, qrCodePreview: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingBank(null);
    setErrors({});
  };

  const handleAddOrUpdateBank = async (e) => {
    e.preventDefault();
    const validationErrors = {};
    if (!formData.accountDisplayName.trim())
      validationErrors.accountDisplayName = "Account Name is required.";
    if (!formData.accountname.trim())
      validationErrors.accountname = "Account Holder Name is required.";
    if (!formData.bankname.trim())
      validationErrors.bankname = "Bank Name is required.";
    if (!formData.accountno.trim()) {
      validationErrors.accountno = "Account Number is required.";
    } else if (!/^\d+$/.test(formData.accountno)) {
      validationErrors.accountno = "Account Number must contain only digits.";
    }
    if (formData.confirmAccountno !== formData.accountno) {
      validationErrors.confirmAccountno = "Account numbers do not match.";
    }
    if (!formData.ifsccode.trim())
      validationErrors.ifsccode = "IFSC Code is required.";
    if (!formData.bankbranch.trim())
      validationErrors.bankbranch = "Branch Name is required.";
    if (!formData.purpose || formData.purpose.length === 0)
      validationErrors.purpose = "Select at least one purpose.";
    if (!formData.applicableEvent)
      validationErrors.applicableEvent = "Applicable Event is required.";
    if (formData.upiEnabled) {
      if (!formData.upiId.trim())
        validationErrors.upiId = "UPI ID / VPA is required.";
      if (!formData.upiRegisteredName.trim())
        validationErrors.upiRegisteredName = "UPI Registered Name is required.";
    }
    if (formData.paymentGatewayLink.trim() && !/^https?:\/\/.+/i.test(formData.paymentGatewayLink.trim())) {
      validationErrors.paymentGatewayLink = "Enter a valid link starting with http:// or https://.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Swal.fire({
        title: "Validation Error",
        text: "Please correct the highlighted errors.",
        icon: "error",
        confirmButtonColor: "#23471d",
      });
      return;
    }
    setErrors({});

    const trimmedAccountNo = formData.accountno.trim();
    const duplicate = (Array.isArray(banks) ? banks : []).find(
      (bank) =>
        (bank.accountno || "").trim() === trimmedAccountNo &&
        (!editingBank || bank._id !== editingBank._id),
    );
    if (duplicate) {
      Swal.fire({
        title: "Duplicate Found",
        text: "A bank account with that account number already exists!",
        icon: "warning",
        confirmButtonColor: "#23471d",
      });
      return;
    }

    const selectedEvent = events.find((ev) => ev._id === formData.applicableEvent);

    const payload = {
      accountDisplayName: formData.accountDisplayName.trim(),
      accountname: formData.accountname.trim(),
      bankname: formData.bankname.trim(),
      accountno: trimmedAccountNo,
      ifsccode: formData.ifsccode.trim(),
      accountType: formData.accountType,
      bankbranch: formData.bankbranch.trim(),
      branchAddress: formData.branchAddress.trim(),
      swiftBic: formData.swiftBic.trim(),
      micrCode: formData.micrCode.trim(),
      openingBalance: formData.openingBalance === "" ? 0 : Number(formData.openingBalance),
      currency: formData.currency.trim() || "INR",
      upiEnabled: formData.upiEnabled,
      upiId: formData.upiEnabled ? formData.upiId.trim() : "",
      upiRegisteredName: formData.upiEnabled ? formData.upiRegisteredName.trim() : "",
      paymentGatewayLink: formData.paymentGatewayLink.trim(),
      purpose: formData.purpose,
      applicableEvent: formData.applicableEvent,
      applicableEventName: selectedEvent?.name || "",
      isPrimary: formData.isPrimary,
      showOnProformaInvoice: formData.showOnProformaInvoice,
      showOnTaxInvoice: formData.showOnTaxInvoice,
      showOnPaymentReceipt: formData.showOnPaymentReceipt,
      allowShareWithClient: formData.allowShareWithClient,
      status: formData.activeAccount ? "Active" : "Inactive",
      qrCodeFile: formData.upiEnabled ? formData.qrCodeFile : undefined,
    };

    try {
      if (editingBank) {
        const updatedData = buildUpdateDiff(payload, editingBank);
        await dispatch(
          updateBank({ id: editingBank._id, updatedData }),
        ).unwrap();

        Swal.fire({
          title: "Updated!",
          text: "Bank / UPI account updated successfully!",
          icon: "success",
          confirmButtonColor: "#23471d",
        });
      } else {
        await dispatch(addBank(payload)).unwrap();

        Swal.fire({
          title: "Success!",
          text: "Bank / UPI account added successfully!",
          icon: "success",
          confirmButtonColor: "#23471d",
        });
      }
      resetForm();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err?.message || `Failed to ${editingBank ? "update" : "create"} bank account.`,
        icon: "error",
        confirmButtonColor: "#23471d",
      });
    }
  };

  const handleEdit = (itemId) => {
    const item = banks.find((b) => b._id === itemId);
    if (!item) return;
    setFormData({
      accountDisplayName: item.accountDisplayName || "",
      accountname: item.accountname || "",
      bankname: item.bankname || "",
      accountno: item.accountno || "",
      confirmAccountno: item.accountno || "",
      ifsccode: item.ifsccode || "",
      accountType: item.accountType || "Current Account",
      bankbranch: item.bankbranch || "",
      branchAddress: item.branchAddress || "",
      swiftBic: item.swiftBic || "",
      micrCode: item.micrCode || "",
      openingBalance: item.openingBalance ?? "",
      currency: item.currency || "INR",
      upiEnabled: !!item.upiEnabled,
      upiId: item.upiId || "",
      upiRegisteredName: item.upiRegisteredName || "",
      qrCodeFile: null,
      qrCodePreview: item.qrCodeUrl ? `${SERVER_URL}${item.qrCodeUrl}` : "",
      paymentGatewayLink: item.paymentGatewayLink || "",
      purpose: Array.isArray(item.purpose) ? item.purpose : item.purpose ? [item.purpose] : [],
      applicableEvent: item.applicableEvent || "",
      isPrimary: !!item.isPrimary,
      showOnProformaInvoice: item.showOnProformaInvoice ?? true,
      showOnTaxInvoice: item.showOnTaxInvoice ?? true,
      showOnPaymentReceipt: item.showOnPaymentReceipt ?? true,
      allowShareWithClient: item.allowShareWithClient ?? true,
      activeAccount: isActiveStatus(item.status),
    });
    setEditingBank(item);
    setErrors({});
    setOpenMenuId(null);
  };

  // Deep-link support: "Edit Account" on the bank detail page opens this list pre-loaded into edit mode
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId && banks.some((b) => b._id === editId)) {
      handleEdit(editId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, banks]);

  const handleDelete = async (bankId) => {
    const bankToDelete = banks.find((b) => b._id === bankId);
    if (!bankToDelete) return;
    setOpenMenuId(null);

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete '${bankToDelete.accountDisplayName}'?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#23471d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteBank(bankId)).unwrap();

        Swal.fire({
          title: "Deleted!",
          text: "Bank / UPI account has been deleted.",
          icon: "success",
          confirmButtonColor: "#23471d",
        });
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: err?.message || "Failed to delete bank account.",
          icon: "error",
          confirmButtonColor: "#23471d",
        });
      }
    }
  };

  const handleSetPrimary = async (item) => {
    setOpenMenuId(null);
    try {
      await dispatch(
        updateBank({ id: item._id, updatedData: { isPrimary: true } }),
      ).unwrap();
      dispatch(fetchBanks());
      Swal.fire({
        title: "Updated!",
        text: `'${item.accountDisplayName}' is now the primary collection account.`,
        icon: "success",
        confirmButtonColor: "#23471d",
      });
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err?.message || "Failed to set primary account.",
        icon: "error",
        confirmButtonColor: "#23471d",
      });
    }
  };

  const openHistory = (item) => {
    setOpenMenuId(null);
    setHistoryBank(item);
    dispatch(fetchActivityLogs({ entityId: item._id, limit: 50 }));
  };

  const historyLogs = useMemo(
    () => (Array.isArray(activityLogs) ? activityLogs : []),
    [activityLogs],
  );

  const resetFilters = () => {
    setSearchText("");
    setStatusFilter("All");
    setUsageFilter("All");
    setEventFilter("All");
  };

  const filteredItems = useMemo(() => {
    let list = Array.isArray(banks) ? banks.filter(Boolean) : [];
    if (searchText.trim()) {
      const s = searchText.trim().toLowerCase();
      list = list.filter(
        (b) =>
          (b.accountDisplayName || "").toLowerCase().includes(s) ||
          (b.bankname || "").toLowerCase().includes(s) ||
          (b.accountno || "").toLowerCase().includes(s) ||
          (b.ifsccode || "").toLowerCase().includes(s) ||
          (b.upiId || "").toLowerCase().includes(s),
      );
    }
    if (statusFilter !== "All") list = list.filter((b) => formatStatus(b.status) === statusFilter);
    if (usageFilter !== "All")
      list = list.filter((b) => (Array.isArray(b.purpose) ? b.purpose.includes(usageFilter) : b.purpose === usageFilter));
    if (eventFilter !== "All") list = list.filter((b) => b.applicableEvent === eventFilter);
    return list;
  }, [banks, searchText, statusFilter, usageFilter, eventFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / rowsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const currentPageData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [filteredItems, currentPage, rowsPerPage]);

  const stats = useMemo(() => {
    const list = Array.isArray(banks) ? banks : [];
    return {
      total: list.length,
      active: list.filter((b) => isActiveStatus(b.status)).length,
      primary: list.find((b) => b.isPrimary),
      upiEnabled: list.filter((b) => b.upiEnabled).length,
    };
  }, [banks]);

  const inputCls = "rounded-[2px] border border-slate-400 h-9 focus:border-[#23471d] focus:ring-[#23471d]/10 transition-all text-[12px] bg-white placeholder:text-slate-400 text-slate-900 font-medium shadow-none outline-none px-3 w-full text-left disabled:bg-slate-100 disabled:text-slate-500";
  const labelCls = "text-[11px] font-bold text-slate-800 mb-1 block font-inter";
  const sectionHeaderClass = "text-[13px] font-bold text-[#23471d] font-inter flex items-center gap-2";

  return (
    <div className="bg-white shadow-md mt-6 min-h-screen font-inter animate-fadeIn flex items-start">
    <div className="flex-1 min-w-0 p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pb-4 border-b border-gray-100 bg-white px-2 py-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">
            Organiser Bank &amp; UPI Accounts
          </h1>
          <p className="text-[12px] text-gray-400 mt-1">
            Manage organiser bank accounts, UPI IDs and QR codes used for collections and payments.
          </p>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto py-6 space-y-6">
        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Landmark size={20} className="text-blue-600" />}
            iconBg="bg-blue-50"
            label="Total Accounts"
            value={stats.total}
            sub="All Organiser Accounts"
          />
          <StatCard
            icon={<CheckCircle2 size={20} className="text-green-600" />}
            iconBg="bg-green-50"
            label="Active Accounts"
            value={stats.active}
            sub="Ready to Use"
          />
          <StatCard
            icon={<ShieldCheck size={20} className="text-purple-600" />}
            iconBg="bg-purple-50"
            label="Primary Account"
            value={stats.primary ? stats.primary.bankname : "—"}
            sub="Set for Collections"
          />
          <StatCard
            icon={<QrCode size={20} className="text-orange-600" />}
            iconBg="bg-orange-50"
            label="UPI Enabled"
            value={stats.upiEnabled}
            sub="With QR Codes"
          />
        </div>

        {/* FILTER BAR */}
        <div className="bg-white border border-gray-200 rounded-[2px] p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by account name, bank, IFSC, UPI ID..."
              className={`${inputCls} pl-8`}
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputCls} md:w-40`}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select value={usageFilter} onChange={(e) => setUsageFilter(e.target.value)} className={`${inputCls} md:w-44`}>
            <option value="All">All Usage</option>
            {PURPOSE_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} className={`${inputCls} md:w-44`}>
            <option value="All">All Events</option>
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>{ev.name}</option>
            ))}
          </select>
          <button
            onClick={resetFilters}
            className="px-4 py-2 border border-slate-300 text-slate-600 text-[12px] font-bold flex items-center justify-center gap-2 rounded-[2px] hover:bg-slate-50 transition-all whitespace-nowrap"
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-gray-200 overflow-hidden shadow-sm rounded-[2px]">
          <div className="overflow-x-auto font-inter bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase text-left">Bank / Account Details</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase text-left">UPI ID / QR</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase text-left">Usage</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase text-center">Status</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase text-left">Updated Details</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={6} className="py-10 text-center text-gray-400 text-sm italic">Loading accounts...</td></tr>
                ) : currentPageData.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-gray-400 text-sm italic">No accounts found</td></tr>
                ) : (
                  currentPageData.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/60 transition-colors align-top">
                      <td className="px-5 py-4 text-[12px] text-slate-600 leading-relaxed">
                        <div className="flex items-start gap-1.5">
                          {item.isPrimary && <Star size={14} className="text-amber-400 fill-amber-400 mt-0.5 shrink-0" />}
                          <div>
                            <button
                              onClick={() => handleEdit(item._id)}
                              className="font-bold text-slate-800 hover:text-[#23471d] hover:underline text-left"
                            >
                              {item.bankname}
                            </button>
                            {item.isPrimary && (
                              <span className="block mt-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 w-fit">
                                Primary
                              </span>
                            )}
                            <p>A/C No.: {item.accountno}</p>
                            <p>IFSC: {item.ifsccode}</p>
                            <p className="text-slate-400">Branch: {item.bankbranch}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[12px]">
                        {item.upiEnabled ? (
                          <div className="flex items-center gap-2">
                            {item.qrCodeUrl ? (
                              <img
                                loading="lazy"
                                decoding="async"
                                src={`${SERVER_URL}${item.qrCodeUrl}`}
                                alt="QR"
                                className="w-12 h-12 border border-slate-200 rounded-[2px] object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 border border-dashed border-slate-300 rounded-[2px] flex items-center justify-center shrink-0 text-slate-300">
                                <QrCode size={20} />
                              </div>
                            )}
                            <div>
                              <p className="text-slate-700 font-medium">{item.upiId}</p>
                              <p className="text-green-700 text-[11px]">UPI Name: {item.upiRegisteredName}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-red-500 font-medium">UPI Not Enabled</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[12px] text-slate-600">
                        <p className="font-medium text-slate-800">{formatPurpose(item.purpose)}</p>
                        <p className="text-slate-400">{item.applicableEventName || "All Events"}</p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold ${
                          isActiveStatus(item.status)
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}>
                          {formatStatus(item.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[12px] text-slate-600">
                        <p>Added: {formatDateTime(item.added)}</p>
                        <p className="text-slate-400">
                          {item.updated && item.updated !== item.added ? `Updated: ${formatDateTime(item.updated)}` : "No updates yet"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-center relative">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => navigate(`/ihweClientData2026/AddBank/${item._id}`)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition" title="View">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleEdit(item._id)} className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition" title="Edit">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => openHistory(item)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition" title="History">
                            <History size={16} />
                          </button>
                          {!item.isPrimary && (
                            <button
                              onClick={() => setOpenMenuId(openMenuId === item._id ? null : item._id)}
                              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
                              title="More"
                            >
                              <MoreVertical size={16} />
                            </button>
                          )}
                        </div>
                        {openMenuId === item._id && (
                          <div className="absolute right-4 top-12 z-20 bg-white border border-slate-200 rounded-md shadow-lg w-44 text-left overflow-hidden">
                            <button
                              onClick={() => handleSetPrimary(item)}
                              className="w-full text-left px-4 py-2 text-[12px] text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Star size={13} /> Set as Primary
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-white px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Showing {filteredItems.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredItems.length)} of {filteredItems.length} accounts
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>
    </div>

      {/* ADD / EDIT PANEL — permanently docked beside the table, matching the reference layout */}
      <aside className="w-full max-w-md shrink-0 border-l border-slate-200 bg-white shadow-xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-[16px] font-bold text-slate-800">
                {editingBank ? "Edit Bank / UPI Account" : "Add Bank / UPI Account"}
              </h2>
              <button onClick={resetForm} title="Clear form" className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form id="bank-form" onSubmit={handleAddOrUpdateBank} className="p-6 space-y-8">
              {/* SECTION 1 */}
              <div className="space-y-4">
                <h3 className={sectionHeaderClass}>
                  <span className="w-5 h-5 rounded-full bg-[#23471d] text-white text-[10px] flex items-center justify-center">1</span>
                  Bank Details
                </h3>
                <div>
                  <label className={labelCls}>Account Name <span className="text-red-500">*</span></label>
                  <input type="text" name="accountDisplayName" value={formData.accountDisplayName} onChange={handleChange} className={inputCls} placeholder="e.g. IHWE Collection Account (Kotak)" />
                  {errors.accountDisplayName && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.accountDisplayName}</p>}
                </div>
                <div>
                  <label className={labelCls}>Account Holder Name <span className="text-red-500">*</span></label>
                  <input type="text" name="accountname" value={formData.accountname} onChange={handleChange} className={inputCls} placeholder="Enter account holder name" />
                  {errors.accountname && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.accountname}</p>}
                </div>
                <div>
                  <label className={labelCls}>Bank Name <span className="text-red-500">*</span></label>
                  <input type="text" name="bankname" value={formData.bankname} onChange={handleChange} className={inputCls} placeholder="Enter bank name" />
                  {errors.bankname && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.bankname}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Account Number <span className="text-red-500">*</span></label>
                    <input type="text" name="accountno" value={formData.accountno} onChange={handleChange} className={inputCls} placeholder="Account no." />
                    {errors.accountno && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.accountno}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Confirm Account Number <span className="text-red-500">*</span></label>
                    <input type="text" name="confirmAccountno" value={formData.confirmAccountno} onChange={handleChange} className={inputCls} placeholder="Re-enter account no." />
                    {errors.confirmAccountno && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.confirmAccountno}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>IFSC Code <span className="text-red-500">*</span></label>
                    <input type="text" name="ifsccode" value={formData.ifsccode} onChange={handleChange} className={inputCls} placeholder="IFSC code" />
                    {errors.ifsccode && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.ifsccode}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Account Type <span className="text-red-500">*</span></label>
                    <select name="accountType" value={formData.accountType} onChange={handleChange} className={inputCls}>
                      {ACCOUNT_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Branch Name <span className="text-red-500">*</span></label>
                    <input type="text" name="bankbranch" value={formData.bankbranch} onChange={handleChange} className={inputCls} placeholder="Branch" />
                    {errors.bankbranch && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.bankbranch}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>SWIFT / BIC (Optional)</label>
                    <input type="text" name="swiftBic" value={formData.swiftBic} onChange={handleChange} className={inputCls} placeholder="SWIFT / BIC" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Branch Address (Optional)</label>
                  <input type="text" name="branchAddress" value={formData.branchAddress} onChange={handleChange} className={inputCls} placeholder="e.g. Connaught Place, New Delhi – 110001" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>MICR Code (Optional)</label>
                    <input type="text" name="micrCode" value={formData.micrCode} onChange={handleChange} className={inputCls} placeholder="MICR code" />
                  </div>
                  <div>
                    <label className={labelCls}>Opening Balance</label>
                    <input type="number" name="openingBalance" value={formData.openingBalance} onChange={handleChange} className={inputCls} placeholder="0.00" />
                  </div>
                  <div>
                    <label className={labelCls}>Currency</label>
                    <input type="text" name="currency" value={formData.currency} onChange={handleChange} className={inputCls} placeholder="INR" />
                  </div>
                </div>
              </div>

              {/* SECTION 2 */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className={sectionHeaderClass}>
                    <span className="w-5 h-5 rounded-full bg-[#23471d] text-white text-[10px] flex items-center justify-center">2</span>
                    Digital Payment Details (UPI)
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="upiEnabled" className="sr-only peer" checked={formData.upiEnabled} onChange={handleChange} />
                    <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#23471d]"></div>
                  </label>
                </div>

                {formData.upiEnabled && (
                  <>
                    <div>
                      <label className={labelCls}>UPI ID / VPA <span className="text-red-500">*</span></label>
                      <input type="text" name="upiId" value={formData.upiId} onChange={handleChange} className={inputCls} placeholder="e.g. ihwe.collect@kotak" />
                      {errors.upiId && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.upiId}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>UPI Registered Name <span className="text-red-500">*</span></label>
                      <input type="text" name="upiRegisteredName" value={formData.upiRegisteredName} onChange={handleChange} className={inputCls} placeholder="Registered UPI name" />
                      {errors.upiRegisteredName && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.upiRegisteredName}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3 items-start">
                      <div>
                        <label className={labelCls}>Upload QR Code</label>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-300 rounded-[2px] hover:border-[#23471d] transition-colors cursor-pointer flex flex-col items-center justify-center text-center py-6 px-2 text-slate-400"
                        >
                          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" onChange={handleQrChange} className="hidden" />
                          <UploadCloud size={20} className="mb-1" />
                          <span className="text-[11px] font-medium">Click to upload</span>
                          <span className="text-[10px]">or drag and drop</span>
                          <span className="text-[10px]">PNG, JPG (Max. 2MB)</span>
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>QR Code Preview</label>
                        {qrSrc(formData) ? (
                          <div className="flex flex-col items-center gap-1">
                            <img loading="lazy" decoding="async" src={qrSrc(formData)} alt="QR Preview" className="w-24 h-24 object-cover border border-slate-200 rounded-[2px]" />
                            <button type="button" onClick={removeQr} className="text-[10px] text-red-500 font-bold hover:underline">Remove</button>
                          </div>
                        ) : (
                          <div className="w-24 h-24 border border-slate-200 rounded-[2px] flex items-center justify-center text-slate-300 mx-auto">
                            <QrCode size={28} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>UPI Linked Bank Account</label>
                      <input
                        type="text"
                        disabled
                        value={formData.bankname && formData.accountno ? `${formData.bankname} - ${formData.accountno}` : ""}
                        placeholder="Auto-filled from bank details above"
                        className={inputCls}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* SECTION 3 */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <h3 className={sectionHeaderClass}>
                  <span className="w-5 h-5 rounded-full bg-[#23471d] text-white text-[10px] flex items-center justify-center">3</span>
                  Payment Gateway
                </h3>
                <div>
                  <label className={labelCls}>Payment Gateway Link (Optional)</label>
                  <input
                    type="url"
                    name="paymentGatewayLink"
                    value={formData.paymentGatewayLink}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="e.g. https://pay.razorpay.com/..."
                  />
                  {errors.paymentGatewayLink && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.paymentGatewayLink}</p>}
                </div>
              </div>

              {/* SECTION 4 */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <h3 className={sectionHeaderClass}>
                  <span className="w-5 h-5 rounded-full bg-[#23471d] text-white text-[10px] flex items-center justify-center">4</span>
                  Usage &amp; Settings
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Purpose / Usage <span className="text-red-500">*</span></label>
                    <MultiSelectDropdown
                      options={PURPOSE_OPTIONS}
                      selected={formData.purpose}
                      onChange={(vals) => {
                        setFormData((prev) => ({ ...prev, purpose: vals }));
                        if (errors.purpose) setErrors((prev) => ({ ...prev, purpose: null }));
                      }}
                      placeholder="Select purpose(s)"
                      className={inputCls}
                    />
                    {errors.purpose && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.purpose}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Applicable Event <span className="text-red-500">*</span></label>
                    <select name="applicableEvent" value={formData.applicableEvent} onChange={handleChange} className={inputCls}>
                      <option value="">Select event</option>
                      {events.map((ev) => <option key={ev._id} value={ev._id}>{ev.name}</option>)}
                    </select>
                    {errors.applicableEvent && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.applicableEvent}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-1">
                  {[
                    ["isPrimary", "Set as Primary Collection Account"],
                    ["showOnPaymentReceipt", "Show on Payment Receipt"],
                    ["showOnProformaInvoice", "Show on Proforma Invoice"],
                    ["allowShareWithClient", "Allow Share with Client"],
                    ["showOnTaxInvoice", "Show on Tax Invoice"],
                    ["activeAccount", "Active Account"],
                  ].map(([name, label]) => (
                    <label key={name} className="flex items-center gap-2 text-[12px] text-slate-700 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        name={name}
                        checked={formData[name]}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-slate-300 text-[#23471d] focus:ring-[#23471d]"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </form>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
              <button type="button" onClick={resetForm} className="px-6 py-2.5 border border-slate-300 text-slate-600 text-[12px] font-bold rounded-[2px] hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button
                type="submit"
                form="bank-form"
                disabled={isLoading}
                className="px-8 py-2.5 bg-[#23471d] hover:bg-[#1a3516] text-white text-[12px] font-bold rounded-[2px] shadow-lg transition-all disabled:opacity-50"
              >
                {isLoading ? "Please wait..." : "Save Account"}
              </button>
            </div>
        </aside>

      {/* HISTORY MODAL — per-account timeline: when added, when updated, what changed */}
      {historyBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setHistoryBank(null)} />
          <div className="relative bg-white w-full max-w-xl max-h-[80vh] rounded-md shadow-2xl overflow-hidden flex flex-col">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-bold text-slate-800 flex items-center gap-2"><History size={16} /> History</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">{historyBank.bankname} · A/C {historyBank.accountno}</p>
              </div>
              <button onClick={() => setHistoryBank(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-3">
              {(() => {
                const createdLog = historyLogs.find((l) => l.action === "Created");
                // Records created before activity logging existed have no "Created" log —
                // fall back to the account's current field values so this section is never empty
                const createdFields = createdLog ? describeCreatedFields(createdLog) : describeLogFields(historyBank);
                return (
                  <div className="border border-slate-100 rounded-[2px] px-4 py-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                      <Wallet size={14} className="text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-slate-700">Account added</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatDateTime(historyBank.added)}</p>
                      {createdFields.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {createdFields.map((c) => (
                            <li key={c.label} className="text-[11px] text-slate-600">
                              <span className="font-medium text-slate-700">{c.label}:</span> {c.value}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })()}

              {auditLoading ? (
                <p className="text-center text-slate-400 text-sm italic py-6">Loading history...</p>
              ) : historyLogs.filter((l) => l.action === "Updated").length === 0 ? (
                <p className="text-center text-slate-400 text-sm italic py-6">No updates recorded yet.</p>
              ) : (
                historyLogs
                  .filter((log) => log.action === "Updated")
                  .map((log) => {
                    const changes = describeLogChanges(log);
                    return (
                      <div key={log._id} className="border border-slate-100 rounded-[2px] px-4 py-3 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                          <Pencil size={13} className="text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-medium text-slate-700">Updated by {log.user}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{formatDateTime(log.createdAt)}</p>
                          {changes.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {changes.map((c) => (
                                <li key={c.label} className="text-[11px] text-slate-600">
                                  <span className="font-medium text-slate-700">{c.label}:</span> {c.value}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBank;
