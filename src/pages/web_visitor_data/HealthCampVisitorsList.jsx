// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Link } from "react-router-dom";
// import { fetchHealthCampVisitors } from "../../features/visitor/freeHealthCampSlice";
// import ClientOverview from "../../Components/ClientOverview";
// import VisitorGloballytable from "./VisitorGloballytable";

// const HealthCampVisitorsList = () => {
//   const dispatch = useDispatch();
//   const [selectedClient, setSelectedClient] = useState(null);
//   const [open, setOpen] = useState(""); // ✅ missing state for radio selection

//   // ✅ Safe extraction – ensure array and loading state
//   const healthCampVisitorsState = useSelector(
//     (state) => state.healthCampVisitors,
//   );
//   const healthCampVisitors = Array.isArray(healthCampVisitorsState)
//     ? healthCampVisitorsState
//     : [];
//   const loading = healthCampVisitorsState?.loading ?? false;

//   const handle = (value) => setOpen(value); // ✅ handler for radio buttons

//   useEffect(() => {
//     dispatch(fetchHealthCampVisitors());
//   }, [dispatch]);

//   const formatDateTime = (isoString) => {
//     if (!isoString) return "N/A";
//     const date = new Date(isoString);
//     const day = date.getDate().toString().padStart(2, "0");
//     const month = date.toLocaleString("en-GB", { month: "short" });
//     const year = date.getFullYear().toString().slice(-2);
//     const time = date.toLocaleTimeString("en-GB", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: false,
//     });
//     return `${day} ${month} ${year} | ${time}`;
//   };

//   const rows = healthCampVisitors.map((v) => ({
//     regId: { no: v.registrationId || "N/A" },
//     _id: v._id,
//     checkbox: true,
//     contact: {
//       person:
//         `${v.firstName || ""} ${v.lastName || ""} | ${v.mobile || ""}`.trim(),
//     },
//     mobile: v.mobile || "",
//     personal: {
//       email: v.email || "",
//       dob: v.dateOfBirth || "",
//       gender: v.gender || "",
//     },
//     location: {
//       city: `${v.city || ""} | ${v.state || ""}`.trim(),
//     },
//     appointment: {
//       date: `${v.preferredDate || ""} | ${v.preferredTimeSlot || ""}`.trim(),
//     },
//     status: {
//       status: v.status || "",
//     },
//     consent: {
//       // ✅ Fix: use consentMedicalData instead of consent
//       medical: v.consentMedicalData || "",
//     },
//     meta: {
//       createdBy: v.created_by
//         ? `${v.created_by} | ${formatDateTime(v.createdAt)}`
//         : formatDateTime(v.createdAt),
//       updatedBy: v.updated_by
//         ? `${v.updated_by} | ${formatDateTime(v.updatedAt)}`
//         : formatDateTime(v.updatedAt),
//     },
//     _original: v,
//   }));

//   const columns = [
//     { label: "Registration ID", accessor: "regId.no" },
//     {
//       label: "Visitor Details",
//       accessor: "contact.person",
//       render: (value, row) => (
//         <Link
//           to={`/webVisitorData/healthCampVisitorDetails/${row._id}`}
//           className="text-blue-500 hover:underline"
//         >
//           {value}
//         </Link>
//       ),
//     },
//     { label: "Mobile", accessor: "mobile" },
//     { label: "Email", accessor: "personal.email" },
//     { label: "Appointment Details", accessor: "appointment.date" },
//     { label: "Status", accessor: "status.status" },
//     { label: "City & State", accessor: "location.city" },
//     { label: "Created By", accessor: "meta.createdBy" },
//     { label: "Updated By", accessor: "meta.updatedBy" },
//   ];

//   const handleClientClick = (clientData) => {
//     setSelectedClient(clientData._original || clientData);
//   };

//   const handleBackClick = () => {
//     setSelectedClient(null);
//   };

//   return (
//     <div className="w-full h-auto bg-[#eef1f5]" style={{ marginTop: "30px" }}>
//       {selectedClient ? (
//         <ClientOverview client={selectedClient} onBack={handleBackClick} />
//       ) : (
//         <>
//           <div className="w-full bg-white">
//             <div className="w-full bg-white flex flex-col sm:flex-row justify-between items-center px-4 py-1 mb-3">
//               <h1 className="text-xl text-gray-500 mb-2 lg:mb-0 uppercase">
//                 Health Camp Visitor List
//               </h1>
//             </div>
//           </div>

//           <div className="bg-white mx-3 p-2 rounded shadow-sm">
//             <div className="flex justify-between items-center pr-4 pt-2">
//               <h1 className="text-base font-normal text-gray-800 px-4 uppercase">
//                 Health Camp Visitor List
//                 {loading && (
//                   <span className="text-sm font-normal text-gray-400 ml-2">
//                     Loading...
//                   </span>
//                 )}
//               </h1>
//             </div>
//             <hr className="opacity-10 mb-2" />

//             {loading ? (
//               <div className="text-center py-8 text-gray-400">
//                 Loading health camp visitors...
//               </div>
//             ) : rows.length === 0 ? (
//               <div className="text-center py-8 text-gray-400">
//                 No health camp visitors found.
//               </div>
//             ) : (
//               <div className="text-xs">
//                 <VisitorGloballytable
//                   rows={rows}
//                   colomns={columns}
//                   onRowClick={handleClientClick}
//                 />
//               </div>
//             )}

//             <div className="flex justify-between items-center flex-wrap gap-2 mt-2">
//               {/* Left — Action Buttons */}
//               <div className="flex gap-2">
//                 <button
//                   type="button"
//                   className="px-4 py-1.5 text-xs font-medium bg-[#3598dc] hover:bg-[#276b99] text-white"
//                 >
//                   RESEND VISITOR PASS
//                 </button>
//                 <button
//                   type="button"
//                   className="px-4 py-1.5 text-xs font-medium bg-[#3598dc] hover:bg-[#276b99] text-white"
//                 >
//                   SENT
//                 </button>
//                 <Link
//                   to="/history"
//                   className="px-4 py-1.5 text-xs font-medium bg-[#3598dc] hover:bg-[#276b99] text-white flex items-center"
//                 >
//                   HISTORY
//                 </Link>
//               </div>

//               {/* Right — Radio Options (dynamic) */}
//               <div className="flex flex-wrap gap-2">
//                 {[
//                   "Send Details",
//                   "Office Location",
//                   "Venue Location",
//                   "Visitor Pass",
//                 ].map((option) => (
//                   <label
//                     key={option}
//                     className="flex items-center gap-1.5 px-2 h-8 bg-gray-100 border border-gray-400 text-xs text-black cursor-pointer hover:bg-gray-200"
//                   >
//                     <input
//                       type="radio"
//                       name="options"
//                       value={option}
//                       checked={open === option}
//                       onChange={() => handle(option)}
//                       className="accent-[#3598dc]"
//                     />
//                     {option}
//                   </label>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default HealthCampVisitorsList;
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchHealthCampVisitors } from "../../features/visitor/freeHealthCampSlice";
import ClientOverview from "../../Components/ClientOverview";
import VisitorGloballytable from "./VisitorGloballytable";

const HealthCampVisitorsList = () => {
  const dispatch = useDispatch();
  const [selectedClient, setSelectedClient] = useState(null);
  const [open, setOpen] = useState("");

  const { healthCampVisitors, loading } = useSelector(
    (state) => state.healthCampVisitors,
  );

  const handle = (value) => setOpen(value);

  useEffect(() => {
    dispatch(fetchHealthCampVisitors());
  }, [dispatch]);

  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-GB", { month: "short" });
    const year = date.getFullYear().toString().slice(-2);
    const time = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${day} ${month} ${year} | ${time}`;
  };

  const rows = healthCampVisitors.map((v) => ({
    regId: { no: v.registrationId || "N/A" },
    _id: v._id,
    checkbox: true,
    contact: {
      person:
        `${v.firstName || ""} ${v.lastName || ""} | ${v.mobile || ""}`.trim(),
    },
    mobile: v.mobile || "",
    personal: {
      email: v.email || "",
      dob: v.dateOfBirth || "",
      gender: v.gender || "",
    },
    location: {
      city: `${v.city || ""} | ${v.state || ""}`.trim(),
    },
    appointment: {
      date: `${v.preferredDate || ""} | ${v.preferredTimeSlot || ""}`.trim(),
    },
    status: {
      status: v.status || "",
    },
    consent: {
      medical: v.consentMedicalData || "",
    },
    meta: {
      createdBy: v.created_by
        ? `${v.created_by} | ${formatDateTime(v.createdAt)}`
        : formatDateTime(v.createdAt),
      updatedBy: v.updated_by
        ? `${v.updated_by} | ${formatDateTime(v.updatedAt)}`
        : formatDateTime(v.updatedAt),
    },
    _original: v,
  }));

  const columns = [
    { label: "Registration ID", accessor: "regId.no" },
    {
      label: "Visitor Details",
      accessor: "contact.person",
      render: (value, row) => (
        <Link
          to={`/webVisitorData/healthCampVisitorDetails/${row._id}`}
          className="text-blue-500 hover:underline"
        >
          {value}
        </Link>
      ),
    },
    { label: "Mobile", accessor: "mobile" },
    { label: "Email", accessor: "personal.email" },
    { label: "Appointment Details", accessor: "appointment.date" },
    { label: "Status", accessor: "status.status" },
    { label: "City & State", accessor: "location.city" },
    { label: "Created By", accessor: "meta.createdBy" },
    { label: "Updated By", accessor: "meta.updatedBy" },
    {
      label: "Action",
      accessor: "_id",
      render: (id) => (
        <Link
          to={`/webVisitorData/healthCampVisitorDetails/${id}`}
          className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
        >
          View View
        </Link>
      ),
    },
  ];

  const handleClientClick = (clientData) => {
    setSelectedClient(clientData._original || clientData);
  };

  const handleBackClick = () => setSelectedClient(null);

  return (
    <div className="w-full h-auto bg-[#eef1f5]" style={{ marginTop: "30px" }}>
      {selectedClient ? (
        <ClientOverview client={selectedClient} onBack={handleBackClick} />
      ) : (
        <>
          <div className="w-full bg-white">
            <div className="w-full bg-white flex flex-col sm:flex-row justify-between items-center px-6 py-3 mb-3">
              <h1 className="text-2xl text-gray-500 mb-2 lg:mb-0 uppercase">
                Health Camp Visitor List
              </h1>
            </div>
          </div>

          <div className="bg-white mx-3 p-4 rounded shadow-sm">
            <div className="flex justify-between items-center pr-4 pt-2">
              <h1 className="text-xl font-normal text-gray-800 px-4 uppercase">
                Health Camp Visitor List
                {loading && (
                  <span className="text-base font-normal text-gray-400 ml-2">
                    Loading...
                  </span>
                )}
              </h1>
            </div>
            <hr className="opacity-10 mb-4" />

            {loading ? (
              <div className="text-center py-8 text-base text-gray-400">
                Loading health camp visitors...
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-8 text-base text-gray-400">
                No health camp visitors found.
              </div>
            ) : (
              <div className="text-base">
                <div className="[&_td]:py-2 [&_td]:px-4 [&_th]:py-2 [&_th]:px-4 overflow-x-auto">
                  <VisitorGloballytable
                    rows={rows}
                    colomns={columns}
                    onRowClick={handleClientClick}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between items-center flex-wrap gap-4 mt-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  className="px-5 py-2 text-base font-medium bg-[#3598dc] hover:bg-[#276b99] text-white rounded-md transition-colors"
                >
                  RESEND VISITOR PASS
                </button>
                <button
                  type="button"
                  className="px-5 py-2 text-base font-medium bg-[#3598dc] hover:bg-[#276b99] text-white rounded-md transition-colors"
                >
                  SENT
                </button>

              </div>

              <div className="flex flex-wrap gap-3">
                {[
                  "Send Details",
                  "Office Location",
                  "Venue Location",
                  "Visitor Pass",
                ].map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 px-3 h-10 bg-gray-100 border border-gray-400 text-base text-black cursor-pointer hover:bg-gray-200 rounded-md"
                  >
                    <input
                      type="radio"
                      name="options"
                      value={option}
                      checked={open === option}
                      onChange={() => handle(option)}
                      className="accent-[#3598dc] w-4 h-4"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HealthCampVisitorsList;
