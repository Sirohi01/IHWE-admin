import React, { useState } from "react";
import {
  FaFileExcel,
  FaUpload,
  FaListAlt,
  FaCheckCircle,
  FaArrowLeft,
  FaCloudUploadAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { createActivityLogThunk } from "../../features/activityLog/activityLogSlice";
import { uploadCompaniesThunk } from "../../features/company/companySlice";
const UploadExhibitor = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const getUserInfo = () => {
    const admin = JSON.parse(sessionStorage.getItem("admin"));

    return {
      userId: admin?.admin_id,
      userName: admin?.admin_name,
    };
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    const allowedExtensions = ["csv", "xls", "xlsx"];

    const extension = selectedFile.name
      .split(".")
      .pop()
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      Swal.fire({
        icon: "error",
        title: "Invalid File",
        text: "Only CSV, XLS and XLSX files are allowed.",
        confirmButtonColor: "#23471d",
      });

      return;
    }

    setFile(selectedFile);
  };

const handleImport = async () => {
  if (!file) {
    Swal.fire({
      title: "No File Selected",
      text: "Please select a file first.",
      icon: "warning",
      confirmButtonColor: "#23471d",
    });
    return;
  }

  try {
    setUploading(true);

    const { userId } = getUserInfo();

    // Activity Log
    dispatch(
      createActivityLogThunk({
        user_id: userId,
        message: `Company Import Started (${file.name})`,
        section: "Company Import",
        data: {
          action: "import",
          fileName: file.name,
        },
      })
    );

    // Upload Excel
    const result = await dispatch(
      uploadCompaniesThunk(file)
    ).unwrap();

    // Success Log
    dispatch(
      createActivityLogThunk({
        user_id: userId,
        message: `Company Import Completed (${file.name})`,
        section: "Company Import",
        data: result,
      })
    );

    Swal.fire({
      icon: "success",
      title: "Import Completed",
      html: `
        <div style="text-align:left">
          <p><b>Total Processed:</b> ${
            result.totalProcessed || 0
          }</p>
          <p><b>Inserted:</b> ${
            result.inserted || 0
          }</p>
          <p><b>Updated:</b> ${
            result.updated || 0
          }</p>
        </div>
      `,
      confirmButtonColor: "#23471d",
    });

    setFile(null);

    // File input reset
    const fileInput =
      document.getElementById("upload-file");
    if (fileInput) {
      fileInput.value = "";
    }
  } catch (error) {
    console.error("Upload Error:", error);

    Swal.fire({
      icon: "error",
      title: "Upload Failed",
      text:
        error ||
        "Something went wrong while importing data.",
      confirmButtonColor: "#23471d",
    });
  } finally {
    setUploading(false);
  }
};

  const handleMasterList = () => {
    navigate("/ihweClientData2026/masterData");
  };

  const handleConformList = () => {
    navigate("/ihweClientData2026/confirmClientList");
  };

  const handleDownloadCSV = () => {
    const sampleCSV = `companyName,category,businessNature,address,country,state,city,clientType,pincode,website,landline,email,dataSource,eventName,companyStatus,added_by,udyamNumber,gstNumber,contactTitle,contactFirstName,contactSurname,contactDesignation,contactEmail,contactMobile,contactAlternate`;

    const blob = new Blob([sampleCSV], {
      type: "text/csv",
    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "company_import_template.csv";
    link.click();
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm px-6 py-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 uppercase">
              Company Data Import
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Upload Excel or CSV files to import company and
              exhibitor records.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                navigate("/ihweClientData2026/addNewClients")
              }
              className="px-4 py-2 bg-[#d26019] hover:bg-orange-700 text-white rounded-md text-sm font-medium flex items-center gap-2"
            >
              <FaArrowLeft />
              Back
            </button>

            <button
              onClick={handleMasterList}
              className="px-4 py-2 bg-[#3598dc] hover:bg-[#286090] text-white rounded-md text-sm font-medium flex items-center gap-2"
            >
              <FaListAlt />
              Master List
            </button>

            <button
              onClick={handleConformList}
              className="px-4 py-2 bg-[#3598dc] hover:bg-[#286090] text-white rounded-md text-sm font-medium flex items-center gap-2"
            >
              <FaCheckCircle />
              Exhibitor List
            </button>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="mt-6 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <FaFileExcel className="text-green-600" />
            Import Company Records
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Upload CSV, XLS or XLSX files. Duplicate companies
            and contacts will be automatically merged.
          </p>
        </div>

        <div className="p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Upload Area */}
            <div className="lg:col-span-2">
              <label
                htmlFor="upload-file"
                className="group cursor-pointer flex flex-col items-center justify-center h-[280px] border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-green-50 hover:border-[#23471d] transition-all"
              >
                <FaCloudUploadAlt
                  size={55}
                  className="text-slate-400 group-hover:text-[#23471d] transition-all"
                />

                <h3 className="mt-4 text-lg font-semibold text-slate-700">
                  Upload Excel / CSV File
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Drag & Drop or Click to Browse
                </p>

                <p className="text-xs text-slate-400 mt-2">
                  Supported formats: CSV, XLS, XLSX
                </p>

                <input
                  id="upload-file"
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {file && (
                <div className="mt-4 border border-green-200 bg-green-50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-green-800">
                      {file.name}
                    </h4>

                    <p className="text-xs text-green-600">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>

                  <FaCheckCircle
                    size={24}
                    className="text-green-600"
                  />
                </div>
              )}
            </div>

            {/* Side Panel */}
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
                <h3 className="font-semibold text-slate-800">
                  Download Template
                </h3>

                <p className="text-sm text-slate-500 mt-2">
                  Use the official format to ensure successful
                  imports.
                </p>

                <button
                  onClick={handleDownloadCSV}
                  className="mt-4 w-full bg-[#a58d6f] hover:bg-[#8b745d] text-white py-3 rounded-md font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <FaFileExcel />
                  Download Template
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="font-semibold text-slate-800">
                  Import Data
                </h3>

                <p className="text-sm text-slate-500 mt-2">
                  Start importing company and contact records.
                </p>

                <button
                  onClick={handleImport}
                  disabled={!file || uploading}
                  className={`mt-4 w-full py-3 rounded-md font-semibold flex items-center justify-center gap-2 transition-all ${
                    file && !uploading
                      ? "bg-[#23471d] hover:bg-[#1a3516] text-white"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <FaUpload />

                  {uploading
                    ? "Uploading..."
                    : "Import Records"}
                </button>
              </div>

              <div className="border border-blue-100 bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900">
                  Import Notes
                </h4>

                <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc pl-4">
                  <li>Only CSV, XLS and XLSX files allowed.</li>
                  <li>Company Name is mandatory.</li>
                  <li>Duplicate companies are merged.</li>
                  <li>Duplicate contacts are ignored.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 flex items-center justify-center gap-3 opacity-50">
        <div className="h-px w-16 bg-slate-300"></div>

        <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-slate-600">
          IHWE Admin Import Portal
        </span>

        <div className="h-px w-16 bg-slate-300"></div>
      </div>
    </div>
  );
};

export default UploadExhibitor;