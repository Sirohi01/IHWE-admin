import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchNatures,
  createNature,
  updateNature,
  deleteNature,
} from "../../features/add_by_admin/nature/natureSlice";
import { showError, showSuccess } from "../../utils/toastMessage";

/** Simple Pagination component */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div style={styles.pagination}>
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        style={{
          ...styles.pageBtn,
          ...(currentPage === 1 ? styles.disabledBtn : {}),
        }}
      >
        {"<<"}
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          ...styles.pageBtn,
          ...(currentPage === 1 ? styles.disabledBtn : {}),
        }}
      >
        {"<"}
      </button>

      {start > 1 && <span style={styles.pageGap}>...</span>}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          style={{
            ...styles.pageBtn,
            ...(p === currentPage ? styles.activePageBtn : {}),
          }}
        >
          {p}
        </button>
      ))}

      {end < totalPages && <span style={styles.pageGap}>...</span>}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          ...styles.pageBtn,
          ...(currentPage === totalPages ? styles.disabledBtn : {}),
        }}
      >
        {">"}
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        style={{
          ...styles.pageBtn,
          ...(currentPage === totalPages ? styles.disabledBtn : {}),
        }}
      >
        {">>"}
      </button>
    </div>
  );
};

const AddNatureOfBusiness = () => {
  const dispatch = useDispatch();
  const [editingNature, setEditingNature] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    status: "Active",
  });

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState({ key: "nature_id", dir: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [message, setMessage] = useState(null);

  // Natures of Business redux
  const {
    natures,
    loading: isLoading,
    error,
  } = useSelector((state) => state.natures);

  console.log("add nature of business data", natures);

  useEffect(() => {
    dispatch(fetchNatures());
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
    setEditingNature(null);
  };

  const handleAddNature = async () => {
    if (!formData.name || !formData.name.trim()) {
      showError("Please enter a name for the nature of business!");
      return;
    }

    const trimmedName = formData.name.trim();
    const duplicate = (Array.isArray(natures) ? natures : []).find(
      (n) =>
        (n?.nature_name || "").trim().toLowerCase() ===
          trimmedName.toLowerCase() &&
        (!editingNature || n._id !== editingNature._id),
    );
    if (duplicate) {
      showError("A nature of business with that name already exists!");
      return;
    }

    const newNatureId =
      natures && natures.length > 0
        ? Math.max(...natures.map((n) => n.nature_id || 0)) + 1
        : 1;

    const natureData = {
      nature_id: newNatureId,
      nature_name: trimmedName,
      nature_status: formData.status.toLowerCase(),
      added: new Date().toISOString(),
    };

    try {
      if (editingNature) {
        await dispatch(
          updateNature({ id: editingNature._id, updates: natureData }),
        ).unwrap();
        showSuccess("Nature of Business updated successfully!");
      } else {
        await dispatch(createNature(natureData)).unwrap();
        showSuccess("Nature of Business added successfully!");
      }
      resetForm();
      dispatch(fetchNatures());
    } catch (err) {
      const action = editingNature ? "update" : "create";
      showError(`Failed to ${action} Nature of Business. Please try again.`);
      console.error(`Failed to ${action} Nature of Business:`, err);
    }
  };

  const handleEdit = (natureId) => {
    const natureToEdit = natures.find((nat) => nat?._id === natureId);
    if (natureToEdit) {
      setFormData({
        name: natureToEdit.nature_name,
        status: natureToEdit.nature_status
          ? natureToEdit.nature_status.charAt(0).toUpperCase() +
            natureToEdit.nature_status.slice(1)
          : "Active",
      });
      setEditingNature(natureToEdit);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (natureId) => {
    const natureToDelete = natures.find((n) => n?._id === natureId);
    if (!natureToDelete) return;
    {
      try {
        await dispatch(deleteNature(natureId)).unwrap();
        showSuccess("Nature of Business deleted successfully!");
        dispatch(fetchNatures());
      } catch (err) {
        showError(
          "Failed to delete Nature of Business. Please try again.",
          3000,
        );
        console.error("Failed to delete Nature of Business:", err);
      }
    }
  };

  const filteredAndSortedNatures = useMemo(() => {
    let list = Array.isArray(natures) ? natures.filter(Boolean) : [];
    if (searchText && searchText.trim()) {
      const s = searchText.trim().toLowerCase();
      list = list.filter((n) =>
        (n?.nature_name || "").toLowerCase().includes(s),
      );
    }
    if (statusFilter === "Active" || statusFilter === "Inactive") {
      list = list.filter(
        (n) =>
          (n?.nature_status || "").toLowerCase() === statusFilter.toLowerCase(),
      );
    }
    const { key, dir } = sortBy;
    list.sort((a, b) => {
      let av = a[key];
      let bv = b[key];
      if (key === "nature_id") {
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
  }, [natures, searchText, statusFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedNatures.length / rowsPerPage),
  );
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const currentPageData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedNatures.slice(start, start + rowsPerPage);
  }, [filteredAndSortedNatures, currentPage, rowsPerPage]);

  const toggleSort = (key) => {
    setSortBy((prev) => {
      if (prev.key === key) {
        return { ...prev, dir: prev.dir === "asc" ? "desc" : "asc" };
      } else {
        return { key, dir: "asc" };
      }
    });
  };

  return (
    <div
      className="w-full"
      style={{ backgroundColor: "#ecf0f5", minHeight: "100vh", padding: "0" }}
    >
      {/* Header Section */}
      <div
        className="w-full bg-white"
        style={{ borderBottom: "1px solid #e0e0e0" }}
      >
        <div className="flex items-center justify-between px-6 py-3">
          <h1
            className="text-lg font-normal uppercase"
            style={{ color: "#666" }}
          >
            Nature of Business
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: "20px" }}>
        {/* Notification message */}
        {message && (
          <div style={styles.messageBox}>
            <span>{message}</span>
          </div>
        )}

        {/* Add/Edit Nature of Business Section */}
        <div className="bg-white mb-5" style={{ border: "1px solid #ddd" }}>
          <div
            className="px-5 py-3"
            style={{
              backgroundColor: "#f9f9f9",
              borderBottom: "1px solid #ddd",
            }}
          >
            <h2
              className="text-base font-semibold uppercase"
              style={{ color: "#555", margin: 0 }}
            >
              {editingNature
                ? "EDIT NATURE OF BUSINESS"
                : "ADD NATURE OF BUSINESS"}
            </h2>
          </div>

          <div className="p-6">
            <div
              className="flex items-start gap-8"
              style={{ alignItems: "flex-end" }}
            >
              {/* Name Field */}
              <div style={{ flex: 1 }}>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#333" }}
                >
                  Name <span style={{ color: "#f44336" }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm"
                  style={{
                    ...styles.input,
                  }}
                  placeholder="Enter name"
                  required
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddNature();
                    }
                  }}
                />
              </div>

              {/* Status Field */}
              <div style={{ width: 280 }}>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#333" }}
                >
                  Status <span style={{ color: "#f44336" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      checked={formData.status === "Active"}
                      onChange={handleChange}
                      style={{ marginRight: 8 }}
                    />
                    <span style={{ color: "#333" }}>Active</span>
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="status"
                      value="Inactive"
                      checked={formData.status === "Inactive"}
                      onChange={handleChange}
                      style={{ marginRight: 8 }}
                    />
                    <span style={{ color: "#333" }}>Inactive</span>
                  </label>
                </div>
              </div>

              {/* Add / Update Button */}
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  onClick={handleAddNature}
                  className="px-6 py-2 text-sm text-white"
                  style={{
                    backgroundColor: "#5bc0de",
                    border: "none",
                    borderRadius: 3,
                    cursor: "pointer",
                  }}
                  title={editingNature ? "Update" : "Add"}
                >
                  {editingNature ? "Update" : "Add"}
                </button>
              </div>

              {/* Cancel (visible when editing) */}
              {editingNature && (
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 text-sm"
                    style={{
                      backgroundColor: "#e0e0e0",
                      color: "#333",
                      borderRadius: 3,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="bg-white" style={{ border: "1px solid #ddd" }}>
          {/* Filter / Search / Sort Row */}
          <div
            className="px-5 py-3"
            style={{
              backgroundColor: "#f9f9f9",
              borderBottom: "1px solid #ddd",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <label
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <span style={{ color: "#333", fontSize: 13 }}>Show</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={styles.smallSelect}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span style={{ color: "#333", fontSize: 13 }}>entries</span>
              </label>

              <label
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <span style={{ color: "#333", fontSize: 13 }}>Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={styles.smallSelect}
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </div>

            {/* Search box */}
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                style={styles.searchInput}
              />
              <button
                onClick={() => {
                  setSearchText("");
                  setStatusFilter("All");
                  setRowsPerPage(10);
                  setSortBy({ key: "id", dir: "asc" });
                }}
                style={styles.clearBtn}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Table header */}
          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            <table
              className="w-full"
              style={{ borderCollapse: "collapse", width: "100%" }}
            >
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#f9f9f9",
                  zIndex: 1,
                }}
              >
                <tr style={{ borderBottom: "2px solid #ddd" }}>
                  <th
                    className="px-4 py-3 text-sm font-semibold text-center"
                    style={thStyle(80)}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      No.
                      <button
                        onClick={() => toggleSort("nature_id")}
                        style={styles.sortBtn}
                      >
                        {sortBy.key === "nature_id"
                          ? sortBy.dir === "asc"
                            ? "▲"
                            : "▼"
                          : "↕"}
                      </button>
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-sm font-semibold text-left"
                    style={thStyle()}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      Name
                      <button
                        onClick={() => toggleSort("nature_name")}
                        style={styles.sortBtn}
                      >
                        {sortBy.key === "nature_name"
                          ? sortBy.dir === "asc"
                            ? "▲"
                            : "▼"
                          : "↕"}
                      </button>
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-sm font-semibold text-center"
                    style={thStyle(150)}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      Status
                      <button
                        onClick={() => toggleSort("nature_status")}
                        style={styles.sortBtn}
                      >
                        {sortBy.key === "nature_status"
                          ? sortBy.dir === "asc"
                            ? "▲"
                            : "▼"
                          : "↕"}
                      </button>
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-sm font-semibold text-center"
                    style={thStyle(120)}
                  >
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: 24,
                        textAlign: "center",
                        color: "#777",
                      }}
                    >
                      Loading...
                    </td>
                  </tr>
                )}

                {currentPageData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: 24,
                        textAlign: "center",
                        color: "#777",
                      }}
                    >
                      No entries found.
                    </td>
                  </tr>
                ) : (
                  currentPageData.map((nature, index) => (
                    <tr
                      key={nature._id}
                      style={{
                        borderBottom: "1px solid #ddd",
                        backgroundColor:
                          index % 2 === 0 ? "#ffffff" : "#f9f9f9",
                      }}
                    >
                      <td
                        className="px-4 py-3 text-sm text-center"
                        style={{ color: "#333", width: 80 }}
                      >
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </td>

                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: "#333" }}
                      >
                        {nature?.nature_name || ""}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {nature?.nature_status ? (
                          <span
                            className="inline-block px-3 py-1 text-xs text-white"
                            style={{
                              backgroundColor:
                                nature.nature_status.toLowerCase() === "active"
                                  ? "#337ab7"
                                  : "#d9534f",
                              borderRadius: 3,
                            }}
                          >
                            {nature.nature_status.charAt(0).toUpperCase() +
                              nature.nature_status.slice(1)}
                          </span>
                        ) : null}
                      </td>

                      <td className="px-4 py-3" style={{ textAlign: "center" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 8,
                          }}
                        >
                          <button
                            onClick={() => handleEdit(nature._id)}
                            style={{
                              ...styles.iconBtn,
                              borderColor: "#337ab7",
                              color: "#337ab7",
                            }}
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            onClick={() => handleDelete(nature._id)}
                            style={{
                              ...styles.iconBtn,
                              borderColor: "#d9534f",
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

          {/* Footer: Pagination and summary */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 12,
            }}
          >
            <div style={{ color: "#666", fontSize: 13 }}>
              Showing{" "}
              <strong style={{ color: "#333" }}>
                {filteredAndSortedNatures.length === 0
                  ? 0
                  : (currentPage - 1) * rowsPerPage + 1}
              </strong>{" "}
              to{" "}
              <strong style={{ color: "#333" }}>
                {Math.min(
                  currentPage * rowsPerPage,
                  filteredAndSortedNatures.length,
                )}
              </strong>{" "}
              of{" "}
              <strong style={{ color: "#333" }}>
                {filteredAndSortedNatures.length}
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

const styles = {
  input: {
    border: "1px solid #d2d6de",
    borderRadius: 3,
    padding: "8px 10px",
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
  },
  radioLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
  },
  smallActionBtn: {
    backgroundColor: "#f7f7f7",
    border: "1px solid #ddd",
    padding: "6px 10px",
    borderRadius: 3,
    cursor: "pointer",
    fontSize: 13,
  },
  searchInput: {
    padding: "8px 10px",
    borderRadius: 3,
    border: "1px solid #d2d6de",
    width: 280,
  },
  clearBtn: {
    padding: "8px 10px",
    borderRadius: 3,
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: 13,
  },
  smallSelect: {
    padding: "6px 8px",
    borderRadius: 3,
    border: "1px solid #d2d6de",
  },
  iconBtn: {
    padding: 6,
    borderRadius: 4,
    border: "1px solid #ccc",
    backgroundColor: "white",
    cursor: "pointer",
  },
  sortBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 2,
    fontSize: 12,
  },
  messageBox: {
    backgroundColor: "#e9f7ef",
    border: "1px solid #c7efd9",
    padding: "8px 12px",
    borderRadius: 4,
    marginBottom: 12,
    color: "#2f7a4b",
    display: "inline-block",
  },
  pagination: {
    display: "flex",
    gap: 6,
    alignItems: "center",
  },
  pageBtn: {
    padding: "6px 9px",
    border: "1px solid #ddd",
    borderRadius: 4,
    cursor: "pointer",
    background: "white",
  },
  disabledBtn: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  activePageBtn: {
    backgroundColor: "#3598dc",
    color: "white",
    borderColor: "#2f82c4",
  },
  pageGap: {
    padding: "0 6px",
    color: "#999",
  },
};

/* Helper to produce th style with fixed width optional */
const thStyle = (width) => ({
  color: "#333",
  borderRight: "1px solid #ddd",
  textAlign: "center",
  width: width ? width : "auto",
  padding: "12px 8px",
});

export default AddNatureOfBusiness;
