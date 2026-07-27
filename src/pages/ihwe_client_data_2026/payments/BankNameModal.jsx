import React, { useState } from "react";

const BankNameModal = ({ isModalOpen, setIsModalOpen, onSave }) => {
    if (!isModalOpen) return null;
  
    const bankOptions = [
      "Kotak Mahindra Bank",
      "Punjab National Bank",
      "HDFC Bank",
      "ICICI Bank",
      "State Bank of India",
    ];
  
    const [selectedBank, setSelectedBank] = useState("");
  
    const handleSave = () => {
      onSave(selectedBank);
      // Reset selectedBank state in modal after successful save
      setSelectedBank("");
    };
  return (
    <>
    {/* Backdrop/Overlay */}
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
      onClick={() => setIsModalOpen(false)}
      aria-hidden="true"
    />

    {/* Modal Container */}
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white w-full max-w-sm mx-auto rounded-lg shadow-2xl transform transition-all duration-300 ease-out p-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <h2 id="modal-title" className="text-xl font-bold text-gray-800">
            Select Bank Name
          </h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-gray-500 hover:text-gray-800 p-1 transition-colors"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="mt-6">
          <label
            htmlFor="bank-select"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Choose Bank *
          </label>
          <select
            id="bank-select"
            className="w-full border border-gray-300 px-3 py-2 text-base rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            required
          >
            <option value="" disabled>
              -- Select Option --
            </option>
            {bankOptions.map((bank, index) => (
              <option key={index} value={bank}>
                {bank}
              </option>
            ))}
          </select>
        </div>

        {/* Footer / Action Buttons */}
        <div className="flex justify-end mt-8 space-x-3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Save & Submit
          </button>
        </div>
      </div>
    </div>
  </>
  )
}

export default BankNameModal
