// import React, { useState, useEffect, useMemo } from "react";
// import Swal from "sweetalert2";
// import { FaTrash, FaUser, FaBuilding, FaPencilAlt } from "react-icons/fa";
// import {
//   fetchCompanies,
//   updateCompany,
// } from "../../features/company/companySlice";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { useParams } from "react-router-dom";
// import { fetchStatusOptions } from "../../features/add_by_admin/statusOption/statusOptionSlice";
// import { fetchUsers } from "../../features/auth/userSlice";
// import {
//   fetchEvents,
//   fetchEventById,
// } from "../../features/crmEvent/crmEventSlice";
// import {
//   fetchReviews,
//   deleteReview,
//   createReview,
// } from "../../features/crm-exhibator-reviews/crmExhibatorReviewSlice";
// import { showError, showSuccess } from "../../utils/toastMessage";

// const ClientOverview1 = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { id } = useParams();
//   const [popUp, setPopUp] = useState(false);
//   const [Flip, setFlip] = useState(false);

//   // company redux
//   const { companies, loading, error } = useSelector((state) => state.companies);
//   const [company, setCompany] = useState(null);
//   const companyId = company?._id;
//   const updateBy = sessionStorage.getItem("user_name");
//   console.log("companyId...", companyId);
//   const [reviewData, setReviewData] = useState({
//     cmpny_id: companyId || "",
//     evnt_id: "",
//     status_short: "",
//     reminder_dt: "",
//     forward_to: "",
//     re_msg: "",
//     updated_by: updateBy || "",
//   });

//   // status redux
//   const {
//     statusOptions,
//     loading: statusLoading,
//     error: statusError,
//   } = useSelector((state) => state.statusOptions);

//   // user redux
//   const {
//     users,
//     loading: userLoading,
//     error: userError,
//   } = useSelector((state) => state.users);

//   // event redux
//   const {
//     events,
//     loading: eventLoading,
//     error: eventError,
//   } = useSelector((state) => state.crmEvents);

//   // review redux
//   const {
//     reviews,
//     loading: reviewLoading,
//     error: reviewError,
//   } = useSelector((state) => state.reviews);

//   // Filter reviews for this company only
//   const filteredReviews = useMemo(
//     () => reviews.filter((rev) => rev?.cmpny_id === companyId),
//     [reviews, companyId],
//   );

//   // console.log("events..", events);
//   console.log("ClientOverview1...", companyId);
//   // console.log("reviews///", filteredReviews);
//   useEffect(() => {
//     if (companies.length === 0) {
//       dispatch(fetchCompanies());
//     }
//     dispatch(fetchStatusOptions());
//     dispatch(fetchUsers());
//     dispatch(fetchEvents());
//     dispatch(fetchReviews());
//   }, [dispatch, companies]);

//   useEffect(() => {
//     if (companies.length > 0) {
//       const matched = companies.find((c) => c._id === id);
//       setCompany(matched);
//       if (matched) {
//         setReviewData((prev) => ({
//           ...prev,
//           cmpny_id: matched._id,
//         }));
//       }
//     }
//   }, [companies, id]);

//   const handleEdit = () => {
//     if (!company) return;
//     navigate(`/ihweClientData2026/addNewClients/${company._id}`, {
//       state: { heading: "Edit Client Details" },
//     });
//   };

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>Error: {error}</p>;
//   if (!company) return <p>No company found with ID: {id}</p>;

//   // यह फ़ंक्शन events array में से ID के आधार पर Event Name ढूंढता है।
//   const getEventName = (eventId) => {
//     const event = events.find((e) => e._id === eventId);
//     return event ? event.event_name : eventId; // अगर नाम मिला तो नाम, वरना ID ही दिखा दो।
//   };

//   // ✅ Handle all input changes
//   const handleChange = (e) => {
//     const { id, value } = e.target;

//     // match field names to state keys
//     const keyMap = {
//       ClientStatus: "status_short",
//       EventName: "evnt_id",
//       ReminderDateTime: "reminder_dt",
//       ForwardTo: "forward_to",
//       Remark: "re_msg",
//       cmpny_id: "cmpny_id",
//     };

//     setReviewData((prev) => ({
//       ...prev,
//       [keyMap[id] || id]: value,
//     }));
//   };

//   // ✅ Handle submit
//   const handleAddReview = async (e) => {
//     e.preventDefault();

//     if (!reviewData.cmpny_id) {
//       showError("Company ID is missing. Please select a company.");
//       console.error("Validation failed: Company ID is missing.");
//       return;
//     }

//     if (!reviewData.status_short || !reviewData.evnt_id || !reviewData.re_msg) {
//       showError(
//         "Status, Event Name, and Remark are required. Please fill them in.",
//       );
//       return;
//     }

//     try {
//       await dispatch(createReview(reviewData)).unwrap();

//       // update company status
//       await dispatch(
//         updateCompany({
//           id: companyId,
//           data: { companyStatus: reviewData.status_short },
//         }),
//       ).unwrap();

//       showSuccess("Review added and company status updated successfully!");
//       setPopUp(false);
//       // console.log("New Review:", reviewData);
//       dispatch(fetchReviews()); // refresh list
//       dispatch(fetchCompanies()); // refresh companies to show updated status
//       // console.log("status Update", companyId);
//       // Reset form
//       setReviewData({
//         cmpny_id: companyId || "",
//         evnt_id: "",
//         status_short: "",
//         reminder_dt: "",
//         forward_to: "",
//         re_msg: "",
//         updated_by: updateBy || "",
//       });
//     } catch (err) {
//       showError(
//         "Failed to add review or update company status. Please try again.",
//       );
//       console.error("Add review or update error:", err);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!id) return;

//     try {
//       await dispatch(deleteReview(id)).unwrap(); // redux toolkit async thunk
//       showSuccess("Review deleted successfully!");
//       dispatch(fetchReviews()); // refresh the list
//     } catch (err) {
//       showError("Failed to delete review. Please try again.");
//       console.error("Delete review error:", err);
//     }
//   };
//   const handleSendWhatsapp = () => {
//     Swal.fire({
//       title: "Send WhatsApp Message",
//       text: "This is a demo popup (functionality removed).",
//       icon: "info",
//       confirmButtonText: "OK",
//     });
//   };
//   const handleAccount = () => {
//     if (!company) return;
//     navigate(`/ihweClientData2026/accountSection1/${company._id}`, {});
//   };
//   // const handlePayments = () => {
//   //   navigate("/ihweClientData2026/payments");
//   // };

//   return (
//     <div className="w-full h-auto bg-[#eef1f5]" style={{ marginTop: "30px" }}>
//       {/* Header */}
//       <div className="w-full bg-white  flex flex-col sm:flex-row justify-between items-center px-4 py-1 ">
//         <h2 className="text-xl text-gray-500 mb-2 lg:mb-0 uppercase">
//           CLIENT OVERVIEW
//         </h2>
//         <div className="flex gap-2">
//           {/* <button
//             onClick={handleCancel} className="hover:bg-gray-200 border border-gray-600  text-gray-600 px-1 py-0.5  text-xs font-normal">
//             Back to List
//           </button> */}
//           <button
//             onClick={() => navigate("/ihweClientData2026/addNewClients")}
//             className="hover:bg-gray-200 border border-gray-600  text-gray-600 px-1 py-0.5  text-xs font-normal cursor-pointer"
//           >
//             Add Client
//           </button>
//           <button
//             onClick={() => navigate("/ihweClientData2026/masterData")}
//             className="hover:bg-gray-200 border border-gray-600  text-gray-600 px-1 py-0.5  text-xs font-normal cursor-pointer"
//           >
//             Master List
//           </button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex flex-col m-[22px] gap-4">
//         <div className="bg-white shadow-md px-5 pb-4 pt-2 w-full">
//           <div className="flex justify-between items-center mb-1 ">
//             <h2 className="text-lg font-normal text-gray-600">
//               {company.companyName} | Details
//             </h2>
//             <div className="flex gap-2">
//               <button
//                 onClick={handleSendWhatsapp}
//                 className="bg-white text-gray-600 px-2 py-0.5  text-xs  cursor-pointer border border-gray-400 hover:bg-gray-100 transition-colors"
//               >
//                 Send Whatsapp
//               </button>
//               <button
//                 onClick={handleAccount}
//                 className="bg-white text-gray-600 px-2 py-0.5  text-xs  cursor-pointer border border-gray-300 hover:bg-gray-100 transition-colors"
//               >
//                 Account
//               </button>
//               {/* <button
//                 onClick={handlePayments}
//                 className="bg-white text-black px-2 py-0.5  text-xs  cursor-pointer border border-gray-300 hover:bg-gray-100 transition-colors"
//               >
//                 Payments
//               </button> */}
//               <button
//                 onClick={handleEdit}
//                 className="flex items-center justify-center w-6 h-6  text-gray-600 border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
//                 aria-label="Edit"
//               >
//                 <FaPencilAlt className="w-3 h-3" />
//               </button>
//             </div>
//           </div>
//           <hr className="w-full opacity-10 mb-3" />
//           {/* Client Info */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-sm text-gray-600 px-2 py-3 mb-4">
//             <div className="flex gap-11">
//               <p className="font-semibold text-gray-800">
//                 Company <br /> Details
//               </p>
//               <p>
//                 {company.companyName} | {company.businessNature} |{" "}
//                 {company.category}
//               </p>
//             </div>
//             <div className="flex gap-10">
//               <p className="font-semibold text-gray-800">Data Source</p>
//               <p>{company.dataSource || "-"}</p>
//             </div>
//             <div className="flex gap-16">
//               <p className="font-semibold text-gray-800">Website</p>
//               <p>{company.website || "-"}</p>
//             </div>
//             <div className="flex gap-12.5">
//               <p className="font-semibold text-gray-800">Address</p>
//               <p>{company.address}</p>
//             </div>
//             <div className="flex gap-16.5">
//               <p className="font-semibold text-gray-800">Email Id</p>
//               <p className="text-blue-600">{company.email}</p>
//             </div>
//             <div className="flex gap-9">
//               <p className="font-semibold text-gray-800">Landline No.</p>
//               <p>{company.landline || "-"}</p>
//             </div>
//             <div className="flex gap-13">
//               <p className="font-semibold text-gray-800">
//                 Contact <br /> Person
//               </p>
//               <p>
//                 {company.contacts
//                   ?.map((c) => `${c.firstName} ${c.surname} | ${c.mobile}`)
//                   .join(", ")}
//               </p>
//             </div>
//             <div className="flex gap-11.5">
//               <p className="font-semibold text-gray-800">
//                 Added / <br /> Updated By
//               </p>
//               <p>{company.updated_by || "-"}</p>
//             </div>
//             <div className="flex gap-9">
//               <p className="font-semibold text-gray-800">Client Status</p>
//               <p className="text-green-700">{company?.companyStatus}</p>
//             </div>
//           </div>
//         </div>

//         {/* Pop-Up Form — Show only when no history or when manually toggled */}
//         {(filteredReviews.length === 0 || popUp) && (
//           <form
//             onSubmit={handleAddReview}
//             className="w-full h-auto bg-white  shadow-md px-4 py-4 gap-4"
//           >
//             <div className="flex items-end justify-between gap-4 overflow-x-auto">
//               {/* Hidden Company ID Field */}
//               <input
//                 type="hidden"
//                 id="cmpny_id"
//                 value={companyId}
//                 onChange={handleChange}
//               />

//               {/* Client Status */}
//               <div className="flex flex-col flex-1 ">
//                 <label
//                   htmlFor="ClientStatus"
//                   className="block text-sm font-normal text-gray-900"
//                 >
//                   Client Status
//                 </label>
//                 <select
//                   id="ClientStatus"
//                   value={reviewData.status_short}
//                   onChange={(e) => {
//                     const value = e.target.value;
//                     const hideFor = ["Not Interested"];
//                     setFlip(!hideFor.includes(value));
//                     handleChange(e);
//                   }}
//                   className="  block w-full mt-1 px-2 py-1 border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
//                 >
//                   <option value="">Select Current Status</option>
//                   {statusOptions
//                     .filter((opt) => opt.status === "active")
//                     .map((opt) => (
//                       <option key={opt._id} value={opt.name}>
//                         {opt.name}
//                       </option>
//                     ))}
//                 </select>
//               </div>

//               {/* Reminder & Forward Fields */}
//               {Flip && (
//                 <>
//                   <div className="flex flex-col flex-1">
//                     <label
//                       htmlFor="ReminderDateTime"
//                       className="block text-sm font-normal text-gray-900 "
//                     >
//                       Reminder Date & Time{" "}
//                       <span className="text-red-700">*</span>
//                     </label>
//                     <input
//                       type="datetime-local"
//                       id="ReminderDateTime"
//                       value={reviewData.reminder_dt}
//                       onChange={handleChange}
//                       className="mt-1 block w-full px-2 py-1 border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
//                     />
//                   </div>

//                   <div className="flex flex-col flex-1 ">
//                     <label
//                       htmlFor="ForwardTo"
//                       className="block text-sm font-normal text-gray-900"
//                     >
//                       Forward To <span className="text-red-700">*</span>
//                     </label>

//                     <select
//                       id="ForwardTo"
//                       value={reviewData.forward_to}
//                       onChange={handleChange}
//                       className=" mt-1 block w-full px-2 py-1 font-normal border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
//                     >
//                       <option value="">Select Here</option>
//                       {users.length > 0 ? (
//                         users
//                           .filter((user) => user.user_status === "Active")
//                           .map((user) => (
//                             <option key={user._id} value={user.user_fullname}>
//                               {user.user_fullname}
//                             </option>
//                           ))
//                       ) : (
//                         <option disabled>No Users Found</option>
//                       )}
//                     </select>
//                   </div>
//                 </>
//               )}

//               {/* Previous Status */}
//               <div className="flex flex-col flex-1">
//                 <label
//                   htmlFor="PreviousStatus"
//                   className="block text-sm font-normal text-gray-900"
//                 >
//                   Previous Status
//                 </label>
//                 <input
//                   type="text"
//                   id="PreviousStatus"
//                   value={company?.companyStatus || " "}
//                   readOnly
//                   className="mt-1 block w-full px-2 py-1 bg-gray-100 border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
//                 />
//               </div>

//               {/* Event Name */}
//               <div className="flex flex-col flex-1 min-w-[200px]">
//                 <label
//                   htmlFor="EventName"
//                   className="block text-sm font-normal text-gray-900"
//                 >
//                   Event Name <span className="text-red-700">*</span>
//                 </label>

//                 <select
//                   id="EventName"
//                   value={reviewData.evnt_id}
//                   onChange={handleChange}
//                   className=" mt-1 block w-full px-2 py-1 border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
//                 >
//                   <option value="">Select Event</option>
//                   {events.length > 0 ? (
//                     events
//                       .filter((event) => event.event_status === "active")
//                       .map((event) => (
//                         <option key={event._id} value={event._id}>
//                           {event.event_name}
//                         </option>
//                       ))
//                   ) : (
//                     <option disabled>No Events Found</option>
//                   )}
//                 </select>
//               </div>
//             </div>

//             {/* Remark */}
//             <div className="mt-4">
//               <label
//                 htmlFor="Remark"
//                 className="flex gap-2 text-sm font-normal text-gray-900"
//               >
//                 Any Remark <span className="text-red-600">*</span>
//               </label>
//               <div className="flex flex-col md:flex-row gap-2 mt-1">
//                 <textarea
//                   id="Remark"
//                   value={reviewData.re_msg}
//                   onChange={handleChange}
//                   className="w-full border px-2 py-1.5 text-sm"
//                   placeholder="update status"
//                 ></textarea>
//               </div>
//               <div className="flex justify-end mt-4">
//                 <button
//                   type="submit"
//                   className="w-full md:w-auto px-4 py-2 text-xs bg-[#3598dc] text-white hover:bg-[#246a99] transition"
//                 >
//                   SAVE
//                 </button>
//               </div>
//             </div>
//           </form>
//         )}

//         {/* Communication History */}
//         {filteredReviews.length > 0 && (
//           <div className="bg-white shadow-md  w-full">
//             <h3 className="text-lg font-semibold text-gray-700 py-3 px-4 bg-gray-100 border border-gray-300">
//               <p className="flex items-center gap-2">
//                 <FaBuilding className="text-lg text-gray-600" /> Communication
//                 Status History
//               </p>
//             </h3>
//             <div className="space-y-0.5 p-2 ">
//               {filteredReviews.map((entry, index) => (
//                 <div
//                   key={entry?._id}
//                   className="flex items-start hover:bg-gray-200 gap-2 py-1.5 px-2 bg-white  border border-gray-200 text-sm"
//                 >
//                   <FaUser className="w-4 h-4 text-gray-500 mt-1" />
//                   <div className="flex-grow">
//                     <p className="font-medium text-xs sm:text-sm">
//                       <span className="text-blue-400 uppercase">
//                         {entry?.status_short} for {getEventName(entry?.evnt_id)}
//                       </span>
//                       <span
//                         onClick={() => {
//                           if (index === 0) setPopUp(!popUp);
//                         }}
//                         className={`${
//                           index === 0
//                             ? "text-red-500 cursor-pointer hover:underline"
//                             : "text-gray-700"
//                         } uppercase`}
//                       >
//                         | ▲ call the client on{" "}
//                         {entry?.reminder_dt
//                           ? new Date(entry.reminder_dt).toLocaleString(
//                               "en-IN",
//                               {
//                                 day: "2-digit",
//                                 month: "short",
//                                 year: "numeric",
//                                 hour: "2-digit",
//                                 minute: "2-digit",
//                                 hour12: true,
//                               },
//                             )
//                           : "N/A"}
//                       </span>
//                     </p>
//                     <p className="text-xs text-gray-500 leading-tight">
//                       {entry?.re_msg} | By: {entry?.updated_by} | On:{" "}
//                       {entry?.re_updated
//                         ? new Date(entry.re_updated).toLocaleString("en-IN", {
//                             day: "2-digit",
//                             month: "short",
//                             year: "numeric",
//                             hour: "2-digit",
//                             minute: "2-digit",
//                             hour12: true,
//                           })
//                         : "N/A"}
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => handleDelete(entry?._id)}
//                     className="text-gray-400 hover:text-red-500 transition-colors"
//                   >
//                     <FaTrash className="w-4 h-4" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ClientOverview1;

import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { FaTrash, FaUser, FaBuilding, FaPencilAlt } from "react-icons/fa";
import {
  fetchCompanies,
  updateCompany,
} from "../../features/company/companySlice";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { fetchStatusOptions } from "../../features/add_by_admin/statusOption/statusOptionSlice";
import { fetchUsers } from "../../features/auth/userSlice";
import {
  fetchEvents,
  fetchEventById,
} from "../../features/crmEvent/crmEventSlice";
import {
  fetchReviews,
  deleteReview,
  createReview,
} from "../../features/crm-exhibator-reviews/crmExhibatorReviewSlice";
import { showError, showSuccess } from "../../utils/toastMessage";

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
    () => reviews.filter((rev) => rev?.cmpny_id === companyId),
    [reviews, companyId],
  );

  // console.log("events..", events);
  console.log("ClientOverview1...", companyId);
  // console.log("reviews///", filteredReviews);
  useEffect(() => {
    if (companies.length === 0) {
      dispatch(fetchCompanies());
    }
    dispatch(fetchStatusOptions());
    dispatch(fetchUsers());
    dispatch(fetchEvents());
    dispatch(fetchReviews());
  }, [dispatch, companies]);

  useEffect(() => {
    if (companies.length > 0) {
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
    const event = events.find((e) => e._id === eventId);
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
      showError("Company ID is missing. Please select a company.");
      console.error("Validation failed: Company ID is missing.");
      return;
    }

    if (!reviewData.status_short || !reviewData.evnt_id || !reviewData.re_msg) {
      showError(
        "Status, Event Name, and Remark are required. Please fill them in.",
      );
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

      showSuccess("Review added and company status updated successfully!");
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
      showError(
        "Failed to add review or update company status. Please try again.",
      );
      console.error("Add review or update error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;

    try {
      await dispatch(deleteReview(id)).unwrap(); // redux toolkit async thunk
      showSuccess("Review deleted successfully!");
      dispatch(fetchReviews()); // refresh the list
    } catch (err) {
      showError("Failed to delete review. Please try again.");
      console.error("Delete review error:", err);
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

  return (
    <div className="w-full h-auto bg-[#eef1f5]" style={{ marginTop: "30px" }}>
      {/* Header */}
      <div className="w-full bg-white border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center px-6 py-3">
        <h2 className="text-3xl text-gray-500 mb-2 lg:mb-0 uppercase">
          CLIENT OVERVIEW
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/ihweClientData2026/addNewClients")}
            className="hover:bg-gray-200 border border-gray-300 text-gray-600 px-4 py-2 text-base font-medium cursor-pointer rounded"
          >
            Add Client
          </button>
          <button
            onClick={() => navigate("/ihweClientData2026/masterData")}
            className="hover:bg-gray-200 border border-gray-300 text-gray-600 px-4 py-2 text-base font-medium cursor-pointer rounded"
          >
            Master List
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col m-6 gap-6">
        {/* Company Details Card */}
        <div className="bg-white border border-gray-200 rounded-md px-6 pb-5 pt-3 w-full">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-normal text-gray-600">
              {company.companyName} | Details
            </h2>
            <div className="flex gap-3">
              <button
                onClick={handleSendWhatsapp}
                className="bg-white text-gray-600 px-4 py-2 text-base cursor-pointer border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              >
                Send Whatsapp
              </button>
              <button
                onClick={handleAccount}
                className="bg-white text-gray-600 px-4 py-2 text-base cursor-pointer border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              >
                Account
              </button>
              <button
                onClick={handleEdit}
                className="flex items-center justify-center w-10 h-10 text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Edit"
              >
                <FaPencilAlt className="w-5 h-5" />
              </button>
            </div>
          </div>
          <hr className="w-full border-t border-gray-200 mb-5" />
          {/* Client Info - Table-like grid with borders */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-gray-200 divide-y divide-gray-200 rounded-md">
            <div className="flex px-5 py-4 border-b border-gray-200 md:border-b-0 md:border-r">
              <p className="font-semibold text-gray-800 w-1/3 text-base">
                Company Details
              </p>
              <p className="w-2/3 text-base">
                {company.companyName} | {company.businessNature} |{" "}
                {company.category}
              </p>
            </div>
            <div className="flex px-5 py-4 border-b border-gray-200 md:border-b-0 md:border-r">
              <p className="font-semibold text-gray-800 w-1/3 text-base">
                Data Source
              </p>
              <p className="w-2/3 text-base">{company.dataSource || "-"}</p>
            </div>
            <div className="flex px-5 py-4 border-b border-gray-200 md:border-b-0">
              <p className="font-semibold text-gray-800 w-1/3 text-base">
                Website
              </p>
              <p className="w-2/3 text-base">{company.website || "-"}</p>
            </div>

            <div className="flex px-5 py-4 border-b border-gray-200 md:border-b-0 md:border-r">
              <p className="font-semibold text-gray-800 w-1/3 text-base">
                Address
              </p>
              <p className="w-2/3 text-base">{company.address}</p>
            </div>
            <div className="flex px-5 py-4 border-b border-gray-200 md:border-b-0 md:border-r">
              <p className="font-semibold text-gray-800 w-1/3 text-base">
                Email Id
              </p>
              <p className="w-2/3 text-base text-blue-600">{company.email}</p>
            </div>
            <div className="flex px-5 py-4 border-b border-gray-200 md:border-b-0">
              <p className="font-semibold text-gray-800 w-1/3 text-base">
                Landline No.
              </p>
              <p className="w-2/3 text-base">{company.landline || "-"}</p>
            </div>

            <div className="flex px-5 py-4 border-b border-gray-200 md:border-b-0 md:border-r">
              <p className="font-semibold text-gray-800 w-1/3 text-base">
                Contact Person
              </p>
              <p className="w-2/3 text-base">
                {company.contacts
                  ?.map((c) => `${c.firstName} ${c.surname} | ${c.mobile}`)
                  .join(", ")}
              </p>
            </div>
            <div className="flex px-5 py-4 border-b border-gray-200 md:border-b-0 md:border-r">
              <p className="font-semibold text-gray-800 w-1/3 text-base">
                Added / Updated By
              </p>
              <p className="w-2/3 text-base">{company.updated_by || "-"}</p>
            </div>
            <div className="flex px-5 py-4">
              <p className="font-semibold text-gray-800 w-1/3 text-base">
                Client Status
              </p>
              <p className="w-2/3 text-base text-green-700">
                {company?.companyStatus}
              </p>
            </div>
          </div>
        </div>

        {/* Pop-Up Form — Show only when no history or when manually toggled */}
        {(filteredReviews.length === 0 || popUp) && (
          <form
            onSubmit={handleAddReview}
            className="w-full h-auto bg-white border border-gray-200 rounded-md px-6 py-5 gap-4"
          >
            <div className="flex flex-wrap items-end justify-between gap-4 overflow-x-auto">
              {/* Hidden Company ID Field */}
              <input
                type="hidden"
                id="cmpny_id"
                value={companyId}
                onChange={handleChange}
              />

              {/* Client Status */}
              <div className="flex flex-col flex-1 min-w-[180px]">
                <label
                  htmlFor="ClientStatus"
                  className="block text-base font-normal text-gray-900 mb-1"
                >
                  Client Status
                </label>
                <select
                  id="ClientStatus"
                  value={reviewData.status_short}
                  onChange={(e) => {
                    const value = e.target.value;
                    const hideFor = ["Not Interested"];
                    setFlip(!hideFor.includes(value));
                    handleChange(e);
                  }}
                  className="block w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                >
                  <option value="">Select Current Status</option>
                  {statusOptions
                    .filter((opt) => opt.status === "active")
                    .map((opt) => (
                      <option key={opt._id} value={opt.name}>
                        {opt.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Reminder & Forward Fields */}
              {Flip && (
                <>
                  <div className="flex flex-col flex-1 min-w-[200px]">
                    <label
                      htmlFor="ReminderDateTime"
                      className="block text-base font-normal text-gray-900 mb-1"
                    >
                      Reminder Date & Time{" "}
                      <span className="text-red-700">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="ReminderDateTime"
                      value={reviewData.reminder_dt}
                      onChange={handleChange}
                      className="block w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                    />
                  </div>

                  <div className="flex flex-col flex-1 min-w-[180px]">
                    <label
                      htmlFor="ForwardTo"
                      className="block text-base font-normal text-gray-900 mb-1"
                    >
                      Forward To <span className="text-red-700">*</span>
                    </label>
                    <select
                      id="ForwardTo"
                      value={reviewData.forward_to}
                      onChange={handleChange}
                      className="block w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                    >
                      <option value="">Select Here</option>
                      {users.length > 0 ? (
                        users
                          .filter((user) => user.user_status === "Active")
                          .map((user) => (
                            <option key={user._id} value={user.user_fullname}>
                              {user.user_fullname}
                            </option>
                          ))
                      ) : (
                        <option disabled>No Users Found</option>
                      )}
                    </select>
                  </div>
                </>
              )}

              {/* Previous Status */}
              <div className="flex flex-col flex-1 min-w-[180px]">
                <label
                  htmlFor="PreviousStatus"
                  className="block text-base font-normal text-gray-900 mb-1"
                >
                  Previous Status
                </label>
                <input
                  type="text"
                  id="PreviousStatus"
                  value={company?.companyStatus || " "}
                  readOnly
                  className="block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>

              {/* Event Name */}
              <div className="flex flex-col flex-1 min-w-[200px]">
                <label
                  htmlFor="EventName"
                  className="block text-base font-normal text-gray-900 mb-1"
                >
                  Event Name <span className="text-red-700">*</span>
                </label>
                <select
                  id="EventName"
                  value={reviewData.evnt_id}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                >
                  <option value="">Select Event</option>
                  {events.length > 0 ? (
                    events
                      .filter((event) => event.event_status === "active")
                      .map((event) => (
                        <option key={event._id} value={event._id}>
                          {event.event_name}
                        </option>
                      ))
                  ) : (
                    <option disabled>No Events Found</option>
                  )}
                </select>
              </div>
            </div>

            {/* Remark */}
            <div className="mt-5">
              <label
                htmlFor="Remark"
                className="flex gap-2 text-base font-normal text-gray-900 mb-1"
              >
                Any Remark <span className="text-red-600">*</span>
              </label>
              <textarea
                id="Remark"
                value={reviewData.re_msg}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded px-4 py-2 text-base"
                placeholder="update status"
              ></textarea>
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className="w-full md:w-auto px-6 py-2 text-base bg-[#3598dc] text-white hover:bg-[#246a99] transition rounded"
                >
                  SAVE
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Communication History */}
        {filteredReviews.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-md w-full">
            <h3 className="text-xl font-semibold text-gray-700 py-3 px-4 bg-gray-50 border-b border-gray-200 rounded-t-md">
              <p className="flex items-center gap-2">
                <FaBuilding className="text-xl text-gray-600" /> Communication
                Status History
              </p>
            </h3>
            <div className="space-y-0.5 p-2">
              {filteredReviews.map((entry, index) => (
                <div
                  key={entry?._id}
                  className="flex items-start hover:bg-gray-50 gap-4 py-3 px-4 bg-white border border-gray-200 rounded text-base"
                >
                  <FaUser className="w-6 h-6 text-gray-500 mt-1" />
                  <div className="flex-grow">
                    <p className="font-medium text-base">
                      <span className="text-blue-400 uppercase">
                        {entry?.status_short} for {getEventName(entry?.evnt_id)}
                      </span>
                      <span
                        onClick={() => {
                          if (index === 0) setPopUp(!popUp);
                        }}
                        className={`${
                          index === 0
                            ? "text-red-500 cursor-pointer hover:underline"
                            : "text-gray-700"
                        } uppercase ml-1`}
                      >
                        | ▲ call the client on{" "}
                        {entry?.reminder_dt
                          ? new Date(entry.reminder_dt).toLocaleString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              },
                            )
                          : "N/A"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 leading-tight mt-0.5">
                      {entry?.re_msg} | By: {entry?.updated_by} | On:{" "}
                      {entry?.re_updated
                        ? new Date(entry.re_updated).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "N/A"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(entry?._id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FaTrash className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientOverview1;
