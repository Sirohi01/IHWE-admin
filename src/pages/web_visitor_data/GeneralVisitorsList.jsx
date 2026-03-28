import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchGeneralVisitors } from "../../features/visitor/generalVisitorSlice";
import ClientOverview from "../../Components/ClientOverview";
import VisitorGloballytable from "./VisitorGloballytable";

const GeneralVisitorsList = () => {
  const dispatch = useDispatch();
  const [selectedClient, setSelectedClient] = useState(null);
  const [open, setOpen] = useState("");

  // ✅ Safe extraction – ensure array and loading state
  const generalVisitorsState = useSelector((state) => state.generalVisitors);
  const generalVisitors = Array.isArray(generalVisitorsState)
    ? generalVisitorsState
    : [];
  const loading = generalVisitorsState?.loading ?? false;

  const handle = (value) => setOpen(value);

  useEffect(() => {
    dispatch(fetchGeneralVisitors());
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

  const rows = generalVisitors.map((v) => ({
    regId: { no: v.registrationId || "N/A" },
    _id: v._id,
    checkbox: true,
    company: { name: v.companyName || "N/A", email: v.email || "" },
    contact: {
      person:
        `${v.firstName || ""} ${v.lastName || ""} | ${v.mobile || ""}`.trim(),
    },
    status: { status: v.status || "New Reg." },
    cityState: {
      cityState: `${v.city || ""} | ${v.state || ""}`.trim(),
    },
    registration: { for: v.registrationFor || "" },
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
          to={`/webVisitorData/generalVisitorDetails/${row._id}`}
          className="text-blue-500 hover:underline"
        >
          {value}
        </Link>
      ),
    },
    { label: "Email", accessor: "company.email" },
    { label: "Company Name", accessor: "company.name" },
    { label: "Status", accessor: "status.status" },
    { label: "City & State", accessor: "cityState.cityState" },
    { label: "Registration For", accessor: "registration.for" },
    { label: "Created By", accessor: "meta.createdBy" },
    { label: "Updated By", accessor: "meta.updatedBy" },
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
            <div className="w-full bg-white flex flex-col sm:flex-row justify-between items-center px-4 py-1 mb-3">
              <h1 className="text-xl text-gray-500 mb-2 lg:mb-0 uppercase">
                Web Visitor Data 2026
              </h1>
            </div>
          </div>

          <div className="bg-white mx-3 p-2 rounded shadow-sm">
            <div className="flex justify-between items-center pr-4 pt-2">
              <h1 className="text-base font-medium text-gray-700 px-4 uppercase">
                General Visitor List
                {loading && (
                  <span className="text-sm font-normal text-gray-400 ml-2">
                    Loading...
                  </span>
                )}
              </h1>
            </div>
            <hr className="opacity-10 mb-2" />

            {loading ? (
              <div className="text-center py-8 text-gray-400">
                Loading general visitors...
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No general visitors found.
              </div>
            ) : (
              <div className="text-xs">
                <VisitorGloballytable
                  rows={rows}
                  colomns={columns}
                  onRowClick={handleClientClick}
                  extrabutton={false}
                />
              </div>
            )}

            <div className="flex justify-between items-center flex-wrap gap-2 mt-2">
              {/* Left — Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-4 py-1.5 text-xs font-medium bg-[#3598dc] hover:bg-[#276b99] text-white"
                >
                  RESEND VISITOR PASS
                </button>
                <button
                  type="button"
                  className="px-4 py-1.5 text-xs font-medium bg-[#3598dc] hover:bg-[#276b99] text-white"
                >
                  SENT
                </button>
                <Link
                  to="/history"
                  className="px-4 py-1.5 text-xs font-medium bg-[#3598dc] hover:bg-[#276b99] text-white flex items-center"
                >
                  HISTORY
                </Link>
              </div>

              {/* Right — Radio Options */}
              <div className="flex flex-wrap gap-2">
                {[
                  "Send Details",
                  "Office Location",
                  "Venue Location",
                  "Visitor Pass",
                ].map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-1.5 px-2 h-8 bg-gray-100 border border-gray-400 text-xs text-black cursor-pointer hover:bg-gray-200"
                  >
                    <input
                      type="radio"
                      name="options"
                      value={option}
                      checked={open === option}
                      onChange={() => handle(option)}
                      className="accent-[#3598dc]"
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

export default GeneralVisitorsList;
