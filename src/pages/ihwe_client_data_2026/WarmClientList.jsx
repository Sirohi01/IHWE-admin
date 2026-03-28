import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Globallytable from "../../Components/Globallytable";
import Textarea from "../../Components/Textarea";
import ClientOverview from "../../Components/ClientOverview";
import { useDispatch, useSelector } from "react-redux";
import { fetchCompanies } from "../../features/company/companySlice";

// Helper to safely extract an array from any Redux slice
const getArrayFromSlice = (sliceState, fallbackKey = "companies") => {
  if (Array.isArray(sliceState)) return sliceState;
  if (
    sliceState &&
    typeof sliceState === "object" &&
    fallbackKey in sliceState &&
    Array.isArray(sliceState[fallbackKey])
  ) {
    return sliceState[fallbackKey];
  }
  return [];
};

const WarmClientList = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 🏢 Company redux data – robust extraction
  const companiesState = useSelector((state) => state.companies);
  const companiesArray = getArrayFromSlice(companiesState, "companies");
  const isLoading = companiesState?.loading ?? false;
  const error = companiesState?.error ?? null;

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  const columns = [
    {
      label: "Company Name",
      accessor: "company.name",
      render: (value, row) => (
        <Link
          to={`/clientOverview1/${row.id}`}
          className="hover:underline text-blue-500"
        >
          {value}
        </Link>
      ),
    },
    { label: "Contact Details", accessor: "contact.details" },
    { label: "Category", accessor: "category.main" },
    { label: "Nature Bussiness", accessor: "Nature Bussiness" },
    { label: "City", accessor: "location.city" },
    { label: "State", accessor: "location.state" },
    { label: "Source", accessor: "source.type" },
    { label: "Status", accessor: "Status" },
    { label: "Event", accessor: "Event.type" },
    { label: "Updated Details", accessor: "Update.detail" },
  ];

  // 🧱 Prepare Rows
  const filteredCompanies = companiesArray.filter((c) =>
    ["Warm Client", "Follow-Up Call", "Sent Details"].includes(c.companyStatus),
  );
  const rows = filteredCompanies.map((c) => ({
    id: c._id,
    checkbox: true,
    company: {
      name: c.companyName,
    },
    contact: {
      details: c.contacts
        ?.map(
          (contact) =>
            `${contact.firstName} ${contact.surname} | ${contact.mobile}`,
        )
        .join(", "),
    },
    category: { main: c.category },
    "Nature Bussiness": c.businessNature,
    location: { city: c.city, state: c.state },
    source: { type: c.dataSource || "-" },
    Status: c.companyStatus,
    Event: { type: "Organic Expo 2026" },
    Update: {
      detail: `${new Date(c.updatedAt).toLocaleDateString()} | ${
        c.contacts?.[0]?.firstName || "-"
      }`,
    },
  }));

  const handleClientClick = (clientData) => {
    setSelectedClient(clientData);
  };

  const handleBackClick = () => {
    setSelectedClient(null);
  };

  const handleAddNewLeadClick = () => {
    navigate("/ihweClientData2026/addNewClients");
  };

  const handleWarmClientClick = () => {
    navigate("/ihweClientData2026/warmClientList");
  };

  const handleHotClientClick = () => {
    navigate("/ihweClientData2026/hotClientList");
  };

  const handleConfirmClientClick = () => {
    navigate("/ihweClientData2026/confirmClientList");
  };

  const handleColdClientClick = () => {
    navigate("/ihweClientData2026/coldClientList");
  };

  const handleRawDataListClick = () => {
    navigate("/ihweClientData2026/rawDataList");
  };

  return (
    <div className="w-full h-auto bg-[#eef1f5]" style={{ marginTop: "30px" }}>
      {selectedClient ? (
        <ClientOverview client={selectedClient} onBack={handleBackClick} />
      ) : (
        <>
          <div className="w-full bg-white">
            <div className="w-full bg-white flex flex-col sm:flex-row justify-between items-center px-4 py-1 mb-3">
              <h1 className="text-xl text-gray-500 mb-2 lg:mb-0 uppercase">
                CLIENT DATA 2026
              </h1>
            </div>
          </div>
          <div className="bg-white mx-3 p-2 rounded shadow-sm">
            <div className="flex justify-between items-center pr-4 pt-2">
              <h1 className="text-base font-normal text-gray-800 px-4">
                WARM CLIENT LIST
              </h1>

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={handleAddNewLeadClick}
                  className="px-3 py-1 text-xs bg-[#337ab7] hover:bg-[#286090] text-white transition"
                >
                  Add New Lead
                </button>
                <button
                  onClick={handleWarmClientClick}
                  className="px-3 py-1 text-xs bg-[#337ab7] hover:bg-[#286090] text-white transition"
                >
                  Warm Client
                </button>
                <button
                  onClick={handleHotClientClick}
                  className="px-3 py-1 text-xs bg-[#337ab7] hover:bg-[#286090] text-white transition"
                >
                  Hot Client
                </button>
                <button
                  onClick={handleConfirmClientClick}
                  className="px-3 py-1 text-xs bg-[#337ab7] hover:bg-[#286090] text-white transition"
                >
                  Confirm Client
                </button>
                <button
                  onClick={handleColdClientClick}
                  className="px-3 py-1 text-xs bg-[#337ab7] hover:bg-[#286090] text-white transition"
                >
                  Cold Client
                </button>
                <button
                  onClick={handleRawDataListClick}
                  className="px-3 py-1 text-xs bg-[#337ab7] hover:bg-[#286090] text-white transition"
                >
                  Raw Data List
                </button>
              </div>
            </div>
            <hr className="opacity-10 my-2" />
            <div className="text-xs">
              {isLoading ? (
                <div className="text-center text-gray-500 py-4">Loading...</div>
              ) : error ? (
                <div className="text-center text-red-500 py-4">
                  Error loading companies: {error}
                </div>
              ) : (
                <Globallytable
                  rows={rows}
                  colomns={columns}
                  onRowClick={handleClientClick}
                />
              )}
            </div>
          </div>
          <div className="bg-white shadow-md m-3">
            <Textarea />
          </div>
        </>
      )}
    </div>
  );
};

export default WarmClientList;
