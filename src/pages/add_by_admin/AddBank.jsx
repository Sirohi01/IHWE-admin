import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchBanks,
  addBank,
  updateBank,
  deleteBank,
} from "../../features/add_by_admin/banks/bankSlice";
import { showError, showSuccess } from "../../utils/toastMessage";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={`px-2 py-1 border border-gray-300 bg-white text-sm cursor-pointer ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {"<<"}
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-2 py-1 border border-gray-300 bg-white text-sm cursor-pointer ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {"<"}
      </button>
      {start > 1 && <span className="px-1.5 text-gray-400">...</span>}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-2 py-1 border text-sm cursor-pointer ${p === currentPage ? "bg-blue-500 text-white border-blue-600" : "border-gray-300 bg-white"}`}
        >
          {p}
        </button>
      ))}
      {end < totalPages && <span className="px-1.5 text-gray-400">...</span>}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-2 py-1 border border-gray-300 bg-white text-sm cursor-pointer ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {">"}
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={`px-2 py-1 border border-gray-300 bg-white text-sm cursor-pointer ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
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
      showError("Please correct the errors before submitting.");
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
      showError("A bank with that account number already exists!");
      return;
    }

    try {
      if (editingBank) {
        await dispatch(
          updateBank({ id: editingBank._id, updatedData: formData }),
        ).unwrap();
        showSuccess("Bank details updated successfully!");
      } else {
        await dispatch(addBank(formData)).unwrap();
        showSuccess("Bank added successfully!");
      }
      resetForm();
    } catch (err) {
      showError(
        `Failed to ${editingBank ? "update" : "create"} bank. Please try again.`,
      );
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
    try {
      await dispatch(deleteBank(bankId)).unwrap();
      showSuccess("Bank deleted successfully!");
    } catch (err) {
      showError("Failed to delete bank. Please try again.");
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

  const inputCls =
    "w-full px-3 py-2 text-sm border border-gray-300 outline-none box-border";
  const thCls =
    "px-4 py-3 text-sm font-semibold text-left text-gray-700 border-r border-gray-200";

  return (
    <div
      className="w-full min-h-screen"
      style={{ backgroundColor: "#ecf0f5", marginTop: "30px" }}
    >
      {/* Header */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-3">
          <h1 className="text-lg font-normal" style={{ color: "#666" }}>
            ADD BY ADMIN | ADD BANK
          </h1>
        </div>
      </div>

      <div className="p-5">
        {/* Form */}
        <form
          onSubmit={handleAddOrUpdateBank}
          className="bg-white mb-5 border border-gray-300"
        >
          <div
            className="px-5 py-3 border-b border-gray-300"
            style={{ backgroundColor: "#f9f9f9" }}
          >
            <h2
              className="text-base font-semibold m-0"
              style={{ color: "#555" }}
            >
              {editingBank ? "EDIT BANK" : "ADD BANK"}
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-5 gap-4">
              {/* Bank Name */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: "#333" }}
                >
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="bankname"
                  value={formData.bankname}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="Enter bank name"
                />
                {errors.bankname && (
                  <p className="text-red-500 text-xs">{errors.bankname}</p>
                )}
              </div>

              {/* Bank Branch */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: "#333" }}
                >
                  Bank Branch <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="bankbranch"
                  value={formData.bankbranch}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="Enter branch"
                />
                {errors.bankbranch && (
                  <p className="text-red-500 text-xs">{errors.bankbranch}</p>
                )}
              </div>

              {/* Account No */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: "#333" }}
                >
                  Account No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="accountno"
                  value={formData.accountno}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="Enter account no."
                />
                {errors.accountno && (
                  <p className="text-red-500 text-xs">{errors.accountno}</p>
                )}
              </div>

              {/* IFSC Code */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: "#333" }}
                >
                  IFSC Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ifsccode"
                  value={formData.ifsccode}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="Enter IFSC code"
                />
                {errors.ifsccode && (
                  <p className="text-red-500 text-xs">{errors.ifsccode}</p>
                )}
              </div>

              {/* Status */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: "#333" }}
                >
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputCls}
                >
                  <option value="" disabled>
                    Select Here
                  </option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {errors.status && (
                  <p className="text-red-500 text-xs">{errors.status}</p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 text-sm text-white font-semibold cursor-pointer border-none"
                style={{
                  backgroundColor: "#337ab7",
                  borderRadius: 3,
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                {isLoading
                  ? "Please wait..."
                  : editingBank
                    ? "Update Bank"
                    : "Save"}
              </button>
              {editingBank && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm cursor-pointer border-none"
                  style={{
                    backgroundColor: "#e0e0e0",
                    color: "#333",
                    borderRadius: 3,
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>

        {/* List Section */}
        <div className="bg-white border border-gray-300">
          {/* Filters */}
          <div
            className="flex items-center justify-between px-5 py-3 border-b border-gray-300"
            style={{ backgroundColor: "#f9f9f9" }}
          >
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <span className="text-sm" style={{ color: "#333" }}>
                  Show
                </span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1.5 border border-gray-300 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm" style={{ color: "#333" }}>
                  entries
                </span>
              </label>

              <button className="px-3 py-1.5 text-sm border border-gray-300 bg-gray-50 cursor-pointer">
                Inactive List
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: "#333" }}>
                Search:
              </span>
              <input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 w-48 outline-none"
              />
              <button
                onClick={() => {
                  setSearchText("");
                  setStatusFilter("All");
                  setRowsPerPage(10);
                  setSortBy({ key: "bankname", dir: "asc" });
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 bg-white cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto max-h-[500px]">
            <table className="w-full border-collapse">
              <thead
                className="sticky top-0 z-10"
                style={{ backgroundColor: "#f9f9f9" }}
              >
                <tr className="border-b-2 border-gray-300">
                  <th className={`${thCls} w-12 text-center`}>S.No</th>
                  <th className={thCls}>
                    <div className="flex items-center gap-2">
                      Bank Name
                      <button
                        onClick={() => toggleSort("bankname")}
                        className="bg-transparent border-none cursor-pointer text-xs p-0.5"
                      >
                        {sortBy.key === "bankname"
                          ? sortBy.dir === "asc"
                            ? "▲"
                            : "▼"
                          : "↕"}
                      </button>
                    </div>
                  </th>
                  <th className={thCls}>Bank Branch</th>
                  <th className={thCls}>Account Number</th>
                  <th className={thCls}>IFSC Code</th>
                  <th className={`${thCls} text-center`}>
                    <div className="flex items-center justify-center gap-2">
                      Status
                      <button
                        onClick={() => toggleSort("status")}
                        className="bg-transparent border-none cursor-pointer text-xs p-0.5"
                      >
                        {sortBy.key === "status"
                          ? sortBy.dir === "asc"
                            ? "▲"
                            : "▼"
                          : "↕"}
                      </button>
                    </div>
                  </th>
                  <th className={`${thCls} text-center`}>Updated</th>
                  <th className={`${thCls} text-center`}>Updated By</th>
                  <th className={`${thCls} text-center`}>Action</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-gray-500">
                      Loading banks...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-red-500">
                      Error: {error}
                    </td>
                  </tr>
                ) : currentPageData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-gray-500">
                      No bank entries found.
                    </td>
                  </tr>
                ) : (
                  currentPageData.map((item, index) => (
                    <tr
                      key={item._id}
                      className="border-b border-gray-200"
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "#ffffff" : "#f9f9f9",
                      }}
                    >
                      <td
                        className="px-4 py-3 text-sm text-center"
                        style={{ color: "#333" }}
                      >
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </td>
                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: "#333" }}
                      >
                        {item?.bankname || ""}
                      </td>
                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: "#333" }}
                      >
                        {item?.bankbranch || ""}
                      </td>
                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: "#333" }}
                      >
                        {item?.accountno || ""}
                      </td>
                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: "#333" }}
                      >
                        {item?.ifsccode || ""}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="inline-block px-3 py-1 text-xs text-white"
                          style={{
                            backgroundColor:
                              item.status?.toLowerCase() === "active"
                                ? "#337ab7"
                                : "#d9534f",
                            borderRadius: 3,
                          }}
                        >
                          {item?.status || ""}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 text-sm text-center"
                        style={{ color: "#333" }}
                      >
                        {item?.updated
                          ? new Date(item.updated).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td
                        className="px-4 py-3 text-sm text-center"
                        style={{ color: "#333" }}
                      >
                        {item?.updated_by || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item._id)}
                            className="p-1.5 bg-white cursor-pointer"
                            style={{
                              border: "1px solid #337ab7",
                              color: "#337ab7",
                            }}
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 bg-white cursor-pointer"
                            style={{
                              border: "1px solid #d9534f",
                              color: "#d9534f",
                            }}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-3 bg-white">
            <div className="text-sm" style={{ color: "#666" }}>
              Showing{" "}
              <strong style={{ color: "#333" }}>
                {filteredAndSortedItems.length === 0
                  ? 0
                  : (currentPage - 1) * rowsPerPage + 1}
              </strong>{" "}
              to{" "}
              <strong style={{ color: "#333" }}>
                {Math.min(
                  currentPage * rowsPerPage,
                  filteredAndSortedItems.length,
                )}
              </strong>{" "}
              of{" "}
              <strong style={{ color: "#333" }}>
                {filteredAndSortedItems.length}
              </strong>{" "}
              entries
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBank;
