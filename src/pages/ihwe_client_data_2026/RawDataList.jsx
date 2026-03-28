import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Globallytable from "../../Components/Globallytable";
import UploaderTextarea from "../../Components/UploaderTextarea";
import { useSelector, useDispatch } from "react-redux";
import { fetchCompanies } from "../../features/company/companySlice";

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

const RawDataList = () => {
  const dispatch = useDispatch();

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

  const rawDataCompanies = companiesArray.filter(
    (company) =>
      !company.companyStatus ||
      company.companyStatus.trim() === "" ||
      company.companyStatus === "null",
  );

  const rows = rawDataCompanies.map((c) => ({
    id: c._id,
    checkbox: true,
    company: { name: c.companyName },
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

  return (
    <div className="w-full h-auto bg-[#eef1f5]">
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
            RAW DATA LIST
          </h1>
          <div className="flex flex-wrap justify-end gap-2">
            <Link
              to="/ihweClientData2026/addNewClients"
              className="px-3 py-1 text-xs bg-[#337ab7] hover:bg-[#286090] text-white transition"
            >
              Add New Lead
            </Link>
            <Link
              to="/ihweClientData2026/warmClientList"
              className="px-3 py-1 text-xs bg-[#337ab7] hover:bg-[#286090] text-white transition"
            >
              Warm Client
            </Link>
            <Link
              to="/ihweClientData2026/hotClientList"
              className="px-3 py-1 text-xs bg-[#337ab7] hover:bg-[#286090] text-white transition"
            >
              Hot Client
            </Link>
            <Link
              to="/ihweClientData2026/confirmClientList"
              className="px-3 py-1 text-xs bg-[#337ab7] hover:bg-[#286090] text-white transition"
            >
              Confirm Client
            </Link>
            <Link
              to="/ihweClientData2026/coldClientList"
              className="px-3 py-1 text-xs bg-[#337ab7] hover:bg-[#286090] text-white transition"
            >
              Cold Client
            </Link>
            <Link
              to="/ihweClientData2026/rawDataList"
              className="px-3 py-1 text-xs bg-[#337ab7] hover:bg-[#286090] text-white transition"
            >
              Raw Data List
            </Link>
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
            <Globallytable rows={rows} colomns={columns} />
          )}
        </div>
      </div>

      <div className="bg-white shadow-md m-3">
        <UploaderTextarea />
      </div>
    </div>
  );
};

export default RawDataList;
