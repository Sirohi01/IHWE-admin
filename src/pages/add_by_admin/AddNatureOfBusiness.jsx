import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchNatures,
  createNature,
  updateNature,
  deleteNature,
} from "../../features/add_by_admin/nature/natureSlice";
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

const AddNatureOfBusiness = () => {
  const dispatch = useDispatch();
  const [editingNature, setEditingNature] = useState(null);
  const [formData, setFormData] = useState({ name: "", status: "Active" });
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState({ key: "nature_id", dir: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { natures, loading: isLoading } = useSelector((state) => state.natures);

  useEffect(() => { dispatch(fetchNatures()); }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => { setFormData({ name: "", status: "Active" }); setEditingNature(null); };

  const handleAddNature = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name?.trim()) {
      Swal.fire({
        title: "Error",
        text: "Please enter a name!",
        icon: "error",
        confirmButtonColor: "#23471d",
      });
      return;
    }
    const trimmedName = formData.name.trim();
    const duplicate = (Array.isArray(natures) ? natures : []).find(
      (n) => (n?.nature_name || "").trim().toLowerCase() === trimmedName.toLowerCase() && (!editingNature || n._id !== editingNature._id)
    );
    if (duplicate) {
      Swal.fire({
        title: "Duplicate",
        text: "A nature of business with that name already exists!",
        icon: "warning",
        confirmButtonColor: "#23471d",
      });
      return;
    }
    const newNatureId = natures?.length > 0 ? Math.max(...natures.map((n) => n.nature_id || 0)) + 1 : 1;
    const natureData = { nature_id: newNatureId, nature_name: trimmedName, nature_status: formData.status.toLowerCase(), added: new Date().toISOString() };
    try {
      if (editingNature) {
        await dispatch(updateNature({ id: editingNature._id, updates: natureData })).unwrap();
        
        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Updated nature of business '${formData.name}'`,
            section: "System Configuration",
            data: { action: "UPDATE", type: "NATURE_OF_BUSINESS", name: formData.name }
          }));
        }

        Swal.fire({
          title: "Updated!",
          text: "Nature of Business updated successfully!",
          icon: "success",
          confirmButtonColor: "#23471d",
        });
      } else {
        await dispatch(createNature(natureData)).unwrap();
        
        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Added new nature of business '${formData.name}'`,
            section: "System Configuration",
            data: { action: "ADD", type: "NATURE_OF_BUSINESS", name: formData.name }
          }));
        }

        Swal.fire({
          title: "Success!",
          text: "Nature of Business added successfully!",
          icon: "success",
          confirmButtonColor: "#23471d",
        });
      }
      resetForm(); dispatch(fetchNatures());
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: `Failed to ${editingNature ? "update" : "create"} Nature of Business.`,
        icon: "error",
        confirmButtonColor: "#23471d",
      });
    }
  };

  const handleEdit = (natureId) => {
    const n = natures.find((nat) => nat?._id === natureId);
    if (n) {
      setFormData({ name: n.nature_name, status: n.nature_status ? n.nature_status.charAt(0).toUpperCase() + n.nature_status.slice(1) : "Active" });
      setEditingNature(n); window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (natureId) => {
    const natureToDelete = natures.find((n) => n._id === natureId);
    if (!natureToDelete) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete nature of business '${natureToDelete.nature_name}'?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#23471d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteNature(natureId)).unwrap();
        
        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Deleted nature of business '${natureToDelete.nature_name}'`,
            section: "System Configuration",
            data: { action: "DELETE", type: "NATURE_OF_BUSINESS", name: natureToDelete.nature_name }
          }));
        }

        Swal.fire({
          title: "Deleted!",
          text: "Nature of Business has been deleted.",
          icon: "success",
          confirmButtonColor: "#23471d",
        });
        dispatch(fetchNatures());
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: "Failed to delete Nature of Business.",
          icon: "error",
          confirmButtonColor: "#23471d",
        });
      }
    }
  };

  const filteredAndSortedNatures = useMemo(() => {
    let list = Array.isArray(natures) ? natures.filter(Boolean) : [];
    if (searchText?.trim()) list = list.filter((n) => (n?.nature_name || "").toLowerCase().includes(searchText.trim().toLowerCase()));
    if (statusFilter === "Active" || statusFilter === "Inactive") list = list.filter((n) => (n?.nature_status || "").toLowerCase() === statusFilter.toLowerCase());
    const { key, dir } = sortBy;
    list.sort((a, b) => {
      let av = key === "nature_id" ? Number(a[key]) : (a[key] || "").toString().toLowerCase();
      let bv = key === "nature_id" ? Number(b[key]) : (b[key] || "").toString().toLowerCase();
      return av < bv ? (dir === "asc" ? -1 : 1) : av > bv ? (dir === "asc" ? 1 : -1) : 0;
    });
    return list;
  }, [natures, searchText, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedNatures.length / rowsPerPage));
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [totalPages, currentPage]);
  const currentPageData = useMemo(() => filteredAndSortedNatures.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage), [filteredAndSortedNatures, currentPage, rowsPerPage]);
  const toggleSort = (key) => setSortBy((prev) => prev.key === key ? { ...prev, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });

  const inputCls = "rounded-[2px] border border-slate-400 h-8 focus:border-[#23471d] focus:outline-none transition-all text-[12px] bg-white placeholder:text-slate-400 text-slate-900 font-medium px-3 w-full";
  const labelCls = "text-[11px] font-bold text-slate-800 mb-1 block";

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-inter animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b border-gray-100 px-2 py-4">
        <div>
          <h1 className="text-xl font-bold text-slate-500 uppercase tracking-tight">NATURE OF BUSINESS CONFIGURATION</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Business Categories | Lead Classification</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6 space-y-8">
        <div className="bg-white shadow-md border border-gray-200 rounded-[2px] overflow-hidden">
          <div className="bg-slate-50/50 border-b border-slate-200 px-6 py-3">
            <h2 className="text-[16px] font-bold text-slate-800 uppercase">{editingNature ? "Edit Nature of Business" : "Add Nature of Business"}</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-0.5 font-bold">International Health & Wellness Expo 2026</p>
          </div>
          <div className="p-6 lg:p-10">
            <form onSubmit={handleAddNature}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                <div>
                  <label className={labelCls}>Business Name <span className="text-red-500">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputCls} placeholder="e.g., Distributor, Retailer, Manufacturer" required />
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
                {editingNature && (
                  <button type="button" onClick={resetForm} className="px-8 py-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all rounded-[2px]">Cancel Edit</button>
                )}
                <button type="submit" className="px-12 py-2.5 bg-[#23471d] hover:bg-[#1a3516] text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-[2px] shadow-lg" disabled={isLoading}>
                  {isLoading ? "Processing..." : editingNature ? "Update" : "Save"}
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
                  Nature of Business Registry
                </h2>
                <p className="text-sm text-green-100 mt-0.5">
                  Showing {filteredAndSortedNatures.length} categories
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto font-inter bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-black">
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center w-20">
                    <button onClick={() => toggleSort("nature_id")} className="flex items-center gap-1 mx-auto hover:text-gray-300 uppercase">No. {sortBy.key === "nature_id" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-left">
                    <button onClick={() => toggleSort("nature_name")} className="flex items-center gap-1 hover:text-gray-300 uppercase">Business Name {sortBy.key === "nature_name" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center w-[150px]">
                    <button onClick={() => toggleSort("nature_status")} className="flex items-center gap-1 mx-auto hover:text-gray-300 uppercase">Status {sortBy.key === "nature_status" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center w-[120px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr><td colSpan={4} className="py-10 text-center text-gray-400 text-sm italic">Loading...</td></tr>
                ) : filteredAndSortedNatures.length === 0 ? (
                  <tr><td colSpan={4} className="py-10 text-center text-gray-400 text-sm italic">No entries found</td></tr>
                ) : currentPageData.map((nature, index) => (
                  <tr key={nature._id} className="hover:bg-blue-50 transition-colors border-b border-gray-100">
                    <td className="px-6 py-4 text-sm text-gray-900 text-center font-bold">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                    <td 
                      onClick={() => handleEdit(nature._id)}
                      className="px-6 py-4 text-sm text-red-600 hover:text-red-800 cursor-pointer hover:underline font-medium uppercase tracking-tight"
                    >
                      {nature?.nature_name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        nature.nature_status?.toLowerCase() === "active" 
                        ? "bg-green-50 text-green-700 border border-green-200" 
                        : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {nature.nature_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleEdit(nature._id)} 
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition" 
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(nature._id)} 
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
              Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredAndSortedNatures.length)} of {filteredAndSortedNatures.length} entries
            </div>
            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNatureOfBusiness;
