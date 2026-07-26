import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate as routerNavigate, useParams as routerParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  ChevronRight,
  Info,
  CalendarCheck2,
  ChevronDown,
  RotateCcw,
  Save,
} from "lucide-react";

import {
  createNextAction,
  updateNextAction,
  fetchNextActions,
} from "../../features/add_by_admin/nextAction/nextActionSlice";
import { createActivityLogThunk } from "../../features/activityLog/activityLogSlice";

const BACK_PATH = "/ihweClientData2026/AddNextAction";

const ACTION_TYPES = [
  "Call",
  "Email",
  "Proposal",
  "Meeting",
  "Follow Up",
  "Visit",
  "Quotation",
  "Document",
];

const APPLICABLE_OPTIONS = [
  "Exhibitor Lead",
  "Exhibitor Registration",
  "Buyer Lead",
  "Sponsor Lead",
  "General Lead",
];

const initialForm = {
  name: "",
  action_code: "",
  description: "",
  display_order: "",
  action_type: "",
  follow_up_days: "",
  status: "Active",
  applicable_for: [],
};

const inputClass =
  "w-full rounded-[7px] border border-[#d6dbe6] bg-white px-3.5 py-2.5 text-[clamp(13px,1vw,15px)] font-medium text-[#1a264e] shadow-[0_2px_10px_rgba(20,40,80,0.02)] transition-all placeholder:font-normal placeholder:text-[#9ea7bd] focus:border-[#104db4] focus:outline-none focus:ring-[3px] focus:ring-[#104db4]/10 hover:border-[#b4becd]";

const labelClass =
  "mb-2 block text-[clamp(12px,0.92vw,14px)] font-bold text-[#1f2d59]";

const Field = ({ label, required, optional, children }) => (
  <div className="flex flex-col">
    <label className={labelClass}>
      {label}{" "}
      {required && <span className="text-[#e23b3b]">*</span>}
      {optional && <span className="text-[#8790a7] font-semibold">(Optional)</span>}
    </label>
    {children}
  </div>
);

const HelperText = ({ children }) => (
  <p className="mt-1.5 text-[clamp(10px,0.8vw,12px)] font-semibold text-[#8790a7]">
    {children}
  </p>
);

const AddNextActionForm = () => {
  const dispatch = useDispatch();
  const navigate = routerNavigate();
  const { id } = routerParams();

  const nextActionState = useSelector((state) => state.nextActions) || {};
  const nextActions = Array.isArray(nextActionState.nextActions)
    ? nextActionState.nextActions
    : [];
  
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const pageRef = useRef(null);

  useEffect(() => {
    if (nextActions.length === 0) {
      dispatch(fetchNextActions());
    }
  }, [dispatch, nextActions.length]);

  useEffect(() => {
    if (id) {
      const existingAction = nextActions.find(
        (action) =>
          action._id === id || String(action.id) === String(id)
      );

      if (existingAction) {
        setForm({
          name: existingAction.name || "",
          action_code: existingAction.action_code || "",
          description: existingAction.description || "",
          display_order: existingAction.display_order || "",
          action_type: existingAction.action_type || "",
          follow_up_days: existingAction.follow_up_days || "",
          status:
            String(existingAction.status || "Active").toLowerCase() === "active"
              ? "Active"
              : "Inactive",
          applicable_for: Array.isArray(existingAction.applicable_for)
            ? existingAction.applicable_for
            : [],
        });
      }
    } else {
      const nextOrder = nextActions.length > 0
        ? Math.max(...nextActions.map((a) => Number(a.display_order) || 0)) + 1
        : 1;
      setForm({ ...initialForm, display_order: nextOrder });
    }
  }, [id, nextActions]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplicableToggle = (option) => {
    if (option === "All") {
      const allSelected = form.applicable_for.length === APPLICABLE_OPTIONS.length;
      updateField("applicable_for", allSelected ? [] : [...APPLICABLE_OPTIONS]);
      return;
    }

    setForm((prev) => {
      const current = prev.applicable_for;
      const updated = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, applicable_for: updated };
    });
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Please enter the action name.";
    
    const duplicate = nextActions.some(
      (action) =>
        String(action?.name || "")
          .trim()
          .toLowerCase() === form.name.trim().toLowerCase() &&
        action._id !== id
    );

    if (duplicate) return "A next action with this name already exists.";
    
    if (
      form.display_order === "" ||
      Number.isNaN(Number(form.display_order)) ||
      Number(form.display_order) < 1
    ) {
      return "Display order must be a number greater than 0.";
    }

    if (!form.action_type) return "Please select an action type.";

    if (form.applicable_for.length === 0) {
      return "Please select at least one applicable area.";
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const error = validateForm();
    if (error) {
      return Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: error,
        confirmButtonColor: "#07813f",
      });
    }

    setIsSaving(true);
    try {
      const userStr = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo") || sessionStorage.getItem("user") || localStorage.getItem("user");
      const userObj = userStr ? JSON.parse(userStr) : {};
      const userName = userObj.fullName || userObj.user_fullname || userObj.name || userObj.username || "Admin";

      const payload = {
        name: form.name.trim(),
        action_code: form.action_code.trim(),
        description: form.description.trim(),
        display_order: Number(form.display_order),
        action_type: form.action_type,
        follow_up_days: form.follow_up_days ? Number(form.follow_up_days) : null,
        status: form.status.toLowerCase(),
        applicable_for: form.applicable_for,
        updated_by: userName,
      };

      const userId =
        sessionStorage.getItem("user_id") ||
        localStorage.getItem("user_id");

      if (id) {
        await dispatch(updateNextAction({ id, data: payload })).unwrap();
        if (userId) {
          dispatch(
            createActivityLogThunk({
              user_id: userId,
              message: `System Config: Updated next action '${form.name.trim()}'`,
              section: "System Configuration",
              data: {
                action: "UPDATE",
                type: "NEXT_ACTION",
                name: form.name.trim(),
              },
            })
          );
        }
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Next action updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await dispatch(createNextAction(payload)).unwrap();
        if (userId) {
          dispatch(
            createActivityLogThunk({
              user_id: userId,
              message: `System Config: Added new next action '${form.name.trim()}'`,
              section: "System Configuration",
              data: {
                action: "ADD",
                type: "NEXT_ACTION",
                name: form.name.trim(),
              },
            })
          );
        }
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Next action added successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      dispatch(fetchNextActions());
      navigate(BACK_PATH);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Unable to save",
        text:
          error?.message ||
          error?.payload?.message ||
          "Next action operation failed.",
        confirmButtonColor: "#07813f",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
  };

  return (
    <div
      ref={pageRef}
      className="box-border flex min-h-0 w-full flex-col overflow-hidden bg-[#f7f9fc] px-[clamp(14px,1.8vw,30px)] py-[clamp(6px,0.75vh,10px)] text-[#111f4c]"
      style={{
        height: "calc(100dvh - 64px)",
        maxHeight: "calc(100dvh - 64px)",
        minHeight: 0,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <header className="shrink-0">
        <div className="flex items-center gap-2 text-[clamp(11px,0.85vw,14px)] font-semibold text-[#68728e]">
          <span>System Configuration</span>
          <ChevronRight className="h-4 w-4" />
          <button
            type="button"
            onClick={() => navigate(BACK_PATH)}
            className="font-bold text-[#104db4] hover:underline"
          >
            Next Action
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="font-bold text-[#104db4]">{id ? "Edit Next Action" : "Add New"}</span>
        </div>

        <div className="mt-[clamp(4px,0.55vh,7px)] flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-[clamp(12px,1.4vw,20px)]">
            <div className="flex h-[clamp(46px,4.3vw,58px)] w-[clamp(46px,4.3vw,58px)] shrink-0 items-center justify-center rounded-[10px] bg-[#104db4]">
              <CalendarCheck2 className="h-[clamp(23px,2vw,29px)] w-[clamp(23px,2vw,29px)] text-white" strokeWidth={1.8} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-[clamp(20px,1.8vw,28px)] font-extrabold leading-tight tracking-[-0.025em] text-[#0d1d4d]">
                {id ? "Edit Next Action" : "Add New Next Action"}
              </h1>
              <p className="mt-0.5 text-[clamp(10px,0.88vw,14px)] font-medium text-[#59637f]">
                {id ? "Update the existing next action details." : "Create a new next action for follow-up activities and task management."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(BACK_PATH)}
            className="flex h-[clamp(36px,4vh,44px)] shrink-0 items-center gap-3 rounded-[7px] border border-[#ccd1dd] bg-white px-[clamp(16px,1.8vw,26px)] text-[clamp(11px,0.9vw,14px)] font-bold text-[#17244d] shadow-sm transition hover:border-[#9ea7bd] hover:bg-[#fafbfe]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Next Action</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mt-[clamp(5px,0.65vh,8px)] flex min-h-0 flex-1 flex-col overflow-hidden rounded-[10px] border border-[#e1e5ec] bg-white px-[clamp(16px,1.9vw,28px)] py-[clamp(8px,0.9vh,12px)] shadow-[0_5px_22px_rgba(19,38,80,0.06)]"
      >
        <section className="min-h-0 flex-1 overflow-y-auto">
          <div className="mb-[clamp(6px,0.75vh,10px)]">
            <h2 className="text-[clamp(15px,1.25vw,19px)] font-extrabold text-[#104db4]">
              Next Action Information
            </h2>
            <div className="mt-1.5 h-[3px] w-16 rounded-full bg-[#104db4]" />
          </div>

          <div className="grid grid-cols-1 gap-x-[clamp(22px,2.8vw,44px)] gap-y-[clamp(5px,0.65vh,9px)] lg:grid-cols-2 mt-4">
            <Field label="Action Name" required>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                type="text"
                placeholder="Enter action name"
                className={inputClass}
              />
              <HelperText>Example: Call, Email, Send Proposal, Meeting, Follow Up etc.</HelperText>
            </Field>

            <Field label="Action Code" optional>
              <input
                value={form.action_code}
                onChange={(event) => updateField("action_code", event.target.value.slice(0, 10))}
                type="text"
                placeholder="Enter action code"
                className={inputClass}
              />
              <HelperText>For internal reference only. (Max 10 characters)</HelperText>
            </Field>

            <Field label="Description" optional>
              <div className="relative">
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value.slice(0, 250)
                    )
                  }
                  maxLength={250}
                  placeholder="Enter description"
                  className={`${inputClass} h-[clamp(58px,7vh,72px)] resize-none py-2.5`}
                />
                <span className="absolute bottom-3 right-4 text-[12px] font-semibold text-[#8790a7]">
                  {form.description.length} / 250
                </span>
              </div>
              <HelperText>Brief description about this action.</HelperText>
            </Field>

            <Field label="Display Order" required>
              <div className="relative">
                <input
                  value={form.display_order}
                  onChange={(event) =>
                    updateField(
                      "display_order",
                      event.target.value.replace(/[^\d]/g, "")
                    )
                  }
                  min="1"
                  type="number"
                  inputMode="numeric"
                  placeholder="Enter display order"
                  className={`${inputClass} appearance-none`}
                />
              </div>
              <HelperText>Lower number will be shown first.</HelperText>
            </Field>

            <Field label="Action Type" required>
              <div className="relative">
                <select
                  value={form.action_type}
                  onChange={(event) =>
                    updateField("action_type", event.target.value)
                  }
                  className={`${inputClass} appearance-none pr-11`}
                >
                  <option value="">Select action type</option>
                  {ACTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#273659]" />
              </div>
              <HelperText>Select the type of action.</HelperText>
            </Field>
            
            <Field label="Default Follow-up Days" optional>
              <input
                value={form.follow_up_days}
                onChange={(event) =>
                  updateField(
                    "follow_up_days",
                    event.target.value.replace(/[^\d]/g, "")
                  )
                }
                min="0"
                type="number"
                inputMode="numeric"
                placeholder="Enter number of days"
                className={inputClass}
              />
              <HelperText>No. of days after which reminder should be set.</HelperText>
            </Field>

            <div>
              <Field label="Status" required>
                <div className="flex items-center gap-7 pt-0.5">
                  {["Active", "Inactive"].map((status) => (
                    <label
                      key={status}
                      className="flex cursor-pointer items-center gap-2.5 text-[clamp(12px,0.92vw,14px)] font-bold text-[#273659]"
                    >
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={form.status === status}
                        onChange={(event) =>
                          updateField("status", event.target.value)
                        }
                        className="hidden"
                      />
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${form.status === status ? "border-[#104db4]" : "border-[#bec5d4]"}`}>
                        {form.status === status && <span className="h-2.5 w-2.5 rounded-full bg-[#104db4]" />}
                      </span>
                      {status}
                    </label>
                  ))}
                </div>
              </Field>
            </div>

            <div>
              <Field label="Applicable For" required>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-1 sm:grid-cols-3 lg:grid-cols-4">
                  {APPLICABLE_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-2.5 text-[clamp(12px,0.85vw,13px)] font-semibold text-[#1a264e] transition hover:text-[#104db4]"
                    >
                      <div className="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border-2 border-[#ccd1dd] bg-white transition peer-checked:border-[#104db4] peer-checked:bg-[#104db4]">
                        <input
                          type="checkbox"
                          checked={form.applicable_for.includes(option)}
                          onChange={() => handleApplicableToggle(option)}
                          className="peer absolute inset-0 cursor-pointer opacity-0"
                        />
                        {form.applicable_for.includes(option) && (
                          <svg
                            className="h-3 w-3 text-[#104db4]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="truncate">{option}</span>
                    </label>
                  ))}
                  
                  <label className="flex cursor-pointer items-center gap-2.5 text-[clamp(12px,0.85vw,13px)] font-semibold text-[#1a264e] transition hover:text-[#104db4]">
                    <div className="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border-2 border-[#ccd1dd] bg-white transition peer-checked:border-[#104db4] peer-checked:bg-[#104db4]">
                      <input
                        type="checkbox"
                        checked={form.applicable_for.length === APPLICABLE_OPTIONS.length}
                        onChange={() => handleApplicableToggle("All")}
                        className="peer absolute inset-0 cursor-pointer opacity-0"
                      />
                      {form.applicable_for.length === APPLICABLE_OPTIONS.length && (
                        <svg
                          className="h-3 w-3 text-[#104db4]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="truncate">All</span>
                  </label>
                </div>
                <HelperText>Select where this action will be applicable.</HelperText>
              </Field>
            </div>
          </div>
          
          <div className="mt-6 flex items-start gap-3 rounded-lg bg-[#f0f4ff] p-4 text-[#104db4]">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold leading-relaxed">
              Note: You can manage next actions after saving the action.
            </p>
          </div>
        </section>

        <footer className="mt-[clamp(6px,0.8vh,12px)] flex shrink-0 items-center justify-end gap-3 border-t border-[#e8ecf3] pt-[clamp(8px,1vh,12px)]">
          <button
            type="button"
            onClick={resetForm}
            className="flex h-[clamp(38px,4.2vh,46px)] min-w-[clamp(100px,10vw,120px)] items-center justify-center gap-2 rounded-[7px] border-2 border-[#dde3ee] bg-white px-5 text-[clamp(12px,0.95vw,14px)] font-bold text-[#455273] transition hover:border-[#b8c2d4] hover:bg-[#f6f8fb] active:scale-[0.98]"
            disabled={isSaving}
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="group relative flex h-[clamp(38px,4.2vh,46px)] min-w-[clamp(140px,14vw,170px)] items-center justify-center gap-2 overflow-hidden rounded-[7px] bg-[#104db4] px-6 text-[clamp(12px,0.95vw,14px)] font-bold text-white shadow-[0_4px_12px_rgba(16,77,180,0.25)] transition hover:bg-[#0c3e92] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving...
              </span>
            ) : (
              <>
                <Save className="h-4 w-4 transition-transform group-hover:scale-110" />
                Save Next Action
              </>
            )}
          </button>
        </footer>
      </form>
    </div>
  );
};

export default AddNextActionForm;
