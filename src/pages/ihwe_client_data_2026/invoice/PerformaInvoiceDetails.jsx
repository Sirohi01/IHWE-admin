import React, { useRef, useEffect, useState } from "react";
import mainpic from "../../../assets/header.png";
import { FaPrint } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchPerformaInvoices } from "../../../features/performaInvoice/performaInvoiceSlice";
import { fetchCompanies } from "../../../features/company/companySlice";
import { fetchEstimates } from "../../../features/estimates/estimateSlice";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, UserCheck, Upload, ChevronDown, ChevronLeft, X, Landmark, SquarePen, Mail, Globe } from "lucide-react";
import api, { SERVER_URL } from "../../../lib/api";

const PROFORMA_EVENT_NAME = "9th Edition of International Health & Wellness Expo (IHWE Global Edition)";
const PROFORMA_PLACE_OF_SUPPLY = "Hall Nos. 8, 9 & 10, Pragati Maidan, New Delhi - 110001, Bharat";
const PROFORMA_EVENT_GST_NO = "08AAFCN9238F1Z6";

const joinAddressParts = (parts) => {
  const used = new Set();
  const out = [];

  (parts || [])
    .filter(Boolean)
    .map((part) => String(part).trim())
    .flatMap((part) => part.split(",").map((p) => p.trim()))
    .forEach((part) => {
      if (!part) return;
      const key = part.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!key || used.has(key)) return;
      used.add(key);

      if (/^\d{6}$/.test(part) && out.length) {
        out[out.length - 1] = `${out[out.length - 1]} - ${part}`;
        return;
      }

      out.push(part);
    });

  return out.join(", ");
};

const PerformaInvoiceDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const sameRef = useRef();
  const [matchedPerIvo, setMatchedPerIvo] = useState(null);
  const [company, setCompany] = useState(null);
  const [matchedEstimate, setMatchedEstimate] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/api/settings');
        setSettings(res.data.data);
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };
    fetchSettings();
  }, []);

  const { companies } = useSelector((state) => state.companies);
  const { perInvoices } = useSelector((state) => state.perinvoice);
  const { estimates, loading } = useSelector((state) => state.estimates);

  useEffect(() => {
    dispatch(fetchPerformaInvoices());
    dispatch(fetchCompanies());
  }, [dispatch]);

  const totalAmount =
    matchedEstimate?.items?.reduce(
      (sum, item) => sum + (parseFloat(item.tax) || 0),
      0
    ) || 0;

  const grandTotal =
    matchedEstimate?.items?.reduce(
      (sum, item) => sum + (parseFloat(item.finalAmount) || 0),
      0
    ) || 0;

  const c1 = company?.contacts?.[0] || {};
  const clientCompanyName = matchedEstimate?.company_name || company?.companyName || "";
  const clientCompanyAddress = matchedEstimate?.company_addr || joinAddressParts([
    company?.address,
    company?.city,
    company?.pincode,
    company?.state,
    company?.country,
  ]);
  const clientGstNo = matchedEstimate?.company_gst_no || matchedEstimate?.gst_no || "";
  const eventName = matchedEstimate?.event_name || matchedEstimate?.consignee_name || PROFORMA_EVENT_NAME;
  const eventPlaceOfSupply = joinAddressParts([
    (matchedEstimate?.event_place_of_supply || matchedEstimate?.consignee_addr || PROFORMA_PLACE_OF_SUPPLY)
      .replace(/,\s*Bharat$/i, ""),
    "Delhi",
    "Bharat",
  ]);
  const eventGstNo = matchedEstimate?.event_gst_no || PROFORMA_EVENT_GST_NO;

  useEffect(() => {
    if (perInvoices && perInvoices.length > 0) {
      const match = perInvoices.find((e) => e._id === id);
      setMatchedPerIvo(match || null);
    }
  }, [id, perInvoices]);

  useEffect(() => {
    if (matchedPerIvo?.companyId) {
      dispatch(fetchEstimates(matchedPerIvo.companyId));
    }
  }, [matchedPerIvo?.companyId, dispatch]);

  useEffect(() => {
    if (estimates && estimates.length > 0 && matchedPerIvo) {
      const match = estimates.find((e) => e.est_no === matchedPerIvo?.est_no);
      setMatchedEstimate(match || null);
    }
  }, [matchedPerIvo, estimates]);

  useEffect(() => {
    const fetchCompanyData = async () => {
      const companyId = matchedEstimate?.companyId || matchedPerIvo?.companyId;
      if (!companyId) return;

      if (companies && companies.length > 0) {
        const matchedCompany = companies.find((c) => c._id === companyId);
        if (matchedCompany) {
          setCompany(matchedCompany);
          return;
        }
      }

      try {
        const response = await api.get(`/api/exhibitor-registration/${companyId}`);
        const exhibitorData = response.data?.data;
        if (exhibitorData) {
          setCompany({
            ...exhibitorData,
            companyName: exhibitorData.exhibitorName,
            contacts: [{
              title: exhibitorData.contact1?.title || "",
              firstName: exhibitorData.contact1?.firstName || "",
              surname: exhibitorData.contact1?.lastName || "",
              designation: exhibitorData.contact1?.designation || "",
              email: exhibitorData.contact1?.email || exhibitorData.email || "",
              mobile: exhibitorData.contact1?.mobile || exhibitorData.mobile || exhibitorData.landlineNo || ""
            }]
          });
        }
      } catch (err) {
        console.error("Failed to fetch company details", err);
      }
    };
    fetchCompanyData();
  }, [matchedEstimate, matchedPerIvo, companies]);

  const handleprint = useReactToPrint({
    contentRef: sameRef,
    documentTitle: "invoice",
  });

  const sigUrl = settings?.authorizedSignature ? (settings.authorizedSignature.startsWith('http') ? settings.authorizedSignature : `${SERVER_URL}${settings.authorizedSignature}`) : null;
  const stampUrl = settings?.companyStamp ? (settings.companyStamp.startsWith('http') ? settings.companyStamp : `${SERVER_URL}${settings.companyStamp}`) : null;

  return (
    <>
      <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-inter animate-fadeIn">
        {/* <div className="w-full h-auto flex justify-between bg-white px-5 py-0.5 ">
          <h1 className="text-xl font-norma text-gray-600">
            ACCOUNT SECTION | Proforma Invoice
          </h1>
          <button
            onClick={handleprint}
            className="w-fit h-fit border border-gray-300 px-1.5 py-1 mt-1 text-[11px] cursor-pointer"
          >
            <FaPrint />
          </button>
        </div> */}

        <div className="flex flex-col lg:flex-row justify-between items-center pb-4 border-b border-gray-300 gap-4">
          <div className="flex flex-col items-center lg:items-start gap-1">
            <h1 className="text-xl font-semibold text-slate-600 uppercase tracking-tight leading-none text-center lg:text-left">
              ACCOUNT SECTION - Proforma Invoice | Sales Management Section
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
          </div>
        </div>

        <div className="bg-gray-100 p-6 min-h-screen ">
          <div ref={sameRef} className="max-w-8xl mx-auto bg-white px-6 py-0.5">
            <img loading="lazy" decoding="async" className=" my-6" src={mainpic} alt="" />

            {/* Client + Invoice Info */}
            <table className="w-full border-collapse border mb-3">
              <thead>
                <tr className="bg-[#818481]">
                  <th colSpan="8" className="text-center py-0.5 text-[#1d2129] text-xs font-semibold">
                    Client Proforma Invoice
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-1 py-0.5 text-[11px] font-semibold">Client Name</td>
                  <td className="border px-1 py-0.5 text-[11px]">{clientCompanyName}</td>
                  <td className="border px-1 py-0.5 text-[11px] font-semibold">Contact Person</td>
                  <td className="border px-1 py-0.5 text-[11px]">
                    {[c1?.title, c1?.firstName, c1?.surname].filter(Boolean).join(" ")}
                  </td>
                  <td className="border px-1 py-0.5 text-[11px] font-semibold">PF Invoice No.</td>
                  <td className="border px-1 py-0.5 text-[11px]">{matchedPerIvo?.pi_no}</td>
                </tr>
                <tr>
                  <td rowSpan="2" className="border px-1 py-0.5 text-[11px] font-semibold">Client Address</td>
                  <td className="border px-1 py-0.5 text-[11px]" rowSpan="2">{clientCompanyAddress}</td>
                  <td className="border px-1 py-0.5 text-[11px] font-semibold">Designation</td>
                  <td className="border px-1 py-0.5 text-[11px]">{c1?.designation}</td>
                  <td className="border px-1 py-0.5 text-[11px] font-semibold">PF Invoice Date</td>
                  <td className="border px-1 py-0.5 text-[11px]">
                    {matchedPerIvo?.added ? new Date(matchedPerIvo.added).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : ""}
                  </td>
                </tr>
                <tr>
                  <td className="border px-1 py-0.5 text-[11px] font-semibold">Email Id</td>
                  <td className="border px-1 py-0.5 text-[11px]">{c1?.email}</td>
                  <td className="border px-1 py-0.5 text-[11px] font-semibold">Place of Supply</td>
                  <td className="border px-1 py-0.5 text-[11px]">{eventPlaceOfSupply}</td>
                </tr>
                <tr>
                  <td className="border px-1 py-0.5 text-[11px] font-semibold">GSTIN/PAN No.</td>
                  <td className="border px-1 py-0.5 text-[11px]">{clientGstNo}</td>
                  <td className="border px-1 py-0.5 text-[11px] font-semibold">Contact No.</td>
                  <td className="border px-1 py-0.5 text-[11px]">{c1?.mobile}</td>
                  <td className="border px-1 py-0.5 text-[11px] font-semibold">Event GSTIN</td>
                  <td className="border px-1 py-0.5 text-[11px]">{eventGstNo}</td>
                </tr>
              </tbody>
            </table>

            {/* Main Items Table */}
            <table className="w-full border-collapse border mb-3">
              <thead className="bg-[#818481]">
                <tr>
                  <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] w-12">S.No.</th>
                  <th className="border px-2 py-0.5 text-[11px] text-[#1D2129]">Particulars</th>
                  <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] w-20">HSN Code</th>
                  <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] w-12">Qty.</th>
                  <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] w-12">Size</th>
                  <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] w-12">Unit</th>
                  <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] w-16">Rate</th>
                  <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] w-20">Discount</th>
                  <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] w-20">Amount</th>
                </tr>
              </thead>
              <tbody>
                {matchedEstimate && matchedEstimate?.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border px-2 py-0.5 text-[11px] text-center">{index + 1}</td>
                    <td className="border px-2 py-0.5 text-[11px]">
                      {eventName}<br />{item?.description}
                      {item?.remarks && <><br />{item.remarks}</>}
                    </td>
                    <td className="border px-2 py-0.5 text-[11px] text-center">{item?.hsn}</td>
                    <td className="border px-2 py-0.5 text-[11px] text-center">{item?.qty}</td>
                    <td className="border px-2 py-0.5 text-[11px] text-center">{item?.size}</td>
                    <td className="border px-2 py-0.5 text-[11px] text-center">{item?.unit}</td>
                    <td className="border px-2 py-0.5 text-[11px] text-center">{item?.rate}</td>
                    <td className="border px-2 py-0.5 text-[11px] text-center">{item?.disc}</td>
                    <td className="border px-2 py-0.5 text-[11px] text-center">{item?.tax}</td>
                  </tr>
                ))}
                {[...Array(16)].map((_, i) => (
                  <tr key={i} style={{ height: "30px" }}>
                    <td className="border-t border-b border-l border-r border-t-gray-200 border-b-gray-200 border-l-black border-r-black px-2 py-0.5 text-[11px]"></td>
                    <td className="border-t border-b border-l border-r border-t-gray-200 border-b-gray-200 border-l-black border-r-black px-2 py-0.5 text-[11px]"></td>
                    <td className="border-t border-b border-l border-r border-t-gray-200 border-b-gray-200 border-l-black border-r-black px-2 py-0.5 text-[11px]"></td>
                    <td className="border-t border-b border-l border-r border-t-gray-200 border-b-gray-200 border-l-black border-r-black px-2 py-0.5 text-[11px]"></td>
                    <td className="border-t border-b border-l border-r border-t-gray-200 border-b-gray-200 border-l-black border-r-black px-2 py-0.5 text-[11px]"></td>
                    <td className="border-t border-b border-l border-r border-t-gray-200 border-b-gray-200 border-l-black border-r-black px-2 py-0.5 text-[11px]"></td>
                    <td className="border-t border-b border-l border-r border-t-gray-200 border-b-gray-200 border-l-black border-r-black px-2 py-0.5 text-[11px]"></td>
                    <td className="border-t border-b border-l border-r border-t-gray-200 border-b-gray-200 border-l-black border-r-black px-2 py-0.5 text-[11px]"></td>
                    <td className="border-t border-b border-l border-r border-t-gray-200 border-b-gray-200 border-l-black border-r-black px-2 py-0.5 text-[11px]"></td>
                  </tr>
                ))}
                <tr>
                  <td className="border"></td>
                </tr>
                <tr>
                  <td colSpan="8" className="border px-2 py-0.5 text-[11px] text-right font-semibold">Total Taxable Value</td>
                  <td className="border px-2 py-0.5 text-[11px] text-center font-semibold">{totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* HSN/SAC Details and Summary */}
            <table className="w-full border-collapse border">
              <thead className="bg-[#818481]">
                <tr>
                  <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] w-30">S.No.</th>
                  <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] w-auto">HSN/SAC Details</th>
                  <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] w-12">Qty.</th>
                  <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] w-24">Taxable Value</th>
                  <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] w-20">GST Rate</th>
                  <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] w-24">GST Amount</th>
                  <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] w-24">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {matchedEstimate && matchedEstimate?.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border px-2 py-0.5 text-[11px] text-center">{index + 1}</td>
                    <td className="border px-2 py-0.5 text-[11px] text-center">{item?.hsn}</td>
                    <td className="border px-2 py-0.5 text-[11px] text-center">{item?.qty}</td>
                    <td className="border px-2 py-0.5 text-[11px] text-center">{item?.tax}</td>
                    <td className="border px-2 py-0.5 text-[11px] text-center">{item?.gstRate}%</td>
                    <td className="border px-2 py-0.5 text-[11px] text-center">{item?.cgst}</td>
                    <td className="border px-2 py-0.5 text-[11px] text-center">{item?.finalAmount.toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan="1" className="border px-2 py-0.5 text-[11px] font-semibold text-center">Amount in Words</td>
                  <td colSpan="4" className="border px-2 py-0.5 text-[11px] text-center">Seventy Thousand, Seven Hundred Ninety Nine Rupees Only</td>
                  <td className="border text-center align-middle text-[11px] font-semibold">Grand Total</td>
                  <td className="border text-center align-middle text-[11px] font-semibold">{grandTotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="7" className=" border px-2 py-0.5 text-[11px] font-semibold align-top">
                    Terms and Conditions :
                    <div className="font-normal text-[10px]">
                      1. Payments should be made by D.D/IMPS/NEFT/RTGS payable at New Delhi, favoring of Namo Gange Wellness Pvt Ltd.<br />
                      2. All disputes are subject to Delhi Jurisdiction.<br />
                      3. Proforma Invoice is subject to issue of Final Invoice.<br />
                      4. Any objection/correction/change shall be incorporated in Final Invoice.
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Bank Details and Signatures Section (NEW FOOTER) */}
            <div className="invoice-footer-section">
              <table className="avoid-break" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 0, border: '1px solid #ccc' }}>
                <colgroup>
                  <col style={{ width: '33%' }} />
                  <col style={{ width: '33%' }} />
                  <col style={{ width: '34%' }} />
                </colgroup>
                <thead>
                  <tr style={{ background: '#fafafa' }}>
                    <th style={{ border: 'none', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc', padding: '6px 8px', background: '#fafafa', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#0d1f3c', fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase' }}>
                        <Landmark size={14} strokeWidth={2} /> NGWPL Bank Details
                      </div>
                    </th>
                    <th style={{ border: 'none', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc', padding: '6px 8px', background: '#fafafa', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#0d1f3c', fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase' }}>
                        <SquarePen size={14} strokeWidth={2} /> Receiver's Acknowledgement
                      </div>
                    </th>
                    <th style={{ border: 'none', borderBottom: '1px solid #ccc', padding: '6px 8px', background: '#fafafa', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#0d1f3c', fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase' }}>
                        <SquarePen size={14} strokeWidth={2} /> For Namo Gange Wellness Pvt. Ltd.
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: 'none', borderRight: '1px solid #ccc', padding: '2px 8px 8px', verticalAlign: 'top', fontSize: 10 }}>
                      <table style={{ borderCollapse: 'collapse', border: 'none', lineHeight: '1.3', width: 'auto' }}>
                        <tbody>
                          <tr><td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none' }}>Bank Name</td><td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0' }}>:</td><td style={{ border: 'none', whiteSpace: 'nowrap', padding: '1px 0' }}>Kotak Mahindra Bank</td></tr>
                          <tr><td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none' }}>Account Name</td><td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0' }}>:</td><td style={{ border: 'none', whiteSpace: 'nowrap', padding: '1px 0' }}>Namo Gange Wellness Pvt. Ltd.</td></tr>
                          <tr><td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none' }}>Account No.</td><td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0' }}>:</td><td style={{ border: 'none', whiteSpace: 'nowrap', padding: '1px 0' }}>6812013962</td></tr>
                          <tr><td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none' }}>IFSC Code</td><td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0' }}>:</td><td style={{ border: 'none', whiteSpace: 'nowrap', padding: '1px 0', fontWeight: 700, color: '#0d1f3c' }}>KKBK0004584</td></tr>
                          <tr><td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none' }}>Branch Name</td><td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0' }}>:</td><td style={{ border: 'none', whiteSpace: 'nowrap', padding: '1px 0' }}>Jagriti Enclave, Anand Vihar, Delhi</td></tr>
                        </tbody>
                      </table>
                    </td>
                    <td style={{ border: 'none', borderRight: '1px solid #ccc', padding: '16px 8px 8px', verticalAlign: 'top', fontSize: 10 }}>
                                <div>Received the above goods / services in good condition.</div>
                                <div style={{ borderTop: '1px solid #ccc', margin: '75px 10px 8px' }}></div>
                                <div style={{ textAlign: 'center', fontStyle: 'italic', color: '#888', fontSize: 10, marginTop: 6 }}>(Signature &amp; Company Seal)</div>
                            </td>
                            <td style={{ border: 'none', padding: '2px 8px 8px', textAlign: 'center', verticalAlign: 'bottom' }}>
                                <div style={{ height: 55, marginTop: 15, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                    {sigUrl && <img loading="lazy" decoding="async" src={sigUrl} alt="Signature" style={{ maxHeight: 55, maxWidth: 120 }} />}
                                    {stampUrl && <img loading="lazy" decoding="async" src={stampUrl} alt="Stamp" style={{ maxHeight: 55, maxWidth: 55 }} />}
                                </div>
                                <div style={{ borderTop: '1px solid #ccc', margin: '35px 10px 8px' }}></div>
                                <div style={{ textAlign: 'center', fontStyle: 'italic', color: '#888', fontSize: 10, marginTop: 6 }}>Authorized Signatory.</div>
                            </td>
                  </tr>
                </tbody>
              </table>
              <div className="avoid-break" style={{ position: 'relative', height: 62, overflow: 'hidden', border: '1px solid #ccc', borderTop: 'none' }}>
                {/* navy background — banner area only, bottom-anchored */}
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 34, background: '#0d1f3c', zIndex: 0 }} />
                {/* contact row */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, fontSize: 10, fontWeight: 600, color: '#0d1f3c', zIndex: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    +91 96549 00525
                  </div>
                  <div style={{ width: 1, height: 12, background: '#ccc' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={12} /> info@namogangewellness.com</div>
                  <div style={{ width: 1, height: 12, background: '#ccc' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Globe size={12} /> www.namogangewellness.com</div>
                </div>
                {/* banner text */}
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10.5, zIndex: 2 }}>
                  <span>This is a computer generated document and does not require a physical signature.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default PerformaInvoiceDetails;
