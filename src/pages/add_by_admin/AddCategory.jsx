import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const getDisplayOrder = (category) => {
  const parsed = Number(category?.display_order);
  return Number.isFinite(parsed) ? parsed : 9999;
};

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
  const navigate = useNavigate();

  const categoriesState = useSelector((state) => state.categories);
  const rawCategories = categoriesState?.categories;
  const categories = useMemo(
    () => (Array.isArray(rawCategories) ? rawCategories : []),
    [rawCategories],
  );
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
      .sort((a, b) => {
        const orderDifference = getDisplayOrder(a) - getDisplayOrder(b);
        if (orderDifference !== 0) return orderDifference;
        return normaliseText(a?.cat_name).localeCompare(normaliseText(b?.cat_name));
      });
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
    const categoryId = category?._id || category?.id;

    if (!categoryId) {
      Swal.fire({
        icon: 'error',
        title: 'Unable to edit',
        text: 'Category id is missing.',
        confirmButtonColor: '#0f4cbd',
      });
      return;
    }

    setOpenActionId(null);
    navigate(`/ihweClientData2026/AddCategory/edit/${categoryId}`);
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
      <div className="grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-2.5">
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

        <section className="grid grid-cols-5 gap-[clamp(4px,0.5vw,10px)]">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="flex min-w-0 items-center gap-[clamp(6px,.6vw,10px)] rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 shadow-[0_4px_16px_rgba(15,23,42,0.05)]"
              >
                <div
                  className={`grid h-[clamp(32px,2.5vw,40px)] w-[clamp(32px,2.5vw,40px)] shrink-0 place-items-center rounded-full ${card.bubbleClass}`}
                >
                  <Icon className={`h-[clamp(16px,1.2vw,20px)] w-[clamp(16px,1.2vw,20px)] ${card.iconClass}`} />
                </div>
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-[clamp(9.5px,.7vw,11px)] font-bold text-[#173978]">
                    {card.title}
                  </p>
                  <p
                    className={`truncate font-extrabold text-[#102a67] ${card.isDate
                      ? 'text-[clamp(12px,1vw,13px)] mt-0.5'
                      : 'text-[clamp(16px,1.3vw,17px)]'
                      }`}
                  >
                    {card.value}
                  </p>
                  <p className="truncate text-[clamp(8.5px,.6vw,10px)] font-semibold text-slate-500">
                    {card.subtitle}
                  </p>
                </div>
              </article>
            );
          })}
        </section>

        <main className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)]">
          <div className="grid shrink-0 grid-cols-[minmax(210px,1.45fr)_minmax(150px,.85fr)_minmax(170px,1fr)_minmax(170px,1fr)_90px_1fr_auto_auto] items-center gap-3 border-b border-slate-200 px-[clamp(12px,1.15vw,20px)] py-[clamp(13px,1.3vw,18px)]">
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

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full table-fixed border-collapse text-left">
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
                    'S.No.',
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
                      className="whitespace-nowrap px-[clamp(6px,.8vw,14px)] text-[clamp(8px,.62vw,10px)] font-extrabold tracking-[0.02em]"
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
                      <div className="flex h-[220px] flex-col items-center justify-center gap-3 text-slate-500">
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
                        className="h-11 bg-white transition hover:bg-blue-50/30"
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
                      <div className="flex h-[220px] flex-col items-center justify-center gap-2 text-slate-500">
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
                    <tr key={`empty-row-${index}`} className="h-11">
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
  <label className="relative block min-w-0">
    <span className="pointer-events-none absolute left-3 top-[2px] z-10 max-w-[calc(100%-28px)] -translate-y-1/2 truncate bg-white px-1.5 text-[clamp(8px,.6vw,10px)] font-bold leading-none text-[#284780]">
      {label}
    </span>

    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-[46px] w-full appearance-none truncate rounded-lg border border-slate-200 bg-white px-4 pr-10 text-[clamp(9px,.69vw,11px)] font-bold text-[#173978] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option === 'All' ? allLabel : option}
        </option>
      ))}
    </select>

    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#284780]" />
  </label>
);

export default AddCategory;
