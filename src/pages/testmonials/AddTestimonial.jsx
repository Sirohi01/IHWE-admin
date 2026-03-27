import { useState, useEffect } from "react";
import { List } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import api from "../../lib/api";
import PageHeader from '../../components/PageHeader';


const AddTestimonial = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [testimonialData, setTestimonialData] = useState({
    name: "",
    role: "",
    company: "",
    feedback: "",
    rating: 5,
    status: "inactive",
    order: 0
  });

  const [editId, setEditId] = useState(null);

  // Load data if editing
  useEffect(() => {
    if (location.state?.testimonial) {
      const testimonial = location.state.testimonial;
      setTestimonialData({
        name: testimonial.name || "",
        role: testimonial.role || "",
        company: testimonial.company || "",
        feedback: testimonial.feedback || "",
        rating: testimonial.rating || 5,
        status: testimonial.status || "inactive",
        order: testimonial.order || 0
      });
      setEditId(testimonial._id);
    }
  }, [location]);

  // ================= INPUT HANDLER =================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTestimonialData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!testimonialData.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Name is required',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    if (!testimonialData.role.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Position is required',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    if (!testimonialData.feedback.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Feedback is required',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    try {
      setLoading(true);

      let response;

      if (editId) {
        // Update existing testimonial
        response = await api.put(
          `/api/testimonials/${editId}`,
          testimonialData
        );
      } else {
        // Create new testimonial
        response = await api.post(
          '/api/testimonials',
          testimonialData
        );
      }

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: editId ? 'Testimonial updated successfully' : 'Testimonial added successfully',
          confirmButtonColor: '#3b82f6',
          timer: 2000
        }).then(() => {
          // Reset form
          setTestimonialData({
            name: "",
            role: "",
            company: "",
            feedback: "",
            rating: 5,
            status: "inactive",
            order: 0
          });
          setEditId(null);

          // Navigate to list
          navigate('/testimonials-list');
        });
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to save testimonial',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= CANCEL HANDLER =================
  const handleCancel = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Any unsaved changes will be lost",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/testimonials-list');
      }
    });
  };

  return (
    <div className="bg-white shadow-md p-6 mt-6 min-h-screen">
      <div className="w-full">
        {/* Header */}
        <PageHeader
          title={editId ? "EDIT TESTIMONIAL" : "ADD TESTIMONIALS"}
          description="Manage your testimonials details"
        >
          <button
            onClick={() => navigate('/testimonials-list')}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold transition-all shadow-lg hover:shadow-xl uppercase tracking-wider text-sm"
          >
            <List className="w-4 h-4" />
            <span>Testimonial List</span>
          </button>
        </PageHeader>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border-2 border-gray-200 p-6 shadow-lg"
        >
          <div className="space-y-6">
            {/* ROW 1 - Name, Position, Organisation */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* NAME */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={testimonialData.name}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-sm shadow-lg"
                  required
                />
              </div>

              {/* POSITION */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="role"
                  value={testimonialData.role}
                  onChange={handleInputChange}
                  placeholder="Enter position"
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-sm shadow-lg"
                  required
                />
              </div>

              {/* ORGANISATION */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organisation
                </label>
                <input
                  type="text"
                  name="company"
                  value={testimonialData.company}
                  onChange={handleInputChange}
                  placeholder="Enter organisation"
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-sm shadow-lg"
                />
              </div>
            </div>

            {/* FEEDBACK */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback <span className="text-red-500">*</span>
              </label>
              <textarea
                name="feedback"
                value={testimonialData.feedback}
                onChange={handleInputChange}
                placeholder="Enter feedback"
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-sm shadow-lg"
                required
              />
            </div>

            {/* ROW 2 - Rating, Status, Order */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* RATING */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <select
                  name="rating"
                  value={testimonialData.rating}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-sm shadow-lg"
                >
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>

              {/* STATUS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={testimonialData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-sm shadow-lg"
                >
                  <option value="inactive">Inactive</option>
                  <option value="active">Active</option>
                </select>
              </div>

              {/* ORDER */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={testimonialData.order}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-sm shadow-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>
            </div>

            {/* SUBMIT BUTTONS */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-3 bg-gray-500 text-white font-bold transition-all shadow-lg hover:shadow-xl uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#0D4715] text-white font-bold transition-all shadow-lg hover:shadow-xl uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{editId ? 'UPDATING...' : 'CREATING...'}</span>
                  </>
                ) : (
                  <span>{editId ? "UPDATE TESTIMONIAL" : "ADD TESTIMONIAL"}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTestimonial;