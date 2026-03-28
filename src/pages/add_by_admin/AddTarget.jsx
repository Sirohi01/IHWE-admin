import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

/* ---------------------------
  Helper components & utils
  --------------------------- */

/** A small reusable Modal component */
const Modal = ({
  open,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  if (!open) return null;
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalBox}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0 }}>{title}</h3>
        </div>
        <div style={styles.modalBody}>{children}</div>
        <div style={styles.modalFooter}>
          <button
            style={{ ...styles.modalBtn, ...styles.cancelBtn }}
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            style={{ ...styles.modalBtn, ...styles.confirmBtn }}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

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

/* ---------------------------
  Main AddTarget Component
  --------------------------- */

const LOCAL_STORAGE_KEY = "app_user_targets_v1";

// Dummy user list based on the image
const USER_LIST = [
  "Abhay Raj",
  "Rohit",
  "ADMIN",
  "Chiranjeev Sharma",
  "Manoj Mishra",
  "Prerna Pandey",
  "Rishav Singh",
  "Shrigi Rawat",
  "Sumit Mistra",
  "Tanya Jaiswal",
  "Vijay Sharma",
];

const AddTarget = () => {
  const [editingTarget, setEditingTarget] = useState(null);
  const [formData, setFormData] = useState({
    user: "",
    target: "",
    status: "Active",
  });
  const [targets, setTargets] = useState(() => {
    try {
      const raw = sessionStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("Failed to parse user targets from sessionStorage", e);
    }
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetToDelete, setTargetToDelete] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(targets));
    } catch (e) {
      console.warn("Failed to save user targets to sessionStorage", e);
    }
  }, [targets]);

  const showMessage = (text, ms = 2000) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), ms);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({ user: "", target: "", status: "Active" });
    setEditingTarget(null);
  };

  const handleAddTarget = () => {
    if (!formData.user || !formData.target) {
      showMessage("Please select a user and enter a target!");
      return;
    }

    const duplicate = targets.find(
      (t) =>
        t.user.toLowerCase() === formData.user.toLowerCase() &&
        (!editingTarget || t.id !== editingTarget.id),
    );
    if (duplicate) {
      showMessage("A target for this user already exists!");
      return;
    }

    if (editingTarget) {
      setTargets((prev) =>
        prev.map((item) =>
          item.id === editingTarget.id
            ? {
                ...item,
                user: formData.user,
                target: formData.target,
                status: formData.status,
              }
            : item,
        ),
      );
      showMessage("Target updated successfully!");
      resetForm();
    } else {
      const newId =
        targets.length > 0 ? Math.max(...targets.map((c) => c.id)) + 1 : 1;
      const newItem = {
        id: newId,
        user: formData.user,
        target: Number(formData.target),
        status: formData.status,
      };
      setTargets((prev) => [...prev, newItem]);
      showMessage("Target added successfully!");
      resetForm();
    }
  };

  const handleEdit = (itemId) => {
    const itemToEdit = targets.find((item) => item.id === itemId);
    if (itemToEdit) {
      setFormData({
        user: itemToEdit.user,
        target: itemToEdit.target,
        status: itemToEdit.status,
      });
      setEditingTarget(itemToEdit);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const openDeleteModal = (itemId) => {
    const item = targets.find((c) => c.id === itemId);
    setTargetToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setTargetToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!targetToDelete) {
      closeDeleteModal();
      return;
    }
    setTargets((prev) => prev.filter((c) => c.id !== targetToDelete.id));
    showMessage("Target deleted successfully!");
    closeDeleteModal();
  };

  const filteredAndSortedItems = useMemo(() => {
    let list = [...targets];
    if (searchText && searchText.trim()) {
      const s = searchText.trim().toLowerCase();
      list = list.filter(
        (c) => c.user.toLowerCase().includes(s) || String(c.target).includes(s),
      );
    }
    if (statusFilter === "Active" || statusFilter === "Inactive") {
      list = list.filter((c) => c.status === statusFilter);
    }
    const { key, dir } = sortBy;
    list.sort((a, b) => {
      let av = a[key];
      let bv = b[key];
      if (key === "id" || key === "target") {
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
  }, [targets, searchText, statusFilter, sortBy]);

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
        <div className="flex items-center justify-between px-6 py-1">
          <h1 className="text-xl font-normal" style={{ color: "#666" }}>
            USER TARGET
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

        {/* Add/Edit Section */}
        <div className="bg-white mb-5" style={{ border: "1px solid #ddd" }}>
          <div
            className="px-5 py-3"
            style={{
              backgroundColor: "#f9f9f9",
              borderBottom: "1px solid #ddd",
            }}
          >
            <h2
              className="text-base font-semibold"
              style={{ color: "#555", margin: 0 }}
            >
              {editingTarget ? "EDIT TARGET" : "ADD TARGET"}
            </h2>
          </div>

          <div className="p-6">
            <div
              className="flex items-start gap-8"
              style={{ alignItems: "flex-end" }}
            >
              {/* User Field */}
              <div style={{ flex: 1 }}>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#333" }}
                >
                  User <span style={{ color: "#f44336" }}>*</span>
                </label>
                <select
                  name="user"
                  value={formData.user}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm"
                  style={{ ...styles.input }}
                  disabled={!!editingTarget}
                >
                  <option value="">Select User</option>
                  {USER_LIST.map((user) => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Field */}
              <div style={{ flex: 1 }}>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#333" }}
                >
                  Target <span style={{ color: "#f44336" }}>*</span>
                </label>
                <input
                  type="number"
                  name="target"
                  value={formData.target}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm"
                  style={{ ...styles.input }}
                  placeholder="Enter target"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddTarget();
                    }
                  }}
                />
              </div>

              {/* Status Field */}
              <div style={{ flex: 1 }}>
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
                  onClick={handleAddTarget}
                  className="px-6 py-2 text-sm text-white"
                  style={{
                    backgroundColor: "#5bc0de",
                    border: "none",

                    cursor: "pointer",
                  }}
                  title={editingTarget ? "Update Target" : "Add Target"}
                >
                  {editingTarget ? "Update Target" : "Add Target"}
                </button>
              </div>

              {/* Cancel (visible when editing) */}
              {editingTarget && (
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 text-sm"
                    style={{
                      backgroundColor: "#e0e0e0",
                      color: "#333",

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
                placeholder="Search targets..."
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
                        onClick={() => toggleSort("id")}
                        style={styles.sortBtn}
                      >
                        {sortBy.key === "id"
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
                      User
                      <button
                        onClick={() => toggleSort("user")}
                        style={styles.sortBtn}
                      >
                        {sortBy.key === "user"
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
                      Target
                      <button
                        onClick={() => toggleSort("target")}
                        style={styles.sortBtn}
                      >
                        {sortBy.key === "target"
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
                        onClick={() => toggleSort("status")}
                        style={styles.sortBtn}
                      >
                        {sortBy.key === "status"
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
                {currentPageData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: 24,
                        textAlign: "center",
                        color: "#777",
                      }}
                    >
                      No user targets found.
                    </td>
                  </tr>
                ) : (
                  currentPageData.map((item, index) => (
                    <tr
                      key={item.id}
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
                        {item.id}
                      </td>

                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: "#333" }}
                      >
                        {item.user}
                      </td>

                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: "#333" }}
                      >
                        {item.target}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className="inline-block px-3 py-1 text-xs text-white"
                          style={{
                            backgroundColor:
                              item.status === "Active" ? "#337ab7" : "#d9534f",
                          }}
                        >
                          {item.status}
                        </span>
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
                            onClick={() => handleEdit(item.id)}
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
                            onClick={() => openDeleteModal(item.id)}
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

        {/* Delete Confirmation Modal */}
        <Modal
          open={isDeleteModalOpen}
          title="Confirm Delete"
          onClose={closeDeleteModal}
          onConfirm={handleConfirmDelete}
          confirmText="Delete"
          cancelText="Cancel"
        >
          <div>
            Are you sure you want to delete this user target? This action cannot
            be undone.
          </div>
        </Modal>
      </div>
    </div>
  );
};

/* ---------------------------
  Inline styles (kept organized)
  --------------------------- */

const styles = {
  input: {
    border: "1px solid #d2d6de",

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

    cursor: "pointer",
    fontSize: 13,
  },
  searchInput: {
    padding: "8px 10px",

    border: "1px solid #d2d6de",
    width: 280,
  },
  clearBtn: {
    padding: "8px 10px",

    border: "1px solid #ddd",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: 13,
  },
  smallSelect: {
    padding: "6px 8px",

    border: "1px solid #d2d6de",
  },
  iconBtn: {
    padding: 6,

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

  // modal
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modalBox: {
    width: 520,
    background: "#fff",
    borderRadius: 6,
    boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
    overflow: "hidden",
  },
  modalHeader: {
    padding: "12px 16px",
    borderBottom: "1px solid #eee",
  },
  modalBody: {
    padding: 16,
    color: "#333",
  },
  modalFooter: {
    padding: 12,
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    borderTop: "1px solid #eee",
  },
  modalBtn: {
    padding: "8px 12px",

    cursor: "pointer",
    border: "none",
  },
  cancelBtn: {
    backgroundColor: "#f1f1f1",
    color: "#333",
  },
  confirmBtn: {
    backgroundColor: "#d9534f",
    color: "white",
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

export default AddTarget;
