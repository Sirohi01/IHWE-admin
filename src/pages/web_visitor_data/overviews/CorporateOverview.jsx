import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FileText,
  Printer,
  ArrowLeft,
  Briefcase,
  History,
  Shield,
  MessageSquare,
  UserCircle,
  Plus,
  ArrowRight,
  UserCheck,
  LayoutGrid,
  FileDown,
  Trash2,
  Clock,
  Navigation,
  Save,
  Pencil
} from "lucide-react";
import Swal from "sweetalert2";
import {
  fetchCorporateVisitors,
  updateCorporateVisitor,
} from "../../../features/visitor/corporateVisitorSlice";
import { fetchEvents } from "../../../features/crmEvent/crmEventSlice";
import {
  createVisitorReview,
  fetchReviewsByVisitorId,
  clearVisitorReviews,
  deleteVisitorReview,
} from "../../../features/visitor/visitorReviewSlice";
import { fetchStatusOptions } from "../../../features/add_by_admin/statusOption/statusOptionSlice";
import { fetchUsers, fetchAdmins } from "../../../features/auth/userSlice";

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

const CorporateOverview = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { corporateVisitors, loading } = useSelector(
    (state) => state.corporateVisitors,
  );

  const { events } = useSelector((state) => state.crmEvents);

  const { visitorReviews, loading: reviewLoading } = useSelector(
    (state) => state.visitorReview,
  );

  const { statusOptions } = useSelector((state) => state.statusOptions);
  const { users } = useSelector((state) => state.users);

  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [reminderDt, setReminderDt] = useState("");
  const [forwardTo, setForwardTo] = useState("");
  const [popUp, setPopUp] = useState(false);
  const [Flip, setFlip] = useState(false);

  useEffect(() => {
    if (corporateVisitors.length === 0) {
      dispatch(fetchCorporateVisitors());
    }
    dispatch(fetchEvents());
    dispatch(fetchStatusOptions());
    dispatch(fetchAdmins());
    dispatch(fetchReviewsByVisitorId(id));
    return () => {
      dispatch(clearVisitorReviews());
    };
  }, [dispatch, id, corporateVisitors.length]);

  const visitor = corporateVisitors.find((v) => v._id === id);

  const formatDate = (iso) => {
    if (!iso) return "N/A";
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handlePost = async () => {
    if (!status) {
      Swal.fire({ title: "Status Required", text: "Please select a status.", icon: "warning", confirmButtonColor: "#23471d" });
      return;
    }
    if (!selectedEvent) {
      Swal.fire({ title: "Event Required", text: "Please select an event.", icon: "warning", confirmButtonColor: "#23471d" });
      return;
    }
    if (!description.trim()) {
      Swal.fire({ title: "Notes Required", text: "Please enter a description.", icon: "warning", confirmButtonColor: "#23471d" });
      return;
    }

    const userStr = sessionStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};
    const userName = user.name || sessionStorage.getItem("user_name") || "User";

    try {
      const reviewResult = await dispatch(
        createVisitorReview({
          visitor_id: id,
          visitor_status: status,
          visitor_event: selectedEvent,
          visitor_desc: description.trim(),
          visitor_reminder_dt: reminderDt,
          visitor_forward_to: forwardTo,
          added_by: userName,
        }),
      ).unwrap();

      await dispatch(
        updateCorporateVisitor({
          id,
          data: { status, updated_by: userName },
        }),
      ).unwrap();

      Swal.fire({
        title: "Success",
        text: "Status updated and review posted successfully.",
        icon: "success",
        confirmButtonColor: "#23471d"
      });

      dispatch(fetchReviewsByVisitorId(id));
      setStatus("");
      setDescription("");
      setSelectedEvent("");
      setReminderDt("");
      setForwardTo("");
      setPopUp(false);
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err?.message || "Failed to update status. Please try again.",
        icon: "error",
        confirmButtonColor: "#23471d"
      });
    }
  };

  const handleDelete = async (reviewId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#23471d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: "#fff",
      color: "#1e293b",
      borderRadius: "2px"
    });

    if (result.isConfirmed) {
      await dispatch(deleteVisitorReview(reviewId));
      Swal.fire({
        title: "Deleted!",
        text: "Review has been removed.",
        icon: "success",
        confirmButtonColor: "#23471d",
        borderRadius: "2px"
      });
      dispatch(fetchReviewsByVisitorId(id));
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading visitor details...</p>
      </div>
    );
  }

  if (!visitor) {
    return (
      <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Visitor not found.</p>
      </div>
    );
  }

  const fullName =
    `${visitor.firstName || ""} ${visitor.lastName || ""}`.trim();

  const hasReviews = visitorReviews.length > 0;

  return (
    <div className="bg-white shadow-md mt-6 p-4 md:p-6 min-h-screen font-inter animate-fadeIn">
      
      {/* ── HEADER AREA Sync with AddNewClients ── */}
      <div className="flex flex-col lg:flex-row justify-between items-center pb-4 border-b border-gray-100 gap-4">
        <div className="flex flex-col items-center lg:items-start gap-1">
          <h1 className="text-xl font-bold text-slate-500 uppercase tracking-tight leading-none text-center lg:text-left">
            CORPORATE VISITOR DATA
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 text-center lg:text-left">
            Visitor Registration Portal
          </p>
        </div>
        <div className="flex flex-wrap justify-center lg:justify-end gap-2 w-full lg:w-auto">
          <button onClick={() => navigate("/ihweClientData2026/CorporateVisitorsList")} className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap">
            <LayoutGrid size={12} /> List View
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap">
            <Printer size={12} /> Print
          </button>
          <button onClick={() => navigate(-1)} className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-slate-800 hover:bg-slate-900 text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap">
            <ArrowLeft size={12} /> Back
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        
        {/* ── SUB-HEADER ── */}
        <div className="bg-slate-50/50 border border-slate-200 px-4 md:px-6 py-4 rounded-[2px] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-[15px] font-bold text-slate-800 uppercase tracking-tight">
              {fullName}
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-0.5 font-bold">
              Corporate Registration • International Health & Wellness Expo 2026
            </p>
          </div>
          {visitor.registrationId && (
            <div className="bg-[#23471d] text-white px-4 py-2 rounded-[2px] text-[11px] font-bold uppercase tracking-widest shadow-sm">
              REG ID: {visitor.registrationId}
            </div>
          )}
        </div>

        {/* ── DETAILS AREA ── */}
        <div className="space-y-2">
          
          <Section title="Visitor Information">
            <TR3 
              l1="Registration Id" v1={visitor.registrationId} 
              l2="Visitor Name" v2={fullName} 
              l3="Contact No." v3={visitor.mobile} 
            />
            <TR3 
              l1="Email Id" v1={visitor.email} 
              l2="Current Status" v2={<span className="text-green-700 font-bold uppercase tracking-tight">{visitor.status}</span>} 
              l3="Registration For" v3={visitor.registrationFor} 
            />
          </Section>

          <Section title="Company & Professional Bio">
            <TR3 
              l1="Company Name" v1={visitor.companyName} 
              l2="Designation" v2={visitor.designation} 
              l3="Industry/Sector" v3={visitor.industrySector} 
            />
            <TR2 
              l1="Company Website" v1={<a href={visitor.companyWebsite} target="_blank" rel="noreferrer" className="text-blue-600 underline">{visitor.companyWebsite}</a>}
              l2="Company Size" v2={visitor.companySize}
            />
            <TR3 
              l1="WhatsApp Updates" v1={visitor.whatsappUpdates} 
              l2="B2B Meeting" v2={visitor.b2bMeeting} 
              l3="Subscribe" v3={visitor.subscribe ? "✅ Yes" : "❌ No"}
            />
          </Section>

          <Section title="Requirements & Interests">
            <TR1 label="Address" value={[visitor.city, visitor.state, visitor.country].filter(Boolean).join(", ")} />
            <TR1 label="Purpose of Visit" value={Array.isArray(visitor.purposeOfVisit) ? visitor.purposeOfVisit.join(", ") : "—"} />
            <TR1 label="Area of Interest" value={Array.isArray(visitor.areaOfInterest) ? visitor.areaOfInterest.join(", ") : "—"} />
            <TR1 label="Specific Req." value={visitor.specificRequirement} />
          </Section>

          <Section title="Metadata">
            <TR3 
              l1="Created By" v1={`${visitor.created_by || "—"} | ${formatDate(visitor.createdAt)}`}
              l2="Updated By" v2={`${visitor.updated_by || "—"} | ${formatDate(visitor.updatedAt)}`}
              l3="Record ID" v3={<span className="text-[10px] font-mono break-all">{visitor._id}</span>}
            />
          </Section>

        </div>

        {/* ── CRM FORM (Pop-Up) ── */}
        {(visitorReviews.length === 0 || popUp) && (
          <div className="bg-white border-2 border-[#23471d]/20 p-6 rounded-[2px] shadow-lg animate-fadeIn text-left">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-2">
              <History size={18} className="text-[#23471d]" />
              <h3 className="text-[16px] font-bold text-[#23471d] uppercase tracking-tight">Post Status Update</h3>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="text-[11px] font-bold text-slate-800 mb-1 block capitalize font-inter text-left">Select Status *</label>
                  <select
                    value={status}
                    onChange={(e) => {
                      const value = e.target.value;
                      const hideFor = ["Interested", "Hot Lead", "Cold Lead", "Hold", "Data Send"]; // Example logic
                      setFlip(value !== ""); 
                      setStatus(value);
                    }}
                    className="rounded-[2px] border border-slate-400 h-8 focus:border-[#23471d] focus:ring-[#23471d]/10 transition-all text-[12px] bg-white text-slate-900 font-medium outline-none px-3 w-full"
                  >
                    <option value="">-- Select Status --</option>
                    {Array.isArray(statusOptions) && statusOptions.filter(opt => opt.status === "active").map(opt => (
                      <option key={opt._id} value={opt.name}>{opt.name}</option>
                    ))}
                  </select>
                </div>

                {Flip && (
                  <>
                    <div>
                      <label className="text-[11px] font-bold text-slate-800 mb-1 block capitalize font-inter text-left">Next Reminder</label>
                      <input
                        type="datetime-local"
                        value={reminderDt}
                        onChange={(e) => setReminderDt(e.target.value)}
                        className="rounded-[2px] border border-slate-400 h-8 focus:border-[#23471d] focus:ring-[#23471d]/10 transition-all text-[12px] bg-white text-slate-900 font-medium outline-none px-3 w-full"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-800 mb-1 block capitalize font-inter text-left">Forward To</label>
                      <select
                        value={forwardTo}
                        onChange={(e) => setForwardTo(e.target.value)}
                        className="rounded-[2px] border border-slate-400 h-8 focus:border-[#23471d] focus:ring-[#23471d]/10 transition-all text-[12px] bg-white text-slate-900 font-medium outline-none px-3 w-full"
                      >
                        <option value="">Select User</option>
                        {Array.isArray(users) && users.filter(u => u.status === "Active").map(u => (
                          <option key={u._id} value={u.username}>{u.username}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-800 mb-1 block capitalize font-inter text-left">Link to Event *</label>
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="rounded-[2px] border border-slate-400 h-8 focus:border-[#23471d] focus:ring-[#23471d]/10 transition-all text-[12px] bg-white text-slate-900 font-medium outline-none px-3 w-full"
                  >
                    <option value="">-- Select Event --</option>
                    {events.map((ev, i) => <option key={i} value={ev._id}>{ev.event_name}</option>)}
                  </select>
                </div>

                {!Flip && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-800 mb-1 block capitalize font-inter text-left">Previous Status</label>
                    <input type="text" value={visitor.status || "-"} readOnly className="rounded-[2px] border border-slate-400 h-8 focus:border-[#23471d] focus:ring-[#23471d]/10 transition-all text-[12px] bg-slate-50 text-slate-900 font-medium outline-none px-3 w-full" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-800 mb-1 block capitalize font-inter text-left">Description / Notes *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="rounded-[2px] border border-slate-400 focus:border-[#23471d] focus:ring-[#23471d]/10 transition-all text-[12px] bg-white px-3 py-2 w-full outline-none"
                  placeholder="Type updates here..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 font-inter">
                <button type="button" onClick={() => setPopUp(false)} className="px-6 py-2 border border-slate-300 text-slate-600 text-[11px] font-bold uppercase tracking-widest rounded-[2px] hover:bg-slate-50">
                  Cancel
                </button>
                <button 
                  onClick={handlePost} 
                  disabled={reviewLoading}
                  className="px-10 py-2 bg-[#23471d] text-white text-[11px] font-bold uppercase tracking-widest rounded-[2px] shadow hover:bg-[#1a3516] flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={14} /> Update Record
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── COMMUNICATION HISTORY ── */}
        {visitorReviews.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-[2px] shadow-sm animate-fadeIn text-left">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History size={18} className="text-[#23471d]" />
                <h3 className="text-[15px] font-bold text-slate-800 uppercase tracking-tight">Communication History</h3>
              </div>
              {!popUp && (
                <button onClick={() => setPopUp(true)} className="text-[11px] font-bold text-blue-600 uppercase border-b border-blue-600/30 hover:border-blue-600 transition-all font-inter">
                  + Add New Remark
                </button>
              )}
            </div>
            
            <div className="divide-y divide-slate-100">
              {visitorReviews.map((rev) => {
                const evName = events.find((e) => e._id === rev.visitor_event)?.event_name || rev.visitor_event;
                return (
                  <div key={rev?._id} className="p-5 flex items-start gap-4 hover:bg-slate-50/30 transition-all">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
                      <UserCircle size={24} />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[13px] font-bold text-blue-700 uppercase tracking-tight font-inter">
                            {rev?.visitor_status} <span className="text-slate-400 text-[11px] mx-1">/</span> {evName}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <Clock size={12} /> {rev?.added ? new Date(rev.added).toLocaleString() : "N/A"}
                            </span>
                            <span className="text-[10px] font-bold text-[#23471d] uppercase tracking-widest flex items-center gap-1">
                              <Shield size={12} /> By {rev?.added_by}
                            </span>
                          </div>
                        </div>
                        <button onClick={() => handleDelete(rev?._id)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-[12px] font-medium text-slate-600 mt-2 bg-slate-50/80 p-3 rounded-[2px] border border-slate-100 italic font-inter shadow-inner">
                        "{rev.visitor_desc}"
                      </p>
                      {(rev.visitor_reminder_dt || rev.visitor_forward_to) && (
                        <div className="mt-2 flex gap-4">
                           {rev.visitor_reminder_dt && (
                             <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-[2px] font-bold border border-blue-100">Reminder: {new Date(rev.visitor_reminder_dt).toLocaleString()}</span>
                           )}
                           {rev.visitor_forward_to && (
                             <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-[2px] font-bold border border-green-100">Forward To: {rev.visitor_forward_to}</span>
                           )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ── FOOTER AREA ── */}
      <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest hover:text-[#23471d] transition-colors">
          <ArrowLeft size={14} /> Back to Visitor List
        </button>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight">
          <Shield size={14} className="text-green-600" /> Secure Administrative Portal
        </div>
      </div>

    </div>
  );
};

export default CorporateOverview;
