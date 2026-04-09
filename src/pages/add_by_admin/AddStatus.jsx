import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  createStatusOption,
  fetchStatusOptions,
  updateStatusOption,
  deleteStatusOption,
} from "../../features/add_by_admin/statusOption/statusOptionSlice";
import Swal from "sweetalert2";
import { createActivityLogThunk } from "../../features/activityLog/activityLogSlice";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let p = start; p <= end; p++) pages.push(p);
  const btnCls = "w-8 h-8 flex items-center justify-center border border-slate-300 bg-white text-[11px] font-bold rounded-[2px] hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed";
  const activeBtnCls = "w-8 h-8 flex items-center justify-center border border-[#23471d] bg-[#23471d] text-white text-[11px] font-bold rounded-[2px]";
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className={btnCls}>{"<<"}</button>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={btnCls}>{"<"}</button>
      {start > 1 && <span className="px-1 text-slate-400 text-[10px] font-bold">...</span>}
      {pages.map((p) => <button key={p} onClick={() => onPageChange(p)} className={p === currentPage ? activeBtnCls : btnCls}>{p}</button>)}
      {end < totalPages && <span className="px-1 text-slate-400 text-[10px] font-bold">...</span>}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={btnCls}>{">"}</button>
      <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className={btnCls}>{">>"}</button>
    </div>
  );
};

const AddStatus = () => {
  const dispatch = useDispatch();
  const [editingStatus, setEditingStatus] = useState(null);
  const [formData, setFormData] = useState({ name: "", status: "Active" });
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState({ key: "name", dir: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { statusOptions, loading: isLoading } = useSelector((state) => state.statusOptions) || {};

  useEffect(() => { dispatch(fetchStatusOptions()); }, [dispatch]);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const resetForm = () => { setFormData({ name: "", status: "Active" }); setEditingStatus(null); };

  const handleAddStatus = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name?.trim()) {
      Swal.fire({
        title: "Error",
        text: "Please enter a status name!",
        icon: "error",
        confirmButtonColor: "#23471d",
      });
      return;
    }
    const trimmedName = formData.name.trim();
    const duplicate = (Array.isArray(statusOptions) ? statusOptions : []).find(
      (item) => (item?.name || "").trim().toLowerCase() === trimmedName.toLowerCase() && (!editingStatus || item._id !== editingStatus._id)
    );
    if (duplicate) {
      Swal.fire({
        title: "Duplicate",
        text: "A status with that name already exists!",
        icon: "warning",
        confirmButtonColor: "#23471d",
      });
      return;
    }
    const statusData = { name: trimmedName, status: formData.status.toLowerCase() };
    try {
      if (editingStatus) {
        await dispatch(updateStatusOption({ id: editingStatus._id, data: statusData })).unwrap();
        
        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Updated status option '${formData.name}'`,
            section: "System Configuration",
            data: { action: "UPDATE", type: "STATUS_OPTION", name: formData.name }
          }));
        }

        Swal.fire({
          title: "Updated!",
          text: "Status updated successfully!",
          icon: "success",
          confirmButtonColor: "#23471d",
        });
      } else {
        await dispatch(createStatusOption(statusData)).unwrap();
        
        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Added new status option '${formData.name}'`,
            section: "System Configuration",
            data: { action: "ADD", type: "STATUS_OPTION", name: formData.name }
          }));
        }

        Swal.fire({
          title: "Success!",
          text: "Status added successfully!",
          icon: "success",
          confirmButtonColor: "#23471d",
        });
      }
      resetForm(); dispatch(fetchStatusOptions());
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: `Failed to ${editingStatus ? "update" : "create"} status.`,
        icon: "error",
        confirmButtonColor: "#23471d",
      });
    }
  };

  const handleEdit = (statusId) => {
    const s = statusOptions.find((item) => item?._id === statusId);
    if (s) {
      setFormData({ name: s.name, status: s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : "Active" });
      setEditingStatus(s); window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (statusId) => {
    const statusToDelete = statusOptions.find((item) => item._id === statusId);
    if (!statusToDelete) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete status option '${statusToDelete.name}'?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#23471d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteStatusOption(statusId)).unwrap();
        
        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Deleted status option '${statusToDelete.name}'`,
            section: "System Configuration",
            data: { action: "DELETE", type: "STATUS_OPTION", name: statusToDelete.name }
          }));
        }

        Swal.fire({
          title: "Deleted!",
          text: "Status option has been deleted.",
          icon: "success",
          confirmButtonColor: "#23471d",
        });
        dispatch(fetchStatusOptions());
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: "Failed to delete status.",
          icon: "error",
          confirmButtonColor: "#23471d",
        });
      }
    }
  };

  const filteredAndSorted = useMemo(() => {
    let list = Array.isArray(statusOptions) ? statusOptions.filter(Boolean) : [];
    if (searchText?.trim()) list = list.filter((item) => (item?.name || "").toLowerCase().includes(searchText.trim().toLowerCase()));
    if (statusFilter === "Active" || statusFilter === "Inactive") list = list.filter((item) => (item?.status || "").toLowerCase() === statusFilter.toLowerCase());
    const { key, dir } = sortBy;
    list.sort((a, b) => {
      let av = (a[key] || "").toString().toLowerCase();
      let bv = (b[key] || "").toString().toLowerCase();
      return av < bv ? (dir === "asc" ? -1 : 1) : av > bv ? (dir === "asc" ? 1 : -1) : 0;
    });
    return list;
  }, [statusOptions, searchText, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / rowsPerPage));
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [totalPages, currentPage]);
  const currentPageData = useMemo(() => filteredAndSorted.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage), [filteredAndSorted, currentPage, rowsPerPage]);
  const toggleSort = (key) => setSortBy((prev) => prev.key === key ? { ...prev, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });

  const inputCls = "rounded-[2px] border border-slate-400 h-8 focus:border-[#23471d] focus:outline-none transition-all text-[12px] bg-white placeholder:text-slate-400 text-slate-900 font-medium px-3 w-full";
  const labelCls = "text-[11px] font-bold text-slate-800 mb-1 block";

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-inter animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b border-gray-100 px-2 py-4">
        <div>
          <h1 className="text-xl font-bold text-slate-500 uppercase tracking-tight">STATUS CONFIGURATION</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Lead Status Management | CRM Configuration</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6 space-y-8">
        <div className="bg-white shadow-md border border-gray-200 rounded-[2px] overflow-hidden">
          <div className="bg-slate-50/50 border-b border-slate-200 px-6 py-3">
            <h2 className="text-[16px] font-bold text-slate-800 uppercase">{editingStatus ? "Edit Status" : "Add Status"}</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-0.5 font-bold">International Health & Wellness Expo 2026</p>
          </div>
          <div className="p-6 lg:p-10">
            <form onSubmit={handleAddStatus}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                <div>
                  <label className={labelCls}>Status Name <span className="text-red-500">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputCls} placeholder="e.g., Hot Lead, Cold Lead, Follow Up" required />
                </div>
                <div>
                  <label className={labelCls}>Status <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-6 h-8">
                    {["Active", "Inactive"].map((s) => (
                      <label key={s} className="flex items-center gap-2 text-[12px] text-slate-700 font-bold cursor-pointer">
                        <input type="radio" name="status" value={s} checked={formData.status === s} onChange={handleChange} className="accent-[#23471d]" /> {s}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                {editingStatus && (
                  <button type="button" onClick={resetForm} className="px-8 py-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all rounded-[2px]">Cancel Edit</button>
                )}
                <button type="submit" className="px-12 py-2.5 bg-[#23471d] hover:bg-[#1a3516] text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-[2px] shadow-lg" disabled={isLoading}>
                  {isLoading ? "Processing..." : editingStatus ? "Update Status" : "Save Status"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* LIST AREA */}
        <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b bg-[#23471d]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white uppercase tracking-tight">
                  Status Registry
                </h2>
                <p className="text-sm text-green-100 mt-0.5">
                  Showing {filteredAndSorted.length} variants
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto font-inter bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-black">
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center w-20">No.</th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-left">
                    <button onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-gray-300 uppercase">Name {sortBy.key === "name" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center w-[150px]">
                    <button onClick={() => toggleSort("status")} className="flex items-center gap-1 mx-auto hover:text-gray-300 uppercase">Status {sortBy.key === "status" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center w-[120px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr><td colSpan={4} className="py-10 text-center text-gray-400 text-sm italic">Loading Status Options...</td></tr>
                ) : filteredAndSorted.length === 0 ? (
                  <tr><td colSpan={4} className="py-10 text-center text-gray-400 text-sm italic">No status options found</td></tr>
                ) : currentPageData.map((statusItem, index) => (
                  <tr key={statusItem._id} className="hover:bg-blue-50 transition-colors border-b border-gray-100">
                    <td className="px-6 py-4 text-sm text-gray-900 text-center font-bold">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                    <td 
                      onClick={() => handleEdit(statusItem._id)}
                      className="px-6 py-4 text-sm text-red-600 hover:text-red-800 cursor-pointer hover:underline font-medium uppercase tracking-tight"
                    >
                      {statusItem?.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        statusItem.status?.toLowerCase() === "active" 
                        ? "bg-green-50 text-green-700 border border-green-200" 
                        : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {statusItem.status?.charAt(0).toUpperCase() + statusItem.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleEdit(statusItem._id)} 
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition" 
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(statusItem._id)} 
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition" 
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-inner">
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredAndSorted.length)} of {filteredAndSorted.length} entries
            </div>
            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStatus;
