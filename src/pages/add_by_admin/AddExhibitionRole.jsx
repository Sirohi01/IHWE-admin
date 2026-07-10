import React, { useEffect, useMemo, useState } from "react";
import { Edit, Filter, Info, Plus, Save, Search, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import PageHeader from "../../components/PageHeader";
import {
  createExhibitionRole,
  deleteExhibitionRole,
  fetchExhibitionRoles,
  updateExhibitionRole,
} from "../../features/add_by_admin/exhibitionRole/exhibitionRoleSlice";
import { createActivityLogThunk } from "../../features/activityLog/activityLogSlice";

const AddExhibitionRole = () => {
  const dispatch = useDispatch();
  const { exhibitionRoles, loading } = useSelector((state) => state.exhibitionRoles) || {};
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", status: "active" });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  useEffect(() => {
    dispatch(fetchExhibitionRoles());
  }, [dispatch]);

  const adminName = () => {
    const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo") || "{}");
    return adminInfo.fullName || adminInfo.name || adminInfo.username || "Admin";
  };

  const filtered = useMemo(() => {
    let list = Array.isArray(exhibitionRoles) ? exhibitionRoles.filter(Boolean) : [];
    if (searchTerm.trim()) {
      list = list.filter((item) => (item.name || "").toLowerCase().includes(searchTerm.trim().toLowerCase()));
    }
    if (statusFilter !== "All") {
      list = list.filter((item) => (item.status || "").toLowerCase() === statusFilter.toLowerCase());
    }
    return list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [exhibitionRoles, searchTerm, statusFilter]);

  const resetForm = () => {
    setIsEditing(null);
    setFormData({ name: "", status: "active" });
    setIsModalOpen(false);
  };

  const startEdit = (item) => {
    setIsEditing(item._id);
    setFormData({ name: item.name || "", status: item.status || "active" });
    setIsModalOpen(true);
  };

  const logAction = (message, data) => {
    const userId = sessionStorage.getItem("user_id");
    if (userId) {
      dispatch(createActivityLogThunk({ user_id: userId, message, section: "System Configuration", data }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = formData.name.trim();
    if (!name) return Swal.fire("Missing Field", "Please enter role name", "warning");

    const duplicate = (exhibitionRoles || []).find((item) => (item.name || "").trim().toLowerCase() === name.toLowerCase() && item._id !== isEditing);
    if (duplicate) return Swal.fire("Duplicate", "This exhibition role already exists", "warning");

    try {
      setIsSaving(true);
      const payload = { name, status: formData.status, updated_by: adminName() };
      if (isEditing) {
        await dispatch(updateExhibitionRole({ id: isEditing, data: payload })).unwrap();
        logAction(`System Config: Updated exhibition role '${name}'`, { action: "UPDATE", type: "EXHIBITION_ROLE", name });
      } else {
        await dispatch(createExhibitionRole(payload)).unwrap();
        logAction(`System Config: Added exhibition role '${name}'`, { action: "ADD", type: "EXHIBITION_ROLE", name });
      }
      Swal.fire({ icon: "success", title: "Success", text: isEditing ? "Role updated successfully" : "Role added successfully", timer: 1400, showConfirmButton: false });
      resetForm();
      dispatch(fetchExhibitionRoles());
    } catch (err) {
      Swal.fire("Error", err?.message || err?.message?.message || err?.message || "Operation failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete "${item?.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (!result.isConfirmed) return;

    try {
      await dispatch(deleteExhibitionRole(item._id)).unwrap();
      logAction(`System Config: Deleted exhibition role '${item.name}'`, { action: "DELETE", type: "EXHIBITION_ROLE", name: item.name });
      Swal.fire("Deleted!", "Exhibition role has been deleted.", "success");
    } catch (err) {
      Swal.fire("Error", err?.message || "Failed to delete", "error");
    }
  };

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen animate-fadeIn">
      <PageHeader
        title="Role at Exhibition"
        description="Manage role options used in Add Team Members"
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button onClick={resetForm} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none">x</button>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
              {isEditing ? <Edit className="w-5 h-5 text-[#d26019]" /> : <Plus className="w-5 h-5 text-[#d26019]" />}
              {isEditing ? "Edit Exhibition Role" : "Add Exhibition Role"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Stall Incharge"
                  className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                <div className="flex gap-2">
                  {["active", "inactive"].map((status) => (
                    <label key={status} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12px] cursor-pointer ${formData.status === status ? "bg-[#eef5ec] border-[#1e4018] text-[#1e4018]" : "border-gray-200 text-gray-500"}`}>
                      <input type="radio" name="status" value={status} checked={formData.status === status} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))} className="accent-[#1e4018]" />
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={isSaving} className="flex-1 py-2 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2">
                  {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> {isEditing ? "Update" : "Save"}</>}
                </button>
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-500 text-white font-bold hover:bg-gray-600 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="my-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex flex-1 gap-4 items-center w-full md:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search role..." className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#23471d] outline-none" />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#23471d] outline-none appearance-none bg-white cursor-pointer">
              <option value="All">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#23471d] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#1a3516] transition-colors whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add Role
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-300 rounded-lg">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
              <th className="px-3 py-2 font-bold border border-gray-300 w-16 text-center">S.No.</th>
              <th className="px-3 py-2 font-bold border border-gray-300">Role Name</th>
              <th className="px-3 py-2 font-bold border border-gray-300 text-center w-28">Status</th>
              <th className="px-3 py-2 font-bold border border-gray-300 text-center w-36">Updated By</th>
              <th className="px-3 py-2 font-bold border border-gray-300 text-center w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="px-3 py-6 text-center text-gray-500 border border-gray-300">Loading...</td></tr>
            ) : filtered.length ? (
              filtered.map((item, index) => (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-1.5 text-center font-medium text-gray-900 border border-gray-300">{index + 1}</td>
                  <td className="px-3 py-1.5 font-semibold text-[#23471d] border border-gray-300">{item.name}</td>
                  <td className="px-3 py-1.5 text-center border border-gray-300">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${item.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{item.status}</span>
                  </td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-500 border border-gray-300">{item.updated_by || "System"}</td>
                  <td className="px-3 py-1.5 border border-gray-300">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => startEdit(item)} className="p-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item)} className="p-1 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="px-3 py-6 text-center text-gray-500 border border-gray-300"><Info className="w-8 h-8 mx-auto mb-2 text-gray-400" />No roles found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddExhibitionRole;
