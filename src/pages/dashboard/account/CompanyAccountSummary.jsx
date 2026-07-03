import React, { useEffect, useState } from "react";
import { Mail, Phone, User, FileText, Receipt, Wallet, Briefcase } from "lucide-react";
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

const BreakdownList = ({ items, emptyText, isRemaining = false }) => {
  if (!items || items.length === 0) return <div className="text-[10px] text-gray-400 p-2 text-center">{emptyText || "No data available"}</div>;
  return (
    <div className="max-h-40 overflow-y-auto w-full p-2 space-y-1.5 thin-scrollbar">
      {items.map((item, idx) => (
        <div key={idx} className="flex justify-between items-center text-[10px] border-b border-gray-50 pb-1 last:border-0 last:pb-0">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-slate-700">{item.no}</span>
            <span className="text-[9px] text-slate-400 leading-none">{item.type} {item.forNo ? `(${item.forNo})` : ''}</span>
          </div>
          <span className="font-bold text-slate-800 text-right">{formatCurrency(isRemaining ? (item.remainingAmount || item.amount) : item.amount)}</span>
        </div>
      ))}
    </div>
  );
};

const CompanyAccountSummary = ({ companyInfo, financials }) => {
  const total = financials?.totalDue || 1;
  const paidPct = (((financials?.paidAmount || 0) / total) * 100).toFixed(2);
  const balPct = (((financials?.remainingBalance || 0) / total) * 100).toFixed(2);
  const statusClass = STATUS_COLORS[companyInfo?.statusColor] || STATUS_COLORS.gray;
  const invoiceCount = financials?.activeInvoiceCount ?? financials?.invoiceCount ?? 0;
  const proformaInvoiceCount = financials?.activeProformaInvoiceCount ?? financials?.proformaInvoiceCount ?? 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-2 mb-1">
      {/* Company Info Card */}
      <div className="xl:col-span-7 bg-white rounded-lg shadow-[rgba(67,71,85,0.18)_0px_0px_0.25em,rgba(90,125,188,0.05)_0px_0.25em_1em] border border-gray-100 p-3 flex flex-col md:flex-row gap-4 items-center md:items-start">
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
              <a href={`mailto:${companyInfo?.email}`} className="truncate hover:text-[#194090] hover:underline">{companyInfo?.email}</a>
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
            <div className="flex items-center gap-2 sm:col-span-1">
              <Briefcase size={15} className="text-[#194090]" />
              <span className="truncate">Designation: {companyInfo?.designation || "N/A"}</span>
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

      {/* Financial Cards */}
      <div className="xl:col-span-5 grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Card 1: Total Amount */}
        <div className="group relative bg-white rounded-xl shadow-sm border border-gray-200/60 hover:shadow-md hover:border-red-200 transition-all duration-300 p-3.5 flex flex-col justify-between h-full">
          <div className="absolute left-0 top-0 w-1 h-full bg-red-500 rounded-l-xl" />
          
          <div className="flex justify-between items-start ml-1 relative z-10 mb-2">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Total Amount</p>
              <h3 className="text-[18px] font-bold text-[#1a2b4b] tracking-tight leading-none whitespace-nowrap mt-1">{formatCurrency(financials?.totalDue)}</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 shrink-0">
              <FileText size={16} />
            </div>
          </div>

          <div className="ml-1 relative z-10 my-auto">
            <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">Proforma Invoices</span>
            <p className="text-[13px] font-bold text-[#1a2b4b] mt-0.5">{proformaInvoiceCount} Invoices</p>
          </div>

          <div className="pt-2 border-t border-gray-50 ml-1 relative z-10 flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-500">Overdue Amount</span>
            <span className="inline-flex items-center px-2 py-1 rounded text-[12px] font-bold bg-red-50 text-red-600 w-fit tracking-tight">
              {formatCurrency(financials?.remainingBalance)}
            </span>
          </div>

          <div className="absolute top-[100%] left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60]">
            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg">
              <span className="text-[10px] font-bold text-slate-600 uppercase">Amount Breakdown</span>
            </div>
            <BreakdownList items={financials?.dueBreakdown} emptyText="No invoices found" />
          </div>
        </div>

        {/* Card 2: Received Amount */}
        <div className="group relative bg-white rounded-xl shadow-sm border border-gray-200/60 hover:shadow-md hover:border-emerald-200 transition-all duration-300 p-3.5 flex flex-col justify-between h-full">
          <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500 rounded-l-xl" />
          
          <div className="flex justify-between items-start ml-1 relative z-10 mb-2">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Received Amount</p>
              <h3 className="text-[18px] font-bold text-[#1a2b4b] tracking-tight leading-none whitespace-nowrap mt-1">{formatCurrency(financials?.paidAmount)}</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
              <Receipt size={16} />
            </div>
          </div>

          <div className="ml-1 relative z-10 my-auto">
            <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">Total Invoices</span>
            <p className="text-[13px] font-bold text-[#1a2b4b] mt-0.5">{invoiceCount} Invoices</p>
          </div>

          <div className="pt-2 border-t border-gray-50 ml-1 relative z-10 flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-500">Received %</span>
            <span className="inline-flex items-center px-2 py-1 rounded text-[12px] font-bold bg-emerald-50 text-emerald-600 w-fit tracking-tight">
              {paidPct}%
            </span>
          </div>

          <div className="absolute top-[100%] left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60]">
            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg">
              <span className="text-[10px] font-bold text-slate-600 uppercase">Payment Breakdown</span>
            </div>
            <BreakdownList items={financials?.paidBreakdown} emptyText="No payments found" />
          </div>
        </div>

        {/* Card 3: Pending Amount */}
        <div className="group relative bg-white rounded-xl shadow-sm border border-gray-200/60 hover:shadow-md hover:border-indigo-200 transition-all duration-300 p-3.5 flex flex-col justify-between h-full">
          <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500 rounded-l-xl" />
          
          <div className="flex justify-between items-start ml-1 relative z-10 mb-2">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Pending Amount</p>
              <h3 className="text-[18px] font-bold text-[#1a2b4b] tracking-tight leading-none whitespace-nowrap mt-1">{formatCurrency(financials?.remainingBalance)}</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
              <Wallet size={16} />
            </div>
          </div>

          <div className="ml-1 relative z-10 my-auto">
             <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">Pending %</span>
             <p className="text-[13px] font-bold text-[#1a2b4b] mt-0.5">{balPct}%</p>
          </div>

          <div className="pt-2 border-t border-gray-50 ml-1 relative z-10 flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-500">Total Amount</span>
            <span className="inline-flex items-center px-2 py-1 rounded text-[12px] font-bold bg-indigo-50 text-indigo-600 w-fit tracking-tight">
              {formatCurrency(financials?.totalDue)}
            </span>
          </div>

          <div className="absolute top-[100%] right-0 min-w-[200px] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60]">
            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg">
              <span className="text-[10px] font-bold text-slate-600 uppercase">Remaining Breakdown</span>
            </div>
            <BreakdownList items={financials?.remainingBreakdown} emptyText="No remaining balance" isRemaining={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyAccountSummary;
