import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import {
  ChevronRight,
  Pencil,
  ChevronDown,
  Star,
  Landmark,
  QrCode,
  Download,
  Wallet,
  Share2,
  Trash2,
  Link2,
} from "lucide-react";
import api, { SERVER_URL } from "../../lib/api";
import { updateBank, deleteBank } from "../../features/add_by_admin/banks/bankSlice";
import PaymentDetailsCard from "../../components/PaymentDetailsCard";

const isActiveStatus = (status) => (status || "").toLowerCase() === "active";
const formatStatus = (status) => (isActiveStatus(status) ? "Active" : "Inactive");
const formatPurpose = (purpose) => (Array.isArray(purpose) ? (purpose.length ? purpose.join(", ") : "—") : purpose || "—");

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const FIELD_LABELS = {
  accountDisplayName: "Account Name",
  accountname: "Account Holder Name",
  bankname: "Bank Name",
  accountno: "Account Number",
  ifsccode: "IFSC Code",
  accountType: "Account Type",
  bankbranch: "Branch Name",
  branchAddress: "Branch Address",
  swiftBic: "SWIFT / BIC",
  micrCode: "MICR Code",
  openingBalance: "Opening Balance",
  currency: "Currency",
  upiEnabled: "UPI Enabled",
  upiId: "UPI ID",
  upiRegisteredName: "UPI Registered Name",
  paymentGatewayLink: "Payment Gateway Link",
  applicableEventName: "Applicable Event",
  isPrimary: "Primary Account",
  showOnProformaInvoice: "Show on Proforma Invoice",
  showOnTaxInvoice: "Show on Tax Invoice",
  showOnPaymentReceipt: "Show on Payment Receipt",
  allowShareWithClient: "Allow Share with Client",
  status: "Status",
};

const formatFieldValue = (value) => {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return formatPurpose(value);
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
};

const describeLogFields = (fields) => {
  if (!fields || typeof fields !== "object") return [];
  return Object.entries(fields)
    .filter(([key]) => FIELD_LABELS[key])
    .map(([key, value]) => ({ label: FIELD_LABELS[key], value: formatFieldValue(value) }));
};

const TABS = [
  { key: "account", label: "Account Details" },
  { key: "activity", label: "Activity Log" },
];

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-1.5 text-[12.5px]">
    <span className="text-slate-500">{label}</span>
    <span className="font-semibold text-slate-800 text-right">{value ?? "—"}</span>
  </div>
);

const YesNoBadge = ({ value }) => (
  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${value ? "bg-green-50 text-green-700 border border-green-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
    {value ? "Yes" : "No"}
  </span>
);

const SectionCard = ({ icon: Icon, iconColor, number, title, children }) => (
  <div className="bg-white rounded-lg border border-gray-100 shadow-[rgba(67,71,85,0.12)_0px_0px_0.25em,rgba(90,125,188,0.04)_0px_0.25em_1em] p-4">
    <div className="flex items-center gap-2 mb-3">
      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold flex items-center justify-center">{number}</span>
      <h3 className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
        {title}
      </h3>
      {Icon && <Icon size={15} className={`ml-auto ${iconColor}`} />}
    </div>
    <div className="divide-y divide-slate-50">{children}</div>
  </div>
);

const InlineFieldList = ({ fields }) => (
  <p className="mt-2 text-[11px] text-slate-600 leading-relaxed">
    {fields.map((f, i) => {
      const isEmpty = f.value === "—";
      return (
        <React.Fragment key={f.label}>
          <span className="font-medium text-slate-700">{f.label}:</span>{" "}
          <span className={isEmpty ? "text-red-500 font-semibold" : ""}>
            {isEmpty ? "Not Available" : f.value}
          </span>
          {i < fields.length - 1 && <span className="text-slate-300 mx-1.5">|</span>}
        </React.Fragment>
      );
    })}
  </p>
);

const BankAccountDetail = () => {
  const { bankId: routeBankId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const queryBankId = searchParams.get("bankId") || "";
  const docParam = searchParams.get("doc") || "";
  const clientNameParam = searchParams.get("clientName") || "";
  const amountParam = searchParams.get("amount") || "";
  // The dedicated share-payment-details route exists only to share, so it always opens
  // the panel — regardless of query params, which may be missing on old/bookmarked links.
  const isShareRoute = location.pathname.includes("share-payment-details");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("account");
  const [moreOpen, setMoreOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(isShareRoute || searchParams.get("share") === "1");
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const moreRef = useRef(null);

  const bankId = bank?._id || routeBankId || queryBankId;

  const fetchBank = () => {
    setLoading(true);
    const request = routeBankId
      ? api.get(`/api/banks/${routeBankId}`).then((res) => res.data?.data || res.data)
      : api.get("/api/banks").then((res) => {
          const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
          const active = list.filter((b) => String(b.status || "").toLowerCase() === "active");
          const chosen = queryBankId ? list.find((b) => b._id === queryBankId) : null;
          return chosen || active.find((b) => b.isPrimary) || active[0] || list[0] || null;
        });
    request
      .then((data) => setBank(data))
      .catch((err) => {
        console.error("Error fetching bank account:", err);
        Swal.fire({ title: "Error", text: "Failed to load this bank account.", icon: "error", confirmButtonColor: "#23471d" });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBank();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeBankId, queryBankId]);

  useEffect(() => {
    if (tab !== "activity" || !bankId) return;
    setLogsLoading(true);
    api
      .get("/api/activity-logs", { params: { entityId: bankId, limit: 50 } })
      .then((res) => setLogs(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch((err) => console.error("Error fetching activity logs:", err))
      .finally(() => setLogsLoading(false));
  }, [tab, bankId]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleSetPrimary = async () => {
    setMoreOpen(false);
    try {
      await dispatch(updateBank({ id: bankId, updatedData: { isPrimary: true } })).unwrap();
      fetchBank();
      Swal.fire({ title: "Updated!", text: "This is now the primary collection account.", icon: "success", confirmButtonColor: "#23471d" });
    } catch (err) {
      Swal.fire({ title: "Error", text: err?.message || "Failed to set primary account.", icon: "error", confirmButtonColor: "#23471d" });
    }
  };

  const handleDeleteAccount = async () => {
    setMoreOpen(false);
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete '${bank?.accountDisplayName || bank?.bankname}'?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#23471d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (!result.isConfirmed) return;
    try {
      await dispatch(deleteBank(bankId)).unwrap();
      Swal.fire({ title: "Deleted!", text: "Bank account has been deleted.", icon: "success", confirmButtonColor: "#23471d" });
      navigate("/ihweClientData2026/AddBank");
    } catch (err) {
      Swal.fire({ title: "Error", text: err?.message || "Failed to delete bank account.", icon: "error", confirmButtonColor: "#23471d" });
    }
  };

  const qrUrl = bank?.qrCodeUrl ? `${SERVER_URL}${bank.qrCodeUrl}` : "";

  const updateLogs = useMemo(() => logs.filter((l) => l.action === "Updated"), [logs]);
  const createdLog = useMemo(() => logs.find((l) => l.action === "Created"), [logs]);
  const createdFields = createdLog ? describeLogFields(createdLog.data?.created_data) : bank ? describeLogFields(bank) : [];

  if (loading) {
    return (
      <div className="bg-[#f8f9fc] min-h-screen p-4 flex items-center justify-center text-slate-400 text-sm">
        Loading bank account...
      </div>
    );
  }

  if (!bank) {
    return (
      <div className="bg-[#f8f9fc] min-h-screen p-4 flex flex-col items-center justify-center gap-3 text-slate-400 text-sm">
        <p>This bank account could not be found.</p>
        <button onClick={() => navigate("/ihweClientData2026/AddBank")} className="text-[#23471d] font-bold underline">
          Back to Organiser Bank &amp; UPI Accounts
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fc] min-h-screen p-4 flex items-start gap-3">
    <div className="flex-1 min-w-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] text-[#194090] mb-3 flex-wrap">
        <button onClick={() => navigate("/dashboard")} className="hover:underline">Dashboard</button>
        <ChevronRight size={13} className="text-gray-400" />
        <span>Finance &amp; Accounts</span>
        <ChevronRight size={13} className="text-gray-400" />
        <span>Accounts</span>
        <ChevronRight size={13} className="text-gray-400" />
        <button onClick={() => navigate("/ihweClientData2026/AddBank")} className="hover:underline">Organiser Bank &amp; UPI Accounts</button>
        <ChevronRight size={13} className="text-gray-400" />
        <span className="text-slate-800 font-medium">{bank.accountDisplayName || bank.bankname}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 mb-3">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[18px] font-bold text-slate-800">{bank.accountDisplayName || bank.bankname}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${isActiveStatus(bank.status) ? "bg-green-50 text-green-700 border border-green-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                {formatStatus(bank.status)}
              </span>
            </div>
            {bank.isPrimary && (
              <p className="text-[12px] text-amber-600 font-semibold flex items-center gap-1 mt-1">
                <Star size={13} className="fill-amber-400 text-amber-400" /> Primary Collection Account
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/ihweClientData2026/AddBank?edit=${bank._id}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-md text-[12px] font-bold text-slate-700 hover:bg-slate-50"
            >
              <Pencil size={13} /> Edit Account
            </button>
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen((o) => !o)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-md text-[12px] font-bold text-slate-700 hover:bg-slate-50"
              >
                More Actions <ChevronDown size={13} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} />
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-10 z-20 bg-white border border-slate-200 rounded-md shadow-lg w-52 text-left overflow-hidden">
                  <button
                    onClick={() => { setMoreOpen(false); setShareOpen(true); }}
                    className="w-full text-left px-4 py-2.5 text-[12.5px] text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Share2 size={13} /> Share Bank Details
                  </button>
                  {!bank.isPrimary && (
                    <button onClick={handleSetPrimary} className="w-full text-left px-4 py-2.5 text-[12.5px] text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                      <Star size={13} /> Set as Primary
                    </button>
                  )}
                  <button onClick={handleDeleteAccount} className="w-full text-left px-4 py-2.5 text-[12.5px] text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <Trash2 size={13} /> Delete Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-5 border-b border-slate-100 mt-4 -mb-4 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 text-[12.5px] font-bold whitespace-nowrap border-b-2 transition-colors ${
                tab === t.key ? "text-[#23471d] border-[#23471d]" : "text-slate-400 border-transparent hover:text-slate-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "account" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <SectionCard icon={Landmark} iconColor="text-blue-500" number={1} title="Bank Account Details">
              <InfoRow label="Bank Name" value={bank.bankname} />
              <InfoRow label="Account Holder Name" value={bank.accountname} />
              <InfoRow label="Account Number" value={bank.accountno} />
              <InfoRow label="IFSC Code" value={bank.ifsccode} />
              <InfoRow label="Account Type" value={bank.accountType} />
              <InfoRow label="Branch Name" value={bank.bankbranch} />
              <InfoRow label="Branch Address" value={bank.branchAddress} />
              <InfoRow label="SWIFT / BIC" value={bank.swiftBic} />
              <InfoRow label="MICR Code" value={bank.micrCode} />
              <InfoRow label="Opening Balance" value={`₹${Number(bank.openingBalance || 0).toLocaleString("en-IN")}`} />
              <InfoRow label="Currency" value={bank.currency || "INR"} />
            </SectionCard>

            <SectionCard icon={QrCode} iconColor="text-orange-500" number={2} title="UPI / Digital Payment Details">
              <InfoRow label="UPI ID / VPA" value={bank.upiId} />
              <InfoRow label="UPI Registered Name" value={bank.upiRegisteredName} />
              <InfoRow label="UPI Linked Bank" value={bank.bankname && bank.accountno ? `${bank.bankname} – ${bank.accountno}` : "—"} />
              <div className="flex items-center justify-between py-1.5 text-[12.5px]">
                <span className="text-slate-500">Enable UPI Payments</span>
                <YesNoBadge value={!!bank.upiEnabled} />
              </div>
              <div className="flex items-center justify-between py-1.5 text-[12.5px]">
                <span className="text-slate-500">QR Code</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${qrUrl ? "bg-green-50 text-green-700 border border-green-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                  {qrUrl ? "Active" : "Not Uploaded"}
                </span>
              </div>
              {qrUrl && (
                <div className="pt-3 flex flex-col items-center gap-2">
                  <img loading="lazy" decoding="async" src={qrUrl} alt="UPI QR" className="w-32 h-32 border border-slate-200 rounded-[2px] object-cover" />
                  <a href={qrUrl} download className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-[2px] text-[11px] font-bold text-slate-600 hover:bg-slate-50">
                    <Download size={12} /> Download QR
                  </a>
                </div>
              )}
            </SectionCard>
          </div>

          <SectionCard icon={Link2} iconColor="text-teal-500" number={3} title="Payment Gateway">
            {bank.paymentGatewayLink ? (
              <div className="flex items-center justify-between py-1.5 text-[12.5px]">
                <span className="text-slate-500">Payment Gateway Link</span>
                <a
                  href={bank.paymentGatewayLink}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-blue-600 hover:underline truncate max-w-[70%]"
                >
                  {bank.paymentGatewayLink}
                </a>
              </div>
            ) : (
              <p className="text-[12px] text-slate-400 py-1.5">No payment gateway link added.</p>
            )}
          </SectionCard>

          <SectionCard number={4} title="Usage & Settings">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <div>
                <InfoRow label="Purpose / Usage" value={formatPurpose(bank.purpose)} />
                <InfoRow label="Applicable Event" value={bank.applicableEventName} />
                <div className="flex items-center justify-between py-1.5 text-[12.5px]">
                  <span className="text-slate-500">Set as Primary Collection Account</span>
                  <YesNoBadge value={!!bank.isPrimary} />
                </div>
                <div className="flex items-center justify-between py-1.5 text-[12.5px]">
                  <span className="text-slate-500">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${isActiveStatus(bank.status) ? "bg-green-50 text-green-700 border border-green-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                    {formatStatus(bank.status)}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between py-1.5 text-[12.5px]">
                  <span className="text-slate-500">Show on Proforma Invoice</span>
                  <YesNoBadge value={!!bank.showOnProformaInvoice} />
                </div>
                <div className="flex items-center justify-between py-1.5 text-[12.5px]">
                  <span className="text-slate-500">Show on Tax Invoice</span>
                  <YesNoBadge value={!!bank.showOnTaxInvoice} />
                </div>
                <div className="flex items-center justify-between py-1.5 text-[12.5px]">
                  <span className="text-slate-500">Show on Payment Receipt</span>
                  <YesNoBadge value={!!bank.showOnPaymentReceipt} />
                </div>
                <div className="flex items-center justify-between py-1.5 text-[12.5px]">
                  <span className="text-slate-500">Allow Share with Client</span>
                  <YesNoBadge value={!!bank.allowShareWithClient} />
                </div>
                <div className="flex items-center justify-between py-1.5 text-[12.5px]">
                  <span className="text-slate-500">Active Account</span>
                  <YesNoBadge value={isActiveStatus(bank.status)} />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard number={5} title="Audit Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <div>
                <InfoRow label="Created By" value={bank.added_by || "—"} />
                <InfoRow label="Created At" value={formatDateTime(bank.added)} />
              </div>
              <div>
                <InfoRow label="Last Updated By" value={bank.updated_by || "—"} />
                <InfoRow label="Last Updated At" value={formatDateTime(bank.updated)} />
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {tab === "activity" && (
        <div className="bg-white rounded-lg border border-gray-100 p-4 space-y-3">
          <div className="border border-slate-100 rounded-[2px] px-4 py-3 flex flex-col items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <Wallet size={14} className="text-green-600" />
            </div>
            <div className="min-w-0 flex-1 w-full">
              <p className="text-[12px] font-medium text-slate-700">Account added</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{formatDateTime(bank.added)}</p>
              {createdFields.length > 0 && <InlineFieldList fields={createdFields} />}
            </div>
          </div>

          {logsLoading ? (
            <p className="text-center text-slate-400 text-sm italic py-6">Loading activity...</p>
          ) : updateLogs.length === 0 ? (
            <p className="text-center text-slate-400 text-sm italic py-6">No updates recorded yet.</p>
          ) : (
            updateLogs.map((log) => {
              const changes = describeLogFields(log.data?.updated_fields);
              return (
                <div key={log._id} className="border border-slate-100 rounded-[2px] px-4 py-3 flex flex-col items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Pencil size={13} className="text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1 w-full">
                    <p className="text-[12px] font-medium text-slate-700">Updated by {log.user}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{formatDateTime(log.createdAt)}</p>
                    {changes.length > 0 && <InlineFieldList fields={changes} />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>

    {shareOpen && (
      <aside className="w-full max-w-md shrink-0">
        <PaymentDetailsCard
          bank={bank}
          docLabel={docParam || bank.accountDisplayName || bank.bankname}
          clientName={clientNameParam}
          amount={amountParam}
          onClose={() => setShareOpen(false)}
        />
      </aside>
    )}
    </div>
  );
};

export default BankAccountDetail;
