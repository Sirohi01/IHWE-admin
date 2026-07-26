import React, { useState } from "react";
import { ArrowLeft, Save, RotateCcw, ClipboardList, ChevronDown } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createStatusOption, updateStatusOption } from "../../features/add_by_admin/statusOption/statusOptionSlice";
import Swal from "sweetalert2";

const AddStatusForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { statusOptions } = useSelector((state) => state.statusOptions) || { statusOptions: [] };
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    status_code: "",
    description: "",
    display_order: 1,
    status: "active",
    color: "#2563eb",
    applicable_for: [],
  });

  React.useEffect(() => {
    if (id && statusOptions.length > 0) {
      const existingStatus = statusOptions.find(s => s._id === id);
      if (existingStatus) {
        setFormData({
          name: existingStatus.name || "",
          status_code: existingStatus.status_code || "",
          description: existingStatus.description || "",
          display_order: existingStatus.display_order || 1,
          status: String(existingStatus.status || "inactive").toLowerCase() === "active" ? "active" : "inactive",
          color: existingStatus.color || "#2563eb",
          applicable_for: Array.isArray(existingStatus.applicable_for) ? existingStatus.applicable_for : [],
        });
      }
    } else if (!id && statusOptions.length > 0) {
      const maxOrder = Math.max(...statusOptions.map(s => Number(s.display_order) || 0));
      setFormData(prev => ({ ...prev, display_order: maxOrder + 1 }));
    }
  }, [id, statusOptions]);

  const handleCheckboxChange = (option) => {
    setFormData((prev) => {
      let newApplicableFor = [...prev.applicable_for];
      if (option === "All") {
        newApplicableFor = newApplicableFor.includes("All") ? [] : ["All", "Exhibitor Lead", "Buyer Lead", "Sponsor Lead", "General Lead"];
      } else {
        if (newApplicableFor.includes(option)) {
          newApplicableFor = newApplicableFor.filter((i) => i !== option);
          newApplicableFor = newApplicableFor.filter((i) => i !== "All");
        } else {
          newApplicableFor.push(option);
          if (newApplicableFor.length === 4 && !newApplicableFor.includes("All")) {
            newApplicableFor.push("All");
          }
        }
      }
      return { ...prev, applicable_for: newApplicableFor };
    });
  };

  const handleReset = () => {
    setFormData({
      name: "",
      status_code: "",
      description: "",
      display_order: 1,
      status: "active",
      color: "#2563eb",
      applicable_for: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return Swal.fire({ icon: "warning", title: "Warning", text: "Lead Status Name is required.", confirmButtonColor: "#08752f" });
    if (!formData.display_order) return Swal.fire({ icon: "warning", title: "Warning", text: "Display Order is required.", confirmButtonColor: "#08752f" });
    if (formData.applicable_for.length === 0) return Swal.fire({ icon: "warning", title: "Warning", text: "Please select at least one Applicable For option.", confirmButtonColor: "#08752f" });

    setIsSaving(true);
    try {
      const payload = { ...formData };
      if (id) {
        await dispatch(updateStatusOption({ id, data: payload })).unwrap();
        Swal.fire({ icon: "success", title: "Success", text: "Lead Status Updated successfully", timer: 1500, showConfirmButton: false });
      } else {
        await dispatch(createStatusOption(payload)).unwrap();
        Swal.fire({ icon: "success", title: "Success", text: "Lead Status Added successfully", timer: 1500, showConfirmButton: false });
      }
      navigate("/ihweClientData2026/AddStatus");
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err?.message || "Operation failed", confirmButtonColor: "#08752f" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen p-6 animate-fadeIn font-sans">
      <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200">
        
        {/* Header Area */}
        <div className="px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 mb-4">
              <span>System Configuration</span>
              <span className="text-gray-300">&gt;</span>
              <span className="text-[#08752f] font-bold">Lead Status</span>
              <span className="text-gray-300">&gt;</span>
              <span className="text-blue-600 font-bold">{id ? "Edit Status" : "Add New"}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#08752f] rounded-[10px] flex items-center justify-center shrink-0">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-[22px] font-bold text-[#111827] tracking-tight">{id ? "Edit Lead Status" : "Add New Lead Status"}</h1>
                <p className="text-[12px] text-gray-500 font-semibold mt-1">{id ? "Update the details of this lead status." : "Create a new lead status for tracking and management."}</p>
              </div>
            </div>
          </div>
          
          <Link to="/ihweClientData2026/AddStatus" className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-lg bg-white text-xs font-bold text-[#111827] hover:bg-gray-50 transition-colors shrink-0 shadow-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Lead Status
          </Link>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6">
            <h2 className="text-[14px] font-bold text-[#08752f] mb-8">Lead Status Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {/* Row 1 */}
              <div>
                <label className="block text-[13px] font-bold text-[#111827] mb-2.5">Lead Status Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter lead status name"
                  className="w-full h-[42px] px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-[#08752f] focus:ring-1 focus:ring-[#08752f] text-[13px] font-semibold text-gray-800 transition-shadow"
                />
                <p className="text-[11px] text-gray-500 mt-2 font-semibold">Example: New Lead, In Progress, Qualified etc.</p>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#111827] mb-2.5">Status Code <span className="text-gray-400 font-semibold">(Optional)</span></label>
                <input
                  type="text"
                  maxLength={10}
                  value={formData.status_code}
                  onChange={(e) => setFormData({ ...formData, status_code: e.target.value })}
                  placeholder="Enter status code (max 10 characters)"
                  className="w-full h-[42px] px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-[#08752f] focus:ring-1 focus:ring-[#08752f] text-[13px] font-semibold text-gray-800 transition-shadow"
                />
                <p className="text-[11px] text-gray-500 mt-2 font-semibold">For internal reference only.</p>
              </div>

              {/* Row 2 */}
              <div>
                <label className="block text-[13px] font-bold text-[#111827] mb-2.5">Description <span className="text-gray-400 font-semibold">(Optional)</span></label>
                <div className="relative">
                  <textarea
                    maxLength={200}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter description"
                    className="w-full h-28 p-4 border border-gray-200 rounded-lg focus:outline-none focus:border-[#08752f] focus:ring-1 focus:ring-[#08752f] text-[13px] font-semibold text-gray-800 resize-none transition-shadow"
                  ></textarea>
                  <span className="absolute bottom-3 right-3 text-[10px] font-semibold text-gray-400 bg-white px-1">{formData.description.length} / 200</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-2 font-semibold">Brief description of this lead status.</p>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#111827] mb-2.5">Display Order <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                    placeholder="Enter order"
                    className="w-full h-[42px] px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-[#08752f] focus:ring-1 focus:ring-[#08752f] text-[13px] font-semibold text-gray-800 transition-shadow appearance-none"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col text-gray-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="-mt-1"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 mt-2 font-semibold">Lower number will be shown first.</p>
              </div>

              {/* Row 3 */}
              <div>
                <label className="block text-[13px] font-bold text-[#111827] mb-4">Status Type <span className="text-red-500">*</span></label>
                <div className="flex gap-8 items-center h-[42px]">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-[18px] h-[18px] rounded-full border-2 border-[#08752f]">
                      {formData.status === "active" && <div className="w-2.5 h-2.5 bg-[#08752f] rounded-full"></div>}
                    </div>
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === "active"}
                      onChange={() => setFormData({ ...formData, status: "active" })}
                      className="hidden"
                    />
                    <span className="text-[13px] font-bold text-[#111827]">Active</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-[18px] h-[18px] rounded-full border-2 border-gray-300 group-hover:border-[#08752f] transition-colors">
                      {formData.status === "inactive" && <div className="w-2.5 h-2.5 bg-[#08752f] rounded-full"></div>}
                    </div>
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === "inactive"}
                      onChange={() => setFormData({ ...formData, status: "inactive" })}
                      className="hidden"
                    />
                    <span className="text-[13px] font-bold text-[#111827]">Inactive</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#111827] mb-2.5">Status Color <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-8 h-7 rounded bg-blue-600 pointer-events-none" style={{ backgroundColor: formData.color }}></div>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                  <div className="w-full h-[42px] border border-gray-200 rounded-lg flex items-center justify-between pl-12 pr-4 bg-white pointer-events-none">
                    <span className="text-white"></span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 mt-2 font-semibold">Choose color to identify this status.</p>
              </div>
            </div>

            {/* Applicable For Checkboxes */}
            <div className="mt-8 pt-5">
              <label className="block text-[13px] font-bold text-[#111827] mb-4">Applicable For <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                {["Exhibitor Lead", "Buyer Lead", "Sponsor Lead", "General Lead", "All"].map((option) => (
                  <label key={option} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center border transition-colors ${formData.applicable_for.includes(option) ? 'bg-[#08752f] border-[#08752f]' : 'border-gray-300 bg-white group-hover:border-[#08752f]'}`}>
                      {formData.applicable_for.includes(option) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.applicable_for.includes(option)}
                      onChange={() => handleCheckboxChange(option)}
                    />
                    <span className="text-[13px] font-bold text-[#111827]">{option}</span>
                  </label>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 mt-3 font-semibold">Select where this lead status will be applicable.</p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-5 border-t border-gray-100 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-200 rounded-lg bg-white text-[13px] font-bold text-[#475569] hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-lg bg-[#08752f] text-[13px] font-bold text-white hover:bg-[#066326] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {id ? "Update Lead Status" : "Save Lead Status"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AddStatusForm;
