// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Link } from "react-router-dom";
// import {
//   fetchCorporateVisitors,
//   deleteCorporateVisitor,
// } from "../../features/visitor/corporateVisitorSlice";
// import ClientOverview from "../../Components/ClientOverview";
// import { showSuccess, showError } from "../../utils/toastMessage";
// import VisitorGloballytable from "./VisitorGloballytable";

// const CorporateVisitorsList = () => {
//   const dispatch = useDispatch();
//   const [selectedClient, setSelectedClient] = useState(null);
//   const [open, setOpen] = useState(""); // ✅ missing state for radio selection

//   // ✅ Safe extraction – ensure array
//   const corporateVisitorsState = useSelector(
//     (state) => state.corporateVisitors,
//   );
//   const corporateVisitors = Array.isArray(corporateVisitorsState)
//     ? corporateVisitorsState
//     : [];
//   const loading = corporateVisitorsState?.loading ?? false;

//   useEffect(() => {
//     dispatch(fetchCorporateVisitors());
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

//   // ✅ Redux data ko table format mein convert karo
//   const rows = corporateVisitors.map((v) => ({
//     regId: { no: v.registrationId || "N/A" },
//     _id: v._id,
//     checkbox: true,
//     company: { name: v.companyName || "", email: v.industrySector || "" },
//     contact: {
//       person:
//         `${v.firstName || ""} ${v.lastName || ""} | ${v.designation || ""} | ${v.mobile || ""}`.trim(),
//     },
//     status: { text: v.status || "" },
//     industry: { sector: v.industrySector || "" },
//     location: {
//       city: `${v.city || ""} | ${v.state || ""}`,
//     },
//     b2b: { meeting: v.b2bMeeting || "" },
//     whatsapp: { updates: v.whatsappUpdates || "" },
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
//           to={`/webVisitorData/corporateVisitorDetails/${row._id}`}
//           className="text-blue-500 hover:underline"
//         >
//           {value}
//         </Link>
//       ),
//     },
//     { label: "Company Name", accessor: "company.name" },
//     { label: "Industry", accessor: "company.email" },
//     { label: "Status", accessor: "status.text" },
//     { label: "Industry/Sector", accessor: "industry.sector" },
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

//   // ✅ missing handler for radio buttons
//   const handleRadioChange = (value) => {
//     setOpen(value);
//     // Add your logic here, e.g., open modal, send email, etc.
//     console.log(`Selected option: ${value}`);
//     // Example: if (value === "Send Details") { ... }
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
//                 Web Visitor Data 2026
//               </h1>
//             </div>
//           </div>

//           <div className="bg-white mx-3 p-2 rounded shadow-sm">
//             <div className="flex justify-between items-center pr-4 pt-2">
//               <h1 className="text-base font-normal text-gray-800 px-4 uppercase">
//                 Corporate Visitor List
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
//                 Loading corporate visitors...
//               </div>
//             ) : rows.length === 0 ? (
//               <div className="text-center py-8 text-gray-400">
//                 No corporate visitors found.
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

//               {/* Right — Radio Options */}
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
//                       onChange={() => handleRadioChange(option)}
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

// export default CorporateVisitorsList;
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchCorporateVisitors,
  deleteCorporateVisitor,
} from "../../features/visitor/corporateVisitorSlice";
import ClientOverview from "../../Components/ClientOverview";
import { showSuccess, showError } from "../../utils/toastMessage";
import VisitorGloballytable from "./VisitorGloballytable";

const CorporateVisitorsList = () => {
  const dispatch = useDispatch();
  const [selectedClient, setSelectedClient] = useState(null);
  const [open, setOpen] = useState("");

  const { corporateVisitors, loading } = useSelector(
    (state) => state.corporateVisitors,
  );

  useEffect(() => {
    dispatch(fetchCorporateVisitors());
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

  const rows = corporateVisitors.map((v) => ({
    regId: { no: v.registrationId || "N/A" },
    _id: v._id,
    checkbox: true,
    company: { name: v.companyName || "", email: v.industrySector || "" },
    contact: {
      person:
        `${v.firstName || ""} ${v.lastName || ""} | ${v.designation || ""} | ${v.mobile || ""}`.trim(),
    },
    status: { text: v.status || "" },
    industry: { sector: v.industrySector || "" },
    location: {
      city: `${v.city || ""} | ${v.state || ""}`,
    },
    b2b: { meeting: v.b2bMeeting || "" },
    whatsapp: { updates: v.whatsappUpdates || "" },
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
          to={`/webVisitorData/corporateVisitorDetails/${row._id}`}
          className="text-blue-500 hover:underline"
        >
          {value}
        </Link>
      ),
    },
    { label: "Company Name", accessor: "company.name" },
    { label: "Industry", accessor: "company.email" },
    { label: "Status", accessor: "status.text" },
    { label: "Industry/Sector", accessor: "industry.sector" },
    { label: "City & State", accessor: "location.city" },
    { label: "Created By", accessor: "meta.createdBy" },
    { label: "Updated By", accessor: "meta.updatedBy" },
  ];

  const handleClientClick = (clientData) => {
    setSelectedClient(clientData._original || clientData);
  };

  const handleBackClick = () => {
    setSelectedClient(null);
  };

  const handleRadioChange = (value) => {
    setOpen(value);
    console.log(`Selected option: ${value}`);
  };

  return (
    <div className="w-full h-auto bg-[#eef1f5]" style={{ marginTop: "30px" }}>
      {selectedClient ? (
        <ClientOverview client={selectedClient} onBack={handleBackClick} />
      ) : (
        <>
          <div className="w-full bg-white">
            <div className="w-full bg-white flex flex-col sm:flex-row justify-between items-center px-6 py-3 mb-3">
              <h1 className="text-2xl text-gray-500 mb-2 lg:mb-0 uppercase">
                Web Visitor Data 2026
              </h1>
            </div>
          </div>

          <div className="bg-white mx-3 p-4 rounded shadow-sm">
            <div className="flex justify-between items-center pr-4 pt-2">
              <h1 className="text-xl font-normal text-gray-800 px-4 uppercase">
                Corporate Visitor List
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
                Loading corporate visitors...
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-8 text-base text-gray-400">
                No corporate visitors found.
              </div>
            ) : (
              <div className="text-base">
                {/* Table wrapper with larger cell padding */}
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
              {/* Left — Action Buttons */}
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
                <Link
                  to="/history"
                  className="px-5 py-2 text-base font-medium bg-[#3598dc] hover:bg-[#276b99] text-white rounded-md transition-colors flex items-center"
                >
                  HISTORY
                </Link>
              </div>

              {/* Right — Radio Options */}
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
                      onChange={() => handleRadioChange(option)}
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

export default CorporateVisitorsList;
