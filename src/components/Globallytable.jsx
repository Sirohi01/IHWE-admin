// import React, { useRef, useState, useMemo } from "react";
// import { TbCaretUpDownFilled } from "react-icons/tb";

// // Helper function to access nested object properties
// const getValue = (obj, path) =>
//   path.split(".").reduce((acc, part) => acc && acc[part], obj) || "";

// const Globallytable = ({
//   rows = [],
//   colomns = [],
//   onRowClick,
//   extrabutton = true,
// }) => {
//   const [filters, setFilters] = useState({});
//   const [globalSearch, setGlobalSearch] = useState("");
//   const [selectedRows, setSelectedRows] = useState([]);
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
//   const [pageSize, setPageSize] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const tableContainerRef = useRef();

//   const handleFilterChange = (accessor, value) => {
//     setFilters((prev) => ({ ...prev, [accessor]: value.toLowerCase() }));
//   };

//   const toggleSelectAll = () => {
//     const startIndex = (currentPage - 1) * pageSize;
//     const endIndex = Math.min(startIndex + pageSize, paginatedRows.length);
//     const pageIndices = Array.from(
//       { length: endIndex - startIndex },
//       (_, i) => startIndex + i,
//     );

//     if (
//       selectedRows.length === paginatedRows.length &&
//       selectedRows.every((index) => pageIndices.includes(index))
//     ) {
//       setSelectedRows(
//         selectedRows.filter((index) => !pageIndices.includes(index)),
//       );
//     } else {
//       const newSelected = [...selectedRows];
//       pageIndices.forEach((index) => {
//         if (!newSelected.includes(index)) {
//           newSelected.push(index);
//         }
//       });
//       setSelectedRows(newSelected);
//     }
//   };

//   const toggleRow = (index) => {
//     setSelectedRows((prev) =>
//       prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
//     );
//   };

//   const filteredRows = rows.filter((row) => {
//     const matchesFilters = colomns.every((col) => {
//       const filterValue = filters[col.accessor] || "";
//       const cellValue = String(getValue(row, col.accessor)).toLowerCase();
//       if (!cellValue.trim() && filterValue) return false;
//       if (!filterValue) return true;
//       return cellValue.includes(filterValue);
//     });

//     const matchesGlobal = globalSearch
//       ? colomns.some((col) =>
//           String(getValue(row, col.accessor))
//             .toLowerCase()
//             .includes(globalSearch.toLowerCase()),
//         )
//       : true;

//     return matchesFilters && matchesGlobal;
//   });

//   // ✅ Sorting logic
//   const sortedRows = useMemo(() => {
//     if (!sortConfig.key) return filteredRows;

//     const sorted = [...filteredRows].sort((a, b) => {
//       const aValue = getValue(a, sortConfig.key);
//       const bValue = getValue(b, sortConfig.key);

//       if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
//       if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
//       return 0;
//     });

//     return sorted;
//   }, [filteredRows, sortConfig]);

//   // ✅ Pagination logic
//   const totalPages = Math.ceil(sortedRows.length / pageSize);
//   const paginatedRows = useMemo(() => {
//     const startIndex = (currentPage - 1) * pageSize;
//     return sortedRows.slice(startIndex, startIndex + pageSize);
//   }, [sortedRows, currentPage, pageSize]);

//   const noData = paginatedRows.length === 0;

//   // Print functionality
//   const handlePrint = () => {
//     const originalBodyDisplay = document.body.style.display;
//     const originalBodyOverflow = document.body.style.overflow;
//     const tableContainer = tableContainerRef.current;

//     document.body.style.display = "block";
//     document.body.style.overflow = "hidden";

//     const allElements = document.querySelectorAll("body > *");
//     const hiddenElements = [];
//     allElements.forEach((el) => {
//       if (!el.contains(tableContainer)) {
//         hiddenElements.push(el);
//         el.style.display = "none";
//       }
//     });

//     window.print();

//     hiddenElements.forEach((el) => {
//       el.style.display = "";
//     });
//     document.body.style.display = originalBodyDisplay;
//     document.body.style.overflow = originalBodyOverflow;
//   };

//   // Export to CSV functionality
//   const exportToCsv = () => {
//     const headers = colomns.map((col) => `"${col.label}"`).join(",");
//     const csvRows = sortedRows.map((row) =>
//       colomns
//         .map((col) => {
//           const value = getValue(row, col.accessor);
//           const sanitizedValue = String(value).replace(/"/g, '""');
//           return `"${sanitizedValue}"`;
//         })
//         .join(","),
//     );
//     const csvString = [headers, ...csvRows].join("\n");

//     const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     if (link.download !== undefined) {
//       const url = URL.createObjectURL(blob);
//       link.setAttribute("href", url);
//       link.setAttribute("download", "ClientData.csv");
//       link.style.visibility = "hidden";
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   };

//   const handlePageSizeChange = (e) => {
//     const value = e.target.value;
//     if (value === "all") {
//       setPageSize(sortedRows.length || 10);
//     } else {
//       setPageSize(Number(value));
//     }
//     setCurrentPage(1); // Reset to first page when changing page size
//   };

//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };

//   const renderPaginationButtons = () => {
//     const buttons = [];
//     const totalPagesNum = totalPages;

//     // Previous button
//     buttons.push(
//       <li
//         key="prev"
//         onClick={() => handlePageChange(currentPage - 1)}
//         className={`border border-gray-200 flex items-center justify-center h-8 w-12 cursor-pointer ${
//           currentPage === 1
//             ? "text-gray-300 cursor-not-allowed"
//             : "text-gray-600 hover:bg-gray-100"
//         }`}
//       >
//         &lt;
//       </li>,
//     );

//     // Always show first 3 pages if total pages > 3
//     if (totalPagesNum > 3) {
//       // Page 1
//       buttons.push(
//         <li
//           key={1}
//           onClick={() => handlePageChange(1)}
//           className={`border border-gray-200 flex items-center justify-center h-8 w-10 cursor-pointer ${
//             1 === currentPage
//               ? "bg-[#337ab7] text-white"
//               : "text-gray-600 hover:bg-gray-100"
//           }`}
//         >
//           1
//         </li>,
//       );

//       // Page 2
//       buttons.push(
//         <li
//           key={2}
//           onClick={() => handlePageChange(2)}
//           className={`border border-gray-200 flex items-center justify-center h-8 w-10 cursor-pointer ${
//             2 === currentPage
//               ? "bg-[#337ab7] text-white"
//               : "text-gray-600 hover:bg-gray-100"
//           }`}
//         >
//           2
//         </li>,
//       );

//       // Page 3
//       buttons.push(
//         <li
//           key={3}
//           onClick={() => handlePageChange(3)}
//           className={`border border-gray-200 flex items-center justify-center h-8 w-10 cursor-pointer ${
//             3 === currentPage
//               ? "bg-[#337ab7] text-white"
//               : "text-gray-600 hover:bg-gray-100"
//           }`}
//         >
//           3
//         </li>,
//       );

//       // Check if we need ellipsis after first 3
//       if (currentPage > 5) {
//         buttons.push(
//           <li
//             key="dots1"
//             className="border border-gray-200 flex items-center justify-center h-8 w-10 text-gray-400"
//           >
//             ...
//           </li>,
//         );
//       }

//       // Middle section - show current page and adjacent pages
//       const middleStart = Math.max(4, currentPage - 1);
//       const middleEnd = Math.min(totalPagesNum - 3, currentPage + 1);

//       for (let i = middleStart; i <= middleEnd; i++) {
//         if (i > 3 && i < totalPagesNum - 2) {
//           buttons.push(
//             <li
//               key={i}
//               onClick={() => handlePageChange(i)}
//               className={`border border-gray-200 flex items-center justify-center h-8 w-10 cursor-pointer ${
//                 i === currentPage
//                   ? "bg-[#337ab7] text-white"
//                   : "text-gray-600 hover:bg-gray-100"
//               }`}
//             >
//               {i}
//             </li>,
//           );
//         }
//       }

//       // Check if we need ellipsis before last 3
//       if (currentPage < totalPagesNum - 4) {
//         buttons.push(
//           <li
//             key="dots2"
//             className="border border-gray-200 flex items-center justify-center h-8 w-10 text-gray-400"
//           >
//             ...
//           </li>,
//         );
//       }

//       // Last 3 pages
//       const lastStart = Math.max(totalPagesNum - 2, 4);
//       for (let i = lastStart; i <= totalPagesNum; i++) {
//         buttons.push(
//           <li
//             key={i}
//             onClick={() => handlePageChange(i)}
//             className={`border border-gray-200 flex items-center justify-center h-8 w-10 cursor-pointer ${
//               i === currentPage
//                 ? "bg-[#337ab7] text-white"
//                 : "text-gray-600 hover:bg-gray-100"
//             }`}
//           >
//             {i}
//           </li>,
//         );
//       }
//     } else {
//       // If total pages <= 3, show all pages
//       for (let i = 1; i <= totalPagesNum; i++) {
//         buttons.push(
//           <li
//             key={i}
//             onClick={() => handlePageChange(i)}
//             className={`border border-gray-200 flex items-center justify-center h-8 w-10 cursor-pointer ${
//               i === currentPage
//                 ? "bg-[#337ab7] text-white"
//                 : "text-gray-600 hover:bg-gray-100"
//             }`}
//           >
//             {i}
//           </li>,
//         );
//       }
//     }

//     // Next button
//     buttons.push(
//       <li
//         key="next"
//         onClick={() => handlePageChange(currentPage + 1)}
//         className={`border border-gray-200 flex items-center justify-center h-8 w-12 cursor-pointer ${
//           currentPage === totalPages
//             ? "text-gray-300 cursor-not-allowed"
//             : "text-gray-600 hover:bg-gray-100"
//         }`}
//       >
//         &gt;
//       </li>,
//     );

//     return buttons;
//   };

//   return (
//     <>
//       <style>
//         {`
//           @media print {
//             body * {
//               visibility: hidden;
//             }
//             .printable-table-container, .printable-table-container * {
//               visibility: visible;
//             }
//             .printable-table-container {
//               position: absolute;
//               left: 0;
//               top: 0;
//               width: 100%;
//               overflow: visible;
//             }
//             .printable-table-container table {
//               border-collapse: collapse;
//               width: 100%;
//               border: 1px solid black;
//             }
//             .printable-table-container th,
//             .printable-table-container td {
//               border: 1px solid black;
//               padding: 8px;
//             }
//           }
//         `}
//       </style>

//       {/* Header Section */}
//       <div className="flex flex-wrap justify-between items-center px-2 pb-2 print-hidden">
//         <div className="flex items-center mb-4 md:mb-0">
//           <select
//             value={pageSize === sortedRows.length ? "all" : pageSize}
//             onChange={handlePageSizeChange}
//             className="h-7 w-20 border border-gray-300 text-sm pl-4"
//           >
//             <option value="10">10</option>
//             <option value="20">20</option>
//             <option value="30">30</option>
//             <option value="50">50</option>
//             <option value="100">100</option>
//             <option value="all">All</option>
//           </select>
//           <p className="ml-1 text-sm mt-1">Entries</p>
//         </div>

//         <div className="flex flex-col md:flex-row items-center gap-2">
//           {extrabutton && (
//             <>
//               <button
//                 onClick={handlePrint}
//                 className="text-[#2f353b] h-7 w-18 text-xs text-center cursor-pointer hover:bg-black hover:text-white border border-[#2f353b]"
//               >
//                 Print
//               </button>
//               <button
//                 onClick={exportToCsv}
//                 className="h-7 w-18 text-[#78a300] text-xs text-center cursor-pointer hover:bg-[#78a300] hover:text-white border border-[#78a300]"
//               >
//                 Excel
//               </button>
//             </>
//           )}
//           <div className="flex items-center w-full md:w-50">
//             <label className="pt-1 text-[#2f353b] text-sm" htmlFor="Search">
//               Search:
//             </label>
//             <input
//               value={globalSearch}
//               onChange={(e) => setGlobalSearch(e.target.value)}
//               className="ml-1 px-2 h-7 border border-gray-300 text-xs outline-none hover:border-blue-500 w-full"
//               type="text"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       <div
//         ref={tableContainerRef}
//         className="overflow-x-auto mx-auto printable-table-container px-2 mr-2"
//       >
//         <div>
//           <table className="border border-gray-200 text-[#4f5a67] text-xs font-semibold mb-5 w-full min-w-max">
//             <thead>
//               <tr className="bg-[#555555] text-white">
//                 <th className="h-8 w-[60px] pl-3 border border-gray-200 print-hidden">
//                   <div className="h-6 flex items-center justify-center">
//                     <input
//                       className="table-checkbox"
//                       checked={
//                         paginatedRows.length > 0 &&
//                         selectedRows.length >= paginatedRows.length &&
//                         paginatedRows.every((_, i) =>
//                           selectedRows.includes(
//                             (currentPage - 1) * pageSize + i,
//                           ),
//                         )
//                       }
//                       onChange={toggleSelectAll}
//                       type="checkbox"
//                     />
//                   </div>
//                 </th>
//                 {colomns.map((col) => (
//                   <th
//                     key={col.accessor}
//                     onClick={() => {
//                       if (sortConfig.key === col.accessor) {
//                         setSortConfig({
//                           key: col.accessor,
//                           direction:
//                             sortConfig.direction === "asc" ? "desc" : "asc",
//                         });
//                       } else {
//                         setSortConfig({ key: col.accessor, direction: "asc" });
//                       }
//                     }}
//                     className=" h-8 pl-3 border border-gray-200 text-center cursor-pointer select-none"
//                     style={{ width: col.width }}
//                   >
//                     {col.label}

//                     {sortConfig.key === col.accessor && (
//                       <span className="ml-3">
//                         {sortConfig.direction === "asc" ? "▲" : "▼"}
//                       </span>
//                     )}
//                   </th>
//                 ))}
//               </tr>
//             </thead>

//             <tbody>
//               {!noData ? (
//                 paginatedRows.map((row, i) => {
//                   const globalIndex = (currentPage - 1) * pageSize + i;
//                   return (
//                     <tr key={globalIndex} className="hover:bg-gray-50">
//                       <td className="h-8 w-[60px] pl-3 border border-gray-200 text-center print-hidden">
//                         <div className="h-5 flex items-center justify-center">
//                           <input
//                             className="table-checkbox"
//                             checked={selectedRows.includes(globalIndex)}
//                             onChange={() => toggleRow(globalIndex)}
//                             type="checkbox"
//                             readOnly
//                           />
//                         </div>
//                       </td>
//                       {colomns.map((col) => (
//                         <td
//                           key={col.accessor}
//                           className="h-8 pl-3 border border-gray-200 text-left text-xs font-medium "
//                           style={{ width: col.width }}
//                         >
//                           {col.render ? (
//                             col.render(getValue(row, col.accessor), row)
//                           ) : col.accessor === "company.name" ? (
//                             <span
//                               onClick={() => onRowClick(row)}
//                               className="text-[#337ab7] cursor-pointer hover:underline print-hidden"
//                             >
//                               {getValue(row, col.accessor)}
//                             </span>
//                           ) : (
//                             getValue(row, col.accessor)
//                           )}
//                         </td>
//                       ))}
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td
//                     colSpan={colomns.length + 1}
//                     className="text-center text-gray-400 py-3 border border-gray-200"
//                   >
//                     No data found
//                   </td>
//                 </tr>
//               )}
//             </tbody>

//             <tfoot className="print-hidden">
//               <tr>
//                 <td className="w-[60px] border border-gray-200"></td>
//                 {colomns.map((col) => (
//                   <td
//                     key={col.accessor}
//                     className="border border-gray-200"
//                     style={{ width: col.width }}
//                   >
//                     <div className="h-8 py-1 px-1  ">
//                       <input
//                         type="text"
//                         placeholder={`Search ${col.label}`}
//                         className="w-full py-0.5 text-xs border border-gray-300  outline-none  text-center"
//                         value={filters[col.accessor] || ""}
//                         onChange={(e) =>
//                           handleFilterChange(col.accessor, e.target.value)
//                         }
//                       />
//                     </div>
//                   </td>
//                 ))}
//               </tr>
//             </tfoot>
//           </table>
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="w-full flex flex-col md:flex-row justify-between items-center p-5 text-xs pt-6 print-hidden">
//         <p className="p-2 mb-4 md:mb-0">
//           Showing{" "}
//           {Math.min((currentPage - 1) * pageSize + 1, sortedRows.length)} to{" "}
//           {Math.min(currentPage * pageSize, sortedRows.length)} of{" "}
//           {sortedRows.length} entries
//         </p>
//         <div className="flex">
//           <ul className="flex cursor-pointer">{renderPaginationButtons()}</ul>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Globallytable;
import React, { useRef, useState, useMemo } from "react";
import { TbCaretUpDownFilled } from "react-icons/tb";

// Helper function to access nested object properties
const getValue = (obj, path) =>
  path.split(".").reduce((acc, part) => acc && acc[part], obj) || "";

const Globallytable = ({
  rows = [],
  colomns = [],
  onRowClick,
  extrabutton = true,
}) => {
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

  const filteredRows = rows.filter((row) => {
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

  // ✅ Sorting logic
  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return filteredRows;

    const sorted = [...filteredRows].sort((a, b) => {
      const aValue = getValue(a, sortConfig.key);
      const bValue = getValue(b, sortConfig.key);

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredRows, sortConfig]);

  // ✅ Pagination logic
  const totalPages = Math.ceil(sortedRows.length / pageSize);
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedRows.slice(startIndex, startIndex + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const noData = paginatedRows.length === 0;

  // Print functionality
  const handlePrint = () => {
    const originalBodyDisplay = document.body.style.display;
    const originalBodyOverflow = document.body.style.overflow;
    const tableContainer = tableContainerRef.current;

    document.body.style.display = "block";
    document.body.style.overflow = "hidden";

    const allElements = document.querySelectorAll("body > *");
    const hiddenElements = [];
    allElements.forEach((el) => {
      if (!el.contains(tableContainer)) {
        hiddenElements.push(el);
        el.style.display = "none";
      }
    });

    window.print();

    hiddenElements.forEach((el) => {
      el.style.display = "";
    });
    document.body.style.display = originalBodyDisplay;
    document.body.style.overflow = originalBodyOverflow;
  };

  // Export to CSV functionality
  const exportToCsv = () => {
    const headers = colomns.map((col) => `"${col.label}"`).join(",");
    const csvRows = sortedRows.map((row) =>
      colomns
        .map((col) => {
          const value = getValue(row, col.accessor);
          const sanitizedValue = String(value).replace(/"/g, '""');
          return `"${sanitizedValue}"`;
        })
        .join(","),
    );
    const csvString = [headers, ...csvRows].join("\n");

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "ClientData.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePageSizeChange = (e) => {
    const value = e.target.value;
    if (value === "all") {
      setPageSize(sortedRows.length || 10);
    } else {
      setPageSize(Number(value));
    }
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const totalPagesNum = totalPages;

    // Previous button
    buttons.push(
      <li
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        className={`border border-gray-200 flex items-center justify-center h-12 w-16 cursor-pointer text-lg ${
          currentPage === 1
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        &lt;
      </li>,
    );

    // Always show first 3 pages if total pages > 3
    if (totalPagesNum > 3) {
      // Page 1
      buttons.push(
        <li
          key={1}
          onClick={() => handlePageChange(1)}
          className={`border border-gray-200 flex items-center justify-center h-12 w-14 cursor-pointer text-lg ${
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
          className={`border border-gray-200 flex items-center justify-center h-12 w-14 cursor-pointer text-lg ${
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
          className={`border border-gray-200 flex items-center justify-center h-12 w-14 cursor-pointer text-lg ${
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
            className="border border-gray-200 flex items-center justify-center h-12 w-14 text-gray-400 text-lg"
          >
            ...
          </li>,
        );
      }

      // Middle section - show current page and adjacent pages
      const middleStart = Math.max(4, currentPage - 1);
      const middleEnd = Math.min(totalPagesNum - 3, currentPage + 1);

      for (let i = middleStart; i <= middleEnd; i++) {
        if (i > 3 && i < totalPagesNum - 2) {
          buttons.push(
            <li
              key={i}
              onClick={() => handlePageChange(i)}
              className={`border border-gray-200 flex items-center justify-center h-12 w-14 cursor-pointer text-lg ${
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
      if (currentPage < totalPagesNum - 4) {
        buttons.push(
          <li
            key="dots2"
            className="border border-gray-200 flex items-center justify-center h-12 w-14 text-gray-400 text-lg"
          >
            ...
          </li>,
        );
      }

      // Last 3 pages
      const lastStart = Math.max(totalPagesNum - 2, 4);
      for (let i = lastStart; i <= totalPagesNum; i++) {
        buttons.push(
          <li
            key={i}
            onClick={() => handlePageChange(i)}
            className={`border border-gray-200 flex items-center justify-center h-12 w-14 cursor-pointer text-lg ${
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
      for (let i = 1; i <= totalPagesNum; i++) {
        buttons.push(
          <li
            key={i}
            onClick={() => handlePageChange(i)}
            className={`border border-gray-200 flex items-center justify-center h-12 w-14 cursor-pointer text-lg ${
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
        className={`border border-gray-200 flex items-center justify-center h-12 w-16 cursor-pointer text-lg ${
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
              padding: 16px;
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
            className="h-12 w-28 border border-gray-300 text-lg pl-4"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="all">All</option>
          </select>
          <p className="ml-2 text-lg mt-1">Entries</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3">
          {extrabutton && (
            <>
              <button
                onClick={handlePrint}
                className="text-[#2f353b] h-12 w-24 text-base text-center cursor-pointer hover:bg-black hover:text-white border border-[#2f353b]"
              >
                Print
              </button>
              <button
                onClick={exportToCsv}
                className="h-12 w-24 text-[#78a300] text-base text-center cursor-pointer hover:bg-[#78a300] hover:text-white border border-[#78a300]"
              >
                Excel
              </button>
            </>
          )}
          <div className="flex items-center w-full md:w-72">
            <label className="pt-1 text-[#2f353b] text-lg" htmlFor="Search">
              Search:
            </label>
            <input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="ml-2 px-3 h-12 border border-gray-300 text-lg outline-none hover:border-blue-500 w-full"
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
          <table className="border border-gray-200 text-[#4f5a67] text-base font-semibold mb-5 w-full min-w-max">
            <thead>
              <tr className="bg-[#555555] text-white">
                <th className="h-14 w-[80px] pl-6 border border-gray-200 print-hidden">
                  <div className="h-8 flex items-center justify-center">
                    <input
                      className="table-checkbox w-6 h-6"
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
                    className="h-14 pl-6 border border-gray-200 text-center cursor-pointer select-none text-lg"
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
                    <tr key={globalIndex} className="hover:bg-gray-50">
                      <td className="h-14 w-[80px] pl-6 border border-gray-200 text-center print-hidden">
                        <div className="h-6 flex items-center justify-center">
                          <input
                            className="table-checkbox w-6 h-6"
                            checked={selectedRows.includes(globalIndex)}
                            onChange={() => toggleRow(globalIndex)}
                            type="checkbox"
                            readOnly
                          />
                        </div>
                      </td>
                      {colomns.map((col) => (
                        <td
                          key={col.accessor}
                          className="h-14 pl-6 border border-gray-200 text-left text-base font-medium"
                          style={{ width: col.width }}
                        >
                          {col.render ? (
                            col.render(getValue(row, col.accessor), row)
                          ) : col.accessor === "company.name" ? (
                            <span
                              onClick={() => onRowClick(row)}
                              className="text-[#337ab7] cursor-pointer hover:underline print-hidden text-lg"
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
                    className="text-center text-gray-400 py-4 border border-gray-200 text-lg"
                  >
                    No data found
                  </td>
                </tr>
              )}
            </tbody>

            <tfoot className="print-hidden">
              <tr>
                <td className="w-[80px] border border-gray-200"></td>
                {colomns.map((col) => (
                  <td
                    key={col.accessor}
                    className="border border-gray-200"
                    style={{ width: col.width }}
                  >
                    <div className="h-14 py-2 px-2">
                      <input
                        type="text"
                        placeholder={`Search ${col.label}`}
                        className="w-full py-2 text-base border border-gray-300 outline-none text-center"
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
      <div className="w-full flex flex-col md:flex-row justify-between items-center p-5 text-lg pt-6 print-hidden">
        <p className="p-2 mb-4 md:mb-0">
          Showing{" "}
          {Math.min((currentPage - 1) * pageSize + 1, sortedRows.length)} to{" "}
          {Math.min(currentPage * pageSize, sortedRows.length)} of{" "}
          {sortedRows.length} entries
        </p>
        <div className="flex">
          <ul className="flex cursor-pointer">{renderPaginationButtons()}</ul>
        </div>
      </div>
    </>
  );
};

export default Globallytable;
