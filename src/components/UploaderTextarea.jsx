import React, { useState } from "react";
import { Link } from "react-router-dom";

const UploaderTextarea = () => {
  const [open, setopen] = useState(false);

  const handle = (options) => {
    if (options === "Send Details") {
      setopen(!open);
    } else {
      setopen(false);
    }
  };

  return (
    <>
      <div className="bg-white  mb-6   ">
        <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-3 p-4 w-full">
          <div className="flex flex-wrap gap-2 sm:gap-1">
            <button className=" w-28 h-8 flex items-center gap-1  bg-gray-200 border-2 border-black text-black text-xs sm:text-xs md:text-xs px-0.5 ">
              <div className="w-4 h-4 mb-5">
                <input
                  checked={open}
                  onChange={() => handle("Send Details")}
                  type="radio"
                  name="options"
                />
              </div>{" "}
              Send Details
            </button>

            <button className=" w-28 h-8 flex items-center gap-1  bg-gray-200 border-2 border-black text-black text-xs sm:text-xs md:text-xs px-0.5  ">
              <div className="w-4 h-4 mb-5">
                <input
                  checked={!open}
                  onChange={() => handle("Office Location")}
                  type="radio"
                  name="options"
                />
              </div>{" "}
              Office Location
            </button>

            <button className=" w-28 h-8 flex items-center gap-1  bg-gray-200 border-2 border-black text-black text-xs sm:text-xs md:text-xs px-0.5  ">
              <div className="w-4 h-4 mb-5">
                <input
                  checked={false}
                  onChange={() => handle("Venue Location")}
                  type="radio"
                  name="options"
                />
              </div>{" "}
              Venue Location
            </button>

            <button className=" w-28 h-8 flex items-center gap-1  bg-gray-200 border-2 border-black text-black text-xs sm:text-xs md:text-xs px-0.5  ">
              <div className="w-4 h-4 mb-5">
                <input
                  checked={false}
                  onChange={() => handle("Visitor Pass")}
                  type="radio"
                  name="options"
                />
              </div>{" "}
              Visitor Pass
            </button>
          </div>
        </div>

        {open && (
          <>
            {/* label */}
            <label
              htmlFor="textstatus"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Message
            </label>

            {/* Textarea */}
            <textarea
              className="w-full border border-gray-300   p-2 text-sm "
              name="textstatus"
              id="textstatus"
              rows="3"
              placeholder="Update Status...."
              maxLength="160"
              required
            ></textarea>
            {/* file Uploaders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex flex-col">
                <label
                  htmlFor="uploadedFile1"
                  className="text-sm font-medium mb-1"
                >
                  For Image
                </label>
                <input
                  type="file"
                  name="uploadedFile1"
                  id="uploadedFile1"
                  className="block w-full text-sm text-gray-900 border border-gray-300  cursor-pointer bg-transparent  file:mx-2 pt-1   file:px-2 file:rounded-sm file:border file:text-sm  file:bg-gray-200  hover:file:bg-gray-300"
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="uploadedFile2"
                  className="text-sm font-medium mb-1"
                >
                  For Image
                </label>
                <input
                  type="file"
                  name="uploadedFile2"
                  id="uploadedFile2"
                  className="block w-full text-sm text-gray-900 border border-gray-300  cursor-pointer bg-transparent  file:mx-2 pt-1   file:px-2 file:rounded-sm file:border file:text-sm  file:bg-gray-200  hover:file:bg-gray-300"
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="uploadedFile3"
                  className="text-sm font-medium mb-1"
                >
                  For Image
                </label>
                <input
                  type="file"
                  name="uploadedFile1"
                  id="uploadedFile1"
                  className="block w-full text-sm text-gray-900 border border-gray-300  cursor-pointer bg-transparent  file:mx-2 pt-1   file:px-2 file:rounded-sm file:border file:text-sm  file:bg-gray-200  hover:file:bg-gray-300"
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="uploadedFile4"
                  className="text-sm font-medium mb-1"
                >
                  For Pdf
                </label>

                <input
                  type="file"
                  name="uploadedFile1"
                  id="uploadedFile1"
                  className="block w-full text-sm text-gray-900 border border-gray-300  cursor-pointer bg-transparent  file:mx-2 pt-1   file:px-2 file:rounded-sm file:border file:text-sm  file:bg-gray-200  hover:file:bg-gray-300"
                />
              </div>
            </div>
          </>
        )}

        {/* Footer Row */}
        <div className="flex justify-between items-center p-4 gap-2">
          <p className="text-red-500 text-xs">Maximum character limit 160</p>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-1.5 text-sm font-medium bg-[#3598dc] hover:bg-[#276b99] text-white cursor-pointer"
            >
              SENT
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-sm font-medium bg-[#3598dc] hover:bg-[#276b99] text-white cursor-pointer"
            >
              <Link to="/history">HISTORY</Link>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploaderTextarea;
