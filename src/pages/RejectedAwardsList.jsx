import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Award, XCircle, List, CheckCircle } from "lucide-react";
import api from "../lib/api";
import Globallytable from "../components/Globallytable";
import { showError } from "../utils/toastMessage";

const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

const RejectedAwardsList = () => {
  const navigate = useNavigate();
  const [nominations, setNominations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNominations();
  }, []);

  const fetchNominations = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/awards-nomination');
      if (response.data.success) {
        setNominations(response.data.nominations);
      }
    } catch (error) {
      console.error('Error fetching nominations:', error);
      showError('Failed to fetch nominations');
    } finally {
      setIsLoading(false);
    }
  };

  // 📋 Table Columns
  const columns = [
    {
      label: "Rejected Nominee Name",
      accessor: "nominee.name",
      render: (value, row) => (
        <Link
          to={`/awards-nominations/${row.id}`}
          className="text-blue-500 hover:underline font-medium"
        >
          {value}
        </Link>
      ),
    },
    { label: "Applicant Type", accessor: "nominee.type" },
    { label: "Contact Person", accessor: "contact.person" },
    { label: "Contact Details", accessor: "contact.details" },
    { label: "Award Category", accessor: "award.category" },
    { label: "Location", accessor: "location" },
    { 
      label: "Status", 
      accessor: "status.current",
      render: (value) => (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          {value}
        </span>
      )
    },
    {
      label: "Actions",
      accessor: "actions",
      render: (value, row) => (
        <button
          onClick={() => navigate(`/awards-nominations/${row.id}`)}
          className="text-blue-600 hover:text-blue-900 p-1"
          title="View Details"
        >
          <Eye className="w-5 h-5" />
        </button>
      ),
    },
  ];

  // 🧱 Prepare Rows - Filter only Rejected nominations
  const rejectedNominations = nominations.filter(
    (nomination) => nomination.status === "Rejected"
  );

  const rows = rejectedNominations.map((n) => ({
    id: n._id,
    checkbox: true,
    nominee: {
      name: toTitleCase(n.fullName),
      type: n.applicantType,
    },
    contact: {
      person: toTitleCase(n.contactPersonName),
      details: `${n.mobile} | ${n.email}`,
    },
    award: {
      category: n.awardCategory,
    },
    location: [n.city, n.state].filter(Boolean).join(", "),
    status: {
      current: n.status,
    },
    actions: "",
  }));

  return (
    <>
      {/* Hero Banner */}
      <div className="relative w-full h-64 overflow-hidden rounded mt-8">
        {/* Background Image */}
        <img
          src="/dashbordBan.png"
          alt="Rejected Awards Banner"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        
        {/* Content */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-6">
          <XCircle className="w-16 h-16 mb-4" />
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-center">
            Rejected Awards
          </h1>
          <p className="text-lg mt-2 text-center text-white/90">
            View all rejected award applications
          </p>
        </div>
      </div>

      <div className="w-full h-auto bg-[#eef1f5]">
        {/* 🔹 Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center py-3 px-6 border-b border-gray-300 bg-white gap-4">
          <div className="flex flex-col items-center lg:items-start gap-1">
            <h1 className="text-xl font-semibold text-slate-600 uppercase tracking-tight leading-none text-center lg:text-left">
              REJECTED AWARDS | Awards Management Section
            </h1>
          </div>
          <div className="flex flex-wrap justify-center lg:justify-end gap-2 w-full lg:w-auto">
            <button 
              onClick={() => navigate("/awards-nominations")} 
              className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap"
            >
              <Award size={12} /> Award Nominations
            </button>
            <button 
              onClick={() => navigate("/approved-awards-list")} 
              className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap"
            >
              <CheckCircle size={12} /> Approved Awards
            </button>
            <button 
              onClick={() => navigate("/award-categories-manage")} 
              className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap"
            >
              <List size={12} /> Award Categories
            </button>
          </div>
        </div>

      {/* 🔹 Main Section */}
      <div className="bg-white m-4 p-2 rounded shadow-sm">
        <div className="flex justify-between items-center pr-4">
          <h1 className="text-lg font-medium text-gray-800 px-4">
            REJECTED AWARDS
          </h1>
        </div>

        <hr className="opacity-10 my-2" />

        {/* 🔹 Data Table */}
        <div className="text-xs">
          {isLoading ? (
            <div className="text-center text-gray-500 py-4">Loading...</div>
          ) : rejectedNominations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No rejected awards found
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
      </div>
    </>
  );
};

export default RejectedAwardsList;
