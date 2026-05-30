import React, { useRef, useState, useEffect } from "react";
import mainpic from "../../../assets/header.png";
import { useReactToPrint } from "react-to-print";
import { useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import { fetchInvoices } from "../../../features/invoice/invoiceSlice";
import { fetchEstimates } from "../../../features/estimates/estimateSlice";
import { fetchCompanies } from "../../../features/company/companySlice";
import { useSelector, useDispatch } from "react-redux";

const InvoiceNumberDetails = () => {
  const { id } = useParams();
  const sameRef = useRef();
  const dispatch = useDispatch();
  const location = useLocation();
  const heading = location.state?.heading || "";
  const [matchedInvoice, setMatchedInvoice] = useState(null);
  const [company, setCompany] = useState(null);
  const [matchedEstimate, setMatchedEstimate] = useState(null);

  // redux logic
  const { invoices } = useSelector((state) => state.invoice);
  const { companies } = useSelector((state) => state.companies);
  const { estimates, loading } = useSelector((state) => state.estimates);

  //   console.log("id", id);
  //   console.log("invoices", invoices);
  // console.log("matchedInvoice", matchedInvoice);
  // console.log("matchedEstimate", matchedEstimate);
  //   console.log("companies", companies);
  //   console.log("company", company);

  React.useEffect(() => {
    dispatch(fetchInvoices());
    dispatch(fetchCompanies());
  }, [dispatch]);

  const totalAmount =
    matchedEstimate?.items?.reduce(
      (sum, item) => sum + (parseFloat(item.tax) || 0),
      0
    ) || 0;

  // Calculate the grand total from all items
  const grandTotal =
    matchedEstimate?.items?.reduce((sum, item) => {
      const taxableValue = parseFloat(item?.tax) || 0;
      const totalGstRate = parseFloat(item?.gstRate) || 0;
      const itemTotalTax = (taxableValue * totalGstRate) / 100;
      return sum + itemTotalTax;
    }, 0) || 0;

  const invoiceValue = grandTotal + totalAmount;

  useEffect(() => {
    // Match estimate using est_no (since your route uses est_no like "NGW/25-26/EST/009")
    if (invoices && invoices.length > 0) {
      const match = invoices.find((e) => e?._id === id);
      setMatchedInvoice(match || null);
    }
  }, [id, invoices]);

  useEffect(() => {
    if (matchedInvoice?.companyId) {
      dispatch(fetchEstimates(matchedInvoice.companyId));
    }
  }, [matchedInvoice?.companyId, dispatch]);

  useEffect(() => {
    if (estimates && estimates.length > 0 && matchedInvoice) {
      const match = estimates.find(
        (e) => e.est_no === matchedInvoice?.estimate_no
      );
      setMatchedEstimate(match || null);
    }
  }, [matchedInvoice, estimates]);

  useEffect(() => {
    if (matchedEstimate && companies.length > 0) {
      // Match company using the companyId from the matched estimate
      const matchedCompany = companies.find(
        (c) => c._id === matchedEstimate?.companyId
      );
      setCompany(matchedCompany || null);
    }
  }, [matchedEstimate, companies]);

  const handleprint = useReactToPrint({
    contentRef: sameRef, // Changed from contentRef to content
    documentTitle: "invoice",
  });

  return (
    <div className="bg-gray-100 p-6 min-h-screen ">
      <div ref={sameRef} className="max-w-6xl mx-auto bg-white  px-6 py-0.5">
        <img className=" my-2" src={mainpic} alt="" />
        <div className="flex justify-between sm:text-[11px] md:text-sm my-2 pl-110 pr-8">
          <h1 className="font-semibold text-center">Tax Invoice</h1>
          <h1 className="font-semibold text-center pt-1">{heading}</h1>
        </div>
        {/* Client + Invoice Info */}
        {/* Client and Estimate Details Table */}
        <table className="w-full border-collapse border mb-3">
          <thead>
            <tr className="bg-[#818481]">
              <th
                colSpan="1"
                className="border text-center py-0.5 text-[#1d2129] text-[11px] font-semibold"
              >
                Buyer's Name & Address
              </th>
              <th
                colSpan="1"
                className="border text-center py-0.5 text-[#1d2129] text-[11px] font-semibold"
              >
                Shipment Details
              </th>
              <th
                colSpan="2"
                className="border text-center py-0.5 text-[#1d2129] text-[11px] font-semibold"
              >
                Seller Invoice Details
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border">
              <td className=" px-1 py-0.5 text-[11px] ">
                {company?.companyName}
              </td>
              <td className="border px-1 py-0.5 text-[11px]">
                {matchedInvoice?.consignee_name}
              </td>
              <td className="border px-1 py-0.5 font-semibold text-[11px] ">
                Invoice No.
              </td>
              <td className=" px-1 py-0.5 text-[11px] ">
                {matchedInvoice?.invoice_no}
              </td>
            </tr>
            <tr className="border">
              <td className=" px-1 py-0.5 text-[11px] ">
                {[
                  company?.landline,
                  company?.address,
                  company?.city,
                  company?.state,
                  company?.country,
                  company?.pincode,
                ]
                  .filter(Boolean) // remove empty or undefined values
                  .join(", ")}{" "}
              </td>
              <td className=" border px-1 py-0.5 text-[11px]">
                {[
                  matchedInvoice?.address,
                  matchedInvoice?.city,
                  matchedInvoice?.state,
                  matchedInvoice?.country,
                  matchedInvoice?.pincode,
                ]
                  .filter(Boolean) // remove empty or undefined values
                  .join(", ")}{" "}
              </td>
              <td className="border px-1 py-0.5 font-semibold text-[11px] ">
                Invoice Date
              </td>
              <td className="px-1 py-0.5 text-[11px]">
                {matchedInvoice?.supply_date
                  ? new Date(matchedInvoice.added).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : ""}
              </td>
            </tr>
            <tr className="border">
              <td className=" px-1 py-0.5 text-[11px] ">
                {[company?.city, company?.state, company?.country]
                  .filter(Boolean) // remove empty or undefined values
                  .join(", ")}{" "}
              </td>
              <td className=" border px-1 py-0.5 text-[11px] ">
                {[
                  matchedInvoice?.city,
                  matchedInvoice?.state,
                  matchedInvoice?.country,
                ]
                  .filter(Boolean) // remove empty or undefined values
                  .join(", ")}{" "}
              </td>
              <td className="border px-1 py-0.5 font-semibold text-[11px]">
                Estimate No.
              </td>
              <td className=" px-1 py-0.5 text-[11px] ">
                {matchedInvoice?.estimate_no}
              </td>
            </tr>
            <tr className="border">
              <td className=" px-1 py-0.5 text-[11px] ">
                Contact Person :{" "}
                {[
                  company?.contacts?.[0]?.title,
                  company?.contacts?.[0]?.firstName,
                  company?.contacts?.[0]?.surname,
                ]
                  .filter(Boolean) // removes empty or undefined values
                  .join(" ")}
              </td>
              <td className=" border px-1 py-0.5 text-[11px]">
                Place of Supply & State : {matchedInvoice?.city} |{" "}
                {matchedInvoice?.state}
              </td>
              <td className="border px-1 py-0.5 font-semibold text-[11px] ">
                Estimate Status
              </td>
              <td className=" px-1 py-0.5 text-[11px]">
                {" "}
                {matchedInvoice?.status}
              </td>
            </tr>
            <tr className="border">
              <td className=" px-1 py-0.5 text-[11px] ">
                Email : {company?.contacts?.[0]?.email}
              </td>
              <td className=" border px-1 py-0.5 text-[11px]">
                State of Supply & Code : {matchedInvoice?.state} |{" "}
                {matchedInvoice?.stateCode}
              </td>
              <td className="border px-1 py-0.5 font-semibold text-[11px] ">
                Date of Supply
              </td>
              <td className=" px-1 py-0.5 text-[11px]">
                {" "}
                {matchedInvoice?.supply_date
                  ? new Date(matchedInvoice.supply_date).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )
                  : ""}
              </td>
            </tr>
            <tr className="border">
              <td className=" px-1 py-0.5 text-[11px] ">
                GSTIN/PAN No. : {matchedInvoice?.gst_no}...
              </td>
              <td className="border px-1 py-0.5 text-[11px]">
                GSTIN/PAN No. : {matchedInvoice?.gst_no}
              </td>
              <td className="border px-1 py-0.5 font-semibold text-[11px] ">
                Reverse Charge
              </td>
              <td className=" px-1 py-0.5 text-[11px]">No</td>
            </tr>
          </tbody>
        </table>

        {/* Main Items Table */}
        <table className="w-full border-collapse border  mb-3">
          <thead className="bg-[#818481]">
            <tr>
              <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] w-12">
                S.No.
              </th>
              <th className="border px-2 py-0.5 text-[11px] text-[#1D2129]">
                Item Description
              </th>
              <th className="border px-2 py-0.5 text-[11px] text-[#1D2129]  w-20">
                HSN Code
              </th>
              <th className="border px-2 py-0.5 text-[11px] text-[#1D2129]  w-12">
                Qty.
              </th>
              <th className="border px-2 py-0.5 text-[11px] text-[#1D2129]  w-12">
                Size
              </th>
              <th className="border px-2 py-0.5 text-[11px] text-[#1D2129]  w-12">
                Rate
              </th>
              <th className="border px-2 py-0.5 text-[11px] text-[#1D2129]  w-16">
                Amount
              </th>
              <th className="border px-2 py-0.5 text-[11px] text-[#1D2129]  w-20">
                Discount
              </th>
              <th className="border px-2 py-0.5 text-[11px] text-[#1D2129]  w-20">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {matchedEstimate &&
              matchedEstimate?.items.map((item, index) => (
                <tr key={index}>
                  <td className="border  px-2 py-0.5 text-[11px] text-center">
                    {index + 1}
                  </td>
                  <td className="border  px-2 py-0.5 text-[11px]">
                    {matchedEstimate?.consignee_name}
                    <br />
                    {item?.remarks}
                  </td>
                  <td className="border  px-2 py-0.5 text-[11px] text-center">
                    {item?.hsn}
                  </td>
                  <td className="border  px-2 py-0.5 text-[11px] text-center">
                    {item?.qty}
                  </td>
                  <td className="border  px-2 py-0.5 text-[11px] text-center">
                    {item?.size} {item?.unit}
                  </td>
                  <td className="border  px-2 py-0.5 text-[11px] text-center">
                    {item?.rate}
                  </td>
                  <td className="border  px-2 py-0.5 text-[11px] text-center">
                    {item?.amount}
                  </td>
                  <td className="border  px-2 py-0.5 text-[11px] text-center">
                    {item?.disc}
                  </td>
                  <td className="border  px-2 py-0.5 text-[11px] text-center">
                    {item?.tax}
                  </td>
                </tr>
              ))}
            {/* Empty rows for spacing */}
            {[...Array(10)].map((_, i) => (
              <tr key={i} style={{ height: "30px" }}>
                <td className="border-t border-b border-l border-r border-t-gray-100 border-b-gray-100  border-l-black border-r-black  px-2 py-0.5 text-[11px]"></td>
                <td className="border-t border-b border-l border-r border-t-gray-100 border-b-gray-100  border-l-black border-r-black  px-2 py-0.5 text-[11px]"></td>
                <td className="border-t border-b border-l border-r border-t-gray-100 border-b-gray-100  border-l-black border-r-black px-2 py-0.5 text-[11px]"></td>
                <td className="border-t border-b border-l border-r border-t-gray-100 border-b-gray-100  border-l-black border-r-black px-2 py-0.5 text-[11px]"></td>
                <td className="border-t border-b border-l border-r border-t-gray-100 border-b-gray-100  border-l-black border-r-black px-2 py-0.5 text-[11px]"></td>
                <td className="border-t border-b border-l border-r border-t-gray-100 border-b-gray-100  border-l-black border-r-black px-2 py-0.5 text-[11px]"></td>
                <td className="border-t border-b border-l border-r border-t-gray-100 border-b-gray-100  border-l-black border-r-black px-2 py-0.5 text-[11px]"></td>
                <td className="border-t border-b border-l border-r border-t-gray-100 border-b-gray-100  border-l-black border-r-black px-2 py-0.5 text-[11px]"></td>
                <td className="border-t border-b border-l border-r border-t-gray-100 border-b-gray-100  border-l-black border-r-black px-2 py-0.5 text-[11px]"></td>
              </tr>
            ))}
            <tr>
              <td className="px-2 text-[11px] text-center"></td>
            </tr>
            <tr>
              <td
                colSpan="8"
                className="border  px-2 py-0.5 text-[11px] text-right font-semibold"
              >
                Total Taxable Value
              </td>
              <td className="border  px-2 py-0.5 text-[11px] text-center font-semibold">
                {totalAmount?.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* HSN/SAC Details and Summary */}
        <table className="w-[100%] border-collapse border mb-3">
          <thead className="bg-[#818481]">
            <tr>
              <th
                rowSpan="2"
                className="border px-2 py-0.5 text-[11px] text-[#1D2129]  w-[5%]"
              >
                S.No.
              </th>
              <th
                rowSpan="2"
                className="border px-2 py-0.5 text-[11px] text-[#1D2129]  w-[15%]"
              >
                HSN/SAC Details
              </th>
              <th
                rowSpan="2"
                className="border px-2 py-0.5 text-[11px] text-[#1D2129]  w-[15%]"
              >
                Item Value
              </th>
              <th
                rowSpan="2"
                className="border px-2 py-0.5 text-[11px] text-[#1D2129]  w-[10%]"
              >
                Qty.
              </th>
              <th
                colSpan="7"
                className="border px-2 py-0.5 text-[11px] text-[#1D2129]  w-auto"
              >
                GST Details Item No. 1 to 1
              </th>
            </tr>
            <tr>
              <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] ">
                CGST(%)
              </th>
              <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] ">
                Amount
              </th>
              <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] ">
                SGST(%)
              </th>
              <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] ">
                Amount
              </th>
              <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] ">
                IGST(%)
              </th>
              <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] ">
                Amount
              </th>
              <th className="border px-2 py-0.5 text-[11px] text-[#1D2129] ">
                Total Tax
              </th>
            </tr>
          </thead>
          <tbody>
            {matchedEstimate &&
              matchedEstimate?.items.map((item, index) => {
                const isInterstate =
                  matchedInvoice?.type_of_invoice === "Interstate Sale";
                const taxableValue = parseFloat(item?.tax) || 0;
                const totalGstRate = parseFloat(item?.gstRate) || 0;
                const totalGstAmount = (taxableValue * totalGstRate) / 100;
                const totalTax = totalGstAmount;

                return (
                  <tr key={item._id || index}>
                    <td className="border px-2 py-0.5 text-[11px] text-center">
                      {index + 1}
                    </td>
                    <td className="border px-2 py-0.5 text-[11px] text-center">
                      {item?.hsn}
                    </td>
                    <td className="border px-2 py-0.5 text-[11px] text-center">
                      {item?.tax}
                    </td>
                    <td className="border px-2 py-0.5 text-[11px] text-center">
                      {item?.qty}
                    </td>
                    {isInterstate ? (
                      <>
                        <td className="border px-2 py-0.5 text-[11px] text-center">
                          {(totalGstRate / 2).toFixed(2)}
                        </td>
                        <td className="border px-2 py-0.5 text-[11px] text-center">
                          {(totalGstAmount / 2).toFixed(2)}
                        </td>
                        <td className="border px-2 py-0.5 text-[11px] text-center">
                          {(totalGstRate / 2).toFixed(2)}
                        </td>
                        <td className="border px-2 py-0.5 text-[11px] text-center">
                          {(totalGstAmount / 2).toFixed(2)}
                        </td>
                        <td className="border px-2 py-0.5 text-[11px] text-center"></td>
                        <td className="border px-2 py-0.5 text-[11px] text-center"></td>
                      </>
                    ) : (
                      <>
                        <td className="border px-2 py-0.5 text-[11px] text-center"></td>
                        <td className="border px-2 py-0.5 text-[11px] text-center"></td>
                        <td className="border px-2 py-0.5 text-[11px] text-center"></td>
                        <td className="border px-2 py-0.5 text-[11px] text-center"></td>
                        <td className="border px-2 py-0.5 text-[11px] text-center">
                          {totalGstRate.toFixed(2)}
                        </td>
                        <td className="border px-2 py-0.5 text-[11px] text-center">
                          {totalGstAmount.toFixed(2)}
                        </td>
                      </>
                    )}
                    <td className="border px-2 py-0.5 text-[11px] text-center">
                      {totalTax?.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            <tr>
              <td
                colSpan="2"
                className="border px-2 py-0.5 text-[11px] font-semibold text-center"
              >
                Amount in Words
              </td>
              <td
                colSpan="6"
                className="border px-2 py-0.5 text-[11px] font-semibold "
              >
                Seventy Thousand, Seven Hundred Ninety Nine Rupees Only
              </td>
              <td
                colSpan="2"
                className="border text-center align-middle text-[11px] font-semibold"
              >
                Grand Total
              </td>
              <td className="border text-center align-middle text-[11px] font-semibold">
                {grandTotal.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        <table className="border mb-3 w-[100%]">
          <thead>
            <tr>
              <th className="w-[20%] text-center px-2 py-0.5 font-semibold text-[11px] border">
                Amount in Words
              </th>
              <th className="w-[62%] text-left px-2 py-0.5 font-semibold text-[11px] border  ">
                One Hundred Thousand, Six Hundred Point Four Eight Rupees Only.
              </th>
              <th className="w-[10%] text-center px-4 py-0.5 font-semibold text-[11px] border">
                Invoice Value
              </th>
              <th className="w-[8%] text-center px-4 py-0.5 font-semibold text-[11px] border">
                {invoiceValue.toFixed(2)}
              </th>
            </tr>
          </thead>
        </table>

        {/* Bank Details and Signatures Section */}
        <table className="w-full border-collapse border border-gray-400">
          <thead>
            <tr>
              <td
                colSpan="7"
                className=" border px-2 py-0.5 text-[11px] font-semibold align-top"
              >
                Terms and Conditions :
                <div className="font-normal">
                  1. Payments should be made through crossed
                  cheque/D.D./RTGS/NEFT payable at Delhi, favouring Namo Gange
                  Wellness Pvt. Ltd.
                  <br />
                  2. Interest @24% p.a will be charged if the payment is not
                  made within 7 days from the date of issue of bill.
                  <br />
                  3. All Disputes are subject to Delhi Jurisdiction.
                  <br />
                </div>
              </td>
            </tr>
          </thead>
          <thead className="bg-[#818481]">
            <tr>
              <th
                colSpan="2"
                className="border px-2 py-0.5 text-[11px] text-[#1D2129]  text-left w-[40%]"
              >
                Namo Gange Wellness Pvt. Ltd. Bank Details
              </th>
              <th className="border px-2 py-0.5 text-[11px] text-[#1D2129]  text-center w-[30%]">
                Client Signature
              </th>
              <th className="border px-2 py-0.5 text-[11px] text-[#1D2129]  text-center w-[30%]">
                For Namo Gange Wellness Pvt. Ltd.
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className=" pl-2  text-[11px] ">Bank Name</td>
              <td className=" px-2  text-[11px]">: Kotak Mahindra Bank</td>
              <td
                rowSpan="4"
                className=" border px-2 text-[11px] text-center align-bottom"
                style={{ height: "80px", width: "30%" }}
              >
                <div>Auth.Signatory</div>
              </td>
              <td
                rowSpan="4"
                className=" border px-2 text-[11px] text-center align-bottom"
                style={{ height: "80px", width: "30%" }}
              >
                <div>Auth.Signatory</div>
              </td>
            </tr>
            <tr>
              <td className=" pl-2   text-[11px] ">Account No.</td>
              <td className=" px-2  text-[11px]">: 6812013962</td>
            </tr>
            <tr>
              <td className=" pl-2  text-[11px] ">IFSC Code</td>
              <td className=" px-2  text-[11px]">: KKBK0004584</td>
            </tr>
            <tr>
              <td className=" pl-2  text-[11px] ">Branch Name</td>
              <td className=" px-2  text-[11px]">
                : Jagriti Enclave, Anand Vihar, Delhi, India
              </td>
            </tr>
          </tbody>
        </table>
        <div className="flex justify-center text-[11px] pt-2 pb-5 text-gray-900">
          Registered Address : First Floor, E-1, Opposite KFC, Kalkaji Main
          Market, South Delhi-110019, Delhi, India
        </div>
      </div>
    </div>
  );
};

export default InvoiceNumberDetails;
