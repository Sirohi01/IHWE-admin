import React, { useRef } from "react";
import { MdOutlineModeEdit } from "react-icons/md";
import { FaPrint } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";
// import InvoiceForm from '../InvoiceForm';
import EstimateFormDetail from "./EstimateFormDetail";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Upload, UserCheck, LayoutGrid } from "lucide-react";

const EstimateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const sameRef = useRef();

  const handleprint = useReactToPrint({
    contentRef: sameRef,
    documentTitle: "invoice",
  });

  return (
    <>
      <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-inter animate-fadeIn">

        {/* ── HEADER AREA ── */}
        <div className="flex flex-col lg:flex-row justify-between items-center pb-4 border-b border-gray-300 gap-4">
          <div className="flex flex-col items-center lg:items-start gap-1">
            <h1 className="text-xl font-semibold text-slate-600 uppercase tracking-tight leading-none text-center lg:text-left">
              ESTIMATE | Sales Management Section
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
            <Link to={`/payments/estimateEdit/${id}`}>
              <button className="w-fit h-fit border border-[#3598dc] text-[#3598dc] text-[12px] hover:text-white hover:bg-[#3598dc] px-2 py-1  cursor-pointer">
                <MdOutlineModeEdit size={15} />
              </button>
            </Link>
            <button
              onClick={handleprint}
              className="w-fit h-fit border border-[#3598dc] text-[#3598dc] text-[12px] hover:text-white hover:bg-[#3598dc] px-2 py-1  cursor-pointer "
            >
              <FaPrint size={16} />
            </button>
          </div>
        </div>



        <div ref={sameRef}>
          <EstimateFormDetail />
        </div>
      </div>
    </>
  );
};

export default EstimateDetails;
