import React, { useState } from "react";
import { FaFileExcel, FaUpload, FaListAlt, FaCheckCircle, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createActivityLogThunk } from "../../features/activityLog/activityLogSlice";
import Swal from "sweetalert2";

const UploadExhibitor = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);

  const getUserInfo = () => {
    const admin = JSON.parse(sessionStorage.getItem("admin"));
    return { userId: admin?.admin_id, userName: admin?.admin_name };
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = () => {
    if (!file) {
      Swal.fire({
        title: "No File Selected",
        text: "Please choose a CSV file first!",
        icon: "warning",
        confirmButtonColor: "#23471d"
      });
      return;
    }
    const { userId } = getUserInfo();
    console.log("Importing:", file.name);
    
    dispatch(createActivityLogThunk({
      user_id: userId,
      message: `Client Data: Started CSV import for exhibitors (File: ${file.name})`,
      section: "Client Data",
      data: { action: "import", fileName: file.name }
    }));

    Swal.fire({
      title: "Import Started",
      text: `Processing file: ${file.name}`,
      icon: "success",
      confirmButtonColor: "#23471d"
    });
  };

  const handleMasterList = () => {
    navigate("/ihweClientData2026/masterData");
  };

  const handleConformList = () => {
    navigate("/ihweClientData2026/confirmClientList");
  };

  const handleDownloadCSV = () => {
    const sampleCSV = `Company Name,Category,Nature Of Business,Address,Country,State,City,Pin Code,Website,Landline No,Email Id,Data Source,Event Name,Reminder Date & Time,Forward To,Title,First Name,Sur Name,Designation,Email Id,Mobile No,Alternate No`;
    const blob = new Blob([sampleCSV], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sample_exhibitor_format.csv";
    link.click();
  };

  return (
    <div className="w-full min-h-screen bg-white shadow-md mt-6 p-6 font-inter animate-fadeIn">
      {/* ── HEADER AREA ── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-3 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-500 uppercase tracking-tight">
          COMPANY DETAILS
        </h1>
        <div className="flex flex-wrap gap-2 mt-2 lg:mt-0">
          <button
            onClick={() => navigate("/ihweClientData2026/addNewClients")}
            className="px-4 py-1.5 text-[11px] font-bold uppercase bg-[#d26019] hover:bg-orange-700 text-white transition-colors flex items-center gap-2 rounded-[2px]"
          >
            <FaArrowLeft size={10} /> Back
          </button>
          <button
            onClick={handleMasterList}
            className="px-4 py-1.5 text-[11px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center gap-2 rounded-[2px]"
          >
            <FaListAlt size={12} /> Master List
          </button>
          <button
            onClick={handleConformList}
            className="px-4 py-1.5 text-[11px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center gap-2 rounded-[2px]"
          >
            <FaCheckCircle size={12} /> Exhibitor List
          </button>
        </div>
      </div>

      {/* ── MAIN UPLOAD CARD ── */}
      <div className="mt-8 border border-slate-200 p-8 rounded-[2px] bg-white shadow-lg">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-wide">
          <FaFileExcel className="text-[#23471d]" />
          Upload Exhibitor Excel
        </h2>

        <div className="flex flex-col md:flex-row justify-between items-stretch border border-slate-200 rounded-[2px] p-8 bg-[#f8fafc] gap-6">
          {/* FILE SELECTION AREA */}
          <div className="flex flex-col gap-3 w-full md:w-3/4">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Upload CSV File *
            </label>
            <div className="flex items-stretch w-full max-w-2xl h-10 shadow-sm">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="flex-1 border border-slate-300 bg-white px-4 flex items-center text-sm text-slate-600 focus:outline-none rounded-l-[2px] cursor-pointer"
              />
              <button
                onClick={handleImport}
                className="px-8 bg-[#23471d] hover:bg-[#1a3516] text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-r-[2px] flex items-center gap-2 whitespace-nowrap"
              >
                <FaUpload /> Import Now
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-medium italic mt-1">
              Select only .csv files formatted according to our template.
            </p>
          </div>

          {/* TEMPLATE DOWNLOAD BOX */}
          <button
            onClick={handleDownloadCSV}
            className="flex flex-col items-center justify-center gap-3 bg-[#a58d6f] hover:bg-[#8b745d] text-white px-8 py-4 transition-all rounded-[2px] flex-shrink-0 group shadow-md"
          >
            <FaFileExcel size={30} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">CSV Format</span>
          </button>
        </div>
      </div>

      {/* SECURE FOOTER INDICATOR */}
      <div className="mt-12 flex items-center justify-center gap-2 opacity-40">
        <div className="h-[1px] w-12 bg-slate-200"></div>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-700">
          Admin Data Processing Portal
        </p>
        <div className="h-[1px] w-12 bg-slate-200"></div>
      </div>
    </div>
  );
};

export default UploadExhibitor;
