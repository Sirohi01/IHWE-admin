import React, { useState, useEffect } from 'react';
import { Edit, Plus, Save, Search, Trash2, Filter, Info } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../features/add_by_admin/category/categorySlice';
import Swal from 'sweetalert2';
import PageHeader from '../../components/PageHeader';
import { createActivityLogThunk } from '../../features/activityLog/activityLogSlice';
import Pagination from '../../components/Pagination'; // assuming this exists, or we use standard pagination

const AddCategory = () => {
  const dispatch = useDispatch();

  const categoriesState = useSelector((state) => state.categories);
  const categories = Array.isArray(categoriesState?.categories)
    ? categoriesState.categories
    : [];
  const isLoading = categoriesState?.loading ?? false;

  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(null); // ID of category being edited
  const [categoryForm, setCategoryForm] = useState({ name: '', status: 'Active' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Filter and search logic
  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.cat_name?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesStatus = statusFilter === 'All' ||
      (statusFilter === 'Active' && cat.cat_status?.toLowerCase() === 'active') ||
      (statusFilter === 'Inactive' && cat.cat_status?.toLowerCase() === 'inactive');
    return matchesSearch && matchesStatus;
  }).sort((a, b) => (a.cat_name || "").localeCompare(b.cat_name || ""));

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setIsEditing(null);
    setCategoryForm({ name: '', status: 'Active' });
    setIsModalOpen(false);
  };

  const startEdit = (cat) => {
    setIsEditing(cat._id);
    setCategoryForm({
      name: cat.cat_name,
      status: cat.cat_status.charAt(0).toUpperCase() + cat.cat_status.slice(1)
    });
    setIsModalOpen(true);
  };

  const handleAddOrUpdateCategory = async () => {
    if (!categoryForm.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Field',
        text: 'Please enter a category name',
        confirmButtonColor: '#23471d'
      });
      return;
    }

    const duplicate = categories.find(
      (c) =>
        c.cat_name.toLowerCase() === categoryForm.name.trim().toLowerCase() &&
        c._id !== isEditing
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

    try {
      setIsSaving(true);
      const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo") || "{}");
      const userName = adminInfo.fullName || adminInfo.name || adminInfo.username || "Admin User";

      const categoryData = {
        cat_name: categoryForm.name.trim(),
        cat_status: categoryForm.status,
        cat_added: new Date().toISOString(),
        updated_by: userName // API/Slice can utilize this if backend supports it
      };

      if (isEditing) {
        await dispatch(updateCategory({ id: isEditing, updates: categoryData })).unwrap();

        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Updated category '${categoryForm.name}'`,
            section: "System Configuration",
            data: { action: "UPDATE", type: "CATEGORY", name: categoryForm.name }
          }));
        }
      } else {
        const newId = categories.length > 0 ? Math.max(...categories.map((c) => c.cat_id || 0)) + 1 : 1;
        await dispatch(createCategory({ ...categoryData, cat_id: newId, updated_by: userName })).unwrap();

        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Added new category '${categoryForm.name}'`,
            section: "System Configuration",
            data: { action: "ADD", type: "CATEGORY", name: categoryForm.name }
          }));
        }
      }

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: isEditing ? 'Category updated successfully' : 'Category created successfully',
        timer: 1500,
        showConfirmButton: false
      });
      resetForm();
      dispatch(fetchCategories());
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.message || 'Operation failed',
        confirmButtonColor: '#23471d'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete category "${cat.cat_name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteCategory(cat._id)).unwrap();

        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Deleted category '${cat.cat_name}'`,
            section: "System Configuration",
            data: { action: "DELETE", type: "CATEGORY", name: cat.cat_name }
          }));
        }

        Swal.fire('Deleted!', 'Category has been deleted.', 'success');
        dispatch(fetchCategories());
      } catch (error) {
        Swal.fire('Error', error?.message || 'Failed to delete category', 'error');
      }
    }
  };

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
      <PageHeader
        title="CATEGORY CONFIGURATION"
        description="System Settings | Management for International Health & Wellness Expo 2026"
      />

      <div className="mt-6">
        {/* Modal for Add/Edit Category Form */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
              <button
                onClick={resetForm}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
                {isEditing ? <Edit className="w-5 h-5 text-[#d26019]" /> : <Plus className="w-5 h-5 text-[#d26019]" />}
                {isEditing ? 'Edit Category Details' : 'Add New Category'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={categoryForm.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Health Supplements"
                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                  <div className="flex gap-2 mt-0.5">
                    {['Active', 'Inactive'].map(s => (
                      <label key={s}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12px] cursor-pointer transition-colors ${categoryForm.status === s
                          ? 'bg-[#eef5ec] border-[#1e4018] text-[#1e4018]'
                          : 'border-gray-200 text-gray-500'
                          }`}>
                        <input type="radio" name="status" value={s}
                          checked={categoryForm.status === s}
                          onChange={(e) => handleInputChange({ target: { name: 'status', value: e.target.value } })}
                          className="accent-[#1e4018]" />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddOrUpdateCategory}
                    disabled={isSaving}
                    className="flex-1 py-1 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{isEditing ? 'Update Category' : 'Create Category'}</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-4 py-1 bg-gray-500 text-white font-bold hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <div className="mt-2 p-4 bg-green-50 border border-green-100 flex gap-3">
                <Info className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-[10px] text-green-700 font-bold uppercase leading-relaxed">
                  Categories defined here will be available in the Exhibitor sections.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex flex-1 gap-4 items-center w-full md:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#23471d] outline-none"
              />
            </div>
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={handleFilterChange}
                className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#23471d] outline-none appearance-none bg-white cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#23471d] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#1a3516] transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b">S.No.</th>
                <th className="p-4 font-bold border-b">Category Name</th>
                <th className="p-4 font-bold border-b">Status</th>
                <th className="p-4 font-bold border-b text-center">Created At</th>
                <th className="p-4 font-bold border-b text-center">Updated By</th>
                <th className="p-4 font-bold border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-4 border-[#23471d]/20 border-t-[#23471d] rounded-full animate-spin" />
                      <span className="text-sm font-medium">Loading categories...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedCategories.length > 0 ? (
                paginatedCategories.map((cat, index) => (
                  <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[#23471d]">{cat.cat_name}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-full ${cat.cat_status?.toLowerCase() === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                        }`}>
                        {cat.cat_status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-center text-gray-500">
                      {new Date(cat.cat_added).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm text-center text-gray-500">
                      {cat.updated_by ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">{cat.updated_by}</span>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {new Date(cat.cat_updated || cat.cat_added).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">N/A</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Edit Category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Info className="w-8 h-8 text-gray-400" />
                      <p className="text-sm">No categories found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-end">
            {/* We use basic pagination component layout to avoid importing unknown Pagination if it doesn't exist. Let's just create inline buttons if Pagination is not available or use standard inline one. */}
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium ${currentPage === i + 1 ? 'bg-[#23471d] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddCategory;
