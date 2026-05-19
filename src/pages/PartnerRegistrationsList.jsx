import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Handshake, FileText, CheckCircle, XCircle } from "lucide-react";
import api from "../lib/api";
import Globallytable from "../components/Globallytable";
import { showSuccess, showError } from "../utils/toastMessage";

const toTitleCase = (str) => {
  if (!str || typeof str !== "string") return str;
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

const PartnerRegistrationsList = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/partner-registration");
      if (response.data.success) {
        setRegistrations(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      showError("Failed to fetch registrations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingStatusId(id);
      const response = await api.patch(`/api/partner-registration/${id}/status`, { status: newStatus });
      if (response.data.success) {
        showSuccess("Status updated successfully");
        fetchRegistrations();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showError("Failed to update status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Table Columns
  const columns = [
    {
      label: "ID & Date",
      accessor: "registrationId",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 text-[13px]">{value || "N/A"}</span>
          <span className="text-gray-400 text-[10px]">{row.date}</span>
        </div>
      ),
    },
    {
      label: "Company Details",
      accessor: "companyName",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700 text-[13px]">{value}</span>
          <span className="text-[#d26019] text-[10px] font-bold uppercase">{row.category}</span>
          {row.website && (
            <a
              href={row.website.startsWith("http") ? row.website : `https://${row.website}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 hover:underline text-[10px]"
            >
              {row.website}
            </a>
          )}
        </div>
      ),
    },
    {
      label: "Contact Person",
      accessor: "contactName",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-600 text-[12px]">{value}</span>
          <span className="text-gray-400 text-[10px]">{row.designation}</span>
          <span className="text-gray-500 text-[10px]">{row.email}</span>
        </div>
      ),
    },
    {
      label: "Contact Numbers",
      accessor: "mobile",
      render: (value, row) => (
        <div className="flex flex-col text-[11px] text-slate-600">
          <span>Mob: {value}</span>
          {row.whatsapp && <span className="text-green-600 font-medium">WA: {row.whatsapp}</span>}
        </div>
      ),
    },
    {
      label: "Services Offered",
      accessor: "services",
      render: (value) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {value && value.length > 0 ? (
            value.map((s, idx) => (
              <span
                key={idx}
                className="inline-block px-1.5 py-0.5 bg-green-50 text-green-700 text-[9px] font-semibold rounded border border-green-100"
              >
                {s}
              </span>
            ))
          ) : (
            <span className="text-gray-400 italic text-[10px]">None specified</span>
          )}
        </div>
      ),
    },
    {
      label: "Status",
      accessor: "status.current",
      render: (value, row) => (
        <div className="relative inline-block">
          <select
            value={value}
            onChange={(e) => handleStatusChange(row.id, e.target.value)}
            disabled={updatingStatusId === row.id}
            className={`px-3 py-1 text-[10px] font-bold rounded-full border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pr-8 uppercase tracking-wider ${
              value === "Accepted"
                ? "bg-green-100 text-green-800"
                : value === "Rejected"
                ? "bg-red-100 text-red-800"
                : value === "Reviewed"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
          {updatingStatusId === row.id && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      ),
    },
    {
      label: "Actions",
      accessor: "actions",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {row.companyProfile && (
            <a
              href={`${SERVER_URL}${row.companyProfile}`}
              target="_blank"
              rel="noreferrer"
              className="p-1 text-green-600 hover:bg-green-50 rounded"
              title="Download/View Company Profile"
            >
              <FileText className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => navigate(`/partner-registrations/${row.id}`)}
            className="text-blue-600 hover:text-blue-900 p-1"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const rows = registrations.map((r) => ({
    id: r._id,
    checkbox: true,
    registrationId: r.registrationId,
    date: new Date(r.createdAt).toLocaleDateString(),
    companyName: toTitleCase(r.companyName),
    category: r.businessCategory,
    website: r.website,
    contactName: toTitleCase(r.fullName),
    designation: r.designation,
    email: r.email,
    mobile: r.mobile,
    whatsapp: r.whatsapp,
    services: r.selectedServices,
    status: {
      current: r.status || "Pending",
    },
    companyProfile: r.companyProfilePath,
    actions: "",
  }));

  const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

  return (
    <>
      {/* Banner */}
      <div className="relative w-full h-48 overflow-hidden rounded mt-8">
        <img
          src="/dashbordBan.png"
          alt="Partner Registrations Banner"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-6">
          <Handshake className="w-12 h-12 mb-2 text-green-400" />
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-center">
            Service Partner Registrations
          </h1>
          <p className="text-sm mt-1 text-center text-white/90">
            Review and manage registrations for IHWE 2026 Service Partners
          </p>
        </div>
      </div>

      <div className="w-full h-auto bg-[#eef1f5]">
        <div className="flex flex-col lg:flex-row justify-between items-center py-3 px-6 border-b border-gray-300 bg-white gap-4">
          <h1 className="text-md font-bold text-slate-600 uppercase tracking-tight leading-none text-center lg:text-left">
            PARTNER REGISTRATIONS | Management Section
          </h1>
        </div>

        <div className="bg-white m-4 p-2 rounded shadow-sm">
          <div className="flex justify-between items-center pr-4">
            <h1 className="text-base font-semibold text-gray-800 px-4 uppercase">
              Registered Service Partners
            </h1>
            <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
              {registrations.length} TOTAL
            </span>
          </div>

          <hr className="opacity-10 my-2" />

          <div className="text-xs">
            {isLoading ? (
              <div className="text-center text-gray-500 py-10">
                <div className="w-8 h-8 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                Loading Partner Registrations...
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-20 text-gray-400 italic bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 m-4">
                No partner registrations found in the database.
              </div>
            ) : (
              <Globallytable rows={rows} colomns={columns} style={{ marginTop: "20px" }} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PartnerRegistrationsList;
