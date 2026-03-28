import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

const ConfirmClientList = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const dispatch = useDispatch();

  // 🏢 Company redux data – robust extraction
  const companiesState = useSelector((state) => state.companies);
  const companiesArray = getArrayFromSlice(companiesState, "companies");
  const isLoading = companiesState?.loading ?? false;
  const error = companiesState?.error ?? null;

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  // 📋 Table Columns
  const columns = [
    {
      label: "Company Name",
      accessor: "company.name",
      render: (value, row) => (
        <Link
          to={`/clientOverview1/${row.id}`}
          className="text-blue-500 hover:underline"
        >
          {value}
        </Link>
      ),
    },
    { label: "Contact Details", accessor: "contact.details" },
    { label: "Category", accessor: "category.main" },
    { label: "Nature of Business", accessor: "business.type" },
    { label: "City", accessor: "location.city" },
    { label: "State", accessor: "location.state" },
    { label: "Source", accessor: "source.name" },
    { label: "Update Details", accessor: "update.details" },
  ];

  // 🧱 Prepare Rows - Filter companies with specific statuses
  const confirmClientCompanies = companiesArray.filter(
    (company) =>
      company.companyStatus === "Adc. Recd" ||
      company.companyStatus === "Inv. Req." ||
      company.companyStatus === "Under PYMT Followups",
  );

  const rows = confirmClientCompanies.map((c) => ({
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
    business: { type: c.businessNature },
    location: { city: c.city, state: c.state },
    source: { name: c.dataSource || "-" },
    update: {
      details: `${new Date(c.updatedAt).toLocaleDateString()} | ${
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
              <h1 className="text-base font-normal text-gray-800 px-2">
                CONFIRM CLIENT LIST
              </h1>
              <div className="flex flex-wrap justify-start md:justify-end gap-2 mb-1">
                <Link
                  to="/ihweClientData2026/addNewClients"
                  className="bg-[#337ab7] hover:bg-[#286090] text-white px-2.5 py-1 text-xs font-medium"
                >
                  Add New Lead
                </Link>
                <Link
                  to="/ihweClientData2026/warmClientList"
                  className="bg-[#337ab7] hover:bg-[#286090] text-white px-2.5 py-1 text-xs font-medium"
                >
                  Warm Client
                </Link>
                <Link
                  to="/ihweClientData2026/hotClientList"
                  className="bg-[#337ab7] hover:bg-[#286090] text-white px-2.5 py-1 text-xs font-medium"
                >
                  Hot Client
                </Link>
                <Link
                  to="/ihweClientData2026/confirmClientList"
                  className="bg-[#337ab7] hover:bg-[#286090] text-white px-2.5 py-1 text-xs font-medium"
                >
                  Confirm Client
                </Link>
                <Link
                  to="/ihweClientData2026/coldClientList"
                  className="bg-[#337ab7] hover:bg-[#286090] text-white px-2.5 py-1 text-xs font-medium"
                >
                  Cold Client
                </Link>
                <Link
                  to="/ihweClientData2026/rawDataList"
                  className="bg-[#337ab7] hover:bg-[#286090] text-white px-2.5 py-1 text-xs font-medium"
                >
                  Raw Data List
                </Link>
              </div>
            </div>
            <hr className="opacity-10 mb-2" />
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

export default ConfirmClientList;
