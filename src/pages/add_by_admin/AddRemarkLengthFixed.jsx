import React, { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { createActivityLogThunk } from "../../features/activityLog/activityLogSlice";
import Swal from "sweetalert2";

const INITIAL_DATA = [{ id: 1, name: "50", status: "Active" }];

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let p = start; p <= end; p++) pages.push(p);

  const btnCls = "w-8 h-8 flex items-center justify-center border border-slate-300 bg-white text-[11px] font-bold rounded-[2px] hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed";
  const activeBtnCls = "w-8 h-8 flex items-center justify-center border border-[#23471d] bg-[#23471d] text-white text-[11px] font-bold rounded-[2px] transition-colors";

  return (
    <div className="flex items-center gap-1.5 mt-2">
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

const AddRemarkLengthFixed = () => {
  const dispatch = useDispatch();
  const [fixLengths, setFixLengths] = useState(INITIAL_DATA);
  const [editingFixLength, setEditingFixLength] = useState(null);
  const [formData, setFormData] = useState({ name: "", status: "Active" });
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState({ key: "id", dir: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const getUserInfo = () => {
    const userStr = sessionStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};
    const userId = sessionStorage.getItem("user_id") || user._id;
    const userName = sessionStorage.getItem("user_name") || user.name || "User";
    return { userId, userName };
  };

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const resetForm = () => { setFormData({ name: "", status: "Active" }); setEditingFixLength(null); };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      Swal.fire({ title: "Error", text: "Please enter a value!", icon: "error", confirmButtonColor: "#23471d" });
      return;
    }
    const duplicate = fixLengths.find((c) => c.name.trim().toLowerCase() === trimmedName.toLowerCase() && (!editingFixLength || c.id !== editingFixLength.id));
    if (duplicate) {
      Swal.fire({ title: "Duplicate", text: "This length already exists!", icon: "warning", confirmButtonColor: "#23471d" });
      return;
    }

    const { userId } = getUserInfo();

    try {
      if (editingFixLength) {
        setFixLengths((prev) => prev.map((item) => item.id === editingFixLength.id ? { ...item, name: trimmedName, status: formData.status } : item));
        dispatch(createActivityLogThunk({
          user_id: userId,
          message: `Remark Length: Updated length "${editingFixLength.name}" to "${trimmedName}"`,
          section: "Remark Length",
          data: { action: "update", old: editingFixLength, new: { name: trimmedName, status: formData.status } }
        }));
        Swal.fire({ title: "Updated!", text: "Remark Length updated successfully!", icon: "success", confirmButtonColor: "#23471d" });
      } else {
        const nextId = fixLengths.length > 0 ? Math.max(...fixLengths.map((c) => c.id)) + 1 : 1;
        const newFixLength = { id: nextId, name: trimmedName, status: formData.status };
        setFixLengths((prev) => [...prev, newFixLength]);
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Added new fixed length '${trimmedName}'`,
            section: "System Configuration",
            data: { action: "ADD", type: "REMARK_LENGTH", name: trimmedName }
          }));
        }
        Swal.fire({ title: "Success!", text: "Remark Length added successfully!", icon: "success", confirmButtonColor: "#23471d" });
      }
      resetForm();
    } catch (err) {
      Swal.fire({ title: "Error", text: "Something went wrong!", icon: "error", confirmButtonColor: "#23471d" });
    }
  };

  const handleEdit = (itemId) => {
    const item = fixLengths.find((i) => i.id === itemId);
    if (item) { setFormData({ name: item.name, status: item.status }); setEditingFixLength(item); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };

  const handleDelete = async (id) => {
    const itemToDelete = fixLengths.find((c) => c.id === id);
    if (!itemToDelete) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete this length '${itemToDelete.name}'?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#23471d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        setFixLengths((prev) => prev.filter((c) => c.id !== id));
        const { userId } = getUserInfo();
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Deleted fixed length '${itemToDelete.name}'`,
            section: "System Configuration",
            data: { action: "DELETE", type: "REMARK_LENGTH", name: itemToDelete.name }
          }));
        }
        Swal.fire({ title: "Deleted!", text: "Deleted successfully!", icon: "success", confirmButtonColor: "#23471d" });
        if (editingFixLength && editingFixLength.id === id) resetForm();
      } catch (err) {
        Swal.fire({ title: "Error", text: "Failed to delete.", icon: "error", confirmButtonColor: "#23471d" });
      }
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    let list = [...fixLengths];
    if (searchText.trim()) list = list.filter((c) => c.name.toLowerCase().includes(searchText.trim().toLowerCase()));
    if (statusFilter !== "All") list = list.filter((c) => c.status === statusFilter);
    const { key, dir } = sortBy;
    list.sort((a, b) => {
      let av = key === "id" ? Number(a[key]) : (a[key] || "").toLowerCase();
      let bv = key === "id" ? Number(b[key]) : (b[key] || "").toLowerCase();
      return av < bv ? (dir === "asc" ? -1 : 1) : av > bv ? (dir === "asc" ? 1 : -1) : 0;
    });
    return list;
  }, [fixLengths, searchText, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedItems.length / rowsPerPage));
  const currentPageData = useMemo(() => filteredAndSortedItems.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage), [filteredAndSortedItems, currentPage, rowsPerPage]);
  const toggleSort = (key) => setSortBy((prev) => prev.key === key ? { ...prev, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });

  const inputCls = "rounded-[2px] border border-slate-400 h-8 focus:border-[#23471d] focus:outline-none transition-all text-[12px] bg-white placeholder:text-slate-400 text-slate-900 font-medium px-3 w-full";
  const labelCls = "text-[11px] font-bold text-slate-800 mb-1 block";

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-inter animate-fadeIn">
      {/* ── HEADER AREA ── */}
      <div className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b border-gray-100 bg-white px-2 py-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-normal text-gray-600 uppercase tracking-tight leading-none">
            FIX LENGTH CONFIGURATION
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            Remark Length Settings | CRM Configuration
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6 space-y-8">
        {/* Form Container */}
        <div className="bg-white shadow-md border border-gray-200 rounded-[2px] overflow-hidden">
          {/* ── SUB-HEADER ── */}
          <div className="bg-slate-50/50 border-b border-slate-200 px-6 py-3">
            <h2 className="text-[16px] font-bold text-slate-800 uppercase tracking-tight">
              {editingFixLength ? "Edit Fix Length" : "Add Fix Length"}
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-0.5 font-bold">
              International Health & Wellness Expo 2026
            </p>
          </div>

          <div className="p-6 lg:p-10">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                <div>
                  <label className={labelCls}>Fix Length Value <span className="text-red-500">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputCls} placeholder="e.g., 50, 100, 200" required />
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
                {editingFixLength && (
                  <button type="button" onClick={resetForm} className="px-8 py-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all rounded-[2px] shadow-sm">
                    Cancel Edit
                  </button>
                )}
                <button type="submit" className="px-12 py-2.5 bg-[#23471d] hover:bg-[#1a3516] text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-[2px] shadow-lg flex items-center gap-3">
                  {editingFixLength ? "Update Fix Length" : "Save Fix Length"}
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
                  Remark Length Registry
                </h2>
                <p className="text-sm text-green-100 mt-0.5">
                  Showing {filteredAndSortedItems.length} entries
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto font-inter bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-black">
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center w-20">
                    <button onClick={() => toggleSort("id")} className="flex items-center gap-1 mx-auto hover:text-gray-300 uppercase">No. {sortBy.key === "id" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-left">
                    <button onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-gray-300 uppercase">Fix Length {sortBy.key === "name" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center w-[150px]">
                    <button onClick={() => toggleSort("status")} className="flex items-center gap-1 mx-auto hover:text-gray-300 uppercase">Status {sortBy.key === "status" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center w-[120px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedItems.length === 0 ? (
                  <tr><td colSpan={4} className="py-10 text-center text-gray-400 text-sm italic">No entries found</td></tr>
                ) : currentPageData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors border-b border-gray-100">
                    <td className="px-6 py-4 text-sm text-gray-900 text-center font-bold">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                    <td 
                      onClick={() => handleEdit(item.id)}
                      className="px-6 py-4 text-sm text-red-600 hover:text-red-800 cursor-pointer hover:underline font-medium uppercase tracking-tight"
                    >
                      {item?.name} Characters
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        item.status?.toLowerCase() === "active" 
                        ? "bg-green-50 text-green-700 border border-green-200" 
                        : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleEdit(item.id)} 
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition" 
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)} 
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
              Showing {filteredAndSortedItems.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredAndSortedItems.length)} of {filteredAndSortedItems.length} entries
            </div>
            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRemarkLengthFixed;

