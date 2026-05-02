import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  UserPlus,
  Save,
  RotateCcw,
  ArrowLeft,
  Plus,
  Trash2,
  Globe,
  Calendar,
  UserCheck,
  Briefcase,
  LayoutGrid,
  Navigation,
  Clock,
  UserCircle,
  ChevronRight,
  ArrowRightCircle,
  Upload,
  ArrowRight,
  Shield,
  Pencil,
  Printer,
  History,
  MessageSquare,
  Bell,
  MessageCircle
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import {
  fetchCompanies,
  updateCompany,
} from "../../features/company/companySlice";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchStatusOptions } from "../../features/add_by_admin/statusOption/statusOptionSlice";
import { fetchUsers, fetchAdmins } from "../../features/auth/userSlice";
import {
  fetchReviews,
  deleteReview,
  createReview,
} from "../../features/crm-exhibator-reviews/crmExhibatorReviewSlice";
import api from "../../lib/api";



const ClientOverview1 = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [popUp, setPopUp] = useState(false);
  const [Flip, setFlip] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(true);

  // company redux
  const { companies, loading, error } = useSelector((state) => state.companies);
  const [company, setCompany] = useState(null);
  const companyId = company?._id;

  let updateBy = localStorage.getItem("user_name") || sessionStorage.getItem("user_name") || "";
  try {
    const userObjStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userObjStr) {
      const userObj = JSON.parse(userObjStr);
      if (userObj.name) updateBy = userObj.name;
    }
  } catch (e) {
    console.error("Error parsing user data:", e);
  }
  if (!updateBy) updateBy = "Admin";

  console.log("companyId...", companyId);
  const [reviewData, setReviewData] = useState({
    cmpny_id: companyId || "",
    evnt_id: "",
    event_name: "",
    status_short: "",
    reminder_dt: "",
    forward_to: "",
    re_msg: "",
    updated_by: updateBy || "",
  });

  // status redux
  const {
    statusOptions,
    loading: statusLoading,
    error: statusError,
  } = useSelector((state) => state.statusOptions);

  // user redux
  const {
    users,
    loading: userLoading,
    error: userError,
  } = useSelector((state) => state.users);

  // event local state
  const [events, setEvents] = useState([]);
  const [isEventLoading, setIsEventLoading] = useState(false);

  // review redux
  const {
    reviews,
    loading: reviewLoading,
    error: reviewError,
  } = useSelector((state) => state.reviews);

  // Filter reviews for this company only
  const filteredReviews = useMemo(
    () => (Array.isArray(reviews) ? reviews : []).filter((rev) => rev?.cmpny_id === companyId),
    [reviews, companyId],
  );

  useEffect(() => {
    if (filteredReviews.length > 0) {
      setIsFormVisible(false);
    } else {
      setIsFormVisible(true);
    }
  }, [filteredReviews.length]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsEventLoading(true);
    try {
      const response = await api.get('/api/events');
      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsEventLoading(false);
    }
  };

  // console.log("events..", events);
  console.log("ClientOverview1...", companyId);
  // console.log("reviews///", filteredReviews);
  useEffect(() => {
    if (Array.isArray(companies) && companies.length === 0) {
      dispatch(fetchCompanies());
    }
    dispatch(fetchStatusOptions());
    dispatch(fetchAdmins());
    dispatch(fetchReviews());
  }, [dispatch, companies]);

  useEffect(() => {
    if (Array.isArray(companies) && companies.length > 0) {
      const matched = companies.find((c) => c._id === id);
      setCompany(matched);
      if (matched) {
        setReviewData((prev) => ({
          ...prev,
          cmpny_id: matched._id,
        }));
      }
    }
  }, [companies, id]);

  const handleEdit = () => {
    if (!company) return;
    navigate(`/ihweClientData2026/addNewClients/${company._id}`, {
      state: { heading: "Edit Client Details" },
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!company) return <p>No company found with ID: {id}</p>;

  // यह फ़ंक्शन events array में से ID के आधार पर Event Name ढूंढता है।
  const getEventName = (eventId) => {
    const event = (Array.isArray(events) ? events : []).find((e) => e._id === eventId);
    return event ? (event.event_fullName || event.name) : eventId; // अगर नाम मिला तो नाम, वरना ID ही दिखा दो।
  };

  // ✅ Handle all input changes
  const handleChange = (e) => {
    const { id, value } = e.target;

    // match field names to state keys
    const keyMap = {
      ClientStatus: "status_short",
      EventName: "evnt_id",
      ReminderDateTime: "reminder_dt",
      ForwardTo: "forward_to",
      Remark: "re_msg",
      cmpny_id: "cmpny_id",
    };

    setReviewData((prev) => {
      const updated = { ...prev, [keyMap[id] || id]: value };

      // Automatically set event_name when EventName changes
      if (id === "EventName") {
        const selectedEvent = events.find(ev => ev._id === value);
        const eventName = selectedEvent ? (selectedEvent.event_fullName || selectedEvent.name) : "";
        updated.event_name = eventName;
      }

      return updated;
    });
  };

  // ✅ Handle submit
  const handleAddReview = async (e) => {
    e.preventDefault();

    // Get fresh user data right before submission to ensure it's not lost in state initialization
    let currentUpdateBy = localStorage.getItem("user_name") || sessionStorage.getItem("user_name") || "";
    try {
      const userObjStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (userObjStr) {
        const userObj = JSON.parse(userObjStr);
        if (userObj.name) currentUpdateBy = userObj.name;
      }
    } catch (err) {
      console.error("Error parsing user data:", err);
    }
    if (!currentUpdateBy) currentUpdateBy = "Admin";

    const payloadToSend = {
      ...reviewData,
      updated_by: currentUpdateBy,
    };

    if (!payloadToSend.cmpny_id) {
      Swal.fire({
        title: "Error",
        text: "Company ID is missing. Please select a company.",
        icon: "error",
        confirmButtonColor: "#23471d"
      });
      console.error("Validation failed: Company ID is missing.");
      return;
    }

    if (!payloadToSend.status_short || !payloadToSend.evnt_id || !payloadToSend.re_msg) {
      Swal.fire({
        title: "Incomplete Data",
        text: "Status, Event Name, and Remark are required.",
        icon: "warning",
        confirmButtonColor: "#23471d"
      });
      return;
    }

    try {
      await dispatch(createReview(payloadToSend)).unwrap();

      // update company status
      await dispatch(
        updateCompany({
          id: companyId,
          data: {
            companyStatus: payloadToSend.status_short,
            eventName: payloadToSend.event_name
          },
        }),
      ).unwrap();

      Swal.fire({
        title: "Success",
        text: "Review added and company status updated successfully!",
        icon: "success",
        confirmButtonColor: "#23471d"
      });
      setPopUp(false);
      // console.log("New Review:", reviewData);
      dispatch(fetchReviews()); // refresh list
      dispatch(fetchCompanies()); // refresh companies to show updated status
      // console.log("status Update", companyId);
      // Reset form
      setReviewData({
        cmpny_id: companyId || "",
        evnt_id: "",
        event_name: "",
        status_short: "",
        reminder_dt: "",
        forward_to: "",
        re_msg: "",
        updated_by: currentUpdateBy || "",
      });
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: "Failed to add review or update company status. Please try again.",
        icon: "error",
        confirmButtonColor: "#23471d"
      });
      console.error("Add review or update error:", err);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!reviewId) return;

    const result = await Swal.fire({
      title: "Confirm Deletion",
      text: "Permanent removal of this history record?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#23471d",
      cancelButtonColor: "#dc2626",
      confirmButtonText: "DELETE"
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteReview(reviewId)).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Review record has been deleted.",
          icon: "success",
          confirmButtonColor: "#23471d"
        });
        dispatch(fetchReviews());
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: "Failed to delete review. Please try again.",
          icon: "error",
          confirmButtonColor: "#23471d"
        });
        console.error("Delete review error:", err);
      }
    }
  };

  const handleSendWhatsapp = () => {
    const phone = company?.contacts?.[0]?.mobile;
    if (!phone) {
      Swal.fire({
        title: "Missing Number",
        text: "No mobile number found for this client.",
        icon: "warning",
        confirmButtonColor: "#23471d"
      });
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const personName = `${company?.contacts?.[0]?.firstName || ''} ${company?.contacts?.[0]?.surname || ''}`.trim() || 'Client';
    const companyName = company?.companyName || '';

    const msg = `Hi ${personName} from ${companyName}, `;
    const url = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleCall = () => {
    const phone = company?.contacts?.[0]?.mobile || company?.landline;
    if (!phone) {
      Swal.fire({
        title: "Missing Number",
        text: "No phone number found for this client.",
        icon: "warning",
        confirmButtonColor: "#23471d"
      });
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  const handleChat = () => {
    if (!company) return;
    navigate(`/chat/${company._id}`, {
      state: {
        companyName: company.companyName,
        contactName: company?.contacts?.[0]?.firstName || "Client",
        mobile: company?.contacts?.[0]?.mobile || ""
      }
    });
  };
  const handleAccount = () => {
    if (!company) return;
    navigate(`/ihweClientData2026/accountSection1/${company._id}`, {});
  };
  // const handlePayments = () => {
  //   navigate("/ihweClientData2026/payments");
  // };


  return (
    <div className="bg-[#f0f2f5] min-h-screen mt-8 font-inter">

      {/* 🔹 Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center py-3 px-6 border-b border-gray-300 bg-white gap-4">
        <div className="flex flex-col items-center lg:items-start gap-1">
          <h1 className="text-xl font-semibold text-slate-600 uppercase tracking-tight leading-none text-center lg:text-left">
            NEW LEAD LIST | Sales Management Section
          </h1>
        </div>
        <div className="flex flex-wrap justify-center lg:justify-end gap-2 w-full lg:w-auto">
          <button onClick={() => navigate("/ihweClientData2026/uploadExhibitor")} className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap">
            <Upload size={12} /> Upload Exhibitor
          </button>
          <button onClick={() => navigate("/ihweClientData2026/newLeadList")} className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap">
            <UserCheck size={12} /> New Leads List
          </button>
          <button onClick={() => navigate("/ihweClientData2026/masterData")} className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap">
            <LayoutGrid size={12} /> Master List
          </button>
          <button onClick={() => navigate("/ihweClientData2026/confirmClientList")} className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap">
            <UserCheck size={12} /> Exhibitor List
          </button>
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div className="p-4 space-y-6">

        {/* ── DETAILS CARD ── */}
        <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
          {/* Sub-header */}
          <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white">
            <h2 className="text-[16px] font-semibold text-slate-700">
              {company.companyName} Details
            </h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-[12px] font-medium border border-slate-300 rounded hover:bg-slate-50 text-slate-600">
                Add MSME Details
              </button>
              <button onClick={handleSendWhatsapp} className="relative group p-1.5 border border-slate-300 rounded hover:bg-green-50 transition-colors">
                <FaWhatsapp size={16} className="text-green-500" />
                <span className="absolute top-9 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">WhatsApp</span>
              </button>
              <button onClick={handleCall} className="relative group p-1.5 border border-slate-300 rounded hover:bg-blue-50 transition-colors">
                <Phone size={16} className="text-blue-500" />
                <span className="absolute top-9 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">Call</span>
              </button>
              <button onClick={handleChat} className="relative group p-1.5 border border-slate-300 rounded hover:bg-indigo-50 transition-colors">
                <MessageSquare size={16} className="text-indigo-500" />
                <span className="absolute top-9 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">Chat</span>
              </button>
              <button onClick={handleAccount} className="px-3 py-1 text-[12px] font-medium border border-slate-300 rounded hover:bg-slate-50 text-slate-600">
                Account
              </button>
              <button className="px-3 py-1 text-[12px] font-medium border border-slate-300 rounded hover:bg-slate-50 text-slate-600">
                Payments
              </button>
              <button onClick={handleEdit} className="relative group p-1.5 border border-slate-300 rounded hover:bg-slate-50 transition-colors text-slate-600">
                <Pencil size={16} />
                <span className="absolute top-9 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">Edit</span>
              </button>
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-12 text-[12px]">
            {/* Row 1 */}
            <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50">Company Details</div>
            <div className="col-span-4 p-3 text-slate-800 border-l border-slate-100">
              {company.companyName} | {company.category} | {company.businessNature}
            </div>
            <div className="col-span-1 p-3 font-bold text-slate-700 bg-slate-50/50 border-l border-slate-100">Data Source</div>
            <div className="col-span-2 p-3 text-slate-800 border-l border-slate-100">{company.dataSource}</div>
            <div className="col-span-1 p-3 font-bold text-slate-700 bg-slate-50/50 border-l border-slate-100">Website</div>
            <div className="col-span-2 p-3 text-slate-800 border-l border-slate-100">{company.website}</div>

            {/* Row 2 */}
            <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Address</div>
            <div className="col-span-4 p-3 text-slate-800 border-t border-l border-slate-100">{company.address}</div>
            <div className="col-span-1 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-l border-slate-100">Email Id.</div>
            <div className="col-span-2 p-3 text-slate-800 border-t border-l border-slate-100">{company.email}</div>
            <div className="col-span-1 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-l border-slate-100">Landline No.</div>
            <div className="col-span-2 p-3 text-red-500 font-bold border-t border-l border-slate-100">{company.landline || "Pending"}</div>

            {/* Row 3 - Contact Details Header */}
            <div className="col-span-6 p-2 font-bold text-slate-700 bg-slate-200/50 border-t border-slate-100 uppercase tracking-tight">
              Contact Details
            </div>
            <div className="col-span-1 p-2 font-bold text-slate-700 bg-slate-200/50 border-t border-l border-slate-100">Added By</div>
            <div className="col-span-5 p-2 text-slate-800 bg-slate-200/50 border-t border-l border-slate-100 ">
              {company.createdAt ? new Date(company.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "-"} | {company.updated_by}
            </div>

            {/* Row 4 */}
            <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Contact Person</div>
            <div className="col-span-4 p-3 text-slate-800 border-t border-l border-slate-100">
              {Array.isArray(company.contacts) && company.contacts.length > 0 ? (
                `${company.contacts[0].title || ""} ${company.contacts[0].firstName || ""} ${company.contacts[0].surname || ""} | ${company.contacts[0].designation || ""} | ${company.contacts[0].email || ""} | ${company.contacts[0].mobile || ""}`
              ) : "-"}
            </div>
            <div className="col-span-1 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-l border-slate-100">Updated By</div>
            <div className="col-span-5 p-3 text-slate-800 border-t border-l border-slate-100">
              {company.updatedAt ? new Date(company.updatedAt).toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "-"} | {company.updated_by}
            </div>

            {/* Row 5 */}
            <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Client Status</div>
            <div className="col-span-10 p-3 text-slate-800 border-t border-l border-slate-100 font-semibold">{company.companyStatus}</div>
          </div>
        </div>

        {/* ── STATUS UPDATE FORM ── */}
        {isFormVisible && (
          <div className="bg-white border border-slate-200 rounded shadow-sm p-4 animate-fadeIn">
            <form onSubmit={handleAddReview} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="text-[12px] font-semibold text-slate-600 mb-1 block">Client Status</label>
                  <select
                    id="ClientStatus"
                    value={reviewData.status_short}
                    onChange={(e) => {
                      const value = e.target.value;
                      const hideFor = ["Not Interested"];
                      setFlip(!hideFor.includes(value));
                      handleChange(e);
                    }}
                    className="w-full h-9 text-[12px] border border-slate-300 rounded px-2 outline-none focus:border-blue-400"
                  >
                    <option value="">Select Current Status</option>
                    {Array.isArray(statusOptions) && statusOptions.filter(opt => opt.status === "active").map(opt => (
                      <option key={opt._id} value={opt.name}>{opt.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-slate-600 mb-1 block">Previous Status</label>
                  <input
                    type="text"
                    value={company?.companyStatus || "-"}
                    readOnly
                    className="w-full h-9 text-[12px] border border-slate-300 rounded px-2 bg-slate-50 text-slate-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-slate-600 mb-1 block">Event Name <span className="text-red-500">*</span></label>
                  <select
                    id="EventName"
                    value={reviewData.evnt_id}
                    onChange={handleChange}
                    className="w-full h-9 text-[12px] border border-slate-300 rounded px-2 outline-none focus:border-blue-400"
                  >
                    <option value="">Select Event</option>
                    {Array.isArray(events) && events.filter(e => e.event_status === "active" || e.status === "active").map(e => (
                      <option key={e._id} value={e._id}>{e.event_fullName || e.name}</option>
                    ))}
                  </select>
                </div>

                {Flip && (
                  <>
                    <div>
                      <label className="text-[12px] font-semibold text-slate-600 mb-1 block">Next Reminder <span className="text-red-500">*</span></label>
                      <input
                        type="datetime-local"
                        id="ReminderDateTime"
                        value={reviewData.reminder_dt}
                        onChange={handleChange}
                        className="w-full h-9 text-[12px] border border-slate-300 rounded px-2 outline-none focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-slate-600 mb-1 block">Forward To <span className="text-red-500">*</span></label>
                      <select
                        id="ForwardTo"
                        value={reviewData.forward_to}
                        onChange={handleChange}
                        className="w-full h-9 text-[12px] border border-slate-300 rounded px-2 outline-none focus:border-blue-400"
                      >
                        <option value="">Select User</option>
                        {Array.isArray(users) && users.filter(u => u.status === "Active").map(u => (
                          <option key={u._id} value={u.username}>{u.username}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4 items-end">
                <div className="flex-grow">
                  <label className="text-[12px] font-semibold text-slate-600 mb-1 block">Any Remark <span className="text-red-500">*</span></label>
                  <textarea
                    id="Remark"
                    value={reviewData.re_msg}
                    onChange={handleChange}
                    rows={2}
                    className="w-full text-[12px] border border-slate-300 rounded px-3 py-2 outline-none focus:border-blue-400 resize-none"
                    placeholder="Update Status..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="h-10 px-6 bg-[#3598dc] hover:bg-blue-600 text-white text-[12px] font-bold rounded transition-colors uppercase"
                >
                  SAVE
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── COMMUNICATION HISTORY ── */}
        {filteredReviews.length > 0 && (
          <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
              <MessageSquare size={16} className="text-slate-600" />
              <h3 className="text-[14px] font-bold text-slate-700 uppercase tracking-tight">Communication Status History</h3>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredReviews.map((entry, index) => (
                <div key={entry?._id} className="p-4 flex gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
                    <UserCircle size={28} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-[12px] font-bold text-blue-500 uppercase tracking-tight">
                            {entry?.status_short} FOR {entry?.event_name || getEventName(entry?.evnt_id)}
                          </span>
                          {entry?.reminder_dt && (
                            <span
                              className={`flex items-center gap-1 text-[12px] font-bold text-red-500 uppercase ${index === 0 ? "cursor-pointer hover:underline" : ""}`}
                              onClick={index === 0 ? () => setIsFormVisible(true) : undefined}
                              title={index === 0 ? "Click to add new status update" : undefined}
                            >
                              | <Bell size={12} className="fill-red-500" /> CALL THE CLIENT ON {(() => {
                                const d = new Date(entry.reminder_dt);
                                const day = d.getDate().toString().padStart(2, '0');
                                const month = d.toLocaleString('en-IN', { month: 'short' }).toUpperCase();
                                const year = d.getFullYear().toString().slice(-2);
                                const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
                                return `${day} ${month} ${year} AT ${time}`;
                              })()}
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] font-medium text-slate-600 leading-snug">
                          {entry?.re_msg} By: <span className="text-blue-400 font-semibold">{entry?.updated_by}</span> On {entry?.re_updated ? new Date(entry.re_updated).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }) + " at " + new Date(entry.re_updated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) : "N/A"}

                        </p>
                        {/* <div className="text-[11px] text-slate-400 font-medium"> */}
                        {/* </div> */}
                      </div>
                      <button onClick={() => handleDelete(entry?._id)} className="p-1 text-slate-300 hover:text-red-500 border border-slate-200 rounded transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div className="pt-8 px-3 border-t border-slate-100 flex justify-between items-center bg-white pb-6">
          <p className="text-[10px] text-red-600 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
            <Shield size={14} className="text-red-600" />
            CLIENT SECURE DATA PORTAL
          </p>
          <button onClick={() => navigate(-1)} className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2 hover:text-slate-800 transition-all">
            <ArrowLeft size={14} /> Back to List
          </button>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ClientOverview1;
