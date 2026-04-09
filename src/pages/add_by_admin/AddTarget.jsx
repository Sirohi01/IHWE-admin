import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { createActivityLogThunk } from "../../features/activityLog/activityLogSlice";
import Swal from "sweetalert2";


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

const LOCAL_STORAGE_KEY = "app_user_targets_v1";
const USER_LIST = [
  "Abhay Raj", "Rohit", "ADMIN", "Chiranjeev Sharma", "Manoj Mishra",
  "Prerna Pandey", "Rishav Singh", "Shrigi Rawat", "Sumit Mistra", "Tanya Jaiswal", "Vijay Sharma",
];

const AddTarget = () => {
  const dispatch = useDispatch();
  const [editingTarget, setEditingTarget] = useState(null);
  const [formData, setFormData] = useState({ user: "", target: "", status: "Active" });
  const [targets, setTargets] = useState(() => {
    try {
      const raw = sessionStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [
      { id: 1, user: "sumit mishra", target: 100, status: "Active" },
      { id: 2, user: "Chiranjeev Sharma", target: 100, status: "Active" },
      { id: 3, user: "prerna pandey", target: 100, status: "Active" },
      { id: 4, user: "abhay raj", target: 100, status: "Active" },
    ];
  });

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState({ key: "id", dir: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const getUserInfo = () => {
    const userStr = sessionStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};
    const userId = sessionStorage.getItem("user_id") || user._id;
    return { userId };
  };

  useEffect(() => {
    try { sessionStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(targets)); } catch (e) {}
  }, [targets]);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const resetForm = () => { setFormData({ user: "", target: "", status: "Active" }); setEditingTarget(null); };

  const handleAddTarget = (e) => {
    if (e) e.preventDefault();
    if (!formData.user || !formData.target) {
      Swal.fire({ title: "Error", text: "Please fill in all required fields!", icon: "error", confirmButtonColor: "#23471d" });
      return;
    }
    const duplicate = targets.find((t) => t.user.toLowerCase() === formData.user.toLowerCase() && (!editingTarget || t.id !== editingTarget.id));
    if (duplicate) {
      Swal.fire({ title: "Duplicate", text: "Target for this user already exists!", icon: "warning", confirmButtonColor: "#23471d" });
      return;
    }

    const { userId } = getUserInfo();

    try {
      if (editingTarget) {
        setTargets((prev) => prev.map((item) => item.id === editingTarget.id ? { ...item, user: formData.user, target: Number(formData.target), status: formData.status } : item));
        
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Updated target for user '${formData.user}'`,
            section: "System Configuration",
            data: { action: "UPDATE", type: "USER_TARGET", user_name: formData.user, target: formData.target }
          }));
        }
        Swal.fire({ title: "Updated!", text: "Target updated successfully!", icon: "success", confirmButtonColor: "#23471d" });
      } else {
        const newId = targets.length > 0 ? Math.max(...targets.map((c) => c.id)) + 1 : 1;
        setTargets((prev) => [...prev, { id: newId, user: formData.user, target: Number(formData.target), status: formData.status }]);
        
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Added new target for user '${formData.user}'`,
            section: "System Configuration",
            data: { action: "ADD", type: "USER_TARGET", user_name: formData.user, target: formData.target }
          }));
        }
        Swal.fire({ title: "Success!", text: "Target added successfully!", icon: "success", confirmButtonColor: "#23471d" });
      }
      resetForm();
    } catch (err) {
      Swal.fire({ title: "Error", text: "Something went wrong!", icon: "error", confirmButtonColor: "#23471d" });
    }
  };

  const handleEdit = (itemId) => {
    const item = targets.find((i) => i.id === itemId);
    if (item) { setFormData({ user: item.user, target: item.target, status: item.status }); setEditingTarget(item); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };

  const handleDelete = async (itemId) => {
    const itemToDelete = targets.find((i) => i.id === itemId);
    if (!itemToDelete) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete target for user '${itemToDelete.user}'?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#23471d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        setTargets((prev) => prev.filter((c) => c.id !== itemId));
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Deleted target for user '${itemToDelete.user}'`,
            section: "System Configuration",
            data: { action: "DELETE", type: "USER_TARGET", user_name: itemToDelete.user }
          }));
        }
        Swal.fire({ title: "Deleted!", text: "Target has been deleted.", icon: "success", confirmButtonColor: "#23471d" });
        if (editingTarget && editingTarget.id === itemId) resetForm();
      } catch (err) {
        Swal.fire({ title: "Error", text: "Failed to delete target.", icon: "error", confirmButtonColor: "#23471d" });
      }
    }
  };

  const filteredAndSorted = useMemo(() => {
    let list = [...targets];
    if (searchText?.trim()) list = list.filter((c) => c.user.toLowerCase().includes(searchText.trim().toLowerCase()) || String(c.target).includes(searchText.trim()));
    if (statusFilter === "Active" || statusFilter === "Inactive") list = list.filter((c) => c.status === statusFilter);
    const { key, dir } = sortBy;
    list.sort((a, b) => {
      let av = (key === "id" || key === "target") ? Number(a[key]) : (a[key] || "").toString().toLowerCase();
      let bv = (key === "id" || key === "target") ? Number(b[key]) : (b[key] || "").toString().toLowerCase();
      return av < bv ? (dir === "asc" ? -1 : 1) : av > bv ? (dir === "asc" ? 1 : -1) : 0;
    });
    return list;
  }, [targets, searchText, statusFilter, sortBy]);

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
          <h1 className="text-xl font-bold text-slate-500 uppercase tracking-tight">USER TARGET CONFIGURATION</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Sales Target Management | Performance Tracking</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6 space-y-8">
        <div className="bg-white shadow-md border border-gray-200 rounded-[2px] overflow-hidden">
          <div className="bg-slate-50/50 border-b border-slate-200 px-6 py-3">
            <h2 className="text-[16px] font-bold text-slate-800 uppercase">{editingTarget ? "Edit Target" : "Add Target"}</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-0.5 font-bold">International Health & Wellness Expo 2026</p>
          </div>
          <div className="p-6 lg:p-10">
            <form onSubmit={handleAddTarget}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div>
                  <label className={labelCls}>Assign User <span className="text-red-500">*</span></label>
                  <select name="user" value={formData.user} onChange={handleChange} className={inputCls} disabled={!!editingTarget} required>
                    <option value="">Select User</option>
                    {USER_LIST.map((user) => <option key={user} value={user}>{user}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Target Value <span className="text-red-500">*</span></label>
                  <input type="number" name="target" value={formData.target} onChange={handleChange} className={inputCls} placeholder="e.g., 100" required />
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
                {editingTarget && (
                  <button type="button" onClick={resetForm} className="px-8 py-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all rounded-[2px]">Cancel Edit</button>
                )}
                <button type="submit" className="px-12 py-2.5 bg-[#23471d] hover:bg-[#1a3516] text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-[2px] shadow-lg">
                  {editingTarget ? "Update Target" : "Save Target"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* LIST AREA */}
        <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b bg-[#23471d]">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white uppercase tracking-tight">
                  User Target Registry
                </h2>
                <p className="text-sm text-green-100 mt-0.5">
                  Showing {filteredAndSorted.length} assigned targets
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input type="text" placeholder="Search targets..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="h-9 w-48 pl-3 text-xs border border-white/30 bg-white/10 text-white placeholder:text-white/50 outline-none focus:bg-white/20 rounded-[2px]" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-2 text-xs border border-white/30 bg-white/10 text-white outline-none rounded-[2px]">
                  <option value="All" className="text-black">All Status</option>
                  <option value="Active" className="text-black">Active</option>
                  <option value="Inactive" className="text-black">Inactive</option>
                </select>
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
                    <button onClick={() => toggleSort("user")} className="flex items-center gap-1 hover:text-gray-300 uppercase">User {sortBy.key === "user" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-left">
                    <button onClick={() => toggleSort("target")} className="flex items-center gap-1 hover:text-gray-300 uppercase">Target {sortBy.key === "target" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center w-32">
                    <button onClick={() => toggleSort("status")} className="flex items-center gap-1 mx-auto hover:text-gray-300 uppercase">Status {sortBy.key === "status" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center w-[120px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSorted.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-gray-400 text-sm italic">No targets found</td></tr>
                ) : currentPageData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors border-b border-gray-100">
                    <td className="px-6 py-4 text-sm text-gray-900 text-center font-bold">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                    <td 
                      onClick={() => handleEdit(item.id)}
                      className="px-6 py-4 text-sm text-red-600 hover:text-red-800 cursor-pointer hover:underline font-medium uppercase tracking-tight"
                    >
                      {item.user}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600 font-bold">{item.target}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === "Active" 
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
              Showing {filteredAndSorted.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredAndSorted.length)} of {filteredAndSorted.length} entries
            </div>
            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTarget;
