// import React, { useEffect, useMemo, useState } from "react";
// import { Pencil, Trash2 } from "lucide-react";
// import { useSelector, useDispatch } from "react-redux";
// import {
//   fetchEvents,
//   createEvent,
//   updateEvent,
//   deleteEvent,
// } from "../../features/crmEvent/crmEventSlice";
// import { showError, showSuccess } from "../../utils/toastMessage";
// import { fetchCountries } from "../../features/add_by_admin/country/countrySlice";
// import { fetchStates } from "../../features/state/stateSlice";
// import { fetchCities } from "../../features/city/citySlice";

// const Pagination = ({ currentPage, totalPages, onPageChange }) => {
//   const pages = [];
//   const start = Math.max(1, currentPage - 2);
//   const end = Math.min(totalPages, currentPage + 2);
//   for (let p = start; p <= end; p++) pages.push(p);

//   return (
//     <div style={styles.pagination}>
//       <button
//         onClick={() => onPageChange(1)}
//         disabled={currentPage === 1}
//         style={{
//           ...styles.pageBtn,
//           ...(currentPage === 1 ? styles.disabledBtn : {}),
//         }}
//       >
//         {"<<"}
//       </button>
//       <button
//         onClick={() => onPageChange(currentPage - 1)}
//         disabled={currentPage === 1}
//         style={{
//           ...styles.pageBtn,
//           ...(currentPage === 1 ? styles.disabledBtn : {}),
//         }}
//       >
//         {"<"}
//       </button>

//       {start > 1 && <span style={styles.pageGap}>...</span>}

//       {pages.map((p) => (
//         <button
//           key={p}
//           onClick={() => onPageChange(p)}
//           style={{
//             ...styles.pageBtn,
//             ...(p === currentPage ? styles.activePageBtn : {}),
//           }}
//         >
//           {p}
//         </button>
//       ))}

//       {end < totalPages && <span style={styles.pageGap}>...</span>}

//       <button
//         onClick={() => onPageChange(currentPage + 1)}
//         disabled={currentPage === totalPages}
//         style={{
//           ...styles.pageBtn,
//           ...(currentPage === totalPages ? styles.disabledBtn : {}),
//         }}
//       >
//         {">"}
//       </button>
//       <button
//         onClick={() => onPageChange(totalPages)}
//         disabled={currentPage === totalPages}
//         style={{
//           ...styles.pageBtn,
//           ...(currentPage === totalPages ? styles.disabledBtn : {}),
//         }}
//       >
//         {">>"}
//       </button>
//     </div>
//   );
// };

// const AddEvent = () => {
//   const dispatch = useDispatch();
//   const [editingStatus, setEditingStatus] = useState(null);

//   const addedBy = sessionStorage.getItem("user_name") || "";
//   const [formData, setFormData] = useState({
//     event_name: "",
//     status: "Active",
//     event_fullName: "",
//     event_fromDate: "",
//     event_toDate: "",
//     event_address: "",
//     event_country: "",
//     event_state: "",
//     event_city: "",
//     event_pincode: "",
//     added_by: addedBy,
//   });

//   const [searchText, setSearchText] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");

//   const [sortBy, setSortBy] = useState({ key: "event_name", dir: "asc" });

//   const [currentPage, setCurrentPage] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [message, setMessage] = useState(null);

//   // event redux
//   const {
//     events = [],
//     loading,
//     error = null,
//   } = useSelector((state) => state.crmEvents || {});
//   const { countries } = useSelector((state) => state.countries);
//   const { states } = useSelector((state) => state.states);
//   const { cities } = useSelector((state) => state.cities);
//   console.log("cities", cities);
//   console.log("countries...", countries);

//   useEffect(() => {
//     dispatch(fetchEvents());
//     dispatch(fetchCountries());
//     dispatch(fetchStates());
//     dispatch(fetchCities());
//   }, [dispatch]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     // 🟢 FIX 2: Special handling for pincode (only 6 digits, non-negative)
//     if (name === "event_pincode") {
//       const numericValue = value.replace(/\D/g, ""); // Remove all non-digit characters
//       if (numericValue.length <= 6) {
//         setFormData((prevData) => ({
//           ...prevData,
//           [name]: numericValue,
//         }));
//       }
//       return;
//     }

//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const resetForm = () => {
//     // 🟢 FIX 3: Reset all new fields
//     setFormData({
//       event_name: "",
//       status: "Active",
//       event_fullName: "",
//       event_fromDate: "",
//       event_toDate: "",
//       event_address: "",
//       event_country: "",
//       event_state: "",
//       event_city: "",
//       event_pincode: "",
//       added_by: addedBy,
//     });
//     setEditingStatus(null);
//   };

//   const handleAddEvent = async () => {
//     const {
//       event_name,
//       event_fullName,
//       event_fromDate,
//       event_toDate,
//       event_address,
//       event_country,
//       event_state,
//       event_city,
//       event_pincode,
//       status,
//       added_by,
//     } = formData;

//     // Basic Validation for core fields
//     if (!event_name || !event_name.trim()) {
//       showError("Please enter an Event Name!");
//       return;
//     }
//     if (!event_fullName || !event_fullName.trim()) {
//       showError("Please enter the Full Name!");
//       return;
//     }
//     // Add more validation here (e.g., date checks, pincode length)

//     const trimmedName = event_name.trim();

//     // Check for duplicate (only using event_name)
//     const duplicate = (Array.isArray(events) ? events : []).find(
//       (item) =>
//         (item?.event_name || "").trim().toLowerCase() ===
//           trimmedName.toLowerCase() &&
//         (!editingStatus || item._id !== editingStatus._id),
//     );
//     if (duplicate) {
//       showError("An event with that name already exists!");
//       return;
//     }

//     // 🟢 FIX 4: Build the payload with all new and existing backend keys
//     const eventData = {
//       event_name: trimmedName,
//       event_status: status.toLowerCase(),
//       event_fullName: event_fullName.trim(),
//       event_fromDate: event_fromDate,
//       event_toDate: event_toDate,
//       event_address: event_address.trim(),
//       event_country: event_country,
//       event_state: event_state,
//       event_city: event_city,
//       event_pincode: event_pincode,
//       added_by: added_by || sessionStorage.getItem("user_name") || "System",
//     };

//     try {
//       if (editingStatus) {
//         await dispatch(
//           updateEvent({ id: editingStatus._id, updates: eventData }),
//         ).unwrap();
//         showSuccess("Event updated successfully!");
//       } else {
//         await dispatch(createEvent(eventData)).unwrap();
//         showSuccess("Event added successfully!");
//       }
//       resetForm();
//       // Optional: Re-fetch to update table, though redux update should handle it
//       dispatch(fetchEvents());
//     } catch (err) {
//       const action = editingStatus ? "update" : "create";
//       showError(`Failed to ${action} event. Please try again.`);
//       console.error(`Failed to ${action} event:`, err);
//     }
//   };
//   const formatDateForInput = (dateString) => {
//     if (!dateString) return "";
//     try {
//       // Only extract the date part (YYYY-MM-DD) if it's an ISO string
//       if (dateString.includes("T")) {
//         return dateString.split("T")[0];
//       }
//       // For other formats, try parsing
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return "";

//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, "0");
//       const day = String(date.getDate()).padStart(2, "0");

//       return `${year}-${month}-${day}`;
//     } catch (e) {
//       return "";
//     }
//   };
//   const handleEdit = (statusId) => {
//     const statusToEdit = events.find((item) => item?._id === statusId);
//     if (statusToEdit) {
//       // 🟢 FIX 5: Set all fields when editing
//       setFormData({
//         event_name: statusToEdit.event_name || "",
//         status: statusToEdit.event_status
//           ? statusToEdit.event_status.charAt(0).toUpperCase() +
//             statusToEdit.event_status.slice(1)
//           : "Active",
//         event_fullName: statusToEdit.event_fullName || "",
//         // event_fromDate: statusToEdit.event_fromDate || "",
//         // event_toDate: statusToEdit.event_toDate || "",
//         event_fromDate: formatDateForInput(statusToEdit.event_fromDate),
//         event_toDate: formatDateForInput(statusToEdit.event_toDate),
//         event_address: statusToEdit.event_address || "",
//         event_country: statusToEdit.event_country || "",
//         event_state: statusToEdit.event_state || "",
//         event_city: statusToEdit.event_city || "",
//         event_pincode: statusToEdit.event_pincode || "",
//       });
//       setEditingStatus(statusToEdit);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   // ... (handleDelete and filteredAndSortedStatusOptions remain the same) ...

//   const handleDelete = async (statusId) => {
//     const statusToDelete = events.find((item) => item?._id === statusId);
//     if (!statusToDelete) return;
//     try {
//       await dispatch(deleteEvent(statusId)).unwrap();
//       showSuccess("Event deleted successfully!");
//       dispatch(fetchEvents());
//     } catch (err) {
//       showError("Failed to delete event. Please try again.", 3000);
//       console.error("Failed to delete event:", err);
//     }
//   };

//   const filteredAndSortedStatusOptions = useMemo(() => {
//     let list = Array.isArray(events) ? events.filter(Boolean) : [];
//     // ... (rest of filtering/sorting logic) ...
//     if (searchText && searchText.trim()) {
//       const s = searchText.trim().toLowerCase();
//       list = list.filter((item) =>
//         (item?.event_name || "").toLowerCase().includes(s),
//       );
//     }
//     if (statusFilter === "Active" || statusFilter === "Inactive") {
//       list = list.filter(
//         (item) =>
//           (item?.event_status || "").toLowerCase() ===
//           statusFilter.toLowerCase(),
//       );
//     }
//     const { key, dir } = sortBy;
//     list.sort((a, b) => {
//       let av = a[key];
//       let bv = b[key];
//       if (key === "status_id") {
//         av = Number(av);
//         bv = Number(bv);
//       } else {
//         av = (av || "").toString().toLowerCase();
//         bv = (bv || "").toString().toLowerCase();
//       }
//       if (av < bv) return dir === "asc" ? -1 : 1;
//       if (av > bv) return dir === "asc" ? 1 : -1;
//       return 0;
//     });
//     return list;
//   }, [events, searchText, statusFilter, sortBy]);

//   const totalPages = Math.max(
//     1,
//     Math.ceil(filteredAndSortedStatusOptions.length / rowsPerPage),
//   );
//   useEffect(() => {
//     if (currentPage > totalPages) setCurrentPage(totalPages);
//   }, [totalPages, currentPage]);

//   const currentPageData = useMemo(() => {
//     const start = (currentPage - 1) * rowsPerPage;
//     return filteredAndSortedStatusOptions.slice(start, start + rowsPerPage);
//   }, [filteredAndSortedStatusOptions, currentPage, rowsPerPage]);

//   const toggleSort = (key) => {
//     setSortBy((prev) => {
//       if (prev.key === key) {
//         return { ...prev, dir: prev.dir === "asc" ? "desc" : "asc" };
//       } else {
//         return { key, dir: "asc" };
//       }
//     });
//   };

//   return (
//     <div
//       className="w-full"
//       style={{
//         backgroundColor: "#ecf0f5",
//         minHeight: "100vh",
//         padding: "0",
//         marginTop: "30px",
//       }}
//     >
//       {/* Header Section */}
//       <div
//         className="w-full bg-white"
//         style={{ borderBottom: "1px solid #e0e0e0" }}
//       >
//         <div className="flex items-center justify-between px-6 py-1">
//           <h1 className="text-lg font-normal" style={{ color: "#666" }}>
//             Events
//           </h1>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div style={{ padding: "20px" }}>
//         {/* Notification message */}
//         {message && (
//           <div style={styles.messageBox}>
//             <span>{message}</span>
//           </div>
//         )}

//         {/* Add/Edit Status Section */}
//         <div className="bg-white mb-5" style={{ border: "1px solid #ddd" }}>
//           <div
//             className="px-5 py-2"
//             style={{
//               backgroundColor: "#f9f9f9",
//               borderBottom: "1px solid #ddd",
//             }}
//           >
//             <h2
//               className="text-base font-medium"
//               style={{ color: "#555", margin: 0 }}
//             >
//               {editingStatus ? "EDIT EVENT" : "ADD EVENT"}
//             </h2>
//           </div>

//           <div className="p-6">
//             {/* 🟢 NEW INPUT FIELDS - ROW 1 */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//               {/* Event Name */}
//               <div>
//                 <label style={styles.label}>
//                   Event Name <span style={{ color: "#f44336" }}>*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="event_name"
//                   value={formData.event_name}
//                   onChange={handleChange}
//                   style={styles.input}
//                   required
//                   placeholder="Enter event name"
//                 />
//               </div>

//               {/* Full Name */}
//               <div>
//                 <label style={styles.label}>
//                   Full Name <span style={{ color: "#f44336" }}>*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="event_fullName"
//                   value={formData.event_fullName}
//                   onChange={handleChange}
//                   style={styles.input}
//                   required
//                   placeholder="Enter contact person's name"
//                 />
//               </div>

//               {/* From Date */}
//               <div>
//                 <label style={styles.label}>
//                   From Date <span style={{ color: "#f44336" }}>*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="event_fromDate"
//                   value={formData.event_fromDate}
//                   onChange={handleChange}
//                   required
//                   style={styles.input}
//                 />
//               </div>

//               {/* To Date */}
//               <div>
//                 <label style={styles.label}>
//                   To Date <span style={{ color: "#f44336" }}>*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="event_toDate"
//                   value={formData.event_toDate}
//                   onChange={handleChange}
//                   required
//                   style={styles.input}
//                 />
//               </div>
//             </div>

//             {/* 🟢 NEW INPUT FIELDS - ROW 2 (Address/Location) */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//               {/* Address */}
//               <div className="">
//                 <label style={styles.label}>
//                   Address <span style={{ color: "#f44336" }}>*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="event_address"
//                   value={formData.event_address}
//                   onChange={handleChange}
//                   style={styles.input}
//                   required
//                   placeholder="Enter event address"
//                 />
//               </div>

//               {/* Country Dropdown */}
//               <div>
//                 <label style={styles.label}>
//                   Country <span style={{ color: "#f44336" }}>*</span>
//                 </label>
//                 <select
//                   name="event_country"
//                   value={formData.event_country}
//                   onChange={handleChange}
//                   style={styles.input}
//                   required
//                 >
//                   <option value="">Select Country</option>
//                   {countries?.map((country, i) => (
//                     <option key={country._id || i} value={country.name}>
//                       {country.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* State Dropdown */}
//               <div>
//                 <label style={styles.label}>
//                   State <span style={{ color: "#f44336" }}>*</span>
//                 </label>
//                 <select
//                   name="event_state"
//                   value={formData.event_state}
//                   onChange={handleChange}
//                   style={styles.input}
//                   required
//                 >
//                   <option value="">Select State</option>
//                   {states?.map((state, i) => (
//                     <option key={state._id || i} value={state?.name}>
//                       {state?.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* City Dropdown */}
//               <div>
//                 <label style={styles.label}>
//                   City <span style={{ color: "#f44336" }}>*</span>
//                 </label>
//                 <select
//                   name="event_city"
//                   value={formData.event_city}
//                   onChange={handleChange}
//                   style={styles.input}
//                   required
//                 >
//                   <option value="">Select City</option>
//                   {cities?.map((city, i) => (
//                     <option key={city?._id || i} value={city?.name}>
//                       {city?.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* 🟢 NEW INPUT FIELDS - ROW 3 (Pincode and Status) */}
//             <div
//               className="flex items-start gap-8"
//               style={{ alignItems: "flex-end" }}
//             >
//               {/* Pincode (6 digits) */}
//               <div style={{ width: 200 }}>
//                 <label style={styles.label}>
//                   Pincode <span style={{ color: "#f44336" }}>*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="event_pincode"
//                   value={formData.event_pincode}
//                   onChange={handleChange}
//                   maxLength={6} // Browser max length
//                   style={styles.input}
//                   placeholder="Enter 6 digit pincode"
//                   required
//                 />
//               </div>

//               {/* Status Field (Original) */}
//               <div style={{ width: 200 }}>
//                 <label style={styles.label}>Status</label>
//                 <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
//                   <label style={styles.radioLabel}>
//                     <input
//                       type="radio"
//                       name="status"
//                       value="Active"
//                       checked={formData.status === "Active"}
//                       onChange={handleChange}
//                       style={{ marginRight: 8 }}
//                     />
//                     <span style={{ color: "#333" }}>Active</span>
//                   </label>
//                   <label style={styles.radioLabel}>
//                     <input
//                       type="radio"
//                       name="status"
//                       value="Inactive"
//                       checked={formData.status === "Inactive"}
//                       onChange={handleChange}
//                       style={{ marginRight: 8 }}
//                     />
//                     <span style={{ color: "#333" }}>Inactive</span>
//                   </label>
//                 </div>
//               </div>

//               {/* Add / Update Button */}
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "flex-end",
//                   marginLeft: "auto",
//                 }}
//               >
//                 <button
//                   onClick={handleAddEvent}
//                   className="px-6 py-1 text-sm text-white"
//                   style={{
//                     backgroundColor: "#5bc0de",
//                     border: "none",
//                     borderRadius: 3,
//                     cursor: "pointer",
//                   }}
//                   title={editingStatus ? "Update Event" : "Add Event"}
//                 >
//                   {editingStatus ? "Update Event" : "Add Event"}
//                 </button>
//               </div>

//               {/* Cancel (visible when editing) */}
//               {editingStatus && (
//                 <div style={{ display: "flex", alignItems: "flex-end" }}>
//                   <button
//                     onClick={resetForm}
//                     className="px-4 py-1 text-sm"
//                     style={{
//                       backgroundColor: "#e0e0e0",
//                       color: "#333",
//                       borderRadius: 3,
//                       border: "none",
//                       cursor: "pointer",
//                     }}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* ... (Rest of the List Section/Table remains the same) ... */}
//         {/* List Section */}
//         <div className="bg-white" style={{ border: "1px solid #ddd" }}>
//           {/* Filter / Search / Sort Row */}
//           <div
//             className="px-5 py-3"
//             style={{
//               backgroundColor: "#f9f9f9",
//               borderBottom: "1px solid #ddd",
//               display: "flex",
//               alignItems: "center",
//               gap: 12,
//             }}
//           >
//             <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
//               <label
//                 style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
//               >
//                 <span style={{ color: "#333", fontSize: 13 }}>Show</span>
//                 <select
//                   value={rowsPerPage}
//                   onChange={(e) => {
//                     setRowsPerPage(Number(e.target.value));
//                     setCurrentPage(1);
//                   }}
//                   style={styles.smallSelect}
//                 >
//                   <option value={5}>5</option>
//                   <option value={10}>10</option>
//                   <option value={20}>20</option>
//                   <option value={50}>50</option>
//                 </select>
//                 <span style={{ color: "#333", fontSize: 13 }}>entries</span>
//               </label>

//               <label
//                 style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
//               >
//                 <span style={{ color: "#333", fontSize: 13 }}>Status</span>
//                 <select
//                   value={statusFilter}
//                   onChange={(e) => {
//                     setStatusFilter(e.target.value);
//                     setCurrentPage(1);
//                   }}
//                   style={styles.smallSelect}
//                 >
//                   <option value="All">All</option>
//                   <option value="Active">Active</option>
//                   <option value="Inactive">Inactive</option>
//                 </select>
//               </label>
//             </div>

//             {/* Search box */}
//             <div
//               style={{
//                 marginLeft: "auto",
//                 display: "flex",
//                 gap: 8,
//                 alignItems: "center",
//               }}
//             >
//               <input
//                 type="text"
//                 placeholder="Search event..."
//                 value={searchText}
//                 onChange={(e) => {
//                   setSearchText(e.target.value);
//                   setCurrentPage(1);
//                 }}
//                 style={styles.searchInput}
//               />
//               <button
//                 onClick={() => {
//                   setSearchText("");
//                   setStatusFilter("All");
//                   setRowsPerPage(10);
//                   setSortBy({ key: "event_name", dir: "asc" });
//                 }}
//                 style={styles.clearBtn}
//               >
//                 Reset
//               </button>
//             </div>
//           </div>

//           {/* Table header */}
//           <div style={{ maxHeight: "500px", overflowY: "auto" }}>
//             <table
//               className="w-full"
//               style={{ borderCollapse: "collapse", width: "100%" }}
//             >
//               <thead
//                 style={{
//                   position: "sticky",
//                   top: 0,
//                   backgroundColor: "#f9f9f9",
//                   zIndex: 1,
//                 }}
//               >
//                 <tr style={{ borderBottom: "2px solid #ddd" }}>
//                   <th
//                     className="px-4 py-3 text-sm font-semibold text-center"
//                     style={thStyle(80)}
//                   >
//                     <div
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         gap: 8,
//                       }}
//                     >
//                       No.
//                     </div>
//                   </th>
//                   <th
//                     className="px-4 py-3 text-sm font-semibold text-left"
//                     style={thStyle()}
//                   >
//                     <div
//                       style={{ display: "flex", alignItems: "center", gap: 8 }}
//                     >
//                       Name
//                       <button
//                         onClick={() => toggleSort("event_fullName")}
//                         style={styles.sortBtn}
//                       >
//                         {sortBy.key === "event_fullName"
//                           ? sortBy.dir === "asc"
//                             ? "▲"
//                             : "▼"
//                           : "↕"}
//                       </button>
//                     </div>
//                   </th>
//                   <th
//                     className="px-4 py-3 text-sm font-semibold text-center"
//                     style={thStyle()}
//                   >
//                     <div
//                       style={{ display: "flex", alignItems: "center", gap: 8 }}
//                     >
//                       From Date
//                       <button
//                         onClick={() => toggleSort("event_toDate")}
//                         style={styles.sortBtn}
//                       >
//                         {sortBy.key === "event_toDate"
//                           ? sortBy.dir === "asc"
//                             ? "▲"
//                             : "▼"
//                           : "↕"}
//                       </button>
//                     </div>
//                   </th>
//                   <th
//                     className="px-4 py-3 text-sm font-semibold text-center"
//                     style={thStyle()}
//                   >
//                     <div
//                       style={{ display: "flex", alignItems: "center", gap: 8 }}
//                     >
//                       To Date
//                       <button
//                         onClick={() => toggleSort("event_toDate")}
//                         style={styles.sortBtn}
//                       >
//                         {sortBy.key === "event_toDate"
//                           ? sortBy.dir === "asc"
//                             ? "▲"
//                             : "▼"
//                           : "↕"}
//                       </button>
//                     </div>
//                   </th>
//                   <th
//                     className="px-4 py-3 text-sm font-semibold text-left"
//                     style={thStyle()}
//                   >
//                     <div
//                       style={{ display: "flex", alignItems: "center", gap: 8 }}
//                     >
//                       Added By
//                       <button
//                         onClick={() => toggleSort("added_by")}
//                         style={styles.sortBtn}
//                       >
//                         {sortBy.key === "event_added_by"
//                           ? sortBy.dir === "asc"
//                             ? "▲"
//                             : "▼"
//                           : "↕"}
//                       </button>
//                     </div>
//                   </th>
//                   <th
//                     className="px-4 py-3 text-sm font-semibold text-center"
//                     style={thStyle(150)}
//                   >
//                     <div
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         gap: 8,
//                       }}
//                     >
//                       Status
//                       <button
//                         onClick={() => toggleSort("event_status")}
//                         style={styles.sortBtn}
//                       >
//                         {sortBy.key === "event_status"
//                           ? sortBy.dir === "asc"
//                             ? "▲"
//                             : "▼"
//                           : "↕"}
//                       </button>
//                     </div>
//                   </th>
//                   <th
//                     className="px-4 py-3 text-sm font-semibold text-center"
//                     style={thStyle(120)}
//                   >
//                     Action
//                   </th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {loading && (
//                   <tr>
//                     <td
//                       colSpan={4}
//                       style={{
//                         padding: 24,
//                         textAlign: "center",
//                         color: "#777",
//                       }}
//                     >
//                       Loading status options...
//                     </td>
//                   </tr>
//                 )}

//                 {currentPageData.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={4}
//                       style={{
//                         padding: 24,
//                         textAlign: "center",
//                         color: "#777",
//                       }}
//                     >
//                       No event options found.
//                     </td>
//                   </tr>
//                 ) : (
//                   currentPageData.map((statusItem, index) => (
//                     <tr
//                       key={statusItem._id}
//                       style={{
//                         borderBottom: "1px solid #ddd",
//                         backgroundColor:
//                           index % 2 === 0 ? "#ffffff" : "#f9f9f9",
//                       }}
//                     >
//                       <td
//                         className="px-4 py-3 text-sm text-center"
//                         style={{ color: "#333", width: 80 }}
//                       >
//                         {(currentPage - 1) * rowsPerPage + index + 1}
//                       </td>

//                       <td
//                         className="px-4 py-3 text-sm"
//                         style={{ color: "#333" }}
//                       >
//                         {statusItem?.event_fullName || ""}
//                       </td>
//                       <td
//                         className="px-4 py-3 text-sm"
//                         style={{ color: "#333" }}
//                       >
//                         {statusItem?.event_toDate
//                           ? new Date(
//                               statusItem.event_toDate,
//                             ).toLocaleDateString("en-GB", {
//                               day: "2-digit",
//                               month: "short",
//                               year: "numeric",
//                             })
//                           : ""}
//                       </td>

//                       <td
//                         className="px-4 py-3 text-sm"
//                         style={{ color: "#333" }}
//                       >
//                         {statusItem?.event_fromDate
//                           ? new Date(
//                               statusItem.event_fromDate,
//                             ).toLocaleDateString("en-GB", {
//                               day: "2-digit",
//                               month: "short",
//                               year: "numeric",
//                             })
//                           : ""}
//                       </td>
//                       <td
//                         className="px-4 py-3 text-sm"
//                         style={{ color: "#333" }}
//                       >
//                         {statusItem?.added_by || ""}
//                       </td>

//                       <td className="px-4 py-3 text-center">
//                         {statusItem?.event_status ? (
//                           <span
//                             className="inline-block px-3 py-1 text-xs text-white"
//                             style={{
//                               backgroundColor:
//                                 statusItem.event_status.toLowerCase() ===
//                                 "active"
//                                   ? "#337ab7"
//                                   : "#d9534f",
//                               borderRadius: 3,
//                             }}
//                           >
//                             {statusItem.event_status.charAt(0).toUpperCase() +
//                               statusItem.event_status.slice(1)}
//                           </span>
//                         ) : null}
//                       </td>

//                       <td className="px-4 py-3" style={{ textAlign: "center" }}>
//                         <div
//                           style={{
//                             display: "flex",
//                             justifyContent: "center",
//                             gap: 8,
//                           }}
//                         >
//                           <button
//                             onClick={() => handleEdit(statusItem._id)}
//                             style={{
//                               ...styles.iconBtn,
//                               borderColor: "#337ab7",
//                               color: "#337ab7",
//                             }}
//                             title="Edit"
//                           >
//                             <Pencil size={14} />
//                           </button>

//                           <button
//                             onClick={() => handleDelete(statusItem._id)}
//                             style={{
//                               ...styles.iconBtn,
//                               borderColor: "#d9534f",
//                               color: "#d9534f",
//                             }}
//                             title="Delete"
//                           >
//                             <Trash2 size={14} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Footer: Pagination and summary */}
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               padding: 12,
//             }}
//           >
//             <div style={{ color: "#666", fontSize: 13 }}>
//               Showing{" "}
//               <strong style={{ color: "#333" }}>
//                 {filteredAndSortedStatusOptions.length === 0
//                   ? 0
//                   : (currentPage - 1) * rowsPerPage + 1}
//               </strong>{" "}
//               to{" "}
//               <strong style={{ color: "#333" }}>
//                 {Math.min(
//                   currentPage * rowsPerPage,
//                   filteredAndSortedStatusOptions.length,
//                 )}
//               </strong>{" "}
//               of{" "}
//               <strong style={{ color: "#333" }}>
//                 {filteredAndSortedStatusOptions.length}
//               </strong>{" "}
//               entries
//             </div>

//             <Pagination
//               currentPage={currentPage}
//               totalPages={totalPages}
//               onPageChange={setCurrentPage}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ... (Styles object remains the same) ...
// const styles = {
//   input: {
//     border: "1px solid #d2d6de",
//     borderRadius: 3,
//     padding: "5px 10px",
//     fontSize: 14,
//     width: "100%",
//     boxSizing: "border-box",
//   },
//   label: {
//     display: "block",
//     fontSize: 14,
//     fontWeight: 500,
//     color: "#333",
//     marginBottom: 6,
//   },
//   radioLabel: {
//     display: "inline-flex",
//     alignItems: "center",
//     gap: 6,
//     cursor: "pointer",
//   },
//   smallActionBtn: {
//     backgroundColor: "#f7f7f7",
//     border: "1px solid #ddd",
//     padding: "6px 10px",
//     borderRadius: 3,
//     cursor: "pointer",
//     fontSize: 13,
//   },
//   searchInput: {
//     padding: "3px 10px",
//     borderRadius: 3,
//     border: "1px solid #d2d6de",
//     width: 280,
//   },
//   clearBtn: {
//     padding: "4px 10px",
//     borderRadius: 3,
//     border: "1px solid #ddd",
//     backgroundColor: "#fff",
//     cursor: "pointer",
//     fontSize: 13,
//   },
//   smallSelect: {
//     padding: "3px 8px",
//     borderRadius: 3,
//     border: "1px solid #d2d6de",
//   },
//   iconBtn: {
//     padding: 6,
//     borderRadius: 4,
//     border: "1px solid #ccc",
//     backgroundColor: "white",
//     cursor: "pointer",
//   },
//   sortBtn: {
//     background: "transparent",
//     border: "none",
//     cursor: "pointer",
//     padding: 2,
//     fontSize: 12,
//   },
//   messageBox: {
//     backgroundColor: "#e9f7ef",
//     border: "1px solid #c7efd9",
//     padding: "8px 12px",
//     borderRadius: 4,
//     marginBottom: 12,
//     color: "#2f7a4b",
//     display: "inline-block",
//   },
//   pagination: {
//     display: "flex",
//     gap: 6,
//     alignItems: "center",
//   },
//   pageBtn: {
//     padding: "6px 9px",
//     border: "1px solid #ddd",
//     borderRadius: 4,
//     cursor: "pointer",
//     background: "white",
//   },
//   disabledBtn: {
//     opacity: 0.5,
//     cursor: "not-allowed",
//   },
//   activePageBtn: {
//     backgroundColor: "#3598dc",
//     color: "white",
//     borderColor: "#2f82c4",
//   },
//   pageGap: {
//     padding: "0 6px",
//     color: "#999",
//   },
// };

// /* Helper to produce th style with fixed width optional */
// const thStyle = (width) => ({
//   color: "#333",
//   borderRight: "1px solid #ddd",
//   textAlign: "center",
//   width: width ? width : "auto",
//   padding: "12px 8px",
// });

// export default AddEvent;
import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../../features/crmEvent/crmEventSlice";
import { showError, showSuccess } from "../../utils/toastMessage";
import { fetchCountries } from "../../features/add_by_admin/country/countrySlice";
import { fetchStates } from "../../features/state/stateSlice";
import { fetchCities } from "../../features/city/citySlice";

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
        className={`px-3 py-2 border border-gray-300 bg-white text-base rounded-md ${
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
        className={`px-3 py-2 border border-gray-300 bg-white text-base rounded-md ${
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
          className={`px-3 py-2 border text-base rounded-md ${
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
        className={`px-3 py-2 border border-gray-300 bg-white text-base rounded-md ${
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
        className={`px-3 py-2 border border-gray-300 bg-white text-base rounded-md ${
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

const AddEvent = () => {
  const dispatch = useDispatch();
  const [editingStatus, setEditingStatus] = useState(null);

  const addedBy = sessionStorage.getItem("user_name") || "";
  const [formData, setFormData] = useState({
    event_name: "",
    status: "Active",
    event_fullName: "",
    event_fromDate: "",
    event_toDate: "",
    event_address: "",
    event_country: "",
    event_state: "",
    event_city: "",
    event_pincode: "",
    added_by: addedBy,
  });

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [sortBy, setSortBy] = useState({ key: "event_name", dir: "asc" });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [message, setMessage] = useState(null);

  // event redux
  const {
    events = [],
    loading,
    error = null,
  } = useSelector((state) => state.crmEvents || {});
  const { countries } = useSelector((state) => state.countries);
  const { states } = useSelector((state) => state.states);
  const { cities } = useSelector((state) => state.cities);

  useEffect(() => {
    dispatch(fetchEvents());
    dispatch(fetchCountries());
    dispatch(fetchStates());
    dispatch(fetchCities());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "event_pincode") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 6) {
        setFormData((prevData) => ({
          ...prevData,
          [name]: numericValue,
        }));
      }
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      event_name: "",
      status: "Active",
      event_fullName: "",
      event_fromDate: "",
      event_toDate: "",
      event_address: "",
      event_country: "",
      event_state: "",
      event_city: "",
      event_pincode: "",
      added_by: addedBy,
    });
    setEditingStatus(null);
  };

  const handleAddEvent = async () => {
    const {
      event_name,
      event_fullName,
      event_fromDate,
      event_toDate,
      event_address,
      event_country,
      event_state,
      event_city,
      event_pincode,
      status,
      added_by,
    } = formData;

    if (!event_name || !event_name.trim()) {
      showError("Please enter an Event Name!");
      return;
    }
    if (!event_fullName || !event_fullName.trim()) {
      showError("Please enter the Full Name!");
      return;
    }

    const trimmedName = event_name.trim();

    const duplicate = (Array.isArray(events) ? events : []).find(
      (item) =>
        (item?.event_name || "").trim().toLowerCase() ===
          trimmedName.toLowerCase() &&
        (!editingStatus || item._id !== editingStatus._id),
    );
    if (duplicate) {
      showError("An event with that name already exists!");
      return;
    }

    const eventData = {
      event_name: trimmedName,
      event_status: status.toLowerCase(),
      event_fullName: event_fullName.trim(),
      event_fromDate: event_fromDate,
      event_toDate: event_toDate,
      event_address: event_address.trim(),
      event_country: event_country,
      event_state: event_state,
      event_city: event_city,
      event_pincode: event_pincode,
      added_by: added_by || sessionStorage.getItem("user_name") || "System",
    };

    try {
      if (editingStatus) {
        await dispatch(
          updateEvent({ id: editingStatus._id, updates: eventData }),
        ).unwrap();
        showSuccess("Event updated successfully!");
      } else {
        await dispatch(createEvent(eventData)).unwrap();
        showSuccess("Event added successfully!");
      }
      resetForm();
      dispatch(fetchEvents());
    } catch (err) {
      const action = editingStatus ? "update" : "create";
      showError(`Failed to ${action} event. Please try again.`);
      console.error(`Failed to ${action} event:`, err);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      if (dateString.includes("T")) {
        return dateString.split("T")[0];
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (e) {
      return "";
    }
  };

  const handleEdit = (statusId) => {
    const statusToEdit = events.find((item) => item?._id === statusId);
    if (statusToEdit) {
      setFormData({
        event_name: statusToEdit.event_name || "",
        status: statusToEdit.event_status
          ? statusToEdit.event_status.charAt(0).toUpperCase() +
            statusToEdit.event_status.slice(1)
          : "Active",
        event_fullName: statusToEdit.event_fullName || "",
        event_fromDate: formatDateForInput(statusToEdit.event_fromDate),
        event_toDate: formatDateForInput(statusToEdit.event_toDate),
        event_address: statusToEdit.event_address || "",
        event_country: statusToEdit.event_country || "",
        event_state: statusToEdit.event_state || "",
        event_city: statusToEdit.event_city || "",
        event_pincode: statusToEdit.event_pincode || "",
      });
      setEditingStatus(statusToEdit);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (statusId) => {
    const statusToDelete = events.find((item) => item?._id === statusId);
    if (!statusToDelete) return;
    try {
      await dispatch(deleteEvent(statusId)).unwrap();
      showSuccess("Event deleted successfully!");
      dispatch(fetchEvents());
    } catch (err) {
      showError("Failed to delete event. Please try again.", 3000);
      console.error("Failed to delete event:", err);
    }
  };

  const filteredAndSortedStatusOptions = useMemo(() => {
    let list = Array.isArray(events) ? events.filter(Boolean) : [];
    if (searchText && searchText.trim()) {
      const s = searchText.trim().toLowerCase();
      list = list.filter((item) =>
        (item?.event_name || "").toLowerCase().includes(s),
      );
    }
    if (statusFilter === "Active" || statusFilter === "Inactive") {
      list = list.filter(
        (item) =>
          (item?.event_status || "").toLowerCase() ===
          statusFilter.toLowerCase(),
      );
    }
    const { key, dir } = sortBy;
    list.sort((a, b) => {
      let av = a[key];
      let bv = b[key];
      if (key === "status_id") {
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
  }, [events, searchText, statusFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedStatusOptions.length / rowsPerPage),
  );
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const currentPageData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedStatusOptions.slice(start, start + rowsPerPage);
  }, [filteredAndSortedStatusOptions, currentPage, rowsPerPage]);

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
    <div className="w-full min-h-screen bg-[#ecf0f5] mt-[30px]">
      {/* Header Section */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-8 py-3">
          <h1 className="text-2xl font-normal text-gray-600">Events</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Notification message */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-md">
            {message}
          </div>
        )}

        {/* Add/Edit Event Section */}
        <div className="bg-white border border-gray-200 rounded-md">
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-600">
              {editingStatus ? "EDIT EVENT" : "ADD EVENT"}
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Row 1: Event Name, Full Name, From Date, To Date */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="event_name"
                  value={formData.event_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Enter event name"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="event_fullName"
                  value={formData.event_fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Enter contact person's name"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">
                  From Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="event_fromDate"
                  value={formData.event_fromDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">
                  To Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="event_toDate"
                  value={formData.event_toDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Row 2: Address, Country, State, City */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="event_address"
                  value={formData.event_address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Enter event address"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  name="event_country"
                  value={formData.event_country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Country</option>
                  {countries?.map((country, i) => (
                    <option key={country._id || i} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  name="event_state"
                  value={formData.event_state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select State</option>
                  {states?.map((state, i) => (
                    <option key={state._id || i} value={state?.name}>
                      {state?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  name="event_city"
                  value={formData.event_city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select City</option>
                  {cities?.map((city, i) => (
                    <option key={city?._id || i} value={city?.name}>
                      {city?.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Pincode, Status, Buttons */}
            <div className="flex flex-wrap items-end gap-6">
              <div className="w-64">
                <label className="block text-base font-medium text-gray-700 mb-1">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="event_pincode"
                  value={formData.event_pincode}
                  onChange={handleChange}
                  maxLength={6}
                  className="w-full px-4 py-2 text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter 6 digit pincode"
                  required
                />
              </div>

              <div className="w-64">
                <label className="block text-base font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      checked={formData.status === "Active"}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-base text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Inactive"
                      checked={formData.status === "Inactive"}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-base text-gray-700">Inactive</span>
                  </label>
                </div>
              </div>

              <div className="flex-1 flex justify-end gap-3">
                <button
                  onClick={handleAddEvent}
                  className="px-8 py-2 text-base text-white bg-[#5bc0de] rounded-md hover:bg-[#46b8da]"
                  title={editingStatus ? "Update Event" : "Add Event"}
                >
                  {editingStatus ? "Update Event" : "Add Event"}
                </button>

                {editingStatus && (
                  <button
                    onClick={resetForm}
                    className="px-6 py-2 text-base text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="bg-white border border-gray-200 rounded-md">
          {/* Filter / Search / Sort Row */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <span className="text-base text-gray-700">Show</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 text-base rounded-md"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-base text-gray-700">entries</span>
              </label>

              <label className="flex items-center gap-2">
                <span className="text-base text-gray-700">Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 text-base rounded-md"
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search event..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 text-base border border-gray-300 rounded-md w-64"
              />
              <button
                onClick={() => {
                  setSearchText("");
                  setStatusFilter("All");
                  setRowsPerPage(10);
                  setSortBy({ key: "event_name", dir: "asc" });
                }}
                className="px-4 py-2 text-base border border-gray-300 bg-white rounded-md hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto max-h-[550px]">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="border-b-2 border-gray-200">
                  <th className="px-5 py-3 text-base font-semibold text-gray-700 text-center w-16">
                    No.
                  </th>
                  <th className="px-5 py-3 text-base font-semibold text-gray-700 text-left">
                    <div className="flex items-center gap-2">
                      Name
                      <button
                        onClick={() => toggleSort("event_fullName")}
                        className="bg-transparent border-none cursor-pointer text-sm"
                      >
                        {sortBy.key === "event_fullName"
                          ? sortBy.dir === "asc"
                            ? "▲"
                            : "▼"
                          : "↕"}
                      </button>
                    </div>
                  </th>
                  <th className="px-5 py-3 text-base font-semibold text-gray-700 text-center">
                    <div className="flex items-center justify-center gap-2">
                      From Date
                      <button
                        onClick={() => toggleSort("event_fromDate")}
                        className="bg-transparent border-none cursor-pointer text-sm"
                      >
                        {sortBy.key === "event_fromDate"
                          ? sortBy.dir === "asc"
                            ? "▲"
                            : "▼"
                          : "↕"}
                      </button>
                    </div>
                  </th>
                  <th className="px-5 py-3 text-base font-semibold text-gray-700 text-center">
                    <div className="flex items-center justify-center gap-2">
                      To Date
                      <button
                        onClick={() => toggleSort("event_toDate")}
                        className="bg-transparent border-none cursor-pointer text-sm"
                      >
                        {sortBy.key === "event_toDate"
                          ? sortBy.dir === "asc"
                            ? "▲"
                            : "▼"
                          : "↕"}
                      </button>
                    </div>
                  </th>
                  <th className="px-5 py-3 text-base font-semibold text-gray-700 text-left">
                    <div className="flex items-center gap-2">
                      Added By
                      <button
                        onClick={() => toggleSort("added_by")}
                        className="bg-transparent border-none cursor-pointer text-sm"
                      >
                        {sortBy.key === "added_by"
                          ? sortBy.dir === "asc"
                            ? "▲"
                            : "▼"
                          : "↕"}
                      </button>
                    </div>
                  </th>
                  <th className="px-5 py-3 text-base font-semibold text-gray-700 text-center w-32">
                    <div className="flex items-center justify-center gap-2">
                      Status
                      <button
                        onClick={() => toggleSort("event_status")}
                        className="bg-transparent border-none cursor-pointer text-sm"
                      >
                        {sortBy.key === "event_status"
                          ? sortBy.dir === "asc"
                            ? "▲"
                            : "▼"
                          : "↕"}
                      </button>
                    </div>
                  </th>
                  <th className="px-5 py-3 text-base font-semibold text-gray-700 text-center w-28">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-gray-500 text-base"
                    >
                      Loading events...
                    </td>
                  </tr>
                )}

                {!loading && currentPageData.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-gray-500 text-base"
                    >
                      No event options found.
                    </td>
                  </tr>
                )}

                {!loading &&
                  currentPageData.map((eventItem, index) => (
                    <tr
                      key={eventItem._id}
                      className={`border-b border-gray-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-5 py-3 text-base text-center text-gray-700">
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </td>

                      <td className="px-5 py-3 text-base text-gray-700">
                        {eventItem?.event_fullName || ""}
                      </td>

                      <td className="px-5 py-3 text-base text-center text-gray-700">
                        {eventItem?.event_fromDate
                          ? new Date(
                              eventItem.event_fromDate,
                            ).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : ""}
                      </td>

                      <td className="px-5 py-3 text-base text-center text-gray-700">
                        {eventItem?.event_toDate
                          ? new Date(eventItem.event_toDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : ""}
                      </td>

                      <td className="px-5 py-3 text-base text-gray-700">
                        {eventItem?.added_by || ""}
                      </td>

                      <td className="px-5 py-3 text-center">
                        {eventItem?.event_status ? (
                          <span
                            className={`inline-block px-3 py-1 text-sm text-white rounded ${
                              eventItem.event_status.toLowerCase() === "active"
                                ? "bg-[#337ab7]"
                                : "bg-[#d9534f]"
                            }`}
                          >
                            {eventItem.event_status.charAt(0).toUpperCase() +
                              eventItem.event_status.slice(1)}
                          </span>
                        ) : null}
                      </td>

                      <td className="px-5 py-3 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleEdit(eventItem._id)}
                            className="p-2 border border-[#337ab7] text-[#337ab7] rounded-md hover:bg-[#337ab7]/10"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(eventItem._id)}
                            className="p-2 border border-[#d9534f] text-[#d9534f] rounded-md hover:bg-[#d9534f]/10"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Footer: Pagination and summary */}
          <div className="flex flex-wrap items-center justify-between p-4 border-t border-gray-200">
            <div className="text-base text-gray-600">
              Showing{" "}
              <strong className="text-gray-800">
                {filteredAndSortedStatusOptions.length === 0
                  ? 0
                  : (currentPage - 1) * rowsPerPage + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-gray-800">
                {Math.min(
                  currentPage * rowsPerPage,
                  filteredAndSortedStatusOptions.length,
                )}
              </strong>{" "}
              of{" "}
              <strong className="text-gray-800">
                {filteredAndSortedStatusOptions.length}
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

export default AddEvent;
