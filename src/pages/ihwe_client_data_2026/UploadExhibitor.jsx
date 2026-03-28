import React, { useState } from "react";
import { FaFileExcel } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const UploadExhibitor = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = () => {
    if (!file) {
      alert("Please choose a CSV file first!");
      return;
    }
    console.log("Importing:", file.name);
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
    <div className="w-full min-h-screen bg-gray-100">
      <div className="w-full h-fit bg-white shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-4 py-1.5">
          <h1 className="text-xl text-gray-500 mb-2 lg:mb-0">
            COMPANY DETAILS
          </h1>
          <div className="flex flex-wrap gap-2 cursor-pointer">
            <button
              onClick={handleMasterList}
              className="px-3 py-1 text-xs bg-[#3598dc] hover:bg-[#286090] text-white transition-colors"
            >
              Master List
            </button>
            <button
              onClick={handleConformList}
              className="px-3 py-1 text-xs bg-[#3598dc] hover:bg-[#286090] text-white transition-colors"
            >
              Exhibitor List
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-full bg-white shadow-md rounded-md p-6 m-4">
          <h2 className="text-lg font-normal text-gray-800 mb-5">
            Upload Exhibitor Excel
          </h2>
          <div className="flex flex-col md:flex-row justify-between items-center border rounded-md p-5 bg-[#f9fafb]">
            <div className="flex flex-col gap-2 w-full md:w-3/4">
              <label className="text-sm font-medium text-gray-700">
                Upload CSV
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="border border-gray-300 px-2 py-1 text-sm w-full"
                />
                <button
                  onClick={handleImport}
                  className="px-4 py-1.5 bg-[#337ab7] hover:bg-[#286090] text-white text-sm font-medium transition-colors"
                >
                  Import
                </button>
              </div>
            </div>
            <button
              onClick={handleDownloadCSV}
              className="flex items-center justify-center gap-2 bg-[#a58d6f] hover:bg-[#8b745d] text-white px-6 py-3 mt-4 md:mt-0 transition-colors"
            >
              <FaFileExcel size={26} />
              <span className="text-sm font-semibold">CSV Format</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadExhibitor;
