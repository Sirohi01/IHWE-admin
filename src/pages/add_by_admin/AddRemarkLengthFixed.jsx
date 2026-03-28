import React, { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

const INITIAL_DATA = [{ id: 1, name: "50", status: "Active" }];

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

const AddRemarkLengthFixed = () => {
  const [fixLengths, setFixLengths] = useState(INITIAL_DATA);
  const [editingFixLength, setEditingFixLength] = useState(null);
  const [formData, setFormData] = useState({ name: "", status: "Active" });

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState({ key: "id", dir: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setFormData({ name: "", status: "Active" });
    setEditingFixLength(null);
  };

  const handleSubmit = () => {
    const trimmedName = formData.name.trim();
    if (!trimmedName) return;

    const duplicate = fixLengths.find(
      (c) =>
        c.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
        (!editingFixLength || c.id !== editingFixLength.id),
    );
    if (duplicate) return;

    if (editingFixLength) {
      setFixLengths((prev) =>
        prev.map((item) =>
          item.id === editingFixLength.id
            ? { ...item, name: trimmedName, status: formData.status }
            : item,
        ),
      );
      resetForm();
    } else {
      const newId =
        fixLengths.length > 0
          ? Math.max(...fixLengths.map((c) => c.id)) + 1
          : 1;
      setFixLengths((prev) => [
        ...prev,
        { id: newId, name: trimmedName, status: formData.status },
      ]);
      resetForm();
    }
  };

  const handleEdit = (itemId) => {
    const item = fixLengths.find((i) => i.id === itemId);
    if (item) {
      setFormData({ name: item.name, status: item.status });
      setEditingFixLength(item);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = (itemId) => {
    setFixLengths((prev) => prev.filter((c) => c.id !== itemId));
  };

  const filteredAndSortedItems = useMemo(() => {
    let list = [...fixLengths];
    if (searchText.trim()) {
      const s = searchText.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(s));
    }
    if (statusFilter !== "All") {
      list = list.filter((c) => c.status === statusFilter);
    }
    const { key, dir } = sortBy;
    list.sort((a, b) => {
      let av = key === "id" ? Number(a[key]) : (a[key] || "").toLowerCase();
      let bv = key === "id" ? Number(b[key]) : (b[key] || "").toLowerCase();
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [fixLengths, searchText, statusFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedItems.length / rowsPerPage),
  );
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

  return (
    <div
      className="w-full"
      style={{ backgroundColor: "#ecf0f5", minHeight: "100vh" }}
    >
      {/* Header */}
      <div
        className="w-full bg-white"
        style={{ borderBottom: "1px solid #e0e0e0" }}
      >
        <div className="flex items-center px-6 py-1">
          <h1 className="text-lg font-normal" style={{ color: "#666" }}>
            FIX LENGTH
          </h1>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Form */}
        <div className="bg-white mb-5" style={{ border: "1px solid #ddd" }}>
          <div
            className="px-5 py-1"
            style={{
              backgroundColor: "#f9f9f9",
              borderBottom: "1px solid #ddd",
            }}
          >
            <h2
              className="text-base font-semibold"
              style={{ color: "#555", margin: 0 }}
            >
              {editingFixLength ? "EDIT FIX LENGTH" : "ADD FIX LENGTH"}
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-end gap-8">
              {/* Name */}
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
                  placeholder="Enter fixed length"
                  style={styles.input}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>

              {/* Status */}
              <div style={{ width: 280 }}>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#333" }}
                >
                  Status <span style={{ color: "#f44336" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  {["Active", "Inactive"].map((s) => (
                    <label key={s} style={styles.radioLabel}>
                      <input
                        type="radio"
                        name="status"
                        value={s}
                        checked={formData.status === s}
                        onChange={handleChange}
                        style={{ marginRight: 8 }}
                      />
                      <span style={{ color: "#333" }}>{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                className="px-6 py-2 text-sm text-white"
                style={{
                  backgroundColor: "#5bc0de",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {editingFixLength ? "Update Fix Length" : "Add Fix Length"}
              </button>

              {/* Cancel */}
              {editingFixLength && (
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
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white" style={{ border: "1px solid #ddd" }}>
          {/* Filters */}
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
                  {[5, 10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
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
                placeholder="Search fixed lengths..."
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

          {/* Table */}
          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#f9f9f9",
                  zIndex: 1,
                }}
              >
                <tr style={{ borderBottom: "2px solid #ddd" }}>
                  {[
                    { key: "id", label: "No.", width: 80, center: true },
                    { key: "name", label: "Fix Length", center: false },
                    {
                      key: "status",
                      label: "Status",
                      width: 150,
                      center: true,
                    },
                  ].map(({ key, label, width, center }) => (
                    <th
                      key={key}
                      style={{
                        ...thStyle(width),
                        textAlign: center ? "center" : "left",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: center ? "center" : "flex-start",
                          gap: 8,
                        }}
                      >
                        {label}
                        <button
                          onClick={() => toggleSort(key)}
                          style={styles.sortBtn}
                        >
                          {sortBy.key === key
                            ? sortBy.dir === "asc"
                              ? "▲"
                              : "▼"
                            : "↕"}
                        </button>
                      </div>
                    </th>
                  ))}
                  <th style={thStyle(120)}>Action</th>
                </tr>
              </thead>
              <tbody>
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
                      No fixed lengths found.
                    </td>
                  </tr>
                ) : (
                  currentPageData.map((item, index) => (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: "1px solid #ddd",
                        backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
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
                        {item.name}
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
                            onClick={() => handleDelete(item.id)}
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

          {/* Pagination footer */}
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
              <strong>
                {filteredAndSortedItems.length === 0
                  ? 0
                  : (currentPage - 1) * rowsPerPage + 1}
              </strong>{" "}
              to{" "}
              <strong>
                {Math.min(
                  currentPage * rowsPerPage,
                  filteredAndSortedItems.length,
                )}
              </strong>{" "}
              of <strong>{filteredAndSortedItems.length}</strong> entries
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
  searchInput: { padding: "8px 10px", border: "1px solid #d2d6de", width: 280 },
  clearBtn: {
    padding: "8px 10px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: 13,
  },
  smallSelect: { padding: "6px 8px", border: "1px solid #d2d6de" },
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
  pagination: { display: "flex", gap: 6, alignItems: "center" },
  pageBtn: {
    padding: "6px 9px",
    border: "1px solid #ddd",
    cursor: "pointer",
    background: "white",
  },
  disabledBtn: { opacity: 0.5, cursor: "not-allowed" },
  activePageBtn: {
    backgroundColor: "#3598dc",
    color: "white",
    borderColor: "#2f82c4",
  },
  pageGap: { padding: "0 6px", color: "#999" },
};

const thStyle = (width) => ({
  color: "#333",
  borderRight: "1px solid #ddd",
  textAlign: "center",
  width: width || "auto",
  padding: "12px 8px",
});

export default AddRemarkLengthFixed;
