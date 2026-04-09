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
  MessageSquare
} from "lucide-react";
import {
  fetchCompanies,
  updateCompany,
} from "../../features/company/companySlice";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchStatusOptions } from "../../features/add_by_admin/statusOption/statusOptionSlice";
import { fetchUsers } from "../../features/auth/userSlice";
import {
  fetchEvents,
} from "../../features/crmEvent/crmEventSlice";
import {
  fetchReviews,
  deleteReview,
  createReview,
} from "../../features/crm-exhibator-reviews/crmExhibatorReviewSlice";


/* ─── Shared cell styles ───────────────────────────────────────────────────── */
const LC_CLS = "bg-[#fafafa] p-3 text-[11px] font-bold text-slate-600 uppercase tracking-tighter md:border-r border-slate-200 flex items-center min-w-[120px] order-none";
const VC_CLS = "bg-white p-3 text-[12px] font-semibold text-slate-900 md:border-r border-slate-200 flex items-center break-all order-none";

/* ─── Layout Rows — Responsive ─────────────────────────────────────────────── */
function TR3({ l1, v1, l2, v2, l3, v3 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 border-b border-slate-200 last:border-b-0">
      <div className={LC_CLS}>{l1}</div>
      <div className={VC_CLS}>{v1 || "—"}</div>
      <div className={`${LC_CLS} border-t md:border-t-0`}>{l2}</div>
      <div className={`${VC_CLS} border-t md:border-t-0`}>{v2 || "—"}</div>
      <div className={`${LC_CLS} border-t md:border-t-0`}>{l3}</div>
      <div className={`${VC_CLS} border-t md:border-t-0 border-r-0`}>{v3 || "—"}</div>
    </div>
  );
}

function TR2({ l1, v1, l2, v2 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 border-b border-slate-200 last:border-b-0">
      <div className={LC_CLS}>{l1}</div>
      <div className={`${VC_CLS} col-span-1 md:col-span-2`}>{v1 || "—"}</div>
      <div className={`${LC_CLS} border-t md:border-t-0`}>{l2}</div>
      <div className={`${VC_CLS} col-span-1 md:col-span-2 border-r-0 border-t md:border-t-0`}>{v2 || "—"}</div>
    </div>
  );
}

function TR1({ label, value }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 border-b border-slate-200 last:border-b-0">
      <div className={LC_CLS}>{label}</div>
      <div className={`${VC_CLS} col-span-1 md:col-span-5 border-r-0`}>{value || "—"}</div>
    </div>
  );
}

/* ─── Section card ─────────────────────────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
        <div className="w-1.5 h-4 bg-[#23471d] rounded-full" />
        <span className="font-extrabold text-[13px] text-[#23471d] uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="border border-slate-300 rounded-[2px] shadow-sm bg-white overflow-hidden">
        {children}
      </div>
    </div>
  );
}

const ClientOverview1 = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [popUp, setPopUp] = useState(false);
  const [Flip, setFlip] = useState(false);

  // company redux
  const { companies, loading, error } = useSelector((state) => state.companies);
  const [company, setCompany] = useState(null);
  const companyId = company?._id;
  const updateBy = sessionStorage.getItem("user_name");
  console.log("companyId...", companyId);
  const [reviewData, setReviewData] = useState({
    cmpny_id: companyId || "",
    evnt_id: "",
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

  // event redux
  const {
    events,
    loading: eventLoading,
    error: eventError,
  } = useSelector((state) => state.crmEvents);

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

  // console.log("events..", events);
  console.log("ClientOverview1...", companyId);
  // console.log("reviews///", filteredReviews);
  useEffect(() => {
    if (Array.isArray(companies) && companies.length === 0) {
      dispatch(fetchCompanies());
    }
    dispatch(fetchStatusOptions());
    dispatch(fetchUsers());
    dispatch(fetchEvents());
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
    return event ? event.event_name : eventId; // अगर नाम मिला तो नाम, वरना ID ही दिखा दो।
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

    setReviewData((prev) => ({
      ...prev,
      [keyMap[id] || id]: value,
    }));
  };

  // ✅ Handle submit
  const handleAddReview = async (e) => {
    e.preventDefault();

    if (!reviewData.cmpny_id) {
      Swal.fire({
        title: "Error",
        text: "Company ID is missing. Please select a company.",
        icon: "error",
        confirmButtonColor: "#23471d"
      });
      console.error("Validation failed: Company ID is missing.");
      return;
    }

    if (!reviewData.status_short || !reviewData.evnt_id || !reviewData.re_msg) {
      Swal.fire({
        title: "Incomplete Data",
        text: "Status, Event Name, and Remark are required.",
        icon: "warning",
        confirmButtonColor: "#23471d"
      });
      return;
    }

    try {
      await dispatch(createReview(reviewData)).unwrap();

      // update company status
      await dispatch(
        updateCompany({
          id: companyId,
          data: { companyStatus: reviewData.status_short },
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
        status_short: "",
        reminder_dt: "",
        forward_to: "",
        re_msg: "",
        updated_by: updateBy || "",
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
    Swal.fire({
      title: "Send WhatsApp Message",
      text: "This is a demo popup (functionality removed).",
      icon: "info",
      confirmButtonText: "OK",
    });
  };
  const handleAccount = () => {
    if (!company) return;
    navigate(`/ihweClientData2026/accountSection1/${company._id}`, {});
  };
  // const handlePayments = () => {
  //   navigate("/ihweClientData2026/payments");
  // };

  const labelClasses = "text-[11px] font-bold text-slate-800 mb-1 block capitalize font-inter";
  const inputClasses = "rounded-[2px] border border-slate-400 h-8 focus:border-[#23471d] focus:ring-[#23471d]/10 transition-all text-[12px] bg-white placeholder:text-slate-400 text-slate-900 font-medium shadow-none outline-none px-3 w-full text-left";

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-inter animate-fadeIn">
      
      {/* ── HEADER AREA Sync with AddNewClients ── */}
      <div className="flex flex-col lg:flex-row justify-between items-center pb-4 border-b border-gray-100 gap-4">
        <div className="flex flex-col items-center lg:items-start gap-1">
          <h1 className="text-xl font-bold text-slate-500 uppercase tracking-tight leading-none text-center lg:text-left">
            COMPANY DETAILS
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 text-center lg:text-left">
            Client Registration Portal
          </p>
        </div>
        <div className="flex flex-wrap justify-center lg:justify-end gap-2 w-full lg:w-auto">
          <button onClick={() => navigate("/ihweClientData2026/uploadExhibitor")} className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap">
            <Upload size={12} /> Upload
          </button>
          <button onClick={() => navigate("/ihweClientData2026/masterData")} className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap">
            <LayoutGrid size={12} /> Master
          </button>
          <button onClick={() => navigate("/ihweClientData2026/confirmClientList")} className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap">
            <UserCheck size={12} /> List
          </button>
          <button onClick={() => navigate("/ihweClientData2026/addNewClients")} className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#23471d] hover:bg-[#1a3516] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap">
            <Plus size={12} /> Add New
          </button>
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div className="mt-8 space-y-8">
        
        {/* ── SUB-HEADER ── */}
        <div className="bg-slate-50/50 border border-slate-200 px-4 md:px-6 py-4 rounded-[2px] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-[15px] font-bold text-slate-800 uppercase tracking-tight">
              CLIENT OVERVIEW
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-0.5 font-bold">
              International Health & Wellness Expo 2026
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 w-full md:w-auto">
            <button
              onClick={handleSendWhatsapp}
              className="flex-1 md:flex-none px-3 py-1.5 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-widest border border-green-200 rounded-[2px] hover:bg-green-100 transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare size={14} /> WhatsApp
            </button>
            <button
              onClick={handleAccount}
              className="flex-1 md:flex-none px-3 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-widest border border-blue-200 rounded-[2px] hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
            >
              <Shield size={14} /> Account
            </button>
            <button
              onClick={handleEdit}
              className="flex-1 md:flex-none px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest border border-slate-800 rounded-[2px] hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
            >
              <Pencil size={14} /> Edit
            </button>
          </div>
        </div>

        {/* ── DETAILS AREA ── */}
        <div className="space-y-2">
          
          <Section title="Company Information">
            <TR3 
              l1="Company Name" v1={company.companyName} 
              l2="Category" v2={company.category} 
              l3="Nature of Business" v3={company.businessNature} 
            />
            <TR3 
              l1="Company Website" v1={company.website} 
              l2="Official Email" v2={company.email} 
              l3="Landline No." v3={company.landline} 
            />
            <TR3 
              l1="Data Source" v1={company.dataSource} 
              l2="Client Status" v2={<span className="text-green-700 font-bold uppercase tracking-tight">{company?.companyStatus}</span>} 
              l3="Added By" v3={company.updated_by} 
            />
          </Section>

          <Section title="Location & Address">
            <TR1 label="Full Address" value={company.address} />
            <TR3 
              l1="Country" v1={company.country} 
              l2="State" v2={company.state} 
              l3="City / Town" v3={company.city} 
            />
            <TR3 
              l1="Pin Code" v1={company.pincode} 
              l2="Last Updated" v2={company.updatedAt ? new Date(company.updatedAt).toLocaleDateString('en-IN') : "-"}
              l3="Company ID" v3={<span className="text-[10px] font-mono break-all">{company._id}</span>}
            />
          </Section>

          <Section title="Registration Contacts">
            {Array.isArray(company.contacts) && company.contacts.length > 0 ? (
              company.contacts.map((contact, idx) => (
                <div key={idx} className="border-b border-slate-200 last:border-b-0">
                  <div className="bg-slate-50 p-2 text-[11px] font-extrabold text-[#23471d] uppercase tracking-widest border-b border-slate-200">
                    Contact Person #{idx + 1}
                  </div>
                  <TR3 
                    l1="Full Name" v1={`${contact.title || ""} ${contact.firstName || ""} ${contact.surname || ""}`}
                    l2="Designation" v2={contact.designation}
                    l3="Email Address" v3={<span className="text-blue-600 underline break-all">{contact.email}</span>}
                  />
                  <TR2 
                    l1="Mobile Number" v1={contact.mobile}
                    l2="WhatsApp Number" v2={contact.alternate}
                  />
                </div>
              ))
            ) : (
              <TR1 label="Contacts" value="No contact persons found" />
            )}
          </Section>

        </div>

        {/* ── CRM FORM (Pop-Up) ── */}
        {(filteredReviews.length === 0 || popUp) && (
          <div className="bg-white border-2 border-[#23471d]/20 p-6 rounded-[2px] shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-2">
              <History size={18} className="text-[#23471d]" />
              <h3 className="text-[16px] font-bold text-[#23471d] uppercase tracking-tight">Post New Follow-up / Remark</h3>
            </div>
            
            <form onSubmit={handleAddReview} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className={labelClasses}>Current Status *</label>
                  <select
                    id="ClientStatus"
                    value={reviewData.status_short}
                    onChange={(e) => {
                      const value = e.target.value;
                      const hideFor = ["Not Interested"];
                      setFlip(!hideFor.includes(value));
                      handleChange(e);
                    }}
                    className={inputClasses}
                  >
                    <option value="">Select Status</option>
                    {Array.isArray(statusOptions) && statusOptions.filter(opt => opt.status === "active").map(opt => (
                      <option key={opt._id} value={opt.name}>{opt.name}</option>
                    ))}
                  </select>
                </div>

                {Flip && (
                  <>
                    <div>
                      <label className={labelClasses}>Next Reminder *</label>
                      <input
                        type="datetime-local"
                        id="ReminderDateTime"
                        value={reviewData.reminder_dt}
                        onChange={handleChange}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Forward To *</label>
                      <select id="ForwardTo" value={reviewData.forward_to} onChange={handleChange} className={inputClasses}>
                        <option value="">Select User</option>
                        {Array.isArray(users) && users.filter(u => u.user_status === "Active").map(u => (
                          <option key={u._id} value={u.user_fullname}>{u.user_fullname}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className={labelClasses}>Event Attribution *</label>
                  <select id="EventName" value={reviewData.evnt_id} onChange={handleChange} className={inputClasses}>
                    <option value="">Select Event</option>
                    {Array.isArray(events) && events.filter(e => e.event_status === "active").map(e => (
                      <option key={e._id} value={e._id}>{e.event_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClasses}>Previous Status</label>
                  <input type="text" value={company?.companyStatus || "-"} readOnly className={`${inputClasses} bg-slate-50`} />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Communication Note / Remark *</label>
                <textarea
                  id="Remark"
                  value={reviewData.re_msg}
                  onChange={handleChange}
                  rows={3}
                  className="rounded-[2px] border border-slate-400 focus:border-[#23471d] focus:ring-[#23471d]/10 transition-all text-[12px] bg-white px-3 py-2 w-full outline-none"
                  placeholder="Enter detailed conversation notes..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setPopUp(false)} className="px-6 py-2 border border-slate-300 text-slate-600 text-[11px] font-bold uppercase tracking-widest rounded-[2px] hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="px-10 py-2 bg-[#23471d] text-white text-[11px] font-bold uppercase tracking-widest rounded-[2px] shadow hover:bg-[#1a3516] flex items-center gap-2">
                  <Save size={14} /> Save Follow-up
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── COMMUNICATION HISTORY ── */}
        {filteredReviews.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-[2px] shadow-sm animate-fadeIn">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History size={18} className="text-[#23471d]" />
                <h3 className="text-[15px] font-bold text-slate-800 uppercase tracking-tight">Communication Status History</h3>
              </div>
              {!popUp && (
                <button onClick={() => setPopUp(true)} className="text-[11px] font-bold text-blue-600 uppercase border-b border-blue-600/30 hover:border-blue-600 transition-all">
                  + Add New Remark
                </button>
              )}
            </div>
            
            <div className="divide-y divide-slate-100">
              {filteredReviews.map((entry, index) => (
                <div key={entry?._id} className="p-5 flex items-start gap-4 hover:bg-slate-50/30 transition-all">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
                    <UserCircle size={24} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[13px] font-bold text-blue-700 uppercase tracking-tight">
                          {entry?.status_short} <span className="text-slate-400 text-[11px] mx-1">/</span> {getEventName(entry?.evnt_id)}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Clock size={12} /> {entry?.re_updated ? new Date(entry.re_updated).toLocaleString() : "N/A"}
                          </span>
                          <span className="text-[10px] font-bold text-[#23471d] uppercase tracking-widest flex items-center gap-1">
                            <Shield size={12} /> By {entry?.updated_by}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(entry?._id)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="mt-3 bg-slate-50/60 p-3 rounded-[2px] border border-slate-100">
                      <p className="text-[12px] text-slate-700 leading-relaxed italic font-medium">"{entry?.re_msg}"</p>
                    </div>
                    
                    {entry?.reminder_dt && (
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-[2px] border border-red-100">
                        <Calendar size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">
                          Next Action: {new Date(entry.reminder_dt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div className="pt-8 border-t border-slate-100 flex justify-between items-center bg-white pb-6">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
            <Shield size={14} className="text-[#23471d]" />
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
