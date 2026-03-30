import React, { useState, useEffect } from "react";
import { List } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../lib/api";

const AddFacilities = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.facility;

  const [formData, setFormData] = useState({
    name: "",
    status: "Inactive",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        status: editData.status,
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editData?._id) {
        await api.put(`/api/facilities/${editData._id}`, formData);
        toast.success("Facility updated successfully");
      } else {
        await api.post("/api/facilities", formData);
        toast.success("Facility added successfully");
      }
      navigate("/facilities-list");
    } catch (error) {
      toast.error("Failed to save facility");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
      <div className="w-full text-center">
        <PageHeader
          title={editData ? "EDIT FACILITY" : "ADD FACILITIES"}
          description="Manage your facility details"
          buttonText="Facilities List"
          buttonIcon={List}
          buttonPath="/facilities-list"
        />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter facility name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="text-left">
              <label className="block text-base font-semibold text-gray-900 mb-3">
                Status <span className="text-red-500">*</span>
              </label>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="Active"
                    checked={formData.status === "Active"}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-800 font-medium">Active</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="Inactive"
                    checked={formData.status === "Inactive"}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-800 font-medium">Inactive</span>
                </label>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : editData
                  ? "Update Facility"
                  : "Add Facilities"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFacilities;