import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Users, CheckCircle, List, XCircle, Building, Briefcase, Mail, Phone, FileText } from "lucide-react";
import api from "../lib/api";
import Globallytable from "../components/Globallytable";
import { showSuccess, showError } from "../utils/toastMessage";

const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

const AdvisoryNominationsList = () => {
  const navigate = useNavigate();
  const [nominations, setNominations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  useEffect(() => {
    fetchNominations();
  }, []);

  const fetchNominations = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/advisory-nomination');
      if (response.data.success) {
        setNominations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching nominations:', error);
      showError('Failed to fetch nominations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingStatusId(id);
      const response = await api.patch(`/api/advisory-nomination/${id}/status`, { status: newStatus });
      if (response.data.success) {
        showSuccess('Status updated successfully');
        fetchNominations();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Failed to update status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // 📋 Table Columns
  const columns = [
    {
      label: "Nominee Details",
      accessor: "nominee.name",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700 text-[13px]">{value}</span>
          <span className="text-[#d26019] text-[10px] font-bold uppercase">{row.nominee.designation}</span>
          <span className="text-gray-500 text-[10px]">{row.nominee.organization}</span>
        </div>
      ),
    },
    {
      label: "Expertise",
      accessor: "expertise",
      render: (value) => (
        <span className="inline-flex items-center px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded border border-green-100">
          {value}
        </span>
      )
    },
    {
      label: "Nominator",
      accessor: "nominator.name",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-600 text-[11px]">{value}</span>
          <span className="text-gray-400 text-[9px]">{row.nominator.org}</span>
        </div>
      )
    },
    {
      label: "Verification",
      accessor: "verification",
      render: (_, row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${row.verify.nomineeEmail ? 'bg-green-500' : 'bg-red-400'}`}></span>
            <span className="text-[9px] text-gray-500">Nominee Email</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${row.verify.nominatorEmail ? 'bg-green-500' : 'bg-red-400'}`}></span>
            <span className="text-[9px] text-gray-500">Nominator Email</span>
          </div>
        </div>
      )
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
              value === 'Approved' ? 'bg-green-100 text-green-800' :
              value === 'Rejected' ? 'bg-red-100 text-red-800' :
              value === 'Under Review' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}
          >
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          {updatingStatusId === row.id && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      )
    },
    {
      label: "Actions",
      accessor: "actions",
      render: (value, row) => (
        <div className="flex items-center gap-2">
           {row.cv && (
             <a href={`${SERVER_URL}${row.cv}`} target="_blank" rel="noreferrer" className="p-1 text-green-600 hover:bg-green-50 rounded" title="Download CV">
               <FileText className="w-4 h-4" />
             </a>
           )}
           <button
            onClick={() => navigate(`/advisory-nominations/${row.id}`)}
            className="text-blue-600 hover:text-blue-900 p-1"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const rows = nominations.map((n) => ({
    id: n._id,
    checkbox: true,
    nominee: {
      name: toTitleCase(n.fullName),
      designation: n.designation,
      organization: n.organization,
    },
    expertise: n.areasOfExpertise,
    nominator: {
      name: toTitleCase(n.nominatorName),
      org: n.nominatorOrg,
    },
    verify: {
      nomineeEmail: n.otpVerifiedEmail,
      nomineeMobile: n.otpVerifiedMobile,
      nominatorEmail: n.nominatorOtpVerifiedEmail,
      nominatorMobile: n.nominatorOtpVerifiedMobile,
    },
    status: {
      current: n.status || 'Pending',
    },
    cv: n.cvPath,
    actions: "",
  }));

  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

  return (
    <>
      {/* Hero Banner */}
      <div className="relative w-full h-64 overflow-hidden rounded mt-8">
        <img
          src="/dashbordBan.png"
          alt="Advisory Nominations Banner"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-6">
          <Users className="w-16 h-16 mb-4" />
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-center">
            Advisory Board Nominations
          </h1>
          <p className="text-lg mt-2 text-center text-white/90">
            Review and manage nominations for the IHWE 2026 Advisory Board
          </p>
        </div>
      </div>

      <div className="w-full h-auto bg-[#eef1f5]">
        <div className="flex flex-col lg:flex-row justify-between items-center py-3 px-6 border-b border-gray-300 bg-white gap-4">
          <div className="flex flex-col items-center lg:items-start gap-1">
            <h1 className="text-xl font-semibold text-slate-600 uppercase tracking-tight leading-none text-center lg:text-left">
              ADVISORY NOMINATIONS | Board Management Section
            </h1>
          </div>
          <div className="flex flex-wrap justify-center lg:justify-end gap-2 w-full lg:w-auto">
            <button 
              onClick={() => navigate("/advisory-manage")} 
              className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#23471d] hover:bg-[#1a3615] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap"
            >
              <Users size={12} /> Manage Members
            </button>
          </div>
        </div>

        <div className="bg-white m-4 p-2 rounded shadow-sm">
          <div className="flex justify-between items-center pr-4">
            <h1 className="text-lg font-medium text-gray-800 px-4">
              PENDING NOMINATIONS
            </h1>
            <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
                {nominations.length} TOTAL
            </span>
          </div>

          <hr className="opacity-10 my-2" />

          <div className="text-xs">
            {isLoading ? (
              <div className="text-center text-gray-500 py-10">
                <div className="w-10 h-10 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                Loading Nominations...
              </div>
            ) : nominations.length === 0 ? (
                <div className="text-center py-20 text-gray-400 italic bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 m-4">
                    No nominations found in the database.
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

export default AdvisoryNominationsList;
