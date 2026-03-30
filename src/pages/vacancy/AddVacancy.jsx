import React, { useState, useEffect } from "react";
import { List } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import PageHeader from "../../components/PageHeader";
import api from "../../lib/api";

const AddVacancy = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state;

  const [vacancyData, setVacancyData] = useState({
    title: "",
    experience: "",
    salary: "Not disclosed",
    location: "",
    description: "",
    requirements: "",
    vacancyCount: "",
    status: "active",
    order: 0,
  });

  const [loading, setLoading] = useState(false);

  // Load edit data if available
  useEffect(() => {
    if (editData) {
      setVacancyData({
        title: editData.title || "",
        experience: editData.experience || "",
        salary: editData.salary || "Not disclosed",
        location: editData.location || "",
        description: editData.description || "",
        requirements: Array.isArray(editData.requirements)
          ? editData.requirements.join("\n")
          : "",
        vacancyCount: editData.vacancyCount || "",
        status: editData.status || "active",
        order: editData.order || 0,
      });
    }
  }, [editData]);

  // Input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVacancyData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!vacancyData.title || !vacancyData.experience || !vacancyData.location) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Title, Experience, and Location are required!",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...vacancyData,
        requirements: vacancyData.requirements
          .split("\n")
          .filter((r) => r.trim() !== ""),
      };

      if (editData?._id) {
        // Update existing vacancy
        const response = await api.put(`/api/vacancies/${editData._id}`, payload);

        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Updated!",
            text: "Vacancy updated successfully",
            confirmButtonColor: "#1e3a8a",
            timer: 2000,
          });
          navigate("/vacancy-list");
        }
      } else {
        // Create new vacancy
        const response = await api.post("/api/vacancies", payload);

        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Created!",
            text: "Vacancy created successfully",
            confirmButtonColor: "#1e3a8a",
            timer: 2000,
          });

          // Reset form
          setVacancyData({
            title: "",
            experience: "",
            salary: "Not disclosed",
            location: "",
            description: "",
            requirements: "",
            vacancyCount: "",
            status: "active",
            order: 0,
          });

          navigate("/vacancy-list");
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to save vacancy",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
      <div className="w-full text-center">
        {/* HEADER WITH BLUE BACKGROUND */}
        <div className="mb-6 ">
          <PageHeader
            title={editData ? "EDIT VACANCY" : "ADD VACANCY"}
            description="Manage your vacancy details"
          >
            <button
              onClick={() => navigate("/vacancy-list")}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold transition-all shadow-lg hover:shadow-xl uppercase tracking-wider text-sm"
            >
              <List className="w-4 h-4" />
              Vacancy List
            </button>
          </PageHeader>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border-2 border-gray-200 p-6 md:p-8 space-y-6 shadow-lg"
        >
          {/* ROW 1 */}
          <div className="grid md:grid-cols-3 gap-5">
            {/* JOB TITLE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={vacancyData.title}
                onChange={handleInputChange}
                placeholder="Enter job title"
                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#1e3a8a] transition-colors text-sm shadow-sm"
                required
              />
            </div>

            {/* EXPERIENCE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="experience"
                value={vacancyData.experience}
                onChange={handleInputChange}
                placeholder="e.g., Minimum 2-3 Years"
                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#1e3a8a] transition-colors text-sm shadow-sm"
                required
              />
            </div>

            {/* LOCATION */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={vacancyData.location}
                onChange={handleInputChange}
                placeholder="e.g., Ghaziabad"
                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#1e3a8a] transition-colors text-sm shadow-sm"
                required
              />
            </div>
          </div>

          {/* ROW 2 */}
          <div className="grid md:grid-cols-3 gap-5">
            {/* SALARY */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary
              </label>
              <input
                type="text"
                name="salary"
                value={vacancyData.salary}
                onChange={handleInputChange}
                placeholder="Not disclosed"
                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#1e3a8a] transition-colors text-sm shadow-sm"
              />
            </div>

            {/* NO. OF VACANCY */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                No. of Vacancy
              </label>
              <input
                type="number"
                name="vacancyCount"
                value={vacancyData.vacancyCount}
                onChange={handleInputChange}
                placeholder="Enter number of vacancies"
                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#1e3a8a] transition-colors text-sm shadow-sm"
                min="1"
              />
            </div>

            {/* ORDER */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                name="order"
                value={vacancyData.order}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#1e3a8a] transition-colors text-sm shadow-sm"
                min="0"
              />
            </div>
          </div>

          {/* ROW 3 */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* STATUS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="mt-2 flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={vacancyData.status === "active"}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4 text-blue-600 cursor-pointer"
                  />
                  <span className="text-gray-700 font-medium">Active</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={vacancyData.status === "inactive"}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4 text-blue-600 cursor-pointer"
                  />
                  <span className="text-gray-700 font-medium">Inactive</span>
                </label>
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={vacancyData.description}
              onChange={handleInputChange}
              placeholder="Brief description about the job..."
              rows="3"
              className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#1e3a8a] transition-colors resize-none text-sm shadow-sm"
            />
          </div>

          {/* KEY REQUIREMENTS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Requirements (one per line)
            </label>
            <textarea
              name="requirements"
              value={vacancyData.requirements}
              onChange={handleInputChange}
              placeholder="Enter each requirement on a new line..."
              rows="6"
              className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#1e3a8a] transition-colors resize-none text-sm shadow-sm"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-[#1e3a8a] text-white font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editData ? "Update Vacancy" : "Add Vacancy"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVacancy;