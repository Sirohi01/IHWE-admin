import React, { useState } from "react";
import { ArrowLeft, Save, RotateCcw, ClipboardList, ChevronDown } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createStatusOption, updateStatusOption } from "../../features/add_by_admin/statusOption/statusOptionSlice";
import Swal from "sweetalert2";

const APPLICABLE_OPTIONS = [
  "Exhibitor Lead",
  "Buyer Lead",
  "Sponsor Lead",
  "Visitor Lead",
];

const normalizeApplicableOption = (option) =>
  option === "General Lead" ? "Visitor Lead" : option;

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
          display_order: existingStatus.display_order ?? 1,
          status: String(existingStatus.status || "inactive").toLowerCase() === "active" ? "active" : "inactive",
          color: existingStatus.color || "#2563eb",
          applicable_for: Array.isArray(existingStatus.applicable_for)
            ? existingStatus.applicable_for.map(normalizeApplicableOption)
            : [],
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
        newApplicableFor = newApplicableFor.includes("All")
          ? []
          : ["All", ...APPLICABLE_OPTIONS];
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
    if (
      formData.display_order === "" ||
      Number.isNaN(Number(formData.display_order)) ||
      Number(formData.display_order) < 0
    ) return Swal.fire({ icon: "warning", title: "Warning", text: "Display Order must be 0 or greater.", confirmButtonColor: "#08752f" });
    if (formData.applicable_for.length === 0) return Swal.fire({ icon: "warning", title: "Warning", text: "Please select at least one Applicable For option.", confirmButtonColor: "#08752f" });

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        display_order: Number(formData.display_order),
        applicable_for: formData.applicable_for.map(normalizeApplicableOption),
      };
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
    <section
      className="box-border h-[calc(100dvh-72px)] min-h-0 overflow-hidden bg-[#f7f9fc] px-[clamp(18px,2.7vw,42px)] py-[clamp(10px,1.3vh,18px)] font-sans text-[#122252]"
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-[clamp(10px,1.4vh,17px)]">
        {/* Page Header */}
        <header className="flex shrink-0 items-center justify-between gap-5">
          <div className="min-w-0">
            <div className="mb-[clamp(7px,.9vh,10px)] flex items-center gap-2 text-[clamp(10px,.78vw,12px)] font-semibold text-[#69748d]">
              <span>System Configuration</span>
              <span className="text-[#a7afbf]">&gt;</span>
              <span className="font-bold text-[#178348]">Lead Status</span>
              <span className="text-[#a7afbf]">&gt;</span>
              <span className="font-bold text-[#24408d]">
                {id ? "Edit Status" : "Add New"}
              </span>
            </div>

            <div className="flex min-w-0 items-center gap-[clamp(12px,1.4vw,20px)]">
              <div className="flex h-[clamp(48px,4.8vw,64px)] w-[clamp(48px,4.8vw,64px)] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#11984d] to-[#007239] shadow-[0_8px_18px_rgba(4,121,58,.18)]">
                <ClipboardList className="h-[clamp(24px,2.1vw,31px)] w-[clamp(24px,2.1vw,31px)] text-white" strokeWidth={1.8} />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-[clamp(21px,1.8vw,29px)] font-extrabold leading-tight tracking-[-.025em] text-[#0e1d50]">
                  {id ? "Edit Lead Status" : "Add New Lead Status"}
                </h1>
                <p className="mt-1 text-[clamp(10px,.85vw,13px)] font-semibold text-[#5d6881]">
                  {id
                    ? "Update the details of this lead status."
                    : "Create a new lead status for tracking and management."}
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/ihweClientData2026/AddStatus"
            className="inline-flex h-[clamp(40px,4.5vh,48px)] shrink-0 items-center justify-center gap-2 rounded-[7px] border border-[#cfd4de] bg-white px-[clamp(16px,1.8vw,24px)] text-[clamp(10px,.86vw,13px)] font-extrabold text-[#17264f] shadow-sm transition hover:border-[#aeb6c6] hover:bg-[#fafbfc]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lead Status
          </Link>
        </header>

        {/* Main Form Card */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-col overflow-hidden rounded-[10px] border border-[#e0e4eb] bg-white px-[clamp(18px,2.3vw,34px)] py-[clamp(14px,1.7vh,22px)] shadow-[0_5px_20px_rgba(15,31,75,.05)]"
        >
          <div className="min-h-0 flex-1">
            <div className="mb-[clamp(12px,1.6vh,20px)]">
              <h2 className="text-[clamp(14px,1.1vw,17px)] font-extrabold text-[#108047]">
                Lead Status Information
              </h2>
              <div className="mt-2 h-[3px] w-16 rounded-full bg-[#118449]" />
            </div>

            <div className="grid grid-cols-1 gap-x-[clamp(28px,3vw,48px)] gap-y-[clamp(12px,1.55vh,19px)] md:grid-cols-2">
              {/* Row 1 */}
              <div>
                <label className="mb-2 block text-[clamp(11px,.94vw,14px)] font-extrabold text-[#122252]">
                  Lead Status Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter lead status name"
                  className={inputClass}
                />
                <p className={helperClass}>
                  Example: New Lead, In Progress, Qualified etc.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-[clamp(11px,.94vw,14px)] font-extrabold text-[#122252]">
                  Status Code{" "}
                  <span className="font-semibold text-[#6d768d]">
                    (Optional)
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={formData.status_code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status_code: e.target.value,
                    })
                  }
                  placeholder="Enter status code (max 10 characters)"
                  className={inputClass}
                />
                <p className={helperClass}>For internal reference only.</p>
              </div>

              {/* Row 2 */}
              <div>
                <label className="mb-2 block text-[clamp(11px,.94vw,14px)] font-extrabold text-[#122252]">
                  Description{" "}
                  <span className="font-semibold text-[#6d768d]">
                    (Optional)
                  </span>
                </label>
                <div className="relative">
                  <textarea
                    maxLength={200}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter description"
                    className={`${inputClass} h-[clamp(82px,10.4vh,112px)] resize-none py-3`}
                  />
                  <span className="absolute bottom-3 right-3 bg-white px-1 text-[10px] font-semibold text-[#8a92a5]">
                    {formData.description.length} / 200
                  </span>
                </div>
                <p className={helperClass}>
                  Brief description of this lead status.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-[clamp(11px,.94vw,14px)] font-extrabold text-[#122252]">
                  Display Order <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
<<<<<<< HEAD
                    type="number"
                    min="0"
=======
                    type="text"
                    min="1"
>>>>>>> f90fee37c263e321566d6adee8e4830794a70aa2
                    value={formData.display_order}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setFormData({
                        ...formData,
<<<<<<< HEAD
                        display_order:
                          e.target.value === ""
                            ? ""
                            : parseInt(e.target.value, 10),
                      })
                    }
=======
                        display_order: val === "" ? "" : parseInt(val, 10),
                      });
                    }}
>>>>>>> f90fee37c263e321566d6adee8e4830794a70aa2
                    placeholder="Enter order"
                    className={`${inputClass} pr-4`}
                  />
                </div>
                <p className={helperClass}>
                  Lower number will be shown first.
                </p>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(170px,.95fr)] gap-[clamp(22px,2.6vw,42px)]">
                <div>
                  <label className="mb-3 block text-[clamp(11px,.94vw,14px)] font-extrabold text-[#122252]">
                    Status Type <span className="text-red-500">*</span>
                  </label>

                  <div className="flex h-[clamp(38px,4.2vh,44px)] items-center gap-8">
                    {["active", "inactive"].map((statusOption) => (
                      <label
                        key={statusOption}
                        className="flex cursor-pointer items-center gap-2.5"
                      >
                        <input
                          type="radio"
                          name="status"
                          value={statusOption}
                          checked={formData.status === statusOption}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              status: statusOption,
                            })
                          }
                          className="peer sr-only"
                        />
                        <span className="flex h-[19px] w-[19px] items-center justify-center rounded-full border-2 border-[#c5cad5] peer-checked:border-[#108047]">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${formData.status === statusOption
                                ? "bg-[#108047]"
                                : "bg-transparent"
                              }`}
                          />
                        </span>
                        <span className="text-[clamp(11px,.9vw,13px)] font-bold capitalize text-[#17264f]">
                          {statusOption}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[clamp(11px,.94vw,14px)] font-extrabold text-[#122252]">
                    Status Color <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          color: e.target.value,
                        })
                      }
                      className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                    />
                    <div className={`${inputClass} flex items-center justify-between py-1.5`}>
                      <span
                        className="h-[28px] w-[30px] rounded-[3px]"
                        style={{ backgroundColor: formData.color }}
                      />
                      <ChevronDown className="h-4 w-4 text-[#53627e]" />
                    </div>
                  </div>

                  <p className={helperClass}>
                    Choose color to identify this status.
                  </p>
                </div>
              </div>

              <div />
            </div>

            {/* Applicable For */}
            <div className="mt-[clamp(14px,1.9vh,24px)]">
              <label className="mb-3 block text-[clamp(11px,.94vw,14px)] font-extrabold text-[#122252]">
                Applicable For <span className="text-red-500">*</span>
              </label>

              <div className="flex flex-wrap items-center gap-x-[clamp(30px,4vw,58px)] gap-y-3">
                {[...APPLICABLE_OPTIONS, "All"].map((option) => {
                  const checked = formData.applicable_for.includes(option);

                  return (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-2.5"
                    >
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={checked}
                        onChange={() => handleCheckboxChange(option)}
                      />
                      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[3px] border border-[#c7ccd6] bg-white text-[12px] font-black text-white peer-checked:border-[#108047] peer-checked:bg-[#108047]">
                        {checked ? "✓" : ""}
                      </span>
                      <span className="whitespace-nowrap text-[clamp(10px,.86vw,13px)] font-bold text-[#17264f]">
                        {option}
                      </span>
                    </label>
                  );
                })}
              </div>

              <p className={`${helperClass} mt-3`}>
                Select where this lead status will be applicable.
              </p>
            </div>
          </div>

          {/* Card Footer Actions */}
          <div className="mt-[clamp(14px,1.8vh,22px)] flex shrink-0 justify-end gap-4 border-t border-[#e5e8ee] pt-[clamp(13px,1.5vh,18px)]">
            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="inline-flex h-[clamp(40px,4.6vh,48px)] items-center justify-center gap-2 rounded-[7px] border border-[#cfd4de] bg-white px-[clamp(20px,2vw,28px)] text-[clamp(11px,.88vw,13px)] font-extrabold text-[#17264f] transition hover:bg-[#f8f9fb] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-[clamp(40px,4.6vh,48px)] min-w-[clamp(170px,14vw,206px)] items-center justify-center gap-2 rounded-[7px] bg-gradient-to-b from-[#11944b] to-[#08783b] px-7 text-[clamp(11px,.88vw,13px)] font-extrabold text-white shadow-[0_6px_14px_rgba(8,120,59,.18)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-65"
            >
              {isSaving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {id ? "Update Lead Status" : "Save Lead Status"}
            </button>
          </div>
        </form>

        {/* Page Footer */}
        <footer className="flex shrink-0 items-center gap-2 px-1 text-[clamp(9px,.72vw,11px)] font-semibold text-[#7d869c]">
          <span>© 2026 International Health &amp; Wellness Expo</span>
          <span>|</span>
          <span>Namo Gange Wellness Pvt. Ltd.</span>
          <span>|</span>
          <span>All Rights Reserved.</span>
        </footer>
      </div>
    </section>
  );
};

const inputClass =
  "h-[clamp(40px,4.6vh,47px)] w-full rounded-[6px] border border-[#d7dbe4] bg-white px-4 text-[clamp(11px,.9vw,13px)] font-semibold text-[#263451] outline-none transition placeholder:text-[#8e97aa] focus:border-[#108047] focus:ring-2 focus:ring-[#108047]/10";

const helperClass =
  "mt-2 text-[clamp(9px,.75vw,11px)] font-semibold text-[#7a8399]";

export default AddStatusForm;
