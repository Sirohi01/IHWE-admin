
// export default AddBank;
import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchBanks,
  addBank,
  updateBank,
  deleteBank,
} from "../../features/add_by_admin/banks/bankSlice";
import Swal from "sweetalert2";
import { createActivityLogThunk } from "../../features/activityLog/activityLogSlice";

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

const AddBank = () => {
  const dispatch = useDispatch();

  const [editingBank, setEditingBank] = useState(null);
  const [formData, setFormData] = useState({
    bankname: "",
    bankbranch: "",
    accountno: "",
    ifsccode: "",
    status: "Active",
  });

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState({ key: "bankname", dir: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [errors, setErrors] = useState({});

  const {
    banks,
    loading: isLoading,
    error,
  } = useSelector((state) => state.banks) || {};

  useEffect(() => {
    dispatch(fetchBanks());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const resetForm = () => {
    setFormData({
      bankname: "",
      bankbranch: "",
      accountno: "",
      ifsccode: "",
      status: "Active",
    });
    setEditingBank(null);
    setErrors({});
  };

  const handleAddOrUpdateBank = async (e) => {
    e.preventDefault();
    const validationErrors = {};
    if (!formData.bankname.trim())
      validationErrors.bankname = "Bank Name is required.";
    if (!formData.bankbranch.trim())
      validationErrors.bankbranch = "Bank Branch is required.";
    if (!formData.accountno.trim()) {
      validationErrors.accountno = "Account No. is required.";
    } else if (!/^\d+$/.test(formData.accountno)) {
      validationErrors.accountno = "Account No. must contain only digits.";
    }
    if (!formData.ifsccode.trim())
      validationErrors.ifsccode = "IFSC Code is required.";
    if (!formData.status) validationErrors.status = "Status is required.";

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
        text: "A bank with that account number already exists!",
        icon: "warning",
        confirmButtonColor: "#23471d",
      });
      return;
    }

    try {
      if (editingBank) {
        await dispatch(
          updateBank({ id: editingBank._id, updatedData: formData }),
        ).unwrap();
        
        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Updated bank details for '${formData.bankname}'`,
            section: "System Configuration",
            data: { action: "UPDATE", type: "BANK", name: formData.bankname }
          }));
        }

        Swal.fire({
          title: "Updated!",
          text: "Bank details updated successfully!",
          icon: "success",
          confirmButtonColor: "#23471d",
        });
      } else {
        await dispatch(addBank(formData)).unwrap();
        
        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Added new bank '${formData.bankname}'`,
            section: "System Configuration",
            data: { action: "ADD", type: "BANK", name: formData.bankname }
          }));
        }

        Swal.fire({
          title: "Success!",
          text: "Bank added successfully!",
          icon: "success",
          confirmButtonColor: "#23471d",
        });
      }
      resetForm();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err?.message || `Failed to ${editingBank ? "update" : "create"} bank.`,
        icon: "error",
        confirmButtonColor: "#23471d",
      });
    }
  };

  const handleEdit = (itemId) => {
    const itemToEdit = banks.find((item) => item._id === itemId);
    if (itemToEdit) {
      setFormData(itemToEdit);
      setEditingBank(itemToEdit);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (bankId) => {
    const bankToDelete = banks.find((b) => b._id === bankId);
    if (!bankToDelete) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete bank '${bankToDelete.bankname}'?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#23471d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteBank(bankId)).unwrap();

        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Deleted bank '${bankToDelete.bankname}'`,
            section: "System Configuration",
            data: { action: "DELETE", type: "BANK", name: bankToDelete.bankname }
          }));
        }

        Swal.fire({
          title: "Deleted!",
          text: "Bank has been deleted.",
          icon: "success",
          confirmButtonColor: "#23471d",
        });
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: err?.message || "Failed to delete bank.",
          icon: "error",
          confirmButtonColor: "#23471d",
        });
      }
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    let list = Array.isArray(banks) ? banks.filter(Boolean) : [];
    if (searchText.trim()) {
      const s = searchText.trim().toLowerCase();
      list = list.filter(
        (bank) =>
          (bank.bankname || "").toLowerCase().includes(s) ||
          (bank.bankbranch || "").toLowerCase().includes(s) ||
          (bank.accountno || "").toLowerCase().includes(s) ||
          (bank.ifsccode || "").toLowerCase().includes(s),
      );
    }
    if (statusFilter === "Active" || statusFilter === "Inactive") {
      list = list.filter((c) => c.status === statusFilter);
    }
    const { key, dir } = sortBy;
    list.sort((a, b) => {
      let av = (a[key] || "").toString().toLowerCase();
      let bv = (b[key] || "").toString().toLowerCase();
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [banks, searchText, statusFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedItems.length / rowsPerPage),
  );
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const currentPageData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedItems.slice(start, start + rowsPerPage);
  }, [filteredAndSortedItems, currentPage, rowsPerPage]);

  const toggleSort = (key) => {
    setSortBy((prev) =>
      prev.key === key
        ? { ...prev, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  };

  const inputCls = "rounded-[2px] border border-slate-400 h-8 focus:border-[#23471d] focus:ring-[#23471d]/10 transition-all text-[12px] bg-white placeholder:text-slate-400 text-slate-900 font-medium shadow-none outline-none px-3 w-full text-left";
  const labelCls = "text-[11px] font-bold text-slate-800 mb-1 block capitalize font-inter";
  const sectionHeaderClass = "text-[16px] font-bold text-[#23471d] pb-1 border-b border-slate-100 mb-6 font-inter flex items-center gap-2";

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-inter animate-fadeIn">
      {/* ── HEADER AREA ── */}
      <div className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b border-gray-100 bg-white px-2 py-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-slate-500 uppercase tracking-tight leading-none">
            BANK CONFIGURATION
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            System Settings | Bank Details
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6 space-y-8">
        {/* Form Container */}
        <div className="bg-white shadow-md border border-gray-200 rounded-[2px] overflow-hidden">
          {/* ── SUB-HEADER ── */}
          <div className="bg-slate-50/50 border-b border-slate-200 px-6 py-3">
            <h2 className="text-[16px] font-bold text-slate-800 uppercase tracking-tight">
              {editingBank ? "Edit Bank Details" : "Add New Bank"}
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-0.5 font-bold">
              International Health & Wellness Expo 2026
            </p>
          </div>

          <div className="p-6 lg:p-10">
            <form onSubmit={handleAddOrUpdateBank}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Bank Name */}
                <div>
                  <label className={labelCls}>Bank Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="bankname"
                    value={formData.bankname}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Enter bank name"
                  />
                  {errors.bankname && <p className="text-red-500 text-[10px] mt-1 font-bold italic uppercase">{errors.bankname}</p>}
                </div>

                {/* Bank Branch */}
                <div>
                  <label className={labelCls}>Bank Branch <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="bankbranch"
                    value={formData.bankbranch}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Enter branch"
                  />
                  {errors.bankbranch && <p className="text-red-500 text-[10px] mt-1 font-bold italic uppercase">{errors.bankbranch}</p>}
                </div>

                {/* Account No */}
                <div>
                  <label className={labelCls}>Account No. <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="accountno"
                    value={formData.accountno}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Enter account no."
                  />
                  {errors.accountno && <p className="text-red-500 text-[10px] mt-1 font-bold italic uppercase">{errors.accountno}</p>}
                </div>

                {/* IFSC Code */}
                <div>
                  <label className={labelCls}>IFSC Code <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="ifsccode"
                    value={formData.ifsccode}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Enter IFSC code"
                  />
                  {errors.ifsccode && <p className="text-red-500 text-[10px] mt-1 font-bold italic uppercase">{errors.ifsccode}</p>}
                </div>

                {/* Status */}
                <div>
                  <label className={labelCls}>Status <span className="text-red-500">*</span></label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={inputCls}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                {editingBank && (
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
                  disabled={isLoading}
                  className="px-12 py-2.5 bg-[#23471d] hover:bg-[#1a3516] text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-[2px] shadow-lg flex items-center gap-3 disabled:opacity-50"
                >
                  {isLoading ? "Please wait..." : editingBank ? "Update Bank" : "Save Bank Entry"}
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
                  Existing Bank Accounts
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
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center w-20">No.</th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-left">
                    <button onClick={() => toggleSort("bankname")} className="flex items-center gap-1 hover:text-gray-300">Bank Name {sortBy.key === "bankname" && (sortBy.dir === "asc" ? "↑" : "↓")}</button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-left">Bank Branch</th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-left">Account Number</th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-left">IFSC Code</th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr><td colSpan={7} className="py-10 text-center text-gray-400 text-sm italic">Loading banks...</td></tr>
                ) : currentPageData.length === 0 ? (
                  <tr><td colSpan={7} className="py-10 text-center text-gray-400 text-sm italic">No entries found</td></tr>
                ) : (
                  currentPageData.map((item, index) => (
                    <tr key={item._id} className="hover:bg-blue-50 transition-colors border-b border-gray-100">
                      <td className="px-6 py-4 text-sm text-gray-900 text-center font-bold">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                      <td 
                        onClick={() => handleEdit(item._id)}
                        className="px-6 py-4 text-sm text-red-600 hover:text-red-800 cursor-pointer hover:underline font-medium uppercase"
                      >
                        {item.bankname}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 uppercase">{item.bankbranch}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-mono">{item.accountno}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-mono uppercase">{item.ifsccode}</td>
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

          <div className="bg-white px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-inner">
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredAndSortedItems.length)} of {filteredAndSortedItems.length} entries
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBank;
