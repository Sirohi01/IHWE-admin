import { useState, useEffect } from "react";
import { List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api, { SERVER_URL } from "../../lib/api";
import PageHeader from "../../components/PageHeader";


const AddClients = () => {
  const navigate = useNavigate();

  const [clientData, setClientData] = useState({
    name: "",
    url: "",
    altText: "",
    status: "Active",
    showOnHomepage: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ CHECK FOR EDIT MODE
  useEffect(() => {
    const editClient = JSON.parse(localStorage.getItem("editClient"));

    if (editClient) {
      setClientData({
        name: editClient.name,
        url: editClient.url,
        altText: editClient.altText || "",
        status: editClient.status,
        showOnHomepage: editClient.showOnHomepage,
      });
      setImagePreview(
        `${SERVER_URL}${editClient.image}`
      );
      setEditId(editClient._id);
      localStorage.removeItem("editClient");
    }
  }, []);

  // ✅ INPUT HANDLER
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setClientData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ IMAGE HANDLER
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ✅ SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientData.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please enter client name",
        confirmButtonColor: "#134698",
      });
      return;
    }

    // ✅ URL IS NOW OPTIONAL - NO VALIDATION

    if (!editId && !imageFile) {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please upload an image",
        confirmButtonColor: "#134698",
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", clientData.name);
    formData.append("url", clientData.url || "#"); // ✅ DEFAULT TO # IF EMPTY
    formData.append("altText", clientData.altText || "Client Logo");
    formData.append("status", clientData.status);
    formData.append("showOnHomepage", clientData.showOnHomepage);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      setIsLoading(true);

      let response;
      if (editId) {
        response = await api.put(`/api/client/update/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/api/client/create", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data.success) {
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: editId
            ? "Client updated successfully"
            : "Client added successfully",
          confirmButtonColor: "#134698",
          timer: 2000,
        });

        setClientData({
          name: "",
          url: "",
          altText: "",
          status: "Active",
          showOnHomepage: false,
        });
        setImageFile(null);
        setImagePreview(null);
        setEditId(null);

        navigate("/clients-list");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to save client",
        confirmButtonColor: "#134698",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md p-6 mt-6 min-h-screen">
      <div className="w-full">
        {/* HEADER */}
        <PageHeader
          title={editId ? "UPDATE CLIENT" : "ADD CLIENT"}
          description="Manage your client details"
          buttonText="Clients List"
          buttonIcon={List}
          buttonPath="/clients-list"
        />

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-sm shadow-lg border-2 border-gray-200 p-6 md:p-8 space-y-6"
        >
          {/* ROW 1 */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* NAME */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Client Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={clientData.name}
                onChange={handleInputChange}
                placeholder="Enter client name"
                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors shadow-sm"
                required
              />
            </div>

            {/* URL */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Website URL<span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="url"
                value={clientData.url}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors shadow-sm"
                required
              />
            </div>
          </div>

          {/* ALT TEXT */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Alt Text
            </label>
            <input
              type="text"
              name="altText"
              value={clientData.altText}
              onChange={handleInputChange}
              placeholder="Enter image alt text"
              className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors shadow-sm"
            />
          </div>

          {/* ROW 2 */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* STATUS */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Status
              </label>
              <select
                name="status"
                value={clientData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors shadow-sm"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* SHOW ON HOMEPAGE */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Display Options
              </label>
              <div className="flex items-center gap-3 h-12 px-4 border-2 border-gray-300 shadow-sm">
                <input
                  type="checkbox"
                  name="showOnHomepage"
                  checked={clientData.showOnHomepage}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 font-medium">
                  Show on Homepage Marquee
                </span>
              </div>
            </div>
          </div>

          {/* IMAGE */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Client Logo <span className="text-red-500">*</span>
            </label>

            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 shadow-sm">
              {imagePreview ? (
                <div className="relative">
                    <img
                      src={imagePreview}
                      alt="preview"
                    className="w-full h-48 object-contain rounded-md bg-white p-4 border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 shadow-md"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer text-blue-600 font-semibold flex flex-col items-center gap-2 py-4">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="text-lg">Upload Client Logo</span>
                  <span className="text-sm text-gray-500">
                    PNG, JPG, WEBP, SVG (Max 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1e3a8a] text-white font-bold py-4 shadow-lg hover:shadow-xl transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{editId ? "Updating..." : "Adding..."}</span>
              </div>
            ) : (
              <span>{editId ? "Update Client" : "Add Client"}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddClients;