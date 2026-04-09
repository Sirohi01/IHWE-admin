import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { BiEdit } from "react-icons/bi";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../features/add_by_admin/category/categorySlice";
import Swal from "sweetalert2";
import { createActivityLogThunk } from "../../features/activityLog/activityLogSlice";

const AddCategory = () => {
  const dispatch = useDispatch();

  const categoriesState = useSelector((state) => state.categories);
  const categories = Array.isArray(categoriesState?.categories)
    ? categoriesState.categories
    : [];
  const isLoading = categoriesState?.loading ?? false;

  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", status: "Active" });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ name: "", status: "Active" });
    setEditingCategory(null);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      Swal.fire({
        title: "Error",
        text: "Please enter a category name!",
        icon: "error",
        confirmButtonColor: "#23471d",
      });
      return;
    }

    const duplicate = categories.find(
      (c) =>
        c.cat_name.toLowerCase() === formData.name.trim().toLowerCase() &&
        c._id !== editingCategory?._id
    );
    if (duplicate) {
      Swal.fire({
        title: "Duplicate",
        text: "A category with that name already exists!",
        icon: "warning",
        confirmButtonColor: "#23471d",
      });
      return;
    }

    const categoryData = {
      cat_name: formData.name.trim(),
      cat_status: formData.status,
      cat_added: new Date().toISOString(),
    };
    try {
      if (editingCategory) {
        await dispatch(
          updateCategory({ id: editingCategory._id, updates: categoryData }),
        ).unwrap();
        
        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Updated category '${formData.name}'`,
            section: "System Configuration",
            data: { action: "UPDATE", type: "CATEGORY", name: formData.name }
          }));
        }

        Swal.fire({
          title: "Success!",
          text: "Category updated successfully!",
          icon: "success",
          confirmButtonColor: "#23471d",
        });
      } else {
        const newId =
          categories.length > 0
            ? Math.max(...categories.map((c) => c.cat_id || 0)) + 1
            : 1;
        await dispatch(
          createCategory({ ...categoryData, cat_id: newId }),
        ).unwrap();

        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Added new category '${formData.name}'`,
            section: "System Configuration",
            data: { action: "ADD", type: "CATEGORY", name: formData.name }
          }));
        }

        Swal.fire({
          title: "Success!",
          text: "Category added successfully!",
          icon: "success",
          confirmButtonColor: "#23471d",
        });
      }
      resetForm();
      dispatch(fetchCategories());
    } catch {
      Swal.fire({
        title: "Error",
        text: "Failed to save category!",
        icon: "error",
        confirmButtonColor: "#23471d",
      });
    }
  };

  const handleEdit = (id) => {
    const cat = categories.find((c) => c._id === id);
    if (cat) {
      setFormData({
        name: cat.cat_name,
        status:
          cat.cat_status.charAt(0).toUpperCase() + cat.cat_status.slice(1),
      });
      setEditingCategory(cat);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (categoryId) => {
    const categoryToDelete = categories.find((c) => c._id === categoryId);
    if (!categoryToDelete) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete category '${categoryToDelete.cat_name}'?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#23471d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteCategory(categoryId)).unwrap();
        
        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Deleted category '${categoryToDelete.cat_name}'`,
            section: "System Configuration",
            data: { action: "DELETE", type: "CATEGORY", name: categoryToDelete.cat_name }
          }));
        }

        Swal.fire({
          title: "Deleted!",
          text: "Category has been deleted.",
          icon: "success",
          confirmButtonColor: "#23471d",
        });
        dispatch(fetchCategories());
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: err?.message || "Failed to delete category.",
          icon: "error",
          confirmButtonColor: "#23471d",
        });
      }
    }
  };

  const inputCls = "rounded-[2px] border border-slate-400 h-8 focus:border-[#23471d] focus:ring-[#23471d]/10 transition-all text-[12px] bg-white placeholder:text-slate-400 text-slate-900 font-medium shadow-none outline-none px-3 w-full text-left";
  const labelCls = "text-[11px] font-bold text-slate-800 mb-1 block capitalize font-inter";

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-inter animate-fadeIn">
      {/* ── HEADER AREA ── */}
      <div className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b border-gray-100 bg-white px-2 py-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-slate-500 uppercase tracking-tight leading-none">
            CATEGORY CONFIGURATION
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            System Settings | Management
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6 space-y-8">
        {/* Form Container */}
        <div className="bg-white shadow-md border border-gray-200 rounded-[2px] overflow-hidden">
          {/* ── SUB-HEADER ── */}
          <div className="bg-slate-50/50 border-b border-slate-200 px-6 py-3">
            <h2 className="text-[16px] font-bold text-slate-800 uppercase tracking-tight">
              {editingCategory ? "Edit Category Details" : "Add New Category"}
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-0.5 font-bold">
              International Health & Wellness Expo 2026
            </p>
          </div>

          <div className="p-6 lg:p-10">
            <form onSubmit={handleAddCategory}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_200px] gap-8 items-end">
                {/* Name */}
                <div>
                  <label className={labelCls}>Category Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Enter category name"
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label className={labelCls}>Status <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-6 h-8">
                    <label className="flex items-center gap-2 text-[12px] text-slate-700 font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="Active"
                        checked={formData.status === "Active"}
                        onChange={handleChange}
                        className="accent-[#23471d]"
                      />
                      Active
                    </label>
                    <label className="flex items-center gap-2 text-[12px] text-slate-700 font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="Inactive"
                        checked={formData.status === "Inactive"}
                        onChange={handleChange}
                        className="accent-[#23471d]"
                      />
                      Inactive
                    </label>
                  </div>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                {editingCategory && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-8 py-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all rounded-[2px] shadow-sm"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="px-12 py-2.5 bg-[#23471d] hover:bg-[#1a3516] text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-[2px] shadow-lg flex items-center gap-3"
                >
                  {editingCategory ? "Update Category" : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* LIST AREA */}
        <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b bg-[#23471d]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white uppercase tracking-tight">
                  Category Registry
                </h2>
                <p className="text-sm text-green-100 mt-0.5">
                  Total {categories.length} categories
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto font-inter bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-black">
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center w-20">No.</th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-left">Category Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr><td colSpan={4} className="py-10 text-center text-gray-400 text-sm italic">Loading...</td></tr>
                ) : categories.length === 0 ? (
                  <tr><td colSpan={4} className="py-10 text-center text-gray-400 text-sm italic">No categories found</td></tr>
                ) : (
                  categories.map((cat, index) => (
                    <tr key={cat._id} className="hover:bg-blue-50 transition-colors border-b border-gray-100">
                      <td className="px-6 py-4 text-sm text-gray-900 text-center font-bold">{index + 1}</td>
                      <td 
                        onClick={() => handleEdit(cat._id)}
                        className="px-6 py-4 text-sm text-red-600 hover:text-red-800 cursor-pointer hover:underline font-medium uppercase"
                      >
                        {cat.cat_name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          cat.cat_status?.toLowerCase() === "active" 
                          ? "bg-green-50 text-green-700 border border-green-200" 
                          : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          {cat.cat_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleEdit(cat._id)} 
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition" 
                            title="Edit"
                          >
                            <BiEdit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(cat._id)} 
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition" 
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;
