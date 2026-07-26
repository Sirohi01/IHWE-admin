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
  "h-[clamp(39px,4.4vh,46px)] w-full rounded-[6px] border border-[#d5dae4] bg-white px-4 text-[clamp(10px,.86vw,13px)] font-semibold text-[#263451] outline-none transition placeholder:text-[#8e97aa] focus:border-[#1761db] focus:ring-2 focus:ring-[#1761db]/10";

const labelClass =
  "mb-2 block text-[clamp(11px,.92vw,14px)] font-extrabold text-[#122252]";

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
  <p className="mt-2 text-[clamp(9px,.73vw,11px)] font-semibold text-[#7a8399]">
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
    <section
      ref={pageRef}
      className="box-border h-[calc(100dvh-72px)] min-h-0 overflow-hidden bg-[#f7f9fc] px-[clamp(18px,2.25vw,34px)] py-[clamp(10px,1.25vh,16px)] font-sans text-[#122252]"
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-[clamp(9px,1.15vh,14px)]">
        {/* Page Header */}
        <header className="flex shrink-0 items-center justify-between gap-5">
          <div className="min-w-0">
            <div className="mb-[clamp(7px,.8vh,10px)] flex items-center gap-2 text-[clamp(10px,.78vw,12px)] font-semibold text-[#68748b]">
              <span>System Configuration</span>
              <ChevronRight className="h-3.5 w-3.5 text-[#a8b0be]" />
              <button
                type="button"
                onClick={() => navigate(BACK_PATH)}
                className="font-bold text-[#48556c] hover:text-[#1761db]"
              >
                Next Action
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-[#a8b0be]" />
              <span className="font-extrabold text-[#24408d]">
                {id ? "Edit" : "Add New"}
              </span>
            </div>

            <div className="flex min-w-0 items-center gap-[clamp(12px,1.35vw,19px)]">
              <div className="flex h-[clamp(48px,4.6vw,62px)] w-[clamp(48px,4.6vw,62px)] shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-[#2167e7] to-[#083fbd] shadow-[0_8px_18px_rgba(20,91,215,.22)]">
                <CalendarCheck2
                  className="h-[clamp(24px,2vw,30px)] w-[clamp(24px,2vw,30px)] text-white"
                  strokeWidth={1.8}
                />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-[clamp(21px,1.8vw,29px)] font-extrabold leading-tight tracking-[-.025em] text-[#0d1d4e]">
                  {id ? "Edit Next Action" : "Add New Next Action"}
                </h1>
                <p className="mt-1 text-[clamp(10px,.84vw,13px)] font-semibold text-[#5e6981]">
                  {id
                    ? "Update the next action details for follow-up activities and task management."
                    : "Create a new next action for follow-up activities and task management."}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(BACK_PATH)}
            className="inline-flex h-[clamp(40px,4.5vh,47px)] shrink-0 items-center justify-center gap-2 rounded-[7px] border border-[#cfd4de] bg-white px-[clamp(16px,1.8vw,24px)] text-[clamp(10px,.85vw,13px)] font-extrabold text-[#17264f] shadow-sm transition hover:border-[#aeb6c6] hover:bg-[#fafbfc]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Next Action</span>
            <span className="sm:hidden">Back</span>
          </button>
        </header>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-col overflow-hidden rounded-[10px] border border-[#e0e4eb] bg-white px-[clamp(18px,2.15vw,32px)] py-[clamp(12px,1.5vh,19px)] shadow-[0_5px_20px_rgba(15,31,75,.05)]"
        >
          <div className="min-h-0 flex-1 overflow-hidden">
            <div className="mb-[clamp(11px,1.45vh,18px)]">
              <h2 className="text-[clamp(14px,1.08vw,17px)] font-extrabold text-[#1556c7]">
                Next Action Information
              </h2>
              <div className="mt-2 h-[3px] w-16 rounded-full bg-[#2f6fe5]" />
            </div>

            <div className="grid grid-cols-1 gap-x-[clamp(28px,3vw,48px)] gap-y-[clamp(10px,1.25vh,16px)] md:grid-cols-2">
              <Field label="Action Name" required>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Enter action name"
                  className={inputClass}
                />
                <HelperText>
                  Example: Call, Email, Send Proposal, Meeting, Follow Up etc.
                </HelperText>
              </Field>

              <Field label="Action Code" optional>
                <input
                  type="text"
                  maxLength={10}
                  value={form.action_code}
                  onChange={(event) =>
                    updateField(
                      "action_code",
                      event.target.value.replace(/\s+/g, "").toUpperCase()
                    )
                  }
                  placeholder="Enter action code"
                  className={inputClass}
                />
                <HelperText>
                  For internal reference only. (Max 10 characters)
                </HelperText>
              </Field>

              <Field label="Description" optional>
                <div className="relative">
                  <textarea
                    maxLength={250}
                    value={form.description}
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value.slice(0, 250)
                      )
                    }
                    placeholder="Enter description"
                    className={`${inputClass} h-[clamp(80px,9.5vh,106px)] resize-none py-3`}
                  />
                  <span className="absolute bottom-3 right-3 bg-white px-1 text-[10px] font-semibold text-[#8992a5]">
                    {form.description.length} / 250
                  </span>
                </div>
                <HelperText>Brief description about this action.</HelperText>
              </Field>

              <Field label="Display Order" required>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={form.display_order}
                    onChange={(event) =>
                      updateField(
                        "display_order",
                        event.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    placeholder="Enter display order"
                    className={`${inputClass} appearance-none pr-10`}
                  />
                  <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 flex-col text-[#53627e]">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="-mt-1"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
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
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value="">Select action type</option>
                    {ACTION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#53627e]" />
                </div>
                <HelperText>Select the type of action.</HelperText>
              </Field>

              <Field label="Default Follow-up Days" optional>
                <input
                  type="number"
                  min="0"
                  value={form.follow_up_days}
                  onChange={(event) =>
                    updateField(
                      "follow_up_days",
                      event.target.value.replace(/[^\d]/g, "")
                    )
                  }
                  placeholder="Enter number of days"
                  className={inputClass}
                />
                <HelperText>
                  No. of days after which reminder should be set.
                </HelperText>
              </Field>

              <Field label="Status" required>
                <div className="flex h-[clamp(38px,4.2vh,44px)] items-center gap-8">
                  {["Active", "Inactive"].map((statusOption) => (
                    <label
                      key={statusOption}
                      className="flex cursor-pointer items-center gap-2.5"
                    >
                      <input
                        type="radio"
                        name="status"
                        value={statusOption}
                        checked={form.status === statusOption}
                        onChange={() => updateField("status", statusOption)}
                        className="peer sr-only"
                      />
                      <span className="flex h-[19px] w-[19px] items-center justify-center rounded-full border-2 border-[#c5cad5] peer-checked:border-[#1761db]">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${form.status === statusOption
                              ? "bg-[#1761db]"
                              : "bg-transparent"
                            }`}
                        />
                      </span>
                      <span className="text-[clamp(11px,.88vw,13px)] font-bold text-[#17264f]">
                        {statusOption}
                      </span>
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="Applicable For" required>
                <div className="flex flex-wrap gap-x-[clamp(20px,2.2vw,34px)] gap-y-3 pt-0.5">
                  {APPLICABLE_OPTIONS.map((option) => {
                    const checked = form.applicable_for.includes(option);

                    return (
                      <label
                        key={option}
                        className="flex cursor-pointer items-center gap-2.5"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleApplicableToggle(option)}
                          className="peer sr-only"
                        />
                        <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[3px] border border-[#c7ccd6] bg-white text-[12px] font-black text-white peer-checked:border-[#1761db] peer-checked:bg-[#1761db]">
                          {checked ? "✓" : ""}
                        </span>
                        <span className="whitespace-nowrap text-[clamp(10px,.8vw,12px)] font-bold text-[#17264f]">
                          {option}
                        </span>
                      </label>
                    );
                  })}

                  <label className="flex cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={
                        form.applicable_for.length ===
                        APPLICABLE_OPTIONS.length
                      }
                      onChange={() => handleApplicableToggle("All")}
                      className="peer sr-only"
                    />
                    <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[3px] border border-[#c7ccd6] bg-white text-[12px] font-black text-white peer-checked:border-[#1761db] peer-checked:bg-[#1761db]">
                      {form.applicable_for.length ===
                        APPLICABLE_OPTIONS.length
                        ? "✓"
                        : ""}
                    </span>
                    <span className="whitespace-nowrap text-[clamp(10px,.8vw,12px)] font-bold text-[#17264f]">
                      All
                    </span>
                  </label>
                </div>
                <HelperText>
                  Select where this action will be applicable.
                </HelperText>
              </Field>
            </div>
          </div>

          <div className="mt-[clamp(11px,1.35vh,17px)] shrink-0 rounded-[7px] border border-[#ccdcfa] bg-[#eef5ff] px-[clamp(14px,1.45vw,21px)] py-[clamp(9px,1.05vh,13px)] text-[#1557bd]">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 shrink-0 fill-[#1761db] text-white" />
              <p className="text-[clamp(10px,.82vw,12px)] font-semibold">
                <span className="font-extrabold text-[#163f98]">Note:</span>
                <span className="ml-1">
                  You can manage next actions after saving the action.
                </span>
              </p>
            </div>
          </div>

          <div className="mt-[clamp(10px,1.25vh,15px)] flex shrink-0 justify-end gap-4">
            <button
              type="button"
              onClick={resetForm}
              disabled={isSaving}
              className="inline-flex h-[clamp(39px,4.4vh,46px)] items-center justify-center gap-2 rounded-[7px] border border-[#cfd4de] bg-white px-[clamp(20px,2vw,28px)] text-[clamp(10px,.86vw,13px)] font-extrabold text-[#17264f] transition hover:bg-[#f8f9fb] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-[clamp(39px,4.4vh,46px)] min-w-[clamp(170px,14vw,205px)] items-center justify-center gap-2 rounded-[7px] bg-gradient-to-b from-[#1b65df] to-[#0d49c6] px-7 text-[clamp(10px,.86vw,13px)] font-extrabold text-white shadow-[0_6px_14px_rgba(13,73,198,.2)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-65"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {id ? "Update Next Action" : "Save Next Action"}
                </>
              )}
            </button>
          </div>
        </form>

        <footer className="flex shrink-0 items-center gap-2 px-1 text-[clamp(9px,.7vw,11px)] font-semibold text-[#7d869c]">
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

export default AddNextActionForm;