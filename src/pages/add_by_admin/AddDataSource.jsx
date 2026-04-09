import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDataSources, createDataSource, updateDataSource, deleteDataSource } from "../../features/add_by_admin/dataSource/dataSourceSlice";
import Swal from "sweetalert2";
import { createActivityLogThunk } from "../../features/activityLog/activityLogSlice";

/** Standardized Pagination component */
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

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={p === currentPage ? activeBtnCls : btnCls}
        >
          {p}
        </button>
      ))}

      {end < totalPages && <span className="px-1 text-slate-400 text-[10px] font-bold">...</span>}

      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={btnCls}>{">"}</button>
      <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className={btnCls}>{">>"}</button>
    </div>
  );
};

const AddDataSource = () => {
  const dispatch = useDispatch();
  const [editingSource, setEditingSource] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    status: "Active",
  });

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState({ key: "source_id", dir: "asc" });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const dataSourcesState = useSelector((state) => state.dataSources);
  const dataSources = Array.isArray(dataSourcesState?.dataSources)
    ? dataSourcesState.dataSources
    : [];
  const isLoading = dataSourcesState?.loading ?? false;

  useEffect(() => {
    dispatch(fetchDataSources());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({ name: "", status: "Active" });
    setEditingSource(null);
  };

  const handleAddDataSource = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.name.trim()) {
      Swal.fire({
        title: "Error",
        text: "Please enter a source name!",
        icon: "error",
        confirmButtonColor: "#23471d",
      });
      return;
    }

    const trimmedName = formData.name.trim();
    const duplicate = dataSources.find(
      (s) =>
        (s?.source_name || "").trim().toLowerCase() ===
          trimmedName.toLowerCase() &&
        (!editingSource || s._id !== editingSource._id),
    );
    if (duplicate) {
      Swal.fire({
        title: "Duplicate",
        text: "A data source with that name already exists!",
        icon: "warning",
        confirmButtonColor: "#23471d",
      });
      return;
    }

    const newSourceId =
      dataSources.length > 0
        ? Math.max(...dataSources.map((s) => s.source_id || 0)) + 1
        : 1;

    const dataSourceData = {
      source_id: newSourceId,
      source_name: trimmedName,
      source_status: formData.status.toLowerCase(),
      added: new Date().toISOString(),
    };

    try {
      if (editingSource) {
        await dispatch(
          updateDataSource({ id: editingSource._id, updates: dataSourceData }),
        ).unwrap();
        
        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Updated data source '${formData.name}'`,
            section: "System Configuration",
            data: { action: "UPDATE", type: "DATA_SOURCE", name: formData.name }
          }));
        }

        Swal.fire({
          title: "Success!",
          text: "Data Source updated successfully!",
          icon: "success",
          confirmButtonColor: "#23471d",
        });
      } else {
        await dispatch(createDataSource(dataSourceData)).unwrap();
        
        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Added new data source '${formData.name}'`,
            section: "System Configuration",
            data: { action: "ADD", type: "DATA_SOURCE", name: formData.name }
          }));
        }

        Swal.fire({
          title: "Success!",
          text: "Data Source added successfully!",
          icon: "success",
          confirmButtonColor: "#23471d",
        });
      }
      resetForm();
      dispatch(fetchDataSources());
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err?.message || `Failed to ${editingSource ? "update" : "create"} Data Source.`,
        icon: "error",
        confirmButtonColor: "#23471d",
      });
    }
  };

  const handleEdit = (sourceId) => {
    const sourceToEdit = dataSources.find((src) => src?._id === sourceId);
    if (sourceToEdit) {
      setFormData({
        name: sourceToEdit.source_name,
        status: sourceToEdit.source_status
          ? sourceToEdit.source_status.charAt(0).toUpperCase() +
            sourceToEdit.source_status.slice(1)
          : "Active",
      });
      setEditingSource(sourceToEdit);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (sourceId) => {
    const sourceToDelete = dataSources.find((s) => s._id === sourceId);
    if (!sourceToDelete) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete data source '${sourceToDelete.source_name}'?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#23471d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteDataSource(sourceId)).unwrap();
        
        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Deleted data source '${sourceToDelete.source_name}'`,
            section: "System Configuration",
            data: { action: "DELETE", type: "DATA_SOURCE", name: sourceToDelete.source_name }
          }));
        }

        Swal.fire({
          title: "Deleted!",
          text: "Data Source has been deleted.",
          icon: "success",
          confirmButtonColor: "#23471d",
        });
        dispatch(fetchDataSources());
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: err?.message || "Failed to delete Data Source.",
          icon: "error",
          confirmButtonColor: "#23471d",
        });
      }
    }
  };

  const filteredAndSortedDataSources = useMemo(() => {
    let list = [...dataSources];

    if (searchText.trim()) {
      const s = searchText.trim().toLowerCase();
      list = list.filter((item) =>
        (item?.source_name || "").toLowerCase().includes(s),
      );
    }

    if (statusFilter !== "All") {
      const filterStatus = statusFilter.toLowerCase();
      list = list.filter(
        (item) => (item?.source_status || "").toLowerCase() === filterStatus,
      );
    }

    const { key, dir } = sortBy;
    list.sort((a, b) => {
      let av = a[key];
      let bv = b[key];
      if (key === "source_id") {
        av = Number(av);
        bv = Number(bv);
      } else {
        av = (av || "").toString().toLowerCase();
        bv = (bv || "").toString().toLowerCase();
      }
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [dataSources, searchText, statusFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedDataSources.length / rowsPerPage),
  );
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const currentPageData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedDataSources.slice(start, start + rowsPerPage);
  }, [filteredAndSortedDataSources, currentPage, rowsPerPage]);

  const toggleSort = (key) => {
    setSortBy((prev) => {
      if (prev.key === key) {
        return { ...prev, dir: prev.dir === "asc" ? "desc" : "asc" };
      } else {
        return { key, dir: "asc" };
      }
    });
  };

  const inputCls = "rounded-[2px] border border-slate-400 h-8 focus:border-[#23471d] focus:ring-[#23471d]/10 transition-all text-[12px] bg-white placeholder:text-slate-400 text-slate-900 font-medium shadow-none outline-none px-3 w-full text-left";
  const labelCls = "text-[11px] font-bold text-slate-800 mb-1 block capitalize font-inter";

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-inter animate-fadeIn">
      {/* ── HEADER AREA ── */}
      <div className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b border-gray-100 bg-white px-2 py-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-slate-500 uppercase tracking-tight leading-none">
            DATA SOURCE CONFIGURATION
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            Capture Channels | Lead Management
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6 space-y-8">
        {/* Form Container */}
        <div className="bg-white shadow-md border border-gray-200 rounded-[2px] overflow-hidden">
          {/* ── SUB-HEADER ── */}
          <div className="bg-slate-50/50 border-b border-slate-200 px-6 py-3">
            <h2 className="text-[16px] font-bold text-slate-800 uppercase tracking-tight">
              {editingSource ? "Edit Data Source" : "Add New Data Source"}
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-0.5 font-bold">
              International Health & Wellness Expo 2026
            </p>
          </div>

          <div className="p-6 lg:p-10">
            <form onSubmit={handleAddDataSource}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                {/* Name */}
                <div>
                  <label className={labelCls}>Source Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="e.g., Website, Social Media, referral"
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label className={labelCls}>Source Status <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-6 h-8">
                    <label className="flex items-center gap-2 text-[12px] text-slate-700 font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="Active"
                        checked={formData.status === "Active"}
                        onChange={handleChange}
                        className="accent-[#23471d]"
                      />
                      Active
                    </label>
                    <label className="flex items-center gap-2 text-[12px] text-slate-700 font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="Inactive"
                        checked={formData.status === "Inactive"}
                        onChange={handleChange}
                        className="accent-[#23471d]"
                      />
                      Inactive
                    </label>
                  </div>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                {editingSource && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-8 py-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all rounded-[2px] shadow-sm"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="px-12 py-2.5 bg-[#23471d] hover:bg-[#1a3516] text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-[2px] shadow-lg flex items-center gap-3"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : editingSource ? "Update Source" : "Save Source"}
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
                  Data Source Registry
                </h2>
                <p className="text-sm text-green-100 mt-0.5">
                  Showing {filteredAndSortedDataSources.length} sources
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto font-inter bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-black">
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center w-20">
                    <button onClick={() => toggleSort("source_id")} className="flex items-center gap-1 mx-auto hover:text-gray-300 uppercase">No. {sortBy.key === "source_id" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-left">
                    <button onClick={() => toggleSort("source_name")} className="flex items-center gap-1 hover:text-gray-300 uppercase">Source Name {sortBy.key === "source_name" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center w-[150px]">
                    <button onClick={() => toggleSort("source_status")} className="flex items-center gap-1 mx-auto hover:text-gray-300 uppercase">Status {sortBy.key === "source_status" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center w-[120px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading && filteredAndSortedDataSources.length === 0 ? (
                  <tr><td colSpan={4} className="py-10 text-center text-gray-400 text-sm italic">Loading sources...</td></tr>
                ) : filteredAndSortedDataSources.length === 0 ? (
                  <tr><td colSpan={4} className="py-10 text-center text-gray-400 text-sm italic">No entries found</td></tr>
                ) : (
                  currentPageData.map((item, index) => (
                    <tr key={item._id} className="hover:bg-blue-50 transition-colors border-b border-gray-100">
                      <td className="px-6 py-4 text-sm text-gray-900 text-center font-bold">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                      <td 
                        onClick={() => handleEdit(item._id)}
                        className="px-6 py-4 text-sm text-red-600 hover:text-red-800 cursor-pointer hover:underline font-medium uppercase tracking-tight"
                      >
                        {item.source_name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          item.source_status?.toLowerCase() === "active" 
                          ? "bg-green-50 text-green-700 border border-green-200" 
                          : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          {item.source_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleEdit(item._id)} 
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition" 
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item._id)} 
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition" 
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Card */}
          <div className="bg-white px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              Showing <span className="text-gray-900 font-bold">{filteredAndSortedDataSources.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}</span> to <span className="text-gray-900 font-bold">{Math.min(currentPage * rowsPerPage, filteredAndSortedDataSources.length)}</span> of <span className="text-gray-900 font-bold">{filteredAndSortedDataSources.length}</span> data sources
            </div>
            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDataSource;
