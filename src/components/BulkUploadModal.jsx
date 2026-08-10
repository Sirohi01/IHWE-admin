import React, { useState, useRef } from "react";
import { Upload, X, FileSpreadsheet, Loader2, Download } from "lucide-react";
import api from "../lib/api";

const BulkUploadModal = ({ isOpen, onClose, uploadUrl, templatePath, title, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
        alert("Please select a valid Excel or CSV file.");
        return;
      }
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setUploadResult({
          type: "success",
          message: response.data.message || "Upload successful!",
          errors: response.data.errors || []
        });
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
          setFile(null);
          setUploadResult(null);
        }, 3000);
      } else {
        setUploadResult({
          type: "error",
          message: response.data.message || "Upload failed."
        });
      }
    } catch (error) {
      setUploadResult({
        type: "error",
        message: error.response?.data?.message || "An error occurred during upload."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // You should place the template files in the public directory of your React app
    // e.g. /public/templates/GeneralVisitorTemplate.xlsx
    const a = document.createElement('a');
    a.href = templatePath;
    a.download = templatePath.split('/').pop();
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-600" />
            {title || "Bulk Upload"}
          </h3>
          <button
            onClick={() => {
              if (!isUploading) {
                onClose();
                setFile(null);
                setUploadResult(null);
              }
            }}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
            <FileSpreadsheet className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800">
              <p className="font-semibold mb-1">Upload Instructions</p>
              <p>Please download the template, fill it out exactly as shown, and upload it here. Ensure all mandatory fields are provided.</p>
              <button 
                onClick={handleDownloadTemplate}
                className="mt-2 text-blue-700 font-bold hover:underline flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Download Template
              </button>
            </div>
          </div>

          <div 
            className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              className="hidden"
            />
            
            {file ? (
              <div className="flex flex-col items-center text-center">
                <FileSpreadsheet className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-sm font-semibold text-slate-700">{file.name}</p>
                <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                <button className="text-xs font-bold text-red-500 mt-3 hover:underline" onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setUploadResult(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}>
                  Remove File
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Click to select file</p>
                <p className="text-xs text-slate-500 mt-1">Excel or CSV only</p>
              </div>
            )}
          </div>

          {uploadResult && (
            <div className={`p-3 rounded-lg text-xs ${uploadResult.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              <p className="font-bold">{uploadResult.message}</p>
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <ul className="mt-2 list-disc pl-4 max-h-24 overflow-y-auto">
                  {uploadResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
          <button
            onClick={() => {
              onClose();
              setFile(null);
              setUploadResult(null);
            }}
            disabled={isUploading}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                Upload Visitors
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
