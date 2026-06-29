import React, { useEffect, useState } from "react";
import { Mail, Phone, User, FileText, Receipt, Wallet } from "lucide-react";
import api, { SERVER_URL } from "../../../lib/api";

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const getMediaUrl = (value) => {
  if (!value) return "";
  const normalized = String(value).replace(/\\/g, "/");
  if (normalized.startsWith("blob:") || normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }
  const uploadsIndex = normalized.indexOf("/uploads/");
  if (uploadsIndex >= 0) return `${SERVER_URL}${normalized.slice(uploadsIndex)}`;
  const relativeUploadsIndex = normalized.indexOf("uploads/");
  if (relativeUploadsIndex >= 0) return `${SERVER_URL}/${normalized.slice(relativeUploadsIndex)}`;
  if (normalized.startsWith("/uploads/")) return `${SERVER_URL}${normalized}`;
  if (normalized.startsWith("uploads/")) return `${SERVER_URL}/${normalized}`;
  return `${SERVER_URL}/${normalized.replace(/^\/+/, "")}`;
};

const STATUS_COLORS = {
  green: "bg-[#e6f7ec] text-[#00a86b]",
  blue: "bg-[#e6f0fa] text-[#194090]",
  amber: "bg-[#fff7ed] text-[#ea580c]",
  red: "bg-[#ffebee] text-[#ff4d4f]",
  gray: "bg-gray-100 text-gray-600",
};

const CompanyLogo = ({ logo, name }) => {
  const [logoSrc, setLogoSrc] = useState("");

  useEffect(() => {
    let objectUrl = "";
    if (!logo) {
      setLogoSrc("");
      return;
    }
    const mediaUrl = getMediaUrl(logo);
    if (!mediaUrl || mediaUrl.startsWith("blob:")) {
      setLogoSrc(mediaUrl);
      return;
    }
    api
      .get(mediaUrl, { responseType: "blob" })
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data);
        setLogoSrc(objectUrl);
      })
      .catch(() => setLogoSrc(mediaUrl));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [logo]);

  if (logoSrc) {
    return (
      <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-white">
        <img src={logoSrc} alt={name || "Company logo"} className="w-full h-full object-contain" />
      </div>
    );
  }

  return (
    <div className="w-24 h-24 bg-[#f0fff9] rounded-xl flex items-center justify-center text-[#00b087] font-black text-lg leading-tight text-center border border-[#e0f8f1] shrink-0 p-2">
      {(name || "").split(" ").slice(0, 3).join("\n").toUpperCase()}
    </div>
  );
};

const CompanyAccountSummary = ({ companyInfo, financials }) => {
  const total = financials?.totalDue || 1;
  const paidPct = (((financials?.paidAmount || 0) / total) * 100).toFixed(2);
  const balPct = (((financials?.remainingBalance || 0) / total) * 100).toFixed(2);
  const statusClass = STATUS_COLORS[companyInfo?.statusColor] || STATUS_COLORS.gray;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-2 mb-1">
      {/* Company Info Card */}
      <div className="xl:col-span-7 bg-white rounded-lg shadow-[rgba(67,71,85,0.18)_0px_0px_0.25em,rgba(90,125,188,0.05)_0px_0.25em_1em] border border-gray-100 p-4 flex flex-col md:flex-row gap-4 items-center md:items-start">
        <CompanyLogo logo={companyInfo?.logo} name={companyInfo?.name} />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[18px] font-bold text-[#1a2b4b]">{companyInfo?.name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
              {companyInfo?.statusLabel || "Lead"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-[13px] text-slate-600">
            <div className="flex items-center gap-2">
              <Mail size={15} className="text-[#194090]" />
              <span className="truncate">{companyInfo?.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700 whitespace-nowrap">Stall No.</span>
              <span>{companyInfo?.stallNo}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={15} className="text-[#194090]" />
              <span>{companyInfo?.mobile}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700 whitespace-nowrap">Stall Size</span>
              <span>{companyInfo?.stallSize}</span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-1">
              <User size={15} className="text-[#194090]" />
              <span className="truncate">Contact Person: {companyInfo?.contactPerson}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700 whitespace-nowrap">Category</span>
              <span className="truncate">{companyInfo?.category}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:col-start-2">
              <span className="font-semibold text-slate-700 whitespace-nowrap">Registration Date</span>
              <span>
                {companyInfo?.registrationDate
                  ? new Date(companyInfo.registrationDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Cards - stretched to match the company card's height */}
      <div className="xl:col-span-5 grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-white rounded-lg shadow-[rgba(67,71,85,0.18)_0px_0px_0.25em,rgba(90,125,188,0.05)_0px_0.25em_1em] border border-gray-100 p-4 flex flex-col h-full">
          <div className="w-12 h-12 mb-6 bg-[#ffebee] rounded-lg flex items-center justify-center">
            <FileText size={28} className="text-[#ff4d4f]" />
          </div>
          <div>
            <h3 className="text-[12px] font-bold text-[#1a2b4b] mb-0.5">Total Due</h3>
            <div className="text-[15px] font-medium text-[#ff4d4f] mb-1.5 leading-tight">{formatCurrency(financials?.totalDue)}</div>
            <span className="inline-flex px-2 py-0.5 bg-[#ffebee] text-[#ff4d4f] rounded text-[11px] font-medium">
              {financials?.remainingBalance > 0 ? "Overdue" : "Fully Billed"}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-[rgba(67,71,85,0.18)_0px_0px_0.25em,rgba(90,125,188,0.05)_0px_0.25em_1em] border border-gray-100 p-4 flex flex-col h-full">
          <div className="w-12 h-12 mb-6 bg-[#e6f7ec] rounded-lg flex items-center justify-center">
            <Receipt size={28} className="text-[#00a86b]" />
          </div>
          <div>
            <h3 className="text-[12px] font-bold text-[#1a2b4b] mb-0.5">Paid Amount</h3>
            <div className="text-[15px] font-medium text-[#00a86b] mb-1.5 leading-tight">{formatCurrency(financials?.paidAmount)}</div>
            <span className="inline-flex px-2 py-0.5 bg-[#e6f7ec] text-[#00a86b] rounded text-[11px] font-medium">
              Paid ({paidPct}%)
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-[rgba(67,71,85,0.18)_0px_0px_0.25em,rgba(90,125,188,0.05)_0px_0.25em_1em] border border-gray-100 p-4 flex flex-col h-full">
          <div className="w-12 h-12 mb-6 bg-[#e6f0fa] rounded-lg flex items-center justify-center">
            <Wallet size={28} className="text-[#194090]" />
          </div>
          <div>
            <h3 className="text-[12px] font-bold text-[#1a2b4b] mb-0.5">Remaining Balance</h3>
            <div className="text-[15px] font-medium text-[#194090] mb-1.5 leading-tight">{formatCurrency(financials?.remainingBalance)}</div>
            <span className="inline-flex px-2 py-0.5 bg-[#e6f0fa] text-[#194090] rounded text-[11px] font-medium">
              Balance ({balPct}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyAccountSummary;
