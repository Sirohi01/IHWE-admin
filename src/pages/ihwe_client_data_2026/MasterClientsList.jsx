import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Globallytable from "../../Components/Globallytable";
import Textarea from "../../Components/Textarea";
import ClientOverview from "../../Components/ClientOverview";
import { useReactToPrint } from "react-to-print";
import * as XLSX from "xlsx";
import { useSelector, useDispatch } from "react-redux";
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

const MasterClientsList = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const printref = useRef();
  const dispatch = useDispatch();

  // print function
  const handleprint = useReactToPrint({
    contentRef: printref,
    documentTitle: "Table Print",
    removeAfterPrint: true,
  });

  // 🏢 Company redux data – robust extraction
  const companiesState = useSelector((state) => state.companies);
  const companiesArray = getArrayFromSlice(companiesState, "companies");
  const isLoading = companiesState?.loading ?? false;
  const error = companiesState?.error ?? null;

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  // Excel function with styling
  const exportTableToExcel = () => {
    const table = printref.current.querySelector("table");
    if (!table) return;

    const workbook = XLSX.utils.table_to_book(table, {
      sheet: "MasterClients",
    });
    const worksheet = workbook.Sheets["MasterClients"];

    // Make headers bold
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = { c: C, r: 0 };
      const cell_ref = XLSX.utils.encode_cell(cell_address);
      if (!worksheet[cell_ref]) continue;
      if (!worksheet[cell_ref].s) worksheet[cell_ref].s = {};
      worksheet[cell_ref].s.font = { bold: true };
    }

    // Auto-width for columns
    const colWidths = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxWidth = 10;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell_ref = XLSX.utils.encode_cell({ c: C, r: R });
        const cell = worksheet[cell_ref];
        if (cell && cell.v) {
          const length = cell.v.toString().length;
          if (length > maxWidth) maxWidth = length;
        }
      }
      colWidths.push({ wch: maxWidth + 2 });
    }
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, "MasterClientsList.xlsx");
  };

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
    { label: "Contact Details", accessor: "company.detail" },
    { label: "Category", accessor: "category.main" },
    { label: "Nature", accessor: "nature.name" },
    { label: "State", accessor: "location.state" },
    { label: "City", accessor: "location.city" },
    { label: "Source", accessor: "source.type" },
    { label: "Status", accessor: "Status.name" },
    { label: "Subject", accessor: "subject.name" },
    { label: "Updated Details", accessor: "update.by" },
    { label: "Added Details", accessor: "added.By" },
  ];

  const rows = companiesArray.map((c) => ({
    id: c._id,
    checkbox: true,
    company: {
      name: c.companyName,
      detail: c.contacts
        ?.map((contact) => `${contact.email} | ${contact.mobile}`)
        .join(", "),
    },
    category: { main: c.category },
    nature: { name: c.businessNature },
    location: { state: c.state, city: c.city },
    source: { type: c.dataSource || "-" },
    Status: { name: c.companyStatus },
    subject: { name: "-" },
    update: { by: c.updated_by || "-" },
    added: { By: "-" },
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
          <div className="w-full bg-white shadow-md mb-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-4 py-1">
              <h1 className="text-xl text-gray-700 mb-2 lg:mb-0">
                CLIENT DATA 2025
              </h1>
            </div>
          </div>
          <div className="w-[97%] bg-white m-4">
            <div className="flex justify-between pt-1">
              <h1 className="text-base font-semibold text-gray-950 pl-4 pt-1">
                MASTER CLIENTS LIST
              </h1>
              <div className="flex flex-wrap justify-start md:justify-end gap-2 mb-1 pr-3">
                <button
                  onClick={handleprint}
                  className="text-[#2f353b] h-8 w-14 text-xs text-center cursor-pointer hover:bg-black hover:text-white border border-[#2f353b]"
                >
                  Print
                </button>
                <button
                  onClick={exportTableToExcel}
                  className="h-8 w-14 text-[#78a300] text-xs text-center cursor-pointer hover:bg-[#78a300] hover:text-white border border-[#78a300]"
                >
                  Excel
                </button>
              </div>
            </div>
            <hr className="opacity-10 mb-2" />

            <div
              ref={printref}
              className="text-xs print:text-sm print:block print:w-full print:overflow-visible"
            >
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
                  extrabutton={false}
                />
              )}
            </div>
          </div>
          <div className="bg-white shadow-md m-4 w-[97%]">
            <Textarea />
          </div>
        </>
      )}
    </div>
  );
};

export default MasterClientsList;
