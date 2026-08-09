import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  X,
  Copy,
  Landmark,
  QrCode,
  MessageCircleMore,
  Mail,
  Download,
  Printer,
} from "lucide-react";
import { SERVER_URL } from "../lib/api";

const copyText = async (text, label) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  } catch {
    toast.error("Could not copy to clipboard");
  }
};

const DetailRow = ({ label, value, copyable }) => (
  <div className="flex items-center justify-between gap-3 py-1.5">
    <span className="text-[12px] text-slate-500 shrink-0">{label}</span>
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="text-[12px] font-semibold text-slate-800 truncate text-right">{value || "—"}</span>
      {copyable && value && (
        <button onClick={() => copyText(value, label)} className="p-1 text-slate-400 hover:text-[#23471d] shrink-0" title={`Copy ${label}`}>
          <Copy size={12} />
        </button>
      )}
    </div>
  </div>
);

const buildDetailsText = (bank) => {
  const lines = [
    `${bank.accountname || bank.accountDisplayName || "Payment Details"}`,
    bank.applicableEventName ? `${bank.applicableEventName} – Official Collection Account` : "",
    "",
    "Bank Transfer / NEFT / RTGS",
    `Bank Name: ${bank.bankname || "—"}`,
    `Account Holder: ${bank.accountname || "—"}`,
    `A/C Number: ${bank.accountno || "—"}`,
    `IFSC Code: ${bank.ifsccode || "—"}`,
    `Account Type: ${bank.accountType || "—"}`,
    `Branch: ${bank.bankbranch || "—"}`,
  ];
  if (bank.upiEnabled && bank.upiId) {
    lines.push("", "UPI Payment", `UPI ID: ${bank.upiId}`, `UPI Name: ${bank.upiRegisteredName || "—"}`);
  }
  return lines.filter((l) => l !== "").join("\n");
};

// Shared "Payment Details (Share with Client)" card — used both as a docked panel
// on the bank account detail page and as the content of the standalone share page.
const PaymentDetailsCard = ({ bank, docLabel, onClose, loading }) => {
  const [tab, setTab] = useState("bank");

  const qrUrl = bank?.qrCodeUrl ? `${SERVER_URL}${bank.qrCodeUrl}` : "";

  const handleShareWhatsApp = () => {
    if (!bank) return;
    const text = `${docLabel ? `Payment details for ${docLabel}\n\n` : ""}${buildDetailsText(bank)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const handleShareEmail = () => {
    if (!bank) return;
    const subject = docLabel ? `Payment Details – ${docLabel}` : "Payment Details";
    const body = buildDetailsText(bank);
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleCopyAll = () => bank && copyText(buildDetailsText(bank), "Payment details");

  const handlePrint = () => {
    if (!bank) return;
    const win = window.open("", "_blank", "width=480,height=640");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Payment Details</title>
          <style>
            body { font-family: -apple-system, Segoe UI, sans-serif; padding: 24px; color: #1e293b; }
            h2 { margin: 0 0 4px; font-size: 16px; }
            p.sub { margin: 0 0 16px; color: #64748b; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            td { padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
            td.label { color: #64748b; width: 45%; }
            td.value { font-weight: 600; text-align: right; }
            img { display: block; margin: 16px auto 0; width: 160px; height: 160px; }
          </style>
        </head>
        <body>
          <h2>${bank.accountname || bank.accountDisplayName || "Payment Details"}</h2>
          <p class="sub">${bank.applicableEventName ? `${bank.applicableEventName} – Official Collection Account` : ""}</p>
          <table>
            <tr><td class="label">Bank Name</td><td class="value">${bank.bankname || "—"}</td></tr>
            <tr><td class="label">Account Holder</td><td class="value">${bank.accountname || "—"}</td></tr>
            <tr><td class="label">A/C Number</td><td class="value">${bank.accountno || "—"}</td></tr>
            <tr><td class="label">IFSC Code</td><td class="value">${bank.ifsccode || "—"}</td></tr>
            <tr><td class="label">Account Type</td><td class="value">${bank.accountType || "—"}</td></tr>
            <tr><td class="label">Branch</td><td class="value">${bank.bankbranch || "—"}</td></tr>
            ${bank.upiEnabled ? `<tr><td class="label">UPI ID</td><td class="value">${bank.upiId || "—"}</td></tr>` : ""}
          </table>
          ${qrUrl ? `<img src="${qrUrl}" alt="UPI QR" />` : ""}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const handleDownloadCard = () => {
    if (!bank) return;
    const width = 520;
    const height = bank.upiEnabled && qrUrl ? 560 : 360;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    const drawContent = (qrImg) => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#23471d";
      ctx.fillRect(0, 0, width, 6);

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 18px Segoe UI, sans-serif";
      ctx.fillText(bank.accountname || bank.accountDisplayName || "Payment Details", 24, 44);

      ctx.fillStyle = "#64748b";
      ctx.font = "12px Segoe UI, sans-serif";
      if (bank.applicableEventName) ctx.fillText(`${bank.applicableEventName} – Official Collection Account`, 24, 64);

      const rows = [
        ["Bank Name", bank.bankname],
        ["Account Holder", bank.accountname],
        ["A/C Number", bank.accountno],
        ["IFSC Code", bank.ifsccode],
        ["Account Type", bank.accountType],
        ["Branch", bank.bankbranch],
      ];
      let y = 100;
      rows.forEach(([label, value]) => {
        ctx.fillStyle = "#64748b";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText(label, 24, y);
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 13px Segoe UI, sans-serif";
        ctx.fillText(value || "—", 220, y);
        y += 26;
      });

      if (qrImg) {
        const qrSize = 180;
        const qrX = (width - qrSize) / 2;
        const qrY = y + 16;
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        ctx.fillStyle = "#64748b";
        ctx.font = "11px Segoe UI, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Scan this QR with any UPI app", width / 2, qrY + qrSize + 20);
        ctx.textAlign = "left";
      }

      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `payment-details-${(bank.bankname || "bank").replace(/\s+/g, "-").toLowerCase()}.png`;
        link.click();
        URL.revokeObjectURL(link.href);
      }, "image/png");
    };

    if (bank.upiEnabled && qrUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => drawContent(img);
      img.onerror = () => drawContent(null);
      img.src = qrUrl;
    } else {
      drawContent(null);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-[rgba(67,71,85,0.18)_0px_0px_0.25em,rgba(90,125,188,0.05)_0px_0.25em_1em] overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-slate-800">Payment Details (Share with Client)</h2>
        {onClose && (
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="px-6 pt-4">
        <div className="flex bg-slate-100 rounded-md p-1 text-[12px] font-bold">
          <button
            onClick={() => setTab("bank")}
            className={`flex-1 py-1.5 rounded ${tab === "bank" ? "bg-white text-[#23471d] shadow-sm" : "text-slate-500"}`}
          >
            Bank Details
          </button>
          <button
            onClick={() => setTab("upi")}
            className={`flex-1 py-1.5 rounded ${tab === "upi" ? "bg-white text-[#23471d] shadow-sm" : "text-slate-500"}`}
          >
            UPI QR (Only)
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <p className="text-center text-slate-400 text-sm italic py-10">Loading payment details...</p>
        ) : !bank ? (
          <p className="text-center text-slate-400 text-sm italic py-10">No active bank account configured yet.</p>
        ) : (
          <div className="space-y-5">
            <div>
              <h3 className="text-[15px] font-bold text-slate-800">{bank.accountname || bank.accountDisplayName}</h3>
              {bank.applicableEventName && (
                <p className="text-[11px] text-slate-400">{bank.applicableEventName} – Official Collection Account</p>
              )}
            </div>

            {tab === "bank" && (
              <div>
                <h4 className="text-[11px] font-bold text-[#23471d] uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <Landmark size={13} /> Bank Transfer / NEFT / RTGS
                </h4>
                <div className="divide-y divide-slate-50 border-t border-slate-100">
                  <DetailRow label="Bank Name" value={bank.bankname} />
                  <DetailRow label="Account Holder" value={bank.accountname} />
                  <DetailRow label="A/C Number" value={bank.accountno} copyable />
                  <DetailRow label="IFSC Code" value={bank.ifsccode} copyable />
                  <DetailRow label="Account Type" value={bank.accountType} />
                  <DetailRow label="Branch" value={bank.bankbranch} />
                </div>
              </div>
            )}

            {bank.upiEnabled && (
              <div>
                <h4 className="text-[11px] font-bold text-[#23471d] uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <QrCode size={13} /> UPI Payment (Scan &amp; Pay)
                </h4>
                <div className="divide-y divide-slate-50 border-t border-slate-100 mb-3">
                  <DetailRow label="UPI ID / VPA" value={bank.upiId} copyable />
                </div>
                {qrUrl ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <img loading="lazy" decoding="async" src={qrUrl} alt="UPI QR" className="w-40 h-40 border border-slate-200 rounded-[2px] object-cover" />
                    <p className="text-[11px] text-slate-400">Scan this QR with any UPI app</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 text-center py-4">No QR code uploaded for this account.</p>
                )}
              </div>
            )}

            <p className="text-[10px] text-slate-400 border-t border-slate-100 pt-3">
              All payments are via NEFT / RTGS / UPI only. No Cash / Cheque.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button onClick={handleShareWhatsApp} className="flex items-center justify-center gap-2 px-3 py-2 border border-emerald-200 bg-emerald-50 text-emerald-700 text-[12px] font-bold rounded-[2px] hover:bg-emerald-100 transition-all">
                <MessageCircleMore size={14} /> Share via WhatsApp
              </button>
              <button onClick={handleShareEmail} className="flex items-center justify-center gap-2 px-3 py-2 border border-blue-200 bg-blue-50 text-blue-700 text-[12px] font-bold rounded-[2px] hover:bg-blue-100 transition-all">
                <Mail size={14} /> Share via Email
              </button>
              <button onClick={handleCopyAll} className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 text-slate-600 text-[12px] font-bold rounded-[2px] hover:bg-slate-50 transition-all">
                <Copy size={14} /> Copy Details
              </button>
              <button onClick={handleDownloadCard} className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 text-slate-600 text-[12px] font-bold rounded-[2px] hover:bg-slate-50 transition-all">
                <Download size={14} /> Download Card
              </button>
              <button onClick={handlePrint} className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 text-slate-600 text-[12px] font-bold rounded-[2px] hover:bg-slate-50 transition-all">
                <Printer size={14} /> Print Payment Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentDetailsCard;
