import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCompanies } from "../../features/company/companySlice";
import EstimateTable from "./EstimateTable";
import { Upload, UserCheck, LayoutGrid } from "lucide-react";

const AccountSection1 = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const location = useLocation();

  // Redux state for companies (assuming this is how you manage client data)
  const { companies, loading } = useSelector((state) => state.companies);
  const [company, setCompany] = useState(null);

  // 1. Fetch company data if not already present in Redux
  useEffect(() => {
    if (companies.length === 0) {
      dispatch(fetchCompanies());
    }
  }, [dispatch, companies.length]);

  // 2. Find the specific company based on the ID from the URL
  useEffect(() => {
    if (companies.length > 0 && id) {
      const matchedCompany = companies.find((c) => c._id === id);
      setCompany(matchedCompany);
    }
  }, [companies, id]);

  // Use companyName from state (if passed) or from fetched company data
  let companyName = "Loading Company...";

  // Get company name from state if possible (passed from ClientOverview1)
  const stateCompanyName = location.state?.heading?.companyName;
  if (stateCompanyName) {
    companyName = stateCompanyName;
  }

  // Or use the name from the fetched company object
  if (company) {
    companyName = company.companyName || companyName;
  }

  if (loading) return <p>Loading client data...</p>;
  if (!id) return <p>Error: Client ID is missing in the URL.</p>;
  // if (!company) return <p>No client found with ID: {id}</p>; // Optional: show if company isn't found

  return (
    <div className="w-full h-auto bg-[#eef1f5] min-h-screen mt-8">
      {/* Header Section */}

      <div className="flex flex-col lg:flex-row justify-between items-center py-3 px-6 border-b border-gray-300 bg-white gap-4">
        <div className="flex flex-col items-center lg:items-start gap-1">
          <h1 className="text-xl font-semibold text-slate-600 uppercase tracking-tight leading-none text-center lg:text-left">
            ACCOUNT SECTION - ESTIMATE | Sales Management Section
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

      {/* Company Info & Action Buttons */}
      <div className="bg-white  m-5 pb-5">
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-2">
          {/* Display the dynamically retrieved company name */}
          <h2 className="text-xl text-gray-700 ">
            {companyName}. Information
          </h2>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() =>
                navigate(`/ihweClientData2026/createEstimate1/${company._id}`)
              }
              className="bg-hover:bg-gray-200 border border-gray-600  text-gray-600 px-4 py-1  text-base font-normal cursor-pointer"
            >
              Create Estimate
            </button>
            <button
              onClick={() => navigate(`/ihweClientData2026/payments/${id}`)}
              className="hover:bg-gray-200 border border-gray-600  text-gray-600 px-4 py-1  text-base font-normal cursor-pointer"
            >
              Payments
            </button>
          </div>
        </div>
        <hr className="opacity-10 " />

        {/* Estimate Table - Pass company ID for data fetching */}

        <EstimateTable clientId={id} />
      </div>
    </div>
  );
};

export default AccountSection1;
