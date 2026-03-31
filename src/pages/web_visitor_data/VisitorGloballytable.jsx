import React, { useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Helper function to access nested object properties
const getValue = (obj, path) =>
  path.split(".").reduce((acc, part) => acc && acc[part], obj) || "";

const VisitorGloballytable = ({ rows = [], colomns = [], onRowClick }) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const tableContainerRef = useRef();

  const handleFilterChange = (accessor, value) => {
    setFilters((prev) => ({ ...prev, [accessor]: value.toLowerCase() }));
  };

  const toggleSelectAll = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, paginatedRows.length);
    const pageIndices = Array.from(
      { length: endIndex - startIndex },
      (_, i) => startIndex + i,
    );

    if (
      selectedRows.length === paginatedRows.length &&
      selectedRows.every((index) => pageIndices.includes(index))
    ) {
      setSelectedRows(
        selectedRows.filter((index) => !pageIndices.includes(index)),
      );
    } else {
      const newSelected = [...selectedRows];
      pageIndices.forEach((index) => {
        if (!newSelected.includes(index)) {
          newSelected.push(index);
        }
      });
      setSelectedRows(newSelected);
    }
  };

  const toggleRow = (index) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  // ✅ Safely filter rows – ensure rows is an array
  const filteredRows = useMemo(() => {
    if (!Array.isArray(rows) || rows.length === 0) return [];

    return rows.filter((row) => {
      const matchesFilters = colomns.every((col) => {
        const filterValue = filters[col.accessor] || "";
        const cellValue = String(getValue(row, col.accessor)).toLowerCase();
        if (!cellValue.trim() && filterValue) return false;
        if (!filterValue) return true;
        return cellValue.includes(filterValue);
      });

      const matchesGlobal = globalSearch
        ? colomns.some((col) =>
            String(getValue(row, col.accessor))
              .toLowerCase()
              .includes(globalSearch.toLowerCase()),
          )
        : true;

      return matchesFilters && matchesGlobal;
    });
  }, [rows, colomns, filters, globalSearch]);

  // ✅ Sorting logic
  const sortedRows = useMemo(() => {
    if (!sortConfig.key || filteredRows.length === 0) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const aValue = getValue(a, sortConfig.key);
      const bValue = getValue(b, sortConfig.key);

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredRows, sortConfig]);

  // ✅ Pagination logic
  const totalPages = Math.ceil(sortedRows.length / pageSize);
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedRows.slice(startIndex, startIndex + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const noData = paginatedRows.length === 0;

  const handlePageSizeChange = (e) => {
    const value = e.target.value;
    if (value === "all") {
      setPageSize(sortedRows.length || 10);
    } else {
      setPageSize(Number(value));
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPaginationButtons = () => {
    if (totalPages === 0) return null;

    const buttons = [];
    // Previous button
    buttons.push(
      <li
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        className={`border border-gray-200 flex items-center justify-center h-8 w-12 cursor-pointer ${
          currentPage === 1
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        &lt;
      </li>,
    );

    if (totalPages > 3) {
      // Page 1
      buttons.push(
        <li
          key={1}
          onClick={() => handlePageChange(1)}
          className={`border border-gray-200 flex items-center justify-center h-8 w-10 cursor-pointer ${
            1 === currentPage
              ? "bg-[#337ab7] text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          1
        </li>,
      );

      // Page 2
      buttons.push(
        <li
          key={2}
          onClick={() => handlePageChange(2)}
          className={`border border-gray-200 flex items-center justify-center h-8 w-10 cursor-pointer ${
            2 === currentPage
              ? "bg-[#337ab7] text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          2
        </li>,
      );

      // Page 3
      buttons.push(
        <li
          key={3}
          onClick={() => handlePageChange(3)}
          className={`border border-gray-200 flex items-center justify-center h-8 w-10 cursor-pointer ${
            3 === currentPage
              ? "bg-[#337ab7] text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          3
        </li>,
      );

      // Check if we need ellipsis after first 3
      if (currentPage > 5) {
        buttons.push(
          <li
            key="dots1"
            className="border border-gray-200 flex items-center justify-center h-8 w-10 text-gray-400"
          >
            ...
          </li>,
        );
      }

      // Middle section - show current page and adjacent pages
      const middleStart = Math.max(4, currentPage - 1);
      const middleEnd = Math.min(totalPages - 3, currentPage + 1);

      for (let i = middleStart; i <= middleEnd; i++) {
        if (i > 3 && i < totalPages - 2) {
          buttons.push(
            <li
              key={i}
              onClick={() => handlePageChange(i)}
              className={`border border-gray-200 flex items-center justify-center h-8 w-10 cursor-pointer ${
                i === currentPage
                  ? "bg-[#337ab7] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {i}
            </li>,
          );
        }
      }

      // Check if we need ellipsis before last 3
      if (currentPage < totalPages - 4) {
        buttons.push(
          <li
            key="dots2"
            className="border border-gray-200 flex items-center justify-center h-8 w-10 text-gray-400"
          >
            ...
          </li>,
        );
      }

      // Last 3 pages
      const lastStart = Math.max(totalPages - 2, 4);
      for (let i = lastStart; i <= totalPages; i++) {
        buttons.push(
          <li
            key={i}
            onClick={() => handlePageChange(i)}
            className={`border border-gray-200 flex items-center justify-center h-8 w-10 cursor-pointer ${
              i === currentPage
                ? "bg-[#337ab7] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {i}
          </li>,
        );
      }
    } else {
      // If total pages <= 3, show all pages
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <li
            key={i}
            onClick={() => handlePageChange(i)}
            className={`border border-gray-200 flex items-center justify-center h-8 w-10 cursor-pointer ${
              i === currentPage
                ? "bg-[#337ab7] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {i}
          </li>,
        );
      }
    }

    // Next button
    buttons.push(
      <li
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        className={`border border-gray-200 flex items-center justify-center h-8 w-12 cursor-pointer ${
          currentPage === totalPages
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        &gt;
      </li>,
    );

    return buttons;
  };

  // ✅ If no columns, show a message
  if (!colomns || colomns.length === 0) {
    return (
      <div className="text-center text-gray-400 p-4">No columns defined</div>
    );
  }

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .printable-table-container, .printable-table-container * {
              visibility: visible;
            }
            .printable-table-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              overflow: visible;
            }
            .printable-table-container table {
              border-collapse: collapse;
              width: 100%;
              border: 1px solid black;
            }
            .printable-table-container th,
            .printable-table-container td {
              border: 1px solid black;
              padding: 8px;
            }
          }
        `}
      </style>

      {/* Header Section */}
      <div className="flex flex-wrap justify-between items-center px-2 pb-2 print-hidden">
        <div className="flex items-center mb-4 md:mb-0">
          <select
            value={pageSize === sortedRows.length ? "all" : pageSize}
            onChange={handlePageSizeChange}
            className="h-7 w-20 border border-gray-300 text-sm pl-4"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="all">All</option>
          </select>
          <p className="ml-1 text-sm mt-1">Entries</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-2">
          <div className="flex items-center w-full md:w-50">
            <label className="pt-1 text-[#2f353b] text-sm" htmlFor="Search">
              Search:
            </label>
            <input
              value={globalSearch}
              placeholder="Search.."
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="ml-1 px-2 h-7 border border-gray-300 text-xs outline-none hover:border-blue-500 w-full"
              type="text"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        ref={tableContainerRef}
        className="overflow-x-auto mx-auto printable-table-container px-2 mr-2"
      >
        <div>
          <table className="border border-gray-200 text-[#4f5a67] text-xs font-semibold mb-5 w-full min-w-max">
            <thead>
              <tr className="bg-[#555555] text-white">
                <th className="h-8 w-[60px] pl-3 border border-gray-200 print-hidden">
                  <div className="h-6 flex items-center justify-center">
                    <input
                      className="table-checkbox"
                      checked={
                        paginatedRows.length > 0 &&
                        selectedRows.length >= paginatedRows.length &&
                        paginatedRows.every((_, i) =>
                          selectedRows.includes(
                            (currentPage - 1) * pageSize + i,
                          ),
                        )
                      }
                      onChange={toggleSelectAll}
                      type="checkbox"
                    />
                  </div>
                </th>
                {colomns.map((col) => (
                  <th
                    key={col.accessor}
                    onClick={() => {
                      if (sortConfig.key === col.accessor) {
                        setSortConfig({
                          key: col.accessor,
                          direction:
                            sortConfig.direction === "asc" ? "desc" : "asc",
                        });
                      } else {
                        setSortConfig({ key: col.accessor, direction: "asc" });
                      }
                    }}
                    className="h-8 pl-3 border border-gray-200 text-center cursor-pointer select-none"
                    style={{ width: col.width }}
                  >
                    {col.label}
                    {sortConfig.key === col.accessor && (
                      <span className="ml-3">
                        {sortConfig.direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {!noData ? (
                paginatedRows.map((row, i) => {
                  const globalIndex = (currentPage - 1) * pageSize + i;
                  return (
                    <tr
                      key={globalIndex}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => onRowClick && onRowClick(row)}
                    >
                      <td className="h-8 w-[60px] pl-3 border border-gray-200 text-center print-hidden">
                        <div className="h-5 flex items-center justify-center">
                          <input
                            className="table-checkbox"
                            checked={selectedRows.includes(globalIndex)}
                            onChange={() => toggleRow(globalIndex)}
                            type="checkbox"
                            readOnly
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </td>
                      {colomns.map((col) => (
                        <td
                          key={col.accessor}
                          className="h-8 pl-3 border border-gray-200 text-left text-xs font-medium"
                          style={{ width: col.width }}
                        >
                          {col.render ? (
                            col.render(getValue(row, col.accessor), row)
                          ) : col.linkTo ? (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(col.linkTo(row));
                              }}
                              className="text-[#337ab7] cursor-pointer hover:underline"
                            >
                              {getValue(row, col.accessor)}
                            </span>
                          ) : (
                            getValue(row, col.accessor)
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={colomns.length + 1}
                    className="text-center text-gray-400 py-3 border border-gray-200"
                  >
                    No data found
                  </td>
                </tr>
              )}
            </tbody>

            <tfoot className="print-hidden">
              <tr>
                <td className="w-[60px] border border-gray-200"> </td>
                {colomns.map((col) => (
                  <td
                    key={col.accessor}
                    className="border border-gray-200"
                    style={{ width: col.width }}
                  >
                    <div className="h-8 py-1 px-1">
                      <input
                        type="text"
                        placeholder={`Search ${col.label}`}
                        className="w-full py-0.5 text-xs border border-gray-300 outline-none text-center"
                        value={filters[col.accessor] || ""}
                        onChange={(e) =>
                          handleFilterChange(col.accessor, e.target.value)
                        }
                      />
                    </div>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center p-5 text-xs pt-6 print-hidden">
        <p className="p-2 mb-4 md:mb-0">
          Showing{" "}
          {sortedRows.length === 0
            ? 0
            : Math.min(
                (currentPage - 1) * pageSize + 1,
                sortedRows.length,
              )}{" "}
          to {Math.min(currentPage * pageSize, sortedRows.length)} of{" "}
          {sortedRows.length} entries
        </p>
        <div className="flex">
          <ul className="flex cursor-pointer">{renderPaginationButtons()}</ul>
        </div>
      </div>
    </>
  );
};

export default VisitorGloballytable;
