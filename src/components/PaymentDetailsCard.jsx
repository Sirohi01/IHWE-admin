import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  X,
  Copy,
  Landmark,
  QrCode,
  Link2,
  MessageCircleMore,
  Mail,
  Printer,
  ExternalLink,
} from "lucide-react";
import { SERVER_URL } from "../lib/api";
import { useEventContext } from "../context/EventContext";
import { getCurrentUserName, getCurrentUserMobile, getCurrentUserDepartment } from "../utils/currentUser";

const TABS = [
  { key: "bank", label: "Bank Details" },
  { key: "upi", label: "UPI QR" },
  { key: "link", label: "Pay Online" },
  { key: "all", label: "All" },
];

const SECTIONS_BY_TAB = {
  bank: { bank: true, upi: false, link: false },
  upi: { bank: false, upi: true, link: false },
  link: { bank: false, upi: false, link: true },
  all: { bank: true, upi: true, link: true },
};

const copyText = async (text, label) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  } catch {
    toast.error("Could not copy to clipboard");
  }
};

const DetailRow = ({ label, value, copyable }) => (
  <div className="flex items-center gap-2 py-1.5">
    <span className="text-[12px] text-slate-500 shrink-0 w-28">{label}</span>
    <span className="text-[13px] font-semibold text-slate-800 break-all flex-1">{value || "—"}</span>
    {copyable && value && (
      <button onClick={() => copyText(value, label)} className="p-1 text-slate-400 hover:text-[#23471d] shrink-0" title={`Copy ${label}`}>
        <Copy size={12} />
      </button>
    )}
  </div>
);

const buildDetailsText = (bank, sections) => {
  const lines = ["Bank Details For Payment", ""];

  if (sections.bank) {
    lines.push(
      `Bank Name: ${bank.bankname || "—"}`,
      `Account Name: ${bank.accountname || "—"}`,
      `A/C Number: ${bank.accountno || "—"}`,
      `IFSC Code: ${bank.ifsccode || "—"}`,
      `Account Type: ${bank.accountType || "—"}`,
      `Branch: ${bank.bankbranch || "—"}`,
    );
  }

  if (sections.upi && bank.upiEnabled) {
    if (lines.length > 2) lines.push("");
    lines.push("UPI Payment", `UPI ID: ${bank.upiId || "—"}`, `UPI Name: ${bank.upiRegisteredName || "—"}`);
  }

  if (sections.link && bank.paymentGatewayLink) {
    if (lines.length > 2) lines.push("");
    lines.push("Payment Link", bank.paymentGatewayLink);
  }

  return lines.join("\n");
};

const buildWhatsAppMessage = (bank, { clientName, docLabel, amount, eventName, sections, senderName, senderMobile, senderDepartment }) => {
  const event = eventName || bank.applicableEventName || "International Health & Wellness Expo 2026";
  const lines = [
    "*Namo Gange Namaskar!*",
    "",
    `Dear *${clientName || "[Client Name]"}*,`,
    "",
    `Greetings from the *${event}*.`,
    "",
    "For your convenience, please find below our official payment details for making the payment against your booking.",
  ];

  if (sections.bank) {
    lines.push(
      "",
      "*BANK TRANSFER / NEFT / RTGS*",
      `*Account Name:* ${bank.accountname || "—"}`,
      `*Bank:* ${bank.bankname || "—"}`,
      `*Account No.:* ${bank.accountno || "—"}`,
      `*IFSC Code:* ${bank.ifsccode || "—"}`,
    );
  }

  if (sections.upi && bank.upiEnabled && bank.upiId) {
    lines.push(
      "",
      "*UPI / SCAN & PAY*",
      "",
      `*UPI ID:* ${bank.upiId}`,
      "*QR Code:* Attached below",
      "You may scan the QR Code using any UPI-enabled payment app.",
    );
  }

  if (sections.link && bank.paymentGatewayLink) {
    lines.push("", "*PAYMENT LINK*", "", `*Pay Online:* ${bank.paymentGatewayLink}`);
  }

  lines.push(
    "",
    "*PAYMENT DETAILS*",
    `*PI / Invoice No.:* ${docLabel || "[PI / Invoice No.]"}`,
    `*Amount Payable:* *${amount ? `₹${amount}` : "[Amount]"}*`,
    "",
    "Once the payment is completed, kindly share the *UTR / Transaction ID or payment confirmation screenshot* with us on WhatsApp. Upon verification, the *official payment receipt* will be issued accordingly.",
    "",
    `Thank you for your valued association. We look forward to welcoming you at the *${event}*.`,
    "",
    "*Warm Regards,*",
  );

  const senderLine = [senderName, senderMobile].filter(Boolean).join(" | ");
  lines.push(`*${senderLine || "Accounts Team"}*`);
  if (senderDepartment) lines.push(`*${senderDepartment}*`);
  lines.push("*Namo Gange Wellness Pvt. Ltd.*");

  return lines.join("\n");
};

const buildEmailBody = (bank, { clientName, docLabel, amount, eventName, sections, senderName, senderMobile, senderDepartment }) => {
  const event = eventName || bank.applicableEventName || "International Health & Wellness Expo 2026";
  const lines = [
    "Namo Gange Namaskar!",
    "",
    `Dear ${clientName || "[Client Name]"},`,
    "",
    "Warm greetings from Namo Gange Wellness Pvt. Ltd.",
    "",
    `We are delighted to welcome ${clientName || "[Company Name]"} as a valued participant of the ${event}.`,
    "",
    "For your convenience, please find below your payment details along with our official payment options to complete the transaction securely.",
    "",
    "PAYMENT DETAILS",
    "",
    `Company Name: ${clientName || "[Company Name]"}`,
    `PI / Invoice No.: ${docLabel || "[PI / Invoice No.]"}`,
    `Amount Payable: ₹${amount || "[Amount]"}`,
  ];

  if (sections.link && bank.paymentGatewayLink) {
    lines.push(
      "",
      "SECURE ONLINE PAYMENT",
      "",
      "For quick and convenient payment, please use our secure payment gateway:",
      bank.paymentGatewayLink,
    );
  }

  if (sections.bank) {
    lines.push(
      "",
      "BANK TRANSFER / NEFT / RTGS",
      "",
      `Account Name: ${bank.accountname || "—"}`,
      `Bank: ${bank.bankname || "—"}`,
      `Account No.: ${bank.accountno || "—"}`,
      `IFSC Code: ${bank.ifsccode || "—"}`,
    );
  }

  if (sections.upi && bank.upiEnabled && bank.upiId) {
    lines.push(
      "",
      "UPI / SCAN & PAY",
      "",
      `UPI ID: ${bank.upiId}`,
      "QR Code: Attached below",
    );
  }

  lines.push(
    "",
    "Once the payment is completed, kindly share the UTR / Transaction ID or payment confirmation screenshot with us. Upon verification, the official payment receipt will be issued accordingly.",
    "",
    `Thank you for your valued association. We look forward to welcoming you at the ${event}.`,
    "",
    "Warm Regards,",
  );

  const senderLine = [senderName, senderMobile].filter(Boolean).join(" | ");
  lines.push(senderLine || "Accounts Team");
  if (senderDepartment) lines.push(senderDepartment);
  lines.push("Namo Gange Wellness Pvt. Ltd.");

  return lines.join("\n");
};

const EMAIL_SUBJECT = "Payment Options & Account Details | International Health & Wellness Expo 2026";

// Shared "Payment Details (Share with Client)" card — used both as a docked panel
// on the bank account detail page and as the content of the standalone share page.
const PaymentDetailsCard = ({ bank, docLabel, clientName, amount, onClose, loading }) => {
  const [tab, setTab] = useState("bank");
  const { currentEvent } = useEventContext();

  const qrUrl = bank?.qrCodeUrl ? `${SERVER_URL}${bank.qrCodeUrl}` : "";
  const sections = SECTIONS_BY_TAB[tab];

  const handleShareWhatsApp = () => {
    if (!bank) return;
    const text = buildWhatsAppMessage(bank, {
      clientName,
      docLabel,
      amount,
      eventName: currentEvent?.name || bank.applicableEventName,
      sections,
      senderName: getCurrentUserName(""),
      senderMobile: getCurrentUserMobile(),
      senderDepartment: getCurrentUserDepartment(),
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const handleShareEmail = () => {
    if (!bank) return;
    const body = buildEmailBody(bank, {
      clientName,
      docLabel,
      amount,
      eventName: currentEvent?.name || bank.applicableEventName,
      sections,
      senderName: getCurrentUserName(""),
      senderMobile: getCurrentUserMobile(),
      senderDepartment: getCurrentUserDepartment(),
    });
    window.location.href = `mailto:?subject=${encodeURIComponent(EMAIL_SUBJECT)}&body=${encodeURIComponent(body)}`;
  };

  const handleCopyAll = () => bank && copyText(buildDetailsText(bank, sections), "Payment details");

  const handlePrint = () => {
    if (!bank) return;
    const win = window.open("", "_blank", "width=480,height=640");
    if (!win) return;

    const rows = [];
    if (sections.bank) {
      rows.push(
        ["Bank Name", bank.bankname],
        ["Account Name", bank.accountname],
        ["A/C Number", bank.accountno],
        ["IFSC Code", bank.ifsccode],
        ["Account Type", bank.accountType],
        ["Branch", bank.bankbranch],
      );
    }
    if (sections.upi && bank.upiEnabled) {
      rows.push(["UPI ID", bank.upiId]);
    }
    if (sections.link && bank.paymentGatewayLink) {
      rows.push(["Payment Link", bank.paymentGatewayLink]);
    }
    const rowsHtml = rows
      .map(([label, value]) => `<tr><td class="label">${label}</td><td class="value">${value || "—"}</td></tr>`)
      .join("");
    const showQr = sections.upi && bank.upiEnabled && qrUrl;

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
            td.value { font-weight: 600; text-align: right; word-break: break-all; }
            img { display: block; margin: 16px auto 0; width: 160px; height: 160px; }
          </style>
        </head>
        <body>
          <h2>${bank.accountname || bank.accountDisplayName || "Payment Details"}</h2>
          <p class="sub">${bank.applicableEventName ? `${bank.applicableEventName} – Official Collection Account` : ""}</p>
          <table>${rowsHtml}</table>
          ${showQr ? `<img src="${qrUrl}" alt="UPI QR" />` : ""}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-[rgba(67,71,85,0.18)_0px_0px_0.25em,rgba(90,125,188,0.05)_0px_0.25em_1em] overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-4 flex items-start justify-between">
        <h2 className="text-[16px] font-bold text-slate-800 leading-snug">
          Payment Details
          <span className="block text-[11px] font-semibold text-slate-500">(Share with Client)</span>
        </h2>
        {onClose && (
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="px-6 pt-4">
        <div className="flex bg-slate-100 rounded-md p-1 text-[10.5px] font-bold">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-1.5 rounded whitespace-nowrap ${tab === t.key ? "bg-white text-[#23471d] shadow-sm" : "text-slate-500"}`}
            >
              {t.label}
            </button>
          ))}
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

            {sections.bank && (
              <div>
                <h4 className="text-[11px] font-bold text-[#23471d] uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <Landmark size={13} /> Bank Transfer / NEFT / RTGS
                </h4>
                <div className="divide-y divide-slate-50 border-t border-slate-100">
                  <DetailRow label="Bank Name" value={bank.bankname} />
                  <DetailRow label="Account Name" value={bank.accountname} />
                  <DetailRow label="A/C Number" value={bank.accountno} copyable />
                  <DetailRow label="IFSC Code" value={bank.ifsccode} copyable />
                  <DetailRow label="Account Type" value={bank.accountType} />
                  <DetailRow label="Branch" value={bank.bankbranch} />
                </div>
              </div>
            )}

            {sections.upi && (
              <div>
                <h4 className="text-[11px] font-bold text-[#23471d] uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <QrCode size={13} /> UPI Payment (Scan &amp; Pay)
                </h4>
                {bank.upiEnabled ? (
                  <>
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
                  </>
                ) : (
                  <p className="text-[11px] text-slate-400 text-center py-4 border-t border-slate-100">UPI is not enabled for this account.</p>
                )}
              </div>
            )}

            {sections.link && (
              <div>
                <h4 className="text-[11px] font-bold text-[#23471d] uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <Link2 size={13} /> Payment Link
                </h4>
                {bank.paymentGatewayLink ? (
                  <>
                    <div className="divide-y divide-slate-50 border-t border-slate-100 mb-3">
                      <DetailRow label="Pay Online" value={bank.paymentGatewayLink} copyable />
                    </div>
                    <a
                      href={bank.paymentGatewayLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 px-3 py-2 border border-teal-200 bg-teal-50 text-teal-700 text-[11px] font-bold rounded-[2px] hover:bg-teal-100 transition-all"
                    >
                      <ExternalLink size={13} /> Open Payment Link
                    </a>
                  </>
                ) : (
                  <p className="text-[11px] text-slate-400 text-center py-4 border-t border-slate-100">No payment link added for this account.</p>
                )}
              </div>
            )}

            <p className="text-[10px] text-slate-400 border-t border-slate-100 pt-3">
              All payments are via NEFT / RTGS / UPI only. No Cash / Cheque.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button onClick={handleShareWhatsApp} className="flex items-center justify-center gap-1.5 px-2 py-2 border border-emerald-200 bg-emerald-50 text-emerald-700 text-[10.5px] font-bold rounded-[2px] hover:bg-emerald-100 transition-all whitespace-nowrap">
                <MessageCircleMore size={13} /> Share via WhatsApp
              </button>
              <button onClick={handleShareEmail} className="flex items-center justify-center gap-1.5 px-2 py-2 border border-blue-200 bg-blue-50 text-blue-700 text-[10.5px] font-bold rounded-[2px] hover:bg-blue-100 transition-all whitespace-nowrap">
                <Mail size={13} /> Share via Email
              </button>
              <button onClick={handleCopyAll} className="flex items-center justify-center gap-1.5 px-2 py-2 border border-slate-300 text-slate-600 text-[10.5px] font-bold rounded-[2px] hover:bg-slate-50 transition-all whitespace-nowrap">
                <Copy size={13} /> Copy Details
              </button>
              <button onClick={handlePrint} className="flex items-center justify-center gap-1.5 px-2 py-2 border border-slate-300 text-slate-600 text-[10.5px] font-bold rounded-[2px] hover:bg-slate-50 transition-all whitespace-nowrap">
                <Printer size={13} /> Print PYMT Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentDetailsCard;
