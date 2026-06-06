import React, { useRef, useState, useEffect } from "react";
import mainpic from "../../../assets/header.png";
import { useReactToPrint } from "react-to-print";
import { useLocation, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { fetchInvoices } from "../../../features/invoice/invoiceSlice";
import { fetchEstimates } from "../../../features/estimates/estimateSlice";
import { fetchCompanies } from "../../../features/company/companySlice";
import { useSelector, useDispatch } from "react-redux";
import { FaPrint } from "react-icons/fa";
import { ArrowLeft } from "lucide-react";
import InvoicePreviewTemplate from "./InvoicePreviewTemplate";

const InvoiceNumberDetails = () => {
  const { id } = useParams();
  const sameRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    matchedInvoice?.items?.reduce(
      (sum, item) => sum + (parseFloat(item.taxableValue || item.tax || 0)),
      0
    ) || 0;

  // Calculate the grand total from all items
  const grandTotal =
    matchedInvoice?.items?.reduce((sum, item) => {
      const taxableValue = parseFloat(item?.taxableValue || item?.tax) || 0;
      const totalGstRate = parseFloat(item?.gstPct || item?.gstRate) || 0;
      const itemTotalTax = (taxableValue * totalGstRate) / 100;
      return sum + itemTotalTax;
    }, 0) || 0;

  const invoiceValue = matchedInvoice?.finalAmount || (grandTotal + totalAmount);

  useEffect(() => {
    if (invoices && invoices.length > 0) {
      const match = invoices.find((e) => e?._id === id);
      setMatchedInvoice(match || null);
    }
  }, [id, invoices]);

  useEffect(() => {
    if (matchedInvoice?.companyId && companies.length > 0) {
      const matchedCompany = companies.find(
        (c) => c._id === matchedInvoice?.companyId || c.clientId === matchedInvoice?.companyId
      );
      setCompany(matchedCompany || null);
    }
  }, [matchedInvoice, companies]);

  const handleprint = useReactToPrint({
    contentRef: sameRef,
    documentTitle: "invoice",
  });

  if (!matchedInvoice) {
    return <div className="text-center p-10">Loading invoice details...</div>;
  }

  return (
    <div className="bg-gray-100 p-6 min-h-screen ">
      <div className="max-w-[1000px] mx-auto flex justify-end mb-2">
        <button
          onClick={() => navigate('/invoice-list')}
          className="bg-white rounded p-2 text-gray-500 hover:text-blue-500 shadow-sm border transition flex items-center justify-center"
          title="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={handleprint}
          className="bg-white rounded p-2 text-gray-500 hover:text-blue-500 shadow-sm border transition flex items-center justify-center"
          title="Print Invoice"
        >
          <FaPrint size={18} />
        </button>
      </div>
      <div ref={sameRef}>
        <InvoicePreviewTemplate matchedInvoice={matchedInvoice} heading={heading} />
      </div>
    </div>
  );
};

export default InvoiceNumberDetails;
