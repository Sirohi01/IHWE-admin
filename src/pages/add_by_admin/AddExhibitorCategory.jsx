import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Grid2X2,
  Info,
  RotateCcw,
  Save,
  UploadCloud,
} from "lucide-react";

import {
  createCategory,
  updateCategory,
  fetchCategories,
} from "../../features/add_by_admin/category/categorySlice";
import { createActivityLogThunk } from "../../features/activityLog/activityLogSlice";

const BACK_PATH = "/ihweClientData2026/AddCategory";

const APPLICABLE_OPTIONS = [
  "Exhibitor Lead",
  "Exhibitor Registration",
  "Buyer Lead",
  "Sponsor Lead",
  "Visitor Lead",
];

const DEFAULT_PARENT_CATEGORIES = [
  "Healthcare",
  "Medical Devices",
  "Pharma & Biotechnology",
  "AYUSH",
  "Wellness & Fitness",
  "Organic & Natural",
  "Beauty & Personal Care",
  "Digital Health",
  "Medical Tourism",
  "Packaging & Manufacturing",
];

const BUSINESS_NATURE_OPTIONS = [
  "Institution",
  "Manufacturer",
  "Service Provider",
];

const normalizeApplicableOption = (option) =>
  option === "General Lead" ? "Visitor Lead" : option;

const initialForm = {
  name: "",
  parentCategory: "",
  businessNature: "",
  displayOrder: "",
  status: "Active",
  applicableFor: ["Exhibitor Lead", "Exhibitor Registration"],
  iconFile: null,
  iconPreview: "",
};

const getParentId = (category) =>
  category?.parent_category?._id ||
  category?.parent_category ||
  category?.parentCategory?._id ||
  category?.parentCategory ||
  category?.parent_id ||
  "";

const normaliseOptionText = (value) => String(value ?? "").trim();

const getParentCategoryLabel = (category) =>
  normaliseOptionText(
    category?.main_category?.name ||
      category?.main_category?.cat_name ||
      category?.main_category ||
      category?.parent_category?.name ||
      category?.parent_category?.cat_name ||
      category?.parent_category ||
      category?.category_group ||
      category?.cat_group
  );

const AddNewExhibitorCategory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const pageRef = useRef(null);

  const categoryState = useSelector((state) => state.categories);
  const rawCategories = categoryState?.categories;
  const categories = useMemo(
    () => (Array.isArray(rawCategories) ? rawCategories : []),
    [rawCategories]
  );

  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    if (id && categories.length > 0) {
      const existingCategory = categories.find((c) => c._id === id);
      if (existingCategory) {
        setForm({
          name: existingCategory.cat_name || "",
          parentCategory: getParentId(existingCategory) || "",
          businessNature:
            existingCategory.business_nature ||
            existingCategory.businessNature ||
            existingCategory.nature_of_business ||
            existingCategory.nature ||
            "",
          displayOrder: existingCategory.display_order ?? 1,
          status: String(existingCategory.cat_status || "Active").toLowerCase() === "active" ? "Active" : "Inactive",
          applicableFor: Array.isArray(existingCategory.applicable_for)
            ? existingCategory.applicable_for.map(normalizeApplicableOption)
            : ["Exhibitor Lead", "Exhibitor Registration"],
          iconFile: null,
          iconPreview: existingCategory.icon_data_url || "",
        });
      }
    } else if (!id && categories.length > 0) {
      const maxOrder = Math.max(...categories.map((c) => Number(c.display_order) || 0));
      setForm((prev) => ({ ...prev, displayOrder: maxOrder + 1 }));
    }
  }, [id, categories]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  /*
    Locks the browser/body and any scrollable admin-layout parent while this
    page is mounted. The page height is measured from its real top position to
    the bottom of the viewport, so header height, layout padding and browser
    zoom cannot create a Y scrollbar.
  */
  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page || typeof window === "undefined") return undefined;

    const changedStyles = [];

    const setTemporaryStyle = (element, property, value) => {
      if (!element) return;

      changedStyles.push({
        element,
        property,
        previousValue: element.style[property],
      });

      element.style[property] = value;
    };

    const scrollContainers = new Set([
      document.documentElement,
      document.body,
    ]);

    let parent = page.parentElement;

    while (parent) {
      const computedStyle = window.getComputedStyle(parent);
      const overflowY = computedStyle.overflowY;

      if (
        overflowY === "auto" ||
        overflowY === "scroll" ||
        overflowY === "overlay"
      ) {
        scrollContainers.add(parent);
      }

      parent = parent.parentElement;
    }

    scrollContainers.forEach((element) => {
      setTemporaryStyle(element, "overflowY", "hidden");
      setTemporaryStyle(element, "overscrollBehaviorY", "none");
    });

    const fitPageToViewport = () => {
      const pageTop = Math.max(0, page.getBoundingClientRect().top);
      const availableHeight = Math.max(0, window.innerHeight - pageTop);

      page.style.height = `${availableHeight}px`;
      page.style.maxHeight = `${availableHeight}px`;
      page.style.minHeight = "0px";
    };

    const frameId = window.requestAnimationFrame(fitPageToViewport);
    window.addEventListener("resize", fitPageToViewport);
    window.addEventListener("orientationchange", fitPageToViewport);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", fitPageToViewport);
      window.removeEventListener("orientationchange", fitPageToViewport);

      changedStyles.reverse().forEach(
        ({ element, property, previousValue }) => {
          element.style[property] = previousValue;
        }
      );
    };
  }, []);

  const parentCategoryOptions = useMemo(() => {
    const options = new Map();

    const addOption = (value) => {
      const label = normaliseOptionText(value);
      if (label) options.set(label.toLowerCase(), label);
    };

    DEFAULT_PARENT_CATEGORIES.forEach(addOption);
    categories.forEach((category) => {
      addOption(getParentCategoryLabel(category));
    });
    addOption(form.parentCategory);

    return [...options.values()];
  }, [categories, form.parentCategory]);

  const businessNatureOptions = useMemo(() => {
    const options = new Map();

    const addOption = (value) => {
      const label = normaliseOptionText(value);
      if (label) options.set(label.toLowerCase(), label);
    };

    BUSINESS_NATURE_OPTIONS.forEach(addOption);
    categories.forEach((category) => {
      addOption(
        category?.business_nature?.name ||
          category?.business_nature ||
          category?.businessNature ||
          category?.nature_of_business ||
          category?.nature
      );
    });
    addOption(form.businessNature);

    return [...options.values()].sort((a, b) => a.localeCompare(b));
  }, [categories, form.businessNature]);

  const updateField = (name, value) => {
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleApplicableChange = (option) => {
    setForm((previous) => {
      const alreadySelected = previous.applicableFor.includes(option);

      return {
        ...previous,
        applicableFor: alreadySelected
          ? previous.applicableFor.filter((item) => item !== option)
          : [...previous.applicableFor, option],
      };
    });
  };

  const allApplicableSelected =
    form.applicableFor.length === APPLICABLE_OPTIONS.length;

  const toggleAllApplicable = () => {
    updateField(
      "applicableFor",
      allApplicableSelected ? [] : [...APPLICABLE_OPTIONS]
    );
  };

  const handleIconUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid file",
        text: "Please upload a PNG or JPG image.",
        confirmButtonColor: "#07813f",
      });
      event.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "File too large",
        text: "Icon size must be less than 1 MB.",
        confirmButtonColor: "#07813f",
      });
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((previous) => ({
        ...previous,
        iconFile: file,
        iconPreview: String(reader.result || ""),
      }));
    };

    reader.onerror = () => {
      Swal.fire({
        icon: "error",
        title: "Upload failed",
        text: "The selected image could not be read.",
        confirmButtonColor: "#07813f",
      });
    };

    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setForm(initialForm);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Please enter the category name.";
    }

    const duplicate = categories.some(
      (category) =>
        String(category?.cat_name || "")
          .trim()
          .toLowerCase() === form.name.trim().toLowerCase() &&
        category._id !== id
    );

    if (duplicate) {
      return "A category with this name already exists.";
    }

    if (!form.businessNature) {
      return "Please select the business nature.";
    }

    if (
      form.displayOrder === "" ||
      Number.isNaN(Number(form.displayOrder)) ||
      Number(form.displayOrder) < 0
    ) {
      return "Display order must be 0 or greater.";
    }

    if (form.applicableFor.length === 0) {
      return "Select at least one applicable section.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateForm();

    if (validationMessage) {
      Swal.fire({
        icon: "warning",
        title: "Check the form",
        text: validationMessage,
        confirmButtonColor: "#07813f",
      });
      return;
    }

    try {
      setIsSaving(true);

      const storedAdmin =
        localStorage.getItem("adminInfo") ||
        sessionStorage.getItem("adminInfo") ||
        "{}";

      let adminInfo = {};

      try {
        adminInfo = JSON.parse(storedAdmin);
      } catch {
        adminInfo = {};
      }

      const userName =
        adminInfo.fullName ||
        adminInfo.name ||
        adminInfo.username ||
        "Admin User";

      const nextCategoryId =
        categories.length > 0
          ? Math.max(...categories.map((item) => Number(item?.cat_id) || 0)) + 1
          : 1;

      /*
        These keys preserve the existing category fields and include the new
        form fields. Rename only the extra keys if your backend uses different
        property names.
      */
      const payload = {
        cat_id: nextCategoryId,
        cat_name: form.name.trim(),
        cat_status: form.status,
        cat_added: new Date().toISOString(),
        updated_by: userName,

        parent_category: form.parentCategory || null,
        business_nature: form.businessNature || "",
        display_order: Number(form.displayOrder),
        applicable_for: form.applicableFor.map(normalizeApplicableOption),
        icon_name: form.iconFile?.name || "",
        icon_data_url: form.iconPreview || "",
      };

      const userId =
        sessionStorage.getItem("user_id") ||
        localStorage.getItem("user_id");

      if (id) {
        await dispatch(updateCategory({ id, updates: payload })).unwrap();
        if (userId) {
          dispatch(
            createActivityLogThunk({
              user_id: userId,
              message: `System Config: Updated category '${form.name.trim()}'`,
              section: "System Configuration",
              data: {
                action: "UPDATE",
                type: "CATEGORY",
                name: form.name.trim(),
              },
            })
          );
        }
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Category updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await dispatch(createCategory(payload)).unwrap();
        if (userId) {
          dispatch(
            createActivityLogThunk({
              user_id: userId,
              message: `System Config: Added new category '${form.name.trim()}'`,
              section: "System Configuration",
              data: {
                action: "ADD",
                type: "CATEGORY",
                name: form.name.trim(),
              },
            })
          );
        }
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Category added successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      dispatch(fetchCategories());
      navigate(BACK_PATH);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Unable to save",
        text:
          error?.message ||
          error?.payload?.message ||
          "Category operation failed.",
        confirmButtonColor: "#07813f",
      });
    } finally {
      setIsSaving(false);
    }
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
            className="font-bold text-[#118449] hover:underline"
          >
            Exhibitor Category
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="font-bold text-[#17327b]">{id ? "Edit Category" : "Add New"}</span>
        </div>

        <div className="mt-[clamp(4px,0.55vh,7px)] flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-[clamp(12px,1.4vw,20px)]">
            <div className="flex h-[clamp(46px,4.3vw,58px)] w-[clamp(46px,4.3vw,58px)] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#10984d] to-[#006f35] shadow-[0_9px_22px_rgba(4,126,60,0.24)]">
              <Grid2X2 className="h-[clamp(23px,2vw,29px)] w-[clamp(23px,2vw,29px)] text-white" strokeWidth={1.8} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-[clamp(20px,1.8vw,28px)] font-extrabold leading-tight tracking-[-0.025em] text-[#0d1d4d]">
                {id ? "Edit Exhibitor Category" : "Add New Exhibitor Category"}
              </h1>
              <p className="mt-0.5 text-[clamp(10px,0.88vw,14px)] font-medium text-[#59637f]">
                {id ? "Update the existing exhibitor category details." : "Create a new exhibitor category for lead and exhibitor classification."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(BACK_PATH)}
            className="flex h-[clamp(36px,4vh,44px)] shrink-0 items-center gap-3 rounded-[7px] border border-[#ccd1dd] bg-white px-[clamp(16px,1.8vw,26px)] text-[clamp(11px,0.9vw,14px)] font-bold text-[#17244d] shadow-sm transition hover:border-[#9ea7bd] hover:bg-[#fafbfe]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Exhibitor Category</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mt-[clamp(5px,0.65vh,8px)] flex min-h-0 flex-1 flex-col overflow-hidden rounded-[10px] border border-[#e1e5ec] bg-white px-[clamp(16px,1.9vw,28px)] py-[clamp(8px,0.9vh,12px)] shadow-[0_5px_22px_rgba(19,38,80,0.06)]"
      >
        <section className="min-h-0 flex-1 overflow-hidden">
          <div className="mb-[clamp(6px,0.75vh,10px)]">
            <h2 className="text-[clamp(15px,1.25vw,19px)] font-extrabold text-[#108047]">
              Exhibitor Category Information
            </h2>
            <div className="mt-1.5 h-[3px] w-16 rounded-full bg-[#118449]" />
          </div>

          <div className="grid grid-cols-1 gap-x-[clamp(22px,2.8vw,44px)] gap-y-[clamp(5px,0.65vh,9px)] lg:grid-cols-2">
            <Field label="Category Name" required>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                type="text"
                placeholder="Enter category name"
                className={inputClass}
              />
              <HelperText>Example: Hospitals &amp; Healthcare Institutions</HelperText>
            </Field>

            <Field label="Parent Category" optional>
              <div className="relative">
                <select
                  value={form.parentCategory}
                  onChange={(event) =>
                    updateField("parentCategory", event.target.value)
                  }
                  className={`${inputClass} appearance-none pr-11`}
                >
                  <option value="">Select parent category</option>
                  {parentCategoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#273659]" />
              </div>
              <HelperText>Leave empty if this is a main category</HelperText>
            </Field>

            <Field label="Business Nature" required>
              <div className="relative">
                <select
                  value={form.businessNature}
                  onChange={(event) =>
                    updateField("businessNature", event.target.value)
                  }
                  className={`${inputClass} appearance-none pr-11`}
                >
                  <option value="">Select business nature</option>
                  {businessNatureOptions.map((nature) => (
                    <option key={nature} value={nature}>
                      {nature}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#273659]" />
              </div>
              <HelperText>Shown in the Business Nature column.</HelperText>
            </Field>

            <Field label="Display Order" required>
              <input
                value={form.displayOrder}
                onChange={(event) =>
                  updateField(
                    "displayOrder",
                    event.target.value.replace(/[^\d]/g, "")
                  )
                }
                min="0"
                type="number"
                inputMode="numeric"
                placeholder="Enter display order"
                className={inputClass}
              />
              <HelperText>Lower number will be shown first. Use 0 for top priority.</HelperText>
            </Field>

            <div className="lg:col-span-2">
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
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${form.status === status ? "border-[#13854b]" : "border-[#bec5d4]"}`}>
                        {form.status === status && <span className="h-2.5 w-2.5 rounded-full bg-[#13854b]" />}
                      </span>
                      {status}
                    </label>
                  ))}
                </div>
              </Field>
            </div>

            <Field label="Category Icon" optional>
              <div className="flex items-center gap-[clamp(14px,1.7vw,24px)]">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-[clamp(58px,7vh,70px)] w-[clamp(58px,5.4vw,70px)] shrink-0 items-center justify-center overflow-hidden rounded-[7px] border border-dashed border-[#aeb6c8] bg-[#fbfcfe] transition hover:border-[#118449] hover:bg-[#f4fbf7]"
                  aria-label="Upload category icon"
                >
                  {form.iconPreview ? (
                    <img
                      src={form.iconPreview}
                      alt="Selected category icon"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UploadCloud className="h-8 w-8 text-[#23335b]" strokeWidth={1.7} />
                  )}
                </button>

                <div className="min-w-0">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                    onChange={handleIconUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex h-9 items-center gap-2 rounded-[6px] bg-[#f8f9fb] px-4 text-[clamp(11px,0.9vw,14px)] font-bold text-[#1b2850] shadow-sm ring-1 ring-[#eef0f4] transition hover:bg-[#f0f3f7]"
                  >
                    <Info className="h-4 w-4" />
                    Upload Icon
                  </button>

                  <p className="mt-2 truncate text-[clamp(10px,0.8vw,12px)] font-medium text-[#7b849c]">
                    {form.iconFile
                      ? form.iconFile.name
                      : "Recommended size: 64x64px, PNG, JPG"}
                  </p>
                </div>
              </div>
            </Field>

            <Field label="Applicable For" required>
              <div className="flex flex-wrap gap-x-[clamp(13px,1.4vw,21px)] gap-y-2 pt-0.5">
                {APPLICABLE_OPTIONS.map((option) => (
                  <Checkbox
                    key={option}
                    label={option}
                    checked={form.applicableFor.includes(option)}
                    onChange={() => handleApplicableChange(option)}
                  />
                ))}

                <Checkbox
                  label="All"
                  checked={allApplicableSelected}
                  onChange={toggleAllApplicable}
                />
              </div>
              <HelperText>Select where this category will be applicable.</HelperText>
            </Field>
          </div>
        </section>

        <div className="mt-[clamp(6px,0.75vh,9px)] shrink-0 rounded-[7px] border border-[#c9e7d8] bg-[#f1fbf6] px-[clamp(14px,1.5vw,22px)] py-[clamp(8px,0.9vh,11px)] text-[#17663f]">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 shrink-0" />
            <p className="text-[clamp(11px,0.92vw,14px)]">
              <span className="font-extrabold text-[#16233e]">Note:</span>
              <span className="ml-2 font-medium">
                You can manage sub categories after saving the main category.
              </span>
            </p>
          </div>
        </div>

        <div className="mt-[clamp(5px,0.65vh,8px)] flex shrink-0 justify-end gap-3">
          <button
            type="button"
            onClick={resetForm}
            disabled={isSaving}
            className="flex h-[clamp(36px,4vh,42px)] items-center gap-2 rounded-[6px] border border-[#d3d8e2] bg-white px-[clamp(18px,1.7vw,26px)] text-[clamp(11px,0.9vw,14px)] font-extrabold text-[#17244d] transition hover:bg-[#f7f8fb] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex h-[clamp(36px,4vh,42px)] min-w-[clamp(140px,11vw,168px)] items-center justify-center gap-2 rounded-[6px] bg-gradient-to-b from-[#12924d] to-[#04763a] px-6 text-[clamp(11px,0.9vw,14px)] font-extrabold text-white shadow-[0_6px_14px_rgba(4,118,58,0.18)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-65"
          >
            {isSaving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                {id ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {id ? "Update Category" : "Save Category"}
              </>
            )}
          </button>
        </div>
      </form>

      <footer className="mt-[clamp(3px,0.45vh,6px)] shrink-0 pb-0 text-[clamp(10px,0.82vw,13px)] font-medium text-[#7d869d]">
        © 2026 International Health &amp; Wellness Expo
        <span className="mx-2">|</span>
        Namo Gange Wellness Pvt. Ltd.
        <span className="mx-2">|</span>
        All Rights Reserved.
      </footer>
    </div>
  );
};

const inputClass =
  "h-[clamp(36px,4vh,42px)] w-full rounded-[6px] border border-[#d5dae4] bg-white px-4 text-[clamp(12px,0.95vw,14px)] font-medium text-[#1a274c] outline-none transition placeholder:text-[#8c94a9] focus:border-[#14864b] focus:ring-2 focus:ring-[#14864b]/10";

const Field = ({ label, required, optional, children }) => (
  <div className="min-w-0">
    <label className="mb-1.5 block text-[clamp(11px,0.9vw,14px)] font-extrabold text-[#162348]">
      {label}
      {required && <span className="ml-1 text-[#e3293a]">*</span>}
      {optional && (
        <span className="ml-1 font-medium text-[#65708a]">(Optional)</span>
      )}
    </label>
    {children}
  </div>
);

const HelperText = ({ children }) => (
  <p className="mt-1.5 text-[clamp(9px,0.75vw,11px)] font-medium text-[#7a849c]">
    {children}
  </p>
);

const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center gap-2 text-[clamp(10px,0.82vw,13px)] font-bold text-[#283659]">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="peer sr-only"
    />
    <span className="flex h-[17px] w-[17px] items-center justify-center rounded-[3px] border border-[#b8c0d0] bg-white text-[12px] font-black text-white peer-checked:border-[#118449] peer-checked:bg-[#118449]">
      {checked ? "✓" : ""}
    </span>
    <span className="whitespace-nowrap">{label}</span>
  </label>
);

export default AddNewExhibitorCategory;
