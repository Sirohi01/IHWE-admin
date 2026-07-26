// import React, { useState, useEffect } from 'react';
// import { Edit, Plus, Save, Search, Trash2, Filter, Info } from 'lucide-react';
// import { useSelector, useDispatch } from 'react-redux';
// import {
//   fetchCategories,
//   createCategory,
//   updateCategory,
//   deleteCategory,
// } from '../../features/add_by_admin/category/categorySlice';
// import Swal from 'sweetalert2';
// import PageHeader from '../../components/PageHeader';
// import { createActivityLogThunk } from '../../features/activityLog/activityLogSlice';
// import Pagination from '../../components/Pagination'; // assuming this exists, or we use standard pagination

// const AddCategory = () => {
//   const dispatch = useDispatch();

//   const categoriesState = useSelector((state) => state.categories);
//   const categories = Array.isArray(categoriesState?.categories)
//     ? categoriesState.categories
//     : [];
//   const isLoading = categoriesState?.loading ?? false;

//   const [isSaving, setIsSaving] = useState(false);
//   const [isEditing, setIsEditing] = useState(null); // ID of category being edited
//   const [categoryForm, setCategoryForm] = useState({ name: '', status: 'Active' });
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // Search and Filter states
//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearch, setDebouncedSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('All');

//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   useEffect(() => {
//     dispatch(fetchCategories());
//   }, [dispatch]);

//   // Debounce search term
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearch(searchTerm);
//       setCurrentPage(1); // Reset to first page on search
//     }, 300);
//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   const handleFilterChange = (e) => {
//     setStatusFilter(e.target.value);
//     setCurrentPage(1); // Reset to first page on filter change
//   };

//   // Filter and search logic
//   const filteredCategories = categories.filter(cat => {
//     const matchesSearch = cat.cat_name?.toLowerCase().includes(debouncedSearch.toLowerCase());
//     const matchesStatus = statusFilter === 'All' ||
//       (statusFilter === 'Active' && cat.cat_status?.toLowerCase() === 'active') ||
//       (statusFilter === 'Inactive' && cat.cat_status?.toLowerCase() === 'inactive');
//     return matchesSearch && matchesStatus;
//   }).sort((a, b) => (a.cat_name || "").localeCompare(b.cat_name || ""));

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const paginatedCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setCategoryForm(prev => ({ ...prev, [name]: value }));
//   };

//   const resetForm = () => {
//     setIsEditing(null);
//     setCategoryForm({ name: '', status: 'Active' });
//     setIsModalOpen(false);
//   };

//   const startEdit = (cat) => {
//     setIsEditing(cat._id);
//     setCategoryForm({
//       name: cat.cat_name,
//       status: cat.cat_status.charAt(0).toUpperCase() + cat.cat_status.slice(1)
//     });
//     setIsModalOpen(true);
//   };

//   const handleAddOrUpdateCategory = async () => {
//     if (!categoryForm.name.trim()) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Missing Field',
//         text: 'Please enter a category name',
//         confirmButtonColor: '#23471d'
//       });
//       return;
//     }

//     const duplicate = categories.find(
//       (c) =>
//         c.cat_name.toLowerCase() === categoryForm.name.trim().toLowerCase() &&
//         c._id !== isEditing
//     );
//     if (duplicate) {
//       Swal.fire({
//         title: "Duplicate",
//         text: "A category with that name already exists!",
//         icon: "warning",
//         confirmButtonColor: "#23471d",
//       });
//       return;
//     }

//     try {
//       setIsSaving(true);
//       const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo") || "{}");
//       const userName = adminInfo.fullName || adminInfo.name || adminInfo.username || "Admin User";

//       const categoryData = {
//         cat_name: categoryForm.name.trim(),
//         cat_status: categoryForm.status,
//         cat_added: new Date().toISOString(),
//         updated_by: userName // API/Slice can utilize this if backend supports it
//       };

//       if (isEditing) {
//         await dispatch(updateCategory({ id: isEditing, updates: categoryData })).unwrap();

//         // Log activity
//         const userId = sessionStorage.getItem("user_id");
//         if (userId) {
//           dispatch(createActivityLogThunk({
//             user_id: userId,
//             message: `System Config: Updated category '${categoryForm.name}'`,
//             section: "System Configuration",
//             data: { action: "UPDATE", type: "CATEGORY", name: categoryForm.name }
//           }));
//         }
//       } else {
//         const newId = categories.length > 0 ? Math.max(...categories.map((c) => c.cat_id || 0)) + 1 : 1;
//         await dispatch(createCategory({ ...categoryData, cat_id: newId, updated_by: userName })).unwrap();

//         // Log activity
//         const userId = sessionStorage.getItem("user_id");
//         if (userId) {
//           dispatch(createActivityLogThunk({
//             user_id: userId,
//             message: `System Config: Added new category '${categoryForm.name}'`,
//             section: "System Configuration",
//             data: { action: "ADD", type: "CATEGORY", name: categoryForm.name }
//           }));
//         }
//       }

//       Swal.fire({
//         icon: 'success',
//         title: 'Success',
//         text: isEditing ? 'Category updated successfully' : 'Category created successfully',
//         timer: 1500,
//         showConfirmButton: false
//       });
//       resetForm();
//       dispatch(fetchCategories());
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: error?.message || 'Operation failed',
//         confirmButtonColor: '#23471d'
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDeleteCategory = async (cat) => {
//     const result = await Swal.fire({
//       title: 'Are you sure?',
//       text: `Delete category "${cat.cat_name}"?`,
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#3085d6',
//       confirmButtonText: 'Yes, delete it!'
//     });

//     if (result.isConfirmed) {
//       try {
//         await dispatch(deleteCategory(cat._id)).unwrap();

//         // Log activity
//         const userId = sessionStorage.getItem("user_id");
//         if (userId) {
//           dispatch(createActivityLogThunk({
//             user_id: userId,
//             message: `System Config: Deleted category '${cat.cat_name}'`,
//             section: "System Configuration",
//             data: { action: "DELETE", type: "CATEGORY", name: cat.cat_name }
//           }));
//         }

//         Swal.fire('Deleted!', 'Category has been deleted.', 'success');
//         dispatch(fetchCategories());
//       } catch (error) {
//         Swal.fire('Error', error?.message || 'Failed to delete category', 'error');
//       }
//     }
//   };

//   return (
//     <div className="bg-white shadow-md  p-6 min-h-screen">
//       <PageHeader
//         title="CATEGORY CONFIGURATION"
//         description="System Settings | Management for International Health & Wellness Expo 2026"
//       />

//       <div className="mt-6">
//         {/* Modal for Add/Edit Category Form */}
//         {isModalOpen && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//             <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
//               <button
//                 onClick={resetForm}
//                 className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//               <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
//                 {isEditing ? <Edit className="w-5 h-5 text-[#d26019]" /> : <Plus className="w-5 h-5 text-[#d26019]" />}
//                 {isEditing ? 'Edit Category Details' : 'Add New Category'}
//               </h2>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category Name *</label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={categoryForm.name}
//                     onChange={handleInputChange}
//                     placeholder="e.g. Health Supplements"
//                     className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm font-semibold"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
//                   <div className="flex gap-2 mt-0.5">
//                     {['Active', 'Inactive'].map(s => (
//                       <label key={s}
//                         className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12px] cursor-pointer transition-colors ${categoryForm.status === s
//                           ? 'bg-[#eef5ec] border-[#1e4018] text-[#1e4018]'
//                           : 'border-gray-200 text-gray-500'
//                           }`}>
//                         <input type="radio" name="status" value={s}
//                           checked={categoryForm.status === s}
//                           onChange={(e) => handleInputChange({ target: { name: 'status', value: e.target.value } })}
//                           className="accent-[#1e4018]" />
//                         {s}
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={handleAddOrUpdateCategory}
//                     disabled={isSaving}
//                     className="flex-1 py-1 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
//                   >
//                     {isSaving ? (
//                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                     ) : (
//                       <>
//                         <Save className="w-4 h-4" />
//                         <span>{isEditing ? 'Update Category' : 'Create Category'}</span>
//                       </>
//                     )}
//                   </button>
//                   <button
//                     onClick={resetForm}
//                     className="px-4 py-1 bg-gray-500 text-white font-bold hover:bg-gray-600 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>

//               <div className="mt-2 p-4 bg-green-50 border border-green-100 flex gap-3">
//                 <Info className="w-5 h-5 text-green-600 shrink-0" />
//                 <p className="text-[10px] text-green-700 font-bold uppercase leading-relaxed">
//                   Categories defined here will be available in the Exhibitor sections.
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="mb-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
//           <div className="flex flex-1 gap-4 items-center w-full md:w-auto">
//             <div className="relative flex-1 max-w-md">
//               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search categories by name..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#23471d] outline-none"
//               />
//             </div>
//             <div className="relative">
//               <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//               <select
//                 value={statusFilter}
//                 onChange={handleFilterChange}
//                 className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#23471d] outline-none appearance-none bg-white cursor-pointer"
//               >
//                 <option value="Active">Active</option>
//                 <option value="Inactive">Inactive</option>
//               </select>
//             </div>
//           </div>
//           <button
//             onClick={() => setIsModalOpen(true)}
//             className="bg-[#23471d] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#1a3516] transition-colors whitespace-nowrap"
//           >
//             <Plus className="w-4 h-4" /> Add Category
//           </button>
//         </div>

//         <div className="overflow-x-auto border border-gray-200 rounded-lg">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
//                 <th className="p-4 font-bold border-b">S.No.</th>
//                 <th className="p-4 font-bold border-b">Category Name</th>
//                 <th className="p-4 font-bold border-b">Status</th>
//                 <th className="p-4 font-bold border-b text-center">Created At</th>
//                 <th className="p-4 font-bold border-b text-center">Updated By</th>
//                 <th className="p-4 font-bold border-b text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {isLoading ? (
//                 <tr>
//                   <td colSpan="6" className="p-8 text-center text-gray-500">
//                     <div className="flex flex-col items-center justify-center gap-2">
//                       <div className="w-8 h-8 border-4 border-[#23471d]/20 border-t-[#23471d] rounded-full animate-spin" />
//                       <span className="text-sm font-medium">Loading categories...</span>
//                     </div>
//                   </td>
//                 </tr>
//               ) : paginatedCategories.length > 0 ? (
//                 paginatedCategories.map((cat, index) => (
//                   <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
//                     <td className="p-4 text-sm font-medium text-gray-900">
//                       {indexOfFirstItem + index + 1}
//                     </td>
//                     <td className="p-4">
//                       <div className="font-bold text-[#23471d]">{cat.cat_name}</div>
//                     </td>
//                     <td className="p-4">
//                       <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-full ${cat.cat_status?.toLowerCase() === 'active'
//                         ? 'bg-green-100 text-green-700'
//                         : 'bg-red-100 text-red-700'
//                         }`}>
//                         {cat.cat_status}
//                       </span>
//                     </td>
//                     <td className="p-4 text-sm text-center text-gray-500">
//                       {new Date(cat.cat_added).toLocaleDateString()}
//                     </td>
//                     <td className="p-4 text-sm text-center text-gray-500">
//                       {cat.updated_by ? (
//                         <div className="flex flex-col items-center gap-1">
//                           <span className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">{cat.updated_by}</span>
//                           <span className="text-[10px] text-gray-400 whitespace-nowrap">
//                             {new Date(cat.cat_updated || cat.cat_added).toLocaleString()}
//                           </span>
//                         </div>
//                       ) : (
//                         <span className="text-gray-400 text-xs italic">N/A</span>
//                       )}
//                     </td>
//                     <td className="p-4">
//                       <div className="flex items-center justify-center gap-2">
//                         <button
//                           onClick={() => startEdit(cat)}
//                           className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
//                           title="Edit Category"
//                         >
//                           <Edit className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => handleDeleteCategory(cat)}
//                           className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors"
//                           title="Delete Category"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="6" className="p-8 text-center text-gray-500">
//                     <div className="flex flex-col items-center justify-center gap-2">
//                       <Info className="w-8 h-8 text-gray-400" />
//                       <p className="text-sm">No categories found matching your criteria</p>
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {totalPages > 1 && (
//           <div className="mt-4 flex justify-end">
//             {/* We use basic pagination component layout to avoid importing unknown Pagination if it doesn't exist. Let's just create inline buttons if Pagination is not available or use standard inline one. */}
//             <div className="flex gap-1">
//               {Array.from({ length: totalPages }).map((_, i) => (
//                 <button
//                   key={i}
//                   onClick={() => setCurrentPage(i + 1)}
//                   className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium ${currentPage === i + 1 ? 'bg-[#23471d] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                     }`}
//                 >
//                   {i + 1}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AddCategory;
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Grid2X2,
  Info,
  Layers3,
  MoreVertical,
  PauseCircle,
  Plus,
  RotateCcw,
  Save,
  Search,
  SlidersHorizontal,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../features/add_by_admin/category/categorySlice';
import { createActivityLogThunk } from '../../features/activityLog/activityLogSlice';

const ITEMS_PER_PAGE = 10;

const normaliseText = (value) => String(value ?? '').trim();

const getCategoryStatus = (category) => {
  const status = normaliseText(category?.cat_status || category?.status || 'Inactive');
  return status.toLowerCase() === 'active' ? 'Active' : 'Inactive';
};

const getMainCategory = (category) => {
  const value =
    category?.main_category?.name ||
    category?.main_category?.cat_name ||
    category?.main_category ||
    category?.parent_category?.name ||
    category?.parent_category ||
    category?.category_group ||
    category?.cat_group;

  return normaliseText(value) || 'Unassigned';
};

const getBusinessNature = (category) => {
  const value =
    category?.business_nature?.name ||
    category?.business_nature ||
    category?.businessNature ||
    category?.nature_of_business ||
    category?.nature;

  return normaliseText(value) || 'Not specified';
};

const getSubCategoryCount = (category) => {
  if (Array.isArray(category?.sub_categories)) return category.sub_categories.length;
  if (Array.isArray(category?.subcategories)) return category.subcategories.length;

  const value =
    category?.sub_category_count ??
    category?.subcategories_count ??
    category?.subCategoryCount ??
    category?.child_count ??
    0;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getDateValue = (category) =>
  category?.cat_updated ||
  category?.updatedAt ||
  category?.cat_added ||
  category?.createdAt ||
  null;

const formatDate = (value, options = {}) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: options.longMonth ? 'short' : '2-digit',
    year: 'numeric',
  });
};

const formatTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const getAdminName = (category) =>
  normaliseText(
    category?.updated_by?.name ||
    category?.updated_by ||
    category?.updatedBy ||
    category?.created_by?.name ||
    category?.created_by,
  ) || 'Admin';

const badgePalette = [
  'bg-blue-50 text-blue-600',
  'bg-cyan-50 text-cyan-600',
  'bg-emerald-50 text-emerald-600',
  'bg-orange-50 text-orange-600',
  'bg-pink-50 text-pink-600',
  'bg-lime-50 text-lime-700',
  'bg-violet-50 text-violet-600',
  'bg-sky-50 text-sky-600',
  'bg-teal-50 text-teal-600',
  'bg-amber-50 text-amber-600',
];

const getBadgeClass = (text) => {
  const hash = normaliseText(text)
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0);
  return badgePalette[hash % badgePalette.length];
};

const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const AddCategory = () => {
  const dispatch = useDispatch();

  const categoriesState = useSelector((state) => state.categories);
  const categories = Array.isArray(categoriesState?.categories)
    ? categoriesState.categories
    : [];
  const isLoading = Boolean(categoriesState?.loading);

  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', status: 'Active' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [businessNatureFilter, setBusinessNatureFilter] = useState('All');
  const [mainCategoryFilter, setMainCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionId, setOpenActionId] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const businessNatureOptions = useMemo(
    () =>
      [...new Set(categories.map(getBusinessNature).filter((item) => item !== 'Not specified'))]
        .sort((a, b) => a.localeCompare(b)),
    [categories],
  );

  const mainCategoryOptions = useMemo(
    () =>
      [...new Set(categories.map(getMainCategory).filter((item) => item !== 'Unassigned'))]
        .sort((a, b) => a.localeCompare(b)),
    [categories],
  );

  const filteredCategories = useMemo(() => {
    const query = debouncedSearch.toLowerCase();

    return [...categories]
      .filter((category) => {
        const name = normaliseText(category?.cat_name).toLowerCase();
        const matchesSearch = !query || name.includes(query);
        const matchesStatus =
          statusFilter === 'All' || getCategoryStatus(category) === statusFilter;
        const matchesBusinessNature =
          businessNatureFilter === 'All' ||
          getBusinessNature(category) === businessNatureFilter;
        const matchesMainCategory =
          mainCategoryFilter === 'All' || getMainCategory(category) === mainCategoryFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesBusinessNature &&
          matchesMainCategory
        );
      })
      .sort((a, b) => normaliseText(a?.cat_name).localeCompare(normaliseText(b?.cat_name)));
  }, [categories, debouncedSearch, statusFilter, businessNatureFilter, mainCategoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const firstItemIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCategories = filteredCategories.slice(
    firstItemIndex,
    firstItemIndex + ITEMS_PER_PAGE,
  );

  const activeCount = categories.filter(
    (category) => getCategoryStatus(category) === 'Active',
  ).length;
  const inactiveCount = categories.length - activeCount;
  const totalSubCategories = categories.reduce(
    (total, category) => total + getSubCategoryCount(category),
    0,
  );

  const lastUpdatedCategory = useMemo(() => {
    return categories.reduce((latest, category) => {
      const currentDate = new Date(getDateValue(category) || 0).getTime();
      const latestDate = new Date(getDateValue(latest) || 0).getTime();
      return currentDate > latestDate ? category : latest;
    }, null);
  }, [categories]);

  const lastUpdatedValue = getDateValue(lastUpdatedCategory);

  const resetForm = () => {
    setIsEditing(null);
    setCategoryForm({ name: '', status: 'Active' });
    setIsModalOpen(false);
  };

  const startEdit = (category) => {
    setIsEditing(category?._id);
    setCategoryForm({
      name: normaliseText(category?.cat_name),
      status: getCategoryStatus(category),
    });
    setOpenActionId(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCategoryForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleAddOrUpdateCategory = async () => {
    const categoryName = categoryForm.name.trim();

    if (!categoryName) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Field',
        text: 'Please enter a category name.',
        confirmButtonColor: '#0f4cbd',
      });
      return;
    }

    const duplicate = categories.find(
      (category) =>
        normaliseText(category?.cat_name).toLowerCase() === categoryName.toLowerCase() &&
        category?._id !== isEditing,
    );

    if (duplicate) {
      Swal.fire({
        title: 'Duplicate Category',
        text: 'A category with this name already exists.',
        icon: 'warning',
        confirmButtonColor: '#0f4cbd',
      });
      return;
    }

    try {
      setIsSaving(true);

      const adminInfo = JSON.parse(
        localStorage.getItem('adminInfo') ||
        sessionStorage.getItem('adminInfo') ||
        '{}',
      );
      const userName =
        adminInfo.fullName || adminInfo.name || adminInfo.username || 'Admin';

      const categoryData = {
        cat_name: categoryName,
        cat_status: categoryForm.status,
        cat_added: new Date().toISOString(),
        updated_by: userName,
      };

      if (isEditing) {
        await dispatch(
          updateCategory({ id: isEditing, updates: categoryData }),
        ).unwrap();
      } else {
        const numericIds = categories
          .map((category) => Number(category?.cat_id))
          .filter(Number.isFinite);
        const newId = numericIds.length ? Math.max(...numericIds) + 1 : 1;

        await dispatch(
          createCategory({ ...categoryData, cat_id: newId }),
        ).unwrap();
      }

      const userId = sessionStorage.getItem('user_id');
      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `System Config: ${isEditing ? 'Updated' : 'Added'} category '${categoryName}'`,
            section: 'System Configuration',
            data: {
              action: isEditing ? 'UPDATE' : 'ADD',
              type: 'CATEGORY',
              name: categoryName,
            },
          }),
        );
      }

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: isEditing
          ? 'Category updated successfully.'
          : 'Category created successfully.',
        timer: 1400,
        showConfirmButton: false,
      });

      resetForm();
      dispatch(fetchCategories());
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Operation Failed',
        text: error?.message || 'Please try again.',
        confirmButtonColor: '#0f4cbd',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    setOpenActionId(null);

    const result = await Swal.fire({
      title: 'Delete category?',
      text: `“${normaliseText(category?.cat_name)}” will be permanently removed.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it',
    });

    if (!result.isConfirmed) return;

    try {
      await dispatch(deleteCategory(category?._id)).unwrap();

      const userId = sessionStorage.getItem('user_id');
      if (userId) {
        dispatch(
          createActivityLogThunk({
            user_id: userId,
            message: `System Config: Deleted category '${category?.cat_name}'`,
            section: 'System Configuration',
            data: {
              action: 'DELETE',
              type: 'CATEGORY',
              name: category?.cat_name,
            },
          }),
        );
      }

      Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'Category has been deleted.',
        timer: 1200,
        showConfirmButton: false,
      });
      dispatch(fetchCategories());
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: error?.message || 'Unable to delete this category.',
        confirmButtonColor: '#0f4cbd',
      });
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setStatusFilter('All');
    setBusinessNatureFilter('All');
    setMainCategoryFilter('All');
    setCurrentPage(1);
  };

  const exportCategories = () => {
    const rows = filteredCategories.map((category, index) => [
      index + 1,
      category?.cat_name,
      getMainCategory(category),
      getBusinessNature(category),
      getCategoryStatus(category),
      getSubCategoryCount(category),
      `${formatDate(getDateValue(category))} ${formatTime(getDateValue(category))}`,
      getAdminName(category),
    ]);

    const csv = [
      [
        'S.No.',
        'Category Name',
        'Main Category',
        'Business Nature',
        'Status',
        'Sub Categories',
        'Created / Last Updated',
        'Updated By',
      ],
      ...rows,
    ]
      .map((row) => row.map(csvEscape).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `exhibitor-categories-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const paginationItems = useMemo(() => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 4) return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
    if (currentPage >= totalPages - 3) {
      return [
        1,
        'ellipsis',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      'ellipsis-left',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      'ellipsis-right',
      totalPages,
    ];
  }, [currentPage, totalPages]);

  const statCards = [
    {
      title: 'Total Categories',
      value: categories.length,
      subtitle: 'All Categories',
      icon: Grid2X2,
      iconClass: 'text-blue-600',
      bubbleClass: 'bg-blue-50',
    },
    {
      title: 'Active Categories',
      value: activeCount,
      subtitle: 'Currently Active',
      icon: CheckCircle2,
      iconClass: 'text-green-600',
      bubbleClass: 'bg-green-50',
    },
    {
      title: 'Inactive Categories',
      value: inactiveCount,
      subtitle: 'Not in Use',
      icon: PauseCircle,
      iconClass: 'text-orange-500',
      bubbleClass: 'bg-orange-50',
    },
    {
      title: 'Sub Categories',
      value: totalSubCategories,
      subtitle: 'Total Linked',
      icon: Layers3,
      iconClass: 'text-violet-600',
      bubbleClass: 'bg-violet-50',
    },
    {
      title: 'Last Updated',
      value: lastUpdatedValue ? formatDate(lastUpdatedValue, { longMonth: true }) : '—',
      subtitle: lastUpdatedValue ? formatTime(lastUpdatedValue) : 'No updates yet',
      icon: CalendarDays,
      iconClass: 'text-pink-500',
      bubbleClass: 'bg-pink-50',
      isDate: true,
    },
  ];

  return (
    <div className="h-[calc(100dvh-72px)] overflow-hidden bg-[#f7f9fc] p-[clamp(12px,1.55vw,24px)] text-[#102a67]">
      <div className="grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-[clamp(10px,1.15vw,18px)]">
        <header className="flex items-start justify-between gap-5 px-2">
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-2 text-[clamp(10px,.76vw,12px)] font-semibold text-slate-500">
              <span>System Configuration</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-lime-600">Add Category</span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="truncate text-[clamp(20px,1.55vw,28px)] font-extrabold leading-tight tracking-[-0.02em] text-[#112a68]">
                Exhibitor Category Management
              </h1>
              <Info className="h-4 w-4 shrink-0 text-slate-400" />
            </div>
            <p className="mt-1 text-[clamp(10px,.78vw,13px)] font-medium text-slate-500">
              Create, update or inactivate exhibitor categories for IHWE 2026.
            </p>
          </div>

          <Link
            to="add-exhibitor-category"
            className="mt-2 inline-flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-lg bg-[#075fd7] px-5 text-[clamp(11px,.78vw,13px)] font-bold text-white shadow-[0_8px_20px_rgba(7,95,215,0.22)] transition hover:bg-[#064fbb] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add New Category
          </Link>
        </header>

        <section className="grid grid-cols-5 gap-[clamp(10px,1.4vw,24px)]">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="flex min-w-0 items-center gap-[clamp(10px,1vw,18px)] rounded-xl border border-slate-200/80 bg-white px-[clamp(12px,1.35vw,22px)] py-[clamp(12px,1.15vw,18px)] shadow-[0_4px_16px_rgba(15,23,42,0.05)]"
              >
                <div
                  className={`grid h-[clamp(48px,4vw,64px)] w-[clamp(48px,4vw,64px)] shrink-0 place-items-center rounded-full ${card.bubbleClass}`}
                >
                  <Icon className={`h-[clamp(24px,2vw,31px)] w-[clamp(24px,2vw,31px)] ${card.iconClass}`} />
                </div>
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-[clamp(10px,.72vw,12px)] font-bold text-[#173978]">
                    {card.title}
                  </p>
                  <p
                    className={`mt-1 truncate font-extrabold text-[#102a67] ${card.isDate
                      ? 'text-[clamp(14px,1.15vw,14px)]'
                      : 'text-[clamp(19px,1.55vw,19px)]'
                      }`}
                  >
                    {card.value}
                  </p>
                  <p className="mt-1 truncate text-[clamp(9px,.66vw,11px)] font-semibold text-slate-500">
                    {card.subtitle}
                  </p>
                </div>
              </article>
            );
          })}
        </section>

        <main className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)]">
          <div className="grid shrink-0 grid-cols-[minmax(210px,1.45fr)_minmax(150px,.85fr)_minmax(170px,1fr)_minmax(170px,1fr)_90px_1fr_auto_auto] items-end gap-3 border-b border-slate-200 px-[clamp(12px,1.15vw,20px)] py-[clamp(11px,1vw,16px)]">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#284780]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search category by name..."
                className="h-[46px] w-full rounded-lg border border-slate-200 bg-white px-4 pr-10 text-[clamp(10px,.72vw,12px)] font-semibold text-[#173978] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
              options={['All', 'Active', 'Inactive']}
              allLabel="All Status"
            />

            <FilterSelect
              label="Business Nature"
              value={businessNatureFilter}
              onChange={(value) => {
                setBusinessNatureFilter(value);
                setCurrentPage(1);
              }}
              options={['All', ...businessNatureOptions]}
              allLabel="All"
            />

            <FilterSelect
              label="Main Category"
              value={mainCategoryFilter}
              onChange={(value) => {
                setMainCategoryFilter(value);
                setCurrentPage(1);
              }}
              options={['All', ...mainCategoryOptions]}
              allLabel="All"
            />

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-[46px] items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[clamp(10px,.7vw,12px)] font-bold text-[#173978] transition hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>

            <div />

            <button
              type="button"
              onClick={exportCategories}
              disabled={!filteredCategories.length}
              className="inline-flex h-[46px] items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-[clamp(10px,.72vw,12px)] font-bold text-[#173978] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter('All');
                setBusinessNatureFilter('All');
                setMainCategoryFilter('All');
                setCurrentPage(1);
              }}
              className="grid h-[46px] w-[54px] place-items-center rounded-lg border border-slate-200 bg-white text-[#173978] transition hover:bg-slate-50"
              title="Clear advanced filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            <table className="h-full w-full table-fixed border-collapse text-left">
              <colgroup>
                <col className="w-[5%]" />
                <col className="w-[20%]" />
                <col className="w-[14.5%]" />
                <col className="w-[13.5%]" />
                <col className="w-[9%]" />
                <col className="w-[10%]" />
                <col className="w-[18.5%]" />
                <col className="w-[9.5%]" />
              </colgroup>

              <thead>
                <tr className="h-[40px] bg-[#073c9d] text-white">
                  {[
                    'SL. NO.',
                    'CATEGORY NAME',
                    'MAIN CATEGORY',
                    'BUSINESS NATURE',
                    'STATUS',
                    'SUB CATEGORIES',
                    'CREATED / LAST UPDATED',
                    'ACTIONS',
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="truncate px-[clamp(8px,1.1vw,20px)] text-[clamp(8px,.62vw,10px)] font-extrabold tracking-[0.02em]"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center">
                      <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 text-slate-500">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                        <span className="text-sm font-semibold">Loading categories...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedCategories.length ? (
                  paginatedCategories.map((category, index) => {
                    const status = getCategoryStatus(category);
                    const mainCategory = getMainCategory(category);
                    const dateValue = getDateValue(category);
                    const itemId = category?._id || category?.cat_id || `${category?.cat_name}-${index}`;

                    return (
                      <tr
                        key={itemId}
                        className="bg-white transition hover:bg-blue-50/30"
                        style={{ height: 'calc((100% - 40px) / 10)' }}
                      >
                        <td className="px-[clamp(8px,1.1vw,20px)] text-[clamp(9px,.68vw,11px)] font-bold text-[#173978]">
                          {firstItemIndex + index + 1}
                        </td>
                        <td className="truncate px-[clamp(8px,1.1vw,20px)] text-[clamp(10px,.78vw,13px)] font-extrabold text-[#143270]">
                          {category?.cat_name || 'Untitled Category'}
                        </td>
                        <td className="px-[clamp(8px,1.1vw,20px)]">
                          <span
                            className={`inline-flex max-w-full truncate rounded-md px-2.5 py-1 text-[clamp(9px,.67vw,11px)] font-bold ${getBadgeClass(mainCategory)}`}
                          >
                            {mainCategory}
                          </span>
                        </td>
                        <td className="truncate px-[clamp(8px,1.1vw,20px)] text-[clamp(9px,.7vw,11px)] font-semibold text-[#284780]">
                          {getBusinessNature(category)}
                        </td>
                        <td className="px-[clamp(8px,1.1vw,20px)]">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[clamp(9px,.67vw,11px)] font-bold ${status === 'Active'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-red-50 text-red-600'
                              }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${status === 'Active' ? 'bg-green-600' : 'bg-red-500'
                                }`}
                            />
                            {status}
                          </span>
                        </td>
                        <td className="px-[clamp(8px,1.1vw,20px)] text-center text-[clamp(9px,.7vw,11px)] font-bold text-[#284780]">
                          {getSubCategoryCount(category)}
                        </td>
                        <td className="border-x border-slate-200 px-[clamp(8px,1.1vw,20px)]">
                          <div className="flex flex-col gap-0.5 text-[clamp(8px,.63vw,10px)] font-semibold leading-tight text-[#284780]">
                            <span className="inline-flex items-center gap-2 whitespace-nowrap">
                              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                              {formatDate(dateValue)} {formatTime(dateValue)}
                            </span>
                            <span className="inline-flex items-center gap-2 whitespace-nowrap">
                              <UserRound className="h-3.5 w-3.5 shrink-0" />
                              by {getAdminName(category)}
                            </span>
                          </div>
                        </td>
                        <td className="relative px-[clamp(8px,1vw,16px)]">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(category)}
                              className="grid h-8 w-8 place-items-center rounded-md bg-blue-50 text-blue-500 transition hover:bg-blue-100"
                              title="Edit category"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(category)}
                              className="grid h-8 w-8 place-items-center rounded-md bg-red-50 text-red-500 transition hover:bg-red-100"
                              title="Delete category"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setOpenActionId((current) =>
                                  current === itemId ? null : itemId,
                                )
                              }
                              className="grid h-8 w-8 place-items-center rounded-md text-[#284780] transition hover:bg-slate-100"
                              title="More actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>

                          {openActionId === itemId && (
                            <div className="absolute right-4 top-9 z-20 w-36 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl">
                              <button
                                type="button"
                                onClick={() => startEdit(category)}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                <Edit3 className="h-3.5 w-3.5" /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(category)}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center">
                      <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 text-slate-500">
                        <Info className="h-8 w-8 text-slate-400" />
                        <p className="text-sm font-semibold">No categories found.</p>
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-1 text-xs font-bold text-blue-600 hover:underline"
                        >
                          Clear filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  paginatedCategories.length > 0 &&
                  Array.from({
                    length: Math.max(0, ITEMS_PER_PAGE - paginatedCategories.length),
                  }).map((_, index) => (
                    <tr key={`empty-row-${index}`} style={{ height: 'calc((100% - 40px) / 10)' }}>
                      <td colSpan={8} />
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="flex h-[48px] shrink-0 items-center justify-between border-t border-slate-200 px-[clamp(12px,1.2vw,20px)]">
            <p className="text-[clamp(9px,.67vw,11px)] font-semibold text-slate-500">
              Showing{' '}
              <span className="font-bold text-[#173978]">
                {filteredCategories.length ? firstItemIndex + 1 : 0}
              </span>{' '}
              to{' '}
              <span className="font-bold text-[#173978]">
                {Math.min(firstItemIndex + ITEMS_PER_PAGE, filteredCategories.length)}
              </span>{' '}
              of{' '}
              <span className="font-bold text-[#173978]">{filteredCategories.length}</span>{' '}
              entries
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-[#173978] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {paginationItems.map((item, index) => {
                if (String(item).startsWith('ellipsis')) {
                  return (
                    <span
                      key={`${item}-${index}`}
                      className="grid h-8 min-w-8 place-items-center px-1 text-xs font-bold text-slate-400"
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setCurrentPage(item)}
                    className={`grid h-8 min-w-8 place-items-center rounded-lg px-2 text-xs font-bold transition ${currentPage === item
                      ? 'bg-[#075fd7] text-white shadow-sm'
                      : 'bg-slate-50 text-[#284780] hover:bg-slate-100'
                      }`}
                  >
                    {item}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-[#173978] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </main>

        <footer className="flex items-center gap-3 px-3 text-[clamp(9px,.66vw,11px)] font-semibold text-slate-400">
          <span>© 2026 International Health &amp; Wellness Expo</span>
          <span>|</span>
          <span>Namo Gange Wellness Pvt. Ltd.</span>
          <span>|</span>
          <span>All Rights Reserved.</span>
        </footer>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={resetForm}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
                Category Management
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-[#112a68]">
                {isEditing ? 'Edit Category' : 'Add New Category'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter the category details below.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#173978]">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  name="name"
                  value={categoryForm.name}
                  onChange={handleInputChange}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleAddOrUpdateCategory();
                  }}
                  placeholder="e.g. Hospitals & Healthcare Institutions"
                  className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm font-semibold text-[#173978] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#173978]">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Active', 'Inactive'].map((status) => (
                    <label
                      key={status}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-bold transition ${categoryForm.status === status
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={categoryForm.status === status}
                        onChange={handleInputChange}
                        className="accent-blue-600"
                      />
                      {status}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleAddOrUpdateCategory}
                  disabled={isSaving}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#075fd7] text-sm font-bold text-white transition hover:bg-[#064fbb] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {isEditing ? 'Update Category' : 'Create Category'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterSelect = ({ label, value, onChange, options, allLabel }) => (
  <label className="relative block h-[46px] min-w-0 rounded-lg border border-slate-200 bg-white px-3 pt-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
    <span className="pointer-events-none block truncate text-[clamp(8px,.58vw,10px)] font-bold text-[#284780]">
      {label}
    </span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-6 w-full appearance-none truncate bg-transparent pr-6 text-[clamp(9px,.69vw,11px)] font-bold text-[#173978] outline-none"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option === 'All' ? allLabel : option}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute bottom-2.5 right-3 h-3.5 w-3.5 text-[#284780]" />
  </label>
);

export default AddCategory;
