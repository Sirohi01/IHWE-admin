import React, { useRef } from "react";
import { MdOutlineModeEdit } from "react-icons/md";
import { FaPrint } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";
import { useNavigate, useParams } from "react-router-dom";
import InvoiceNumberDetails from "./InvoiceNumberDetails";

const TaxInvoiceDetails = () => {
  const { id } = useParams();
  const sameRef = useRef();
  const navigate = useNavigate();
  console.log("id", id);

  // print function

  const handleprint = useReactToPrint({
    contentRef: sameRef,
    documentTitle: "invoice",
  });

  return (
    <>
      <div className="w-full h-10  flex justify-between bg-white px-3 py-2 ">
        <h1 className="text-xl text-gray-600">INVOICE</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/payments/invoiceEdit/${id}`)}
            className="w-fit h-fit border border-[#3598dc] text-[#3598dc] text-[12px] hover:text-white hover:bg-[#3598dc] px-2 py-1  cursor-pointer"
          >
            <MdOutlineModeEdit />
          </button>

          <button
            onClick={handleprint}
            className="w-fit h-fit border border-gray-300 px-2 py-1 text-xs cursor-pointer"
          >
            <FaPrint />
          </button>
        </div>
      </div>
      <div ref={sameRef}>
        <InvoiceNumberDetails />
      </div>
    </>
  );
};

export default TaxInvoiceDetails;
