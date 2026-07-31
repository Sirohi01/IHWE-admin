import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchGeneralVisitors } from "../../features/visitor/generalVisitorSlice";
import ClientOverview from "../../components/ClientOverview";
import VisitorGloballytable from "./VisitorGloballytable";

const GeneralVisitorsList = () => {
  const dispatch = useDispatch();
  const [selectedClient, setSelectedClient] = useState(null);
  const [open, setOpen] = useState("");
  const [modalQrCode, setModalQrCode] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const { generalVisitors, loading } = useSelector(
    (state) => state.generalVisitors,
  );

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
    qrCode: { image: v.qrCode || null },
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
    {
      label: "QR Code",
      accessor: "qrCode.image",
      render: (img) => img ? <img loading="lazy" decoding="async" src={img} alt="QR Code" className="w-12 h-12 cursor-pointer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModalQrCode(img); }} /> : <span className="text-gray-400">N/A</span>
    },
    { label: "Created By", accessor: "meta.createdBy" },
    { label: "Updated By", accessor: "meta.updatedBy" },
    {
      label: "Action",
      accessor: "_id",
      render: (id) => (
        <Link
          to={`/webVisitorData/generalVisitorDetails/${id}`}
          className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
        >
          View
        </Link>
      ),
    },
  ];

  const handleClientClick = (clientData) => {
    setSelectedClient(clientData._original || clientData);
  };


  const handleBulkResend = async () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one visitor to resend passes.");
      return;
    }
    const selectedIds = selectedRows.map(idx => rows[idx]._id);
    const types = ["whatsapp"];
    if (confirm(`Are you sure you want to resend WhatsApp passes to ${selectedIds.length} visitor(s)?`)) {
      try {
        const SERVER_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");
        const res = await fetch(`${SERVER_URL}/api/general-visitors/bulk-resend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorIds: selectedIds, types })
        });
        const data = await res.json();
        if (data.success) {
          alert("WhatsApp messages sent successfully!");
          setSelectedRows([]);
        } else {
          alert(data.message || "Failed to send messages.");
        }
      } catch (error) {
        console.error("Error resending messages:", error);
        alert("An error occurred while sending messages.");
      }
    }
  };

  const handleBackClick = () => setSelectedClient(null);

  return (
    <div className="w-full h-auto bg-[#eef1f5]" >
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
              <h1 className="text-xl font-medium text-gray-700 px-4 uppercase">
                General Visitor List
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
                Loading general visitors...
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-8 text-base text-gray-400">
                No general visitors found.
              </div>
            ) : (
              <div className="text-base">
                {/* Table wrapper with larger cell padding */}
                <div className="[&_td]:py-2 [&_td]:px-4 [&_th]:py-2 [&_th]:px-4 overflow-x-auto">
                  <VisitorGloballytable
                    rows={rows}
                    colomns={columns}
                    extrabutton={false}
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                  />
                  {/* onRowClick={handleClientClick} */}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center flex-wrap gap-4 mt-4">
              {/* Left — Action Buttons */}
              <div className="flex gap-3">
                <button onClick={handleBulkResend}
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

      {/* QR Code Modal */}
      {modalQrCode && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={(e) => { e.stopPropagation(); setModalQrCode(null); }}>
          <div className="bg-white p-4 rounded-lg shadow-lg relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl" onClick={(e) => { e.stopPropagation(); setModalQrCode(null); }}>✕</button>
            <h3 className="text-lg font-medium text-center mb-4 mt-2">Visitor QR Code</h3>
            <img loading="lazy" decoding="async" src={modalQrCode} alt="Enlarged QR Code" className="w-64 h-64 object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralVisitorsList;
