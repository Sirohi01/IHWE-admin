import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../../features/crmEvent/crmEventSlice";
import Swal from "sweetalert2";
import { createActivityLogThunk } from "../../features/activityLog/activityLogSlice";
import { fetchCountries } from "../../features/add_by_admin/country/countrySlice";
import { fetchStates } from "../../features/state/stateSlice";
import { fetchCities } from "../../features/city/citySlice";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let p = start; p <= end; p++) pages.push(p);
  const btnCls = "w-8 h-8 flex items-center justify-center border border-slate-300 bg-white text-[11px] font-bold rounded-[2px] hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed";
  const activeBtnCls = "w-8 h-8 flex items-center justify-center border border-[#23471d] bg-[#23471d] text-white text-[11px] font-bold rounded-[2px]";
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className={btnCls}>{"<<"}</button>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={btnCls}>{"<"}</button>
      {start > 1 && <span className="px-1 text-slate-400 text-[10px] font-bold">...</span>}
      {pages.map((p) => <button key={p} onClick={() => onPageChange(p)} className={p === currentPage ? activeBtnCls : btnCls}>{p}</button>)}
      {end < totalPages && <span className="px-1 text-slate-400 text-[10px] font-bold">...</span>}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={btnCls}>{">"}</button>
      <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className={btnCls}>{">>"}</button>
    </div>
  );
};

const AddEvent = () => {
  const dispatch = useDispatch();
  const [editingStatus, setEditingStatus] = useState(null);
  const addedBy = sessionStorage.getItem("user_name") || "";
  const [formData, setFormData] = useState({
    event_name: "", status: "Active", event_fullName: "", event_fromDate: "",
    event_toDate: "", event_address: "", event_country: "", event_state: "",
    event_city: "", event_pincode: "", added_by: addedBy,
  });
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState({ key: "event_name", dir: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { events = [], loading } = useSelector((state) => state.crmEvents || {});
  const { countries } = useSelector((state) => state.countries);
  const { states } = useSelector((state) => state.states);
  const { cities } = useSelector((state) => state.cities);

  useEffect(() => {
    dispatch(fetchEvents()); dispatch(fetchCountries()); dispatch(fetchStates()); dispatch(fetchCities());
  }, [dispatch]);

  const filteredStates = useMemo(() => {
    if (!formData.event_country || !states?.length) return [];
    const countryObj = countries.find(c => 
      c.name && c.name.trim().toLowerCase() === formData.event_country.trim().toLowerCase()
    );
    if (!countryObj) return [];
    return states.filter(s => String(s.countryCode) === String(countryObj.countryCode));
  }, [formData.event_country, countries, states]);

  const filteredCities = useMemo(() => {
    if (!formData.event_state || !states?.length || !cities?.length) return [];
    const stateObj = states.find(s => 
      s.name && s.name.trim().toLowerCase() === formData.event_state.trim().toLowerCase()
    );
    if (!stateObj) return [];
    return cities.filter(c => String(c.stateCode) === String(stateObj.stateCode));
  }, [formData.event_state, states, cities]);

  const handleCountryChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, event_country: value, event_state: "", event_city: "" }));
  };

  const handleStateChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, event_state: value, event_city: "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "event_pincode") {
      const v = value.replace(/\D/g, "");
      if (v.length <= 6) setFormData((prev) => ({ ...prev, [name]: v }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ event_name: "", status: "Active", event_fullName: "", event_fromDate: "", event_toDate: "", event_address: "", event_country: "", event_state: "", event_city: "", event_pincode: "", added_by: addedBy });
    setEditingStatus(null);
  };

  const handleAddEvent = async (e) => {
    if (e) e.preventDefault();
    if (!formData.event_name?.trim()) {
      Swal.fire({ title: "Error", text: "Please enter an Event Name!", icon: "error", confirmButtonColor: "#23471d" });
      return;
    }
    if (!formData.event_fullName?.trim()) {
      Swal.fire({ title: "Error", text: "Please enter the Full Name!", icon: "error", confirmButtonColor: "#23471d" });
      return;
    }
    const trimmedName = formData.event_name.trim();
    const duplicate = (Array.isArray(events) ? events : []).find(
      (item) => (item?.event_name || "").trim().toLowerCase() === trimmedName.toLowerCase() && (!editingStatus || item._id !== editingStatus._id)
    );
    if (duplicate) {
      Swal.fire({ title: "Duplicate", text: "An event with that name already exists!", icon: "warning", confirmButtonColor: "#23471d" });
      return;
    }
    const eventData = {
      event_name: trimmedName, event_status: formData.status.toLowerCase(),
      event_fullName: formData.event_fullName.trim(), event_fromDate: formData.event_fromDate,
      event_toDate: formData.event_toDate, event_address: formData.event_address.trim(),
      event_country: formData.event_country, event_state: formData.event_state,
      event_city: formData.event_city, event_pincode: formData.event_pincode,
      added_by: formData.added_by || sessionStorage.getItem("user_name") || "System",
    };
    try {
      if (editingStatus) {
        await dispatch(updateEvent({ id: editingStatus._id, updates: eventData })).unwrap();
        
        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Updated event '${formData.event_name}'`,
            section: "System Configuration",
            data: { action: "UPDATE", type: "EVENT", name: formData.event_name }
          }));
        }

        Swal.fire({ title: "Updated!", text: "Event updated successfully!", icon: "success", confirmButtonColor: "#23471d" });
      } else {
        await dispatch(createEvent(eventData)).unwrap();
        
        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Added new event '${formData.event_name}'`,
            section: "System Configuration",
            data: { action: "ADD", type: "EVENT", name: formData.event_name }
          }));
        }

        Swal.fire({ title: "Success!", text: "Event added successfully!", icon: "success", confirmButtonColor: "#23471d" });
      }
      resetForm(); dispatch(fetchEvents());
    } catch (err) {
      Swal.fire({ title: "Error", text: `Failed to ${editingStatus ? "update" : "create"} event.`, icon: "error", confirmButtonColor: "#23471d" });
    }
  };

  const formatDateForInput = (d) => {
    if (!d) return "";
    try { return d.includes("T") ? d.split("T")[0] : new Date(d).toISOString().split("T")[0]; } catch { return ""; }
  };

  const handleEdit = (statusId) => {
    const s = events.find((item) => item?._id === statusId);
    if (s) {
      setFormData({
        event_name: s.event_name || "", status: s.event_status ? s.event_status.charAt(0).toUpperCase() + s.event_status.slice(1) : "Active",
        event_fullName: s.event_fullName || "", event_fromDate: formatDateForInput(s.event_fromDate),
        event_toDate: formatDateForInput(s.event_toDate), event_address: s.event_address || "",
        event_country: s.event_country || "", event_state: s.event_state || "",
        event_city: s.event_city || "", event_pincode: s.event_pincode || "",
      });
      setEditingStatus(s); window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (statusId) => {
    const eventToDelete = events.find(e => e._id === statusId);
    if (!eventToDelete) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete event '${eventToDelete.event_name}'?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#23471d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try { 
        await dispatch(deleteEvent(statusId)).unwrap(); 
        
        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Deleted event '${eventToDelete.event_name}'`,
            section: "System Configuration",
            data: { action: "DELETE", type: "EVENT", name: eventToDelete.event_name }
          }));
        }

        Swal.fire({ title: "Deleted!", text: "Event has been deleted.", icon: "success", confirmButtonColor: "#23471d" });
        dispatch(fetchEvents()); 
      }
      catch (err) {
        Swal.fire({ title: "Error", text: "Failed to delete event.", icon: "error", confirmButtonColor: "#23471d" });
      }
    }
  };

  const filteredAndSorted = useMemo(() => {
    let list = Array.isArray(events) ? events.filter(Boolean) : [];
    if (searchText?.trim()) list = list.filter((item) => (item?.event_name || "").toLowerCase().includes(searchText.trim().toLowerCase()));
    if (statusFilter === "Active" || statusFilter === "Inactive") list = list.filter((item) => (item?.event_status || "").toLowerCase() === statusFilter.toLowerCase());
    const { key, dir } = sortBy;
    list.sort((a, b) => {
      let av = (a[key] || "").toString().toLowerCase();
      let bv = (b[key] || "").toString().toLowerCase();
      return av < bv ? (dir === "asc" ? -1 : 1) : av > bv ? (dir === "asc" ? 1 : -1) : 0;
    });
    return list;
  }, [events, searchText, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / rowsPerPage));
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [totalPages, currentPage]);
  const currentPageData = useMemo(() => filteredAndSorted.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage), [filteredAndSorted, currentPage, rowsPerPage]);
  const toggleSort = (key) => setSortBy((prev) => prev.key === key ? { ...prev, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });

  const inputCls = "rounded-[2px] border border-slate-400 h-8 focus:border-[#23471d] focus:outline-none transition-all text-[12px] bg-white placeholder:text-slate-400 text-slate-900 font-medium px-3 w-full";
  const selectCls = "rounded-[2px] border border-slate-400 h-8 focus:border-[#23471d] focus:outline-none transition-all text-[12px] bg-white text-slate-900 font-medium px-3 w-full";
  const labelCls = "text-[11px] font-bold text-slate-800 mb-1 block";

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-inter animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b border-gray-100 px-2 py-4">
        <div>
          <h1 className="text-xl font-bold text-slate-500 uppercase tracking-tight">EVENT CONFIGURATION</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Expo Events Management | IHWE Calendar</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6 space-y-8">
        {/* Form Card */}
        <div className="bg-white shadow-md border border-gray-200 rounded-[2px] overflow-hidden">
          <div className="bg-slate-50/50 border-b border-slate-200 px-6 py-3">
            <h2 className="text-[16px] font-bold text-slate-800 uppercase">{editingStatus ? "Edit Event" : "Add Event"}</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-0.5 font-bold">International Health & Wellness Expo 2026</p>
          </div>
          <div className="p-6 lg:p-8">
            <form onSubmit={handleAddEvent}>
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
                <div>
                  <label className={labelCls}>Event Name <span className="text-red-500">*</span></label>
                  <input type="text" name="event_name" value={formData.event_name} onChange={handleChange} className={inputCls} placeholder="Enter event name" required />
                </div>
                <div>
                  <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
                  <input type="text" name="event_fullName" value={formData.event_fullName} onChange={handleChange} className={inputCls} placeholder="Contact person's name" required />
                </div>
                <div>
                  <label className={labelCls}>From Date <span className="text-red-500">*</span></label>
                  <input type="date" name="event_fromDate" value={formData.event_fromDate} onChange={handleChange} className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>To Date <span className="text-red-500">*</span></label>
                  <input type="date" name="event_toDate" value={formData.event_toDate} onChange={handleChange} className={inputCls} required />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
                <div>
                  <label className={labelCls}>Address <span className="text-red-500">*</span></label>
                  <input type="text" name="event_address" value={formData.event_address} onChange={handleChange} className={inputCls} placeholder="Event venue address" />
                </div>
                <div>
                  <label className={labelCls}>Country</label>
                  <select 
                    name="event_country" 
                    value={formData.event_country} 
                    onChange={handleCountryChange} 
                    className={selectCls}
                  >
                    <option value="">Select Country</option>
                    {countries?.map((c, i) => <option key={c._id || i} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>State</label>
                  <select 
                    name="event_state" 
                    value={formData.event_state} 
                    onChange={handleStateChange} 
                    className={selectCls}
                    disabled={!formData.event_country}
                  >
                    <option value="">Select State</option>
                    {filteredStates?.map((s, i) => <option key={s._id || i} value={s?.name}>{s?.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  <select 
                    name="event_city" 
                    value={formData.event_city} 
                    onChange={handleChange} 
                    className={selectCls}
                    disabled={!formData.event_state}
                  >
                    <option value="">Select City</option>
                    {filteredCities?.map((c, i) => <option key={c?._id || i} value={c?.name}>{c?.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                <div>
                  <label className={labelCls}>Pincode</label>
                  <input type="text" name="event_pincode" value={formData.event_pincode} onChange={handleChange} maxLength={6} className={inputCls} placeholder="6 digit pincode" />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <div className="flex items-center gap-6 h-8">
                    {["Active", "Inactive"].map((s) => (
                      <label key={s} className="flex items-center gap-2 text-[12px] text-slate-700 font-bold cursor-pointer">
                        <input type="radio" name="status" value={s} checked={formData.status === s} onChange={handleChange} className="accent-[#23471d]" /> {s}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                {editingStatus && (
                  <button type="button" onClick={resetForm} className="px-8 py-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all rounded-[2px]">Cancel Edit</button>
                )}
                <button type="submit" className="px-12 py-2.5 bg-[#23471d] hover:bg-[#1a3516] text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-[2px] shadow-lg" disabled={loading}>
                  {loading ? "Processing..." : editingStatus ? "Update Event" : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Registry Table */}
        <div className="bg-white shadow-md border border-gray-200 rounded-[2px] overflow-hidden">
          <div className="bg-[#23471d] px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
            <h2 className="text-white font-bold text-base uppercase tracking-tight">Events Registry</h2>
            <div className="flex items-center gap-3">
              <input type="text" placeholder="Search events..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="h-8 w-44 pl-3 text-xs border border-white/30 bg-white/10 text-white placeholder:text-white/50 outline-none focus:bg-white/20 rounded-[2px]" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-8 px-2 text-xs border border-white/30 bg-white/10 text-white outline-none rounded-[2px]">
                <option value="All" className="text-black">All Status</option>
                <option value="Active" className="text-black">Active</option>
                <option value="Inactive" className="text-black">Inactive</option>
              </select>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full border-collapse">
              <thead className="bg-black">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center w-16">S.No</th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-left">
                    <button onClick={() => toggleSort("event_fullName")} className="flex items-center gap-1 hover:text-gray-300">Name {sortBy.key === "event_fullName" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center">
                    <button onClick={() => toggleSort("event_fromDate")} className="flex items-center gap-1 mx-auto hover:text-gray-300">From {sortBy.key === "event_fromDate" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center">
                    <button onClick={() => toggleSort("event_toDate")} className="flex items-center gap-1 mx-auto hover:text-gray-300">To {sortBy.key === "event_toDate" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-left">
                    <button onClick={() => toggleSort("added_by")} className="flex items-center gap-1 hover:text-gray-300">Added By {sortBy.key === "added_by" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center w-28">
                    <button onClick={() => toggleSort("event_status")} className="flex items-center gap-1 mx-auto hover:text-gray-300">Status {sortBy.key === "event_status" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={7} className="py-10 text-center text-gray-400 text-sm italic">Loading events...</td></tr>
                ) : filteredAndSorted.length === 0 ? (
                  <tr><td colSpan={7} className="py-10 text-center text-gray-400 text-sm italic">No events found</td></tr>
                ) : currentPageData.map((eventItem, index) => (
                  <tr key={eventItem._id} className="hover:bg-blue-50 transition border-b border-gray-100">
                    <td className="px-6 py-4 text-sm text-gray-900 text-center font-bold">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                    <td 
                      onClick={() => handleEdit(eventItem._id)}
                      className="px-6 py-4 text-sm text-red-600 hover:text-red-800 cursor-pointer hover:underline font-medium uppercase"
                    >
                      {eventItem?.event_fullName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center">
                      {eventItem?.event_fromDate ? new Date(eventItem.event_fromDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center">
                      {eventItem?.event_toDate ? new Date(eventItem.event_toDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 uppercase tracking-tight">{eventItem?.added_by || "System"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        eventItem.event_status === "active" 
                        ? "bg-green-50 text-green-700 border border-green-200" 
                        : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {eventItem.event_status?.charAt(0).toUpperCase() + eventItem.event_status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(eventItem._id)} className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition" title="Edit"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(eventItem._id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-inner">
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Showing <span className="text-gray-900 font-bold">{filteredAndSorted.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}</span> to <span className="text-gray-900 font-bold">{Math.min(currentPage * rowsPerPage, filteredAndSorted.length)}</span> of <span className="text-gray-900 font-bold">{filteredAndSorted.length}</span> entries
            </div>
            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEvent;
