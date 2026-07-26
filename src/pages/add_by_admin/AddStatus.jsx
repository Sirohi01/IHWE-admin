// import React, { useEffect, useMemo, useState } from "react";
// import { Edit, Plus, Save, Search, Trash2, Filter, Info } from "lucide-react";
// import { useSelector, useDispatch } from "react-redux";
// import {
//   createStatusOption,
//   fetchStatusOptions,
//   updateStatusOption,
//   deleteStatusOption,
// } from "../../features/add_by_admin/statusOption/statusOptionSlice";
// import Swal from "sweetalert2";
// import PageHeader from "../../components/PageHeader";
// import { createActivityLogThunk } from "../../features/activityLog/activityLogSlice";

// const AddStatus = () => {
//   const dispatch = useDispatch();
//   const { statusOptions, loading: isLoading } = useSelector((state) => state.statusOptions) || {};

//   const [isSaving, setIsSaving] = useState(false);
//   const [isEditing, setIsEditing] = useState(null);
//   const [formData, setFormData] = useState({ name: "", status: "active" });
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("active");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   useEffect(() => { dispatch(fetchStatusOptions()); }, [dispatch]);

//   useEffect(() => {
//     const timer = setTimeout(() => { setDebouncedSearch(searchTerm); setCurrentPage(1); }, 300);
//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   const filtered = useMemo(() => {
//     let list = Array.isArray(statusOptions) ? statusOptions.filter(Boolean) : [];
//     if (debouncedSearch.trim()) list = list.filter((n) => (n?.name || "").toLowerCase().includes(debouncedSearch.trim().toLowerCase()));
//     if (statusFilter !== "All") list = list.filter((n) => (n?.status || "").toLowerCase() === statusFilter.toLowerCase());
//     return list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
//   }, [statusOptions, debouncedSearch, statusFilter]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
//   const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
//   useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [totalPages, currentPage]);

//   const resetForm = () => { setIsEditing(null); setFormData({ name: "", status: "active" }); setIsModalOpen(false); };

//   const startEdit = (id) => {
//     const item = (statusOptions || []).find((n) => n._id === id);
//     if (item) { setIsEditing(id); setFormData({ name: item.name, status: item.status || "active" }); setIsModalOpen(true); }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.name.trim()) return Swal.fire({ icon: "warning", title: "Missing Field", text: "Please enter a name", confirmButtonColor: "#23471d" });

//     const duplicate = (statusOptions || []).find((n) => (n?.name || "").trim().toLowerCase() === formData.name.trim().toLowerCase() && n._id !== isEditing);
//     if (duplicate) return Swal.fire({ title: "Duplicate", text: "This status already exists!", icon: "warning", confirmButtonColor: "#23471d" });

//     const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo") || "{}");
//     const updatedByName = adminInfo.fullName || adminInfo.name || adminInfo.username || "Admin";
//     const payload = { name: formData.name.trim(), status: formData.status, updated_by: updatedByName };

//     try {
//       setIsSaving(true);
//       if (isEditing) {
//         await dispatch(updateStatusOption({ id: isEditing, data: payload })).unwrap();
//         const userId = sessionStorage.getItem("user_id");
//         if (userId) dispatch(createActivityLogThunk({ user_id: userId, message: `System Config: Updated status '${formData.name}'`, section: "System Configuration", data: { action: "UPDATE", type: "STATUS_OPTION", name: formData.name } }));
//       } else {
//         await dispatch(createStatusOption(payload)).unwrap();
//         const userId = sessionStorage.getItem("user_id");
//         if (userId) dispatch(createActivityLogThunk({ user_id: userId, message: `System Config: Added status '${formData.name}'`, section: "System Configuration", data: { action: "ADD", type: "STATUS_OPTION", name: formData.name } }));
//       }
//       Swal.fire({ icon: "success", title: "Success", text: isEditing ? "Updated successfully" : "Added successfully", timer: 1500, showConfirmButton: false });
//       resetForm();
//       dispatch(fetchStatusOptions());
//     } catch (err) {
//       Swal.fire({ icon: "error", title: "Error", text: err?.message || "Operation failed", confirmButtonColor: "#23471d" });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     const item = (statusOptions || []).find((n) => n._id === id);
//     const result = await Swal.fire({ title: "Are you sure?", text: `Delete "${item?.name}"?`, icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", cancelButtonColor: "#3085d6", confirmButtonText: "Yes, delete it!" });
//     if (result.isConfirmed) {
//       try {
//         await dispatch(deleteStatusOption(id)).unwrap();
//         const userId = sessionStorage.getItem("user_id");
//         if (userId) dispatch(createActivityLogThunk({ user_id: userId, message: `System Config: Deleted status '${item?.name}'`, section: "System Configuration", data: { action: "DELETE", type: "STATUS_OPTION", name: item?.name } }));
//         Swal.fire("Deleted!", "Status has been deleted.", "success");
//         dispatch(fetchStatusOptions());
//       } catch (err) {
//         Swal.fire("Error", err?.message || "Failed to delete", "error");
//       }
//     }
//   };

//   return (
//     <div className="bg-white shadow-md mt-6 p-6 min-h-screen animate-fadeIn">
//       <PageHeader
//         title="Add Lead Status"
//         description="Manage Lead Status options for CRM | International Health & Wellness Expo 2026"
//       />

//       <div className="mt-6">
//         {isModalOpen && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//             <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
//               <button onClick={resetForm} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//               <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
//                 {isEditing ? <Edit className="w-5 h-5 text-[#d26019]" /> : <Plus className="w-5 h-5 text-[#d26019]" />}
//                 {isEditing ? "Edit Status" : "Add New Status"}
//               </h2>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status Name *</label>
//                   <input
//                     type="text"
//                     value={formData.name}
//                     onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
//                     placeholder="e.g. Hot Lead, Follow Up, Cold Lead"
//                     className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm font-semibold"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
//                   <div className="flex gap-2 mt-0.5">
//                     {["active", "inactive"].map((s) => (
//                       <label key={s} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12px] cursor-pointer transition-colors ${formData.status === s ? "bg-[#eef5ec] border-[#1e4018] text-[#1e4018]" : "border-gray-200 text-gray-500"}`}>
//                         <input type="radio" name="status" value={s} checked={formData.status === s} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))} className="accent-[#1e4018]" />
//                         {s.charAt(0).toUpperCase() + s.slice(1)}
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//                 <div className="flex gap-2 pt-2">
//                   <button type="submit" disabled={isSaving} className="flex-1 py-1 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2">
//                     {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /><span>{isEditing ? "Update" : "Save"}</span></>}
//                   </button>
//                   <button type="button" onClick={resetForm} className="px-4 py-1 bg-gray-500 text-white font-bold hover:bg-gray-600 transition-colors">Cancel</button>
//                 </div>
//               </form>
//               <div className="mt-4 p-4 bg-green-50 border border-green-100 flex gap-3">
//                 <Info className="w-5 h-5 text-green-600 shrink-0" />
//                 <p className="text-[10px] text-green-700 font-bold uppercase leading-relaxed">These status options will appear in the Lead Status Updates dropdown.</p>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="mb-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
//           <div className="flex flex-1 gap-4 items-center w-full md:w-auto">
//             <div className="relative flex-1 max-w-md">
//               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//               <input type="text" placeholder="Search by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#23471d] outline-none" />
//             </div>
//             <div className="relative">
//               <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//               <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#23471d] outline-none appearance-none bg-white cursor-pointer">
//                 <option value="All">All</option>
//                 <option value="active">Active</option>
//                 <option value="inactive">Inactive</option>
//               </select>
//             </div>
//           </div>
//           <button onClick={() => setIsModalOpen(true)} className="bg-[#23471d] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#1a3516] transition-colors whitespace-nowrap">
//             <Plus className="w-4 h-4" /> Add Status
//           </button>
//         </div>

//         <div className="overflow-x-auto border border-gray-200 rounded-lg">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
//                 <th className="p-4 font-bold border-b">S.No.</th>
//                 <th className="p-4 font-bold border-b">Name</th>
//                 <th className="p-4 font-bold border-b text-center">Status</th>
//                 <th className="p-4 font-bold border-b text-center">Created / Updated</th>
//                 <th className="p-4 font-bold border-b text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {isLoading ? (
//                 <tr><td colSpan="5" className="p-8 text-center text-gray-500"><div className="flex flex-col items-center gap-2"><div className="w-8 h-8 border-4 border-[#23471d]/20 border-t-[#23471d] rounded-full animate-spin" /><span className="text-sm font-medium">Loading...</span></div></td></tr>
//               ) : paginated.length > 0 ? (
//                 paginated.map((item, index) => (
//                   <tr key={item._id} className="hover:bg-gray-50 transition-colors">
//                     <td className="p-4 text-sm font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + index + 1}</td>
//                     <td className="p-4"><div className="font-md text-[#23471d]">{item.name}</div></td>
//                     <td className="p-4 text-center">
//                       <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-full ${item.status === "active" ? "bg-green-100 text-green-700 capitalize" : "bg-red-100 text-red-700 capitalize"}`}>{item.status}</span>
//                     </td>
//                     <td className="p-4 text-center">
//                       {item.updated_by && item.updated_by.trim() ? (
//                         <div className="flex flex-col items-center gap-0.5">
//                           <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold">{item.updated_by}</span>
//                           <span className="text-[10px] text-gray-400">{new Date(item.updated || item.updatedAt).toLocaleString()}</span>
//                         </div>
//                       ) : (
//                         <div className="flex flex-col items-center gap-0.5">
//                           <span className="text-[10px] text-gray-400">{item.added ? new Date(item.added).toLocaleString() : "-"}</span>
//                         </div>
//                       )}
//                     </td>
//                     <td className="p-4">
//                       <div className="flex items-center justify-center gap-2">
//                         <button onClick={() => startEdit(item._id)} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
//                         <button onClick={() => handleDelete(item._id)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr><td colSpan="5" className="p-8 text-center text-gray-500"><div className="flex flex-col items-center gap-2"><Info className="w-8 h-8 text-gray-400" /><p className="text-sm">No records found</p></div></td></tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {totalPages > 1 && (
//           <div className="mt-4 flex justify-end">
//             <div className="flex gap-1">
//               {Array.from({ length: totalPages }).map((_, i) => (
//                 <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium ${currentPage === i + 1 ? "bg-[#23471d] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{i + 1}</button>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AddStatus;
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
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";

import {
  createStatusOption,
  deleteStatusOption,
  fetchStatusOptions,
  updateStatusOption,
} from "../../features/add_by_admin/statusOption/statusOptionSlice";
import { createActivityLogThunk } from "../../features/activityLog/activityLogSlice";

const STATUS_DOT_COLORS = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-amber-500",
  "bg-violet-600",
  "bg-orange-500",
  "bg-teal-400",
  "bg-yellow-500",
  "bg-green-600",
  "bg-slate-400",
  "bg-red-500",
];

const safeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = safeDate(value);
  if (!date) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  const date = safeDate(value);
  if (!date) return "—";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getAdminName = () => {
  try {
    const storedValue =
      localStorage.getItem("adminInfo") ||
      sessionStorage.getItem("adminInfo") ||
      "{}";
    const adminInfo = JSON.parse(storedValue);

    return (
      adminInfo.fullName ||
      adminInfo.name ||
      adminInfo.username ||
      "Admin"
    );
  } catch {
    return "Admin";
  }
};

const getItemStatus = (item) =>
  String(item?.status || "inactive").toLowerCase() === "active"
    ? "active"
    : "inactive";

const getItemType = (item) => {
  const rawType = String(item?.type || "").toLowerCase();

  if (
    rawType === "system" ||
    item?.is_system === true ||
    item?.isSystem === true ||
    item?.system_defined === true
  ) {
    return "system";
  }

  return "manual";
};

const getItemDate = (item) =>
  item?.updated ||
  item?.updatedAt ||
  item?.added ||
  item?.createdAt ||
  item?.created_at;

const getAddedBy = (item) =>
  item?.added_by ||
  item?.created_by ||
  item?.updated_by ||
  item?.updatedBy ||
  "Admin";

const getDescription = (item) =>
  item?.description || item?.details || `${item?.name || "Lead"} status`;

const getUsedIn = (item) => item?.used_in || item?.usedIn || "Leads";

const SummaryCard = ({ icon: Icon, iconClass, iconWrapClass, label, value, note }) => (
  <div className="flex min-w-0 items-center gap-3 rounded-lg border border-[#e4e8ef] bg-white px-3 py-2.5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconWrapClass}`}
    >
      <Icon className={`h-5 w-5 ${iconClass}`} strokeWidth={2} />
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

const AddStatus = () => {
  const dispatch = useDispatch();
  const { statusOptions, loading: isLoading } =
    useSelector((state) => state.statusOptions) || {};

  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    status: "active",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchStatusOptions());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const normalizedOptions = useMemo(
    () => (Array.isArray(statusOptions) ? statusOptions.filter(Boolean) : []),
    [statusOptions]
  );

  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    return normalizedOptions.filter((item) => {
      const matchesSearch =
        !query || String(item?.name || "").toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "All" || getItemStatus(item) === statusFilter;
      const matchesType =
        typeFilter === "All" || getItemType(item) === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [normalizedOptions, debouncedSearch, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const summary = useMemo(() => {
    const active = normalizedOptions.filter(
      (item) => getItemStatus(item) === "active"
    ).length;
    const inactive = normalizedOptions.length - active;
    const system = normalizedOptions.filter(
      (item) => getItemType(item) === "system"
    ).length;

    const latestItem = [...normalizedOptions]
      .filter((item) => safeDate(getItemDate(item)))
      .sort(
        (a, b) =>
          safeDate(getItemDate(b)).getTime() - safeDate(getItemDate(a)).getTime()
      )[0];

    return {
      total: normalizedOptions.length,
      active,
      inactive,
      system,
      latestDate: latestItem ? formatDate(getItemDate(latestItem)) : "—",
      latestBy: latestItem ? getAddedBy(latestItem) : "No update yet",
    };
  }, [normalizedOptions]);

  const closeModal = () => {
    setIsEditing(null);
    setFormData({ name: "", status: "active" });
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    setIsEditing(null);
    setFormData({ name: "", status: "active" });
    setIsModalOpen(true);
  };

  const startEdit = (id) => {
    const item = normalizedOptions.find((option) => option?._id === id);
    if (!item) return;

    setIsEditing(id);
    setFormData({
      name: item.name || "",
      status: getItemStatus(item),
    });
    setIsModalOpen(true);
  };

  const logActivity = (message, action, name) => {
    const userId = sessionStorage.getItem("user_id");
    if (!userId) return;

    dispatch(
      createActivityLogThunk({
        user_id: userId,
        message,
        section: "System Configuration",
        data: {
          action,
          type: "STATUS_OPTION",
          name,
        },
      })
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please enter a status name.",
        confirmButtonColor: "#08752f",
      });
    }

    const duplicate = normalizedOptions.find(
      (item) =>
        String(item?.name || "").trim().toLowerCase() ===
        trimmedName.toLowerCase() && item?._id !== isEditing
    );

    if (duplicate) {
      return Swal.fire({
        icon: "warning",
        title: "Duplicate Status",
        text: "This lead status already exists.",
        confirmButtonColor: "#08752f",
      });
    }

    const payload = {
      name: trimmedName,
      status: formData.status,
      updated_by: getAdminName(),
    };

    try {
      setIsSaving(true);

      if (isEditing) {
        await dispatch(
          updateStatusOption({ id: isEditing, data: payload })
        ).unwrap();

        logActivity(
          `System Config: Updated status '${trimmedName}'`,
          "UPDATE",
          trimmedName
        );
      } else {
        await dispatch(createStatusOption(payload)).unwrap();

        logActivity(
          `System Config: Added status '${trimmedName}'`,
          "ADD",
          trimmedName
        );
      }

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: isEditing
          ? "Lead status updated successfully."
          : "Lead status added successfully.",
        timer: 1400,
        showConfirmButton: false,
      });

      closeModal();
      dispatch(fetchStatusOptions());
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "Operation failed.",
        confirmButtonColor: "#08752f",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (item) => {
    if (!item?._id) return;

    const nextStatus =
      getItemStatus(item) === "active" ? "inactive" : "active";
    const updatedByName = getAdminName();

    try {
      await dispatch(
        updateStatusOption({
          id: item._id,
          data: {
            name: item.name,
            status: nextStatus,
            updated_by: updatedByName,
          },
        })
      ).unwrap();

      logActivity(
        `System Config: Changed status '${item.name}' to ${nextStatus}`,
        "UPDATE",
        item.name
      );

      dispatch(fetchStatusOptions());
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Status Update Failed",
        text: error?.message || "Unable to change status.",
        confirmButtonColor: "#08752f",
      });
    }
  };

  const handleDelete = async (id) => {
    const item = normalizedOptions.find((option) => option?._id === id);

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete \"${item?.name || "this status"}\"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      await dispatch(deleteStatusOption(id)).unwrap();

      logActivity(
        `System Config: Deleted status '${item?.name || ""}'`,
        "DELETE",
        item?.name || ""
      );

      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Lead status has been deleted.",
        timer: 1200,
        showConfirmButton: false,
      });

      dispatch(fetchStatusOptions());
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error?.message || "Unable to delete this status.",
        confirmButtonColor: "#08752f",
      });
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setStatusFilter("All");
    setTypeFilter("All");
    setCurrentPage(1);
  };

  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) return [1, 2, 3, 4, 5];
    if (currentPage >= totalPages - 2) {
      return Array.from({ length: 5 }, (_, index) => totalPages - 4 + index);
    }

    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
  }, [currentPage, totalPages]);

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
              <span className="font-semibold text-[#19843c]">Add Lead Status</span>
            </nav>

            <h1 className="mt-4 text-[23px] font-semibold leading-none tracking-[-0.02em] text-[#14253f]">
              Lead Status Management
            </h1>
            <p className="mt-3 text-[12px] text-[#64758f]">
              Manage lead status options used in CRM for lead tracking.
            </p>
          </div>

          <div className="grid min-h-[92px] grid-cols-[minmax(0,1fr)_250px] overflow-hidden rounded-lg border border-[#e2e7ee] bg-white shadow-[0_1px_4px_rgba(15,23,42,0.04)]">
            <div className="flex min-w-0 items-start gap-3 px-4 py-4">
              <Info className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#3577d4]" />
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[#263754]">
                  About Lead Status
                </p>
                <p className="mt-2 max-w-[520px] text-[11px] leading-5 text-[#63738c]">
                  Lead status helps your team track the progress of leads and
                  measure conversion from enquiry to booking.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center border-l border-[#e7ebf0] px-4">
              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#08752f] px-4 text-[13px] font-semibold text-white shadow-[0_2px_5px_rgba(8,117,47,0.22)] transition hover:bg-[#066326]"
              >
                <Plus className="h-4 w-4" strokeWidth={2.2} />
                Add New Lead Status
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
            label="Total Status"
            value={summary.total}
            note="All lead statuses"
          />
          <SummaryCard
            icon={CheckCircle2}
            iconClass="text-emerald-600"
            iconWrapClass="bg-emerald-50"
            label="Active Status"
            value={summary.active}
            note="Currently in use"
          />
          <SummaryCard
            icon={FileWarning}
            iconClass="text-amber-500"
            iconWrapClass="bg-amber-50"
            label="Inactive Status"
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
            label="System Status"
            value={summary.system}
            note="Auto / System defined"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-[minmax(250px,1.15fr)_minmax(190px,0.75fr)_minmax(190px,0.75fr)_1fr_auto] items-end gap-4 px-1">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a4afbf]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by status name..."
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
              Type
            </span>
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full appearance-none rounded-md border border-[#dce2e9] bg-white px-3 pr-9 text-[12px] font-medium text-[#31415a] outline-none focus:border-[#4e8c66]"
            >
              <option value="All">All</option>
              <option value="manual">Manual</option>
              <option value="system">System</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#65768e]" />
          </label>

          <div />

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
            <table className="h-full w-full table-fixed border-collapse text-left">
              <colgroup>
                <col className="w-[3.5%]" />
                <col className="w-[14%]" />
                <col className="w-[8%]" />
                <col className="w-[22%]" />
                <col className="w-[9%]" />
                <col className="w-[9%]" />
                <col className="w-[14%]" />
                <col className="w-[12%]" />
                <col className="w-[8.5%]" />
              </colgroup>

              <thead>
                <tr className="h-11 border-b border-[#dfe5eb] bg-[#f7f9fb] text-[11px] font-semibold text-[#53637b]">
                  <th className="px-4">#</th>
                  <th className="px-3">Status Name</th>
                  <th className="px-3">Type</th>
                  <th className="px-3">Description</th>
                  <th className="px-3">Status</th>
                  <th className="px-3">Used In</th>
                  <th className="px-3">Added On</th>
                  <th className="px-3">Added By</th>
                  <th className="px-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="text-[11.5px] text-[#34445d]">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="text-center">
                      <div className="flex h-full flex-col items-center justify-center gap-3 text-[#728199]">
                        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#08752f]/20 border-t-[#08752f]" />
                        <span className="text-[12px] font-medium">
                          Loading lead statuses...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : paginated.length > 0 ? (
                  paginated.map((item, index) => {
                    const itemStatus = getItemStatus(item);
                    const itemType = getItemType(item);
                    const absoluteIndex =
                      (currentPage - 1) * itemsPerPage + index;

                    return (
                      <tr
                        key={item?._id || `${item?.name}-${absoluteIndex}`}
                        className="border-b border-[#e7ebef] transition last:border-b-0 hover:bg-[#fbfcfd]"
                      >
                        <td className="px-4 font-medium text-[#52627a]">
                          {absoluteIndex + 1}
                        </td>

                        <td className="px-3">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span
                              className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT_COLORS[
                                absoluteIndex % STATUS_DOT_COLORS.length
                                ]
                                }`}
                            />
                            <span className="truncate font-semibold text-[#263754]">
                              {item?.name || "Unnamed Status"}
                            </span>
                          </div>
                        </td>

                        <td className="px-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${itemType === "system"
                                ? "bg-[#eaf2ff] text-[#3f78c7]"
                                : "bg-[#eaf8ef] text-[#2d9b58]"
                              }`}
                          >
                            {itemType}
                          </span>
                        </td>

                        <td className="truncate px-3 text-[#53637a]">
                          {getDescription(item)}
                        </td>

                        <td className="px-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={itemStatus === "active"}
                              onClick={() => handleToggleStatus(item)}
                              className={`relative inline-flex h-[22px] w-[40px] shrink-0 rounded-full transition-colors ${itemStatus === "active"
                                  ? "bg-[#0b8a3d]"
                                  : "bg-[#e7ebf0]"
                                }`}
                              title={`Set ${itemStatus === "active" ? "inactive" : "active"
                                }`}
                            >
                              <span
                                className={`absolute top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${itemStatus === "active"
                                    ? "translate-x-[21px]"
                                    : "translate-x-[3px]"
                                  }`}
                              />
                            </button>

                            {itemStatus === "inactive" && (
                              <span className="text-[10.5px] font-medium text-[#77869a]">
                                Inactive
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="truncate px-3 font-medium text-[#53637a]">
                          {getUsedIn(item)}
                        </td>

                        <td className="truncate px-3 text-[#53637a]">
                          {formatDateTime(getItemDate(item))}
                        </td>

                        <td className="truncate px-3 font-medium text-[#53637a]">
                          {getAddedBy(item)}
                        </td>

                        <td className="px-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(item?._id)}
                              className="flex h-7 w-7 items-center justify-center rounded bg-[#edf6ff] text-[#4c9be8] transition hover:bg-[#dbeeff]"
                              title="Edit status"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item?._id)}
                              className="flex h-7 w-7 items-center justify-center rounded bg-[#fff1f1] text-[#ec5d63] transition hover:bg-[#ffe1e1]"
                              title="Delete status"
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
                    <td colSpan={9} className="text-center">
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-[#7b899b]">
                        <Info className="h-7 w-7 text-[#a4afbd]" />
                        <p className="text-[12px] font-medium">
                          No lead statuses found
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
                  Manual
                </span>
                <span>Manually created status</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#eaf2ff] px-2.5 py-1 font-semibold text-[#3f78c7]">
                  System
                </span>
                <span>Auto / System defined status</span>
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

              {visiblePageNumbers.map((pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[11px] font-semibold transition ${currentPage === pageNumber
                      ? "bg-[#08752f] text-white shadow-[0_1px_3px_rgba(8,117,47,0.2)]"
                      : "border border-[#e7ebef] bg-white text-[#6b798f] hover:bg-[#f5f7fa]"
                    }`}
                >
                  {pageNumber}
                </button>
              ))}

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

      {/* Add / Edit modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/45 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-[440px] overflow-hidden rounded-xl border border-[#e1e6ec] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e7ebef] px-5 py-4">
              <div>
                <h2 className="text-[17px] font-semibold text-[#172842]">
                  {isEditing ? "Edit Lead Status" : "Add New Lead Status"}
                </h2>
                <p className="mt-1 text-[11px] text-[#758399]">
                  {isEditing
                    ? "Update the selected lead status."
                    : "Create a new status for lead tracking."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#8390a3] transition hover:bg-[#f2f4f7]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold text-[#4c5c73]">
                  Status Name <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  autoFocus
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Follow-up"
                  className="h-11 w-full rounded-md border border-[#d8dfe8] px-3 text-[13px] text-[#263754] outline-none placeholder:text-[#a0abb9] focus:border-[#338153] focus:ring-2 focus:ring-[#338153]/10"
                />
              </label>

              <div>
                <span className="mb-2 block text-[11px] font-semibold text-[#4c5c73]">
                  Status
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {["active", "inactive"].map((status) => (
                    <label
                      key={status}
                      className={`flex h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-[12px] font-medium capitalize transition ${formData.status === status
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
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-10 flex-1 rounded-md border border-[#d7dee7] bg-white text-[12px] font-semibold text-[#53637a] transition hover:bg-[#f5f7fa]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-[#08752f] text-[12px] font-semibold text-white transition hover:bg-[#066326] disabled:cursor-not-allowed disabled:opacity-65"
                >
                  {isSaving ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isEditing ? "Update Status" : "Save Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default AddStatus;
