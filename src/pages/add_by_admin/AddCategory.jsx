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
import { showError, showSuccess } from "../../utils/toastMessage";

const AddCategory = () => {
  const dispatch = useDispatch();

  // ✅ Safe extraction – always get an array
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
    if (!formData.name.trim()) return showError("Please enter category name!");
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
        showSuccess("Category updated successfully!");
      } else {
        // ✅ Safe calculation of new ID (categories is now guaranteed array)
        const newId =
          categories.length > 0
            ? Math.max(...categories.map((c) => c.cat_id || 0)) + 1
            : 1;
        await dispatch(
          createCategory({ ...categoryData, cat_id: newId }),
        ).unwrap();
        showSuccess("Category added successfully!");
      }
      resetForm();
      dispatch(fetchCategories());
    } catch {
      showError("Failed to save category!");
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

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteCategory(id)).unwrap();
      showSuccess("Category deleted successfully!");
      dispatch(fetchCategories());
    } catch {
      showError("Failed to delete category!");
    }
  };

  return (
    <div className="bg-[#ecf0f5] min-h-screen">
      {/* Header */}
      <div className="bg-white px-5 py-1">
        <h1 className="text-gray-600 font-normal text-xl">CATEGORY</h1>
      </div>

      <div className="p-5 space-y-7">
        {/* Add / Edit Category */}
        <form onSubmit={handleAddCategory} className="bg-white shadow-sm pb-12">
          <div className="bg-white px-4 py-2">
            <h2 className="text-gray-500 font-semibold text-base">
              {editingCategory ? "EDIT CATEGORY" : "ADD CATEGORY"}
            </h2>
            <hr className="w-full opacity-10" />
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-[1fr_200px_auto_auto] gap-6 items-end">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter category name"
                className="w-full border border-gray-300 px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-6 mt-2">
                <label className="flex items-center gap-2 text-gray-700">
                  <input
                    type="radio"
                    name="status"
                    value="Active"
                    checked={formData.status === "Active"}
                    onChange={handleChange}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-gray-700">
                  <input
                    type="radio"
                    name="status"
                    value="Inactive"
                    checked={formData.status === "Inactive"}
                    onChange={handleChange}
                  />
                  Inactive
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div>
              <button
                type="submit"
                className="bg-[#3598dc] text-white text-xs px-6 py-2 hover:bg-[#2f82c4]"
              >
                {editingCategory ? "Edit Category" : "Add Category"}
              </button>
            </div>
            {editingCategory && (
              <div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-700 text-xs px-5 py-2 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </form>

        {/* List of Categories */}
        <div className="bg-white">
          <div className="bg-white px-5 py-1">
            <h2 className="text-gray-600 font-semibold text-base">
              LIST OF CATEGORY
            </h2>
          </div>
          <hr className="w-full opacity-10" />

          <div className="overflow-auto max-h-[550px] mx-5 my-2">
            <table className="w-full border border-gray-300 border-collapse text-sm">
              <thead className="bg-white">
                <tr>
                  <th className="border border-gray-300 px-4 py-3 text-center w-[70px] text-gray-700 font-semibold">
                    No.
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-gray-700 font-semibold">
                    Category
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 font-semibold w-[130px]">
                    Status
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 font-semibold w-[130px]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  categories.map((cat, index) => (
                    <tr
                      key={cat._id}
                      className={`${
                        index % 2 === 0 ? "bg-[#f9f9f9]" : "bg-white"
                      } border border-gray-300`}
                    >
                      <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-700">
                        {cat.cat_name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <span
                          className={`px-3 py-1 text-xs text-white ${
                            cat.cat_status.toLowerCase() === "active"
                              ? "bg-[#3598dc]"
                              : "bg-[#d9534f]"
                          }`}
                        >
                          {cat.cat_status}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleEdit(cat._id)}
                            className="border border-[#3598dc] text-[#3598dc] p-1 hover:bg-[#3598dc]/10"
                          >
                            <BiEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat._id)}
                            className="border border-[#d9534f] text-[#d9534f] p-1 hover:bg-[#d9534f]/10"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Info Row */}
          <div className="flex justify-end items-center px-5 py-2 text-sm text-gray-600">
            <p>
              Total{" "}
              <span className="text-gray-800 font-medium">
                {categories.length}
              </span>{" "}
              entries
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;
