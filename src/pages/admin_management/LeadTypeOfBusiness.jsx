import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Plus,
  Edit2,
  Trash2,
  Edit,
  List,
  Search,
  ChevronLeft,
  ChevronRight,
  BadgeHelp,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import api from "../../lib/api";
import PageHeader from "../../components/PageHeader";

export default function LeadTypeOfBusiness() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ name: "", order: 1, status: "Active" });

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/api/lead-type-of-business");
      const data = res.data?.data || res.data || [];
      setItems(Array.isArray(data) ? data : []);
      if (!isEditing) {
        setForm((prev) => ({
          ...prev,
          order: (Array.isArray(data) ? data.length : 0) + 1,
        }));
      }
    } catch (err) {
      console.error("Error fetching Lead Type of Business:", err);
      Swal.fire("Error", "Failed to load data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getAdminId = () => {
    const adminData =
      localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
    if (adminData) {
      try {
        const parsed = JSON.parse(adminData);
        return parsed.username || parsed.fullName || parsed.name || "admin";
      } catch (e) {}
    }
    return "admin";
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      return Swal.fire("Warning", "Please enter the Business Type Name", "warning");
    }
    setIsLoading(true);
    const payload = {
      name: form.name.trim(),
      order: Number(form.order) || 0,
      status: form.status,
      added_by: getAdminId(),
    };

    try {
      if (isEditing) {
        await api.put(`/api/lead-type-of-business/${editingId}`, {
          ...payload,
          updated_by: getAdminId(),
        });
        Swal.fire({
          icon: "success",
          title: "Updated!",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await api.post("/api/lead-type-of-business", payload);
        Swal.fire({
          icon: "success",
          title: "Added!",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      fetchData();
      resetForm();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to save",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (item) => {
    setIsEditing(true);
    setEditingId(item._id);
    setForm({
      name: item.name || "",
      order: item.order || 0,
      status: item.status || "Active",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteItem = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This business type option will be removed from Lead forms.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (!result.isConfirmed) return;

    setIsLoading(true);
    try {
      await api.delete(`/api/lead-type-of-business/${id}`);
      Swal.fire("Deleted!", "Business type removed.", "success");
      fetchData();
    } catch (err) {
      Swal.fire("Error", "Failed to delete", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (item) => {
    const newStatus = item.status === "Active" ? "Inactive" : "Active";
    try {
      await api.put(`/api/lead-type-of-business/${item._id}`, {
        status: newStatus,
        updated_by: getAdminId(),
      });
      fetchData();
    } catch (err) {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  const resetForm = () => {
    setForm({ name: "", order: items.length + 1, status: "Active" });
    setIsEditing(false);
    setEditingId(null);
  };

  // Filter & Pagination
  const filteredItems = items.filter((item) =>
    (item.name || "").toLowerCase().includes(search.toLowerCase())
  );
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const paginatedData = filteredItems.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  return (
    <div className="bg-white shadow-md p-6 min-h-screen">
      <PageHeader
        title="LEAD: TYPE OF BUSINESS"
        description="Manage the Type of Business dropdown options shown in the Add New Lead registration form"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* ─── Left: Form ─── */}
        <div className="lg:col-span-1 space-y-6">
          {/* Add / Edit Card */}
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
              {isEditing ? (
                <Edit className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              {isEditing ? "Edit Business Type" : "Add New Business Type"}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Business Type Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Pvt. Ltd. Company"
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                />
              </div>

              {/* Order */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm bg-white cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isEditing ? (
                    <>
                      <Edit className="w-4 h-4" /> Update Type
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Add Type
                    </>
                  )}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Help Box */}
          <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-xs text-gray-500 flex items-start gap-3">
            <BadgeHelp size={18} className="text-[#23471d] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-700 mb-1">Management Tips:</p>
              <ul className="list-disc list-inside space-y-1 font-medium italic">
                <li>
                  Options added here automatically appear in the{" "}
                  <strong>Type of Business</strong> dropdown in the{" "}
                  <strong>Add New Lead</strong> form.
                </li>
                <li>Set Status to <strong>Inactive</strong> to hide an option without deleting it.</li>
                <li>Use the <strong>Order</strong> field to control display sequence.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ─── Right: Table ─── */}
        <div className="lg:col-span-2">
          <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden rounded-lg">
            {/* Table Header */}
            <div className="px-6 py-4 border-b bg-[#23471d] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <List className="w-5 h-5 text-[#d26019]" /> Business Type Options
                </h2>
                <span className="bg-[#d26019] text-white text-[10px] font-bold px-2 py-1 rounded">
                  {totalItems} ITEMS
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                {/* Show limit */}
                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded px-3 py-2 w-full sm:w-auto justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Show
                  </span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border-none bg-transparent outline-none text-sm font-bold text-[#23471d] cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-60">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search business type..."
                    className="w-full bg-white px-4 py-2 pl-10 rounded text-sm text-gray-900 border border-gray-300 outline-none focus:ring-2 focus:ring-[#d26019]"
                  />
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-[10px] uppercase font-black tracking-widest border-b">
                    <th className="px-5 py-4">No.</th>
                    <th className="px-5 py-4">Business Type Name</th>
                    <th className="px-5 py-4 text-center">Order</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-5 py-10 text-center text-gray-400 text-sm"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-5 py-12 text-center text-gray-500 italic text-sm"
                      >
                        No business types found. Add your first option above.
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item, index) => (
                      <tr
                        key={item._id || index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-bold text-[#23471d] text-sm">
                          {(currentPage - 1) * limit + index + 1}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-900 text-sm">
                          {item.name}
                        </td>
                        <td className="px-5 py-3.5 text-center font-bold text-gray-600 text-sm">
                          {item.order || "—"}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <button
                            onClick={() => toggleStatus(item)}
                            className="flex items-center gap-1.5 mx-auto group"
                            title="Toggle Status"
                          >
                            {item.status === "Active" ? (
                              <ToggleRight
                                size={22}
                                className="text-green-500 group-hover:text-green-700 transition-colors"
                              />
                            ) : (
                              <ToggleLeft
                                size={22}
                                className="text-red-500 group-hover:text-red-700 transition-colors"
                              />
                            )}
                            <span
                              className={`text-xs font-bold ${
                                item.status === "Active"
                                  ? "text-green-600"
                                  : "text-red-500"
                              }`}
                            >
                              {item.status}
                            </span>
                          </button>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => startEdit(item)}
                              className="text-blue-500 hover:text-blue-700 p-1.5 rounded hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => deleteItem(item._id)}
                              className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between flex-wrap gap-3">
              <span className="text-sm text-gray-600 font-medium">
                Showing {totalItems === 0 ? 0 : (currentPage - 1) * limit + 1} to{" "}
                {Math.min(currentPage * limit, totalItems)} of {totalItems} entries
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded font-bold text-sm ${
                        currentPage === idx + 1
                          ? "bg-[#23471d] text-white"
                          : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
