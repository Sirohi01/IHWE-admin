import { useState, useEffect, useRef } from 'react';
import { Plus, List, Pencil, Trash2, Image as ImageIcon, Link as LinkIcon, Hash, Type, AlignLeft } from 'lucide-react';
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import DeleteConfirmToast from "../../components/DeleteConfirmToast";
import Table from "../../components/table/Table";
import PageHeader from '../../components/PageHeader';
import api, { API_URL, SERVER_URL } from "../../lib/api";
import Swal from "sweetalert2";

const GalleryCategory = () => {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    title: '',
    highlightText: '',
    shortDescription: '',
    number: '',
    buttonText: 'VIEW DETAILS',
    buttonUrl: '',
    mainImage: null,
    imagePreview: null,
    mainImageAltText: '',
    status: 'Active'
  });

  const [selectedCategoryData, setSelectedCategoryData] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchGalleryItems();

    if (location.state?.editItem) {
      editItem(location.state.editItem);
    }
  }, [location.state]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/gallery/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchGalleryItems = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/gallery/items');
      if (response.data.success) {
        setGalleryItems(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching gallery items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'category') {
      const selectedCat = categories.find(cat => cat._id === value);
      setSelectedCategoryData(selectedCat);
      setFormData(prev => ({ ...prev, category: value, subcategory: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        mainImage: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      setFormData(prev => ({ ...prev, shortDescription: editorRef.current.innerHTML }));
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    handleEditorInput();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category || !formData.title || (!formData.mainImage && !editId)) {
      toast.warning("Please fill all required fields and upload an image.");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'mainImage' && formData[key]) {
        data.append('mainImage', formData[key]);
      } else if (key !== 'imagePreview' && key !== 'mainImage') {
        data.append(key, formData[key]);
      }
    });

    try {
      setIsLoading(true);
      let response;
      if (editId) {
        response = await api.put(`/api/gallery/items/${editId}`, data);
      } else {
        response = await api.post('/api/gallery/items', data);
      }

      if (response.data.success) {
        toast.success(editId ? "Item updated successfully" : "Item added successfully");
        resetForm();
        fetchGalleryItems();
      }
    } catch (error) {
      console.error("Error saving gallery item:", error);
      toast.error(error.response?.data?.message || "Failed to save item");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      title: '',
      highlightText: '',
      shortDescription: '',
      number: '',
      buttonText: 'VIEW DETAILS',
      buttonUrl: '',
      mainImage: null,
      imagePreview: null,
      mainImageAltText: '',
      status: 'Active'
    });
    if (editorRef.current) editorRef.current.innerHTML = '';
    setEditId(null);
  };

  const editItem = (item) => {
    setEditId(item._id);

    const selectedCat = categories.find(cat => cat._id === item.category?._id);
    setSelectedCategoryData(selectedCat);

    setFormData({
      category: item.category?._id || '',
      subcategory: item.subcategory || '',
      title: item.title,
      highlightText: item.highlightText || '',
      shortDescription: item.shortDescription || '',
      number: item.number || '',
      buttonText: item.buttonText || 'VIEW DETAILS',
      buttonUrl: item.buttonUrl || '',
      mainImage: null,
      imagePreview: item.mainImage ? `${SERVER_URL}${item.mainImage}` : null,
      mainImageAltText: item.mainImageAltText || '',
      status: item.status
    });
    if (editorRef.current) editorRef.current.innerHTML = item.shortDescription || '';
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteItem = async (id) => {
    toast(
      <DeleteConfirmToast
        onDelete={async () => {
          try {
            const response = await api.delete(`/api/gallery/items/${id}`);
            if (response.data.success) {
              toast.success("Item deleted successfully");
              fetchGalleryItems();
            }
          } catch (error) {
            toast.error("Failed to delete item");
          }
        }}
      />,
      { autoClose: false }
    );
  };

  const columns = [
    {
      key: "number",
      label: "#",
      width: "60px",
      render: (row) => <span className="font-bold text-gray-700">{row.number}</span>
    },
    {
      key: "title",
      label: "Title / Highlight",
      render: (row) => (
        <div>
          <div className="font-bold text-[#1A3263]">{row.title}</div>
          <div className="text-xs text-amber-600 font-medium px-2 py-0.5 bg-amber-50 rounded inline-block mt-1">
            {row.highlightText}
          </div>
        </div>
      )
    },
    {
      key: "category",
      label: "Portfolio Page",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
            {row.category?.name || "Uncategorized"}
          </span>
          {row.subcategory && (
            <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-[10px] font-medium border border-purple-200">
              → {row.subcategory}
            </span>
          )}
        </div>
      )
    },
    {
      key: "mainImage",
      label: "Main Image",
      render: (row) => (
        <div className="w-16 h-10 rounded overflow-hidden border shadow-sm">
          <img
            src={`${SERVER_URL}${row.mainImage}`}
            alt={row.mainImageAltText}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = "https://via.placeholder.com/100x60?text=No+Image"; }}
          />
        </div>
      ),
    },
    {
      key: "slug",
      label: "Slug/Path",
      render: (row) => <code className="text-[10px] bg-gray-100 px-1 py-0.5 rounded">{row.slug}</code>
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${row.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="bg-white shadow-md p-6 mt-6 min-h-screen">
      <PageHeader
        title="PORTFOLIO EVENT GALLERY"
        description="Manage your portfolio items with stunning visual layouts"
      >
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate("/add-gallery-images")} className="flex items-center gap-2 bg-[#1A3263] text-white px-6 py-2.5 rounded shadow-lg hover:shadow-xl transition-all font-bold uppercase text-xs">
            <Plus className="w-4 h-4" /> Add Gallery Images
          </button>
          <button onClick={() => navigate("/gallery-image-list")} className="flex items-center gap-2 bg-gray-700 text-white px-6 py-2.5 rounded shadow-lg hover:shadow-xl transition-all font-bold uppercase text-xs">
            <List className="w-4 h-4" /> View All Listings
          </button>
        </div>
      </PageHeader>

      {/* FORM SECTION */}
      <div className="bg-white border-2 border-gray-100 rounded-xl p-8 mb-10 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#1A3263]"></div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* LEFT SIDE: PRIMARY INFO */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CATEGORY DROPDOWN */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <AlignLeft className="w-3.5 h-3.5" /> Select Portfolio Gallery *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:border-[#1A3263] rounded font-medium text-sm transition-all"
                    required
                  >
                    <option value="">Choose Category...</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* SUBCATEGORY DROPDOWN - Shows only if category has subcategories */}
                {selectedCategoryData && selectedCategoryData.subcategories && selectedCategoryData.subcategories.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <AlignLeft className="w-3.5 h-3.5" /> Select Sub-Category
                    </label>
                    <select
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-blue-200 focus:outline-none focus:border-blue-500 rounded font-medium text-sm transition-all bg-blue-50"
                    >
                      <option value="">No Sub-Category</option>
                      {selectedCategoryData.subcategories.map((sub, idx) => (
                        <option key={idx} value={sub.name}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* TITLE */}
                <div className={selectedCategoryData && selectedCategoryData.subcategories && selectedCategoryData.subcategories.length > 0 ? "" : "md:col-start-2"}>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Type className="w-3.5 h-3.5" /> Gallery Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Retail Kiosk"
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:border-[#1A3263] rounded font-medium text-sm transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* HIGHLIGHT TEXT */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Plus className="w-3.5 h-3.5 text-amber-500" /> Highlight Text
                  </label>
                  <input
                    type="text"
                    name="highlightText"
                    value={formData.highlightText}
                    onChange={handleInputChange}
                    placeholder="e.g. Interior Design"
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:border-[#1A3263] rounded font-medium text-sm transition-all"
                  />
                </div>

                {/* NUMBER */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5" /> Display Number
                  </label>
                  <input
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    placeholder="e.g. 01"
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:border-[#1A3263] rounded font-medium text-sm transition-all"
                  />
                </div>
              </div>

              {/* SHORT DESCRIPTION EDITOR */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Short Description (Rich Text)
                </label>
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-inner">
                  <div className="bg-gray-50 p-2 border-b flex flex-wrap gap-1">
                    <button type="button" onClick={() => execCommand("bold")} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded font-bold border border-gray-200 text-xs shadow-sm bg-white">B</button>
                    <button type="button" onClick={() => execCommand("italic")} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded italic border border-gray-200 text-xs shadow-sm bg-white">I</button>
                    <button type="button" onClick={() => execCommand("underline")} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded underline border border-gray-200 text-xs shadow-sm bg-white">U</button>
                    <div className="w-px h-5 bg-gray-300 mx-1 self-center"></div>
                    <button type="button" onClick={() => execCommand("justifyLeft")} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded border border-gray-200 text-xs shadow-sm bg-white">≡</button>
                    <button type="button" onClick={() => execCommand("justifyCenter")} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded border border-gray-200 text-xs shadow-sm bg-white">≡</button>
                    <button type="button" onClick={() => execCommand("insertUnorderedList")} className="px-2 h-8 flex items-center justify-center hover:bg-white rounded border border-gray-200 text-[10px] font-bold shadow-sm bg-white">• List</button>
                  </div>
                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleEditorInput}
                    className="min-h-[150px] p-4 focus:outline-none text-sm text-gray-700 bg-white"
                    placeholder="Brief summary of this item..."
                  ></div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: BUTTONS & MEDIA */}
            <div className="lg:col-span-4 space-y-6">
              {/* MAIN IMAGE CARD */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-5">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Main Display Image *
                </label>

                <div className="relative group border-2 border-dashed border-gray-300 rounded-xl overflow-hidden aspect-video flex items-center justify-center bg-white hover:border-[#1A3263] transition-all">
                  {formData.imagePreview ? (
                    <>
                      <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <label className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold cursor-pointer hover:scale-105 transition-all">
                          Change Image
                          <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="flex flex-col items-center gap-2 cursor-pointer p-10">
                      <ImageIcon className="w-10 h-10 text-gray-300" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Click to upload</span>
                      <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                    </label>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Image Alt Text</label>
                  <input
                    type="text"
                    name="mainImageAltText"
                    value={formData.mainImageAltText}
                    onChange={handleInputChange}
                    placeholder="SEO Alt Tags"
                    className="w-full px-3 py-2 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#1A3263]"
                  />
                </div>
              </div>

              {/* BUTTON ACTIONS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Btn Label</label>
                  <input
                    type="text"
                    name="buttonText"
                    value={formData.buttonText}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#1A3263]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Btn URL/Slug</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input
                      type="text"
                      name="buttonUrl"
                      value={formData.buttonUrl}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#1A3263]"
                    />
                  </div>
                </div>
              </div>

              {/* STATUS */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Display Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none rounded font-bold text-xs uppercase"
                >
                  <option value="Active">Active (Visible)</option>
                  <option value="Inactive">Inactive (Hidden)</option>
                </select>
              </div>

              {/* SUBMIT */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#1A3263] text-white py-4 rounded-lg font-bold uppercase text-xs tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {isLoading ? "Processing..." : (editId ? "Update Item" : "Save Gallery Item")}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-4 bg-gray-100 text-gray-600 rounded-lg font-bold uppercase text-xs"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* LIST SECTION */}
      <div className="bg-white border-2 border-gray-100 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b bg-[#1A3263] flex justify-between items-center">
          <h3 className="text-white font-bold uppercase tracking-widest text-sm">Gallery Entries</h3>
          <span className="text-blue-100 text-[10px] uppercase font-bold">Total Items: {galleryItems.length}</span>
        </div>
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={galleryItems}
            onEdit={editItem}
            onDelete={(row) => deleteItem(row._id)}
          />
        </div>
      </div>
    </div>
  );
};

export default GalleryCategory;