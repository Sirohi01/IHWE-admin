import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Globallytable from "../../Components/Globallytable";
import Textarea from "../../Components/Textarea";
import { useSelector, useDispatch } from "react-redux";
import { fetchCompanies } from "../../features/company/companySlice";
import { useNavigate } from "react-router-dom";
import { Upload, UserCheck, LayoutGrid } from "lucide-react";

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

const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

const NewLeadList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();


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
          to={`/client-overview/${row.id}`}
          className="text-blue-500 hover:underline"
        >
          {value}
        </Link>
      ),
    },
    { label: "Contact Details", accessor: "contact.details" },
    { label: "Category", accessor: "category.main" },
    { label: "Nature of Business", accessor: "business.type" },
    { label: "Address", accessor: "location.fullAddress" },
    { label: "Source", accessor: "source.name" },
    // { label: "Forward To", accessor: "forwardTo" },
    { label: "Update Details", accessor: "update.details" },
  ];

  // 🧱 Prepare Rows - Filter only New Lead companies
  const newLeadCompanies = companiesArray.filter(
    (company) => company.companyStatus === "New Lead",
  );

  const rows = newLeadCompanies.map((c) => ({
    id: c._id,
    checkbox: true,
    company: {
      name: toTitleCase(c.companyName),
    },
    contact: {
      details: c.contacts
        ?.map(
          (contact) =>
            `${toTitleCase(contact.firstName)} ${toTitleCase(contact.surname)} | ${contact.mobile}`,
        )
        .join(", "),
    },
    category: { main: toTitleCase(c.category) || "-" },
    business: { type: toTitleCase(c.businessNature) || "-" },
    location: { fullAddress: `${toTitleCase(c.country) || "-"} | ${toTitleCase(c.state) || "-"} | ${toTitleCase(c.city) || "-"}` },
    source: { name: toTitleCase(c.dataSource) || "-" },
    // forwardTo: toTitleCase(c.forwardTo) || "-",
    update: {
      details: `${new Date(c.updatedAt).toLocaleDateString()} | ${toTitleCase(c.contacts?.[0]?.firstName) || "-"}`,
    },
  }));

  return (
    <div className="w-full h-auto bg-[#eef1f5] mt-8">
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

      {/* 🔹 Main Section */}
      <div className="bg-white m-4 p-2 rounded shadow-sm">
        <div className="flex justify-between items-center pr-4">
          <h1 className="text-lg font-medium text-gray-800 px-4">
            NEW LEAD LIST
          </h1>

          {/* 🔸 Navigation Buttons */}
          <div className="flex flex-wrap justify-end gap-2">
            <Link
              to="/ihweClientData2026/addNewClients"
              className="px-3 py-1.5 text-sm font-semibold bg-[#337ab7] hover:bg-[#286090] text-white transition"
            >
              Add New Lead
            </Link>
            <Link
              to="/ihweClientData2026/warmClientList"
              className="px-3 py-1.5 text-sm font-semibold bg-[#337ab7] hover:bg-[#286090] text-white transition"
            >
              Warm Client
            </Link>
            <Link
              to="/ihweClientData2026/hotClientList"
              className="px-3 py-1.5 text-sm font-semibold bg-[#337ab7] hover:bg-[#286090] text-white transition"
            >
              Hot Client
            </Link>
            <Link
              to="/ihweClientData2026/confirmClientList"
              className="px-3 py-1.5 text-sm font-semibold bg-[#337ab7] hover:bg-[#286090] text-white transition"
            >
              Confirm Client
            </Link>
            <Link
              to="/ihweClientData2026/coldClientList"
              className="px-3 py-1.5 text-sm font-semibold bg-[#337ab7] hover:bg-[#286090] text-white transition"
            >
              Cold Client
            </Link>
            <Link
              to="/ihweClientData2026/rawDataList"
              className="px-3 py-1.5 text-sm font-semibold bg-[#337ab7] hover:bg-[#286090] text-white transition"
            >
              Raw Data List
            </Link>
          </div>
        </div>

        <hr className="opacity-10 my-2" />

        {/* 🔹 Data Table */}
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
              style={{ marginTop: "20px" }}
            />
          )}
        </div>
      </div>

      {/* 🔹 Notes Section */}
      <div className="bg-white shadow-md m-3">
        <Textarea />
      </div>
    </div>
  );
};

export default NewLeadList;
