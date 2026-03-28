import React from "react";

const Textarea = () => {
  return (
    <div className="bg-white mt-4 mb-6 p-4  ">
      {/* Label */}
      <label
        htmlFor="textstatus"
        className="block text-sm font-semibold text-gray-700 mb-2"
      >
        Message
      </label>

      {/* Textarea */}
      <textarea
        className="w-full border border-gray-300  focus:ring-0 focus:ring-blue-500 focus:border-blue-500 p-2 text-sm "
        name="textstatus"
        id="textstatus"
        rows="3"
        placeholder="Update Status...."
        maxLength="160"
        required
      ></textarea>

      {/* Footer Row */}
      <div className="flex justify-between items-center pt-2">
        <p className="text-red-500 text-xs">Maximum character limit 160</p>
        <button
          type="submit"
          className="px-4 py-1.5 text-sm font-medium bg-[#337AB7] hover:bg-blue-700 text-white  shadow-sm cursor-pointer"
        >
          POST
        </button>
      </div>
    </div>
  );
};

export default Textarea;
